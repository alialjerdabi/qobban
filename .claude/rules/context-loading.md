# Context Loading

Decides *which* files to open. Reporting and effort rules: `token-efficiency.md`.

## Do not scan the repository
Qobban has ~180 markdown files. Never open a whole folder, never read every
`README.md`, never walk the tree "to understand the project". If a task genuinely
needs a repository-wide pass, say so and get agreement first.

## Order of resolution
1. Files the user named or `@`-referenced — read those.
2. `AI/CONTEXT_INDEX.md` — maps task type to the files that matter.
3. `AI/HANDOFF.md` — current state, if the task continues prior work.
4. Grep for the specific term across `*.md`.
5. Only then, list a folder.

Stop as soon as you can act. Don't collect context you haven't used yet.

## How much to read
- Editing a file → read it in full first.
- Referencing a file → grep it, or read the relevant section with `offset`/`limit`.
- Checking whether something exists → Glob or Grep, never Read.
- Default budget: **about 5 files.** Going over is fine when the task needs it —
  say which extra files you're opening and why. Guessing to stay under budget is
  worse than reading one more file.

## Folder scope
Read within the folder that owns the topic; cross into another only when the task
spans both.

`BRAND/` voice, colour, logo · `SALES/` scripts, pipeline · `SERVICES/` offerings ·
`PROCESS/` client-facing stages · `OPERATIONS/` internal checklists, roles ·
`MARKETING/` content, SEO, campaigns · `CUSTOMERS/` segments, objections ·
`WEBSITE/` site pages and IA · `WEB_APP/` product specs · `RESEARCH/` market and
material research · `AI/` prompts, templates, index · `00–11_*.md` company-level
positioning.

## Never load
Binary or image assets, anything under a `.git` directory, and stub files whose
body is only `TBD` — check the file's size or grep it before reading it.
