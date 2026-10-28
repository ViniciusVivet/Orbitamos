import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { desafios, getDesafio, getNextDesafio, type Desafio } from "./desafios";
import { beginnerJavaScriptPath } from "./practiceExperience";
import { guidedLines, guidedProgram } from "./guidedPractice";
import { practicePath, practiceStory } from "./practiceNarrative";

function execute(challenge: Desafio, code: string) {
  const visible: string[] = [], hidden: string[] = [];
  let verifying = false;
  const context = vm.createContext({ console: { log: (...values: unknown[]) => (verifying ? hidden : visible).push(values.map(String).join(" ")) } });
  try {
    vm.runInContext(code, context, { timeout: 500 });
    verifying = true;
    vm.runInContext(challenge.testCode ?? "", context, { timeout: 500 });
    return { output: visible.join("\n"), passed: challenge.steps[0].validacao(code, visible.join("\n"), hidden.join("\n")) };
  } catch { return { output: visible.join("\n"), passed: false }; }
}

describe("a first JavaScript delivery with explicit prerequisites", () => {
  it("starts with data, arithmetic, decision and a small project before requiring functions", () => {
    const path = beginnerJavaScriptPath.map(item => item.slug);
    expect(desafios.filter(item => item.linguagem === "javascript").slice(0, 4).map(item => item.slug)).toEqual(path);
    for (const [index, item] of beginnerJavaScriptPath.entries()) {
      expect(item.prerequisites.every(slug => path.slice(0, index).includes(slug as typeof path[number]))).toBe(true);
      expect(getDesafio(item.slug)).toBeDefined();
      if (index < path.length - 1) expect(getNextDesafio(item.slug)?.slug).toBe(path[index + 1]);
    }
    const js = desafios.filter(item => item.linguagem === "javascript").map(item => item.slug);
    for (const slug of ["operadores-js", "condicionais-js", "arrays-js", "objetos-js"]) expect(js.indexOf("funcoes-js")).toBeLessThan(js.indexOf(slug));
    expect(getNextDesafio("variaveis-python")?.slug).toBe("condicionais-python");
    expect(getNextDesafio("variaveis-csharp")?.slug).toBe("operadores-csharp");
  });

  it("keeps all previous saved challenge identifiers accessible", () => {
    const existing = ["variaveis-js", "funcoes-js", "arrays-js", "operadores-js", "condicionais-js", "lacos-js", "objetos-js", "strings-js", "metodos-array-js", "assincrono-js", "desestruturacao-js", "sets-js", "validacao-js", "recursao-js", "variaveis-python", "condicionais-python", "lacos-python", "listas-python", "dicionarios-python", "funcoes-python", "strings-python", "comprehensions-python", "erros-python", "classes-python", "tuplas-python", "sets-python", "ordenacao-python", "recursao-python", "variaveis-csharp", "operadores-csharp", "condicionais-csharp", "lacos-csharp"];
    expect(new Set(desafios.map(item => item.slug)).size).toBe(desafios.length);
    for (const slug of existing) expect(getDesafio(slug), slug).toBeDefined();
  });

  for (const slug of beginnerJavaScriptPath.slice(1).map(item => item.slug)) {
    it(`executes the guided example for ${slug} and explains its lines in context`, () => {
      const challenge = getDesafio(slug)!;
      const source = guidedProgram(challenge, 0);
      expect(source).not.toMatch(/\bfunction\b|=>|\breturn\b/);
      expect(execute(challenge, source).passed).toBe(true);
      expect(challenge.codigoInicial).not.toContain(source);
      expect(guidedLines(challenge, 0).every(line => line.why.length > 30 && line.title !== "Acrescente esta instrução")).toBe(true);
      expect(practiceStory(challenge).goal).not.toBe(challenge.titulo);
    });
  }
  it("keeps the first project discoverable as a first step rather than a functions exercise", () => {
    expect(practicePath(getDesafio("primeiro-orcamento-js")!)).toBe("first");
  });
});

describe("arithmetic verified from program state", () => {
  const challenge = getDesafio("contas-servico-js")!;
  const source = challenge.solucao!;
  it("accepts another pair of values without demanding the example answer", () => {
    const result = execute(challenge, source.replace("= 80", "= 120").replace("= 25", "= 35"));
    expect(result).toEqual({ output: "85", passed: true });
  });
  it("rejects a hardcoded result and words hidden in comments or strings", () => {
    const hardcoded = source.replace("valorServico - custoMaterial", "55");
    expect(execute(challenge, hardcoded).passed).toBe(false);
    expect(execute(challenge, `/* const valorDisponivel = valorServico - custoMaterial; */\n${hardcoded}`).passed).toBe(false);
    expect(execute(challenge, `const pista = "const valorDisponivel = valorServico - custoMaterial;";\n${hardcoded}`).passed).toBe(false);
    expect(execute(challenge, source.replace("console.log(valorDisponivel)", "console.log(55)")).passed).toBe(false);
  });
  it("requires execution evidence, numeric inputs and the actual output", () => {
    expect(challenge.steps[0].validacao(source, "55")).toBe(false);
    expect(execute(challenge, source.replace("= 80", '= "80"')).passed).toBe(false);
    expect(execute(challenge, source.replace("console.log(valorDisponivel)", "console.log(valorServico)")).passed).toBe(false);
  });
});

describe("a decision that includes the boundary", () => {
  const challenge = getDesafio("decisao-servico-js")!;
  for (const [available, expected] of [[49, "Falta para a meta"], [50, "Meta atingida"], [51, "Meta atingida"]] as const) {
    it(`chooses the real branch for available=${available}`, () => {
      expect(execute(challenge, challenge.solucao!.replace("= 55", `= ${available}`))).toEqual({ output: expected, passed: true });
    });
  }
  it("rejects the wrong comparison, commentary instead of a decision and nonnumeric data", () => {
    expect(execute(challenge, challenge.solucao!.replace(">=", ">")).passed).toBe(false);
    expect(execute(challenge, 'const valorDisponivel = 55;\nconst meta = 50;\n// if (valorDisponivel >= meta) {} else {}\nconsole.log("Meta atingida");').passed).toBe(false);
    expect(execute(challenge, challenge.solucao!.replace("= 55", '= "55"')).passed).toBe(false);
    expect(execute(challenge, 'const valorDisponivel = 55;\nconst meta = 50;\nif (valorDisponivel >= meta) {} else {}\nconsole.log("Meta atingida");').passed).toBe(false);
  });
});

describe("the first quote joins data, calculation and a decision", () => {
  const challenge = getDesafio("primeiro-orcamento-js")!;
  it("recalculates for another client and an above-limit order", () => {
    const code = challenge.solucao!.replace('"Lia"', '"Rui"').replace("= 3", "= 4").replace("= 40", "= 50").replace("= 150", "= 180");
    expect(execute(challenge, code)).toEqual({ output: "Rui\n200\nAcima do limite", passed: true });
  });
  it("includes an order exactly at the limit", () => {
    expect(execute(challenge, challenge.solucao!.replace("= 150", "= 120"))).toEqual({ output: "Lia\n120\nDentro do limite", passed: true });
  });
  it("does not treat outer whitespace in a nonempty client name as a failed calculation", () => {
    expect(execute(challenge, challenge.solucao!.replace('"Lia"', '" Lia "')).passed).toBe(true);
  });
  it("rejects fake totals, empty client names, text quantities and fixed output", () => {
    for (const code of [challenge.solucao!.replace("quantidade * valorPorServico", "120"), challenge.solucao!.replace('"Lia"', '" "'), challenge.solucao!.replace("= 3", '= "3"'), challenge.solucao!.replace("console.log(total)", "console.log(120)")]) expect(execute(challenge, code).passed).toBe(false);
  });
});
