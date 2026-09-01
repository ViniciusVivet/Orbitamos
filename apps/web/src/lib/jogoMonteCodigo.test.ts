import { describe, expect, it } from "vitest";
import { criarOpcoesSaida, explicarLinhaMonteCodigo } from "./jogoMonteCodigo";

describe("Monte Código prediction", () => {
  it("never mixes JavaScript undefined into Python distractors", () => {
    const options = criarOpcoesSaida({ linguagem: "python", saidaEsperada: "Maior de idade" });
    expect(options).toContain("Maior de idade");
    expect(options).toContain("None");
    expect(options).not.toContain("undefined");
  });

  it("uses JavaScript-specific distractors for JavaScript", () => {
    const options = criarOpcoesSaida({ linguagem: "javascript", saidaEsperada: "Olá, Orbi!" });
    expect(options).toContain("Olá, Orbi!");
    expect(options).toContain("undefined");
    expect(options).not.toContain("None");
  });

  it("creates a plausible numeric off-by-one option", () => {
    expect(criarOpcoesSaida({ linguagem: "python", saidaEsperada: "10" })).toContain("9");
  });

  it("explains control flow without revealing the expected output", () => {
    expect(explicarLinhaMonteCodigo("if idade >= 18:", "python")).toContain("condição");
    expect(explicarLinhaMonteCodigo("    print(idade)", "python")).toContain("console");
  });
});
