-- SiteBrief AI — Sprint 1 foundation schema
-- Tables: profiles, projects, project_versions, events, audit_log
-- Security: row-level security scoping all data to its owner.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type public.project_status as enum ('draft', 'active', 'archived');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Provision a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  slug text not null check (char_length(slug) between 1 and 100),
  description text check (char_length(description) <= 500),
  status public.project_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists projects_owner_id_idx on public.projects (owner_id);
create index if not exists projects_status_idx on public.projects (status);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- project_versions (version foundation)
-- ---------------------------------------------------------------------------
create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version integer not null check (version > 0),
  content jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create index if not exists project_versions_project_id_idx
  on public.project_versions (project_id);

-- ---------------------------------------------------------------------------
-- events (event foundation)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_project_id_idx on public.events (project_id);
create index if not exists events_created_at_idx on public.events (created_at desc);

-- ---------------------------------------------------------------------------
-- audit_log (audit foundation)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_actor_id_idx on public.audit_log (actor_id);
create index if not exists audit_log_entity_idx
  on public.audit_log (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.events enable row level security;
alter table public.audit_log enable row level security;

-- profiles: a user may see and edit only their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- projects: full CRUD limited to the owner.
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = owner_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = owner_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = owner_id);

-- project_versions: access gated through the parent project's ownership.
drop policy if exists "project_versions_select_own" on public.project_versions;
create policy "project_versions_select_own" on public.project_versions
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_versions.project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "project_versions_insert_own" on public.project_versions;
create policy "project_versions_insert_own" on public.project_versions
  for insert with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = project_versions.project_id and p.owner_id = auth.uid()
    )
  );

-- events: a user sees events for projects they own, or that they triggered.
drop policy if exists "events_select_own" on public.events;
create policy "events_select_own" on public.events
  for select using (
    actor_id = auth.uid()
    or exists (
      select 1 from public.projects p
      where p.id = events.project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own" on public.events
  for insert with check (
    actor_id = auth.uid()
    and (
      project_id is null
      or exists (
        select 1 from public.projects p
        where p.id = events.project_id and p.owner_id = auth.uid()
      )
    )
  );

-- audit_log: a user may read and append only their own audit entries.
drop policy if exists "audit_log_select_own" on public.audit_log;
create policy "audit_log_select_own" on public.audit_log
  for select using (auth.uid() = actor_id);

drop policy if exists "audit_log_insert_own" on public.audit_log;
create policy "audit_log_insert_own" on public.audit_log
  for insert with check (auth.uid() = actor_id);
