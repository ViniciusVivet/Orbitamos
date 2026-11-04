type Sound = "jump" | "land" | "terminal" | "fall" | "arrive" | "machine" | "checkpoint";

/** Browser-generated score and cues: no network audio or sound before a user gesture. */
export class ChapterAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private muted = true;
  private paused = false;
  private destroyed = false;
  private melody: ReturnType<typeof setInterval> | null = null;
  private beat = 0;

  unlock() {
    if (this.destroyed) return;
    try {
      this.context ??= new AudioContext();
      if (!this.output) { this.output = this.context.createGain(); this.output.gain.value = 0; this.output.connect(this.context.destination); }
      void this.context.resume().catch(() => {});
      this.set(this.muted, this.paused);
      if (!this.melody) this.melody = setInterval(() => this.ambient(), 750);
    } catch { /* The game remains fully playable without audio support. */ }
  }
  set(muted: boolean, paused: boolean) {
    this.muted = muted; this.paused = paused;
    if (this.context && this.output) this.output.gain.setTargetAtTime(muted || paused ? 0 : .22, this.context.currentTime, .045);
  }
  private tone(frequency: number, duration: number, delay = 0, volume = .24, kind: OscillatorType = "sine") {
    const context = this.context, output = this.output;
    if (!context || !output || this.muted || this.paused || this.destroyed || context.state !== "running") return;
    const oscillator = context.createOscillator(), gain = context.createGain(), start = context.currentTime + delay;
    oscillator.type = kind; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain); gain.connect(output); oscillator.start(start); oscillator.stop(start + duration + .03);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  play(sound: Sound) {
    if (sound === "jump") { this.tone(310, .12, 0, .19, "triangle"); this.tone(470, .14, .035, .13, "triangle"); }
    if (sound === "land") this.tone(98, .08, 0, .17, "sine");
    if (sound === "fall") { this.tone(220, .2, 0, .14); this.tone(147, .3, .1, .12); }
    if (sound === "terminal") { this.tone(523.25, .14); this.tone(783.99, .2, .08); }
    if (sound === "machine") { this.tone(130.81, .35, 0, .11, "triangle"); this.tone(261.63, .4, .1, .1); }
    if (sound === "checkpoint") { this.tone(392, .18, 0, .14); this.tone(523.25, .25, .1, .12); }
    if (sound === "arrive") [261.63, 329.63, 392, 523.25].forEach((note, index) => this.tone(note, .55, index * .12, .19, "triangle"));
  }
  private ambient() {
    if (!this.context || this.paused || this.muted) return;
    const notes = [130.81, 0, 196, 0, 164.81, 0, 220, 196, 130.81, 0, 164.81, 0, 146.83, 0, 196, 0];
    const note = notes[this.beat++ % notes.length];
    if (note) this.tone(note, 1.7, 0, .065);
  }
  destroy() {
    this.destroyed = true;
    if (this.melody) clearInterval(this.melody); this.melody = null;
    if (this.context) void this.context.close().catch(() => {});
    this.context = null; this.output = null;
  }
}
