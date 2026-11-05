import { describe, expect, it, vi } from "vitest";
import { getBrowserStorage, queueCourseLesson, readCourseProgress, reconcileCourseProgress, syncPendingCourseProgress, writeCourseProgress } from "./courseProgress";

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, get length() { return values.size; }, key: (index: number) => [...values.keys()][index] ?? null };
}

describe("fila de conclusoes de aula", () => {
  it("preserva o save antigo, concilia slugs e reenvia sem inventar XP", async () => {
    const storage = memoryStorage();
    storage.setItem("orbitacademy-progress-a-html", JSON.stringify({ concluidas: ["html-a1", "antiga"], ultimaAulaId: "html-a1" }));
    const progress = reconcileCourseProgress(storage, "a", "html", [{ id: "uuid1", slug: "html-a1" }]);
    expect(progress).toEqual({ completed: ["uuid1", "antiga"], pending: ["uuid1", "antiga"], lastLessonId: "uuid1" });
    const complete = vi.fn().mockResolvedValue({ newlyCompleted: false, xpAwarded: 0 });
    const result = await syncPendingCourseProgress({ storage, userId: "a", courseSlug: "html", lessonIds: ["uuid1"], complete });
    expect(result).toEqual({ synced: 1, pending: [], error: null });
    expect(complete).toHaveBeenCalledExactlyOnceWith("uuid1");
    expect(readCourseProgress(storage, "a", "html").completed).toEqual(["uuid1", "antiga", "html-a1"]);
    expect(readCourseProgress(storage, "a", "html").pending).toEqual(["antiga"]);
  });

  it("mantem conclusao pendente apos perder a resposta e repete a mesma identidade", async () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "aula1", "aula2");
    const awarded = new Set<string>();
    let xp = 0;
    let responseLost = true;
    const complete = vi.fn(async (id: string) => {
      if (!awarded.has(id)) { awarded.add(id); xp += 10; }
      if (responseLost) { responseLost = false; throw new Error("Resposta perdida"); }
    });
    const args = { storage, userId: "a", courseSlug: "html", lessonIds: ["aula1"], complete };
    expect((await syncPendingCourseProgress(args)).pending).toEqual(["aula1"]);
    expect((await syncPendingCourseProgress(args)).pending).toEqual([]);
    expect(xp).toBe(10);
    expect(complete.mock.calls).toEqual([["aula1"], ["aula1"]]);
    expect(readCourseProgress(storage, "a", "html").completed).toEqual(["aula1"]);
  });

  it("isola a fila por conta e curso", async () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "aula1", "aula2");
    const complete = vi.fn();
    await syncPendingCourseProgress({ storage, userId: "b", courseSlug: "html", lessonIds: ["aula1"], complete });
    await syncPendingCourseProgress({ storage, userId: "a", courseSlug: "sql", lessonIds: ["aula1"], complete });
    expect(complete).not.toHaveBeenCalled();
    expect(readCourseProgress(storage, "a", "html").pending).toEqual(["aula1"]);
  });

  it("nao perde aula adicionada enquanto uma resposta esta em voo", async () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "aula1", "aula2");
    await syncPendingCourseProgress({ storage, userId: "a", courseSlug: "html", lessonIds: ["aula1", "aula2"], complete: async () => {
      queueCourseLesson(storage, "a", "html", "aula2", "aula2");
    } });
    expect(readCourseProgress(storage, "a", "html")).toEqual({ completed: ["aula1", "aula2"], pending: ["aula2"], lastLessonId: "aula2" });
  });

  it("nao associa um slug ambiguo e detecta storage bloqueado", () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "duplicada", "duplicada");
    expect(reconcileCourseProgress(storage, "a", "html", [{ id: "1", slug: "duplicada" }, { id: "2", slug: "duplicada" }]).completed).toEqual(["duplicada"]);
    expect(queueCourseLesson({ getItem: () => null, setItem: () => { throw new Error("quota"); } }, "a", "html", "x", "x").stored).toBe(false);
  });

  it("preserva duas abas mesmo se o agregado de uma aba sobrescrever o outro", () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "aula1", "aula1");
    const staleTab = readCourseProgress(storage, "a", "html");
    queueCourseLesson(storage, "a", "html", "aula2", "aula2");
    // A primeira aba recebe confirmacao depois de a segunda salvar outra aula.
    writeCourseProgress(storage, "a", "html", { ...staleTab, pending: [] });
    expect(readCourseProgress(storage, "a", "html")).toMatchObject({ completed: ["aula1", "aula2"], pending: ["aula2"] });
  });

  it("nao volta a reenfileirar alias antigo depois da confirmacao do UUID", async () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "html-a1", "html-a1");
    const lessons = [{ id: "uuid1", slug: "html-a1" }];
    reconcileCourseProgress(storage, "a", "html", lessons);
    await syncPendingCourseProgress({ storage, userId: "a", courseSlug: "html", lessonIds: ["uuid1"], complete: async () => {} });
    expect(reconcileCourseProgress(storage, "a", "html", lessons).pending).toEqual([]);
  });

  it("tolera o getter de localStorage bloqueado antes de chamar o helper", () => {
    vi.stubGlobal("window", { get localStorage() { throw new Error("blocked"); } });
    expect(getBrowserStorage()).toBeNull();
    vi.unstubAllGlobals();
  });

  it("recupera o journal mesmo com snapshot agregado danificado", () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "aula1", "aula1");
    storage.setItem("orbitacademy-progress-a-html", "{invalid");
    expect(readCourseProgress(storage, "a", "html")).toMatchObject({ completed: ["aula1"], pending: ["aula1"] });
  });

  it("nao declara nova aula salva so porque um journal anterior ainda e gravavel", () => {
    const storage = memoryStorage();
    queueCourseLesson(storage, "a", "html", "antiga", "antiga");
    const quotaStorage = { ...storage, get length() { return storage.length; }, setItem: (key: string, value: string) => {
      if (!key.endsWith(":lesson:antiga")) throw new Error("quota");
      storage.setItem(key, value);
    } };
    expect(queueCourseLesson(quotaStorage, "a", "html", "nova", "nova").stored).toBe(false);
    expect(readCourseProgress(storage, "a", "html").pending).toEqual(["antiga"]);
  });
});
