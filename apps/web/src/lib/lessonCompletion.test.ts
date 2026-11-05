import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ rpc: vi.fn(), getSession: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  requireSupabase: () => ({ rpc: mock.rpc, auth: { getSession: mock.getSession }, from: mock.from }),
}));
import { addProgressLesson, getDashboardSummary } from "./api";
import { listarAulasConcluidas, marcarAulaAcademyConcluida } from "./cursos";

beforeEach(() => {
  vi.resetAllMocks();
  mock.getSession.mockResolvedValue({ data: { session: { user: { id: "user-a" } } } });
});

describe("RPC de conclusao", () => {
  it("envia so identidade da aula/curso/dono esperado e usa os totais retornados", async () => {
    mock.rpc.mockResolvedValue({ data: { lesson_id: "uuid-a", newly_completed: true, xp_awarded: 10, progress: { xp: 0, level: 2 } }, error: null });
    const result = await marcarAulaAcademyConcluida("html-a1", "html", "user-a");
    expect(mock.rpc).toHaveBeenCalledExactlyOnceWith("v3_complete_lesson", { p_lesson_id: "html-a1", p_course_slug: "html", p_expected_user_id: "user-a" });
    expect(mock.from).not.toHaveBeenCalled();
    expect(result.progress).toMatchObject({ xp: 0, level: 2 });
    expect(result.xpAwarded).toBe(10);
  });

  it("repete sem premio e nao faz fallback quando a migration esta ausente", async () => {
    mock.rpc.mockResolvedValueOnce({ data: { lesson_id: "uuid-a", newly_completed: false, xp_awarded: 0, progress: { xp: 40, level: 3 } }, error: null });
    expect((await addProgressLesson("", { lessonId: "uuid-a", courseSlug: "html" })).xpAwarded).toBe(0);
    mock.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202", message: "RPC missing" } });
    await expect(addProgressLesson("", { lessonId: "uuid-a", courseSlug: "html" })).rejects.toMatchObject({ code: "missing_rpc" });
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("bloqueia fila de outra sessao antes da RPC e nao confirma resposta invalida", async () => {
    await expect(marcarAulaAcademyConcluida("uuid-a", "html", "user-b")).rejects.toMatchObject({ code: "session" });
    expect(mock.rpc).not.toHaveBeenCalled();
    mock.rpc.mockResolvedValue({ data: {}, error: null });
    await expect(addProgressLesson("", { lessonId: "uuid-a", courseSlug: "html" })).rejects.toMatchObject({ code: "unavailable" });
  });

  it("consulta IDs legados pelo slug, sem envia-los ao filtro UUID", async () => {
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), not: vi.fn().mockResolvedValue({ data: [{ lessons: { slug: "html-a1", course_modules: { courses: { slug: "html" } } } }], error: null }) };
    mock.from.mockReturnValue(query);
    expect(await listarAulasConcluidas(["html-a1"], "html", "user-a")).toEqual(["html-a1"]);
    expect(query.in).toHaveBeenCalledWith("lessons.slug", ["html-a1"]);
    expect(query.in).toHaveBeenCalledWith("lessons.course_modules.courses.slug", ["html"]);
  });

  it("nao consulta progresso de uma sessao diferente da conta exibida", async () => {
    await expect(listarAulasConcluidas(["html-a1"], "html", "user-b")).rejects.toThrow("A sessão mudou");
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("dashboard nao cria progresso por leitura nem esconde erro do banco", async () => {
    mock.rpc.mockResolvedValue({ data: [{ id: "user-a", name: "Ficticio" }], error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
    mock.from.mockReturnValue(query);
    expect((await getDashboardSummary("")).progress).toMatchObject({ xp: 0, level: 1 });
    expect(query.select).toHaveBeenCalledExactlyOnceWith("percent,phase,next_goal,level,xp,streak_days,last_lesson");
    query.maybeSingle.mockResolvedValue({ data: null, error: { message: "offline" } });
    await expect(getDashboardSummary("")).rejects.toThrow("offline");
  });
});
