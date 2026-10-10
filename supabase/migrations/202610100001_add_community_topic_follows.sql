-- Community CTC: private topic follows and per-user read state.
create table if not exists public.community_topic_follows (
  user_id uuid not null references public.community_profiles(id) on delete cascade,
  topic_id uuid not null references public.community_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index if not exists community_topic_follows_user_topic_idx
  on public.community_topic_follows (user_id, topic_id);

alter table public.community_topic_follows enable row level security;

grant select, insert, delete on public.community_topic_follows to authenticated;
grant update (last_read_at) on public.community_topic_follows to authenticated;

create policy "users view their own topic follows" on public.community_topic_follows
  for select to authenticated using (auth.uid() = user_id);
create policy "users follow visible topics for themselves" on public.community_topic_follows
  for insert to authenticated with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.community_topics
      where id = topic_id and is_visible
    )
  );
create policy "users update their own topic read state" on public.community_topic_follows
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "users remove their own topic follows" on public.community_topic_follows
  for delete to authenticated using (auth.uid() = user_id);

-- Authors start following the topic they open, already having read its opening post.
create or replace function public.follow_community_topic_author()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.community_topic_follows (user_id, topic_id, last_read_at)
  values (new.author_id, new.id, new.created_at)
  on conflict (user_id, topic_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_community_topic_created_follow_author on public.community_topics;
create trigger on_community_topic_created_follow_author
  after insert on public.community_topics
  for each row execute procedure public.follow_community_topic_author();

-- Avoid creating surprise unread counts for conversations that existed before this feature.
insert into public.community_topic_follows (user_id, topic_id, last_read_at)
select author_id, id, now()
from public.community_topics
on conflict (user_id, topic_id) do nothing;

-- The function is security invoker: both the followed topics and the visible
-- replies are still filtered by RLS, and it only returns auth.uid()'s rows.
create or replace function public.community_topic_follow_statuses()
returns table (
  topic_id uuid,
  last_read_at timestamptz,
  unread_reply_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    follows.topic_id,
    follows.last_read_at,
    count(posts.id) filter (
      where posts.created_at > follows.last_read_at
        and posts.author_id <> auth.uid()
    ) as unread_reply_count
  from public.community_topic_follows as follows
  left join public.community_posts as posts
    on posts.topic_id = follows.topic_id
    and posts.is_visible
  where follows.user_id = auth.uid()
  group by follows.topic_id, follows.last_read_at;
$$;

grant execute on function public.community_topic_follow_statuses() to authenticated;
