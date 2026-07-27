# Handoff

**Session:** 2026-07-28 · **Task:** launch plan for the Qobban website

Site is built and deployed. What follows is what stands between it and a real
launch, ordered by what blocks what. Numbers verified against the repo, not
recalled.

## Built and pushed

13 pages · 33/33 images · rate-limited lead API with validation and
sanitisation · CSP and security headers · SEO plumbing (canonical, OG, JSON-LD,
robots, sitemap) · cookieless analytics · light/dark · Arabic toggle · spatial
page transitions. Latest commit `52562cc`.

Full state: [../WEBSITE/Launch_Checklist.md](../WEBSITE/Launch_Checklist.md).

---

## 1 — Decide what the Projects page is claiming

**The largest open risk, and it is not technical.**

`projects.html` presents nine AI-generated images as completed Qobban projects
in named Bahraini locations — "Sliding Entrance Gate, Riffa", "Louvred Pergola,
Saar", "Balcony Railings, Diyar Al Muharraq". No such projects are documented.
Publishing that as a portfolio is a misrepresentation a client or competitor
could challenge, and it undercuts the written-specification positioning the
whole brand rests on.

Three honest ways out:

1. **Relabel as illustrative.** Drop the location captions, retitle the section
   "Capabilities" or "What we build". Fastest, keeps every image.
2. **Replace with real work.** Use actual project photos, even imperfect ones —
   a real gate beats a rendered one for credibility.
3. **Remove the section until real work exists.** Service pages already carry
   the imagery; the site stands up without a portfolio.

Generated imagery on service and process pages is fine — it illustrates a
capability rather than asserting a specific delivered job.

**Decide this before anything else. It changes page structure.**

## 2 — Real business facts

Nothing else can be finalised while these are placeholders.

| Placeholder | Count | Where |
|---|---|---|
| `973XXXXXXXX` | 30 | Phone + WhatsApp, every page |
| `https://qobban.com` | 23 | Canonicals and OG — currently point at a domain that may not resolve |
| `info@qobban.com` | 4 | Email |
| Bare Instagram / TikTok links | 4 | Footer, contact |
| `[CONFIRM]` markers | 18 | Address, hours, warranty terms, founding year, team size, service areas |

The `[CONFIRM]` items are business commitments, not copy. The site currently
promises free site measurement, a written specification naming coating system
and warranty period, and photographic handover. **Confirm Qobban will actually
do all three**, or change the copy. These claims are the differentiator — they
have to be true.

## 3 — Make the lead path real

The quote form validates and rate-limits correctly, but leads currently go to a
serverless log and nowhere else.

- Set Vercel env vars: `ALLOWED_ORIGIN`, `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_KEY`
- Decide the destination — email, WhatsApp Business, sheet or CRM
- **Fix the photo upload.** `quote.html:136` renders a file input that is never
  transmitted. Either wire storage or delete the field; right now it promises
  something it does not do
- Send a real submission end to end before launch

## 4 — Domain and deploy config

- Point the domain at Vercel
- Set `SITE` in `site/build.py`, re-run `python build.py`, commit
- Enable Vercel Web Analytics (one click)
- Export the favicon from the inline SVG mark at 32 / 180 / 512 px

## 5 — Test on real devices

Everything so far was verified in a preview pane capped at 799px. Never tested
on hardware.

- iPhone and Android: menu, quote flow, WhatsApp hand-off
- **Gyroscope tilt on the hero spirit level is completely untested** — it cannot
  be exercised without a real device
- Page transitions need a server; they do not run from `file://`
- Light mode and Arabic RTL on a real screen
- Lighthouse pass

## 6 — Arabic

The toggle works: RTL flips, fonts load, letter-spacing resets. The dictionary
covers navigation, CTAs, service names and form labels — **body copy is still
English**, so the page is currently half-translated.

Either commission a native rewrite (per
[../BRAND/Tone_of_Voice.md](../BRAND/Tone_of_Voice.md), Arabic is a rewrite not
a translation) or hide the toggle until it exists. Also note the translation is
client-side, so Arabic is not indexable — real `/ar/` pages are the answer if
Arabic SEO matters.

## 7 — Documentation

**172 of 199 markdown files are still `TBD` stubs.** The website is not blocked
by this, but the marketing and sales programme is.

Priority order: `MARKETING/` (TikTok strategy was agreed and never written) →
`SERVICES/` → `CUSTOMERS/` → `SALES/` → `PROCESS/` and `OPERATIONS/`.

## 8 — After launch

Google Business Profile (higher local impact in Bahrain than any on-page SEO
work) · submit sitemap to Search Console · privacy policy **before** any Meta or
TikTok pixel — a pixel also forces the cookie banner the site currently, and
correctly, does not need.

---

**Next action:** settle item 1, then collect the item 2 facts in one pass.
Everything after that is mechanical.
