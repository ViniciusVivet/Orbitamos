# Testes e validações

Última revisão documental: 2026-11-05. Os resultados de `3643a04` permanecem
históricos. A rodada de escalabilidade abaixo distingue testes focais, integração
unitária, auditoria isolada de navegador de 05/11 e banco local. As fixtures
não comprovam dados/autorização do projeto remoto.

## Suítes e comandos atuais

O frontend usa Vitest em ambiente Node para testes comportamentais e o test
runner nativo do Node para contratos estáticos de segurança/operação.

```powershell
cd apps/web

npm test                        # suíte Vitest
npm run test:watch              # desenvolvimento
npm run test:coverage           # suíte + limites dos módulos selecionados
npm run test:contracts          # contratos de colaborador e Supabase local
npm run test:collaborator       # somente contratos de colaborador
npm run test:supabase:contracts # somente contratos do ambiente Supabase local
npx next typegen                # declarações Next em um clone limpo
npx tsc --noEmit                # TypeScript
npm run lint
npm run build
```

`test:collaborator` continua disponível, mas não é alias de `test:contracts`:
o segundo também executa `scripts/test-supabase-local.mjs`. Esses contratos
inspecionam arquivos; não iniciam Postgres nem executam policies RLS.

## Cobertura implementada

| Área | Exemplos presentes na suíte |
| --- | --- |
| Contato e materiais | validação, rate limiter, rota, headers, MIME types, fallback e traversal |
| Autenticação e proxy | redirects, retorno seguro, rotas públicas e sessão |
| Escalabilidade | catálogo resumido/detalhe por slug, progresso bulk, cursores de chat, respostas atrasadas, troca de conta e fila de conclusão/XP |
| Conteúdo e navegação | catálogos, atividades, trilhas, próximo passo, progresso e integridade |
| Prática e laboratório | execução em worker, rascunhos, validações, narrativas, feedback, SQL e C# |
| Jogos | regras, colisões, gramática, saves, legado, preservação de conquistas e capítulo Orbi |
| Colaborador e portfólio | status, filtros, prazos, projeto autorizado, links, mídia e rascunhos |
| Contratos | permissões administrativas, candidaturas, dados de prévia e estrutura local Supabase |

A existência desses testes não comprova aprovação de uma execução nova nem
cobertura visual. O Vitest inclui `src/**/*.test.ts`; não há ambiente DOM
configurado para testes React de componentes/formulários.

## Rodada de escalabilidade iniciada em 2026-11-04

Validações locais comprovadas pelos agentes, em execuções focais independentes.
Há arquivos em comum entre as suítes abaixo; não somar esses totais como uma
nova execução global:

| Execução focal | Resultado |
| --- | --- |
| `cursos`, `contentIntegrity`, `learningExperience`, `academyCatalog`, `courseMaterials`, `csharpTrack` | 61 testes, 6 arquivos |
| `academyLessonProgress` e `lessonCompletion` | 15 testes, 2 arquivos, um worker |
| `courseProgress` e `lessonCompletion`, versão final da fila | 16 testes, 2 arquivos |
| `authSessionGuard`, `chatApi` e `chatHistory` | 26 testes, 3 arquivos |
| `scripts/test-supabase-local.mjs` | 4 contratos |
| `supabase/tests/database/lesson_completion.test.sql` | 32/32 asserções pgTAP |
| `supabase/tests/database/rls.test.sql` | 14/14 asserções pgTAP |
| `scripts/test-lesson-completion-concurrency.mjs` | aprovado, com concorrência real observada |

Na integração final de **05/11/2026**, `npm run test:coverage -- --maxWorkers=1`
foi aprovado com **517 testes em 56 arquivos**. É uma execução separada, não a
soma das suítes focais. O relatório V8 dessa execução enumerou os dois módulos de
jogos configurados; não representa cobertura percentual de todo o aplicativo.

A auditoria isolada `audit-scaling.mjs` passou em Chromium desktop e
WebKit/iPhone 13: conclusão pendente/reload/retry, prêmio único, chat 50→100 com
âncora, erro/retry, envio, logout entre abas, restauração e XP da conta B. O
chat flutuante foi conferido em 320 px e não consultou histórico minimizado.
Dois avisos de acesso a requisições HTTP locais interrompidas foram preservados
separadamente no relatório WebKit; nenhuma outra exceção de página foi registrada.
As origens externas foram bloqueadas e a CSP foi contornada somente no teste.

TypeScript, build de produção (71 páginas), 9 contratos estáticos e lint completo
foram aprovados. Os avisos anteriores de Browserslist e tracing da rota de
materiais permanecem. O lint local
registrou 31 avisos e zero erros, incluindo roteiros antigos ignorados em
`test-results`; esse total não é o número de avisos de um clone limpo no CI.
Lint focal e `git diff --check` dos escopos modificados foram aprovados. Exemplo
da execução com menor concorrência usada para o leitor de progresso:

```powershell
node node_modules/vitest/vitest.mjs run --maxWorkers=1 --no-file-parallelism src/lib/academyLessonProgress.test.ts src/lib/lessonCompletion.test.ts
```

As suítes SQL foram executadas via `psql` no container descartável com
`ON_ERROR_STOP=1`, TAP sem `not ok` e rollback. Os 14 casos RLS usam grants
legados mínimos somente na fixture transacional; isso modela permissões que o
CLI recente não criou implicitamente, sem acrescentá-las às migrations de
produção. Os 32 casos da 019 exercitam os grants de progresso da própria 019.

O teste de concorrência observou duas sessões esperando locks enquanto a
primeira transação continuava aberta. Confirmou prêmios `[10, 0, 10]`, duas
conclusões, XP `90 -> 10`/nível `3 -> 4` e outra conta inalterada; removeu as
fixtures no `finally`.

A tentativa de iniciar a stack completa teve timeout no pg-delta; o teste
efetivo usou Postgres isolado. O ambiente local foi encerrado com volumes
preservados. Nessa rodada local, o usuário havia adiado a aplicação e nenhum SQL
remoto foi executado pelos agentes. Em **05/11/2026**, o usuário informou que
executou a 019 com sucesso no Supabase; não houve nova validação funcional remota
autenticada pelos agentes.
Detalhes em [SUPABASE_LOCAL.md](SUPABASE_LOCAL.md) e
[ESCALABILIDADE_SEM_CUSTO.md](ESCALABILIDADE_SEM_CUSTO.md). Este registro não
substitui uma checagem global de TypeScript/build nem auditoria de navegador.

## Registro verificado de 2026-11-04

Entrega de referência: commit `3643a04` — `Refine collaborator workspace and add
Orbi platform chapter`. Registro em
[STUDIO_E_ORBI_CAPITULO_01.md](STUDIO_E_ORBI_CAPITULO_01.md):

| Verificação anterior | Resultado registrado |
| --- | --- |
| Testes unitários | 48 arquivos, 450 testes passando |
| TypeScript e build de produção | aprovados; 71 páginas no build |
| Lint | sem erros; avisos anteriores do repositório |
| Colaborador | 30 registros de QA em Chromium, WebKit/iPhone 13 e 320 px |
| Portfólio | edição/upload local, retomada, teclado e axe em Chromium e WebKit |
| Orbi | três entregas com controles reais, erros, pausa, recarga, legado, final e passagem à IDE |
| Resiliência do Orbi | conquistas entre abas, quota local e dois toques simultâneos |
| Rotas protegidas verificadas sem sessão | redirects `307` para autenticação no build local |

Upload local na prévia não comprova gravação autenticada em Storage remoto.
O registro também não fornece nova medição de cobertura percentual nem
resultado de pgTAP para essa data. Build aprovado não comprova deploy publicado.

Auditorias reproduzíveis existentes em `apps/web`:

```powershell
node scripts/audit-collaborator-workspace.mjs
node scripts/audit-orbi-chapter.mjs
node scripts/audit-orbi-chapter-resilience.mjs
npm run test:ide
npm run test:videos
```

Os três primeiros roteiros usam `http://localhost:3015` por padrão. Para outro
endereço, configure `COLLABORATOR_AUDIT_URL` (colaborador) ou `ORBI_TEST_URL`
(Orbi). Dependem de servidor de desenvolvimento e navegadores Playwright
instalados. As rotas `/dev/*` usam fixtures isoladas e só existem em
desenvolvimento. Esses roteiros não são executados pelo workflow atual de CI.

## Histórico de 2026-08-07

| Verificação | Resultado daquela execução |
| --- | --- |
| `npm test` | 13 arquivos, 133 testes passando |
| `npm run test:coverage` | passou |
| Statements / branches selecionados | 98,27% / 91,39% |
| Functions / lines selecionadas | 100% / 100% |
| `npm run test:contracts` | 5 testes passando |
| `npx tsc --noEmit` | passou |
| `npm run lint` | sem erros; 33 avisos de imagens não otimizadas |
| `npm run build` | passou; 55 páginas geradas |

Esses números descrevem a versão de agosto e não são totais atuais. Os limites
mínimos atuais em `apps/web/vitest.config.mts` são statements 80%, branches 70%,
functions 80% e lines 80%. A configuração inclui `contact.ts`,
`courseMaterials.ts`, `jogoGuiaOrbi.ts` e `jogoMonteCodigo.ts`; confira quais
arquivos o relatório de cada execução efetivamente instrumentou. Esses limites
focais não medem todo o app.

## CI e Supabase local

`.github/workflows/web-tests.yml` executa em PRs e pushes para `main` que
alteram `apps/web`, `supabase` ou o próprio workflow, com Node 20 e seis etapas
bloqueantes: instalação, typecheck, lint, cobertura, contratos e build.
O build normaliza o caminho real no Windows antes de iniciar o Next.js.

A etapa de typecheck executa `next typegen` antes do `tsc`. O Next gera
`next-env.d.ts` (ignorado pelo Git), incluindo os tipos de importação de imagens,
e os tipos das rotas. Assim a checagem não depende de um `next dev` ou build
anterior na máquina e funciona também no checkout limpo do runner.

Existem duas suítes pgTAP: 14 verificações em
`supabase/tests/database/rls.test.sql` e 32 em
`supabase/tests/database/lesson_completion.test.sql`, com identidades fictícias e
rollback. Cobrem isolamento de progresso, PII, contatos, vagas, solicitações de
conta e a RPC de conclusão/XP. O runner de concorrência é separado do pgTAP.
A execução é separada, com Docker e banco local descartável:

```powershell
npm run supabase:start
npm run supabase:reset
npm run supabase:test
npm run supabase:stop
```

`supabase:reset` recria o banco local; o procedimento completo está em
[SUPABASE_LOCAL.md](SUPABASE_LOCAL.md). O CI atual executa apenas os contratos
estáticos desse ambiente, sem iniciar Docker ou pgTAP.

## Auditoria isolada de catálogo, chat e XP

A auditoria `node scripts/audit-scaling.mjs` inicia seu próprio Next na porta
3016 e um backend HTTP fictício em loopback. Usa o formulário de login e as
páginas protegidas reais, sem alterar `.env`, SQL remoto ou contas reais. Requer
Chromium e WebKit do Playwright instalados e nenhum outro Next usando a mesma
pasta `.next`. Capturas e relatório ficam em `apps/web/test-results/scaling/`.

Para permitir o backend HTTP fictício, o browser Chromium usa `bypassCSP` e o
WebKit recebe documentos interceptados sem o header CSP. Todas as origens
externas são bloqueadas pelo roteiro. Isso testa os fluxos da aplicação com
dados isolados; não verifica a CSP de produção nem um iPhone físico.

O WebKit pode emitir avisos de acesso a requisições HTTP da fixture interrompidas
durante navegação. O relatório os guarda em `fixtureAccessControlWarnings`,
separados das exceções JavaScript que reprovam o roteiro. Os asserts funcionais
continuam exigindo login, leitura, envio, retomada e troca de conta corretos.

## Auditoria da home e portfólio comercial

Com o servidor local 3015 em execução, use
`node scripts/audit-commercial-portfolio.mjs` em `apps/web`. A variável
`PORTFOLIO_AUDIT_URL` permite outro endereço. O roteiro verifica a faixa em
movimento e seus controles, seis cases da home, 11 projetos sem repetição,
imagens, busca, filtros e recuperação da lista vazia. Abre os dois novos cases
e exige título realmente opaco no viewport e cena inicial pronta.

São quatro perfis sequenciais: desktop, notebook baixo, WebKit com perfil de
iPhone 13 e celular de 320px com movimento reduzido. Axe cobre somente os novos
blocos, não o site inteiro. Capturas e relatório ficam em
`apps/web/test-results/commercial-portfolio/`, ignorados pelo Git. O roteiro
não envia formulários nem mensagens e não substitui teste em iPhone físico.

## Limites restantes

- Integrar as auditorias de navegador e a suíte pgTAP ao CI.
- Ampliar testes de componentes/formulários React e integração real de Auth e Storage.
- Comprovar a aplicação remota de migrations/policies e os fluxos autenticados
  com contas separadas; fixtures e contratos estáticos não dão essa evidência.
- Medir desempenho do capítulo Orbi em aparelhos modestos; screenshots e
  contagem de testes não comprovam qualidade visual ou desempenho.
