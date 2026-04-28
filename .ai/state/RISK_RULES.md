# Risk Rules

Pause and ask Louie before touching:
- .env or secrets
- billing
- licence
- Stripe
- Supabase RLS
- legal or privacy wording
- Vercel environment variables
- installer signing
- production release
- destructive database actions
- new dependencies
- large deletions
- policy_gate or approval flows

Audit level guidance:
- Small task: post-audit only
- Normal feature: pre-audit and post-audit
- Risky feature: pre-audit, post-audit, and security review
- Release/beta/legal/billing/licence/cloud/installer: release-audit required

Tool fallback rules:
- If Codex is unavailable, use Claude review, Claude subagents, and manual audit templates.
- If Claude Code is unavailable, use Codex builder prompt from .ai\templates\codex-fallback-builder-template.md.
- Never skip identity checks, audits, validation, or protected path rules because a tool is unavailable.