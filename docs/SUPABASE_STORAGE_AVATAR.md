# Supabase Storage: bucket para foto de perfil

Para o upload de foto de perfil funcionar no frontend, crie o bucket **avatars** no Supabase.

## 1. Criar o bucket

1. Acesse [Supabase](https://supabase.com/dashboard) → seu projeto **Orbitamos**.
2. Menu lateral → **Storage**.
3. Clique em **New bucket**.
4. Nome: `avatars`.
5. Marque **Public bucket** (para as imagens terem URL pública de leitura).
6. Crie o bucket.

## 2. Política de upload (opcional)

Se quiser que apenas usuários autenticados façam upload (via Supabase Auth), configure RLS.  
Como o upload é feito pelo frontend com a **anon key**, o mais simples é permitir upload para o bucket:

- Em **Storage** → **Policies** no bucket `avatars`:
- Adicione uma política que permita **INSERT** (upload) para o bucket. Exemplo: permitir todos (anon) para INSERT em `avatars/*` se precisar; ou restringir por auth.uid() se usar Supabase Auth para login.

Para o fluxo atual (login JWT no backend, frontend só usa anon key), uma política que permite **INSERT** e **SELECT** para todos no bucket `avatars` já resolve. Em produção você pode restringir depois.

## 3. Variáveis no frontend

No **Vercel** (ou `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto (ex.: `https://nvptikymbvqrjdvxcaor.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave anon (Settings → API → anon public).

Sem essas variáveis, o usuário continua podendo usar **URL da imagem** no editar perfil (colar link); o upload por arquivo só funciona com o bucket e as variáveis configurados.

---

## 4. Foto de perfil via backend (upload na API)

O backend também oferece upload de avatar em `POST /api/dashboard/me/avatar`. A URL da foto é montada com a **URL base da API**. Em produção (Render):

- Se **`API_BASE_URL`** estiver definido no Render (ex.: `https://orbitamos-backend.onrender.com`), essa URL é usada e a foto carrega em HTTPS.
- Se não estiver definido, o backend usa o host do request (headers `X-Forwarded-Proto` e `X-Forwarded-Host`), então no Render a foto também passa a carregar em HTTPS.

Se a foto não aparecer e no console aparecer **Mixed Content** (página HTTPS pedindo `http://localhost:8080/...`), defina **`API_BASE_URL`** no Render com a URL pública do backend. Quem já subiu foto antes pode precisar **trocar a foto de novo** para gerar uma URL correta.

### Como testar o fluxo da foto

1. Fazer login no site (Vercel).
2. Ir em **Conta** (ou **Configurações** / perfil).
3. Clicar em alterar foto e enviar uma imagem (JPG, PNG, GIF ou WebP).
4. Conferir se a nova foto aparece no cabeçalho/sidebar.
5. Recarregar a página e ver se a foto continua aparecendo (sem erro de Mixed Content no console).
