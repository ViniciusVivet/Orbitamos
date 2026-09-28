import type { Desafio } from "./desafios";

export const csharpMarketCheckedAt = "25/09/2026";
export const csharpStages = [
  { id: "start", title: "Fundamentos: variáveis e console", skill: "Texto, números, reatribuição, cálculo e leitura de erros", delivery: "7 práticas de código e 3 questões. Da primeira variável a um resumo de serviços escrito por você.", available: true, tools: "C# · laboratório guiado e prática independente" },
  { id: "logic", title: "Lógica: decidir e repetir", skill: "Condições, for, while, contadores e acumuladores. Métodos ainda em preparação.", delivery: "Condições e laços: 14 práticas e 6 questões. Construa regras que funcionam para filas vazias, parciais e concluídas, com testes de diferentes entradas.", available: true, tools: "C# · condições · laços · leitura de casos de teste" },
  { id: "objects", title: "Um programa que cresce", skill: "Objetos, interfaces, coleções e LINQ", delivery: "Clientes e serviços organizados num projeto console.", available: false, tools: ".NET 10 · orientação a objetos" },
  { id: "data", title: "Dados que não se perdem", skill: "Modelagem, SQL, joins e relacionamentos", delivery: "Um banco e consultas que respondem perguntas do negócio.", available: false, tools: "SQL Server · SQL · EF Core" },
  { id: "api", title: "Seu sistema conversa com o mundo", skill: "HTTP, APIs, validação e async/await", delivery: "Uma API documentada para cadastrar e consultar serviços.", available: false, tools: "ASP.NET Core · OpenAPI · EF Core" },
  { id: "quality", title: "Funciona. E continua funcionando", skill: "Autorização, testes, logs e correção de bugs", delivery: "Um bug reproduzido por teste, corrigido e enviado em um PR.", available: false, tools: "xUnit · Git · segurança" },
  { id: "delivery", title: "Da sua máquina para uma entrega", skill: "Containers, integração contínua e publicação", delivery: "Um projeto reproduzível com pipeline e demonstração.", available: false, tools: "Docker · CI/CD · Azure" },
  { id: "career", title: "Mostre o que você sabe fazer", skill: "Projeto independente, portfólio e entrevista", delivery: "Uma solução autoral que você consegue explicar e modificar.", available: false, tools: "GitHub · revisão · comunicação" },
] as const;

export const csharpJobSources = [
  { company: "BRQ", title: "Backend Júnior", kind: "Base primeiro", summary: "C#, orientação a objetos, APIs, SQL e Git. A vaga diferencia fundamentos de conhecimentos desejáveis.", url: "https://br.linkedin.com/jobs/view/desenvolvedor-a-backend-j%C3%BAnior-c%23-net-h%C3%ADbrido-sp-at-brq-digital-solutions-4466342270" },
  { company: "Extractta", title: "Backend Júnior C#/.NET", kind: "Rotina de equipe", summary: "Testes, revisão de código, SQL, APIs e correção de bugs. Também menciona formação em TI.", url: "https://br.linkedin.com/jobs/view/desenvolvedor-backend-j%C3%BAnior-c%23-net-at-extractta-4469632074" },
  { company: "SEGIMOB", title: "Full Stack .NET Júnior", kind: "Outro caminho", summary: "Inclui Angular e TypeScript, além do backend. Full stack é um aprofundamento, não a primeira barreira desta trilha.", url: "https://segimob.gupy.io/jobs/12059829" },
  { company: "Confitec", title: ".NET / Angular Júnior", kind: "IA com critério", summary: "Entender regras de negócio, revisar soluções e assumir responsabilidade pela qualidade do código, inclusive com apoio de IA.", url: "https://confitec.gupy.io/jobs/12425462" },
] as const;

export const csharpPilot: Desafio = {
  slug: "trilha-csharp-piloto-v1",
  titulo: "Seu primeiro painel de serviços",
  descricao: "Dê nome ao projeto, guarde uma quantidade e mostre os dois valores.",
  linguagem: "csharp", dificuldade: "iniciante", categoria: "Fundamentos", minutos: 10,
  codigoInicial: "",
  exemplo: "OrbiServiços\n3",
  testCode: 'Console.WriteLine(projeto == "OrbiServiços");\nConsole.WriteLine(servicosPendentes == 3);',
  steps: [{
    instrucao: "Crie projeto com o texto OrbiServiços e servicosPendentes com o número 3. Exiba os dois, nessa ordem.",
    codigoExemplo: 'string projeto = "OrbiServiços";\nint servicosPendentes = 3;\nConsole.WriteLine(projeto);\nConsole.WriteLine(servicosPendentes);',
    dica: "string guarda texto entre aspas. int guarda um número inteiro. Console.WriteLine mostra o valor no console.",
    acerto: "Você declarou dois tipos de dados e mostrou os valores. Na próxima atividade, confira a diferença entre o nome da variável e o valor guardado.",
    erro: "Confira os nomes projeto e servicosPendentes, os valores e a ordem das duas saídas.",
    validacao: (_, output, verification) => output.trim() === "OrbiServiços\n3" && verification?.trim() === "true\ntrue",
  }],
};

export type PilotExercise = "transfer" | "debug";
export const pilotExercises = {
  transfer: {
    title: "Chegaram mais dois serviços.",
    brief: "Sem consultar o modelo: crie uma variável inteira chamada servicosPendentes com valor 5. Mostre o valor dessa variável no console. Escreva só este pequeno programa.",
    hint: "O tipo vem antes do nome: int. Depois use = para guardar um número. Console.WriteLine recebe o nome da variável, sem aspas.",
    starter: "", expected: "5", verification: "Console.WriteLine(servicosPendentes == 5);",
  },
  debug: {
    title: "Um nome quase igual. Um erro de verdade.",
    brief: "Este programa deveria mostrar 3, mas usa um nome diferente na última linha. Execute para observar o erro, encontre a diferença e corrija. Em C#, maiúsculas e minúsculas importam.",
    hint: "Compare servicosPendentes com servicospendentes. O P maiúsculo faz parte do nome. Não substitua a variável por um número fixo.",
    starter: "int servicosPendentes = 3;\nConsole.WriteLine(servicospendentes);", expected: "3", verification: "Console.WriteLine(servicosPendentes == 3);",
  },
} as const;

export function pilotExercisePassed(kind: PilotExercise, code: string, output: string, verification?: string): boolean {
  const executable = code.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "");
  return /\bint\s+servicosPendentes\s*=/.test(executable) && /Console\.WriteLine\s*\(\s*servicosPendentes\s*\)/.test(executable) && output.trim() === pilotExercises[kind].expected && verification?.trim() === "true";
}

export type TrackView = "welcome" | "market" | "map" | "pilot";
export type PilotStep = "brief" | "guided" | "transfer" | "debug" | "review";
export type CSharpTrackProgress = {
  version: 1; view: TrackView; step: PilotStep; device: "phone" | "computer"; pace: "short" | "long";
  guided: boolean; transfer: boolean; debug: boolean; reflection: string;
  drafts: Record<PilotExercise, string>;
};
export const newCSharpProgress = (): CSharpTrackProgress => ({ version: 1, view: "welcome", step: "brief", device: "phone", pace: "short", guided: false, transfer: false, debug: false, reflection: "", drafts: { transfer: "", debug: pilotExercises.debug.starter } });
export const csharpProgressKey = (userId: string | number) => `orbitamos-csharp-track-v1-${userId}`;
export function readCSharpProgress(raw: string | null): CSharpTrackProgress {
  const base = newCSharpProgress();
  try {
    const value = JSON.parse(raw || "null");
    if (!value || value.version !== 1) return base;
    return {
      ...base,
      view: ["welcome", "market", "map", "pilot"].includes(value.view) ? value.view : "welcome",
      step: ["brief", "guided", "transfer", "debug", "review"].includes(value.step) ? value.step : "brief",
      device: value.device === "computer" ? "computer" : "phone", pace: value.pace === "long" ? "long" : "short",
      guided: value.guided === true, transfer: value.transfer === true, debug: value.debug === true,
      reflection: typeof value.reflection === "string" ? value.reflection.slice(0, 1500) : "",
      drafts: { transfer: typeof value.drafts?.transfer === "string" ? value.drafts.transfer.slice(0, 100000) : "", debug: typeof value.drafts?.debug === "string" ? value.drafts.debug.slice(0, 100000) : base.drafts.debug },
    };
  } catch { return base; }
}
