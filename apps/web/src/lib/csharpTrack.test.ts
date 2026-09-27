import { describe, expect, it } from "vitest";
import { csharpPilot, csharpProgressKey, csharpStages, newCSharpProgress, pilotExercisePassed, pilotExercises, readCSharpProgress } from "./csharpTrack";

describe("C# career pilot", () => {
  it("does not present planned lessons as available", () => {
    expect(csharpStages.filter(stage => stage.available).map(stage => stage.id)).toEqual(["start", "logic"]);
    expect(csharpPilot.codigoInicial).toBe("");
    expect(newCSharpProgress().guided).toBe(false);
  });
  it("requires both runtime output and verification in the guided mission", () => {
    const validate = csharpPilot.steps[0].validacao;
    expect(validate("", "OrbiServiços\n3", "true\ntrue")).toBe(true);
    expect(validate("", "OrbiServiços\n3", "false\ntrue")).toBe(false);
    expect(validate("", "OrbiServiços\n3")).toBe(false);
  });
  it("validates independent variable use, not a hardcoded print", () => {
    expect(pilotExercisePassed("transfer", "int servicosPendentes = 5;\nConsole.WriteLine(servicosPendentes);", "5", "true")).toBe(true);
    expect(pilotExercisePassed("debug", "int servicosPendentes = 3;\nConsole.WriteLine(servicosPendentes);", "3", "true")).toBe(true);
    expect(pilotExercisePassed("transfer", "int servicosPendentes = 5;\nConsole.WriteLine(5);", "5", "true")).toBe(false);
    expect(pilotExercisePassed("transfer", "// int servicosPendentes = 5;\nConsole.WriteLine(5); // Console.WriteLine(servicosPendentes);", "5", "true")).toBe(false);
    expect(pilotExercisePassed("debug", pilotExercises.debug.starter, "3", "true")).toBe(false);
    expect(pilotExercisePassed("transfer", "int servicosPendentes = 5;\nConsole.WriteLine(servicosPendentes);", "5", "false")).toBe(false);
  });
  it("recovers safely from invalid saved state", () => {
    for (const raw of [null, "broken", "null", "{}", '{"version":2}']) expect(readCSharpProgress(raw)).toEqual(newCSharpProgress());
    const value = readCSharpProgress(JSON.stringify({ version: 1, view: "invalid", step: "bad", device: "x", pace: "x", guided: "true", transfer: 1, drafts: { debug: 123 } }));
    expect(value).toEqual(newCSharpProgress());
  });
  it("preserves intentionally blank drafts and separates accounts", () => {
    const saved = { ...newCSharpProgress(), view: "pilot", step: "debug", guided: true, drafts: { transfer: "", debug: "" } };
    expect(readCSharpProgress(JSON.stringify(saved))).toEqual(saved);
    expect(csharpProgressKey("student-a")).not.toEqual(csharpProgressKey("student-b"));
  });
  it("bounds restored text", () => {
    const state = readCSharpProgress(JSON.stringify({ version: 1, reflection: "a".repeat(2000), drafts: { transfer: "a".repeat(110000) } }));
    expect(state.reflection).toHaveLength(1500);
    expect(state.drafts.transfer).toHaveLength(100000);
  });
});
