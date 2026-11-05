import { describe, expect, it } from "vitest";
import { projetos } from "@/data/projetos";
import { CATEGORIAS } from "@/types/projeto";
import { filterProjectCatalog, projectCatalogPresentation, projectCategoryCounts } from "./projectCatalog";

describe("catálogo comercial", () => {
  it("mantém todos os projetos uma vez, com seleção editorial estável", () => {
    const presentation = projectCatalogPresentation(projetos, "todos", "");
    expect(presentation.featured.map((project) => project.slug)).toEqual(["fast-comunicacao-design", "palladinos-assessoria"]);
    const displayed = [...presentation.featured, ...presentation.remaining];
    expect(new Set(displayed.map((project) => project.slug)).size).toBe(projetos.length);
    expect(displayed).toHaveLength(projetos.length);
  });

  it("encontra projetos novos pelo nome e trata acentos sem exigir digitação exata", () => {
    expect(filterProjectCatalog(projetos, "todos", "PALLADINOS").map((project) => project.slug)).toEqual(["palladinos-assessoria"]);
    expect(filterProjectCatalog(projetos, "todos", "comunicacao").some((project) => project.slug === "fast-comunicacao-design")).toBe(true);
  });

  it("combina objetivo e categoria, permitindo pesquisar várias palavras", () => {
    const found = filterProjectCatalog(projetos, "ecommerce", "moda mobile");
    expect(found.some((project) => project.slug === "mb-multimarcas-infantil")).toBe(true);
    expect(found.every((project) => project.categoria === "ecommerce")).toBe(true);
    expect(filterProjectCatalog(projetos, "ecommerce", "Palladinos")).toEqual([]);
  });

  it("não repete os destaques ao filtrar e expõe o resultado vazio", () => {
    const found = projectCatalogPresentation(projetos, "todos", "YUME");
    expect(found.featured).toEqual([]);
    expect(found.remaining.map((project) => project.slug)).toEqual(["yume-moda-disruptiva"]);
    expect(projectCatalogPresentation(projetos, "todos", "nenhum-projeto-com-este-nome").filtered).toEqual([]);
  });

  it("deriva contagens dos dados, inclusive para categorias sem projetos", () => {
    const counts = projectCategoryCounts(projetos);
    expect(counts.todos).toBe(projetos.length);
    expect(CATEGORIAS.reduce((total, category) => total + counts[category.slug], 0)).toBe(projetos.length);
    expect(projectCategoryCounts([]).automacoes).toBe(0);
    const narrowed = filterProjectCatalog(projetos, "todos", "Palladinos");
    expect(projectCategoryCounts(narrowed).todos).toBe(1);
  });
});
