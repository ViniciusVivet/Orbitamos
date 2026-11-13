import { describe, expect, it, vi } from "vitest";
import {
  createSpokenSpeech,
  selectSpeakingVoice,
  type SpokenSpeechOptions,
  type SpokenSpeechPart,
  type SpokenSpeechTimers,
} from "./spokenSpeech";

class ManualTimers implements SpokenSpeechTimers {
  now = 0;
  nextId = 0;
  tasks = new Map<number, { at: number; callback: () => void }>();

  setTimeout = (callback: () => void, delayMs: number) => {
    const id = ++this.nextId;
    this.tasks.set(id, { at: this.now + delayMs, callback });
    return id;
  };

  clearTimeout = (handle: unknown) => { this.tasks.delete(handle as number); };

  advanceBy(ms: number) {
    const end = this.now + ms;
    while (true) {
      const next = [...this.tasks.entries()]
        .filter(([, task]) => task.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.tasks.delete(next[0]);
      this.now = next[1].at;
      next[1].callback();
    }
    this.now = end;
  }
}

function voice(lang: string, localService = true, voiceURI = lang): SpeechSynthesisVoice {
  return { lang, localService, voiceURI, name: voiceURI, default: false };
}

function part(
  id: string,
  lang: SpokenSpeechPart["lang"],
  phase: SpokenSpeechPart["phase"],
  pauseAfterMs = 250,
): SpokenSpeechPart {
  return { id, lang, phase, pauseAfterMs, text: lang === "en-US" ? "Hello." : "Agora sozinho." };
}

function script(): SpokenSpeechPart[] {
  return [
    part("meaning", "pt-BR", "meaning"),
    part("first", "en-US", "model"),
    part("second", "en-US", "model"),
    part("together", "en-US", "together"),
    part("your-turn", "pt-BR", "your-turn", 0),
  ];
}

function harness(initialVoices: SpeechSynthesisVoice[] = []) {
  const timers = new ManualTimers();
  const spoken: SpeechSynthesisUtterance[] = [];
  let voices = initialVoices;
  let current: SpeechSynthesisUtterance | null = null;
  let overlaps = 0;
  const synth = {
    speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
      if (current) overlaps += 1;
      current = utterance;
      spoken.push(utterance);
    }),
    cancel: vi.fn(() => { current = null; }),
    getVoices: vi.fn(() => voices),
  };
  const createUtterance = vi.fn((text: string) => ({
    text, lang: "", rate: 1, pitch: 1, volume: 1, voice: null, onend: null, onerror: null,
  }) as unknown as SpeechSynthesisUtterance);
  const engine = createSpokenSpeech({ synth, createUtterance, timers });

  return {
    engine, timers, synth, spoken, createUtterance,
    overlaps: () => overlaps,
    setVoices(next: SpeechSynthesisVoice[]) { voices = next; },
    end(utterance = spoken.at(-1)!) {
      if (current === utterance) current = null;
      utterance.onend?.call(utterance, {} as SpeechSynthesisEvent);
    },
    error(code: SpeechSynthesisErrorCode, utterance = spoken.at(-1)!) {
      utterance.onerror?.call(utterance, { error: code } as SpeechSynthesisErrorEvent);
    },
  };
}

describe("voz por idioma", () => {
  it("prefere idioma exato e voz local antes de outro sotaque ou voz remota", () => {
    const remote = voice("en-US", false, "remote");
    const british = voice("en-GB", true, "british");
    const local = voice("en-US", true, "local");
    const portuguese = voice("pt-BR");
    expect(selectSpeakingVoice([british, remote, local, portuguese], "en-US")).toBe(local);
    expect(selectSpeakingVoice([local, portuguese], "pt-BR")).toBe(portuguese);
    expect(selectSpeakingVoice([remote, local], "en-US", "remote")).toBe(remote);
    expect(selectSpeakingVoice([remote, british], "en-US", "british")).toBe(british);
  });

  it("aceita prefixo compatível sem escolher português para inglês", () => {
    const portuguese = voice("pt-PT");
    const english = voice("en_GB");
    expect(selectSpeakingVoice([portuguese, english], "en-US")).toBe(english);
    expect(selectSpeakingVoice([portuguese, english], "pt-BR")).toBe(portuguese);
    expect(selectSpeakingVoice([portuguese], "en-US", portuguese.voiceURI)).toBeNull();
    expect(selectSpeakingVoice([], "en-US")).toBeNull();
  });
});

describe("roteiro de fala no navegador com eventos simulados", () => {
  it("importa em Node sem window e não começa áudio ao criar ou parar o controlador", () => {
    expect(typeof window).toBe("undefined");
    const h = harness();
    h.engine.stop();
    expect(h.synth.speak).not.toHaveBeenCalled();
    expect(h.synth.cancel).not.toHaveBeenCalled();
    expect(h.createUtterance).not.toHaveBeenCalled();
    expect(h.timers.tasks.size).toBe(0);
  });

  it("espera onend e cada pausa, toca dois modelos e uma vez junto, termina uma única vez", () => {
    const h = harness();
    const onStep = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();
    expect(h.engine.start(script(), { onStep, onDone, onError })).toBe(true);
    expect(h.spoken).toHaveLength(1);
    h.timers.advanceBy(10_000);
    expect(h.spoken).toHaveLength(1);
    expect(onDone).not.toHaveBeenCalled();

    for (let index = 0; index < 4; index += 1) {
      h.end();
      h.timers.advanceBy(249);
      expect(h.spoken).toHaveLength(index + 1);
      h.timers.advanceBy(1);
      expect(h.spoken).toHaveLength(index + 2);
    }
    expect(onStep.mock.calls.map(([step, index]) => [step.phase, index])).toEqual([
      ["meaning", 0], ["model", 1], ["model", 2], ["together", 3], ["your-turn", 4],
    ]);
    expect(onDone).not.toHaveBeenCalled();
    const last = h.spoken.at(-1)!;
    const lateEnd = last.onend!;
    h.end();
    lateEnd.call(last, {} as SpeechSynthesisEvent);
    h.timers.advanceBy(100_000);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(h.overlaps()).toBe(0);
    expect(h.timers.tasks.size).toBe(0);
  });

  it("usa idioma real de cada trecho, velocidade normal e voz que chega após lista vazia", () => {
    const h = harness();
    const onError = vi.fn();
    h.engine.start(script(), { onError, preferredEnglishVoiceURI: "english-preferred" });
    expect(h.spoken[0]).toMatchObject({ lang: "pt-BR", voice: null, rate: 0.9, text: "Agora sozinho." });
    const english = voice("en-US", false, "english-preferred");
    h.setVoices([voice("pt-BR"), voice("en-US"), english]);
    h.end();
    h.timers.advanceBy(250);
    expect(h.spoken[1]).toMatchObject({ lang: "en-US", voice: english, rate: 0.9, text: "Hello." });
    expect(onError).not.toHaveBeenCalled();
    h.engine.dispose();
  });

  it("respeita a voz en-GB escolhida mesmo com en-US disponível e mantém português separado", () => {
    const portuguese = voice("pt-BR", true, "portuguese");
    const american = voice("en-US", true, "american");
    const british = voice("en-GB", false, "british");
    const h = harness([portuguese, american, british]);
    h.engine.start(script(), { preferredEnglishVoiceURI: british.voiceURI });
    expect(h.spoken[0]).toMatchObject({ lang: "pt-BR", voice: portuguese });
    h.end();
    h.timers.advanceBy(250);
    expect(h.spoken[1]).toMatchObject({ lang: "en-US", voice: british });
    h.engine.dispose();
  });

  it.each([0.75, 0.9, 2, Number.NaN])("limita a velocidade solicitada %s às opções lentas", (rate) => {
    const h = harness();
    h.engine.start(script(), { rate: rate as SpokenSpeechOptions["rate"] });
    expect(h.spoken[0].rate).toBe(rate === 0.75 ? 0.75 : 0.9);
    h.engine.dispose();
  });

  it("parar cancela somente a fala ativa e invalida callbacks que o navegador já capturou", () => {
    const h = harness();
    const onDone = vi.fn();
    const onError = vi.fn();
    h.engine.start(script(), { onDone, onError });
    const first = h.spoken[0];
    const lateEnd = first.onend!;
    const lateError = first.onerror!;
    h.engine.stop();
    h.engine.stop();
    lateEnd.call(first, {} as SpeechSynthesisEvent);
    lateError.call(first, { error: "canceled" } as SpeechSynthesisErrorEvent);
    h.timers.advanceBy(100_000);
    expect(h.synth.cancel).toHaveBeenCalledTimes(1);
    expect(h.spoken).toHaveLength(1);
    expect(onDone).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(h.timers.tasks.size).toBe(0);
  });

  it("trocar roteiro cancela o anterior e ignora término e erro antigos durante o novo", () => {
    const h = harness();
    const oldDone = vi.fn();
    const oldError = vi.fn();
    const newDone = vi.fn();
    h.engine.start(script(), { onDone: oldDone, onError: oldError });
    const old = h.spoken[0];
    const oldEnd = old.onend!;
    const oldFailure = old.onerror!;
    h.engine.start([part("new", "pt-BR", "your-turn")], { onDone: newDone });
    oldEnd.call(old, {} as SpeechSynthesisEvent);
    oldFailure.call(old, { error: "interrupted" } as SpeechSynthesisErrorEvent);
    expect(h.spoken).toHaveLength(2);
    expect(newDone).not.toHaveBeenCalled();
    h.end();
    expect(newDone).toHaveBeenCalledTimes(1);
    expect(oldDone).not.toHaveBeenCalled();
    expect(oldError).not.toHaveBeenCalled();
    expect(h.synth.cancel).toHaveBeenCalledTimes(1);
    expect(h.overlaps()).toBe(0);
  });

  it("parar durante a pausa remove o próximo trecho sem cancelar fala de outro recurso", () => {
    const h = harness();
    h.engine.start(script());
    h.end();
    expect(h.timers.tasks.size).toBe(1);
    h.engine.stop();
    h.timers.advanceBy(100_000);
    expect(h.spoken).toHaveLength(1);
    expect(h.synth.cancel).not.toHaveBeenCalled();
    expect(h.timers.tasks.size).toBe(0);
  });

  it("callback de pausa antigo já capturado não perde o timer do roteiro novo", () => {
    const h = harness();
    h.engine.start(script());
    h.end();
    const oldGap = [...h.timers.tasks.values()][0].callback;
    h.engine.start(script());
    h.end();
    oldGap();
    expect(h.spoken).toHaveLength(2);
    h.engine.stop();
    expect(h.timers.tasks.size).toBe(0);
    h.timers.advanceBy(100_000);
    expect(h.spoken).toHaveLength(2);
  });

  it("watchdog de 20 segundos interrompe fala pendente, reporta erro e permite tentar novamente", () => {
    const h = harness();
    const onError = vi.fn();
    const onDone = vi.fn();
    h.engine.start(script(), { onError, onDone });
    const old = h.spoken[0];
    const lateEnd = old.onend!;
    h.timers.advanceBy(19_999);
    expect(onError).not.toHaveBeenCalled();
    h.timers.advanceBy(1);
    expect(onError).toHaveBeenCalledExactlyOnceWith("timeout");
    expect(h.synth.cancel).toHaveBeenCalledTimes(1);
    expect(onDone).not.toHaveBeenCalled();
    h.engine.start([part("retry", "pt-BR", "your-turn")], { onDone });
    lateEnd.call(old, {} as SpeechSynthesisEvent);
    expect(onDone).not.toHaveBeenCalled();
    h.end();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(h.timers.tasks.size).toBe(0);
  });

  it.each<SpeechSynthesisErrorCode>(["language-unavailable", "voice-unavailable", "not-allowed"])(
    "erro %s nunca conclui o roteiro e permite recuperação",
    (code) => {
      const h = harness();
      const onError = vi.fn();
      const onDone = vi.fn();
      h.engine.start(script(), { onError, onDone });
      h.error(code);
      h.timers.advanceBy(100_000);
      expect(onError).toHaveBeenCalledExactlyOnceWith(code);
      expect(onDone).not.toHaveBeenCalled();
      expect(h.spoken).toHaveLength(1);
      expect(h.engine.start([part("retry", "pt-BR", "your-turn")], { onDone })).toBe(true);
      h.end();
      expect(onDone).toHaveBeenCalledTimes(1);
    },
  );

  it("dispose cancela e torna o controlador inerte, inclusive após callbacks antigos", () => {
    const h = harness();
    const onDone = vi.fn();
    h.engine.start(script(), { onDone });
    const first = h.spoken[0];
    const lateEnd = first.onend!;
    h.engine.dispose();
    h.engine.dispose();
    expect(h.engine.start(script(), { onDone })).toBe(false);
    lateEnd.call(first, {} as SpeechSynthesisEvent);
    h.timers.advanceBy(100_000);
    expect(onDone).not.toHaveBeenCalled();
    expect(h.spoken).toHaveLength(1);
    expect(h.synth.cancel).toHaveBeenCalledTimes(1);
  });

  it.each([-50, Number.NaN, 90_000])("limita pausa %s ao intervalo de 0 a 2000 ms", (pause) => {
    const h = harness();
    h.engine.start([part("first", "en-US", "model", pause), part("last", "pt-BR", "your-turn")]);
    h.end();
    const delay = pause === 90_000 ? 2_000 : 0;
    if (delay > 0) {
      h.timers.advanceBy(delay - 1);
      expect(h.spoken).toHaveLength(1);
      h.timers.advanceBy(1);
    } else h.timers.advanceBy(0);
    expect(h.spoken).toHaveLength(2);
    h.engine.dispose();
  });

  it.each([
    [],
    Array.from({ length: 21 }, () => part("too-many", "pt-BR", "your-turn")),
    [{ ...part("long", "pt-BR", "your-turn"), text: "a".repeat(201) }],
    [{ ...part("empty", "pt-BR", "your-turn"), text: "  " }],
    [{ ...part("wrong-language", "pt-BR", "your-turn"), lang: "en-GB" }],
    [part("missing-invitation", "en-US", "model")],
  ].map((parts) => ({ parts })))("recusa roteiro inválido antes de tocar qualquer parte: %j", ({ parts }) => {
    const h = harness();
    const onError = vi.fn();
    const onDone = vi.fn();
    expect(h.engine.start(parts as SpokenSpeechPart[], { onError, onDone })).toBe(false);
    expect(onError).toHaveBeenCalledExactlyOnceWith("invalid-script");
    expect(h.synth.speak).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it("copia o roteiro e permite cancelamento síncrono no callback onStep", () => {
    const h = harness();
    const parts = script();
    h.engine.start(parts);
    parts[1].text = "Changed later.";
    h.end();
    h.timers.advanceBy(250);
    expect(h.spoken[1].text).toBe("Hello.");
    h.engine.stop();

    expect(h.engine.start(script(), { onStep: () => h.engine.stop() })).toBe(false);
    expect(h.spoken).toHaveLength(2);
    expect(h.synth.cancel).toHaveBeenCalledTimes(1);
    expect(h.timers.tasks.size).toBe(0);
  });

  it("reporta APIs ausentes e falhas síncronas sem concluir", () => {
    const onError = vi.fn();
    const onDone = vi.fn();
    const unavailable = createSpokenSpeech({ synth: null, createUtterance: null });
    expect(unavailable.start(script(), { onError, onDone })).toBe(false);
    expect(onError).toHaveBeenCalledExactlyOnceWith("unsupported");

    const h = harness();
    h.synth.speak.mockImplementationOnce(() => { throw new Error("audio blocked"); });
    expect(h.engine.start(script(), { onError, onDone })).toBe(false);
    expect(onError).toHaveBeenLastCalledWith("synthesis-failed");
    expect(onDone).not.toHaveBeenCalled();
    expect(h.timers.tasks.size).toBe(0);
  });
});
