-- SiteBrief AI — roles, owner seeding, role-based authorization, AI usage.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('owner', 'admin', 'team', 'customer');
  end if;
end$$;

alter table public.profiles
  add column if not exists role public.user_role not null default 'customer';

create index if not exists profiles_role_idx on public.profiles (role);

-- App settings singleton (designated owner email).
create table if not exists public.app_settings (
  id boolean primary key default true check (id),
  owner_email text,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, owner_email)
values (true, 'xs6v8dp59s@privaterelay.appleid.com')
on conflict (id) do nothing;

-- handle_new_user provisions a role; the designated owner email becomes 'owner'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner text;
begin
  select owner_email into v_owner from public.app_settings where id = true;
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    case when new.email = v_owner then 'owner'::public.user_role
         else 'customer'::public.user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

update public.profiles p
set role = 'owner'
from public.app_settings s
where s.id = true and p.email = s.owner_email and p.role <> 'owner';

-- ai_usage logs every generation (Anthropic or fallback).
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  operation text not null,
  provider text not null default 'anthropic',
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  status text not null default 'success',
  error text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_idx on public.ai_usage (user_id);
create index if not exists ai_usage_created_idx on public.ai_usage (created_at desc);

alter table public.app_settings enable row level security;
alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage_insert_own" on public.ai_usage;
create policy "ai_usage_insert_own" on public.ai_usage
  for insert with check (user_id = auth.uid());

-- NOTE: the role helper and admin/owner read policies are finalized in
-- 0006_private_auth_role.sql, which puts auth_role() in a non-exposed schema.
