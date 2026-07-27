# Website Strategy

Page inventory: [Sitemap.md](Sitemap.md). Visual rules: [../BRAND/Color_System.md](../BRAND/Color_System.md), [../BRAND/Typography.md](../BRAND/Typography.md).

## Job of the site

**Convert enquiry into a qualified, specified lead.** Not a brochure. Every page
ends in one of two actions: start a WhatsApp conversation, or submit the quote
form with enough detail to price the job.

Secondary job: give architects and developers enough technical credibility to
shortlist Qobban without a phone call.

## Locked direction (2026-07-27)

| Decision | Choice |
|---|---|
| Visual direction | **Precision Engineering** — dark canvas, hairline grid, yellow tick-marks and dimension lines, uppercase Gotham/Montserrat, spec-sheet detailing |
| Motion | **Rich but purposeful** — scroll reveals, parallax hero, animated counters, page transitions, level-bubble load moment. No scroll-jacking. |
| Language | **English first, RTL-ready** — i18n keys and direction-aware CSS from day one; Arabic toggle stubbed, hidden until content exists |
| Primary goal | **Lead capture engine** |

## Conversion architecture

Sticky WhatsApp button on every page. Multi-step quote form as the primary
conversion: service → dimensions → photo upload → area → timeline → contact.

Multi-step is deliberate — it raises completion versus one long form, and each
answered step qualifies the lead before a human reads it. The questions mirror
the DM qualification flow so sales handling is identical across channels.

## Objection mapping

Every service page must answer the four buyer objections from
[../RESEARCH/Bahrain_Market.md](../RESEARCH/Bahrain_Market.md) in this order:

1. **Climate** — material and coating system named, with a durability statement
2. **Design fit** — custom dimensions, façade harmony, finish options
3. **Reliability** — written scope, warranty period, documented process
4. **Installation** — clean-site standard, timeline, handover photos

A service page that omits any of these is incomplete.

## Performance and technical

- Mobile-first. Bahrain traffic will be overwhelmingly mobile.
- Motion must respect `prefers-reduced-motion`.
- Target LCP under 2.5s on 4G; images in modern formats, lazy-loaded below fold.
- Semantic HTML and WCAG AA contrast — palette already verified in
  [../BRAND/Color_System.md](../BRAND/Color_System.md).
- No layout that breaks when text direction flips to RTL.

## SEO position

Target intent, not volume: "gates Bahrain", "pergola Bahrain", "stainless steel
railing Bahrain", "car shade Bahrain", plus district-level terms (Riffa, Saar,
Janabiya, Amwaj). Detail in [SEO_Requirements.md](SEO_Requirements.md) and
[Technical_SEO.md](Technical_SEO.md).

## Dependency

The Projects section requires real photography. If a project library does not yet
exist, launch with process, fabrication and detail imagery and add the portfolio
in phase two. `[CONFIRM]` photography status — it changes the launch sequence.

## Status

- Direction locked 2026-07-27; content and photography pending
