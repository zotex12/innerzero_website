# Current State

Last updated: 2026-08-22

This is a short working summary only.
Do not trust this file over the project guide or current code.

STALENESS WARNING: this file sat at 2026-06-11 while multiple phases shipped
(feature-pages-cluster, system-requirements-honesty, author-entity-consolidation,
blog-cannibalisation-orphan-links, the v0.2.0 site update and the 2026-08-16
staleness sweep, among others). It has been refreshed to 2026-08-22, but the
intervening entries were NOT reconstructed. The WEBCLAUDE.md build log is the
authoritative phase-by-phase record; use it, not this file, for history.

## Phase

None active. Last shipped phase was `supabase-advisor-hardening` (2026-08-22,
commit `b6522a1`, pushed and live).

It closed a real exposure: `public.cloud_plans` was readable in full with the
PUBLISHABLE key, including `provider_cost_ceiling_pence` (internal per-plan
provider cost ceiling), because migration 007's `USING (true)` policies silently
overrode the narrower `active = true` ones and table-wide SELECT grants were in
place. Migration 015 dropped those policies, replaced the table grants with
column-scoped grants matching what `/api/cloud/plans` actually selects, dropped
five redundant `Service role ...` policies, rewrapped owner-row policies as
`(select auth.uid())` scoped `TO authenticated`, and added seven FK covering
indexes. Supabase performance advisor WARNs went 28 to 0.

Two live pricing-page defects were fixed in the same phase: `model_tiers` has no
`display_name` column and never has, so the Usage info accordion rendered five
blank tier labels and `/api/cloud/balance` always returned `model_tiers: []`;
and PricingSection matched tiers by `name` against `tier_access` ids, so plan
bullets fell back to lowercase ids.

## Branch

main, up to date with origin/main.

## Working tree

Clean for tracked files. Pre-existing untracked items remain and are deliberate
operator decisions, not phase output: `.agents/`, `.ai/handoffs/`,
`.claude/settings.local.json`, `.serena/`, `Innerzero website audit.pdf`,
`public/images/features/setup3-optional-model-select-or-nomodel-select.webp`,
`scripts/__pycache__/`.

## Database

Supabase project `chdsbjydwswtshjflkva` (innerzero_website, Summers Solutions
org). Reach it only through the `supabase-summers` MCP server, never the plugin
`supabase` server, which is logged into the Axon / SW HEALTH account.

Live migration history now ends with `plan_read_scoping_and_rls_initplan` and
`index_usage_packs_plan_id` (both 2026-08-22). Local mirror:
`supabase/migrations/015_plan_read_scoping_and_rls_initplan.sql`.

Current advisor state: zero performance WARNs. One security WARN, leaked-password
protection, which is an Auth dashboard toggle rather than SQL. The remaining
security INFO rows are the by-design deny-all tables (RLS enabled, no policies).

## Last release

The website does not maintain a VERSION file or a BUILDLOG-style version tracker.
Production is whatever Vercel last deployed from main.

## Active handoff

None.

## Open blockers

None.

## Open operator items (not code)

- Enable leaked-password protection: Supabase > Authentication > Sign In /
  Providers > Password > "Prevent use of leaked passwords". Carried over from the
  2026-07-20 function-grant-hardening pass.
- The fabricated right-to-left layout claim is still live on the homepage FAQ, the
  changelog, llms.txt, llms-full.txt and two blog posts.
- "Only the current message is sent" is inaccurate in five places, because
  `build_memory_pack` appends profile facts and retrieved memories to the cloud
  prompt.
- `Innerzero website audit.pdf` sits untracked in the repo root and contains PII
  (phone number, registered office). It is not gitignored, so a `git add -A` would
  ship it. This is one of the reasons the explicit-path staging rule exists.

## Notes

WEBCLAUDE.md "Remaining website work" still lists outstanding backlog items
(Phase 3 founder slot tracking and account dashboard plan/supporter/founder
display, Phase 4 credit metering remainder, Phase 5 update check API, Phase 6
error monitoring and analytics). None are scheduled for an active phase.
