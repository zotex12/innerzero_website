-- 012_function_grant_hardening.sql
-- Post-initiative hygiene (managed-cloud-subscriber-readiness security
-- check, 2026-07-20). Silences the four function-level Supabase advisor
-- WARNs found in the live posture audit. No behaviour change intended.
--
-- Findings fixed:
--   1) public.handle_new_user()  - SECURITY DEFINER, EXECUTE granted to
--      PUBLIC (advisor 0028/0029). It is a trigger function (RETURNS
--      trigger) so PostgREST cannot invoke it, but the grant is needless
--      surface. Revoked; supabase_auth_admin (owner of the auth.users
--      trigger on_auth_user_created) gets an explicit grant so signup
--      keeps working under any fire-time EXECUTE check.
--   2) public.rls_auto_enable()  - SECURITY DEFINER event-trigger
--      function with a PUBLIC grant (advisor 0028/0029). Not directly
--      callable either; revoked. postgres (event trigger owner) keeps
--      its explicit EXECUTE.
--   3) public.handle_new_user()  - mutable search_path (advisor 0011).
--      Pinned to ''. Body is fully schema-qualified (public.profiles,
--      public.waitlist); pg_catalog is always searched implicitly.
--   4) public.update_updated_at() - mutable search_path (advisor 0011).
--      Pinned to ''. Body touches NEW only.
--
-- Deliberately NOT touched: EXECUTE on update_updated_at (SECURITY
-- INVOKER, not flagged by the definer lints, and it backs the
-- profiles_updated_at trigger fired by authenticated-role updates -
-- revoking there risks breakage for zero advisor gain).
--
-- All statements are idempotent; safe to re-run.

begin;

-- 1) handle_new_user: drop the public grant, keep the auth trigger safe
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- 2) rls_auto_enable: drop the public grant (postgres keeps EXECUTE)
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 3 + 4) pin search_path on the two flagged functions
alter function public.handle_new_user() set search_path = '';
alter function public.update_updated_at() set search_path = '';

commit;
