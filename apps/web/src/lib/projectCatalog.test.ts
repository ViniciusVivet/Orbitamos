import { describe, expect, it } from "vitest";
import { projetos } from "@/data/projetos";
import { CATEGORIAS } from "@/types/projeto";
import type { Projeto } from "@/types/projeto";
import { filterProjectCatalog, getHomeFeaturedProjects, orderProjectsForPortfolio, projectCatalogPresentation, projectCategoryCounts } from "./projectCatalog";

const commercialOrder = [
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
];
const slugs = (projects: readonly Projeto[]) => projects.map((project) => project.slug);

describe("catálogo comercial", () => {
  it("ordena por relevância comercial mesmo se os dados chegarem em outra ordem", () => {
    expect(slugs(orderProjectsForPortfolio([...projetos].reverse()))).toEqual(commercialOrder);
  });

  it("não modifica a entrada nem duplica os objetos dos projetos", () => {
    const input = Object.freeze([...projetos].reverse());
    const originalOrder = slugs(input);
    const ordered = orderProjectsForPortfolio(input);
    expect(slugs(input)).toEqual(originalOrder);
    expect(ordered).not.toBe(input);
    for (const project of ordered) {
      expect(project).toBe(input.find((item) => item.slug === project.slug));
    }
  });

  it("acrescenta projetos sem curadoria ao final e não os transforma em destaque", () => {
    const firstNew: Projeto = { ...projetos[0], slug: "novo-projeto-b" };
    const secondNew: Projeto = { ...projetos[0], slug: "novo-projeto-a" };
    const input = [firstNew, ...[...projetos].reverse(), secondNew];
    const presentation = projectCatalogPresentation(input, "todos", "");
    expect(slugs(presentation.filtered)).toEqual([...commercialOrder, firstNew.slug, secondNew.slug]);
    expect(slugs(presentation.featured)).toEqual(commercialOrder.slice(0, 3));
  });

  it("mantém a home com YUME, Sabrina e Radar, sem preencher ausências com outros cases", () => {
    expect(slugs(getHomeFeaturedProjects([...projetos].reverse()))).toEqual([
      "yume-moda-disruptiva", "sabrina-lashes", "radar-da-rima",
    ]);
    expect(slugs(getHomeFeaturedProjects(projetos.filter((project) => project.slug !== "sabrina-lashes")))).toEqual([
      "yume-moda-disruptiva", "radar-da-rima",
    ]);
    expect(getHomeFeaturedProjects([])).toEqual([]);
  });

  it("mantém todos os projetos uma vez, com seleção editorial estável", () => {
    const presentation = projectCatalogPresentation(projetos, "todos", "");
    expect(slugs(presentation.featured)).toEqual(["sabrina-lashes", "radar-da-rima", "yume-moda-disruptiva"]);
    const displayed = [...presentation.featured, ...presentation.remaining];
    expect(new Set(displayed.map((project) => project.slug)).size).toBe(projetos.length);
    expect(displayed).toHaveLength(projetos.length);
    expect(slugs(displayed)).toEqual(commercialOrder);
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

  it("preserva a ordem comercial nas categorias e nos resultados de busca", () => {
    const shuffled = [...projetos].reverse();
    expect(slugs(projectCatalogPresentation(shuffled, "sites-institucionais", "").remaining)).toEqual([
      "sabrina-lashes", "sensimilla-records", "palladinos-assessoria", "destaque-multimarcas",
    ]);
    expect(slugs(filterProjectCatalog(shuffled, "todos", "WhatsApp"))).toEqual([
      "sabrina-lashes", "mb-multimarcas-infantil", "fast-comunicacao-design", "destaque-multimarcas",
    ]);
    expect(projectCatalogPresentation(shuffled, "sites-institucionais", "").featured).toEqual([]);
  });

  it("trata catálogos vazios e seleções parciais sem inserir projetos de fora", () => {
    expect(orderProjectsForPortfolio([])).toEqual([]);
    expect(projectCatalogPresentation([], "todos", "")).toEqual({ filtered: [], featured: [], remaining: [] });
    const radar = projetos.find((project) => project.slug === "radar-da-rima")!;
    expect(projectCatalogPresentation([radar], "todos", "")).toEqual({ filtered: [radar], featured: [radar], remaining: [] });
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
