import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { adaptationTarget, beginnerPracticeKey, beginnerPracticeSlugs, beginnerPracticeTask, emptyBeginnerPractice, getBeginnerPractice, hasCompletedBeginnerPractice, prepareBeginnerRun, readBeginnerPractice, replaceBeginnerInputs, supportsBeginnerPractice, verifyBeginnerRun } from "./beginnerPractice";
import type { BrowserCodeResult } from "./browserCodeRunner";

const programs: Record<string, string> = {
  "variaveis-js": 'const nome = "Caio";\nlet idade = 19;\nvar ativo = false;\nconsole.log(nome);\nconsole.log(idade);\nconsole.log(ativo);',
  "contas-servico-js": "let valorServico = 160;\nconst custoMaterial = 45;\nlet valorDisponivel = valorServico - custoMaterial;\nconsole.log(valorDisponivel);",
  "decisao-servico-js": 'let valorDisponivel = 50;\nconst meta = 50;\nif (valorDisponivel >= meta) {\n  console.log("Meta atingida");\n} else {\n  console.log("Falta para a meta");\n}',
  "primeiro-orcamento-js": 'const cliente = "Caio";\nlet quantidade = 2;\nlet valorPorServico = 50;\nconst limite = 100;\nlet total = quantidade * valorPorServico;\nconsole.log(cliente);\nconsole.log(total);\nif (total <= limite) {\n  console.log("Dentro do limite");\n} else {\n  console.log("Acima do limite");\n}',
};
function execute(code: string, verificationCode: string): BrowserCodeResult {
  const logs: string[] = [], checked: string[] = [];
  let verifying = false;
  try {
    vm.runInNewContext(`(function(){${code}\n__verify();\n${verificationCode}\n})();`, { console: { log: (...args: unknown[]) => (verifying ? checked : logs).push(args.map(String).join(" ")) }, __verify: () => { verifying = true; } }, { timeout: 1000 });
    return { output: logs.join("\n"), verificationOutput: checked.join("\n"), error: null, timedOut: false };
  } catch (error) { return { output: logs.join("\n"), error: String(error), timedOut: false }; }
}
function completed(slug: string) {
  const draft = emptyBeginnerPractice(slug, programs[slug]);
  return { ...draft, adaptationCode: replaceBeginnerInputs(programs[slug], getBeginnerPractice(slug)!.cases[draft.adaptationTarget].inputs)!, adaptationValidated: true, adaptationValidatedAt: Date.now(), code: programs[slug], validated: true, validatedCode: programs[slug], validatedAt: Date.now(), stage: "independent" as const };
}

describe("guided-to-independent beginner practice", () => {
  it("publishes only the four real first-path activities and gives each a distinct transfer situation", () => {
    expect(beginnerPracticeSlugs).toEqual(["variaveis-js", "contas-servico-js", "decisao-servico-js", "primeiro-orcamento-js"]);
    expect(supportsBeginnerPractice("variaveis-js")).toBe(true);
    expect(supportsBeginnerPractice("funcoes-js")).toBe(false);
    for (const slug of beginnerPracticeSlugs) {
      const spec = getBeginnerPractice(slug)!;
      expect(spec.hints).toHaveLength(3);
      expect(spec.cases).toHaveLength(3);
      for (let index = 0; index < 3; index++) expect(beginnerPracticeTask(slug, index)?.requirements.length).toBeGreaterThan(2);
      expect(spec.cases[2].inputs).not.toEqual(spec.cases[0].inputs);
    }
  });
  it("selects an alteration that is semantically different even with whitespace, quote changes or escapes", () => {
    const same = "const nome = 'Bia'\nlet idade=27.0\nvar ativo=false;\nconsole.log(nome);";
    expect(adaptationTarget("variaveis-js", same)).toBe(1);
    expect(adaptationTarget("variaveis-js", same.replace("'Bia'", '"\\u{42}ia"'))).toBe(1);
    expect(adaptationTarget("variaveis-js", same.replace("Bia", "João"))).toBe(0);
    expect(emptyBeginnerPractice("variaveis-js", same).adaptationCode).toBe(same);
  });
  it("replaces only input literals, preserving computation, comments and strings containing code", () => {
    const code = '// let valorServico = 999;\nconst nota = "let custoMaterial = 12;";\nlet valorServico = 160;\nconst custoMaterial=45;\nlet valorDisponivel=valorServico-custoMaterial;';
    const changed = replaceBeginnerInputs(code, { valorServico: 90, custoMaterial: 20 });
    expect(changed).toContain("// let valorServico = 999;");
    expect(changed).toContain('"let custoMaterial = 12;"');
    expect(changed).toContain("let valorServico = 90;");
    expect(changed).toContain("const custoMaterial=20;");
    expect(changed).toContain("valorDisponivel=valorServico-custoMaterial");
    for (const invalid of ['// let nome = "Caio";', 'const texto = "let nome = 1";', 'let nome = "Caio"; var nome = "Bia";', 'let nome = gerarNome();', 'let nome = "C" + "aio";', 'nome = "Caio";']) expect(replaceBeginnerInputs(invalid, { nome: "Nina" }), invalid).toBeNull();
  });
  it("executes all correct transfers with new inputs, arithmetic and inclusive decision limits", () => {
    for (const slug of beginnerPracticeSlugs) for (const index of [2, 0, 1]) {
      const run = prepareBeginnerRun(slug, programs[slug], index, index !== 2)!;
      expect(run, slug).not.toBeNull();
      const result = execute(run.code, run.verificationCode);
      expect(verifyBeginnerRun(slug, index, result), `${slug}, case ${index}: ${JSON.stringify(result)}`).toBe(true);
    }
  });
  it("rejects copied outputs, fixed calculated results, incomplete branches and strict rather than inclusive bounds", () => {
    const invalid = {
      "variaveis-js": programs["variaveis-js"].replace("console.log(nome)", 'console.log("Caio")'),
      "contas-servico-js": programs["contas-servico-js"].replace("valorServico - custoMaterial", "115"),
      "decisao-servico-js": programs["decisao-servico-js"].replace("valorDisponivel >= meta", "true"),
      "primeiro-orcamento-js": programs["primeiro-orcamento-js"].replace("total <= limite", "total < limite"),
    };
    for (const [slug, code] of Object.entries(invalid)) {
      const checks = [2, 0, 1].map(index => {
        const run = prepareBeginnerRun(slug, code, index, index !== 2)!;
        return verifyBeginnerRun(slug, index, execute(run.code, run.verificationCode));
      });
      expect(checks.every(Boolean), slug).toBe(false);
    }
  });
  it("requires both public output and all exact runtime checks, without trusting truthy text", () => {
    const run = prepareBeginnerRun("variaveis-js", programs["variaveis-js"], 2)!;
    const result = execute(run.code, run.verificationCode);
    for (const modified of [
      { ...result, verificationOutput: "true" }, { ...result, verificationOutput: '{"activity":"profile-transfer-v1","checks":[true]}' },
      { ...result, verificationOutput: result.verificationOutput!.replace("true", '"true"') }, { ...result, output: "Caio\n19\ntrue" },
      { ...result, error: "SyntaxError" }, { ...result, cancelled: true }, { ...result, timedOut: true }, { ...result, truncated: true },
    ]) expect(verifyBeginnerRun("variaveis-js", 2, modified)).toBe(false);
  });
  it("scopes saves and only restores complete two-stage evidence for the unchanged code", () => {
    expect(beginnerPracticeKey(1, "variaveis-js")).not.toBe(beginnerPracticeKey(2, "variaveis-js"));
    const draft = completed("variaveis-js"); draft.adaptationValidatedCode = draft.adaptationCode;
    const raw = JSON.stringify(draft);
    expect(hasCompletedBeginnerPractice(raw, "variaveis-js")).toBe(true);
    expect(readBeginnerPractice(raw, "variaveis-js").stage).toBe("independent");
    expect(readBeginnerPractice(raw, "contas-servico-js").validated).toBe(false);
    for (const data of [
      { ...draft, adaptationValidated: false }, { ...draft, adaptationCode: draft.adaptationCode + "\n// edição" },
      { ...draft, code: draft.code + "\nconsole.log(1);" }, { ...draft, version: 2 }, { ...draft, validatedAt: Date.now() + 600000 },
      { ...draft, validatedCode: null }, { ...draft, adaptationTarget: draft.adaptationTarget === 0 ? 1 : 0 },
    ]) expect(hasCompletedBeginnerPractice(JSON.stringify(data), "variaveis-js")).toBe(false);
  });
  it("recovers safe drafts from malformed or obsolete records without awarding completion", () => {
    for (const raw of [null, "{", "[]", '"texto"', '{"version":1,"activity":"old","validated":true}']) expect(readBeginnerPractice(raw, "variaveis-js")).toEqual(emptyBeginnerPractice("variaveis-js"));
    const draft = emptyBeginnerPractice("variaveis-js", programs["variaveis-js"]);
    const read = readBeginnerPractice(JSON.stringify({ ...draft, code: "x".repeat(13000), hints: 1000, attempts: -1, validated: true }), "variaveis-js");
    expect(read.code).toHaveLength(12000); expect(read.hints).toBe(3); expect(read.attempts).toBe(0); expect(read.validated).toBe(false);
  });
});
