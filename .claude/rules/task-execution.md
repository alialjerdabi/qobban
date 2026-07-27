# Task Execution

Six steps. Scale each to the task — a typo fix is understand → execute.
File selection: `context-loading.md`. Document conventions: `documentation.md`.

## 1. Understand
Restate the goal in one line, including what is out of scope. If two readings of
the request lead to materially different work, ask now — one question, then stop.
Otherwise state your assumption and continue.

## 2. Inspect
Open only what step 1 requires (`context-loading.md`). Note what already exists:
the file's current headings, its status block, and any document it cross-links.
Do not begin writing until you know whether the target is a stub or has content.

## 3. Plan
- 1–2 files, obvious change → skip. Say what you're about to do in one sentence.
- 3+ files, or a structural change, or an unfamiliar area → list `file — change`,
  one line each, and wait for agreement.
- More than ~6 files or multiple sessions → write the plan to `AI/HANDOFF.md`
  first. Conversation history is summarized away; a file isn't.

## 4. Execute
Edit in place, one file at a time, smallest change that does the job. Follow the
document's existing structure and heading style. Never overwrite a file you
haven't read this session. No new variant files. No commits or pushes.

## 5. Verify
No test suite here — verification is textual:
- Re-read what you wrote, in the file, not from memory.
- Cross-references point to files that exist (Glob to confirm).
- Terminology matches `11_GLOSSARY.md`; tone matches `BRAND/Tone_of_Voice.md` for
  anything customer-facing.
- Original headings and status blocks survived the edit.
Show the evidence. If you skipped a check, say which one.

## 6. Summarize
Under 10 lines:
- what changed — `path — change`, one line per file
- decisions or assumptions made
- what's unresolved
- the single next action

For a session worth resuming, write it to `AI/HANDOFF.md` using
`AI/HANDOFF_TEMPLATE.md` instead of only into chat.
