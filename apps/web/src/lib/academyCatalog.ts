import type { Curso } from "./cursos";
import { academyPreviewHref } from "./portalNavigation";

export type AcademyCatalogEntry = {
  id: string;
  title: string;
  format: "Trilha prática" | "Aventura guiada" | "Aulas em vídeo";
  description: string;
  available: string;
  boundary?: string;
  href: string;
  tone: "mint" | "sand" | "blue";
  courses: Curso[];
};

const videoSubjects = [
  { id: "logic", title: "Lógica e Python", description: "Entenda algoritmos, decisões e repetição antes de programas maiores.", slugs: ["logica-programacao-python"] },
  { id: "web", title: "Desenvolvimento web", description: "Estrutura, estilo e interação para construir páginas na web.", slugs: ["html-css-js"] },
  { id: "git", title: "Git e colaboração", description: "Organize versões e aprenda a colaborar em um repositório.", slugs: ["github-colaborativo"] },
  { id: "data-tools", title: "Ferramentas e análise de dados", description: "Consulte aulas de Excel, VBA e Power BI para trabalhar com dados.", slugs: ["excel-procv", "vba-excel", "power-bi"] },
  { id: "computers", title: "Computadores e manutenção", description: "Conheça componentes, montagem e cuidados com o computador.", slugs: ["montagem-manutencao"] },
];

/** A subject has one main entry; related videos are supporting material, not a duplicate track. */
export function getAcademyCatalog(courses: Curso[]): AcademyCatalogEntry[] {
  const unique = new Map<string, Curso>();
  for (const course of courses) if (!unique.has(course.slug)) unique.set(course.slug, course);
  const take = (slugs: string[]) => slugs.flatMap(slug => {
    const course = unique.get(slug);
    if (!course) return [];
    unique.delete(slug);
    return [course];
  });
  const entries: AcademyCatalogEntry[] = [
    {
      id: "fundamentals", title: "Primeiros passos na programação", format: "Trilha prática", tone: "blue",
      description: "Monte um perfil, faça a conta de um serviço, tome uma decisão e entregue um pequeno orçamento em JavaScript.",
      available: "4 entregas: com guia, fazendo uma mudança e resolvendo sozinho.",
      href: "/estudante/pratica/variaveis-js", courses: [],
    },
    {
      id: "csharp", title: "C# & .NET", format: "Trilha prática", tone: "mint",
      description: "Um mapa de estudo com código guiado, perguntas e um projeto de contexto para suas primeiras linhas em C#.",
      available: "Comece por variáveis, condições e laços.",
      boundary: "Edição piloto. Métodos, APIs e as próximas etapas do projeto ainda estão em preparação.",
      href: "/estudante/trilhas/csharp",
      courses: take(["csharp-fundamentos"]),
    },
    {
      id: "sql", title: "SQL com Orbi", format: "Aventura guiada", tone: "sand",
      description: "Ajude uma pequena loja e descubra o que uma consulta faz enquanto encontra os dados de que precisa.",
      available: "Linhas, colunas, filtros e uma oficina de consultas.",
      href: "/estudante/trilhas/sql",
      courses: take(["sql-na-pratica"]),
    },
  ];
  for (const subject of videoSubjects) {
    const grouped = take(subject.slugs);
    if (grouped.length) entries.push({
      id: subject.id, title: subject.title, format: "Aulas em vídeo", tone: "blue",
      description: subject.description, available: `${grouped.length} curso${grouped.length > 1 ? "s" : ""} na biblioteca.`,
      href: `/estudante/cursos/${grouped[0].slug}`, courses: grouped,
    });
  }
  if (unique.size) {
    const extra = [...unique.values()];
    entries.push({
      id: "more", title: "Mais assuntos da biblioteca", format: "Aulas em vídeo", tone: "blue",
      description: "Conteúdos complementares publicados na Academy, reunidos para consulta.",
      available: `${extra.length} curso${extra.length > 1 ? "s" : ""} na biblioteca.`,
      href: "/estudante/aulas", courses: extra,
    });
  }
  return entries;
}

export function academyCatalogDestination(entry: AcademyCatalogEntry, preview = false): string {
  return preview ? academyPreviewHref(entry.href) : entry.href;
}
