import { beforeEach, describe, expect, it, vi } from "vitest";

type Request = { table: string; select: string; filters: Array<[string, unknown]> };
const database = vi.hoisted(() => ({
  owner: "user-a" as string | null,
  getSession: vi.fn(),
  requests: [] as Request[],
  responses: [] as Array<{ data: unknown[] | null; error: { message: string } | null }>,
  onResponse: null as (() => void) | null,
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  requireSupabase: () => ({
    auth: { getSession: database.getSession },
    from: (table: string) => {
      const request: Request = { table, select: "", filters: [] };
      database.requests.push(request);
      const builder = {
        select: (columns: string) => { request.select = columns; return builder; },
        eq: (column: string, value: unknown) => { request.filters.push([column, value]); return builder; },
        in: (column: string, values: string[]) => { request.filters.push([column, values]); return builder; },
        not: () => {
          database.onResponse?.();
          return Promise.resolve(database.responses.shift() ?? { data: [], error: null });
        },
      };
      return builder;
    },
  }),
}));

import { academyLessonProgressRefs, readCompletedAcademyLessons } from "./academyLessonProgress";
import { listarAulasConcluidas } from "./cursos";

const uuid = (index: number) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
const aliasRow = (courseSlug: string, slug: string) => ({ lessons: { slug, course_modules: { courses: { slug: courseSlug } } } });

beforeEach(() => {
  database.owner = "user-a";
  database.requests.length = 0;
  database.responses.length = 0;
  database.onResponse = null;
  database.getSession.mockImplementation(async () => ({ data: { session: database.owner ? { user: { id: database.owner } } : null }, error: null }));
});

describe("leitura em lote do progresso da Academy", () => {
  it("gera referências leves com ID, alias e curso para os quatro consumidores globais", () => {
    expect(academyLessonProgressRefs([
      { id: "course-a", slug: "html", titulo: "HTML", modulos: [{ id: "module-a", titulo: "Módulo", aulas: [{ id: "html-a1", titulo: "Introdução" }] }] },
      { id: "course-b", slug: "sql", titulo: "SQL", modulos: [{ id: "module-b", titulo: "Módulo", aulas: [{ id: uuid(1), slug: "sql-a1", titulo: "Introdução" }] }] },
    ])).toEqual([{ id: "html-a1", courseSlug: "html" }, { id: uuid(1), slug: "sql-a1", courseSlug: "sql" }]);
  });

  it("combina UUIDs e fallback sem confundir aliases repetidos entre cursos", async () => {
    const refs = [
      { id: uuid(1), slug: "introducao", courseSlug: "csharp" },
      { id: "fallback-html", slug: "introducao", courseSlug: "html" },
      { id: "fallback-sql", slug: "introducao", courseSlug: "sql" },
      { id: "python-a1", courseSlug: "python" },
    ];
    database.responses.push(
      { data: [{ lesson_id: uuid(1) }, { lesson_id: uuid(99) }], error: null },
      { data: [aliasRow("html", "introducao"), aliasRow("outro", "introducao"), aliasRow("python", "python-a1")], error: null },
    );

    expect(await listarAulasConcluidas(refs, "user-a")).toEqual([uuid(1), "fallback-html", "python-a1"]);
    expect(database.requests).toHaveLength(2);
    expect(database.requests.every((request) => request.table === "lesson_progress" && request.filters.some(([key, value]) => key === "user_id" && value === "user-a"))).toBe(true);
    expect(database.requests[0].filters).toContainEqual(["lesson_id", [uuid(1)]]);
    expect(database.requests[1].filters).toContainEqual(["lessons.slug", ["introducao", "python-a1"]]);
    expect(database.requests[1].filters).toContainEqual(["lessons.course_modules.courses.slug", ["html", "sql", "python"]]);
    expect(database.requests[1].select).not.toMatch(/content|quiz|lesson_materials/);
    expect(database.getSession).toHaveBeenCalledTimes(2);
  });

  it("usa uma única consulta para aliases de vários cursos", async () => {
    const refs = ["html", "sql", "python", "csharp"].map((courseSlug) => ({ id: `${courseSlug}-a1`, courseSlug }));
    database.responses.push({ data: refs.map((ref) => aliasRow(ref.courseSlug, ref.id)), error: null });
    expect(await readCompletedAcademyLessons(refs, "user-a")).toEqual(refs.map((ref) => ref.id));
    expect(database.requests).toHaveLength(1);
  });

  it.each([false, true])("divide 250 referências em três lotes de até 100 (UUID: %j)", async (isUuid) => {
    const refs = Array.from({ length: 250 }, (_, index) => ({ id: isUuid ? uuid(index) : `aula-${index}`, courseSlug: `curso-${index}` }));
    for (let offset = 0; offset < refs.length; offset += 100) {
      database.responses.push({ data: refs.slice(offset, offset + 100).map((ref) => isUuid ? { lesson_id: ref.id } : aliasRow(ref.courseSlug, ref.id)), error: null });
    }
    expect(await readCompletedAcademyLessons(refs, "user-a")).toEqual(refs.map((ref) => ref.id));
    expect(database.requests).toHaveLength(3);
    for (const request of database.requests) {
      for (const [, value] of request.filters) if (Array.isArray(value)) expect(value.length).toBeLessThanOrEqual(100);
    }
  });

  it("não consulta sem dono esperado nem para uma lista vazia", async () => {
    expect(await readCompletedAcademyLessons([{ id: "html-a1", courseSlug: "html" }], undefined)).toEqual([]);
    expect(await readCompletedAcademyLessons([], "user-a")).toEqual([]);
    expect(database.getSession).not.toHaveBeenCalled();
    expect(database.requests).toHaveLength(0);
  });

  it("rejeita sessão de outra conta antes de consultar", async () => {
    await expect(readCompletedAcademyLessons([{ id: "html-a1", courseSlug: "html" }], "user-b")).rejects.toThrow("A sessão mudou");
    expect(database.requests).toHaveLength(0);
  });

  it("não devolve uma resposta antiga depois que a sessão mudou", async () => {
    database.responses.push({ data: [aliasRow("html", "html-a1")], error: null });
    database.onResponse = () => { database.owner = "user-b"; };
    await expect(readCompletedAcademyLessons([{ id: "html-a1", courseSlug: "html" }], "user-a")).rejects.toThrow("A sessão mudou");
  });

  it("expõe erro de leitura sem apresentar ausência de progresso como sucesso", async () => {
    database.responses.push({ data: null, error: { message: "offline" } });
    await expect(readCompletedAcademyLessons([{ id: uuid(1), courseSlug: "html" }], "user-a")).rejects.toThrow("Não foi possível consultar");
  });
});
