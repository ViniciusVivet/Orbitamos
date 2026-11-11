export type ChapterSound =
  | "jump" | "land" | "terminal" | "fall" | "arrive" | "machine" | "checkpoint"
  | "step" | "pulse" | "pulse-hit" | "bug-cleared" | "shield-hit" | "shield-ready" | "code-error";

type Voice = { oscillator: OscillatorNode; gain: GainNode };
const MAX_VOICES = 12;
const AMBIENT_NOTES = [130.81, 0, 196, 0, 164.81, 0, 220, 0, 130.81, 0, 164.81, 0, 146.83, 0, 196, 0];
const CUE_GAP: Record<ChapterSound, number> = {
  jump: .08, land: .1, terminal: .2, fall: .3, arrive: .8, machine: .25, checkpoint: .4,
  step: .18, pulse: .11, "pulse-hit": .08, "bug-cleared": .14, "shield-hit": .25,
  "shield-ready": .3, "code-error": .25,
};

/** Original browser-synthesized cues; no downloads, microphones or sound before a gesture. */
export class ChapterAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private muted = true;
  private paused = false;
  private destroyed = false;
  private melody: ReturnType<typeof setInterval> | null = null;
  private resumePending: Promise<void> | null = null;
  private targetVolume = 0;
  private beat = 0;
  private voices = new Set<Voice>();
  private lastCueAt: Partial<Record<ChapterSound, number>> = {};

  /** Call from an actual keyboard/pointer gesture, including the sound toggle. */
  unlock() {
    if (this.destroyed) return;
    try {
      if (!this.context) {
        const Context = globalThis.AudioContext ?? (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Context) return;
        this.context = new Context();
        this.output = this.context.createGain();
        this.output.gain.value = 0;
        this.output.connect(this.context.destination);
        this.context.onstatechange = () => this.applyState();
      }
      const context = this.context;
      // Held direction keys and touch events must not enqueue a resume promise on every frame.
      if (context.state !== "running" && context.state !== "closed" && !this.resumePending) {
        const pending = context.resume();
        this.resumePending = pending;
        void pending.then(() => {
          if (!this.destroyed && this.context === context) this.applyState();
        }, () => { /* A later user gesture can try again. */ }).finally(() => {
          if (this.resumePending === pending) this.resumePending = null;
        });
      }
      this.applyState();
    } catch { /* The adventure remains playable when the browser does not offer audio. */ }
  }

  set(muted: boolean, paused: boolean) {
    if (this.destroyed || (this.muted === muted && this.paused === paused)) return;
    this.muted = muted;
    this.paused = paused;
    this.applyState();
  }

  private applyState() {
    const context = this.context, output = this.output;
    if (!context || !output || this.destroyed) return;
    const enabled = !this.muted && !this.paused;
    const target = enabled ? .2 : 0;
    if (target !== this.targetVolume && context.state !== "closed") {
      output.gain.cancelScheduledValues(context.currentTime);
      output.gain.setTargetAtTime(target, context.currentTime, .035);
      this.targetVolume = target;
    }
    if (enabled && context.state === "running") {
      if (this.melody === null) {
        this.ambient();
        this.melody = setInterval(() => this.ambient(), 1250);
      }
    } else {
      if (this.melody !== null) clearInterval(this.melody);
      this.melody = null;
      // Delayed fanfare notes must not reappear after a short pause or a mute/unmute.
      for (const voice of this.voices) {
        if (context.state === "closed") break;
        voice.gain.gain.cancelScheduledValues(context.currentTime);
        voice.gain.gain.setTargetAtTime(.0001, context.currentTime, .01);
        try { voice.oscillator.stop(context.currentTime + .04); } catch { /* Already ended. */ }
      }
    }
  }

  private canPlay() {
    return !!this.context && !!this.output && !this.muted && !this.paused && !this.destroyed && this.context.state === "running";
  }

  private tone(frequency: number, duration: number, delay = 0, volume = .2, kind: OscillatorType = "sine", endFrequency?: number) {
    const context = this.context, output = this.output;
    if (!context || !output || !this.canPlay() || this.voices.size >= MAX_VOICES) return;
    const oscillator = context.createOscillator(), gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = kind;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency !== undefined) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + .009);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(output);
    const voice = { oscillator, gain };
    this.voices.add(voice);
    oscillator.onended = () => {
      this.voices.delete(voice);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(start + duration + .025);
  }

  play(sound: ChapterSound) {
    if (!this.canPlay()) return;
    const now = this.context!.currentTime;
    const last = this.lastCueAt[sound];
    if (last !== undefined && now - last < CUE_GAP[sound]) return;
    this.lastCueAt[sound] = now;
    switch (sound) {
      case "jump":
        this.tone(310, .12, 0, .19, "triangle", 430);
        this.tone(470, .14, .035, .12, "triangle");
        break;
      case "step": this.tone(82, .045, 0, .045, "sine", 63); break;
      case "land": this.tone(98, .08, 0, .16, "sine", 72); break;
      case "fall": this.tone(220, .2, 0, .13); this.tone(147, .3, .1, .11); break;
      case "terminal": this.tone(523.25, .14); this.tone(783.99, .2, .08, .16); break;
      case "machine": this.tone(130.81, .35, 0, .11, "triangle"); this.tone(261.63, .4, .1, .1); break;
      case "checkpoint":
        this.tone(392, .16, 0, .13); this.tone(523.25, .21, .08, .12); this.tone(783.99, .24, .17, .08);
        break;
      case "arrive": [261.63, 329.63, 392, 523.25].forEach((note, index) => this.tone(note, .55, index * .12, .17, "triangle")); break;
      case "pulse":
        this.tone(740, .15, 0, .12, "triangle", 240);
        this.tone(148, .12, 0, .09, "sine", 92);
        break;
      case "pulse-hit": this.tone(880, .09, 0, .11, "sine", 560); this.tone(523, .13, .025, .08); break;
      case "bug-cleared": [329.63, 493.88, 659.25].forEach((note, index) => this.tone(note, .17, index * .055, .12, "triangle")); break;
      case "shield-hit": this.tone(164, .18, 0, .13, "triangle", 74); this.tone(73.42, .16, .02, .11); break;
      case "shield-ready": this.tone(392, .2, 0, .1); this.tone(523.25, .3, .09, .09); break;
      case "code-error": this.tone(246.94, .12, 0, .1, "triangle"); this.tone(196, .18, .08, .09, "triangle"); break;
    }
  }

  /** Semantic alias for future gameplay effects; play() remains backwards compatible. */
  cue(sound: ChapterSound) { this.play(sound); }

  private ambient() {
    if (!this.canPlay()) return;
    const note = AMBIENT_NOTES[this.beat++ % AMBIENT_NOTES.length];
    if (note) this.tone(note, 1.55, 0, .04);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.melody !== null) clearInterval(this.melody);
    this.melody = null;
    for (const voice of this.voices) {
      voice.oscillator.onended = null;
      try { voice.oscillator.stop(); } catch { /* Already ended. */ }
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }
    this.voices.clear();
    this.output?.disconnect();
    if (this.context) {
      this.context.onstatechange = null;
      if (this.context.state !== "closed") void this.context.close().catch(() => {});
    }
    this.context = null;
    this.output = null;
    this.resumePending = null;
    this.lastCueAt = {};
  }
}
