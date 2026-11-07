import { CATEGORIAS, type CategoriaSlug, type Projeto } from "@/types/projeto";

export type ProjectFilter = "todos" | CategoriaSlug;

// Curadoria comercial: um projeto novo entra ao final até ser avaliado.
const PORTFOLIO_PROJECT_SLUGS = [
  "sabrina-lashes",
  "radar-da-rima",
  "yume-moda-disruptiva",
  "mb-multimarcas-infantil",
  "sensimilla-records",
  "orbitamos-portal-tech",
  "orbicore-gestao",
  "palladinos-assessoria",
  "fast-comunicacao-design",
  "kitcerto",
  "destaque-multimarcas",
] as const;
const EDITORIAL_PROJECT_SLUGS = PORTFOLIO_PROJECT_SLUGS.slice(0, 3);
const HOME_PROJECT_SLUGS = ["yume-moda-disruptiva", "sabrina-lashes", "radar-da-rima"] as const;
const portfolioPositions = new Map<string, number>(PORTFOLIO_PROJECT_SLUGS.map((slug, index) => [slug, index]));
const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR").trim();

/** Preserva os objetos e a entrada; projetos ainda sem curadoria mantêm sua ordem ao final. */
export function orderProjectsForPortfolio(projects: readonly Projeto[]): Projeto[] {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((left, right) => {
      const leftPosition = portfolioPositions.get(left.project.slug) ?? PORTFOLIO_PROJECT_SLUGS.length;
      const rightPosition = portfolioPositions.get(right.project.slug) ?? PORTFOLIO_PROJECT_SLUGS.length;
      return leftPosition - rightPosition || left.index - right.index;
    })
    .map(({ project }) => project);
}

function selectProjectsBySlug(projects: readonly Projeto[], slugs: readonly string[]): Projeto[] {
  return slugs.flatMap((slug) => {
    const project = projects.find((item) => item.slug === slug);
    return project ? [project] : [];
  });
}

/** A home tem uma seleção própria, independente da ordem e do tamanho do catálogo. */
export function getHomeFeaturedProjects(projects: readonly Projeto[]): Projeto[] {
  return selectProjectsBySlug(projects, HOME_PROJECT_SLUGS);
}

export function filterProjectCatalog(projects: readonly Projeto[], category: ProjectFilter, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return orderProjectsForPortfolio(projects).filter((project) => {
    if (category !== "todos" && project.categoria !== category) return false;
    const categoryName = CATEGORIAS.find((item) => item.slug === project.categoria)?.label ?? "";
    const searchable = normalize([project.nome, project.resumo, categoryName, ...project.tags, ...project.stack].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
}

/** Destaques são uma seleção da lista, nunca cópias extras do mesmo projeto. */
export function projectCatalogPresentation(projects: readonly Projeto[], category: ProjectFilter, query: string) {
  const filtered = filterProjectCatalog(projects, category, query);
  const editorial = category === "todos" && normalize(query).length === 0;
  const featured = editorial
    ? selectProjectsBySlug(filtered, EDITORIAL_PROJECT_SLUGS)
    : [];
  const featuredSlugs = new Set(featured.map((project) => project.slug));
  return { filtered, featured, remaining: filtered.filter((project) => !featuredSlugs.has(project.slug)) };
}

export function projectCategoryCounts(projects: readonly Projeto[]) {
  return Object.fromEntries([
    ["todos", projects.length],
    ...CATEGORIAS.map((category) => [category.slug, projects.filter((project) => project.categoria === category.slug).length]),
  ]) as Record<ProjectFilter, number>;
}
