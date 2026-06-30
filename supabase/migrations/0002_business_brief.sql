-- SiteBrief AI — Sprint 2: business brief + generation workflow
-- Adds the structured business-brief payload to projects. Generated outputs are
-- stored as rows in project_versions (content jsonb), already created in 0001.

alter table public.projects
  add column if not exists brief jsonb not null default '{}'::jsonb;

-- Convenience: surface the most recent generation timestamp for list views.
alter table public.projects
  add column if not exists last_generated_at timestamptz;

comment on column public.projects.brief is
  'Business-brief wizard input (see types/domain.ts BusinessBrief).';
comment on column public.projects.last_generated_at is
  'Timestamp of the latest successful AI generation.';
