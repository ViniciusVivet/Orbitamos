# Arquitetura da Orbitamos

Última atualização: 2026-07-28

## Visão geral

A Orbitamos reúne duas frentes no mesmo aplicativo Next.js:

- **Estúdio digital:** site público, serviços, portfólio, cases e contato.
- **Portal autenticado:** estudante, colaborador, administração, fórum,
  mensagens, cursos, prática, jogos, progresso, vagas e projetos.

O runtime principal usa exclusivamente Vercel e Supabase.

## Componentes em execução

| Camada | Implementação | Responsabilidade |
| --- | --- | --- |
| Web | Next.js 16 em `apps/web` | UI, páginas e rotas auxiliares |
| Hospedagem | Vercel | Build e execução do Next.js |
| Autenticação | Supabase Auth | Cadastro, login, sessão e usuário |
| Banco | Supabase Postgres | Dados da plataforma e RLS |
| Storage | Supabase Storage | Avatares e arquivos da academia |
| Arquivos versionados | `apps/web/public/course-materials` | Materiais acadêmicos legados |
| API auxiliar | `apps/web/src/app/api` | Contato e entrega autenticada de materiais |

## Fluxos

```text
Navegador
  -> Vercel / Next.js
     -> Supabase Auth
     -> Supabase Postgres (protegido por RLS)
     -> Supabase Storage
     -> rotas /api do próprio Next.js
```

`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são obrigatórias.
Sem elas, as operações de dados falham explicitamente, sem recorrer a outro
backend.

## Autorização

- `src/proxy.ts` exige usuário Supabase nas rotas protegidas.
- As áreas `/estudante` e `/colaborador` exigem autenticação, mas não bloqueiam
  o usuário por `role`; a interface permite alternar entre estudar e trabalhar.
- `/dashboard` ainda usa `role` para escolher o redirecionamento inicial.
- `/admin` exige `adminRole` igual a `staff` ou `admin` no frontend.
- A autorização de dados sensíveis e operações administrativas deve continuar
  garantida no banco pelas policies RLS e funções das migrations, não apenas
  pela interface.

## Domínios de dados

| Domínio | Estruturas principais |
| --- | --- |
| Perfil | `v3_profiles`, `v3_collaborator_profiles`, `v3_portfolio_items` |
| Aprendizado | `courses`, `course_modules`, `lessons`, `lesson_materials`, `lesson_progress`, quizzes |
| Progresso | `v3_user_progress`, `lesson_progress` |
| Comunidade | `v3_forum_messages` |
| Mensagens | `v3_conversations`, `v3_conversation_participants`, `v3_chat_messages` |
| Operação | `v3_jobs`, `v3_job_applications`, `v3_collaborator_projects`, `v3_project_members` |
| Administração | `v3_notifications`, `v3_account_requests` |
| Comercial | `v3_contacts` |

O portfólio público permanece versionado em
`apps/web/src/data/projetos.ts`. O conteúdo acadêmico-base também possui dados
versionados em TypeScript, com sincronização/leitura do Supabase quando
configurado.

## Decisões vigentes

- Supabase é o backend principal enquanto custo e simplicidade forem
  prioritários.
- Vídeos de aula usam provedor externo; não devem ser guardados no repositório
  ou banco.
- RLS é a fronteira de segurança para acessos feitos com a anon key.
- Migrations em `supabase/migrations` são cumulativas e aplicadas em ordem.
- Documentos legados não são runbooks de produção.
