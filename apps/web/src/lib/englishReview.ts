import { englishSpeakingLessons, getSpeakingLesson } from "./spokenEnglish";

export type EnglishReviewResult = {
  lessonId: string;
  helped: boolean;
};

export type EnglishReviewSession = {
  ids: string[];
  cursor: number;
  draft: string;
  consulted: boolean;
  results: EnglishReviewResult[];
};

export type EnglishReviewHistory = {
  reviews: number;
  helped: number;
  lastAt: number;
};

/** Local written practice only; these records do not measure speech or retention. */
export type EnglishReviewSave = {
  version: 1;
  active: boolean;
  session?: EnglishReviewSession;
  history: Record<string, EnglishReviewHistory>;
};

const MAX_SAVE_LENGTH = 32_768;
const MAX_REVIEWS = 999;
const MAX_SESSION_ITEMS = 3;
const MAX_DRAFT_LENGTH = 160;
const MAX_TIMESTAMP = 8_640_000_000_000_000;
const hasOwn = (data: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(data, key);

export const emptyEnglishReviewSave = (): EnglishReviewSave => ({
  version: 1,
  active: false,
  history: {},
});

/** Separate the written review from speaking, contextual choices, journal, and XP. */
export function englishReviewKey(userId: string | number): string {
  if (typeof userId !== "string" && (typeof userId !== "number" || !Number.isFinite(userId))) {
    throw new TypeError("An English review save requires a string or finite number account identifier.");
  }
  return `orbitamos-english-review-v1-${typeof userId === "string" ? "s" : "n"}-${encodeURIComponent(JSON.stringify(userId))}`;
}

function isRecord(data: unknown): data is Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data)) return false;
  const prototype = Object.getPrototypeOf(data);
  return prototype === Object.prototype || prototype === null;
}

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= MAX_TIMESTAMP;
}

function normalizeSession(data: unknown): EnglishReviewSession | undefined {
  if (!isRecord(data) || !hasOwn(data, "ids") || !Array.isArray(data.ids)) return undefined;
  const { ids } = data;
  if (ids.length < 1 || ids.length > MAX_SESSION_ITEMS || new Set(ids).size !== ids.length) return undefined;
  for (let index = 0; index < ids.length; index += 1) {
    if (!hasOwn(ids, index) || typeof ids[index] !== "string" || !getSpeakingLesson(ids[index])) return undefined;
  }
  if (!hasOwn(data, "cursor") || typeof data.cursor !== "number" || !Number.isInteger(data.cursor)
    || data.cursor < 0 || data.cursor > ids.length) return undefined;
  if (!hasOwn(data, "draft") || typeof data.draft !== "string" || data.draft.length > MAX_DRAFT_LENGTH) return undefined;
  if (!hasOwn(data, "consulted") || typeof data.consulted !== "boolean") return undefined;
  if (!hasOwn(data, "results") || !Array.isArray(data.results)) return undefined;
  // A correct answer stays on screen until Next. Results therefore form exactly
  // the completed prefix, optionally including the still-visible current item.
  const { cursor, results } = data;
  if (results.length !== cursor && (cursor === ids.length || results.length !== cursor + 1)) return undefined;
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    if (!hasOwn(results, index) || !isRecord(result)
      || !hasOwn(result, "lessonId") || result.lessonId !== ids[index]
      || !hasOwn(result, "helped") || typeof result.helped !== "boolean") return undefined;
  }
  if (results.length > cursor && results[cursor].helped !== data.consulted) return undefined;

  return {
    ids: [...ids],
    cursor,
    draft: cursor === ids.length ? "" : data.draft,
    consulted: cursor === ids.length ? false : data.consulted,
    results: results.map(result => ({ lessonId: result.lessonId, helped: result.helped })),
  };
}

function normalizeEnglishReviewSave(data: unknown): EnglishReviewSave {
  const empty = emptyEnglishReviewSave();
  if (!isRecord(data) || !hasOwn(data, "version") || data.version !== 1) return empty;

  const history: Record<string, EnglishReviewHistory> = {};
  if (hasOwn(data, "history") && isRecord(data.history)) {
    for (const { id } of englishSpeakingLessons) {
      if (!hasOwn(data.history, id)) continue;
      const entry = data.history[id];
      if (!isRecord(entry) || !hasOwn(entry, "reviews") || typeof entry.reviews !== "number"
        || !Number.isSafeInteger(entry.reviews) || entry.reviews < 1
        || !hasOwn(entry, "helped") || typeof entry.helped !== "number"
        || !Number.isSafeInteger(entry.helped) || entry.helped < 0
        || !hasOwn(entry, "lastAt") || !isTimestamp(entry.lastAt)) continue;
      const reviews = Math.min(entry.reviews, MAX_REVIEWS);
      history[id] = { reviews, helped: Math.min(entry.helped, reviews), lastAt: entry.lastAt };
    }
  }

  const session = hasOwn(data, "session") ? normalizeSession(data.session) : undefined;
  return {
    version: 1,
    active: hasOwn(data, "active") && data.active === true && session !== undefined,
    ...(session ? { session } : {}),
    history,
  };
}

export function readEnglishReviewSave(raw: string | null): EnglishReviewSave {
  if (!raw || raw.length > MAX_SAVE_LENGTH) return emptyEnglishReviewSave();
  try {
    if (new TextEncoder().encode(raw).byteLength > MAX_SAVE_LENGTH) return emptyEnglishReviewSave();
    return normalizeEnglishReviewSave(JSON.parse(raw));
  } catch {
    return emptyEnglishReviewSave();
  }
}

/** Preserve next's navigation and draft; maxima never recount a persisted result. */
export function mergeEnglishReviewSave(next: EnglishReviewSave, previous: EnglishReviewSave): EnglishReviewSave {
  const active = normalizeEnglishReviewSave(next);
  const stored = normalizeEnglishReviewSave(previous);
  const history: Record<string, EnglishReviewHistory> = {};
  for (const { id } of englishSpeakingLessons) {
    const current = active.history[id];
    const earlier = stored.history[id];
    if (!current && !earlier) continue;
    const reviews = Math.max(current?.reviews ?? 0, earlier?.reviews ?? 0);
    history[id] = {
      reviews,
      helped: Math.min(reviews, Math.max(current?.helped ?? 0, earlier?.helped ?? 0)),
      lastAt: Math.max(current?.lastAt ?? 0, earlier?.lastAt ?? 0),
    };
  }
  return { ...active, history };
}

function selectReviewIds(save: EnglishReviewSave, eligibleIds: readonly string[]): string[] {
  const eligible = new Set(Array.isArray(eligibleIds) ? eligibleIds : []);
  return englishSpeakingLessons
    .filter(lesson => eligible.has(lesson.id))
    .map((lesson, order) => ({ id: lesson.id, order, history: save.history[lesson.id] }))
    .sort((a, b) => {
      if (!a.history && b.history) return -1;
      if (a.history && !b.history) return 1;
      return (a.history && b.history ? a.history.lastAt - b.history.lastAt : 0) || a.order - b.order;
    })
    .slice(0, MAX_SESSION_ITEMS)
    .map(lesson => lesson.id);
}

/** Only spoken.completed may be supplied as eligibleIds by the caller. */
export function startAnotherEnglishReview(save: EnglishReviewSave, eligibleIds: readonly string[], _now: number): EnglishReviewSave {
  const safe = normalizeEnglishReviewSave(save);
  const ids = selectReviewIds(safe, eligibleIds);
  if (ids.length === 0) return { version: 1, active: false, history: safe.history };
  return {
    version: 1,
    active: true,
    session: { ids, cursor: 0, draft: "", consulted: false, results: [] },
    history: safe.history,
  };
}

/** Resume only when the whole unfinished queue is still eligible to practice. */
export function beginEnglishReview(save: EnglishReviewSave, eligibleIds: readonly string[], now: number): EnglishReviewSave {
  const safe = normalizeEnglishReviewSave(save);
  const eligible = new Set(Array.isArray(eligibleIds) ? eligibleIds : []);
  if (safe.session && safe.session.cursor < safe.session.ids.length
    && safe.session.ids.every(id => eligible.has(id))) return { ...safe, active: true };
  return startAnotherEnglishReview(safe, eligibleIds, now);
}

function canAnswer(save: EnglishReviewSave): save is EnglishReviewSave & { session: EnglishReviewSession } {
  return save.active && save.session !== undefined && save.session.cursor < save.session.ids.length
    && save.session.results.length === save.session.cursor;
}

export function setEnglishReviewDraft(save: EnglishReviewSave, draft: string): EnglishReviewSave {
  const safe = normalizeEnglishReviewSave(save);
  if (!canAnswer(safe) || typeof draft !== "string") return safe;
  return { ...safe, session: { ...safe.session, draft: draft.slice(0, MAX_DRAFT_LENGTH) } };
}

export function consultEnglishReviewModel(save: EnglishReviewSave): EnglishReviewSave {
  const safe = normalizeEnglishReviewSave(save);
  if (!canAnswer(safe)) return safe;
  return { ...safe, session: { ...safe.session, consulted: true } };
}

function normalizeAnswer(answer: string): string {
  return answer.normalize("NFKC").toLowerCase().trim().replace(/\s+/gu, " ").replace(/[.!?]+$/u, "").trim();
}

/** Compare this practiced expression only; this does not grade general translations. */
export function evaluateEnglishReviewAnswer(lessonId: string, answer: string): { ok: boolean; message: string } {
  const lesson = getSpeakingLesson(lessonId);
  if (!lesson || typeof answer !== "string" || answer.length > MAX_DRAFT_LENGTH) {
    return { ok: false, message: "Escolha um item desta revisão e escreva a expressão praticada." };
  }
  if (!normalizeAnswer(answer)) return { ok: false, message: "Escreva a palavra ou frase em inglês antes de conferir." };
  return normalizeAnswer(answer) === normalizeAnswer(lesson.en)
    ? { ok: true, message: "Você escreveu a expressão que praticou. Pode seguir para o próximo item." }
    : { ok: false, message: "Ainda não corresponde à expressão praticada. Tente de novo ou consulte o modelo." };
}

/** Wrong drafts earn nothing; a correct current item is recorded only once. */
export function submitEnglishReviewAnswer(save: EnglishReviewSave, now: number): EnglishReviewSave {
  const safe = normalizeEnglishReviewSave(save);
  if (!canAnswer(safe) || !isTimestamp(now)) return safe;
  const session = safe.session;
  const lessonId = session.ids[session.cursor];
  if (!evaluateEnglishReviewAnswer(lessonId, session.draft).ok) return safe;
  const previous = safe.history[lessonId];
  const reviews = Math.min((previous?.reviews ?? 0) + 1, MAX_REVIEWS);
  return {
    ...safe,
    session: { ...session, results: [...session.results, { lessonId, helped: session.consulted }] },
    history: {
      ...safe.history,
      [lessonId]: {
        reviews,
        helped: Math.min(reviews, (previous?.helped ?? 0) + (session.consulted ? 1 : 0)),
        lastAt: Math.max(previous?.lastAt ?? 0, now),
      },
    },
  };
}

/** Advance only after a recorded correct response; the final cursor shows the finish. */
export function advanceEnglishReview(save: EnglishReviewSave): EnglishReviewSave {
  const safe = normalizeEnglishReviewSave(save);
  const session = safe.session;
  if (!safe.active || !session || session.cursor >= session.ids.length || session.results.length !== session.cursor + 1) return safe;
  return { ...safe, session: { ...session, cursor: session.cursor + 1, draft: "", consulted: false } };
}

export function closeEnglishReview(save: EnglishReviewSave): EnglishReviewSave {
  return { ...normalizeEnglishReviewSave(save), active: false };
}
