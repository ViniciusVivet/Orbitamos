# Arquitetura das áreas de colaborador e administração

Última atualização: 2026-07-28

## Área do colaborador

As rotas `/colaborador/*` exigem sessão Supabase, mas não exigem
`role === FREELANCER`. Essa é uma decisão observável no layout atual: qualquer
usuário autenticado pode acessar a experiência de trabalho.

| Rota | Responsabilidade |
| --- | --- |
| `/colaborador` | Visão geral |
| `/colaborador/vagas` | Vagas abertas |
| `/colaborador/vagas/[id]` | Detalhe e candidatura |
| `/colaborador/candidaturas` | Candidaturas do usuário |
| `/colaborador/projetos` | Projetos dos quais o usuário participa |
| `/colaborador/squad` | Pessoas e colaboração do projeto |
| `/colaborador/perfil` | Perfil profissional |
| `/colaborador/portfolio` | Itens de portfólio |
| `/colaborador/contatos` | Contatos comerciais autorizados por RLS |
| `/colaborador/conta` | Dados da conta |
| `/colaborador/privacidade` | Solicitações relacionadas a dados |
| `/mensagens` | Conversas compartilhadas |

Dados principais:

- `v3_collaborator_profiles`
- `v3_jobs`
- `v3_job_applications`
- `v3_collaborator_projects`
- `v3_project_members`
- `v3_portfolio_items`
- `v3_notifications`
- `v3_account_requests`

## Área administrativa

O layout `/admin` exige `adminRole` igual a `staff` ou `admin`. As operações
também são protegidas no Supabase por `v3_is_staff()`, `v3_is_admin()` e
policies RLS.

| Rota | Responsabilidade |
| --- | --- |
| `/admin` | Visão operacional |
| `/admin/cursos` | Cursos, módulos, aulas e materiais |
| `/admin/vagas` | Gestão de vagas |
| `/admin/candidaturas` | Processo seletivo |
| `/admin/projetos` | Projetos e squads |
| `/admin/solicitacoes` | Solicitações de privacidade |

`staff` não deve receber automaticamente operações exclusivas de `admin`. Essa
distinção está no banco e deve ser preservada ao adicionar telas.

## Fronteiras de segurança

- A interface oculta e redireciona, mas não é a fronteira de segurança.
- Leitura e escrita devem permanecer limitadas por RLS.
- Candidatos só podem retirar a própria candidatura pela função
  `v3_withdraw_application`; não podem escolher livremente o status.
- Campos pessoais de `v3_profiles` são protegidos pelas migrations `013` e
  `014`.
- Contatos comerciais só podem ser gerenciados por perfis internos
  autorizados.
