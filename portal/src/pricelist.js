// The price list a quote picks from. Only the owner sees cost, because cost is margin.
import { route, HttpError, need } from "./router.js";
import { q } from "./db.js";
import { audit, seesMoney } from "./auth.js";
import { fils, bhd } from "./pricing.js";

const UNITS = ["piece", "m", "m2", "kg", "hour", "set", "job"];
const KINDS = ["material", "labour", "unit_rate", "product"];

const shape = (r, withCost) => ({
  id: r.id, code: r.code, name_en: r.name_en, name_ar: r.name_ar,
  kind: r.kind, category: r.category, unit: r.unit,
  rate: bhd(r.rate_fils), active: !!r.active,
  ...(withCost ? { cost: r.cost_fils == null ? null : bhd(r.cost_fils) } : {}),
});

route("GET", "/api/pricelist", async ({ user, url }) => {
  need(user);
  const kind = url.searchParams.get("kind");
  const rows = kind
    ? await q("SELECT * FROM price_list WHERE active = 1 AND kind = ? ORDER BY category, name_en", [kind])
    : await q("SELECT * FROM price_list WHERE active = 1 ORDER BY category, name_en");
  // A sales user must never receive cost over the wire — not hidden in the browser,
  // simply not sent.
  return { items: rows.map((r) => shape(r, seesMoney(user))) };
});

route("POST", "/api/pricelist", async ({ user, data }) => {
  need(user, "owner");
  if (!KINDS.includes(data.kind)) throw new HttpError(400, "unknown kind");
  if (!UNITS.includes(data.unit)) throw new HttpError(400, "unknown unit");
  const name = String(data.name_en || "").trim().slice(0, 160);
  if (!name) throw new HttpError(400, "a name is required");

  const r = await q(
    `INSERT INTO price_list (code, name_en, name_ar, kind, category, unit, rate_fils, cost_fils)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [String(data.code || "").trim().slice(0, 40) || null, name,
     String(data.name_ar || "").trim().slice(0, 160) || null, data.kind,
     String(data.category || "").trim().slice(0, 60) || null, data.unit,
     fils(data.rate), data.cost == null || data.cost === "" ? null : fils(data.cost)]);
  await audit(user.id, "create", "price_list", r.insertId, { name });
  return { id: r.insertId };
});

route("PUT", "/api/pricelist/:id", async ({ user, params, data }) => {
  need(user, "owner");
  const [row] = await q("SELECT id FROM price_list WHERE id = ?", [params.id]);
  if (!row) throw new HttpError(404, "not found");
  await q(`UPDATE price_list SET name_en=?, name_ar=?, category=?, unit=?, rate_fils=?,
           cost_fils=?, active=? WHERE id=?`,
    [String(data.name_en || "").trim().slice(0, 160),
     String(data.name_ar || "").trim().slice(0, 160) || null,
     String(data.category || "").trim().slice(0, 60) || null,
     UNITS.includes(data.unit) ? data.unit : "piece",
     fils(data.rate), data.cost == null || data.cost === "" ? null : fils(data.cost),
     data.active === false ? 0 : 1, params.id]);
  await audit(user.id, "update", "price_list", params.id);
  return { ok: true };
});
