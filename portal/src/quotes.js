// Quotes. Every amount is computed here, on the server, from prices and options the
// browser sends. A sent quote is locked: editing it writes a new version with a new
// number, and the one the customer already has never changes.
import { randomBytes } from "node:crypto";
import { route, HttpError, need } from "./router.js";
import { q, tx } from "./db.js";
import { audit, seesMoney } from "./auth.js";
import { priceQuote, fils, bhd } from "./pricing.js";

// Take the next number in a series. FOR UPDATE inside the caller's transaction, so two
// people saving at the same moment cannot be given the same number.
export async function nextNo(conn, docType) {
  const [[s]] = await conn.query(
    "SELECT prefix, next_no FROM doc_sequences WHERE doc_type = ? FOR UPDATE", [docType]);
  if (!s) throw new HttpError(500, `no number series for ${docType}`);
  await conn.execute("UPDATE doc_sequences SET next_no = next_no + 1 WHERE doc_type = ?", [docType]);
  return { no: s.next_no, label: `${s.prefix}${s.next_no}` };
}

export const docLabel = (prefix, no, version) => `${prefix}${no}${version > 1 ? `-v${version}` : ""}`;

// Turn what the browser sent into priced lines. Only the shape is trusted; the numbers
// are recomputed.
function readLines(data) {
  const lines = Array.isArray(data.lines) ? data.lines.slice(0, 200) : [];
  if (!lines.length) throw new HttpError(400, "a quote needs at least one line");
  return lines.map((l) => ({
    mode: ["build_up", "unit_rate", "fixed"].includes(l.mode) ? l.mode : "unit_rate",
    description: String(l.description || "").trim().slice(0, 255),
    unit: String(l.unit || "").slice(0, 16) || null,
    qty: Number(l.qty) || 1,
    unit_fils: fils(l.rate),
    total_fils: fils(l.total),
    price_list_id: Number(l.price_list_id) || null,
    build: l.build ? {
      material_fils: fils(l.build.material),
      hours: Number(l.build.hours) || 0,
      labour_rate_fils: fils(l.build.labour_rate),
      margin_pct: Number(l.build.margin_pct) || 0,
      note: String(l.build.note || "").slice(0, 255) || null,
    } : null,
  }));
}

const priceFrom = (data, lines) => priceQuote({
  lines,
  delivery_fils: fils(data.delivery),
  discount_pct: Number(data.discount_pct) || 0,
  special_total_fils: fils(data.special_total),
  vat: data.vat !== false,
});

async function writeLines(conn, docId, priced, sourceLines) {
  await conn.execute("DELETE FROM document_lines WHERE document_id = ?", [docId]);
  for (const [i, l] of priced.lines.entries()) {
    const src = sourceLines[i];                       // the delivery line has no source
    const [r] = await conn.execute(
      `INSERT INTO document_lines (document_id, sort, mode, price_list_id, description, unit_label,
        qty, unit_fils, net_fils, discount_fils, vat_rate_bp, vat_fils, line_total_fils)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [docId, i, l.mode, src?.price_list_id || null, l.description, l.unit_label, l.qty,
       l.unit_fils, l.net_fils, l.discount_fils, l.vat_rate_bp, l.vat_fils, l.total_fils]);
    if (l.mode === "build_up" && src?.build) {
      await conn.execute(
        `INSERT INTO line_build_up (line_id, material_fils, hours, labour_rate_fils, margin_pct, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [r.insertId, src.build.material_fils, src.build.hours, src.build.labour_rate_fils,
         src.build.margin_pct, src.build.note]);
    }
  }
}

async function writeTerms(conn, docId, codes) {
  await conn.execute("DELETE FROM document_terms WHERE document_id = ?", [docId]);
  if (!codes?.length) return;
  const [terms] = await conn.query(
    `SELECT code, text_en, text_ar, sort FROM quote_terms WHERE active = 1 AND code IN (?)`, [codes]);
  for (const t of terms) {
    // The text is copied, not referenced: editing a term later must not change a quote
    // the customer already agreed to.
    await conn.execute(
      `INSERT INTO document_terms (document_id, term_code, text_en, text_ar, sort)
       VALUES (?, ?, ?, ?, ?)`, [docId, t.code, t.text_en, t.text_ar, t.sort]);
  }
}

const docShape = (d, lines, terms, withCost) => ({
  id: d.id, no: docLabel(d.prefix || "Q-", d.doc_no, d.version), doc_no: d.doc_no,
  version: d.version, status: d.status, lang: d.lang,
  customer_id: d.customer_id, customer_name: d.customer_name, customer_phone: d.customer_phone,
  customer_vat: d.customer_vat, subject: d.subject,
  subtotal: bhd(d.subtotal_fils), discount: bhd(d.discount_fils), special: bhd(d.special_fils),
  delivery: bhd(d.delivery_fils), vat: bhd(d.vat_fils), total: bhd(d.total_fils),
  vat_on: !!d.vat_on, valid_days: d.valid_days, note: d.note,
  internal_note: d.internal_note, token: d.token,
  issued_at: d.issued_at, accepted_at: d.accepted_at, accepted_name: d.accepted_name,
  cancel_reason: d.cancel_reason, created_at: d.created_at,
  lines: lines.map((l) => ({
    id: l.id, mode: l.mode, description: l.description, unit: l.unit_label,
    qty: Number(l.qty), rate: bhd(l.unit_fils), net: bhd(l.net_fils),
    discount: bhd(l.discount_fils), vat: bhd(l.vat_fils), total: bhd(l.line_total_fils),
    // The build-up is the margin. It goes to the owner and to nobody else.
    ...(withCost && l.material_fils != null ? {
      build: { material: bhd(l.material_fils), hours: Number(l.hours),
               labour_rate: bhd(l.labour_rate_fils), margin_pct: Number(l.margin_pct), note: l.note },
    } : {}),
  })),
  terms: terms.map((t) => ({ code: t.term_code, en: t.text_en, ar: t.text_ar })),
});

// ---------------------------------------------------------------- routes
route("GET", "/api/quotes", async ({ user, url }) => {
  need(user);
  const status = url.searchParams.get("status");
  const rows = await q(
    `SELECT d.*, s.prefix FROM documents d JOIN doc_sequences s ON s.doc_type = d.doc_type
     WHERE d.doc_type = 'quote' ${status ? "AND d.status = ?" : ""}
     ORDER BY d.created_at DESC LIMIT 200`, status ? [status] : []);
  return {
    quotes: rows.map((d) => ({
      id: d.id, no: docLabel(d.prefix, d.doc_no, d.version), status: d.status,
      customer_name: d.customer_name, subject: d.subject, total: bhd(d.total_fils),
      created_at: d.created_at, issued_at: d.issued_at,
    })),
  };
});

route("GET", "/api/quotes/:id", async ({ user, params }) => {
  need(user);
  const [d] = await q(
    `SELECT d.*, s.prefix FROM documents d JOIN doc_sequences s ON s.doc_type = d.doc_type
     WHERE d.id = ? AND d.doc_type = 'quote'`, [params.id]);
  if (!d) throw new HttpError(404, "quote not found");
  const lines = await q(
    `SELECT l.*, b.material_fils, b.hours, b.labour_rate_fils, b.margin_pct, b.note
     FROM document_lines l LEFT JOIN line_build_up b ON b.line_id = l.id
     WHERE l.document_id = ? ORDER BY l.sort`, [params.id]);
  const terms = await q("SELECT * FROM document_terms WHERE document_id = ? ORDER BY sort", [params.id]);
  return { quote: docShape(d, lines, terms, seesMoney(user)) };
});

route("POST", "/api/quotes", async ({ user, data }) => {
  need(user, "owner", "manager");
  const lines = readLines(data);
  const priced = priceFrom(data, lines);
  const [cust] = data.customer_id
    ? await q("SELECT * FROM customers WHERE id = ?", [data.customer_id]) : [null];
  if (!cust) throw new HttpError(400, "choose a client first");

  const id = await tx(async (conn) => {
    const { no } = await nextNo(conn, "quote");
    const [r] = await conn.execute(
      `INSERT INTO documents (doc_type, doc_no, version, status, lang, customer_id, customer_name,
        customer_phone, customer_vat, subject, subtotal_fils, discount_fils, special_fils,
        delivery_fils, vat_fils, total_fils, vat_on, valid_days, note, internal_note, created_by)
       VALUES ('quote', ?, 1, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [no, data.lang === "en" ? "en" : "ar", cust.id, cust.name, cust.phone, cust.vat_no || null,
       String(data.subject || "").slice(0, 200) || null,
       priced.subtotal_fils, priced.discount_fils, priced.special_fils, fils(data.delivery),
       priced.vat_fils, priced.total_fils, data.vat === false ? 0 : 1,
       Number(data.valid_days) || 14, String(data.note || "").slice(0, 2000) || null,
       String(data.internal_note || "").slice(0, 2000) || null, user.id]);
    await writeLines(conn, r.insertId, priced, lines);
    await writeTerms(conn, r.insertId, data.terms);
    return r.insertId;
  });
  await audit(user.id, "create", "quote", id, { total: bhd(priced.total_fils) });
  return { id, total: bhd(priced.total_fils) };
});

route("PUT", "/api/quotes/:id", async ({ user, params, data }) => {
  need(user, "owner", "manager");
  const [d] = await q("SELECT * FROM documents WHERE id = ? AND doc_type = 'quote'", [params.id]);
  if (!d) throw new HttpError(404, "quote not found");
  if (["cancelled", "void"].includes(d.status)) throw new HttpError(409, "this quote is closed");
  if (d.status === "accepted") throw new HttpError(409, "an accepted quote cannot be edited");

  const lines = readLines(data);
  const priced = priceFrom(data, lines);

  // A draft is edited in place. A sent quote is never touched: the edit becomes a new
  // version, so the copy the customer is holding still says what it said.
  if (d.status === "draft") {
    await tx(async (conn) => {
      await conn.execute(
        `UPDATE documents SET subject=?, lang=?, subtotal_fils=?, discount_fils=?, special_fils=?,
         delivery_fils=?, vat_fils=?, total_fils=?, vat_on=?, valid_days=?, note=?, internal_note=?
         WHERE id=?`,
        [String(data.subject || "").slice(0, 200) || null, data.lang === "en" ? "en" : "ar",
         priced.subtotal_fils, priced.discount_fils, priced.special_fils, fils(data.delivery),
         priced.vat_fils, priced.total_fils, data.vat === false ? 0 : 1,
         Number(data.valid_days) || 14, String(data.note || "").slice(0, 2000) || null,
         String(data.internal_note || "").slice(0, 2000) || null, d.id]);
      await writeLines(conn, d.id, priced, lines);
      await writeTerms(conn, d.id, data.terms);
    });
    await audit(user.id, "update", "quote", d.id);
    return { id: d.id, version: d.version, total: bhd(priced.total_fils) };
  }

  const id = await tx(async (conn) => {
    const [r] = await conn.execute(
      `INSERT INTO documents (doc_type, doc_no, version, supersedes_id, status, lang, customer_id,
        customer_name, customer_phone, customer_vat, subject, subtotal_fils, discount_fils,
        special_fils, delivery_fils, vat_fils, total_fils, vat_on, valid_days, note, internal_note,
        created_by)
       VALUES ('quote', ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.doc_no, d.version + 1, d.id, data.lang === "en" ? "en" : "ar", d.customer_id,
       d.customer_name, d.customer_phone, d.customer_vat,
       String(data.subject || d.subject || "").slice(0, 200) || null,
       priced.subtotal_fils, priced.discount_fils, priced.special_fils, fils(data.delivery),
       priced.vat_fils, priced.total_fils, data.vat === false ? 0 : 1,
       Number(data.valid_days) || 14, String(data.note || "").slice(0, 2000) || null,
       String(data.internal_note || "").slice(0, 2000) || null, user.id]);
    await writeLines(conn, r.insertId, priced, lines);
    await writeTerms(conn, r.insertId, data.terms);
    return r.insertId;
  });
  await audit(user.id, "version", "quote", id, { from: d.id, version: d.version + 1 });
  return { id, version: d.version + 1, total: bhd(priced.total_fils) };
});

route("POST", "/api/quotes/:id/send", async ({ user, params }) => {
  need(user, "owner", "manager");
  const [d] = await q("SELECT * FROM documents WHERE id = ? AND doc_type = 'quote'", [params.id]);
  if (!d) throw new HttpError(404, "quote not found");
  if (d.status !== "draft") throw new HttpError(409, `this quote is already ${d.status}`);

  const token = d.token || randomBytes(16).toString("hex");
  await q(`UPDATE documents SET status='sent', issued_at=UTC_TIMESTAMP(), token=? WHERE id=?`,
    [token, d.id]);
  await audit(user.id, "send", "quote", d.id);
  const [seq] = await q("SELECT prefix FROM doc_sequences WHERE doc_type = 'quote'");
  return { ok: true, token, no: docLabel(seq.prefix, d.doc_no, d.version) };
});

route("POST", "/api/quotes/:id/cancel", async ({ user, params, data }) => {
  need(user, "owner", "manager");
  const reason = String(data.reason || "").trim().slice(0, 255);
  // Cancelling always needs a reason — that is the whole point of not deleting.
  if (!reason) throw new HttpError(400, "a reason is required to cancel");
  const [d] = await q("SELECT * FROM documents WHERE id = ? AND doc_type = 'quote'", [params.id]);
  if (!d) throw new HttpError(404, "quote not found");
  if (d.status === "cancelled") throw new HttpError(409, "already cancelled");

  await q("UPDATE documents SET status='cancelled', cancel_reason=? WHERE id=?", [reason, d.id]);
  await audit(user.id, "cancel", "quote", d.id, { reason });
  return { ok: true };
});

// What the staff screen needs to open the quote builder.
route("GET", "/api/quote-setup", async ({ user }) => {
  need(user);
  const [company] = await q("SELECT * FROM company WHERE id = 1");
  const terms = await q("SELECT code, text_en, text_ar, default_on FROM quote_terms WHERE active=1 ORDER BY sort");
  return {
    company: {
      name_en: company.name_en, name_ar: company.name_ar, cr_no: company.cr_no,
      vat_no: company.vat_no, vat_rate_bp: company.vat_rate_bp,
      labour_rate: bhd(company.labour_rate_fils), margin_pct: Number(company.margin_pct),
      quote_valid_days: company.quote_valid_days,
    },
    terms: terms.map((t) => ({ code: t.code, en: t.text_en, ar: t.text_ar, on: !!t.default_on })),
  };
});

// Price a quote without saving it, so the builder can show live totals that are the
// server's, not the browser's. The browser never computes a total it then stores.
route("POST", "/api/quote-preview", async ({ user, data }) => {
  need(user);
  const lines = readLines(data);
  const p = priceFrom(data, lines);
  return {
    subtotal: bhd(p.subtotal_fils), discount: bhd(p.discount_fils), special: bhd(p.special_fils),
    vat: bhd(p.vat_fils), total: bhd(p.total_fils),
    lines: p.lines.map((l) => ({
      description: l.description, qty: l.qty, rate: bhd(l.unit_fils), net: bhd(l.net_fils),
      discount: bhd(l.discount_fils), vat: bhd(l.vat_fils), total: bhd(l.total_fils),
    })),
  };
});
