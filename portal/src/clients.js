// Clients: one record per phone number, and the profile that shows everything they
// have had from us.
import { route, HttpError, need } from "./router.js";
import { q } from "./db.js";
import { audit } from "./auth.js";
import { bhd } from "./pricing.js";
import { normPhone } from "./phone.js";

const clean = (v, max) => String(v ?? "").trim().slice(0, max) || null;
// One shared reading of a phone number — see src/phone.js for why.
const requirePhone = (v) => {
  const d = normPhone(v);
  if (d.length < 6) throw new HttpError(400, "a phone number is required");
  return d;
};

route("GET", "/api/clients", async ({ user, url }) => {
  need(user);
  const term = (url.searchParams.get("q") || "").trim();
  const rows = term
    ? await q(`SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? OR company_name LIKE ?
               ORDER BY name LIMIT 100`, [`%${term}%`, `%${term}%`, `%${term}%`])
    : await q("SELECT * FROM customers ORDER BY created_at DESC LIMIT 100");
  return { clients: rows };
});

route("GET", "/api/clients/:id", async ({ user, params }) => {
  need(user);
  const [c] = await q("SELECT * FROM customers WHERE id = ?", [params.id]);
  if (!c) throw new HttpError(404, "client not found");

  // Their documents, and what they still owe. Cancelled and void never count.
  const docs = await q(
    `SELECT id, doc_type, doc_no, version, status, subject, total_fils, issued_at, created_at
     FROM documents WHERE customer_id = ? AND status <> 'void' ORDER BY created_at DESC`, [params.id]);

  const invoiced = docs.filter((d) => d.doc_type === "invoice" && d.status !== "cancelled")
                       .reduce((a, d) => a + Number(d.total_fils), 0);
  return {
    client: c,
    documents: docs.map((d) => ({ ...d, total: bhd(d.total_fils) })),
    balance: { invoiced: bhd(invoiced), paid: 0, owed: bhd(invoiced) },  // payments land in phase 3
  };
});

route("POST", "/api/clients", async ({ user, data }) => {
  need(user, "owner", "manager");
  const phone = requirePhone(data.phone);
  const [dupe] = await q("SELECT id, name FROM customers WHERE phone = ?", [phone]);
  // One client per phone, so say who already has it rather than failing obscurely.
  if (dupe) throw new HttpError(409, `${dupe.name} already uses ${phone}`);

  const name = clean(data.name, 160);
  if (!name) throw new HttpError(400, "a name is required");
  const r = await q(
    `INSERT INTO customers (name, kind, phone, phone2, email, company_name, cr_no, vat_no,
                            address, area, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, data.kind === "company" ? "company" : "person", phone, clean(data.phone2, 60),
     clean(data.email, 160), clean(data.company_name, 160), clean(data.cr_no, 20),
     clean(data.vat_no, 40), clean(data.address, 500), clean(data.area, 80),
     clean(data.note, 1000), user.id]);
  await audit(user.id, "create", "client", r.insertId, { name });
  return { id: r.insertId };
});

route("PUT", "/api/clients/:id", async ({ user, params, data }) => {
  need(user, "owner", "manager");
  const [c] = await q("SELECT id FROM customers WHERE id = ?", [params.id]);
  if (!c) throw new HttpError(404, "client not found");
  const phone = requirePhone(data.phone);
  const [dupe] = await q("SELECT id, name FROM customers WHERE phone = ? AND id <> ?", [phone, params.id]);
  if (dupe) throw new HttpError(409, `${dupe.name} already uses ${phone}`);

  await q(`UPDATE customers SET name=?, kind=?, phone=?, phone2=?, email=?, company_name=?,
           cr_no=?, vat_no=?, address=?, area=?, note=? WHERE id=?`,
    [clean(data.name, 160), data.kind === "company" ? "company" : "person", phone,
     clean(data.phone2, 60), clean(data.email, 160), clean(data.company_name, 160),
     clean(data.cr_no, 20), clean(data.vat_no, 40), clean(data.address, 500),
     clean(data.area, 80), clean(data.note, 1000), params.id]);
  await audit(user.id, "update", "client", params.id);
  return { ok: true };
});
