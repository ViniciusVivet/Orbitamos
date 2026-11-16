import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CSHARP_OBJECTS_MAX_CODE,
  CSHARP_OBJECTS_MAX_FILE_BYTES,
  CSHARP_OBJECTS_UNIT_ID,
  answerCSharpObjectsPrediction,
  csharpObjectsActivities,
  csharpObjectsKey,
  clearCSharpObjectsRun,
  declareCSharpObjectsRun,
  exportCSharpObjectsDraft,
  importCSharpObjectsDraft,
  markCSharpObjectsModel,
  newCSharpObjectsProgress,
  readCSharpObjectsProgress,
  resetCSharpObjectsDraft,
  revealCSharpObjectsHint,
  setCSharpObjectsDraft,
  setCSharpObjectsPreparation,
  summarizeCSharpObjectsPreparation,
  type CSharpObjectsActivityId,
} from "./csharpObjects";
import { csharpMethodsKey, exportCSharpMethodsDraft, importCSharpMethodsDraft, newCSharpMethodsProgress, readCSharpMethodsProgress, setCSharpMethodsDraft } from "./csharpMethods";

const timestamp = 1_800_000_000_000;
const code = "public class Servico\n{\n    public int Total { get; set; }\n}\n// Rascunho em preparação, não uma entrega validada.";
const envelope = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  format: "orbitamos-csharp-objects-draft",
  version: 1,
  unitId: CSHARP_OBJECTS_UNIT_ID,
  activityId: "guided",
  filename: "Servico.cs",
  text: code,
  ...overrides,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("objects preparation storage", () => {
  it("isolates the new unit from existing methods saves and draft envelopes", () => {
    const methods = setCSharpMethodsDraft(newCSharpMethodsProgress(), "guided", "existing methods work");
    const objects = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", code);
    const before = JSON.stringify(methods);
    expect(csharpObjectsKey("owner")).not.toBe(csharpMethodsKey("owner"));
    expect(readCSharpObjectsProgress(JSON.stringify(methods))).toEqual(newCSharpObjectsProgress());
    expect(readCSharpMethodsProgress(JSON.stringify(objects))).toEqual(newCSharpMethodsProgress());
    const methodsFile = exportCSharpMethodsDraft(methods, "guided");
    const objectsFile = exportCSharpObjectsDraft(objects, "guided");
    if (!methodsFile.ok || !objectsFile.ok) throw Error("draft fixtures must export");
    expect(importCSharpObjectsDraft(objects, methodsFile.content).ok).toBe(false);
    expect(importCSharpMethodsDraft(methods, objectsFile.content).ok).toBe(false);
    expect(JSON.stringify(methods)).toBe(before);
  });

  it("starts without copied code or reports and separates owners by type", () => {
    const first = newCSharpObjectsProgress();
    const second = newCSharpObjectsProgress();
    first.drafts.guided = "only this state";
    expect(second.drafts).toEqual({});
    expect(second.selfReportedRuns).toEqual({});
    expect(second.hintsShown).toEqual({});
    expect(second.modelViewed).toEqual({});
    expect(csharpObjectsKey("42")).not.toBe(csharpObjectsKey(42));
    expect(csharpObjectsKey("number:42")).not.toBe(csharpObjectsKey(42));
    expect(csharpObjectsKey("account-a")).not.toBe(csharpObjectsKey("account-b"));
    expect(csharpObjectsKey("account-a")).toBe(csharpObjectsKey("account-a"));
  });

  it("restores distinct preparation, predictions, text, help and self-report after reload", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpObjectsPreparation(newCSharpObjectsProgress(), "sdk", true);
    state = setCSharpObjectsDraft(state, "guided", code);
    state = revealCSharpObjectsHint(state, "guided");
    state = markCSharpObjectsModel(state, "guided");
    state = answerCSharpObjectsPrediction(state, "guided-state", 0);
    state = declareCSharpObjectsRun(state, "guided");
    state = { ...state, view: "activity", active: "guided" };
    const restored = readCSharpObjectsProgress(JSON.stringify(state));
    expect(restored).toEqual(state);
    expect(summarizeCSharpObjectsPreparation(restored)).toEqual({
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
    JSON.stringify({ version: 2, unitId: CSHARP_OBJECTS_UNIT_ID, drafts: { guided: code } }),
    JSON.stringify({ version: 1, unitId: "variables", drafts: { guided: code } }),
  ])("recovers safely from corrupt, legacy or different-unit saves: %s", raw => {
    expect(readCSharpObjectsProgress(raw)).toEqual(newCSharpObjectsProgress());
  });

  it("restores only known entries with valid values and ignores forged completion data", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const restored = readCSharpObjectsProgress(JSON.stringify({
      ...newCSharpObjectsProgress(),
      active: "foreign",
      view: "verified",
      preparation: ["sdk", "sdk", "files", "foreign", 1],
      predictions: { "guided-state": 1, "reuse-instance": -1, "debug-alias": 3, foreign: 0 },
      drafts: { guided: code, reuse: 4, debug: "x".repeat(CSHARP_OBJECTS_MAX_CODE + 1), independent: "", foreign: "ignore" },
      hintsShown: { guided: 1, reuse: -1, debug: 1.5, independent: "2", foreign: 1 },
      modelViewed: { guided: true, reuse: true, debug: true, foreign: true },
      selfReportedRuns: { guided: { kind: "verified", at: timestamp }, independent: { kind: "self-report", at: timestamp } },
      done: ["guided", "independent"],
      passed: true,
      xp: 9999,
      account: "another-owner",
    }));
    expect(restored).toEqual({
      ...newCSharpObjectsProgress(),
      preparation: ["sdk", "files"],
      predictions: { "guided-state": 1 },
      drafts: { guided: code, independent: "" },
      hintsShown: { guided: 1 },
      modelViewed: { guided: true },
    });
  });

  it.each(["__proto__", "prototype", "constructor"])("rejects structural %s fields at any nesting level", key => {
    const raw = `{"version":1,"unitId":"${CSHARP_OBJECTS_UNIT_ID}","drafts":{"guided":"preserve no forged data","${key}":{"polluted":true}}}`;
    expect(readCSharpObjectsProgress(raw)).toEqual(newCSharpObjectsProgress());
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
      const restored = readCSharpObjectsProgress(JSON.stringify({ ...newCSharpObjectsProgress(), drafts: { guided: code }, selfReportedRuns: { guided: report } }));
      expect(restored.drafts.guided).toBe(code);
      expect(restored.selfReportedRuns).toEqual({});
    }
  });
});

describe("objects preparation actions", () => {
  it("keeps help history after editing and resetting, while clearing only the related report", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", code);
    state = setCSharpObjectsDraft(state, "reuse", "second draft");
    state = markCSharpObjectsModel(revealCSharpObjectsHint(state, "guided"), "guided");
    state = declareCSharpObjectsRun(declareCSharpObjectsRun(state, "guided"), "reuse");
    const before = JSON.stringify(state);
    const edited = setCSharpObjectsDraft(state, "guided", `${code}\n// minha explicação`);
    expect(edited.selfReportedRuns.guided).toBeUndefined();
    expect(edited.selfReportedRuns.reuse).toEqual({ kind: "self-report", at: timestamp });
    expect(edited.hintsShown).toEqual({ guided: 1 });
    expect(edited.modelViewed).toEqual({ guided: true });
    expect(JSON.stringify(state)).toBe(before);
    const reset = resetCSharpObjectsDraft(declareCSharpObjectsRun(edited, "guided"), "guided");
    expect(reset.drafts).toEqual({ reuse: "second draft" });
    expect(reset.selfReportedRuns).toEqual({ reuse: { kind: "self-report", at: timestamp } });
    expect(reset.hintsShown).toEqual({ guided: 1 });
    expect(reset.modelViewed).toEqual({ guided: true });
    expect(readCSharpObjectsProgress(JSON.stringify(reset))).toEqual(reset);
  });

  it("records a declaration without turning the draft or a correct prediction into compiler evidence", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", "this deliberately is not C#");
    state = answerCSharpObjectsPrediction(state, "guided-state", 1);
    state = declareCSharpObjectsRun(state, "guided");
    expect(state.selfReportedRuns).toEqual({ guided: { kind: "self-report", at: timestamp } });
    expect(summarizeCSharpObjectsPreparation(state).executionEvidence).toBe("self-report-only");
    for (const field of ["done", "passed", "verified", "xp"]) expect(state).not.toHaveProperty(field);
    expect(setCSharpObjectsDraft(state, "guided", state.drafts.guided!)).toBe(state);
    const empty = setCSharpObjectsDraft(state, "guided", " \n ");
    expect(declareCSharpObjectsRun(empty, "guided")).toBe(empty);
  });

  it("can retract an accidental self-report while preserving text, help and predictions", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    let state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", code);
    state = markCSharpObjectsModel(revealCSharpObjectsHint(state, "guided"), "guided");
    state = answerCSharpObjectsPrediction(state, "guided-state", 0);
    state = declareCSharpObjectsRun(state, "guided");
    const cleared = clearCSharpObjectsRun(state, "guided");
    expect(cleared.selfReportedRuns).toEqual({});
    expect(cleared.drafts).toEqual(state.drafts);
    expect(cleared.hintsShown).toEqual(state.hintsShown);
    expect(cleared.modelViewed).toEqual(state.modelViewed);
    expect(cleared.predictions).toEqual(state.predictions);
    expect(state.selfReportedRuns.guided).toEqual({ kind: "self-report", at: timestamp });
    expect(clearCSharpObjectsRun(cleared, "guided")).toBe(cleared);
  });

  it("does not mutate state for unknown ids, invalid choices, invalid times or oversized edits", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", code);
    const foreign = "foreign" as CSharpObjectsActivityId;
    expect(setCSharpObjectsDraft(state, foreign, "bad")).toBe(state);
    expect(resetCSharpObjectsDraft(state, foreign)).toBe(state);
    expect(revealCSharpObjectsHint(state, foreign)).toBe(state);
    expect(markCSharpObjectsModel(state, foreign)).toBe(state);
    expect(declareCSharpObjectsRun(state, foreign)).toBe(state);
    expect(clearCSharpObjectsRun(state, foreign)).toBe(state);
    expect(answerCSharpObjectsPrediction(state, "foreign", 0)).toBe(state);
    for (const answer of [-1, 100, 0.5, NaN]) expect(answerCSharpObjectsPrediction(state, "guided-state", answer)).toBe(state);
    for (const at of [0, -1, NaN, Infinity, timestamp + 0.5, timestamp + 300_001]) expect(declareCSharpObjectsRun(state, "guided", at)).toBe(state);
    expect(setCSharpObjectsDraft(state, "guided", "x".repeat(CSHARP_OBJECTS_MAX_CODE + 1))).toBe(state);
    expect(state.drafts.guided).toBe(code);
  });

  it("bounds repeated hint requests and makes preparation toggles idempotent", () => {
    let state = newCSharpObjectsProgress();
    state = setCSharpObjectsPreparation(setCSharpObjectsPreparation(state, "sdk", true), "sdk", true);
    expect(state.preparation).toEqual(["sdk"]);
    state = setCSharpObjectsPreparation(state, "sdk", false);
    expect(state.preparation).toEqual([]);
    for (let index = 0; index < 20; index++) state = revealCSharpObjectsHint(state, "guided");
    const count = csharpObjectsActivities.find(activity => activity.id === "guided")!.hints.length;
    expect(state.hintsShown.guided).toBe(count);
    expect(state.drafts).toEqual({});
    expect(state.selfReportedRuns).toEqual({});
  });
});

describe("objects draft transport", () => {
  it("round-trips the correct file for every activity and rejects changing the target filename", () => {
    for (const activity of csharpObjectsActivities) {
      const state = setCSharpObjectsDraft(newCSharpObjectsProgress(), activity.id, `// ${activity.id}\n${code}`);
      const exported = exportCSharpObjectsDraft(state, activity.id);
      if (!exported.ok) throw Error(exported.error);
      const metadata = JSON.parse(exported.content) as Record<string, unknown>;
      expect(metadata.filename).toBe(activity.fileName);
      const imported = importCSharpObjectsDraft(newCSharpObjectsProgress(), exported.content);
      expect(imported.ok).toBe(true);
      if (!imported.ok) throw Error(imported.error);
      expect(imported.activityId).toBe(activity.id);
      expect(imported.progress.drafts[activity.id]).toBe(state.drafts[activity.id]);
      const wrongFilename = activity.fileName === "Servico.cs" ? "Program.cs" : "Servico.cs";
      const before = JSON.stringify(state);
      expect(importCSharpObjectsDraft(state, JSON.stringify({ ...metadata, filename: wrongFilename })).ok).toBe(false);
      expect(JSON.stringify(state)).toBe(before);
    }
  });

  it("exports only one exact text and metadata, then previews import without copying account progress", () => {
    vi.spyOn(Date, "now").mockReturnValue(timestamp);
    const text = `${code}\n// ç, \"aspas\", 🚀, __proto__, constructor`;
    let source = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", text);
    source = declareCSharpObjectsRun(markCSharpObjectsModel(revealCSharpObjectsHint(source, "guided"), "guided"), "guided");
    const result = exportCSharpObjectsDraft(source, "guided");
    expect(result.ok).toBe(true);
    if (!result.ok) throw Error(result.error);
    expect(JSON.parse(result.content)).toEqual({ format: "orbitamos-csharp-objects-draft", version: 1, unitId: CSHARP_OBJECTS_UNIT_ID, activityId: "guided", filename: "Servico.cs", text });
    expect(result.filename).toBe("orbiservicos-objetos-guided.json");
    let target = setCSharpObjectsDraft(newCSharpObjectsProgress(), "reuse", "belongs to this account");
    target = setCSharpObjectsPreparation(target, "files", true);
    const before = JSON.stringify(target);
    const imported = importCSharpObjectsDraft(target, result.content);
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
    let state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", "previous attempt");
    state = declareCSharpObjectsRun(markCSharpObjectsModel(revealCSharpObjectsHint(state, "guided"), "guided"), "guided");
    const before = JSON.stringify(state);
    const imported = importCSharpObjectsDraft(state, envelope());
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
    const state = declareCSharpObjectsRun(setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", code), "guided");
    const imported = importCSharpObjectsDraft(state, envelope());
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
    JSON.stringify(newCSharpObjectsProgress()),
  ])("rejects incompatible or forged envelopes without changing drafts: %s", raw => {
    const state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", "preserve me");
    const before = JSON.stringify(state);
    expect(importCSharpObjectsDraft(state, raw).ok).toBe(false);
    expect(JSON.stringify(state)).toBe(before);
  });

  it.each(["__proto__", "prototype", "constructor"])("rejects %s envelope metadata without affecting object prototypes", key => {
    const raw = `${envelope().slice(0, -1)},"${key}":{"polluted":true}}`;
    expect(importCSharpObjectsDraft(newCSharpObjectsProgress(), raw).ok).toBe(false);
    expect(Object.prototype).not.toHaveProperty("polluted");
  });

  it("checks UTF-8 bytes before parsing and rejects rather than truncating oversized text", () => {
    const state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", "preserve me");
    const raw = envelope({ text: "á".repeat(60_000) });
    expect(raw.length).toBeLessThan(CSHARP_OBJECTS_MAX_FILE_BYTES);
    expect(new TextEncoder().encode(raw).byteLength).toBeGreaterThan(CSHARP_OBJECTS_MAX_FILE_BYTES);
    const parse = vi.spyOn(JSON, "parse");
    expect(importCSharpObjectsDraft(state, raw).ok).toBe(false);
    expect(parse).not.toHaveBeenCalled();
    expect(state.drafts.guided).toBe("preserve me");
  });

  it("preserves large valid imports exactly, and keeps oversized exports available in the draft", () => {
    const text = "x".repeat(CSHARP_OBJECTS_MAX_CODE - 500);
    const imported = importCSharpObjectsDraft(newCSharpObjectsProgress(), envelope({ text }));
    expect(imported.ok).toBe(true);
    if (!imported.ok) throw Error(imported.error);
    expect(imported.progress.drafts.guided).toBe(text);
    const state = setCSharpObjectsDraft(newCSharpObjectsProgress(), "guided", "🚀".repeat(30_000));
    expect(state.drafts.guided).toHaveLength(60_000);
    expect(exportCSharpObjectsDraft(state, "guided").ok).toBe(false);
    expect(state.drafts.guided).toBe("🚀".repeat(30_000));
    expect(exportCSharpObjectsDraft(newCSharpObjectsProgress(), "guided").ok).toBe(false);
  });
});
