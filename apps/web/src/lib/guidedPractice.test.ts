import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { desafios, getDesafio } from "./desafios";
import { emptyGuidedDraft, guidedLines, guidedProgram, readGuidedDraft, writingMatches } from "./guidedPractice";

describe("guided writing, not a substitute for runtime tests", () => {
  it("has complete, explained writing steps for every mission", () => {
    for (const challenge of desafios) for (let mission = 0; mission < challenge.steps.length; mission++) {
      const lines = guidedLines(challenge, mission);
      expect(lines.length, challenge.slug).toBeGreaterThan(0);
      expect(lines.every(line => line.title && line.why && line.code.trim()), challenge.slug).toBe(true);
      expect(writingMatches(lines.map(line => line.code).join("\n"), guidedProgram(challenge, mission), challenge.linguagem === "python"), challenge.slug).toBe(true);
    }
  });
  it("allows cosmetic JS spacing, quote style and optional semicolon", () => {
    expect(writingMatches("let nome='Seu Nome'\nconsole.log(nome)", 'let nome = "Seu Nome";\nconsole.log(nome);', false)).toBe(true);
    expect(writingMatches("letnome='Seu Nome'", 'let nome = "Seu Nome";', false)).toBe(false);
    expect(writingMatches('let nome = "SeuNome";', 'let nome = "Seu Nome";', false)).toBe(false);
  });
  it("does not accept comments, strings containing code, missing or altered previous lines", () => {
    for (const code of ["", "# total = 0", '"total = 0"', "total = 1", "print(0)"]) expect(writingMatches(code, "total = 0", true)).toBe(false);
    expect(writingMatches("total = 1\nfor numero in range(1, 101):", "total = 0\nfor numero in range(1, 101):", true)).toBe(false);
  });
  it("requires Python indentation and documents the exclusive range limit", () => {
    expect(writingMatches("total += numero", "    total += numero", true)).toBe(false);
    expect(writingMatches("    total+=numero", "    total += numero", true)).toBe(true);
    expect(guidedLines(getDesafio("lacos-python")!, 0)[1].why).toContain("101");
  });
  it("preserves intentionally blank drafts and rejects malformed storage", () => {
    const challenge = getDesafio("lacos-python")!;
    const blank = { ...emptyGuidedDraft(), started: true };
    expect(readGuidedDraft(JSON.stringify(blank), challenge)).toEqual(blank);
    for (const raw of ["broken", "null", "{}", JSON.stringify({ ...blank, line: 99 }), JSON.stringify({ ...blank, mission: -1 })]) expect(readGuidedDraft(raw, challenge)).toEqual(emptyGuidedDraft());
  });
  for (const challenge of desafios.filter(item => item.linguagem === "javascript")) {
    it(`executes the full guided reference and original tests: ${challenge.slug}`, async () => {
      let code = "";
      for (let mission = 0; mission < challenge.steps.length; mission++) {
        code += "\n" + guidedProgram(challenge, mission);
        const output: string[] = [];
        const checks: string[] = [];
        let verifying = false;
        const context = vm.createContext({ console: { log: (...values: unknown[]) => (verifying ? checks : output).push(values.map(value => typeof value === "object" ? JSON.stringify(value) : String(value)).join(" ")) }, verify: () => { verifying = true; } });
        await vm.runInContext(`(async () => { ${code}\n await Promise.resolve(); verify(); ${challenge.testCode ?? ""}\n })()`, context, { timeout: 1000 });
        for (const step of challenge.steps.slice(0, mission + 1)) expect(step.validacao(code, output.join("\n"), checks.join("\n")), `${challenge.slug} mission ${mission}`).toBe(true);
      }
    });
  }
});
