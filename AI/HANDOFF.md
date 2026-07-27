# Handoff

**Session:** 2026-07-27 · **Task:** Bahrain market research + brand/website foundation

**Completed**
- Token-efficiency system (CLAUDE.md, 4 rules files, AI templates, context index)
- Bahrain market + competitor research from public sources
- Foundation docs: positioning, target market, brand essence, colour, typography,
  tone of voice, website strategy, sitemap, project overview

**Changed files**
- `TOKEN_EFFICIENCY_RESEARCH.md`, `CLAUDE.md`, `.claude/rules/*.md` (4)
- `AI/CONTEXT_INDEX.md`, `AI/TASK_TEMPLATE.md`, `AI/HANDOFF_TEMPLATE.md`
- `00_PROJECT_OVERVIEW.md`, `04_POSITIONING.md`, `05_TARGET_MARKET.md`
- `RESEARCH/Bahrain_Market.md`, `RESEARCH/Competitor_Research.md`
- `BRAND/Brand_Essence.md`, `Color_System.md`, `Typography.md`, `Tone_of_Voice.md`
- `WEBSITE/Website_Strategy.md`, `Sitemap.md`

**Decisions**
- Website direction locked: Precision Engineering · rich-but-purposeful motion ·
  English-first RTL-ready · lead-capture engine
- Positioning: "Built with precision. Finished for Bahrain. Designed to belong."
- Differentiator is a written priced scope (material + coating + warranty), not
  "free consultation" — the market already gives that away
- Market gap: no Bahrain competitor combines designed brand + visible craft
  process + full metalwork range

**Corrections to the client's marketing report**
- Instagram Bahrain is 1.10M users, not 1.31M (that figure is total social identities)
- TikTok out-reaches Instagram among Bahraini adults (101.4% vs 85.1% ad reach)
- Instagram Bahrain skews 59.6% male

**Open**
- `[CONFIRM]` project photography exists? Changes launch sequence and Projects page
- `[CONFIRM]` Instagram-only or add TikTok/Snapchat
- `[CONFIRM]` company facts: founding year, team size, capacity, warranty terms,
  Gotham web licence, Arabic copywriter
- Instagram competitor performance data unobtainable (login wall) — all such
  claims are inference

**Website built (2026-07-27)**
- `site/` — static HTML/CSS/JS, no build step. 12 pages, all links verified.
- Precision Engineering direction, level-bubble hero animation, scroll reveals,
  6-step quote flow that hands a qualified lead to WhatsApp.
- `site/IMAGE_PROMPTS.md` — 32 image slots with GPT-5 prompts. Placeholders on
  the page print their own `IMG-XX` id for matching.
- Placeholder values to replace before launch: `973XXXXXXXX` (phone/WhatsApp),
  `info@qobban.com`, workshop address and hours, Instagram/TikTok URLs.
- Client confirmed: some project photos exist but are not production-ready —
  gallery runs on generated imagery. TikTok added as a channel.

**Next action**
- Fill remaining `TBD` stubs by folder: SERVICES → CUSTOMERS → MARKETING
  (incl. TikTok channel strategy) → PROCESS/OPERATIONS → remaining WEBSITE.

**Read first next time**
- `AI/CONTEXT_INDEX.md`, `04_POSITIONING.md`, `WEBSITE/Website_Strategy.md`
