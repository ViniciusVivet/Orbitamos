import { describe, expect, it } from "vitest";
import { academyCatalogDestination, getAcademyCatalog } from "./academyCatalog";
import type { Curso } from "./cursos";

const course = (slug: string): Curso => ({ id: slug, slug, titulo: slug, modulos: [] });
describe("Academy canonical catalog", () => {
  it("keeps practical C# and SQL available without inventing video contents", () => {
    const entries = getAcademyCatalog([]);
    expect(entries.map(entry => entry.id)).toEqual(["fundamentals", "csharp", "sql"]);
    expect(entries.every(entry => entry.courses.length === 0)).toBe(true);
    expect(entries[1].boundary).toContain("ainda estão em preparação");
    expect(academyCatalogDestination(entries[0])).toBe("/estudante/pratica/variaveis-js");
    expect(academyCatalogDestination(entries[1])).toBe("/estudante/trilhas/csharp");
    expect(academyCatalogDestination(entries[2])).toBe("/estudante/trilhas/sql");
  });
  it("treats C# and SQL videos as supporting resources rather than duplicate tracks", () => {
    const entries = getAcademyCatalog([course("csharp-fundamentos"), course("sql-na-pratica"), course("csharp-fundamentos")]);
    expect(entries).toHaveLength(3);
    expect(entries[1].courses.map(item => item.slug)).toEqual(["csharp-fundamentos"]);
    expect(entries[2].courses.map(item => item.slug)).toEqual(["sql-na-pratica"]);
    expect(new Set(entries.map(entry => entry.title)).size).toBe(entries.length);
  });
  it("groups known courses once and preserves new subjects in the library", () => {
    const slugs = ["logica-programacao-python", "html-css-js", "excel-procv", "vba-excel", "power-bi", "conteudo-novo"];
    const entries = getAcademyCatalog(slugs.map(course));
    const contents = entries.flatMap(entry => entry.courses.map(item => item.slug));
    expect(contents.sort()).toEqual([...slugs].sort());
    expect(entries.find(entry => entry.id === "data-tools")?.courses).toHaveLength(3);
    expect(entries.find(entry => entry.id === "more")?.courses[0].slug).toBe("conteudo-novo");
  });
  it("uses explicit preview destinations only where a real preview exists", () => {
    const entries = getAcademyCatalog([course("html-css-js")]);
    expect(academyCatalogDestination(entries[0], true)).toBe("/dev/ide-preview/variaveis-js?academy=1");
    expect(academyCatalogDestination(entries[1], true)).toBe("/dev/csharp-preview?academy=1");
    expect(academyCatalogDestination(entries[2], true)).toBe("/dev/academy-preview?activity=sql");
    expect(academyCatalogDestination(entries[3], true)).toBe("/estudante/cursos/html-css-js");
  });
});
