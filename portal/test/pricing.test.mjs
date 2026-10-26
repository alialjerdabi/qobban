// The money invariants. If any of these fail, a customer gets a wrong number.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { priceQuote, buildUpUnit, specialCut, splitExact, schedule, fils, VAT_BP } from "../src/pricing.js";

const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);

// ---------------------------------------------------------------- build-up
test("build-up: material + hours x rate, then margin on the whole cost", () => {
  // 100 BHD material + 8h x 10 BHD = 180 cost, +20% = 216
  assert.equal(buildUpUnit({ material_fils: fils(100), hours: 8, labour_rate_fils: fils(10), margin_pct: 20 }),
    fils(216));
});

test("build-up: zero margin is cost, and negative margin is treated as zero", () => {
  const cost = { material_fils: fils(50), hours: 2, labour_rate_fils: fils(10) };
  assert.equal(buildUpUnit({ ...cost, margin_pct: 0 }), fils(70));
  assert.equal(buildUpUnit({ ...cost, margin_pct: -30 }), fils(70));
});

// ---------------------------------------------------------------- splitExact
test("splitExact: parts always sum to the whole, however awkward the division", () => {
  for (const total of [1, 7, 100, 1000, 33_333, 999_999]) {
    for (const weights of [[1, 1, 1], [1, 2, 7], [5, 0, 5], [1], [3, 3, 3, 3, 3, 3, 3]]) {
      const parts = splitExact(total, weights);
      assert.equal(parts.reduce((a, b) => a + b, 0), total,
        `total ${total} weights ${weights} -> ${parts}`);
    }
  }
});

test("splitExact: all-zero weights give all zeros rather than dividing by zero", () => {
  assert.deepEqual(splitExact(500, [0, 0]), [0, 0]);
});

// ---------------------------------------------------------------- the three line types together
test("a quote mixing all three pricing modes adds up exactly", () => {
  const p = priceQuote({
    vat: true,
    lines: [
      { mode: "build_up", description: "Sliding gate", qty: 1,
        build: { material_fils: fils(420), hours: 16, labour_rate_fils: fils(10), margin_pct: 20 } },
      { mode: "unit_rate", description: "Railing", qty: 12.5, unit: "m", unit_fils: fils(18.5) },
      { mode: "fixed", description: "Site survey", total_fils: fils(25) },
    ],
    delivery_fils: fils(30),
  });

  // every line's own arithmetic
  for (const l of p.lines) {
    assert.equal(l.total_fils, l.net_fils - l.discount_fils + l.vat_fils, `line "${l.description}"`);
  }
  // and the document's
  assert.equal(sum(p.lines, (l) => l.vat_fils), p.vat_fils, "line VAT must sum to document VAT");
  assert.equal(sum(p.lines, (l) => l.discount_fils), p.discount_fils, "line discounts must sum");
  assert.equal(sum(p.lines, (l) => l.total_fils), p.total_fils, "line totals must sum to the total");
  assert.equal(p.total_fils, p.net_fils + p.vat_fils);

  // fractional quantity is not silently truncated: 12.5 m x 18.500 = 231.250
  const railing = p.lines.find((l) => l.description === "Railing");
  assert.equal(railing.net_fils, fils(231.25));
});

test("VAT off produces no VAT anywhere, and the total is the net", () => {
  const p = priceQuote({ vat: false, lines: [{ mode: "fixed", description: "x", total_fils: fils(100) }] });
  assert.equal(p.vat_fils, 0);
  assert.equal(p.total_fils, fils(100));
  assert.ok(p.lines.every((l) => l.vat_fils === 0 && l.vat_rate_bp === 0));
});

// ---------------------------------------------------------------- discounts
test("percentage discount applies to lines but not to delivery", () => {
  const p = priceQuote({
    vat: false, discount_pct: 10, delivery_fils: fils(100),
    lines: [{ mode: "fixed", description: "x", total_fils: fils(1000) }],
  });
  assert.equal(p.discount_fils, fils(100));        // 10% of 1000, not of 1100
  assert.equal(p.total_fils, fils(1000) - fils(100) + fils(100));
});

test("the special discount lands on the typed figure to the fils, VAT included", () => {
  for (const target of [100, 250, 499.5, 1000, 1234.567]) {
    const p = priceQuote({
      vat: true, special_total_fils: fils(target),
      lines: [{ mode: "fixed", description: "x", total_fils: fils(1500) }],
    });
    assert.equal(p.total_fils, fils(target), `target ${target}`);
    assert.equal(sum(p.lines, (l) => l.total_fils), fils(target));
  }
});

test("the special discount never raises the price and never exceeds the lines", () => {
  const up = priceQuote({ vat: true, special_total_fils: fils(9999),
    lines: [{ mode: "fixed", description: "x", total_fils: fils(100) }] });
  assert.ok(up.total_fils <= fils(110), "asking for more than the quote must not inflate it");

  const down = priceQuote({ vat: true, special_total_fils: 1,
    lines: [{ mode: "fixed", description: "x", total_fils: fils(100) }] });
  assert.ok(down.discount_fils <= fils(100), "discount cannot exceed what the lines are worth");
  assert.ok(down.total_fils >= 0);
});

test("specialCut on its own: no target means no extra discount", () => {
  assert.equal(specialCut(1000, 1000, 0, VAT_BP), 0);
});

// ---------------------------------------------------------------- rounding stress
test("awkward amounts still reconcile across many random quotes", () => {
  let worst = null;
  for (let i = 0; i < 400; i++) {
    const n = 1 + (i % 5);
    const lines = Array.from({ length: n }, (_, k) => ({
      mode: "unit_rate", description: `l${k}`,
      qty: ((i * 7 + k * 13) % 97) / 7 + 0.001,
      unit_fils: ((i * 31 + k * 17) % 9999) + 1,
    }));
    const p = priceQuote({ vat: i % 3 !== 0, lines, discount_pct: (i % 23),
                           delivery_fils: (i % 7) * 1234 });
    const ok = sum(p.lines, (l) => l.total_fils) === p.total_fils &&
               sum(p.lines, (l) => l.vat_fils) === p.vat_fils &&
               sum(p.lines, (l) => l.discount_fils) === p.discount_fils;
    if (!ok) { worst = { i, p }; break; }
  }
  assert.equal(worst, null, `quote ${worst?.i} did not reconcile`);
});

// ---------------------------------------------------------------- payment schedule
test("payment schedule parts sum to exactly the job total", () => {
  for (const total of [fils(1000), fils(333.333), 1, 7777]) {
    const parts = schedule(total, [{ percent: 50 }, { percent: 40 }, { percent: 10 }]);
    assert.equal(sum(parts, (p) => p.amount_fils), total, `total ${total}`);
    assert.ok(parts.every((p) => p.amount_fils >= 0));
  }
});

test("a payment schedule that does not total 100% is refused", () => {
  assert.throws(() => schedule(fils(100), [{ percent: 50 }, { percent: 40 }]), /100%/);
  assert.throws(() => schedule(fils(100), [{ percent: 60 }, { percent: 60 }]), /100%/);
});

test("thirds split without losing a fils", () => {
  const parts = schedule(fils(100), [{ percent: 100 / 3 }, { percent: 100 / 3 }, { percent: 100 / 3 }]);
  assert.equal(sum(parts, (p) => p.amount_fils), fils(100));
});
