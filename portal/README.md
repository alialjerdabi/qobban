# Qobban staff portal

Sales, quotes, jobs, invoices and reports for QOBBAN WELDING, DECORATION, MAINTENANCE.
Plain Node 24 + `node:http` + `mysql2`. No framework, one dependency, no build step.

Plan and open questions: [`../docs/PLAN.md`](../docs/PLAN.md),
[`../docs/OPEN-QUESTIONS.md`](../docs/OPEN-QUESTIONS.md).

## Running it locally

```sh
docker run -d --name qobban-mariadb \
  -e MARIADB_ROOT_PASSWORD=practice -e MARIADB_DATABASE=qobban \
  -e MARIADB_USER=qobban -e MARIADB_PASSWORD=practice \
  -p 3308:3306 mariadb:11.8

cd portal
cp .env.example .env
cp seed-users.example.json seed-users.json   # put the real PINs in this one
npm install
npm start                                    # migrates, seeds, listens on :3100
```

Then <http://127.0.0.1:3100/staff/>.

`sd-mariadb` on port 3307 belongs to Sweetest Days. Nothing here touches it.

## Checks

```sh
npm test     # the money invariants — VAT, discounts, rounding, schedules
npm run smoke  # end to end against a running server
```

Both must pass before anything is shown or deployed.

## How it is put together

| File | What it does |
|---|---|
| `src/pricing.js` | **Every amount in the system.** Integer fils, no floating point |
| `src/server.js` | HTTP, static files, the login brake, security headers |
| `src/router.js` | Route table, cookie helpers, `need()` for role checks |
| `src/auth.js` | scrypt PINs, sessions, `seesMoney()` |
| `src/quotes.js` | Quote CRUD, versioning, numbering |
| `src/public.js` | The `/q/<token>` customer page — **never joins `line_build_up`** |
| `db/migrations/` | Numbered SQL, applied in order on start |
| `web/staff/` | The screens: vanilla JS, Arabic-first, RTL |

### Rules this code keeps

- **Money is integer fils.** 1 BHD = 1000. Lines always sum to the total exactly.
- **The server prices everything.** The browser sends options; `/api/quote-preview`
  returns the figures the screen shows, so it cannot disagree with what is saved.
- **An issued document never changes.** Editing a sent quote writes v2.
- **Nothing is deleted.** Cancelling needs a reason.
- **Cost and margin are owner-only**, and absent from the payload for everyone else.
- **PINs live in `seed-users.json`**, which is gitignored. Never in a migration.

## Not built yet

Phases 2–4: jobs, invoices, payments, expenses, purchase orders, reports.
