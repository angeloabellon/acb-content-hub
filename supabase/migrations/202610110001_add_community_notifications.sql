-- Community CTC: private, in-app notifications for mentions and followed topics.
create table if not exists public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.community_profiles(id) on delete cascade,
  notification_type text not null check (notification_type in ('mention', 'reply')),
  actor_id uuid not null references public.community_profiles(id) on delete cascade,
  topic_id uuid not null references public.community_topics(id) on delete cascade,
  post_id uuid references public.community_posts(id) on delete cascade,
  -- A topic or post can produce at most one notification for one recipient.
  -- It makes retries and the mention+follow overlap idempotent.
  source_key text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint community_notifications_source_key_check check (
    source_key = case when post_id is null then 'topic:' || topic_id::text else 'post:' || post_id::text end
  ),
  constraint community_notifications_recipient_source_key_unique unique (recipient_id, source_key)
);

create index if not exists community_notifications_recipient_created_idx
  on public.community_notifications (recipient_id, created_at desc);
create index if not exists community_notifications_unread_idx
  on public.community_notifications (recipient_id, created_at desc)
  where read_at is null;

alter table public.community_notifications enable row level security;

grant select, delete on public.community_notifications to authenticated;
grant update (read_at) on public.community_notifications to authenticated;

create policy "users view their own community notifications" on public.community_notifications
  for select to authenticated using (auth.uid() = recipient_id);
create policy "users mark their own community notifications read" on public.community_notifications
  for update to authenticated using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);
create policy "users delete their own community notifications" on public.community_notifications
  for delete to authenticated using (auth.uid() = recipient_id);

-- Every member needs a mentionable public identifier. Existing display names
-- are preserved; the identifier is compact, URL-safe and can be changed later
-- through the existing profile update policy if a profile editor is added.
create or replace function public.community_default_username(source_email text, user_id uuid)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  base text;
begin
  base := trim(both '-' from regexp_replace(
    lower(split_part(coalesce(source_email, ''), '@', 1)),
    '[^a-z0-9]+', '-', 'g'
  ));
  if char_length(base) < 3 then base := 'aficionado'; end if;
  return left(base, 17) || '-' || left(replace(user_id::text, '-', ''), 6);
end;
$$;

-- Replace the original profile trigger so members created after this migration
-- are mentionable too.
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

  if char_length(proposed_name) < 2 then proposed_name := 'Aficionado CTC'; end if;

  insert into public.community_profiles (id, display_name, username)
  values (new.id, proposed_name, public.community_default_username(new.email, new.id))
  on conflict (id) do nothing;
  return new;
end;
$$;

update public.community_profiles
set username = public.community_default_username('aficionado', id)
where username is null;

-- Finds actual public usernames only. The boundary rule deliberately rejects
-- email fragments such as hola@ctc.es and accepts normal punctuation after @name.
create or replace function public.community_mentioned_profile_ids(
  content text,
  excluded_user_id uuid default null
)
returns table (user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select distinct profiles.id
  from regexp_matches(
    coalesce(content, ''),
    '(?i)(^|[^[:alnum:]_@])@([a-z0-9][a-z0-9_-]{2,23})(?![a-z0-9_-])',
    'g'
  ) as matches
  join public.community_profiles as profiles
    on profiles.username = lower(matches[2])
  where excluded_user_id is null or profiles.id <> excluded_user_id;
$$;

-- A mention wins over a follow notification for the same reply: the unique
-- source key then makes the second insert a no-op.
create or replace function public.notify_community_topic_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.community_notifications (
    recipient_id, notification_type, actor_id, topic_id, post_id, source_key
  )
  select
    mentioned.user_id,
    'mention',
    new.author_id,
    new.id,
    null,
    'topic:' || new.id::text
  from public.community_mentioned_profile_ids(new.title || E'\n' || new.body, new.author_id) as mentioned
  on conflict (recipient_id, source_key) do nothing;
  return new;
end;
$$;

create or replace function public.notify_community_post_followers_and_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert mentions first so their more specific wording is retained on overlap.
  insert into public.community_notifications (
    recipient_id, notification_type, actor_id, topic_id, post_id, source_key
  )
  select
    mentioned.user_id,
    'mention',
    new.author_id,
    new.topic_id,
    new.id,
    'post:' || new.id::text
  from public.community_mentioned_profile_ids(new.body, new.author_id) as mentioned
  on conflict (recipient_id, source_key) do nothing;

  insert into public.community_notifications (
    recipient_id, notification_type, actor_id, topic_id, post_id, source_key
  )
  select
    follows.user_id,
    'reply',
    new.author_id,
    new.topic_id,
    new.id,
    'post:' || new.id::text
  from public.community_topic_follows as follows
  where follows.topic_id = new.topic_id
    and follows.user_id <> new.author_id
  on conflict (recipient_id, source_key) do nothing;

  return new;
end;
$$;

drop trigger if exists on_community_topic_created_notify_mentions on public.community_topics;
create trigger on_community_topic_created_notify_mentions
  after insert on public.community_topics
  for each row execute procedure public.notify_community_topic_mentions();

drop trigger if exists on_community_post_created_notify_followers_and_mentions on public.community_posts;
create trigger on_community_post_created_notify_followers_and_mentions
  after insert on public.community_posts
  for each row execute procedure public.notify_community_post_followers_and_mentions();

revoke all on function public.community_mentioned_profile_ids(text, uuid) from public;
grant execute on function public.community_mentioned_profile_ids(text, uuid) to authenticated;
revoke all on function public.community_default_username(text, uuid) from public;
