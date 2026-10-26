import { questKey, readQuest, questSteps } from "./sqlQuest";
import { readVillageSave, villageLevels, villageStorageKey } from "./vilaDosBlocos";
import { fasesMonteCodigo, JOGO_STORAGE_PREFIX } from "./jogoMonteCodigo";
import { niveisGuiaOrbi } from "./jogoGuiaOrbi";
import { academyPreviewHref } from "./portalNavigation";

export const activityIds = ["sql", "delivery", "english", "village", "orbi", "assembly"] as const;
export type ActivityId = typeof activityIds[number];
export type Activity = { id: ActivityId; title: string; kind: string; goal: string; description: string; skill: string; codeSlug: string; route: string; preview: string; color: string };
export const practiceActivities: Activity[] = [
  { id: "sql", title: "A loja do Orbi", kind: "Aventura guiada", goal: "dados", description: "Encontre os produtos que estão acabando e escreva suas primeiras consultas.", skill: "Linhas, colunas e filtros", codeSlug: "dicionarios-python", route: "/estudante/trilhas/sql", preview: "/dev/academy-preview?activity=sql", color: "sage" },
  { id: "delivery", title: "Entrega do Orbi", kind: "Jogo de plataforma", goal: "logica", description: "Pule, explore e descubra como valores e condições mudam o movimento.", skill: "Variáveis e condições", codeSlug: "variaveis-js", route: "/estudante/jogos/entregas-do-orbi", preview: "/dev/academy-preview?activity=delivery", color: "blue" },
  { id: "english", title: "Inglês em cena", kind: "Imagens e palavras", goal: "ingles", description: "Reconheça arquivos, leia um erro e descubra o inglês que aparece no código.", skill: "Vocabulário em contexto", codeSlug: "variaveis-js", route: "/estudante/jogos/ingles-em-cena", preview: "/dev/academy-preview?activity=english", color: "peach" },
  { id: "village", title: "Vila dos Blocos", kind: "Quebra-cabeça com história", goal: "logica", description: "Salve o festival enquanto descobre onde símbolos e espaços fazem diferença.", skill: "Sintaxe e indentação", codeSlug: "condicionais-python", route: "/estudante/jogos/vila-dos-blocos", preview: "/dev/academy-preview?activity=village", color: "sand" },
  { id: "orbi", title: "Guia o Orbi", kind: "Planejamento visual", goal: "logica", description: "Planeje uma rota, acompanhe cada comando e corrija o caminho.", skill: "Sequências e repetição", codeSlug: "lacos-js", route: "/estudante/jogos/orbi", preview: "/dev/orbi-preview/decolagem?from=academy", color: "night" },
  { id: "assembly", title: "Monte o Código", kind: "Programa em peças", goal: "codigo", description: "Organize linhas e preveja o resultado antes de escrever seu próprio programa.", skill: "Leitura e ordem do código", codeSlug: "variaveis-js", route: "/estudante/jogos/ola-orbi-js", preview: "/dev/monte-codigo-preview/ola-orbi-js?from=academy", color: "lilac" },
];
/** Resume the first unfinished authored phase using the existing game saves. */
export function practiceDestination(id: ActivityId, userId: string, read: (key: string) => string | null, preview = false): string {
  const activity = practiceActivities.find(item => item.id === id)!;
  if (id !== "orbi" && id !== "assembly") return preview ? activity.preview : activity.route;
  const phases = id === "orbi" ? niveisGuiaOrbi : fasesMonteCodigo;
  const prefix = id === "orbi" ? "orbitamos-jogo-orbi" : JOGO_STORAGE_PREFIX;
  const phase = phases.find(item => {
    try { return JSON.parse(read(`${prefix}-${userId}-${item.slug}`) ?? "null")?.concluido !== true; } catch { return true; }
  }) ?? phases[0];
  const root = preview ? id === "orbi" ? "/dev/orbi-preview" : "/dev/monte-codigo-preview" : id === "orbi" ? "/estudante/jogos/orbi" : "/estudante/jogos";
  return `${root}/${phase.slug}${preview ? "?from=academy" : ""}`;
}
export type ActivityRecord = { openedAt?: number; completedAt?: number; reviewedAt?: number; dueAt?: number; reviews: number };
export type PracticeJournal = { version: 1; activities: Partial<Record<ActivityId, ActivityRecord>> };
export const journalKey = (userId: string) => `orbitamos-practice-journal-v1-${userId}`;
export const emptyJournal = (): PracticeJournal => ({ version: 1, activities: {} });
export function isActivityId(id: unknown): id is ActivityId { return typeof id === "string" && activityIds.includes(id as ActivityId); }
export function readJournal(raw: string | null): PracticeJournal {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 1 || !value.activities || typeof value.activities !== "object" || Array.isArray(value.activities)) return emptyJournal();
    const activities: PracticeJournal["activities"] = {};
    for (const id of activityIds) {
      const record = value.activities[id];
      if (!record || !Number.isInteger(record.reviews) || record.reviews < 0 || record.reviews > 100) continue;
      const next: ActivityRecord = { reviews: record.reviews };
      for (const field of ["openedAt", "completedAt", "reviewedAt", "dueAt"] as const) if (typeof record[field] === "number" && Number.isFinite(record[field]) && record[field] > 0 && record[field] <= 8640000000000000) next[field] = record[field];
      activities[id] = next;
    }
    return { version: 1, activities };
  } catch { return emptyJournal(); }
}
export function recordPractice(journal: PracticeJournal, id: ActivityId, event: "open" | "complete" | "review", now = Date.now()): PracticeJournal {
  const current = journal.activities[id] ?? { reviews: 0 };
  const next = { ...current };
  if (event === "open") next.openedAt = now;
  if (event === "complete" && !next.completedAt) { next.completedAt = now; next.dueAt = now + 86400000; }
  if (event === "review") { next.reviews = Math.min(current.reviews + 1, 100); next.reviewedAt = now; next.dueAt = now + [3, 7, 14, 30][Math.min(next.reviews - 1, 3)] * 86400000; }
  return { version: 1, activities: { ...journal.activities, [id]: next } };
}
export function persistPractice(userId: string, id: ActivityId, event: "open" | "complete" | "review"): boolean {
  try {
    const next = recordPractice(readJournal(localStorage.getItem(journalKey(userId))), id, event);
    localStorage.setItem(journalKey(userId), JSON.stringify(next));
    window.dispatchEvent(new Event("orbitamos-practice-updated"));
    return true;
  } catch { return false; }
}
/** Read old saves; never rewrite or reinterpret visits as learning evidence. */
export function activityCompletion(userId: string, read: (key: string) => string | null): Record<ActivityId, boolean> {
  const journal = readJournal(read(journalKey(userId)));
  const legacyDone = (prefix: string, slug: string) => { try { return JSON.parse(read(`${prefix}-${userId}-${slug}`) ?? "null")?.concluido === true; } catch { return false; } };
  return {
    sql: !!journal.activities.sql?.completedAt || readQuest(read(questKey(userId))).step === questSteps.length,
    village: readVillageSave(read(villageStorageKey(userId))).completed.length === villageLevels.length,
    assembly: fasesMonteCodigo.every(f => legacyDone(JOGO_STORAGE_PREFIX, f.slug)),
    orbi: niveisGuiaOrbi.every(f => legacyDone("orbitamos-jogo-orbi", f.slug)),
    delivery: !!journal.activities.delivery?.completedAt,
    english: !!journal.activities.english?.completedAt,
  };
}
export function recommendActivity(journal: PracticeJournal, completed: Record<ActivityId, boolean>): ActivityId {
  const resume = activityIds.filter(id => journal.activities[id]?.openedAt && !completed[id]).sort((a, b) => (journal.activities[b]?.openedAt ?? 0) - (journal.activities[a]?.openedAt ?? 0))[0];
  return resume ?? activityIds.find(id => !completed[id]) ?? "sql";
}
const assemblyTargets: Record<string, string> = { "ola-orbi-js": "variaveis-js", "par-ou-impar-js": "condicionais-js", "contagem-js": "lacos-js", "funcao-dobro-js": "funcoes-js", "lista-compras-js": "arrays-js", "media-notas-js": "operadores-js", "ola-python": "variaveis-python", "maior-idade-python": "condicionais-python", "contagem-python": "lacos-python", "funcao-python": "funcoes-python", "lista-python": "listas-python", "media-python": "lacos-python" };
const villageTargets: Record<string, string> = { correio: "variaveis-python", mochila: "listas-python", "primeiro-item": "arrays-js", abrigo: "condicionais-js", csharp: "variaveis-csharp", "cora-python": "dicionarios-python", "quatro-passos": "condicionais-python", lanternas: "lacos-python", "duas-portas": "lacos-python", "festa-sem-chuva": "condicionais-python" };
const orbiTargets: Record<string, string> = { decolagem: "variaveis-js", "funcao-f": "funcoes-js", "escada-de-f": "funcoes-js", "orbita-infinita": "recursao-js" };
export function bridgeTarget(activity: ActivityId, unit?: string, preview = false) {
  if (activity === "sql") return preview ? "/dev/academy-preview?activity=sql&mode=workshop" : "/estudante/trilhas/sql?mode=workshop";
  const slug = (activity === "assembly" ? assemblyTargets[unit ?? ""] : activity === "village" ? villageTargets[unit ?? ""] : activity === "orbi" ? orbiTargets[unit ?? ""] : null) ?? practiceActivities.find(a => a.id === activity)!.codeSlug;
  const href = `/estudante/pratica/${slug}?from=${activity}`;
  return preview ? academyPreviewHref(href) : href;
}
export type ReviewQuestion = { id: string; activity: ActivityId; prompt: string; code?: string; choices: string[]; answer: string; explanation: string };
export const reviewQuestions: ReviewQuestion[] = [
  { id: "sql-filter", activity: "sql", prompt: "O estoque é 2, 6 e 9. Quais valores passam por este filtro?", code: "WHERE estoque < 6", choices: ["Somente 2", "2 e 6", "6 e 9"], answer: "Somente 2", explanation: "Menor que 6 exclui o próprio 6. A consulta não apaga os outros registros." },
  { id: "sql-source", activity: "sql", prompt: "Quero nome e cidade da tabela clientes. Qual trecho indica a origem?", code: "SELECT nome, cidade FROM clientes;", choices: ["SELECT", "FROM clientes", "nome, cidade"], answer: "FROM clientes", explanation: "FROM aponta a tabela. SELECT escolhe o que deve aparecer no resultado." },
  { id: "delivery-variable", activity: "delivery", prompt: "O Orbi avança 2 unidades por passo. Mudamos velocidade para 4. O que muda?", code: "let velocidade = 4;", choices: ["O avanço em cada passo dobra", "O pulo fica automaticamente mais alto", "Nada muda"], answer: "O avanço em cada passo dobra", explanation: "Esse valor controla o avanço horizontal neste exemplo. A altura depende de outro parâmetro." },
  { id: "delivery-condition", activity: "delivery", prompt: "Energia vale 3. A entrega pode acontecer?", code: "if (energia >= 5) { entregar(); }", choices: ["Sim", "Não"], answer: "Não", explanation: "3 não é maior ou igual a 5. O corpo desse if não executa." },
  { id: "english-error", activity: "english", prompt: "Um arquivo foi renomeado. O programa avisa file not found. Qual a primeira verificação?", choices: ["Conferir nome e caminho do arquivo", "Trocar a cor do botão", "Aumentar a velocidade do computador"], answer: "Conferir nome e caminho do arquivo", explanation: "File é arquivo; not found indica que ele não foi encontrado no caminho esperado." },
  { id: "english-output", activity: "english", prompt: "A instrução pede Check the output. O que você precisa conferir?", choices: ["O resultado produzido", "A pasta do projeto", "O teclado"], answer: "O resultado produzido", explanation: "Output é a saída produzida: por exemplo, o resultado mostrado no console." },
  { id: "village-indent", activity: "village", prompt: "Queremos mostrar Fim uma vez. Qual linha precisa ficar fora do laço?", code: 'for item in range(3):\n    print("Item")\n    print("Fim")', choices: ['print("Fim")', 'print("Item")', "for item in range(3):"], answer: 'print("Fim")', explanation: "O corpo indentado repete. Ao retirar o recuo de Fim, ele aparece uma vez depois do laço." },
  { id: "village-call", activity: "village", prompt: "Qual par envolve os argumentos de uma chamada como print?", choices: ["( )", "[ ]", "{ }"], answer: "( )", explanation: "print(...) é uma chamada. O papel de um símbolo depende de onde ele está e da linguagem." },
  { id: "orbi-sequence", activity: "orbi", prompt: "Partindo do mesmo lugar, trocar avançar → virar por virar → avançar sempre chega ao mesmo ponto?", choices: ["Não: a ordem pode mudar a rota", "Sim: só importa quantos comandos existem"], answer: "Não: a ordem pode mudar a rota", explanation: "Avançar usa a direção atual. Virar antes muda a direção usada pelo próximo avanço." },
  { id: "orbi-repeat", activity: "orbi", prompt: "Uma função executa avançar duas vezes. Chamá-la três vezes produz quantos avanços?", choices: ["2", "3", "6"], answer: "6", explanation: "Cada chamada executa os dois avanços: 2 + 2 + 2 = 6." },
  { id: "assembly-order", activity: "assembly", prompt: "Qual instrução precisa vir primeiro neste programa?", code: 'let dobro = quantidade * 2;\nlet quantidade = 4;', choices: ["Declarar quantidade", "Calcular dobro"], answer: "Declarar quantidade", explanation: "A expressão usa quantidade; com let, esse valor precisa estar inicializado antes do uso." },
  { id: "assembly-output", activity: "assembly", prompt: "O que será mostrado?", code: "let pontos = 3;\npontos = pontos + 2;\nconsole.log(pontos);", choices: ["3", "5", "32"], answer: "5", explanation: "São números: 3 + 2 resulta em 5. A atribuição atualiza pontos antes da exibição." },
];
export function reviewQueue(completed: Record<ActivityId, boolean>, journal: PracticeJournal, now = Date.now()): ReviewQuestion[] {
  const ids = activityIds.filter(id => completed[id]).sort((a, b) => (journal.activities[a]?.dueAt ?? now) - (journal.activities[b]?.dueAt ?? now));
  return ids.slice(0, 3).map(id => { const options = reviewQuestions.filter(q => q.activity === id); return options[(journal.activities[id]?.reviews ?? 0) % options.length]; });
}
