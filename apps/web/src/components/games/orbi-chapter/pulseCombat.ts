import { CHAPTER_PLAYER_HEIGHT, CHAPTER_PLAYER_WIDTH, CHAPTER_WORLD_WIDTH, type ChapterBody, type ChapterPlatform } from "@/lib/orbiChapter";
import type { PulseLessonId, PulseProgram } from "@/lib/orbiPulse";

export type PulseEnemy = {
  id: number; baseX: number; x: number; y: number; hp: number; maxHp: number;
  active: boolean; hitFlash: number; charge: number; lastHitAt: number; nextShotAt: number;
};
export type PulseShot = { x: number; y: number; direction: -1 | 1; remaining: number; active: boolean; hostile: boolean };
export type PulseCombatEvent = {
  type: "fired" | "hit" | "cleared" | "damaged" | "respawn" | "repaired";
  enemyId?: number; x: number; y: number;
};
export type PulseCombatState = {
  lesson: PulseLessonId; time: number; shield: number; invulnerable: number; cleared: number; total: 3;
  cooldown: number; cooldownTotal: number; enemies: PulseEnemy[]; shots: PulseShot[]; events: PulseCombatEvent[];
  /** Stable geometry pools; the engine rebuilds its painted layer when cleared changes. */
  platforms: ChapterPlatform[]; barriers: ChapterPlatform[];
};

const ENEMY_CENTERS = [1120, 1580, 2050];
const BARRIER_CENTERS = [860, 1320, 1810];
const PLAYER_SHOTS = 8;
const SHOT_COUNT = 16;
const STEP = 1 / 120;
const EPSILON = 1e-8;
const REPAIR_DELAY = 1.1;
const SHOT_PERIOD = 3.6;
const TELEGRAPH = .65;
const PULSE_SPEED = 650;
const NOISE_SPEED = 210;

export function createPulseCombat(lesson: PulseLessonId): PulseCombatState {
  const hp = lesson === "ritmo" ? 2 : 1;
  const ground: ChapterPlatform = { id: "pulse-street", x: 0, y: 500, width: CHAPTER_WORLD_WIDTH, height: 140 };
  const barriers = BARRIER_CENTERS.map((x, index) => ({ id: `pulse-barrier-${index}`, x, y: 100, width: 22, height: 400 }));
  return {
    lesson, time: 0, shield: 3, invulnerable: 0, cleared: 0, total: 3, cooldown: 0, cooldownTotal: 1.4,
    enemies: ENEMY_CENTERS.map((baseX, id) => ({
      id, baseX, x: baseX + Math.sin(id * 1.7) * 30, y: 465 + Math.sin(id * 1.3) * 7,
      hp, maxHp: hp, active: true, hitFlash: 0, charge: 0, lastHitAt: -Infinity,
      nextShotAt: SHOT_PERIOD + id * .55,
    })),
    shots: Array.from({ length: SHOT_COUNT }, (_, index) => ({ x: 0, y: 0, direction: index < PLAYER_SHOTS ? 1 : -1, remaining: 0, active: false, hostile: index >= PLAYER_SHOTS })),
    events: [], platforms: [ground, ...barriers], barriers,
  };
}

function updatePlatforms(state: PulseCombatState) {
  state.platforms.length = 1;
  for (let index = 0; index < state.enemies.length; index++) if (state.enemies[index].active) state.platforms.push(state.barriers[index]);
}

/** The returned array and all its platform objects retain their identities. */
export function pulseCombatPlatforms(state: PulseCombatState): ChapterPlatform[] { return state.platforms; }

export function firePulseCombat(state: PulseCombatState, body: Readonly<ChapterBody>, program: PulseProgram): boolean {
  if (state.shield <= 0 || state.cooldown > EPSILON || !Number.isFinite(program.range) || program.range <= 0 || !Number.isFinite(program.cooldown) || program.cooldown <= 0 || !Number.isFinite(body.x) || !Number.isFinite(body.y)) return false;
  for (let index = 0; index < PLAYER_SHOTS; index++) {
    const shot = state.shots[index];
    if (shot.active) continue;
    shot.active = true;
    shot.direction = body.facing;
    shot.x = body.x + CHAPTER_PLAYER_WIDTH / 2 + body.facing * (CHAPTER_PLAYER_WIDTH / 2 + 10);
    shot.y = body.y + CHAPTER_PLAYER_HEIGHT / 2;
    shot.remaining = program.range;
    state.cooldown = program.cooldown;
    state.cooldownTotal = program.cooldown;
    state.events.push({ type: "fired", x: shot.x, y: shot.y });
    return true;
  }
  return false;
}

function fireNoise(state: PulseCombatState, enemy: PulseEnemy) {
  for (let index = PLAYER_SHOTS; index < SHOT_COUNT; index++) {
    const shot = state.shots[index];
    if (shot.active) continue;
    shot.active = true; shot.direction = -1; shot.x = enemy.x - 25; shot.y = enemy.y; shot.remaining = 700;
    // enemyId distinguishes a telegraphed hostile launch from a learner's pulse.
    state.events.push({ type: "fired", enemyId: enemy.id, x: shot.x, y: shot.y });
    break;
  }
}

function damage(state: PulseCombatState, body: Readonly<ChapterBody>) {
  if (state.shield <= 0 || state.invulnerable > 0) return;
  state.shield--;
  state.invulnerable = 1.4;
  const x = body.x + CHAPTER_PLAYER_WIDTH / 2, y = body.y + CHAPTER_PLAYER_HEIGHT / 2;
  state.events.push({ type: "damaged", x, y });
  if (state.shield === 0) state.events.push({ type: "respawn", x, y });
}

function stepCombat(state: PulseCombatState, body: Readonly<ChapterBody>, program: PulseProgram, dt: number) {
  state.time += dt;
  state.cooldown = Math.max(0, state.cooldown - dt);
  if (state.cooldown < EPSILON) {
    state.cooldown = 0;
    if (Number.isFinite(program.cooldown) && program.cooldown > 0) state.cooldownTotal = program.cooldown;
  }
  state.invulnerable = Math.max(0, state.invulnerable - dt);
  const playerX = body.x + CHAPTER_PLAYER_WIDTH / 2;
  for (let index = 0; index < state.enemies.length; index++) {
    const enemy = state.enemies[index];
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    if (!enemy.active) continue;
    enemy.x = enemy.baseX + Math.sin(state.time * .8 + enemy.id * 1.7) * 30;
    enemy.y = 465 + Math.sin(state.time * 1.6 + enemy.id * 1.3) * 7;
    if (enemy.hp < enemy.maxHp && state.time - enemy.lastHitAt >= REPAIR_DELAY - EPSILON) {
      enemy.hp = enemy.maxHp;
      enemy.hitFlash = .28;
      state.events.push({ type: "repaired", enemyId: enemy.id, x: enemy.x, y: enemy.y });
    }
    if (Math.abs(playerX - enemy.x) > 500) {
      enemy.charge = 0;
      enemy.nextShotAt = state.time + SHOT_PERIOD;
    } else {
      const remaining = enemy.nextShotAt - state.time;
      enemy.charge = remaining <= TELEGRAPH ? Math.max(0, Math.min(1, 1 - remaining / TELEGRAPH)) : 0;
      if (remaining <= EPSILON) { fireNoise(state, enemy); enemy.nextShotAt = state.time + SHOT_PERIOD; enemy.charge = 0; }
    }
    if (Math.abs(playerX - enemy.x) < CHAPTER_PLAYER_WIDTH / 2 + 22 && Math.abs(body.y + CHAPTER_PLAYER_HEIGHT / 2 - enemy.y) < CHAPTER_PLAYER_HEIGHT / 2 + 25) damage(state, body);
  }

  for (let index = 0; index < SHOT_COUNT; index++) {
    const shot = state.shots[index];
    if (!shot.active) continue;
    const oldX = shot.x;
    const distance = Math.min(shot.remaining, (shot.hostile ? NOISE_SPEED : PULSE_SPEED) * dt);
    shot.x += shot.direction * distance;
    shot.remaining -= distance;
    const left = Math.min(oldX, shot.x), right = Math.max(oldX, shot.x);
    if (shot.hostile) {
      if (right >= body.x - 8 && left <= body.x + CHAPTER_PLAYER_WIDTH + 8 && shot.y >= body.y - 8 && shot.y <= body.y + CHAPTER_PLAYER_HEIGHT + 8) {
        shot.active = false;
        damage(state, body);
      }
    } else {
      // Swept collision tests the complete travelled segment, including its range endpoint.
      const start = shot.direction === 1 ? 0 : state.enemies.length - 1;
      for (let enemyIndex = start; enemyIndex >= 0 && enemyIndex < state.enemies.length; enemyIndex += shot.direction) {
        const enemy = state.enemies[enemyIndex];
        if (!enemy.active || Math.abs(shot.y - enemy.y) > 35 || right < enemy.x - 32 || left > enemy.x + 32) continue;
        shot.active = false;
        enemy.hp--;
        enemy.lastHitAt = state.time;
        enemy.hitFlash = .18;
        state.events.push({ type: "hit", enemyId: enemy.id, x: enemy.x, y: enemy.y });
        if (enemy.hp <= 0) {
          enemy.hp = 0; enemy.active = false; enemy.charge = 0;
          state.cleared++;
          updatePlatforms(state);
          state.events.push({ type: "cleared", enemyId: enemy.id, x: enemy.x, y: enemy.y });
        }
        break;
      }
    }
    if (shot.remaining <= EPSILON || shot.x < 0 || shot.x > CHAPTER_WORLD_WIDTH) shot.active = false;
  }
}

/** Fixed microsteps and pooled state: no objects/arrays are created by an ordinary simulation tick. */
export function advancePulseCombat(state: PulseCombatState, body: Readonly<ChapterBody>, program: PulseProgram, dt: number): void {
  if (!Number.isFinite(dt) || dt <= 0 || state.shield <= 0) return;
  // A resumed/background tab cannot create an unbounded catch-up loop.
  let remaining = Math.min(dt, .25);
  while (remaining > EPSILON && state.shield > 0) {
    const seconds = Math.min(remaining, STEP);
    stepCombat(state, body, program, seconds);
    remaining -= seconds;
  }
}

/** A retry keeps earned repairs; only the active fight and the player's protection restart. */
export function recoverPulseCombat(state: PulseCombatState): void {
  state.shield = 3;
  state.invulnerable = 2;
  state.cooldown = 0;
  for (let index = 0; index < state.shots.length; index++) state.shots[index].active = false;
  for (let index = 0; index < state.enemies.length; index++) {
    const enemy = state.enemies[index];
    enemy.charge = 0;
    enemy.hitFlash = 0;
    enemy.nextShotAt = state.time + SHOT_PERIOD;
    if (enemy.active) { enemy.hp = enemy.maxHp; enemy.lastHitAt = -Infinity; }
  }
}
