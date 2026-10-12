-- Comunidad CTC: four system-owned permanent conversations.
--
-- This is an idempotent schema/data migration. It is deliberately separate
-- from the production reset in supabase/manual/: applying migrations must
-- never delete users or their activity.

-- `community_spaces` is retained only as the legacy internal routing key used
-- by existing rows and queries. It is not a public Community navigation level.
alter table public.community_spaces
  drop constraint if exists community_spaces_slug_check;
alter table public.community_spaces
  add constraint community_spaces_slug_check check (
    slug in ('acb', 'bcl', 'unicaja-malaga', 'hozono-global-jairis')
  );

insert into public.community_spaces (slug, title)
values
  ('acb', 'UCAM Murcia en ACB'),
  ('bcl', 'UCAM Murcia en BCL'),
  ('unicaja-malaga', 'Unicaja Málaga'),
  ('hozono-global-jairis', 'Hozono Global Jairis')
on conflict (slug) do update set title = excluded.title;

-- Root conversations are system containers, not messages authored by a member.
-- User replies remain non-null and continue to reference community_profiles.
alter table public.community_topics
  alter column author_id drop not null;

-- The old follow trigger attempted to follow a root's technical author. Roots
-- no longer have one, while any historical/member-authored topic stays safe.
create or replace function public.follow_community_topic_author()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.author_id is null then
    return new;
  end if;

  insert into public.community_topic_follows (user_id, topic_id, last_read_at)
  values (new.author_id, new.id, new.created_at)
  on conflict (user_id, topic_id) do nothing;
  return new;
end;
$$;

-- A root has no member author and must not emit an opening-topic notification.
-- Reply notifications are unchanged because community_posts.author_id remains
-- mandatory and the reply trigger still receives a real member profile.
create or replace function public.notify_community_topic_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_id is null then
    return new;
  end if;

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

-- Any historical route can now point at any permanent conversation, although
-- current product code only creates the four rows below.
alter table public.community_topic_legacy_routes
  drop constraint if exists community_topic_legacy_routes_canonical_slug_check;
alter table public.community_topic_legacy_routes
  add constraint community_topic_legacy_routes_canonical_slug_check check (
    canonical_slug in (
      'ucam-murcia-en-acb',
      'ucam-murcia-en-bcl',
      'unicaja-malaga',
      'hozono-global-jairis'
    )
  );

-- Replace the two-root guard installed by the earlier consolidation migration
-- before creating the two new roots.
alter table public.community_topics
  drop constraint if exists community_topics_only_permanent_conversations;
alter table public.community_topics
  add constraint community_topics_only_permanent_conversations check (
    (space_slug = 'acb' and slug = 'ucam-murcia-en-acb')
    or (space_slug = 'bcl' and slug = 'ucam-murcia-en-bcl')
    or (space_slug = 'unicaja-malaga' and slug = 'unicaja-malaga')
    or (space_slug = 'hozono-global-jairis' and slug = 'hozono-global-jairis')
  );

with desired_roots(space_slug, slug, title, body) as (
  values
    (
      'acb'::text,
      'ucam-murcia-en-acb'::text,
      'UCAM Murcia en ACB'::text,
      'Conversación principal permanente de la Comunidad CTC sobre el UCAM Murcia en Liga Endesa.'::text
    ),
    (
      'bcl'::text,
      'ucam-murcia-en-bcl'::text,
      'UCAM Murcia en BCL'::text,
      'Conversación principal permanente de la Comunidad CTC sobre el UCAM Murcia en Basketball Champions League.'::text
    ),
    (
      'unicaja-malaga'::text,
      'unicaja-malaga'::text,
      'Unicaja Málaga'::text,
      'Conversación principal permanente de la Comunidad CTC sobre Unicaja Málaga.'::text
    ),
    (
      'hozono-global-jairis'::text,
      'hozono-global-jairis'::text,
      'Hozono Global Jairis'::text,
      'Conversación principal permanente de la Comunidad CTC sobre Hozono Global Jairis.'::text
    )
)
insert into public.community_topics (
  space_slug, author_id, slug, title, body, is_visible, is_locked,
  created_at, updated_at, last_activity_at
)
select
  space_slug,
  null,
  slug,
  title,
  body,
  true,
  false,
  now(),
  now(),
  now()
from desired_roots
on conflict (slug) do update
set
  space_slug = excluded.space_slug,
  author_id = null,
  title = excluded.title,
  body = excluded.body,
  is_visible = true,
  is_locked = false,
  updated_at = now();

-- Enforce the four roots in the reply policy as well as in application code.
drop policy if exists "signed in users reply in permanent community conversations" on public.community_posts;
create policy "signed in users reply in permanent community conversations" on public.community_posts
  for insert to authenticated with check (
    auth.uid() = author_id
    and is_visible
    and exists (
      select 1
      from public.community_topics
      where id = topic_id
        and is_visible
        and not is_locked
        and slug in (
          'ucam-murcia-en-acb',
          'ucam-murcia-en-bcl',
          'unicaja-malaga',
          'hozono-global-jairis'
        )
    )
  );
