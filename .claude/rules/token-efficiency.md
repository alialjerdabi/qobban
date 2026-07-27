# Token Efficiency

Apply on every task. File-selection detail: `context-loading.md`.

## Output
- Shortest complete answer. No preamble, no restating the request, no summary of
  a summary. Prose only where a list would lose meaning.
- Don't echo file contents back. Quote the 1–3 lines that matter, cite the rest
  as `path:line`.
- Don't list options you aren't going to take. Recommend one and proceed.
- Don't re-explain a decision already recorded in `AI/HANDOFF.md` or a rules file.

## Work
- Match effort to the task. A one-line edit gets no plan, no exploration, no
  verification pass beyond re-reading the edit.
- Stop when the task is done. Don't volunteer adjacent improvements — note them
  in one line and move on.
- Two failed attempts at the same thing: stop, say what's blocking, ask.

## Tools
- Batch independent tool calls in one message.
- Grep/Glob before Read. Read with `offset`/`limit` when you need one section.
- One search that answers the question beats three that narrow it.
- Don't re-read a file you already read or just edited this session.

## Delegation
- Delegate to a subagent only when the work reads many files and you need just
  the conclusion (broad search, cross-repo audit, verbose output). Give the
  subagent a self-contained brief — it inherits none of this conversation.
- Do not delegate a 1–3 file lookup; the brief plus cold start costs more.

## Session
- Pick model and effort at session start; changing mid-session discards the
  prompt cache and re-bills the whole conversation.
- Suggest `/clear` when the topic changes, and `/compact` at task boundaries
  rather than mid-task.
- When compacting, preserve: changed files, open decisions, and the next action.
