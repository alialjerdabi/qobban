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
// Bumped with the data shape. A copy saved under the old key has no jobs, invoices or
// expenses, and every screen that reads them would throw on a stale browser. Changing
// the key retires that copy instead of migrating it — this is practice data.
const KEY = "qobban-demo-v2";

const USERS = [
  { id: 1, phone: "35665422", name_en: "Ali", name_ar: "علي", roles: ["owner"] },
  { id: 2, phone: "39949004", name_en: "Hussain", name_ar: "حسين", roles: ["owner"] },
];

// The three non-owner roles are placeholders until the real names arrive. They exist
// now because the screens need someone to assign a job to, and a crew picker with two
// owners in it does not show whether the picker works.
const TEAM = [
  { id: 1, name_en: "Ali", name_ar: "علي", phone: "35665422", role: "owner",
    role_ar: "مالك", role_en: "Owner", active: true },
  { id: 2, name_en: "Hussain", name_ar: "حسين", phone: "39949004", role: "owner",
    role_ar: "مالك", role_en: "Owner", active: true },
  { id: 3, name_en: "[PRACTICE] Manager", name_ar: "[تجريبي] المدير", phone: "39000101",
    role: "manager", role_ar: "مدير", role_en: "Manager", active: true },
  { id: 4, name_en: "[PRACTICE] Accountant", name_ar: "[تجريبي] المحاسب", phone: "39000102",
    role: "accountant", role_ar: "محاسب", role_en: "Accountant", active: true },
  { id: 5, name_en: "[PRACTICE] Foreman", name_ar: "[تجريبي] المشرف", phone: "39000103",
    role: "foreman", role_ar: "مشرف", role_en: "Foreman", active: true },
];

// What the money actually goes on in a welding shop. Keeping the list short is the
// point: a category picker with thirty options gets everything filed under "other".
const EXPENSE_CATS = [
  { code: "material", ar: "مواد", en: "Materials", icon: "box" },
  { code: "fuel",     ar: "وقود",  en: "Fuel",      icon: "truck" },
  { code: "wages",    ar: "أجور",  en: "Wages",     icon: "users" },
  { code: "tools",    ar: "عدد",   en: "Tools",     icon: "tool" },
  { code: "rent",     ar: "إيجار", en: "Rent",      icon: "home" },
  { code: "transport",ar: "نقل",   en: "Transport", icon: "truck" },
  { code: "utility",  ar: "كهرباء وماء", en: "Utilities", icon: "zap" },
  { code: "other",    ar: "أخرى",  en: "Other",     icon: "dots" },
];

const PAY_METHODS = [
  { code: "cash",     ar: "نقدًا",  en: "Cash" },
  { code: "benefit",  ar: "بنفت",   en: "BenefitPay" },
  { code: "transfer", ar: "تحويل",  en: "Bank transfer" },
  { code: "cheque",   ar: "شيك",    en: "Cheque" },
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

/* Practice jobs, invoices and expenses.

   Dates are relative to whenever the demo is opened, not hard-coded. A fixed date set
   goes stale: open it next month and the calendar is empty, "today" has nothing on it,
   and the dashboard reads as broken when it is merely out of date. */
// Midday, not midnight. Bahrain is UTC+3, so local midnight is 21:00 the PREVIOUS day
// in UTC, and toISOString() then hands back yesterday's date — every seeded job landed
// one day early. Anchoring at noon puts the whole country safely inside the same date.
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(12, 0, 0, 0); return d; };
const iso = (n) => day(n).toISOString().slice(0, 10);

const seedJobs = () => ([
  { id: 1, no: "J-1", quote_id: 2, customer_id: 3, customer_name: "[PRACTICE] Gulf Contracting",
    title: "مظلة سيارات ٤٠ م٢", site: "Sitra — مجمع ٦٠١", status: "progress",
    date: iso(0), start: "08:00", end: "14:00", crew: [2, 5], value: 1232,
    checklist: [
      { t: "قياس الموقع", done: true }, { t: "تجهيز الهيكل بالورشة", done: true },
      { t: "نقل إلى الموقع", done: false }, { t: "التركيب", done: false },
      { t: "الدهان النهائي", done: false }, { t: "تسليم وتنظيف", done: false },
    ] },
  { id: 2, no: "J-2", quote_id: null, customer_id: 1, customer_name: "[PRACTICE] Ahmed Al Dosari",
    title: "صيانة بوابة", site: "Riffa — طريق ٢٧", status: "scheduled",
    date: iso(1), start: "09:00", end: "11:00", crew: [5], value: 85,
    checklist: [{ t: "فحص المحرك", done: false }, { t: "تشحيم السكك", done: false }] },
  { id: 3, no: "J-3", quote_id: null, customer_id: 4, customer_name: "[PRACTICE] Manama Interiors",
    title: "درابزين درج داخلي ١٢ م", site: "Manama — برج ٣", status: "scheduled",
    date: iso(3), start: "08:00", end: "16:00", crew: [2, 5], value: 222,
    checklist: [{ t: "أخذ المقاسات", done: false }, { t: "التصنيع", done: false },
                { t: "التركيب", done: false }] },
  { id: 4, no: "J-4", quote_id: null, customer_id: 5, customer_name: "[PRACTICE] Yousif Rentals",
    title: "رفوف صناعية ×٦", site: "Muharraq — مستودع ١٢", status: "done",
    date: iso(-4), start: "08:00", end: "15:00", crew: [2], value: 408,
    checklist: [{ t: "التصنيع", done: true }, { t: "التسليم", done: true }] },
]);

const seedInvoices = () => ([
  { id: 1, no: "INV-1", job_id: 4, customer_id: 5, customer_name: "[PRACTICE] Yousif Rentals",
    subject: "رفوف صناعية ×٦", issued: iso(-4), due: iso(-4 + 30),
    subtotal: 408, vat: 40.8, total: 448.8, payments: [
      { id: 1, date: iso(-4), amount: 200, method: "transfer", ref: "TRF-8841" },
    ] },
  { id: 2, no: "INV-2", job_id: null, customer_id: 1, customer_name: "[PRACTICE] Ahmed Al Dosari",
    subject: "صيانة بوابة — زيارة سابقة", issued: iso(-45), due: iso(-45 + 30),
    subtotal: 60, vat: 6, total: 66, payments: [] },
  { id: 3, no: "INV-3", job_id: null, customer_id: 3, customer_name: "[PRACTICE] Gulf Contracting",
    subject: "دفعة مقدمة — مظلة سيارات", issued: iso(-8), due: iso(-8 + 30),
    subtotal: 560, vat: 56, total: 616, payments: [
      { id: 2, date: iso(-7), amount: 616, method: "cheque", ref: "CHQ-200143" },
    ] },
]);

const seedExpenses = () => ([
  { id: 1, date: iso(-1), cat: "material", amount: 184.5, note: "صاج ٢ مم — ٦ ألواح",
    supplier: "[PRACTICE] Bahrain Steel", job_id: 1, by: 1 },
  { id: 2, date: iso(-1), cat: "fuel", amount: 12, note: "بنزين البيك أب", supplier: null, job_id: null, by: 5 },
  { id: 3, date: iso(-3), cat: "wages", amount: 320, note: "أجور أسبوعية — عاملان", supplier: null, job_id: null, by: 1 },
  { id: 4, date: iso(-5), cat: "tools", amount: 46.75, note: "أقراص قطع + قناع لحام", supplier: "[PRACTICE] Gulf Tools", job_id: null, by: 5 },
  { id: 5, date: iso(-9), cat: "rent", amount: 450, note: "إيجار الورشة", supplier: null, job_id: null, by: 1 },
  { id: 6, date: iso(-12), cat: "utility", amount: 88.3, note: "كهرباء وماء", supplier: null, job_id: null, by: 1 },
  { id: 7, date: iso(-14), cat: "material", amount: 96, note: "مواسير مربعة ٤٠×٤٠", supplier: "[PRACTICE] Bahrain Steel", job_id: 4, by: 1 },
  { id: 8, date: iso(-38), cat: "material", amount: 230, note: "صاج مجلفن", supplier: "[PRACTICE] Bahrain Steel", job_id: null, by: 1 },
  { id: 9, date: iso(-40), cat: "rent", amount: 450, note: "إيجار الورشة", supplier: null, job_id: null, by: 1 },
  { id: 10, date: iso(-69), cat: "rent", amount: 450, note: "إيجار الورشة", supplier: null, job_id: null, by: 1 },
  { id: 11, date: iso(-66), cat: "material", amount: 310, note: "حديد متنوع", supplier: "[PRACTICE] Bahrain Steel", job_id: null, by: 1 },
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
  // Signed in from the start. The demo holds no real data, so a login gate added
  // nothing but a way for this to fail.
  memory = {
    clients: seedClients(), quotes: seedQuotes(), jobs: seedJobs(),
    invoices: seedInvoices(), expenses: seedExpenses(),
    nextClient: 6, nextQuote: 3, nextJob: 5, nextInvoice: 4, nextExpense: 12, nextPayment: 3,
    user: USERS[0],
  };
  return memory;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) { /* memory only */ }
}

/* Errors are the one place a bilingual app most often forgets to be bilingual, and
   they are the text a person reads at their most frustrated. Every failure carries
   both languages; which one surfaces follows the same key the screens read. */
const EN = () => { try { return localStorage.getItem("qb-lang") === "en"; } catch (e) { return false; } };
const fail = (status, ar, en) => {
  const e = new Error(EN() ? (en || ar) : ar);
  e.status = status;
  throw e;
};

const normPhone = (v) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return (d.length > 8 && d.startsWith("973") ? d.slice(3) : d).slice(0, 15);
};

function readLines(data) {
  const lines = Array.isArray(data.lines) ? data.lines.slice(0, 200) : [];
  if (!lines.length) fail(400, "العرض يحتاج بندًا واحدًا على الأقل", "a quote needs at least one line");
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
  if (!db.user) db.user = USERS[0];          // the demo is always "signed in"
  const needUser = () => {};

  if (path === "/api/login" && method === "POST") {
    const who = USERS.find((u) => u.phone === normPhone(body.phone));
    if (!who || String(body.pin) !== DEMO_PIN) fail(401, "رقم أو رمز غير صحيح", "wrong phone or PIN");
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
    if (phone.length < 6) fail(400, "رقم الهاتف مطلوب", "a phone number is required");
    const dupe = db.clients.find((c) => c.phone === phone);
    if (dupe) fail(409, `${dupe.name} مسجّل بنفس الرقم ${phone}`,
                     `${dupe.name} already uses ${phone}`);
    const name = String(body.name || "").trim().slice(0, 160);
    if (!name) fail(400, "الاسم مطلوب", "a name is required");
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
    if (!client) fail(400, "اختر العميل أولاً", "choose a client first");
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
    if (!q) fail(404, "العرض غير موجود", "quote not found");
    if (method === "GET") return { quote: q };
    if (method === "PUT") {
      if (q.status === "accepted") fail(409, "العرض المقبول ما يتعدّل", "an accepted quote cannot be edited");
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
    if (!q) fail(404, "العرض غير موجود", "quote not found");
    if (q.status !== "draft") fail(409, `هذا العرض ${q.status} أصلاً`,
                                        `this quote is already ${q.status}`);
    q.status = "sent";
    q.issued_at = new Date().toISOString();
    save();
    return { ok: true, no: q.no, token: null };
  }

  const cancel = path.match(/^\/api\/quotes\/(\d+)\/cancel$/);
  if (cancel && method === "POST") {
    needUser();
    const reason = String(body.reason || "").trim();
    if (!reason) fail(400, "لازم سبب للإلغاء", "a reason is required to cancel");
    const q = db.quotes.find((x) => x.id === Number(cancel[1]));
    if (!q) fail(404, "العرض غير موجود", "quote not found");
    q.status = "cancelled";
    q.cancel_reason = reason;
    save();
    return { ok: true };
  }

  /* ---------------------------------------------------------------- team */
  if (path === "/api/team") { needUser(); return { team: TEAM }; }

  if (path === "/api/meta") {
    needUser();
    return { expense_cats: EXPENSE_CATS, pay_methods: PAY_METHODS };
  }

  /* ---------------------------------------------------------------- jobs */
  if (path === "/api/jobs" && method === "GET") { needUser(); return { jobs: db.jobs }; }

  if (path === "/api/jobs" && method === "POST") {
    needUser();
    const client = db.clients.find((c) => c.id === Number(body.customer_id));
    if (!client) fail(400, "اختر العميل أولاً", "choose a client first");
    const title = String(body.title || "").trim().slice(0, 160);
    if (!title) fail(400, "العنوان مطلوب", "a title is required");
    const j = {
      id: db.nextJob, no: `J-${db.nextJob}`, quote_id: body.quote_id || null,
      customer_id: client.id, customer_name: client.name, title,
      site: String(body.site || "").slice(0, 160) || null,
      status: "scheduled", date: body.date || iso(0),
      start: body.start || "08:00", end: body.end || "12:00",
      crew: Array.isArray(body.crew) ? body.crew.map(Number) : [],
      value: Number(body.value) || 0,
      checklist: (Array.isArray(body.checklist) ? body.checklist : [])
        .map((t) => ({ t: String(t).slice(0, 120), done: false })),
    };
    db.jobs.push(j);
    db.nextJob++;
    save();
    return { id: j.id, no: j.no };
  }

  const job = path.match(/^\/api\/jobs\/(\d+)$/);
  if (job && method === "PUT") {
    needUser();
    const j = db.jobs.find((x) => x.id === Number(job[1]));
    if (!j) fail(404, "الوظيفة غير موجودة", "job not found");
    if (body.status) {
      if (!["scheduled", "progress", "done", "cancelled"].includes(body.status)) {
        fail(400, "حالة وظيفة غير معروفة", "unknown job status");
      }
      j.status = body.status;
    }
    if (Array.isArray(body.checklist)) j.checklist = body.checklist;
    if (Array.isArray(body.crew)) j.crew = body.crew.map(Number);
    save();
    return { ok: true, status: j.status };
  }

  /* ------------------------------------------------------------ invoices */
  // An invoice is its payments plus arithmetic, so "paid" and "due" are derived on
  // every read rather than stored. A stored balance is a second source of truth, and
  // the two drift the first time a payment is edited.
  const withBalance = (inv) => {
    const paid = inv.payments.reduce((s, p) => s + fils(p.amount), 0);
    const due = fils(inv.total) - paid;
    const overdue = due > 0 && new Date(inv.due) < day(0);
    return { ...inv, paid: bhd(paid), due: bhd(due),
             state: due <= 0 ? "paid" : overdue ? "overdue" : paid > 0 ? "partial" : "unpaid" };
  };

  if (path === "/api/invoices" && method === "GET") {
    needUser();
    return { invoices: db.invoices.map(withBalance) };
  }

  if (path === "/api/invoices" && method === "POST") {
    needUser();
    const client = db.clients.find((c) => c.id === Number(body.customer_id));
    if (!client) fail(400, "اختر العميل أولاً", "choose a client first");
    const net = fils(body.subtotal);
    if (net <= 0) fail(400, "الفاتورة تحتاج مبلغ", "an invoice needs an amount");
    const vat = body.vat === false ? 0 : Math.round(net * COMPANY.vat_rate_bp / 10000);
    const inv = {
      id: db.nextInvoice, no: `INV-${db.nextInvoice}`, job_id: body.job_id || null,
      customer_id: client.id, customer_name: client.name,
      subject: String(body.subject || "").slice(0, 160) || null,
      issued: body.issued || iso(0), due: body.due || iso(30),
      subtotal: bhd(net), vat: bhd(vat), total: bhd(net + vat), payments: [],
    };
    db.invoices.unshift(inv);
    db.nextInvoice++;
    save();
    return { id: inv.id, no: inv.no, total: inv.total };
  }

  const pay = path.match(/^\/api\/invoices\/(\d+)\/payment$/);
  if (pay && method === "POST") {
    needUser();
    const inv = db.invoices.find((x) => x.id === Number(pay[1]));
    if (!inv) fail(404, "الفاتورة غير موجودة", "invoice not found");
    const amount = fils(body.amount);
    if (amount <= 0) fail(400, "اكتب المبلغ", "enter an amount");
    const owed = fils(inv.total) - inv.payments.reduce((s, p) => s + fils(p.amount), 0);
    if (amount > owed) {
      const left = bhd(owed).toFixed(3);
      fail(400, `المبلغ أكبر من المتبقي (${left} د.ب)`,
                `that is more than the ${left} still owed`);
    }
    inv.payments.push({
      id: db.nextPayment++, date: body.date || iso(0), amount: bhd(amount),
      method: PAY_METHODS.some((m) => m.code === body.method) ? body.method : "cash",
      ref: String(body.ref || "").slice(0, 60) || null,
    });
    save();
    return withBalance(inv);
  }

  /* ------------------------------------------------------------ expenses */
  if (path === "/api/expenses" && method === "GET") {
    needUser();
    return { expenses: db.expenses.slice().sort((a, b) => b.date.localeCompare(a.date)) };
  }

  if (path === "/api/expenses" && method === "POST") {
    needUser();
    const amount = fils(body.amount);
    if (amount <= 0) fail(400, "اكتب المبلغ", "enter an amount");
    if (!EXPENSE_CATS.some((c) => c.code === body.cat)) fail(400, "اختر الفئة", "choose a category");
    const e = {
      id: db.nextExpense++, date: body.date || iso(0), cat: body.cat, amount: bhd(amount),
      note: String(body.note || "").slice(0, 160) || null,
      supplier: String(body.supplier || "").slice(0, 120) || null,
      job_id: body.job_id ? Number(body.job_id) : null,
      by: db.user.id,
    };
    db.expenses.unshift(e);
    save();
    return { id: e.id, amount: e.amount };
  }

  /* ----------------------------------------------------------- dashboard
     Computed here rather than in the screens, so the real portal can answer the same
     path from SQL and the screens never change. */
  if (path === "/api/dashboard") {
    needUser();
    const today = iso(0);
    const monthStart = today.slice(0, 7);
    const invs = db.invoices.map(withBalance);

    const sum = (list, pick) => bhd(list.reduce((s, x) => s + fils(pick(x)), 0));
    const thisMonth = (d) => String(d).slice(0, 7) === monthStart;

    const collected = db.invoices.flatMap((i) => i.payments).filter((p) => thisMonth(p.date));
    const spent = db.expenses.filter((e) => thisMonth(e.date));
    const billed = invs.filter((i) => thisMonth(i.issued));

    return {
      today: db.jobs.filter((j) => j.date === today && j.status !== "cancelled"),
      week: db.jobs.filter((j) => j.date >= today && j.date <= iso(7) && j.status !== "cancelled").length,
      awaiting: db.quotes.filter((q) => q.status === "sent"),
      drafts: db.quotes.filter((q) => q.status === "draft").length,
      overdue: invs.filter((i) => i.state === "overdue"),
      outstanding: sum(invs, (i) => i.due),
      collected_month: sum(collected, (p) => p.amount),
      spent_month: sum(spent, (e) => e.amount),
      billed_month: sum(billed, (i) => i.subtotal),
    };
  }

  /* ------------------------------------------------------------- finance
     Six months of revenue against cost. Revenue is what was COLLECTED, not what was
     invoiced — an invoice nobody paid is not money, and a dashboard that counts it as
     money is how a business runs out of cash while the chart goes up. */
  if (path === "/api/finance") {
    needUser();
    const months = [];
    for (let back = 5; back >= 0; back--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - back);
      const key = d.toISOString().slice(0, 7);
      const rev = db.invoices.flatMap((i) => i.payments)
        .filter((p) => p.date.slice(0, 7) === key)
        .reduce((s, p) => s + fils(p.amount), 0);
      const cost = db.expenses.filter((e) => e.date.slice(0, 7) === key)
        .reduce((s, e) => s + fils(e.amount), 0);
      months.push({ key, label: d.toLocaleDateString("ar", { month: "short" }),
                    revenue: bhd(rev), cost: bhd(cost), profit: bhd(rev - cost) });
    }

    const byCat = EXPENSE_CATS.map((c) => ({
      code: c.code, ar: c.ar, en: c.en,
      total: bhd(db.expenses.filter((e) => e.cat === c.code)
                            .reduce((s, e) => s + fils(e.amount), 0)),
    })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

    const invs = db.invoices.map(withBalance);
    return {
      months, byCat,
      outstanding: bhd(invs.reduce((s, i) => s + fils(i.due), 0)),
      byClient: db.clients.map((c) => ({
        id: c.id, name: c.name,
        due: bhd(invs.filter((i) => i.customer_id === c.id)
                     .reduce((s, i) => s + fils(i.due), 0)),
      })).filter((c) => c.due > 0).sort((a, b) => b.due - a.due),
    };
  }

  fail(404, "غير موجود", "not found");
}

/** Throw the practice data away and start again. */
export function reset() {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to clear */ }
  memory = null;
}
