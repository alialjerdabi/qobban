# Handoff

**Session:** 2026-08-09 · **Task:** MARKETING assets triaged and pushed, CORS
origin allowlist

Everything below is verified against the working tree, not recalled.

## Settled this session

**The repository is pushed and clean.** `main` and `origin/main` are level at
`f96344a`. The five new `MARKETING/` folders held 319 files and **545 MB**, of
which 267 were PNG renders. Only the 42 text and tooling files are committed —
the scripts, prompt manifests and specs that produce the renders. The renders
themselves are gitignored and remain on disk; they are regenerable from the
tooling beside them. Rules are at the bottom of [../.gitignore](../.gitignore),
including three SVGs that are raster-embedded and binary in practice.

**`ALLOWED_ORIGIN` is now a comma-separated list**, not a single value
([../api/lead.mjs](../api/lead.mjs), `originRejected`). Set it to one origin and
pointing the custom domain would have silently 403'd every lead at cutover.
Unset still allows any origin; a request with no `Origin` header is always
allowed, because curl and server-side posts never send one and CORS was never a
boundary against them. Covered by five assertions in
[../api/lead.test.mjs](../api/lead.test.mjs) — `node api/lead.test.mjs` passes.

**Set in the Vercel dashboard (owner action, not done):**
`ALLOWED_ORIGIN = https://qobban.vercel.app,https://qobban.store`. Both, now.
Until it is set the endpoint accepts POSTs from any site and per-instance IP
rate limiting is the only brake.

**The domain is `qobban.store`, not `qobban.com`.** `SITE` in
[../site/build.py](../site/build.py) is set to `https://qobban.store` and
`python site/build.py` has been re-run — 13/13 pages, so every canonical,
`og:url`, `og:image`, JSON-LD `url`, `sitemap.xml` and `robots.txt` now matches.
`SITE` is the only place the domain is written; never hand-edit the pages.

**DNS is still not configured.** Nothing resolves at `qobban.store` yet, so the
site currently declares a canonical hostname that does not exist and is
effectively unindexable. Left that way deliberately, on the owner's call that
the domain lands within days. If it slips to weeks, switch `SITE` to
`https://qobban.vercel.app`, re-run the build, and redirect later — the
alternative is weeks of not being indexed at all.

**Qobban does not own `qobban.com`.** The owner initially gave the business
email as `info@qobban.com`, then confirmed only `qobban.store` is registered —
so that address would have bounced every email lead silently. Both occurrences
are now `info@qobban.store` (`index.html:428`, `contact.html:84`). **The mailbox
does not exist yet**; it needs creating with MX on `qobban.store` before launch,
or the address bounces just the same. Reverse this only if `qobban.com` is
actually acquired.

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

Counts below are grepped against `site/` on 2026-08-09 and supersede the earlier
figures, which counted matches in the documentation folders too.

| Item | Count | Where |
|---|---|---|
| `[CONFIRM]` **visible to visitors** | 2 | `contact.html:150–151` — address and hours |
| Bare Instagram / TikTok links | 4 | `index.html:430–431`, `contact.html:93–94` |
| `info@qobban.store` mailbox | — | Address is in the pages; the mailbox itself does not exist yet |
| `qobban.store` DNS | — | Not configured. `SITE` and all 45 generated URLs already point at it |

**`[CONFIRM]` is shipping to users.** The live contact page renders the literal
string "[CONFIRM] Workshop address, Kingdom of Bahrain" and "[CONFIRM]
Saturday–Thursday, working hours". This is the most urgent open item on the
site and needs only two facts from the owner: the workshop address and the
opening hours.

Separately, and unmarked in the copy, the site makes three commitments on
Qobban's behalf: free site measurement, a written specification naming coating
system and warranty period, and photographic handover. Confirm Qobban will do
all three, or change the copy. Founding year, team size and service areas are
likewise asserted without a marker — they were never `[CONFIRM]`-tagged, so
grepping for the marker will not find them.

Also open: **`ALLOWED_ORIGIN` still unset in Vercel** — the code now accepts a
list, but until the variable exists any site can POST to `/api/lead`. Vercel
Analytics not enabled · favicon not exported (32 / 180 / 512 px); the source
mark is now committed at
[../MARKETING/BRAND/LOGO/qobban-icon.svg](../MARKETING/BRAND/LOGO/qobban-icon.svg).

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

**Next action:** replace the two `[CONFIRM]` strings on `contact.html` with the
real workshop address and hours — they are visible to visitors right now and
need nothing but the two facts. Owner actions in parallel: set `ALLOWED_ORIGIN`
in Vercel to `https://qobban.vercel.app,https://qobban.store`, configure DNS for
`qobban.store`, and create the `info@qobban.store` mailbox. `SITE` is already
correct, so the domain needs no further code change. Then the favicon export,
then the `TBD` backlog starting with `MARKETING/`.
