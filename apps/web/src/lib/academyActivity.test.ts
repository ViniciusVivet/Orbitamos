import { describe, expect, it } from "vitest";
import { academyResumeEntry, getAcademyActivity, readAcademyResume, resumeStorageKey } from "./academyActivity";
import { emptyJournal, journalKey, recordPractice } from "./practiceStation";
import { desafios } from "./desafios";
import { guidedStorageKey } from "./guidedPractice";
import { emptyQuest, questKey, questSteps } from "./sqlQuest";
import { englishLessons, englishStorageKey } from "./codeEnglish";
import { csharpModules } from "./csharpModules";
import { csharpProgressKey } from "./csharpTrack";
import { fasesMonteCodigo, JOGO_STORAGE_PREFIX } from "./jogoMonteCodigo";

function store(initial: Record<string, unknown> = {}) { const saves = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)])); return { saves, read: (key: string) => saves.get(key) ?? null }; }
describe("Academy read-only continuity", () => {
  it("offers no invented progress or last activity to a new account", () => {
    const result = getAcademyActivity("a", () => null);
    expect(result.continueItem).toBeNull();
    expect(result.items.every(item => item.status === "new" && item.completedUnits === 0 && !item.practiced)).toBe(true);
    expect(result.summaries.experiences.completed).toBe(0);
    expect(result.summaries.csharp.total).toBe(3);
  });
  it("keeps accounts separate and never modifies the saves it reads", () => {
    const data = store({ [journalKey("a")]: recordPractice(emptyJournal(), "english", "complete", 1000) });
    const before = [...data.saves];
    expect(getAcademyActivity("a", data.read).summaries.experiences.completed).toBe(1);
    expect(getAcademyActivity("b", data.read).summaries.experiences.completed).toBe(0);
    expect([...data.saves]).toEqual(before);
  });
  it("does not turn visits, empty defaults or corrupt records into validated work", () => {
    const challenge = desafios[0];
    const data = store({ [journalKey("u")]: recordPractice(emptyJournal(), "delivery", "open", 1000), [`orbitamos-pratica-u-${challenge.slug}`]: { code: challenge.codigoInicial, currentStep: 0, stepStatus: [], stepAttempts: [] }, [questKey("u")]: emptyQuest() });
    data.saves.set(englishStorageKey("u"), "broken");
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem?.id).toBe("delivery");
    expect(result.continueItem?.status).toBe("opened");
    expect(result.continueItem?.practiced).toBe(false);
    expect(result.summaries.experiences.completed).toBe(0);
    expect(result.items.find(item => item.id === `code:${challenge.slug}`)?.status).toBe("new");
  });
  it("recognizes real guided and free editor completion without counting the same challenge twice", () => {
    const challenge = desafios[0];
    const data = store({ [guidedStorageKey("u", challenge.slug)]: { version: 1, code: "let treino = 1;", mission: 0, line: 0, passed: challenge.steps.map((_, index) => index), started: true }, [`orbitamos-pratica-u-${challenge.slug}`]: { code: "let treino = 1;", stepStatus: challenge.steps.map(() => "success") } });
    const result = getAcademyActivity("u", data.read);
    expect(result.summaries.code.completed).toBe(1);
    expect(result.items.find(item => item.id === `code:${challenge.slug}`)?.completedUnits).toBe(challenge.steps.length);
  });
  it("finds untimestamped drafts honestly and separates C# modules from experiences", () => {
    const config = csharpModules.conditions;
    const data = store({ [config.key("u")]: { version: 1, active: config.activities[1].id, drafts: {}, done: [config.activities[0].id], answers: {} }, [csharpProgressKey("u")]: { version: 1, view: "pilot" } });
    data.saves.set(`${csharpProgressKey("u")}-module`, "conditions");
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem?.id).toBe("csharp:conditions");
    expect(result.continueItem?.lastAt).toBeUndefined();
    expect(result.summaries.experiences.practiced).toBe(0);
    expect(result.summaries.csharp.practiced).toBe(1);
  });
  it("continues the next authored game phase rather than always returning to phase one", () => {
    const data = store({ [`${JOGO_STORAGE_PREFIX}-u-${fasesMonteCodigo[0].slug}`]: { concluido: true, tentativas: 1 } });
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem?.id).toBe("assembly");
    expect(result.continueItem?.href).toBe(`/estudante/jogos/${fasesMonteCodigo[1].slug}`);
    expect(result.continueItem?.completedUnits).toBe(1);
  });
  it("uses the separate resume index chronologically, without awarding completion for a visit", () => {
    const challenge = desafios[0];
    const data = store({ [journalKey("u")]: recordPractice(emptyJournal(), "english", "open", 1000), [resumeStorageKey("u")]: academyResumeEntry(`/estudante/pratica/${challenge.slug}`, 2000) });
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem?.id).toBe(`code:${challenge.slug}`);
    expect(result.continueItem?.status).toBe("opened");
    expect(result.continueItem?.lastAt).toBe(2000);
    expect(result.summaries.code.completed).toBe(0);
  });
  it("resumes a recently chosen unfinished game phase, but advances past a completed one", () => {
    const phase = fasesMonteCodigo[2];
    const href = `/estudante/jogos/${phase.slug}`;
    const data = store({ [resumeStorageKey("u")]: academyResumeEntry(href, 2000), [`${JOGO_STORAGE_PREFIX}-u-${phase.slug}`]: { concluido: false, tentativas: 2 } });
    expect(getAcademyActivity("u", data.read).continueItem?.href).toBe(href);
    data.saves.set(`${JOGO_STORAGE_PREFIX}-u-${phase.slug}`, JSON.stringify({ concluido: true, tentativas: 2 }));
    expect(getAcademyActivity("u", data.read).continueItem?.href).toBe(`/estudante/jogos/${fasesMonteCodigo[0].slug}`);
  });
  it("offers an application step after completed SQL, not the completed introductory step", () => {
    const data = store({ [questKey("u")]: { ...emptyQuest(), step: questSteps.length } });
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem?.status).toBe("completed");
    expect(result.continueItem?.nextHref).toBe("/estudante/trilhas/sql?mode=workshop");
  });
  it("honors finished game checks even when the optional journal is missing", () => {
    const data = store({ [englishStorageKey("u")]: { version: 1, current: englishLessons.length - 1, completed: englishLessons.map(scene => scene.id), finished: true, draft: "" } });
    const result = getAcademyActivity("u", data.read);
    expect(result.items.find(item => item.id === "english")?.status).toBe("completed");
    expect(result.summaries.experiences.completed).toBe(1);
    expect(result.summaries.experiences.reviewed).toBe(0);
  });
  it("offers the next application after a recent completion instead of an undated old draft", () => {
    const challenge = desafios[0];
    const data = store({ [journalKey("u")]: recordPractice(emptyJournal(), "english", "complete", 2000), [guidedStorageKey("u", challenge.slug)]: { version: 1, code: "let nome", mission: 0, line: 0, passed: [], started: true } });
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem?.id).toBe("english");
    expect(result.continueItem?.status).toBe("completed");
    expect(result.continueItem?.nextHref).toContain("/estudante/pratica/");
  });
  it("whitelists learning routes and timestamps and strips unrelated or sensitive query data", () => {
    for (const href of ["https://evil.test/estudante/trilhas/sql", "//evil.test", "/estudante", "/estudante/pratica", "/estudante/aulas", "/estudante/jogos", "/estudante/pratica/unknown", "/entrar?password=x"]) expect(academyResumeEntry(href)).toBeNull();
    expect(academyResumeEntry("/estudante/trilhas/sql?mode=workshop&token=secret", 1000)).toEqual({ href: "/estudante/trilhas/sql?mode=workshop", updatedAt: 1000 });
    expect(academyResumeEntry("/estudante/trilhas/csharp?token=secret", 1000)?.href).toBe("/estudante/trilhas/csharp");
    expect(academyResumeEntry("/estudante/trilhas/sql", Number.NaN)).toBeNull();
    expect(readAcademyResume('{"href":"/estudante/trilhas/sql","updatedAt":999999999999999}')).toBeNull();
    expect(readAcademyResume("corrupt")).toBeNull();
  });
});
