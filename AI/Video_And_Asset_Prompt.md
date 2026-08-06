# Video and Asset Generation Prompt

Session brief for producing Qobban's marketing video and image assets with AI
tools. Read this first, then the files it points to. It does **not** repeat the
style blocks or the prompt library — those live elsewhere and must not be
duplicated here.

## Read first, in this order

| File | What it gives you |
|---|---|
| [Social_Media_Prompt.md](Social_Media_Prompt.md) | The prompt library. Launch posts, pillar stills, stories, and **VID-01…VID-06** video prompts. Start here — most work is extending this, not writing new prompts |
| [Image_Generation_Rules.md](Image_Generation_Rules.md) | Style block, negative block, QA checklist, regional accuracy rules |
| [../site/IMAGE_PROMPTS.md](../site/IMAGE_PROMPTS.md) | The 33 website image slots and the global style/negative blocks as actually used |
| [../MARKETING/week-1-qobban/PRODUCTION-NOTES.md](../MARKETING/week-1-qobban/PRODUCTION-NOTES.md) | What was already produced, and which pieces are placeholders awaiting real photography |
| [../BRAND/Tone_of_Voice.md](../BRAND/Tone_of_Voice.md) | Voice for captions and on-screen text. Arabic is a rewrite, not a translation |

Do not read the whole repo. `MARKETING/` alone has several hundred generated
files; open only the folder you are producing into.

## What already exists

- **33 website images**, all wired and live. Generated, not photographed.
- **Week 1 social set**: 16 finished designs plus 3 no-text base visuals, with
  4:5 Instagram exports. See the week-1 folders and `tools/prepare_exports.py`.
- **Six video prompts** (VID-01…VID-06) — written, production-ready, **never
  generated**. No video asset exists yet. This is the largest gap.
- **`MARKETING/real raw images/` is empty.** There is still no real photography
  of Qobban's own work.

Several `MARKETING/` folders are untracked in git. Check `git status` before
assuming work is saved.

## Hard rules

These are not style preferences. Breaking them costs the brand its argument.

1. **Never present generated imagery as a completed Qobban project.** No named
   location, no "delivered in Riffa", no client attribution. Generated work
   illustrates a *capability*. The site's Projects page carries generated images
   as acknowledged placeholders until the client supplies real assets — video
   inherits exactly the same constraint.
2. **No sparks, flames, or industrial-macho staging.** Every competitor uses it.
   The whole positioning is "engineered, not dramatic". The negative block in
   [Image_Generation_Rules.md](Image_Generation_Rules.md) is mandatory.
3. **Bahrain must look like Bahrain.** Pale stone, hard sun, dust, coastal light.
   No lush lawns, no snow, no Western suburban housing.
4. **No claim the business cannot honour.** No warranty periods, coating
   specifications, certifications or lead times invented for a caption. Anything
   factual traces to a confirmed source — the site still carries 16 `[CONFIRM]`
   markers that are not yet verified.
5. **Prefer real over generated, always.** One imperfect phone photo of a real
   finished gate outperforms a flawless render, because it is true.

## Video

Specs: vertical **9:16** unless stated, no voiceover assumed. Composed cuts —
fast is fine, frantic is not. Same style and negative blocks as stills, so a
video frame and a feed still read as one system.

The six prompts are written and waiting. The work of this session is generating
them, judging the output, and iterating the prompts — not inventing new ones
before the existing set has been tried.

### Target tool: Seedance 2.0

Use the `seedance-prompt-gen` skill to convert a shot into Seedance's block
format. Do not hand-write the block.

Platform limits, which constrain the storyboard:

| Limit | Value |
|---|---|
| Output duration | **4–15 s** |
| Image references | ≤ 9 |
| Video references | ≤ 3, ≤ 15 s total |
| Audio references | ≤ 3 MP3, ≤ 15 s total |
| Total files | ≤ 12 |

**The six prompts were written before the tool was chosen, and three of them
overrun it.** VID-01 (20–25 s), VID-06 (20–25 s) and VID-05 (15–20 s) exceed the
15-second ceiling. Each needs either cutting to 15 s or splitting into two
generations joined in the edit — Seedance can merge with
`add a scene between @Video1 and @Video2`. Decide which before generating, not
after. VID-02, VID-03 and VID-04 already fit.

**Seedance's reference system is the reason it suits this project.** The 33
existing site images are a ready-made style bible: upload two or three as
`Location and mood reference` or `Composition and framing reference only` and the
video inherits the palette and framing the site already established. That is the
cheapest available guarantee that video and site read as one system — far more
reliable than restating the style block in prose. Keep a consistent set of
reference images across all six videos so the series holds together.

Always set `SFX only` — no music. Music is a per-platform edit decision, and
baked-in music cannot be removed later.

**Platform split matters and is already researched:** Instagram and TikTok take
the same source footage but not the same edit. TikTok needs a faster opening and
on-screen text in the first second; Instagram tolerates a composed build. Cut two
versions, don't cross-post one export. Bahrain audience data is in
[../RESEARCH/Bahrain_Market.md](../RESEARCH/Bahrain_Market.md).

**Expect AI video to fail at:** legible text, hands, consistent geometry across
cuts, and any mechanism that must move correctly (a gate hinge, a louvre blade
rotating). Storyboard around those weaknesses rather than fighting them — locked
-off cameras, macro detail, and short takes survive; long articulated motion does
not. Judge every clip for warped verticals before accepting it.

## Stills

Extend the existing pillar and story sets rather than starting a new system. The
week-1 production notes list exactly which slides are placeholders awaiting real
photography — those are the highest-value replacements the moment real photos
arrive.

## Arabic

Captions and on-screen text need Arabic, and Arabic here is a **rewrite, not a
translation** — see [../BRAND/Tone_of_Voice.md](../BRAND/Tone_of_Voice.md). Do
not machine-translate an English caption and ship it. Numbers and phone numbers
inside Arabic text need bidi isolation or they render reversed.

## How to work

- **Push back before generating.** If a concept misrepresents the business or
  duplicates existing work, say so and propose the alternative.
- **Generate in small batches and judge honestly.** Three good clips beat twelve
  mediocre ones. Say which outputs failed and why — never report an asset as
  usable without having looked at it.
- **Record what was produced** in the relevant `PRODUCTION-NOTES.md`, including
  which pieces are placeholders and what should replace them. This is the habit
  that keeps generated work from silently becoming a false claim.
- **Name files predictably** and keep source renders alongside exports, matching
  the week-1 folder pattern.
- **State what you did not do** and why.

## Do this first

1. Pick the 2–3 site images that will serve as shared style references for the
   whole video series, and keep them fixed.
2. Generate **VID-04** (precision close-ups) first, not VID-01. It fits inside
   15 s untouched, and macro detail is where AI video is strongest — so it proves
   the style with the least chance of failing for reasons unrelated to the prompt.
3. Then VID-02 (gate before/after), also within the limit, and the strongest
   single piece of sales content of the six.
4. Only then VID-01, once the recut or split has been decided.
5. Judge every output against the hard rules above. Iterate the prompt, not the
   subject.
6. Write the results into a production-notes file before generating more.

## Status

- Written 2026-07-30
- No video asset has been produced yet; all six prompts are untested
- Three of the six exceed Seedance's 15-second ceiling and need recutting
- Real photography still does not exist — the single biggest constraint on
  everything in this document

## Related documents

[Social_Media_Prompt.md](Social_Media_Prompt.md) ·
[Image_Generation_Rules.md](Image_Generation_Rules.md) ·
[../MARKETING/Content_Pillars.md](../MARKETING/Content_Pillars.md) ·
[../MARKETING/Reels_Strategy.md](../MARKETING/Reels_Strategy.md) ·
[../MARKETING/Caption_Guidelines.md](../MARKETING/Caption_Guidelines.md)
