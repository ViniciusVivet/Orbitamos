# Orbitamos Web

Revisão documental: **04/11/2026**.

Aplicativo principal em Next.js 16, React 19, TypeScript e Tailwind CSS.
O [package.json](package.json) declara dependências e comandos; o
[package-lock.json](package-lock.json) registra as versões da instalação.

## Instalação e desenvolvimento

Na raiz do repositório, com Node.js 22.12+ na linha 22 ou 24+ e npm:

```powershell
cd apps/web
npm ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev -- --port 3015
```

macOS/Linux:

```bash
cd apps/web
npm ci
if [ ! -f .env.local ]; then
  cp .env.example .env.local
fi
npm run dev -- --port 3015
```

Configure URL e anon key do Supabase seguindo
[VARIAVEIS_AMBIENTE.md](../../docs/VARIAVEIS_AMBIENTE.md).
O exemplo contém placeholders; preserve arquivos locais já configurados.

Essa compatibilidade considera Next.js, Vitest e Vite do lockfile. A pipeline
atual ainda usa a linha 20; esse é um dado do workflow, não uma exigência de
usar a mesma versão em toda máquina.

`npm run dev` sem a opção de porta usa a porta padrão do Next.js (3000).
Nesta máquina, os roteiros de auditoria usam 3015 por padrão. A inicialização
prepara os arquivos locais do Python/SQLite automaticamente via `predev`.

## Prévias locais

Com o servidor em execução, abra um destes caminhos em `http://localhost:3015`:

| Caminho | Conteúdo |
| --- | --- |
| `/dev/academy-preview?view=home` | Início da Academy |
| `/dev/academy-preview` | Catálogo de jogos |
| `/dev/academy-preview?activity=delivery` | Entrega do Orbi, capítulo 01 |
| `/dev/lab-preview?academy=1` | Catálogo de código |
| `/dev/ide-preview/variaveis-js?academy=1` | Editor e prática guiada |
| `/dev/csharp-preview?academy=1` | Piloto da trilha C# |
| `/dev/portal-preview?role=work` | Início do Studio |
| `/dev/workspace-preview?view=projects` | Projetos, lista/quadro e detalhe |
| `/dev/workspace-preview?view=applications` | Candidaturas |
| `/dev/workspace-preview?view=portfolio` | Editor e upload local do portfólio |

As prévias são exclusivas de desenvolvimento e retornam 404 em produção.
Fixtures não provam autorização ou gravação no Supabase de uma conta real.
O portfólio em prévia mantém alterações somente no navegador.

## Organização

- `src/app/`: rotas, layouts e endpoints auxiliares.
- `src/components/`: interfaces por domínio, incluindo portal, estudante,
  colaborador e jogos.
- `src/lib/`: regras de domínio, dados e projeções de progresso.
- `src/contexts/`: sessão, curso e demais estados compartilhados.
- `public/`: artes utilizadas, vídeos, materiais e Workers.
- `scripts/`: verificações e sincronização de assets gerados.
- `examples/`: experimentos isolados; não são páginas do produto.
- `test-results/`, `coverage/`, `.next/` e `public/vendor/` gerado:
  resultados locais, ignorados pelo Git nas regras correspondentes.

Os assets do capítulo ficam em `public/images/games/orbi-chapter/`;
as capas reais do catálogo, em `public/images/jogos/`. A divisão é funcional.
Não renomear rotas, chaves de saves ou arquivos públicos só por estética.

## Verificação

```powershell
npm test
npm run lint
npm run test:contracts
```

Para build, pare o servidor de desenvolvimento antes:

```powershell
npm run build
npm run start -- --port 3017
```

Cobertura, browser audits, pgTAP, limitações e resultados datados:
[TESTES_AUTOMATIZADOS.md](../../docs/TESTES_AUTOMATIZADOS.md).
O build chama `prebuild` para preparar Python/SQLite; os runtimes não precisam
ser adicionados ao Git.

## Publicação

A Vercel usa esta pasta como Root Directory e recebe a branch `main`.
Mantenha as variáveis do ambiente no provedor. A existência de commit/push
não substitui conferir o status do deploy.

Leia [AGENTS.md](AGENTS.md) antes de alterar o aplicativo, especialmente as
regras de versão do Next.js, direção visual, jogos e validação mobile.
Índice completo: [documentação](../../docs/README.md).
