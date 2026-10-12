-- Comunidad CTC: retire the former BCL root and enforce three permanent
-- system-owned conversations. This migration is safe to run after the reset:
-- every deletion is scoped to the retired root or its technical space.

-- Remove all dependent activity explicitly before removing the root. The
-- foreign keys also cascade, but the explicit order makes the destructive
-- scope auditable and works for partially cleaned installations too.
with retired_topics as (
  select id
  from public.community_topics
  where slug = 'ucam-murcia-en-bcl' or space_slug = 'bcl'
), retired_posts as (
  select id
  from public.community_posts
  where topic_id in (select id from retired_topics)
)
delete from public.community_notifications
where topic_id in (select id from retired_topics)
   or post_id in (select id from retired_posts);

with retired_topics as (
  select id
  from public.community_topics
  where slug = 'ucam-murcia-en-bcl' or space_slug = 'bcl'
)
delete from public.community_topic_follows
where topic_id in (select id from retired_topics);

with retired_topics as (
  select id
  from public.community_topics
  where slug = 'ucam-murcia-en-bcl' or space_slug = 'bcl'
)
delete from public.community_posts
where topic_id in (select id from retired_topics);

with retired_topics as (
  select id
  from public.community_topics
  where slug = 'ucam-murcia-en-bcl' or space_slug = 'bcl'
)
delete from public.community_topic_migrations
where canonical_topic_id in (select id from retired_topics)
   or legacy_topic_id in (select id from retired_topics);

delete from public.community_topic_legacy_routes
where canonical_slug = 'ucam-murcia-en-bcl';

delete from public.community_topics
where slug = 'ucam-murcia-en-bcl' or space_slug = 'bcl';

-- `space_slug` is still a database compatibility field. Retain it only for
-- the three valid roots, then remove the now-unreferenced retired space.
delete from public.community_spaces where slug = 'bcl';

alter table public.community_spaces
  drop constraint if exists community_spaces_slug_check;
alter table public.community_spaces
  add constraint community_spaces_slug_check check (
    slug in ('acb', 'unicaja-malaga', 'hozono-global-jairis')
  );

alter table public.community_topic_legacy_routes
  drop constraint if exists community_topic_legacy_routes_canonical_slug_check;
alter table public.community_topic_legacy_routes
  add constraint community_topic_legacy_routes_canonical_slug_check check (
    canonical_slug in (
      'ucam-murcia-en-acb',
      'unicaja-malaga',
      'hozono-global-jairis'
    )
  );

alter table public.community_topics
  drop constraint if exists community_topics_only_permanent_conversations;
alter table public.community_topics
  add constraint community_topics_only_permanent_conversations check (
    (space_slug = 'acb' and slug = 'ucam-murcia-en-acb')
    or (space_slug = 'unicaja-malaga' and slug = 'unicaja-malaga')
    or (space_slug = 'hozono-global-jairis' and slug = 'hozono-global-jairis')
  );

-- Preserve the existing root metadata while making the surviving containers
-- explicitly system-owned on installations that predate the prior reset.
update public.community_topics
set author_id = null
where slug in (
  'ucam-murcia-en-acb',
  'unicaja-malaga',
  'hozono-global-jairis'
);

-- RLS remains unchanged for identity, mentions, follows and notifications;
-- only the allow-list for replies changes with the permanent root set.
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
          'unicaja-malaga',
          'hozono-global-jairis'
        )
    )
  );

do $$
begin
  if (select count(*) from public.community_topics) <> 3
    or (
      select count(*)
      from public.community_topics
      where slug in (
        'ucam-murcia-en-acb',
        'unicaja-malaga',
        'hozono-global-jairis'
      )
    ) <> 3 then
    raise exception 'Community reform requires exactly the three permanent roots after retiring the BCL root';
  end if;
end;
$$;
