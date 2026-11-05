import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  configured: true,
  responses: [] as Array<{ data: unknown; error: { code: string; message: string } | null }>,
  requests: [] as Array<{ table: string; select?: string; filters: Array<[string, unknown]>; single: boolean }>,
}));

vi.mock("@/lib/supabase", () => ({
  get isSupabaseConfigured() { return database.configured; },
  requireSupabase: () => ({
    from: (table: string) => {
      const request = { table, filters: [] as Array<[string, unknown]>, single: false, select: "" };
      database.requests.push(request);
      const builder = {
        select: (columns: string) => { request.select = columns; return builder; },
        eq: (column: string, value: unknown) => { request.filters.push([column, value]); return builder; },
        order: () => Promise.resolve(database.responses.shift()),
        maybeSingle: () => { request.single = true; return Promise.resolve(database.responses.shift()); },
      };
      return builder;
    },
  }),
}));

import {
  buscarCursoAcademyPorSlug,
  cursos,
  cursosResumo,
  getCourseTrackGroups,
  listarCursosAcademy,
  totalAulas,
} from "./cursos";
import { flattenCourseLessons, getNextIncompleteLesson } from "./learningExperience";

function courseRow() {
  return {
    id: "course-db", slug: "curso-novo", title: "Curso novo", description: "Resumo do curso", position: 1,
    course_modules: [
      { id: "module-b", slug: "curso-novo-m2", title: "Segundo módulo", position: 2, lessons: [
        { id: "lesson-b", slug: "aula-b", title: "Segunda aula", position: 2, content: "Conteúdo extenso", youtube_video_id: "video-b", quiz: [], lesson_materials: [] },
        { id: "lesson-a", slug: "aula-a", title: "Primeira aula", position: 1, content: "Explicação completa", youtube_video_id: "video-a", quiz: [{ question: "Pergunta?", options: ["A", "B"], answer: "A" }], lesson_materials: [
          { id: "material-b", title: "Segundo", kind: "PDF", file_url: null, external_url: "https://example.org/apoio", position: 2 },
          { id: "material-a", title: "Primeiro", kind: "DOCX", file_url: "/course-materials/curso/apoio.docx", external_url: null, position: 1 },
        ] },
      ] },
      { id: "module-a", slug: "curso-novo-m1", title: "Primeiro módulo", position: 1, lessons: [] },
      { id: "legacy", slug: "modulo-antigo", title: "Legado duplicado", position: 0, lessons: [{ id: "legacy-lesson", title: "Legado", position: 0 }] },
    ],
  };
}

beforeEach(() => {
  database.configured = true;
  database.responses.length = 0;
  database.requests.length = 0;
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("catálogo resumido da Academy", () => {
  it("seleciona somente metadados, preservando ordem e IDs para progresso", async () => {
    database.responses.push({ data: [courseRow()], error: null });

    const result = await listarCursosAcademy();

    expect(database.requests).toHaveLength(1);
    expect(database.requests[0].filters).toEqual([["is_published", true]]);
    expect(database.requests[0].select).not.toMatch(/\b(content|quiz|lesson_materials|youtube_video_id|file_url|external_url)\b/);
    expect(result[0].modulos.map(module => module.id)).toEqual(["module-a", "module-b"]);
    expect(result[0].modulos[1].aulas).toEqual([
      { id: "lesson-a", slug: "aula-a", titulo: "Primeira aula" },
      { id: "lesson-b", slug: "aula-b", titulo: "Segunda aula" },
    ]);
    expect(totalAulas(result[0])).toBe(2);
    expect(JSON.stringify(result)).not.toMatch(/conteudo|materiais|quiz|youtubeVideoId/);
    expect(getNextIncompleteLesson(result, new Set(["lesson-a"]))?.aula.id).toBe("lesson-b");
    expect(getCourseTrackGroups(result)[0].cursos[0]).toBe(result[0]);
  });

  it("mantém uma fonte local única e os mesmos IDs, títulos e totais no fallback", async () => {
    database.configured = false;
    const result = await listarCursosAcademy();

    expect(database.requests).toHaveLength(0);
    expect(result).toBe(cursosResumo);
    expect(result.map(course => ({ slug: course.slug, total: totalAulas(course) })))
      .toEqual(cursos.map(course => ({ slug: course.slug, total: totalAulas(course) })));
    for (const [index, course] of result.entries()) {
      expect(flattenCourseLessons(course).map(({ aula }) => ({ id: aula.id, titulo: aula.titulo })))
        .toEqual(flattenCourseLessons(cursos[index]).map(({ aula }) => ({ id: aula.id, titulo: aula.titulo })));
    }
    expect(JSON.stringify(result)).not.toMatch(/conteudo|materiais|quiz|youtubeVideoId/);
  });

  it.each([null, { code: "42501", message: "Acesso indisponível" }])("usa resumo local sem repetir uma consulta de catálogo vazia ou com erro: %j", async (error) => {
    database.responses.push({ data: [], error });
    expect(await listarCursosAcademy()).toBe(cursosResumo);
    expect(database.requests).toHaveLength(1);
  });

  it("aplica a mesma proteção do detalhe ao seed canônico incompleto", async () => {
    const local = cursos[0];
    const row = { ...courseRow(), slug: local.slug, course_modules: [
      { id: "empty", slug: `${local.slug}-m1`, title: "Seed ainda não publicado", position: 1, lessons: [] },
    ] };
    database.responses.push({ data: [row], error: null }, { data: row, error: null });

    expect((await listarCursosAcademy())[0]).toBe(cursosResumo[0]);
    expect(await buscarCursoAcademyPorSlug(local.slug)).toBe(local);
  });
});

describe("detalhe de curso sob demanda", () => {
  it("busca somente o slug pedido e preserva conteúdo, quiz e materiais ordenados", async () => {
    database.responses.push({ data: courseRow(), error: null });

    const result = await buscarCursoAcademyPorSlug("curso-novo");

    expect(database.requests).toHaveLength(1);
    expect(database.requests[0]).toMatchObject({ table: "courses", single: true, filters: [["is_published", true], ["slug", "curso-novo"]] });
    expect(database.requests[0].select).toMatch(/content/);
    expect(database.requests[0].select).toMatch(/quiz/);
    expect(database.requests[0].select).toMatch(/lesson_materials/);
    expect(result?.modulos.map(module => module.id)).toEqual(["module-a", "module-b"]);
    const lesson = result?.modulos[1].aulas[0];
    expect(lesson).toMatchObject({ id: "lesson-a", slug: "aula-a", youtubeVideoId: "video-a", conteudo: "Explicação completa", quiz: [{ question: "Pergunta?", options: ["A", "B"], answer: "A" }] });
    expect(lesson?.materiais?.map(material => material.url)).toEqual(["/api/course-materials/curso/apoio.docx", "https://example.org/apoio"]);
  });

  it("repete somente o detalhe solicitado quando a coluna quiz ainda não existe", async () => {
    database.responses.push(
      { data: null, error: { code: "42703", message: "column lessons.quiz does not exist" } },
      { data: courseRow(), error: null },
    );

    expect((await buscarCursoAcademyPorSlug("curso-novo"))?.slug).toBe("curso-novo");
    expect(database.requests).toHaveLength(2);
    expect(database.requests[1].select).not.toMatch(/\bquiz\b/);
    expect(database.requests.every(request => request.filters.some(([key, value]) => key === "slug" && value === "curso-novo"))).toBe(true);
  });

  it("não repete erros alheios à compatibilidade de quiz e preserva fallback local", async () => {
    database.responses.push({ data: null, error: { code: "42501", message: "Sem acesso" } });
    expect(await buscarCursoAcademyPorSlug(cursos[0].slug)).toBe(cursos[0]);
    expect(database.requests).toHaveLength(1);
  });

  it("retorna undefined para slug inexistente e não consulta os outros cursos", async () => {
    database.responses.push({ data: null, error: null });
    expect(await buscarCursoAcademyPorSlug("nao-existe")).toBeUndefined();
    expect(database.requests).toHaveLength(1);
    expect(database.requests[0].single).toBe(true);
  });

  it("abre o curso local completo quando o banco não está configurado", async () => {
    database.configured = false;
    expect(await buscarCursoAcademyPorSlug(cursos[0].slug)).toBe(cursos[0]);
    expect(database.requests).toHaveLength(0);
  });
});
