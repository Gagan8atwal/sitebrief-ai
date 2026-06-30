-- SiteBrief AI — Sprint 3: security hardening
-- Resolves Supabase security-advisor warnings on helper/trigger functions.

-- Pin search_path on the updated_at trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user / set_updated_at are only ever invoked by triggers, never
-- directly. Revoke the implicit EXECUTE grant so they are not callable via the
-- REST RPC API. (Trigger execution does not require the EXECUTE privilege.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
