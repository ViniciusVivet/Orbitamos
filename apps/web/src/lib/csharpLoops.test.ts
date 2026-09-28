import { describe, expect, it } from "vitest";
import { loopsActivities, loopsKey, loopsPilot, readLoopsProgress } from "./csharpLoops";
import { csharpModules, readModuleKind } from "./csharpModules";
import { variableCodePassed, variablesKey } from "./csharpVariables";
import { conditionsKey } from "./csharpConditions";
import { diagnoseCSharp, explainCSharpFailure, withCSharpInputs } from "./csharpFeedback";
import { guidedLines } from "./guidedPractice";

describe("loops curriculum", () => {
  it("adds seven practices and three questions within business logic, not a new stage", () => {
    expect(loopsActivities.filter(a => a.kind !== "quiz")).toHaveLength(7);
    expect(loopsActivities.filter(a => a.kind === "quiz")).toHaveLength(3);
    expect(new Set(loopsActivities.map(a => a.id)).size).toBe(10);
    expect(loopsActivities.at(-1)?.topic).toBe("Variáveis + condições + laços");
    expect(csharpModules.loops.stage).toBe(csharpModules.conditions.stage);
    expect(csharpModules.conditions.next).toBe("loops");
    expect(csharpModules.loops.next).toBeNull();
    expect(loopsPilot.codigoInicial).toBe("");
  });
  for (const activity of loopsActivities) {
    if (activity.kind === "code") it(`${activity.id}: reference, guards and varied inputs`, () => {
      expect(diagnoseCSharp(activity.solution)).toBeNull();
      const proof = activity.verification.split("\n").map(() => "true").join("\n");
      expect(variableCodePassed(activity, activity.solution, activity.expected, proof)).toBe(true);
      expect(variableCodePassed(activity, `/* ${activity.solution} */`, activity.expected, proof)).toBe(false);
      expect(activity.cases!.length).toBeGreaterThanOrEqual(3);
      for (const scenario of activity.cases!) expect(() => withCSharpInputs(activity.solution, scenario.values)).not.toThrow();
      if (activity.id !== "debug-last") expect(activity.starter).toBe("");
    });
  }
  it("keeps draft storage isolated and rejects unknown module ids", () => {
    expect(new Set([loopsKey("a"), conditionsKey("a"), variablesKey("a")]).size).toBe(3);
    const state = readLoopsProgress(JSON.stringify({ version: 1, active: "count", drafts: { count: "", branches: "ignore" }, done: ["count", "branches"], answers: {} }));
    expect(state.active).toBe("count");
    expect(state.drafts).toEqual({ count: "" });
    expect(state.done).toEqual(["count"]);
    expect(readLoopsProgress(null).drafts).toEqual({});
    expect(readModuleKind("loops")).toBe("loops");
    expect(readModuleKind("conditions")).toBe("conditions");
    expect(readModuleKind("objects")).toBe("variables");
  });
  it("explains the three for parts and useful stop feedback", () => {
    expect(guidedLines(loopsPilot, 0)[1].why).toContain("três partes");
    const activity = loopsActivities.find(a => a.id === "countdown")!;
    if (activity.kind !== "code") throw Error("fixture");
    expect(explainCSharpFailure(activity, activity.solution, { error: "timeout", output: "", timedOut: true })).toContain("variável da condição muda");
    expect(explainCSharpFailure(activity, activity.solution, { error: "stop", output: "", timedOut: false, cancelled: true })).toContain("preservado");
  });
  it("flags accidental empty loops without confusing for separators", () => {
    expect(diagnoseCSharp("for (int i = 1; i <= 3; i++); {\nConsole.WriteLine(i);\n}")).toContain("repetição vazia");
    expect(diagnoseCSharp("while (pendentes > 0); {\npendentes--;\n}")).toContain("repetição vazia");
    expect(diagnoseCSharp(loopsPilot.steps[0].codigoExemplo!)).toBeNull();
    expect(diagnoseCSharp('Console.WriteLine("while (true);");')).toBeNull();
  });
});
