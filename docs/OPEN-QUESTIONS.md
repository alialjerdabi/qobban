# Open Questions — Staff Portal

Everything the portal needs that is not written down anywhere in this repository.
Each has a **placeholder** in use until answered, so the build is never blocked.
Strike an item and record the answer here when it is settled.

## Blocking before any customer document is issued

A tax invoice that is missing these is not legally valid in Bahrain.

| # | Needed | Placeholder in use | Why it matters |
|---|---|---|---|
| 1 | Legal company name, English | `Qobban [LEGAL NAME]` | Printed on every quote, invoice and receipt |
| 2 | Legal company name, Arabic | `قبان [الاسم القانوني]` | Arabic is the portal's first language |
| 3 | CR number | `CR-XXXXX` | Required on customer documents |
| 4 | VAT registration number | `VAT-XXXXXXXXXXXXXXX` | Required on a tax invoice; without it we cannot charge VAT |
| 5 | Workshop address | `[WORKSHOP ADDRESS], Kingdom of Bahrain` | Already `[CONFIRM]` on the public contact page |
| 6 | Opening hours | `[HOURS]` | Same `[CONFIRM]`; also wanted for Google Business Profile |

## Needed before Phase 1 is useful

| # | Needed | Placeholder | Note |
|---|---|---|---|
| 7 | Default labour rate, BHD/hour | `10.000` | Drives the materials + labour build-up |
| 8 | Default margin % on materials | `20` | Applied to cost in the build-up; editable per line |
| 9 | Default quote validity, days | `14` | Shown on the quote |
| 10 | Opening numbers for each series | all start at `1` | If paper quotes already exist, say the last number used |
| 11 | Staff who get logins | one owner account | Name, phone, role per person — see roles in `PLAN.md` |
| 12 | Print-quality logo | the site's inline SVG mark | `MARKETING/BRAND/LOGO/*.png` lockups are **gitignored**, so the build cannot reach them. A vector lockup committed to the repo is better than a PNG |

## Needed before Phase 3

| # | Needed | Placeholder | Note |
|---|---|---|---|
| 13 | Bank account details for transfers | `[BANK NAME] / [IBAN]` | Printed on invoices so customers can pay |
| 14 | BenefitPay merchant details | none | Only if receipts must show a merchant reference |
| 15 | Standard payment schedule | `50 / 40 / 10` | Advance / delivery / after installation, from the brief |

## Needed before anything is deployed

| # | Needed | Placeholder | Note |
|---|---|---|---|
| 16 | Portal subdomain | `staff.qobban.store` | Confirm the name before DNS is touched |
| 17 | Is the public site actually moving off Vercel? | assumed **yes**, later | The brief says it moves to Hostinger. It is live and working on Vercel today, so this is a separate decision from standing the portal up |
| 18 | Hostinger database name / user | created at deploy time | Never written into the repo; environment variables only |

## Already known — do not ask again

Recorded here so a later session does not re-raise them.

| Fact | Value | Source |
|---|---|---|
| Phone / WhatsApp | `+973 3994 9004` → `wa.me/97339949004` | live site, verified |
| Public domain | `qobban.store`, `www` is canonical | live, on Vercel |
| Email | `info@qobban.store` | live site — **mailbox may still not exist** |
| Instagram | `qobban_bh` | live site |
| VAT rate | 10% (Bahrain standard) | the brief; `VAT_BP = 1000` in the Sweetest Days reference. **Not** in `site/build.py` — the public site has no VAT anywhere |
| Brand colours | charcoal `#1A1A1A` / `#111111`, yellow `#FFC220` | `site/css/qobban.css` |
| Accent on light backgrounds | `#8A5D00` — **not** yellow | yellow measures 1.46:1 on light and fails AA |
| Fonts | Montserrat (Latin), IBM Plex Sans Arabic | `site/css/qobban.css` |
| Currency | BHD, 3 decimals, stored as integer fils | Sweetest Days convention |

## Related

- [PLAN.md](PLAN.md) — what is being built and in what order
- `AI/HANDOFF.md` — current state of the public website
