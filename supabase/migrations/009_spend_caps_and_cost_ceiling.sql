-- 009_spend_caps_and_cost_ceiling.sql
-- Phase cloud-spend-cap-defaults-and-ceiling (B1 of the
-- managed-cloud-subscriber-readiness plan, 2026-07-18).
--
-- Closes H2 (spending_cap_pence NULL = unlimited by default) and H3/H9
-- (worst-case provider spend bounded only by the credit balance, so a
-- subscriber could force calls whose REAL provider cost exceeds what
-- they paid). Two independent guards, both enforced server-side in the
-- same atomic statement as the deduction:
--
--   1. USER spending cap: profiles.spending_cap_pence. New default 2000
--      pence; existing NULL rows backfilled (pre-launch; a user can
--      still clear it back to NULL = no user cap via the account
--      spending-cap route).
--   2. PLAN provider-cost ceiling: cloud_plans.provider_cost_ceiling_
--      pence, a hard per-billing-cycle ceiling on REAL estimated
--      provider cost, independent of the credit balance and NOT
--      user-editable. Sized from locked decision 10 (charge at least
--      2x provider cost, on NET revenue after ~20 percent VAT and
--      Stripe fees): ceiling = 50 percent of net plan revenue.
--        starter  9.99 -> ~8.00 net  ->  400 pence
--        plus    19.99 -> ~16.20 net ->  800 pence
--        pro     39.99 -> ~32.60 net -> 1600 pence
--      PAYG rows have no billing cycle; ceiling stays NULL there (their
--      spend still counts against the USER cap via the deduct path that
--      serves subscription balances; pack-only deduction cost tracking
--      is a follow-up noted in the post-audit).
--
-- The deduct RPC guard becomes: effective_cap = least(user_cap,
-- plan_ceiling) with NULL-ignoring least (both NULL = no cap). Both
-- rejections keep the EXISTING wire sub-code 'spending_cap_exceeded'
-- that the desktop already branches on; no client change.
--
-- Cycle-level enforcement on REAL post-call token costs is what holds
-- the decision-10 margin floor against hostile token-dense input that
-- defeats chars-per-token assumptions (the route's new 90,000-char
-- total-input cap handles the typical case pre-call).
--
-- Access model unchanged: SECURITY DEFINER, service-role-only EXECUTE.

alter table public.cloud_plans
  add column if not exists provider_cost_ceiling_pence integer;

comment on column public.cloud_plans.provider_cost_ceiling_pence is
  'Hard per-billing-cycle ceiling on real estimated provider cost for subscribers on this plan, in pence. NULL = no plan ceiling (PAYG rows). Sized at 50 percent of net plan revenue per locked decision 10.';

update public.cloud_plans set provider_cost_ceiling_pence = 400  where id = 'starter';
update public.cloud_plans set provider_cost_ceiling_pence = 800  where id = 'plus';
update public.cloud_plans set provider_cost_ceiling_pence = 1600 where id = 'pro';

-- Default USER cap (H2): new profiles start at 2000 pence instead of
-- NULL-unlimited; pre-launch NULL rows are backfilled. Clearing to NULL
-- remains an explicit user choice via the spending-cap route.
-- Backfill provenance (Codex review note): every live NULL at export
-- time (2026-07-18, 9 pre-launch profiles) came from the 20260417120018
-- sentinel migration mapping the old 0-default to NULL, NOT from a
-- user deliberately choosing "no cap", so overwriting them with the
-- default is safe. Post-launch, a re-run of this backfill would NOT be
-- safe; this migration applies once.
alter table public.profiles
  alter column spending_cap_pence set default 2000;

update public.profiles
  set spending_cap_pence = 2000
  where spending_cap_pence is null;

-- Ceiling-aware replacement of the combined balance + cap + increment
-- RPC (supersedes the 20260417120018 body captured in the 007 baseline).
-- The plan ceiling is config: read before the locked UPDATE (a config
-- TOCTOU is harmless; the SPEND counters are still guarded under the
-- profile row lock in the single conditional UPDATE).
CREATE OR REPLACE FUNCTION public.atomic_deduct_sub_with_cap(
  p_user_id UUID,
  p_amount INTEGER,
  p_cost_pence INTEGER
) RETURNS TABLE(new_balance INTEGER, new_spend_pence INTEGER, rejected_reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_new_spend INTEGER;
  v_cur_balance INTEGER;
  v_cur_spend INTEGER;
  v_ceiling INTEGER;
BEGIN
  -- Plan provider-cost ceiling for this user's current plan (NULL when
  -- the plan has no ceiling row or the user is plan-free).
  SELECT cp.provider_cost_ceiling_pence
  INTO v_ceiling
  FROM profiles p
  LEFT JOIN cloud_plans cp ON cp.id = p.plan
  WHERE p.id = p_user_id;

  -- Single conditional UPDATE: all guards evaluated under the row lock.
  -- Guard 1: usage_balance covers p_amount.
  -- Guard 2: USER cap (NULL = none) not breached.
  -- Guard 3: PLAN ceiling (NULL = none) not breached.
  -- Guard 2/3 use the "> 0 AND" shape so a cap or ceiling of exactly 0
  -- is an UNCONDITIONAL hard stop, even for a request whose integer
  -- provider-cost estimate rounds to 0 pence (Codex review fold: the
  -- documented cap-0 semantics are "reject every deduction").
  UPDATE profiles
  SET usage_balance = usage_balance - p_amount,
      spending_this_cycle_pence = spending_this_cycle_pence + p_cost_pence
  WHERE id = p_user_id
    AND usage_balance >= p_amount
    AND (
      spending_cap_pence IS NULL
      OR (spending_cap_pence > 0
          AND spending_this_cycle_pence + p_cost_pence <= spending_cap_pence)
    )
    AND (
      v_ceiling IS NULL
      OR (v_ceiling > 0
          AND spending_this_cycle_pence + p_cost_pence <= v_ceiling)
    )
  RETURNING usage_balance, spending_this_cycle_pence
  INTO v_new_balance, v_new_spend;

  IF FOUND THEN
    RETURN QUERY SELECT v_new_balance, v_new_spend, NULL::TEXT;
    RETURN;
  END IF;

  -- Rejected: report which guard failed. Both cap types keep the
  -- existing 'spending_cap_exceeded' wire sub-code (desktop-compatible).
  SELECT usage_balance, spending_this_cycle_pence
  INTO v_cur_balance, v_cur_spend
  FROM profiles
  WHERE id = p_user_id;

  IF v_cur_balance IS NULL THEN
    RETURN QUERY SELECT 0, 0, 'profile_not_found'::TEXT;
    RETURN;
  END IF;

  IF v_cur_balance < p_amount THEN
    RETURN QUERY SELECT v_cur_balance, v_cur_spend, 'insufficient_usage'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT v_cur_balance, v_cur_spend, 'spending_cap_exceeded'::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.atomic_deduct_sub_with_cap(UUID, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_deduct_sub_with_cap(UUID, INTEGER, INTEGER) TO service_role;
