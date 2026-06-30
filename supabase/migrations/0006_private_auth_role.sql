-- Role helper lives in a non-exposed `private` schema (not callable as a public
-- RPC) and backs all admin/owner read policies. Idempotent.

create schema if not exists private;
grant usage on schema private to authenticated, anon;

create or replace function private.auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role::text from public.profiles where id = auth.uid()),
    'customer'
  );
$$;

revoke execute on function private.auth_role() from public;
grant execute on function private.auth_role() to authenticated, anon;

drop policy if exists "app_settings_owner_all" on public.app_settings;
create policy "app_settings_owner_all" on public.app_settings
  for all using (private.auth_role() = 'owner')
  with check (private.auth_role() = 'owner');

drop policy if exists "ai_usage_select_scoped" on public.ai_usage;
create policy "ai_usage_select_scoped" on public.ai_usage
  for select using (
    user_id = auth.uid() or private.auth_role() in ('owner', 'admin')
  );

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (private.auth_role() in ('owner', 'admin'));

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (
    private.auth_role() = 'owner'
    or (private.auth_role() = 'admin' and role <> 'owner')
  )
  with check (
    private.auth_role() = 'owner'
    or (private.auth_role() = 'admin' and role <> 'owner')
  );

drop policy if exists "projects_select_admin" on public.projects;
create policy "projects_select_admin" on public.projects
  for select using (private.auth_role() in ('owner', 'admin'));

drop policy if exists "projects_modify_admin" on public.projects;
create policy "projects_modify_admin" on public.projects
  for update using (private.auth_role() in ('owner', 'admin'))
  with check (private.auth_role() in ('owner', 'admin'));

drop policy if exists "project_versions_select_admin" on public.project_versions;
create policy "project_versions_select_admin" on public.project_versions
  for select using (private.auth_role() in ('owner', 'admin'));

drop policy if exists "website_versions_select_admin" on public.website_versions;
create policy "website_versions_select_admin" on public.website_versions
  for select using (private.auth_role() in ('owner', 'admin'));

drop policy if exists "events_select_admin" on public.events;
create policy "events_select_admin" on public.events
  for select using (private.auth_role() in ('owner', 'admin'));

drop policy if exists "audit_log_select_admin" on public.audit_log;
create policy "audit_log_select_admin" on public.audit_log
  for select using (private.auth_role() in ('owner', 'admin'));

drop function if exists public.auth_role();
