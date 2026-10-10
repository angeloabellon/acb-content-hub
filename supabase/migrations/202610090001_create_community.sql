-- Community CTC: public reads, authenticated writes, and no client-side trust.
create extension if not exists pgcrypto;

create table if not exists public.community_spaces (
  slug text primary key check (slug in ('acb', 'bcl')),
  title text not null,
  created_at timestamptz not null default now()
);

insert into public.community_spaces (slug, title)
values
  ('acb', 'UCAM Murcia en ACB'),
  ('bcl', 'UCAM Murcia en BCL')
on conflict (slug) do update set title = excluded.title;

create table if not exists public.community_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 48),
  username text unique check (username is null or username ~ '^[a-z0-9][a-z0-9_-]{2,23}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_topics (
  id uuid primary key default gen_random_uuid(),
  space_slug text not null references public.community_spaces(slug),
  author_id uuid not null references public.community_profiles(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 8 and 140),
  body text not null check (char_length(body) between 12 and 5000),
  reply_count integer not null default 0 check (reply_count >= 0),
  is_visible boolean not null default true,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create index if not exists community_topics_public_activity_idx
  on public.community_topics (space_slug, last_activity_at desc)
  where is_visible;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.community_topics(id) on delete cascade,
  author_id uuid not null references public.community_profiles(id) on delete restrict,
  body text not null check (char_length(body) between 2 and 5000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_posts_public_topic_idx
  on public.community_posts (topic_id, created_at asc)
  where is_visible;

create or replace function public.create_community_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  proposed_name text;
begin
  proposed_name := left(coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(new.email, '@', 1), ''),
    'Aficionado CTC'
  ), 48);

  if char_length(proposed_name) < 2 then
    proposed_name := 'Aficionado CTC';
  end if;

  insert into public.community_profiles (id, display_name)
  values (new.id, proposed_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_for_community on auth.users;
create trigger on_auth_user_created_for_community
  after insert on auth.users
  for each row execute procedure public.create_community_profile();

-- Keep previously-created Auth users eligible to participate as well.
insert into public.community_profiles (id, display_name)
select
  id,
  case
    when char_length(proposed_name) < 2 then 'Aficionado CTC'
    else proposed_name
  end
from (
  select
    id,
    left(coalesce(
      nullif(trim(raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(email, '@', 1), ''),
      'Aficionado CTC'
    ), 48) as proposed_name
  from auth.users
) as existing_users
on conflict (id) do nothing;

create or replace function public.touch_community_topic_after_post()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.community_topics
  set
    reply_count = (
      select count(*) from public.community_posts
      where topic_id = new.topic_id and is_visible
    ),
    last_activity_at = new.created_at,
    updated_at = now()
  where id = new.topic_id;
  return new;
end;
$$;

drop trigger if exists on_community_post_created on public.community_posts;
create trigger on_community_post_created
  after insert on public.community_posts
  for each row execute procedure public.touch_community_topic_after_post();

alter table public.community_spaces enable row level security;
alter table public.community_profiles enable row level security;
alter table public.community_topics enable row level security;
alter table public.community_posts enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.community_spaces, public.community_profiles, public.community_topics, public.community_posts to anon, authenticated;
grant insert on public.community_topics, public.community_posts to authenticated;
grant update (display_name, username, updated_at) on public.community_profiles to authenticated;

create policy "community spaces are public" on public.community_spaces
  for select using (true);
create policy "community profiles are public" on public.community_profiles
  for select using (true);
create policy "users update their own community profile" on public.community_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "visible community topics are public" on public.community_topics
  for select using (is_visible);
create policy "signed in users create their own topics" on public.community_topics
  for insert to authenticated with check (auth.uid() = author_id and is_visible);
create policy "visible community posts are public" on public.community_posts
  for select using (is_visible);
create policy "signed in users reply as themselves" on public.community_posts
  for insert to authenticated with check (
    auth.uid() = author_id
    and is_visible
    and exists (
      select 1 from public.community_topics
      where id = topic_id and is_visible and not is_locked
    )
  );
