import { criarOpcoesSaida, type FaseMonteCodigo } from "./jogoMonteCodigo";
import { initialAttempt, villageCode, type Buddy, type VillageAttempt, type VillageLevel } from "./vilaDosBlocos";
import type { NivelGuiaOrbi, OrbiCmd, OrbiTrack } from "./jogoGuiaOrbi";

export type AssemblyDraft = { version: 1; signature: string; pool: number[]; placed: number[]; attempts: number; assembled: boolean; selectedOutput: string | null; traceIndex: number };
export const assemblyDraftKey = (user: string | undefined, slug: string) => `orbitamos-monte-draft-v1-${user ?? "anon"}-${slug}`;
export const assemblySignature = (phase: FaseMonteCodigo) => JSON.stringify([phase.linhas, phase.saidaEsperada]);

export function readAssemblyDraft(raw: string | null, phase: FaseMonteCodigo): AssemblyDraft | null {
  try {
    const data = JSON.parse(raw ?? "null");
    if (data?.version !== 1 || data.signature !== assemblySignature(phase) || !Array.isArray(data.pool) || !Array.isArray(data.placed)) return null;
    const ids = [...data.pool, ...data.placed];
    if (ids.length !== phase.linhas.length || new Set(ids).size !== ids.length || !ids.every(id => Number.isInteger(id) && id >= 0 && id < phase.linhas.length)) return null;
    if (!Number.isInteger(data.attempts) || data.attempts < 0 || data.attempts > 100000 || typeof data.assembled !== "boolean") return null;
    if (data.selectedOutput !== null && !criarOpcoesSaida(phase).includes(data.selectedOutput)) return null;
    if (!Number.isInteger(data.traceIndex) || data.traceIndex < 0 || data.traceIndex >= phase.linhas.length) return null;
    const assembled = data.assembled && data.placed.length === phase.linhas.length && data.placed.every((id: number, index: number) => id === index);
    return { version: 1, signature: data.signature, pool: data.pool, placed: data.placed, attempts: data.attempts, assembled, selectedOutput: assembled ? data.selectedOutput : null, traceIndex: data.traceIndex };
  } catch {
    return null;
  }
}

export type VillageDraft = { version: 1; signature: string; attempt: VillageAttempt; selected: Buddy | null };
export const villageDraftKey = (user: string, id: string) => `orbitamos-vila-draft-v1-${user}-${id}`;
export const villageSignature = (level: VillageLevel) => JSON.stringify([level.kind, villageCode(level, initialAttempt(level)), level.kind === "indent" ? level.movable : null]);

export function readVillageDraft(raw: string | null, level: VillageLevel): VillageDraft | null {
  try {
    const data = JSON.parse(raw ?? "null");
    if (data?.version !== 1 || data.signature !== villageSignature(level) || !data.attempt || !Array.isArray(data.attempt.indents)) return null;
    const pairs = [null, "parenteses", "colchetes", "chaves"];
    if (!pairs.includes(data.attempt.pair) || !pairs.includes(data.selected)) return null;
    if (level.kind === "socket" && data.attempt.indents.length !== 0) return null;
    if (level.kind === "indent" && (data.attempt.pair !== null || data.attempt.indents.length !== level.lines.length || !data.attempt.indents.every((value: unknown, index: number) => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 2 && (level.movable.includes(index) || value === level.initial[index])))) return null;
    return { version: 1, signature: data.signature, attempt: { pair: data.attempt.pair, indents: data.attempt.indents }, selected: data.selected };
  } catch {
    return null;
  }
}

export type OrbiDraft = { version: 1; signature: string; principal: OrbiCmd[]; funcao: OrbiCmd[]; activeTrack: OrbiTrack; tentativas: number };
export const orbiDraftKey = (user: string | undefined, slug: string) => `orbitamos-orbi-draft-v1-${user ?? "anon"}-${slug}`;
export const orbiSignature = (level: NivelGuiaOrbi) => JSON.stringify([level.cols, level.rows, level.inicio, level.portal, level.asteroides, level.slotsPrincipal, level.slotsFuncao ?? 0]);

export function readOrbiDraft(raw: string | null, level: NivelGuiaOrbi): OrbiDraft | null {
  try {
    const data = JSON.parse(raw ?? "null");
    if (data?.version !== 1 || data.signature !== orbiSignature(level) || !Array.isArray(data.principal) || !Array.isArray(data.funcao)) return null;
    if (data.principal.length > level.slotsPrincipal || data.funcao.length > (level.slotsFuncao ?? 0)) return null;
    const commands = level.slotsFuncao ? ["avancar", "esquerda", "direita", "funcao"] : ["avancar", "esquerda", "direita"];
    if (![...data.principal, ...data.funcao].every(cmd => commands.includes(cmd))) return null;
    if (data.activeTrack !== "principal" && (data.activeTrack !== "funcao" || !level.slotsFuncao)) return null;
    if (!Number.isInteger(data.tentativas) || data.tentativas < 0 || data.tentativas > 100000) return null;
    return { version: 1, signature: data.signature, principal: data.principal, funcao: data.funcao, activeTrack: data.activeTrack, tentativas: data.tentativas };
  } catch {
    return null;
  }
}
