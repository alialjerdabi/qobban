# Qobban

Brand, business and website documentation for Qobban — architectural metalwork
in the Kingdom of Bahrain. *Precision is our standard.*

## Website

Static HTML/CSS/JS in [`site/`](site/). No build step, no dependencies.
Open `site/index.html` directly, or serve the folder.

Deployed on Vercel from this repo — `vercel.json` points the output at `site/`.
Pushing to `main` redeploys.

## Repository

| Path | Contents |
|---|---|
| `site/` | The website |
| `BRAND/` `SERVICES/` `CUSTOMERS/` `SALES/` `MARKETING/` | Business documentation |
| `RESEARCH/` | Bahrain market and competitor research |
| `WEBSITE/` `WEB_APP/` | Specifications |
| `AI/` | Prompts, templates, context index |
| `00–11_*.md` | Company-level positioning |

Start at [00_PROJECT_OVERVIEW.md](00_PROJECT_OVERVIEW.md).

## Before launch

Placeholders still to replace across `site/`:

- `973XXXXXXXX` — phone and WhatsApp number (every page)
- `info@qobban.com` — email
- Workshop address and hours (`contact.html`)
- Instagram and TikTok URLs
- Images — see [site/IMAGE_PROMPTS.md](site/IMAGE_PROMPTS.md)

Bump the `?v=` on the CSS and JS links whenever those files change, or browsers
will serve the cached copy.
