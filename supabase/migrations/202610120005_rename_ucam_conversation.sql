-- Comunidad CTC: shorten the visible UCAM conversation name without changing
-- its stable technical slug, posts, follows, notifications, or permissions.

update public.community_topics
set
  title = 'UCAM Murcia',
  updated_at = now()
where slug = 'ucam-murcia-en-acb'
  and title is distinct from 'UCAM Murcia';
