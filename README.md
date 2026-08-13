# Orbitamos

Estúdio digital na entrada; plataforma de tecnologia, educação e colaboração
na área autenticada.

Última atualização da documentação: 2026-07-28

## Produto

O mesmo aplicativo atende duas frentes:

1. **Site comercial:** serviços, portfólio, cases e contato.
2. **Portal autenticado:** estudante, colaborador, academia, progresso, fórum,
   mensagens, vagas, projetos e administração.

Produção verificada em: [www.orbitamosbr.com](https://www.orbitamosbr.com).

## Arquitetura atual

```text
Vercel / Next.js 16
  -> Supabase Auth
  -> Supabase Postgres + RLS
  -> Supabase Storage
  -> rotas auxiliares do Next.js
```

| Camada | Tecnologia | Estado no repositório |
| --- | --- | --- |
| Aplicativo | Next.js, React, TypeScript e Tailwind | Principal |
| Auth e dados | Supabase | Principal |
| Hospedagem | Vercel | Principal |

Detalhes e limites: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Estrutura

```text
apps/
  web/                 aplicativo principal
supabase/
  migrations/          migrations SQL da plataforma atual
  tests/database/      testes locais das policies RLS
docs/
  migrations/          migrations históricas 001 a 004
  legacy/              documentos históricos
  local/               runbooks locais ignorados pelo Git
  README.md             índice da documentação
```

## Executar o aplicativo principal

Pré-requisitos: Node.js e npm.

```powershell
cd apps/web
npm install
Copy-Item .env.example .env.local
npm run dev
```

No macOS/Linux:

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

Configure em `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Variáveis opcionais e regras de segurança:
[docs/VARIAVEIS_AMBIENTE.md](docs/VARIAVEIS_AMBIENTE.md).

## Validação

```powershell
cd apps/web
npm run lint
npx tsc --noEmit
npm run test:coverage
npm run test:contracts
npm run build
```

O estado conhecido da suíte está documentado em
[docs/TESTES_AUTOMATIZADOS.md](docs/TESTES_AUTOMATIZADOS.md). Não assuma que
todos os comandos passam sem consultar esse registro e executar novamente.

## Supabase

A plataforma v3 usa as migrations `005` a `018`. Elas cobrem:

- perfil, PII e progresso;
- academia, aulas, materiais e quizzes;
- fórum e chat;
- vagas, candidaturas, projetos e squads;
- staff/admin, notificações, portfólio e privacidade;
- contato, rate limit e storage.

A existência de um arquivo SQL no Git não prova que ele foi aplicado no banco
remoto. Ordem completa e consultas de verificação:
[docs/SUPABASE_NATIVE_MIGRATION.md](docs/SUPABASE_NATIVE_MIGRATION.md).

## Documentação

- [Índice](docs/README.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Infraestrutura](docs/INFRA_ATUAL.md)
- [Variáveis de ambiente](docs/VARIAVEIS_AMBIENTE.md)
- [Supabase e migrations](docs/SUPABASE_NATIVE_MIGRATION.md)
- [Testes](docs/TESTES_AUTOMATIZADOS.md)
- [Contribuição](CONTRIBUTING.md)

## Licença

O README anterior declarava MIT, mas não há arquivo `LICENSE` versionado no
repositório nesta revisão. Antes de distribuir o projeto como MIT, adicione o
texto da licença e confirme a titularidade dos materiais e assets.
