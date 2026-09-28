import { describe, expect, it } from "vitest";
import { desafios, getDesafio } from "./desafios";
import { contextualLine, practicePath, practicePaths, practiceStories, practiceStory } from "./practiceNarrative";
import { emptyGuidedDraft, guidedLines, guidedMissionProgram, guidedProgram, nextGuidedLine } from "./guidedPractice";

describe("practice context and learning routes", () => {
  it("gives every catalog challenge a specific story and one purpose", () => {
    expect(Object.keys(practiceStories).sort()).toEqual(desafios.map(c => c.slug).sort());
    for (const challenge of desafios) {
      expect(Object.values(practiceStory(challenge)).every(value => value.trim().length > 0), challenge.slug).toBe(true);
      expect(practicePaths.some(path => path.id === practicePath(challenge))).toBe(true);
    }
  });
  it("keeps fundamentals, logic and functions distinct", () => {
    expect(practicePath(getDesafio("variaveis-csharp")!)).toBe("first");
    expect(practicePath(getDesafio("condicionais-python")!)).toBe("logic");
    expect(practicePath(getDesafio("funcoes-js")!)).toBe("building");
  });
  it("explains parameters without claiming a function runs at declaration", () => {
    const line = contextualLine(getDesafio("condicionais-js")!, "function classificar(nota) {")!;
    expect(line.why).toContain("nessa chamada");
    expect(line.why).toContain("ainda não a executa");
    expect(contextualLine(getDesafio("operadores-js")!, "  return preco - preco * (desconto / 100);")!.why).toContain("170");
  });
  it("matches the actual Python rules instead of guessing from titles", () => {
    const age = getDesafio("condicionais-python")!;
    expect(practiceStory(age).outcome).toBe("sim e não");
    expect(contextualLine(age, "        return 'sim'")!.why).toContain("oito espaços");
    expect(contextualLine(age, "    return 'não'")!.why).toContain("quatro espaços");
    expect(practiceStory(getDesafio("listas-python")!).scene).toContain("não calculamos a média");
    expect(practiceStory(getDesafio("listas-python")!).outcome).toBe("[8, 9, 7]");
  });
});

describe("automatic writing progression is not runtime validation", () => {
  const challenge = getDesafio("lacos-python")!;
  it("advances just one step for a correct prefix, including pasted programs", () => {
    expect(nextGuidedLine({ ...emptyGuidedDraft(), code: "total = 0" }, challenge)).toBe(1);
    expect(nextGuidedLine({ ...emptyGuidedDraft(), code: guidedProgram(challenge, 0) }, challenge)).toBe(1);
  });
  it("does not advance empty, commented, wrong or unindented lines", () => {
    for (const code of ["", "# total = 0", "total = 1"]) expect(nextGuidedLine({ ...emptyGuidedDraft(), code }, challenge)).toBeNull();
    expect(nextGuidedLine({ ...emptyGuidedDraft(), line: 2, code: "total = 0\nfor numero in range(1, 101):\ntotal += numero" }, challenge)).toBeNull();
  });
  it("does not finish the final step or cross a validated mission", () => {
    const code = guidedProgram(challenge, 0);
    expect(nextGuidedLine({ ...emptyGuidedDraft(), code, line: guidedLines(challenge, 0).length - 1 }, challenge)).toBeNull();
    expect(nextGuidedLine({ ...emptyGuidedDraft(), code, passed: [0] }, challenge)).toBeNull();
  });
  it("requires previous missions to remain in the program", () => {
    const variables = getDesafio("variaveis-js")!;
    expect(guidedMissionProgram(variables, 1)).toBe(`${guidedProgram(variables, 0)}\n${guidedProgram(variables, 1)}`);
    expect(nextGuidedLine({ ...emptyGuidedDraft(), mission: 1, code: "let idade = 20;" }, variables)).toBeNull();
    expect(nextGuidedLine({ ...emptyGuidedDraft(), mission: 1, code: `${guidedProgram(variables, 0)}\nlet idade = 20;` }, variables)).toBe(1);
  });
});
