-- DANGER — one-time production reset for Comunidad CTC.
--
-- This file is NOT a Supabase migration and must never be added to an automated
-- deployment or migration runner. Run it manually in the Supabase SQL Editor,
-- as a database owner, only AFTER migration 202610120006 has succeeded.
--
-- It permanently removes every Community profile and every auth.users account
-- in this Supabase project, plus posts, follows, notifications, aliases and
-- historical topic-route data. It retains only the three system-owned roots.
-- Take a backup first. Do not use it if auth.users contains accounts unrelated
-- to Comunidad CTC.

begin;

-- Deliberate safety interlock: replace the placeholder below yourself before
-- running this file. Leaving it untouched makes the transaction abort before
-- any delete is executed.
select set_config(
  'app.community_reset_confirmed',
  '__REPLACE_WITH_YES_DELETE_ALL_COMMUNITY_USERS__',
  true
);

do $$
begin
  if current_setting('app.community_reset_confirmed', true) <> 'YES_DELETE_ALL_COMMUNITY_USERS' then
    raise exception 'Reset cancelled: explicitly set app.community_reset_confirmed to YES_DELETE_ALL_COMMUNITY_USERS';
  end if;

  if (
    select count(*)
    from public.community_topics
    where slug in (
      'ucam-murcia-en-acb',
      'unicaja-malaga',
      'hozono-global-jairis'
    )
  ) <> 3 then
    raise exception 'Reset cancelled: the three permanent roots are missing. Apply migration 202610120004 first.';
  end if;
end;
$$;

-- PRE-RESET CHECKS: copy these result sets into the change record before you
-- continue. The auth count intentionally covers every auth.users account.
select 'before' as phase, 'auth.users' as entity, count(*) as count from auth.users
union all select 'before', 'community_profiles', count(*) from public.community_profiles
union all select 'before', 'community_posts', count(*) from public.community_posts
union all select 'before', 'community_topic_follows', count(*) from public.community_topic_follows
union all select 'before', 'community_notifications', count(*) from public.community_notifications
union all select 'before', 'community_username_aliases', count(*) from public.community_username_aliases
union all select 'before', 'community_topics', count(*) from public.community_topics
order by entity;

-- Delete dependent, user-derived data before the people who own it. The three
-- root conversation rows have NULL author_id after 202610120005, so deleting
-- Community/Auth users cannot violate their foreign key.
delete from public.community_notifications;
delete from public.community_topic_follows;
delete from public.community_topic_migrations;
delete from public.community_topic_legacy_routes;
delete from public.community_posts;
delete from public.community_topics
where slug not in (
  'ucam-murcia-en-acb',
  'unicaja-malaga',
  'hozono-global-jairis'
);
delete from public.community_username_aliases;
delete from public.community_profiles;
delete from auth.users;

-- Keep the legacy technical `acb` key aligned with the visible conversation
-- name. The key itself is never changed because existing data depends on it.
update public.community_spaces
set title = 'UCAM Murcia'
where slug = 'acb'
  and title is distinct from 'UCAM Murcia';

-- Return each retained root to an empty system-owned conversation. No fake
-- human author is introduced, and no reply/follow/notification is recreated.
update public.community_topics as topic
set
  author_id = null,
  title = roots.title,
  body = roots.body,
  reply_count = 0,
  is_visible = true,
  is_locked = false,
  created_at = now(),
  updated_at = now(),
  last_activity_at = now()
from (
  values
    ('ucam-murcia-en-acb'::text, 'UCAM Murcia'::text, 'Conversación principal permanente de la Comunidad CTC sobre el UCAM Murcia en Liga Endesa.'::text),
    ('unicaja-malaga'::text, 'Unicaja Málaga'::text, 'Conversación principal permanente de la Comunidad CTC sobre Unicaja Málaga.'::text),
    ('hozono-global-jairis'::text, 'Hozono Global Jairis'::text, 'Conversación principal permanente de la Comunidad CTC sobre Hozono Global Jairis.'::text)
) as roots(slug, title, body)
where topic.slug = roots.slug;

-- POST-RESET CHECKS: expected values are 0 for every user/activity row and 3
-- for topics. The second query verifies that every retained root has no author
-- and no replies, follows or notifications.
select 'after' as phase, 'auth.users' as entity, count(*) as count from auth.users
union all select 'after', 'community_profiles', count(*) from public.community_profiles
union all select 'after', 'community_posts', count(*) from public.community_posts
union all select 'after', 'community_topic_follows', count(*) from public.community_topic_follows
union all select 'after', 'community_notifications', count(*) from public.community_notifications
union all select 'after', 'community_username_aliases', count(*) from public.community_username_aliases
union all select 'after', 'community_topics', count(*) from public.community_topics
order by entity;

select
  topic.slug,
  topic.author_id is null as is_system_owned,
  topic.reply_count,
  count(post.id) as post_count,
  count(follow.user_id) as follow_count,
  count(notification.id) as notification_count
from public.community_topics as topic
left join public.community_posts as post on post.topic_id = topic.id
left join public.community_topic_follows as follow on follow.topic_id = topic.id
left join public.community_notifications as notification on notification.topic_id = topic.id
where topic.slug in (
  'ucam-murcia-en-acb',
  'unicaja-malaga',
  'hozono-global-jairis'
)
group by topic.id, topic.slug, topic.author_id, topic.reply_count
order by topic.slug;

commit;
