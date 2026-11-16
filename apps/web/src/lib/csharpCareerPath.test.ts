import { describe, expect, it } from "vitest";
import { csharpStages } from "./csharpTrack";
import { csharpModules } from "./csharpModules";
import { compileCSharpSubset } from "./csharpSubset";
import { csharpAiRoutine, csharpAiRoutineSteps, csharpAiSafetyRule, csharpCareerHabits, csharpCareerPath, csharpLaterTopics, type CSharpCareerStageId, type CSharpCareerStagePlan } from "./csharpCareerPath";

const ids = csharpStages.map(stage => stage.id);
const plans = Object.values(csharpCareerPath) as readonly CSharpCareerStagePlan[];

describe("C# career map describes real work without inventing published lessons", () => {
  it("covers the existing eight stage identities without changing their order", () => {
    expect(Object.keys(csharpCareerPath)).toEqual(ids);
    expect(plans.map(plan => plan.id)).toEqual(ids);
  });

  it("has valid earlier prerequisites and no dependency cycle", () => {
    const visiting = new Set<CSharpCareerStageId>();
    const visited = new Set<CSharpCareerStageId>();
    function visit(id: CSharpCareerStageId) {
      expect(visiting.has(id), `cycle involving ${id}`).toBe(false);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const prerequisite of csharpCareerPath[id].prerequisites) {
        expect(ids).toContain(prerequisite);
        expect(ids.indexOf(prerequisite)).toBeLessThan(ids.indexOf(id));
        visit(prerequisite);
      }
      visiting.delete(id); visited.add(id);
    }
    ids.forEach(visit);
    expect(visited.size).toBe(ids.length);
    expect(csharpCareerPath.start.prerequisites).toEqual([]);
    // A portfolio application does not require mastering containers first.
    expect(csharpCareerPath.career.prerequisites).toContain("quality");
    expect(csharpCareerPath.career.prerequisites).not.toContain("delivery");
  });

  it("exposes exactly the three real modules and binds each to its current stage", () => {
    const advertised = plans.flatMap(plan => plan.availableModules);
    expect([...advertised].sort()).toEqual(Object.keys(csharpModules).sort());
    expect(new Set(advertised).size).toBe(advertised.length);
    for (const plan of plans) {
      for (const moduleId of plan.availableModules) {
        expect(csharpModules[moduleId].stage).toBe(ids.indexOf(plan.id));
        expect(plan.status).not.toBe("planned");
      }
      if (plan.status === "planned") {
        expect(plan.availableModules).toEqual([]);
        expect(plan.availableUnits ?? []).toEqual([]);
        expect(plan.patterns.every(pattern => pattern.status === "planned")).toBe(true);
      }
    }
    expect(csharpCareerPath.objects.availableModules).toEqual([]);
    expect(csharpCareerPath.api.availableModules).toEqual([]);
  });

  it("connects every stage to a work request, named artifacts and observable acceptance", () => {
    for (const plan of plans) {
      expect(plan.competence.length).toBeGreaterThan(20);
      expect(plan.ticket.title && plan.ticket.request && plan.ticket.why).toBeTruthy();
      expect(plan.delivery.title && plan.delivery.task && plan.delivery.artifact).toBeTruthy();
      expect(plan.patterns.length).toBeGreaterThanOrEqual(2);
      expect(plan.patterns.length).toBeLessThanOrEqual(4);
      expect(new Set(plan.patterns.map(pattern => pattern.name)).size).toBe(plan.patterns.length);
      for (const pattern of plan.patterns) expect(pattern.file && pattern.purpose).toBeTruthy();
      expect(plan.acceptance.length).toBeGreaterThanOrEqual(2);
      expect(plan.acceptance.length).toBeLessThanOrEqual(3);
      expect(plan.acceptance.every(check => check.length > 20)).toBe(true);
    }
  });

  it("opens methods and objects as SDK units while deeper OOP remains planned", () => {
    expect(plans.flatMap(plan => plan.availableUnits ?? [])).toEqual(["methods", "objects"]);
    expect(csharpCareerPath.objects.status).toBe("partial");
    expect(csharpCareerPath.objects.availableModules).toEqual([]);
    expect(csharpCareerPath.objects.availableUnits).toEqual(["methods", "objects"]);
    expect(csharpCareerPath.objects.patterns[0].status).toBe("available");
    expect(csharpCareerPath.objects.patterns.slice(0, 3).every(pattern => pattern.status === "available")).toBe(true);
    expect(csharpCareerPath.objects.patterns[3].status).toBe("planned");
    expect(csharpCareerPath.objects.artifact.file).toBe("Program.cs");
    expect(csharpCareerPath.objects.artifact.code).not.toMatch(/\b(static|class|public)\b/);
    expect(compileCSharpSubset(csharpCareerPath.objects.artifact.code).ok).toBe(false);
  });

  it("keeps mobile preparation distinct from SDK execution and teaches methods before frameworks", () => {
    for (const plan of plans) {
      expect(plan.environment.phone && plan.environment.computer).toBeTruthy();
      expect(plan.environment.requiresSdk).toBe(!["start", "logic"].includes(plan.id));
    }
    expect(csharpCareerPath.objects.patterns[0].name).toContain("Método");
    expect(csharpCareerPath.objects.environment.phone).toContain("não são executados");
    expect(csharpCareerPath.objects.environment.computer).toContain("não é uma verificação automática");
    expect(csharpCareerPath.data.delivery.task).toContain("um de cada vez");
    expect(csharpCareerPath.api.competence).toContain("antes de integrar");
    expect(csharpCareerPath.api.patterns.some(pattern => pattern.name.includes("CancellationToken"))).toBe(true);
  });

  it("labels small artifacts as examples instead of pretending each is a complete course or application", () => {
    for (const plan of plans) {
      expect(plan.artifact.file && plan.artifact.language).toBeTruthy();
      expect(plan.artifact.note.length).toBeGreaterThan(40);
      const lines = plan.artifact.code.split("\n");
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(lines.length).toBeLessThanOrEqual(4);
      expect(plan.artifact.code).not.toMatch(/\.\.\.|…|TODO/);
    }
  });

  it.each([
    ["start", "Nina\n8"],
    ["logic", "Há trabalho\nHá trabalho"],
  ] as const)("the %s excerpt actually runs in the advertised current browser subset", (id, expected) => {
    const compiled = compileCSharpSubset(csharpCareerPath[id].artifact.code);
    if (!compiled.ok) throw new Error(compiled.error);
    const output: string[] = [];
    new Function("console", compiled.code)({ log: (value: unknown) => output.push(String(value)) });
    expect(output.join("\n")).toBe(expected);
  });

  it("uses Git, debugging and technical English as habits while making AI optional and critical", () => {
    expect(csharpCareerHabits.map(habit => habit.id)).toEqual(["git", "debug", "english", "ai"]);
    const order = csharpAiRoutineSteps.map(step => step.id);
    expect(order.indexOf("attempt")).toBeLessThan(order.indexOf("ask"));
    expect(order.indexOf("ask")).toBeLessThan(order.indexOf("verify"));
    expect(order.indexOf("verify")).toBeLessThan(order.indexOf("explain"));
    expect(csharpAiRoutine).toHaveLength(order.length);
    expect(csharpAiRoutine.every(step => typeof step === "string" && step.length > 20)).toBe(true);
    for (const secret of ["senha", "token", "chave"]) expect(csharpAiSafetyRule).toContain(secret);
    expect(csharpAiSafetyRule).toContain("sem IA");
    expect(csharpLaterTopics.find(topic => topic.title === "IA e RAG")?.why).toContain("opcional");
    expect(csharpLaterTopics.at(-1)?.why).toContain("Não são um pacote obrigatório");
  });
});
