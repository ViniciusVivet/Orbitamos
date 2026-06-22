# Dominio orbitamosbr.com

Guia rapido para apontar o dominio comprado na Namecheap para o projeto Orbitamos.

## Estado esperado

- Site principal: `https://www.orbitamosbr.com`
- Alias/redirect: `https://orbitamosbr.com`
- Frontend: Vercel, projeto `orbitamos`
- Area logada/API: Supabase nativo quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estiverem configuradas na Vercel. `NEXT_PUBLIC_API_URL` fica apenas como fallback legado para o backend Spring.

## 1. Adicionar dominio na Vercel

1. Abra Vercel Dashboard.
2. Entre no projeto `orbitamos`.
3. Va em `Settings` -> `Domains`.
4. Adicione `orbitamosbr.com`.
5. Adicione tambem `www.orbitamosbr.com`.
6. Defina `www.orbitamosbr.com` como dominio principal.
7. Deixe `orbitamosbr.com` redirecionando para `www.orbitamosbr.com`.

Se for recriar o projeto na Vercel, use `apps/web` como Root Directory.

## 2. Configurar DNS na Namecheap

Na Namecheap:

1. Va em `Domain List`.
2. Clique em `Manage` no dominio `orbitamosbr.com`.
3. Abra `Advanced DNS`.
4. Em `Host Records`, crie ou ajuste:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | `@` | `216.198.79.1` | Automatic |
| CNAME Record | `www` | `f271d0eb0fbd35c4.vercel-dns-017.com` | Automatic |

Remova registros conflitantes para `@` ou `www` se existirem, principalmente `URL Redirect`, `Parking Page` ou outro `A/CNAME` antigo.

## 3. Variaveis no frontend da Vercel

Em `Settings` -> `Environment Variables`, confirme:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Nao configure `NEXT_PUBLIC_API_URL` se a area logada estiver rodando direto no Supabase. Essa variavel e apenas fallback para o backend Spring antigo.

Depois de alterar variaveis, faca um novo deploy na Vercel.

## 4. Variaveis no backend

Se o backend Spring Boot deste repositorio estiver em uso, confirme as variaveis do ambiente onde ele roda:

```bash
export API_BASE_URL="https://URL_PUBLICA_ATUAL_DA_API"
export APP_COOKIE_SECURE=true
```

Se precisar liberar dominios extras sem mexer no codigo:

```bash
export SPRING_WEB_CORS_ALLOWED_ORIGINS="https://orbitamosbr.com,https://www.orbitamosbr.com"
```

Depois reinicie a API.

## 5. Checklist de validacao

Quando o DNS propagar:

- `https://www.orbitamosbr.com` abre o site.
- `https://orbitamosbr.com` redireciona para o `www`.
- O cadeado HTTPS aparece no navegador.
- Login/cadastro usa Supabase Auth.
- Formulario de contato envia.
- Forum/chat carregam se a migration do Supabase tiver sido aplicada.

DNS pode propagar em minutos, mas em alguns casos leva algumas horas.
