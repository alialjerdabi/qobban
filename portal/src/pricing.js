// Every amount in the system is an integer number of fils (1 BHD = 1000 fils).
// Nothing here uses floating point for money: the browser sends prices and options,
// the server computes every total. A line's own numbers always add up to the document
// total, to the fils — that is what the tests in test/pricing.test.mjs assert.

export const VAT_BP = 1000;            // 10%, Bahrain standard rate, in basis points
export const fils = (bhd) => Math.round((Number(bhd) || 0) * 1000);
export const bhd = (f) => (Number(f) || 0) / 1000;

// Quantities carry 3 decimals (2.5 m, 0.75 m²), prices do not.
const qtyOf = (v) => Math.max(0, Math.round((Number(v) || 0) * 1000) / 1000);

/**
 * The unit price of a materials + labour line, in fils.
 * Margin applies to the whole cost — materials and labour together — because that is
 * what "cost plus margin" means to the person quoting. The build-up is PER UNIT: enter
 * what one gate costs, then set qty.
 */
export function buildUpUnit({ material_fils = 0, hours = 0, labour_rate_fils = 0, margin_pct = 0 }) {
  const cost = Math.max(0, Math.round(material_fils)) +
               Math.max(0, Math.round(hours * labour_rate_fils));
  return Math.round(cost * (1 + Math.max(0, Number(margin_pct) || 0) / 100));
}

/** The unit price of a line, whatever its pricing mode. */
export function unitOf(line) {
  if (line.mode === "build_up") return buildUpUnit(line.build || {});
  if (line.mode === "fixed") return Math.max(0, Math.round(line.total_fils || 0));
  return Math.max(0, Math.round(line.unit_fils || 0));       // unit_rate
}

/**
 * The special discount: the customer pays a round final figure, VAT included.
 * Returns the EXTRA discount, before VAT, that makes net + VAT land exactly on `target`.
 * Never more than the lines are worth, and never a price rise.
 */
export function specialCut(net, linesNet, target, rate) {
  if (!target) return 0;
  let n = Math.round(target * 10000 / (10000 + rate));
  // Integer VAT rounding means the ideal net can be a fils either side; try all three
  // and take the one that hits the target exactly.
  for (const c of [n, n - 1, n + 1]) {
    if (c + Math.round(c * rate / 10000) === target) { n = c; break; }
  }
  return Math.min(linesNet, Math.max(0, net - n));
}

/**
 * Apportion `total` across `weights` so the parts sum to exactly `total`.
 * The last non-zero weight absorbs the rounding. Used for discounts, VAT, and
 * payment schedules — anywhere a whole must be split without losing a fils.
 */
export function splitExact(total, weights) {
  const sum = weights.reduce((a, w) => a + w, 0);
  if (!sum) return weights.map(() => 0);
  const parts = weights.map((w) => Math.round(total * w / sum));
  let last = -1;
  weights.forEach((w, i) => { if (w) last = i; });
  if (last >= 0) parts[last] = total - parts.reduce((a, p, i) => (i === last ? a : a + p), 0);
  return parts;
}

/**
 * Price a whole quote.
 *
 * input: {
 *   lines: [{ mode, description, qty, unit_fils? , total_fils?, build?, unit? }],
 *   delivery_fils, discount_pct, special_total_fils, vat (bool)
 * }
 * Returns document totals plus every line with its own discount, VAT and total, all in fils.
 */
export function priceQuote(input) {
  const rate = input.vat === false ? 0 : VAT_BP;

  const lines = (input.lines || []).map((l) => {
    const unit = unitOf(l);
    // A fixed-price line is one agreed amount: quantity would make it ambiguous.
    const qty = l.mode === "fixed" ? 1 : (qtyOf(l.qty) || 1);
    return {
      mode: l.mode || "unit_rate",
      description: String(l.description || "").slice(0, 255) || "بند",
      unit_label: l.unit || null,
      qty,
      unit_fils: unit,
      net_fils: Math.round(unit * qty),
      build: l.mode === "build_up" ? (l.build || null) : null,   // internal only — never printed
    };
  });

  const linesNet = lines.reduce((a, l) => a + l.net_fils, 0);
  const pct = Math.round(linesNet * Math.min(100, Math.max(0, Number(input.discount_pct) || 0)) / 100);
  const delivery = Math.max(0, Math.round(input.delivery_fils || 0));

  // The percentage discount applies to the lines, not to delivery.
  const special = specialCut(linesNet - pct + delivery, linesNet - pct,
                             Math.max(0, Math.round(input.special_total_fils || 0)), rate);
  const discount = pct + special;

  // Spread the discount across the lines by value, exactly.
  const shares = splitExact(discount, lines.map((l) => l.net_fils));
  lines.forEach((l, i) => { l.discount_fils = shares[i]; });

  const all = lines.slice();
  if (delivery) {
    all.push({ mode: "fixed", description: "التوصيل والتركيب", unit_label: null, qty: 1,
               unit_fils: delivery, net_fils: delivery, discount_fils: 0, build: null });
  }

  const net = all.reduce((a, l) => a + l.net_fils - l.discount_fils, 0);
  const vat = Math.round(net * rate / 10000);
  const vatShares = splitExact(vat, all.map((l) => l.net_fils - l.discount_fils));
  all.forEach((l, i) => {
    l.vat_rate_bp = rate;
    l.vat_fils = vatShares[i];
    l.total_fils = l.net_fils - l.discount_fils + l.vat_fils;
  });

  return {
    lines: all,
    subtotal_fils: linesNet + delivery,
    discount_fils: discount,
    special_fils: special,
    net_fils: net,
    vat_fils: vat,
    total_fils: net + vat,
  };
}

/**
 * A job's payment schedule. Parts are percentages that must describe the whole job;
 * the amounts are apportioned so they sum to exactly the job total.
 */
export function schedule(total_fils, parts) {
  const pct = parts.map((p) => Math.max(0, Number(p.percent) || 0));
  const sum = pct.reduce((a, p) => a + p, 0);
  if (Math.abs(sum - 100) > 0.001) {
    throw new Error(`payment schedule must total 100%, got ${sum}`);
  }
  const amounts = splitExact(Math.max(0, Math.round(total_fils)), pct);
  return parts.map((p, i) => ({ ...p, percent: pct[i], amount_fils: amounts[i] }));
}
