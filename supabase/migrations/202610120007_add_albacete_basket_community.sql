-- Comunidad CTC: add Albacete Basket as a fourth system-owned permanent
-- conversation. This migration is idempotent and never changes member data.

alter table public.community_spaces
  drop constraint if exists community_spaces_slug_check;
alter table public.community_spaces
  add constraint community_spaces_slug_check check (
    slug in ('acb', 'unicaja-malaga', 'hozono-global-jairis', 'albacete-basket')
  );

insert into public.community_spaces (slug, title)
values ('albacete-basket', 'Albacete Basket')
on conflict (slug) do update set title = excluded.title;

alter table public.community_topic_legacy_routes
  drop constraint if exists community_topic_legacy_routes_canonical_slug_check;
alter table public.community_topic_legacy_routes
  add constraint community_topic_legacy_routes_canonical_slug_check check (
    canonical_slug in (
      'ucam-murcia-en-acb',
      'unicaja-malaga',
      'hozono-global-jairis',
      'albacete-basket'
    )
  );

alter table public.community_topics
  drop constraint if exists community_topics_only_permanent_conversations;
alter table public.community_topics
  add constraint community_topics_only_permanent_conversations check (
    (space_slug = 'acb' and slug = 'ucam-murcia-en-acb')
    or (space_slug = 'unicaja-malaga' and slug = 'unicaja-malaga')
    or (space_slug = 'hozono-global-jairis' and slug = 'hozono-global-jairis')
    or (space_slug = 'albacete-basket' and slug = 'albacete-basket')
  );

insert into public.community_topics (
  space_slug, author_id, slug, title, body, is_visible, is_locked,
  created_at, updated_at, last_activity_at
)
values (
  'albacete-basket',
  null,
  'albacete-basket',
  'Albacete Basket',
  'Conversación principal permanente de la Comunidad CTC sobre Albacete Basket en Primera FEB.',
  true,
  false,
  now(),
  now(),
  now()
)
on conflict (slug) do update
set
  space_slug = excluded.space_slug,
  author_id = null,
  title = excluded.title,
  body = excluded.body,
  is_visible = true,
  is_locked = false,
  updated_at = now();

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
          'hozono-global-jairis',
          'albacete-basket'
        )
    )
  );

do $$
begin
  if (select count(*) from public.community_topics) <> 4
    or (
      select count(*)
      from public.community_topics
      where slug in (
        'ucam-murcia-en-acb',
        'unicaja-malaga',
        'hozono-global-jairis',
        'albacete-basket'
      )
    ) <> 4 then
    raise exception 'Community requires exactly four permanent roots including Albacete Basket';
  end if;
end;
$$;
