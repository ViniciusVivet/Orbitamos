import { describe, expect, it } from "vitest";
import { getStudyPathStep, readStudyPath, serializeStudyPath, studyPathKey } from "./academyStudyPath";
import { getAcademyActivity } from "./academyActivity";

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
  it("ends the available pilot honestly instead of targeting a locked module", () => {
    const activity = fresh();
    for (const item of activity.items.filter(item => item.group === "csharp")) item.status = "completed";
    const step = getStudyPathStep("csharp", activity);
    expect(step.pilotComplete).toBe(true);
    expect(step.href).toBe("/estudante/trilhas/csharp");
    expect(step.detail).toContain("em preparação");
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
