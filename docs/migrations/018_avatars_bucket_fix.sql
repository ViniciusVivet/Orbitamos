-- Orbitamos v3 - Garante o bucket de avatars saudavel.
-- Executar depois de 017.
--
-- Sintoma: nao consegue salvar foto de perfil. Causas possiveis:
--   1) o bucket 'avatars' nao existe;
--   2) o bucket tem allowed_mime_types restrito e recusa WebP/tipos novos;
--   3) file_size_limit muito baixo.
-- Esta migration cria o bucket se faltar e remove restricoes de tipo,
-- deixando um limite generoso (as imagens ja sao comprimidas no cliente).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 15728640, null)  -- 15 MB, sem restricao de mime
on conflict (id) do update
  set public = true,
      file_size_limit = 15728640,
      allowed_mime_types = null;
