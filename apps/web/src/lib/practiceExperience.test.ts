import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { desafios, getDesafio } from "./desafios";
import { guidedProgram } from "./guidedPractice";
import { defaultCatalogView, practiceChecks, practiceJourney, practiceSymbols, readCatalogView, readPracticeAnswer } from "./practiceExperience";

describe("a continuous practice experience", () => {
  it("places all 32 challenges in the actual sequence without crossing languages", () => {
    for (const challenge of desafios) {
      const journey = practiceJourney(challenge);
      expect(journey.items[journey.index]).toBe(challenge);
      expect(journey.items.every(item => item.linguagem === challenge.linguagem)).toBe(true);
      if (journey.previous) expect(journey.previous.linguagem).toBe(challenge.linguagem);
      if (journey.next) expect(journey.next.linguagem).toBe(challenge.linguagem);
    }
    expect(practiceJourney(getDesafio("recursao-js")!).next).toBeUndefined();
    expect(practiceJourney({ ...desafios[0], slug: "embedded-only" }).index).toBe(-1);
  });
  it("restores the view but rejects damaged or unsupported filter values", () => {
    for (const raw of [null, "null", "not json", "[]", '{"language":"sql","purpose":"hacked","query":42}']) expect(readCatalogView(raw)).toEqual(defaultCatalogView);
    const view = { language: "python", purpose: "logic", difficulty: "basico", filter: "andamento", query: "soma" };
    expect(readCatalogView(JSON.stringify(view))).toEqual(view);
    expect(readCatalogView(JSON.stringify({ query: "x".repeat(500) })).query.length).toBe(120);
  });
  it("explicit return-to-language links clear incompatible search filters", () => {
    expect(readCatalogView(JSON.stringify({ language: "csharp", purpose: "building", query: "nothing" }), "?linguagem=python")).toEqual({ ...defaultCatalogView, language: "python" });
    expect(readCatalogView(null, "?linguagem=unknown")).toEqual(defaultCatalogView);
  });
  it("offers consistent optional checks with separate versioned answers", () => {
    expect(Object.keys(practiceChecks)).toHaveLength(8);
    expect(new Set(Object.values(practiceChecks).map(item => item.id)).size).toBe(8);
    for (const [slug, check] of Object.entries(practiceChecks)) {
      expect(getDesafio(slug)).toBeDefined();
      expect(check.feedback.length).toBe(check.options.length);
      expect(check.options[check.answer]).toBeDefined();
      expect(readPracticeAnswer(JSON.stringify({ id: check.id, answer: check.answer }), check)).toBe(check.answer);
      for (const raw of [null, "oops", "null", JSON.stringify({ id: "old", answer: 0 }), JSON.stringify({ id: check.id, answer: -1 }), JSON.stringify({ id: check.id, answer: check.options.length }), JSON.stringify({ id: check.id, answer: "0" })]) expect(readPracticeAnswer(raw, check)).toBeNull();
    }
  });
  for (const slug of ["operadores-js", "condicionais-js", "variaveis-js"]) {
    it(`executes the application question for ${slug}`, () => {
      const logs: string[] = [];
      const check = practiceChecks[slug];
      const context = vm.createContext({ console: { log: (value: unknown) => logs.push(String(value)) } });
      if (slug !== "variaveis-js") vm.runInContext(guidedProgram(getDesafio(slug)!, 0), context);
      logs.length = 0;
      vm.runInContext(check.code, context);
      expect(check.options[check.answer]).toContain(logs[0]);
    });
  }
  it("provides useful punctuation and never inserts code automatically", () => {
    expect(practiceSymbols("csharp")).toContain(";");
    expect(practiceSymbols("javascript")).toContain("'");
    expect(practiceSymbols("python")).toContain(":");
    expect(practiceSymbols("python")).toContain("_");
    for (const language of ["javascript", "python", "csharp"] as const) {
      expect(new Set(practiceSymbols(language)).size).toBe(practiceSymbols(language).length);
      expect(practiceSymbols(language)).toEqual(expect.arrayContaining(["Recuo", "↵", "(", ")", '"', "'", ":", "=", "+", "_", "{", "}"]));
    }
  });
});
