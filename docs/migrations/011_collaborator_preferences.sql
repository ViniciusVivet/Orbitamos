-- Preferencias profissionais e privacidade da area do colaborador.
-- Executar depois de 010_collaborator_workspace.sql.
alter table public.v3_collaborator_profiles
  add column if not exists preferred_job_types text[] not null default '{}',
  add column if not exists preferred_work_models text[] not null default '{}',
  add column if not exists weekly_hours integer check (weekly_hours is null or weekly_hours between 1 and 80),
  add column if not exists minimum_budget numeric(12,2) check (minimum_budget is null or minimum_budget >= 0),
  add column if not exists open_to_contact boolean not null default true,
  add column if not exists profile_visible boolean not null default true;

drop policy if exists "profiles readable" on public.v3_collaborator_profiles;
create policy "visible professional profiles are readable"
  on public.v3_collaborator_profiles for select to authenticated
  using (profile_visible or auth.uid() = user_id);
