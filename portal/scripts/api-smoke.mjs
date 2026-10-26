// End-to-end check of Phase 1 against a running server and the practice database.
//   node scripts/api-smoke.mjs            (expects the server on PORT or 3100)
// Exits non-zero on the first failure. Everything it creates is prefixed [SMOKE].
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE || `http://127.0.0.1:${process.env.PORT || 3100}`;
const seed = JSON.parse(readFileSync(new URL("../seed-users.json", import.meta.url), "utf8"));
const owner = seed.users.find((u) => !u.placeholder && u.pin);

let cookie = "";
let passed = 0;

async function call(method, path, body, expect = 200) {
  const r = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = r.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  assert.equal(r.status, expect, `${method} ${path} -> ${r.status} ${text.slice(0, 200)}`);
  return json;
}

const ok = (name) => { passed++; console.log(`  ok   ${name}`); };

// ---------------------------------------------------------------- auth
assert.ok(owner, "seed-users.json needs at least one real owner with a PIN");

await call("GET", "/api/me", undefined, 401);
ok("the API refuses an anonymous caller");

await call("POST", "/api/login", { phone: owner.phone, pin: "0000" }, 401);
ok("a wrong PIN is rejected");

await call("POST", "/api/login", { phone: owner.phone, pin: owner.pin });
const me = await call("GET", "/api/me");
assert.ok(me.user.roles.includes("owner"), "owner role missing");
assert.equal(me.company.cr_no, "60181-8");
ok(`logged in as ${me.user.name_en}, company CR ${me.company.cr_no}`);

// ---------------------------------------------------------------- price list
const pl = await call("GET", "/api/pricelist");
assert.ok(pl.items.length >= 20, `price list looks short: ${pl.items.length}`);
assert.ok(pl.items.some((i) => i.cost != null), "owner should receive cost");
ok(`price list has ${pl.items.length} items, with cost visible to the owner`);

// ---------------------------------------------------------------- clients
const stamp = Date.now().toString().slice(-7);
const made = await call("POST", "/api/clients", {
  name: "[SMOKE] Test Client", kind: "company", phone: `3${stamp}`,
  company_name: "Smoke W.L.L.", vat_no: "220000000000099", area: "Riffa",
});
ok(`created client #${made.id}`);

await call("POST", "/api/clients", { name: "[SMOKE] Duplicate", phone: `3${stamp}` }, 409);
ok("a second client on the same phone is refused");

await call("POST", "/api/clients", { name: "[SMOKE] No phone", phone: "" }, 400);
ok("a client with no phone is refused");

// ---------------------------------------------------------------- quote maths over the wire
const draftBody = {
  customer_id: made.id,
  subject: "[SMOKE] Gate and railing",
  lang: "ar",
  vat: true,
  delivery: 30,
  terms: ["payment", "warranty"],
  lines: [
    { mode: "build_up", description: "Sliding gate 4.2 m", qty: 1,
      build: { material: 420, hours: 16, labour_rate: 10, margin_pct: 20 } },
    { mode: "unit_rate", description: "Railing", qty: 12.5, unit: "m", rate: 18.5 },
    { mode: "fixed", description: "Site survey", total: 25 },
  ],
};

const prev = await call("POST", "/api/quote-preview", draftBody);
// 420 + 16x10 = 580, +20% = 696 ; 12.5 x 18.5 = 231.25 ; 25 ; delivery 30
const expectedNet = 696 + 231.25 + 25 + 30;
assert.equal(prev.subtotal, expectedNet, "subtotal");
assert.equal(prev.vat, Math.round(expectedNet * 0.10 * 1000) / 1000, "VAT");
assert.equal(prev.total, Math.round(expectedNet * 1.10 * 1000) / 1000, "total");
const lineSum = prev.lines.reduce((a, l) => a + l.total, 0);
assert.ok(Math.abs(lineSum - prev.total) < 0.0005, `lines ${lineSum} != total ${prev.total}`);
ok(`preview priced on the server: ${prev.total} BHD, lines reconcile`);

const q1 = await call("POST", "/api/quotes", draftBody);
ok(`saved quote #${q1.id} at ${q1.total} BHD`);

const got = await call("GET", `/api/quotes/${q1.id}`);
assert.equal(got.quote.status, "draft");
assert.equal(got.quote.terms.length, 2, "two terms were ticked");
const buildLine = got.quote.lines.find((l) => l.mode === "build_up");
assert.ok(buildLine.build, "the owner must see the build-up");
assert.equal(buildLine.build.material, 420);
ok("the owner sees the materials and labour behind the line");

// ---------------------------------------------------------------- versioning
await call("PUT", `/api/quotes/${q1.id}`, { ...draftBody, subject: "[SMOKE] edited draft" });
const stillV1 = await call("GET", `/api/quotes/${q1.id}`);
assert.equal(stillV1.quote.version, 1, "editing a draft must not make a version");
ok("a draft is edited in place");

const sent = await call("POST", `/api/quotes/${q1.id}/send`, {});
assert.match(sent.token, /^[a-f0-9]{32}$/);
ok(`sent as ${sent.no}, customer link token issued`);

const v2 = await call("PUT", `/api/quotes/${q1.id}`, { ...draftBody, delivery: 45 });
assert.equal(v2.version, 2, "editing a sent quote must make v2");
const original = await call("GET", `/api/quotes/${q1.id}`);
assert.equal(original.quote.status, "sent");
assert.equal(original.quote.delivery, 30, "the sent quote must not have changed");
ok("editing a sent quote creates v2 and leaves the original untouched");

// ---------------------------------------------------------------- the customer's link
const pub = await fetch(`${BASE}/q/${sent.token}`);
const html = await pub.text();
assert.equal(pub.status, 200);
assert.ok(html.includes("60181-8"), "CR must be printed");
assert.ok(html.includes("12.5"), "the railing quantity must be shown");
// The whole point of line_build_up: none of it may reach the customer. Check the
// actual values from the build-up, formatted the way the page formats money.
// Strip CSS and script first: "margin" is a CSS property, not a leak.
const visible = html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
const leaks = {
  "material cost": "420.000",
  "labour rate": "10.000",
  "hours": ">16<",
  "the word margin": "margin",
  "the word material": "material",
  "a build object": '"build"',
};
for (const [what, needle] of Object.entries(leaks)) {
  assert.ok(!visible.toLowerCase().includes(needle.toLowerCase()),
    `customer page leaks ${what} (found "${needle}")`);
}
// and prove the test can fail: the line total the customer IS meant to see is there
assert.ok(html.includes("696.000"), "the gate line total should be shown");
ok("the customer page shows totals and leaks no cost, hours or margin");

const accept = await fetch(`${BASE}/api/public/accept/${sent.token}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Smoke Customer" }),
});
assert.equal(accept.status, 200);
const afterAccept = await call("GET", `/api/quotes/${q1.id}`);
assert.equal(afterAccept.quote.status, "accepted");
assert.equal(afterAccept.quote.accepted_name, "Smoke Customer");
ok("the customer accepted, and it is recorded against the quote");

await call("PUT", `/api/quotes/${q1.id}`, draftBody, 409);
ok("an accepted quote can no longer be edited");

// ---------------------------------------------------------------- cancelling
const q2 = await call("POST", "/api/quotes", { ...draftBody, subject: "[SMOKE] to cancel" });
await call("POST", `/api/quotes/${q2.id}/cancel`, {}, 400);
ok("cancelling without a reason is refused");
await call("POST", `/api/quotes/${q2.id}/cancel`, { reason: "customer went elsewhere" });
const cancelled = await call("GET", `/api/quotes/${q2.id}`);
assert.equal(cancelled.quote.status, "cancelled");
assert.equal(cancelled.quote.cancel_reason, "customer went elsewhere");
ok("cancelled with a reason, and the document still exists");

// ---------------------------------------------------------------- numbering
const a = await call("POST", "/api/quotes", { ...draftBody, subject: "[SMOKE] n1" });
const b = await call("POST", "/api/quotes", { ...draftBody, subject: "[SMOKE] n2" });
const [qa, qb] = [await call("GET", `/api/quotes/${a.id}`), await call("GET", `/api/quotes/${b.id}`)];
assert.notEqual(qa.quote.doc_no, qb.quote.doc_no, "two quotes must not share a number");
ok(`numbers run on: ${qa.quote.no} then ${qb.quote.no}`);

console.log(`\n  ${passed} checks passed\n`);
