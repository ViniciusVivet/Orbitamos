# Migracao para Supabase nativo

Objetivo: manter o site publico na Vercel e tirar a dependencia da API Spring/AWS para a area logada.

## O que ja foi preparado no codigo

- Auth passa a usar Supabase quando as variaveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existirem.
- Perfil, progresso, contato, forum e chat basico usam Supabase.
- Estrutura academica preparada em Supabase: cursos, modulos, aulas, materiais/PDFs, quizzes e progresso por aula.
- API Spring fica como fallback legado quando Supabase nao estiver configurado.
- Videos continuam no YouTube.
- Avatares passam a usar o bucket `avatars` do Supabase Storage.

## Passos no Supabase

### 1. Rodar SQL

No Supabase Dashboard:

1. Abra o projeto.
2. Va em `SQL Editor`.
3. Cole e execute os arquivos nesta ordem:

```txt
docs/migrations/005_supabase_native_platform.sql
docs/migrations/006_supabase_academy_content.sql
```

Esses SQLs criam tabelas, triggers, seed inicial e politicas RLS. A migration `005` usa tabelas `v3_*` para conviver com o schema antigo do Spring sem renomear nem apagar dados legados.

### 2. Criar bucket de avatars

Em `Storage`:

1. Crie um bucket chamado:

```txt
avatars
```

2. Marque como public bucket.

Para materiais/PDFs de aula, crie tambem:

```txt
course-materials
```

Pode ser publico por enquanto para simplificar os links. Se depois quiser restringir downloads para alunos logados, a proxima etapa e usar bucket privado com URLs assinadas.

### 3. Configurar Auth URLs

Em `Authentication` -> `URL Configuration`:

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

Para evitar bloqueio no cadastro enquanto estamos migrando, deixe a confirmacao de email desligada por enquanto ou configure SMTP corretamente antes.

## Passos na Vercel

Em `Settings` -> `Environment Variables`, adicione:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Remova ou deixe de usar:

```txt
NEXT_PUBLIC_API_URL
```

Depois faca redeploy.

## Dados antigos

Nada neste plano apaga dados antigos.

Se os dados antigos estiverem em uma base Postgres acessivel, o caminho correto e exportar CSV/SQL e importar nas tabelas novas. Se a AWS ja caiu e nao temos acesso ao banco antigo, novos cadastros funcionam no Supabase, mas os usuarios antigos precisarao recriar conta ou redefinir senha quando forem recriados.

## Limites conhecidos desta fase

- Chat funciona como persistencia basica; realtime fica para uma fase seguinte com Supabase Realtime.
- Projetos/vagas da area colaborador ainda retornam vazio quando Supabase esta ativo.
- Cursos/aulas ainda usam fallback estatico em `apps/web/src/lib/cursos.ts`, mas as tabelas `courses`, `course_modules`, `lessons`, `lesson_materials`, `quizzes` e progresso por aula ja estao preparadas na migration `006`.
