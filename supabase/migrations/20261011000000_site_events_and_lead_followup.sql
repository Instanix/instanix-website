-- 1. First-party website statistics, without cookies.
-- 2. The follow-up that ATLAS and HERMES prepare for each new lead.
--
-- Access: Row Level Security is enabled with NO policies, so the anon and authenticated
-- roles can read and write nothing. Only the server, using the service role key, writes.
-- The summary views run with the caller's rights (security_invoker), so they are just as closed.
-- Privacy: `visitor` is a keyed hash of the address and browser that changes every day.
-- It counts unique visitors within a day and cannot link one day to the next. No raw IP
-- address, no full referrer URL and no query string is ever stored.

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  kind text not null check (kind in ('view', 'action')),
  -- For an action: what was done, e.g. "whatsapp" or "lead_submitted". Null for a page view.
  name text check (name is null or name ~ '^[a-z0-9_]{1,40}$'),
  path text not null check (char_length(path) between 1 and 200),
  locale text not null check (locale in ('en', 'ar')),
  -- Host only, e.g. "google.com". Null for direct visits and visits from this site.
  referrer text check (referrer is null or char_length(referrer) <= 120),
  device text not null check (device in ('mobile', 'desktop')),
  visitor text not null check (char_length(visitor) = 24),
  constraint site_events_name_matches_kind check ((kind = 'view') = (name is null))
);

create index if not exists site_events_occurred_idx on public.site_events (occurred_at desc);

alter table public.site_events enable row level security;

-- Summaries for the owner, read in the Supabase dashboard. Days are Gulf time (Dubai).
create or replace view public.site_stats_daily with (security_invoker = true) as
select
  (occurred_at at time zone 'Asia/Dubai')::date as day,
  count(*) filter (where kind = 'view') as page_views,
  count(distinct visitor) as visitors,
  count(*) filter (where kind = 'action') as actions,
  count(*) filter (where name = 'lead_submitted') as leads
from public.site_events
group by 1
order by 1 desc;

create or replace view public.site_stats_pages with (security_invoker = true) as
select path, count(*) as page_views, count(distinct visitor) as visitors
from public.site_events
where kind = 'view' and occurred_at > now() - interval '30 days'
group by path
order by page_views desc;

create or replace view public.site_stats_actions with (security_invoker = true) as
select name, count(*) as times, count(distinct visitor) as visitors
from public.site_events
where kind = 'action' and occurred_at > now() - interval '30 days'
group by name
order by times desc;

create or replace view public.site_stats_sources with (security_invoker = true) as
select coalesce(referrer, 'direct') as source, count(distinct visitor) as visitors
from public.site_events
where kind = 'view' and occurred_at > now() - interval '30 days'
group by 1
order by visitors desc;

revoke all on public.site_stats_daily, public.site_stats_pages, public.site_stats_actions, public.site_stats_sources from anon, authenticated;

-- Lead follow-up. ATLAS scores the lead and HERMES drafts the first message. Nothing is sent
-- by the system: the owner reads the draft in the notification and sends it himself.
alter table public.leads
  add column if not exists qualification jsonb,
  add column if not exists followup_draft text check (followup_draft is null or char_length(followup_draft) <= 1200),
  add column if not exists followup_prepared_at timestamptz;
