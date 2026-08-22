-- 015_plan_read_scoping_and_rls_initplan.sql
-- Supabase advisor hardening pass (2026-08-22). One real exposure fixed,
-- plus the WARN-level performance lints the dashboard was showing.
--
-- Findings fixed:
--
--   1) LEAK - public.cloud_plans was fully readable with the publishable
--      (anon) key. Migration 007 created `cloud_plans_read` /
--      `model_tiers_read` as FOR SELECT USING (true) for role public, which
--      sat on top of, and completely overrode, the narrower
--      "Anyone can read active ..." policies added later the same day
--      (20260417005838). Combined with table-wide SELECT grants, that put
--      every column of every row on the public internet. Verified live
--      before this migration:
--        GET /rest/v1/cloud_plans?select=id,price_pence,provider_cost_ceiling_pence
--        -> starter 999/400, plus 1999/800, pro 3999/1600
--      `provider_cost_ceiling_pence` (added by migration 009) is the
--      internal per-plan provider cost ceiling, i.e. our gross margin. Any
--      inactive or unlaunched plan row was readable too.
--      Fix: drop the two USING (true) policies, and replace the table-wide
--      SELECT grants with column-scoped grants covering exactly what the
--      public /api/cloud/plans endpoint selects. Column scoping is the
--      load-bearing half: it means a future internal column added to
--      either table does NOT auto-publish itself the way
--      provider_cost_ceiling_pence did. Same failure shape as the Axon
--      subscriptions.freelancer_share leak.
--      Server paths are unaffected - cloud-plans.ts, /api/cloud/balance,
--      /api/cloud/deduct, /api/cloud/proxy and /api/stripe/checkout all use
--      the service-role admin client, which bypasses both RLS and these
--      grants.
--
--   2) advisor 0003 auth_rls_initplan (11 WARNs) and advisor 0006
--      multiple_permissive_policies (17 WARNs). Both trace mostly to the
--      five "Service role ..." policies from migrations 001 and 007. They
--      are dead weight: service_role has rolbypassrls = true, so it never
--      consults a policy, while the policies were written TO public and so
--      were evaluated on every anon and authenticated query, once per row,
--      re-running auth.role() each time. Dropped outright.
--      Tables left with zero policies (waitlist, licence_events) stay
--      deny-all for anon/authenticated with RLS still enabled, and
--      service_role still reaches them by bypass. That is exactly the
--      posture feedback, newsletter_subscribers, rate_limit_counters and
--      the cloud_* tables already run.
--
--   3) Remaining owner-row policies re-created with auth.uid() wrapped as
--      (select auth.uid()) so the initplan is evaluated once per statement
--      rather than once per row, and scoped TO authenticated. anon has a
--      null uid so it never matched these anyway; naming the role removes
--      them from the anon/authenticator/dashboard_user permissive stack.
--
--   4) advisor 0001 unindexed_foreign_keys (6 INFOs). Covering indexes
--      added. These are not cosmetic here: the GDPR account-deletion path
--      cascades from profiles into these children, and an unindexed FK
--      makes each cascade a sequential scan.
--
-- Deliberately NOT touched:
--   - advisor 0005 unused_index (idx_newsletter_subscribers_active,
--     cloud_fallback_events_created_idx). "Never used" here reflects low
--     traffic, not a bad index. Keeping both.
--   - "Anyone can read active cloud plans" / "... model tiers" are already
--     TO anon, authenticated USING (active = true) with no auth function
--     call, so they need no rewrite. They become the only SELECT policy on
--     their tables once the USING (true) pair is gone.
--   - Leaked-password protection (HaveIBeenPwned) is an Auth dashboard
--     setting, not SQL. Still off; toggle it in Authentication > Policies.
--
-- No behaviour change intended for any first-party code path.
-- All statements are idempotent; safe to re-run.

begin;

-- ============================================================
-- 1. cloud_plans / model_tiers: scope the public read
-- ============================================================

drop policy if exists "cloud_plans_read" on public.cloud_plans;
drop policy if exists "model_tiers_read" on public.model_tiers;

revoke select on public.cloud_plans from anon, authenticated;
revoke select on public.model_tiers from anon, authenticated;

-- Exactly the columns /api/cloud/plans selects, plus `active` (Postgres
-- requires SELECT on a column referenced in a WHERE clause, and that route
-- filters .eq("active", true)). Notably absent: provider_cost_ceiling_pence,
-- stripe_product_id, stripe_price_id, priority_routing, overage_available.
grant select (
  id,
  name,
  plan_type,
  usage_amount,
  price_pence,
  tier_access,
  sort_order,
  active
) on public.cloud_plans to anon, authenticated;

grant select (
  id,
  name,
  usage_multiplier,
  models,
  sort_order,
  active
) on public.model_tiers to anon, authenticated;

-- ============================================================
-- 2. Drop the redundant service-role policies
-- ============================================================

drop policy if exists "Service role full access on profiles" on public.profiles;
drop policy if exists "Service role full access on devices" on public.devices;
drop policy if exists "Service role full access on licences" on public.licences;
drop policy if exists "Service role only on licence_events" on public.licence_events;
drop policy if exists "Service role only on waitlist" on public.waitlist;

-- ============================================================
-- 3. Re-create owner-row policies with a wrapped initplan
-- ============================================================

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read own devices" on public.devices;
create policy "Users can read own devices"
  on public.devices
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own licences" on public.licences;
create policy "Users can read own licences"
  on public.licences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "usage_transactions_read_own" on public.usage_transactions;
create policy "usage_transactions_read_own"
  on public.usage_transactions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "usage_packs_read_own" on public.usage_packs;
create policy "usage_packs_read_own"
  on public.usage_packs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================
-- 4. Covering indexes for the unindexed foreign keys
-- ============================================================

create index if not exists idx_cloud_fallback_events_user_id
  on public.cloud_fallback_events (user_id);

create index if not exists idx_licence_events_user_id
  on public.licence_events (user_id);

create index if not exists idx_licence_events_device_id
  on public.licence_events (device_id);

create index if not exists idx_licences_user_id
  on public.licences (user_id);

create index if not exists idx_proxy_cost_log_user_id
  on public.proxy_cost_log (user_id);

create index if not exists idx_theme_redemptions_user_id
  on public.theme_redemptions (user_id);

-- The one FK in this set that is not a user_id column: usage_packs.plan_id
-- references cloud_plans(id). Applied as a separate migration
-- (20260822 index_usage_packs_plan_id) after the first pass missed it.
create index if not exists idx_usage_packs_plan_id
  on public.usage_packs (plan_id);

commit;
