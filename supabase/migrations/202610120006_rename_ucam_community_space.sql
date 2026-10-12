-- Comunidad CTC: make the legacy ACB space and its public root conversation
-- use the same visible UCAM Murcia name. The stable slugs remain unchanged.
--
-- This migration is idempotent and deliberately changes neither routes,
-- foreign keys, constraints, nor any member-generated data.

update public.community_spaces
set title = 'UCAM Murcia'
where slug = 'acb'
  and title is distinct from 'UCAM Murcia';

update public.community_topics
set
  title = 'UCAM Murcia',
  updated_at = now()
where slug = 'ucam-murcia-en-acb'
  and title is distinct from 'UCAM Murcia';
