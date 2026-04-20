-- Newsletter subscribers. Separate from the existing `waitlist` table
-- (which is in active use with its own /api/waitlist route) so the two
-- audiences and unsubscribe flows stay independent.
--
-- Storage only at this phase. Email automation (sending, double opt-in,
-- the unsubscribe route) is deferred. The unsubscribe_token column is
-- populated up-front so it never needs a backfill migration when the
-- /unsubscribe route ships later.

create table public.newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  source text not null default 'unknown',
  subscribed_at timestamptz not null default now(),
  confirmed_at timestamptz null,
  unsubscribed_at timestamptz null,
  unsubscribe_token uuid not null default gen_random_uuid()
);

create index idx_newsletter_subscribers_email
  on public.newsletter_subscribers (email);

-- Partial index covering only currently-subscribed rows. Active-list
-- queries (the future "send to everyone subscribed" job) hit this
-- without scanning unsubscribed historical rows.
create index idx_newsletter_subscribers_unsubscribed
  on public.newsletter_subscribers (unsubscribed_at)
  where unsubscribed_at is null;

-- RLS on, with no SELECT/INSERT/UPDATE/DELETE policies for anon or
-- authenticated. Reads and writes are server-side only via the
-- service-role client (POST /api/newsletter/subscribe). No client
-- can list, count, or query this table.
alter table public.newsletter_subscribers enable row level security;

-- Belt and braces: revoke all default grants. PostgreSQL grants
-- INSERT/SELECT/UPDATE/DELETE to PUBLIC by default on new tables in
-- some setups; explicitly stripping them from the two roles a client
-- can authenticate as means even a misconfigured RLS policy in the
-- future cannot accidentally expose this table client-side.
revoke all on public.newsletter_subscribers from authenticated, anon;
revoke all on sequence public.newsletter_subscribers_id_seq
  from authenticated, anon;
