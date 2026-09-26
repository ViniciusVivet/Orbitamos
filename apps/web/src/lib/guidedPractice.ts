import type { Desafio } from "./desafios";

export type GuidedLine = { code: string; title: string; why: string };
export type GuidedDraft = { version: 1; code: string; mission: number; line: number; passed: number[]; started: boolean };
export const emptyGuidedDraft = (): GuidedDraft => ({ version: 1, code: "", mission: 0, line: 0, passed: [], started: false });
export const guidedStorageKey = (user: string | number, slug: string) => `orbitamos-guided-v1-${user}-${slug}`;

// Some old references are fragments, not runnable programs. Supply the data and
// calls explicitly; never guess them by splicing a student's saved source.
const surroundings: Record<string, [string, string]> = {
  "condicionais-js": ["", "console.log(classificar(8));\nconsole.log(classificar(6));\nconsole.log(classificar(3));"],
  "objetos-js": ['const usuario = { nome: "Lia", idade: 22 };', "console.log(resumo(usuario));"],
  "strings-js": ["", "console.log(ehPalindromo('arara'));\nconsole.log(ehPalindromo('casa'));"],
  "metodos-array-js": ["const pedidos = [\n  { valor: 100, pago: true },\n  { valor: 80, pago: false },\n  { valor: 50, pago: true },\n];", ""],
  "condicionais-python": ["", "print(pode_dirigir(20))\nprint(pode_dirigir(16))"],
  "listas-python": ["notas = [5, 8, 6, 9, 7]", ""],
  "dicionarios-python": ["estoque = {'mouse': 5, 'teclado': 2}", ""],
  "funcoes-python": ["", "print(celsius_para_fahrenheit(25))"],
  "strings-python": ["", "print(contar_vogais('Orbitamos'))"],
  "comprehensions-python": ["numeros = range(1, 11)", ""],
  "erros-python": ["", "print(dividir(10, 2))\nprint(dividir(10, 0))"],
  "classes-python": ["", "conta = Conta(100)\nconta.depositar(50)\nprint(conta.saldo)"],
  "desestruturacao-js": ["const pessoa = { nome: 'Nina', cidade: 'Recife', idade: 24 };", ""],
  "sets-js": ["const numeros = [1, 2, 2, 3, 3, 4];", ""],
  "validacao-js": ["", "console.log(emailValido('ana@email.com'));\nconsole.log(emailValido('email-invalido'));"],
  "recursao-js": ["", "console.log(fatorial(5));"],
  "tuplas-python": ["coordenada = (10, 25)", ""],
  "sets-python": ["turma_a = {'Ana', 'Bia', 'Caio'}\nturma_b = {'Bia', 'Caio', 'Davi'}", ""],
  "ordenacao-python": ["pontos = [72, 95, 60, 88]", ""],
  "recursao-python": ["", "print(fatorial(6))"],
  "variaveis-csharp": ['string nome = "Ana";\nint idade = 20;', ""],
  "operadores-csharp": ["int totalMinutos = 135;", "Console.WriteLine(horas);\nConsole.WriteLine(minutos);"],
  "condicionais-csharp": ["int idade = 17;", ""],
  "lacos-csharp": ["int total = 0;", ""],
};

export function guidedProgram(challenge: Desafio, mission: number): string {
  const rawReference = challenge.steps[mission]?.codigoExemplo ?? "";
  const reference = challenge.slug === "assincrono-js" ? rawReference.replace("buscarNome().then(console.log);", "console.log(await buscarNome());") : rawReference;
  const [before, after] = surroundings[challenge.slug] ?? ["", ""];
  return [before, reference, after].filter(Boolean).join("\n");
}

const loopPython: GuidedLine[] = [
  { code: "total = 0", title: "Crie uma caixa para guardar a soma", why: "total é o nome da variável. O sinal = guarda o valor à direita nela. Começamos com zero porque ainda não somamos nenhum número." },
  { code: "for numero in range(1, 101):", title: "Peça para repetir de 1 até 100", why: "for repete uma tarefa. A cada volta, numero recebe um valor de range. O limite final não entra: usamos 101 para incluir o 100. Os dois-pontos abrem o bloco." },
  { code: "    total += numero", title: "Some o número de cada volta", why: "Comece com 4 espaços (use a tecla Recuo). Isso coloca a linha dentro do laço. += soma ao valor anterior: primeiro 0 + 1, depois 1 + 2, depois 3 + 3…" },
  { code: "print(total)", title: "Mostre o resultado fora do laço", why: "Volte ao início da linha, sem espaços. print mostra o valor no console. Fora do laço, ele só acontece depois das 100 somas: o resultado será 5050." },
];

function explainLine(code: string, python: boolean): GuidedLine {
  const line = code.trim();
  let title = "Acrescente esta instrução";
  let why = "Leia os nomes e operadores: esta linha continua o programa que você está construindo. Preserve as linhas anteriores.";
  if (/^(console\.log|print\(|Console\.WriteLine)/.test(line)) {
    title = "Veja o que o programa produziu"; why = "Esta chamada mostra no console o valor entre parênteses. Se houver uma função dentro deles, ela é executada primeiro. Mostrar um valor é diferente de guardá-lo.";
  } else if (/^(async )?function |^def /.test(line)) {
    title = "Dê um nome a uma tarefa reutilizável"; why = `Uma função reúne instruções. Os nomes entre parênteses são os dados que ela recebe. ${python ? "Os dois-pontos abrem o corpo; as próximas linhas precisam de recuo." : "A chave { abre o corpo; uma chave } vai fechá-lo depois."}`;
  } else if (/^(if |else|elif)/.test(line)) {
    title = "Faça o programa tomar uma decisão"; why = "if testa uma condição; >= significa maior ou igual. O caminho só é seguido se o teste for verdadeiro. else é a alternativa. A ordem dos testes importa.";
  } else if (/^for |^foreach/.test(line)) {
    title = "Repita sem reescrever tudo"; why = "Um laço percorre valores e repete seu bloco para cada um. Observe o início, o limite e como o valor muda para que a repetição termine.";
  } else if (/^return /.test(line)) {
    title = "Devolva o resultado da função"; why = "return entrega um valor a quem chamou a função e encerra essa chamada. Ele não imprime por conta própria: a chamada de saída fará isso depois.";
  } else if (/^class /.test(line)) {
    title = "Defina o modelo de um objeto"; why = "Uma classe reúne dados e ações. Neste exercício, cada conta terá seu próprio saldo; os métodos alteram os dados dessa conta.";
  } else if (/^(try|except)/.test(line)) {
    title = "Cuide de uma operação que pode falhar"; why = "try tenta executar o bloco. except trata o tipo de erro indicado para que uma falha prevista não derrube o programa.";
  } else if (/^[}\]);{]+$/.test(line)) {
    title = line === "{" ? "Abra o bloco" : "Feche o bloco que você abriu"; why = "Esses sinais delimitam uma lista ou um bloco de instruções. Abra e feche os pares: o executor precisa saber onde cada parte começa e termina.";
  } else if (line.includes("+=")) {
    title = "Atualize o valor acumulado"; why = "+= soma o valor da direita ao que já estava guardado. Não é começar do zero: é atualizar a variável existente.";
  } else if (/^(let |const |var |int |string |\w+\s*=)/.test(line)) {
    title = "Guarde um valor com um nome"; why = `A variável dá um nome a um valor. Texto fica entre aspas; números não. ${python ? "Em Python, escreva nome = valor, sem let ou const." : /^(int|string|double|float|bool|decimal)\s/.test(line) ? "Em C#, o tipo vem antes do nome: string guarda texto; int guarda números inteiros. Termine a instrução com ponto e vírgula." : "let permite trocar o valor; const impede atribuir outro valor à mesma variável."}`;
  }
  if (line.includes(".filter(")) why = "filter seleciona os itens que passam em uma condição. reduce percorre os selecionados e acumula um único resultado; aqui, a soma dos pedidos pagos.";
  if (line.includes(".map(")) why = "map cria uma nova lista aplicando a transformação a cada item. Aqui, toUpperCase transforma o texto em letras maiúsculas sem alterar a lista original.";
  if (line.includes("new Set")) why = "Set mantém somente valores únicos. Os três pontos espalham esses valores em um novo array, removendo as repetições.";
  if (line.includes("await")) why = "await espera a promessa terminar dentro de uma função async. Aqui a promessa é simulada: não é uma consulta real a um servidor.";
  if (python && code.startsWith(" ")) why += ` Comece com ${code.length - code.trimStart().length} espaços: o recuo faz parte da sintaxe.`;
  return { code, title, why };
}

export function guidedLines(challenge: Desafio, mission: number): GuidedLine[] {
  if (challenge.slug === "lacos-python") return loopPython;
  return guidedProgram(challenge, mission).split("\n").filter(line => line.trim()).map(line => explainLine(line, challenge.linguagem === "python"));
}

// A writing check, NOT a semantic grader. Ignore cosmetic spacing outside
// strings, but retain tokens, literal content, and Python indentation.
function canonicalLine(line: string, python: boolean): string {
  const tokens = line.trim().match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|[A-Za-z_$\u00c0-\u024f][\w$\u00c0-\u024f]*|\d+(?:\.\d+)?|===|!==|==|!=|>=|<=|\+=|=>|\*\*|\S/g) ?? [];
  if (!python && tokens.at(-1) === ";") tokens.pop();
  return (python ? `${line.match(/^ */)?.[0].length ?? 0}:` : "") + JSON.stringify(tokens.map(token => /^['"]/.test(token) ? `string:${token.slice(1, -1)}` : token));
}

export function writingMatches(code: string, expected: string, python: boolean): boolean {
  const actual = code.replace(/\r/g, "").split("\n").filter(line => line.trim());
  const target = expected.split("\n").filter(line => line.trim());
  return target.length > 0 && actual.length >= target.length && target.every((line, i) => canonicalLine(line, python) === canonicalLine(actual[i], python));
}

export function readGuidedDraft(raw: string | null, challenge: Desafio): GuidedDraft {
  if (!raw) return emptyGuidedDraft();
  try {
    const draft = JSON.parse(raw);
    if (draft.version !== 1 || typeof draft.code !== "string" || draft.code.length > 100_000 || !Number.isInteger(draft.mission) || draft.mission < 0 || draft.mission >= challenge.steps.length || !Number.isInteger(draft.line) || draft.line < 0 || draft.line >= guidedLines(challenge, draft.mission).length || !Array.isArray(draft.passed)) return emptyGuidedDraft();
    return { version: 1, code: draft.code, mission: draft.mission, line: draft.line, passed: [...new Set<number>(draft.passed.filter((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < challenge.steps.length))], started: draft.started === true };
  } catch { return emptyGuidedDraft(); }
}
