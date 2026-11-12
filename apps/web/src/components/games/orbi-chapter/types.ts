import type { ChapterMissionId, ChapterProgram } from "@/lib/orbiChapter";
import type { PulseLessonId, PulseSceneConfig } from "@/lib/orbiPulse";

export type PulseGuideState = {
  phase: "terminal" | "approach" | "repair" | "workshop";
  threat: "safe" | "charging" | "incoming";
  direction: "left" | "right" | "none";
  target: number | null;
  breach: boolean;
  canReturn: boolean;
};

export type ChapterEvent =
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "terminal"; mission: ChapterMissionId }
  | { type: "checkpoint"; mission: ChapterMissionId }
  | { type: "fell"; mission: ChapterMissionId }
  | { type: "blocked"; message: string }
  | { type: "arrived"; mission: ChapterMissionId }
  | { type: "pulse-state"; shield: number; cleared: number; total: number; cooldownRemaining: number; cooldownTotal: number }
  | ({ type: "pulse-guide" } & PulseGuideState)
  | { type: "pulse-arrived"; lesson: PulseLessonId }
  | { type: "pulse-feedback"; message: string }
  | { type: "position"; x: number; zone: string; nearTerminal: boolean };

export type ChapterSceneOptions = {
  mission: ChapterMissionId;
  program: ChapterProgram | null;
  pulse?: PulseSceneConfig | null;
  paused: boolean;
  muted: boolean;
  restartToken: number;
  onEvent: (event: ChapterEvent) => void;
};
export type OrbiChapterHandle = {
  setControl: (control: "left" | "right" | "fire", pressed: boolean) => void;
  jump: () => void;
  fire: () => void;
  interact: () => void;
  focus: () => void;
  unlockAudio: () => void;
};
export type ChapterRuntime = OrbiChapterHandle & { sync: (options: ChapterSceneOptions) => void; destroy: () => void };
