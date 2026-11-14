-- overview.sql
-- Run this in the Supabase SQL editor.
-- Provides overview_stats (per-user, SECURITY INVOKER) and public_stats (global, SECURITY DEFINER).

-- ---------------------------------------------------------------------------
-- overview_stats: per-user aggregates over the last p_days (RLS applies)
-- ---------------------------------------------------------------------------
create or replace function public.overview_stats(
  p_days int default 7,
  p_tz text default 'UTC'
)
returns json
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_days int := greatest(1, least(coalesce(p_days, 7), 90));
  v_tz text := coalesce(nullif(p_tz, ''), 'UTC');
  v_now timestamptz := now();
  v_start timestamptz := v_now - (v_days || ' days')::interval;
  v_prev_start timestamptz := v_now - (2 * v_days || ' days')::interval;
  v_total bigint;
  v_prev bigint;
  v_unique bigint;
  v_mobile bigint;
  v_desktop bigint;
  v_tablet bigint;
  v_links bigint;
  v_all_time bigint;
  v_daily json;
  v_countries json;
  v_referrers json;
begin
  -- total clicks in window (non-bot)
  select count(*) into v_total
  from public.clicks c
  join public.links l on l.id = c.link_id
  where l.user_id = auth.uid()
    and c.clicked_at >= v_start
    and c.device is distinct from 'bot';

  -- previous window
  select count(*) into v_prev
  from public.clicks c
  join public.links l on l.id = c.link_id
  where l.user_id = auth.uid()
    and c.clicked_at >= v_prev_start
    and c.clicked_at < v_start
    and c.device is distinct from 'bot';

  -- unique countries (excluding XX and null)
  select count(distinct c.country) into v_unique
  from public.clicks c
  join public.links l on l.id = c.link_id
  where l.user_id = auth.uid()
    and c.clicked_at >= v_start
    and c.device is distinct from 'bot'
    and c.country is not null
    and c.country <> 'XX';

  -- devices
  select
    count(*) filter (where c.device = 'mobile'),
    count(*) filter (where c.device = 'desktop'),
    count(*) filter (where c.device = 'tablet')
  into v_mobile, v_desktop, v_tablet
  from public.clicks c
  join public.links l on l.id = c.link_id
  where l.user_id = auth.uid()
    and c.clicked_at >= v_start
    and c.device is distinct from 'bot';

  -- daily (with zeros) in timezone
  select coalesce(json_agg(json_build_object('day', d.day::date, 'clicks', coalesce(x.cnt, 0)) order by d.day), '[]'::json)
  into v_daily
  from generate_series(
         (v_now at time zone v_tz)::date - (v_days - 1),
         (v_now at time zone v_tz)::date,
         interval '1 day'
       ) as d(day)
  left join lateral (
    select count(*)::int as cnt
    from public.clicks c
    join public.links l on l.id = c.link_id
    where l.user_id = auth.uid()
      and c.device is distinct from 'bot'
      and (c.clicked_at at time zone v_tz)::date = d.day::date
  ) x on true;

  -- top 5 countries
  select coalesce(json_agg(json_build_object('country', country, 'clicks', cnt) order by cnt desc), '[]'::json)
  into v_countries
  from (
    select c.country as country, count(*)::int as cnt
    from public.clicks c
    join public.links l on l.id = c.link_id
    where l.user_id = auth.uid()
      and c.clicked_at >= v_start
      and c.device is distinct from 'bot'
      and c.country is not null
      and c.country <> 'XX'
    group by c.country
    order by cnt desc
    limit 5
  ) t;

  -- top 5 referrers (null => 'Direct')
  select coalesce(json_agg(json_build_object('host', host, 'clicks', cnt) order by cnt desc), '[]'::json)
  into v_referrers
  from (
    select coalesce(c.referrer_host, 'Direct') as host, count(*)::int as cnt
    from public.clicks c
    join public.links l on l.id = c.link_id
    where l.user_id = auth.uid()
      and c.clicked_at >= v_start
      and c.device is distinct from 'bot'
    group by coalesce(c.referrer_host, 'Direct')
    order by cnt desc
    limit 5
  ) t;

  -- active links count
  select count(*) into v_links
  from public.links
  where user_id = auth.uid() and is_active = true;

  -- total all-time clicks (non-bot)
  select coalesce(sum(click_count), 0) into v_all_time
  from public.links
  where user_id = auth.uid();

  return json_build_object(
    'total_clicks', v_total,
    'previous_total_clicks', v_prev,
    'unique_countries', v_unique,
    'devices', json_build_object('mobile', v_mobile, 'desktop', v_desktop, 'tablet', v_tablet),
    'daily', v_daily,
    'countries', v_countries,
    'referrers', v_referrers,
    'links_count', v_links,
    'total_all_time_clicks', v_all_time
  );
end;
$$;

grant execute on function public.overview_stats(int, text) to authenticated;

-- ---------------------------------------------------------------------------
-- public_stats: global aggregates, SECURITY DEFINER (no per-link data)
-- ---------------------------------------------------------------------------
create or replace function public.public_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_links_total bigint;
  v_clicks_total bigint;
  v_countries_total bigint;
  v_daily json;
begin
  select count(*) into v_links_total from public.links;

  select count(*) into v_clicks_total
  from public.clicks
  where device is distinct from 'bot';

  select count(distinct country) into v_countries_total
  from public.clicks
  where device is distinct from 'bot'
    and country is not null
    and country <> 'XX';

  select coalesce(json_agg(json_build_object('day', d.day::date, 'clicks', coalesce(x.cnt, 0)) order by d.day), '[]'::json)
  into v_daily
  from generate_series(
         (now() at time zone 'UTC')::date - 6,
         (now() at time zone 'UTC')::date,
         interval '1 day'
       ) as d(day)
  left join lateral (
    select count(*)::int as cnt
    from public.clicks
    where device is distinct from 'bot'
      and (clicked_at at time zone 'UTC')::date = d.day::date
  ) x on true;

  return json_build_object(
    'links_total', v_links_total,
    'clicks_total', v_clicks_total,
    'countries_total', v_countries_total,
    'daily', v_daily
  );
end;
$$;

revoke execute on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;
