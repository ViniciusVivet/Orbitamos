-- Orbitamos v3 - Reduz exposicao do email do perfil.
-- Executar depois de 013. Nao apaga dados.
--
-- Antes: qualquer usuario autenticado lia o email de todos via v3_profiles
-- (e a lista de "nova conversa" no chat exibia o email de cada usuario).
--
-- Agora: email so e legivel
--   - pelo proprio dono, via v3_get_my_profile() (migration 013);
--   - por contas de staff, via v3_profiles_contact(ids) (candidaturas,
--     colaboradores, solicitacoes de conta).
-- O chat passa a exibir o papel do usuario no lugar do email.

revoke select (email) on public.v3_profiles from anon, authenticated;

-- Leitura de contato (nome/email/foto) de um conjunto de usuarios, apenas para staff.
create or replace function public.v3_profiles_contact(ids uuid[])
returns table (id uuid, name text, email text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.email, p.avatar_url
  from public.v3_profiles p
  where public.v3_is_staff() and p.id = any(ids);
$$;

revoke all on function public.v3_profiles_contact(uuid[]) from public;
grant execute on function public.v3_profiles_contact(uuid[]) to authenticated;
