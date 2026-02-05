# 🚀 Orbitamos - Portal da Quebrada que Orbita Tecnologia

<div align="center">

![Orbitamos Logo](https://img.shields.io/badge/ORBITAMOS-Portal%20da%20Quebrada-blue?style=for-the-badge&logo=rocket&logoColor=white)

**"Da quebrada pra tecnologia — A gente sobe junto."**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-green?style=flat-square&logo=spring)](https://spring.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=flat-square&logo=docker)](https://www.docker.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](CONTRIBUTING.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

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

## 📊 **Números que Impressionam**

<div align="center">

| Métrica | Resultado |
|---------|-----------|
| 🚀 **Pessoas Transformadas** | 01+ |
| 📈 **Taxa de Sucesso** | 100% |
| ⏱️ **Tempo Médio** | 9 meses |
| 💰 **Salário Médio** | R$ 1.500+ |
| 🏢 **Empresas Parceiras** | 0+ |
| 🌍 **Cidades Atendidas** | 01 |

</div>

---

## 🏗️ **Arquitetura do Projeto**

### 📁 **Estrutura Detalhada do Monorepo**

```
orbitamos/
├── 📁 apps/                          # Aplicações principais
│   ├── 📁 web/                       # Frontend Next.js 14
│   │   ├── 📁 src/
│   │   │   ├── 📁 app/               # App Router (Next.js 14)
│   │   │   │   ├── 📄 page.tsx       # Home - "O Movimento"
│   │   │   │   ├── 📁 sobre/         # Sobre - "Nosso Propósito"
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 mentorias/     # Mentorias - "Do Subemprego à T.I."
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 orbitacademy/  # OrbitAcademy - Cursos e Conteúdos
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 blog/          # Blog - "Diário da Órbita"
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 contato/       # Contato - "Entre em Órbita"
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 layout.tsx     # Layout principal com navegação
│   │   │   │   └── 📄 globals.css    # Estilos globais + paleta Orbitamos
│   │   │   ├── 📁 components/        # Componentes reutilizáveis
│   │   │   │   ├── 📁 ui/            # shadcn/ui components
│   │   │   │   │   ├── 📄 button.tsx
│   │   │   │   │   ├── 📄 card.tsx
│   │   │   │   │   ├── 📄 input.tsx
│   │   │   │   │   └── 📄 textarea.tsx
│   │   │   │   └── 📄 Navigation.tsx # Navegação principal
│   │   │   └── 📁 lib/               # Utilitários
│   │   │       └── 📄 utils.ts       # Funções auxiliares
│   │   ├── 📄 tailwind.config.js     # Configuração Tailwind + paleta Orbitamos
│   │   ├── 📄 components.json        # Configuração shadcn/ui
│   │   ├── 📄 package.json           # Dependências frontend
│   │   ├── 📄 Dockerfile             # Container frontend
│   │   └── 📄 README.md              # Docs frontend
│   └── 📁 api/                       # Backend Spring Boot 3
│       ├── 📁 src/
│       │   ├── 📁 main/
│       │   │   ├── 📁 java/com/orbitamos/api/
│       │   │   │   ├── 📄 OrbitamosApiApplication.java  # App principal
│       │   │   │   └── 📁 controller/                   # Controllers REST
│       │   │   │       ├── 📄 HealthController.java     # GET /api/health
│       │   │   │       ├── 📄 MentorshipController.java # GET /api/mentorships
│       │   │   │       └── 📄 ContactController.java    # POST /api/contact
│       │   │   └── 📁 resources/
│       │   │       └── 📄 application.yml                # Configurações
│       │   └── 📁 test/                                 # Testes
│       ├── 📄 pom.xml                                   # Dependências Maven
│       ├── 📄 Dockerfile                               # Container backend
│       └── 📄 README.md                                # Docs backend
├── 📁 docs/                           # Documentação
│   ├── 📄 API.md                      # Documentação da API
│   ├── 📄 DEPLOYMENT.md               # Guia de deploy
│   └── 📄 CONTRIBUTING.md             # Guia de contribuição
├── 📄 docker-compose.yml              # Orquestração local
├── 📄 .github/                        # GitHub Actions
│   └── 📁 workflows/
│       ├── 📄 frontend.yml            # CI/CD Frontend
│       ├── 📄 backend.yml             # CI/CD Backend
│       └── 📄 deploy.yml               # Deploy produção
└── 📄 README.md                       # Este arquivo
```

### 🎨 **Design System Orbitamos**

```css
/* Paleta de Cores */
:root {
  --orbit-black: #000000;      /* Preto espacial */
  --orbit-electric: #00D4FF;   /* Azul elétrico */
  --orbit-white: #FFFFFF;      /* Branco */
  --orbit-purple: #8B5CF6;     /* Roxo suave */
}

/* Gradientes */
.gradient-orbit {
  background: linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%);
}

/* Animações */
.animate-orbit {
  animation: orbit 3s linear infinite;
}
```

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
- **Banco**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **Deploy**: Render/Fly.io

### **Infraestrutura**
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoramento**: Swagger/OpenAPI
- **Proxy**: Nginx

---

## 🎯 **Funcionalidades Implementadas**

### 📱 **Frontend (4 Páginas MVP)**

#### 🏠 **Home - "O Movimento"**
- Hero section com manifesto da Orbitamos
- Features principais (Foco Real, Resultado Rápido, Comunidade Forte)
- Estatísticas de impacto (500+ pessoas transformadas)
- CTAs principais (Entrar pra Comunidade, Ver Mentorias, Doar Impacto)

#### 📖 **Sobre - "Nosso Propósito"**
- História da Orbitamos
- Missão, Visão e Valores
- Linha do tempo do futuro (2025 → 2030)
- Apresentação do time

#### 🎓 **Mentorias - "Do Subemprego à T.I."**
- 3 programas detalhados:
  - **Mentoria Tech 9 Meses** (Gratuito, 50 vagas)
  - **Programa Quebrada Dev** (Gratuito, 30 vagas)
  - **Orbitamos Academy** (Acessível, 20 vagas)
- Metodologia de ensino
- Depoimentos de transformação

#### 📞 **Contato - "Entre em Órbita"**
- Formulário de contato funcional com EmailJS
- Envio real de emails para contato@orbitamos.com
- Estados visuais (loading, success, error)
- Informações de contato direto
- Seção para parcerias empresariais
- FAQ com perguntas frequentes

### 🔧 **Backend (6 Endpoints)**

#### 🏥 **Health Check**
```http
GET /api/health
```
```json
{
  "status": "UP",
  "timestamp": "2025-01-06T22:30:00",
  "message": "Orbitamos API está funcionando! 🚀",
  "version": "1.0.0"
}
```

#### 🎓 **Mentorias**
```http
GET /api/mentorships
```
Retorna lista completa dos programas de mentoria com:
- Nome, descrição, duração
- Nível, preço, vagas disponíveis
- Conteúdo programático

#### 📧 **Contato**
```http
POST /api/contact
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "message": "Quero participar do programa!"
}
```

#### 🔐 **Autenticação**
```http
POST /api/auth/register
POST /api/auth/login
```
Sistema completo de autenticação com JWT para cadastro e login de usuários.

#### 👤 **Dashboard (Protegido)**
```http
GET /api/dashboard/me
Authorization: Bearer <token>
```
Endpoint protegido para área do aluno.

---

## ☁️ **Produção (sem sua máquina ligada)**

Com o backend no **Render**, o banco no **Supabase** e o front na **Vercel**, o projeto roda 100% na nuvem. **Não é preciso deixar seu PC ligado** — tudo funciona nos servidores de cada serviço. O Render usa o Dockerfile apenas para build/deploy do backend; você não precisa ter Docker instalado para o site estar no ar.

---

## 🛠️ **Como Executar Localmente**

### **Pré-requisitos**
- Node.js 18+
- Java 21+
- Maven 3.6+
- (Opcional) Docker e Docker Compose — só se quiser subir backend/front em containers

### **Opção 1: Docker Compose (opcional)**

```bash
# Clone o repositório
git clone https://github.com/ViniciusVivet/orbitamos.git
cd orbitamos

# Execute tudo com Docker
docker-compose up --build

# Acesse:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
```

### **Opção 2: Desenvolvimento Manual**

#### **Backend (API)**
```bash
cd apps/api
mvn spring-boot:run
# API rodando em http://localhost:8080
```

#### **Frontend (Web)**
```bash
cd apps/web

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves do EmailJS

npm install
npm run dev
# Site rodando em http://localhost:3000
```

---

## 📚 **Para Alunos da Orbitamos**

### 🎓 **Estrutura de Estudos**

O site da Orbitamos foi desenvolvido como uma **plataforma de aprendizado** para nossos alunos. Aqui você encontrará:

#### 📖 **Conteúdo Educativo**
- **Blog "Diário da Órbita"**: Artigos sobre tecnologia, carreira e mindset
- **Tutoriais Práticos**: Guias passo-a-passo para desenvolvimento
- **Cases de Sucesso**: Histórias reais de transformação
- **Recursos Gratuitos**: Templates, códigos e ferramentas

#### 🛠️ **Projetos Práticos**
- **Clone do Site**: Use este repositório como base para seus projetos
- **Componentes Reutilizáveis**: Biblioteca de componentes React
- **API REST**: Exemplo completo de backend Spring Boot
- **Deploy em Produção**: Aprenda a colocar projetos no ar

#### 🚀 **Trilha de Aprendizado**
1. **Iniciante**: Clone o projeto e explore a estrutura
2. **Intermediário**: Modifique componentes e adicione funcionalidades
3. **Avançado**: Implemente novas features e otimize performance
4. **Expert**: Contribua com o projeto open source

---

## 🤝 **Contribuindo**

### **Como Contribuir**

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### **Padrões de Código**

- **Frontend**: ESLint + Prettier
- **Backend**: Checkstyle + SpotBugs
- **Commits**: Conventional Commits
- **Branches**: GitFlow

### **Áreas para Contribuição**

- 🐛 **Bug Fixes**: Corrigir problemas existentes
- ✨ **Features**: Adicionar novas funcionalidades
- 📚 **Docs**: Melhorar documentação
- 🎨 **UI/UX**: Aprimorar design e experiência
- 🧪 **Tests**: Adicionar testes automatizados
- 🚀 **Performance**: Otimizar velocidade e recursos

---

## 📈 **Roadmap Futuro**

### **Versão 2.0 (Q2 2025)**
- [ ] Área de login para alunos e mentores
- [ ] Painel da comunidade com certificados
- [ ] Dashboard público de impacto
- [ ] Sistema de mentoria peer-to-peer

### **Versão 3.0 (Q4 2025)**
- [ ] Orbitamos Academy (cursos pagos)
- [ ] Marketplace de projetos
- [ ] Sistema de gamificação
- [ ] Integração com redes sociais

### **Versão 4.0 (2026)**
- [ ] IA para mentoria personalizada
- [ ] Realidade virtual para simulações
- [ ] Blockchain para certificados
- [ ] Expansão internacional

---

## 👨‍💻 **Sobre o Criador**

<div align="center">

### **Douglas Vinicius Alves da Silva**

[![GitHub](https://img.shields.io/badge/GitHub-ViniciusVivet-black?style=flat-square&logo=github)](https://github.com/ViniciusVivet)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vivetsp-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/vivetsp)
[![Email](https://img.shields.io/badge/Email-contato@orbitamos.com.br-red?style=flat-square&logo=gmail)](mailto:douglasvivet@gmail.com.br)

</div>

**Fundador e CEO da Orbitamos**

Douglas é um desenvolvedor apaixonado por tecnologia e impacto social. Nascido na periferia de São Paulo, ele entende na pele as dificuldades de quem quer entrar na área de tecnologia sem ter as ferramentas certas.

**Sua Jornada:**
- 🏠 **Origem**: Periferia de São Paulo
- 💻 **Formação**: Analise e Desenvolvimento de Sistemas 
- 🚀 **Carreira**: Com 8 meses na faculdade entrei no meu primeiro estágio como Intrutor de Informatática  
- 🎯 **Missão**: Democratizar o acesso à tecnologia
- 🌟 **Visão**: Transformar vidas através da programação

**Por que criou a Orbitamos:**
> "Sempre acreditei que a tecnologia pode transformar vidas. A Orbitamos nasceu da necessidade de criar um caminho claro para quem quer sair do subemprego e entrar na área de T.I. Não é só sobre ensinar a programar - é sobre mudança de mindset, quebra de barreiras e construção de uma nova realidade."

---

## 📊 **Métricas do Projeto**

<div align="center">

| Métrica | Valor |
|---------|-------|
| 📁 **Arquivos** | 50+ |
| 📝 **Linhas de Código** | 5.000+ |
| 🧩 **Componentes** | 15+ |
| 📱 **Páginas** | 6 |
| 🔗 **Endpoints** | 3 |
| 🐳 **Containers** | 3 |
| ⚡ **Performance** | 95+ |

</div>

---



---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 **Agradecimentos**

- **Comunidade Orbitamos**: Pelos feedbacks e sugestões
- **Mentores**: Pelo conhecimento compartilhado
- **Alunos**: Pela confiança e dedicação
- **Parceiros**: Pelo apoio e oportunidades
- **Contribuidores**: Pelo código e melhorias

---

<div align="center">

### **"Se a gente vai longe, é porque sobe junto."** 🚀

**Feito com ❤️ pela comunidade Orbitamos**

</div>