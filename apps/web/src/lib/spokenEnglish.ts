export type SpeakingScene = "file" | "folder" | "code" | "save" | "run" | "error" | "test" | "build";

export type SpeakingLesson = {
  readonly id: string;
  readonly kind: "word" | "phrase";
  readonly en: string;
  readonly pt: string;
  readonly context: string;
  readonly scene: SpeakingScene;
};

export const englishSpeakingLessons: readonly SpeakingLesson[] = [
  { id: "word-file", kind: "word", en: "file", pt: "arquivo", context: "Um arquivo, como script.js, guarda o código do projeto.", scene: "file" },
  { id: "word-folder", kind: "word", en: "folder", pt: "pasta", context: "A pasta do projeto reúne arquivos que pertencem ao mesmo trabalho.", scene: "folder" },
  { id: "word-code", kind: "word", en: "code", pt: "código", context: "O código contém as instruções que o computador vai executar.", scene: "code" },
  { id: "word-save", kind: "word", en: "save", pt: "salvar", context: "Use Save no editor para guardar as alterações no arquivo.", scene: "save" },
  { id: "word-run", kind: "word", en: "run", pt: "executar", context: "Use Run para executar o código e observar o resultado.", scene: "run" },
  { id: "word-error", kind: "word", en: "error", pt: "erro", context: "Uma mensagem de erro ajuda a investigar o que precisa ser corrigido.", scene: "error" },
  { id: "phrase-open-the-file", kind: "phrase", en: "Open the file", pt: "Abra o arquivo", context: "Um tutorial pede para abrir o arquivo do projeto no editor.", scene: "file" },
  { id: "phrase-save-the-file", kind: "phrase", en: "Save the file", pt: "Salve o arquivo", context: "Depois de alterar o código, salve o arquivo antes de continuar.", scene: "save" },
  { id: "phrase-run-the-code", kind: "phrase", en: "Run the code", pt: "Execute o código", context: "Execute o código para ver o que ele faz nesta tentativa.", scene: "run" },
  { id: "phrase-fix-the-error", kind: "phrase", en: "Fix the error", pt: "Corrija o erro", context: "Leia a mensagem e corrija o erro indicado antes de executar novamente.", scene: "error" },
  { id: "phrase-the-test-passed", kind: "phrase", en: "The test passed", pt: "O teste passou", context: "O teste executado passou. Isso descreve o resultado dessa verificação.", scene: "test" },
  { id: "phrase-the-build-failed", kind: "phrase", en: "The build failed", pt: "A geração do projeto falhou", context: "O build não terminou com sucesso. Leia o erro para investigar a causa.", scene: "build" },
];

export function getSpeakingLesson(id: string): SpeakingLesson | undefined {
  return englishSpeakingLessons.find(lesson => lesson.id === id);
}

export type SpeakingPhase = "meaning" | "model" | "together" | "your-turn";
export type SpeakingScriptPart = {
  id: string;
  lang: "pt-BR" | "en-US";
  text: string;
  pauseAfterMs: number;
  phase: SpeakingPhase;
};

/** Speech playback and its transient state belong to the client, outside this script. */
export function buildSpokenScript(lesson: SpeakingLesson): SpeakingScriptPart[] {
  const isPhrase = lesson.kind === "phrase";
  return [
    { id: `${lesson.id}-meaning`, lang: "pt-BR", text: `Como se diz ${lesson.pt} em inglês?`, pauseAfterMs: 600, phase: "meaning" },
    { id: `${lesson.id}-model-1`, lang: "en-US", text: lesson.en, pauseAfterMs: 1000, phase: "model" },
    { id: `${lesson.id}-together-invitation`, lang: "pt-BR", text: "Agora repita comigo.", pauseAfterMs: 300, phase: "together" },
    { id: `${lesson.id}-together`, lang: "en-US", text: lesson.en, pauseAfterMs: isPhrase ? 2000 : 1200, phase: "together" },
    { id: `${lesson.id}-your-turn`, lang: "pt-BR", text: "Agora tente sozinho.", pauseAfterMs: 0, phase: "your-turn" },
  ];
}

/** Participation declared by the learner; this save does not represent a pronunciation score. */
export type SpeakingSave = {
  version: 1;
  current: string;
  completed: string[];
  attempts: Record<string, number>;
};

const MAX_SAVE_LENGTH = 32_768;
const MAX_ATTEMPTS = 999;

export const emptySpeakingSave = (): SpeakingSave => ({
  version: 1,
  current: englishSpeakingLessons[0].id,
  completed: [],
  attempts: {},
});

/** Encoding both the primitive type and JSON value keeps account identifiers distinct. */
export function speakingSaveKey(userId: string | number): string {
  if (typeof userId !== "string" && (typeof userId !== "number" || !Number.isFinite(userId))) {
    throw new TypeError("A speaking save requires a string or finite number account identifier.");
  }
  return `orbitamos-english-speaking-v1-${typeof userId === "string" ? "s" : "n"}-${encodeURIComponent(JSON.stringify(userId))}`;
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === "object" && !Array.isArray(data);
}

function normalizeSpeakingSave(data: unknown): SpeakingSave {
  const empty = emptySpeakingSave();
  if (!isRecord(data) || data.version !== 1) return empty;

  const declaredCompleted: unknown[] = Array.isArray(data.completed) ? data.completed : [];
  const completed = englishSpeakingLessons
    .filter(lesson => declaredCompleted.includes(lesson.id))
    .map(lesson => lesson.id);
  const attempts: Record<string, number> = {};
  if (isRecord(data.attempts)) {
    for (const lesson of englishSpeakingLessons) {
      if (!Object.prototype.hasOwnProperty.call(data.attempts, lesson.id)) continue;
      const count = data.attempts[lesson.id];
      if (typeof count === "number" && Number.isInteger(count) && count > 0) {
        attempts[lesson.id] = Math.min(count, MAX_ATTEMPTS);
      }
    }
  }

  return {
    version: 1,
    current: typeof data.current === "string" && getSpeakingLesson(data.current) ? data.current : empty.current,
    completed,
    attempts,
  };
}

export function readSpeakingSave(raw: string | null): SpeakingSave {
  if (!raw || raw.length > MAX_SAVE_LENGTH) return emptySpeakingSave();
  try {
    return normalizeSpeakingSave(JSON.parse(raw));
  } catch {
    return emptySpeakingSave();
  }
}

/** Keep the active cursor from next, while retaining achievements from a stored save. */
export function mergeSpeakingSave(next: SpeakingSave, previous: SpeakingSave): SpeakingSave {
  const active = normalizeSpeakingSave(next);
  const stored = normalizeSpeakingSave(previous);
  const completed = englishSpeakingLessons
    .filter(lesson => active.completed.includes(lesson.id) || stored.completed.includes(lesson.id))
    .map(lesson => lesson.id);
  const attempts: Record<string, number> = {};
  for (const lesson of englishSpeakingLessons) {
    // Max avoids counting an already persisted practice again during a write/merge.
    const count = Math.max(active.attempts[lesson.id] ?? 0, stored.attempts[lesson.id] ?? 0);
    if (count > 0) attempts[lesson.id] = count;
  }
  return { version: 1, current: active.current, completed, attempts };
}

export function completeSpeakingPractice(save: SpeakingSave, id: string): SpeakingSave {
  const safe = normalizeSpeakingSave(save);
  if (!getSpeakingLesson(id)) return safe;
  return {
    version: 1,
    current: id,
    completed: englishSpeakingLessons
      .filter(lesson => lesson.id === id || safe.completed.includes(lesson.id))
      .map(lesson => lesson.id),
    attempts: { ...safe.attempts, [id]: Math.min((safe.attempts[id] ?? 0) + 1, MAX_ATTEMPTS) },
  };
}
