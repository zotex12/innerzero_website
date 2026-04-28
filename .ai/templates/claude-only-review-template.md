# Claude-Only Review Prompt

Use this when Codex is unavailable.

Read:
- AGENTS.md
- .ai/project.json
- project guide file

Review the current plan or diff.

Return only:
1. Blocking bugs
2. Security risks
3. Privacy risks
4. Wrong-project changes
5. Broken build or test risks
6. Missing validation
7. Scope creep

Do not nitpick style.
Do not expand scope unless needed to prevent a blocker.