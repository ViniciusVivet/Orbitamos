import { describe, expect, it } from "vitest";
import { getStudyPathStep, readStudyPath, serializeStudyPath, studyPathKey } from "./academyStudyPath";
import { getAcademyActivity } from "./academyActivity";
import { academyResumeEntry, resumeStorageKey } from "./academyResume";
import { CSHARP_METHODS_HREF, CSHARP_OBJECTS_HREF } from "./portalNavigation";
import { csharpMethodsActivities, csharpMethodsKey, declareCSharpMethodsRun, newCSharpMethodsProgress, setCSharpMethodsDraft } from "./csharpMethods";
import { csharpObjectsActivities, csharpObjectsKey, declareCSharpObjectsRun, newCSharpObjectsProgress, setCSharpObjectsDraft } from "./csharpObjects";
import { csharpProgressKey, newCSharpProgress } from "./csharpTrack";

const fresh = () => getAcademyActivity("test", () => null);
describe("a student's chosen formation", () => {
  it("accepts only authored versioned choices and isolates accounts", () => {
    expect(readStudyPath(serializeStudyPath("csharp"))).toBe("csharp");
    expect(readStudyPath(serializeStudyPath("sql"))).toBe("sql");
    expect(readStudyPath(serializeStudyPath("fundamentals"))).toBe("fundamentals");
    for (const raw of [null, "broken", "[]", '"sql"', '{"path":"sql"}', '{"version":2,"path":"sql"}', '{"version":1,"path":"https://bad.invalid"}']) expect(readStudyPath(raw)).toBeNull();
    expect(studyPathKey("one")).not.toBe(studyPathKey("two"));
  });
  it("opens the track introduction without inventing prior progress", () => {
    expect(getStudyPathStep("csharp", fresh()).href).toBe("/estudante/trilhas/csharp");
    expect(getStudyPathStep("sql", null).href).toBe("/estudante/trilhas/sql");
    expect(getStudyPathStep("csharp", fresh()).pilotComplete).toBe(false);
  });
  it("does not replace the chosen C# formation with a recent English visit", () => {
    const activity = fresh();
    activity.items.find(item => item.id === "csharp:variables")!.status = "completed";
    const english = activity.items.find(item => item.id === "english")!;
    english.status = "opened"; english.lastAt = Date.now(); activity.continueItem = english;
    expect(getStudyPathStep("csharp", activity).href).toBe("/estudante/trilhas/csharp?module=conditions");
    expect(activity.continueItem.id).toBe("english");
  });
  it("resumes work within the chosen track and never treats a visit as practiced", () => {
    const activity = fresh();
    const variables = activity.items.find(item => item.id === "csharp:variables")!;
    variables.status = "opened"; variables.lastAt = Date.now();
    expect(getStudyPathStep("csharp", activity).href).toBe("/estudante/trilhas/csharp");
    const conditions = activity.items.find(item => item.id === "csharp:conditions")!;
    conditions.status = "in-progress"; conditions.practiced = true;
    expect(getStudyPathStep("csharp", activity).href).toBe(conditions.href);
  });
  it("continues from the three browser modules into the available .NET project without closing the formation", () => {
    const activity = fresh();
    for (const item of activity.items.filter(item => item.group === "csharp")) item.status = "completed";
    const before = JSON.stringify(activity);
    const step = getStudyPathStep("csharp", activity);
    expect(step).toMatchObject({ href: CSHARP_METHODS_HREF, action: "Continuar no projeto .NET", pilotComplete: false });
    expect(step.detail).toContain("SDK .NET 10");
    expect(step.detail).toContain("objetos e listas");
    expect(JSON.stringify(activity)).toBe(before);
  });
  it.each([
    [CSHARP_METHODS_HREF, "csharp-methods"],
    [CSHARP_OBJECTS_HREF, "csharp-objects"],
  ])("respects the explicitly resumed native unit %s within the chosen C# formation", (href, id) => {
    const resume = JSON.stringify(academyResumeEntry(href, 3000));
    const activity = getAcademyActivity("test", key => key === resumeStorageKey("test") ? resume : null);
    const before = JSON.stringify(activity);
    expect(activity.continueItem).toMatchObject({ id, href, status: "opened", completedUnits: 0 });
    const step = getStudyPathStep("csharp", activity);
    expect(step).toMatchObject({ href, pilotComplete: false });
    expect(step.detail).toBe(activity.continueItem!.detail);
    expect(getStudyPathStep("fundamentals", activity).href).toBe("/estudante/pratica/variaveis-js");
    expect(getStudyPathStep("sql", activity).href).toBe("/estudante/trilhas/sql");
    expect(JSON.stringify(activity)).toBe(before);
  });
  it("does not advance or close the C# path when every native activity is self-reported", () => {
    let methods = newCSharpMethodsProgress();
    for (const item of csharpMethodsActivities) methods = declareCSharpMethodsRun(setCSharpMethodsDraft(methods, item.id, "my method draft"), item.id, 2000);
    let objects = newCSharpObjectsProgress();
    for (const item of csharpObjectsActivities) objects = declareCSharpObjectsRun(setCSharpObjectsDraft(objects, item.id, "my object draft"), item.id, 2000);
    const saves = new Map([
      [csharpMethodsKey("test"), JSON.stringify(methods)],
      [csharpObjectsKey("test"), JSON.stringify(objects)],
    ]);
    for (const href of [CSHARP_METHODS_HREF, CSHARP_OBJECTS_HREF]) {
      saves.set(resumeStorageKey("test"), JSON.stringify(academyResumeEntry(href, 3000)));
      const activity = getAcademyActivity("test", key => saves.get(key) ?? null);
      const before = JSON.stringify(activity);
      expect(getStudyPathStep("csharp", activity)).toMatchObject({ href, pilotComplete: false });
      expect(activity.continueItem).toMatchObject({ status: "in-progress", completedUnits: 0 });
      expect(activity.summaries.csharp).toMatchObject({ completed: 0, total: 3 });
      expect(JSON.stringify(activity)).toBe(before);
    }
  });
  it("resumes the chosen C# project after English while leaving global recent activity in English", () => {
    const saves = new Map([
      [csharpProgressKey("test"), JSON.stringify({ ...newCSharpProgress(), projectUnit: "objects" })],
      [csharpObjectsKey("test"), JSON.stringify(setCSharpObjectsDraft(newCSharpObjectsProgress(), "independent", "my selection"))],
      [resumeStorageKey("test"), JSON.stringify(academyResumeEntry(CSHARP_OBJECTS_HREF, 3000))],
    ]);
    const read = (key: string) => saves.get(key) ?? null;
    expect(getStudyPathStep("csharp", getAcademyActivity("test", read)).href).toBe(CSHARP_OBJECTS_HREF);
    saves.set(resumeStorageKey("test"), JSON.stringify(academyResumeEntry("/estudante/jogos/ingles-em-cena#falar", 4000)));
    const activity = getAcademyActivity("test", read);
    const before = JSON.stringify(activity);
    expect(activity.continueItem?.id).toBe("spoken-english");
    expect(getStudyPathStep("csharp", activity)).toMatchObject({ href: CSHARP_OBJECTS_HREF, pilotComplete: false });
    expect(activity.csharpProjectContinuation).not.toHaveProperty("lastAt");
    expect(activity.summaries.csharp).toMatchObject({ completed: 0, total: 3 });
    expect(JSON.stringify(activity)).toBe(before);
  });
  it("gives the exact recent native unit priority over an older C# project preference", () => {
    const saves = new Map([
      [csharpProgressKey("test"), JSON.stringify({ ...newCSharpProgress(), projectUnit: "objects" })],
      [resumeStorageKey("test"), JSON.stringify(academyResumeEntry(CSHARP_METHODS_HREF, 4000))],
    ]);
    const activity = getAcademyActivity("test", key => saves.get(key) ?? null);
    expect(activity.csharpProjectContinuation?.href).toBe(CSHARP_OBJECTS_HREF);
    expect(getStudyPathStep("csharp", activity)).toMatchObject({ href: CSHARP_METHODS_HREF, pilotComplete: false });
  });
  it("does not mistake an unrelated or mismatched native pointer for the chosen C# continuation", () => {
    const activity = fresh();
    const variables = activity.items.find(item => item.id === "csharp:variables")!;
    variables.status = "in-progress";
    for (const pointer of [
      { ...variables, id: "csharp-objects", href: CSHARP_METHODS_HREF },
      { ...variables, id: "english", href: CSHARP_OBJECTS_HREF },
      { ...variables, id: "csharp-methods", href: CSHARP_METHODS_HREF + "&redirect=other" },
    ]) {
      activity.continueItem = pointer;
      activity.csharpProjectContinuation = pointer;
      expect(getStudyPathStep("csharp", activity).href).toBe(variables.href);
    }
  });
  it("carries SQL from the quest to the workshop, then to review", () => {
    const activity = fresh();
    const quest = activity.items.find(item => item.id === "sql")!;
    const workshop = activity.items.find(item => item.id === "sql-workshop")!;
    quest.status = "completed";
    expect(getStudyPathStep("sql", activity).href).toBe(workshop.href);
    workshop.status = "completed";
    expect(getStudyPathStep("sql", activity)).toMatchObject({ href: "/estudante/jogos/revisao", pilotComplete: true });
  });
  it("keeps an explicitly started workshop usable even before finishing the quest", () => {
    const activity = fresh();
    const workshop = activity.items.find(item => item.id === "sql-workshop")!;
    workshop.status = "in-progress"; workshop.practiced = true;
    expect(getStudyPathStep("sql", activity).href).toBe(workshop.href);
  });
  it("keeps the first incomplete beginner delivery ahead of unrelated or later exploration", () => {
    expect(getStudyPathStep("fundamentals", null).href).toBe("/estudante/pratica/variaveis-js");
    const activity = fresh();
    activity.items.find(item => item.id === "code:variaveis-js")!.status = "completed";
    const later = activity.items.find(item => item.id === "code:primeiro-orcamento-js")!;
    later.status = "in-progress"; later.lastAt = Date.now(); activity.continueItem = later;
    expect(getStudyPathStep("fundamentals", activity).href).toBe("/estudante/pratica/contas-servico-js");
    expect(activity.continueItem.id).toBe(later.id);
  });
  it("finishes the four-delivery path only when every authored delivery is complete", () => {
    const activity = fresh();
    for (const slug of ["variaveis-js", "contas-servico-js", "decisao-servico-js"]) activity.items.find(item => item.id === `code:${slug}`)!.status = "completed";
    expect(getStudyPathStep("fundamentals", activity).pilotComplete).toBe(false);
    activity.items.find(item => item.id === "code:primeiro-orcamento-js")!.status = "completed";
    expect(getStudyPathStep("fundamentals", activity)).toMatchObject({ href: "/estudante/pratica/primeiro-orcamento-js", pilotComplete: true });
  });
});
