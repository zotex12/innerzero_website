-- 008_shared_rate_limit.sql
-- Phase cloud-shared-user-ratelimit (B5 remainder of the
-- managed-cloud-subscriber-readiness plan, 2026-07-18).
--
-- Closes the remaining B5 security item: the per-user cloud-proxy rate
-- limit lived in per-serverless-instance memory (rate-limit.ts), so the
-- real cap was limit x warm instances. This table + RPC give the proxy a
-- shared fixed-window counter keyed by store:user so the per-user cap is
-- truly global. Gated in the app behind
-- CLOUD_PROXY_SHARED_RATELIMIT_ENABLED (default OFF); the client FAILS
-- OPEN to the in-memory limiter on any RPC error, because the limiter is
-- defence-in-depth (the billing reservation holds are the money gate)
-- and a database blip must never take chat down.
--
-- Access model: service-role ONLY, matching 005/006. RLS enabled with no
-- policies, client grants revoked, function SECURITY DEFINER with an
-- empty search_path and EXECUTE revoked from anon/authenticated.

create table if not exists public.rate_limit_counters (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (key, window_start)
);

create index if not exists rate_limit_counters_window_idx
  on public.rate_limit_counters (window_start);

alter table public.rate_limit_counters enable row level security;

revoke all on table public.rate_limit_counters from anon, authenticated;

-- One shared-limiter hit. Returns jsonb {allowed boolean, retry_after
-- integer seconds}. Fixed window aligned to epoch / p_window_ms, atomic
-- upsert increment. Malformed args fail OPEN (allowed) by design.
-- Retention: prunes this key's windows older than 2 windows on every
-- call, plus a global day-old sweep so abandoned keys cannot accrete.
create or replace function public.rate_limit_hit(
  p_key text,
  p_limit integer,
  p_window_ms integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window interval;
  v_window_start timestamptz;
  v_count integer;
  v_retry integer;
begin
  if p_key is null or length(p_key) = 0
     or p_limit is null or p_limit <= 0
     or p_window_ms is null or p_window_ms <= 0 then
    return jsonb_build_object('allowed', true, 'retry_after', 0);
  end if;

  v_window := make_interval(secs => p_window_ms / 1000.0);
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) * 1000 / p_window_ms) * p_window_ms / 1000.0
  );

  delete from public.rate_limit_counters
    where key = p_key
      and window_start < now() - (2 * v_window);
  -- Global sweep at 30 days: rows do not store their own window size, so
  -- a caller-relative threshold could let a short-window caller delete
  -- ANOTHER key's active long-window counter (Codex micro-round fold).
  -- 30 days is far above any sane limiter window (current presets max 1
  -- hour; windows must stay under 15 days), and abandoned keys are still
  -- bounded.
  delete from public.rate_limit_counters
    where window_start < now() - interval '30 days';

  insert into public.rate_limit_counters as c (key, window_start, count)
    values (p_key, v_window_start, 1)
    on conflict (key, window_start)
      do update set count = c.count + 1, updated_at = now()
    returning count into v_count;

  if v_count > p_limit then
    v_retry := greatest(
      1,
      ceil(extract(epoch from (v_window_start + v_window - now())))
    )::integer;
    return jsonb_build_object('allowed', false, 'retry_after', v_retry);
  end if;

  return jsonb_build_object('allowed', true, 'retry_after', 0);
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer)
  to service_role;
