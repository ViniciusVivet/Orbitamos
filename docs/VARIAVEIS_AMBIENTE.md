# Variaveis de ambiente

Ultima atualizacao: 2026-06-24

## Frontend atual: Vercel + Supabase

Configure estas variaveis no projeto da Vercel, em `Settings -> Environment Variables`:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Essas duas variaveis sao publicas por natureza no frontend. A `anon key` nao e senha de banco; a seguranca depende de RLS/policies no Supabase.

## Variavel legada

Nao configure esta variavel no modo atual:

```txt
NEXT_PUBLIC_API_URL
```

Ela aponta o frontend para o backend Spring legado. Se ela for configurada sem querer, partes da area logada podem tentar falar com uma API antiga/fora do ar.

## Email de contato

A rota `apps/web/src/app/api/contact/route.ts` pode enviar email via EmailJS se estas variaveis existirem:

```txt
EMAILJS_SERVICE_ID
EMAILJS_TEMPLATE_ID
EMAILJS_PUBLIC_KEY
```

Elas sao opcionais. O contato principal deve continuar sendo salvo no Supabase em `v3_contacts`.

## Desenvolvimento local

Para rodar localmente o web app com Supabase, crie:

```txt
apps/web/.env.local
```

Exemplo:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Nao coloque senha do banco, JWT secret, service role key ou senha pessoal em `.env.local`.

## Backend Spring legado

O backend em `apps/api` pode exigir variaveis como `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` e `JWT_SECRET`.

Isso e legado. Se o Spring for reativado no futuro, crie um novo documento operacional antes de colocar em producao. Nao reutilize arquivos antigos como `ec2-env.sh` sem revisar senha, host, CORS e deploy.

## Regras de seguranca

- Nunca commitar `.env`, `.env.local` ou arquivos com `export ...PASSWORD=`.
- Senha de banco nao pode ser reaproveitada em conta pessoal.
- Se uma senha apareceu em arquivo local antigo, trate como vazada e troque no provedor.
- Secrets de producao devem ficar no dashboard da Vercel/Supabase, nao no repositorio.
