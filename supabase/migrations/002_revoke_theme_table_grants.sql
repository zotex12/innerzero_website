-- Revoke unnecessary write grants on theme tables.
-- RLS is enabled with zero policies (default deny), but revoking grants
-- adds defence in depth against misconfigured policies in the future.

REVOKE INSERT, UPDATE, DELETE ON public.theme_codes FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.theme_redemptions FROM authenticated, anon;
