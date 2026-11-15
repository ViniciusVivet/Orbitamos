import { describe, expect, it } from "vitest";
import { conditionsActivities, conditionsKey, conditionsPilot, readConditionsProgress } from "./csharpConditions";
import { newVariablesProgress, recordCSharpHelp, recordCSharpRun, variableCodePassed, variablesKey } from "./csharpVariables";
import { loopsActivities, readLoopsProgress } from "./csharpLoops";
import { diagnoseCSharp, explainCSharpFailure, withCSharpInputs } from "./csharpFeedback";

describe("conditions curriculum", () => {
  it("has seven coding practices, three questions and an independent final delivery", () => {
    expect(conditionsActivities.filter(a => a.kind !== "quiz")).toHaveLength(7);
    expect(conditionsActivities.filter(a => a.kind === "quiz")).toHaveLength(3);
    expect(conditionsActivities.at(-1)?.topic).toBe("Variáveis + condições");
    expect(conditionsPilot.codigoInicial).toBe("");
  });
  for (const activity of conditionsActivities) {
    if (activity.kind === "code") it(`${activity.id}: valid reference and multiple input cases`, () => {
      expect(diagnoseCSharp(activity.solution)).toBeNull();
      const proof = activity.verification.split("\n").map(() => "true").join("\n");
      expect(variableCodePassed(activity, activity.solution, activity.expected, proof)).toBe(true);
      expect(variableCodePassed(activity, `/* ${activity.solution} */`, activity.expected, proof)).toBe(false);
      expect(activity.cases!.length).toBeGreaterThanOrEqual(2);
      for (const scenario of activity.cases!) expect(() => withCSharpInputs(activity.solution, scenario.values)).not.toThrow();
    });
  }
  it("isolates module drafts, completions and keys", () => {
    expect(conditionsKey("a")).not.toBe(variablesKey("a"));
    const state = readConditionsProgress(JSON.stringify({ version: 1, active: "branches", drafts: { branches: "", client: "do not import" }, done: ["branches", "client"], answers: {} }));
    expect(state.active).toBe("branches");
    expect(state.drafts).toEqual({ branches: "" });
    expect(state.done).toEqual(["branches"]);
    expect(readConditionsProgress(null).drafts).toEqual({});
  });
  it("teaches the three-branch order before the final delivery without changing its position or answer identity", () => {
    const preparation = conditionsActivities.find(activity => activity.id === "quiz-and");
    const delivery = conditionsActivities.at(-1);
    if (preparation?.kind !== "quiz" || delivery?.kind !== "code") throw Error("fixture");
    expect(preparation.code).toContain("else if");
    expect(preparation.lesson).toContain("primeiro caminho verdadeiro");
    expect(preparation.answer).toBe(1);
    expect(preparation.feedback).toHaveLength(preparation.options.length);
    expect(conditionsActivities.indexOf(preparation)).toBeLessThan(conditionsActivities.indexOf(delivery));
    expect(delivery.id).toBe("delivery");
    expect(delivery.starter).toBe("");
    expect(delivery.cases).toContainEqual({ label: "Concluído mesmo sem pagamento", values: { concluidos: "12", pago: "false" }, expected: "Nina\nTudo entregue" });
  });
  it("restores consultation evidence for conditions and loops through their existing module contracts", () => {
    const evidence = recordCSharpRun(recordCSharpHelp(undefined, "hint"), { passed: true, checks: [] }, 1000);
    const old = { ...newVariablesProgress(), drafts: { branches: "condition draft", client: "other module" }, evidence: { branches: evidence, client: evidence } };
    expect(readConditionsProgress(JSON.stringify(old)).evidence).toEqual({ branches: evidence });
    const loop = loopsActivities.find(activity => activity.kind === "code");
    if (!loop) throw Error("fixture");
    const restored = readLoopsProgress(JSON.stringify({ ...newVariablesProgress(), active: loop.id, evidence: { [loop.id]: evidence, branches: evidence } }));
    expect(restored.evidence).toEqual({ [loop.id]: evidence });
    expect(restored.active).toBe(loop.id);
  });
});

describe("specific feedback without claiming to be a compiler", () => {
  it("explains quoted numbers and booleans", () => {
    expect(diagnoseCSharp('int total = "3";')).toContain("retire as aspas");
    expect(diagnoseCSharp('bool pago = "true";')).toContain("true ou false sem aspas");
    expect(diagnoseCSharp('string exemplo = "int total = 3";')).toBeNull();
  });
  it("explains assignment in comparisons but accepts comparison operators", () => {
    expect(diagnoseCSharp('if (total = 3) {\nConsole.WriteLine("sim");\n}')).toContain("use ==");
    for (const operator of ["==", ">=", "<=", "!="]) expect(diagnoseCSharp(`if (total ${operator} 3) {\nConsole.WriteLine("sim");\n}`)).toBeNull();
  });
  it("finds missing semicolons and mismatched braces", () => {
    expect(diagnoseCSharp("int total = 3")).toContain("linha 1");
    expect(diagnoseCSharp('if (total > 0); {\nConsole.WriteLine("sim");\n}')).toContain("logo depois do if");
    expect(diagnoseCSharp('if (total > 0) {\nConsole.WriteLine("}");')).toContain("mais chaves");
  });
  it("makes case-sensitive errors understandable", () => {
    const activity = conditionsActivities.find(a => a.id === "branches")!;
    if (activity.kind !== "code") throw Error("fixture");
    expect(explainCSharpFailure(activity, "int pendentes = 2;\nConsole.WriteLine(Pendentes);", { error: "Pendentes is not defined", output: "", timedOut: false })).toContain("declarou pendentes");
  });
  it("only changes declared inputs, not strings/comments or unrelated data", () => {
    const code = '// int total = 7;\nstring texto = "int total = 6;";\nint total = 3;\nint outro = 9;';
    expect(withCSharpInputs(code, { total: "0" })).toBe('// int total = 7;\nstring texto = "int total = 6;";\nint total = 0;\nint outro = 9;');
    expect(() => withCSharpInputs(code, { ausente: "1" })).toThrow();
    expect(() => withCSharpInputs(code, { total: "0; throw Error()" })).toThrow();
  });
});
