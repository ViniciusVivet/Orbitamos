export const chapterMissionIds = ["ponte", "elevador", "farol"] as const;
export type ChapterMissionId = typeof chapterMissionIds[number];
export type ChapterProgram = { bridge: number; lift: number; energy: number; transfer?: boolean };
export type ChapterMission = {
  id: ChapterMissionId; title: string; story: string; objective: string;
  terminalTitle: string; instruction: string; starterCode: string;
  referenceCode: string; hints: string[]; concept: string;
};
export const chapterMissions: ChapterMission[] = [
  { id: "ponte", title: "A ponte adormecida", concept: "Uma variável muda o mundo", story: "A última encomenda precisa chegar ao Farol. A ponte do bairro está recolhida. Leve Orbi até o terminal e descubra como fazê-la crescer.", objective: "Abra a ponte e atravesse o canal com a encomenda.", terminalTitle: "Oficina da ponte", instruction: "A variável alcance controla quantos pixels de ponte aparecem. Dê a ela um valor entre 260 e 360. Depois teste a travessia: caminhe pela ponte e pule o trecho final.", starterCode: "const alcance = 80;", referenceCode: "const alcance = 280;", hints: ["Uma variável guarda um valor. Aqui, alcance é o nome que a ponte entende.", "O número vem depois de =. Com 80, a ponte ainda fica curta.", "Você pode tentar const alcance = 280; e observar o que muda no cenário." ] },
  { id: "elevador", title: "Uma encomenda nas alturas", concept: "O mesmo nome, um novo valor", story: "A biblioteca fica no terraço. O elevador ainda sobe pouco. Agora você já sabe onde procurar: um nome no código controla uma parte da máquina.", objective: "Ajuste a subida, embarque no elevador e alcance a biblioteca.", terminalTitle: "Elevador da biblioteca", instruction: "A variável altura controla a subida máxima do elevador. Use um valor entre 170 e 220. Quando a plataforma voltar ao chão, embarque e pule para o terraço.", starterCode: "let altura = 50;", referenceCode: "let altura = 180;", hints: ["Você continua guardando um número. Desta vez, o nome é altura.", "Mude só o valor depois de =. O elevador precisa subir pelo menos 170.", "Experimente let altura = 180;. Você ainda precisa embarcar e chegar à biblioteca." ] },
  { id: "farol", title: "Luz para o bairro", concept: "Uma variável pode usar outra", story: "A encomenda é uma bateria. O Farol precisa gastar 4 unidades e guardar mais 2 de reserva. Prepare o código no terminal e faça a última entrega.", objective: "Calcule a energia com uma expressão e leve a bateria ao Farol.", terminalTitle: "Central de energia", instruction: "Agora o campo começa vazio. Declare custo com o número 4. Declare energia usando custo + 2, para pagar o consumo e manter a reserva. Use uma declaração por linha. O portão só abre quando a conta acompanha o custo.", starterCode: "", referenceCode: "const custo = 4;\nconst energia = custo + 2;", hints: ["Você já sabe declarar uma variável com const ou let. Comece pelo nome custo e pelo valor 4.", "Na próxima linha, crie energia. Em vez de escrever só o resultado, use o nome custo e some a reserva.", "A expressão custo + 2 acompanha o custo: se ele fosse 5, a energia passaria a 7. Declare energia usando essa expressão." ] },
];

export const getChapterMission = (id: ChapterMissionId) => chapterMissions.find(mission => mission.id === id)!;
export const isChapterMission = (value: unknown): value is ChapterMissionId => chapterMissionIds.includes(value as ChapterMissionId);
export const defaultChapterProgram = (): ChapterProgram => ({ bridge: 70, lift: 50, energy: 0, transfer: false });
export function chapterProgramReady(id: ChapterMissionId, program: ChapterProgram | null): boolean {
  return !!program && (id === "ponte" ? program.bridge >= 260 : id === "elevador" ? program.lift >= 170 : program.energy === 6 && program.transfer === true);
}

type Token = { kind: "name" | "number" | "symbol"; value: string; start: number; end: number };
/** A deliberately small, safe JavaScript declaration grammar. Never evals learner text. */
function tokens(source: string): Token[] | null {
  const eraseComment = (comment: string) => comment.replace(/[^\n]/g, " ");
  const clean = source.replace(/\/\*[^]*?\*\//g, eraseComment).replace(/\/\/[^\n]*/g, eraseComment);
  // Adjacent ++/-- are increment/decrement tokens in JavaScript, not two unary operators.
  if (/\+\+|--/.test(clean)) return null;
  const found: Token[] = [];
  const pattern = /\s+|(?:\d+(?:\.\d+)?|\.\d+)|[A-Za-z_$][\w$]*|[=;+\-*/()]/gy;
  let position = 0;
  while (position < clean.length) {
    pattern.lastIndex = position; const match = pattern.exec(clean);
    if (!match) return null;
    position = pattern.lastIndex; const value = match[0];
    if (!value.trim()) continue;
    if (/^0\d/.test(value)) return null;
    found.push({ kind: /^[A-Za-z_$]/.test(value) ? "name" : /^(?:\d|\.)/.test(value) ? "number" : "symbol", value, start: match.index, end: position });
    if (found.length > 180) return null;
  }
  return found;
}
type Declaration = { name: string; expression: Token[] };
function parseDeclarations(source: string): Declaration[] | null {
  const list = tokens(source); if (!list) return null;
  const declarations: Declaration[] = []; let at = 0;
  while (at < list.length) {
    if (!["const", "let", "var"].includes(list[at]?.value) || list[at + 1]?.kind !== "name" || list[at + 2]?.value !== "=") return null;
    const name = list[at + 1].value; at += 3;
    const expression: Token[] = [];
    while (at < list.length && list[at].value !== ";" && !["const", "let", "var"].includes(list[at].value)) expression.push(list[at++]);
    if (list[at]?.value === ";") at++;
    else if (at < list.length && !source.slice(expression.at(-1)?.end ?? 0, list[at].start).includes("\n")) return null;
    if (!expression.length || declarations.some(item => item.name === name)) return null;
    declarations.push({ name, expression }); if (declarations.length > 3) return null;
  }
  return declarations.length ? declarations : null;
}
function expressionValue(list: Token[], names: Record<string, number>): number | null {
  let at = 0;
  function atom(): number {
    const token = list[at++]; if (!token) return NaN;
    if (token.value === "+") return atom(); if (token.value === "-") return -atom();
    if (token.value === "(") { const value = sum(); return list[at++]?.value === ")" ? value : NaN; }
    if (token.kind === "number") return Number(token.value);
    return token.kind === "name" && Object.hasOwn(names, token.value) ? names[token.value] : NaN;
  }
  function product(): number { let value = atom(); while (["*", "/"].includes(list[at]?.value)) { const op = list[at++].value; const right = atom(); value = op === "*" ? value * right : value / right; } return value; }
  function sum(): number { let value = product(); while (["+", "-"].includes(list[at]?.value)) { const op = list[at++].value; const right = product(); value = op === "+" ? value + right : value - right; } return value; }
  const value = sum(); return at === list.length && Number.isFinite(value) ? value : null;
}
function values(declarations: Declaration[], alternateCost?: number): Record<string, number> | null {
  const result: Record<string, number> = Object.create(null);
  for (const declaration of declarations) {
    const value = alternateCost !== undefined && declaration.name === "custo" ? alternateCost : expressionValue(declaration.expression, result);
    if (value === null || !Number.isFinite(value)) return null;
    result[declaration.name] = value;
  }
  return result;
}
export type ChapterProgramResult = { ok: true; program: ChapterProgram; message: string; output: string } | { ok: false; message: string; output: string };
export function testChapterProgram(id: ChapterMissionId, source: string): ChapterProgramResult {
  const fail = (message: string): ChapterProgramResult => ({ ok: false, message, output: "" });
  if (!source.trim()) return fail("Escreva seu comando no terminal. Você pode pedir uma pista.");
  if (source.length > 2400) return fail("Este terminal recebe um programa curto. Use somente as variáveis da missão.");
  const declarations = parseDeclarations(source);
  if (!declarations) return fail("Confira a escrita: const nome = valor; Use uma declaração por linha. Este terminal aceita nomes, números e contas simples.");
  const expected = id === "ponte" ? ["alcance"] : id === "elevador" ? ["altura"] : ["custo", "energia"];
  if (declarations.length !== expected.length || declarations.some((item, index) => item.name !== expected[index])) return fail(`Use ${id === "farol" ? "custo e depois energia" : expected[0]} como ${id === "farol" ? "nomes das variáveis" : "nome da variável"}. A máquina procura esse nome.`);
  const result = values(declarations); if (!result) return fail("A conta não encontrou um número válido. Declare o valor antes de usar o nome e confira os parênteses.");
  const program = defaultChapterProgram();
  if (id === "ponte") {
    const value = result.alcance;
    if (!Number.isInteger(value) || value < 20 || value > 360) return fail("A ponte aceita um número inteiro de 20 a 360. Esse limite protege o mecanismo.");
    program.bridge = value;
    return { ok: true, program, message: value >= 260 ? `A ponte abriu ${value} pixels. Agora atravesse o trecho final e faça a entrega.` : `A ponte abriu ${value} pixels, mas ainda falta chão para chegar à outra margem. Observe a diferença e ajuste alcance.`, output: `alcance = ${value}` };
  }
  if (id === "elevador") {
    const value = result.altura;
    if (!Number.isInteger(value) || value < 20 || value > 220) return fail("O elevador aceita um número inteiro de 20 a 220.");
    program.lift = value;
    return { ok: true, program, message: value >= 170 ? `A subida máxima agora é ${value}. Embarque quando a plataforma descer e alcance o terraço.` : `O elevador sobe ${value}, mas o terraço ainda fica longe. Aumente altura e teste de novo.`, output: `altura = ${value}` };
  }
  if (result.custo !== 4) return fail("Nesta entrega, custo vale 4. Guarde esse valor antes de calcular a energia.");
  if (!Number.isInteger(result.energia) || result.energia < 0 || result.energia > 20) return fail("Use uma energia inteira entre 0 e 20.");
  const alternate = values(declarations, 7);
  program.energy = result.energia;
  program.transfer = declarations[1].expression.some(token => token.kind === "name" && token.value === "custo") && alternate?.energia === 9;
  const ready = chapterProgramReady(id, program);
  return { ok: true, program, message: ready ? "Consumo de 4, reserva de 2: energia total de 6. O portão abriu. Leve a bateria até o Farol!" : "A energia precisa pagar custo e guardar mais 2. Use o nome custo na conta, para a regra acompanhar outro consumo.", output: `custo = 4\nenergia = ${program.energy}\nreserva = ${program.energy - 4}` };
}

export type ChapterSave = { version: 2; current: ChapterMissionId; completed: ChapterMissionId[]; drafts: Record<ChapterMissionId, string>; attempts: Record<ChapterMissionId, number> };
export const orbiChapterKey = (userId: string | number) => `orbitamos-orbi-chapter-v2-${userId}`;
export const emptyChapterSave = (): ChapterSave => ({ version: 2, current: "ponte", completed: [], drafts: { ponte: chapterMissions[0].starterCode, elevador: chapterMissions[1].starterCode, farol: "" }, attempts: { ponte: 0, elevador: 0, farol: 0 } });
export function readChapterSave(raw: string | null): ChapterSave {
  const empty = emptyChapterSave();
  try {
    const value: unknown = JSON.parse(raw ?? "null"); if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
    const data = value as Record<string, unknown>; if (data.version !== 2) return empty;
    if (Array.isArray(data.completed)) for (const id of chapterMissionIds) { if (data.completed.includes(id)) empty.completed.push(id); else break; }
    const current = isChapterMission(data.current) ? data.current : "ponte";
    empty.current = chapterMissionIds.indexOf(current) <= empty.completed.length ? current : chapterMissionIds[Math.min(empty.completed.length, 2)];
    for (const id of chapterMissionIds) {
      if (data.drafts && typeof data.drafts === "object" && !Array.isArray(data.drafts)) { const draft = (data.drafts as Record<string, unknown>)[id]; if (typeof draft === "string") empty.drafts[id] = draft.slice(0, 2400); }
      if (data.attempts && typeof data.attempts === "object" && !Array.isArray(data.attempts)) { const n = (data.attempts as Record<string, unknown>)[id]; if (typeof n === "number" && Number.isInteger(n)) empty.attempts[id] = Math.max(0, Math.min(n, 10000)); }
    }
    return empty;
  } catch { return empty; }
}
export function completeChapterMission(save: ChapterSave, mission: ChapterMissionId): ChapterSave {
  const index = chapterMissionIds.indexOf(mission); if (index > save.completed.length || save.completed.includes(mission)) return save;
  return { ...save, completed: [...save.completed, mission], current: chapterMissionIds[Math.min(index + 1, 2)] };
}
/** Merge saves from the same account key without allowing a stale tab to erase achievements. */
export function preserveChapterAchievements(next: ChapterSave, existing: ChapterSave): ChapterSave {
  const prefixLength = (save: ChapterSave) => {
    const firstMissing = chapterMissionIds.findIndex(id => !save.completed.includes(id));
    return firstMissing === -1 ? chapterMissionIds.length : firstMissing;
  };
  const completed = chapterMissionIds.slice(0, Math.max(prefixLength(next), prefixLength(existing)));
  const attempts = Object.fromEntries(chapterMissionIds.map(id => [id, Math.max(next.attempts[id], existing.attempts[id])])) as ChapterSave["attempts"];
  // Navigation and text belong to the tab currently editing; only earned records are monotonic.
  return { ...next, completed, attempts };
}

export const CHAPTER_WORLD_WIDTH = 2360;
export const CHAPTER_HEIGHT = 600;
export const CHAPTER_GROUND = 500;
export const CHAPTER_PLAYER_WIDTH = 30;
export const CHAPTER_PLAYER_HEIGHT = 54;
export const chapterTerminal = (_mission: ChapterMissionId) => ({ x: 480, y: 500 });
export const chapterGoal = (mission: ChapterMissionId) => ({ x: 2190, y: mission === "elevador" ? 280 : 500 });
export type ChapterPlatform = { id: string; x: number; y: number; width: number; height: number };
export function chapterPlatforms(mission: ChapterMissionId, program: ChapterProgram | null, time: number): ChapterPlatform[] {
  const base = (id: string, x: number, y: number, width: number, height = 140): ChapterPlatform => ({ id, x, y, width, height });
  if (mission === "ponte") return [base("start", 0, 500, 610), base("bridge", 610, 500, program?.bridge ?? 70, 22), base("end", 1020, 500, 1340), base("crate", 1450, 448, 78, 52), base("crate2", 1740, 435, 85, 65)];
  if (mission === "elevador") { const rise = program?.lift ?? 50; const y = 500 - rise * (1 - Math.cos(time * .92)) / 2; return [base("start", 0, 500, 700), base("lift", 700, y, 180, 22), base("station", 700, 500, 180), base("roof", 880, 280, 1480), base("roof-crate", 1510, 232, 65, 48)]; }
  const result = [base("street", 0, 500, CHAPTER_WORLD_WIDTH)];
  if (!chapterProgramReady("farol", program)) result.push(base("gate", 1200, 260, 36, 240));
  return result;
}
export type ChapterBody = { x: number; y: number; vx: number; vy: number; grounded: boolean; coyote: number; jumpBuffer: number; facing: -1 | 1; support: string | null };
export const initialChapterBody = (checkpoint = false): ChapterBody => ({ x: checkpoint ? 510 : 100, y: CHAPTER_GROUND - CHAPTER_PLAYER_HEIGHT, vx: 0, vy: 0, grounded: true, coyote: .12, jumpBuffer: 0, facing: 1, support: "start" });
export type ChapterInput = { direction: -1 | 0 | 1; jump: boolean };
export function stepChapterBody(body: ChapterBody, input: ChapterInput, mission: ChapterMissionId, program: ChapterProgram | null, time: number, seconds: number): ChapterBody {
  const dt = Math.max(0, Math.min(seconds, 1 / 30)); if (!dt) return body;
  const next = { ...body, coyote: body.grounded ? .13 : Math.max(0, body.coyote - dt), jumpBuffer: input.jump ? .15 : Math.max(0, body.jumpBuffer - dt) };
  const platforms = chapterPlatforms(mission, program, time);
  if (body.support === "lift") { const oldLift = chapterPlatforms(mission, program, time - dt).find(item => item.id === "lift"); const lift = platforms.find(item => item.id === "lift"); if (oldLift && lift) next.y += lift.y - oldLift.y; }
  const target = input.direction * 270, acceleration = body.grounded ? 2200 : 1450;
  next.vx += Math.max(-acceleration * dt, Math.min(acceleration * dt, target - next.vx));
  if (input.direction) next.facing = input.direction;
  if (next.jumpBuffer > 0 && next.coyote > 0) { next.vy = -490; next.grounded = false; next.coyote = 0; next.jumpBuffer = 0; next.support = null; }
  next.x = Math.max(0, Math.min(CHAPTER_WORLD_WIDTH - CHAPTER_PLAYER_WIDTH, next.x + next.vx * dt));
  for (const platform of platforms) if (next.y + CHAPTER_PLAYER_HEIGHT > platform.y + 3 && next.y < platform.y + platform.height - 3) {
    if (body.x + CHAPTER_PLAYER_WIDTH <= platform.x + .5 && next.x + CHAPTER_PLAYER_WIDTH > platform.x) { next.x = platform.x - CHAPTER_PLAYER_WIDTH; next.vx = 0; }
    else if (body.x >= platform.x + platform.width - .5 && next.x < platform.x + platform.width) { next.x = platform.x + platform.width; next.vx = 0; }
  }
  const previousFeet = next.y + CHAPTER_PLAYER_HEIGHT;
  next.vy = Math.min(800, next.vy + 1120 * dt); next.y += next.vy * dt; next.grounded = false; next.support = null;
  if (next.vy >= 0) for (const platform of platforms) {
    if (next.x + CHAPTER_PLAYER_WIDTH - 3 > platform.x && next.x + 3 < platform.x + platform.width && previousFeet <= platform.y + 3 && next.y + CHAPTER_PLAYER_HEIGHT >= platform.y) { next.y = platform.y - CHAPTER_PLAYER_HEIGHT; next.vy = 0; next.grounded = true; next.support = platform.id; break; }
  }
  return next;
}
