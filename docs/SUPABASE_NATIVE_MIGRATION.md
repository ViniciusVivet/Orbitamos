# Migracao para Supabase nativo

Ultima atualizacao: 2026-06-24

Objetivo: manter o site publico na Vercel e tirar a dependencia da API Spring/AWS para a area logada.

## Estado atual

Ja esta preparado no codigo:

- Auth via Supabase quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existem.
- Perfil, progresso, contato, forum e chat basico no Supabase.
- Estrutura academica em Supabase: cursos, modulos, aulas, materiais, quizzes e progresso por aula.
- Avatares no bucket `avatars`.
- Materiais de aula servidos pelo Next em `apps/web/public/course-materials`.
- API Spring mantida apenas como fallback legado.

## SQL no Supabase

No Supabase Dashboard:

1. Abra o projeto.
2. Va em `SQL Editor`.
3. Execute os arquivos em ordem:

```txt
docs/migrations/005_supabase_native_platform.sql
docs/migrations/006_supabase_academy_content.sql
docs/migrations/007_security_hardening.sql
docs/migrations/008_course_materials_seed.sql
```

Resumo:

- `005`: cria a base v3 da plataforma, usando tabelas `v3_*` para conviver com tabelas antigas.
- `006`: cria cursos, modulos, aulas, materiais, quizzes e progresso por aula.
- `007`: endurece politicas/RLS e funcoes sensiveis.
- `008`: popula os materiais de aula importados para a estrutura atual.

## Storage

Crie o bucket:

```txt
avatars
```

Marque como publico enquanto a estrategia for simplicidade e baixo custo operacional.

Para materiais de aula, a decisao atual e manter arquivos leves versionados em `apps/web/public/course-materials`. Se no futuro o volume crescer, mover para Supabase Storage ou outro provedor com URLs assinadas.

## Auth URLs

Em `Authentication -> URL Configuration`:

Site URL:

```txt
https://www.orbitamosbr.com
```

Redirect URLs:

```txt
https://www.orbitamosbr.com/**
https://orbitamosbr.com/**
http://localhost:3000/**
```

Durante a migracao, a confirmacao de email pode ficar desligada para evitar bloqueio de cadastro. Quando SMTP estiver configurado corretamente, reavaliar.

## Vercel

Em `Settings -> Environment Variables`:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Remova ou deixe ausente:

```txt
NEXT_PUBLIC_API_URL
```

Depois faca redeploy.

## Dados antigos

Nada nesta migracao apaga dados antigos por padrao.

As tabelas antigas podem continuar no Supabase para consulta/migracao manual. Quando um usuario antigo precisar voltar, o caminho mais seguro e criar/recuperar a conta no Supabase Auth e garantir uma linha correspondente em `v3_profiles`.

## Limites conhecidos

- Chat ainda e persistencia basica; realtime fica para uma fase seguinte com Supabase Realtime.
- Vagas/projetos internos da area colaborador ainda precisam de evolucao de produto.
- Cursos ja aparecem no portal, mas um painel administrativo para editar aulas/materiais ainda e etapa futura.
