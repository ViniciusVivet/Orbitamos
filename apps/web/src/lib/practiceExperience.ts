import { desafios, type Desafio } from "./desafios";

export function practiceJourney(challenge: Desafio) {
  const items = desafios.filter(item => item.linguagem === challenge.linguagem);
  const index = items.findIndex(item => item.slug === challenge.slug);
  return { items, index, previous: index >= 0 ? items[index - 1] : undefined, next: index >= 0 ? items[index + 1] : undefined };
}

export const defaultCatalogView = { language: "todas", purpose: "all", difficulty: "todas", filter: "todos", query: "" } as const;
export type CatalogView = {
  language: "todas" | "javascript" | "python" | "csharp";
  purpose: "all" | "first" | "logic" | "building";
  difficulty: "todas" | "iniciante" | "basico" | "intermediario";
  filter: "todos" | "novo" | "andamento" | "concluido";
  query: string;
};
export function readCatalogView(raw: string | null, search = ""): CatalogView {
  let data: Partial<CatalogView> = {};
  try { const parsed = JSON.parse(raw ?? "{}"); if (parsed && typeof parsed === "object") data = parsed; } catch { /* A filter is optional; never discard the student's code. */ }
  const language = new URLSearchParams(search).get("linguagem");
  const explicitLanguage = ["javascript", "python", "csharp"].includes(language ?? "") ? language as CatalogView["language"] : null;
  return {
    language: explicitLanguage ?? (["todas", "javascript", "python", "csharp"].includes(data.language ?? "") ? data.language! : "todas"),
    purpose: explicitLanguage ? "all" : ["all", "first", "logic", "building"].includes(data.purpose ?? "") ? data.purpose! : "all",
    difficulty: explicitLanguage ? "todas" : ["todas", "iniciante", "basico", "intermediario"].includes(data.difficulty ?? "") ? data.difficulty! : "todas",
    filter: explicitLanguage ? "todos" : ["todos", "novo", "andamento", "concluido"].includes(data.filter ?? "") ? data.filter! : "todos",
    query: explicitLanguage ? "" : typeof data.query === "string" ? data.query.slice(0, 120) : "",
  };
}

// Extra application questions are not replacements for running code and never
// change the existing completion contract of the guided exercises.
export type PracticeCheck = { id: string; prompt: string; code: string; options: string[]; answer: number; feedback: string[]; experiment: string };
export const practiceChecks: Record<string, PracticeCheck> = {
  "operadores-js": { id: "discount-v1", prompt: "Mesma função, outra compra. Qual valor aparece?", code: "console.log(precoFinal(80, 25));", options: ["55", "60", "20"], answer: 1, feedback: ["25 é uma porcentagem, não R$ 25. Primeiro calcule 25% de 80; depois subtraia esse desconto.", "Isso: 25% de 80 é 20. O preço final é 80 − 20 = 60. A função reutiliza a regra com novas entradas.", "20 é o valor do desconto, não o preço final. A função devolve o preço menos o desconto."], experiment: "No modo livre, use um preço de 80 e desconto de 25%. Escreva a função e confirme o resultado 60." },
  "condicionais-js": { id: "grades-v1", prompt: "A nota ficou exatamente no limite. Qual situação a função devolve?", code: "console.log(classificar(5));", options: ["Reprovado", "Aprovado", "Recuperação"], answer: 2, feedback: [">= 5 inclui a nota 5. Ela só seria reprovada abaixo desse limite.", "A primeira regra exige pelo menos 7. A nota 5 não passa nessa comparação.", "Exatamente. 5 não chega a 7, mas atende a >= 5. Os limites e a ordem das condições definem o resultado."], experiment: "No modo livre, teste as notas 4, 5 e 7. Explique por que cada uma segue um caminho diferente." },
  "condicionais-python": { id: "age-v1", prompt: "Nesta simulação, qual texto aparece para a idade 18?", code: "print(pode_dirigir(18))", options: ["sim", "não", "True"], answer: 0, feedback: ["Certo. >= inclui 18, então o primeiro return devolve o texto sim. A função não está verificando uma habilitação real.", "O sinal >= significa maior ou igual. A idade 18 já atende ao limite.", "A comparação produz um booleano, mas este programa devolve os textos sim ou não nos comandos return."], experiment: "No modo livre, teste 17 e 18. Preserve os recuos e confira em qual idade a resposta muda." },
  "variaveis-js": { id: "binding-js-v1", prompt: "O que muda quando colocamos o nome entre aspas?", code: 'let nome = "Lia";\nconsole.log("nome");', options: ["Mostra Lia", "Mostra nome", "Dá erro"], answer: 1, feedback: ["Para ler a variável, use console.log(nome), sem aspas. Aqui as aspas criam um texto literal.", "Isso. Entre aspas é o texto nome, não uma consulta ao valor da variável.", "O código é válido. Ele apenas mostra um texto diferente do conteúdo da variável."], experiment: "No modo livre, compare console.log(nome) e console.log(\"nome\"). Explique a diferença entre os dois resultados." },
  "variaveis-python": { id: "binding-python-v1", prompt: "Qual valor será mostrado depois da segunda atribuição?", code: "idade = 20\nidade = 21\nprint(idade)", options: ["20", "41", "21"], answer: 2, feedback: ["A segunda atribuição substitui o valor anterior. Ela acontece antes do print.", "= não soma. Para somar ao valor anterior seria preciso escrever outra operação, como +=.", "Certo. idade passa a guardar 21. O print consulta o valor atual da variável."], experiment: "No modo livre, guarde uma idade, altere o valor e imprima. Depois experimente idade += 1 e compare." },
  "variaveis-csharp": { id: "binding-csharp-v1", prompt: "Qual é a diferença entre estas duas saídas?", code: 'string nome = "Ana";\nConsole.WriteLine(nome);\nConsole.WriteLine("nome");', options: ["Ana e nome", "Ana e Ana", "nome e nome"], answer: 0, feedback: ["Isso. Sem aspas, o programa lê a variável. Com aspas, mostra o texto literal nome.", "A segunda chamada tem aspas: ela não lê a variável, mostra o texto nome.", "A primeira chamada está sem aspas, então consulta o valor Ana guardado na variável."], experiment: "No modo livre, use outro nome e compare a saída com e sem aspas." },
  "operadores-csharp": { id: "minutes-v1", prompt: "A duração mudou. Quais dois números serão exibidos?", code: "int totalMinutos = 125;\nint horas = totalMinutos / 60;\nint minutos = totalMinutos % 60;\nConsole.WriteLine(horas);\nConsole.WriteLine(minutos);", options: ["2 e 5", "2 e 25", "1 e 65"], answer: 0, feedback: ["Isso. Duas horas usam 120 minutos. Sobram 5; % calcula esse resto.", "125 não significa 1h25. A unidade inicial é minutos: 125 − 120 = 5 restantes.", "A divisão inteira encontra duas horas completas. O resto fica menor que 60."], experiment: "No modo livre, converta 125 e depois 60 minutos. Confira o resto em cada caso." },
  "lacos-python": { id: "range-v1", prompt: "Qual total aparece neste laço menor?", code: "total = 0\nfor numero in range(1, 4):\n    total += numero\nprint(total)", options: ["10", "6", "4"], answer: 1, feedback: ["O limite final do range não entra. O 4 não será somado.", "Isso: range(1, 4) visita 1, 2 e 3. A soma é 6 e o print fora do laço mostra o total final.", "total acumula os valores visitados, não recebe o limite do range."], experiment: "No modo livre, some de 1 a 3. Depois altere o limite para incluir também o 4 e confira a diferença." },
};

export function readPracticeAnswer(raw: string | null, check: PracticeCheck): number | null {
  try { const data = JSON.parse(raw ?? "null"); return data?.id === check.id && Number.isInteger(data.answer) && data.answer >= 0 && data.answer < check.options.length ? data.answer : null; } catch { return null; }
}

export function practiceSymbols(language: Desafio["linguagem"]): string[] {
  return language === "python" ? ["Recuo", "↵", "(", ")", '"', "'", ":", "=", "+", "-", "[", "]", "/", "%", "_", ">", "<", "*", "{", "}"] : ["Recuo", "↵", "(", ")", '"', "'", ":", ";", "=", "+", "{", "}", "[", "]", "/", "%", "_", "-"];
}
