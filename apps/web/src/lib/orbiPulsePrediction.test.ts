import { describe, expect, it } from "vitest";
import { buildPulsePrediction } from "./orbiPulsePrediction";
import { testPulseProgram, type PulseLessonId, type PulseProgram } from "./orbiPulse";

const start: PulseProgram = { range: 90, cooldown: 1.4 };
function prediction(lesson: PulseLessonId, previous: PulseProgram, next: PulseProgram) {
  const result = buildPulsePrediction(lesson, previous, next);
  if (!result) throw new Error("Expected a prediction for a valid changed program");
  const answer = result.options.find(option => option.id === result.correctId);
  if (!answer) throw new Error("The correct answer must be one of the choices");
  return { ...result, answer: answer.label };
}

describe("previsões opcionais da Oficina do Pulso", () => {
  it("liga aumento e redução do alcance à distância, mantendo a recarga", () => {
    const longer = prediction("alcance", start, { range: 320, cooldown: 1.4 });
    expect(longer.correctId).toBe("distance");
    expect(longer.answer).toContain("mais longe");
    expect(longer.prompt).toContain("90 → 320");
    expect(longer.explanation).toContain("recarga continua em 1.4 s");
    const shorter = prediction("alcance", { range: 320, cooldown: 1.4 }, { range: 120, cooldown: 1.4 });
    expect(shorter.correctId).toBe("distance");
    expect(shorter.answer).toContain("mais perto");
    expect(shorter.prompt).toContain("320 → 120");
  });

  it("liga o sentido da recarga ao intervalo, sem inventar mudança de alcance", () => {
    const quicker = prediction("ritmo", { range: 280, cooldown: 1.4 }, { range: 280, cooldown: .6 });
    expect(quicker.correctId).toBe("interval");
    expect(quicker.answer).toContain("espera menos");
    expect(quicker.prompt).toContain("1.4 → 0.6 s");
    expect(quicker.explanation).toContain("alcance continua em 280");
    const slower = prediction("ritmo", { range: 280, cooldown: .6 }, { range: 280, cooldown: 2 });
    expect(slower.answer).toContain("espera mais");
    expect(slower.prompt).toContain("0.6 → 2 s");
    expect(slower.explanation).toContain("mesma distância");
  });

  it.each([
    [{ range: 280, cooldown: .6 }, "mais longe", "espera menos"],
    [{ range: 280, cooldown: 2 }, "mais longe", "espera mais"],
    [{ range: 40, cooldown: .6 }, "mais perto", "espera menos"],
    [{ range: 40, cooldown: 2 }, "mais perto", "espera mais"],
  ] as const)("combina corretamente duas mudanças: %j", (next, distance, interval) => {
    const result = prediction("alcance", start, next);
    expect(result.correctId).toBe("combined");
    expect(result.answer).toContain(distance);
    expect(result.answer).toContain(interval);
    expect(result.explanation).toContain(`alcancePulso de 90 para ${next.range}`);
    expect(result.explanation).toContain(`recarga de 1.4 para ${next.cooldown} s`);
    const alternative = result.options.find(option => option.id !== result.correctId)!;
    expect(alternative.label).not.toContain(distance);
    expect(alternative.label).not.toContain(interval);
  });

  it("segue a edição real mesmo quando o aluno altera outra variável na lição", () => {
    expect(prediction("alcance", start, { range: 90, cooldown: .8 }).correctId).toBe("interval");
    expect(prediction("ritmo", start, { range: 150, cooldown: 1.4 }).correctId).toBe("distance");
  });

  it("não cria uma pergunta sem mudança nem para resíduos numéricos", () => {
    expect(buildPulsePrediction("alcance", start, { ...start })).toBeNull();
    expect(buildPulsePrediction("ritmo", { range: 280, cooldown: .1 + .2 }, { range: 280, cooldown: .3 })).toBeNull();
    expect(buildPulsePrediction("ritmo", { range: 280, cooldown: .3 }, { range: 280, cooldown: .301 })).not.toBeNull();
  });

  it("só compara equipamentos válidos aceitos pelo terminal", () => {
    for (const next of [{ range: 40, cooldown: .25 }, { range: 400, cooldown: 2.5 }]) {
      expect(testPulseProgram(`const alcancePulso=${next.range}; const recarga=${next.cooldown};`).ok).toBe(true);
      expect(buildPulsePrediction("alcance", start, next)).not.toBeNull();
    }
    for (const invalid of [
      { range: 0, cooldown: 1 }, { range: 401, cooldown: 1 }, { range: 39, cooldown: 1 },
      { range: 90, cooldown: 0 }, { range: 90, cooldown: 2.6 }, { range: 90, cooldown: .24 },
      { range: NaN, cooldown: 1 }, { range: 90, cooldown: Infinity },
    ]) {
      expect(buildPulsePrediction("alcance", start, invalid)).toBeNull();
      expect(buildPulsePrediction("ritmo", invalid, start)).toBeNull();
    }
    expect(buildPulsePrediction("outra" as PulseLessonId, start, { range: 280, cooldown: .6 })).toBeNull();
  });

  it("preserva entradas e identifica a comparação para descartar palpites antigos", () => {
    const previous = Object.freeze({ ...start });
    const next = Object.freeze({ range: 280, cooldown: .6 });
    const first = prediction("alcance", previous, next);
    expect(buildPulsePrediction("alcance", previous, next)?.id).toBe(first.id);
    expect(buildPulsePrediction("ritmo", previous, next)?.id).not.toBe(first.id);
    expect(buildPulsePrediction("alcance", previous, { ...next, range: 300 })?.id).not.toBe(first.id);
    expect(previous).toEqual(start);
    expect(next).toEqual({ range: 280, cooldown: .6 });
    const second = prediction("ritmo", previous, next);
    expect(first.options.findIndex(option => option.id === first.correctId)).not.toBe(second.options.findIndex(option => option.id === second.correctId));
    for (const item of [first, second]) expect(new Set(item.options.map(option => option.id)).size).toBe(2);
  });
});
