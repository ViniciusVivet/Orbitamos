import { isPulseLesson, type PulseLessonId, type PulseProgram } from "./orbiPulse";

export type PulsePredictionChoice = "distance" | "interval" | "combined" | "opposite";
export type PulsePrediction = {
  /** Changes with the comparison so a selection cannot leak into another edit. */
  id: string;
  prompt: string;
  options: readonly [
    { id: PulsePredictionChoice; label: string },
    { id: PulsePredictionChoice; label: string },
  ];
  correctId: PulsePredictionChoice;
  explanation: string;
};

// These are the equipment limits accepted by testPulseProgram. A prediction is
// offered only for a valid comparison; it never validates or applies the code.
function valid(program: Readonly<PulseProgram>): boolean {
  return Number.isFinite(program.range) && program.range >= 40 && program.range <= 400
    && Number.isFinite(program.cooldown) && program.cooldown >= .25 && program.cooldown <= 2.5;
}

function sameNumber(a: number, b: number): boolean {
  // Ignore floating-point residue such as .1 + .2 versus .3, not learner edits.
  return Math.abs(a - b) <= Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b)) * 8;
}

/** Optional prediction about the actual edit. No save, XP or execution side effects. */
export function buildPulsePrediction(
  lesson: PulseLessonId,
  previous: Readonly<PulseProgram>,
  candidate: Readonly<PulseProgram>,
): PulsePrediction | null {
  if (!isPulseLesson(lesson) || !valid(previous) || !valid(candidate)) return null;
  const changedRange = !sameNumber(previous.range, candidate.range);
  const changedCooldown = !sameNumber(previous.cooldown, candidate.cooldown);
  if (!changedRange && !changedCooldown) return null;

  const farther = candidate.range > previous.range;
  const sooner = candidate.cooldown < previous.cooldown;
  const distance = farther ? "vai mais longe" : "termina mais perto";
  const interval = sooner ? "espera menos entre disparos" : "espera mais entre disparos";
  let prompt: string;
  let correct: PulsePrediction["options"][number];
  let alternative: PulsePrediction["options"][number];
  let explanation: string;

  if (changedRange && changedCooldown) {
    prompt = `Alcance: ${previous.range} → ${candidate.range}. Recarga: ${previous.cooldown} → ${candidate.cooldown} s. O que muda?`;
    correct = { id: "combined", label: `A onda ${distance}; Orbi ${interval}.` };
    alternative = { id: "opposite", label: `A onda ${farther ? "termina mais perto" : "vai mais longe"}; Orbi ${sooner ? "espera mais entre disparos" : "espera menos entre disparos"}.` };
    explanation = `Você mudou duas coisas: alcancePulso de ${previous.range} para ${candidate.range} e recarga de ${previous.cooldown} para ${candidate.cooldown} s. A onda ${distance} e Orbi ${interval}.`;
  } else if (changedRange) {
    prompt = `alcancePulso: ${previous.range} → ${candidate.range}. O que muda?`;
    correct = { id: "distance", label: `O pulso ${distance}.` };
    alternative = { id: "interval", label: `Orbi ${farther ? "espera menos" : "espera mais"} entre disparos.` };
    explanation = `alcancePulso mudou de ${previous.range} para ${candidate.range}: a onda ${distance}. A recarga continua em ${previous.cooldown} s; a espera entre disparos é a mesma.`;
  } else {
    prompt = `recarga: ${previous.cooldown} → ${candidate.cooldown} s. O que muda?`;
    correct = { id: "interval", label: `Orbi ${interval}.` };
    alternative = { id: "distance", label: `O pulso ${sooner ? "vai mais longe" : "termina mais perto"}.` };
    explanation = `recarga mudou de ${previous.cooldown} para ${candidate.cooldown} s: Orbi ${interval}. O alcance continua em ${previous.range}; a onda percorre a mesma distância.`;
  }

  return {
    id: `${lesson}:${previous.range}:${previous.cooldown}->${candidate.range}:${candidate.cooldown}`,
    prompt,
    options: lesson === "alcance" ? [correct, alternative] : [alternative, correct],
    correctId: correct.id,
    explanation,
  };
}
