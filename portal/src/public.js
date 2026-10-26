// The page a customer opens from the WhatsApp link: /q/<token>.
// It is deliberately a separate module from the staff API, and it NEVER joins
// line_build_up. The customer sees line totals; the materials, hours and margin behind
// them stay inside the workshop.
import { route, HttpError, clientIp } from "./router.js";
import { q } from "./db.js";
import { audit } from "./auth.js";
import { bhd } from "./pricing.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (f) => bhd(f).toFixed(3);

export async function quoteByToken(token) {
  if (!/^[a-f0-9]{32}$/.test(String(token || ""))) return null;
  const [d] = await q(
    `SELECT d.*, s.prefix FROM documents d JOIN doc_sequences s ON s.doc_type = d.doc_type
     WHERE d.token = ? AND d.doc_type = 'quote' AND d.status IN ('sent','accepted')`, [token]);
  if (!d) return null;
  // Only the columns a customer may see. line_build_up is not in this query by design.
  const lines = await q(
    `SELECT description, unit_label, qty, unit_fils, net_fils, discount_fils, vat_fils,
            line_total_fils FROM document_lines WHERE document_id = ? ORDER BY sort`, [d.id]);
  const terms = await q("SELECT text_en, text_ar FROM document_terms WHERE document_id = ? ORDER BY sort", [d.id]);
  const [company] = await q("SELECT * FROM company WHERE id = 1");
  return { d, lines, terms, company };
}

export async function docPage(token) {
  const data = await quoteByToken(token);
  if (!data) return null;
  const { d, lines, terms, company } = data;
  const ar = d.lang !== "en";
  const t = (a, e) => (ar ? a : e);
  const accepted = d.status === "accepted";

  const rows = lines.map((l) => `
    <tr>
      <td class="d">${esc(l.description)}</td>
      <td class="n">${Number(l.qty) % 1 ? Number(l.qty).toFixed(3) : Number(l.qty)}${l.unit_label ? ` ${esc(l.unit_label)}` : ""}</td>
      <td class="n">${money(l.unit_fils)}</td>
      <td class="n">${money(l.line_total_fils)}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="${ar ? "ar" : "en"}" dir="${ar ? "rtl" : "ltr"}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(t("عرض سعر", "Quote"))} ${esc(d.prefix)}${d.doc_no} · ${esc(t(company.name_ar, company.name_en))}</title>
<style>
  :root{--ink:#1A1A1A;--mut:#6B6B6B;--line:#DEDED8;--bg:#F4F4F1;--accent:#8A5D00;--yellow:#FFC220}
  *{box-sizing:border-box}
  body{margin:0;padding:1.25rem;background:var(--bg);color:var(--ink);
       font:16px/1.6 "Segoe UI",system-ui,sans-serif}
  .sheet{max-width:46rem;margin:0 auto;background:#fff;border:1px solid var(--line);padding:clamp(1.25rem,4vw,2.5rem)}
  .head{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:flex-start}
  .co{font-weight:700;font-size:1.05rem}
  .mut{color:var(--mut);font-size:.875rem}
  h1{font-size:1.5rem;margin:1.5rem 0 .25rem}
  table{width:100%;border-collapse:collapse;margin:1.25rem 0}
  th,td{padding:.6rem .4rem;border-bottom:1px solid var(--line);text-align:${ar ? "right" : "left"}}
  th{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
  td.n,th.n{text-align:${ar ? "left" : "right"};white-space:nowrap}
  .tot{margin-inline-start:auto;max-width:20rem}
  .tot div{display:flex;justify-content:space-between;padding:.3rem 0}
  .tot .grand{border-top:2px solid var(--ink);margin-top:.4rem;padding-top:.6rem;font-weight:700;font-size:1.15rem}
  ul{padding-inline-start:1.1rem;color:var(--mut);font-size:.9375rem}
  .act{margin-top:1.75rem;padding-top:1.25rem;border-top:1px solid var(--line)}
  button{font:inherit;font-weight:700;background:var(--yellow);color:#1A1A1A;border:0;
         padding:.9rem 1.75rem;min-height:48px;cursor:pointer;width:100%;max-width:22rem}
  button:disabled{background:var(--line);color:var(--mut);cursor:default}
  input{font:inherit;padding:.75rem;min-height:48px;width:100%;max-width:22rem;
        border:1px solid var(--line);margin-bottom:.6rem}
  .ok{background:#15803d;color:#fff;padding:1rem;margin-top:1rem}
  .placeholder{background:#FEF3C7;border:1px solid #F59E0B;padding:.6rem .8rem;font-size:.8125rem;margin-bottom:1rem}
  @media print{body{background:#fff;padding:0}.sheet{border:0}.act{display:none}}
</style>
<div class="sheet">
  <div class="head">
    <div>
      <div class="co">${esc(t(company.name_ar, company.name_en))}</div>
      <div class="mut">${t("س.ت", "CR")}: ${esc(company.cr_no || "—")}${
        company.vat_no && !company.vat_no.startsWith("PLACEHOLDER")
          ? ` · ${t("الرقم الضريبي", "VAT")}: ${esc(company.vat_no)}` : ""}</div>
      <div class="mut">${esc(company.phone || "")} · ${esc(company.email || "")}</div>
    </div>
    <div class="mut">
      <div><strong>${esc(d.prefix)}${d.doc_no}${d.version > 1 ? `-v${d.version}` : ""}</strong></div>
      <div>${d.issued_at ? new Date(d.issued_at).toISOString().slice(0, 10) : ""}</div>
      <div>${t("صالح", "Valid")} ${d.valid_days} ${t("يومًا", "days")}</div>
    </div>
  </div>

  ${company.vat_no?.startsWith("PLACEHOLDER") ? `<div class="placeholder">${
    t("مسودة — الرقم الضريبي غير مُفعّل بعد. هذا العرض للمراجعة وليس فاتورة ضريبية.",
      "DRAFT — VAT number not yet set. This is for review and is not a tax invoice.")}</div>` : ""}

  <h1>${esc(t("عرض سعر", "Quotation"))}</h1>
  <div class="mut">${esc(d.customer_name)}${d.subject ? ` · ${esc(d.subject)}` : ""}</div>

  <table>
    <thead><tr>
      <th>${t("البند", "Description")}</th><th class="n">${t("الكمية", "Qty")}</th>
      <th class="n">${t("السعر", "Rate")}</th><th class="n">${t("المجموع", "Total")}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="tot">
    <div><span>${t("المجموع الفرعي", "Subtotal")}</span><span>${money(d.subtotal_fils)}</span></div>
    ${Number(d.discount_fils) ? `<div><span>${t("الخصم", "Discount")}</span><span>−${money(d.discount_fils)}</span></div>` : ""}
    ${Number(d.vat_fils) ? `<div><span>${t("ضريبة القيمة المضافة ١٠٪", "VAT 10%")}</span><span>${money(d.vat_fils)}</span></div>` : ""}
    <div class="grand"><span>${t("الإجمالي", "Total")}</span><span>${money(d.total_fils)} ${t("د.ب", "BHD")}</span></div>
  </div>

  ${d.note ? `<p class="mut">${esc(d.note)}</p>` : ""}
  ${terms.length ? `<h3>${t("الشروط", "Terms")}</h3><ul>${
    terms.map((x) => `<li>${esc(ar ? x.text_ar : x.text_en)}</li>`).join("")}</ul>` : ""}

  <div class="act">
    ${accepted
      ? `<div class="ok">${t("تم قبول هذا العرض", "This quote has been accepted")}${
          d.accepted_name ? ` — ${esc(d.accepted_name)}` : ""}</div>`
      : `<p>${t("للموافقة على هذا العرض، اكتب اسمك واضغط قبول.",
                "To accept this quote, type your name and press Accept.")}</p>
         <input id="nm" placeholder="${t("الاسم", "Your name")}" autocomplete="name">
         <button id="go">${t("قبول العرض", "Accept quote")}</button>
         <p id="msg" class="mut"></p>`}
  </div>
</div>
${accepted ? "" : `<script src="/q/app.js" defer></script>`}
`;
}

// Served as its own file so the page needs no inline script and the CSP can refuse them.
export const acceptScript = `
document.getElementById('go').addEventListener('click', async function () {
  var name = document.getElementById('nm').value.trim();
  var msg = document.getElementById('msg');
  if (name.length < 2) { msg.textContent = '—'; document.getElementById('nm').focus(); return; }
  this.disabled = true;
  try {
    var r = await fetch('/api/public/accept/' + location.pathname.split('/').pop(),
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name }) });
    if (r.ok) { location.reload(); return; }
    msg.textContent = (await r.json()).error || 'error';
  } catch (e) { msg.textContent = 'network error'; }
  this.disabled = false;
});
`;

route("POST", "/api/public/accept/:token", async ({ req, params, data }) => {
  const found = await quoteByToken(params.token);
  if (!found) throw new HttpError(404, "link not found");
  if (found.d.status === "accepted") return { ok: true };
  const name = String(data.name || "").trim().slice(0, 160);
  if (name.length < 2) throw new HttpError(400, "name required");

  // Who accepted, and from where — the record of agreement.
  await q(`UPDATE documents SET status='accepted', accepted_at=UTC_TIMESTAMP(),
           accepted_name=?, accepted_ip=? WHERE id=?`, [name, clientIp(req), found.d.id]);
  await audit(null, "accept", "quote", found.d.id, { name });
  return { ok: true };
});
