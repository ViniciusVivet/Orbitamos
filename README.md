# Orbitamos

<div align="center">

![Orbitamos](https://img.shields.io/badge/Orbitamos-Est%C3%Budio%20Digital-00D4FF?style=for-the-badge&logo=rocket&logoColor=white)

**Sites, landing pages e sistemas web com foco em resultado.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-green?style=flat-square&logo=spring)](https://spring.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## O que é este repositório

A **Orbitamos** é, hoje, um **estúdio de produto digital**: entrega **landing pages**, **sites institucionais** e **sistemas web / MVPs** para negócios que precisam vender melhor e operar com tecnologia.

O site público (deploy na **Vercel**) está orientado a **orçamento e portfólio** (`/`, `/projetos`, `/contato`).

Em paralelo, o monorepo ainda contém uma **plataforma autenticada** (áreas de estudante, colaborador, fórum, chat, OrbitAcademy, etc.) ligada à API **Spring Boot** — evolução do projeto original com foco em educação e comunidade. Essas rotas existem para quem está logado; a narrativa principal do marketing público é **comercial**.

---

## Stack

### Frontend (`apps/web`)

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** + componentes (ex.: shadcn/ui)
- **Deploy:** Vercel

### Backend (`apps/api`)

- **Spring Boot 3**
- **Java 21**
- **Spring Security + JWT**
- **PostgreSQL** (Supabase)
- **WebSocket** (STOMP) para chat em tempo real
- **Deploy:** AWS EC2 (+ HTTPS via CloudFront, conforme docs)

### Infra (referência)

- **Banco:** Supabase (PostgreSQL)
- **Imagens:** Cloudinary (avatars, uploads)
- Detalhes: [docs/INFRA_ATUAL.md](docs/INFRA_ATUAL.md)

---

## Funcionalidades (resumo)

### Site público (foco comercial)

- **Home** — hero premium, serviços, projetos em destaque, CTAs para WhatsApp e `/projetos`
- **Projetos** — portfólio com cases e páginas por slug
- **Sobre, Contato, Mentorias, OrbitAcademy, Fórum** — páginas públicas conforme menu (parte do produto legado / institucional)

### Plataforma (usuários logados)

- **Autenticação** — JWT, roles `STUDENT` e `FREELANCER`
- **Área do estudante** (`/estudante`) — dashboard, progresso, aulas, perfil, etc.
- **Área do colaborador** (`/colaborador`)
- **Fórum** (`/forum`)
- **Mensagens** (`/mensagens`) — chat e grupos com WebSocket
- **Gamificação** — XP, níveis, conquistas (contexto da plataforma educacional)

---

## Endpoints da API (visão geral)

| Área | Exemplos |
|------|----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Dashboard | `GET/PUT /api/dashboard/me`, `GET /api/dashboard/summary`, … |
| Fórum | CRUD de mensagens |
| Chat | conversas e mensagens em tempo real |
| Contato | `POST /api/contact` |
| Saúde | `GET /api/health` |

Swagger (quando configurado na API): `https://<sua-api>/swagger-ui.html`

---

## Produção

| Peça | Onde |
|------|------|
| Frontend | **Vercel** |
| Backend | **AWS EC2** (+ CloudFront para HTTPS, conforme docs) |
| Banco | **Supabase** |

- [docs/INFRA_ATUAL.md](docs/INFRA_ATUAL.md)
- [docs/VARIAVEIS_AMBIENTE.md](docs/VARIAVEIS_AMBIENTE.md)
- [docs/EC2_CLOUDFRONT_HTTPS.md](docs/EC2_CLOUDFRONT_HTTPS.md)

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Java 21+
- Maven 3.6+

### Backend

```bash
cd apps/api
mvn spring-boot:run
# API em http://localhost:8080
```

### Frontend

```bash
cd apps/web
cp .env.example .env.local
# Ajuste NEXT_PUBLIC_API_URL (ex.: http://localhost:8080/api)

npm install
npm run dev
# App em http://localhost:3000 (ou outra porta se 3000 estiver em uso)
```

---

## Estrutura do monorepo

```
orbitamos/
├── apps/
│   ├── web/          # Next.js 16 — marketing + plataforma (rotas públicas e logadas)
│   └── api/          # Spring Boot 3 — API REST + WebSocket
├── docs/             # Infra, variáveis, deploy, migrations
└── README.md
```

Mais detalhes do frontend: [apps/web/README.md](apps/web/README.md)

---

## Roadmap (direção atual)

**Curto prazo**

- [ ] Refinar home e `/projetos` para conversão (copy, provas sociais, processo de entrega)
- [ ] Manter deploy e variáveis alinhados entre Vercel e API

**Médio prazo**

- [ ] Integrar métricas reais de projetos e depoimentos no site público
- [ ] Evoluir plataforma logada (conteúdo, estabilidade) conforme prioridade

**Legado / visão original**

- Conteúdo OrbitAcademy, mentoria em escala e impacto social continuam possíveis no mesmo codebase; a prioridade de produto **público** hoje é **estúdio digital**.

---

## Sobre

**Douglas Vinicius Alves da Silva** — fundador da Orbitamos.

[![GitHub](https://img.shields.io/badge/GitHub-ViniciusVivet-black?style=flat-square&logo=github)](https://github.com/ViniciusVivet)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vivetsp-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/vivetsp)

---

## Licença

MIT.

---

<div align="center">

**Orbitamos** — produto digital com propósito.

</div>
