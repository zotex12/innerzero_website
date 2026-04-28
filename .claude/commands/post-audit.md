---
description: Run a post-build audit on the current git diff.
---

Read AGENTS.md, .ai/project.json, and the project guide.

Review current git diff only.

Create a post-audit report in:
.ai\audits\post\

Use .ai\templates\post-audit-template.md if present.

Run or confirm:
- git status
- git diff --stat
- no protected files changed
- validation commands relevant to this project
- docs updated only if needed
- tool mode recorded

If Codex plugin is available, run:
/codex:review --background

For high-risk changes, also run:
/codex:adversarial-review --background focus on security, privacy, data loss, approval bypass, runtime risk, schema drift, rollback, and tool-mode risk

If Codex is unavailable, use Claude review/subagents/manual audit template.

Return blockers only.
Do not apply fixes unless Louie asks.