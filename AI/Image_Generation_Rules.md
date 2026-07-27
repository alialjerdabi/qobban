# Image Generation Rules

Owner of the visual rules for **all** generated imagery. Prompt sets that use it:
[../site/IMAGE_PROMPTS.md](../site/IMAGE_PROMPTS.md) (website), [Social_Media_Prompt.md](Social_Media_Prompt.md) (social).
Palette and type: [../BRAND/Color_System.md](../BRAND/Color_System.md), [../BRAND/Typography.md](../BRAND/Typography.md).

Target model: **GPT-5 image generator**. Rules hold for any model.

## The one rule

Every image must look **engineered, not industrial-macho.** Sparks, flames, glowing
metal and heroic welder portraits are what the entire Bahraini category already
uses. Reproducing that look erases the positioning in [../04_POSITIONING.md](../04_POSITIONING.md).

Precision reads as: hard light, straight verticals, clean edges, controlled
composition, nothing accidental in frame.

## Style block

Prepend to every prompt, verbatim:

> Photorealistic architectural photography, Kingdom of Bahrain. Dark, controlled,
> editorial. Deep charcoal and black tones (#111111–#1A1A1A) with warm white
> highlights and a single restrained warm-yellow accent (#FFC220) where it occurs
> naturally — never as a filter. Crisp, high-contrast, engineered feel. Natural
> light, hard shadows, no haze. Shot on a full-frame camera, 35mm or 50mm prime,
> f/5.6, low ISO. No people unless specified. Clean composition, generous negative
> space, level horizon, straight verticals.

## Negative block

Append to every prompt, verbatim:

> Negative: no sparks, no flames, no smoke, no dramatic orange glow, no lens
> flare, no HDR halos, no oversaturation, no stock-photo staging, no fake welders
> posing, no gold, no ornate scrollwork, no text or logos or watermarks, no
> distorted geometry, no bent verticals, no visible brand names, no cluttered
> backgrounds, no snow, no lush green lawns, no Western suburban housing.

## Colour discipline

Yellow `#FFC220` appears only where it would physically exist — a spirit-level
vial, a safety marking, warm interior light through a slat. Never as a colour
grade, never on the metalwork itself. If a generated image reads as "yellow-tinted",
regenerate it.

Metalwork is matte charcoal, matte black, natural aluminium or timber-effect.
Never chrome-shiny, never gold, never bronze.

## Regional accuracy

Bahrain, not generic Gulf and not Western suburbia. Correct: pale limestone and
render boundary walls, flat roofs, compound villas, date palms, gravel and stone
paving, strong overhead sun, hazy pale-blue sky.

Wrong: lawns, pitched tile roofs, deciduous trees, overcast skies, timber fencing,
open-plan front gardens without boundary walls.

## Framing conventions

| Use | Ratio |
|---|---|
| Website hero, wide banners | 16:9 |
| Website figures, project cards | 4:3 |
| Instagram / TikTok feed | 4:5 |
| Stories, Reels, TikTok full | 9:16 |
| Open Graph / link share | 1.91:1 |

Where an image will carry a text overlay, say so in the prompt and name which
third stays quiet. Text is added in design, never generated into the image.

## People

Default is no people. Where a person is needed for scale or process credibility:
hands and partial figures only, seen from behind or side, no identifiable faces,
working clothing rather than styled costume. This avoids both the staged-stock
look and any likeness issue.

## QA checklist

Reject and regenerate if any of these fail:

- [ ] Verticals are straight; no lens distortion on gate or post lines
- [ ] No text, watermark, signage or logo anywhere in frame
- [ ] Metal geometry is physically plausible — count the slats, check the spacing
- [ ] Shadows fall consistently from one light source
- [ ] Palette matches the set; no colour cast
- [ ] Setting reads as Bahrain, not Dubai marketing render or a US suburb
- [ ] Nothing dramatised: no sparks, glow or smoke
- [ ] Hands and fingers correct where present

Generate 3–4 variants per slot and keep the one that passes all eight. Geometry
and hands are the two failures worth being strict about.

## Delivery

Naming: `IMG-01`, `SOC-01`, `VID-01` per the prompt set. Web format `.webp`
(fallback `.jpg`), quality ~82, longest edge 2000px for heroes and 1600px for
figures. Social exports at native platform resolution.

Website images go in `site/img/`. Wiring instructions are at the end of
[../site/IMAGE_PROMPTS.md](../site/IMAGE_PROMPTS.md).

## Status

- Draft — written 2026-07-27 alongside the website build
- `[CONFIRM]` whether real project photography will replace any generated images;
  where it does, real photography always wins
