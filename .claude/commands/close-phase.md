---
description: Close the current supervised phase safely.
---

Close the current phase using AGENTS.md and .ai/project.json.

Required:
1. Run git status.
2. Confirm project root and remote.
3. Confirm validation results.
4. Confirm post-audit exists or explain why it is not needed.
5. Update the project guide only if state or map changed.
6. Update phase history only if this project uses one and this is phase closeout.
7. Regenerate project map only if files were added, deleted, moved, or renamed.
8. Stage explicit paths only.
9. Commit once only after validation.
10. Push only after commit.
11. Final report with files changed, checks run, audit results, risks, commit hash, and push status.

Never use git add -A.
Never force-push main.