# Qobban — Project Instructions

Qobban is a **documentation repository**: ~180 markdown files covering brand,
sales, services, operations, process, website and web-app specs. There is no
build, no test suite, no application code. Most files are still `TBD` stubs
awaiting content.

Detailed operating rules live in `.claude/rules/` and load automatically:
`token-efficiency.md`, `context-loading.md`, `task-execution.md`, `documentation.md`.

## Reading files

- Read only the files the current task needs. Start from `AI/CONTEXT_INDEX.md`,
  not from a repository scan.
- Use Glob/Grep to locate content; read whole files only when you will edit them.
- Never read the whole repository, a whole top-level folder, or every `README.md`
  unless the task is explicitly repository-wide. If it is, say so first.

## Before editing

- One sentence of intent for a single-file edit. No plan needed.
- For anything touching 3+ files or a document's structure: list the files and the
  change per file, and get agreement before writing.
- State assumptions instead of asking blocking questions, unless a wrong guess
  would waste real work.

## Reporting

- Answer first, in the fewest words that are complete. No preamble, no recap of
  the request, no restating what a file already says.
- Report changes as `path — what changed`. Link files as clickable paths.
- Say plainly what you did **not** do and why. Never claim verification you
  didn't perform.

## Avoiding repeated context

- End substantial sessions by writing `AI/HANDOFF.md` from `AI/HANDOFF_TEMPLATE.md`.
  Start the next session by reading it — do not re-derive project state.
- If you re-explain the same thing twice across sessions, it belongs in a rules
  file or in `AI/CONTEXT_INDEX.md`. Propose the edit.

## Verification

- Verification here is textual, not executable: re-read what you wrote, check
  cross-references resolve to real files, check terms match `11_GLOSSARY.md`,
  check the document's existing heading structure was preserved.
- Show the evidence (the grep, the diff, the file list), not a claim of success.

## Protecting existing files

- Never overwrite a file you have not read in this session.
- Never delete or rename files, and never mass-edit multiple files, without
  explicit approval.
- Edit in place; do not create `*_v2.md`, `*_new.md`, or parallel copies.
- Do not touch files outside the task's scope. No commits or pushes unless asked.

<!-- Rationale and sources: TOKEN_EFFICIENCY_RESEARCH.md. HTML comments are
     stripped before this file enters context, so they cost no tokens. -->
