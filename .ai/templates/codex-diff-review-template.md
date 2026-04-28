# Codex Diff Review Prompt

Read:
- AGENTS.md
- .ai/project.json
- project guide file

Review the current git diff only.

Return:
1. Blocking bugs
2. Security risks
3. Privacy risks
4. Broken build or test risks
5. Wrong-project changes
6. Missing validation
7. Tool-mode problems
8. Exact files and lines where possible

Do not nitpick style.
Do not request optional refactors.
Do not expand scope.