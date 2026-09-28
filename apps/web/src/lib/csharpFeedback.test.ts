import { describe, expect, it } from "vitest";
import { explainCSharpFailure } from "./csharpFeedback";
import { variableActivities, type VariableCode } from "./csharpVariables";

describe("browser-independent C# learning feedback", () => {
  const activity = variableActivities.find(item => item.id === "debug") as VariableCode;
  for (const error of ["servicospendentes is not defined", "ReferenceError: servicospendentes is not defined", "Can't find variable: servicospendentes"]) {
    it(`explains a case mismatch for ${error}`, () => {
      const feedback = explainCSharpFailure(activity, activity.starter, { output: "", error, timedOut: false });
      expect(feedback).toContain("Você escreveu servicospendentes, mas declarou servicosPendentes");
      expect(feedback).toContain("maiúsculas e minúsculas importam");
    });
  }
  it("does not invent a similar declaration for an unknown WebKit identifier", () => {
    expect(explainCSharpFailure(activity, "Console.WriteLine(inexistente);", { output: "", error: "Can't find variable: inexistente", timedOut: false })).toContain("O nome inexistente não foi encontrado");
  });
});
