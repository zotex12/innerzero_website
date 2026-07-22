-- 014_licence_seat_atomic.sql
--
-- Atomic licence seat check + device activation.
--
-- The /api/licence/validate route previously did a non-atomic
-- count -> seat check -> insert on the devices table:
--   read active device count -> check count < licence.seats -> insert.
-- Concurrent activations with DISTINCT device fingerprints could each read
-- count = N, all pass the check, and all insert, activating more devices than
-- the paid seat count allows.
--
-- LOCK DOMAIN. Seats are counted per USER (devices.user_id), and a single
-- profile can hold MORE THAN ONE licence (licences.user_id is not unique; the
-- Stripe webhook can mint additional licences). A lock on the licence row
-- alone would NOT serialise two different licence keys for the same user, so
-- the seat count could still be raced across licences. This RPC therefore
-- takes a per-USER transaction-scoped advisory lock (keyed on user_id) so
-- every activation for a given user serialises, regardless of which licence
-- key drove it. The advisory lock is acquired after the licences row lock;
-- the function only ever locks its own licence row, so no lock cycle exists.
--
-- It also closes two related over-allocation vectors:
--   - reactivating an INACTIVE device now runs the seat check (an inactive
--     device that other devices have displaced cannot silently reclaim a seat
--     once the licence is full);
--   - a licence with a NULL owner is refused (WHERE user_id = NULL counts zero
--     and would let unbounded null-owner devices insert).
--
-- SECURITY DEFINER with an empty search_path and EXECUTE limited to
-- service_role, matching the billing / theme RPC pattern (005 / 009 / 011 /
-- 012 / 013). Additive only: no table, column, RLS, or grant on an existing
-- object is changed. The verdict shape mirrors the route's prior response
-- contract so the HTTP status mapping is unchanged.

CREATE OR REPLACE FUNCTION public.validate_licence_device(
  p_licence_key        text,
  p_device_fingerprint text,
  p_device_name        text,
  p_os                 text,
  p_app_version        text,
  p_ip                 text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_lic         public.licences%ROWTYPE;
  v_device_id   uuid;
  v_was_active  boolean;
  v_event_type  text;
  v_used        integer;
  v_final       integer;
BEGIN
  -- Lock the licence row first (serialises concurrent validates for the same
  -- key and pins status/seats for the rest of the transaction).
  SELECT * INTO v_lic
  FROM public.licences
  WHERE licence_key = p_licence_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invalid_key');
  END IF;

  -- An orphaned (owner-deleted) licence cannot pool devices safely: refuse it
  -- rather than count/insert against a NULL owner.
  IF v_lic.user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'invalid_key');
  END IF;

  IF v_lic.status <> 'active' THEN
    RETURN jsonb_build_object(
      'status', 'licence_inactive',
      'licence_status', v_lic.status
    );
  END IF;

  IF v_lic.expires_at IS NOT NULL AND v_lic.expires_at < now() THEN
    RETURN jsonb_build_object(
      'status', 'licence_expired',
      'expires_at', v_lic.expires_at
    );
  END IF;

  -- Serialise ALL activations for this user, so two different licence keys for
  -- the same profile cannot both pass the (user-scoped) seat count. Matches the
  -- count domain (devices.user_id). Transaction-scoped: released at commit.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_lic.user_id::text, 0));

  -- Known device for this user?
  SELECT id, is_active INTO v_device_id, v_was_active
  FROM public.devices
  WHERE user_id = v_lic.user_id
    AND device_fingerprint = p_device_fingerprint;

  IF FOUND THEN
    -- Reactivating an inactive device consumes a seat, so it must pass the
    -- seat check too. An already-active device is a pure revalidation.
    IF NOT v_was_active THEN
      SELECT count(*) INTO v_used
      FROM public.devices
      WHERE user_id = v_lic.user_id
        AND is_active = true
        AND id <> v_device_id;

      IF v_used >= v_lic.seats THEN
        RETURN jsonb_build_object(
          'status', 'seat_limit',
          'seats', v_lic.seats,
          'devices_used', v_used
        );
      END IF;
    END IF;

    v_event_type := 'validation';
    UPDATE public.devices
    SET last_validated = now(),
        app_version    = p_app_version,
        device_name    = p_device_name,
        os             = p_os,
        is_active      = true
    WHERE id = v_device_id;
  ELSE
    -- New device: the seat check + insert run under the per-user lock, so a
    -- concurrent activation cannot slip a second device past the cap.
    SELECT count(*) INTO v_used
    FROM public.devices
    WHERE user_id = v_lic.user_id
      AND is_active = true;

    IF v_used >= v_lic.seats THEN
      RETURN jsonb_build_object(
        'status', 'seat_limit',
        'seats', v_lic.seats,
        'devices_used', v_used
      );
    END IF;

    INSERT INTO public.devices (
      user_id, device_fingerprint, device_name, os, app_version
    )
    VALUES (
      v_lic.user_id, p_device_fingerprint, p_device_name, p_os, p_app_version
    )
    RETURNING id INTO v_device_id;

    v_event_type := 'activation';
  END IF;

  -- Log the event (matches the route's prior metadata shape). Best-effort: the
  -- route historically ignored audit-insert errors, so an event-log failure
  -- must NOT roll back an otherwise valid activation. The sub-block confines any
  -- failure to a savepoint, leaving the device write intact.
  BEGIN
    INSERT INTO public.licence_events (user_id, device_id, event_type, metadata)
    VALUES (
      v_lic.user_id,
      v_device_id,
      v_event_type,
      jsonb_build_object('app_version', p_app_version, 'ip', p_ip)
    );
  EXCEPTION WHEN OTHERS THEN
    -- Swallow: audit-log availability must not deny licence use.
    NULL;
  END;

  SELECT count(*) INTO v_final
  FROM public.devices
  WHERE user_id = v_lic.user_id
    AND is_active = true;

  RETURN jsonb_build_object(
    'status', 'ok',
    'licence_type', v_lic.licence_type,
    'company_name', v_lic.company_name,
    'seats', v_lic.seats,
    'devices_used', v_final,
    'expires_at', v_lic.expires_at,
    'event_type', v_event_type
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_licence_device(text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_licence_device(text, text, text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.validate_licence_device(text, text, text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.validate_licence_device(text, text, text, text, text, text) TO service_role;
