# Codex Fallback Build

Use this only when Louie explicitly chooses Codex as builder or Claude Code usage is exhausted.

Read:
- AGENTS.md
- .ai/project.json
- project guide file
- Phase Packet
- .ai\templates\codex-fallback-builder-template.md

If project_id is innerzero_desktop, also read:
- C:\Users\sumlu\Documents\InnerZero\.claude\skills\innerzero-context\SKILL.md

Rules:
- follow the Phase Packet exactly
- do not expand scope
- do not touch protected files
- do not add dependencies without approval
- run validation
- write a report to .ai\reports\
- write or update post-audit in .ai\audits\post\
- stage explicit paths only if Louie asks for commit
- never use git add -A
- never merge main
- never publish releases