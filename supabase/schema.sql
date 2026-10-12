-- Link Tracker Pro schema. Run in Supabase SQL Editor as project owner.
create extension if not exists pgcrypto;

create table if not exists public.tracked_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-zA-Z0-9_-]{3,60}$'),
  destination_url text not null check (char_length(destination_url) <= 2048),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.click_events (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.tracked_links(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country_code text,
  device_type text check (device_type in ('mobile','desktop','tablet','bot','unknown')),
  user_agent_family text,
  is_bot boolean not null default false
);

create index if not exists tracked_links_user_created_idx
  on public.tracked_links(user_id, created_at desc);
create index if not exists click_events_link_clicked_idx
  on public.click_events(link_id, clicked_at desc);
create index if not exists click_events_clicked_at_idx
  on public.click_events(clicked_at desc);

alter table public.tracked_links enable row level security;
alter table public.click_events enable row level security;

drop policy if exists "Users can view own links" on public.tracked_links;
create policy "Users can view own links" on public.tracked_links
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can create own links" on public.tracked_links;
create policy "Users can create own links" on public.tracked_links
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update own links" on public.tracked_links;
create policy "Users can update own links" on public.tracked_links
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own links" on public.tracked_links;
create policy "Users can delete own links" on public.tracked_links
  for delete to authenticated using (auth.uid() = user_id);

-- Click events are only readable by the owner of the link.
drop policy if exists "Users can view events for own links" on public.click_events;
create policy "Users can view events for own links" on public.click_events
  for select to authenticated using (
    exists (
      select 1 from public.tracked_links l
      where l.id = click_events.link_id and l.user_id = auth.uid()
    )
  );

-- Do not grant client-side writes to click_events. Only the Netlify function,
-- using the service role key on the server, records click events.
revoke insert, update, delete on public.click_events from anon, authenticated;
grant select on public.click_events to authenticated;
grant select, insert, update, delete on public.tracked_links to authenticated;

-- Avoid leaking email/account data; only expose fields the dashboard needs.
comment on table public.click_events is
  'Aggregated analytics events. Avoid storing full IP addresses or full user-agent strings.';
