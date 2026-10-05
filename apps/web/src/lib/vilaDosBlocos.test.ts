import { describe, it, expect } from "vitest";
import { buddies, evaluateVillage, initialAttempt, readVillageSave, villageCode, villageLevels } from "./vilaDosBlocos";

describe("Vila dos Blocos", () => {
  it("has ten distinct story puzzles with actual code and valid solutions", () => {
    expect(villageLevels).toHaveLength(10);
    expect(new Set(villageLevels.map(level => level.id)).size).toBe(10);
    for (const level of villageLevels) {
      const answer = level.kind === "socket" ? { pair: level.answer, indents: [] } : { pair: null, indents: level.answer };
      expect(evaluateVillage(level, answer).ok).toBe(true);
      expect(evaluateVillage(level, answer).output).toEqual(level.output);
      expect(evaluateVillage(level, initialAttempt(level)).ok).toBe(false);
      expect(villageCode(level, answer)).not.toContain("?");
      expect(buddies[level.buddy]).toBeDefined();
    }
  });
  it("does not call a valid but wrong intention a syntax error", () => {
    const level = villageLevels.find(level => level.id === "festa-sem-chuva")!;
    const result = evaluateVillage(level, initialAttempt(level));
    expect(result.ok).toBe(false);
    expect(result.output).toEqual([]);
    expect(result.message).toContain("Não é erro de sintaxe");
    expect(evaluateVillage(level, { pair: null, indents: [0, 0, 1, 2] }).message).toContain("não abre um bloco novo");
  });
  it("shows repetition when the announcement remains in the loop", () => {
    const result = evaluateVillage(villageLevels[7], { pair: null, indents: [0, 1, 1] });
    expect(result.ok).toBe(false);
    expect(result.output.filter(item => item === "Pronto!")).toHaveLength(3);
  });
  it("renders real spaces, not literal dots or tabs", () => {
    expect(villageCode(villageLevels[8], { pair: null, indents: [0, 0, 1, 2] })).toBe('festa = True\nif festa:\n    for luz in range(2):\n        print("Estrela acesa")');
  });
  it("rejects wrong symbol pairs and incomplete placements", () => {
    for (const level of villageLevels.filter(level => level.kind === "socket")) {
      for (const pair of [null, "parenteses", "colchetes", "chaves", "espacos"] as const) expect(evaluateVillage(level, { pair, indents: [] }).ok).toBe(pair === level.answer);
    }
  });
  it("restores only valid, unique completion IDs and a bounded current stage", () => {
    for (const raw of [null, "oops", "null", '{"version":2}', '{"version":1,"completed":42}']) expect(readVillageSave(raw)).toEqual({ version: 1, completed: [], current: 0 });
    expect(readVillageSave(JSON.stringify({ version: 1, completed: ["correio", "correio", "fake", 10], current: 999 }))).toEqual({ version: 1, completed: ["correio"], current: 0 });
    expect(readVillageSave(JSON.stringify({ version: 1, completed: ["mochila"], current: 2 })).current).toBe(2);
  });
});
