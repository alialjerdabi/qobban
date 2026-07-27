# Token Efficiency Research

Research date: 2026-07-27. Scope: reducing token usage in Claude Code on large,
documentation-heavy repositories without degrading output quality.

## 1. The single constraint everything follows from

Claude Code re-sends the whole conversation on every turn. Cost and quality both
scale with context size: "LLM performance degrades as context fills" and Claude
"may start forgetting earlier instructions or making more mistakes"
([best-practices](https://code.claude.com/docs/en/best-practices)). Anthropic's
context-engineering guidance frames the goal as "finding the smallest set of
high-signal tokens that maximize the likelihood of some desired outcome"
([Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

Therefore: token efficiency and answer quality are the *same* optimization up to
a point. Past that point (starving Claude of files it genuinely needs) they
diverge — see Risks.

## 2. Verified recommendations from official documentation

### CLAUDE.md
- Loaded into context at the start of **every** session, in full, regardless of
  length. Target **under 200 lines**. ([memory](https://code.claude.com/docs/en/memory))
- Test each line with: *"Would removing this cause Claude to make mistakes?"* If
  not, cut it. "Bloated CLAUDE.md files cause Claude to ignore your actual
  instructions." (best-practices)
- Exclude: anything Claude can derive by reading files, standard conventions,
  long explanations, file-by-file descriptions, frequently-changing info.
- Include: non-guessable commands, conventions that differ from defaults,
  repository etiquette, architectural decisions, gotchas.
- `@path` imports are for *organization only* — imported files load at launch and
  cost the same tokens. Splitting via imports does **not** reduce context. (memory)
- HTML block comments in CLAUDE.md are stripped before injection — free space for
  maintainer notes. (memory)
- Compaction instructions can be written into CLAUDE.md, e.g. "when compacting,
  preserve the full list of modified files". (best-practices, costs)

### Splitting instructions: per-folder vs centralized
Official answer: **both, by role.** (memory, [large-codebases](https://code.claude.com/docs/en/large-codebases))
- Root `CLAUDE.md` = repository-wide rules only.
- Ancestor CLAUDE.md files load **in full at launch**; subdirectory CLAUDE.md files
  load **on demand** when Claude reads a file in that directory.
- `.claude/rules/*.md` without `paths:` frontmatter load every session (same cost
  as CLAUDE.md). With `paths:` frontmatter they load only when Claude touches a
  matching file — this is the main lever for scoping instruction cost.
- Skills (`.claude/skills/*/SKILL.md`) load only their name + description until
  invoked. Docs explicitly recommend moving specialized workflow instructions out
  of CLAUDE.md and into skills. ([costs](https://code.claude.com/docs/en/costs))
- Where you *launch* Claude determines what loads: starting in a subdirectory
  loads that directory's + ancestors' CLAUDE.md only. (large-codebases)

Cost ranking, cheapest first: **skills → path-scoped rules → subdirectory
CLAUDE.md → unscoped rules → root CLAUDE.md → @imports.**

### Preventing unnecessary file reads
- Content searches respect `.gitignore` automatically. For checked-in noise, use
  `permissions.deny` `Read(...)` rules. (large-codebases)
- `claudeMdExcludes` skips irrelevant CLAUDE.md/rules files by glob. (memory)
- Write specific prompts: "vague requests like 'improve this codebase' trigger
  broad scanning." (costs)
- Named failure mode — **"the infinite exploration"**: an unscoped "investigate X"
  makes Claude read hundreds of files. Fix: scope narrowly, or delegate to a
  subagent. (best-practices)

### Subagents without duplicating context
- Subagents run in **separate context windows** and return only a summary; the
  parent conversation stays clean. Anthropic's context-engineering post puts
  typical returned summaries at 1,000–2,000 tokens.
- Subagents do **not** inherit the parent conversation or the main auto-memory —
  only a `fork` does. So a subagent must be given a self-contained brief; that
  brief is the only duplicated context. (memory, [sub-agents](https://code.claude.com/docs/en/sub-agents))
- Best uses: verbose operations (test runs, log processing, doc fetching), broad
  research, and adversarial review of a finished diff. (costs, best-practices)
- Cost caveat: each subagent builds its **own cache from cold** and uses the
  5-minute TTL even on a subscription. Agent *teams* use roughly **7x** the tokens
  of a standard session. ([prompt-caching](https://code.claude.com/docs/en/prompt-caching), costs)

### Explore → plan → implement → verify
- Official four-phase workflow: explore in plan mode, plan, implement, commit.
- Explicit counter-rule: **plan mode adds overhead**. "If you could describe the
  diff in one sentence, skip the plan." Plan when the approach is uncertain, the
  change spans multiple files, or the area is unfamiliar. (best-practices)
- For long/cross-cutting work, **write the plan to a file** — it survives
  compaction where conversation history may not. (large-codebases)
- Give Claude a check it can run; have it show evidence (command output), not
  assertions. (best-practices)

### Session hygiene / avoiding repeated explanation
- `/clear` between unrelated tasks; `/compact <instructions>` at natural breaks.
- After **two** failed corrections on the same issue, `/clear` and re-prompt with
  what you learned — a clean session with a better prompt beats a long polluted one.
- `/rewind` is cheaper than `/compact`: it truncates to an already-cached prefix,
  while compaction builds a new one.
- Session-to-session continuity is officially handled by CLAUDE.md (durable rules)
  and auto memory (`MEMORY.md`, first 200 lines / 25KB loaded each session).
- `/btw` answers side questions in an overlay that never enters history.
  (best-practices, costs, memory)

### Prompt caching (Claude Code manages it automatically)
- Request layers, ordered most-stable first: **system prompt → project context
  (CLAUDE.md, memory, unscoped rules) → conversation**. Matching is an exact
  prefix match; a change anywhere invalidates everything after it.
- Invalidates the full cache: switching model, changing effort level, enabling
  fast mode mid-session, connecting/disconnecting an MCP server whose tools load
  into the prefix, denying a whole tool, upgrading Claude Code, resuming after an
  upgrade, and `/compact` (conversation layer).
- Keeps the cache: editing files, editing CLAUDE.md mid-session (the edit also
  doesn't apply until restart), changing output style or permission mode,
  invoking skills/commands, `/recap`, `/rewind`, spawning a subagent.
- TTL is 1 hour on a Claude subscription, 5 minutes on API keys/cloud providers
  (`ENABLE_PROMPT_CACHING_1H=1` to opt in).
- Actionable rule: **pick model and effort at the top of a session and don't
  change them mid-task.** Cache reads bill at ~10% of standard input rate.
  (prompt-caching)

### Other verified levers
- Match model to task; Sonnet for most work, Haiku for simple subagents. (costs)
- Prefer CLI tools (`gh`, `aws`) over MCP servers — no per-tool listing cost.
  MCP tool definitions are deferred by default; `/context` shows what's loaded.
- Hooks can preprocess data before Claude sees it (e.g. grep a log for `ERROR`),
  turning tens of thousands of tokens into hundreds.
- Lower extended-thinking effort for simple tasks; thinking bills as output tokens.
- Code-intelligence plugins replace grep-plus-read-candidates with one lookup
  (typed languages only — irrelevant to a markdown repository).

## 3. Strong community practices (not official, but widely corroborated)

- Keep CLAUDE.md nearer **~500 tokens** than the 200-line ceiling; the ceiling is
  a limit, not a target.
- Maintain a session-notes / handoff file and load it at the start of the next
  session instead of re-explaining. (Aligns with Anthropic's "structured
  note-taking" principle, which cites NOTES.md-style external memory.)
- One task per chat; treat sessions as branches.
- Reference files with `@` rather than pasting their contents.
- Maintain a hand-written **context index** mapping task type → the 3–5 files
  worth reading, so Claude can skip discovery entirely.
- Ask for compact output formats (tables, bullet lists, file:line references) —
  output tokens are billed at the highest rate and thinking counts as output.

Representative sources: [Claude Code token optimization](https://buildtolaunch.substack.com/p/claude-code-token-optimization),
[context-management guide](https://claudefa.st/blog/guide/mechanics/context-management),
[token-efficiency CLAUDE.md example](https://github.com/drona23/claude-token-efficient),
[reducing token usage workflow gist](https://gist.github.com/dholdaway/8009f089d3407e14f3d753f2a70eb63e).

## 4. Uncertain or environment-dependent

- **Exact token figures** for CLAUDE.md/rules overhead. Verify locally with
  `/context` and `/usage`; do not trust blog numbers.
- **Whether subagents save money** on any given task. They always save *parent*
  context, but a cold cache plus a self-contained brief can cost more in total
  than doing the work inline. Worth it for large-fan-out reads; wasteful for a
  two-file lookup.
- **Auto memory** behaviour (`autoMemoryEnabled`, storage path) depends on version
  and settings and is machine-local — it will not carry across the user's other
  machines or cloud sessions.
- **Version-gated features** noted in the docs (`claudeMdExcludes`, path-scoped
  rules, `/doctor` CLAUDE.md trimming, sparse worktrees) require recent Claude
  Code versions. Check `claude --version`.
- **Plan mode value** is genuinely task-dependent; the docs both recommend and
  warn about it.
- **This repository is not code.** Guidance built around test suites, linters,
  language servers, and sparse git worktrees does not apply. Qobban is ~180
  markdown business documents, and "verification" here means consistency and
  cross-reference checks, not a build passing.

## 5. Risks and limitations

- **Over-restriction degrades quality.** A rule like "read at most 3 files" causes
  confident answers built on missing context. The rules in this project state a
  *default* plus an explicit escape hatch: read more when the task requires it and
  say why.
- **Instruction files are themselves a token cost.** Every rule added to
  `.claude/rules/` without `paths:` frontmatter is paid on every session forever.
  Rules must earn their place; prune them.
- **CLAUDE.md is guidance, not enforcement.** It is delivered as a user message
  after the system prompt; there is no compliance guarantee. Use hooks or
  `permissions.deny` for anything that must hold.
- **Contradictions are worse than verbosity.** If two rule files disagree, Claude
  may pick either arbitrarily. Keep each rule in exactly one file.
- **Terse reporting can hide problems.** Compact summaries must still surface
  failures, skipped work, and assumptions.
- **Documentation drifts.** These findings reflect docs as of 2026-07-27; re-check
  after major Claude Code or model releases, since some workarounds become
  unnecessary.

## Sources

Official:
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
- [Memory and project instructions](https://code.claude.com/docs/en/memory)
- [Manage costs / reduce token usage](https://code.claude.com/docs/en/costs)
- [Monorepos and large codebases](https://code.claude.com/docs/en/large-codebases)
- [How Claude Code uses prompt caching](https://code.claude.com/docs/en/prompt-caching)
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

Community: linked inline in section 3.
