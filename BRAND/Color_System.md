# Color System

Rationale: [Brand_Essence.md](Brand_Essence.md). Application rules: [Brand_Do_and_Dont.md](Brand_Do_and_Dont.md).

## Core palette

| Role | Name | Hex | Use |
|---|---|---|---|
| Base | Qobban Black | `#1A1A1A` | Primary background, 70–80% of any surface |
| Type | Warm White | `#FFFFFF` | Headlines, body, logo | 
| Accent | Precision Yellow | `#FFC220` | Emphasis only, 5–10% of any surface |

Three colours. No fourth brand colour without a documented reason.

## Extended neutrals (digital)

Needed for interface depth; not brand colours, and never used as accents.

| Token | Hex | Use |
|---|---|---|
| `--surface` | `#111111` | Page background, deeper than base |
| `--surface-raised` | `#1A1A1A` | Cards, panels |
| `--surface-line` | `#2A2A2A` | Hairlines, grid rules, dividers |
| `--text-muted` | `#8A8A8A` | Secondary and caption text |
| `--text-body` | `#D6D6D6` | Long-form body copy |

## Yellow discipline

Yellow is a precision indicator, not decoration. Permitted uses:

- Call-to-action fills and CTA underlines
- One highlighted word or phrase per composition
- Measurement marks, dimension lines, tick marks, level bubble
- Active/current state in navigation and interface
- Thin engineering icon accents

Never: large yellow fills, yellow body text, yellow gradients, two competing
yellow elements in one view, or yellow on white without a dark carrier.

## Contrast requirements

Minimum WCAG AA. Verified pairings:

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| `#FFFFFF` | `#1A1A1A` | ~16.1:1 | Pass, all sizes |
| `#D6D6D6` | `#1A1A1A` | ~10.9:1 | Pass, all sizes |
| `#FFC220` | `#1A1A1A` | ~10.4:1 | Pass, all sizes |
| `#8A8A8A` | `#1A1A1A` | ~4.7:1 | Pass at 16px+ only |
| `#1A1A1A` | `#FFC220` | ~10.4:1 | Pass — required for yellow CTA buttons |

Never place `#FFC220` on `#FFFFFF` (~1.6:1, fails).

## Light surfaces

The brand is dark-first. Where light is unavoidable (print, documents, invoices),
invert: `#FFFFFF` base, `#1A1A1A` type, yellow accent unchanged and used more
sparingly still.

## Status

- Approved — hex values taken from the brand identity sheet
- `[CONFIRM]` print equivalents (Pantone / CMYK) for signage and vehicle wrap
