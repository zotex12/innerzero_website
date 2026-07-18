-- 010_nonbilling_hardening_baseline.sql
-- B2 follow-up housekeeping (managed-cloud-subscriber-readiness plan,
-- 2026-07-18). Verbatim export of the LAST four live-only migrations
-- (theme codes + security hardening; the billing lineage is in 007), so
-- the ENTIRE live migration history is now reproducible from this repo.
--
-- STATUS: ALREADY APPLIED to the live project (as the individual
-- versions below). Same contract as 007: single transaction + fail-fast
-- guard, so an accidental production run aborts before any statement,
-- and a genuinely fresh environment (after 001-009) rebuilds cleanly.

begin;

do $$
begin
  if exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'theme_codes'
  ) then
    raise exception
      'non-billing baseline already applied (theme_codes exists); this file documents the live schema and must not be re-run';
  end if;
end
$$;

-- ============================================================
-- 20260414202045 create_theme_codes_and_redemptions
-- ============================================================

CREATE TABLE theme_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL UNIQUE,
  theme_id text NOT NULL,
  label text NOT NULL,
  max_uses integer NOT NULL DEFAULT 100,
  uses integer NOT NULL DEFAULT 0,
  expires_at timestamptz NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE theme_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE theme_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid REFERENCES theme_codes(id) NOT NULL,
  user_id uuid REFERENCES auth.users NULL,
  device_fingerprint text NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(code_id, device_fingerprint)
);
ALTER TABLE theme_redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20260415215341 revoke_truncate_trigger_grants
-- ============================================================

REVOKE TRUNCATE, TRIGGER ON public.cloud_plans FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.devices FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.licence_events FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.licences FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.model_tiers FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.profiles FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.proxy_cost_log FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.theme_codes FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.theme_redemptions FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.usage_packs FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.usage_transactions FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON public.waitlist FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon, authenticated;

-- ============================================================
-- 20260415221441 revoke_rls_auto_enable_execute
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;

-- ============================================================
-- 20260420014924 harden_newsletter_and_waitlist
-- ============================================================

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_source_whitelist
  CHECK (source IN ('homepage', 'download_page', 'unknown'));

REVOKE ALL ON public.waitlist FROM authenticated, anon;
REVOKE ALL ON SEQUENCE public.waitlist_id_seq FROM authenticated, anon;

commit;
