/**
 * The demo's data layer. Runs entirely in the browser.
 *
 * The first version of this demo called a serverless function. That function went to
 * sleep, took seconds to wake, set a cookie, and could stall with no explanation — and
 * it did, repeatedly, for the person trying to look at the screens. None of that
 * machinery earns its place in something whose only job is to show the screens.
 *
 * So: no network, no cold start, no cookie, nothing to 404. It answers instantly, works
 * offline, and what you type persists in this browser instead of vanishing when an
 * instance recycles.
 *
 * The money is still the real thing — pricing.js is copied from portal/src, not
 * reimplemented — so every total here is the total the real portal will compute.
 *
 * The real portal does this on the server, and must: a browser can be edited, so a
 * price it calculates can never be trusted. That is a statement about the real system,
 * not this one.
 */
import { priceQuote, fils, bhd } from "./pricing.js";

const DEMO_PIN = "2468";
const KEY = "qobban-demo-v1";

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
  ["STL-RND12", "Round bar 12 mm", "حديد دائري ١٢ مم", "material", "Steel sections", "m", 0.9, 0.65],
  ["SHT-MS2", "MS sheet 2 mm", "صاج حديد ٢ مم", "material", "Sheets", "m2", 6.5, 5],
  ["SHT-GI1", "GI sheet 1 mm", "صاج مجلفن ١ مم", "material", "Sheets", "m2", 5.2, 4],
  ["SHT-EXP", "Expanded mesh", "شبك ممدد", "material", "Sheets", "m2", 4.8, 3.6],
  ["FIN-PRIME", "Primer coat", "دهان أساس", "material", "Paint", "m2", 1.2, 0.8],
  ["FIN-PAINT", "Top coat, per m2", "دهان نهائي، للمتر المربع", "material", "Paint", "m2", 1.8, 1.2],
  ["FIN-POWDR", "Powder coating, per m2", "طلاء بودرة، للمتر المربع", "material", "Paint", "m2", 4.5, 3.4],
  ["FIN-GALV", "Hot-dip galvanising, per kg", "جلفنة بالغمس، للكيلو", "material", "Paint", "kg", 0.65, 0.48],
  ["CON-ELEC", "Welding electrodes, per kg", "أقطاب لحام، للكيلو", "material", "Consumables", "kg", 2.2, 1.6],
  ["CON-DISC", "Cutting disc", "قرص قطع", "material", "Consumables", "piece", 0.8, 0.55],
  ["UR-RAIL", "Railing, supplied and fitted", "درابزين، توريد وتركيب", "unit_rate", "Unit rates", "m", 18.5, 13],
  ["UR-GATE", "Gate, per m2", "بوابة، للمتر المربع", "unit_rate", "Unit rates", "m2", 42, 30],
  ["UR-CANOPY", "Canopy / car shade, per m2", "مظلة سيارات، للمتر المربع", "unit_rate", "Unit rates", "m2", 28, 20],
  ["UR-DOOR", "Steel door, per piece", "باب حديد، للقطعة", "unit_rate", "Unit rates", "piece", 95, 68],
  ["PRD-STAND", "Decorative metal stand", "ستاند ديكور معدني", "product", "Ready products", "piece", 33, 21],
  ["PRD-SHELF", "Industrial shelf unit", "وحدة رفوف صناعية", "product", "Ready products", "piece", 68, 45],
].map(([code, name_en, name_ar, kind, category, unit, rate, cost], i) =>
  ({ id: i + 1, code, name_en, name_ar, kind, category, unit, rate, cost, active: true }));

const seedClients = () => ([
  { id: 1, name: "[PRACTICE] Ahmed Al Dosari", kind: "person", phone: "39000001", area: "Riffa" },
  { id: 2, name: "[PRACTICE] Fatima Al Khalifa", kind: "person", phone: "39000002", area: "Saar" },
  { id: 3, name: "[PRACTICE] Gulf Contracting", kind: "company", phone: "17000003",
    company_name: "Gulf Contracting W.L.L.", vat_no: "220000000000002", area: "Sitra" },
  { id: 4, name: "[PRACTICE] Manama Interiors", kind: "company", phone: "17000004",
    company_name: "Manama Interiors S.P.C.", vat_no: "220000000000003", area: "Manama" },
  { id: 5, name: "[PRACTICE] Yousif Rentals", kind: "company", phone: "39000005",
    company_name: "Yousif Rentals", area: "Muharraq" },
]);

// A couple of finished quotes, so the first screen is never an empty one that
// reads as broken.
const seedQuotes = () => ([
  { id: 2, no: "Q-2", version: 1, status: "accepted", customer_id: 3,
    customer_name: "[PRACTICE] Gulf Contracting", subject: "مظلة سيارات ٤٠ م٢",
    total: 1232, subtotal: 1120, discount: 0, vat: 112, delivery: 0, special: 0,
    vat_on: true, valid_days: 14, lang: "ar", terms: [], lines: [],
    created_at: new Date(Date.now() - 1728e5).toISOString(),
    accepted_at: new Date(Date.now() - 864e5).toISOString(), accepted_name: "Gulf Contracting" },
  { id: 1, no: "Q-1", version: 1, status: "sent", customer_id: 1,
    customer_name: "[PRACTICE] Ahmed Al Dosari", subject: "بوابة سحب ودرابزين",
    total: 1080.475, subtotal: 982.25, discount: 0, vat: 98.225, delivery: 30, special: 0,
    vat_on: true, valid_days: 14, lang: "ar", terms: [], lines: [],
    created_at: new Date(Date.now() - 864e5).toISOString() },
]);

// localStorage can be unavailable (private windows, blocked site data). The demo must
// still work when it is; it just forgets between reloads.
let memory = null;

function load() {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { memory = JSON.parse(raw); return memory; }
  } catch (e) { /* fall through to a fresh set */ }
  memory = { clients: seedClients(), quotes: seedQuotes(), nextClient: 6, nextQuote: 3, user: null };
  return memory;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) { /* memory only */ }
}

const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };

const normPhone = (v) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return (d.length > 8 && d.startsWith("973") ? d.slice(3) : d).slice(0, 15);
};

function readLines(data) {
  const lines = Array.isArray(data.lines) ? data.lines.slice(0, 200) : [];
  if (!lines.length) fail(400, "a quote needs at least one line");
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

const priced = (data, lines) => priceQuote({
  lines,
  delivery_fils: fils(data.delivery),
  discount_pct: Number(data.discount_pct) || 0,
  special_total_fils: fils(data.special_total),
  vat: data.vat !== false,
});

const shapeLines = (p, src) => p.lines.map((l, i) => ({
  id: i + 1, mode: l.mode, description: l.description, unit: l.unit_label, qty: l.qty,
  rate: bhd(l.unit_fils), net: bhd(l.net_fils), discount: bhd(l.discount_fils),
  vat: bhd(l.vat_fils), total: bhd(l.total_fils),
  build: src[i] && src[i].build ? {
    material: bhd(src[i].build.material_fils), hours: src[i].build.hours,
    labour_rate: bhd(src[i].build.labour_rate_fils), margin_pct: src[i].build.margin_pct,
  } : undefined,
}));

/**
 * Same shape as a fetch wrapper: call(method, path, body) -> data, or throws with
 * .status. The screens cannot tell the difference, which is the point — they stay
 * identical to the ones the real portal serves.
 */
export async function call(method, path, body = {}) {
  const db = load();
  const needUser = () => { if (!db.user) fail(401, "not logged in"); };

  if (path === "/api/login" && method === "POST") {
    const who = USERS.find((u) => u.phone === normPhone(body.phone));
    if (!who || String(body.pin) !== DEMO_PIN) fail(401, "wrong phone or PIN");
    db.user = who;
    save();
    return { ok: true };
  }

  if (path === "/api/logout") { db.user = null; save(); return { ok: true }; }

  if (path === "/api/me") { needUser(); return { user: db.user, company: COMPANY, demo: true }; }

  if (path === "/api/pricelist") { needUser(); return { items: PRICE_LIST }; }

  if (path === "/api/clients" && method === "GET") { needUser(); return { clients: db.clients }; }

  if (path === "/api/clients" && method === "POST") {
    needUser();
    const phone = normPhone(body.phone);
    if (phone.length < 6) fail(400, "a phone number is required");
    const dupe = db.clients.find((c) => c.phone === phone);
    if (dupe) fail(409, `${dupe.name} already uses ${phone}`);
    const name = String(body.name || "").trim().slice(0, 160);
    if (!name) fail(400, "a name is required");
    const c = { id: db.nextClient++, name, kind: body.kind === "company" ? "company" : "person",
      phone, company_name: body.company_name || null, cr_no: body.cr_no || null,
      vat_no: body.vat_no || null, email: body.email || null, area: body.area || null,
      note: body.note || null };
    db.clients.push(c);
    save();
    return { id: c.id };
  }

  if (path === "/api/quote-setup") {
    needUser();
    return { company: COMPANY, terms: TERMS.map(([code, en, ar]) => ({ code, en, ar, on: true })) };
  }

  if (path === "/api/quote-preview" && method === "POST") {
    needUser();
    const src = readLines(body);
    const p = priced(body, src);
    return {
      subtotal: bhd(p.subtotal_fils), discount: bhd(p.discount_fils), special: bhd(p.special_fils),
      vat: bhd(p.vat_fils), total: bhd(p.total_fils),
      lines: p.lines.map((l) => ({ description: l.description, qty: l.qty, rate: bhd(l.unit_fils),
        net: bhd(l.net_fils), discount: bhd(l.discount_fils), vat: bhd(l.vat_fils),
        total: bhd(l.total_fils) })),
    };
  }

  if (path === "/api/quotes" && method === "GET") {
    needUser();
    return { quotes: db.quotes.map((q) => ({ id: q.id, no: q.no, status: q.status,
      customer_name: q.customer_name, subject: q.subject, total: q.total,
      created_at: q.created_at })) };
  }

  if (path === "/api/quotes" && method === "POST") {
    needUser();
    const client = db.clients.find((c) => c.id === Number(body.customer_id));
    if (!client) fail(400, "choose a client first");
    const src = readLines(body);
    const p = priced(body, src);
    const q = {
      id: db.nextQuote, no: `Q-${db.nextQuote}`, version: 1, status: "draft",
      customer_id: client.id, customer_name: client.name, customer_phone: client.phone,
      customer_vat: client.vat_no || null, subject: body.subject || null,
      lang: body.lang === "en" ? "en" : "ar", vat_on: body.vat !== false,
      valid_days: Number(body.valid_days) || 14, note: body.note || null,
      internal_note: body.internal_note || null, delivery: Number(body.delivery) || 0,
      subtotal: bhd(p.subtotal_fils), discount: bhd(p.discount_fils),
      special: bhd(p.special_fils), vat: bhd(p.vat_fils), total: bhd(p.total_fils),
      created_at: new Date().toISOString(), token: null,
      terms: TERMS.filter(([c]) => (body.terms || []).includes(c))
                  .map(([code, en, ar]) => ({ code, en, ar })),
      lines: shapeLines(p, src),
    };
    db.quotes.unshift(q);
    db.nextQuote++;
    save();
    return { id: q.id, total: q.total };
  }

  const one = path.match(/^\/api\/quotes\/(\d+)$/);
  if (one) {
    needUser();
    const q = db.quotes.find((x) => x.id === Number(one[1]));
    if (!q) fail(404, "quote not found");
    if (method === "GET") return { quote: q };
    if (method === "PUT") {
      if (q.status === "accepted") fail(409, "an accepted quote cannot be edited");
      const src = readLines(body);
      const p = priced(body, src);
      // A sent quote is never altered: the edit becomes the next version, exactly as
      // the real portal does it.
      if (q.status === "sent") { q.version += 1; q.status = "draft"; q.no = `${q.no.split("-v")[0]}-v${q.version}`; }
      Object.assign(q, {
        subject: body.subject || q.subject, delivery: Number(body.delivery) || 0,
        subtotal: bhd(p.subtotal_fils), discount: bhd(p.discount_fils),
        special: bhd(p.special_fils), vat: bhd(p.vat_fils), total: bhd(p.total_fils),
        vat_on: body.vat !== false, valid_days: Number(body.valid_days) || 14,
        note: body.note || null, internal_note: body.internal_note || null,
        terms: TERMS.filter(([c]) => (body.terms || []).includes(c))
                    .map(([code, en, ar]) => ({ code, en, ar })),
        lines: shapeLines(p, src),
      });
      save();
      return { id: q.id, version: q.version, total: q.total };
    }
  }

  const send = path.match(/^\/api\/quotes\/(\d+)\/send$/);
  if (send && method === "POST") {
    needUser();
    const q = db.quotes.find((x) => x.id === Number(send[1]));
    if (!q) fail(404, "quote not found");
    if (q.status !== "draft") fail(409, `this quote is already ${q.status}`);
    q.status = "sent";
    q.issued_at = new Date().toISOString();
    save();
    return { ok: true, no: q.no, token: null };
  }

  const cancel = path.match(/^\/api\/quotes\/(\d+)\/cancel$/);
  if (cancel && method === "POST") {
    needUser();
    const reason = String(body.reason || "").trim();
    if (!reason) fail(400, "a reason is required to cancel");
    const q = db.quotes.find((x) => x.id === Number(cancel[1]));
    if (!q) fail(404, "quote not found");
    q.status = "cancelled";
    q.cancel_reason = reason;
    save();
    return { ok: true };
  }

  fail(404, "not found");
}

/** Throw the practice data away and start again. */
export function reset() {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to clear */ }
  memory = null;
}
