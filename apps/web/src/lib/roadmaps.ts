/**
 * Roadmaps de carreira para a OrbitAcademy.
 *
 * Cada roadmap lista skills obrigatorias para nivel junior em 2026/27,
 * agrupadas por categoria. Skills podem ser vinculadas a cursos existentes
 * (pelo slug) para que o progresso seja rastreado automaticamente.
 */

export type RoadmapSkill = {
  id: string;
  label: string;
  /** Slug do curso da OrbitAcademy que cobre essa skill (opcional) */
  courseSlug?: string;
  /** Descricao curta exibida ao expandir */
  hint?: string;
};

export type RoadmapCategory = {
  id: string;
  title: string;
  skills: RoadmapSkill[];
};

export type CareerRoadmap = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string; // tailwind gradient
  accent: string; // tailwind text color
  border: string; // tailwind border color
  estimatedMonths: string;
  categories: RoadmapCategory[];
};

export const roadmaps: CareerRoadmap[] = [
  // ── Frontend Developer ──────────────────────────────────────────
  {
    id: "frontend",
    slug: "frontend",
    title: "Desenvolvedor Frontend",
    subtitle: "Crie interfaces modernas com HTML, CSS, JS e React.",
    icon: "🖥️",
    color: "from-cyan-500/20 to-blue-900/40",
    accent: "text-cyan-300",
    border: "border-cyan-400/20",
    estimatedMonths: "6-8 meses",
    categories: [
      {
        id: "fe-fundamentos",
        title: "Fundamentos Web",
        skills: [
          { id: "fe-html", label: "HTML5 semantico e acessibilidade", courseSlug: "html-css-js", hint: "Tags semanticas, ARIA, formularios acessiveis." },
          { id: "fe-css", label: "CSS3: Flexbox, Grid e responsivo", courseSlug: "html-css-js", hint: "Layout moderno, media queries, custom properties." },
          { id: "fe-js", label: "JavaScript moderno (ES6+)", courseSlug: "html-css-js", hint: "Arrow functions, destructuring, async/await, fetch." },
          { id: "fe-dom", label: "Manipulacao do DOM e eventos", hint: "querySelector, addEventListener, delegacao de eventos." },
        ],
      },
      {
        id: "fe-framework",
        title: "Framework & TypeScript",
        skills: [
          { id: "fe-ts", label: "TypeScript basico", hint: "Tipos, interfaces, generics, type narrowing." },
          { id: "fe-react", label: "React (componentes, hooks, estado)", hint: "useState, useEffect, props, composicao de componentes." },
          { id: "fe-routing", label: "Roteamento e navegacao (React Router ou Next.js)", hint: "Paginas dinamicas, parametros de rota, layouts." },
          { id: "fe-forms", label: "Formularios e validacao", hint: "Controlled inputs, bibliotecas como React Hook Form ou Zod." },
        ],
      },
      {
        id: "fe-producao",
        title: "Habilidades de Producao",
        skills: [
          { id: "fe-git", label: "Git e GitHub", courseSlug: "github-colaborativo", hint: "Branches, commits, pull requests, resolucao de conflitos." },
          { id: "fe-api", label: "Consumo de APIs REST", hint: "fetch/axios, tratamento de erros, loading states." },
          { id: "fe-test", label: "Testes basicos (Jest ou Vitest)", hint: "Testes unitarios de componentes e funcoes." },
          { id: "fe-perf", label: "Performance e Lighthouse", hint: "Lazy loading, otimizacao de imagens, Core Web Vitals." },
          { id: "fe-deploy", label: "Deploy (Vercel ou Netlify)", hint: "CI/CD basico, variaveis de ambiente, dominio." },
        ],
      },
      {
        id: "fe-portfolio",
        title: "Portfolio & Mercado",
        skills: [
          { id: "fe-proj1", label: "Projeto: landing page responsiva", hint: "HTML/CSS puro, demonstra dominio de layout." },
          { id: "fe-proj2", label: "Projeto: app com API e estado", hint: "React + API externa, loading/error states." },
          { id: "fe-proj3", label: "Projeto: dashboard ou CRUD completo", hint: "Autenticacao, rotas protegidas, formularios." },
          { id: "fe-linkedin", label: "LinkedIn e GitHub otimizados", hint: "Bio, projetos pinados, contribuicoes visiveis." },
        ],
      },
    ],
  },

  // ── Backend C# / .NET ───────────────────────────────────────────
  {
    id: "backend-csharp",
    slug: "backend-csharp",
    title: "Desenvolvedor Backend C#",
    subtitle: "APIs robustas com ASP.NET Core e SQL Server.",
    icon: "⚙️",
    color: "from-violet-500/20 to-purple-900/40",
    accent: "text-violet-300",
    border: "border-violet-400/20",
    estimatedMonths: "6-12 meses",
    categories: [
      {
        id: "cs-fundamentos",
        title: "Fundamentos C#",
        skills: [
          { id: "cs-sintaxe", label: "Sintaxe C# e tipos de dados", courseSlug: "csharp-fundamentos", hint: "Variaveis, operadores, controle de fluxo." },
          { id: "cs-oop", label: "Orientacao a objetos", courseSlug: "csharp-fundamentos", hint: "Classes, heranca, polimorfismo, interfaces." },
          { id: "cs-collections", label: "Collections e LINQ", hint: "List, Dictionary, Where, Select, OrderBy." },
          { id: "cs-async", label: "Programacao assincrona (async/await)", hint: "Tasks, CancellationToken, paralelismo basico." },
        ],
      },
      {
        id: "cs-web",
        title: "ASP.NET Core & APIs",
        skills: [
          { id: "cs-aspnet", label: "ASP.NET Core Web API", hint: "Controllers, rotas, middleware, dependency injection." },
          { id: "cs-auth", label: "Autenticacao e autorizacao (JWT)", hint: "Identity, Bearer tokens, claims, policies." },
          { id: "cs-efcore", label: "Entity Framework Core", hint: "DbContext, migrations, queries, relacionamentos." },
          { id: "cs-validation", label: "Validacao e tratamento de erros", hint: "Data annotations, FluentValidation, ProblemDetails." },
        ],
      },
      {
        id: "cs-infra",
        title: "Banco de Dados & Infra",
        skills: [
          { id: "cs-sql", label: "SQL Server / PostgreSQL", courseSlug: "sql-na-pratica", hint: "CRUD, joins, indices, stored procedures." },
          { id: "cs-docker", label: "Docker basico", hint: "Dockerfile, docker-compose, containers." },
          { id: "cs-git", label: "Git e GitHub", courseSlug: "github-colaborativo", hint: "Branching, PRs, code review." },
          { id: "cs-test", label: "Testes unitarios (xUnit)", hint: "Arrange-Act-Assert, mocks, coverage basica." },
        ],
      },
      {
        id: "cs-portfolio",
        title: "Portfolio & Mercado",
        skills: [
          { id: "cs-proj1", label: "Projeto: API REST completa", hint: "CRUD com autenticacao, validacao, banco de dados." },
          { id: "cs-proj2", label: "Projeto: sistema com background jobs", hint: "Hangfire ou hosted services para tarefas agendadas." },
          { id: "cs-clean", label: "Clean Code e Design Patterns basicos", hint: "Repository, SOLID, nomeacao, separacao de responsabilidades." },
          { id: "cs-linkedin", label: "LinkedIn e GitHub otimizados", hint: "Projetos .NET no perfil, contribuicoes." },
        ],
      },
    ],
  },

  // ── Backend Python ──────────────────────────────────────────────
  {
    id: "backend-python",
    slug: "backend-python",
    title: "Desenvolvedor Backend Python",
    subtitle: "APIs e automacoes com Django, Flask ou FastAPI.",
    icon: "🐍",
    color: "from-emerald-500/20 to-teal-900/40",
    accent: "text-emerald-300",
    border: "border-emerald-400/20",
    estimatedMonths: "6-8 meses",
    categories: [
      {
        id: "py-fundamentos",
        title: "Fundamentos Python",
        skills: [
          { id: "py-sintaxe", label: "Sintaxe Python e tipos de dados", courseSlug: "logica-programacao-python", hint: "Variaveis, listas, dicionarios, controle de fluxo." },
          { id: "py-funcoes", label: "Funcoes e modulos", courseSlug: "logica-programacao-python", hint: "Parametros, retorno, imports, organizacao de codigo." },
          { id: "py-oop", label: "Orientacao a objetos em Python", hint: "Classes, heranca, metodos especiais, dataclasses." },
          { id: "py-venv", label: "Ambientes virtuais e pip", hint: "venv, requirements.txt, gerenciamento de dependencias." },
        ],
      },
      {
        id: "py-web",
        title: "Framework Web & APIs",
        skills: [
          { id: "py-framework", label: "Django ou FastAPI (escolha um)", hint: "Rotas, views, serializers, ORM." },
          { id: "py-rest", label: "APIs RESTful", hint: "Endpoints, status codes, paginacao, filtros." },
          { id: "py-auth", label: "Autenticacao (JWT ou sessions)", hint: "Login, registro, protecao de rotas." },
          { id: "py-orm", label: "ORM e migrations (Django ORM ou SQLAlchemy)", hint: "Models, relacionamentos, queries, migrations." },
        ],
      },
      {
        id: "py-infra",
        title: "Banco de Dados & Infra",
        skills: [
          { id: "py-sql", label: "PostgreSQL basico", courseSlug: "sql-na-pratica", hint: "CRUD, joins, indices, queries otimizadas." },
          { id: "py-docker", label: "Docker basico", hint: "Dockerfile, docker-compose para dev local." },
          { id: "py-git", label: "Git e GitHub", courseSlug: "github-colaborativo", hint: "Branching, PRs, colaboracao." },
          { id: "py-test", label: "Testes (pytest)", hint: "Fixtures, mocks, cobertura de codigo." },
          { id: "py-deploy", label: "Deploy (Railway, Render ou AWS)", hint: "CI/CD basico, variaveis de ambiente." },
        ],
      },
      {
        id: "py-portfolio",
        title: "Portfolio & Mercado",
        skills: [
          { id: "py-proj1", label: "Projeto: API REST com banco de dados", hint: "CRUD completo, autenticacao, testes." },
          { id: "py-proj2", label: "Projeto: automacao ou scraping", hint: "Script que resolve um problema real." },
          { id: "py-clean", label: "PEP 8 e boas praticas", hint: "Linters, formatadores, type hints." },
          { id: "py-linkedin", label: "LinkedIn e GitHub otimizados", hint: "Projetos Python no perfil." },
        ],
      },
    ],
  },

  // ── Analista de Dados ───────────────────────────────────────────
  {
    id: "analista-dados",
    slug: "analista-dados",
    title: "Analista de Dados",
    subtitle: "Transforme dados em decisoes com Excel, SQL e Power BI.",
    icon: "📊",
    color: "from-amber-500/20 to-orange-900/40",
    accent: "text-amber-300",
    border: "border-amber-400/20",
    estimatedMonths: "4-6 meses",
    categories: [
      {
        id: "da-fundamentos",
        title: "Fundamentos & Excel",
        skills: [
          { id: "da-excel", label: "Excel avancado (PROCV, tabelas dinamicas)", courseSlug: "excel-procv", hint: "Formulas, pivot tables, graficos, formatacao condicional." },
          { id: "da-vba", label: "VBA para automacao", courseSlug: "vba-excel", hint: "Macros, loops, automacao de planilhas." },
          { id: "da-logica", label: "Logica e pensamento analitico", courseSlug: "logica-programacao-python", hint: "Decompor problemas, interpretar dados, tirar conclusoes." },
          { id: "da-stats", label: "Estatistica basica", hint: "Media, mediana, desvio padrao, correlacao, distribuicoes." },
        ],
      },
      {
        id: "da-sql",
        title: "SQL & Banco de Dados",
        skills: [
          { id: "da-sql-basico", label: "SQL: SELECT, WHERE, GROUP BY", courseSlug: "sql-na-pratica", hint: "Consultas basicas, filtros, agregacoes." },
          { id: "da-sql-joins", label: "SQL: JOINs e subqueries", courseSlug: "sql-na-pratica", hint: "Combinar tabelas, CTEs, window functions." },
          { id: "da-modelagem", label: "Modelagem de dados basica", hint: "Tabelas, relacionamentos, normalizacao." },
        ],
      },
      {
        id: "da-bi",
        title: "Visualizacao & BI",
        skills: [
          { id: "da-powerbi", label: "Power BI: dashboards e DAX basico", courseSlug: "power-bi", hint: "Importar dados, criar visuais, SUM, COUNT, CALCULATE." },
          { id: "da-storytelling", label: "Data storytelling", hint: "Apresentar insights de forma clara e acionavel." },
          { id: "da-python", label: "Python com Pandas (diferencial)", courseSlug: "logica-programacao-python", hint: "Leitura de CSVs, limpeza, analise exploratoria." },
        ],
      },
      {
        id: "da-portfolio",
        title: "Portfolio & Mercado",
        skills: [
          { id: "da-proj1", label: "Projeto: dashboard de vendas no Power BI", hint: "Dados reais ou simulados, filtros interativos." },
          { id: "da-proj2", label: "Projeto: analise exploratoria com SQL", hint: "Queries que respondem perguntas de negocio." },
          { id: "da-proj3", label: "Projeto: relatorio automatizado com Excel/VBA", hint: "Automacao de relatorio recorrente." },
          { id: "da-linkedin", label: "LinkedIn e portfolio de dados", hint: "Projetos publicados, certificacoes visiveis." },
        ],
      },
    ],
  },

  // ── Fullstack Developer ─────────────────────────────────────────
  {
    id: "fullstack",
    slug: "fullstack",
    title: "Desenvolvedor Fullstack",
    subtitle: "Do front ao back: apps completos com JS/TS.",
    icon: "🚀",
    color: "from-rose-500/20 to-pink-900/40",
    accent: "text-rose-300",
    border: "border-rose-400/20",
    estimatedMonths: "8-12 meses",
    categories: [
      {
        id: "fs-front",
        title: "Frontend",
        skills: [
          { id: "fs-html", label: "HTML5, CSS3 e JavaScript", courseSlug: "html-css-js", hint: "Base solida de web antes de frameworks." },
          { id: "fs-ts", label: "TypeScript", hint: "Tipos, interfaces, narrowing, generics." },
          { id: "fs-react", label: "React ou Next.js", hint: "Componentes, hooks, SSR/SSG, rotas." },
          { id: "fs-responsive", label: "Design responsivo e Tailwind CSS", hint: "Mobile-first, utility classes, dark mode." },
        ],
      },
      {
        id: "fs-back",
        title: "Backend",
        skills: [
          { id: "fs-node", label: "Node.js e Express (ou Next.js API Routes)", hint: "Rotas, middleware, autenticacao." },
          { id: "fs-auth", label: "Autenticacao e autorizacao", hint: "JWT, OAuth, sessions, protecao de rotas." },
          { id: "fs-db", label: "Banco de dados (PostgreSQL)", courseSlug: "sql-na-pratica", hint: "SQL, ORM (Prisma ou Drizzle), migrations." },
          { id: "fs-api", label: "Design de APIs REST", hint: "Versionamento, status codes, paginacao, erros." },
        ],
      },
      {
        id: "fs-devops",
        title: "DevOps & Deploy",
        skills: [
          { id: "fs-git", label: "Git e GitHub", courseSlug: "github-colaborativo", hint: "Branches, PRs, CI/CD com GitHub Actions." },
          { id: "fs-docker", label: "Docker basico", hint: "Containerizar app para dev e producao." },
          { id: "fs-deploy", label: "Deploy (Vercel, Railway ou AWS)", hint: "Ambientes, dominios, HTTPS, monitoramento." },
          { id: "fs-env", label: "Variaveis de ambiente e seguranca", hint: "Secrets, .env, OWASP top 10 basico." },
        ],
      },
      {
        id: "fs-portfolio",
        title: "Portfolio & Mercado",
        skills: [
          { id: "fs-proj1", label: "Projeto: SaaS ou app completo", hint: "Auth, CRUD, deploy, banco de dados." },
          { id: "fs-proj2", label: "Projeto: API + frontend consumindo", hint: "Separacao front/back, documentacao." },
          { id: "fs-test", label: "Testes end-to-end basicos", hint: "Playwright ou Cypress para fluxos criticos." },
          { id: "fs-linkedin", label: "LinkedIn e GitHub otimizados", hint: "Projetos fullstack pinados, contribuicoes." },
        ],
      },
    ],
  },

  // ── Suporte / Tecnico de TI ─────────────────────────────────────
  {
    id: "suporte-ti",
    slug: "suporte-ti",
    title: "Tecnico de Suporte / TI",
    subtitle: "Hardware, redes e suporte ao usuario final.",
    icon: "🛠️",
    color: "from-sky-500/20 to-indigo-900/40",
    accent: "text-sky-300",
    border: "border-sky-400/20",
    estimatedMonths: "3-6 meses",
    categories: [
      {
        id: "ti-hardware",
        title: "Hardware & SO",
        skills: [
          { id: "ti-montagem", label: "Montagem e manutencao de PCs", courseSlug: "montagem-manutencao", hint: "Componentes, compatibilidade, troubleshooting." },
          { id: "ti-windows", label: "Windows: instalacao e configuracao", courseSlug: "montagem-manutencao", hint: "Particoes, drivers, politicas de grupo." },
          { id: "ti-linux", label: "Linux basico (terminal)", hint: "Comandos essenciais, permissoes, servicos." },
          { id: "ti-periferico", label: "Perifericos e impressoras", hint: "Instalacao, drivers, troubleshooting." },
        ],
      },
      {
        id: "ti-redes",
        title: "Redes & Conectividade",
        skills: [
          { id: "ti-tcp", label: "TCP/IP, DNS e DHCP", hint: "Como a internet funciona, resolucao de nomes." },
          { id: "ti-wifi", label: "Wi-Fi e redes locais", hint: "Configuracao de roteadores, seguranca wireless." },
          { id: "ti-cabeamento", label: "Cabeamento e infraestrutura", hint: "Tipos de cabo, patch panels, racks." },
          { id: "ti-firewall", label: "Firewall e seguranca basica", hint: "Regras, portas, antivirus, boas praticas." },
        ],
      },
      {
        id: "ti-suporte",
        title: "Atendimento & Ferramentas",
        skills: [
          { id: "ti-helpdesk", label: "Help desk e sistema de tickets", hint: "Priorizacao, SLA, registro de chamados." },
          { id: "ti-remote", label: "Acesso remoto e ferramentas", hint: "TeamViewer, AnyDesk, RDP, SSH." },
          { id: "ti-backup", label: "Backup e recuperacao", hint: "Estrategias 3-2-1, restauracao, cloud backup." },
          { id: "ti-office", label: "Pacote Office e Google Workspace", courseSlug: "excel-procv", hint: "Suporte a usuarios em ferramentas do dia a dia." },
        ],
      },
      {
        id: "ti-portfolio",
        title: "Certificacoes & Mercado",
        skills: [
          { id: "ti-comptia", label: "CompTIA A+ (ou equivalente)", hint: "Certificacao padrao para suporte nivel 1." },
          { id: "ti-network", label: "CompTIA Network+ (diferencial)", hint: "Redes, protocolos, troubleshooting de rede." },
          { id: "ti-lab", label: "Lab caseiro documentado", hint: "Montar setup de testes, documentar resolucoes." },
          { id: "ti-linkedin", label: "LinkedIn e certificacoes visiveis", hint: "Perfil profissional, experiencia pratica." },
        ],
      },
    ],
  },
];

export function getRoadmapBySlug(slug: string): CareerRoadmap | undefined {
  return roadmaps.find((r) => r.slug === slug);
}

export function getTotalSkills(roadmap: CareerRoadmap): number {
  return roadmap.categories.reduce((sum, cat) => sum + cat.skills.length, 0);
}
