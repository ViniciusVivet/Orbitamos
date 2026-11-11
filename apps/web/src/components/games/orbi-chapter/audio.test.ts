import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChapterAudio, type ChapterSound } from "./audio";

class FakeParameter {
  value = 0;
  cancelScheduledValues = vi.fn();
  setTargetAtTime = vi.fn();
  setValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}
class FakeGain {
  gain = new FakeParameter();
  connect = vi.fn();
  disconnect = vi.fn();
}
class FakeOscillator {
  type = "sine";
  frequency = new FakeParameter();
  connect = vi.fn();
  disconnect = vi.fn();
  onended: (() => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  start = vi.fn();
  stop = vi.fn((at?: number) => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.onended?.(), Math.max(0, (at ?? 0) * 1000 - Date.now()));
  });
}
class FakeContext {
  static instances: FakeContext[] = [];
  state: AudioContextState = "suspended";
  destination = {};
  onstatechange: (() => void) | null = null;
  gains: FakeGain[] = [];
  oscillators: FakeOscillator[] = [];
  constructor() { FakeContext.instances.push(this); }
  get currentTime() { return Date.now() / 1000; }
  resume = vi.fn(async () => { this.state = "running"; this.onstatechange?.(); });
  close = vi.fn(async () => { this.state = "closed"; this.onstatechange?.(); });
  createGain() { const gain = new FakeGain(); this.gains.push(gain); return gain; }
  createOscillator() { const oscillator = new FakeOscillator(); this.oscillators.push(oscillator); return oscillator; }
}

const allSounds: ChapterSound[] = ["jump", "land", "terminal", "fall", "arrive", "machine", "checkpoint", "step", "pulse", "pulse-hit", "bug-cleared", "shield-hit", "shield-ready", "code-error"];
let audio: ChapterAudio;
const enable = async () => {
  audio.set(false, false);
  audio.unlock();
  await Promise.resolve();
  return FakeContext.instances[0];
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  FakeContext.instances = [];
  vi.stubGlobal("AudioContext", FakeContext);
  audio = new ChapterAudio();
});
afterEach(() => { audio.destroy(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("ChapterAudio lifecycle and resource budget", () => {
  it("keeps sound off until a gesture and does not run ambience while muted", async () => {
    for (const sound of allSounds) audio.play(sound);
    expect(FakeContext.instances).toHaveLength(0);
    audio.unlock();
    await Promise.resolve();
    const context = FakeContext.instances[0];
    for (let frame = 0; frame < 500; frame++) { audio.set(true, false); audio.unlock(); }
    await vi.advanceTimersByTimeAsync(30000);
    expect(FakeContext.instances).toHaveLength(1);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(context.oscillators).toHaveLength(0);
    expect(context.gains[0].gain.setTargetAtTime).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not enqueue master-gain automation or timers for unchanged frame options", async () => {
    const context = await enable();
    const master = context.gains[0];
    expect(master.gain.setTargetAtTime).toHaveBeenCalledTimes(1);
    const timers = vi.getTimerCount();
    for (let frame = 0; frame < 2000; frame++) { audio.set(false, false); audio.unlock(); }
    expect(master.gain.setTargetAtTime).toHaveBeenCalledTimes(1);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(timers);
  });

  it("silences scheduled effects and stops background work across pause and mute", async () => {
    const context = await enable();
    audio.play("arrive");
    const beforePause = context.oscillators.length;
    audio.set(false, true);
    expect(context.gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, .035);
    for (const oscillator of context.oscillators) expect(oscillator.stop).toHaveBeenLastCalledWith(.04);
    await vi.advanceTimersByTimeAsync(30000);
    for (const sound of allSounds) audio.play(sound);
    expect(context.oscillators).toHaveLength(beforePause);
    expect(vi.getTimerCount()).toBe(0);
    audio.set(false, false);
    const afterResume = context.oscillators.length;
    expect(afterResume).toBeGreaterThanOrEqual(beforePause);
    audio.set(true, false);
    await vi.advanceTimersByTimeAsync(30000);
    expect(context.oscillators).toHaveLength(afterResume);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("bounds rapid combat effects and returns voices to the pool after they end", async () => {
    const context = await enable();
    for (let repeat = 0; repeat < 100; repeat++) for (const sound of allSounds) audio.cue(sound);
    expect(context.oscillators.length).toBeLessThanOrEqual(12);
    await vi.advanceTimersByTimeAsync(1100);
    const before = context.oscillators.length;
    audio.play("pulse");
    expect(context.oscillators.length).toBeGreaterThan(before);
    const active = context.oscillators.filter(oscillator => !oscillator.disconnect.mock.calls.length);
    expect(active.length).toBeLessThanOrEqual(12);
  });

  it("gives each new action an actual audible envelope without allocating external media", async () => {
    const context = await enable();
    for (const sound of ["pulse", "pulse-hit", "bug-cleared", "shield-hit", "shield-ready", "code-error", "step"] as const) {
      const before = context.oscillators.length;
      audio.play(sound);
      expect(context.oscillators.length).toBeGreaterThan(before);
      const latestVoice = context.gains.at(-1)!;
      expect(latestVoice.gain.linearRampToValueAtTime).toHaveBeenCalled();
      expect(latestVoice.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1000);
    }
  });

  it("disconnects every live graph, closes its context once and ignores calls after destroy", async () => {
    const context = await enable();
    audio.play("pulse");
    audio.play("arrive");
    audio.destroy();
    audio.destroy();
    for (const oscillator of context.oscillators) expect(oscillator.disconnect).toHaveBeenCalled();
    for (const gain of context.gains) expect(gain.disconnect).toHaveBeenCalled();
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(context.onstatechange).toBeNull();
    const count = context.oscillators.length;
    audio.unlock(); audio.set(false, false); audio.play("pulse");
    await vi.advanceTimersByTimeAsync(30000);
    expect(FakeContext.instances).toHaveLength(1);
    expect(context.oscillators).toHaveLength(count);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stays playable when audio is unsupported or a resume is rejected", async () => {
    vi.stubGlobal("AudioContext", undefined);
    expect(() => { audio.unlock(); audio.set(false, false); audio.play("pulse"); }).not.toThrow();
    expect(FakeContext.instances).toHaveLength(0);
    vi.stubGlobal("AudioContext", FakeContext);
    audio.unlock();
    await Promise.resolve();
    const context = FakeContext.instances[0];
    context.state = "suspended";
    context.resume.mockRejectedValueOnce(new Error("gesture required"));
    await Promise.resolve(); await Promise.resolve();
    audio.unlock();
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(context.resume).toHaveBeenCalledTimes(2);
    expect(() => audio.play("pulse")).not.toThrow();
  });
});
