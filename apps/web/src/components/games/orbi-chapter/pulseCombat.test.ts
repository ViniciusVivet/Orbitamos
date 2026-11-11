import { describe, expect, it } from "vitest";
import { initialChapterBody, type ChapterBody } from "@/lib/orbiChapter";
import { advancePulseCombat, createPulseCombat, firePulseCombat, pulseCombatPlatforms, recoverPulseCombat, type PulseCombatState } from "./pulseCombat";

const bodyAt = (x: number, y = 446): Readonly<ChapterBody> => Object.freeze({ ...initialChapterBody(), x, y });
const working = { range: 280, cooldown: .6 };
function advance(state: PulseCombatState, body: Readonly<ChapterBody>, seconds: number, program = working, step = 1 / 60) {
  let remaining = seconds;
  while (remaining > 1e-8) {
    const dt = Math.min(step, remaining);
    advancePulseCombat(state, body, program, dt);
    remaining -= dt;
  }
}

describe("Oficina do Pulso: executable combat consequences", () => {
  it("starts three targets and four pooled platforms without sharing state between adventures", () => {
    const first = createPulseCombat("alcance"), second = createPulseCombat("ritmo");
    expect(first.total).toBe(3);
    expect(first.shield).toBe(3);
    expect(first.enemies.map(enemy => enemy.baseX)).toEqual([1120, 1580, 2050]);
    expect(first.enemies.map(enemy => enemy.maxHp)).toEqual([1, 1, 1]);
    expect(second.enemies.map(enemy => enemy.maxHp)).toEqual([2, 2, 2]);
    expect(first.shots).toHaveLength(16);
    expect(first.shots.slice(0, 8).every(shot => !shot.hostile)).toBe(true);
    expect(first.shots.slice(8).every(shot => shot.hostile)).toBe(true);
    expect(pulseCombatPlatforms(first).map(platform => platform.x)).toEqual([0, 860, 1320, 1810]);
    expect(pulseCombatPlatforms(first).slice(1).every(platform => platform.y === 100 && platform.height === 400)).toBe(true);
    first.enemies[0].hp = 0;
    expect(second.enemies[0].hp).toBe(2);
  });

  it("makes a short range visibly expire and a sufficient range actually unlock the barrier", () => {
    const body = bodyAt(830);
    const short = createPulseCombat("alcance");
    expect(firePulseCombat(short, body, { range: 90, cooldown: 1.4 })).toBe(true);
    advance(short, body, .8);
    expect(short.shots.every(shot => !shot.active)).toBe(true);
    expect(short.enemies[0].active).toBe(true);
    expect(short.cleared).toBe(0);
    expect(short.events.some(event => event.type === "hit")).toBe(false);

    const enough = createPulseCombat("alcance");
    const geometry = pulseCombatPlatforms(enough);
    const ground = geometry[0], secondBarrier = geometry[2];
    firePulseCombat(enough, body, working);
    advance(enough, body, .8);
    expect(enough.cleared).toBe(1);
    expect(enough.enemies[0].active).toBe(false);
    expect(enough.enemies[0].hp).toBe(0);
    expect(enough.events.filter(event => event.type === "cleared").map(event => event.enemyId)).toEqual([0]);
    expect(pulseCombatPlatforms(enough)).toBe(geometry);
    expect(geometry).toHaveLength(3);
    expect(geometry[0]).toBe(ground);
    expect(geometry[1]).toBe(secondBarrier);
    expect(geometry.some(platform => platform.id === "pulse-barrier-0")).toBe(false);
    expect(body.x).toBe(830);
  });

  it("honors facing, cooldown and the fixed player-shot budget without false fired events", () => {
    const state = createPulseCombat("alcance"), body = bodyAt(830);
    expect(firePulseCombat(state, body, working)).toBe(true);
    const fired = state.events.length;
    for (let repeat = 0; repeat < 100; repeat++) expect(firePulseCombat(state, body, working)).toBe(false);
    expect(state.events).toHaveLength(fired);
    advance(state, body, .3);
    expect(firePulseCombat(state, body, working)).toBe(false);
    advance(state, body, .3);
    expect(firePulseCombat(state, body, working)).toBe(true);
    expect(state.cooldownTotal).toBe(.6);

    const facingLeft = createPulseCombat("alcance");
    firePulseCombat(facingLeft, { ...body, facing: -1 }, working);
    advance(facingLeft, body, .8);
    expect(facingLeft.cleared).toBe(0);

    const pooled = createPulseCombat("alcance");
    for (let shot = 0; shot < 8; shot++) { pooled.cooldown = 0; expect(firePulseCombat(pooled, body, working)).toBe(true); }
    pooled.cooldown = 0;
    const events = pooled.events.length;
    expect(firePulseCombat(pooled, body, working)).toBe(false);
    expect(pooled.cooldown).toBe(0);
    expect(pooled.events.length).toBe(events);
    expect(pooled.shots.filter(shot => shot.active && !shot.hostile)).toHaveLength(8);
  });

  it("requires the second pulse before the enemy shield recovers in the rhythm lesson", () => {
    const body = bodyAt(830);
    const slow = createPulseCombat("ritmo");
    firePulseCombat(slow, body, { range: 280, cooldown: 1.4 });
    advance(slow, body, .7);
    expect(slow.enemies[0].hp).toBe(1);
    advance(slow, body, 1);
    expect(slow.enemies[0].hp).toBe(2);
    expect(slow.events.some(event => event.type === "repaired" && event.enemyId === 0)).toBe(true);
    expect(slow.cleared).toBe(0);

    const timely = createPulseCombat("ritmo");
    firePulseCombat(timely, body, working);
    advance(timely, body, .6);
    expect(firePulseCombat(timely, body, working)).toBe(true);
    advance(timely, body, .6);
    expect(timely.enemies[0].active).toBe(false);
    expect(timely.cleared).toBe(1);
    expect(timely.events.filter(event => event.type === "hit")).toHaveLength(2);
    expect(timely.events.some(event => event.type === "repaired")).toBe(false);
  });

  it("warns before a hostile shot and lets a jump avoid the noise", () => {
    const grounded = bodyAt(830);
    const state = createPulseCombat("alcance");
    advance(state, grounded, 3.1);
    expect(state.enemies[0].charge).toBeGreaterThan(0);
    expect(state.shots.some(shot => shot.active && shot.hostile)).toBe(false);
    advance(state, grounded, .6);
    expect(state.events.some(event => event.type === "fired" && event.enemyId === 0)).toBe(true);
    expect(state.shots.some(shot => shot.active && shot.hostile)).toBe(true);
    advance(state, grounded, 1.5);
    expect(state.shield).toBe(2);

    const jumping = createPulseCombat("alcance");
    advance(jumping, grounded, 3.7);
    advance(jumping, bodyAt(830, 330), 1.5);
    expect(jumping.shield).toBe(3);
    expect(jumping.events.some(event => event.type === "damaged")).toBe(false);

    const distant = createPulseCombat("alcance");
    advance(distant, bodyAt(100), 12);
    expect(distant.shots.some(shot => shot.active)).toBe(false);
    expect(distant.enemies.every(enemy => enemy.charge === 0)).toBe(true);
  });

  it("applies damage once during invulnerability and emits a single respawn at zero shield", () => {
    const state = createPulseCombat("alcance"), body = bodyAt(830);
    for (const shot of state.shots.slice(8, 10)) {
      shot.active = true; shot.x = 855; shot.y = 470; shot.remaining = 100; shot.direction = -1;
    }
    advancePulseCombat(state, body, working, 1 / 60);
    expect(state.shield).toBe(2);
    expect(state.events.filter(event => event.type === "damaged")).toHaveLength(1);
    expect(state.invulnerable).toBeGreaterThan(1.3);

    state.shield = 1; state.invulnerable = 0;
    const shot = state.shots[8]; shot.active = true; shot.x = 855; shot.y = 470; shot.remaining = 100;
    advancePulseCombat(state, body, working, 1 / 60);
    expect(state.shield).toBe(0);
    expect(state.events.filter(event => event.type === "respawn")).toHaveLength(1);
    const stopped = state.time;
    advance(state, body, 2);
    expect(state.time).toBe(stopped);
    expect(state.events.filter(event => event.type === "respawn")).toHaveLength(1);
    expect(firePulseCombat(state, body, working)).toBe(false);
  });

  it("retries safely while retaining repaired enemies, opened paths and pooled identities", () => {
    const state = createPulseCombat("alcance"), body = bodyAt(830);
    const enemies = state.enemies, shots = state.shots, platforms = state.platforms;
    const enemyObjects = [...enemies], shotObjects = [...shots];
    firePulseCombat(state, body, working);
    advance(state, body, .8);
    state.shield = 0;
    state.shots[8].active = true;
    recoverPulseCombat(state);
    expect(state.shield).toBe(3);
    expect(state.invulnerable).toBe(2);
    expect(state.shots.every(shot => !shot.active)).toBe(true);
    expect(state.enemies[0].active).toBe(false);
    expect(state.cleared).toBe(1);
    expect(state.enemies).toBe(enemies);
    expect(state.shots).toBe(shots);
    expect(state.platforms).toBe(platforms);
    advance(state, bodyAt(100), 2);
    expect(state.enemies.every((enemy, index) => enemy === enemyObjects[index])).toBe(true);
    expect(state.shots.every((shot, index) => shot === shotObjects[index])).toBe(true);
    expect(state.platforms.some(platform => platform.id === "pulse-barrier-0")).toBe(false);
  });

  it("keeps range collision outcomes stable across 30/60/120 Hz calls", () => {
    const body = bodyAt(830);
    for (const step of [1 / 30, 1 / 60, 1 / 120]) {
      const state = createPulseCombat("ritmo");
      firePulseCombat(state, body, working);
      advance(state, body, .6, working, step);
      firePulseCombat(state, body, working);
      advance(state, body, .6, working, step);
      expect(state.cleared).toBe(1);
      expect(state.enemies[0].hp).toBe(0);
      expect(state.shield).toBe(3);
    }
  });

  it("ignores invalid time/program inputs and caps background-tab catch-up", () => {
    const state = createPulseCombat("alcance"), body = bodyAt(100);
    for (const dt of [NaN, Infinity, -1, 0]) advancePulseCombat(state, body, working, dt);
    expect(state.time).toBe(0);
    expect(firePulseCombat(state, body, { range: NaN, cooldown: .6 })).toBe(false);
    expect(firePulseCombat(state, body, { range: 280, cooldown: 0 })).toBe(false);
    expect(state.events).toHaveLength(0);
    advancePulseCombat(state, body, working, 1000);
    expect(state.time).toBeCloseTo(.25, 8);
    expect(state.events).toHaveLength(0);
  });
});
