# Task Template

A low-token task prompt. Fill the four lines, delete the rest. Specificity here is
what prevents Claude from scanning the repository.

---

**Task:** <what to produce, one line>
**Files:** <exact paths to read/edit — or "find it" if genuinely unknown>
**Out of scope:** <what not to touch>
**Done when:** <the checkable condition>

---

## Notes

- Name the files. An unnamed target triggers a search, and a search across ~180
  markdown files is the most expensive thing in this repo.
- "Out of scope" prevents helpful-but-unasked-for edits to neighbouring documents.
- "Done when" replaces a verification round-trip: Claude checks itself.
- Add `Plan first.` only when the change spans 3+ files or restructures a document.
- Add `Research only, don't edit.` when you want findings, not changes.
- Continuing prior work? Replace **Files** with `Read AI/HANDOFF.md first.`

## Example

**Task:** Write the body of `SERVICES/Pergolas.md`.
**Files:** `SERVICES/Pergolas.md`, `SERVICES/Canopies_and_Car_Shades.md` (for structure), `BRAND/Tone_of_Voice.md`.
**Out of scope:** other `SERVICES/` files, `WEBSITE/`.
**Done when:** the file follows the same heading structure as the canopies page and no `TBD` remains.
