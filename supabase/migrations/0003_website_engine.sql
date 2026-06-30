-- SiteBrief AI — Sprint 3: website engine + revision history
-- Adds the editable website plan to projects and a snapshot table for revisions.

alter table public.projects
  add column if not exists website jsonb not null default '{}'::jsonb;

comment on column public.projects.website is
  'Current editable website plan (see types/website.ts GeneratedWebsite).';

-- ---------------------------------------------------------------------------
-- website_versions — immutable snapshots used by the revision engine
-- ---------------------------------------------------------------------------
create table if not exists public.website_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version integer not null check (version > 0),
  label text,
  content jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create index if not exists website_versions_project_id_idx
  on public.website_versions (project_id);

alter table public.website_versions enable row level security;

drop policy if exists "website_versions_select_own" on public.website_versions;
create policy "website_versions_select_own" on public.website_versions
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = website_versions.project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "website_versions_insert_own" on public.website_versions;
create policy "website_versions_insert_own" on public.website_versions
  for insert with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = website_versions.project_id and p.owner_id = auth.uid()
    )
  );
