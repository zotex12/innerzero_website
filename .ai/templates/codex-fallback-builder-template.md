# Codex Fallback Builder Prompt

Use this only when Claude Code usage is exhausted, Claude Code is unavailable, or Louie explicitly chooses Codex as builder.

Read:
- AGENTS.md
- .ai/project.json
- project guide file
- Phase Packet
- project-specific skill if listed in AGENTS.md

Rules:
- Follow the Phase Packet exactly.
- Do not expand scope.
- Do not touch protected files.
- Do not use git add -A.
- Stage explicit paths only.
- Do not merge main.
- Do not publish releases.
- Do not add dependencies without approval.
- Do not change billing, licence, legal, privacy, Supabase RLS, Vercel env, installer signing, or production config without approval.
- Run validation.
- Write a post-build report.
- Run or write a post-audit.
- Stop on uncertainty.

Final report:
- files changed
- validation run
- audit result
- risks
- blockers
- suggested next step