import { describe, expect, it } from "vitest";
import { codeStructure, newCSharpCodeEvidence, newVariablesProgress, readVariablesProgress, recordCSharpHelp, recordCSharpRun, variableActivities, variableCodePassed, variablesKey } from "./csharpVariables";
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

describe("local C# verification and consultation evidence", () => {
  const success = { passed: true, checks: [{ passed: true }, { passed: true }] };

  it("preserves old v1 progress without inventing an unassisted verification", () => {
    const old = { version: 1, active: "client", drafts: { client: "existing draft" }, done: ["client"], answers: {} };
    const restored = readVariablesProgress(JSON.stringify(old));
    expect(restored.active).toBe("client");
    expect(restored.drafts.client).toBe("existing draft");
    expect(restored.done).toEqual(["client"]);
    expect(restored.evidence).toEqual({});
    const legacy = readVariablesProgress(null, JSON.stringify({ ...newCSharpProgress(), guided: true }));
    expect(legacy.done).toEqual(["guided"]);
    expect(legacy.evidence).toEqual({});
  });

  it("distinguishes a run before consultation from later runs after help, including reload", () => {
    const beforeHelp = recordCSharpRun(undefined, success, 1000);
    expect(beforeHelp.lastRun).toEqual({ passed: true, helped: false, at: 1000, checksPassed: 2, checksTotal: 2 });
    const consulted = recordCSharpHelp(recordCSharpHelp(beforeHelp, "hint"), "concept");
    // A later consultation does not rewrite the actual earlier record.
    expect(consulted.lastRun?.helped).toBe(false);
    const restored = readVariablesProgress(JSON.stringify({ ...newVariablesProgress(), evidence: { client: consulted } }));
    const afterHelp = recordCSharpRun(restored.evidence.client, success, 2000);
    expect(afterHelp).toMatchObject({ attempts: 2, validations: 2, hintConsulted: true, conceptConsulted: true, lastRun: { helped: true, passed: true } });
    expect(recordCSharpHelp(afterHelp, "hint").lastRun).toEqual(afterHelp.lastRun);
  });

  it("records failed verifications but not a canceled or stale result", () => {
    const failed = recordCSharpRun(recordCSharpHelp(undefined, "hint"), { passed: false, checks: [{ passed: true }, { passed: false }] }, 1000);
    expect(failed).toMatchObject({ attempts: 1, validations: 0, lastRun: { passed: false, helped: true, checksPassed: 1, checksTotal: 2 } });
    expect(recordCSharpRun(failed, { ...success, cancelled: true }, 2000)).toEqual(failed);
    expect(recordCSharpRun(failed, success, Number.NaN)).toEqual(failed);
    expect(recordCSharpRun(failed, success, Date.now() + 600000)).toEqual(failed);
    expect(recordCSharpRun(undefined, { passed: true, checks: [{ passed: false }] }, 1000)).toMatchObject({ attempts: 1, validations: 0, lastRun: { passed: false } });
  });

  it("restores only known code activity IDs, not guided, quiz, arbitrary or inherited data", () => {
    const evidence = recordCSharpRun(undefined, success, 1000);
    const restored = readVariablesProgress(JSON.stringify({ ...newVariablesProgress(), evidence: { client: evidence, guided: evidence, "quiz-values": evidence, branches: evidence, constructor: evidence } }));
    expect(restored.evidence).toEqual({ client: evidence });
    expect(recordCSharpRun(Object.create(evidence), success, 2000)).toMatchObject({ attempts: 1, validations: 1, hintConsulted: false, conceptConsulted: false });
    for (const malformed of [null, [], "text", true]) {
      expect(readVariablesProgress(JSON.stringify({ ...newVariablesProgress(), evidence: malformed })).evidence).toEqual({});
    }
  });

  it("bounds counters, rejects impossible last-run records and does not restore string booleans", () => {
    const invalid = { attempts: 2, validations: 99, hintConsulted: "true", conceptConsulted: false, lastRun: { passed: true, helped: true, at: 1000, checksPassed: 0, checksTotal: 2 } };
    const restored = readVariablesProgress(JSON.stringify({ ...newVariablesProgress(), evidence: { client: invalid } })).evidence.client;
    expect(restored).toEqual({ attempts: 2, validations: 2, hintConsulted: false, conceptConsulted: false, lastRun: null });
    const saturated = recordCSharpRun({ ...newCSharpCodeEvidence(), attempts: 999999, validations: 999999 }, success, 1000);
    expect(saturated.attempts).toBe(9999);
    expect(saturated.validations).toBe(9999);
    expect(recordCSharpRun(undefined, { passed: true, checks: Array.from({ length: 65 }, () => ({ passed: true })) }, 1000)).toMatchObject({ attempts: 1, validations: 0, lastRun: { passed: false, checksTotal: 64 } });
  });
});
