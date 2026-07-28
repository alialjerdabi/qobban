# Typography

Palette: [Color_System.md](Color_System.md). Voice: [Tone_of_Voice.md](Tone_of_Voice.md).

## Brand typeface

**Gotham** — Regular / Medium / Bold. Geometric, engineered, neutral. Its even
proportions match the logo's constructed geometry.

Headlines are set in **uppercase** with tightened tracking. This is the brand's
most recognisable type behaviour and appears across signage, apparel, vehicle
and digital.

## Web substitute

Gotham requires a commercial licence for web use. Until that licence is
`[CONFIRM]`ed, the site uses **Montserrat** (Google Fonts) — geometric sans with
near-identical proportions and a free web licence.

Fallback stack: `Gotham, Montserrat, "Helvetica Neue", Arial, sans-serif`

## Arabic

**IBM Plex Sans Arabic** — Regular 400 / SemiBold 600 / Bold 700. Confirmed
2026-07-28. Use it for all Arabic, everywhere: the logo lockup, the website,
social, print and documents. Do not substitute Almarai or Tajawal.

It was chosen over the alternatives because its proportions and x-height sit
closest to Montserrat, so mixed-script lines hold a common baseline weight, and
because it carries a genuinely matched weight range rather than only Regular
and Bold.

Web stack: `"IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif` — exposed as
the `--font-ar` token. It loads in the same Google Fonts request as Montserrat,
so it costs no extra connection, and unicode-range subsetting means the Arabic
file only downloads on pages containing Arabic glyphs.

**Letter-spacing must reset to `normal` for Arabic.** The script is cursive;
tracking pulls the joined letterforms apart into unreadable fragments. Every
tracked style in the system — headings, nav, buttons, spec captions, form
labels — resets under `[dir="rtl"]`. This is not optional styling.

Arabic has no letter case, so `text-transform: uppercase` is dropped too.
Headlines also take slightly more leading (1.25 vs the tight Latin setting).

## Scale

Three text levels maximum in any composition: headline, support line, CTA.

| Level | Weight | Case | Tracking | Web size (desktop / mobile) |
|---|---|---|---|---|
| Display | Bold | Upper | `-0.02em` | 72 / 40 px |
| H1 | Bold | Upper | `-0.02em` | 56 / 32 px |
| H2 | Medium | Upper | `-0.01em` | 36 / 26 px |
| H3 | Medium | Upper | `0` | 24 / 20 px |
| Body | Regular | Sentence | `0` | 17 / 16 px |
| Caption / spec | Medium | Upper | `0.12em` | 12 / 12 px |
| CTA | Bold | Upper | `0.06em` | 15 / 15 px |

Body line-height 1.6. Headline line-height 1.05–1.15. Body measure max 68
characters.

## Behaviour

- Headlines uppercase; body sentence case. Never uppercase a paragraph.
- The wide-tracked caption style carries technical labels — material names,
  dimensions, finish codes. It is the type equivalent of a spec sheet and is a
  core part of the Precision Engineering direction.
- One yellow word per headline maximum, and only for the operative word.
- Never stretch, condense, outline or add effects to the typeface.
- Never centre long-form body copy.

## Status

- Draft — Gotham confirmed in the identity sheet
- `[CONFIRM]` Gotham web licence, Arabic pairing
