---
description: Use Codex as fallback builder when Claude Code usage is exhausted.
---

Use this only when Louie explicitly says Codex should build or Claude Code usage is exhausted.

Read:
- AGENTS.md
- .ai/project.json
- the project guide
- .ai\templates\codex-fallback-builder-template.md
- the relevant Phase Packet

If this is InnerZero Desktop, also read:
- .claude\skills\innerzero-context\SKILL.md

Rules:
- Do not expand scope.
- Do not touch protected files.
- Do not add dependencies without approval.
- Do not use git add -A.
- Stage explicit paths only.
- Run validation.
- Run post-audit after implementation.
- Stop on uncertainty.