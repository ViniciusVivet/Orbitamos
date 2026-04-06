# Orbitamos Web — Frontend

Frontend da **Orbitamos** em **Next.js 16** (App Router), TypeScript e Tailwind CSS.

## Visão geral

O app cobre duas frentes:

1. **Site público comercial** — home orientada a orçamento e portfólio, página **`/projetos`** com cases, contato e demais páginas de marketing.
2. **Plataforma autenticada** — áreas logadas (estudante, colaborador, fórum, mensagens, OrbitAcademy, etc.) consumindo a API em `apps/api`.

## Stack

- **Next.js 16** — App Router
- **React 18**
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Three.js** — efeitos 3D onde aplicável

## Como executar

**Pré-requisitos:** Node.js 18+

```bash
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080/api (ou URL de produção)

npm run dev
# http://localhost:3000
```

**Docker** (se usar na raiz do monorepo): `docker-compose up web`

## Páginas principais

| Rota | Uso |
|------|-----|
| `/` | Home comercial (CTAs, serviços, destaque de projetos) |
| `/projetos` | Portfólio e cases |
| `/contato`, `/sobre` | Institucional |
| `/mentorias`, `/orbitacademy` | Conteúdo legado / institucional |
| `/estudante`, `/colaborador`, `/forum`, `/mensagens` | Áreas logadas |

## Variáveis de ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=Orbitamos
```

Outras chaves podem existir para integrações (EmailJS, etc.); veja `.env.example`.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servidor após build
npm run lint     # ESLint
```

## Deploy

**Vercel** — conectar o repositório, definir `NEXT_PUBLIC_API_URL` e demais variáveis conforme [docs/VARIAVEIS_AMBIENTE.md](../../docs/VARIAVEIS_AMBIENTE.md).

## Design system (paleta)

- **orbit-electric:** `#00D4FF`
- **orbit-purple:** `#8B5CF6`

## Documentação

- [README do monorepo](../../README.md)
- [Next.js](https://nextjs.org/docs) · [Tailwind](https://tailwindcss.com/docs)

## Licença

MIT — veja [LICENSE](../../LICENSE).
