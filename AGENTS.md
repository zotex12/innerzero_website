<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Workflow 1 safety section

Project: InnerZero Website
Root: C:\Users\sumlu\Documents\innerzero_website
Expected remote slug: zotex12/innerzero_website
Main guide: C:\Users\sumlu\Documents\innerzero_website\WEBCLAUDE.md

Before touching files:
1. cd C:\Users\sumlu\Documents\innerzero_website
2. Run Get-Location
3. Run git remote -v
4. Run git branch --show-current
5. Run git status --short
6. Read AGENTS.md
7. Read .ai\project.json
8. Read C:\Users\sumlu\Documents\innerzero_website\WEBCLAUDE.md

Stop if folder, remote, branch, or guide file is wrong.

Rules:
- No invented stats, testimonials, download claims, ratings, users, or fake traction.
- No "free forever", "always free", "for life", or "permanent" for the local app.
- No em dashes in customer-facing copy, commit messages, PR descriptions, README, release notes, or app UI.
- Tailwind utilities and existing design tokens only.
- Server components by default.
- No new packages without explicit approval.
- Never bypass CSP, security headers, Supabase RLS, Stripe safety, licence validation, cloud billing, or CORS rules.
- Do not touch .env.local.
- Do not change Vercel environment variables without explicit approval.
- Do not use git add -A.
- Stage explicit paths only.

Tool availability:
- Preferred: Claude Code primary builder, Codex reviewer and fallback builder.
- Claude Code only mode: use Claude Code for build and Claude review/subagents/audit templates instead of Codex.
- Codex only mode: use Codex as builder after reading AGENTS.md, .ai\project.json, WEBCLAUDE.md, and the Phase Packet.
- Two-tool mode: builder implements, opposite model reviews, Louie manually approves risky changes.

Audit rules:
- Run pre-audit before normal, risky, cross-repo, API, auth, cloud, licence, pricing, privacy, legal, or public-copy work.
- Run post-audit after every implementation before closeout.
- Run release-audit before beta, release, merge, pricing/legal/privacy, Stripe, Supabase, Vercel env, licence, cloud, or public launch work.

Validation:
- npm run lint
- npm run build
- route checks for changed pages
- security grep before commit

Final report:
- files changed
- routes changed
- validation results
- audit results
- risks
- commit hash
- push status