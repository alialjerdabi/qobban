# Image Prompts — Qobban Website

33 image slots. Every placeholder in the site is tagged `data-img="IMG-XX"` and
prints its own ID on screen, so you can match generated files to slots visually.

**Target model:** GPT-5 image generator.
**Save to:** `site/img/IMG-01.webp` … `IMG-33.webp` (jpg is fine).
**To install:** see [Wiring images in](#wiring-images-in) at the end.

Rules, QA checklist and regional accuracy notes: [../AI/Image_Generation_Rules.md](../AI/Image_Generation_Rules.md).
Social and video prompts: [../AI/Social_Media_Prompt.md](../AI/Social_Media_Prompt.md).

---

## Global style block

Prepend this to **every** prompt so the set reads as one system:

> Photorealistic architectural photography, Kingdom of Bahrain. Dark, controlled,
> editorial. Deep charcoal and black tones (#111111–#1A1A1A) with warm white
> highlights and a single restrained warm-yellow accent (#FFC220) where it occurs
> naturally — never as a filter. Crisp, high-contrast, engineered feel. Natural
> light, hard shadows, no haze. Shot on a full-frame camera, 35mm or 50mm prime,
> f/5.6, low ISO. No people unless specified. Clean composition, generous negative
> space, level horizon, straight verticals.

## Global negative block

Append to every prompt:

> Negative: no sparks, no flames, no smoke, no dramatic orange glow, no lens
> flare, no HDR halos, no oversaturation, no stock-photo staging, no fake welders
> posing, no gold, no ornate scrollwork, no text or logos or watermarks, no
> distorted geometry, no bent verticals, no visible brand names, no cluttered
> backgrounds, no snow, no lush green lawns, no Western suburban housing.

**Why the negatives matter:** the whole positioning is "engineered, not
industrial-macho." Sparks-and-flames imagery is exactly what every competitor
uses and would undo the differentiation.

---

## Priority order

If you generate in batches, do them in this order:

1. **IMG-01** — hero. Single most important image on the site.
2. **IMG-02, 03, 04** — home page featured projects.
3. **IMG-06, 10, 13, 16, 19, 22** — six service page heroes.
4. **IMG-25 – 29** — process stages. These carry the differentiation.
5. Everything else.

---

## Slot 01 — Site hero

**IMG-01** · used as the full-bleed hero background, overlaid with a dark gradient
from the left. Keep the left third visually quiet or the headline won't read.

> A modern dark aluminium villa entrance gate in Bahrain at dusk, photographed
> three-quarter from the street. Clean horizontal slat infill, matte charcoal
> finish, low warm accent lighting grazing the slats. Contemporary limestone
> boundary wall. Composition weighted to the right, with the left third open and
> shadowed for text overlay. Wide 16:9.

---

## Home page

**IMG-02** · Sliding entrance gate, Riffa. 4:3.
> A wide aluminium sliding entrance gate on a contemporary Bahraini villa,
> photographed straight on in late afternoon light. Matte black horizontal slats,
> visible clean track line at ground level, crisp shadow across the driveway.

**IMG-03** · Louvred pergola, Saar. 4:3.
> An aluminium louvred pergola over a villa terrace, blades angled at roughly 45
> degrees casting striped shadows across pale stone paving. Charcoal frame,
> minimal posts, viewed from below at a slight angle to show blade depth.

**IMG-04** · Steel and glass balustrade, Janabiya. 4:3.
> An interior staircase balustrade in matte black steel with clear toughened glass
> infill and a slim round handrail. Photographed from the base looking up the
> flight. Pale plaster wall behind, hard directional daylight from one side.

**IMG-05** · Precision / weld macro. 4:3.
> Extreme close-up of a precisely finished steel corner joint, weld dressed
> completely flat and powder-coated matte charcoal. Shallow depth of field,
> raking light revealing the surface texture and the exactness of the edge.

---

## Gates page

**IMG-06** · Gates hero. 4:3.
> A large automated aluminium sliding gate on a Bahraini villa at dusk, seen from
> the street at a three-quarter angle. Warm interior light spilling through the
> slat gaps. Composed, symmetrical, architectural.

**IMG-07** · Coating / finish macro. 4:3.
> Macro detail of a freshly powder-coated matte charcoal aluminium profile, sharp
> clean edge running diagonally through frame, subtle even surface texture,
> raking light. Almost abstract.

**IMG-08** · Gate in façade context. 4:3.
> Wide architectural shot of a contemporary Bahraini villa frontage where the
> entrance gate visually aligns with the boundary wall coursing and the building's
> horizontal lines. Flat even daylight, straight-on, no perspective distortion.

**IMG-09** · Level check during install. 4:3.
> Close-up of a hand holding a spirit level against a freshly set matte black gate
> post, bubble visibly centred between the marks. Construction site background
> thrown out of focus. Documentary, unstaged.

---

## Pergolas page

**IMG-10** · Pergola hero. 4:3.
> An aluminium louvred pergola over a villa terrace at golden hour, low sun raking
> through the blades and casting long stripes across stone paving and outdoor
> seating. Charcoal frame, warm light, calm.

**IMG-11** · Louvre blade detail. 4:3.
> Tight detail of aluminium pergola louvre blades in matte charcoal, photographed
> from directly beneath looking up, hard sunlight cutting between the blades
> creating a strong geometric light-and-shadow pattern. Deep blue sky beyond.

**IMG-12** · Pergola in use. 4:3.
> Wide shot of a shaded villa terrace beneath an aluminium pergola: outdoor
> seating, stone paving, planting at the edges. Shot from inside the shade looking
> out toward bright sunlight. Comfortable and lived-in, no people.

---

## Railings page

**IMG-13** · Railings hero. 4:3.
> A minimal steel and glass staircase balustrade in a contemporary Bahraini villa
> interior. Matte black slim posts, clear glass panels, round handrail with a
> clean return at the top. Bright natural side light, pale walls.

**IMG-14** · Weld / joint macro. 4:3.
> Extreme macro of a stainless steel handrail joint, weld ground and polished
> completely flush so the seam is almost invisible. Reflective surface catching a
> soft window highlight. Shallow depth of field.

**IMG-15** · Balcony railing in context. 4:3.
> A matte black steel balcony railing on a modern Bahraini villa exterior,
> photographed from below at an angle. Even post spacing, clean top rail against a
> bright sky. Strong verticals, architectural.

---

## Canopies page

**IMG-16** · Canopy hero. 4:3.
> A cantilever car shade over a villa driveway in Bahrain, charcoal aluminium
> frame with a single row of posts on one side and a clear span over the parking
> bay. Hard midday sun, strong shadow cast on pale paving.

**IMG-17** · Base plate / anchor detail. 4:3.
> Close-up of a heavy steel base plate at the foot of a charcoal canopy post,
> bolted with six exposed anchor bolts into a concrete pad. Clean, precise,
> industrial-technical. Hard directional light.

**IMG-18** · Walkway cover. 4:3.
> A long covered walkway at a commercial property in Bahrain, repeating charcoal
> steel bays receding into perspective, roof panels overhead casting rhythmic
> shadows on the paving. One-point perspective, symmetrical.

---

## Custom fabrication page

**IMG-19** · Custom hero. 4:3.
> A laser-cut perforated aluminium privacy screen in matte charcoal, hard sunlight
> passing through and projecting its geometric pattern onto a pale plaster wall
> behind. Sharp shadows, minimal, contemporary. Geometric pattern, not ornate.

**IMG-20** · Drawing beside component. 4:3.
> A technical shop drawing on paper laid on a clean workbench beside the actual
> fabricated metal component it describes, in matte charcoal. Overhead flat lay,
> even light, precise and orderly. No readable text on the drawing.

**IMG-21** · Floating staircase. 4:3.
> A floating steel staircase in a contemporary Bahraini villa interior. Matte black
> stringer, cantilevered treads, minimal balustrade. Photographed from the side in
> bright natural light against a pale wall. Architectural and calm.

---

## Maintenance page

**IMG-22** · Corrosion detail. 4:3.
> Honest close-up of corrosion on an older painted steel gate: coating lifting and
> blistering along a weld seam, rust bleeding beneath. Documentary, sharp,
> unglamorous, hard daylight. Not dramatised.

**IMG-23** · Before / after split. 16:9.
> A split-frame comparison of the same steel gate section: left half showing rusted
> and failing paint, right half showing the same gate stripped, treated and
> recoated in clean matte charcoal. Identical camera angle and lighting on both
> halves, vertical dividing line down the centre.

---

## Projects gallery (additional)

**IMG-24** · Timber-effect swing gate, Hamala. 4:3.
> A double-leaf swing gate on a Bahraini villa in timber-effect coated aluminium,
> warm wood grain finish with a slim charcoal frame. Photographed straight on in
> soft late daylight. Contemporary, warm against the dark frame.

---

## Process page

These five carry the differentiation. Documentary tone — real, not staged.

**IMG-25** · Consultation. 4:3.
> Two people on a villa site reviewing a tablet and pointing toward a boundary
> wall, seen from behind and slightly to the side so no faces are identifiable.
> Bright natural daylight, professional, unposed.

**IMG-26** · Site measurement. 4:3.
> Hands holding a tape measure across a driveway entrance opening, laser measure
> and a spirit level resting on the ground beside. Documentary angle, hard
> daylight, real construction context. No faces.

**IMG-27** · Written scope. 4:3.
> Overhead flat lay on a dark desk: a printed multi-page specification document,
> two small metal finish sample swatches in charcoal and warm grey, and a pencil.
> Even soft light, orderly, premium. No readable text.

**IMG-28** · Fabrication. 4:3.
> Interior of a clean, well-lit metal fabrication workshop. A rectangular gate
> frame clamped in a jig on a large steel table, square and precise. Organised
> tools on the wall behind, cool daylight from high windows. No sparks, no flames.

**IMG-29** · Installation. 4:3.
> An installation in progress at a villa entrance: finished floor and wall
> surfaces covered with protective sheeting, tools laid out neatly, a charcoal
> gate leaf being positioned. Tidy and controlled. No faces.

---

## About page

**IMG-30** · Workshop wide. 16:9.
> Wide interior view of a modern metal fabrication workshop: high ceiling, natural
> light from clerestory windows, organised steel and aluminium stock racks, clean
> concrete floor, a large fabrication table in the foreground. Calm, competent,
> spotless. No sparks, no people.

**IMG-31** · Spirit level macro. 16:9.
> Extreme macro of a spirit level vial, the bubble sitting exactly centred between
> two engraved marks. Warm yellow-toned fluid, hard directional light, dark
> charcoal background, shallow depth of field. Abstract and precise — this is the
> logo idea photographed.

---

## Contact page

**IMG-32** · Workshop exterior. 16:9.
> Exterior of a modern industrial workshop unit in Bahrain: clean charcoal
> cladding, roller shutter door, pale sky, hard afternoon light. Understated and
> professional. No signage or readable text.

---

## Share image

**IMG-33** · Open Graph / link preview. **1.91:1**, 1200×630. Shown whenever the
site is shared on WhatsApp, Instagram or LinkedIn — often the first thing a lead
ever sees of Qobban.

> A matte charcoal aluminium villa gate photographed straight on at dusk, centred
> and symmetrical, warm light spilling through the slat gaps. Pale limestone
> boundary wall either side. Wide letterbox composition with the centre-left
> deliberately quiet and shadowed for a logo and headline overlay.

Add to every page's `<head>` once generated:
```html
<meta property="og:image" content="https://qobban.com/img/IMG-33.webp">
```

**Favicon** — no prompt needed. Export the Q-and-level logo mark already inlined
as SVG in every page header, on a `#1A1A1A` square, at 32px, 180px (Apple touch)
and 512px.

---

## Video and social

Reel, TikTok and social still prompts live in
[../AI/Social_Media_Prompt.md](../AI/Social_Media_Prompt.md) — six video concepts
and sixteen social stills, using the same style and negative blocks.

---

## Wiring images in

Once files are saved as `site/img/IMG-01.webp` etc.:

**Hero (IMG-01)** — in `index.html`, on the `.hero__media` div, add:
```html
<div class="hero__media" data-img="IMG-01" style="background-image:url('img/IMG-01.webp')"></div>
```

**All other slots** — replace each placeholder block:
```html
<div class="figure__ph" data-img="IMG-02">…</div>
```
with:
```html
<img src="img/IMG-02.webp" alt="Sliding entrance gate, Riffa" loading="lazy" width="1200" height="900">
```

Keep the surrounding `.figure` wrapper and the `.figure__dim` dimension label —
those are the Precision Engineering treatment, not decoration.

Always write a real `alt` description. Always keep `loading="lazy"` on anything
below the fold, and never on the hero.
