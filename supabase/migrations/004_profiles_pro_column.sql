-- InnerZero Pro: add the direct Pro app-membership flag to profiles.
--
-- `pro` is a standalone boolean entitlement, set true by the Stripe Pro webhook
-- branch on a Pro checkout and false on Pro subscription deletion. It is NOT a
-- usage-bearing cloud plan and NOT seat-based; the webhook never writes it
-- alongside the shared stripe_subscription_id / subscription_status / plan /
-- subscription_end columns, so Cloud + Business + Pro can coexist on one
-- customer. Effective Pro on the desktop is derived as
-- (pro OR business_licence OR local licence).
--
-- NOT NULL DEFAULT false backfills every existing row to false, matching the
-- shape of business_licence. RLS is UNCHANGED: the existing profiles policies
-- (users read/update own row; service_role full access) already cover this new
-- column, and the Stripe webhook writes it via the service_role admin client.
-- IF NOT EXISTS makes the migration safe to re-run.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro boolean NOT NULL DEFAULT false;

-- Defence in depth (mirrors migration 002). `pro` is a billing entitlement:
-- only the Stripe webhook, via the service_role admin client, may write it.
-- This project already grants UPDATE to authenticated on a column allowlist
-- (not table-wide), so a newly added column is NOT auto-writable by a normal
-- logged-in user. Verified before this migration:
--   has_column_privilege('authenticated','public.profiles','business_licence','UPDATE') = false
--   has_column_privilege('authenticated','public.profiles','plan','UPDATE')             = false
-- This explicit REVOKE makes the same posture true for `pro`, version-controlled,
-- and guards against a future broad GRANT accidentally exposing the column. It
-- is a no-op against the current state (the grant was never given) and changes
-- no RLS policy.
REVOKE UPDATE (pro) ON public.profiles FROM authenticated, anon;
