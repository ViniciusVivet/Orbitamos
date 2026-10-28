export type FreePracticeDraft = {
  code: string;
  currentStep: number;
  stepStatus: ("pending" | "success" | "error")[];
  stepAttempts: number[];
  reflection: string;
};
export type PracticeCodeVersion = { raw: string; savedAt: number };
export type PracticeCodeHistory = {
  version: 1;
  source: "guided" | "restored" | null;
  entries: PracticeCodeVersion[];
  unreadable?: boolean;
};

export const freePracticeStorageKey = (userId: string | number, slug: string) => `orbitamos-pratica-${userId}-${slug}`;
export const practiceCodeHistoryKey = (userId: string | number, slug: string) => `orbitamos-pratica-versoes-v1-${userId}-${slug}`;

/** Importing a program carries text, never the guided mode's completion. */
export function freshFreePracticeDraft(code: string, steps: number): FreePracticeDraft {
  return { code, currentStep: 0, stepStatus: Array.from({ length: steps }, () => "pending"), stepAttempts: Array.from({ length: steps }, () => 0), reflection: "" };
}

export function readFreePracticeDraft(raw: string | null, steps: number): FreePracticeDraft | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const data = value as Record<string, unknown>;
    if (typeof data.code !== "string" || data.code.length > 100000) return null;
    const draft = freshFreePracticeDraft(data.code, steps);
    draft.currentStep = typeof data.currentStep === "number" && Number.isInteger(data.currentStep) ? Math.max(0, Math.min(steps - 1, data.currentStep)) : 0;
    if (Array.isArray(data.stepStatus) && data.stepStatus.length === steps && data.stepStatus.every(item => item === "pending" || item === "success" || item === "error")) draft.stepStatus = data.stepStatus;
    if (Array.isArray(data.stepAttempts) && data.stepAttempts.length === steps && data.stepAttempts.every(item => Number.isInteger(item) && item >= 0)) draft.stepAttempts = data.stepAttempts;
    draft.reflection = typeof data.reflection === "string" ? data.reflection.slice(0, 20000) : "";
    return draft;
  } catch { return null; }
}

export function practiceHandoffDecision(code: string, existing: FreePracticeDraft | null, starter: string): "same" | "import" | "choose" {
  if (existing?.code === code) return "same";
  if (!existing) return "import";
  const hasWork = existing.code.trim() !== "" && existing.code !== starter || existing.stepStatus.some(status => status !== "pending") || existing.stepAttempts.some(Boolean) || !!existing.reflection.trim();
  return hasWork ? "choose" : "import";
}

export function readPracticeCodeHistory(raw: string | null): PracticeCodeHistory {
  const empty: PracticeCodeHistory = { version: 1, source: null, entries: [] };
  if (!raw) return empty;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return { ...empty, unreadable: true };
    const value = data as Record<string, unknown>;
    if (value.version !== 1 || !Array.isArray(value.entries) || !value.entries.every(entry => entry && typeof entry === "object" && typeof entry.raw === "string" && typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt))) return { ...empty, unreadable: true };
    return { version: 1, source: value.source === "guided" || value.source === "restored" ? value.source : null, entries: value.entries };
  } catch { return { ...empty, unreadable: true }; }
}

/** Save this record before changing the active draft. Existing versions are never pruned. */
export function keepPracticeCodeVersion(history: PracticeCodeHistory, raw: string | null, source: "guided" | "restored", now = Date.now()): PracticeCodeHistory {
  if (history.unreadable) throw new Error("O histórico de versões não pôde ser lido. Seu rascunho anterior foi mantido.");
  const entries = raw && !history.entries.some(entry => entry.raw === raw) ? [{ raw, savedAt: now }, ...history.entries] : history.entries;
  return { version: 1, source, entries };
}

export function storePracticeProgram(storage: Pick<Storage, "getItem" | "setItem">, draftKey: string, historyKey: string, draft: FreePracticeDraft, source: "guided" | "restored", currentRaw?: string): PracticeCodeHistory {
  let history = keepPracticeCodeVersion(readPracticeCodeHistory(storage.getItem(historyKey)), storage.getItem(draftKey), source);
  if (currentRaw) history = keepPracticeCodeVersion(history, currentRaw, source);
  storage.setItem(historyKey, JSON.stringify(history));
  storage.setItem(draftKey, JSON.stringify(draft));
  return history;
}
