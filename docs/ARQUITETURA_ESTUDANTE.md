# Arquitetura da área do estudante

Última atualização: 2026-07-28

## Proteção e navegação

Todas as rotas `/estudante/*` passam pelo proxy Supabase e pelo layout
autenticado. O layout verifica sessão, não `role`. Um usuário autenticado pode
alternar entre as experiências de estudante e colaborador.

`/dashboard` mantém um redirecionamento inicial baseado em `role`:

- `STUDENT` -> `/estudante`
- `FREELANCER` -> `/colaborador`
- outro valor -> `/estudante`

## Rotas implementadas

| Rota | Responsabilidade |
| --- | --- |
| `/estudante` | Resumo, evolução e próximos passos |
| `/estudante/orbita` | Jornada de carreira |
| `/estudante/aulas` | Catálogo de cursos |
| `/estudante/cursos/[slug]` | Curso, módulos, aulas e materiais |
| `/estudante/pratica` | Catálogo de desafios |
| `/estudante/pratica/[slug]` | Ambiente de prática |
| `/estudante/jogos` | Catálogo de jogos |
| `/estudante/jogos/[slug]` | Jogo selecionado |
| `/estudante/jogos/orbi` | Jogo Guia Orbi |
| `/estudante/jogos/orbi/[nivel]` | Nível do Guia Orbi |
| `/estudante/mentorias` | Experiência de mentorias |
| `/estudante/progresso` | Progresso e conquistas |
| `/estudante/comunidade` | Entrada da comunidade |
| `/estudante/conta` | Perfil e configurações |
| `/mensagens` | Conversas compartilhadas com colaboradores |
| `/forum` | Fórum autenticado |

## Dados

- Catálogo-base: `src/lib/cursos.ts`.
- Experiência de aprendizado: `src/lib/learningExperience.ts`.
- Desafios e jogos: módulos em `src/lib`.
- Cursos persistidos: tabelas `courses`, `course_modules`, `lessons` e
  `lesson_materials`.
- Progresso: `lesson_progress` e `v3_user_progress`.
- Notificações: `v3_notifications`.

Materiais podem vir do bucket `academy-materials` ou dos arquivos versionados
em `public/course-materials`. A rota
`/api/course-materials/[...path]` exige autenticação em produção.

## Pontos de atenção

- A proteção de página não substitui as policies RLS.
- O catálogo TypeScript e o catálogo do banco precisam permanecer coerentes.
- Alterações no modelo acadêmico devem vir acompanhadas de migration
  idempotente e validação com usuário autenticado.
