-- Usage counters for the public AI features (assessment, live demo chat).
--
-- The website spends money on every AI call, so the limits must survive a server restart
-- and be shared by every server instance. Counting happens here, atomically, in one call.
--
-- Access: Row Level Security is enabled with NO policies, and the function can only be
-- executed by the service role. The browser can never read or change a counter.
-- Privacy: `bucket` never holds a raw IP address. The server sends a keyed hash.

create table public.usage_counters (
  bucket text not null check (char_length(bucket) between 1 and 120),
  window_start timestamptz not null,
  count integer not null default 0 check (count >= 0),
  primary key (bucket, window_start)
);

alter table public.usage_counters enable row level security;

-- Counts one use of `p_bucket` in the current fixed window and says whether it is allowed.
-- A refused attempt is still counted, so a client that keeps hammering stays refused.
create or replace function public.ix_consume_usage(p_bucket text, p_limit integer, p_window_seconds integer)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_count integer;
begin
  if p_limit < 0 or p_window_seconds < 1 or p_window_seconds > 2592000 then
    raise exception 'invalid usage limit arguments';
  end if;

  v_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.usage_counters as c (bucket, window_start, count)
  values (p_bucket, v_start, 1)
  on conflict (bucket, window_start) do update set count = c.count + 1
  returning c.count into v_count;

  -- Housekeeping on a small share of calls keeps the table from growing without bound.
  if random() < 0.02 then
    delete from public.usage_counters where window_start < now() - interval '3 days';
  end if;

  return query
  select
    v_count <= p_limit,
    greatest(0, ceil(extract(epoch from (v_start + make_interval(secs => p_window_seconds) - now()))))::integer;
end;
$$;

revoke all on function public.ix_consume_usage(text, integer, integer) from public, anon, authenticated;
grant execute on function public.ix_consume_usage(text, integer, integer) to service_role;
