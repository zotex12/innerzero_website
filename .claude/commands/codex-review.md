---
description: Run Codex review for the current project diff.
---

Read AGENTS.md, .ai/project.json, and the project guide.

Review the current git diff only.

Use /codex:review --background if the OpenAI Codex plugin is available.

For risky changes, use /codex:adversarial-review --background and focus on the risk areas listed in AGENTS.md.

If Codex is unavailable, say so and use .ai\templates\claude-only-review-template.md instead.

Return only:
- blocking bugs
- security risks
- privacy risks
- wrong-project changes
- broken build or test risks
- missing validation
- exact files or lines where possible

Do not nitpick style.
Do not expand scope.