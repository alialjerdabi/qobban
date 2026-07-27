# Documentation

How Qobban's markdown is written and kept non-duplicative.

## One fact, one home
Each fact lives in exactly one file. Elsewhere, link to it: `See [Tone of Voice](BRAND/Tone_of_Voice.md)`.
Never restate a definition, price, process step, or positioning line in a second
document. If two files already disagree, fix the owner and link from the other —
don't reconcile by copying.

Ownership follows the folder map in `context-loading.md`. Terms are defined once,
in `11_GLOSSARY.md`.

## Before creating a file
Grep for the topic first. Prefer extending an existing document. A new file needs
a distinct owner topic and a link from its folder's `README.md`. Never create a
second version of an existing file (`*_v2`, `*_new`, `*_final`).

## File shape
Keep each document's existing structure. New content follows the repo pattern:
`# Title` → short purpose → substantive sections → status. Replace `TBD` bodies
with real content; don't add a second `Purpose` section alongside the old one.

Aim for the shortest document that is complete. Prefer tables and lists over
narrative. Cut anything a reader can get from a linked document.

## Summaries
`README.md` in each folder: one line per file, what it's for. Nothing else — no
content duplicated from the files it indexes.
`AI/CONTEXT_INDEX.md`: task type → files to read. Update it when a folder gains
or loses a document.
`AI/HANDOFF.md`: current working state only. Overwrite it each session; it is not
a log, and it is not documentation.

## Maintenance
When you change a document, check in the same pass:
- links into it still resolve
- its folder `README.md` line is still accurate
- no other file now contradicts it (grep the key term)

Say what you checked. Don't silently update three files to match one edit —
list them first.
