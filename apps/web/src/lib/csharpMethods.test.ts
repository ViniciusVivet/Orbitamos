import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CSHARP_METHODS_MAX_CODE,
  CSHARP_METHODS_MAX_FILE_BYTES,
  CSHARP_METHODS_UNIT_ID,
  answerCSharpMethodsPrediction,
  csharpMethodsActivities,
  csharpMethodsKey,
  clearCSharpMethodsRun,
  declareCSharpMethodsRun,
  exportCSharpMethodsDraft,
  importCSharpMethodsDraft,
  markCSharpMethodsModel,
  newCSharpMethodsProgress,
  readCSharpMethodsProgress,
  resetCSharpMethodsDraft,
  revealCSharpMethodsHint,
  setCSharpMethodsDraft,
  setCSharpMethodsPreparation,
  summarizeCSharpMethodsPreparation,
  type CSharpMethodsActivityId,
} from "./csharpMethods";

const timestamp = 1_800_000_000_000;
const code = "Console.WriteLine(CalcularPendentes(8, 3));\n\nint CalcularPendentes(int total, int concluidos)\n{\n    return total - concluidos;\n}";
const envelope = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  format: "orbitamos-csharp-methods-draft",
  version: 1,
  unitId: CSHARP_METHODS_UNIT_ID,
  activityId: "guided",
  filename: "Program.cs",
  text: code,
  ...overrides,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("methods preparation storage", () => {
  it("starts without copied code or reports and separates owners by type", () => {
    const first = newCSharpMethodsProgress();
    const second = newCSharpMethodsProgress();
    first.drafts.guided = "only this state";
    expect(second.drafts).toEqual({});
    expect(second.selfReportedRuns).toEqual({});
    expect(second.hintsShown).toEqual({});
    expect(second.modelViewed).toEqual({});
    expect(csharpMethodsKey("42")).not.toBe(csharpMethodsKey(42));
    expect(csharpMethodsKey("number:42")).not.toBe(csharpMethodsKey(42));
    expect(csharpMethodsKey("account-a")).not.toBe(csharpMethodsKey("account-b"));
    expect(csharpMethodsKey("account-a")).toBe(csharpMethodsKey("account-a"));
  });

  it("restores distinct preparation, predictions, text, help and self-report after reload", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpMethodsPreparation(newCSharpMethodsProgress(), "sdk", true);
    state = setCSharpMethodsDraft(state, "guided", code);
    state = revealCSharpMethodsHint(state, "guided");
    state = markCSharpMethodsModel(state, "guided");
    state = answerCSharpMethodsPrediction(state, "guided-return", 0);
    state = declareCSharpMethodsRun(state, "guided");
    state = { ...state, view: "activity", active: "guided" };
    const restored = readCSharpMethodsProgress(JSON.stringify(state));
    expect(restored).toEqual(state);
    expect(summarizeCSharpMethodsPreparation(restored)).toEqual({
      preparationItems: 1,
      predictionsAnswered: 1,
      draftsWritten: 1,
      activitiesWithHelp: 1,
      selfReportedRuns: 1,
      executionEvidence: "self-report-only",
      executionLabel: "Execuções declaradas pelo aluno, sem verificação automática",
    });
    expect(restored).not.toHaveProperty("done");
    expect(restored).not.toHaveProperty("passed");
    expect(restored).not.toHaveProperty("xp");
    expect(restored).not.toHaveProperty("competency");
  });

  it.each([
    null,
    "",
    "{invalid",
    "[]",
    "null",
    "{}",
    JSON.stringify({ version: 1, drafts: { guided: code }, done: ["guided"] }),
    JSON.stringify({ version: 2, unitId: CSHARP_METHODS_UNIT_ID, drafts: { guided: code } }),
    JSON.stringify({ version: 1, unitId: "variables", drafts: { guided: code } }),
  ])("recovers safely from corrupt, legacy or different-unit saves: %s", raw => {
    expect(readCSharpMethodsProgress(raw)).toEqual(newCSharpMethodsProgress());
  });

  it("restores only known entries with valid values and ignores forged completion data", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const restored = readCSharpMethodsProgress(JSON.stringify({
      ...newCSharpMethodsProgress(),
      active: "foreign",
      view: "verified",
      preparation: ["sdk", "sdk", "files", "foreign", 1],
      predictions: { "guided-return": 1, "reuse-argument": -1, "debug-fixed": 3, foreign: 0 },
      drafts: { guided: code, reuse: 4, debug: "x".repeat(CSHARP_METHODS_MAX_CODE + 1), independent: "", foreign: "ignore" },
      hintsShown: { guided: 1, reuse: -1, debug: 1.5, independent: "2", foreign: 1 },
      modelViewed: { guided: true, reuse: true, debug: true, foreign: true },
      selfReportedRuns: { guided: { kind: "verified", at: timestamp }, independent: { kind: "self-report", at: timestamp } },
      done: ["guided", "independent"],
      passed: true,
      xp: 9999,
      account: "another-owner",
    }));
    expect(restored).toEqual({
      ...newCSharpMethodsProgress(),
      preparation: ["sdk", "files"],
      predictions: { "guided-return": 1 },
      drafts: { guided: code, independent: "" },
      hintsShown: { guided: 1 },
      modelViewed: { guided: true },
    });
  });

  it.each(["__proto__", "prototype", "constructor"])("rejects structural %s fields at any nesting level", key => {
    const raw = `{"version":1,"unitId":"${CSHARP_METHODS_UNIT_ID}","drafts":{"guided":"preserve no forged data","${key}":{"polluted":true}}}`;
    expect(readCSharpMethodsProgress(raw)).toEqual(newCSharpMethodsProgress());
    expect(Object.prototype).not.toHaveProperty("polluted");
  });

  it("rejects malformed report kinds, extra claims and invalid timestamps", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const invalidReports = [
      { kind: "verified", at: timestamp },
      { kind: "self-report", at: timestamp, verified: true },
      { kind: "self-report", at: timestamp + 300_001 },
      { kind: "self-report", at: 0 },
      { kind: "self-report", at: -1 },
      { kind: "self-report", at: timestamp + 0.5 },
      { kind: "self-report", at: "yesterday" },
      { kind: "self-report" },
      null,
      [],
    ];
    for (const report of invalidReports) {
      const restored = readCSharpMethodsProgress(JSON.stringify({ ...newCSharpMethodsProgress(), drafts: { guided: code }, selfReportedRuns: { guided: report } }));
      expect(restored.drafts.guided).toBe(code);
      expect(restored.selfReportedRuns).toEqual({});
    }
  });
});

describe("methods preparation actions", () => {
  it("keeps help history after editing and resetting, while clearing only the related report", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", code);
    state = setCSharpMethodsDraft(state, "reuse", "second draft");
    state = markCSharpMethodsModel(revealCSharpMethodsHint(state, "guided"), "guided");
    state = declareCSharpMethodsRun(declareCSharpMethodsRun(state, "guided"), "reuse");
    const before = JSON.stringify(state);
    const edited = setCSharpMethodsDraft(state, "guided", `${code}\n// minha explicação`);
    expect(edited.selfReportedRuns.guided).toBeUndefined();
    expect(edited.selfReportedRuns.reuse).toEqual({ kind: "self-report", at: timestamp });
    expect(edited.hintsShown).toEqual({ guided: 1 });
    expect(edited.modelViewed).toEqual({ guided: true });
    expect(JSON.stringify(state)).toBe(before);
    const reset = resetCSharpMethodsDraft(declareCSharpMethodsRun(edited, "guided"), "guided");
    expect(reset.drafts).toEqual({ reuse: "second draft" });
    expect(reset.selfReportedRuns).toEqual({ reuse: { kind: "self-report", at: timestamp } });
    expect(reset.hintsShown).toEqual({ guided: 1 });
    expect(reset.modelViewed).toEqual({ guided: true });
    expect(readCSharpMethodsProgress(JSON.stringify(reset))).toEqual(reset);
  });

  it("records a declaration without turning the draft or a correct prediction into compiler evidence", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", "this deliberately is not C#");
    state = answerCSharpMethodsPrediction(state, "guided-return", 1);
    state = declareCSharpMethodsRun(state, "guided");
    expect(state.selfReportedRuns).toEqual({ guided: { kind: "self-report", at: timestamp } });
    expect(summarizeCSharpMethodsPreparation(state).executionEvidence).toBe("self-report-only");
    for (const field of ["done", "passed", "verified", "xp"]) expect(state).not.toHaveProperty(field);
    expect(setCSharpMethodsDraft(state, "guided", state.drafts.guided!)).toBe(state);
    const empty = setCSharpMethodsDraft(state, "guided", " \n ");
    expect(declareCSharpMethodsRun(empty, "guided")).toBe(empty);
  });

  it("can retract an accidental self-report while preserving text, help and predictions", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", code);
    state = markCSharpMethodsModel(revealCSharpMethodsHint(state, "guided"), "guided");
    state = answerCSharpMethodsPrediction(state, "guided-return", 0);
    state = declareCSharpMethodsRun(state, "guided");
    const cleared = clearCSharpMethodsRun(state, "guided");
    expect(cleared.selfReportedRuns).toEqual({});
    expect(cleared.drafts).toEqual(state.drafts);
    expect(cleared.hintsShown).toEqual(state.hintsShown);
    expect(cleared.modelViewed).toEqual(state.modelViewed);
    expect(cleared.predictions).toEqual(state.predictions);
    expect(state.selfReportedRuns.guided).toEqual({ kind: "self-report", at: timestamp });
    expect(clearCSharpMethodsRun(cleared, "guided")).toBe(cleared);
  });

  it("does not mutate state for unknown ids, invalid choices, invalid times or oversized edits", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", code);
    const foreign = "foreign" as CSharpMethodsActivityId;
    expect(setCSharpMethodsDraft(state, foreign, "bad")).toBe(state);
    expect(resetCSharpMethodsDraft(state, foreign)).toBe(state);
    expect(revealCSharpMethodsHint(state, foreign)).toBe(state);
    expect(markCSharpMethodsModel(state, foreign)).toBe(state);
    expect(declareCSharpMethodsRun(state, foreign)).toBe(state);
    expect(clearCSharpMethodsRun(state, foreign)).toBe(state);
    expect(answerCSharpMethodsPrediction(state, "foreign", 0)).toBe(state);
    for (const answer of [-1, 100, 0.5, NaN]) expect(answerCSharpMethodsPrediction(state, "guided-return", answer)).toBe(state);
    for (const at of [0, -1, NaN, Infinity, timestamp + 0.5, timestamp + 300_001]) expect(declareCSharpMethodsRun(state, "guided", at)).toBe(state);
    expect(setCSharpMethodsDraft(state, "guided", "x".repeat(CSHARP_METHODS_MAX_CODE + 1))).toBe(state);
    expect(state.drafts.guided).toBe(code);
  });

  it("bounds repeated hint requests and makes preparation toggles idempotent", () => {
    let state = newCSharpMethodsProgress();
    state = setCSharpMethodsPreparation(setCSharpMethodsPreparation(state, "sdk", true), "sdk", true);
    expect(state.preparation).toEqual(["sdk"]);
    state = setCSharpMethodsPreparation(state, "sdk", false);
    expect(state.preparation).toEqual([]);
    for (let index = 0; index < 20; index++) state = revealCSharpMethodsHint(state, "guided");
    const count = csharpMethodsActivities.find(activity => activity.id === "guided")!.hints.length;
    expect(state.hintsShown.guided).toBe(count);
    expect(state.drafts).toEqual({});
    expect(state.selfReportedRuns).toEqual({});
  });
});

describe("methods draft transport", () => {
  it("exports only one exact text and metadata, then previews import without copying account progress", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const text = `${code}\n// ç, \"aspas\", 🚀, __proto__, constructor`;
    let source = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", text);
    source = declareCSharpMethodsRun(markCSharpMethodsModel(revealCSharpMethodsHint(source, "guided"), "guided"), "guided");
    const result = exportCSharpMethodsDraft(source, "guided");
    expect(result.ok).toBe(true);
    if (!result.ok) throw Error(result.error);
    expect(JSON.parse(result.content)).toEqual({ format: "orbitamos-csharp-methods-draft", version: 1, unitId: CSHARP_METHODS_UNIT_ID, activityId: "guided", filename: "Program.cs", text });
    expect(result.filename).toBe("orbiservicos-metodos-guided.json");
    let target = setCSharpMethodsDraft(newCSharpMethodsProgress(), "reuse", "belongs to this account");
    target = setCSharpMethodsPreparation(target, "files", true);
    const before = JSON.stringify(target);
    const imported = importCSharpMethodsDraft(target, result.content);
    expect(imported.ok).toBe(true);
    if (!imported.ok) throw Error(imported.error);
    expect(imported.replacesExisting).toBe(false);
    expect(imported.progress.drafts).toEqual({ reuse: "belongs to this account", guided: text });
    expect(imported.progress.preparation).toEqual(["files"]);
    expect(imported.progress.hintsShown).toEqual({});
    expect(imported.progress.modelViewed).toEqual({});
    expect(imported.progress.selfReportedRuns).toEqual({});
    expect(imported.progress.view).toBe("activity");
    expect(imported.progress.active).toBe("guided");
    expect(JSON.stringify(target)).toBe(before);
  });

  it("reports a replacement before writing and preserves local help history", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", "previous attempt");
    state = declareCSharpMethodsRun(markCSharpMethodsModel(revealCSharpMethodsHint(state, "guided"), "guided"), "guided");
    const before = JSON.stringify(state);
    const imported = importCSharpMethodsDraft(state, envelope());
    expect(imported.ok).toBe(true);
    if (!imported.ok) throw Error(imported.error);
    expect(imported.replacesExisting).toBe(true);
    expect(imported.progress.drafts.guided).toBe(code);
    expect(imported.progress.selfReportedRuns.guided).toBeUndefined();
    expect(imported.progress.hintsShown).toEqual(state.hintsShown);
    expect(imported.progress.modelViewed).toEqual(state.modelViewed);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("clears the old execution statement even when importing the same text", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const state = declareCSharpMethodsRun(setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", code), "guided");
    const imported = importCSharpMethodsDraft(state, envelope());
    expect(imported.ok).toBe(true);
    if (!imported.ok) throw Error(imported.error);
    expect(imported.replacesExisting).toBe(false);
    expect(imported.progress.selfReportedRuns).toEqual({});
    expect(state.selfReportedRuns.guided).toEqual({ kind: "self-report", at: timestamp });
  });

  it.each([
    "{invalid",
    "[]",
    "null",
    envelope({ version: 2 }),
    envelope({ unitId: "another-unit" }),
    envelope({ activityId: "variables" }),
    envelope({ filename: "../../Program.cs" }),
    envelope({ filename: "Program.cs.exe" }),
    envelope({ text: { code } }),
    envelope({ accountId: "other-account" }),
    envelope({ progress: { done: ["guided"] } }),
    envelope({ selfReportedRuns: { guided: { kind: "verified", at: timestamp } } }),
    envelope({ xp: 100 }),
    JSON.stringify(newCSharpMethodsProgress()),
  ])("rejects incompatible or forged envelopes without changing drafts: %s", raw => {
    const state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", "preserve me");
    const before = JSON.stringify(state);
    expect(importCSharpMethodsDraft(state, raw).ok).toBe(false);
    expect(JSON.stringify(state)).toBe(before);
  });

  it.each(["__proto__", "prototype", "constructor"])("rejects %s envelope metadata without affecting object prototypes", key => {
    const raw = `${envelope().slice(0, -1)},"${key}":{"polluted":true}}`;
    expect(importCSharpMethodsDraft(newCSharpMethodsProgress(), raw).ok).toBe(false);
    expect(Object.prototype).not.toHaveProperty("polluted");
  });

  it("checks UTF-8 bytes before parsing and rejects rather than truncating oversized text", () => {
    const state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", "preserve me");
    const raw = envelope({ text: "á".repeat(60_000) });
    expect(raw.length).toBeLessThan(CSHARP_METHODS_MAX_FILE_BYTES);
    expect(new TextEncoder().encode(raw).byteLength).toBeGreaterThan(CSHARP_METHODS_MAX_FILE_BYTES);
    const parse = vi.spyOn(JSON, "parse");
    expect(importCSharpMethodsDraft(state, raw).ok).toBe(false);
    expect(parse).not.toHaveBeenCalled();
    expect(state.drafts.guided).toBe("preserve me");
  });

  it("preserves large valid imports exactly, and keeps oversized exports available in the draft", () => {
    const text = "x".repeat(CSHARP_METHODS_MAX_CODE - 500);
    const imported = importCSharpMethodsDraft(newCSharpMethodsProgress(), envelope({ text }));
    expect(imported.ok).toBe(true);
    if (!imported.ok) throw Error(imported.error);
    expect(imported.progress.drafts.guided).toBe(text);
    const state = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", "🚀".repeat(30_000));
    expect(state.drafts.guided).toHaveLength(60_000);
    expect(exportCSharpMethodsDraft(state, "guided").ok).toBe(false);
    expect(state.drafts.guided).toBe("🚀".repeat(30_000));
    expect(exportCSharpMethodsDraft(newCSharpMethodsProgress(), "guided").ok).toBe(false);
  });
});
