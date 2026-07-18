-- 011_managed_voice_sessions.sql
-- Phase server-managed-voice-proxy (C1 of the managed-cloud-subscriber-
-- readiness plan, 2026-07-18).
--
-- Session registry for the managed voice proxy (locked decision 13:
-- gpt-realtime-2.1-mini, 15 usage units per STARTED minute, metered by
-- per-minute ephemeral-token renewal through the proxy). The server only
-- MINTS short-TTL OpenAI client secrets and bills through the existing
-- atomic deduct paths; no audio, no transcript, and no message content
-- ever touches this schema. This table carries lifecycle bookkeeping
-- ONLY: ids, status, charged-minute counter, timestamps, and a
-- classified ended_reason code.
--
-- Guards enforced here (the money itself moves through
-- atomic_deduct_sub_with_cap / atomic_deduct_pack, untouched):
--   1. ONE concurrent voice session per user. voice_session_start takes
--      the profile row lock (uniform lock order with every deduct RPC),
--      expires stale actives (a session whose renewals stopped without a
--      clean end), then rejects if a live active session remains.
--   2. 30-minute maximum session length. voice_session_renew rejects
--      minute 31 and closes the row.
--   3. Stale self-healing: an active row whose last_renewal_at is older
--      than the stale window (route passes 150s = 2 missed 60s renewals
--      plus skew) flips to 'expired' instead of blocking the user's
--      next session. Expired-not-ended rows are ALSO the abuse signal
--      for clients that stop renewing (see the C1 packet residual-risk
--      note); they stay queryable for 30 days.
--   4. Session-start LEASE QUOTA (Codex C1 review P1 fold): ending a
--      session releases the registry slot but CANNOT terminate an
--      already-established provider connection, so client-controlled
--      release (clean /end or engineered stale expiry) could stack
--      provider sessions. Start therefore also rejects when too many
--      sessions were started inside the rolling lease window,
--      regardless of their current status. The route passes a window of
--      65 minutes: the provider's maximum realtime session lifetime
--      (verified 2026-07-18: OpenAI realtime sessions hard-cap at 60
--      minutes, no server-side kill) PLUS the maximum delayed
--      connection start a minted secret allows (TTL + skew = 210s)
--      plus margin (Codex round-3 fold). At most
--      p_max_sessions_per_window provider sessions can therefore be
--      alive concurrently: any row that left the window is provider-
--      dead even if its connection started as late as the secret
--      allowed. Sessions that never released a secret
--      (aborted at minute 1) are recorded with ended_reason 'aborted'
--      and do NOT consume quota.
--   5. RENEWAL CADENCE, anchored (Codex C1 review round-2 fold): billing
--      boundaries derive from started_at, never from the previous
--      request's arrival time, so early renewals cannot compound.
--      Charged minute N+1 becomes due at started_at + N*60s minus a
--      small fixed grace (route passes 5s); an early renewal gets
--      'too_early' with a retry hint: no mint, no deduction, no counter
--      advance. Concurrent renewals serialise on the profile lock. The
--      worst-case overcharge per session is the one-time 5s grace,
--      non-compounding. A late client may catch up owed STARTED minutes
--      back-to-back (bounded by wall time and the stale window).
--
-- Retention: each successful start opportunistically prunes this user's
-- settled (ended/expired) rows older than 30 days (005 pattern; no cron).
--
-- Access model (005/006/008 pattern): RLS enabled with NO policies,
-- client grants revoked, all functions SECURITY DEFINER with EMPTY
-- search_path and EXECUTE revoked from anon/authenticated, granted to
-- service_role only.

create table if not exists public.cloud_voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id text not null,
  status text not null default 'active'
    check (status in ('active', 'ended', 'expired')),
  minutes_charged integer not null default 0,
  started_at timestamptz not null default now(),
  last_renewal_at timestamptz not null default now(),
  ended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cloud_voice_sessions_user_session_uidx
  on public.cloud_voice_sessions (user_id, session_id);

create index if not exists cloud_voice_sessions_user_status_idx
  on public.cloud_voice_sessions (user_id, status, last_renewal_at);

alter table public.cloud_voice_sessions enable row level security;

revoke all on table public.cloud_voice_sessions from anon, authenticated;

-- Start a voice session. Returns a verdict string:
--   'ok'                 row inserted with minutes_charged = 0; the route
--                        then mints the secret and charges minute 1 via
--                        voice_session_renew before returning the secret.
--   'concurrent_session' another live active session exists; 409.
--   'session_quota'      too many sessions started inside the rolling
--                        lease window (guard 4); 429.
--   'no_profile'         profile row missing; 404.
create or replace function public.voice_session_start(
  p_user_id uuid,
  p_session_id text,
  p_stale_seconds integer,
  p_lease_window_seconds integer,
  p_max_sessions_per_window integer
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_live_count integer;
  v_window_count integer;
begin
  -- Serialise this user's voice lifecycle behind the profile row lock
  -- (same first-lock as the atomic deduct RPCs; uniform, deadlock-free).
  perform 1 from public.profiles where id = p_user_id for update;
  if not found then
    return 'no_profile';
  end if;

  -- Opportunistic retention (005 pattern).
  delete from public.cloud_voice_sessions
    where user_id = p_user_id
      and status in ('ended', 'expired')
      and created_at < now() - interval '30 days';

  -- Self-heal: actives whose renewals stopped are expired, not blocking.
  update public.cloud_voice_sessions
    set status = 'expired',
        ended_reason = coalesce(ended_reason, 'stale'),
        updated_at = now()
    where user_id = p_user_id
      and status = 'active'
      and last_renewal_at < now() - make_interval(secs => p_stale_seconds);

  select count(*) into v_live_count
    from public.cloud_voice_sessions
    where user_id = p_user_id and status = 'active';
  if v_live_count > 0 then
    return 'concurrent_session';
  end if;

  -- Guard 4: lease quota. Ending or abandoning a session cannot kill an
  -- established provider connection, so releases inside the window keep
  -- consuming quota; only never-released sessions ('aborted') are free.
  select count(*) into v_window_count
    from public.cloud_voice_sessions
    where user_id = p_user_id
      and started_at > now() - make_interval(secs => p_lease_window_seconds)
      and (status = 'active' or ended_reason is distinct from 'aborted');
  if v_window_count >= p_max_sessions_per_window then
    return 'session_quota';
  end if;

  insert into public.cloud_voice_sessions (user_id, session_id)
    values (p_user_id, p_session_id);
  return 'ok';
end;
$$;

revoke all on function public.voice_session_start(uuid, text, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.voice_session_start(uuid, text, integer, integer, integer)
  to service_role;

-- Charge one more started minute against a session. Returns one row
-- (verdict, minutes_charged, retry_after_seconds):
--   'ok'            minute counter advanced and renewal stamped; the
--                   route must now land the 15-unit deduction and only
--                   then return the fresh secret. A failed deduction
--                   calls voice_session_end, so the incremented counter
--                   on a dying session never bills anything by itself
--                   (the counter is bookkeeping; money moves only in
--                   the deduct RPCs).
--   'too_early'     guard 5: the next minute's anchored boundary
--                   (started_at + minutes_charged*60 - grace) has not
--                   arrived. No counter advance, no mint, no deduction;
--                   retry_after_seconds says when the renewal will be
--                   accepted. 429.
--   'not_found'     no such session for this user; 404.
--   'session_ended' row already ended/expired, or its renewals went
--                   stale (flipped to 'expired' here); 409.
--   'max_minutes'   the 30-minute cap would be exceeded; row closed
--                   with ended_reason 'max_minutes'; 409.
create or replace function public.voice_session_renew(
  p_user_id uuid,
  p_session_id text,
  p_stale_seconds integer,
  p_max_minutes integer,
  p_early_grace_seconds integer
) returns table(verdict text, minutes_charged integer, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.cloud_voice_sessions%rowtype;
  v_elapsed numeric;
  v_due numeric;
  v_updated integer;
begin
  perform 1 from public.profiles where id = p_user_id for update;
  if not found then
    return query select 'not_found'::text, 0, 0;
    return;
  end if;

  select * into v_row
    from public.cloud_voice_sessions
    where user_id = p_user_id and session_id = p_session_id;
  if not found then
    return query select 'not_found'::text, 0, 0;
    return;
  end if;

  if v_row.status <> 'active' then
    return query select 'session_ended'::text, v_row.minutes_charged, 0;
    return;
  end if;

  -- Minute 1 is charged immediately after start (last_renewal_at =
  -- started_at then), so the stale check only bites once renewals stop.
  if v_row.last_renewal_at < now() - make_interval(secs => p_stale_seconds) then
    update public.cloud_voice_sessions
      set status = 'expired', ended_reason = 'stale', updated_at = now()
      where id = v_row.id;
    return query select 'session_ended'::text, v_row.minutes_charged, 0;
    return;
  end if;

  -- Guard 5: anchored renewal cadence. Only minute 1 (counter still 0)
  -- may be charged immediately; charged minute N+1 becomes due at
  -- started_at + N*60s minus the fixed grace. Anchoring to started_at
  -- (round-2 fold) means early renewals cannot compound: the schedule
  -- never resets to the request's arrival time, so the worst case per
  -- session is the one-time grace, and a 55s-spammer is rejected at
  -- every boundary it has already consumed. Burst or concurrent
  -- renewals serialise on the profile lock above, so the losers land
  -- here and are rejected without minting or deducting.
  if v_row.minutes_charged >= 1 then
    v_elapsed := extract(epoch from (now() - v_row.started_at));
    v_due := (v_row.minutes_charged * 60)::numeric - p_early_grace_seconds;
    if v_elapsed < v_due then
      return query select
        'too_early'::text,
        v_row.minutes_charged,
        greatest(1, ceil(v_due - v_elapsed)::integer);
      return;
    end if;
  end if;

  if v_row.minutes_charged + 1 > p_max_minutes then
    update public.cloud_voice_sessions
      set status = 'ended', ended_reason = 'max_minutes', updated_at = now()
      where id = v_row.id;
    return query select 'max_minutes'::text, v_row.minutes_charged, 0;
    return;
  end if;

  -- Conditioned on status = 'active' with a row-count check as belt and
  -- braces against any writer that does not take the profile lock
  -- (Codex C1 review P2 fold; voice_session_end now locks too).
  update public.cloud_voice_sessions
    set minutes_charged = v_row.minutes_charged + 1,
        last_renewal_at = now(),
        updated_at = now()
    where id = v_row.id
      and status = 'active';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return query select 'session_ended'::text, v_row.minutes_charged, 0;
    return;
  end if;
  return query select 'ok'::text, v_row.minutes_charged + 1, 0;
end;
$$;

revoke all on function public.voice_session_renew(uuid, text, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.voice_session_renew(uuid, text, integer, integer, integer)
  to service_role;

-- Close a session (clean client end, deduction failure, provider error,
-- or a minute-1 abort where no secret was ever released). p_reason is
-- normalised against a fixed allow-list (Codex C1 review P3 fold), so
-- no future caller can ever write user-derived text into ended_reason;
-- anything unrecognised becomes 'other'.
create or replace function public.voice_session_end(
  p_user_id uuid,
  p_session_id text,
  p_reason text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
  v_reason text;
begin
  -- Same profile row lock as start/renew (Codex C1 review P2 fold): an
  -- end can no longer interleave with a renew's read-check-update.
  perform 1 from public.profiles where id = p_user_id for update;
  if not found then
    return 'not_found';
  end if;

  v_reason := case
    when p_reason in (
      'client_end', 'credits_exhausted', 'spending_cap_exceeded',
      'provider_error', 'deduct_failed', 'max_minutes', 'stale', 'aborted'
    ) then p_reason
    else 'other'
  end;

  update public.cloud_voice_sessions
    set status = 'ended',
        ended_reason = v_reason,
        updated_at = now()
    where user_id = p_user_id
      and session_id = p_session_id
      and status = 'active';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return 'not_found';
  end if;
  return 'ok';
end;
$$;

revoke all on function public.voice_session_end(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.voice_session_end(uuid, text, text)
  to service_role;
