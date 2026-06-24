# Arquitetura da Orbitamos

Ultima atualizacao: 2026-06-24

## Visao geral

A Orbitamos hoje e um produto com duas frentes dentro do mesmo projeto:

- **Studio digital**: site publico que apresenta a Orbitamos, portfolio, servicos e formulario de contato.
- **Portal de tecnologia**: area logada para estudantes e colaboradores, com aulas, materiais, progresso, mensagens e funcionalidades academicas.

A direcao atual e manter tudo online com custo minimo usando **Vercel + Supabase**. O backend Spring/AWS continua no repositorio como legado/fallback, mas nao e o caminho principal para a operacao atual.

## Runtime atual

| Camada | Tecnologia | Status |
| --- | --- | --- |
| Frontend | Next.js em `apps/web` | Atual |
| Hospedagem web | Vercel | Atual |
| Auth | Supabase Auth | Atual |
| Banco | Supabase Postgres | Atual |
| Storage | Supabase Storage e arquivos publicos do Next | Atual |
| API local do Next | `apps/web/src/app/api/*` | Atual para rotas auxiliares |
| Backend Java | Spring Boot em `apps/api` | Legado/fallback |
| AWS EC2/CloudFront | Infra antiga | Legado |

## Fluxo principal

```txt
Usuario
  -> orbitamosbr.com / www.orbitamosbr.com
  -> Vercel / Next.js
  -> Supabase Auth, Postgres e Storage
```

Quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existem, a area logada usa Supabase nativo. `NEXT_PUBLIC_API_URL` deve ficar ausente/vazio nesse modo; ela existe apenas para fallback do backend Spring.

## Dados

As tabelas novas usam prefixo `v3_*` quando necessario para conviver com tabelas antigas que vieram do Spring/AWS.

Principais dominios de dados:

- `v3_profiles`: perfil do usuario logado.
- `v3_contacts`: contatos enviados pelo site publico.
- `v3_forum_messages`: forum/comunidade.
- `v3_conversations`, `v3_conversation_participants`, `v3_chat_messages`: mensagens.
- `courses`, `course_modules`, `lessons`, `lesson_materials`, `quizzes`: estrutura academica.
- `lesson_progress`, `user_progress`: progresso do aluno.

As migrations ficam em `docs/migrations`.

## Conteudo academico

Videos devem ficar fora do banco, preferencialmente YouTube ou outro provedor de video.

Materiais leves e PDFs podem ser servidos pelo projeto web em:

```txt
apps/web/public/course-materials
```

O acesso passa pela rota:

```txt
/api/course-materials/[...path]
```

Essa rota ajuda a evitar links quebrados e permite preview/download dentro da area de aulas.

## Portfolio e site publico

Os projetos expostos no portfolio ainda ficam hardcoded no frontend, principalmente em:

```txt
apps/web/src/data/projetos.ts
```

Metricas e textos publicos tambem podem aparecer em componentes/paginas do `apps/web/src`. Um CMS pode ser considerado depois, mas por enquanto hardcode e suficiente para custo zero e baixo volume de alteracoes.

## Estrutura do repositorio

```txt
apps/
  web/              # Next.js atual
  api/              # Spring Boot legado/fallback
docs/
  migrations/       # SQLs aplicados no Supabase
  legacy/           # documentos historicos de AWS/Render/Spring
  local/            # arquivos locais ignorados pelo Git
```

## Decisoes importantes

- Manter Supabase como backend principal enquanto o objetivo for custo minimo.
- Nao recriar backend em Render free, porque cold start prejudica login e area logada.
- Nao armazenar videos no Supabase; usar links externos.
- Preservar o Spring Boot no repositorio como estudo/fallback, sem tratar como producao atual.
- Separar documentacao atual de documentacao historica para evitar configuracoes erradas.
