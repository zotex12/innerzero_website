-- 006_cloud_provider_health.sql
-- Phase managed-model-collapse-v4flash-direct (B0 of the
-- managed-cloud-subscriber-readiness plan, 2026-07-17).
--
-- Server-side state for the managed-text circuit breaker (locked decision
-- 11): when the primary provider (direct DeepSeek, deepseek-v4-flash)
-- fails, the circuit opens and later requests route to the fallback
-- (Gemini 2.5 Flash-Lite) WITHOUT routinely sending the same prompt to two
-- providers. A half-open probe (one request per probe interval) closes the
-- circuit when the primary recovers. State lives here, not in serverless
-- instance memory, so warm instances share one truth.
--
-- Also ships the fallback-event audit table (Codex plan-review correction
-- d): one row per provider fallback, storing ONLY classified reason codes
-- and HTTP status text. NO prompt, NO response, NO provider body, ever.
--
-- Alerting contract (decision 11): the RPC verdicts drive an incident
-- state machine in the route: ONE alert when the circuit opens, a
-- throttled summary at most every 30 minutes while it stays open, ONE
-- recovery alert when it closes. All alerting is server-side only.
--
-- Access model: service-role ONLY, matching migration 005. RLS is enabled
-- with NO policies, client grants are revoked, and every function is
-- SECURITY DEFINER with an empty search_path and EXECUTE revoked from
-- anon/authenticated.

create table if not exists public.cloud_provider_health (
  provider text primary key,
  state text not null default 'closed' check (state in ('closed', 'open')),
  consecutive_failures integer not null default 0,
  -- Classified class:code token only, DB-enforced (Codex review fold):
  -- even a future service-role caller cannot persist a provider body.
  last_reason text
    check (last_reason is null
           or last_reason ~ '^[a-z]+:[A-Za-z0-9_.-]{1,40}$'),
  opened_at timestamptz,
  last_failure_at timestamptz,
  last_probe_at timestamptz,
  last_alert_at timestamptz,
  events_since_alert integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.cloud_provider_health enable row level security;

revoke all on table public.cloud_provider_health from anon, authenticated;

create table if not exists public.cloud_fallback_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  from_provider text not null,
  to_provider text not null,
  -- Classified class:code token only, DB-enforced (Codex review fold).
  reason text not null
    check (reason ~ '^[a-z]+:[A-Za-z0-9_.-]{1,40}$'),
  created_at timestamptz not null default now()
);

create index if not exists cloud_fallback_events_created_idx
  on public.cloud_fallback_events (created_at);

alter table public.cloud_fallback_events enable row level security;

revoke all on table public.cloud_fallback_events from anon, authenticated;

-- Route check, called once per managed request while the B0 flag is on.
-- Fast path: a plain read when the circuit is closed (no lock). When the
-- circuit is open, the provider row is locked and at most one caller per
-- p_probe_seconds window atomically claims a half-open probe.
-- Returns: 'closed' (call the primary), 'probe' (call the primary; report
-- the outcome), 'open' (do not call the primary; use the fallback).
create or replace function public.cloud_provider_route_check(
  p_provider text,
  p_probe_seconds integer
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_state text;
  v_claimed boolean;
begin
  select state into v_state
    from public.cloud_provider_health
    where provider = p_provider;
  if not found or v_state = 'closed' then
    return 'closed';
  end if;

  -- Open: claim a probe slot if the interval has elapsed. The WHERE
  -- re-checks under the write so concurrent callers cannot double-claim.
  update public.cloud_provider_health
    set last_probe_at = now(), updated_at = now()
    where provider = p_provider
      and state = 'open'
      and (last_probe_at is null
           or last_probe_at < now() - make_interval(secs => p_probe_seconds))
    returning true into v_claimed;
  if v_claimed then
    return 'probe';
  end if;
  return 'open';
end;
$$;

revoke all on function public.cloud_provider_route_check(text, integer)
  from public, anon, authenticated;
grant execute on function public.cloud_provider_route_check(text, integer)
  to service_role;

-- Record a primary-provider failure. First failure of a closed circuit
-- opens it (decision 11: first failure opens; no threshold warm-up).
-- Returns: 'opened' (send the ONE circuit-open alert),
-- 'summary_due:<n>' (30-minute throttle elapsed; send a summary covering
-- n events), 'counted' (no alert due).
create or replace function public.cloud_provider_failure(
  p_provider text,
  p_reason text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.cloud_provider_health%rowtype;
  v_events integer;
begin
  insert into public.cloud_provider_health (provider)
    values (p_provider)
    on conflict (provider) do nothing;

  select * into v_row
    from public.cloud_provider_health
    where provider = p_provider
    for update;

  if v_row.state = 'closed' then
    update public.cloud_provider_health
      set state = 'open',
          consecutive_failures = v_row.consecutive_failures + 1,
          last_reason = left(p_reason, 200),
          opened_at = now(),
          last_failure_at = now(),
          last_alert_at = now(),
          events_since_alert = 0,
          updated_at = now()
      where provider = p_provider;
    return 'opened';
  end if;

  v_events := v_row.events_since_alert + 1;
  if v_row.last_alert_at is null
     or v_row.last_alert_at < now() - interval '30 minutes' then
    update public.cloud_provider_health
      set consecutive_failures = v_row.consecutive_failures + 1,
          last_reason = left(p_reason, 200),
          last_failure_at = now(),
          last_alert_at = now(),
          events_since_alert = 0,
          updated_at = now()
      where provider = p_provider;
    return 'summary_due:' || v_events;
  end if;

  update public.cloud_provider_health
    set consecutive_failures = v_row.consecutive_failures + 1,
        last_reason = left(p_reason, 200),
        last_failure_at = now(),
        events_since_alert = v_events,
        updated_at = now()
    where provider = p_provider;
  return 'counted';
end;
$$;

revoke all on function public.cloud_provider_failure(text, text)
  from public, anon, authenticated;
grant execute on function public.cloud_provider_failure(text, text)
  to service_role;

-- Record a primary-provider success. Closes an open circuit (probe
-- succeeded). Returns 'recovered' (send the ONE recovery alert) or 'ok'.
create or replace function public.cloud_provider_success(
  p_provider text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.cloud_provider_health%rowtype;
begin
  select * into v_row
    from public.cloud_provider_health
    where provider = p_provider
    for update;
  if not found then
    return 'ok';
  end if;

  if v_row.state = 'open' then
    update public.cloud_provider_health
      set state = 'closed',
          consecutive_failures = 0,
          opened_at = null,
          events_since_alert = 0,
          updated_at = now()
      where provider = p_provider;
    return 'recovered';
  end if;

  update public.cloud_provider_health
    set consecutive_failures = 0, updated_at = now()
    where provider = p_provider;
  return 'ok';
end;
$$;

revoke all on function public.cloud_provider_success(text)
  from public, anon, authenticated;
grant execute on function public.cloud_provider_success(text)
  to service_role;

-- Insert one fallback-event row. p_reason is a classified code plus HTTP
-- status text only; callers never pass prompt/response/provider bodies.
-- Opportunistic retention: prunes settled history older than 30 days on
-- each insert (index-backed, matches the 005 pattern; the existing prune
-- cron covers only proxy_cost_log).
create or replace function public.record_cloud_fallback_event(
  p_user_id uuid,
  p_from_provider text,
  p_to_provider text,
  p_reason text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.cloud_fallback_events
    where created_at < now() - interval '30 days';

  insert into public.cloud_fallback_events
    (user_id, from_provider, to_provider, reason)
    values (p_user_id, p_from_provider, p_to_provider, left(p_reason, 200));
end;
$$;

revoke all on function public.record_cloud_fallback_event(uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_cloud_fallback_event(uuid, text, text, text)
  to service_role;
