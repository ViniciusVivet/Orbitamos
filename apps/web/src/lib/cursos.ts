/**
 * Estrutura de cursos da OrbitAcademy (módulos e aulas).
 * Videos sao embeds do YouTube — ponte pelo proprio site.
 */

import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

export interface Aula {
  id: string;
  titulo: string;
  /** ID do video no YouTube (ex.: dQw4w9WgXcQ) para embed */
  youtubeVideoId: string;
  /** Texto opcional ao lado do video */
  conteudo?: string;
  materiais?: MaterialAula[];
}

export interface MaterialAula {
  id: string;
  titulo: string;
  tipo: string;
  url: string;
}

export interface Modulo {
  id: string;
  titulo: string;
  aulas: Aula[];
}

export interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descricao?: string;
  modulos: Modulo[];
}

export type CourseTrack = {
  id: string;
  titulo: string;
  descricao: string;
  icon: string;
  slugs: string[];
};

export const courseTracks: CourseTrack[] = [
  {
    id: "logica",
    titulo: "Trilha Lógica",
    descricao: "Base de raciocínio, algoritmo e primeiros passos em programação.",
    icon: "🧠",
    slugs: ["logica-programacao-python"],
  },
  {
    id: "web",
    titulo: "Trilha HTML",
    descricao: "Fundamentos de páginas, interfaces e experiencias web.",
    icon: "🧱",
    slugs: ["html-css-js"],
  },
  {
    id: "csharp",
    titulo: "Trilha C#",
    descricao: "Primeiros passos no ecossistema C# e .NET.",
    icon: "💻",
    slugs: ["csharp-fundamentos"],
  },
  {
    id: "sql",
    titulo: "Trilha SQL",
    descricao: "Banco de dados relacional, consultas e prática com dados.",
    icon: "📊",
    slugs: ["sql-na-pratica"],
  },
  {
    id: "github",
    titulo: "Trilha GitHub",
    descricao: "Versionamento, fork, pull request e colaboração.",
    icon: "😼",
    slugs: ["github-colaborativo"],
  },
  {
    id: "office",
    titulo: "Trilha Office e Dados",
    descricao: "Excel, VBA e Power BI para análise e automação.",
    icon: "📗",
    slugs: ["excel-procv", "vba-excel", "power-bi"],
  },
  {
    id: "hardware",
    titulo: "Trilha Hardware",
    descricao: "Montagem, manutenção e sistema operacional.",
    icon: "🛠️",
    slugs: ["montagem-manutencao"],
  },
];

export function getCourseTrackGroups(cursosList: Curso[]) {
  const usedSlugs = new Set<string>();
  const groups = courseTracks
    .map((track) => {
      const cursos = track.slugs
        .map((slug) => cursosList.find((curso) => curso.slug === slug))
        .filter((curso): curso is Curso => Boolean(curso));
      cursos.forEach((curso) => usedSlugs.add(curso.slug));
      return { ...track, cursos };
    })
    .filter((track) => track.cursos.length > 0);

  const extras = cursosList.filter((curso) => !usedSlugs.has(curso.slug));
  if (extras.length > 0) {
    groups.push({
      id: "outros",
      titulo: "Outras trilhas",
      descricao: "Cursos complementares da OrbitAcademy.",
      icon: "🎓",
      slugs: extras.map((curso) => curso.slug),
      cursos: extras,
    });
  }

  return groups;
}

function material(id: string, titulo: string, tipo: string, url: string): MaterialAula {
  return { id, titulo, tipo, url: normalizeMaterialUrl(url) };
}

function normalizeMaterialUrl(url: string | null | undefined): string {
  if (!url) return "";

  const trimmed = url.trim();
  if (trimmed.startsWith("/api/course-materials/")) {
    return trimmed.split("?")[0];
  }

  const publicPathMatch = trimmed.match(/\/course-materials\/(.+)$/);
  if (publicPathMatch) {
    return `/api/course-materials/${publicPathMatch[1]}`;
  }

  return trimmed;
}

/** Lista de cursos disponiveis (fallback local; em producao vem do Supabase). */
export const cursos: Curso[] = [
  {
    id: "fallback-html-css-js",
    slug: "html-css-js",
    titulo: "HTML, CSS e JavaScript",
    descricao: "Do zero ao seu primeiro site completo: estrutura, estilo, interatividade e responsividade.",
    modulos: [
      {
        id: "html-css-js-m1",
        titulo: "HTML5: Estrutura e Semântica",
        aulas: [
          {
            id: "html-css-js-a1",
            titulo: "HTML do zero",
            youtubeVideoId: "Ejkb_YpuHWs",
            conteudo: "Estrutura inicial de uma página HTML: doctype, head, body, tags básicas e como o navegador interpreta o código.",
            materiais: [material("html-css-js-mat-1", "HTML do zero", "DOCX", "/course-materials/html-css-js/04-html-do-zero-sem-css-e-sem-javascript.docx")],
          },
          {
            id: "html-css-js-a4",
            titulo: "Parágrafos, títulos, listas e links",
            youtubeVideoId: "jgQjeqGRdgA",
            conteudo: "Tags essenciais do dia a dia: h1-h6, p, ul, ol, li, a, img e como organizar conteúdo textual.",
            materiais: [material("html-css-js-mat-4", "HTML - aula 1", "DOCX", "/course-materials/html-css-js/03-html-1.docx")],
          },
          {
            id: "html-css-js-a5",
            titulo: "Formulários e inputs HTML",
            youtubeVideoId: "wwqOJ2o84S4",
            conteudo: "Elementos de formulário: input, select, textarea, button, validação nativa e tipos de campo.",
          },
          {
            id: "html-css-js-a6",
            titulo: "HTML5 semântico e acessibilidade",
            youtubeVideoId: "Afy_Hzyo0mQ",
            conteudo: "Tags semânticas (header, nav, main, section, article, footer) e boas práticas de acessibilidade.",
          },
        ],
      },
      {
        id: "html-css-js-m2",
        titulo: "CSS3: Estilo e Layout",
        aulas: [
          {
            id: "html-css-js-a7",
            titulo: "CSS do zero: seletores, cores e box model",
            youtubeVideoId: "FRhM6sMOTfg",
            conteudo: "Como o CSS funciona: seletores, propriedades, box model (margin, padding, border), unidades e cores.",
          },
          {
            id: "html-css-js-a8",
            titulo: "Flexbox na prática",
            youtubeVideoId: "qq0z-YSPJLI",
            conteudo: "Layout flexível com display flex: eixos, justify-content, align-items, flex-wrap e gap.",
          },
          {
            id: "html-css-js-a9",
            titulo: "CSS Grid Layout",
            youtubeVideoId: "8VapN6x897U",
            conteudo: "Criação de grades com grid-template-columns, grid-template-rows, grid-area e layouts complexos.",
          },
          {
            id: "html-css-js-a10",
            titulo: "Design responsivo e media queries",
            youtubeVideoId: "fKk_GFjNfJc",
            conteudo: "Mobile-first, breakpoints, media queries, unidades relativas (rem, %, vw/vh) e viewport.",
          },
        ],
      },
      {
        id: "html-css-js-m3",
        titulo: "JavaScript: Fundamentos",
        aulas: [
          {
            id: "html-css-js-a11",
            titulo: "Introdução ao JavaScript",
            youtubeVideoId: "Ptbk2af68e8",
            conteudo: "O que o JavaScript é capaz de fazer: variáveis, tipos de dados, operadores e console.",
          },
          {
            id: "html-css-js-a12",
            titulo: "Condições e estruturas de decisão",
            youtubeVideoId: "cOdG4eACN2A",
            conteudo: "if/else, switch, operadores lógicos e de comparação, truthy e falsy.",
          },
          {
            id: "html-css-js-a13",
            titulo: "Laços de repetição",
            youtubeVideoId: "NyEMfAsBKhM",
            conteudo: "for, while, do-while, for...of, for...in e quando usar cada um.",
          },
          {
            id: "html-css-js-a14",
            titulo: "Funções e escopo",
            youtubeVideoId: "mc3TKp2XzhI",
            conteudo: "Declaração de funções, parâmetros, retorno, escopo local/global e arrow functions.",
          },
        ],
      },
      {
        id: "html-css-js-m4",
        titulo: "JavaScript: DOM e Interatividade",
        aulas: [
          {
            id: "html-css-js-a15",
            titulo: "Manipulação do DOM",
            youtubeVideoId: "UftSB4DaRU4",
            conteudo: "querySelector, getElementById, createElement, innerHTML, classList e como alterar a página com JS.",
          },
          {
            id: "html-css-js-a16",
            titulo: "Eventos e interações do usuário",
            youtubeVideoId: "wWnBB-mZIvY",
            conteudo: "addEventListener, click, submit, input, delegação de eventos e prevenção de comportamento padrão.",
          },
          {
            id: "html-css-js-a17",
            titulo: "JavaScript moderno (ES6+)",
            youtubeVideoId: "BXqUH86F-kA",
            conteudo: "let/const, template literals, destructuring, spread/rest, módulos e features modernas do ECMAScript.",
          },
          {
            id: "html-css-js-a18",
            titulo: "Fetch API e consumo de APIs",
            youtubeVideoId: "NJzNc8-KqQI",
            conteudo: "fetch(), promises, async/await, consumo de APIs REST e tratamento de erros em requisições.",
          },
        ],
      },
      {
        id: "html-css-js-m5",
        titulo: "Projetos Práticos",
        aulas: [
          {
            id: "html-css-js-a2",
            titulo: "Projeto: página completa com HTML, CSS e JS",
            youtubeVideoId: "w7sIMxxVELs",
            conteudo: "Exercício guiado para aplicar estrutura, estilo e comportamento em uma página completa.",
            materiais: [material("html-css-js-mat-2", "Atividade prática HTML, CSS e JS", "DOCX", "/course-materials/html-css-js/02-html-js-e-css-atv-pratica-1.docx")],
          },
          {
            id: "html-css-js-a3",
            titulo: "Projeto: dashboard futurista",
            youtubeVideoId: "i6Oi-YtXnAU",
            conteudo: "Construção de uma interface visual elaborada para treinar composição de tela e interatividade.",
            materiais: [material("html-css-js-mat-3", "HTML Dashboard Futurista", "DOCX", "/course-materials/html-css-js/01-html-dashboard-futurista.docx")],
          },
        ],
      },
    ],
  },
  {
    id: "fallback-logica-python",
    slug: "logica-programacao-python",
    titulo: "Lógica de Programação com Python",
    descricao: "Do raciocínio lógico ao código: variáveis, condições, laços, funções e estruturas de dados com Python.",
    modulos: [
      {
        id: "logica-python-m1",
        titulo: "Primeiros Passos e Lógica",
        aulas: [
          { id: "logica-python-a0", titulo: "Introdução à lógica de programação", youtubeVideoId: "Ptbk2af68e8", conteudo: "O que é programar, como pensar em algoritmos e por que Python é uma boa linguagem para começar.", materiais: [material("logica-python-mat-0", "Lógica de programação - aula 0", "DOCX", "/course-materials/logica-programacao-python/04-logica-de-programacao-aula-0.docx")] },
          { id: "logica-python-a1", titulo: "Instalação do Python e primeiro script", youtubeVideoId: "VdLen3MV-GM", conteudo: "Instalando Python, usando o terminal, criando seu primeiro arquivo .py e rodando o hello world.", materiais: [material("logica-python-mat-1", "Apostila - lógica de programação com Python", "DOCX", "/course-materials/logica-programacao-python/01-apostila-logica-de-programacao-com-python.docx")] },
          { id: "logica-python-a5", titulo: "Variáveis, tipos de dados e operadores", youtubeVideoId: "EV7Idm_mkxo", conteudo: "int, float, str, bool, input(), print(), operadores aritméticos e de comparação." },
        ],
      },
      {
        id: "logica-python-m2",
        titulo: "Condições e Repetições",
        aulas: [
          { id: "logica-python-a2", titulo: "Estruturas condicionais (if/elif/else)", youtubeVideoId: "cOdG4eACN2A", conteudo: "Tomando decisões no código: if, elif, else, operadores lógicos (and, or, not).", materiais: [material("logica-python-mat-2", "Lógica de programação com Python", "DOCX", "/course-materials/logica-programacao-python/02-logica-de-programacao-com-python.docx")] },
          { id: "logica-python-a3", titulo: "Laços de repetição (for e while)", youtubeVideoId: "cL4YDtFnCt4", conteudo: "Repetindo ações: for com range(), while, break, continue e laços aninhados.", materiais: [material("logica-python-mat-3", "Lógica de programação - parte 2", "DOCX", "/course-materials/logica-programacao-python/03-logica-de-programacao-2.docx")] },
          { id: "logica-python-a4", titulo: "Exercícios práticos de lógica", youtubeVideoId: "2uBrqwj70TQ", conteudo: "Prática guiada: calculadora, par/ímpar, tabuada, soma de números e desafios lógicos.", materiais: [material("logica-python-mat-4", "Lógica de programação - aula 3 com Python", "DOCX", "/course-materials/logica-programacao-python/05-logica-de-programacao-aula-3-com-python.docx")] },
        ],
      },
      {
        id: "logica-python-m3",
        titulo: "Funções e Modularização",
        aulas: [
          { id: "logica-python-a6", titulo: "Funções: parâmetros, retorno e escopo", youtubeVideoId: "mc3TKp2XzhI", conteudo: "Criando funções reutilizáveis: def, parâmetros, return, escopo local e global." },
          { id: "logica-python-a7", titulo: "Módulos e imports", youtubeVideoId: "BxMtSb2w9Sk", conteudo: "Organizando código em módulos: import, from...import, módulos da biblioteca padrão (math, random, os)." },
        ],
      },
      {
        id: "logica-python-m4",
        titulo: "Estruturas de Dados",
        aulas: [
          { id: "logica-python-a8", titulo: "Listas e tuplas", youtubeVideoId: "0LB3FSfjvao", conteudo: "Coleções ordenadas: criar, acessar, fatiar, métodos (append, remove, sort) e diferença entre lista e tupla." },
          { id: "logica-python-a9", titulo: "Dicionários e conjuntos", youtubeVideoId: "ZWj8o692qGY", conteudo: "Pares chave-valor com dict, operações com sets, iteração e quando usar cada estrutura." },
          { id: "logica-python-a10", titulo: "Comprehensions e manipulação de dados", youtubeVideoId: "pTN5s-DirNE", conteudo: "List comprehension, dict comprehension, filtragem e transformação de dados de forma concisa." },
        ],
      },
      {
        id: "logica-python-m5",
        titulo: "Orientação a Objetos",
        aulas: [
          { id: "logica-python-a11", titulo: "Classes e objetos", youtubeVideoId: "RLVbB91A5-8", conteudo: "Criando suas primeiras classes: __init__, self, atributos, métodos e instanciação." },
          { id: "logica-python-a12", titulo: "Herança e polimorfismo", youtubeVideoId: "Mim6nnkdOto", conteudo: "Reutilizando código com herança, sobrescrita de métodos e polimorfismo na prática." },
        ],
      },
    ],
  },
  {
    id: "fallback-csharp",
    slug: "csharp-fundamentos",
    titulo: "C# Fundamentos",
    descricao: "Da sintaxe básica ao ASP.NET Core: tudo que um dev C# junior precisa dominar.",
    modulos: [
      {
        id: "csharp-m1",
        titulo: "Sintaxe e Primeiros Passos",
        aulas: [
          { id: "csharp-a1", titulo: "Introdução ao C# e .NET", youtubeVideoId: "2HkoGbsVY6k", conteudo: "O que é C#, o ecossistema .NET, instalação do Visual Studio / VS Code e primeiro programa.", materiais: [material("csharp-mat-1", "C# - aula 1", "DOCX", "/course-materials/csharp-fundamentos/03-c-aula-1.docx")] },
          { id: "csharp-a5", titulo: "Variáveis, tipos e operadores", youtubeVideoId: "PKMm-cHe56g", conteudo: "int, double, string, bool, var, operadores aritméticos, conversão de tipos e Console." },
          { id: "csharp-a6", titulo: "Condições e laços de repetição", youtubeVideoId: "r3XA7uSBCfY", conteudo: "if/else, switch, for, while, do-while, foreach e controle de fluxo." },
          { id: "csharp-a2", titulo: "Atividade prática: primeiros programas", youtubeVideoId: "NGUtWOnz2S8", conteudo: "Exercícios guiados para fixar sintaxe, entrada/saída e lógica básica em C#.", materiais: [material("csharp-mat-2", "C# - atividade prática 1", "DOCX", "/course-materials/csharp-fundamentos/01-c-aula-pratica-atv-1.docx")] },
        ],
      },
      {
        id: "csharp-m2",
        titulo: "Orientação a Objetos",
        aulas: [
          { id: "csharp-a7", titulo: "Classes, objetos e construtores", youtubeVideoId: "6CYGsNL7opg", conteudo: "Criando classes, atributos, métodos, construtores e instanciando objetos." },
          { id: "csharp-a8", titulo: "Herança, polimorfismo e interfaces", youtubeVideoId: "9Edx_u99ttk", conteudo: "Reutilização de código com herança, override, classes abstratas e interfaces." },
          { id: "csharp-a3", titulo: "Encapsulamento e propriedades", youtubeVideoId: "eNEZQTg7cBs", conteudo: "Properties (get/set), modificadores de acesso (public, private, protected) e boas práticas.", materiais: [material("csharp-mat-3", "Averiguar C#", "DOCX", "/course-materials/csharp-fundamentos/02-averiguar-c.docx")] },
        ],
      },
      {
        id: "csharp-m3",
        titulo: "Collections e LINQ",
        aulas: [
          { id: "csharp-a9", titulo: "List, Dictionary e arrays", youtubeVideoId: "4Mi4OuSMo4A", conteudo: "Coleções genéricas: List<T>, Dictionary<TKey,TValue>, arrays e quando usar cada uma." },
          { id: "csharp-a10", titulo: "LINQ: consultas em coleções", youtubeVideoId: "gwD9awr3NNo", conteudo: "Where, Select, OrderBy, GroupBy, First, Any, All e lambda expressions." },
        ],
      },
      {
        id: "csharp-m4",
        titulo: "ASP.NET Core e APIs",
        aulas: [
          { id: "csharp-a11", titulo: "Criando uma API REST com ASP.NET Core", youtubeVideoId: "I5ZkkG3yTwM", conteudo: "Controllers, rotas, verbos HTTP (GET, POST, PUT, DELETE), dependency injection e middleware." },
          { id: "csharp-a12", titulo: "Entity Framework Core e banco de dados", youtubeVideoId: "heJY-Q2B6Y0", conteudo: "DbContext, models, migrations, CRUD com EF Core e conexão com SQL Server / PostgreSQL." },
          { id: "csharp-a13", titulo: "API RESTful completa com EF Core", youtubeVideoId: "YHYcvSHHFkw", conteudo: "Projeto prático: API com autenticação, validação, relacionamentos e boas práticas." },
        ],
      },
      {
        id: "csharp-m5",
        titulo: "Projeto Prático",
        aulas: [
          { id: "csharp-a4", titulo: "Projeto: sistema Cinema do Bruno", youtubeVideoId: "TG62LdG6FyE", conteudo: "Projeto de nível intermediário integrando OOP, coleções e lógica de negócio.", materiais: [material("csharp-mat-4", "C# nível medio - Cinema do Bruno", "DOCX", "/course-materials/csharp-fundamentos/04-c-2-nivel-medio-cinema-do-bruno.docx")] },
        ],
      },
    ],
  },
  {
    id: "fallback-sql",
    slug: "sql-na-pratica",
    titulo: "SQL na Prática",
    descricao: "Do SELECT básico às window functions: domine banco de dados relacional na prática.",
    modulos: [
      {
        id: "sql-m1",
        titulo: "Fundamentos SQL",
        aulas: [
          { id: "sql-a1", titulo: "Introdução ao SQL e bancos de dados", youtubeVideoId: "6M-jFECiHog", conteudo: "O que é SQL, bancos relacionais, tabelas, colunas, tipos de dados e como configurar o ambiente.", materiais: [material("sql-mat-1", "Introdução ao SQL - banco de dados na prática", "DOCX", "/course-materials/sql-na-pratica/02-introducao-ao-sql-banco-de-dados-na-pratica.docx")] },
          { id: "sql-a3", titulo: "SELECT, WHERE e ORDER BY", youtubeVideoId: "KOhd3R5kLks", conteudo: "Consultando dados: SELECT, filtros com WHERE, ordenação, LIKE, BETWEEN, IN e operadores." },
          { id: "sql-a4", titulo: "INSERT, UPDATE e DELETE", youtubeVideoId: "G7bMwefn8RQ", conteudo: "Manipulação de dados: inserir registros, atualizar campos e deletar linhas com segurança." },
        ],
      },
      {
        id: "sql-m2",
        titulo: "Consultas Intermediárias",
        aulas: [
          { id: "sql-a5", titulo: "GROUP BY, HAVING e funções de agregação", youtubeVideoId: "9cAKQWodpvM", conteudo: "COUNT, SUM, AVG, MAX, MIN, agrupamento de resultados e filtros em agregações." },
          { id: "sql-a6", titulo: "JOINs: combinando tabelas", youtubeVideoId: "DT1buKJc_-0", conteudo: "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN e como relacionar dados de múltiplas tabelas." },
          { id: "sql-a2", titulo: "Prática com SQL em ambiente real", youtubeVideoId: "rX2I7OjLqWE", conteudo: "Exercícios práticos em ambiente real: Oracle Live, PostgreSQL ou MySQL.", materiais: [material("sql-mat-2", "SQL na prática 2 - Oracle Live", "DOCX", "/course-materials/sql-na-pratica/01-sql-na-pratica-2-oracle-live.docx")] },
        ],
      },
      {
        id: "sql-m3",
        titulo: "SQL Avançado",
        aulas: [
          { id: "sql-a7", titulo: "Subqueries e CTEs", youtubeVideoId: "Ww71knvhQ-s", conteudo: "Subconsultas, Common Table Expressions (WITH), queries aninhadas e reutilização de resultados." },
          { id: "sql-a8", titulo: "Índices e otimização de consultas", youtubeVideoId: "SSKVgrwhzus", conteudo: "CREATE INDEX, EXPLAIN, chaves primárias e estrangeiras, normalização e performance." },
        ],
      },
    ],
  },
  {
    id: "fallback-github",
    slug: "github-colaborativo",
    titulo: "GitHub Colaborativo",
    descricao: "Do git init ao pull request: versionamento, branches e colaboração em equipe.",
    modulos: [
      {
        id: "github-m1",
        titulo: "Git: Fundamentos",
        aulas: [
          { id: "github-a4", titulo: "Git do zero: init, add, commit e log", youtubeVideoId: "_hZf1teRFNg", conteudo: "Instalação do Git, repositório local, staging area, commits e histórico." },
          { id: "github-a5", titulo: "Branches, merge e resolução de conflitos", youtubeVideoId: "xAOBQtSVI_k", conteudo: "Criando branches, alternando com checkout/switch, merge e como resolver conflitos." },
          { id: "github-a1", titulo: "Git e GitHub: básico ao intermediário", youtubeVideoId: "ts-H3W1uLMM", conteudo: "Conectando repositório local ao remoto, push, pull, clone e .gitignore.", materiais: [material("github-mat-1", "GitHub básico ao intermediário", "DOCX", "/course-materials/github-colaborativo/03-github-basico-intermediario.docx")] },
        ],
      },
      {
        id: "github-m2",
        titulo: "GitHub: Colaboração",
        aulas: [
          { id: "github-a2", titulo: "Fork e pull request", youtubeVideoId: "192HgwRgOYE", conteudo: "Contribuindo em projetos open source: fork, clone, branch, commit e pull request.", materiais: [material("github-mat-2", "GitHub - fork e pull request", "DOCX", "/course-materials/github-colaborativo/01-github-fork-pull-request.docx")] },
          { id: "github-a3", titulo: "Code review e boas práticas", youtubeVideoId: "gcOhd8rvBOc", conteudo: "Revisando PRs, comentários, aprovação, merge strategies e convenções de commit.", materiais: [material("github-mat-3", "GitHub - fork e pull request PR", "DOCX", "/course-materials/github-colaborativo/02-github-fork-pull-request-pr.docx")] },
          { id: "github-a6", titulo: "GitHub Actions e CI/CD básico", youtubeVideoId: "zTNbS3xGVGg", conteudo: "Automatizando testes e deploy com GitHub Actions: workflows, triggers e secrets." },
        ],
      },
    ],
  },
  {
    id: "fallback-excel",
    slug: "excel-procv",
    titulo: "Excel Avançado",
    descricao: "PROCV, tabelas dinâmicas, gráficos e fórmulas para análise de dados.",
    modulos: [
      {
        id: "excel-m1",
        titulo: "Fórmulas e Funções",
        aulas: [
          { id: "excel-a1", titulo: "PROCV e funções de busca", youtubeVideoId: "nx4pPfd6oqs", conteudo: "PROCV (VLOOKUP), PROCH, ÍNDICE+CORRESP e quando usar cada função de busca.", materiais: [material("excel-mat-1", "Excel PROCV", "DOCX", "/course-materials/excel-procv/01-excel-procv.docx")] },
          { id: "excel-a2", titulo: "Fórmulas condicionais e lógicas", youtubeVideoId: "DT1buKJc_-0", conteudo: "SE, SOMASE, CONT.SE, E, OU, fórmulas aninhadas e formatação condicional." },
        ],
      },
      {
        id: "excel-m2",
        titulo: "Análise Visual",
        aulas: [
          { id: "excel-a3", titulo: "Tabelas dinâmicas (Pivot Tables)", youtubeVideoId: "YyrK_1RDxv0", conteudo: "Criando tabelas dinâmicas, campos, filtros, agrupamento e segmentação de dados." },
          { id: "excel-a4", titulo: "Gráficos e dashboards no Excel", youtubeVideoId: "G7bMwefn8RQ", conteudo: "Tipos de gráfico, formatação, dashboards visuais e boas práticas de visualização." },
        ],
      },
    ],
  },
  {
    id: "fallback-vba",
    slug: "vba-excel",
    titulo: "VBA para Excel",
    descricao: "Macros, formulários e automação avançada de planilhas.",
    modulos: [
      {
        id: "vba-m1",
        titulo: "Macros e Automação",
        aulas: [
          { id: "vba-a1", titulo: "Introdução ao VBA e macros", youtubeVideoId: "BxMtSb2w9Sk", conteudo: "O que é VBA, gravador de macros, editor VBA, variáveis e primeiros scripts.", materiais: [material("vba-mat-1", "VBA para Excel avançado - atividade prática", "DOCX", "/course-materials/vba-excel/01-vba-para-excel-avancado-atv-pratica-1.docx")] },
          { id: "vba-a4", titulo: "Estruturas de controle no VBA", youtubeVideoId: "PKMm-cHe56g", conteudo: "If/Then/Else, For/Next, Do/While, Select Case e loops em VBA." },
        ],
      },
      {
        id: "vba-m2",
        titulo: "Projetos Práticos",
        aulas: [
          { id: "vba-a2", titulo: "Banco de dados em planilha", youtubeVideoId: "VdLen3MV-GM", conteudo: "Usando planilha como banco de dados: inserir, consultar e atualizar registros com VBA.", materiais: [material("vba-mat-2", "Banco de dados XLSM", "XLSM", "/course-materials/vba-excel/02-banco-de-dados-xlsm2005.xlsm")] },
          { id: "vba-a3", titulo: "Formulário que grava no banco de dados", youtubeVideoId: "EV7Idm_mkxo", conteudo: "Criando UserForms, campos de entrada, validação e gravação automática na planilha.", materiais: [material("vba-mat-3", "Apostila VBA - formulário com banco de dados", "DOCX", "/course-materials/vba-excel/03-apostila-vba-no-excel-formulario-que-grava-no-banco-de-dados.docx")] },
        ],
      },
    ],
  },
  {
    id: "fallback-power-bi",
    slug: "power-bi",
    titulo: "Power BI",
    descricao: "Dashboards interativos, DAX e análise visual de dados do zero.",
    modulos: [
      {
        id: "power-bi-m1",
        titulo: "Primeiros Passos",
        aulas: [
          { id: "power-bi-a1", titulo: "Introdução ao Power BI e importação de dados", youtubeVideoId: "YyrK_1RDxv0", conteudo: "Interface do Power BI Desktop, importar dados de Excel/CSV, transformar dados no Power Query.", materiais: [material("power-bi-mat-1", "Power BI - aula 1", "DOCX", "/course-materials/power-bi/01-aula-1-power-bi.docx")] },
          { id: "power-bi-a3", titulo: "Criando visuais e relatórios", youtubeVideoId: "9cAKQWodpvM", conteudo: "Gráficos de barras, linhas, pizza, cartões, tabelas, formatação e filtros interativos." },
        ],
      },
      {
        id: "power-bi-m2",
        titulo: "DAX e Dashboards",
        aulas: [
          { id: "power-bi-a4", titulo: "Introdução ao DAX", youtubeVideoId: "yhM7t7oyYes", conteudo: "Fórmulas DAX: SUM, COUNT, CALCULATE, FILTER, medidas vs colunas calculadas." },
          { id: "power-bi-a5", titulo: "Modelagem de dados e relacionamentos", youtubeVideoId: "KOhd3R5kLks", conteudo: "Modelo estrela, relacionamentos entre tabelas, cardinalidade e boas práticas." },
          { id: "power-bi-a2", titulo: "Dashboard completo: do dado ao insight", youtubeVideoId: "rX2I7OjLqWE", conteudo: "Projeto prático: importar, modelar, criar medidas DAX e montar dashboard profissional.", materiais: [material("power-bi-mat-2", "Gabarito Power BI - aula 1", "DOCX", "/course-materials/power-bi/02-gabarito-powerbi-aula-1.docx")] },
        ],
      },
    ],
  },
  {
    id: "fallback-manutencao",
    slug: "montagem-manutencao",
    titulo: "Montagem e Manutenção",
    descricao: "Hardware, redes, sistemas operacionais e troubleshooting para suporte de TI.",
    modulos: [
      {
        id: "manutencao-m1",
        titulo: "Hardware e Montagem",
        aulas: [
          { id: "manutencao-a1", titulo: "Componentes do computador", youtubeVideoId: "MHncnRZFRNw", conteudo: "CPU, RAM, placa-mãe, fonte, armazenamento (SSD/HDD), GPU e compatibilidade de peças.", materiais: [material("manutencao-mat-1", "Peças de hardware do computador", "DOCX", "/course-materials/montagem-manutencao/01-pecas-de-hardware-do-computador.docx")] },
          { id: "manutencao-a4", titulo: "Montagem passo a passo", youtubeVideoId: "BBWiEfuhz1c", conteudo: "Montando um PC do zero: instalação de CPU, cooler, RAM, SSD, fonte e cabeamento." },
          { id: "manutencao-a2", titulo: "Diagnóstico e troubleshooting", youtubeVideoId: "L0k2PeUZzY8", conteudo: "Ferramentas, testes de POST, identificação de falhas, limpeza e manutenção preventiva.", materiais: [material("manutencao-mat-2", "Desafio prático - técnico de hardware", "DOCX", "/course-materials/montagem-manutencao/02-desafio-pratico-tecnico-de-hardware.docx")] },
        ],
      },
      {
        id: "manutencao-m2",
        titulo: "Sistemas Operacionais",
        aulas: [
          { id: "manutencao-a5", titulo: "Windows: instalação e configuração", youtubeVideoId: "MR-Bg03aNJg", conteudo: "Instalação do Windows, partições, drivers, atualizações e configurações essenciais." },
          { id: "manutencao-a3", titulo: "Linux: terminal e comandos essenciais", youtubeVideoId: "CnYraL0J_hM", conteudo: "Distribuições, terminal, comandos básicos (ls, cd, mkdir, cp, mv, rm), permissões e sudo.", materiais: [material("manutencao-mat-3", "Montagem e manutenção - Linux", "DOCX", "/course-materials/montagem-manutencao/03-montagem-manutencao-sistema-operacional-linux.docx")] },
        ],
      },
      {
        id: "manutencao-m3",
        titulo: "Redes e Conectividade",
        aulas: [
          { id: "manutencao-a6", titulo: "Fundamentos de redes: TCP/IP, DNS e DHCP", youtubeVideoId: "kP1kktlbUTs", conteudo: "Como a internet funciona, modelo TCP/IP, endereçamento IP, DNS e DHCP na prática." },
          { id: "manutencao-a7", titulo: "Wi-Fi, roteadores e segurança de rede", youtubeVideoId: "T6DfFgFOKm4", conteudo: "Configuração de roteador, protocolos de segurança (WPA2/WPA3), firewall básico e troubleshooting de rede." },
        ],
      },
    ],
  },
];
/** Total de aulas de um curso */
export function totalAulas(curso: Curso): number {
  return curso.modulos.reduce((acc, m) => acc + m.aulas.length, 0);
}

/** Encontra curso por slug */
export function cursoPorSlug(slug: string): Curso | undefined {
  return cursos.find((c) => c.slug === slug);
}

/** Encontra aula por id em todo o curso */
export function aulaNoCurso(curso: Curso, aulaId: string): Aula | undefined {
  for (const mod of curso.modulos) {
    const aula = mod.aulas.find((a) => a.id === aulaId);
    if (aula) return aula;
  }
  return undefined;
}

/** Retorna a proxima aula (id) apos a dada, ou null */
export function proximaAulaId(curso: Curso, aulaId: string): string | null {
  for (const mod of curso.modulos) {
    for (let i = 0; i < mod.aulas.length; i++) {
      if (mod.aulas[i].id === aulaId) {
        if (i + 1 < mod.aulas.length) return mod.aulas[i + 1].id;
        const nextMod = curso.modulos.indexOf(mod) + 1;
        if (nextMod < curso.modulos.length && curso.modulos[nextMod].aulas.length > 0) {
          return curso.modulos[nextMod].aulas[0].id;
        }
        return null;
      }
    }
  }
  return null;
}

type SupabaseLessonRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  content: string | null;
  position: number | null;
  lesson_materials?: Array<{
    id: string;
    title: string;
    kind: string;
    file_url: string | null;
    external_url: string | null;
    position: number | null;
  }>;
};

type SupabaseModuleRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number | null;
  lessons?: SupabaseLessonRow[];
};

type SupabaseCourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number | null;
  course_modules?: SupabaseModuleRow[];
};

function mapSupabaseCourse(row: SupabaseCourseRow): Curso {
  const allModules = row.course_modules ?? [];
  const generatedModulePattern = new RegExp(`^${row.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-m\\d+$`);
  const generatedModules = allModules.filter((module) => generatedModulePattern.test(module.slug));
  const fallback = cursos.find((course) => course.slug === row.slug);
  const generatedLessonCount = generatedModules.reduce(
    (total, module) => total + (module.lessons?.length ?? 0),
    0
  );
  const fallbackLessonCount = fallback
    ? fallback.modulos.reduce((total, module) => total + module.aulas.length, 0)
    : 0;

  // O seed de julho/2026 criou uma estrutura canônica com slugs curso-mN,
  // mas deixou as aulas como não publicadas e manteve módulos legados no banco.
  // Enquanto a correção SQL não estiver aplicada, a RLS devolve esses módulos
  // sem aulas. Nesse caso usamos o catálogo local completo, que contém os vídeos.
  if (fallback && generatedLessonCount < fallbackLessonCount) {
    return fallback;
  }

  // Quando a estrutura nova estiver publicada, ignore módulos legados duplicados.
  const sourceModules = generatedModules.length > 0 ? generatedModules : allModules;
  const modules = [...sourceModules].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.title,
    descricao: row.description ?? undefined,
    modulos: modules.map((mod) => ({
      id: mod.id,
      titulo: mod.title,
      aulas: [...(mod.lessons ?? [])]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((lesson) => ({
          id: lesson.id,
          titulo: lesson.title,
          youtubeVideoId: lesson.youtube_video_id ?? "",
          conteudo: lesson.content ?? undefined,
          materiais: [...(lesson.lesson_materials ?? [])]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((material) => ({
              id: material.id,
              titulo: material.title,
              tipo: material.kind,
              url: normalizeMaterialUrl(material.external_url ?? material.file_url),
            }))
            .filter((material) => material.url),
        })),
    })),
  };
}

export async function listarCursosAcademy(): Promise<Curso[]> {
  if (!isSupabaseConfigured) return cursos;

  const { data, error } = await requireSupabase()
    .from("courses")
    .select(`
      id,
      slug,
      title,
      description,
      position,
      course_modules (
        id,
        slug,
        title,
        description,
        position,
        lessons (
          id,
          slug,
          title,
          description,
          youtube_video_id,
          content,
          position,
          lesson_materials (
            id,
            title,
            kind,
            file_url,
            external_url,
            position
          )
        )
      )
    `)
    .eq("is_published", true)
    .order("position", { ascending: true });

  if (error) {
    if (process.env.NODE_ENV !== "production") console.error("[cursos] erro ao carregar cursos:", error);
    return cursos;
  }

  const mapped = ((data ?? []) as unknown as SupabaseCourseRow[]).map(mapSupabaseCourse);
  return mapped.length > 0 ? mapped : cursos;
}

export async function buscarCursoAcademyPorSlug(slug: string): Promise<Curso | undefined> {
  if (!isSupabaseConfigured) return cursoPorSlug(slug);
  const all = await listarCursosAcademy();
  return all.find((curso) => curso.slug === slug);
}

export async function listarAulasConcluidas(lessonIds: string[]): Promise<string[]> {
  if (!isSupabaseConfigured || lessonIds.length === 0) return [];

  const { data: sessionData } = await requireSupabase().auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return [];

  const { data, error } = await requireSupabase()
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .not("completed_at", "is", null);

  if (error) {
    if (process.env.NODE_ENV !== "production") console.error("[cursos] erro ao carregar progresso:", error);
    return [];
  }

  return (data ?? []).map((item: { lesson_id: string }) => item.lesson_id);
}

export async function marcarAulaAcademyConcluida(lessonId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { data: sessionData } = await requireSupabase().auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return;

  const { error } = await requireSupabase()
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

  if (error) throw new Error(error.message);
}
