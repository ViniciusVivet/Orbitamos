export const pulseLessonIds = ["alcance", "ritmo"] as const;
export type PulseLessonId = typeof pulseLessonIds[number];
export type PulseProgram = { range: number; cooldown: number };
export type PulseSceneConfig = { lesson: PulseLessonId; program: PulseProgram | null };
export type PulseLesson = {
  id: PulseLessonId;
  title: string;
  concept: string;
  story: string;
  objective: string;
  terminalTitle: string;
  instruction: string;
  starterCode: string;
  referenceCode: string;
  hints: string[];
  victoryTitle: string;
  victoryMessage: string;
};

export const PULSE_CODE_LIMIT = 2400;
const referenceCode = "const alcancePulso = 280;\nconst recarga = 0.6;";

export const pulseLessons: PulseLesson[] = [
  {
    id: "alcance",
    title: "O pulso que alcança",
    concept: "Uma variável controla uma ação",
    story: "A tempestade deixou três sentinelas do bairro presas num ciclo de ruído. Elas fecharam as passagens. Orbi encontrou um emissor de reparo, mas o pulso ainda termina antes de chegar aos bugs.",
    objective: "Ajuste o alcance, repare os três bugs e chegue à oficina.",
    terminalTitle: "Oficina do Pulso · alcance",
    instruction: "alcancePulso é a distância da onda. Com 90, ela para antes do bug. Troque para 280, mantenha a linha de recarga e aplique. Depois use Pulso para reparar os três bugs e liberar as passagens.",
    starterCode: "const alcancePulso = 90;\nconst recarga = 1.4;",
    referenceCode,
    hints: [
      "alcancePulso é a distância da onda; recarga é a espera entre disparos, em segundos. Observe onde o pulso termina e onde está o bug.",
      "Mude o número depois de alcancePulso =. A recarga pode continuar em 1.4 nesta primeira rota.",
      "Experimente const alcancePulso = 280; na primeira linha. Preserve a declaração de recarga na segunda e aplique o código antes de testar.",
    ],
    victoryTitle: "Seu código foi mais longe.",
    victoryMessage: "Você ajustou alcancePulso e reparou três bugs. Uma variável mudou a ação do Orbi.",
  },
  {
    id: "ritmo",
    title: "Dois pulsos, um reparo",
    concept: "Decimais representam intervalos menores",
    story: "As próximas sentinelas têm um escudo instável. Um pulso abre uma brecha, mas o escudo volta em 1.1 segundo. Orbi precisa do segundo pulso antes disso para terminar o reparo.",
    objective: "Encurte a recarga, faça dois acertos por bug e alcance a oficina.",
    terminalTitle: "Oficina do Pulso · ritmo",
    instruction: "Os bugs precisam de dois acertos antes de 1.1 segundo. Com recarga = 1.4, a brecha fecha entre os pulsos. Mantenha alcancePulso em 280 e use recarga = 0.6; o ponto escreve o decimal em JavaScript.",
    starterCode: "const alcancePulso = 280;\nconst recarga = 1.4;",
    referenceCode,
    hints: [
      "O primeiro acerto abre uma brecha de 1.1 segundo. A recarga precisa permitir outro disparo antes de ela fechar.",
      "0.6 é menor que 1.1. Aqui isso significa esperar menos entre os pulsos; não é aumentar a força do disparo.",
      "Use const alcancePulso = 280; e const recarga = 0.6;. Em JavaScript, escreva o decimal com ponto. Aplique e teste dois acertos no mesmo bug.",
    ],
    victoryTitle: "Você encontrou o ritmo do reparo.",
    victoryMessage: "Você reduziu recarga para disparar antes do escudo voltar. O decimal mudou o ritmo da ação.",
  },
];

export const getPulseLesson = (id: PulseLessonId): PulseLesson => pulseLessons.find(lesson => lesson.id === id)!;
export const isPulseLesson = (value: unknown): value is PulseLessonId => pulseLessonIds.includes(value as PulseLessonId);
export const defaultPulseProgram = (lesson: PulseLessonId = "alcance"): PulseProgram => ({ range: lesson === "ritmo" ? 280 : 90, cooldown: 1.4 });

type Token = { value: string; kind: "name" | "number" | "symbol"; start: number; end: number };
type Declaration = { name: string; expression: Token[] };

function tokenize(source: string): Token[] | null {
  const spaces = (comment: string) => comment.replace(/[^\n]/g, " ");
  const clean = source.replace(/\/\*[^]*?\*\//g, spaces).replace(/\/\/[^\n]*/g, spaces);
  // JS ++/-- are mutation operators, not two adjacent unary signs.
  if (/\+\+|--/.test(clean)) return null;
  const pattern = /\s+|(?:\d+(?:\.\d*)?|\.\d+)|[A-Za-z_$][\w$]*|[=;+\-*/()]/gy;
  const list: Token[] = [];
  let position = 0;
  while (position < clean.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(clean);
    if (!match) return null;
    position = pattern.lastIndex;
    const value = match[0];
    if (!value.trim()) continue;
    if (/^0\d/.test(value)) return null;
    list.push({ value, kind: /^[A-Za-z_$]/.test(value) ? "name" : /^(?:\d|\.)/.test(value) ? "number" : "symbol", start: match.index, end: position });
    if (list.length > 180) return null;
  }
  return list;
}

function parseDeclarations(source: string): Declaration[] | null {
  const list = tokenize(source);
  if (!list) return null;
  const declarations: Declaration[] = [];
  let at = 0;
  while (at < list.length) {
    if (!["const", "let", "var"].includes(list[at]?.value) || list[at + 1]?.kind !== "name" || list[at + 2]?.value !== "=") return null;
    const name = list[at + 1].value;
    at += 3;
    const expression: Token[] = [];
    while (at < list.length && list[at].value !== ";" && !["const", "let", "var"].includes(list[at].value)) expression.push(list[at++]);
    if (!expression.length || declarations.some(item => item.name === name)) return null;
    if (list[at]?.value === ";") at++;
    else if (at < list.length && !source.slice(expression.at(-1)!.end, list[at].start).includes("\n")) return null;
    declarations.push({ name, expression });
    if (declarations.length > 2) return null;
  }
  return declarations;
}

function expressionValue(list: Token[], names: Record<string, number>): number | null {
  let at = 0;
  function atom(): number {
    const token = list[at++];
    if (!token) return NaN;
    if (token.value === "+") return atom();
    if (token.value === "-") return -atom();
    if (token.value === "(") { const value = sum(); return list[at++]?.value === ")" ? value : NaN; }
    if (token.kind === "number") return Number(token.value);
    return token.kind === "name" && Object.hasOwn(names, token.value) ? names[token.value] : NaN;
  }
  function product(): number {
    let value = atom();
    while (["*", "/"].includes(list[at]?.value)) { const operation = list[at++].value; const right = atom(); value = operation === "*" ? value * right : value / right; }
    return value;
  }
  function sum(): number {
    let value = product();
    while (["+", "-"].includes(list[at]?.value)) { const operation = list[at++].value; const right = product(); value = operation === "+" ? value + right : value - right; }
    return value;
  }
  const result = sum();
  return at === list.length && Number.isFinite(result) ? result : null;
}

export type PulseProgramResult = { ok: true; program: PulseProgram; message: string; output: string } | { ok: false; message: string; output: string };

/** Reads two bounded numeric declarations. Learner text is never executed as JavaScript. */
export function testPulseProgram(source: string): PulseProgramResult {
  const fail = (message: string): PulseProgramResult => ({ ok: false, message, output: "" });
  if (!source.trim()) return fail("Escreva as duas linhas do equipamento. Você pode pedir uma pista.");
  if (source.length > PULSE_CODE_LIMIT) return fail("Use um programa curto, com alcancePulso e recarga. Este terminal aceita até 2400 caracteres.");
  const declarations = parseDeclarations(source);
  if (!declarations) return fail("Confira a escrita: const nome = valor;. Use números, contas simples e uma declaração por linha.");
  if (declarations.length !== 2 || declarations[0].name !== "alcancePulso" || declarations[1].name !== "recarga") return fail("Use alcancePulso na primeira declaração e recarga na segunda. São os nomes que o equipamento lê.");
  const names: Record<string, number> = Object.create(null);
  for (const declaration of declarations) {
    const value = expressionValue(declaration.expression, names);
    if (value === null) return fail("A conta não encontrou um número válido. Declare o valor antes de usar o nome e confira os parênteses.");
    names[declaration.name] = value;
  }
  if (names.alcancePulso < 40 || names.alcancePulso > 400) return fail("O alcance do pulso precisa ficar entre 40 e 400. Esse limite protege o equipamento.");
  if (names.recarga < .25 || names.recarga > 2.5) return fail("A recarga precisa ficar entre 0.25 e 2.5 segundos. Use ponto, como em 0.6, para escrever um decimal em JavaScript.");
  const program = { range: names.alcancePulso, cooldown: names.recarga };
  return {
    ok: true,
    program,
    message: `Equipamento ajustado: alcance de ${program.range} e recarga de ${program.cooldown} s. Volte ao cenário e observe o pulso.`,
    output: `alcancePulso = ${program.range}\nrecarga = ${program.cooldown} s`,
  };
}

export type PulseSave = {
  version: 1;
  current: PulseLessonId;
  completed: PulseLessonId[];
  drafts: Record<PulseLessonId, string>;
  attempts: Record<PulseLessonId, number>;
};

export const pulseSaveKey = (userId: string | number): string => `orbitamos-orbi-pulse-v1-${userId}`;
export const emptyPulseSave = (): PulseSave => ({
  version: 1,
  current: "alcance",
  completed: [],
  drafts: { alcance: pulseLessons[0].starterCode, ritmo: pulseLessons[1].starterCode },
  attempts: { alcance: 0, ritmo: 0 },
});

function completedPrefix(completed: readonly PulseLessonId[]): PulseLessonId[] {
  const missing = pulseLessonIds.findIndex(id => !completed.includes(id));
  return pulseLessonIds.slice(0, missing < 0 ? pulseLessonIds.length : missing);
}

export function readPulseSave(raw: string | null): PulseSave {
  const empty = emptyPulseSave();
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
    const data = value as Record<string, unknown>;
    if (data.version !== 1) return empty;
    if (Array.isArray(data.completed)) empty.completed = completedPrefix(data.completed.filter(isPulseLesson));
    const current = isPulseLesson(data.current) ? data.current : "alcance";
    empty.current = pulseLessonIds.indexOf(current) <= empty.completed.length ? current : pulseLessonIds[Math.min(empty.completed.length, pulseLessonIds.length - 1)];
    for (const id of pulseLessonIds) {
      if (data.drafts && typeof data.drafts === "object" && !Array.isArray(data.drafts)) {
        const draft = (data.drafts as Record<string, unknown>)[id];
        if (typeof draft === "string") empty.drafts[id] = draft.slice(0, PULSE_CODE_LIMIT);
      }
      if (data.attempts && typeof data.attempts === "object" && !Array.isArray(data.attempts)) {
        const attempts = (data.attempts as Record<string, unknown>)[id];
        if (typeof attempts === "number" && Number.isInteger(attempts)) empty.attempts[id] = Math.max(0, Math.min(attempts, 10000));
      }
    }
    return empty;
  } catch { return empty; }
}

/** Call only after the runtime confirms code applied, three repairs and physical arrival. */
export function completePulseLesson(save: PulseSave, lesson: PulseLessonId): PulseSave {
  const index = pulseLessonIds.indexOf(lesson);
  const prefix = completedPrefix(save.completed);
  if (index < 0 || index !== prefix.length || save.completed.includes(lesson)) return save;
  const completed = [...prefix, lesson];
  return { ...save, completed, current: pulseLessonIds[Math.min(index + 1, pulseLessonIds.length - 1)] };
}

/** Only achievements and attempt counters are monotonic; the active tab keeps its draft/navigation. */
export function preservePulseAchievements(next: PulseSave, existing: PulseSave): PulseSave {
  const count = Math.max(completedPrefix(next.completed).length, completedPrefix(existing.completed).length);
  const completed = pulseLessonIds.slice(0, count);
  return {
    ...next,
    completed,
    drafts: { ...next.drafts },
    attempts: {
      alcance: Math.max(next.attempts.alcance, existing.attempts.alcance),
      ritmo: Math.max(next.attempts.ritmo, existing.attempts.ritmo),
    },
  };
}
