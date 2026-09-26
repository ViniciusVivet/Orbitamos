import { describe, expect, it } from "vitest";
import { codeStructure, newVariablesProgress, readVariablesProgress, variableActivities, variableCodePassed, variablesKey } from "./csharpVariables";
import { newCSharpProgress } from "./csharpTrack";

describe("variables learning module", () => {
  it("starts coding immediately and interleaves seven practices with three questions", () => {
    expect(variableActivities[0].kind).toBe("guided");
    expect(variableActivities.filter(a => a.kind !== "quiz")).toHaveLength(7);
    expect(variableActivities.filter(a => a.kind === "quiz")).toHaveLength(3);
    expect(new Set(variableActivities.map(a => a.id)).size).toBe(variableActivities.length);
    for (const activity of variableActivities) expect(activity.topic && activity.goal).toBeTruthy();
  });
  for (const activity of variableActivities) {
    if (activity.kind === "code") it(`checks structure and runtime evidence: ${activity.id}`, () => {
      const verified = activity.verification.split("\n").map(() => "true").join("\n");
      expect(variableCodePassed(activity, activity.solution, activity.expected, verified)).toBe(true);
      expect(variableCodePassed(activity, activity.solution, activity.expected, "false")).toBe(false);
      expect(variableCodePassed(activity, activity.solution, "wrong", verified)).toBe(false);
      expect(variableCodePassed(activity, `/* ${activity.solution} */`, activity.expected, verified)).toBe(false);
      expect(variableCodePassed(activity, `Console.WriteLine(${JSON.stringify(activity.solution)});`, activity.expected, verified)).toBe(false);
    });
    if (activity.kind === "quiz") it(`has feedback for every answer: ${activity.id}`, () => {
      expect(activity.options).toHaveLength(activity.feedback.length);
      expect(activity.answer).toBeLessThan(activity.options.length);
    });
  }
  it("rejects quoted numeric values even if the limited runtime coerces them", () => {
    const a = variableActivities.find(a => a.id === "transfer")!;
    if (a.kind !== "code") throw Error("fixture");
    expect(variableCodePassed(a, 'int servicosPendentes = "5";\nConsole.WriteLine(servicosPendentes);', "5", "true")).toBe(false);
  });
  it("removes comments without treating comment markers inside strings as code", () => {
    expect(codeStructure('string url = "https://x"; // note\nint total = 1;')).toBe('string url = ""; \nint total = 1;');
  });
  it("migrates previous practices, preserving their drafts", () => {
    const old = { ...newCSharpProgress(), guided: true, transfer: true, drafts: { transfer: "my code", debug: "" } };
    const migrated = readVariablesProgress(null, JSON.stringify(old));
    expect(migrated.done).toEqual(["guided", "transfer"]);
    expect(migrated.active).toBe("quiz-values");
    expect(migrated.drafts).toEqual(old.drafts);
  });
  it("restores valid answers, not fabricated quiz completions, and isolates accounts", () => {
    const saved = { ...newVariablesProgress(), active: "client", drafts: { client: "", bad: "ignored" }, done: ["client", "quiz-values", "bad", "client"], answers: { "quiz-values": 0 } };
    const restored = readVariablesProgress(JSON.stringify(saved));
    expect(restored.done).toEqual(["client"]);
    expect(restored.drafts).toEqual({ client: "" });
    expect(variablesKey("a")).not.toBe(variablesKey("b"));
  });
  it("handles malformed state and bounds drafts", () => {
    for (const raw of ["null", "broken", "{}", '{"version":1,"done":{}}']) expect(readVariablesProgress(raw).done).toEqual([]);
    expect(readVariablesProgress('{"version":1,"active":"bad"}').active).toBe("guided");
    expect(readVariablesProgress(JSON.stringify({ version: 1, drafts: { client: "a".repeat(110000) } })).drafts.client).toHaveLength(100000);
  });
});
