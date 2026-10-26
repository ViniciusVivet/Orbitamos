import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { desafios, getDesafio } from "./desafios";
import { emptyGuidedDraft, guidedLines, guidedMissionProgram, guidedProgram, guidedWritingMatches, nextGuidedLine, readGuidedDraft, writingMatches } from "./guidedPractice";

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
  it("accepts the student's own name with equivalent declaration and quote styles", () => {
    const challenge = getDesafio("variaveis-js")!;
    const reference = guidedProgram(challenge, 0);
    for (const declaration of ["let", "const", "var"]) for (const name of ['"João"', "'Bia'", '"João D\'Ávila"', '"Ana \\"Bia\\""', '"\\u0041na"', "'Lúcia'", '"\\u{1F680} Ana"']) {
      const code = `${declaration} nome = ${name};\nconsole.log(nome);`;
      expect(guidedWritingMatches(code, reference, challenge), code).toBe(true);
      expect(nextGuidedLine({ ...emptyGuidedDraft(), code, started: true }, challenge), code).toBe(1);
    }
  });
  it("preserves personal values while writing subsequent variable missions", () => {
    const challenge = getDesafio("variaveis-js")!;
    const code = 'const nome = "João";\nconsole.log(nome);\nvar idade = 35;\nconsole.log(idade);\nlet ativo = false;\nconsole.log(ativo);';
    expect(guidedWritingMatches(code, guidedMissionProgram(challenge, 2), challenge)).toBe(true);
    expect(nextGuidedLine({ ...emptyGuidedDraft(), code, mission: 1, started: true }, challenge)).toBe(1);
    const output: string[] = [];
    vm.runInNewContext(code, { console: { log: (value: unknown) => output.push(String(value)) } }, { timeout: 1000 });
    for (const step of challenge.steps) expect(step.validacao(code, output.join("\n"))).toBe(true);
    expect(output).toEqual(["João", "35", "false"]);
  });
  it("keeps names, literal types, previous instructions and output references required", () => {
    const challenge = getDesafio("variaveis-js")!;
    const reference = guidedMissionProgram(challenge, 2);
    const valid = 'let nome = "João";\nconsole.log(nome);\nlet idade = 35;\nconsole.log(idade);\nlet ativo = false;\nconsole.log(ativo);';
    for (const code of [
      valid.replace('"João"', '35'), valid.replace('"João"', '""'), valid.replace('"João"', '"   "'),
      valid.replace('"João"', '"\\n\\t"'), valid.replace('"João"', '"\\u00ZZ"'), valid.replace('"João"', '"\\xQQ"'),
      valid.replace('"João"', '"\\u{110000}"'), valid.replace('"João"', '"João'), valid.replace('"João"', '`João ${2}`'),
      valid.replace('let nome', 'let apelido'), valid.replace('let nome', 'nome'), valid.replace('let nome', '// let nome'),
      valid.replace('console.log(nome)', 'console.log("João")'), valid.replace('idade = 35', 'idade = "35"'),
      valid.replace('idade = 35', 'idade = 3 5'), valid.replace('idade = 35', 'idade = 30 + 5'), valid.replace('ativo = false', 'ativo = "false"'),
      valid.replace('ativo = false', 'ativo = 0'), valid.replace('ativo = false', 'ativo = !true'),
    ]) expect(guidedWritingMatches(code, reference, challenge), code).toBe(false);
  });
  it("does not relax unrelated exercises or the default strict writing gate", () => {
    const challenge = getDesafio("variaveis-js")!;
    const code = 'let nome = "João";\nconsole.log(nome);';
    expect(writingMatches(code, guidedProgram(challenge, 0), false)).toBe(false);
    expect(guidedWritingMatches(code, guidedProgram(challenge, 0), { ...challenge, steps: challenge.steps.map(step => ({ ...step, escrita: undefined })) })).toBe(false);
    const python = getDesafio("lacos-python")!;
    expect(guidedWritingMatches("total = 1", "total = 0", python)).toBe(false);
    const functions = getDesafio("funcoes-js")!;
    expect(guidedWritingMatches(guidedProgram(functions, 0).replace("Olá, mundo!", "Oi!"), guidedProgram(functions, 0), functions)).toBe(false);
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
