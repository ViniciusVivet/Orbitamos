# 🚀 Orbitamos - Portal da Quebrada que Orbita Tecnologia

<div align="center">

![Orbitamos Logo](https://img.shields.io/badge/ORBITAMOS-Portal%20da%20Quebrada-blue?style=for-the-badge&logo=rocket&logoColor=white)

**"Da quebrada pra tecnologia — A gente sobe junto."**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-green?style=flat-square&logo=spring)](https://spring.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## 🎯 **O Movimento**

A **Orbitamos** é mais que uma empresa de tecnologia e educação - é um **movimento** nascido na quebrada, com o objetivo de transformar vidas através da tecnologia. Nossa missão é levar pessoas da classe C e D do subemprego ao primeiro trampo em T.I. em até 9 meses.

### 🌟 **Nossa Essência**
- **Autenticidade**: Criada na quebrada, para a quebrada
- **Esperança**: Acreditamos no potencial de cada pessoa
- **Comunidade**: A gente sobe junto, sempre
- **Impacto**: Transformamos vidas reais
- **Tecnologia**: Portal da periferia que orbita o futuro

---

## 🚀 **Stack Tecnológica**

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript 5
- **Styling**: TailwindCSS + shadcn/ui
- **Componentes**: React 18 + hooks
- **Email**: EmailJS para envio de emails
- **Deploy**: Vercel

### **Backend**
- **Framework**: Spring Boot 3
- **Linguagem**: Java 21
- **Segurança**: Spring Security + JWT
- **Banco**: PostgreSQL (Supabase)
- **ORM**: Spring Data JPA
- **WebSocket**: STOMP (chat em tempo real)
- **Deploy**: EC2 + CloudFront (HTTPS)

### **Infraestrutura**
- **Backend**: AWS EC2 (us-east-2) + CloudFront (HTTPS)
- **Banco de dados**: Supabase (PostgreSQL)
- **Storage de imagens**: Cloudinary (avatars persistentes)
- **Frontend**: Vercel
- **Proxy**: Nginx (EC2)

> Estado completo da infra e histórico: [docs/INFRA_ATUAL.md](docs/INFRA_ATUAL.md)

---

## 🎯 **Funcionalidades Implementadas**

### 📱 **Páginas públicas**

- **Home** — Hero com manifesto, globo 3D interativo, metas da comunidade, XP ring
- **Sobre** — História, missão, valores, linha do tempo
- **Mentorias** — Programas disponíveis (vagas sob demanda)
- **Projetos** — Portfolio de projetos comerciais da Orbitamos
- **Contato** — Formulário com EmailJS, FAQ, parcerias

### 🔐 **Autenticação**

- Cadastro e login com JWT
- Roles: `STUDENT` (estudante) e `FREELANCER` (colaborador)
- Redirecionamento automático por role após login

### 🎓 **Área do Estudante (`/estudante`)**

- Dashboard com progresso, XP, nível, streak
- Checklist semanal de tarefas
- Perfil editável (nome, foto, localização, dados pessoais)
- Upload de foto via Cloudinary
- Aulas, mentorias, mural, vagas

### 🤝 **Área do Colaborador (`/colaborador`)**

- Dashboard com projetos e oportunidades
- Perfil editável com upload de foto
- Área de squad e projetos

### 💬 **Fórum (`/forum`)**

- Posts com tópicos, cores e emojis personalizados
- Respostas inline (thread por post)
- Edição e exclusão pelo autor
- Busca por conteúdo, autor ou cidade
- Perfil público de cada autor com botão de DM
- ForumWidget flutuante disponível em todas as páginas autenticadas

### 📨 **Mensagens (`/mensagens`)**

- Chat privado entre usuários (1:1)
- Grupos com avatar e membros
- Mensagens em tempo real via WebSocket (STOMP)
- Indicador de presença e "visto por último"
- Upload de foto de grupo

### 🏆 **Gamificação**

- Sistema de XP e níveis
- XP Ring animado
- Conquistas (`UserAchievement`)
- Globo 3D com nível do usuário

---

## 🔧 **Backend — Endpoints principais**

| Grupo | Endpoints |
|-------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Dashboard | `GET/PUT /api/dashboard/me`, `POST /api/dashboard/me/avatar`, `GET /api/dashboard/summary`, `POST /api/dashboard/me/progress/lesson` |
| Fórum | `GET/POST /api/forum/messages`, `PUT/DELETE /api/forum/messages/{id}` |
| Chat | `GET /api/chat/conversations`, `POST /api/chat/conversations`, `GET /api/chat/conversations/{id}/messages`, `POST /api/chat/conversations/{id}/messages`, e mais |
| Usuários | `GET /api/users/{id}/profile` |
| Mentorias | `GET /api/mentorships` |
| Projetos | `GET /api/projects` |
| Vagas | `GET /api/jobs` |
| Contato | `POST /api/contact` |
| Saúde | `GET /api/health` |

Documentação interativa (Swagger): `https://sua-api/swagger-ui.html`

---

## ☁️ **Produção**

O projeto roda 100% na nuvem, sem precisar deixar o PC ligado:

| Serviço | Plataforma |
|---------|-----------|
| Frontend | **Vercel** |
| Backend (Java) | **AWS EC2** (us-east-2) + **CloudFront** (HTTPS) |
| Banco de dados | **Supabase** (PostgreSQL) |
| Imagens / avatars | **Cloudinary** |

**Infra completa e histórico:** [docs/INFRA_ATUAL.md](docs/INFRA_ATUAL.md)
**Variáveis de ambiente:** [docs/VARIAVEIS_AMBIENTE.md](docs/VARIAVEIS_AMBIENTE.md)
**Deploy do backend (EC2):** [docs/EC2_CLOUDFRONT_HTTPS.md](docs/EC2_CLOUDFRONT_HTTPS.md)

---

## 🛠️ **Como Executar Localmente**

### **Pré-requisitos**
- Node.js 18+
- Java 21+
- Maven 3.6+

### **Backend**
```bash
cd apps/api
mvn spring-boot:run
# API rodando em http://localhost:8080
```

### **Frontend**
```bash
cd apps/web

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local: defina NEXT_PUBLIC_API_URL
# Local: http://localhost:8080/api
# Produção: URL do CloudFront (ver docs/INFRA_ATUAL.md)

npm install
npm run dev
# Site rodando em http://localhost:3000
```

---

## 📁 **Estrutura do Projeto**

```
orbitamos/
├── apps/
│   ├── web/                    # Frontend Next.js 14
│   │   └── src/
│   │       ├── app/            # Páginas (home, forum, mensagens, estudante, colaborador...)
│   │       ├── components/     # Componentes (Navigation, ForumWidget, chat/*, perfil/*, etc.)
│   │       ├── contexts/       # AuthContext, etc.
│   │       ├── hooks/          # useDraggablePosition, usePreWake, etc.
│   │       └── lib/            # api.ts, chatWs.ts, utils.ts
│   └── api/                    # Backend Spring Boot 3 (Java 21)
│       └── src/main/java/com/orbitamos/api/
│           ├── config/         # Security, CORS, WebSocket, Cloudinary
│           ├── controller/     # Auth, Dashboard, Forum, Chat, Users, Projects, Jobs...
│           ├── entity/         # User, ForumMessage, Conversation, ChatMessage...
│           ├── repository/     # JPA repositories
│           └── util/           # JwtUtil
├── docs/
│   ├── INFRA_ATUAL.md          # ⭐ Estado atual da infra (EC2/Cloudinary/Supabase/Vercel)
│   ├── EC2_CLOUDFRONT_HTTPS.md # Guia de deploy no EC2
│   ├── VARIAVEIS_AMBIENTE.md   # Variáveis de ambiente por serviço
│   └── migrations/             # Migrations SQL do Supabase
└── README.md
```

---

## 📈 **Roadmap**

### ✅ **Já implementado**
- [x] Sistema de autenticação (JWT, roles)
- [x] Área do estudante e do colaborador
- [x] Fórum com threads e busca
- [x] Chat em tempo real (WebSocket)
- [x] Gamificação (XP, níveis, conquistas)
- [x] Upload de avatar via Cloudinary
- [x] Globo 3D interativo na home
- [x] Perfil completo editável

### 🔜 **Próximos passos**
- [ ] Integração com conteúdo real de aulas (OrbitAcademy backend)
- [ ] Certificados digitais
- [ ] Sistema de mentoria peer-to-peer
- [ ] Notificações em tempo real
- [ ] Dashboard público de impacto

---

## 👨‍💻 **Sobre o Criador**

<div align="center">

### **Douglas Vinicius Alves da Silva**

[![GitHub](https://img.shields.io/badge/GitHub-ViniciusVivet-black?style=flat-square&logo=github)](https://github.com/ViniciusVivet)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vivetsp-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/vivetsp)

</div>

**Fundador e CEO da Orbitamos**

Douglas nasceu na periferia de São Paulo e entende na pele as dificuldades de quem quer entrar na área de tecnologia sem ter as ferramentas certas. Com 8 meses de faculdade já conseguiu seu primeiro estágio como Instrutor de Informática.

> "Sempre acreditei que a tecnologia pode transformar vidas. A Orbitamos nasceu da necessidade de criar um caminho claro para quem quer sair do subemprego e entrar na área de T.I. Não é só sobre ensinar a programar — é sobre mudança de mindset, quebra de barreiras e construção de uma nova realidade."

---

## 📄 **Licença**

Este projeto está sob a licença MIT.

---

<div align="center">

### **"Se a gente vai longe, é porque sobe junto."** 🚀

**Feito com ❤️ pela comunidade Orbitamos**

</div>
