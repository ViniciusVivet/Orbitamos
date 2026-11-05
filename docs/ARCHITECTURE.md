# Arquitetura da Orbitamos

Última revisão documental: 2026-11-05. A base histórica é `3643a04`; as mudanças
posteriores de catálogo, chat, sessão e XP estão em
[ESCALABILIDADE_SEM_CUSTO.md](ESCALABILIDADE_SEM_CUSTO.md), com testes focais e de
banco local separados dos resultados históricos, além da auditoria isolada de
cursos/chat em desktop e WebKit. Evidências de publicação
ficam registradas separadamente em [INFRA_ATUAL.md](INFRA_ATUAL.md).

## Visão geral

A Orbitamos reúne duas frentes no mesmo aplicativo Next.js em `apps/web`:

- **Estúdio digital:** site público, serviços, portfólio, cases e contato.
- **Portal autenticado:** Academy (estudante), Studio (colaborador),
  administração, fórum, mensagens, cursos, prática, jogos, progresso e trabalho.

Vercel e Supabase compõem a infraestrutura principal descrita no repositório.
Isso não comprova qual commit está publicado nem a configuração remota atual;
consulte [INFRA_ATUAL.md](INFRA_ATUAL.md).

## Componentes implementados

| Camada | Implementação | Responsabilidade |
| --- | --- | --- |
| Web | Next.js 16.2 / React 19.2 em `apps/web` | UI, páginas, proxy e rotas auxiliares |
| Hospedagem prevista | Vercel | Build e execução do Next.js |
| Autenticação | Supabase Auth / `@supabase/ssr` | Cadastro, login, cookies e sessão |
| Banco | Supabase Postgres | Dados compartilhados, RLS, grants e RPCs |
| Storage | Supabase Storage | Buckets `avatars` e `academy` |
| Conteúdo versionado | `src/data`, `src/lib` e `public/course-materials` | Catálogos, atividades e materiais legados |
| API auxiliar | `src/app/api` | Contato e entrega de materiais legados |
| Execução no navegador | Workers, Pyodide, sql.js e Phaser | Laboratórios e jogos; sem servidor de execução de código próprio |

As versões exatas ficam em `apps/web/package-lock.json`. O pacote declara
Next.js `^16.2.9`, React `^19.2.8` e Phaser `4.2.1`; os intervalos não fixam
sozinhos a versão instalada.

## Fluxos e persistência

```text
Navegador
  -> Vercel / Next.js (páginas, proxy e /api)
  -> Supabase Auth / Postgres / Storage (cliente autenticado e RLS)
  -> Workers e jogos no cliente
     -> armazenamento local por navegador e conta
```

`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuram os
clientes. Sem elas, `requireSupabase()` falha explicitamente e o proxy
redireciona rotas protegidas para login. Catálogos versionados, atividades
locais e prévias de desenvolvimento não são outro backend. Vídeos de aula e
EmailJS, quando configurado para contato, são integrações externas.

| Persistência | Dados |
| --- | --- |
| Supabase | Perfis, cursos/aulas publicados, progresso de aulas, progresso agregado, fórum, conversas, vagas, candidaturas, projetos, portfólio salvo e solicitações |
| Local ao navegador e à conta | Rascunhos, retomada e evidências de atividades práticas/jogos; capítulo novo do Orbi; edição não salva do portfólio |
| Repositório | Portfólio público em `src/data/projetos.ts`, conteúdo-base e mídia em `public` |

O catálogo acadêmico consulta resumos e metadados de aulas; conteúdo, quiz e
materiais completos são buscados somente para o slug aberto. A leitura de
conclusões combina UUIDs e aliases por curso em lotes de até 100 referências,
com usuário esperado e validação de sessão antes/depois da rede.

Conversas usam relações embutidas e uma última mensagem por conversa; o histórico
usa cursor `(created_at, id)`, 50 mensagens por página e máximo de 100. O cliente
combina páginas/envios por ID e mantém estado por conta/conversa, sem adicionar
polling ou Realtime. `AuthContext` observa os eventos do SDK Supabase e invalida
respostas antigas após troca de conta ou logout.

Conclusão e XP passam pela RPC `v3_complete_lesson(text,text,uuid)`, definida na
019: uma transação, prêmio fixo de 10 XP só na primeira conclusão e sem soma no
cliente. A fila local preserva a chave antiga e usa journal por aula entre abas.
Sem RPC, a conclusão durável fica pendente e o XP aguarda o servidor. A 019 foi
testada localmente; em 05/11/2026, o usuário informou aplicação bem-sucedida no
Supabase, sem nova validação funcional remota pelos agentes. Veja
[o registro da 019](ESCALABILIDADE_SEM_CUSTO.md).

Progresso de aulas ou agregado no Supabase não implica sincronização dos saves
locais. O capítulo **A última luz do bairro**, em
`/estudante/jogos/entregas-do-orbi`, carrega Phaser sob demanda e mantém física,
renderização e gramática restrita de declarações numéricas no cliente. A conclusão
exige programa adequado e chegada ao destino. O save
`orbitamos-orbi-chapter-v2-<conta>` preserva o legado v1 sem convertê-lo em
conclusão nova. Sincronização entre dispositivos ainda não foi implementada.
Detalhes: [STUDIO_E_ORBI_CAPITULO_01.md](STUDIO_E_ORBI_CAPITULO_01.md).

## Autorização

- `src/proxy.ts` valida usuário Supabase nas rotas protegidas e fecha o acesso
  quando a autenticação falha.
- `/estudante` e `/colaborador` exigem sessão, sem bloqueio por `role`; a
  interface permite alternar entre aprender e trabalhar.
- `/dashboard` usa `role` apenas para o redirecionamento inicial.
- `/admin` exige `adminRole` igual a `staff` ou `admin` no layout cliente.
- A autorização dos dados depende das policies, grants e RPCs no banco; o
  layout e o proxy não substituem essa proteção.

## Domínios de dados

| Domínio | Estruturas principais |
| --- | --- |
| Perfil | `v3_profiles`, `v3_collaborator_profiles`, `v3_portfolio_items` |
| Aprendizado | `courses`, `course_modules`, `lessons`, `lesson_materials`, `lesson_progress`, quizzes |
| Progresso agregado | `v3_user_progress` |
| Comunidade | `v3_forum_messages` |
| Mensagens | `v3_conversations`, `v3_conversation_participants`, `v3_chat_messages` |
| Operação | `v3_jobs`, `v3_job_applications`, `v3_collaborator_projects`, `v3_project_members` |
| Administração | `v3_notifications`, `v3_account_requests` |
| Comercial | `v3_contacts`, `v3_contact_attempts` |

## Decisões vigentes e fontes

- Migrations atuais: 15 arquivos timestampados em `supabase/migrations`, da
  `005` à `019`. A 019 bloqueia escritas diretas do cliente nas tabelas de
  progresso e mantém leitura própria por RLS. O usuário informou aplicação da
  019 em 05/11/2026; presença no Git e esse relato não substituem validação
  funcional remota autenticada.
- `academy` contém assets públicos de curso; `avatars` contém avatares e capas
  de portfólio. `academy-materials` era uma referência documental antiga, sem
  implementação correspondente nas migrations atuais.
- Materiais em `public/course-materials` são arquivos públicos; a rota
  `/api/course-materials` valida sessão em produção ao entregá-los, mas não
  torna privado o caminho estático.
- As prévias `/dev/*` usam fixtures e retornam 404 fora de desenvolvimento.
- Documentos legados preservam histórico e não substituem runbooks atuais.

Fontes locais: `apps/web/package.json`, `src/proxy.ts`, `src/lib/api.ts`,
`src/lib/workspace.ts`, `src/lib/orbiChapter.ts` e `supabase/migrations`.
A fronteira de dados segue os conceitos oficiais de
[RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
e de [acesso aos buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals),
consultados em 2026-11-04; essas fontes não atestam a configuração da Orbitamos.
