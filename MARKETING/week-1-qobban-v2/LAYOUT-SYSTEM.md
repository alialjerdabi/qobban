# Qobban Week 1 — Locked Layout System V2

This revision follows the supplied gas-enclosure advertisement as the single layout reference.

## Fixed components

- Canvas: 1080 × 1350 px, Instagram 4:5.
- Photography zone: 620 px wide, always on the left.
- Information panel: 460 px wide, always on the right.
- Shared ImageGPT charcoal texture: identical on all 16 designs.
- Arabic type family: Almarai embedded directly from the bundled official Google Fonts files—ExtraBold for headlines, Light for support copy, Regular for feature rows, and Bold for CTAs.
- Logo position, coordinate reference, slide number, headline width, dividers, feature rows, measurement rulers, CTA note, contact bar, and footer tagline are fixed.
- Qobban yellow is restricted to highlighted headline text, line icons, technical markers, and outlines.
- Arabic typography is rendered deterministically in-browser rather than generated inside the image, improving consistency and copy accuracy.

## Content behavior

- Only the photographic/diagrammatic image and written content change between slides.
- ImageGPT-generated product visuals from V1 remain the photographic source material.
- Gates, pergolas, railings, canopies, and maintenance scenes remain concept visualizations pending replacement with real Qobban project photography.
- The full contact bar is repeated identically across the set: `qobban.bh`, `39949004`, and the business descriptor.

## Reproduction

Run `tools/render_campaign_v2.js` using the bundled Node runtime with `NODE_PATH` set to the bundled packages directory. The script preserves the locked grid and recreates the full campaign plus its master contact sheet.
