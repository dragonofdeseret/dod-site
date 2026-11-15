-- ──────────────────────────────────────────────────────────────────────────────
-- View counts and likes for /tv videos.
--
-- Run ONCE in the Supabase SQL editor (Dashboard → SQL Editor → New query →
-- paste → Run). Safe to re-run: every statement is create-if-missing or
-- create-or-replace.
--
-- No accounts are involved. Each browser gets a random anonymous id (kept
-- in its localStorage); a view is counted at most once per browser, per
-- video, per day, and a browser can like a video once.
--
-- To keep scripts from pumping the numbers, any one internet address may
-- add only so many views/likes per hour. For that the server passes a
-- keyed one-way hash of the address (the key changes daily). The hash is
-- kept ONLY in the small video_rate counter, never next to a view or like,
-- and counter rows are deleted after about two hours. No IP address is
-- stored anywhere.
--
-- Access: both tables have row-level security switched on with NO policies,
-- and the functions can only be called by the service role — so only the
-- site's own server (which holds the service-role key) can read or write
-- them. The public anon key can't touch any of it.
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists public.video_views (
  video_id   text        not null,
  visitor    text        not null,
  day        date        not null default ((now() at time zone 'utc')::date),
  created_at timestamptz not null default now(),
  primary key (video_id, visitor, day)
);

create table if not exists public.video_likes (
  video_id   text        not null,
  visitor    text        not null,
  created_at timestamptz not null default now(),
  primary key (video_id, visitor)
);

-- Per-address counter for the hourly limit. Short-lived: rows older than
-- the previous hour are deleted on every write.
create table if not exists public.video_rate (
  ip_hash text        not null,
  hour    timestamptz not null,
  n       integer     not null default 0,
  primary key (ip_hash, hour)
);

create index if not exists video_likes_visitor on public.video_likes (visitor);

alter table public.video_views enable row level security;
alter table public.video_likes enable row level security;
alter table public.video_rate enable row level security;

-- Counts for a set of videos, plus whether `viewer` (an anonymous browser
-- id, may be null) has liked each one.
create or replace function public.video_counts(ids text[], viewer text default null)
returns table (video_id text, views bigint, likes bigint, liked boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    (select count(*) from video_views v where v.video_id = i.id),
    (select count(*) from video_likes l where l.video_id = i.id),
    coalesce(viewer is not null and exists (
      select 1 from video_likes l where l.video_id = i.id and l.visitor = viewer
    ), false)
  from unnest(ids) as i(id)
$$;

-- Take one of this address's slots for the current hour; false when it has
-- used them all. Also clears out counter rows that are no longer needed.
drop function if exists public.video_recent_events(text);
create or replace function public.video_take_slot(p_ip_hash text, p_limit integer)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  used integer;
begin
  delete from video_rate where hour < date_trunc('hour', now()) - interval '1 hour';
  insert into video_rate (ip_hash, hour, n)
    values (p_ip_hash, date_trunc('hour', now()), 1)
    on conflict (ip_hash, hour) do update set n = video_rate.n + 1
    returning n into used;
  return used <= p_limit;
end
$$;

-- Count a view (once per browser per video per day). `ok` is false when the
-- address is over its hourly limit; nothing is written then. Returns the
-- video's counts either way.
create or replace function public.record_video_view(
  p_video text, p_visitor text, p_ip_hash text, p_limit integer
)
returns table (ok boolean, views bigint, likes bigint, liked boolean)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  allowed boolean := video_take_slot(p_ip_hash, p_limit);
begin
  if allowed then
    insert into video_views (video_id, visitor)
      values (p_video, p_visitor)
      on conflict do nothing;
  end if;
  return query
    select allowed, c.views, c.likes, c.liked
    from video_counts(array[p_video], p_visitor) c;
end
$$;

-- Like (p_like = true) or un-like a video for one browser. Un-liking is
-- always allowed; a new like counts toward the hourly limit.
create or replace function public.set_video_like(
  p_video text, p_visitor text, p_ip_hash text, p_like boolean, p_limit integer
)
returns table (ok boolean, views bigint, likes bigint, liked boolean)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  allowed boolean := true;
begin
  if p_like then
    allowed := video_take_slot(p_ip_hash, p_limit);
    if allowed then
      insert into video_likes (video_id, visitor)
        values (p_video, p_visitor)
        on conflict do nothing;
    end if;
  else
    delete from video_likes where video_id = p_video and visitor = p_visitor;
  end if;
  return query
    select allowed, c.views, c.likes, c.liked
    from video_counts(array[p_video], p_visitor) c;
end
$$;

-- Only the server may call these.
revoke all on function public.video_counts(text[], text) from public, anon, authenticated;
revoke all on function public.video_take_slot(text, integer) from public, anon, authenticated;
revoke all on function public.record_video_view(text, text, text, integer) from public, anon, authenticated;
revoke all on function public.set_video_like(text, text, text, boolean, integer) from public, anon, authenticated;
grant execute on function public.video_counts(text[], text) to service_role;
grant execute on function public.video_take_slot(text, integer) to service_role;
grant execute on function public.record_video_view(text, text, text, integer) to service_role;
grant execute on function public.set_video_like(text, text, text, boolean, integer) to service_role;
