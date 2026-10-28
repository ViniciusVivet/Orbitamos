import { describe, expect, it } from "vitest";
import { freePracticeStorageKey, freshFreePracticeDraft, keepPracticeCodeVersion, practiceCodeHistoryKey, practiceHandoffDecision, readFreePracticeDraft, readPracticeCodeHistory, storePracticeProgram } from "./practiceHandoff";

describe("guided program handoff", () => {
  it("carries the exact code without awarding a free-mode conclusion", () => {
    const draft = freshFreePracticeDraft('const nome = "João";\nconsole.log(nome);', 3);
    expect(draft.code).toContain("João");
    expect(draft.stepStatus).toEqual(["pending", "pending", "pending"]);
    expect(draft.stepAttempts).toEqual([0, 0, 0]);
  });
  it("only replaces an unused starter automatically", () => {
    const starter = "// escreva aqui\n";
    expect(practiceHandoffDecision("novo", freshFreePracticeDraft(starter, 2), starter)).toBe("import");
    const old = freshFreePracticeDraft("meu programa", 2);
    expect(practiceHandoffDecision("novo", old, starter)).toBe("choose");
    expect(practiceHandoffDecision("meu programa", old, starter)).toBe("same");
    old.code = starter; old.reflection = "Uma anotação minha";
    expect(practiceHandoffDecision("novo", old, starter)).toBe("choose");
  });
  it("retains existing free progress when reading a valid saved program", () => {
    const stored = { code: "print(42)", currentStep: 1, stepStatus: ["success", "error"], stepAttempts: [1, 3], reflection: "revisei o erro" };
    expect(readFreePracticeDraft(JSON.stringify(stored), 2)).toEqual(stored);
    expect(readFreePracticeDraft("{", 2)).toBeNull();
    expect(readFreePracticeDraft(JSON.stringify({ ...stored, currentStep: Infinity, stepAttempts: [1, -1] }), 2)?.stepAttempts).toEqual([0, 0]);
  });
  it("preserves raw snapshots and earlier versions before importing or restoring", () => {
    const raw = '{"code":"anterior","custom":"preservar"}';
    const first = keepPracticeCodeVersion(readPracticeCodeHistory(null), raw, "guided", 100);
    const second = keepPracticeCodeVersion(first, '{"code":"atual"}', "restored", 200);
    expect(second.entries.map(entry => entry.raw)).toEqual(['{"code":"atual"}', raw]);
    expect(keepPracticeCodeVersion(second, raw, "guided", 300).entries).toHaveLength(2);
    expect(readPracticeCodeHistory(JSON.stringify(second))).toEqual(second);
  });
  it("refuses to overwrite a history that cannot be decoded", () => {
    expect(() => keepPracticeCodeVersion(readPracticeCodeHistory("{"), "rascunho", "guided")).toThrow("mantido");
  });
  it("separates snapshots by account and exercise", () => {
    expect(freePracticeStorageKey("alice", "variaveis-js")).not.toBe(freePracticeStorageKey("bob", "variaveis-js"));
    expect(practiceCodeHistoryKey("alice", "variaveis-js")).not.toBe(practiceCodeHistoryKey("alice", "operadores-js"));
    expect(practiceCodeHistoryKey(0, "variaveis-js")).toContain("-0-");
  });
  it("never overwrites the active draft when preserving its version fails", () => {
    const values = new Map([["draft", '{"code":"previous"}']]);
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { if (key === "history") throw new Error("quota"); values.set(key, value); } };
    expect(() => storePracticeProgram(storage, "draft", "history", freshFreePracticeDraft("new", 1), "guided")).toThrow("quota");
    expect(values.get("draft")).toBe('{"code":"previous"}');
  });
  it("keeps both persisted and not-yet-autosaved code while recovering", () => {
    const values = new Map([["draft", '{"code":"saved"}']]);
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    const history = storePracticeProgram(storage, "draft", "history", freshFreePracticeDraft("recovered", 1), "restored", '{"code":"just typed"}');
    expect(history.entries.map(entry => JSON.parse(entry.raw).code)).toEqual(["just typed", "saved"]);
    expect(JSON.parse(values.get("draft")!).stepStatus).toEqual(["pending"]);
  });
});
