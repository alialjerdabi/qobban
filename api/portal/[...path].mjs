/**
 * Demo of the staff portal, for qobban.store/staff.
 *
 * This is NOT the portal. It is the real screens and the real money engine wired to
 * data held in the function, so the owner can see and try the thing before a database
 * exists. The portal proper is in /portal and needs MySQL and a long-running process,
 * which Vercel does not provide.
 *
 * Three differences that matter, all consequences of there being no database:
 *
 *  1. Nothing is saved. Each cold start begins from the seed below, and two requests
 *     can land on different instances, so a quote you save may not be there a minute
 *     later. Shape and arithmetic are real; persistence is not.
 *  2. The login brake cannot work. It counts attempts in memory, and serverless gives
 *     every invocation its own memory. A 4-digit PIN with no brake is guessable, which
 *     is why this uses a published demo PIN and never the owners' real ones.
 *  3. There is no customer /q/<token> page: issuing one means storing it.
 *
 * The pricing module is imported from the real portal, not copied, so what is shown
 * here is what the real system will compute.
 */
import { priceQuote, fils, bhd } from "../../portal/src/pricing.js";

// The demo PIN. Deliberately not an owner's real PIN: this repository is public and a
// four-digit secret in it would be worthless. Override with PORTAL_DEMO_PIN in Vercel.
const DEMO_PIN = process.env.PORTAL_DEMO_PIN || "2468";
const COOKIE = "qb_demo";

const USERS = [
  { id: 1, phone: "35665422", name_en: "Ali", name_ar: "علي", roles: ["owner"] },
  { id: 2, phone: "39949004", name_en: "Hussain", name_ar: "حسين", roles: ["owner"] },
];

const COMPANY = {
  name_en: "QOBBAN WELDING, DECORATION, MAINTENANCE",
  name_ar: "قبان لأعمال اللحام و الديكور و الصيانة",
  cr_no: "60181-8",
  vat_no: "PLACEHOLDER-VAT",
  vat_rate_bp: 1000,
  labour_rate: 10,
  margin_pct: 20,
  quote_valid_days: 14,
};

const TERMS = [
  ["payment", "Payment schedule: 50% advance, 40% on delivery, 10% after installation.",
   "جدول الدفع: ٥٠٪ مقدمًا، ٤٠٪ عند التسليم، ١٠٪ بعد التركيب."],
  ["materials", "Material prices are valid for the quote validity period only.",
   "أسعار المواد سارية خلال مدة صلاحية العرض فقط."],
  ["site", "The site must provide clear access and mains power on the agreed date.",
   "يجب توفير مدخل واضح وتيار كهربائي في الموقع بالتاريخ المتفق عليه."],
  ["drawings", "Fabrication begins after the customer approves the drawings in writing.",
   "يبدأ التصنيع بعد اعتماد العميل للمخططات خطيًا."],
  ["warranty", "Welding workmanship is warranted for 12 months from handover.",
   "ضمان على أعمال اللحام لمدة ١٢ شهرًا من تاريخ التسليم."],
  ["coating", "Galvanising and painting are not included unless stated as a line.",
   "الجلفنة والدهان غير مشمولين ما لم يُذكرا كبند."],
];

const PRICE_LIST = [
  ["LAB-WELD", "Welder, per hour", "لحّام، بالساعة", "labour", "Labour", "hour", 10, 7],
  ["LAB-HELP", "Helper, per hour", "مساعد، بالساعة", "labour", "Labour", "hour", 6, 4],
  ["LAB-SITE", "On-site visit, per hour", "زيارة موقع، بالساعة", "labour", "Labour", "hour", 12, 8],
  ["STL-BOX40", "Box section 40x40x2 mm", "مواسير مربعة ٤٠×٤٠×٢ مم", "material", "Steel sections", "m", 1.8, 1.35],
  ["STL-BOX50", "Box section 50x50x2 mm", "مواسير مربعة ٥٠×٥٠×٢ مم", "material", "Steel sections", "m", 2.3, 1.75],
  ["STL-ANG40", "Angle 40x40x4 mm", "زاوية ٤٠×٤٠×٤ مم", "material", "Steel sections", "m", 1.6, 1.2],
  ["STL-RHS", "RHS 100x50x3 mm", "مستطيل ١٠٠×٥٠×٣ مم", "material", "Steel sections", "m", 4.2, 3.2],
  ["SHT-MS2", "MS sheet 2 mm", "صاج حديد ٢ مم", "material", "Sheets", "m2", 6.5, 5],
  ["SHT-GI1", "GI sheet 1 mm", "صاج مجلفن ١ مم", "material", "Sheets", "m2", 5.2, 4],
  ["FIN-PRIME", "Primer coat", "دهان أساس", "material", "Paint", "m2", 1.2, 0.8],
  ["FIN-PAINT", "Top coat, per m2", "دهان نهائي، للمتر المربع", "material", "Paint", "m2", 1.8, 1.2],
  ["FIN-POWDR", "Powder coating, per m2", "طلاء بودرة، للمتر المربع", "material", "Paint", "m2", 4.5, 3.4],
  ["FIN-GALV", "Hot-dip galvanising, per kg", "جلفنة بالغمس، للكيلو", "material", "Paint", "kg", 0.65, 0.48],
  ["CON-ELEC", "Welding electrodes, per kg", "أقطاب لحام، للكيلو", "material", "Consumables", "kg", 2.2, 1.6],
  ["UR-RAIL", "Railing, supplied and fitted", "درابزين، توريد وتركيب", "unit_rate", "Unit rates", "m", 18.5, 13],
  ["UR-GATE", "Gate, per m2", "بوابة، للمتر المربع", "unit_rate", "Unit rates", "m2", 42, 30],
  ["UR-CANOPY", "Canopy / car shade, per m2", "مظلة سيارات، للمتر المربع", "unit_rate", "Unit rates", "m2", 28, 20],
  ["UR-DOOR", "Steel door, per piece", "باب حديد، للقطعة", "unit_rate", "Unit rates", "piece", 95, 68],
  ["PRD-STAND", "Decorative metal stand", "ستاند ديكور معدني", "product", "Ready products", "piece", 33, 21],
  ["PRD-SHELF", "Industrial shelf unit", "وحدة رفوف صناعية", "product", "Ready products", "piece", 68, 45],
].map(([code, en, ar, kind, category, unit, rate, cost], i) =>
  ({ id: i + 1, code, name_en: en, name_ar: ar, kind, category, unit, rate, cost, active: true }));

const SEED_CLIENTS = [
  { id: 1, name: "[PRACTICE] Ahmed Al Dosari", kind: "person", phone: "39000001", area: "Riffa" },
  { id: 2, name: "[PRACTICE] Fatima Al Khalifa", kind: "person", phone: "39000002", area: "Saar" },
  { id: 3, name: "[PRACTICE] Gulf Contracting", kind: "company", phone: "17000003",
    company_name: "Gulf Contracting W.L.L.", vat_no: "220000000000002", area: "Sitra" },
  { id: 4, name: "[PRACTICE] Manama Interiors", kind: "company", phone: "17000004",
    company_name: "Manama Interiors S.P.C.", vat_no: "220000000000003", area: "Manama" },
  { id: 5, name: "[PRACTICE] Yousif Rentals", kind: "company", phone: "39000005",
    company_name: "Yousif Rentals", area: "Muharraq" },
];

// Module scope: survives while an instance stays warm, and resets when it does not.
// That is the honest limit of a demo with no database.
const store = { clients: SEED_CLIENTS.map((c) => ({ ...c })), quotes: [], nextClient: 6, nextQuote: 1 };

const norm = (v) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return (d.length > 8 && d.startsWith("973") ? d.slice(3) : d).slice(0, 15);
};

const readCookie = (req) =>
  (req.headers.cookie || "").split(/;\s*/).map((c) => c.split("=")).find(([k]) => k === COOKIE)?.[1];

const userFrom = (req) => {
  const id = Number(readCookie(req));
  return USERS.find((u) => u.id === id) || null;
};

function readLines(data) {
  const lines = Array.isArray(data.lines) ? data.lines.slice(0, 200) : [];
  if (!lines.length) throw Object.assign(new Error("a quote needs at least one line"), { status: 400 });
  return lines.map((l) => ({
    mode: ["build_up", "unit_rate", "fixed"].includes(l.mode) ? l.mode : "unit_rate",
    description: String(l.description || "").trim().slice(0, 255),
    unit: String(l.unit || "").slice(0, 16) || null,
    qty: Number(l.qty) || 1,
    unit_fils: fils(l.rate),
    total_fils: fils(l.total),
    build: l.build ? {
      material_fils: fils(l.build.material), hours: Number(l.build.hours) || 0,
      labour_rate_fils: fils(l.build.labour_rate), margin_pct: Number(l.build.margin_pct) || 0,
    } : null,
  }));
}

const price = (data, lines) => priceQuote({
  lines, delivery_fils: fils(data.delivery),
  discount_pct: Number(data.discount_pct) || 0,
  special_total_fils: fils(data.special_total),
  vat: data.vat !== false,
});

export default async function handler(req, res) {
  const url = new URL(req.url, "http://x");
  const path = url.pathname.replace(/^\/api\/portal/, "") || "/";
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const user = userFrom(req);

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  const json = (code, obj) => res.status(code).json(obj);
  const needUser = () => { if (!user) { json(401, { error: "not logged in" }); return true; } return false; };

  try {
    if (path === "/login" && req.method === "POST") {
      const who = USERS.find((u) => u.phone === norm(body.phone));
      if (!who || String(body.pin) !== DEMO_PIN) return json(401, { error: "wrong phone or PIN" });
      res.setHeader("Set-Cookie", `${COOKIE}=${who.id}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=43200`);
      return json(200, { ok: true });
    }

    if (path === "/logout" && req.method === "POST") {
      res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
      return json(200, { ok: true });
    }

    if (path === "/me") {
      if (needUser()) return;
      return json(200, { user, company: COMPANY, demo: true });
    }

    if (path === "/pricelist") {
      if (needUser()) return;
      return json(200, { items: PRICE_LIST });          // owner-only demo, so cost is included
    }

    if (path === "/clients" && req.method === "GET") {
      if (needUser()) return;
      return json(200, { clients: store.clients });
    }

    if (path === "/clients" && req.method === "POST") {
      if (needUser()) return;
      const phone = norm(body.phone);
      if (phone.length < 6) return json(400, { error: "a phone number is required" });
      if (store.clients.some((c) => c.phone === phone)) return json(409, { error: `${phone} already used` });
      const c = { id: store.nextClient++, name: String(body.name || "").slice(0, 160), kind: body.kind || "person",
                  phone, company_name: body.company_name || null, vat_no: body.vat_no || null,
                  cr_no: body.cr_no || null, email: body.email || null, area: body.area || null,
                  note: body.note || null };
      if (!c.name) return json(400, { error: "a name is required" });
      store.clients.push(c);
      return json(200, { id: c.id });
    }

    if (path === "/quote-setup") {
      if (needUser()) return;
      return json(200, {
        company: COMPANY,
        terms: TERMS.map(([code, en, ar]) => ({ code, en, ar, on: true })),
      });
    }

    if (path === "/quote-preview" && req.method === "POST") {
      if (needUser()) return;
      const lines = readLines(body);
      const p = price(body, lines);
      return json(200, {
        subtotal: bhd(p.subtotal_fils), discount: bhd(p.discount_fils), special: bhd(p.special_fils),
        vat: bhd(p.vat_fils), total: bhd(p.total_fils),
        lines: p.lines.map((l) => ({ description: l.description, qty: l.qty, rate: bhd(l.unit_fils),
          net: bhd(l.net_fils), discount: bhd(l.discount_fils), vat: bhd(l.vat_fils), total: bhd(l.total_fils) })),
      });
    }

    if (path === "/quotes" && req.method === "GET") {
      if (needUser()) return;
      return json(200, { quotes: store.quotes.map((q) => ({
        id: q.id, no: q.no, status: q.status, customer_name: q.customer_name,
        subject: q.subject, total: q.total, created_at: q.created_at })) });
    }

    if (path === "/quotes" && req.method === "POST") {
      if (needUser()) return;
      const client = store.clients.find((c) => c.id === Number(body.customer_id));
      if (!client) return json(400, { error: "choose a client first" });
      const lines = readLines(body);
      const p = price(body, lines);
      const q = {
        id: store.nextQuote, no: `Q-${store.nextQuote}`, version: 1, status: "draft",
        customer_id: client.id, customer_name: client.name, customer_phone: client.phone,
        customer_vat: client.vat_no || null, subject: body.subject || null,
        lang: body.lang === "en" ? "en" : "ar", vat_on: body.vat !== false,
        valid_days: Number(body.valid_days) || 14, note: body.note || null,
        internal_note: body.internal_note || null, delivery: Number(body.delivery) || 0,
        special: bhd(p.special_fils), subtotal: bhd(p.subtotal_fils),
        discount: bhd(p.discount_fils), vatAmt: bhd(p.vat_fils), total: bhd(p.total_fils),
        created_at: new Date().toISOString(), token: null,
        terms: TERMS.filter(([c]) => (body.terms || []).includes(c)).map(([code, en, ar]) => ({ code, en, ar })),
        lines: p.lines.map((l, i) => ({
          id: i + 1, mode: l.mode, description: l.description, unit: l.unit_label, qty: l.qty,
          rate: bhd(l.unit_fils), net: bhd(l.net_fils), discount: bhd(l.discount_fils),
          vat: bhd(l.vat_fils), total: bhd(l.total_fils),
          build: lines[i]?.build ? { material: bhd(lines[i].build.material_fils), hours: lines[i].build.hours,
            labour_rate: bhd(lines[i].build.labour_rate_fils), margin_pct: lines[i].build.margin_pct } : undefined,
        })),
      };
      store.quotes.unshift(q);
      store.nextQuote++;
      return json(200, { id: q.id, total: q.total });
    }

    const one = path.match(/^\/quotes\/(\d+)$/);
    if (one && req.method === "GET") {
      if (needUser()) return;
      const q = store.quotes.find((x) => x.id === Number(one[1]));
      if (!q) return json(404, { error: "quote not found (the demo forgets when it sleeps)" });
      return json(200, { quote: q });
    }
    if (one && req.method === "PUT") {
      if (needUser()) return;
      const q = store.quotes.find((x) => x.id === Number(one[1]));
      if (!q) return json(404, { error: "quote not found (the demo forgets when it sleeps)" });
      if (q.status === "accepted") return json(409, { error: "an accepted quote cannot be edited" });
      const lines = readLines(body);
      const p = price(body, lines);
      Object.assign(q, {
        subject: body.subject || q.subject, delivery: Number(body.delivery) || 0,
        subtotal: bhd(p.subtotal_fils), discount: bhd(p.discount_fils),
        vatAmt: bhd(p.vat_fils), total: bhd(p.total_fils),
        lines: p.lines.map((l, i) => ({ id: i + 1, mode: l.mode, description: l.description,
          unit: l.unit_label, qty: l.qty, rate: bhd(l.unit_fils), net: bhd(l.net_fils),
          discount: bhd(l.discount_fils), vat: bhd(l.vat_fils), total: bhd(l.total_fils),
          build: lines[i]?.build ? { material: bhd(lines[i].build.material_fils), hours: lines[i].build.hours,
            labour_rate: bhd(lines[i].build.labour_rate_fils), margin_pct: lines[i].build.margin_pct } : undefined })),
      });
      // A sent quote would version here. The demo keeps one copy, and says so.
      if (q.status === "sent") q.version += 1;
      return json(200, { id: q.id, version: q.version, total: q.total });
    }

    const send = path.match(/^\/quotes\/(\d+)\/send$/);
    if (send && req.method === "POST") {
      if (needUser()) return;
      const q = store.quotes.find((x) => x.id === Number(send[1]));
      if (!q) return json(404, { error: "quote not found (the demo forgets when it sleeps)" });
      q.status = "sent";
      q.issued_at = new Date().toISOString();
      return json(200, { ok: true, no: q.no, token: null,
        note: "the customer link needs the real portal — it has to store the token" });
    }

    const cancel = path.match(/^\/quotes\/(\d+)\/cancel$/);
    if (cancel && req.method === "POST") {
      if (needUser()) return;
      const reason = String(body.reason || "").trim();
      if (!reason) return json(400, { error: "a reason is required to cancel" });
      const q = store.quotes.find((x) => x.id === Number(cancel[1]));
      if (!q) return json(404, { error: "quote not found" });
      q.status = "cancelled";
      q.cancel_reason = reason;
      return json(200, { ok: true });
    }

    return json(404, { error: "not found" });
  } catch (e) {
    return json(e.status || 500, { error: e.status ? e.message : "server error" });
  }
}
