/** Methods are prepared here and executed in the learner's real .NET project.
 * This module has no browser runner, compiler, reward or server integration. */
export const CSHARP_METHODS_UNIT_ID = "orbiservicos-methods-v1";
export const CSHARP_METHODS_MAX_CODE = 100000;
export const CSHARP_METHODS_MAX_FILE_BYTES = 100000;
const MAX_SAVE_CHARACTERS = 2500000;
const DRAFT_FORMAT = "orbitamos-csharp-methods-draft";

export type CSharpMethodsActivityId = "guided" | "reuse" | "debug" | "independent";
export type CSharpMethodsPreparationId = "computer" | "sdk" | "files" | "terminal" | "git";
export type CSharpMethodsPrediction = { id: string; prompt: string; options: readonly string[]; answer: number; feedback: readonly string[] };
export type CSharpMethodsCase = { label: string; inputs: string; expected: string };
export type CSharpMethodsActivity = {
  id: CSharpMethodsActivityId;
  title: string;
  context: string;
  goal: string;
  support: "guided" | "partial" | "debug" | "independent";
  projectPath: string;
  starter: string;
  reference?: string;
  instructions: readonly string[];
  hints: readonly string[];
  cases: readonly CSharpMethodsCase[];
  expectedOutput: string;
  prediction?: CSharpMethodsPrediction;
  reflection: string;
};

export const csharpMethodsUnit = {
  id: CSHARP_METHODS_UNIT_ID,
  title: "Uma regra que você pode reutilizar",
  goal: "Dê nome ao cálculo de pendências, chame a mesma regra com outros dados e leve seu programa para um projeto .NET.",
  targetFramework: "net10.0",
  downloadHref: "/downloads/academy/orbiservicos-metodos-v1.zip",
  packageName: "orbiservicos-metodos-v1.zip",
  runtimeNotice: "Aqui você pode entender, prever e preparar seu código, inclusive no celular. Métodos não são executados pelo laboratório atual: a execução desta unidade acontece no computador com SDK .NET 10.",
  executionNotice: "Marcar que executou no computador registra sua declaração. A Orbitamos não conferiu a compilação nem o resultado dessa execução.",
  validInputs: "Nesta unidade, use quantidades válidas: total e concluídos não negativos, com concluídos menor ou igual ao total. Tratar entradas inválidas será outra prática.",
  prerequisites: ["Criar e alterar uma variável int.", "Calcular uma diferença e ler uma condição bool.", "Distinguir um número de um texto entre aspas."],
  bridge: [
    { id: "computer", title: "Escolha onde executar", detail: "No celular, prepare e guarde o rascunho. Para executar, retome num computador próprio ou em um ambiente .NET adequado; não há compilador remoto ativado aqui.", command: null },
    { id: "sdk", title: "Confira o SDK", detail: "Abra o terminal na pasta de estudo e confira que há um SDK .NET 10 suportado e que ele está selecionado. Mostrar a versão é diferente de instalar ou compilar.", command: "dotnet --version" },
    { id: "files", title: "Abra o projeto de estudo", detail: "Extraia o pacote numa pasta separada do site da Orbitamos. Program.cs recebe o código; o arquivo .csproj descreve o projeto e usa net10.0. bin e obj são gerados e não devem ir para o Git.", command: null },
    { id: "terminal", title: "Salve e execute de novo", detail: "Abra o terminal na pasta raiz do pacote extraído e salve o Program.cs da primeira tarefa. Este comando compila e roda esse projeto. Depois de editar, execute novamente; um resultado antigo não confere o código novo. O guia do pacote informa o caminho das próximas tarefas.", command: "dotnet run --project tarefas/01-primeira-regra/OrbiServicos.Console.csproj" },
    { id: "git", title: "Veja o que mudou", detail: "No repositório de estudo, confira os arquivos e seu diff antes de um commit local. Commit guarda uma mudança no histórico; não publica este site. As instruções do pacote orientam o primeiro repositório sem alterar a configuração global.", command: "git diff" },
  ] as const,
} as const;

export const csharpMethodsFlow = {
  call: "CalcularPendentes(8, 3)",
  arguments: [{ value: "8", parameter: "total" }, { value: "3", parameter: "concluidos" }],
  calculation: "total - concluidos",
  returnValue: "5",
  consumer: "pendentes",
  output: "Console.WriteLine(pendentes);",
  note: "A chamada entrega 8 e 3 às entradas com nome. A regra calcula 8 - 3. return devolve 5 ao lugar da chamada; Console.WriteLine mostra esse valor depois. Retornar e mostrar são ações diferentes.",
} as const;

const guidedReference = 'int pendentes = CalcularPendentes(8, 3);\nConsole.WriteLine(pendentes);\n\nint CalcularPendentes(int total, int concluidos)\n{\n    return total - concluidos;\n}';
const signatureStarter = 'int CalcularPendentes(int total, int concluidos)\n{\n\n}';
const fixedReturnBug = 'Console.WriteLine(CalcularPendentes(8, 3));\nConsole.WriteLine(CalcularPendentes(5, 5));\nConsole.WriteLine(CalcularPendentes(0, 0));\n\nint CalcularPendentes(int total, int concluidos)\n{\n    return 5;\n}';
const repeatedCases: readonly CSharpMethodsCase[] = [
  { label: "Há trabalho", inputs: "CalcularPendentes(8, 3)", expected: "5" },
  { label: "Tudo concluído", inputs: "CalcularPendentes(5, 5)", expected: "0" },
  { label: "Fila vazia", inputs: "CalcularPendentes(0, 0)", expected: "0" },
];

export const csharpMethodsActivities: readonly CSharpMethodsActivity[] = [
  {
    id: "guided", title: "A regra ganhou um nome", support: "guided",
    projectPath: "tarefas/01-primeira-regra/OrbiServicos.Console.csproj",
    context: "A OrbiServiços tem oito serviços e concluiu três. Em vez de copiar a conta para cada cliente, vamos dar um nome a essa regra.",
    goal: "Relacionar os valores da chamada às entradas e distinguir retorno de saída no console.",
    starter: guidedReference, reference: guidedReference,
    instructions: ["Escreva o exemplo por partes no rascunho ou no Program.cs do pacote. Primeiro observe a chamada; depois encontre a regra que ela usa.", "Acompanhe o caminho 8 → total, 3 → concluidos, 5 → retorno. Execute no computador e compare com a primeira saída esperada.", "Faça a previsão abaixo. Só depois altere o segundo valor da chamada para 5, salve e execute novamente no computador."],
    hints: ["O nome na chamada procura a regra com o mesmo nome. Os valores entram na ordem dos nomes entre parênteses.", "A linha com return devolve o resultado da subtração. A chamada de Console.WriteLine é que mostra o valor."],
    cases: [{ label: "Primeira execução", inputs: "CalcularPendentes(8, 3)", expected: "5" }, { label: "Outro segundo valor", inputs: "CalcularPendentes(8, 5)", expected: "3" }],
    expectedOutput: "5",
    prediction: { id: "guided-return", prompt: "Sem executar ainda: que valor CalcularPendentes(8, 5) devolve?", options: ["5", "3", "13"], answer: 1, feedback: ["5 foi o resultado para 8 e 3. Agora a segunda entrada mudou: acompanhe 8 menos 5.", "Isso: 8 menos 5 devolve 3. A previsão ajuda a pensar; só o .NET no computador executa este programa.", "Essa regra subtrai, não soma. Releia a operação depois de return."] },
    reflection: "Qual linha devolve um valor e qual linha faz esse valor aparecer no console?",
  },
  {
    id: "reuse", title: "Uma regra, três clientes", support: "partial",
    projectPath: "tarefas/02-tres-clientes/OrbiServicos.Console.csproj",
    context: "O atendimento precisa da mesma conta para três situações. A função deve existir uma vez; os dados mudam nas chamadas.",
    goal: "Reutilizar a regra com outros argumentos sem reescrever seu corpo para cada cliente.",
    starter: signatureStarter,
    instructions: ["Use os três pares da tabela. Escreva uma única função e três chamadas que mostrem os resultados.", "O modelo completo fica na atividade anterior. Aqui você pode pedir uma pista por vez ou usar apenas a assinatura inicial.", "Leve o rascunho ao Program.cs, salve e execute no computador. Compare cada linha com o caso correspondente."],
    hints: ["Cada chamada precisa receber o total e os concluídos daquele caso, na mesma ordem da assinatura.", "O corpo usa as entradas com nome para calcular o que falta, em vez de guardar uma resposta fixa.", "O resultado sai da função com return; use uma chamada de saída para mostrar o resultado de cada chamada."],
    cases: repeatedCases, expectedOutput: "5\n0\n0",
    prediction: { id: "reuse-argument", prompt: "O total de outro cliente mudou. Onde você altera o valor que entra, mantendo a mesma regra?", options: ["Troco o corpo da função para cada cliente", "Troco o valor na chamada da função", "Troco a resposta por um número fixo"], answer: 1, feedback: ["Isso duplicaria a regra. Uma função pode receber outros valores sem mudar seu corpo.", "Certo. A chamada entrega novos valores às entradas da mesma regra.", "Um número fixo não acompanha os dados do próximo cliente."] },
    reflection: "Por que três chamadas não precisam de três cópias da função?",
  },
  {
    id: "debug", title: "Passou uma vez, mas está errado", support: "debug",
    projectPath: "tarefas/03-investigue-o-bug/OrbiServicos.Console.csproj",
    context: "O código preparado devolve 5 para todo mundo. A primeira situação parece certa, mas a fila concluída e a vazia revelam o problema.",
    goal: "Investigar uma regra que pode compilar e ainda devolver o resultado errado.",
    starter: fixedReturnBug,
    instructions: ["Use o bug preparado se quiser começar pela investigação. Execute no computador e compare as três linhas com a tabela, sem apagar as chamadas que revelam a falha.", "Marque a linha do retorno no depurador, se disponível. Observe as duas entradas em chamadas diferentes; você também pode acompanhá-las no papel.", "Corrija a regra, salve e execute novamente os três casos. Veja no diff o que mudou e escreva uma explicação curta."],
    hints: ["Uma função pode executar sem erro de compilação e ainda não cumprir o pedido. Confira também os casos que deveriam devolver zero.", "Observe o que está depois de return. Esse resultado acompanha as entradas com nome ou continua igual para todo mundo?"],
    cases: repeatedCases, expectedOutput: "5\n0\n0",
    prediction: { id: "debug-fixed", prompt: "No bug preparado, o que a chamada CalcularPendentes(5, 5) devolve antes de você corrigir?", options: ["0, porque os valores são iguais", "5, porque o retorno está fixo", "Não existe resultado porque toda regra errada deixa de compilar"], answer: 1, feedback: ["Esse seria o resultado da regra correta. Leia o retorno que está no bug preparado.", "Isso. O código devolve o 5 escrito no retorno, mesmo quando as entradas mudam. Compare no computador antes e depois da correção.", "Uma falha de regra não precisa ser uma falha de compilação. Por isso comparamos casos diferentes."] },
    reflection: "Por que o primeiro resultado parecia certo? O que passou a depender das entradas depois da sua correção?",
  },
  {
    id: "independent", title: "Quem pode começar o trabalho?", support: "independent",
    projectPath: "tarefas/04-painel-independente/OrbiServicos.Console.csproj",
    context: "O atendimento só pode iniciar quando há serviço pendente e o pagamento foi confirmado. Sem pendências não existe trabalho novo para liberar.",
    goal: "Combinar a conta já conhecida com uma regra nova que devolve bool.",
    starter: "",
    instructions: ['Reutilize CalcularPendentes e crie bool PodeIniciar(int pendentes, bool pago). Faça sua tentativa sem um programa pronto.', "Para Nina, use total 12, concluídos 4 e pagamento confirmado. Para Leo, 5, 5 e pagamento confirmado. Para Bia, 4, 1 e pagamento ausente.", "Mostre nome, pendências e decisão nessa ordem para cada pessoa. No console C# real, booleanos aparecem como True e False.", "Salve e execute no computador. Depois tente também pendência zero com pagamento ausente, explique a regra e confira seu diff antes de um commit no repositório de estudo."],
    hints: ["A função nova não precisa mostrar uma mensagem: ela devolve uma decisão. A saída pode ser feita por quem chamou a função.", "As duas exigências precisam ser verdadeiras ao mesmo tempo: ainda há trabalho e o pagamento está confirmado."],
    cases: [{ label: "Nina: há trabalho e pagamento", inputs: "total 12, concluídos 4, pago true", expected: "Nina\n8\nTrue" }, { label: "Leo: tudo concluído", inputs: "total 5, concluídos 5, pago true", expected: "Leo\n0\nFalse" }, { label: "Bia: pagamento ausente", inputs: "total 4, concluídos 1, pago false", expected: "Bia\n3\nFalse" }, { label: "Variação da decisão", inputs: "PodeIniciar(0, false)", expected: "False" }],
    expectedOutput: "Nina\n8\nTrue\nLeo\n0\nFalse\nBia\n3\nFalse",
    reflection: "O que faz o retorno ser bool? Explique uma alteração dos argumentos e por que a decisão mudou ou continuou igual.",
  },
];

const activityIds = new Set(csharpMethodsActivities.map(activity => activity.id));
const preparationIds = new Set<string>(csharpMethodsUnit.bridge.map(step => step.id));
const predictions = csharpMethodsActivities.flatMap(activity => activity.prediction ? [activity.prediction] : []);
const isActivityId = (value: unknown): value is CSharpMethodsActivityId => typeof value === "string" && activityIds.has(value as CSharpMethodsActivityId);
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const owns = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
const validTime = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= Date.now() + 300000;

/** Reject structural prototype keys, while leaving those words inside code alone. */
function parseMethodsJson(raw: string): unknown {
  return JSON.parse(raw, (key, value: unknown) => {
    if (key === "__proto__" || key === "prototype" || key === "constructor") throw new Error("Invalid structural key");
    return value;
  });
}

export type CSharpMethodsProgress = {
  version: 1;
  unitId: typeof CSHARP_METHODS_UNIT_ID;
  view: "bridge" | "activity";
  active: CSharpMethodsActivityId;
  preparation: CSharpMethodsPreparationId[];
  predictions: Record<string, number>;
  drafts: Partial<Record<CSharpMethodsActivityId, string>>;
  hintsShown: Partial<Record<CSharpMethodsActivityId, number>>;
  modelViewed: Partial<Record<CSharpMethodsActivityId, true>>;
  selfReportedRuns: Partial<Record<CSharpMethodsActivityId, { kind: "self-report"; at: number }>>;
};

export const csharpMethodsKey = (userId: string | number) => `orbitamos-csharp-methods-prep-v1-${typeof userId}:${encodeURIComponent(String(userId))}`;
export const newCSharpMethodsProgress = (): CSharpMethodsProgress => ({ version: 1, unitId: CSHARP_METHODS_UNIT_ID, view: "bridge", active: "guided", preparation: [], predictions: {}, drafts: {}, hintsShown: {}, modelViewed: {}, selfReportedRuns: {} });

export function readCSharpMethodsProgress(raw: string | null): CSharpMethodsProgress {
  const state = newCSharpMethodsProgress();
  if (!raw || raw.length > MAX_SAVE_CHARACTERS) return state;
  try {
    const value = parseMethodsJson(raw);
    if (!isRecord(value) || !owns(value, "version") || value.version !== 1 || !owns(value, "unitId") || value.unitId !== CSHARP_METHODS_UNIT_ID) return state;
    state.view = value.view === "activity" ? "activity" : "bridge";
    state.active = isActivityId(value.active) ? value.active : "guided";
    if (Array.isArray(value.preparation)) state.preparation = [...new Set(value.preparation.filter((id): id is CSharpMethodsPreparationId => typeof id === "string" && preparationIds.has(id)))];
    for (const activity of csharpMethodsActivities) {
      if (isRecord(value.drafts) && owns(value.drafts, activity.id)) {
        const draft = value.drafts[activity.id];
        if (typeof draft === "string" && draft.length <= CSHARP_METHODS_MAX_CODE) state.drafts[activity.id] = draft;
      }
      if (isRecord(value.hintsShown) && owns(value.hintsShown, activity.id)) {
        const count = value.hintsShown[activity.id];
        if (typeof count === "number" && Number.isInteger(count) && count >= 0) state.hintsShown[activity.id] = Math.min(activity.hints.length, count);
      }
      if (isRecord(value.modelViewed) && owns(value.modelViewed, activity.id) && value.modelViewed[activity.id] === true && activity.reference) state.modelViewed[activity.id] = true;
      if (isRecord(value.selfReportedRuns) && owns(value.selfReportedRuns, activity.id)) {
        const declaration = value.selfReportedRuns[activity.id];
        if (state.drafts[activity.id]?.trim() && isRecord(declaration) && Object.keys(declaration).length === 2 && owns(declaration, "kind") && declaration.kind === "self-report" && owns(declaration, "at") && validTime(declaration.at)) state.selfReportedRuns[activity.id] = { kind: "self-report", at: declaration.at };
      }
    }
    for (const prediction of predictions) {
      if (!isRecord(value.predictions) || !owns(value.predictions, prediction.id)) continue;
      const answer = value.predictions[prediction.id];
      if (typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < prediction.options.length) state.predictions[prediction.id] = answer;
    }
    return state;
  } catch { return state; }
}

/** Only local preparation: these checkboxes do not inspect the learner's PC. */
export function setCSharpMethodsPreparation(state: CSharpMethodsProgress, id: CSharpMethodsPreparationId, checked: boolean): CSharpMethodsProgress {
  if (!preparationIds.has(id) || typeof checked !== "boolean") return state;
  return { ...state, preparation: [...state.preparation.filter(item => item !== id), ...(checked ? [id] : [])] };
}

export function setCSharpMethodsDraft(state: CSharpMethodsProgress, id: CSharpMethodsActivityId, text: string): CSharpMethodsProgress {
  if (!isActivityId(id) || typeof text !== "string" || text.length > CSHARP_METHODS_MAX_CODE || state.drafts[id] === text) return state;
  const selfReportedRuns = { ...state.selfReportedRuns };
  delete selfReportedRuns[id];
  return { ...state, drafts: { ...state.drafts, [id]: text }, selfReportedRuns };
}

/** Reset the text, not the history of help already consulted for this task. */
export function resetCSharpMethodsDraft(state: CSharpMethodsProgress, id: CSharpMethodsActivityId): CSharpMethodsProgress {
  if (!isActivityId(id)) return state;
  const drafts = { ...state.drafts };
  const selfReportedRuns = { ...state.selfReportedRuns };
  delete drafts[id];
  delete selfReportedRuns[id];
  return { ...state, drafts, selfReportedRuns };
}

export function revealCSharpMethodsHint(state: CSharpMethodsProgress, id: CSharpMethodsActivityId): CSharpMethodsProgress {
  const activity = csharpMethodsActivities.find(item => item.id === id);
  if (!activity) return state;
  return { ...state, hintsShown: { ...state.hintsShown, [id]: Math.min(activity.hints.length, (state.hintsShown[id] ?? 0) + 1) } };
}

export function markCSharpMethodsModel(state: CSharpMethodsProgress, id: CSharpMethodsActivityId): CSharpMethodsProgress {
  if (!csharpMethodsActivities.find(activity => activity.id === id)?.reference) return state;
  return { ...state, modelViewed: { ...state.modelViewed, [id]: true } };
}

export function answerCSharpMethodsPrediction(state: CSharpMethodsProgress, id: string, answer: number): CSharpMethodsProgress {
  const prediction = predictions.find(item => item.id === id);
  if (!prediction || !Number.isInteger(answer) || answer < 0 || answer >= prediction.options.length) return state;
  return { ...state, predictions: { ...state.predictions, [id]: answer } };
}

/** A student's statement, never evidence that a compiler or teacher checked it. */
export function declareCSharpMethodsRun(state: CSharpMethodsProgress, id: CSharpMethodsActivityId, at = Date.now()): CSharpMethodsProgress {
  if (!isActivityId(id) || !state.drafts[id]?.trim() || !validTime(at)) return state;
  return { ...state, selfReportedRuns: { ...state.selfReportedRuns, [id]: { kind: "self-report", at } } };
}

/** Correct an accidental declaration without discarding the student's work. */
export function clearCSharpMethodsRun(state: CSharpMethodsProgress, id: CSharpMethodsActivityId): CSharpMethodsProgress {
  if (!isActivityId(id) || !state.selfReportedRuns[id]) return state;
  const selfReportedRuns = { ...state.selfReportedRuns };
  delete selfReportedRuns[id];
  return { ...state, selfReportedRuns };
}

export function summarizeCSharpMethodsPreparation(state: CSharpMethodsProgress) {
  return {
    preparationItems: state.preparation.length,
    predictionsAnswered: predictions.filter(prediction => state.predictions[prediction.id] !== undefined).length,
    draftsWritten: csharpMethodsActivities.filter(activity => !!state.drafts[activity.id]?.trim()).length,
    activitiesWithHelp: csharpMethodsActivities.filter(activity => (state.hintsShown[activity.id] ?? 0) > 0 || state.modelViewed[activity.id]).length,
    selfReportedRuns: csharpMethodsActivities.filter(activity => !!state.selfReportedRuns[activity.id]).length,
    executionEvidence: "self-report-only" as const,
    executionLabel: "Execuções declaradas pelo aluno, sem verificação automática",
  };
}

type DraftExport = { ok: true; filename: string; content: string } | { ok: false; error: string };
type DraftImport = { ok: true; progress: CSharpMethodsProgress; activityId: CSharpMethodsActivityId; replacesExisting: boolean } | { ok: false; error: string };
const fileSize = (text: string) => new TextEncoder().encode(text).byteLength;

/** The envelope carries one text only, not a raw save or the account identity. */
export function exportCSharpMethodsDraft(state: CSharpMethodsProgress, id: CSharpMethodsActivityId): DraftExport {
  const text = state.drafts[id];
  if (!isActivityId(id) || typeof text !== "string" || !text.trim() || text.length > CSHARP_METHODS_MAX_CODE) return { ok: false, error: "Escreva um rascunho desta atividade antes de exportar." };
  const content = JSON.stringify({ format: DRAFT_FORMAT, version: 1, unitId: CSHARP_METHODS_UNIT_ID, activityId: id, filename: "Program.cs", text }, null, 2);
  if (fileSize(content) > CSHARP_METHODS_MAX_FILE_BYTES) return { ok: false, error: "Este arquivo de rascunho ultrapassa 100 KB. Seu texto foi preservado; você pode copiá-lo diretamente." };
  return { ok: true, filename: `orbiservicos-metodos-${id}.json`, content };
}

/** Pure preview: callers must confirm conflicts and persist for the current account. */
export function importCSharpMethodsDraft(state: CSharpMethodsProgress, raw: string): DraftImport {
  if (typeof raw !== "string" || raw.length > CSHARP_METHODS_MAX_FILE_BYTES || fileSize(raw) > CSHARP_METHODS_MAX_FILE_BYTES) return { ok: false, error: "Escolha um arquivo de rascunho de até 100 KB." };
  try {
    const value = parseMethodsJson(raw);
    if (!isRecord(value) || Object.keys(value).length !== 6 || !["format", "version", "unitId", "activityId", "filename", "text"].every(key => owns(value, key)) || value.format !== DRAFT_FORMAT || value.version !== 1 || value.unitId !== CSHARP_METHODS_UNIT_ID || !isActivityId(value.activityId) || value.filename !== "Program.cs" || typeof value.text !== "string" || value.text.length > CSHARP_METHODS_MAX_CODE) return { ok: false, error: "Este arquivo não é um rascunho compatível desta unidade de métodos." };
    const id = value.activityId;
    const progress = setCSharpMethodsDraft(state, id, value.text);
    const selfReportedRuns = { ...progress.selfReportedRuns };
    delete selfReportedRuns[id];
    return { ok: true, activityId: id, replacesExisting: !!state.drafts[id]?.trim() && state.drafts[id] !== value.text, progress: { ...progress, selfReportedRuns, view: "activity", active: id } };
  } catch { return { ok: false, error: "Não foi possível ler este arquivo. Seus rascunhos atuais continuam intactos." }; }
}
