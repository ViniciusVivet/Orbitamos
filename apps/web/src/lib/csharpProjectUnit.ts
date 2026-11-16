import type { CSharpMethodsActivity, CSharpMethodsActivityId, CSharpMethodsPreparationId, CSharpMethodsProgress } from "./csharpMethods";

/** Shared UI contract, not a compiler or a common save. Each unit validates its own envelope. */
export type CSharpProjectProgress = Omit<CSharpMethodsProgress, "unitId"> & { unitId: string };
export type CSharpProjectActivityId = CSharpMethodsActivityId;
export type CSharpProjectActivity = CSharpMethodsActivity & { fileName?: "Program.cs" | "Servico.cs" };
export type CSharpProjectDefinition = {
  id: string; title: string; downloadHref: string; executionNotice: string; validInputs: string;
  prerequisites: readonly string[];
  bridge: readonly { id: CSharpMethodsPreparationId; title: string; detail: string; command: string | null }[];
};
export type CSharpProjectModel<P extends CSharpProjectProgress> = {
  maxFileBytes: number;
  key: (owner: string | number) => string;
  initial: () => P;
  read: (raw: string | null) => P;
  prepare: (state: P, id: CSharpMethodsPreparationId, checked: boolean) => P;
  edit: (state: P, id: CSharpProjectActivityId, code: string) => P;
  reset: (state: P, id: CSharpProjectActivityId) => P;
  hint: (state: P, id: CSharpProjectActivityId) => P;
  model: (state: P, id: CSharpProjectActivityId) => P;
  predict: (state: P, id: string, answer: number) => P;
  declare: (state: P, id: CSharpProjectActivityId) => P;
  clear: (state: P, id: CSharpProjectActivityId) => P;
  export: (state: P, id: CSharpProjectActivityId) => { ok: true; filename: string; content: string } | { ok: false; error: string };
  import: (state: P, raw: string) => { ok: true; progress: P; activityId: CSharpProjectActivityId; replacesExisting: boolean } | { ok: false; error: string };
};
export type CSharpProjectPresentation = {
  kind: "methods" | "objects";
  topic: string; kicker: string; headline: readonly [string, string]; caption: readonly [string, string]; description: string;
  referenceLabel: string; nextDescription: string;
};
