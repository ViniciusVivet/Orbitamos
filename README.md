# Orbitamos

Estúdio digital na entrada; plataforma de tecnologia, educação e colaboração
na área autenticada.

Revisão documental: **05/11/2026**. Última entrega de referência: `3643a04`;
padrão de qualidade aprovado registrado em `5b34877`.
Resultados de testes e verificações de produção são registros datados, não uma
afirmação de execução nova a cada leitura.

## Comece por aqui

- [Índice da documentação](docs/README.md): arquitetura, produto, operação e histórico.
- [Aplicativo web](apps/web/README.md): instalação, comandos e prévias locais.
- [Organização do repositório](docs/ORGANIZACAO_REPOSITORIO.md): onde guardar código,
  artes, exemplos, documentação e arquivos locais.
- [Contribuição](CONTRIBUTING.md) e [orientações para agentes](AGENTS.md).
- [Escalabilidade com a infraestrutura atual](docs/ESCALABILIDADE_SEM_CUSTO.md):
  catálogo resumido, chat paginado, sessão e conclusão/XP; SQL 019 pendente de aplicação remota pelo usuário.

## Produto e arquitetura

O mesmo aplicativo atende ao site comercial (serviços, cases e contato),
à Academy (trilhas, código, jogos, aulas e progresso) e ao Studio
(projetos, oportunidades, portfólio e colaboração).

```text
Vercel / Next.js 16 + React 19
  ├─ páginas comerciais e portal autenticado
  ├─ navegador: editores, Workers, jogos e saves locais
  ├─ Supabase Auth + Postgres/RLS + Storage
  └─ rotas auxiliares do Next.js: contato e materiais
```

Os dados e arquivos ligados à conta usam Supabase. Parte da prática e dos jogos
ainda guarda progresso no navegador, por conta; isso não sincroniza aparelhos.
Detalhes: [arquitetura](docs/ARCHITECTURE.md).

## Estrutura principal

```text
apps/web/                  aplicação principal, dependências e configuração
  src/                     páginas, componentes, domínios e testes unitários
  public/                  mídia e Workers usados pelo aplicativo
  scripts/                 auditorias e utilitários de desenvolvimento
  examples/                experimentos isolados, fora do aplicativo
supabase/
  migrations/              migrations atuais timestampadas (005 a 019)
  tests/database/          testes locais de RLS
docs/
  migrations/              migrations históricas 001 a 004
  local/                   materiais e operação locais, ignorados pelo Git
  README.md                índice por assunto e estado
.github/workflows/         verificações de integração contínua
```

## Rodar e testar

Use Node.js **22.12+ na linha 22 ou 24+**, compatível com as dependências, e npm.
A faixa considera também Vite/Vitest do lockfile, além do mínimo do Next.js.
A instalação reproduzível usa o lockfile:

```powershell
cd apps/web
npm ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev -- --port 3015
```

Preencha as variáveis públicas do Supabase em `apps/web/.env.local`, preservando
qualquer configuração existente. Nunca versionar credenciais.
Veja [variáveis de ambiente](docs/VARIAVEIS_AMBIENTE.md).

O acesso local é `http://localhost:3015`. As [prévias](apps/web/README.md#prévias-locais)
ajudam a testar interface sem gravar fixtures em contas reais.

Para verificações, consulte [o guia de testes](docs/TESTES_AUTOMATIZADOS.md).
Pare o servidor de desenvolvimento antes de executar `npm run build`.
A entrega de referência registrou 450 testes em 48 arquivos e build aprovado; esse número
não substitui executar as verificações adequadas à próxima alteração.
A rodada de escalabilidade passou com 517 testes em 56 arquivos, TypeScript e
9 contratos; os testes focais, de navegador e de banco local estão registrados
separadamente no [guia da rodada](docs/ESCALABILIDADE_SEM_CUSTO.md).

## Produção e banco

A aplicação é publicada na Vercel a partir de `main`, com Root Directory
`apps/web`. O site é [orbitamosbr.com](https://orbitamosbr.com).
Cada publicação autorizada deve ser conferida no provedor.

A ordem e os nomes reais das migrations estão em
[Supabase nativo](docs/SUPABASE_NATIVE_MIGRATION.md). Um SQL no Git não prova que
ele foi aplicado remotamente. Testes locais de RLS usam ambiente descartável,
conforme [Supabase local](docs/SUPABASE_LOCAL.md).

A migration 019 de conclusão e XP está pronta e testada localmente. O usuário
decidiu aplicar o SQL depois; nenhuma migration remota foi aplicada nesta rodada.
Em um projeto com 005–018 já aplicadas, instalar somente a 019 conforme o
[procedimento](docs/ESCALABILIDADE_SEM_CUSTO.md#aplicar-depois-somente-a-019-no-projeto-existente),
sem reset ou seed de produção.

Limites de planos, estado dos serviços e diferenças entre evidência local e
produção estão em [infraestrutura](docs/INFRA_ATUAL.md).

## Licença

Não há `LICENSE` versionado nesta revisão. Antes de distribuir o projeto como
MIT ou outra licença, confirme a titularidade do código e dos materiais e
adicione o texto correspondente.
