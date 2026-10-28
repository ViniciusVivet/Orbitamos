import { describe, expect, it } from "vitest";
import { getDesafio } from "./desafios";
import { emptyGuidedDraft } from "./guidedPractice";
import { hasCompletedLearningDelivery, hasCompletedPractice } from "./practiceProgress";
import { emptyBeginnerPractice } from "./beginnerPractice";

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
  it("keeps initial work separate from a complete beginner delivery", () => {
    expect(hasCompletedLearningDelivery(challenge, null, guided([0, 1, 2]), null)).toBe(false);
    const base = emptyBeginnerPractice(challenge.slug, 'let nome = "Lia";');
    const adaptationCode = 'let nome = "Bia";', code = 'let nome = "Caio";';
    const complete = JSON.stringify({ ...base, adaptationCode, adaptationValidated: true, adaptationValidatedCode: adaptationCode, adaptationValidatedAt: 1000, stage: "independent", code, validated: true, validatedCode: code, validatedAt: 2000 });
    expect(hasCompletedLearningDelivery(challenge, null, guided([0, 1, 2]), complete)).toBe(true);
    expect(hasCompletedLearningDelivery(challenge, null, null, complete)).toBe(false);
    const legacy = getDesafio("funcoes-js")!;
    expect(hasCompletedLearningDelivery(legacy, free(legacy.steps.map(() => "success")), null, null)).toBe(true);
  });
});
