# Arquitetura das áreas de colaborador e administração

Última revisão documental: 2026-11-04, comparada ao código de `3643a04`.
Estado implementado no repositório; aplicação remota de policies e gravação
autenticada em Storage exigem evidência própria.

## Studio: área do colaborador

As rotas `/colaborador/*` exigem sessão Supabase, sem exigir
`role === FREELANCER`. Qualquer usuário autenticado pode alternar entre Studio
e Academy. `ColaboradorSidebar` reutiliza `PortalSidebar` no modo `work`, com
cabeçalho compartilhado, notificações e navegação móvel.

| Grupo do menu | Rotas e responsabilidade |
| --- | --- |
| Seu trabalho | `/colaborador` (próximo trabalho), `/colaborador/projetos` (projetos e contexto), `/mensagens?area=work`, `/colaborador/squad` |
| Contatos internos | `/colaborador/contatos`, visível no menu para `isInternal`; acesso aos dados continua sujeito a RLS |
| Oportunidades | `/colaborador/vagas`, `/colaborador/vagas/[id]` e `/colaborador/candidaturas` |
| Minha apresentação | `/colaborador/perfil` e `/colaborador/portfolio` |
| Conta e acesso | `/colaborador/conta`, `/colaborador/privacidade` e link `/admin` para staff/admin |

### Próximo trabalho e projetos

A home busca projetos, vagas e candidaturas separadamente e distingue falha de
carga de lista vazia. `collaboratorExperience.ts` normaliza status, considera
prazos em `America/Sao_Paulo` e ordena projetos por situação, prazo e prioridade.
Concluídos e pausados têm tratamento próprio.

O botão abre `/colaborador/projetos?projeto=<id>`. O parâmetro seleciona apenas
um item da lista já autorizada por `getMyProjects`; não amplia acesso a projetos.
O detalhe usa briefing, links HTTP(S) sem credenciais, prazo, prioridade,
progresso informado e membros vindos das APIs atuais. Não há implementação de
uma lista nova de tarefas ou cálculo automático do progresso por entregas.

Candidaturas agrupam `pending/reviewing` como em andamento, `accepted` como
aceitas e `declined/withdrawn` como encerradas, com filtros e contagens
consistentes. A retirada usa `v3_withdraw_application`.

### Perfil e portfólio

O guia do perfil usa campos reais, sem percentual inventado de completude.
Portfólio salvo usa `v3_portfolio_items`. A edição oferece link opcional,
JPG/PNG/WebP com prévia, recuperação de rascunho por conta e confirmação antes
de apagar. O rascunho `orbitamos-portfolio-draft-v1-<conta>` permanece local ao
navegador; não é uma gravação no Supabase.

A imagem é preparada no navegador e enviada somente ao salvar, para
`avatars/<auth.uid>/portfolio/<arquivo>`. Reutiliza as policies existentes do
bucket; não cria bucket, migration ou nova autorização. O limite de entrada de
25 MB no cliente não altera o limite do arquivo enviado no Storage. A cobertura
é pública após upload, assim como os avatares. A aprovação da prévia com upload
local não comprova upload autenticado no projeto remoto.

Dados principais: `v3_collaborator_profiles`, `v3_jobs`,
`v3_job_applications`, `v3_collaborator_projects`, `v3_project_members`,
`v3_portfolio_items`, `v3_notifications` e `v3_account_requests`.

## Área administrativa

O layout `/admin` exige `adminRole` igual a `staff` ou `admin`. As migrations
implementam `v3_is_staff()`, `v3_is_admin()`, policies RLS e grants; sua aplicação
no banco remoto não é comprovada apenas pelo frontend ou pelo Git.

| Rota | Responsabilidade |
| --- | --- |
| `/admin` | Visão operacional |
| `/admin/cursos` | Cursos, módulos, aulas e materiais |
| `/admin/vagas` | Gestão de vagas |
| `/admin/candidaturas` | Processo seletivo |
| `/admin/projetos` | Projetos e squads |
| `/admin/solicitacoes` | Solicitações de privacidade |

O acesso geral ao layout para staff não concede operações exclusivas de admin;
as policies distinguem essas permissões, inclusive solicitações de conta.
Essa distinção deve ser preservada ao adicionar telas.

## Fronteiras de segurança

- Proxy e layouts verificam sessão/acesso de navegação; RLS, grants e RPCs
  delimitam os dados efetivamente acessíveis.
- Candidatos retiram a própria candidatura por `v3_withdraw_application`; não
  podem escolher livremente o status.
- Campos pessoais e email em `v3_profiles` têm restrições nas migrations `013`
  e `014`. Funções de contato também precisam respeitar o contexto autorizado.
- Contatos comerciais são limitados a perfis internos autorizados, independentemente
  da visibilidade do link de menu.
- `src/lib/workspace.ts` usa `v3_profiles_contact` com fallback de leitura
  direta para compatibilidade; isso não substitui a instalação das migrations
  de proteção de PII.

## Prévias, validação e próxima evolução

`/dev/portal-preview?role=work` e
`/dev/workspace-preview?view=projects|applications|portfolio` oferecem fixtures
isoladas para QA e retornam 404 fora de desenvolvimento. Elas não comprovam
persistência ou permissões remotas.

A rodada de 2026-11-04 registrou QA em desktop, WebKit/iPhone e 320 px,
incluindo portfólio e navegação. A mesma entrega adicionou o capítulo local
**A última luz do bairro** na Academy; ele é referência aprovada para jogos,
sem alterar o modelo de autorização do colaborador. Detalhes e histórico de
validação: [STUDIO_E_ORBI_CAPITULO_01.md](STUDIO_E_ORBI_CAPITULO_01.md) e
[TESTES_AUTOMATIZADOS.md](TESTES_AUTOMATIZADOS.md).

Tarefas operacionais novas, progresso automático por entregas e sincronização
de rascunhos entre dispositivos continuam como evolução possível, sem promessa
de implementação nesta rodada.
