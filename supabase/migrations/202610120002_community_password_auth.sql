-- Comunidad CTC: public usernames, password login, and historical mention aliases.
-- This migration is intentionally idempotent so it can be applied safely to an
-- existing Community database after the earlier Community migrations.

create or replace function public.is_valid_community_username(candidate text)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  select candidate = lower(trim(candidate))
    and candidate ~ '^[a-z0-9][a-z0-9._-]{1,22}[a-z0-9]$'
    and candidate <> all (array[
      'admin', 'administracion', 'acceso', 'api', 'ayuda', 'casttocast',
      'comunidad', 'contacto', 'editor', 'equipo', 'login', 'moderacion',
      'registro', 'root', 'soporte', 'staff', 'support', 'system'
    ]::text[]);
$$;

alter table public.community_profiles
  drop constraint if exists community_profiles_username_check;
alter table public.community_profiles
  add constraint community_profiles_username_check check (
    username is null or public.is_valid_community_username(username)
  );

-- Historical authored content stores literal @handles. Keep an old technical
-- handle as an alias before assigning its owner a real username, so rendered
-- mentions and existing notification triggers continue to find the same user.
create table if not exists public.community_username_aliases (
  username text primary key check (public.is_valid_community_username(username)),
  profile_id uuid not null references public.community_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists community_username_aliases_profile_idx
  on public.community_username_aliases (profile_id);

alter table public.community_username_aliases enable row level security;
grant select on public.community_username_aliases to anon, authenticated;
drop policy if exists "community username aliases are public" on public.community_username_aliases;
create policy "community username aliases are public" on public.community_username_aliases
  for select using (true);

-- Do not allow a future account to claim an old mention alias. This protects
-- historical @mentions without changing their stored body text.
create or replace function public.prevent_community_username_alias_conflict()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if new.username is not null and exists (
    select 1
    from public.community_username_aliases as aliases
    where aliases.username = new.username
      and aliases.profile_id <> new.id
  ) then
    raise exception 'Community username is retained as a historical mention alias';
  end if;
  return new;
end;
$$;

drop trigger if exists before_community_profile_username_change on public.community_profiles;
create trigger before_community_profile_username_change
  before insert or update of username on public.community_profiles
  for each row execute procedure public.prevent_community_username_alias_conflict();

-- New sign-ups send username in raw_user_meta_data. Accounts created elsewhere
-- get no fabricated public handle: only a valid chosen username is published.
create or replace function public.create_community_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  proposed_name text;
  proposed_username text;
begin
  proposed_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if not public.is_valid_community_username(proposed_username) then
    proposed_username := null;
  end if;

  proposed_name := left(coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    proposed_username,
    nullif(split_part(new.email, '@', 1), ''),
    'Aficionado CTC'
  ), 48);
  if char_length(proposed_name) < 2 then proposed_name := 'Aficionado CTC'; end if;

  insert into public.community_profiles (id, display_name, username)
  values (new.id, proposed_name, proposed_username)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- The two known accounts are migrated only when their email local part or
-- previous signup metadata identifies them and the preferred username is free.
-- If an installation used different email local parts, the manual fallback is
-- documented in docs/community-supabase.md.
do $$
declare
  desired_username text;
  matched_profile record;
begin
  foreach desired_username in array array['angel.otalora', 'cast2cast.sports'] loop
    select profiles.id, profiles.username
    into matched_profile
    from public.community_profiles as profiles
    join auth.users as users on users.id = profiles.id
    where (profiles.username is null or profiles.username ~ '^aficionado-[a-z0-9]{6}$')
      and (
        lower(split_part(coalesce(users.email, ''), '@', 1)) = desired_username
        or lower(coalesce(users.raw_user_meta_data ->> 'username', '')) = desired_username
      )
      and not exists (
        select 1
        from public.community_profiles as occupied
        where occupied.username = desired_username
          and occupied.id <> profiles.id
      )
    order by profiles.created_at asc
    limit 1;

    if found then
      if matched_profile.username is not null and matched_profile.username <> desired_username then
        insert into public.community_username_aliases (username, profile_id)
        values (matched_profile.username, matched_profile.id)
        on conflict (username) do nothing;
      end if;

      update public.community_profiles
      set username = desired_username, updated_at = now()
      where id = matched_profile.id;
    end if;
  end loop;
end;
$$;

-- Existing content can mention either a current username or an old alias.
create or replace function public.community_mentioned_profile_ids(
  content text,
  excluded_user_id uuid default null
)
returns table (user_id uuid)
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select distinct coalesce(profiles.id, aliases.profile_id) as user_id
  from regexp_matches(
    coalesce(content, ''),
    '(?i)(^|[^[:alnum:]_@])@([a-z0-9](?:[a-z0-9._-]{1,22}[a-z0-9]))(?![a-z0-9._-])',
    'g'
  ) as matches
  left join public.community_profiles as profiles
    on profiles.username = lower(matches[2])
  left join public.community_username_aliases as aliases
    on aliases.username = lower(matches[2])
  where coalesce(profiles.id, aliases.profile_id) is not null
    and (excluded_user_id is null or coalesce(profiles.id, aliases.profile_id) <> excluded_user_id);
$$;

revoke all on function public.community_mentioned_profile_ids(text, uuid) from public;
grant execute on function public.community_mentioned_profile_ids(text, uuid) to authenticated;

-- This function is never callable by anon/authenticated. A server-only admin
-- client invokes it as service_role and passes the result directly to GoTrue's
-- password sign-in; no browser response includes this email address.
create or replace function public.resolve_community_login_email(p_username text)
returns text
language sql
stable
security definer
set search_path = public, auth, pg_catalog
as $$
  select users.email
  from public.community_profiles as profiles
  join auth.users as users on users.id = profiles.id
  where profiles.username = lower(trim(p_username))
    and users.email is not null
  limit 1;
$$;

revoke all on function public.resolve_community_login_email(text) from public;
grant execute on function public.resolve_community_login_email(text) to service_role;
revoke all on function public.is_valid_community_username(text) from public;
grant execute on function public.is_valid_community_username(text) to anon, authenticated;
