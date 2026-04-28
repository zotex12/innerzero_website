---
description: Run a pre-build audit before implementation.
---

Read AGENTS.md, .ai/project.json, and the project guide.

Do not edit source code.

Create a pre-audit report in:
.ai\audits\pre\

Use .ai\templates\pre-audit-template.md if present.

Check:
- correct project root
- correct git remote
- correct guide file
- scope clarity
- likely files
- protected files
- risk level
- manual approval needed
- validation commands
- tool mode
- stop conditions

If Codex plugin is available and the task is medium or high risk, run:
/codex:adversarial-review --background focus on the plan, scope, security, privacy, wrong-project risk, tool-mode risk, and simpler safer approaches

If Codex is unavailable, use Claude review/subagents/manual audit template.

Do not expand scope.
Do not write code.