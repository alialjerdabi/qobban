# Staff Portal — Plan

A portal for Qobban's own staff: clients, price list, quotes, jobs, invoices,
payments, expenses and reports. Built on the patterns already proven in the
Sweetest Days staff portal, which is live.

**Nothing here is built yet.** This document is for approval first.

## 1. Approach

Copied from Sweetest Days rather than reinvented:

| Decision | Why |
|---|---|
| Node 24 + `node:http` + `mysql2`, ESM, no framework | One dependency. Nothing to upgrade, nothing to learn twice |
| Money in integer **fils** (1 BHD = 1000) | No float rounding. The old Sweetest Days admin used FLOAT and the totals drifted |
| Numbered SQL migrations, applied on start | No shell access needed on the host |
| Session = random token in an httpOnly cookie; only its SHA-256 stored | A leaked database cannot log anyone in |
| Documents are **voided, never deleted**, with an audit log | Issued tax documents must not change |
| Customer links at `/q/<token>` with an Accept button | Already works for Sweetest Days quotes |
| A smoke script per feature, run against a practice database | Catches the money maths before the customer does |

**Separate database, not shared.** The Sweetest Days schema already anticipates
Qobban — `customer_pools` is commented *"kids/events companies together, Qobban
alone"* — so the shape fits. But a separate database on the same account keeps
the hard rule simple: nothing this project runs can reach Sweetest Days data.

**Looks like the website.** Same charcoal/yellow, Montserrat + IBM Plex Sans
Arabic, same logo mark, same CSS logical properties so RTL works. Note the
accent on light backgrounds must be `#8A5D00`, not yellow — yellow measures
1.46:1 and fails AA. That bug was already fixed once on the public site.

**Arabic first, English switch.** The public site is English-first with Arabic
second; the portal is the other way round, because the staff using it work in
Arabic. Deliberate, not an inconsistency.

## 2. Data model

Borrowed from Sweetest Days where the shape fits, changed where Qobban differs.

### Reused nearly as-is
`companies` · `users` · `roles` · `user_roles` · `sessions` · `audit_log` ·
`customers` · `suppliers` · `accounts` · `doc_sequences` · `documents` ·
`document_lines` · `payments` · `bills` · `stock_moves`

### Changed for Qobban

**`price_list`** replaces the `items` catalogue. Same shape; the `kind` enum
becomes `material | labour | unit_rate | product`, each with a unit
(`m`, `kg`, `m2`, `piece`, `hour`) and a rate. No stock counting yet —
`stock_moves` is created but unused, so stock can be switched on later without
a migration that rewrites history.

**`document_lines` gains `pricing_mode`** — `build_up | unit_rate | fixed` —
because a Qobban quote mixes all three on one document. Sweetest Days only ever
had catalogue item × quantity.

**`line_build_up`** is new: the materials-and-labour workings behind a
`build_up` line (material cost, labour hours, rate, margin %). **Internal
only.** Staff see it; the customer document prints just the line total. This is
the single most important privacy rule in the schema.

**`jobs`** replaces `bookings`. Same role — the thing a quote becomes — but
Qobban's is a fabrication job with stages, not an event with a crew and a date:
`site_visit → drawing → cutting → welding → painting → delivery → done`.

**`job_stages`** (stage, entered_at, by) · **`job_attachments`** (site photos,
drawings, measurements) · **`job_costs`** (actual materials, labour hours,
subcontractors — against the quote, for real margin) ·
**`payment_schedule`** (per job: percentage or amount parts, each invoiceable
separately).

**`purchase_orders`** + **`purchase_order_lines`**, drawn from the price list.

### Numbering

One running series per type, as the brief asks:
`Q-` quote · `INV-` invoice · `CN-` credit note · `RC-` receipt ·
`JOB-` job · `PO-` purchase order · `DN-` delivery note.
Allocated with `SELECT … FOR UPDATE` on `doc_sequences`, exactly as Sweetest
Days does, so two people saving at once cannot take the same number.

### Roles

| Role | Can |
|---|---|
| `owner` | Everything, including profit and cost |
| `sales` | Clients, quotes, jobs, invoices, payments. **No profit, no cost, no build-up** |
| `accountant` | Reports, VAT, payments, expenses. Read-mostly |

`workshop` is not created yet, but roles live in a table so adding it later is
a row, not a migration of logic.

## 3. Phases

Each phase ends with: smoke script green, money unit tests green, every screen
checked at phone width, then shown to you before the next begins.

### Phase 1 — clients, price list, quotes
Login and roles · client records (one per phone) with a profile showing their
quotes, jobs, invoices and balance · price list · the quote builder with all
three line types, delivery line, % discount, the special discount that rounds
the total to a figure you type, VAT toggle, validity, and tickable terms ·
versioning (a sent quote locks; editing makes v2) · PDF/print · WhatsApp
message · `/q/<token>` customer link with Accept.

*Riskiest part, so it is first: the money maths and the three line types.*

### Phase 2 — jobs
Accepted quote becomes a job · stages · site visit with measurements, photos
and drawings · payment schedule whose parts must sum exactly to the total ·
job costs vs quoted, with real profit and margin (owner only) · printable job
sheet / delivery note for signature on handover.

### Phase 3 — invoices, payments, expenses, purchase orders
Tax invoices from the schedule or a quote, VAT per line, both VAT numbers ·
credit notes for corrections, since an issued invoice is never edited ·
payments in any method, splittable across methods, each with a receipt ·
cancellation needs a reason · expenses by category, optionally against a job ·
purchase orders `draft → sent → received`, received lines bookable as job cost.

### Phase 4 — reports
Dashboard and a reports page over any date range: invoiced / collected / owed
with ageing, VAT, by month and method · quote conversion, by salesperson and
job type, average time to accept · job profit quoted vs actual (owner only) ·
expenses and suppliers · CSV export for the accountant.

## 4. Money invariants — unit tested every phase

These are the things that must never be wrong, each with its own test:

1. Per-line VAT sums **exactly** to the document VAT — the last line absorbs the rounding.
2. Apportioned discount sums **exactly** to the document discount — same trick.
3. The special discount lands on the typed figure **to the fils**, VAT included.
4. Payment schedule parts sum **exactly** to the job total; no part is negative.
5. Job profit = invoiced − actual cost, and never leaks to a `sales` user.
6. Every total is computed **on the server**. The browser sends prices and options, never totals.

## 5. Deliberately not building

- **Stock counting.** Tables are shaped for it; no stock in/out yet.
- **Workshop logins.** Role table supports it; no accounts.
- **Online card payment.** Payments are recorded, not taken.
- **Public-site changes.** The portal is separate; the Vercel site keeps working.

## 6. Deployment

Not part of a phase, and nothing moves without your explicit go-ahead.
`docs/MIGRATION.md` gets written before any DNS or upload: current records
including mail, the steps, and a rollback. Portal goes to its own subdomain and
its own database. Deploy from a git worktree of a pushed commit. Secrets live
in environment variables, never in the repo, never printed.

## 7. Where the lasting specification lives

`WEB_APP/` already owns this topic in the repo — all 32 files are empty `TBD`
stubs. These `docs/` files are **build documents**, not the specification.
As each phase lands, the durable content fills the matching stub
(`WEB_APP/Database_Schema.md`, `Quotation_Module.md`, `User_Roles.md`,
`API_Design.md`, …) and this plan links to it rather than repeating it.

**Decision needed:** confirm that split, or say you would rather the whole thing
live under `docs/` and leave `WEB_APP/` empty.

## Related

- [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) — the 18 unknowns, with placeholders
- `C:\AI-Workspace\Sweetest Days` — the reference, read-only
