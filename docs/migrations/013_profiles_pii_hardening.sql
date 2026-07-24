-- Orbitamos v3 - Endurecimento de PII do perfil.
-- Executar depois de 012. Nao apaga dados.
--
-- Problema: a policy de SELECT de v3_profiles usa `using (true)`, entao qualquer
-- usuario autenticado podia ler telefone, endereco, data de nascimento e CEP de
-- TODOS os usuarios (risco de privacidade / LGPD).
--
-- Correcao: revoga a LEITURA desses campos sensiveis para anon/authenticated.
-- As colunas publicas (name, avatar_url, city, state, role) continuam legiveis,
-- pois alimentam forum, chat, squad e o modal de perfil publico.
-- O proprio usuario le seu perfil completo (incluindo os campos privados) atraves
-- da funcao SECURITY DEFINER `v3_get_my_profile()`, que so retorna a propria linha.
--
-- Observacao: `email` NAO e revogado aqui porque areas internas (candidaturas,
-- diretorio de colaboradores, solicitacoes de conta) leem o email por RLS de staff.
-- Reduzir a exposicao de email e um passo futuro separado.

revoke select (phone, address, birth_date, zip_code)
  on public.v3_profiles from anon, authenticated;

-- Leitura do proprio perfil completo (inclui os campos privados acima).
create or replace function public.v3_get_my_profile()
returns setof public.v3_profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.v3_profiles where id = auth.uid();
$$;

revoke all on function public.v3_get_my_profile() from public;
grant execute on function public.v3_get_my_profile() to authenticated;
