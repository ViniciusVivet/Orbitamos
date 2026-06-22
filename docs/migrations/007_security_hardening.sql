-- Orbitamos v3.0 - Security hardening
-- Execute depois de docs/migrations/005_supabase_native_platform.sql e 006_supabase_academy_content.sql.
-- Nao apaga dados. Apenas restringe politicas RLS permissivas e reforca Storage.

alter table public.v3_profiles
add column if not exists is_internal boolean not null default false;

create or replace function public.v3_can_manage_contacts()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.v3_profiles p
    where p.id = auth.uid()
      and p.is_internal = true
  );
$$;

grant execute on function public.v3_can_manage_contacts() to authenticated;

-- Perfil: usuarios podem editar dados do proprio perfil, mas nao podem se promover
-- alterando role/email diretamente pelo client Supabase.
revoke insert (is_internal) on public.v3_profiles from anon, authenticated;
revoke update (id, email, role, is_internal, created_at) on public.v3_profiles from anon, authenticated;
grant update (
  name,
  avatar_url,
  phone,
  birth_date,
  address,
  city,
  neighborhood,
  state,
  zip_code,
  updated_at
) on public.v3_profiles to authenticated;

-- Contatos/leads: visitantes podem inserir pelo formulario, mas apenas contas internas leem e marcam como lido.
-- Depois de rodar esta migration, promova sua conta pelo SQL Editor:
-- update public.v3_profiles set is_internal = true where email = 'SEU_EMAIL';
drop policy if exists "v3_contacts_select_authenticated" on public.v3_contacts;
drop policy if exists "v3_contacts_select_freelancers" on public.v3_contacts;
drop policy if exists "v3_contacts_select_internal" on public.v3_contacts;
create policy "v3_contacts_select_internal"
on public.v3_contacts for select
to authenticated
using (public.v3_can_manage_contacts());

drop policy if exists "v3_contacts_update_authenticated" on public.v3_contacts;
drop policy if exists "v3_contacts_update_freelancers" on public.v3_contacts;
drop policy if exists "v3_contacts_update_internal" on public.v3_contacts;
create policy "v3_contacts_update_internal"
on public.v3_contacts for update
to authenticated
using (public.v3_can_manage_contacts())
with check (public.v3_can_manage_contacts());

-- Chat: somente o criador da conversa pode inserir participantes.
-- Isso bloqueia um usuario autenticado de se adicionar ou adicionar terceiros em conversas alheias.
drop policy if exists "v3_participants_insert_authenticated" on public.v3_conversation_participants;
create policy "v3_participants_insert_conversation_creator"
on public.v3_conversation_participants for insert
to authenticated
with check (
  exists (
    select 1
    from public.v3_conversations c
    where c.id = v3_conversation_participants.conversation_id
      and c.created_by_user_id = auth.uid()
  )
);

-- Storage de avatars.
-- Bucket publico continua podendo servir imagens, mas escrita fica limitada ao dono do perfil
-- ou ao criador da conversa de grupo.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own_profile_or_group_creator" on storage.objects;
create policy "avatars_insert_own_profile_or_group_creator"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (
      (storage.foldername(name))[1] = 'groups'
      and exists (
        select 1
        from public.v3_conversations c
        where c.id::text = (storage.foldername(name))[2]
          and c.created_by_user_id = auth.uid()
      )
    )
  )
);

drop policy if exists "avatars_update_own_profile_or_group_creator" on storage.objects;
create policy "avatars_update_own_profile_or_group_creator"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (
      (storage.foldername(name))[1] = 'groups'
      and exists (
        select 1
        from public.v3_conversations c
        where c.id::text = (storage.foldername(name))[2]
          and c.created_by_user_id = auth.uid()
      )
    )
  )
)
with check (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (
      (storage.foldername(name))[1] = 'groups'
      and exists (
        select 1
        from public.v3_conversations c
        where c.id::text = (storage.foldername(name))[2]
          and c.created_by_user_id = auth.uid()
      )
    )
  )
);
