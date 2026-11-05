// O formato e a chave antigos sao preservados; a fila so confirma apos resposta da RPC.
export const COURSE_PROGRESS_STORAGE_KEY = "orbitacademy-progress";

export interface StoredCourseProgress {
  completed: string[];
  pending: string[];
  lastLessonId: string | null;
}

type ProgressStorage = (Pick<Storage, "getItem" | "setItem"> & Partial<Pick<Storage, "length" | "key">>) | null;
type ProgressOwner = string | number;

export function getBrowserStorage(): ProgressStorage {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
const uniqueStrings = (value: unknown): string[] => Array.isArray(value)
  ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))]
  : [];
const progressKey = (userId: ProgressOwner, courseSlug: string) => `${COURSE_PROGRESS_STORAGE_KEY}-${userId}-${courseSlug}`;
const journalPrefix = (userId: ProgressOwner, courseSlug: string) => `${progressKey(userId, courseSlug)}:lesson:`;

function writeLessonJournal(storage: ProgressStorage, userId: ProgressOwner, courseSlug: string, lessonId: string, pending: boolean): boolean {
  try {
    if (!storage) return false;
    const key = `${journalPrefix(userId, courseSlug)}${encodeURIComponent(lessonId)}`;
    const value = JSON.stringify({ pending });
    if (storage.getItem(key) !== value) storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function readCourseProgress(storage: ProgressStorage, userId: ProgressOwner | undefined, courseSlug: string): StoredCourseProgress {
  if (!storage || !userId) return { completed: [], pending: [], lastLessonId: null };
  try {
    let parsed;
    try {
      parsed = JSON.parse(storage.getItem(progressKey(userId, courseSlug)) ?? "{}");
    } catch {
      parsed = {};
    }
    const completed = uniqueStrings(parsed?.concluidas);
    const pending = Array.isArray(parsed?.pendentes) ? uniqueStrings(parsed.pendentes) : completed;
    const journal = new Map<string, boolean>();
    // Chaves independentes por aula preservam gravacoes de outra aba, mesmo
    // quando o snapshot agregado antigo e sobrescrito por um read/modify/write.
    try {
      if (storage.key && typeof storage.length === "number") {
        const prefix = journalPrefix(userId, courseSlug);
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (!key?.startsWith(prefix)) continue;
          try {
            const entry = JSON.parse(storage.getItem(key) ?? "null");
            if (typeof entry?.pending === "boolean") journal.set(decodeURIComponent(key.slice(prefix.length)), entry.pending);
          } catch { /* Uma entrada danificada nao invalida as demais conquistas. */ }
        }
      }
    } catch { /* O snapshot agregado ainda pode ser lido sem enumerar o storage. */ }
    return {
      completed: [...new Set([...completed, ...journal.keys()])],
      // Saves antigos nao distinguem local de remoto: reenvio idempotente sem inventar XP.
      pending: [...new Set([...pending.filter((id) => !journal.has(id)), ...[...journal].filter(([, queued]) => queued).map(([id]) => id)])],
      lastLessonId: typeof parsed?.ultimaAulaId === "string" ? parsed.ultimaAulaId : null,
    };
  } catch {
    return { completed: [], pending: [], lastLessonId: null };
  }
}

export function writeCourseProgress(storage: ProgressStorage, userId: ProgressOwner, courseSlug: string, progress: StoredCourseProgress): boolean {
  if (!storage) return false;
  let journalStored = false;
  for (const lessonId of progress.completed) {
    journalStored = writeLessonJournal(storage, userId, courseSlug, lessonId, progress.pending.includes(lessonId)) || journalStored;
  }
  try {
    storage.setItem(progressKey(userId, courseSlug), JSON.stringify({
      concluidas: progress.completed,
      pendentes: progress.pending,
      ultimaAulaId: progress.lastLessonId,
    }));
    return true;
  } catch {
    return journalStored;
  }
}

export function queueCourseLesson(storage: ProgressStorage, userId: ProgressOwner, courseSlug: string, lessonId: string, lastLessonId: string) {
  const current = readCourseProgress(storage, userId, courseSlug);
  const progress = {
    completed: [...new Set([...current.completed, lessonId])],
    pending: [...new Set([...current.pending, lessonId])],
    lastLessonId,
  };
  writeCourseProgress(storage, userId, courseSlug, progress);
  const durable = readCourseProgress(storage, userId, courseSlug);
  return { progress, stored: durable.completed.includes(lessonId) && durable.pending.includes(lessonId) };
}

export function reconcileCourseProgress(storage: ProgressStorage, userId: ProgressOwner | undefined, courseSlug: string, lessons: Array<{ id: string; slug?: string }>) {
  const current = readCourseProgress(storage, userId, courseSlug);
  const resolve = (id: string) => {
    if (lessons.some((lesson) => lesson.id === id)) return id;
    const aliases = lessons.filter((lesson) => lesson.slug === id);
    return aliases.length === 1 ? aliases[0].id : id;
  };
  const normalized = {
    completed: [...new Set(current.completed.map(resolve))],
    pending: [...new Set(current.pending.map(resolve))],
    lastLessonId: current.lastLessonId ? resolve(current.lastLessonId) : null,
  };
  // Nao descartar IDs que o catalogo atual nao conhece: podem ser conquistas antigas.
  if (userId) writeCourseProgress(storage, userId, courseSlug, normalized);
  if (userId) {
    const durable = readCourseProgress(storage, userId, courseSlug);
    for (const id of current.pending) {
      const resolved = resolve(id);
      if (resolved !== id && durable.pending.includes(resolved)) writeLessonJournal(storage, userId, courseSlug, id, false);
    }
  }
  return normalized;
}

export async function syncPendingCourseProgress({ storage, userId, courseSlug, lessonIds, complete }: {
  storage: ProgressStorage;
  userId: ProgressOwner;
  courseSlug: string;
  lessonIds: string[];
  complete: (lessonId: string) => Promise<unknown>;
}) {
  const queued = readCourseProgress(storage, userId, courseSlug).pending.filter((id) => lessonIds.includes(id));
  let synced = 0;
  let error: string | null = null;
  for (const lessonId of queued) {
    try {
      await complete(lessonId);
      // Reler preserva uma aula acrescentada a fila enquanto a rede respondia.
      const latest = readCourseProgress(storage, userId, courseSlug);
      writeCourseProgress(storage, userId, courseSlug, { ...latest, pending: latest.pending.filter((id) => id !== lessonId) });
      synced += 1;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Não foi possível sincronizar agora.";
      break;
    }
  }
  return { synced, error, pending: readCourseProgress(storage, userId, courseSlug).pending.filter((id) => lessonIds.includes(id)) };
}
