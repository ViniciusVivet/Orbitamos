import { describe, expect, it } from "vitest";
import { initialChapterBody } from "@/lib/orbiChapter";
import { readPulseGuide } from "./engine";
import { createPulseCombat, type PulseShot } from "./pulseCombat";

const bodyAt = (x: number, y = 446) => ({ ...initialChapterBody(), x, y });
const noise = (x: number, direction: -1 | 1 = -1, y = 473): PulseShot => ({ x, y, direction, remaining: 500, hostile: true, active: true });

describe("guia da Oficina lê o combate real", () => {
  it("orienta até o terminal e só oferece retorno após um checkpoint real", () => {
    const state = createPulseCombat("alcance");
    expect(readPulseGuide(state, bodyAt(100), false)).toMatchObject({ phase: "terminal", direction: "right", target: 1, canReturn: false });
    expect(readPulseGuide(state, bodyAt(480), false, true)).toMatchObject({ phase: "terminal", direction: "none", canReturn: false });
    expect(readPulseGuide(state, bodyAt(100), false, true).canReturn).toBe(true);
    expect(readPulseGuide(state, bodyAt(830), false, true)).toMatchObject({ phase: "repair", canReturn: true });
    expect(readPulseGuide(state, bodyAt(830), false, false).canReturn).toBe(false);
  });

  it("distingue aproximação de reparo pela barreira, inclusive na borda", () => {
    const state = createPulseCombat("alcance");
    expect(readPulseGuide(state, bodyAt(799), true).phase).toBe("approach");
    expect(readPulseGuide(state, bodyAt(800), true).phase).toBe("repair");
    expect(readPulseGuide(state, bodyAt(589), false, true).canReturn).toBe(false);
    expect(readPulseGuide(state, bodyAt(590), false, true).canReturn).toBe(true);
  });

  it("escolhe o próximo alvo e sua barreira sem depender da ordem dos arrays", () => {
    const state = createPulseCombat("alcance");
    state.enemies.reverse(); state.barriers.reverse();
    expect(readPulseGuide(state, bodyAt(830), true)).toMatchObject({ phase: "repair", target: 1 });
    state.enemies.find(enemy => enemy.id === 0)!.active = false;
    expect(readPulseGuide(state, bodyAt(1285), true)).toMatchObject({ phase: "repair", target: 2 });
  });

  it("encaminha à oficina apenas após os reparos e o programa aplicado", () => {
    const state = createPulseCombat("alcance");
    for (const enemy of state.enemies) enemy.active = false;
    state.cleared = 3;
    expect(readPulseGuide(state, bodyAt(1900), true)).toMatchObject({ phase: "workshop", direction: "right", target: null, breach: false });
    expect(readPulseGuide(state, bodyAt(1900), false)).toMatchObject({ phase: "terminal", direction: "left", target: null });
  });

  it("sinaliza a carga de uma sentinela que vai disparar na direção do Orbi", () => {
    const state = createPulseCombat("alcance");
    state.enemies[0].charge = .5;
    expect(readPulseGuide(state, bodyAt(830), true)).toMatchObject({ threat: "charging", direction: "right" });
    expect(readPulseGuide(state, bodyAt(1200), true).threat).toBe("safe");
    state.enemies[0].active = false;
    expect(readPulseGuide(state, bodyAt(830), true).threat).toBe("safe");
  });

  it("prioriza uma onda que se aproxima na altura do jogador", () => {
    const state = createPulseCombat("alcance");
    state.enemies[0].charge = .8;
    state.shots[8] = noise(1000);
    expect(readPulseGuide(state, bodyAt(830), true)).toMatchObject({ threat: "incoming", direction: "right" });
  });

  it("não alerta sobre onda afastando, já passada, distante ou fora da altura", () => {
    for (const shot of [noise(1000, 1), noise(800), noise(1400), noise(1000, -1, 360)]) {
      const state = createPulseCombat("alcance"); state.shots[8] = shot;
      expect(readPulseGuide(state, bodyAt(830), true).threat).toBe("safe");
    }
    const jumping = createPulseCombat("alcance"); jumping.shots[8] = noise(1000, -1, 465);
    expect(readPulseGuide(jumping, bodyAt(830, 330), true).threat).toBe("safe");
  });

  it("aponta a ameaça mais próxima, mesmo com projéteis reordenados", () => {
    const state = createPulseCombat("alcance");
    state.shots[8] = noise(1100); state.shots[9] = noise(700, 1);
    expect(readPulseGuide(state, bodyAt(830), true).direction).toBe("left");
    state.shots.reverse();
    expect(readPulseGuide(state, bodyAt(830), true).direction).toBe("left");
  });

  it("abre a brecha apenas para o próximo alvo ainda incompleto", () => {
    const state = createPulseCombat("ritmo");
    state.enemies[1].hp = 1;
    expect(readPulseGuide(state, bodyAt(830), true).breach).toBe(false);
    state.enemies[0].hp = 1;
    expect(readPulseGuide(state, bodyAt(830), true).breach).toBe(true);
    state.enemies[0].hp = 2;
    expect(readPulseGuide(state, bodyAt(830), true).breach).toBe(false);
  });

  it("não muda o combate, o jogador nem o contrato de conclusão ao orientar", () => {
    const state = createPulseCombat("ritmo"), body = bodyAt(830);
    const before = JSON.stringify({ state, body });
    readPulseGuide(state, body, true, true);
    expect(JSON.stringify({ state, body })).toBe(before);
    expect(state.cleared).toBe(0);
  });
});
