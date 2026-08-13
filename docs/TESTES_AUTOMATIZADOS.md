# Testes e validações

Última atualização: 2026-08-05

## Suítes atuais

O frontend usa Vitest para testes comportamentais e o test runner nativo do
Node para contratos estáticos de segurança/operação.

```powershell
cd apps/web

npm test                 # suíte Vitest
npm run test:watch       # desenvolvimento
npm run test:coverage    # suíte + limites de cobertura
npm run test:contracts   # contratos SQL/rotas legados
npx tsc --noEmit         # TypeScript
```

`test:collaborator` foi preservado como alias de `test:contracts` para não
quebrar comandos antigos.

## Cobertura implementada

| Área | Exemplos validados |
| --- | --- |
| Contato | limpeza, limites, email, IP e rate limiter |
| Rota de contato | JSON inválido, persistência, falha de banco, EmailJS e `429` |
| Materiais | traversal, MIME types, fallback PDF/DOCX, metadados e headers |
| Proxy | rotas públicas, redirects anônimos e usuário autenticado |
| Cursos | IDs únicos, lookup, total e próxima aula |
| Portfólio | slugs, lookup e filtros |
| Desafios | integridade, lookup e sequência por linguagem |
| Jogos | execução, colisão, recursão, estrelas, navegação e storage |
| Contratos | admin, candidatura, dados mockados e estrutura operacional |

## Resultado observado em 2026-08-07

| Verificação | Resultado |
| --- | --- |
| `npm test` | 13 arquivos, 133 testes passando |
| `npm run test:coverage` | passou |
| Statements selecionados | 98,27% |
| Branches selecionados | 91,39% |
| Functions selecionadas | 100% |
| Lines selecionadas | 100% |
| `npm run test:contracts` | 5 testes passando |
| `npx tsc --noEmit` | passou |
| `npm run lint` | passou sem erros; 33 avisos de imagens não otimizadas |
| `npm run build` | passou; 55 páginas geradas |

Os limites mínimos ficam em `apps/web/vitest.config.mts`:

- statements: 80%;
- branches: 70%;
- functions: 80%;
- lines: 80%.

A cobertura é deliberadamente focada nos módulos selecionados no arquivo de
configuração. Ela não representa 100% do aplicativo inteiro.

## CI

`.github/workflows/web-tests.yml` executa em PRs e pushes para `main` que
alteram o web app, migrations ou o próprio workflow:

1. `npm ci`;
2. typecheck;
3. lint;
4. testes com cobertura;
5. contratos;
6. build de produção.

Todos os seis passos são bloqueantes. O build normaliza o caminho real do
workspace no Windows antes de iniciar o Next.js, evitando módulos duplicados
quando o diretório é aberto com capitalização diferente.

## Limites restantes

Ainda faltam:

- testes em navegador real;
- integração contra um Supabase descartável;
- execução automatizada das policies RLS;
- testes React dos componentes e formulários;

Próxima prioridade: Supabase local/staging para provar que usuário comum,
staff e admin recebem exatamente as permissões esperadas.
