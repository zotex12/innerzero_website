-- 005_cloud_request_reservations.sql
-- Phase cloud-prebill-reservation (managed-cloud-subscriber-readiness plan,
-- minimal B5 slice + B1 pre-call hold, 2026-07-17; hardened per the Codex
-- adversarial review the same day).
--
-- Closes two live billing exploits in /api/cloud/proxy:
--   1. REPLAY: the request_id idempotency check ran AFTER the provider call,
--      so a reused successful request_id skipped deduction but still returned
--      fresh provider content (unlimited free provider calls).
--   2. CONCURRENT OVERDRAFT: the balance check ran before the provider call
--      and the deduction after it, so N concurrent requests with 1 unit left
--      all reached the provider while only one deduction landed.
--
-- Shape: a reservation row is inserted BEFORE any provider call, under the
-- profile row lock (the same first-lock the atomic deduct RPCs take, so the
-- lock order is consistent and deadlock-free). The RPC rejects request_id
-- reuse and enforces that the sum of live pending holds fits within the
-- user's DEDUCTABLE credits: subscription balance plus, per eligible PAYG
-- pack, only whole multiples of this request's cost (a fragmented pack
-- cannot serve a request bigger than its remainder, so raw remainders must
-- not inflate the hold capacity - Codex finding 3). Stale pending holds
-- (a crashed invocation; route maxDuration is 30s) self-expire from the
-- hold sum after 5 minutes AND become retryable so a crash can neither
-- block a user's balance nor permanently burn a request_id.
--
-- Retention: each successful reserve call opportunistically prunes this
-- user's settled (completed/failed) rows older than 30 days, bounding table
-- growth without a separate cron. Replaying an id older than 30 days after
-- prune is BILLING-SAFE, not free: the route treats it as a fresh request,
-- the atomic deduction lands BEFORE the usage_transactions audit insert,
-- and the duplicate-request_id insert failure (23505 on the global unique
-- index) only costs the secondary audit row, which both deduction paths
-- log loudly for reconciliation. Content is never served without a landed
-- deduction.
--
-- Access model: service-role ONLY. RLS is enabled with NO policies (the
-- admin client bypasses RLS; everyone else is denied), client grants are
-- revoked, and both functions are SECURITY DEFINER with an EMPTY
-- search_path (every relation schema-qualified) and EXECUTE revoked from
-- anon/authenticated. This deliberately avoids the freely-EXECUTE-able
-- SECURITY DEFINER hole called out in the master plan's B2 security item.

create table if not exists public.cloud_request_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  request_id text not null,
  payload_hash text not null,
  cost_units integer not null check (cost_units > 0),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cloud_request_reservations_user_request_uidx
  on public.cloud_request_reservations (user_id, request_id);

create index if not exists cloud_request_reservations_pending_idx
  on public.cloud_request_reservations (user_id, status, created_at);

alter table public.cloud_request_reservations enable row level security;

revoke all on table public.cloud_request_reservations from anon, authenticated;

-- Reserve a hold for one proxy request. Returns a verdict string:
--   'ok'                  reservation placed (or a failed/stale row re-armed); call the provider.
--   'insufficient'        hold does not fit within deductable credits; 402.
--   'duplicate_completed' request_id already served; 409, do NOT call the provider.
--   'duplicate_pending'   request_id currently in flight (younger than the
--                         5-minute window); 409, do NOT call the provider.
--   'payload_mismatch'    request_id reused with a different payload; 409.
--   'no_profile'          profile row missing; 404.
--   'invalid_cost'        p_cost missing or non-positive; 500.
create or replace function public.atomic_reserve_cloud_request(
  p_user_id uuid,
  p_request_id text,
  p_payload_hash text,
  p_cost integer
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.cloud_request_reservations%rowtype;
  v_balance integer;
  v_pack_units bigint;
  v_pending bigint;
begin
  if p_cost is null or p_cost <= 0 then
    return 'invalid_cost';
  end if;

  -- Serialise all of this user's reservations behind the profile row lock
  -- (the atomic deduct RPCs take the same row lock first, so reserve and
  -- deduct cannot interleave for one user and the lock order is uniform).
  select coalesce(usage_balance, 0)
    into v_balance
    from public.profiles
    where id = p_user_id
    for update;
  if not found then
    return 'no_profile';
  end if;

  -- Opportunistic retention: prune this user's settled rows older than 30
  -- days (bounded, index-backed; no separate cron needed).
  delete from public.cloud_request_reservations
    where user_id = p_user_id
      and status in ('completed', 'failed')
      and created_at < now() - interval '30 days';

  select * into v_existing
    from public.cloud_request_reservations
    where user_id = p_user_id and request_id = p_request_id;

  if found then
    if v_existing.payload_hash <> p_payload_hash then
      return 'payload_mismatch';
    elsif v_existing.status = 'completed' then
      return 'duplicate_completed';
    elsif v_existing.status = 'pending'
      and v_existing.created_at > now() - interval '5 minutes' then
      return 'duplicate_pending';
    else
      -- Failed rows, and pending rows staler than the 5-minute window
      -- (crashed invocation), may retry: re-arm the hold. created_at is
      -- refreshed so the re-armed hold counts inside the live window.
      update public.cloud_request_reservations
        set status = 'pending',
            cost_units = p_cost,
            payload_hash = p_payload_hash,
            created_at = now(),
            updated_at = now()
        where id = v_existing.id;
    end if;
  else
    insert into public.cloud_request_reservations
      (user_id, request_id, payload_hash, cost_units)
      values (p_user_id, p_request_id, p_payload_hash, p_cost);
  end if;

  -- Deductable credits. Subscription balance counts in full. A PAYG pack
  -- can only serve requests it can WHOLLY cover, so each eligible pack
  -- contributes floor(remaining / cost) * cost, not its raw remainder
  -- (integer division; conservative for mixed-cost concurrency).
  select coalesce(sum((usage_remaining / p_cost) * p_cost), 0)
    into v_pack_units
    from public.usage_packs
    where user_id = p_user_id
      and usage_remaining >= p_cost
      and (expires_at is null or expires_at > now());

  -- Live pending holds INCLUDING this request's own hold. Stale holds
  -- older than 5 minutes are excluded (crashed invocations self-heal).
  select coalesce(sum(cost_units), 0)
    into v_pending
    from public.cloud_request_reservations
    where user_id = p_user_id
      and status = 'pending'
      and created_at > now() - interval '5 minutes';

  if (v_balance + v_pack_units) < v_pending then
    update public.cloud_request_reservations
      set status = 'failed', updated_at = now()
      where user_id = p_user_id and request_id = p_request_id;
    return 'insufficient';
  end if;

  return 'ok';
end;
$$;

revoke all on function public.atomic_reserve_cloud_request(uuid, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.atomic_reserve_cloud_request(uuid, text, text, integer)
  to service_role;

-- Settle a reservation after the request finishes. p_outcome:
-- 'completed' when the provider responded AND a deduction landed;
-- anything else marks 'failed' (releases the hold immediately).
create or replace function public.finalize_cloud_request_reservation(
  p_user_id uuid,
  p_request_id text,
  p_outcome text
) returns void
language sql
security definer
set search_path = ''
as $$
  update public.cloud_request_reservations
    set status = case when p_outcome = 'completed' then 'completed' else 'failed' end,
        updated_at = now()
    where user_id = p_user_id and request_id = p_request_id;
$$;

revoke all on function public.finalize_cloud_request_reservation(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.finalize_cloud_request_reservation(uuid, text, text)
  to service_role;
