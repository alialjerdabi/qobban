# Handoff

**Session:** 2026-07-29 · **Task:** WhatsApp wired, lead destination chosen

Everything below is verified against the working tree, not recalled. **The tree
is uncommitted** — 16 modified files plus two new ones. Review and commit before
starting anything else.

## Settled this session

**Projects page — no change, deliberately.** The nine captioned images stay as
they are. They are placeholders until the client supplies real project assets.
Item 1 of the old plan is closed; do not reopen it.

**Phone is done.** `97339949004` is live in 32 places across 13 pages — float
button, contact card, footer, `tel:` links, `data-whatsapp`, and a new
`telephone` field in the LocalBusiness JSON-LD ([../site/build.py](../site/build.py)).
No `973XXXXXXXX` remains. Verified end to end in a browser: submitting the quote
form produces a correct prefilled `wa.me` link, and the link resolves to
WhatsApp's normal share page rather than an invalid-number error.

**Unverified, and only the owner can close it:** that the number is actually
registered on WhatsApp. Open `https://wa.me/97339949004` on the business phone.

**Photo upload removed.** `quote.html` had a file input that transmitted
nothing. The whole step is gone; the form is now five steps, not six. Copy that
counted the steps was updated in `quote.html` (h1, meta description, progress
bar, step label), `contact.html`, and `js/ar.js` (three now-dead photo keys
deleted). Asset cache version bumped `v=14` → `v=15` site-wide.

Real file storage was rejected, not forgotten: the WhatsApp hand-off already
carries photos, and the hint text under the old field said so.

## Lead destination — decided, half built

Leads go to a **Google Sheet plus an email alert**, both from one Apps Script.
Rejected: a real CRM (no pipeline exists yet — an empty CRM is a login page),
WhatsApp Cloud API (the hand-off already delivers to that number; duplicating it
needs a second phone line and Meta app review), and AI triage (one person, zero
leads). Revisit HubSpot's free tier when two people work leads, or when
follow-up reminders are genuinely needed.

**This is live and verified end to end.** A real submission through
`qobban.vercel.app` reached the API, forwarded to Apps Script, appended a row
and delivered the email. The script is a standalone project ("leads
management") targeting the sheet by `SHEET_ID`, deployed as a web app with
access "Anyone"; `LEAD_WEBHOOK_URL` in Vercel carries the shared secret in the
query string because Apps Script strips the `Authorization` header —
`LEAD_WEBHOOK_KEY` is unused and must stay unset.

Source: [../api/lead-to-sheet.gs](../api/lead-to-sheet.gs). Not web-reachable —
`vercel.json` sets `outputDirectory: site`, so only `site/` is served. The
committed copy keeps `SECRET = 'CHANGE_ME'`; the real secret lives only in the
Apps Script editor and Vercel, and must never be committed.

Note when reading results: `/api/lead` returns `ok:true` even when the forward
fails, by design — a broken sheet must never cost a lead. The sheet, the email,
or Apps Script → Executions are the only honest confirmations.

## Still open

| Item | Count | Note |
|---|---|---|
| `https://qobban.com` | 23 | Canonicals and OG. Also `SITE` in `site/build.py` — set both together |
| `info@qobban.com` | 4 | |
| Bare Instagram / TikTok links | 4 | Footer and contact |
| `[CONFIRM]` markers | 16 | Address, hours, warranty terms, founding year, team size, service areas |

The `[CONFIRM]` items are commitments, not copy. The site promises free site
measurement, a written specification naming coating system and warranty period,
and photographic handover. Confirm Qobban will do all three, or change the copy.

Also open: **`ALLOWED_ORIGIN` unset** — now that leads reach a real sheet, any
site can POST to `/api/lead`; rate limiting is the only brake. Set it to the
production origin once the domain is pointed. Domain not pointed · Vercel
Analytics not enabled · favicon not exported from the inline SVG mark
(32 / 180 / 512 px).

**172 markdown files are still `TBD`.** Priority: `MARKETING/` (TikTok strategy
was agreed and never written) → `SERVICES/` → `CUSTOMERS/` → `SALES/` →
`PROCESS/` and `OPERATIONS/`.

## Never tested on hardware

Everything so far was verified in a preview pane. Untested on a real device:
menu, quote flow, WhatsApp hand-off, light mode, Arabic RTL, Lighthouse — and
**gyroscope tilt on the hero spirit level**, which cannot be exercised without
one. Page transitions need a server; they do not run from `file://`. A local
server config now exists at `.claude/launch.json` (`python -m http.server 8123`).

Step counter now builds its own Arabic with Arabic-Indic digits rather than
going through the dictionary, and redraws on a `qobban:lang` event — so it is
correct on every step, not just the first. Deliberately narrower than a full
repaint, which would pull focus off the language toggle.

---

**Next action:** delete the test rows from the sheet, then the domain — pointing
it, `SITE` in `site/build.py`, the 23 canonical/OG URLs and `ALLOWED_ORIGIN` are
one pass. Then the 16 `[CONFIRM]` facts.
