# 🏗️ Arquitetura da Orbitamos

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORBITAMOS ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   FRONTEND      │    │    BACKEND      │    │   DATABASE   │ │
│  │                 │    │                 │    │              │ │
│  │  Next.js 14     │◄──►│  Spring Boot 3  │◄──►│  PostgreSQL  │ │
│  │  React 18       │    │  Java 21        │    │  Database    │ │
│  │  TailwindCSS    │    │  Spring Security│   │              │ │
│  │  shadcn/ui      │    │  Spring Data JPA│   │              │ │
│  │                 │    │                 │    │              │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                            │
│           │                       │                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   DEPLOYMENT    │    │   MONITORING    │    │   CI/CD      │ │
│  │                 │    │                 │    │              │ │
│  │  Vercel         │    │  Swagger/OpenAPI│   │  GitHub      │ │
│  │  (Frontend)     │    │  Health Checks  │   │  Actions     │ │
│  │  Render/Fly.io  │    │  Logs           │   │  Docker      │ │
│  │  (Backend)      │    │                 │   │  Builds      │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

```
User Request
     │
     ▼
┌─────────────┐
│   Vercel    │  ← CDN + Edge Functions
│  (Frontend) │
└─────────────┘
     │
     ▼
┌─────────────┐
│   Render    │  ← Load Balancer + Auto-scaling
│  (Backend)  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ PostgreSQL │  ← Connection Pooling + Replication
│ (Database) │
└─────────────┘
```

## Estrutura de Pastas Detalhada

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
│   │   │   │   ├── 📁 comunidade/    # Comunidade - "Orbiters em Ação"
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
│   ├── 📄 CONTRIBUTING.md             # Guia de contribuição
│   └── 📄 ARCHITECTURE.md             # Este arquivo
├── 📄 docker-compose.yml              # Orquestração local
├── 📄 .github/                        # GitHub Actions
│   └── 📁 workflows/
│       ├── 📄 frontend.yml            # CI/CD Frontend
│       ├── 📄 backend.yml             # CI/CD Backend
│       └── 📄 deploy.yml               # Deploy produção
└── 📄 README.md                       # README principal
```

## Tecnologias e Dependências

### Frontend (Next.js)
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "18.0.0",
    "react-dom": "18.0.0",
    "typescript": "5.0.0",
    "tailwindcss": "3.4.0",
    "@radix-ui/react-*": "1.0.0",
    "class-variance-authority": "0.7.0",
    "clsx": "2.0.0",
    "tailwind-merge": "2.0.0"
  }
}
```

### Backend (Spring Boot)
```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
  </dependency>
</dependencies>
```

## Padrões de Desenvolvimento

### Frontend
- **Componentes**: Funcionais com hooks
- **Styling**: TailwindCSS + CSS Modules
- **Estado**: React Context + useState
- **Roteamento**: Next.js App Router
- **TypeScript**: Strict mode habilitado

### Backend
- **Arquitetura**: MVC (Model-View-Controller)
- **Injeção**: Spring IoC Container
- **Segurança**: Spring Security + JWT
- **Persistência**: JPA/Hibernate
- **API**: RESTful com OpenAPI/Swagger

### DevOps
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoramento**: Health checks + logs
- **Deploy**: Blue-green deployment
- **Backup**: Automated database backups

## Segurança

### Frontend
- **HTTPS**: Forçado em produção
- **CSP**: Content Security Policy
- **XSS**: Proteção contra cross-site scripting
- **CSRF**: Tokens de proteção

### Backend
- **Autenticação**: JWT tokens
- **Autorização**: Role-based access
- **Validação**: Input sanitization
- **Rate Limiting**: Proteção contra abuse
- **CORS**: Configurado para domínios específicos

## Performance

### Frontend
- **SSR**: Server-side rendering
- **SSG**: Static site generation
- **CDN**: Vercel Edge Network
- **Lazy Loading**: Componentes sob demanda
- **Bundle**: Otimização automática

### Backend
- **Caching**: Redis para sessões
- **Connection Pool**: HikariCP
- **Compression**: Gzip habilitado
- **Monitoring**: Micrometer + Actuator
- **Database**: Índices otimizados

## Escalabilidade

### Horizontal
- **Load Balancer**: Distribuição de carga
- **Auto-scaling**: Baseado em métricas
- **Database**: Read replicas
- **CDN**: Cache distribuído

### Vertical
- **Resources**: CPU/Memory otimizados
- **Database**: Connection pooling
- **Monitoring**: Alertas proativos
- **Backup**: Estratégia de recuperação

## Monitoramento

### Métricas
- **Performance**: Response time, throughput
- **Errors**: 4xx, 5xx status codes
- **Availability**: Uptime, health checks
- **Business**: User registrations, conversions

### Alertas
- **Critical**: Service down, high error rate
- **Warning**: High latency, resource usage
- **Info**: Deployments, configuration changes

## Backup e Recuperação

### Estratégia
- **Database**: Daily automated backups
- **Files**: Version control + CDN
- **Configuration**: Infrastructure as Code
- **Recovery**: Point-in-time recovery

### RTO/RPO
- **RTO**: 1 hour (Recovery Time Objective)
- **RPO**: 15 minutes (Recovery Point Objective)
- **Testing**: Monthly disaster recovery drills
