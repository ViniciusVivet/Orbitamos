import { CATEGORIAS, type CategoriaSlug, type Projeto } from "@/types/projeto";

export type ProjectFilter = "todos" | CategoriaSlug;
const EDITORIAL_PROJECT_SLUGS = ["fast-comunicacao-design", "palladinos-assessoria"];
const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR").trim();

export function filterProjectCatalog(projects: Projeto[], category: ProjectFilter, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    if (category !== "todos" && project.categoria !== category) return false;
    const categoryName = CATEGORIAS.find((item) => item.slug === project.categoria)?.label ?? "";
    const searchable = normalize([project.nome, project.resumo, categoryName, ...project.tags, ...project.stack].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
}

/** Destaques são uma seleção da lista, nunca cópias extras do mesmo projeto. */
export function projectCatalogPresentation(projects: Projeto[], category: ProjectFilter, query: string) {
  const filtered = filterProjectCatalog(projects, category, query);
  const editorial = category === "todos" && normalize(query).length === 0;
  const featured = editorial
    ? EDITORIAL_PROJECT_SLUGS.flatMap((slug) => filtered.find((project) => project.slug === slug) ?? [])
    : [];
  const featuredSlugs = new Set(featured.map((project) => project.slug));
  return { filtered, featured, remaining: filtered.filter((project) => !featuredSlugs.has(project.slug)) };
}

export function projectCategoryCounts(projects: Projeto[]) {
  return Object.fromEntries([
    ["todos", projects.length],
    ...CATEGORIAS.map((category) => [category.slug, projects.filter((project) => project.categoria === category.slug).length]),
  ]) as Record<ProjectFilter, number>;
}
