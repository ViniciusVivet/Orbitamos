import type { ChapterMissionId, ChapterProgram } from "@/lib/orbiChapter";

export type ChapterEvent =
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "terminal"; mission: ChapterMissionId }
  | { type: "checkpoint"; mission: ChapterMissionId }
  | { type: "fell"; mission: ChapterMissionId }
  | { type: "blocked"; message: string }
  | { type: "arrived"; mission: ChapterMissionId }
  | { type: "position"; x: number; zone: string; nearTerminal: boolean };

export type ChapterSceneOptions = {
  mission: ChapterMissionId;
  program: ChapterProgram | null;
  paused: boolean;
  muted: boolean;
  restartToken: number;
  onEvent: (event: ChapterEvent) => void;
};
export type OrbiChapterHandle = {
  setControl: (control: "left" | "right", pressed: boolean) => void;
  jump: () => void;
  interact: () => void;
  focus: () => void;
  unlockAudio: () => void;
};
export type ChapterRuntime = OrbiChapterHandle & { sync: (options: ChapterSceneOptions) => void; destroy: () => void };
