# Handoff

**Session:** 2026-08-09 · **Task:** MARKETING assets pushed, domain live,
production launch audit

Everything below is verified against the working tree and the live site, not
recalled.

## The domain is live

`qobban.store` is pointed and serving. Verified over HTTP, not assumed:

| Entry point | Result |
|---|---|
| `http://qobban.store` | 308 → `https://qobban.store` |
| `https://qobban.store` | 308 → `https://www.qobban.store` |
| `http://www.qobban.store` | 308 → `https://www.qobban.store` |
| `https://www.qobban.store` | **200** — canonical host |

Two hops maximum, no loop, valid certificate, HSTS with `includeSubDomains;
preload` on the canonical host. Namecheap keeps the mail records: `MX` to
`privateemail.com` and `v=spf1 include:spf.privateemail.com ~all` were read and
left untouched.

**`www` is canonical, so `SITE` is `https://www.qobban.store`.** Before this
session every canonical and OG URL named the apex, which 308-redirects — each
one pointed at a redirect rather than the page. Never hand-edit those URLs;
`SITE` in [../site/build.py](../site/build.py) generates all of them.

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

**`ALLOWED_ORIGIN` is still unset, and this was confirmed against production,
not assumed.** A `POST /api/lead` carrying `Origin: https://evil.example`
reached field validation instead of being rejected — so any site can post to the
endpoint today. Set in the Vercel dashboard, Production scope:
`ALLOWED_ORIGIN = https://qobban.vercel.app,https://www.qobban.store`
— the canonical host is `www`, so a value without it rejects every real lead.

**Qobban does not own `qobban.com`.** The owner initially gave the business
email as `info@qobban.com`, then confirmed only `qobban.store` is registered —
so that address would have bounced every email lead silently. Both occurrences
are now `info@qobban.store` (`index.html:428`, `contact.html:84`). **The mailbox
does not exist yet**; it needs creating with MX on `qobban.store` before launch,
or the address bounces just the same. Reverse this only if `qobban.com` is
actually acquired.

## Production launch audit

Fixed, all through `SITE` and one build re-run except where noted:

- **Canonical host** — every canonical, `og:url`, `og:image`, JSON-LD `url`,
  `sitemap.xml` and `robots.txt` moved from the apex to `www`.
- **Favicon** — there was none on any page and `/favicon.ico` 404'd. Added
  [../site/favicon.svg](../site/favicon.svg), a square charcoal tile of the
  header mark with thickened strokes, wired into every page from `build.py`.
  SVG only, deliberately: declaring `rel="icon"` also stops the implicit
  `/favicon.ico` request. No PNG set — no rasteriser is installed, and the only
  thing it would add is an iOS home-screen icon.
- **Light-mode contrast, a real AA failure.** `contact.html` had five inline
  `color:var(--yellow)` links — phone, email, Instagram, TikTok, quote form.
  The design system already defines `--accent-text` (`#8A5D00` on light)
  precisely because yellow fails there; these bypassed it. Yellow on the light
  surface measures **1.46:1** against a 4.5:1 floor. Now `var(--accent-text)`,
  which measures 5.1:1. Two matching cases in `js/qobban.js` fixed too, so
  `qobban.js` alone bumped to `?v=19`; the CSS is unchanged and stays `v=18`.
- **404 page** — Vercel was serving a bare 79-byte `text/plain`. Added
  [../site/404.html](../site/404.html), branded and with routes back. It is in
  `build.py`'s `NOINDEX` set, so it gets `noindex`, no canonical and no sitemap
  entry.
- **Instagram** — `https://instagram.com/` on two pages went to Instagram's
  homepage. Now `instagram.com/qobban.bh`.
- `og:image:width` / `:height` added so WhatsApp renders the preview without
  fetching the image first.
- **Instagram is `qobban_bh`** — underscore, not a dot. An earlier pass used
  `qobban.bh`; both pages are corrected.

## Products page — direct selling

[../site/products.html](../site/products.html) sells ready-made items at a fixed
price, as opposed to the quoted custom work under Services. **A real checkout was
considered and rejected for now**: payment means a gateway account tied to the
CR, order records, stock, returns and 10% VAT invoicing — a system, not a page —
on a static site with one serverless function. WhatsApp already converts and the
lead pipeline already works, so v1 uses those. Revisit real checkout when order
volume actually justifies the overhead.

**Structure is a hub plus four category pages.** `products.html` is a directory
of categories; each category lives at `products/<slug>.html` and holds its own
grid, its own order form and its own structured data. Four categories at 5–12
products each is 20–48 items, too many for one page.

**`CATEGORIES` and `PRODUCTS` in [../site/build.py](../site/build.py) are the
single source.** They generate the category cards, the product cards, each order
form and all `Product`/`Offer` structured data, so no page can drift from the
price list. Add a product there and re-run — never hand-edit a generated block.
Which products appear on a page follows from the page's own path, so a category
page needs no configuration beyond its filename matching a `CATEGORIES` slug.

> **The four slugs are placeholders** — `category-one` … `category-four`,
> awaiting real names. They are in `NOINDEX`, so Google never sees them and they
> stay out of the sitemap. Renaming means editing `CATEGORIES` **and** renaming
> the matching file in `site/products/`. Do it before launch: renaming now is
> free, renaming after indexing costs redirects.

**The landing page is laid out like a shop**, following two reference stores the
owner supplied: a horizontal category rail, then a promotion band, then the
product grid — not a directory of category cards, which the rail replaced.

- **Category rail** (`.chips`) — plain `overflow-x` with `scroll-snap`, no
  carousel and no JavaScript, so it keeps working with a keyboard because the
  chips are just links. It bleeds to `--gutter` so it reads as scrollable rather
  than clipped. Appears on the hub (with **All** current) and on every category
  page (with that category current). 44px tall, the touch-target minimum.
- **Sale band** (`SALE` in build.py) — a **16:9 media card**: clips fill it,
  the copy sits over them. Set `"active": False` to take it down without
  deleting the copy. Copy is deliberately three things — an eyebrow that says
  this is an offer, a headline, one button — because anything longer stops
  being readable over moving video. Headline and eyebrow are **placeholders**.
  Drops to 4:3 under 560px, where 16:9 leaves only ~190px of height; and
  `aspect-ratio` yields to content, so the card grows rather than clipping.
  Text is forced white in both themes: it sits on a dark scrim, and following
  the theme tokens would put dark type on dark video in light mode.

  Clips listed in `SALE["videos"]` **play one after another**, not together —
  so the markup omits `loop` (with `loop` set, `ended` never fires and the
  rotation cannot advance); `loop` returns automatically if there is only one
  clip. The rotator is in `qobban.js` under `[data-sale-rotator]`. The first
  poster is a CSS background on the container, **not** only the video's
  `poster` attribute, because reduced motion hides the video and the attribute
  would vanish with it.

  It also re-plays on `visibilitychange`: browsers pause media in a hidden tab,
  and a paused clip never fires `ended`, so without that the rotation died the
  first time someone switched tabs and came back to a frozen frame.
- **On-sale pricing** — a product with an optional `was` price renders a
  strikethrough, a "Save N%" line and an "On offer" flag, and sorts to the front
  of the grid. The old price is `aria-hidden` so a screen reader does not read
  two numbers in a row, and the percentage sits in its own element so **Save**
  is a whole text node the Arabic dictionary can match; `Save 25%` never could.
  No product carries `was` yet — the path was proven by temporarily marking the
  seed product down to 33 from 44, asserting the markup, and reverting.

**The product card was cut down for scanning.** It was ~840px tall on a phone,
roughly one card per screen: image, uppercase name, price, a four-line blurb, a
four-item bullet list and two full-width buttons. It is now **499px** — image,
clamped two-line name, price, one truncated line joining the first three specs,
one primary button and a quiet text link for the form. The blurb still reaches
Google through the Product structured data; it just is not on the card.

The grid uses `repeat(auto-fill, …)`, not `auto-fit`: `auto-fit` collapses empty
tracks, which stretched a lone product card to 1137px across a desktop row.

Layout traps worth remembering, all found by measuring rather than reading:

- A `@media` override must sit **after** any earlier block setting the same
  property on the same selector. One `max-width: 479px` rule sat before an
  `860px` block and was silently dead CSS that read as correct.
- A grid track sized `auto` around a percentage-width grid is circular; it once
  crushed the band's copy column to **0px**. Both are moot now that the band is
  a single overlay card, but the pattern will recur.

**Video state cannot be judged in the preview pane.** It reports
`document.visibilityState: "hidden"`, and browsers suspend media in a hidden
document — a clip logs `play → playing → pause` immediately and sits at
`currentTime` 0, and even a bare probe video throws `AbortError`. The
sequencing was verified instead by dispatching `ended` directly and asserting
the active clip walks `0 → 1 → 0 → 1 → 0` with exactly one active. Actual
playback still needs a real device.

**Encode clips at the size they are displayed.** These render 218px wide at
most, but were first encoded at 1280 — three times more pixels than the layout
can show. Re-encoded to 720 wide at CRF 30, the products page went from
**3.13 MB to 1.17 MB** with no visible difference. Same rule as the hero:
`-an` for silence by construction, `+faststart`, and a poster.

An empty category is handled deliberately: the grid shows a "being photographed
and priced" line, and the whole order section is **replaced** with a WhatsApp and
contact CTA rather than rendering a `required` `<select>` with no options, which
would be a form nobody could submit. Because that swap is destructive, the order
section is generated rather than stored in the page — one source for all four
category forms.

Each product carries `slug`, `name`, `price` (whole BHD, `None` renders "Price on
request"), `blurb`, `specs` and `image`. An empty `image` renders a hatched
"Photograph to follow" panel, so an item can be listed and ordered before it has
been photographed. Seeded with the one product with a confirmed price:
**Decorative Metal Stands, BD 33**, taken from the offer artwork in
`MARKETING/product-posts/`. The owner is supplying the rest.

Two order paths, both verified:

- **WhatsApp** — per-product button, `wa.me` text URL-encoded at build time so
  the em-dash survives. Opens with the item and price pre-written.
- **The form** — reuses the existing `data-lead-form` handler, so it POSTs to
  `/api/lead` and lands in the same sheet with no new JavaScript. The product
  goes in `Message` and the free text in `Notes`; `Service` is deliberately
  absent because the API's enum has no product values and any product name would
  fail validation. Confirmed against the real validator: an order payload passes
  with zero errors, including an Arabic name.

Details worth keeping: the `<select>` leads with an empty `Select…` option so
`required` actually forces a choice — without it the first product was
preselected and would be silently ordered. The `Notes` textarea is
`maxlength="1500"` to match the server cap exactly (it was briefly 200, confused
with the `dimensions` field, which would have truncated people silently). Card
buttons are padded to clear the 44px touch target; at the original padding they
measured 43.

Nav: Products sits after Services on all 18 nav-bearing pages, with `../` on the
`services/*` and `products/*` subpages — the first pass missed those because
their nav uses relative paths, so verify both prefixes after any nav change.
`404.html` has a logo-only header and deliberately has no nav.

Arabic for the whole page set is in `js/ar.js`. **Every new product needs its
name, blurb and specs added there, and every renamed category needs its name**,
or it stays English on the toggle. Asset versions are now `qobban.css?v=21`,
`qobban.js?v=22`, `ar.js?v=21`.

## Deployment stalled — owner action

**Commit `b1accef` is on GitHub but has not deployed.** The live site is still
`0360775`. Verified rather than assumed: `/products/category-one.html` returns
404 even with a cache-busting query, `/js/qobban.js?v=21` serves content that
still references `ar.js?v=19`, and `products.html` carries `Age: ~29000`
(roughly eight hours) with `X-Vercel-Cache: HIT`. Polled for about ten minutes;
the previous three commits each went live in under a minute.

Nothing here can fix that — check Vercel → Deployments for a failed or queued
build on `b1accef`, and that the Git integration is still connected. Note
`/products` returns 404 while `/products.html` returns 200, so `cleanUrls` is
off and `products.html` does not collide with the new `products/` directory —
that was the leading hypothesis and it is ruled out.

Everything in the commit is verified locally: build is idempotent, all internal
links resolve, no mojibake, API tests pass, and both language toggles were
exercised in a browser.

## Two Arabic bugs found and fixed

**`ar.js` never loaded on any subpage.** `qobban.js` built its path with
`document.currentScript && /\/services\//.test(...)`, but `currentScript` is
always `null` inside the toggle handler, so the `../` never applied. Every
`services/*` page requested `/services/js/ar.js`, got a 404, and stayed English
**while `dir` still flipped to `rtl`** — English text in a right-to-left layout,
live on six pages. This predates the products work; the pages had never been
tested. Now the prefix is derived from the path depth, so it works at any depth,
verified on both `services/` and `products/`.

**A stale `?v=` would have frozen the dictionary forever.** `ar.js` is served
`immutable, max-age=31536000`. It was edited twice while still pointing at
`?v=19`, and `v=19` had already shipped — so anyone who fetched it would keep the
old dictionary for a year. Caught only because a cached copy showed 510 keys
against 705 in the file. **Bump the `ar.js?v=` inside `qobban.js` on every
`ar.js` change**, and bump `qobban.js` itself so the new reference is picked up.

## Hero video

The hero card now plays [../site/video/hero.mp4](../site/video/hero.mp4)
instead of showing a still. The source was 14.31 MB — 1280×720, 15 s, about
7.6 Mbps, **with an AAC audio track**. Re-encoded with ffmpeg to **1.02 MB**, a
93% reduction:

```
ffmpeg -i <source> -an -c:v libx264 -crf 28 -preset slow \
       -pix_fmt yuv420p -movflags +faststart site/video/hero.mp4
```

`-an` drops the audio stream outright, so the file is silent by construction
rather than only `muted` in markup. Encoded at native 720p — the source is not
1080p, and upscaling would have cost bytes for nothing. `+faststart` puts `moov`
before `mdat` so playback starts before the download finishes; verified at byte
36 vs 5074. ffmpeg was installed for this (`winget install Gyan.FFmpeg`).

The markup keeps the IMG-01 background on `.herocard__media` **and** sets it as
the video's `poster`, so a blocked, failed or reduced-motion video leaves the
card looking exactly as it did before. `@media (prefers-reduced-motion: reduce)`
hides the video — a 15 s auto-loop is the moving content WCAG 2.2.2 asks to be
stoppable. The video is `aria-hidden` and `tabindex="-1"`: it is decoration and
must not take focus. Stacking is video → gradient wash → copy, so contrast over
the text is unchanged.

`vercel.json` gained a `/video/(.*)` immutable cache rule matching `/img/`.
CSS changed, so `qobban.css` is now `?v=19` alongside `qobban.js?v=19`;
`boot.js` is untouched at `v=18`.

Verified served locally: `readyState` 4, no media error, 1280×720,
`muted`/`loop`/`playsinline` all set, `paused: false`, and
`webkitAudioDecodedByteCount` 0 confirming no audio.

Checked and found clean: 13/13 unique titles and descriptions, one `h1` per
page, every `img` has `alt` plus `width`/`height`, no broken internal links or
missing image files, every `tel:` is `+97339949004`, every `wa.me` link is the
right number, no `target="_blank"` without `rel="noopener"`, no localhost or
`vercel.app` references, no `console.log`, no `http://` subresources. Security
headers are set in `vercel.json` — CSP, HSTS, `nosniff`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy` — and `/api/` carries `no-store` and
`X-Robots-Tag: noindex`. `GET /api/lead` correctly returns 405. No secrets in
client code.

**Not verified, and I could not verify it here.** The browser pane runs zero
animation frames (`requestAnimationFrame` fired 0 times in 500 ms), so any CSS
transition never advances and reads stuck at its start value. That made the
mobile menu *look* broken. It is not demonstrated broken: the DOM half is
correct — `aria-expanded` flips and `.is-open` lands on the nav — and
`.nav.is-open { transform: translateX(0) }` is present at the right specificity
([../site/css/qobban.css](../site/css/qobban.css):313). Anything transition-,
animation- or layout-dependent still needs a real device. Treat screenshots and
`getBoundingClientRect` from that pane as unreliable for moving elements.

**Vercel Analytics is not enabled.** `/_vercel/insights/script.js` 404s on every
page load and throws two console errors. The `<script>` tag is already in
`build.py`; enabling Analytics in the dashboard fixes it. If it is not going to
be enabled, delete the tag instead — shipping a 404 on every page view is worse
than having no analytics.

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
| `[CONFIRM]` **visible to visitors** | 2 | `contact.html` — address and hours |
| Bare TikTok links | 2 | `index.html`, `contact.html` — go to TikTok's homepage; the handle is still unknown |
| Category names | 4 | `category-one`…`category-four` are placeholders. Rename in `CATEGORIES` **and** rename the file in `site/products/`, then drop them from `NOINDEX` |
| Product list | 1 of 20–48 | Only Decorative Metal Stands has a confirmed price. Owner to supply names, prices, specs and photos, and the Arabic for each |
| Sale copy | — | `SALE` in `build.py` holds placeholder headline and eyebrow. Real offer copy needed, plus a `was` price on whatever is actually discounted |
| `ALLOWED_ORIGIN` | — | Confirmed unset against production; `/api/lead` accepts any origin |
| Vercel Analytics | — | Not enabled; its script 404s on every page load |
| `info@qobban.store` mailbox | — | Owner reports it configured and working; not independently verifiable from here |

Instagram is resolved — both links now point at `instagram.com/qobban.bh`.

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

Optional, not blocking: all 33 images are JPEG totalling 6.8 MB, largest 438 KB.
Only two load above the fold and the rest are lazy, so the homepage costs about
550 KB — fine as it stands. WebP would cut roughly a third if it ever matters.
The hero is a CSS `background-image`, so it cannot take `fetchpriority`; a
`<link rel="preload">` would likely help LCP, but LCP could not be measured in
this environment and the change is unmeasured, so it was not made. There is no
hero video anywhere on the site — that whole class of concern does not apply.

## Not in Google — expected, nothing broken

Searches for `qobban.store` and for the brand return nothing: Google has no
record of the site. That is normal for a domain pointed one day earlier, and
there is **no technical fault to fix**. Verified: no `noindex` meta or
`X-Robots-Tag` on any page, `robots.txt` allows crawling and names the sitemap,
`sitemap.xml` is valid XML and byte-identical to the deployed copy, and all 13
listed URLs return 200 with a self-referential canonical.

Google cannot index what it has not discovered, and the site has no backlinks
and has never been submitted. What actually moves it, in order of impact:

1. **Google Business Profile** — for a local Bahrain fabricator this outranks
   organic indexing entirely; it is what puts Qobban in Maps and the local pack.
2. **Google Search Console** — verify `www.qobban.store` (the canonical host),
   submit `https://www.qobban.store/sitemap.xml`, then "Request indexing" on the
   homepage.
3. **Backlinks** — the Instagram and TikTok bios are the cheapest real ones.

Then wait. Days to weeks is normal. Note the canonical host changed twice inside
24 hours (`qobban.com` → apex → `www`); that churn did not help, but it is
settled and consistent now, so the signal Google eventually crawls will be clean.

**172 markdown files are still `TBD`.** Priority: `MARKETING/` (TikTok strategy
was agreed and never written) → `SERVICES/` → `CUSTOMERS/` → `SALES/` →
`PROCESS/` and `OPERATIONS/`.

## Never tested on hardware

Still true, and this session reinforced why: the preview pane renders no frames,
so it cannot verify anything that moves. Untested on a real device: the mobile
menu, quote flow, WhatsApp hand-off, light mode, Arabic RTL, page transitions,
Lighthouse — and **gyroscope tilt on the hero spirit level**, which cannot be
exercised without one. Page transitions need a server; they do not run from
`file://`. Local server config: `.claude/launch.json`
(`python -m http.server 8123`).

Step counter now builds its own Arabic with Arabic-Indic digits rather than
going through the dictionary, and redraws on a `qobban:lang` event — so it is
correct on every step, not just the first. Deliberately narrower than a full
repaint, which would pull focus off the language toggle.

---

**Next action:** replace the two `[CONFIRM]` strings on `contact.html` with the
real workshop address and hours — visible to visitors right now, and blocked
only on those two facts. Owner actions in parallel, all in the Vercel dashboard
or on a phone: set `ALLOWED_ORIGIN`, enable Analytics, supply the TikTok handle,
and walk the site once on a real device. Then the `TBD` backlog, starting with
`MARKETING/`.

Everything after commit `66e57df` is **uncommitted** — `site/build.py`,
`site/css/qobban.css`, `site/js/qobban.js`, 14 rebuilt pages, `vercel.json`,
`sitemap.xml`, `robots.txt`, plus new `site/404.html`, `site/favicon.svg` and
`site/video/hero.mp4`. Held for review at the owner's instruction; nothing was
pushed.

## "Not secure" — root cause is port 80, not the certificate

My first read of this was wrong. It is not a stale tab and not the cert. The
plaintext redirect hop is **intermittently timing out at Vercel's edge**:

| Target | Result |
|---|---|
| `https://qobban.store` | 8/8 succeeded |
| `https://www.qobban.store` | 8/8 succeeded |
| `http://qobban.store` (port 80) | **4 of 8 timed out** |
| `http://www.qobban.store` (port 80) | **3 of 5 timed out** |
| `http://example.com` (network control) | 6/6 — the local network is fine |

HTTPS is completely reliable; only port 80 is flaky, and the control rules out
this machine's connection. So typing `qobban.store` makes Chrome try `http://`
first, the request hangs, and the browser sits on a plaintext URL showing
"Not secure" — it never reaches HTTPS. Certificates remain valid and correctly
scoped, and there is no mixed content.

**The durable fix is HSTS preload**, which makes browsers skip port 80 entirely
for this domain. It is currently impossible to submit: `hstspreload.org`
requires the apex to serve `includeSubDomains; preload`, and
`https://qobban.store` serves only `max-age=63072000`. That header is Vercel's
automatic one for a **dashboard-level domain redirect**, which never reaches the
deployment, so `vercel.json`'s full HSTS header does not apply to it. Fixing it
means attaching the apex to the project as a normal domain and moving the
apex→www redirect into `vercel.json`, where the headers block applies. That is a
coordinated dashboard + config change and was **not** made unilaterally.

The flakiness may also simply be edge configuration still settling — the domain
was added the day before. Re-measure before escalating to Vercel support.
