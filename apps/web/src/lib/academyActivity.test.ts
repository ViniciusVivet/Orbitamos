import { describe, expect, it } from "vitest";
import { academyResumeEntry, getAcademyActivity, readAcademyResume, resumeStorageKey } from "./academyActivity";
import { emptyJournal, journalKey, recordPractice } from "./practiceStation";
import { desafios, getDesafio } from "./desafios";
import { beginnerPracticeKey, emptyBeginnerPractice } from "./beginnerPractice";
import { guidedStorageKey } from "./guidedPractice";
import { emptyQuest, questKey, questSteps } from "./sqlQuest";
import { englishLessons, englishStorageKey } from "./codeEnglish";
import { csharpModules } from "./csharpModules";
import { csharpProgressKey } from "./csharpTrack";
import { fasesMonteCodigo, JOGO_STORAGE_PREFIX } from "./jogoMonteCodigo";
import { chapterMissionIds, emptyChapterSave, orbiChapterKey } from "./orbiChapter";
import { deliveryMissions, deliveryStorageKey } from "./orbiDelivery";
import { emptyPulseSave, pulseSaveKey } from "./orbiPulse";
import { ORBI_PULSE_HREF, WORK_DELIVERY_HREF, WORK_SIMULATION_HREF } from "./portalNavigation";
import { emptyWorkSave, getWorkCase, WORK_CASE_IDS, workSimulationKey } from "./workSimulation";
import { emptyWorkDeliverySave, WORK_DELIVERY_STARTER_CODE, workDeliveryKey } from "./workDelivery";

function store(initial: Record<string, unknown> = {}) { const saves = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)])); return { saves, read: (key: string) => saves.get(key) ?? null }; }
describe("Academy read-only continuity", () => {
  it("shows legacy delivery history separately while counting only the new chapter", () => {
    const oldRecord = { version: 1 as const, activities: { delivery: { openedAt: 900, completedAt: 1000, reviewedAt: 2000, reviews: 3 } } };
    const data = store({ [deliveryStorageKey("u")]: { version: 1, current: 2, completed: deliveryMissions.map(mission => mission.id) }, [journalKey("u")]: oldRecord });
    const before = [...data.saves];
    const first = getAcademyActivity("u", data.read).items.find(item => item.id === "delivery")!;
    expect(first).toMatchObject({ completedUnits: 0, totalUnits: 3, practiced: false, reviewed: 0 });
    expect(first.status).not.toBe("completed");
    expect(first.history).toContain("3 de 3 entregas");
    expect(first.lastAt).toBeUndefined();
    expect([...data.saves]).toEqual(before);
    const chapter = { ...emptyChapterSave(), completed: ["ponte"], current: "elevador", attempts: { ponte: 1, elevador: 2, farol: 0 } };
    data.saves.set(orbiChapterKey("u"), JSON.stringify(chapter));
    expect(getAcademyActivity("u", data.read).items.find(item => item.id === "delivery")).toMatchObject({ status: "in-progress", completedUnits: 1, reviewed: 0 });
    data.saves.set(orbiChapterKey("u"), JSON.stringify({ ...chapter, completed: chapterMissionIds }));
    expect(getAcademyActivity("u", data.read).items.find(item => item.id === "delivery")).toMatchObject({ status: "completed", completedUnits: 3, reviewed: 0 });
    data.saves.set(journalKey("u"), JSON.stringify(recordPractice(recordPractice(oldRecord, "delivery", "complete", 3000), "delivery", "review", 4000)));
    const complete = getAcademyActivity("u", data.read).items.find(item => item.id === "delivery")!;
    expect(complete).toMatchObject({ status: "completed", completedUnits: 3, reviewed: 1, lastAt: 4000 });
    expect(complete.history).toContain("Jogo anterior");
    expect(getAcademyActivity("another", data.read).items.find(item => item.id === "delivery")).toMatchObject({ status: "new", completedUnits: 0, practiced: false });
  });
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
    const challenge = getDesafio("funcoes-js")!;
    const data = store({ [guidedStorageKey("u", challenge.slug)]: { version: 1, code: "let treino = 1;", mission: 0, line: 0, passed: challenge.steps.map((_, index) => index), started: true }, [`orbitamos-pratica-u-${challenge.slug}`]: { code: "let treino = 1;", stepStatus: challenge.steps.map(() => "success") } });
    const result = getAcademyActivity("u", data.read);
    expect(result.summaries.code.completed).toBe(1);
    expect(result.items.find(item => item.id === `code:${challenge.slug}`)?.completedUnits).toBe(challenge.steps.length);
  });
  it("preserves finished beginner missions and requires both application phases for a full delivery", () => {
    const challenge = getDesafio("variaveis-js")!;
    const guide = { version: 1, code: 'let nome = "Lia";', mission: 2, line: 0, passed: [0, 1, 2], started: true };
    const data = store({ [guidedStorageKey("u", challenge.slug)]: guide });
    const pending = getAcademyActivity("u", data.read).items.find(item => item.id === `code:${challenge.slug}`)!;
    expect(pending).toMatchObject({ status: "in-progress", completedUnits: 3, totalUnits: 5 });
    expect(pending.detail).toContain("Código inicial validado");
    const base = emptyBeginnerPractice(challenge.slug, guide.code);
    const application = { ...base, stage: "independent", adaptationCode: 'let nome = "Bia";', adaptationValidated: true, adaptationValidatedCode: 'let nome = "Bia";', adaptationValidatedAt: 1000, code: 'let nome = "Caio";', validated: true, validatedCode: 'let nome = "Caio";', validatedAt: 2000 };
    data.saves.set(beginnerPracticeKey("u", challenge.slug), JSON.stringify(application));
    expect(getAcademyActivity("u", data.read).items.find(item => item.id === `code:${challenge.slug}`)).toMatchObject({ status: "completed", completedUnits: 5, totalUnits: 5 });
    data.saves.set(beginnerPracticeKey("u", challenge.slug), JSON.stringify({ ...application, code: 'let nome = "Editado";' }));
    expect(getAcademyActivity("u", data.read).items.find(item => item.id === `code:${challenge.slug}`)).toMatchObject({ status: "in-progress", completedUnits: 4 });
    expect(data.saves.get(guidedStorageKey("u", challenge.slug))).toBe(JSON.stringify(guide));
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
  it("resumes the pulse workshop independently of an already completed delivery chapter", () => {
    const data = store({
      [orbiChapterKey("u")]: { ...emptyChapterSave(), completed: chapterMissionIds },
      [journalKey("u")]: recordPractice(emptyJournal(), "delivery", "complete", 1000),
    });
    const baseline = getAcademyActivity("u", data.read);
    data.saves.set(resumeStorageKey("u"), JSON.stringify(academyResumeEntry(ORBI_PULSE_HREF, 2000)));
    const before = [...data.saves];
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem).toMatchObject({ id: "pulse-workshop", href: ORBI_PULSE_HREF, title: "Oficina do Pulso", status: "opened", completedUnits: 0, totalUnits: 2, practiced: false, lastAt: 2000 });
    expect(result.items.find(item => item.id === "delivery")).toMatchObject({ status: "completed", completedUnits: 3 });
    expect(result.items.some(item => item.id === "pulse-workshop")).toBe(false);
    expect(result.summaries).toEqual(baseline.summaries);
    expect([...data.saves]).toEqual(before);
    expect(getAcademyActivity("another", data.read).continueItem).toBeNull();
  });
  it("reads the pulse route from its own account save and offers code after both real completions", () => {
    const pulse = { ...emptyPulseSave(), completed: ["alcance"], current: "ritmo", attempts: { alcance: 2, ritmo: 1 } };
    const data = store({ [pulseSaveKey("u")]: pulse, [resumeStorageKey("u")]: academyResumeEntry(ORBI_PULSE_HREF, 2000) });
    const before = [...data.saves];
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem).toMatchObject({ id: "pulse-workshop", status: "in-progress", completedUnits: 1, practiced: true });
    expect(result.continueItem?.detail).toContain("Dois pulsos, um reparo");
    expect(result.items.find(item => item.id === "delivery")).toMatchObject({ status: "new", completedUnits: 0 });
    expect(result.summaries.experiences.completed).toBe(0);
    expect([...data.saves]).toEqual(before);
    data.saves.set(pulseSaveKey("u"), JSON.stringify({ ...pulse, completed: ["alcance", "ritmo"] }));
    const finished = getAcademyActivity("u", data.read);
    expect(finished.continueItem).toMatchObject({ id: "pulse-workshop", status: "completed", completedUnits: 2, nextHref: "/estudante/pratica/variaveis-js?from=delivery" });
    expect(finished.summaries.experiences.completed).toBe(0);
    const challenge = desafios[0];
    data.saves.set(resumeStorageKey("u"), JSON.stringify(academyResumeEntry(`/estudante/pratica/${challenge.slug}`, 3000)));
    expect(getAcademyActivity("u", data.read).continueItem?.id).toBe(`code:${challenge.slug}`);
  });
  it("whitelists learning routes and timestamps and strips unrelated or sensitive query data", () => {
    for (const href of ["https://evil.test/estudante/trilhas/sql", "//evil.test", "/estudante", "/estudante/pratica", "/estudante/aulas", "/estudante/jogos", "/estudante/pratica/unknown", "/entrar?password=x"]) expect(academyResumeEntry(href)).toBeNull();
    expect(academyResumeEntry("/estudante/trilhas/sql?mode=workshop&token=secret", 1000)).toEqual({ href: "/estudante/trilhas/sql?mode=workshop", updatedAt: 1000 });
    expect(academyResumeEntry("/estudante/trilhas/csharp?token=secret", 1000)?.href).toBe("/estudante/trilhas/csharp");
    expect(academyResumeEntry("/estudante/trilhas/sql", Number.NaN)).toBeNull();
    expect(readAcademyResume('{"href":"/estudante/trilhas/sql","updatedAt":999999999999999}')).toBeNull();
    expect(readAcademyResume("corrupt")).toBeNull();
    expect(academyResumeEntry(ORBI_PULSE_HREF + "?secret=x", 1000)).toBeNull();
    expect(academyResumeEntry("/estudante/jogos/entregas-do-orbi?token=secret#oficina-do-pulso", 1000)).toEqual({ href: ORBI_PULSE_HREF, updatedAt: 1000 });
    expect(readAcademyResume(JSON.stringify({ href: ORBI_PULSE_HREF, updatedAt: 1000 }))).toEqual({ href: ORBI_PULSE_HREF, updatedAt: 1000 });
    for (const href of ["/estudante/trilhas/sql#oficina-do-pulso", "/estudante/jogos/entregas-do-orbi#unknown", "/estudante/jogos/entregas-do-orbi#oficina-do-pulso?redirect=https://evil.test", "https://evil.test/estudante/jogos/entregas-do-orbi#oficina-do-pulso"]) expect(academyResumeEntry(href, 1000)).toBeNull();
  });
  it("keeps the work collection outside the six activities and reads its save only for its canonical resume", () => {
    const data = store({ [workSimulationKey("u")]: { ...emptyWorkSave(), completed: [...WORK_CASE_IDS] }, "orbitamos-work-legacy-u": { unknown: "preserve" } });
    const before = [...data.saves];
    const keys: string[] = [];
    const read = (key: string) => { keys.push(key); return data.read(key); };
    const baseline = getAcademyActivity("u", read);
    expect(keys).not.toContain(workSimulationKey("u"));
    expect(baseline.continueItem).toBeNull();
    expect(baseline.summaries.experiences.total).toBe(6);
    data.saves.set(resumeStorageKey("u"), JSON.stringify(academyResumeEntry("/estudante/pratica/variaveis-js", 2000)));
    keys.length = 0;
    getAcademyActivity("u", read);
    expect(keys).not.toContain(workSimulationKey("u"));
    data.saves.delete(resumeStorageKey("u"));
    expect([...data.saves]).toEqual(before);
  });
  it("offers a work visit as a separate continuation without validated work or aggregate progress", () => {
    const baseline = getAcademyActivity("u", () => null);
    const data = store({ [resumeStorageKey("u")]: academyResumeEntry(WORK_SIMULATION_HREF, 2000) });
    const before = [...data.saves];
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem).toMatchObject({ id: "work-simulation", title: "Simulador de trabalho", href: WORK_SIMULATION_HREF, status: "opened", completedUnits: 0, totalUnits: 2, practiced: false, reviewed: 0, lastAt: 2000 });
    expect(result.continueItem?.detail).toBe(`Loja do Bairro · ${getWorkCase("checkout-staging").title}`);
    expect(result.items.some(item => item.id === "work-simulation")).toBe(false);
    expect(result.summaries).toEqual(baseline.summaries);
    expect(getAcademyActivity("another", data.read).continueItem).toBeNull();
    expect([...data.saves]).toEqual(before);
  });
  it("resumes the saved work case per account and preserves its existing completion evidence", () => {
    const saved = { ...emptyWorkSave(), current: "checkout-transfer", completed: ["checkout-staging"], attempts: { "checkout-staging": 2, "checkout-transfer": 1 } };
    const data = store({ [workSimulationKey("u")]: saved, [resumeStorageKey("u")]: academyResumeEntry(WORK_SIMULATION_HREF, 2000) });
    const before = [...data.saves];
    const result = getAcademyActivity("u", data.read);
    expect(result.continueItem).toMatchObject({ id: "work-simulation", status: "in-progress", completedUnits: 1, practiced: true, href: WORK_SIMULATION_HREF });
    expect(result.continueItem?.detail).toBe(`Loja do Bairro · ${getWorkCase("checkout-transfer").title}`);
    expect(result.summaries.experiences).toMatchObject({ completed: 0, practiced: 0, total: 6 });
    expect([...data.saves]).toEqual(before);
    data.saves.set(workSimulationKey("u"), JSON.stringify({ ...saved, completed: [...WORK_CASE_IDS] }));
    expect(getAcademyActivity("u", data.read).continueItem).toMatchObject({ status: "completed", completedUnits: 2, nextHref: WORK_DELIVERY_HREF, nextLabel: "Continuar na esteira" });
    expect(getAcademyActivity("u", data.read).summaries).toEqual(result.summaries);
    data.saves.set(resumeStorageKey("another"), JSON.stringify(academyResumeEntry(WORK_SIMULATION_HREF, 3000)));
    expect(getAcademyActivity("another", data.read).continueItem).toMatchObject({ status: "opened", completedUnits: 0, practiced: false });
  });
  it("allows only the authored work route and treats an unreadable work save as unvalidated", () => {
    expect(academyResumeEntry(WORK_SIMULATION_HREF + "?token=secret", 1000)).toEqual({ href: WORK_SIMULATION_HREF, updatedAt: 1000 });
    for (const href of [WORK_SIMULATION_HREF + "/unknown", WORK_SIMULATION_HREF + "#unknown", "/dev/work-simulation-preview?from=academy", "https://evil.test" + WORK_SIMULATION_HREF]) expect(academyResumeEntry(href, 1000)).toBeNull();
    const data = store({ [resumeStorageKey("u")]: academyResumeEntry(WORK_SIMULATION_HREF, 2000) });
    data.saves.set(workSimulationKey("u"), "corrupt");
    const before = [...data.saves];
    expect(getAcademyActivity("u", data.read).continueItem).toMatchObject({ id: "work-simulation", status: "opened", completedUnits: 0, practiced: false });
    expect([...data.saves]).toEqual(before);
  });
  it("keeps the delivery phase separate from both the original cases and aggregate completion", () => {
    const data = store({
      [workSimulationKey("u")]: { ...emptyWorkSave(), current: "checkout-transfer", completed: [...WORK_CASE_IDS] },
      [workDeliveryKey("u")]: emptyWorkDeliverySave(),
      [resumeStorageKey("u")]: academyResumeEntry(WORK_DELIVERY_HREF, 2000),
    });
    const baseline = getAcademyActivity("u", () => null);
    const before = [...data.saves];
    const keys: string[] = [];
    const result = getAcademyActivity("u", key => { keys.push(key); return data.read(key); });
    expect(result.continueItem).toMatchObject({ id: "work-delivery", title: "A esteira de homologação", href: WORK_DELIVERY_HREF, status: "opened", completedUnits: 0, totalUnits: 1, unit: "tarefa", practiced: false, reviewed: 0, lastAt: 2000 });
    expect(result.continueItem?.detail).toContain("Loja do Bairro");
    expect(result.items.some(item => item.id === "work-delivery" || item.id === "work-simulation")).toBe(false);
    expect(result.summaries).toEqual(baseline.summaries);
    expect(keys).toContain(workDeliveryKey("u"));
    expect(keys).not.toContain(workSimulationKey("u"));
    expect([...data.saves]).toEqual(before);
    expect(getAcademyActivity("another", data.read).continueItem).toBeNull();
  });
  it("reads the delivery phase only for its exact resume and scopes it to the current account", () => {
    const data = store({ [workDeliveryKey("u")]: { ...emptyWorkDeliverySave(), completed: true } });
    const keys: string[] = [];
    const read = (key: string) => { keys.push(key); return data.read(key); };
    expect(getAcademyActivity("u", read).continueItem).toBeNull();
    expect(keys).not.toContain(workDeliveryKey("u"));
    data.saves.set(resumeStorageKey("u"), JSON.stringify(academyResumeEntry(WORK_SIMULATION_HREF, 2000)));
    keys.length = 0;
    expect(getAcademyActivity("u", read).continueItem?.id).toBe("work-simulation");
    expect(keys).not.toContain(workDeliveryKey("u"));
    data.saves.set(resumeStorageKey("u"), JSON.stringify(academyResumeEntry(WORK_DELIVERY_HREF, 3000)));
    const before = [...data.saves];
    const complete = getAcademyActivity("u", read);
    expect(complete.continueItem).toMatchObject({ id: "work-delivery", status: "completed", completedUnits: 1, totalUnits: 1, practiced: true, nextHref: "/estudante/pratica" });
    expect(complete.summaries.experiences).toMatchObject({ total: 6, completed: 0, practiced: 0 });
    expect([...data.saves]).toEqual(before);
    data.saves.set(resumeStorageKey("another"), JSON.stringify(academyResumeEntry(WORK_DELIVERY_HREF, 3000)));
    expect(getAcademyActivity("another", read).continueItem).toMatchObject({ id: "work-delivery", status: "opened", completedUnits: 0, practiced: false });
  });
  it("distinguishes phase attempts and drafts from validated completion without rewriting unreadable data", () => {
    const data = store({ [resumeStorageKey("u")]: academyResumeEntry(WORK_DELIVERY_HREF, 2000) });
    for (const value of [{ ...emptyWorkDeliverySave(), attempts: 1 }, { ...emptyWorkDeliverySave(), draft: WORK_DELIVERY_STARTER_CODE + " " }]) {
      data.saves.set(workDeliveryKey("u"), JSON.stringify(value));
      expect(getAcademyActivity("u", data.read).continueItem).toMatchObject({ id: "work-delivery", status: "in-progress", completedUnits: 0, practiced: true });
    }
    data.saves.set(workDeliveryKey("u"), "corrupt");
    const before = [...data.saves];
    expect(getAcademyActivity("u", data.read).continueItem).toMatchObject({ status: "opened", completedUnits: 0, practiced: false });
    expect([...data.saves]).toEqual(before);
  });
  it("accepts only the exact authored delivery anchor and removes query data before persisting it", () => {
    expect(academyResumeEntry(WORK_SIMULATION_HREF + "?token=secret&mode=other#esteira", 1000)).toEqual({ href: WORK_DELIVERY_HREF, updatedAt: 1000 });
    expect(readAcademyResume(JSON.stringify({ href: WORK_DELIVERY_HREF, updatedAt: 1000 }))).toEqual({ href: WORK_DELIVERY_HREF, updatedAt: 1000 });
    for (const href of [
      WORK_DELIVERY_HREF + "?token=secret", WORK_DELIVERY_HREF + "&redirect=https://evil.test", WORK_DELIVERY_HREF + "#other",
      WORK_SIMULATION_HREF + "#Esteira", WORK_SIMULATION_HREF + "#%65steira", "/estudante/trilhas/sql#esteira",
      "/estudante/jogos/entregas-do-orbi#esteira", "/dev/work-simulation-preview?from=academy#esteira", "https://evil.test" + WORK_DELIVERY_HREF,
    ]) expect(academyResumeEntry(href, 1000)).toBeNull();
  });
});
