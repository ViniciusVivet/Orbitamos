import { describe, expect, it } from "vitest";
import { getDesafio } from "./desafios";
import { emptyGuidedDraft } from "./guidedPractice";
import { hasCompletedPractice } from "./practiceProgress";

const challenge = getDesafio("variaveis-js")!;
const guided = (passed: number[]) => JSON.stringify({ ...emptyGuidedDraft(), started: true, code: "console.log('Orbi');", mission: challenge.steps.length - 1, passed });
const free = (statuses: unknown[]) => JSON.stringify({ stepStatus: statuses });

describe("practice completion across independent modes", () => {
  it("counts a validated guided challenge even without a legacy free-mode draft", () => {
    expect(hasCompletedPractice(challenge, null, guided([0, 1, 2]))).toBe(true);
    expect(hasCompletedPractice(challenge, "damaged", guided([0, 1, 2]))).toBe(true);
  });

  it("preserves free-mode completion even when the guided draft is damaged or restarted", () => {
    const complete = free(["success", "success", "success"]);
    expect(hasCompletedPractice(challenge, complete, "damaged")).toBe(true);
    expect(hasCompletedPractice(challenge, complete, JSON.stringify(emptyGuidedDraft()))).toBe(true);
  });

  it("does not infer completion from a visit, partial work, repeated passes or malformed status", () => {
    expect(hasCompletedPractice(challenge, null, null)).toBe(false);
    expect(hasCompletedPractice(challenge, free(["success", "success", "pending"]), guided([0, 1]))).toBe(false);
    expect(hasCompletedPractice(challenge, null, guided([0, 0, 0]))).toBe(false);
    expect(hasCompletedPractice(challenge, JSON.stringify({ stepStatus: "success" }), null)).toBe(false);
    expect(hasCompletedPractice(challenge, free(["success", "success"]), guided([0, 1, 200]))).toBe(false);
  });
});
