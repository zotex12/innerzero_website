-- 007_billing_schema_baseline.sql
-- Phase cloud-billing-schema-and-rls (B2 of the managed-cloud-subscriber-
-- readiness plan, 2026-07-18). Closes H1: the billing schema and the
-- atomic_* cap/deduct RPCs existed ONLY in the live Supabase project
-- (chdsbjydwswtshjflkva) and could not be audited, diffed, or redeployed
-- from source.
--
-- CONTENT: a VERBATIM export of the 18 billing-lineage migrations from the
-- live project's supabase_migrations.schema_migrations history, in applied
-- order, each under its live version/name header. Nothing was rewritten,
-- so this file is byte-faithful to what production actually ran.
--
-- STATUS: ALREADY APPLIED to the live project (as the individual versions
-- listed below). Do NOT run this file against production. The guard block
-- below makes an accidental apply fail fast on any database where the
-- billing schema already exists. On a genuinely fresh environment, remove
-- nothing: the guard passes and the file rebuilds the billing schema.
--
-- LIVE SECURITY VERIFICATION (2026-07-18, read-only, recorded in
-- .ai/audits/post/cloud-billing-schema-and-rls_post_audit.md):
--   - RLS ENABLED on cloud_plans, model_tiers, usage_packs,
--     usage_transactions, proxy_cost_log, cloud_request_reservations.
--   - usage_packs / usage_transactions: per-user SELECT policy
--     (auth.uid() = user_id) only; INSERT/UPDATE/DELETE revoked from
--     anon + authenticated.
--   - proxy_cost_log / cloud_request_reservations: RLS with NO policies
--     (service-role only). cloud_request_reservations DDL is NOT in this
--     file; it is already tracked in 005_cloud_request_reservations.sql
--     (this line records its live verification only).
--   - ALL nine atomic_* / reservation RPCs: SECURITY DEFINER with EXECUTE
--     granted ONLY to postgres + service_role (acl
--     {postgres=X/postgres,service_role=X/postgres}). anon/authenticated
--     CANNOT execute them: no self-credit hole.
--
-- Out of scope for this baseline (still live-only, non-billing; tracked
-- as follow-up housekeeping): create_theme_codes_and_redemptions,
-- revoke_truncate_trigger_grants, revoke_rls_auto_enable_execute,
-- harden_newsletter_and_waitlist.

-- Single transaction (Codex review fold): without this, a raw `psql -f`
-- run with the default ON_ERROR_STOP=off would report the guard's raise
-- as an error but keep executing the later statements. Inside one
-- transaction the raise aborts everything; no statement can land on a
-- database where the guard fires. Every statement below is
-- transaction-safe DDL/DML (no CONCURRENTLY).
begin;

do $$
begin
  if exists (
    select 1 from pg_tables
    where schemaname = 'public'
      and tablename in
        ('cloud_plans', 'model_tiers', 'usage_packs',
         'usage_transactions', 'proxy_cost_log', 'licences')
  ) then
    raise exception
      'billing baseline already applied (a billing table exists); this file documents the live schema and must not be re-run';
  end if;
end
$$;

-- ============================================================
-- 20260405181207 add_business_licence_support
-- ============================================================

-- Add business licence columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_licence boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS licence_key text,
  ADD COLUMN IF NOT EXISTS supporter boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS company_name text;

-- Create licences table
CREATE TABLE IF NOT EXISTS public.licences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  licence_key text NOT NULL UNIQUE,
  licence_type text NOT NULL DEFAULT 'business',
  company_name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  seats integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS on licences
ALTER TABLE public.licences ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can read their own licences
CREATE POLICY "Users can read own licences"
  ON public.licences
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policy: service role can do everything (for webhook)
CREATE POLICY "Service role full access on licences"
  ON public.licences
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 20260413105921 cloud_subscription_schema
-- ============================================================

-- 1. CONFIG TABLE: cloud_plans
-- Maps Stripe products/prices to internal plan config.
CREATE TABLE cloud_plans (
    id TEXT PRIMARY KEY,
    stripe_product_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL,
    name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('subscription', 'payg')),
    usage_amount INTEGER NOT NULL,
    price_pence INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'gbp',
    tier_access TEXT[] NOT NULL DEFAULT '{}',
    priority_routing BOOLEAN DEFAULT false,
    overage_available BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CONFIG TABLE: model_tiers
CREATE TABLE model_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    usage_multiplier INTEGER NOT NULL DEFAULT 1,
    models JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EXTEND profiles with cloud subscription fields
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS usage_balance INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS usage_monthly_allowance INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS founder BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS billing_cycle_end TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS overage_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS spending_cap_pence INTEGER DEFAULT 0;

-- 4. TRANSACTION LOG: usage_transactions
CREATE TABLE usage_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('monthly_grant', 'payg_purchase', 'usage', 'overage', 'expiry', 'refund', 'adjustment')),
    model_tier TEXT,
    provider TEXT,
    model_id TEXT,
    description TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_transactions_user_id ON usage_transactions(user_id);
CREATE INDEX idx_usage_transactions_created_at ON usage_transactions(created_at);
CREATE INDEX idx_usage_transactions_type ON usage_transactions(type);

-- 5. PAYG PACKS: tracks purchased packs and remaining balance
CREATE TABLE usage_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES cloud_plans(id),
    usage_granted INTEGER NOT NULL,
    usage_remaining INTEGER NOT NULL,
    stripe_session_id TEXT,
    purchased_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_usage_packs_user_id ON usage_packs(user_id);

-- 6. RLS POLICIES
ALTER TABLE cloud_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cloud_plans_read" ON cloud_plans FOR SELECT USING (true);

ALTER TABLE model_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "model_tiers_read" ON model_tiers FOR SELECT USING (true);

ALTER TABLE usage_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_transactions_read_own" ON usage_transactions
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE usage_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_packs_read_own" ON usage_packs
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 20260413105944 seed_cloud_plans_and_model_tiers
-- (LIVE VALUES DRIFT: prices/models are runtime config; the live rows are
-- authoritative. This seed is the as-applied 2026-04-13 state.)
-- ============================================================

INSERT INTO cloud_plans (id, stripe_product_id, stripe_price_id, name, plan_type, usage_amount, price_pence, tier_access, priority_routing, overage_available, sort_order) VALUES
    ('starter', 'prod_UKMvfT5irNGW9d', 'price_1TLiBbIcHKhxPb7A30LNHu3m', 'Cloud Starter', 'subscription', 1000, 999, ARRAY['auto','budget','standard'], false, false, 1),
    ('plus', 'prod_UKMvszzYaHQyYW', 'price_1TLiBkIcHKhxPb7ACmLZq7hg', 'Cloud Plus', 'subscription', 2500, 1999, ARRAY['auto','budget','standard','premium'], false, true, 2),
    ('pro', 'prod_UKMvtozxLcDBE7', 'price_1TLiBtIcHKhxPb7ATvegZPTK', 'Cloud Pro', 'subscription', 6000, 3999, ARRAY['auto','budget','standard','premium','ultra'], true, true, 3),
    ('payg_200', 'prod_UKMvacv1jFrZEH', 'price_1TLiC2IcHKhxPb7AWYvASSOO', 'Top Up 200', 'payg', 200, 500, ARRAY['auto','budget','standard'], false, false, 10),
    ('payg_600', 'prod_UKMvUKT3l3zTa9', 'price_1TLiC9IcHKhxPb7ANgTrCFE8', 'Top Up 600', 'payg', 600, 1200, ARRAY['auto','budget','standard'], false, false, 11),
    ('payg_1500', 'prod_UKMw2PLUFcVZEL', 'price_1TLiCHIcHKhxPb7AeicxahOQ', 'Top Up 1,500', 'payg', 1500, 2500, ARRAY['auto','budget','standard'], false, false, 12);

INSERT INTO model_tiers (id, name, usage_multiplier, models, sort_order) VALUES
    ('auto', 'Auto', 1, '[
        {"provider": "deepseek", "model_id": "deepseek-chat", "display_name": "DeepSeek V3.2", "priority": 1},
        {"provider": "google", "model_id": "gemini-2.5-flash", "display_name": "Gemini 2.5 Flash", "priority": 2}
    ]'::jsonb, 1),
    ('budget', 'Budget', 1, '[
        {"provider": "deepseek", "model_id": "deepseek-chat", "display_name": "DeepSeek V3.2"},
        {"provider": "google", "model_id": "gemini-2.5-flash-lite", "display_name": "Gemini 2.5 Flash-Lite"}
    ]'::jsonb, 2),
    ('standard', 'Standard', 2, '[
        {"provider": "google", "model_id": "gemini-2.5-flash", "display_name": "Gemini 2.5 Flash"}
    ]'::jsonb, 3),
    ('premium', 'Premium', 4, '[
        {"provider": "anthropic", "model_id": "claude-haiku-4-5-20251001", "display_name": "Claude Haiku 4.5"},
        {"provider": "anthropic", "model_id": "claude-sonnet-4-6-20260220", "display_name": "Claude Sonnet 4.6"}
    ]'::jsonb, 4),
    ('ultra', 'Ultra', 8, '[
        {"provider": "anthropic", "model_id": "claude-opus-4-6-20260220", "display_name": "Claude Opus 4.6"}
    ]'::jsonb, 5);

-- ============================================================
-- 20260413140747 grant_select_on_cloud_tables
-- ============================================================

GRANT SELECT ON cloud_plans TO anon, authenticated;
GRANT SELECT ON model_tiers TO anon, authenticated;
GRANT SELECT ON usage_transactions TO authenticated;
GRANT SELECT ON usage_packs TO authenticated;

-- ============================================================
-- 20260413141311 rename_is_active_to_active
-- ============================================================

ALTER TABLE cloud_plans RENAME COLUMN is_active TO active;
ALTER TABLE model_tiers RENAME COLUMN is_active TO active;

-- ============================================================
-- 20260414165228 add_request_id_to_usage_transactions
-- ============================================================

ALTER TABLE usage_transactions ADD COLUMN request_id TEXT;
CREATE UNIQUE INDEX idx_usage_transactions_request_id ON usage_transactions (request_id) WHERE request_id IS NOT NULL;

-- ============================================================
-- 20260414165541 create_proxy_cost_log
-- ============================================================

CREATE TABLE proxy_cost_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  request_id text,
  provider text NOT NULL,
  model_id text NOT NULL,
  input_tokens integer NOT NULL,
  output_tokens integer NOT NULL,
  estimated_cost_pence numeric(10,4) NOT NULL,
  usage_deducted integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE proxy_cost_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20260414172424 add_usage_alerts_sent_to_profiles
-- ============================================================

ALTER TABLE profiles ADD COLUMN usage_alerts_sent jsonb DEFAULT '[]';

-- ============================================================
-- 20260414175124 lock_down_profiles_update_columns
-- ============================================================

REVOKE UPDATE ON profiles FROM authenticated;
REVOKE UPDATE ON profiles FROM anon;
GRANT UPDATE (full_name, company_name) ON profiles TO authenticated;

-- ============================================================
-- 20260414175210 revoke_write_grants_on_billing_tables
-- ============================================================

REVOKE INSERT, UPDATE, DELETE ON usage_transactions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON usage_transactions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON usage_packs FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON usage_packs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON cloud_plans FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON cloud_plans FROM anon;
REVOKE INSERT, UPDATE, DELETE ON model_tiers FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON model_tiers FROM anon;
REVOKE ALL ON proxy_cost_log FROM authenticated;
REVOKE ALL ON proxy_cost_log FROM anon;
REVOKE INSERT, UPDATE, DELETE ON licence_events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON licence_events FROM anon;
REVOKE INSERT, UPDATE, DELETE ON licences FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON licences FROM anon;
REVOKE INSERT, UPDATE, DELETE ON devices FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON devices FROM anon;
REVOKE INSERT, UPDATE, DELETE ON waitlist FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON waitlist FROM anon;
REVOKE INSERT, DELETE ON profiles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON profiles FROM anon;

-- ============================================================
-- 20260417003930 atomic_usage_rpcs
-- ============================================================

CREATE OR REPLACE FUNCTION public.atomic_deduct_subscription(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET usage_balance = usage_balance - p_amount
  WHERE id = p_user_id
    AND usage_balance >= p_amount
  RETURNING usage_balance;
$$;

CREATE OR REPLACE FUNCTION public.atomic_deduct_pack(
  p_pack_id UUID,
  p_amount INTEGER
) RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE usage_packs
  SET usage_remaining = usage_remaining - p_amount
  WHERE id = p_pack_id
    AND usage_remaining >= p_amount
  RETURNING usage_remaining;
$$;

CREATE OR REPLACE FUNCTION public.atomic_grant_subscription(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles
  SET usage_balance = usage_balance + p_amount
  WHERE id = p_user_id
  RETURNING usage_balance;
$$;

REVOKE ALL ON FUNCTION public.atomic_deduct_subscription(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.atomic_deduct_pack(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.atomic_grant_subscription(UUID, INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.atomic_deduct_subscription(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.atomic_deduct_pack(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.atomic_grant_subscription(UUID, INTEGER) TO service_role;

-- ============================================================
-- 20260417005029 atomic_cycle_upgrade_expire_rpcs
-- (atomic_cycle_reset and atomic_upgrade_grant bodies here are the
-- 2026-04-17 versions; 20260417120018 below REPLACES both with the
-- current live bodies that also reset spending_this_cycle_pence.)
-- ============================================================

ALTER TABLE public.usage_transactions
  DROP CONSTRAINT IF EXISTS usage_transactions_type_check;

ALTER TABLE public.usage_transactions
  ADD CONSTRAINT usage_transactions_type_check
  CHECK (type = ANY (ARRAY[
    'monthly_grant'::text,
    'upgrade_grant'::text,
    'payg_purchase'::text,
    'usage'::text,
    'overage'::text,
    'expiry'::text,
    'refund'::text,
    'adjustment'::text
  ]));

CREATE OR REPLACE FUNCTION public.atomic_cycle_reset(
  p_user_id UUID,
  p_allowance INTEGER,
  p_new_cycle_end TIMESTAMPTZ,
  p_request_id TEXT
) RETURNS TABLE(new_balance INTEGER, applied BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  BEGIN
    INSERT INTO usage_transactions (user_id, amount, type, description, request_id)
    VALUES (p_user_id, p_allowance, 'monthly_grant', 'Monthly allowance reset', p_request_id);
  EXCEPTION WHEN unique_violation THEN
    SELECT usage_balance INTO v_new_balance FROM profiles WHERE id = p_user_id;
    RETURN QUERY SELECT v_new_balance, FALSE;
    RETURN;
  END;

  UPDATE profiles
  SET usage_balance = p_allowance,
      billing_cycle_end = p_new_cycle_end,
      usage_alerts_sent = '[]'::jsonb
  WHERE id = p_user_id
  RETURNING usage_balance INTO v_new_balance;

  RETURN QUERY SELECT v_new_balance, TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.atomic_upgrade_grant(
  p_user_id UUID,
  p_added_amount INTEGER,
  p_new_allowance INTEGER,
  p_new_plan TEXT,
  p_request_id TEXT
) RETURNS TABLE(new_balance INTEGER, applied BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  BEGIN
    INSERT INTO usage_transactions (user_id, amount, type, description, request_id)
    VALUES (p_user_id, p_added_amount, 'upgrade_grant', 'Plan upgrade - prorated grant', p_request_id);
  EXCEPTION WHEN unique_violation THEN
    SELECT usage_balance INTO v_new_balance FROM profiles WHERE id = p_user_id;
    RETURN QUERY SELECT v_new_balance, FALSE;
    RETURN;
  END;

  UPDATE profiles
  SET usage_balance = usage_balance + p_added_amount,
      usage_monthly_allowance = p_new_allowance,
      plan = COALESCE(p_new_plan, plan),
      usage_alerts_sent = '[]'::jsonb
  WHERE id = p_user_id
  RETURNING usage_balance INTO v_new_balance;

  RETURN QUERY SELECT v_new_balance, TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.atomic_pack_expire(
  p_pack_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_zeroed INTEGER;
BEGIN
  SELECT usage_remaining INTO v_zeroed
  FROM usage_packs
  WHERE id = p_pack_id
  FOR UPDATE;

  IF v_zeroed IS NULL OR v_zeroed = 0 THEN
    RETURN 0;
  END IF;

  UPDATE usage_packs
  SET usage_remaining = 0
  WHERE id = p_pack_id;

  RETURN v_zeroed;
END;
$$;

REVOKE ALL ON FUNCTION public.atomic_cycle_reset(UUID, INTEGER, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.atomic_upgrade_grant(UUID, INTEGER, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.atomic_pack_expire(UUID) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.atomic_cycle_reset(UUID, INTEGER, TIMESTAMPTZ, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.atomic_upgrade_grant(UUID, INTEGER, INTEGER, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.atomic_pack_expire(UUID) TO service_role;

-- ============================================================
-- 20260417005838 public_select_policies_cloud_plans_model_tiers
-- ============================================================

CREATE POLICY "Anyone can read active cloud plans"
  ON public.cloud_plans
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Anyone can read active model tiers"
  ON public.model_tiers
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- ============================================================
-- 20260417012322 index_proxy_cost_log_created_at
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_proxy_cost_log_created_at
  ON public.proxy_cost_log (created_at);

-- ============================================================
-- 20260417120018 spending_cap_atomic_and_null_sentinel
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS spending_this_cycle_pence INTEGER NOT NULL DEFAULT 0;

UPDATE profiles p
SET spending_this_cycle_pence = COALESCE((
  SELECT CEIL(SUM(t.amount) * 0.5)::INTEGER
  FROM usage_transactions t
  WHERE t.user_id = p.id
    AND t.type = 'usage'
    AND t.created_at >= COALESCE(
      p.billing_cycle_end - INTERVAL '1 month',
      '1970-01-01'::timestamptz
    )
), 0);

UPDATE profiles SET spending_cap_pence = NULL WHERE spending_cap_pence = 0;

ALTER TABLE public.profiles ALTER COLUMN spending_cap_pence DROP DEFAULT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_spending_cap_pence_range;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_spending_cap_pence_range
  CHECK (spending_cap_pence IS NULL OR spending_cap_pence BETWEEN 0 AND 100000);

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
  v_cap INTEGER;
BEGIN
  UPDATE profiles
  SET usage_balance = usage_balance - p_amount,
      spending_this_cycle_pence = spending_this_cycle_pence + p_cost_pence
  WHERE id = p_user_id
    AND usage_balance >= p_amount
    AND (
      spending_cap_pence IS NULL
      OR spending_this_cycle_pence + p_cost_pence <= spending_cap_pence
    )
  RETURNING usage_balance, spending_this_cycle_pence
  INTO v_new_balance, v_new_spend;

  IF FOUND THEN
    RETURN QUERY SELECT v_new_balance, v_new_spend, NULL::TEXT;
    RETURN;
  END IF;

  SELECT usage_balance, spending_this_cycle_pence, spending_cap_pence
  INTO v_cur_balance, v_cur_spend, v_cap
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

CREATE OR REPLACE FUNCTION public.atomic_cycle_reset(
  p_user_id UUID,
  p_allowance INTEGER,
  p_new_cycle_end TIMESTAMPTZ,
  p_request_id TEXT
) RETURNS TABLE(new_balance INTEGER, applied BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  BEGIN
    INSERT INTO usage_transactions (user_id, amount, type, description, request_id)
    VALUES (p_user_id, p_allowance, 'monthly_grant', 'Monthly allowance reset', p_request_id);
  EXCEPTION WHEN unique_violation THEN
    SELECT usage_balance INTO v_new_balance FROM profiles WHERE id = p_user_id;
    RETURN QUERY SELECT v_new_balance, FALSE;
    RETURN;
  END;

  UPDATE profiles
  SET usage_balance = p_allowance,
      billing_cycle_end = p_new_cycle_end,
      usage_alerts_sent = '[]'::jsonb,
      spending_this_cycle_pence = 0
  WHERE id = p_user_id
  RETURNING usage_balance INTO v_new_balance;

  RETURN QUERY SELECT v_new_balance, TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.atomic_upgrade_grant(
  p_user_id UUID,
  p_added_amount INTEGER,
  p_new_allowance INTEGER,
  p_new_plan TEXT,
  p_request_id TEXT
) RETURNS TABLE(new_balance INTEGER, applied BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  BEGIN
    INSERT INTO usage_transactions (user_id, amount, type, description, request_id)
    VALUES (p_user_id, p_added_amount, 'upgrade_grant', 'Plan upgrade - prorated grant', p_request_id);
  EXCEPTION WHEN unique_violation THEN
    SELECT usage_balance INTO v_new_balance FROM profiles WHERE id = p_user_id;
    RETURN QUERY SELECT v_new_balance, FALSE;
    RETURN;
  END;

  UPDATE profiles
  SET usage_balance = usage_balance + p_added_amount,
      usage_monthly_allowance = p_new_allowance,
      plan = COALESCE(p_new_plan, plan),
      usage_alerts_sent = '[]'::jsonb,
      spending_this_cycle_pence = 0
  WHERE id = p_user_id
  RETURNING usage_balance INTO v_new_balance;

  RETURN QUERY SELECT v_new_balance, TRUE;
END;
$$;

-- ============================================================
-- 20260418135325 add_balance_after_to_usage_transactions
-- ============================================================

ALTER TABLE usage_transactions
  ADD COLUMN balance_after INTEGER;

UPDATE usage_transactions t
SET balance_after = p.usage_balance
FROM profiles p
WHERE t.user_id = p.id
  AND t.balance_after IS NULL;

COMMENT ON COLUMN usage_transactions.balance_after IS
  'Post-transaction usage_balance for the user. Used for independent ledger reconciliation. Written by deductUsage() and grantUsage() in src/lib/cloud-plans.ts.';

-- ============================================================
-- 20260418165222 add_profiles_cancel_at_period_end
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN cancel_at_period_end boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.cancel_at_period_end IS
  'Mirror of Stripe subscription.cancel_at_period_end. True = user cancelled via portal, sub continues until billing_cycle_end.';

-- ============================================================
-- 20260418181745 add_usage_packs_stripe_session_id_unique
-- ============================================================

ALTER TABLE usage_packs ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS usage_packs_stripe_session_id_unique
  ON usage_packs (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

COMMENT ON COLUMN usage_packs.stripe_session_id IS
  'Stripe checkout session id that created this pack. UNIQUE via partial index to prevent double-grant on webhook retry. NULL allowed for historical packs.';

-- Close the single transaction opened before the guard (Codex micro-round
-- fold: begin without commit would roll back a successful fresh run on
-- disconnect).
commit;
