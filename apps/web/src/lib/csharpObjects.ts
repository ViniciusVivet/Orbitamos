/** Objects are prepared here and executed in the learner's real .NET 10 project.
 * Drafts, predictions, consulted help and student declarations are separate evidence. */
export const CSHARP_OBJECTS_UNIT_ID = "orbiservicos-objects-v1";
export const CSHARP_OBJECTS_MAX_CODE = 100000;
export const CSHARP_OBJECTS_MAX_FILE_BYTES = 100000;
const MAX_SAVE_CHARACTERS = 2500000;
const DRAFT_FORMAT = "orbitamos-csharp-objects-draft";

export type CSharpObjectsActivityId = "guided" | "reuse" | "debug" | "independent";
export type CSharpObjectsPreparationId = "computer" | "sdk" | "files" | "terminal" | "git";
export type CSharpObjectsPrediction = { id: string; prompt: string; options: readonly string[]; answer: number; feedback: readonly string[] };
export type CSharpObjectsCase = { label: string; inputs: string; expected: string };
export type CSharpObjectsActivity = {
  id: CSharpObjectsActivityId;
  title: string;
  context: string;
  goal: string;
  support: "guided" | "partial" | "debug" | "independent";
  projectPath: string;
  fileName: "Servico.cs" | "Program.cs";
  starter: string;
  reference?: string;
  instructions: readonly string[];
  hints: readonly string[];
  cases: readonly CSharpObjectsCase[];
  expectedOutput: string;
  prediction?: CSharpObjectsPrediction;
  reflection: string;
};

export const csharpObjectsUnit = {
  id: CSHARP_OBJECTS_UNIT_ID,
  title: "Cada serviço tem a sua ficha",
  goal: "Reúna dados e regras numa classe, crie fichas separadas e selecione os serviços que podem começar.",
  targetFramework: "net10.0",
  downloadHref: "/downloads/academy/orbiservicos-objetos-v1.zip",
  packageName: "orbiservicos-objetos-v1.zip",
  runtimeNotice: "Aqui você pode entender, prever e guardar rascunhos, inclusive no celular. Classes, objetos e listas desta unidade são executados num computador com SDK .NET 10; o laboratório do navegador não compila este projeto.",
  executionNotice: "Marcar que executou no computador registra sua declaração. A Orbitamos não conferiu a compilação nem o resultado dessa execução.",
  validInputs: "Use nomes fictícios e quantidades válidas: 0 <= concluídos <= total. As propriedades public com get e set deixam ler e alterar os valores diretamente; elas não validam os dados. Encapsulação e validação serão estudadas depois.",
  prerequisites: ["Usar uma função com parâmetros e retorno.", "Distinguir int, string e bool.", "Ler uma condição com && e acompanhar uma repetição."],
  bridge: [
    { id: "computer", title: "Escolha onde executar", detail: "No celular, guarde o rascunho e retome num computador com ambiente .NET. Não há compilador remoto ativado nesta página.", command: null },
    { id: "sdk", title: "Confira o SDK", detail: "Na pasta de estudo, confira que o SDK .NET 10 suportado está selecionado. Mostrar a versão não instala nem compila o projeto.", command: "dotnet --version" },
    { id: "files", title: "Encontre os dois arquivos", detail: "Extraia o pacote fora do site da Orbitamos. A primeira tarefa edita Servico.cs; Program.cs já chama a classe. Nas outras tarefas você edita Program.cs e recebe Servico.cs correto. O .csproj usa net10.0; bin e obj são gerados.", command: null },
    { id: "terminal", title: "Salve o arquivo certo e execute", detail: "Abra o terminal na raiz do pacote extraído. Salve Servico.cs da primeira tarefa e execute este comando. Depois de editar, salve e execute novamente; o resultado anterior não confere o código novo. Cada tarefa informa seu próprio projeto.", command: "dotnet run --project tarefas/01-primeiro-servico/OrbiServicos.Console.csproj" },
    { id: "git", title: "Leia seu diff", detail: "Use um repositório de estudo separado. Confira os arquivos e o diff antes de um commit local; não publique nem altere o repositório do site. Preserve os testes do pacote e deixe bin e obj fora do histórico.", command: "git diff" },
  ] as const,
} as const;

export const csharpObjectsFlow = {
  call: "nina.CalcularPendentes()",
  arguments: [{ value: "12", parameter: "nina.Total" }, { value: "4", parameter: "nina.Concluidos" }],
  calculation: "Total - Concluidos",
  returnValue: "8",
  consumer: "pendentes",
  output: "Console.WriteLine(nina.CalcularPendentes());",
  note: "nina é uma instância: uma ficha criada com new Servico. Os valores mostrados são propriedades dessa ficha, não argumentos desta chamada sem parâmetros. CalcularPendentes lê esses dados, devolve 8 e Console.WriteLine mostra o retorno.",
} as const;

const serviceReference = `public class Servico
{
    // Cada objeto guarda os dados de uma ficha.
    public string Cliente { get; set; }
    public int Total { get; set; }
    public int Concluidos { get; set; }
    public bool Pago { get; set; }

    // new chama este construtor para preencher a ficha.
    public Servico(string cliente, int total, int concluidos, bool pago)
    {
        Cliente = cliente;
        Total = total;
        Concluidos = concluidos;
        Pago = pago;
    }

    public int CalcularPendentes()
    {
        return Total - Concluidos;
    }

    public bool PodeIniciar()
    {
        return CalcularPendentes() > 0 && Pago;
    }
}`;
const serviceStarter = serviceReference.replace("return Total - Concluidos;", "return 0;").replace("return CalcularPendentes() > 0 && Pago;", "return false;");
const creationStarter = `Servico nina = CriarServico("Nina", 12, 4, true);
Servico leo = CriarServico("Leo", 5, 5, true);
Console.WriteLine(nina.Cliente);
Console.WriteLine(nina.CalcularPendentes());
Console.WriteLine(nina.PodeIniciar());
Console.WriteLine(leo.Cliente);
Console.WriteLine(leo.CalcularPendentes());
Console.WriteLine(leo.PodeIniciar());

Servico CriarServico(string cliente, int total, int concluidos, bool pago)
{
    // Complete o retorno de uma ficha nova com os valores recebidos.
}`;
const aliasStarter = `Servico original = new Servico("Nina", 8, 3, true);
Servico copia = CriarCopia(original);
copia.Concluidos = 5;
Console.WriteLine(original.CalcularPendentes());
Console.WriteLine(copia.CalcularPendentes());

Servico CriarCopia(Servico original)
{
    return original;
}`;

export const csharpObjectsActivities: readonly CSharpObjectsActivity[] = [
  {
    id: "guided", title: "Uma ficha reúne dados e regras", support: "guided",
    projectPath: "tarefas/01-primeiro-servico/OrbiServicos.Console.csproj", fileName: "Servico.cs",
    context: "A OrbiServiços já calcula pendências. Agora cada atendimento precisa guardar nome, quantidades e pagamento junto das regras que usam esses dados.",
    goal: "Construir a classe Servico e reconhecer a diferença entre a classe e uma ficha criada com new.",
    starter: serviceStarter, reference: serviceReference,
    instructions: ["Edite Servico.cs completo: mantenha as quatro propriedades, o construtor e os dois métodos. Program.cs já foi fornecido e cria Nina com 12 serviços, 4 concluídos e pagamento confirmado.", "Complete os retornos fixos 0 e false. CalcularPendentes devolve Total menos Concluidos; PodeIniciar exige pendências maiores que zero e Pago verdadeiro.", "Use apenas quantidades válidas: 0 <= concluídos <= total. Depois da previsão, altere os dados de Nina e observe a regra usando os novos valores.", "Salve Servico.cs e execute no SDK. Compare Nina, 8 e True; depois explique seus novos resultados e confira o diff."],
    hints: ["Um parâmetro como total é a entrada do construtor. A atribuição Total = total guarda essa entrada na propriedade da ficha que está sendo criada.", "CalcularPendentes usa os dados da própria ficha. A regra da unidade anterior continua sendo a diferença entre total e concluídos.", "PodeIniciar precisa das duas exigências ao mesmo tempo: há pendências e o pagamento foi confirmado. Ele devolve bool; não imprime sozinho."],
    cases: [{ label: "Primeira ficha", inputs: 'new Servico("Nina", 12, 4, true)', expected: "Nina\n8\nTrue" }],
    expectedOutput: "Nina\n8\nTrue",
    prediction: { id: "guided-state", prompt: "Na classe correta, se a ficha de Nina mudar Concluidos de 4 para 12, o que CalcularPendentes devolve?", options: ["8, porque foi o primeiro resultado", "0, porque o método lê o valor atual da ficha", "12, porque esse é o novo valor de Concluidos"], answer: 1, feedback: ["O método calcula de novo usando as propriedades atuais; ele não guarda a primeira resposta.", "Isso: 12 menos 12 devolve 0. Esta é uma previsão; execute a alteração no computador para observar o resultado real.", "O método devolve a diferença, não apenas uma das propriedades. Acompanhe Total menos Concluidos."] },
    reflection: "Onde os dados da ficha ficam guardados? Explique o que new cria e o que o construtor recebe.",
  },
  {
    id: "reuse", title: "Duas fichas, dois conjuntos de dados", support: "partial",
    projectPath: "tarefas/02-fichas-separadas/OrbiServicos.Console.csproj", fileName: "Program.cs",
    context: "Nina e Leo precisam de fichas diferentes. Uma função local vai criar cada ficha com os dados da chamada, sem prender os resultados aos nomes do exemplo.",
    goal: "Retornar uma nova instância a cada chamada e manter os dados de cada atendimento separados.",
    starter: creationStarter,
    instructions: ["Edite Program.cs. Servico.cs correto já foi fornecido; a sua implementação desta tarefa é a função local Servico CriarServico(string cliente, int total, int concluidos, bool pago).", "Complete a função para devolver uma instância nova usando os quatro argumentos recebidos. A assinatura sem retorno no arquivo inicial está incompleta e ainda não compila.", "Execute as chamadas fornecidas de Nina e Leo. Compare os dados e resultados de cada ficha; depois crie Bia com 4 serviços, 1 concluído e pagamento ausente.", "Confira com object.ReferenceEquals(nina, leo) que as variáveis apontam para instâncias diferentes. Essa comparação observa se é a mesma ficha, não se os valores estão iguais.", "Faça uma nova tentativa com duas fichas criadas com os mesmos dados. Altere Concluidos de apenas uma, mantendo quantidades válidas, e confira que a outra continua com o valor anterior."],
    hints: ["A função retorna Servico, não um número. O construtor da classe já sabe receber os quatro valores.", "Criar uma ficha pede new. Use os parâmetros da função; nomes ou quantidades fixas ignorariam os dados da próxima chamada.", "Duas chamadas precisam criar duas instâncias. Guardar e devolver sempre a mesma ficha mistura os atendimentos."],
    cases: [{ label: "Nina e Leo", inputs: 'CriarServico("Nina", 12, 4, true); CriarServico("Leo", 5, 5, true)', expected: "Nina\n8\nTrue\nLeo\n0\nFalse" }, { label: "Outros argumentos", inputs: 'CriarServico("Bia", 4, 1, false)', expected: "Bia\n3\nFalse" }, { label: "Identidade das fichas", inputs: "Compare duas chamadas, inclusive com dados iguais; altere somente uma ficha", expected: "object.ReferenceEquals devolve False; a outra ficha preserva seus dados" }],
    expectedOutput: "Nina\n8\nTrue\nLeo\n0\nFalse",
    prediction: { id: "reuse-instance", prompt: "Duas chamadas corretas de CriarServico recebem os mesmos dados. Se você alterar uma das fichas, o que acontece com a outra?", options: ["Muda junto porque os dados iniciais eram iguais", "Mantém seus dados porque cada chamada criou outra instância", "Deixa de existir porque apenas uma variável pode guardar Servico"], answer: 1, feedback: ["Valores iguais não tornam as duas instâncias a mesma ficha. Confira as referências e altere só uma delas.", "Isso. Cada new cria outra instância. Mesmo que os dados coincidam, alterar uma não altera automaticamente a outra.", "Várias variáveis podem apontar para objetos Servico. O cuidado é observar quais delas apontam para a mesma instância."] },
    reflection: "Qual diferença você observou entre dados iguais e a mesma instância? Por que a função precisa usar os argumentos de cada chamada?",
  },
  {
    id: "debug", title: "A cópia era a mesma ficha", support: "debug",
    projectPath: "tarefas/03-copia-emprestada/OrbiServicos.Console.csproj", fileName: "Program.cs",
    context: "O programa chama uma variável de copia, mas CriarCopia devolve original. Alterar essa cópia também muda o atendimento original: dois nomes apontam para a mesma ficha.",
    goal: "Investigar uma referência compartilhada e criar uma cópia com outra instância e os mesmos dados iniciais.",
    starter: aliasStarter,
    instructions: ["Edite Program.cs; Servico.cs correto já foi fornecido. Execute o bug preparado: após copia.Concluidos = 5, as duas linhas mostram 3.", "Antes de alterar a propriedade, observe original e copia no depurador ou compare com object.ReferenceEquals(original, copia). True significa que os dois nomes apontam para a mesma instância.", "Corrija Servico CriarCopia(Servico original) para devolver OUTRA instância preenchida com os quatro dados do original. Retornar a mesma referência não cria uma cópia independente.", "Execute novamente sem remover a alteração copia.Concluidos = 5 nem as duas saídas: o original deve continuar com 5 pendências e a cópia deve ter 3.", "Compare as referências e os dados antes da alteração: são instâncias diferentes com dados iguais. Depois altere outra propriedade válida da cópia e confira que o original permanece igual. Leia o diff."],
    hints: ["O nome de uma variável não muda o objeto. Veja se CriarCopia cria alguma ficha ou só devolve a referência que recebeu.", "Uma cópia independente precisa de outra instância. Reaproveite os valores Cliente, Total, Concluidos e Pago do original para preencher essa nova ficha.", "Confira duas coisas diferentes: os valores copiados começam iguais; object.ReferenceEquals precisa indicar False. Só mudar o texto impresso não corrige a referência compartilhada."],
    cases: [{ label: "Depois da correção", inputs: 'original Nina: 8, 3, true; copia = CriarCopia(original); copia.Concluidos = 5', expected: "5\n3" }, { label: "Antes de editar a cópia", inputs: "Compare a referência e as quatro propriedades", expected: "Instâncias diferentes; Cliente, Total, Concluidos e Pago iguais" }, { label: "Outra alteração", inputs: "Altere Pago apenas na cópia", expected: "O pagamento do original não muda" }],
    expectedOutput: "5\n3",
    prediction: { id: "debug-alias", prompt: "No bug preparado, depois de copia.Concluidos = 5, quantas pendências original.CalcularPendentes() devolve?", options: ["5, porque original nunca pode mudar", "3, porque original e copia apontam para a mesma ficha", "0, porque criar outra variável apaga os dados"], answer: 1, feedback: ["original não foi protegido de alterações. No bug, as duas variáveis apontam para o objeto que acabou de mudar.", "Isso: a alteração chegou à mesma instância. O objetivo é criar outra ficha para a cópia e preservar o original.", "Criar outra variável não apaga os dados. Investigue qual referência foi devolvida pela função."] },
    reflection: "Por que return original compilava, mas não atendia ao pedido de uma cópia independente? O que você precisou preservar e o que precisou criar de novo?",
  },
  {
    id: "independent", title: "A lista de serviços do dia", support: "independent",
    projectPath: "tarefas/04-lista-do-dia/OrbiServicos.Console.csproj", fileName: "Program.cs",
    context: "O atendimento já tem várias fichas. Prepare uma lista separada só com os serviços que têm pendências e pagamento confirmado, mantendo a ordem em que chegaram.",
    goal: "Criar outra lista com os objetos elegíveis já existentes, preservando a entrada, a ordem e as ocorrências repetidas.",
    starter: "",
    instructions: ["Edite Program.cs e implemente List<Servico> SelecionarLiberados(List<Servico> servicos). Servico.cs correto já foi fornecido: a classe é apoio desta tarefa, não uma solução da seleção. O rascunho aqui começa vazio; o pacote tem dados e saídas preparados e, inicialmente, devolve uma lista vazia sem selecionar.", "List<Servico> guarda uma sequência de fichas. Crie outra lista, use foreach para visitar cada ficha e Add para acrescentar uma ficha; não use LINQ. Inclua apenas as fichas cujo PodeIniciar() devolve true. Não mostre uma resposta fixa no lugar de montar a lista.", "Devolva OUTRA lista com as MESMAS instâncias selecionadas. Preserve a lista de entrada e seus objetos. Mantenha a ordem e cada ocorrência elegível, mesmo quando a mesma ficha aparece mais de uma vez; não remova repetições.", "Para Nina 12/4 e paga, Leo 5/5 e pago, Bia 4/1 e não paga, mostre primeiro a quantidade selecionada e depois os nomes. A saída é 1 e Nina, em linhas separadas.", "Execute também uma entrada vazia, outra ordem e uma lista em que a mesma ficha elegível aparece duas vezes. Confira as referências: a lista é nova; os elementos selecionados são as próprias fichas de entrada. Leia o diff antes do seu commit local."],
    hints: ["A lista de saída começa vazia. Percorra as fichas sem remover nada da lista recebida.", "Decida sobre cada ficha usando a regra da própria instância; quando ela puder iniciar, acrescente essa ficha à saída.", "Criar uma lista e criar uma ficha são ações diferentes. Aqui a lista é nova, mas você seleciona os objetos existentes, na ordem em que aparecem, incluindo cada repetição elegível."],
    cases: [{ label: "Painel do dia", inputs: "Nina 12/4 paga; Leo 5/5 pago; Bia 4/1 não paga", expected: "1\nNina" }, { label: "Nenhuma ficha", inputs: "Lista vazia", expected: "0" }, { label: "Ordem e repetição", inputs: "Nina elegível, Dani elegível, a mesma Nina novamente; demais fichas não elegíveis", expected: "3\nNina\nDani\nNina" }, { label: "Lista nova, fichas preservadas", inputs: "Compare referências da entrada, da saída e das fichas selecionadas", expected: "Outra lista; mesmas instâncias dos itens selecionados; entrada e propriedades preservadas" }],
    expectedOutput: "1\nNina",
    reflection: "O que você criou de novo e o que reutilizou? Explique por que uma ficha repetida aparece duas vezes e por que essa seleção não é a cópia independente da tarefa anterior.",
  },
];

const activityIds = new Set(csharpObjectsActivities.map(activity => activity.id));
const preparationIds = new Set<string>(csharpObjectsUnit.bridge.map(step => step.id));
const predictions = csharpObjectsActivities.flatMap(activity => activity.prediction ? [activity.prediction] : []);
const isActivityId = (value: unknown): value is CSharpObjectsActivityId => typeof value === "string" && activityIds.has(value as CSharpObjectsActivityId);
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const owns = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
const validTime = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= Date.now() + 300000;

/** Reject structural prototype keys, while leaving those words inside code alone. */
function parseObjectsJson(raw: string): unknown {
  return JSON.parse(raw, (key, value: unknown) => {
    if (key === "__proto__" || key === "prototype" || key === "constructor") throw new Error("Invalid structural key");
    return value;
  });
}

export type CSharpObjectsProgress = {
  version: 1;
  unitId: typeof CSHARP_OBJECTS_UNIT_ID;
  view: "bridge" | "activity";
  active: CSharpObjectsActivityId;
  preparation: CSharpObjectsPreparationId[];
  predictions: Record<string, number>;
  drafts: Partial<Record<CSharpObjectsActivityId, string>>;
  hintsShown: Partial<Record<CSharpObjectsActivityId, number>>;
  modelViewed: Partial<Record<CSharpObjectsActivityId, true>>;
  selfReportedRuns: Partial<Record<CSharpObjectsActivityId, { kind: "self-report"; at: number }>>;
};

export const csharpObjectsKey = (userId: string | number) => `orbitamos-csharp-objects-prep-v1-${typeof userId}:${encodeURIComponent(String(userId))}`;
export const newCSharpObjectsProgress = (): CSharpObjectsProgress => ({ version: 1, unitId: CSHARP_OBJECTS_UNIT_ID, view: "bridge", active: "guided", preparation: [], predictions: {}, drafts: {}, hintsShown: {}, modelViewed: {}, selfReportedRuns: {} });

export function readCSharpObjectsProgress(raw: string | null): CSharpObjectsProgress {
  const state = newCSharpObjectsProgress();
  if (!raw || raw.length > MAX_SAVE_CHARACTERS) return state;
  try {
    const value = parseObjectsJson(raw);
    if (!isRecord(value) || !owns(value, "version") || value.version !== 1 || !owns(value, "unitId") || value.unitId !== CSHARP_OBJECTS_UNIT_ID) return state;
    state.view = value.view === "activity" ? "activity" : "bridge";
    state.active = isActivityId(value.active) ? value.active : "guided";
    if (Array.isArray(value.preparation)) state.preparation = [...new Set(value.preparation.filter((id): id is CSharpObjectsPreparationId => typeof id === "string" && preparationIds.has(id)))];
    for (const activity of csharpObjectsActivities) {
      if (isRecord(value.drafts) && owns(value.drafts, activity.id)) {
        const draft = value.drafts[activity.id];
        if (typeof draft === "string" && draft.length <= CSHARP_OBJECTS_MAX_CODE) state.drafts[activity.id] = draft;
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
export function setCSharpObjectsPreparation(state: CSharpObjectsProgress, id: CSharpObjectsPreparationId, checked: boolean): CSharpObjectsProgress {
  if (!preparationIds.has(id) || typeof checked !== "boolean") return state;
  return { ...state, preparation: [...state.preparation.filter(item => item !== id), ...(checked ? [id] : [])] };
}

export function setCSharpObjectsDraft(state: CSharpObjectsProgress, id: CSharpObjectsActivityId, text: string): CSharpObjectsProgress {
  if (!isActivityId(id) || typeof text !== "string" || text.length > CSHARP_OBJECTS_MAX_CODE || state.drafts[id] === text) return state;
  const selfReportedRuns = { ...state.selfReportedRuns };
  delete selfReportedRuns[id];
  return { ...state, drafts: { ...state.drafts, [id]: text }, selfReportedRuns };
}

/** Reset the text, not the history of help already consulted for this task. */
export function resetCSharpObjectsDraft(state: CSharpObjectsProgress, id: CSharpObjectsActivityId): CSharpObjectsProgress {
  if (!isActivityId(id)) return state;
  const drafts = { ...state.drafts };
  const selfReportedRuns = { ...state.selfReportedRuns };
  delete drafts[id];
  delete selfReportedRuns[id];
  return { ...state, drafts, selfReportedRuns };
}

export function revealCSharpObjectsHint(state: CSharpObjectsProgress, id: CSharpObjectsActivityId): CSharpObjectsProgress {
  const activity = csharpObjectsActivities.find(item => item.id === id);
  if (!activity) return state;
  return { ...state, hintsShown: { ...state.hintsShown, [id]: Math.min(activity.hints.length, (state.hintsShown[id] ?? 0) + 1) } };
}

export function markCSharpObjectsModel(state: CSharpObjectsProgress, id: CSharpObjectsActivityId): CSharpObjectsProgress {
  if (!csharpObjectsActivities.find(activity => activity.id === id)?.reference) return state;
  return { ...state, modelViewed: { ...state.modelViewed, [id]: true } };
}

export function answerCSharpObjectsPrediction(state: CSharpObjectsProgress, id: string, answer: number): CSharpObjectsProgress {
  const prediction = predictions.find(item => item.id === id);
  if (!prediction || !Number.isInteger(answer) || answer < 0 || answer >= prediction.options.length) return state;
  return { ...state, predictions: { ...state.predictions, [id]: answer } };
}

/** A student's statement, never evidence that a compiler or teacher checked it. */
export function declareCSharpObjectsRun(state: CSharpObjectsProgress, id: CSharpObjectsActivityId, at = Date.now()): CSharpObjectsProgress {
  if (!isActivityId(id) || !state.drafts[id]?.trim() || !validTime(at)) return state;
  return { ...state, selfReportedRuns: { ...state.selfReportedRuns, [id]: { kind: "self-report", at } } };
}

/** Correct an accidental declaration without discarding the student's work. */
export function clearCSharpObjectsRun(state: CSharpObjectsProgress, id: CSharpObjectsActivityId): CSharpObjectsProgress {
  if (!isActivityId(id) || !state.selfReportedRuns[id]) return state;
  const selfReportedRuns = { ...state.selfReportedRuns };
  delete selfReportedRuns[id];
  return { ...state, selfReportedRuns };
}

export function summarizeCSharpObjectsPreparation(state: CSharpObjectsProgress) {
  return {
    preparationItems: state.preparation.length,
    predictionsAnswered: predictions.filter(prediction => state.predictions[prediction.id] !== undefined).length,
    draftsWritten: csharpObjectsActivities.filter(activity => !!state.drafts[activity.id]?.trim()).length,
    activitiesWithHelp: csharpObjectsActivities.filter(activity => (state.hintsShown[activity.id] ?? 0) > 0 || state.modelViewed[activity.id]).length,
    selfReportedRuns: csharpObjectsActivities.filter(activity => !!state.selfReportedRuns[activity.id]).length,
    executionEvidence: "self-report-only" as const,
    executionLabel: "Execuções declaradas pelo aluno, sem verificação automática",
  };
}

type DraftExport = { ok: true; filename: string; content: string } | { ok: false; error: string };
type DraftImport = { ok: true; progress: CSharpObjectsProgress; activityId: CSharpObjectsActivityId; replacesExisting: boolean } | { ok: false; error: string };
const fileSize = (text: string) => new TextEncoder().encode(text).byteLength;

/** The envelope carries one text only, not a raw save or the account identity. */
export function exportCSharpObjectsDraft(state: CSharpObjectsProgress, id: CSharpObjectsActivityId): DraftExport {
  const text = state.drafts[id];
  const activity = csharpObjectsActivities.find(item => item.id === id);
  if (!activity || typeof text !== "string" || !text.trim() || text.length > CSHARP_OBJECTS_MAX_CODE) return { ok: false, error: "Escreva um rascunho desta atividade antes de exportar." };
  const content = JSON.stringify({ format: DRAFT_FORMAT, version: 1, unitId: CSHARP_OBJECTS_UNIT_ID, activityId: id, filename: activity.fileName, text }, null, 2);
  if (fileSize(content) > CSHARP_OBJECTS_MAX_FILE_BYTES) return { ok: false, error: "Este arquivo de rascunho ultrapassa 100 KB. Seu texto foi preservado; você pode copiá-lo diretamente." };
  return { ok: true, filename: `orbiservicos-objetos-${id}.json`, content };
}

/** Pure preview: callers must confirm conflicts and persist for the current account. */
export function importCSharpObjectsDraft(state: CSharpObjectsProgress, raw: string): DraftImport {
  if (typeof raw !== "string" || raw.length > CSHARP_OBJECTS_MAX_FILE_BYTES || fileSize(raw) > CSHARP_OBJECTS_MAX_FILE_BYTES) return { ok: false, error: "Escolha um arquivo de rascunho de até 100 KB." };
  try {
    const value = parseObjectsJson(raw);
    if (!isRecord(value) || Object.keys(value).length !== 6 || !["format", "version", "unitId", "activityId", "filename", "text"].every(key => owns(value, key)) || value.format !== DRAFT_FORMAT || value.version !== 1 || value.unitId !== CSHARP_OBJECTS_UNIT_ID || !isActivityId(value.activityId) || typeof value.text !== "string" || value.text.length > CSHARP_OBJECTS_MAX_CODE) return { ok: false, error: "Este arquivo não é um rascunho compatível desta unidade de objetos." };
    const id = value.activityId;
    if (value.filename !== csharpObjectsActivities.find(activity => activity.id === id)!.fileName) return { ok: false, error: "O nome do arquivo não corresponde ao arquivo editado nesta atividade." };
    const progress = setCSharpObjectsDraft(state, id, value.text);
    const selfReportedRuns = { ...progress.selfReportedRuns };
    delete selfReportedRuns[id];
    return { ok: true, activityId: id, replacesExisting: !!state.drafts[id]?.trim() && state.drafts[id] !== value.text, progress: { ...progress, selfReportedRuns, view: "activity", active: id } };
  } catch { return { ok: false, error: "Não foi possível ler este arquivo. Seus rascunhos atuais continuam intactos." }; }
}
