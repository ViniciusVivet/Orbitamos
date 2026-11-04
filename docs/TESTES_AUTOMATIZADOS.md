# Testes e validações

Última revisão documental: 2026-11-04, comparada ao código de `3643a04`.
Os resultados abaixo preservam execuções anteriores; esta revisão documental
não executou testes, typecheck, lint, build, servidor ou auditorias de navegador.

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
| Conteúdo e navegação | catálogos, atividades, trilhas, próximo passo, progresso e integridade |
| Prática e laboratório | execução em worker, rascunhos, validações, narrativas, feedback, SQL e C# |
| Jogos | regras, colisões, gramática, saves, legado, preservação de conquistas e capítulo Orbi |
| Colaborador e portfólio | status, filtros, prazos, projeto autorizado, links, mídia e rascunhos |
| Contratos | permissões administrativas, candidaturas, dados de prévia e estrutura local Supabase |

A existência desses testes não comprova aprovação de uma execução nova nem
cobertura visual. O Vitest inclui `src/**/*.test.ts`; não há ambiente DOM
configurado para testes React de componentes/formulários.

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
functions 80% e lines 80%. O percentual considera somente `contact.ts`,
`courseMaterials.ts`, `jogoGuiaOrbi.ts` e `jogoMonteCodigo.ts`, não todo o app.

## CI e Supabase local

`.github/workflows/web-tests.yml` executa em PRs e pushes para `main` que
alteram `apps/web`, `supabase` ou o próprio workflow, com Node 20 e seis etapas
bloqueantes: instalação, typecheck, lint, cobertura, contratos e build.
O build normaliza o caminho real no Windows antes de iniciar o Next.js.

Existe uma suíte pgTAP com 14 verificações em
`supabase/tests/database/rls.test.sql`, com identidades fictícias e rollback.
Ela cobre isolamento de progresso, PII, contatos, vagas e solicitações de conta.
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

## Limites restantes

- Integrar as auditorias de navegador e a suíte pgTAP ao CI.
- Ampliar testes de componentes/formulários React e integração real de Auth e Storage.
- Comprovar a aplicação remota de migrations/policies e os fluxos autenticados
  com contas separadas; fixtures e contratos estáticos não dão essa evidência.
- Medir desempenho do capítulo Orbi em aparelhos modestos; screenshots e
  contagem de testes não comprovam qualidade visual ou desempenho.
