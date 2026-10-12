-- Comunidad CTC: collapse the legacy space -> topic hierarchy into two
-- permanent root conversations without discarding authorship, timestamps or
-- notifications. The mapping tables make this safe to run again manually.

create table if not exists public.community_topic_legacy_routes (
  legacy_slug text primary key check (legacy_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  canonical_slug text not null references public.community_topics(slug) on delete cascade,
  created_at timestamptz not null default now(),
  check (canonical_slug in ('ucam-murcia-en-acb', 'ucam-murcia-en-bcl'))
);

create table if not exists public.community_topic_migrations (
  legacy_topic_id uuid primary key,
  canonical_topic_id uuid not null references public.community_topics(id) on delete cascade,
  opening_post_id uuid,
  migrated_at timestamptz not null default now()
);

alter table public.community_posts
  add column if not exists legacy_topic_title text;
alter table public.community_posts
  add column if not exists legacy_message_order smallint not null default 1;

alter table public.community_posts
  drop constraint if exists community_posts_legacy_topic_title_check;
alter table public.community_posts
  add constraint community_posts_legacy_topic_title_check check (
    legacy_topic_title is null
    or char_length(legacy_topic_title) between 8 and 140
  );
alter table public.community_posts
  drop constraint if exists community_posts_legacy_message_order_check;
alter table public.community_posts
  add constraint community_posts_legacy_message_order_check check (
    legacy_message_order in (0, 1)
  );

alter table public.community_topic_legacy_routes enable row level security;
alter table public.community_topic_migrations enable row level security;
revoke all on public.community_topic_migrations from anon, authenticated;
grant select on public.community_topic_legacy_routes to anon, authenticated;

drop policy if exists "legacy community topic routes are public" on public.community_topic_legacy_routes;
create policy "legacy community topic routes are public" on public.community_topic_legacy_routes
  for select using (true);

-- Use the oldest author in each former space for the required technical owner
-- of the root row. The UI intentionally labels these rows as a principal
-- conversation, not as a conversation started by that member.
with desired_roots(space_slug, slug, title, body) as (
  values
    (
      'acb'::text,
      'ucam-murcia-en-acb'::text,
      'UCAM Murcia en ACB'::text,
      'Hilo principal permanente de la Comunidad CTC sobre el UCAM Murcia en Liga Endesa.'::text
    ),
    (
      'bcl'::text,
      'ucam-murcia-en-bcl'::text,
      'UCAM Murcia en BCL'::text,
      'Hilo principal permanente de la Comunidad CTC sobre el UCAM Murcia en Basketball Champions League.'::text
    )
)
insert into public.community_topics (
  space_slug, author_id, slug, title, body, is_visible, is_locked,
  created_at, updated_at, last_activity_at
)
select
  root.space_slug,
  candidate.author_id,
  root.slug,
  root.title,
  root.body,
  true,
  false,
  now(),
  now(),
  now()
from desired_roots as root
cross join lateral (
  select coalesce(
    (
      select topic.author_id
      from public.community_topics as topic
      where topic.space_slug = root.space_slug
        and topic.slug not in ('ucam-murcia-en-acb', 'ucam-murcia-en-bcl')
      order by topic.created_at asc, topic.id asc
      limit 1
    ),
    (
      select profile.id
      from public.community_profiles as profile
      order by profile.created_at asc, profile.id asc
      limit 1
    )
  ) as author_id
) as candidate
where candidate.author_id is not null
on conflict (slug) do update
set
  space_slug = excluded.space_slug,
  title = excluded.title,
  body = excluded.body,
  is_visible = true,
  is_locked = false,
  updated_at = now();

do $$
begin
  if (
    select count(*)
    from public.community_topics
    where slug in ('ucam-murcia-en-acb', 'ucam-murcia-en-bcl')
  ) <> 2 then
    raise exception
      'Community reform needs an existing Community author to create both permanent conversations';
  end if;
end;
$$;

-- Record old paths before the legacy rows are removed, then map every old
-- topic to the root in its former space.
insert into public.community_topic_legacy_routes (legacy_slug, canonical_slug)
select legacy.slug, root.slug
from public.community_topics as legacy
join public.community_topics as root
  on root.space_slug = legacy.space_slug
 and root.slug = case legacy.space_slug
   when 'acb' then 'ucam-murcia-en-acb'
   when 'bcl' then 'ucam-murcia-en-bcl'
 end
where legacy.slug not in ('ucam-murcia-en-acb', 'ucam-murcia-en-bcl')
on conflict (legacy_slug) do update
set canonical_slug = excluded.canonical_slug;

insert into public.community_topic_migrations (legacy_topic_id, canonical_topic_id)
select legacy.id, root.id
from public.community_topics as legacy
join public.community_topics as root
  on root.space_slug = legacy.space_slug
 and root.slug = case legacy.space_slug
   when 'acb' then 'ucam-murcia-en-acb'
   when 'bcl' then 'ucam-murcia-en-bcl'
 end
where legacy.slug not in ('ucam-murcia-en-acb', 'ucam-murcia-en-bcl')
on conflict (legacy_topic_id) do update
set canonical_topic_id = excluded.canonical_topic_id;

-- Each former opening becomes a normal, chronologically ordered post. Its
-- title is deliberately stored separately so React can render it prominently
-- as escaped text rather than interpreting user supplied markup.
insert into public.community_posts (
  id, topic_id, author_id, body, legacy_topic_title, legacy_message_order, is_visible,
  created_at, updated_at
)
select
  (
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 1, 8) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 9, 4) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 13, 4) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 17, 4) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 21, 12)
  )::uuid,
  migration.canonical_topic_id,
  legacy.author_id,
  legacy.body,
  legacy.title,
  0,
  legacy.is_visible,
  legacy.created_at,
  legacy.updated_at
from public.community_topic_migrations as migration
join public.community_topics as legacy on legacy.id = migration.legacy_topic_id
where migration.opening_post_id is null
on conflict (id) do nothing;

update public.community_topic_migrations as migration
set opening_post_id = (
  (
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 1, 8) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 9, 4) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 13, 4) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 17, 4) || '-' ||
    substr(md5('ctc-root-opening:' || migration.legacy_topic_id::text), 21, 12)
  )::uuid
)
where migration.opening_post_id is null;

alter table public.community_topic_migrations
  alter column opening_post_id set not null;

-- Move replies without rewriting any authored content or timestamps.
update public.community_posts as post
set topic_id = migration.canonical_topic_id
from public.community_topic_migrations as migration
where post.topic_id = migration.legacy_topic_id;

-- A single root replaces several per-topic reading states. MIN is intentional:
-- it is conservative and never marks an old reply as read merely because a
-- person visited another legacy topic more recently.
insert into public.community_topic_follows (
  user_id, topic_id, created_at, last_read_at
)
select
  follows.user_id,
  migration.canonical_topic_id,
  min(follows.created_at),
  min(follows.last_read_at)
from public.community_topic_follows as follows
join public.community_topic_migrations as migration
  on migration.legacy_topic_id = follows.topic_id
group by follows.user_id, migration.canonical_topic_id
on conflict (user_id, topic_id) do update
set
  created_at = least(community_topic_follows.created_at, excluded.created_at),
  last_read_at = least(community_topic_follows.last_read_at, excluded.last_read_at);

delete from public.community_topic_follows as follows
using public.community_topic_migrations as migration
where follows.topic_id = migration.legacy_topic_id;

-- Reply notifications keep their original post identity and are simply pointed
-- at the root. Opening-topic notifications become notifications for their new
-- opening post; generated migration-time duplicates are removed first.
update public.community_notifications as notification
set topic_id = migration.canonical_topic_id
from public.community_topic_migrations as migration
where notification.topic_id = migration.legacy_topic_id
  and notification.post_id is not null;

delete from public.community_notifications as generated
using public.community_topic_migrations as migration
where generated.post_id = migration.opening_post_id;

update public.community_notifications as notification
set
  topic_id = migration.canonical_topic_id,
  post_id = migration.opening_post_id,
  source_key = 'post:' || migration.opening_post_id::text
from public.community_topic_migrations as migration
where notification.topic_id = migration.legacy_topic_id
  and notification.post_id is null;

-- Legacy topics are no longer public rows. Routes above retain their URLs and
-- all associated data has already been moved to one of the two root threads.
delete from public.community_topics as legacy
using public.community_topic_migrations as migration
where legacy.id = migration.legacy_topic_id;

update public.community_topics as topic
set
  reply_count = (
    select count(*)
    from public.community_posts as post
    where post.topic_id = topic.id and post.is_visible
  ),
  last_activity_at = coalesce(
    (
      select max(post.created_at)
      from public.community_posts as post
      where post.topic_id = topic.id and post.is_visible
    ),
    topic.created_at
  ),
  updated_at = now()
where topic.slug in ('ucam-murcia-en-acb', 'ucam-murcia-en-bcl');

-- Enforce the new product model at the database boundary as well as in the UI.
alter table public.community_topics
  drop constraint if exists community_topics_only_permanent_conversations;
alter table public.community_topics
  add constraint community_topics_only_permanent_conversations check (
    (space_slug = 'acb' and slug = 'ucam-murcia-en-acb')
    or (space_slug = 'bcl' and slug = 'ucam-murcia-en-bcl')
  );

drop policy if exists "signed in users create their own topics" on public.community_topics;
revoke insert on public.community_topics from authenticated;

drop policy if exists "signed in users reply as themselves" on public.community_posts;
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
        and slug in ('ucam-murcia-en-acb', 'ucam-murcia-en-bcl')
    )
  );
