import type { Desafio } from "./desafios";
import { readGuidedDraft } from "./guidedPractice";
import { hasCompletedBeginnerPractice, supportsBeginnerPractice } from "./beginnerPractice";

/** Counts validated missions from either practice mode, never a page visit. */
export function hasCompletedPractice(challenge: Desafio, freeRaw: string | null, guidedRaw: string | null): boolean {
  const guided = readGuidedDraft(guidedRaw, challenge);
  if (challenge.steps.length > 0 && guided.started && guided.passed.length === challenge.steps.length) return true;

  try {
    const free = JSON.parse(freeRaw ?? "null");
    return challenge.steps.length > 0 && Array.isArray(free?.stepStatus) &&
      free.stepStatus.length === challenge.steps.length &&
      free.stepStatus.every((status: unknown) => status === "success");
  } catch {
    return false;
  }
}

/** A learning delivery adds independently tested application to the existing guided/free evidence.
 * The earlier mission records remain unchanged and can still be shown as validated support. */
export function hasCompletedLearningDelivery(challenge: Desafio, freeRaw: string | null, guidedRaw: string | null, applicationRaw: string | null): boolean {
  return hasCompletedPractice(challenge, freeRaw, guidedRaw) && (!supportsBeginnerPractice(challenge.slug) || hasCompletedBeginnerPractice(applicationRaw, challenge.slug));
}
