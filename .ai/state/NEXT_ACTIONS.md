# Next Actions

No scheduled work. The next phase will originate from a Louie-chosen task drawn from the WEBCLAUDE.md "Remaining website work" backlog or from an ad-hoc request.

When that phase starts:
1. Read WEBCLAUDE.md, AGENTS.md, .ai/project.json.
2. Run /pre-audit if the task is risky, cross-repo, API, auth, cloud, licence, pricing, privacy, legal, or public-copy work.
3. Implement.
4. Run /post-audit before closeout.
5. Stage explicit paths only. No git add -A.

Manual approval required for:
- billing/licence/cloud schema changes
- Supabase RLS
- privacy/legal wording
- new dependencies
- production release
- main branch merge
- Vercel environment variable changes
- pricing changes
