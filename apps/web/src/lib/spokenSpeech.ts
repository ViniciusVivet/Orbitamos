export type SpokenSpeechPart = {
  id: string;
  lang: "pt-BR" | "en-US";
  text: string;
  pauseAfterMs: number;
  phase: "meaning" | "model" | "together" | "your-turn";
};

export type SpokenSpeechError = SpeechSynthesisErrorCode | "unsupported" | "invalid-script" | "timeout";

export type SpokenSpeechOptions = {
  onStep?: (part: SpokenSpeechPart, index: number) => void;
  onDone?: () => void;
  onError?: (code: SpokenSpeechError) => void;
  rate?: 0.75 | 0.9;
  preferredEnglishVoiceURI?: string;
};

export type SpokenSpeechTimers = {
  setTimeout: (callback: () => void, delayMs: number) => unknown;
  clearTimeout: (handle: unknown) => void;
};

export type SpokenSpeechDependencies = {
  synth: Pick<SpeechSynthesis, "speak" | "cancel" | "getVoices"> | null;
  createUtterance: ((text: string) => SpeechSynthesisUtterance) | null;
  timers?: SpokenSpeechTimers;
};

export type SpokenSpeechController = {
  start: (parts: readonly SpokenSpeechPart[], options?: SpokenSpeechOptions) => boolean;
  stop: () => void;
  dispose: () => void;
};

const MAX_PARTS = 20;
const MAX_TEXT_LENGTH = 200;
const MAX_PAUSE_MS = 2_000;
const UTTERANCE_TIMEOUT_MS = 20_000;

const defaultTimers: SpokenSpeechTimers = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>),
};

function normalizeLanguage(lang: string): string {
  return lang.toLowerCase().replaceAll("_", "-");
}

/** An unavailable voice list still allows synthesis with the utterance's language. */
export function selectSpeakingVoice(
  voices: readonly SpeechSynthesisVoice[],
  lang: SpokenSpeechPart["lang"],
  preferredURI?: string,
): SpeechSynthesisVoice | null {
  const language = normalizeLanguage(lang);
  const prefix = language.split("-")[0];
  const compatible = voices.filter((voice) => normalizeLanguage(voice.lang).split("-")[0] === prefix);
  const preferred = compatible.find((voice) => voice.voiceURI === preferredURI);
  if (preferred) return preferred;
  const exact = compatible.filter((voice) => normalizeLanguage(voice.lang) === language);
  const candidates = exact.length > 0
    ? exact
    : compatible;

  return candidates.find((voice) => voice.localService)
    ?? candidates[0]
    ?? null;
}

function prepareParts(parts: readonly SpokenSpeechPart[]): SpokenSpeechPart[] | null {
  if (parts.length === 0 || parts.length > MAX_PARTS || parts.at(-1)?.phase !== "your-turn") return null;
  const phases: SpokenSpeechPart["phase"][] = ["meaning", "model", "together", "your-turn"];
  const prepared: SpokenSpeechPart[] = [];

  for (const part of parts) {
    if (
      typeof part.id !== "string" || part.id.length === 0
      || (part.lang !== "pt-BR" && part.lang !== "en-US")
      || typeof part.text !== "string" || !part.text.trim() || part.text.length > MAX_TEXT_LENGTH
      || !phases.includes(part.phase)
    ) return null;

    prepared.push({
      ...part,
      text: part.text.trim(),
      pauseAfterMs: Number.isFinite(part.pauseAfterMs)
        ? Math.min(MAX_PAUSE_MS, Math.max(0, part.pauseAfterMs))
        : 0,
    });
  }

  return prepared;
}

/** No browser globals, audio, microphone or network are accessed when this module is imported. */
export function createSpokenSpeech({
  synth,
  createUtterance,
  timers = defaultTimers,
}: SpokenSpeechDependencies): SpokenSpeechController {
  let disposed = false;
  let turn = 0;
  let active: SpeechSynthesisUtterance | null = null;
  let submitted = false;
  let watchdog: unknown = null;
  let gap: unknown = null;

  function clearWatchdog() {
    if (watchdog !== null) timers.clearTimeout(watchdog);
    watchdog = null;
  }

  function releaseActive() {
    if (active) {
      active.onend = null;
      active.onerror = null;
    }
    active = null;
    submitted = false;
    clearWatchdog();
  }

  function stop() {
    // Invalidate before cancel: some engines synchronously dispatch a canceled event.
    turn += 1;
    const shouldCancel = active !== null && submitted;
    releaseActive();
    if (gap !== null) timers.clearTimeout(gap);
    gap = null;
    if (shouldCancel) {
      try { synth?.cancel(); } catch { /* Stopping must remain safe during browser teardown. */ }
    }
  }

  function start(parts: readonly SpokenSpeechPart[], options: SpokenSpeechOptions = {}): boolean {
    stop();
    if (disposed) return false;
    if (!synth || !createUtterance) {
      options.onError?.("unsupported");
      return false;
    }
    const script = prepareParts(parts);
    if (!script) {
      options.onError?.("invalid-script");
      return false;
    }

    const currentTurn = turn;
    const isCurrent = () => !disposed && turn === currentTurn;
    const rate = options.rate === 0.75 ? 0.75 : 0.9;

    function fail(code: SpokenSpeechError) {
      if (!isCurrent()) return;
      stop();
      options.onError?.(code);
    }

    function speak(index: number) {
      if (!isCurrent()) return;
      const part = script![index];
      let utterance: SpeechSynthesisUtterance;
      try {
        utterance = createUtterance!(part.text);
        utterance.lang = part.lang;
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;
        let voices: SpeechSynthesisVoice[] = [];
        try { voices = synth!.getVoices(); } catch { /* Let the browser choose by language. */ }
        utterance.voice = selectSpeakingVoice(
          voices,
          part.lang,
          part.lang === "en-US" ? options.preferredEnglishVoiceURI : undefined,
        );
      } catch {
        fail("synthesis-failed");
        return;
      }

      active = utterance;
      const isActive = () => isCurrent() && active === utterance;
      utterance.onend = () => {
        if (!isActive()) return;
        releaseActive();
        if (index === script!.length - 1) {
          turn += 1;
          options.onDone?.();
          return;
        }
        gap = timers.setTimeout(() => {
          if (!isCurrent()) return;
          gap = null;
          speak(index + 1);
        }, part.pauseAfterMs);
      };
      utterance.onerror = (event) => {
        if (isActive()) fail(event.error || "synthesis-failed");
      };
      watchdog = timers.setTimeout(() => {
        if (isActive()) fail("timeout");
      }, UTTERANCE_TIMEOUT_MS);

      options.onStep?.(part, index);
      if (!isActive()) return;
      submitted = true;
      try { synth!.speak(utterance); } catch { fail("synthesis-failed"); }
    }

    speak(0);
    return isCurrent();
  }

  return {
    start,
    stop,
    dispose() {
      stop();
      disposed = true;
    },
  };
}
