-- 013_theme_redeem_atomic.sql
--
-- Atomic theme-code redemption.
--
-- The /api/theme/redeem route previously did a non-atomic read-modify-write on
-- theme_codes.uses (read uses -> check < max_uses -> insert redemption ->
-- write uses + 1). Concurrent redeems of the same code with DISTINCT device
-- fingerprints could each read uses = N, all pass the check, and all write
-- N + 1, redeeming a single-use code more times than max_uses allows.
--
-- This RPC closes that race: it takes the theme_codes row FOR UPDATE, so
-- concurrent redeems of the SAME code serialise, and the uses check + the
-- increment both run under that lock. SECURITY DEFINER with an empty
-- search_path and EXECUTE limited to service_role, matching the billing RPC
-- pattern (005 / 009 / 011 / 012). Additive only: no table, column, RLS, or
-- grant on existing objects is changed.

CREATE OR REPLACE FUNCTION public.redeem_theme_code(
  p_code_hash text,
  p_device_fingerprint text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_code   public.theme_codes%ROWTYPE;
  v_exists boolean;
BEGIN
  -- Serialise concurrent redeems of the same code on its row lock.
  SELECT * INTO v_code
  FROM public.theme_codes
  WHERE code_hash = p_code_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < now() THEN
    RETURN jsonb_build_object('status', 'expired');
  END IF;

  -- Same device redeeming again is an idempotent unlock: no use is spent.
  SELECT EXISTS (
    SELECT 1 FROM public.theme_redemptions
    WHERE code_id = v_code.id
      AND device_fingerprint = p_device_fingerprint
  ) INTO v_exists;

  IF v_exists THEN
    RETURN jsonb_build_object(
      'status', 'already_redeemed',
      'theme_id', v_code.theme_id,
      'label', v_code.label
    );
  END IF;

  IF v_code.uses >= v_code.max_uses THEN
    RETURN jsonb_build_object('status', 'exhausted');
  END IF;

  -- First redemption for this (code, device). Safe under the row lock: any
  -- concurrent request for the same code waits, then sees this row above.
  INSERT INTO public.theme_redemptions (code_id, user_id, device_fingerprint)
  VALUES (v_code.id, p_user_id, p_device_fingerprint);

  UPDATE public.theme_codes
  SET uses = uses + 1
  WHERE id = v_code.id;

  RETURN jsonb_build_object(
    'status', 'redeemed',
    'theme_id', v_code.theme_id,
    'label', v_code.label
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_theme_code(text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_theme_code(text, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.redeem_theme_code(text, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_theme_code(text, text, uuid) TO service_role;
