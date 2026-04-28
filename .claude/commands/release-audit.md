---
description: Run a release-level audit before merge, release, or beta build.
---

Read AGENTS.md, .ai/project.json, and the project guide.

Do not release anything.
Do not merge anything.
Do not push beta builds.

Create a release audit report in:
.ai\audits\release\

Use .ai\templates\release-audit-template.md if present.

Check:
- root, remote, branch
- git status
- changed files against main
- validation commands
- security review
- Codex review if available
- Claude review if Codex unavailable
- public copy rules
- privacy/legal risks
- installer/build risks
- cloud/API/licence/billing risks
- manual testing needed

Decision must be one of:
- release ready
- beta only
- blocked