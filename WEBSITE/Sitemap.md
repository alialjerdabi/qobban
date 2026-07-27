# Sitemap

Strategy and rationale: [Website_Strategy.md](Website_Strategy.md).
Service content owned by [../SERVICES/](../SERVICES/) — pages link, never duplicate.

## Structure

```
/                       Home
/services               Services overview
  /services/gates
  /services/pergolas
  /services/railings
  /services/canopies-car-shades
  /services/custom-fabrication
  /services/maintenance-repair
/projects               Filterable project gallery
  /projects/[slug]      Individual project
/process                How a Qobban project runs
/about                  Company, workshop, capability
/contact                Location, hours, map, direct channels
/quote                  Multi-step quote request (primary conversion)
```

Phase two: `/materials-finishes`, `/blog`, `/faq`, Arabic mirror at `/ar/*`.

## Navigation

Header: Services · Projects · Process · About · Contact · **Get a Quote** (yellow).
Six items maximum. Mobile collapses to a full-screen overlay.

Footer: service links, contact block, location, WhatsApp, Instagram, hours.

Persistent: sticky WhatsApp button, bottom-right, all pages, all breakpoints.

## Home page sections

1. Hero — brand line, level-bubble load animation, primary CTA
2. Positioning statement — precision / durability / fit, three columns
3. Services grid — six cards
4. Featured projects — three, linking to gallery
5. Process — condensed four steps, links to `/process`
6. Why Qobban — written scope, measured fabrication, clean installation, warranty
7. Trust strip — capability figures or client logos `[CONFIRM availability]`
8. Final CTA — quote form entry + WhatsApp

## Service page template

Applied identically to all six, in this order:

Hero image + service name → what it is and who it's for → **climate and material**
→ **design and customisation** → **process and warranty** → **installation
standard** → project examples → FAQ → CTA.

Order is fixed because it answers the four buyer objections in sequence — see
[Website_Strategy.md](Website_Strategy.md).

## Quote flow

`/quote` — six steps, one question per screen, progress indicator:

1. Service type
2. Property type (villa / commercial / industrial)
3. Dimensions or "not measured yet"
4. Photo or sketch upload (optional, skippable)
5. Area in Bahrain + preferred timeline
6. Name, phone, WhatsApp preference

Partial submissions capture on step 5 so an abandoned form still yields a lead.

## Status

- Draft — structure follows the locked lead-capture direction
- `[CONFIRM]` service list is final; project count available at launch
