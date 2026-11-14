-- Snip database schema. Run this in the Supabase SQL editor.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.links (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  code        text not null unique,
  target_url  text not null,
  title       text,
  is_active   boolean not null default true,
  expires_at  timestamptz,
  click_count integer not null default 0,
  created_at  timestamptz not null default now(),
  constraint links_code_format check (code ~ '^[A-Za-z0-9_-]{3,32}$')
);

create table if not exists public.clicks (
  id            bigint generated always as identity primary key,
  link_id       uuid not null references public.links (id) on delete cascade,
  clicked_at    timestamptz not null default now(),
  country       text,
  device        text,
  browser       text,
  referrer_host text,
  constraint clicks_device_check
    check (device is null or device in ('mobile', 'tablet', 'desktop', 'bot'))
);

create index if not exists clicks_link_id_clicked_at_idx
  on public.clicks (link_id, clicked_at);

-- ---------------------------------------------------------------------------
-- Trigger: increment links.click_count on insert, skipping bots
-- ---------------------------------------------------------------------------
create or replace function public.increment_click_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.device is distinct from 'bot' then
    update public.links
       set click_count = click_count + 1
     where id = new.link_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_increment_click_count on public.clicks;
create trigger trg_increment_click_count
after insert on public.clicks
for each row execute function public.increment_click_count();

-- ---------------------------------------------------------------------------
-- Trigger: enforce max 100 links per user
-- ---------------------------------------------------------------------------
create or replace function public.enforce_link_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.links where user_id = new.user_id) >= 100 then
    raise exception 'link_limit_reached: max 100 links per user';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_link_limit on public.links;
create trigger trg_enforce_link_limit
before insert on public.links
for each row execute function public.enforce_link_limit();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.links enable row level security;
alter table public.clicks enable row level security;

drop policy if exists links_select_own on public.links;
create policy links_select_own on public.links
  for select using (auth.uid() = user_id);

drop policy if exists links_insert_own on public.links;
create policy links_insert_own on public.links
  for insert with check (auth.uid() = user_id);

drop policy if exists links_update_own on public.links;
create policy links_update_own on public.links
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists links_delete_own on public.links;
create policy links_delete_own on public.links
  for delete using (auth.uid() = user_id);

-- Clicks are readable only by the owner of the parent link.
drop policy if exists clicks_select_own on public.clicks;
create policy clicks_select_own on public.clicks
  for select using (
    exists (
      select 1 from public.links l
      where l.id = clicks.link_id and l.user_id = auth.uid()
    )
  );

-- No insert/update/delete policy for clicks: only the service role (server) writes them.
