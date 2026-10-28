import type { BrowserCodeResult } from "./browserCodeRunner";

type InputValue = string | number | boolean;
export type BeginnerPracticeCase = { inputs: Record<string, InputValue>; values: Record<string, InputValue>; output: string[] };
export type BeginnerPracticeSpec = { id: string; slug: string; title: string; context: string; goal: string; requirements: string[]; hints: string[]; success: string; cases: BeginnerPracticeCase[] };
export type BeginnerPracticeDraft = { version: 1; activity: string; guidedCode: string; adaptationCode: string; adaptationTarget: 0 | 1; adaptationValidated: boolean; adaptationValidatedCode: string | null; adaptationValidatedAt: number | null; stage: "adaptation" | "independent"; code: string; hints: number; attempts: number; validated: boolean; validatedCode: string | null; validatedAt: number | null };

const specs: BeginnerPracticeSpec[] = [
  {
    id: "profile-transfer-v1", slug: "variaveis-js", title: "Uma nova pessoa chegou.",
    context: "O perfil do exemplo já funciona. Agora a comunidade precisa apresentar a Bia, com outros dados.",
    goal: "Crie nome, idade e ativo e mostre uma informação por linha.",
    requirements: ['nome deve guardar o texto "Bia".', "idade deve guardar o número 27.", "ativo deve guardar false, sem aspas.", "Use console.log para mostrar as três variáveis, nessa ordem."],
    hints: ["São três informações de tipos diferentes: texto, número e booleano. Primeiro guarde cada valor; depois mostre o que guardou.", "Use uma declaração por linha. Texto fica entre aspas; números e false ficam sem aspas. Cada console.log deve ler uma variável.", 'Uma das linhas pode começar com: let nome = ...; Complete com o texto pedido. Para mostrar, use console.log(nome).'],
    success: "Você montou um perfil novo e mostrou texto, número e booleano usando variáveis.",
    cases: [
      { inputs: { nome: "Bia", idade: 27, ativo: false }, values: {}, output: ["Bia", "27", "false"] },
      { inputs: { nome: "Nina", idade: 31, ativo: true }, values: {}, output: ["Nina", "31", "true"] },
      { inputs: { nome: "Caio", idade: 19, ativo: false }, values: {}, output: ["Caio", "19", "false"] },
    ],
  },
  {
    id: "service-math-transfer-v1", slug: "contas-servico-js", title: "Outro serviço, uma nova conta.",
    context: "Um serviço paga 120 e usa 35 de material. Descubra quanto fica disponível depois desse custo.",
    goal: "Calcule valorDisponivel a partir de valorServico e custoMaterial.",
    requirements: ["Declare valorServico com 120 e custoMaterial com 35.", "Calcule valorDisponivel subtraindo o custo do valor recebido.", "Mostre valorDisponivel no console. O resultado desta missão é 85."],
    hints: ["Guarde as duas entradas antes de calcular. Disponível é o que recebeu menos o que gastou.", "A terceira variável precisa depender das duas primeiras. Se apenas guardar 85, o programa não acompanhará outro serviço.", "A operação necessária é uma subtração: valorServico - custoMaterial. Guarde o resultado antes de mostrar."],
    success: "Sua conta usa os dados do serviço e continua funcionando quando os valores mudam.",
    cases: [
      { inputs: { valorServico: 120, custoMaterial: 35 }, values: { valorDisponivel: 85 }, output: ["85"] },
      { inputs: { valorServico: 90, custoMaterial: 20 }, values: { valorDisponivel: 70 }, output: ["70"] },
      { inputs: { valorServico: 160, custoMaterial: 45 }, values: { valorDisponivel: 115 }, output: ["115"] },
    ],
  },
  {
    id: "service-decision-transfer-v1", slug: "decisao-servico-js", title: "A meta ainda não foi alcançada.",
    context: "Hoje ficaram disponíveis 45, mas a meta é 50. O programa precisa explicar a situação, inclusive quando a meta for atingida.",
    goal: "Use if e else para escolher a mensagem a partir dos valores.",
    requirements: ["Declare valorDisponivel com 45 e meta com 50.", 'Se valorDisponivel for maior ou igual à meta, mostre "Meta atingida".', 'Nos outros casos, mostre "Falta para a meta".', "Mostre apenas a mensagem correspondente à situação."],
    hints: ["Há duas saídas possíveis. Uma comparação escolhe qual caminho será executado.", "O limite também conta: chegar exatamente à meta já é suficiente. Pense no sinal maior ou igual.", 'Use a estrutura if (...) { ... } else { ... }. Coloque um console.log em cada caminho, com as mensagens pedidas.'],
    success: "Sua decisão reconhece quando falta, quando sobra e quando o valor é exatamente igual à meta.",
    cases: [
      { inputs: { valorDisponivel: 45, meta: 50 }, values: {}, output: ["Falta para a meta"] },
      { inputs: { valorDisponivel: 65, meta: 50 }, values: {}, output: ["Meta atingida"] },
      { inputs: { valorDisponivel: 50, meta: 50 }, values: {}, output: ["Meta atingida"] },
    ],
  },
  {
    id: "first-budget-transfer-v1", slug: "primeiro-orcamento-js", title: "Seu primeiro orçamento para outra cliente.",
    context: "Bia pediu dois serviços de 55 cada. O limite dela é 100. Prepare um resumo que faça a conta e explique se cabe no limite.",
    goal: "Combine dados, multiplicação e decisão em uma pequena entrega.",
    requirements: ['Declare cliente com "Bia", quantidade com 2, valorPorServico com 55 e limite com 100.', "Calcule total multiplicando quantidade por valorPorServico.", "Mostre cliente e total, uma informação por linha.", 'Depois mostre "Dentro do limite" se total for menor ou igual ao limite; caso contrário, "Acima do limite".'],
    hints: ["Você já praticou cada parte: guardar dados, calcular e escolher uma mensagem. Monte nessa ordem.", "O total depende da quantidade e do preço de cada serviço. A decisão usa esse total e o limite da cliente.", "Guarde a multiplicação em total. Na condição, use total <= limite. Mostre uma única mensagem ao final, além do nome e do total."],
    success: "Você entregou um orçamento com dados, cálculo e decisão, incluindo uma compra que chega exatamente ao limite.",
    cases: [
      { inputs: { cliente: "Bia", quantidade: 2, valorPorServico: 55, limite: 100 }, values: { total: 110 }, output: ["Bia", "110", "Acima do limite"] },
      { inputs: { cliente: "Nina", quantidade: 3, valorPorServico: 30, limite: 100 }, values: { total: 90 }, output: ["Nina", "90", "Dentro do limite"] },
      { inputs: { cliente: "Caio", quantidade: 2, valorPorServico: 50, limite: 100 }, values: { total: 100 }, output: ["Caio", "100", "Dentro do limite"] },
    ],
  },
];

export const beginnerPracticeSlugs = specs.map(spec => spec.slug);
export const getBeginnerPractice = (slug: string) => specs.find(spec => spec.slug === slug);
export const supportsBeginnerPractice = (slug: string) => !!getBeginnerPractice(slug);
export const beginnerPracticeKey = (userId: string | number, slug: string) => `orbitamos-beginner-practice-v1-${userId}-${slug}`;
export function emptyBeginnerPractice(slug: string, guidedCode = ""): BeginnerPracticeDraft {
  const code = guidedCode.slice(0, 12000);
  return { version: 1, activity: getBeginnerPractice(slug)?.id ?? "", guidedCode: code, adaptationCode: code, adaptationTarget: adaptationTarget(slug, code), adaptationValidated: false, adaptationValidatedCode: null, adaptationValidatedAt: null, stage: "adaptation", code: "", hints: 0, attempts: 0, validated: false, validatedCode: null, validatedAt: null };
}
export function readBeginnerPractice(raw: string | null, slug: string): BeginnerPracticeDraft {
  const empty = emptyBeginnerPractice(slug);
  try {
    const parsed: unknown = JSON.parse(raw ?? "null");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return empty;
    const data = parsed as Record<string, unknown>;
    if (!empty.activity || data.version !== 1 || data.activity !== empty.activity) return empty;
    const code = typeof data.code === "string" ? data.code.slice(0, 12000) : "";
    const guidedCode = typeof data.guidedCode === "string" ? data.guidedCode.slice(0, 12000) : "";
    const adaptationCode = typeof data.adaptationCode === "string" ? data.adaptationCode.slice(0, 12000) : "";
    const adaptationTargetValue = adaptationTarget(slug, guidedCode);
    const adaptationValidatedAt = typeof data.adaptationValidatedAt === "number" && Number.isFinite(data.adaptationValidatedAt) && data.adaptationValidatedAt > 0 && data.adaptationValidatedAt <= Date.now() + 300000 ? data.adaptationValidatedAt : null;
    const adaptationValidated = data.adaptationValidated === true && !!guidedCode.trim() && !!adaptationCode.trim() && data.adaptationValidatedCode === adaptationCode && data.adaptationCode === adaptationCode && data.guidedCode === guidedCode && adaptationValidatedAt !== null && data.adaptationTarget === adaptationTargetValue;
    const timestamp = typeof data.validatedAt === "number" && Number.isFinite(data.validatedAt) && data.validatedAt > 0 && data.validatedAt <= Date.now() + 300000 ? data.validatedAt : null;
    const validated = adaptationValidated && data.validated === true && !!code.trim() && code.length === (typeof data.code === "string" ? data.code.length : 0) && data.validatedCode === code && timestamp !== null;
    return { ...empty, guidedCode, adaptationCode, adaptationTarget: adaptationTargetValue, adaptationValidated, adaptationValidatedCode: adaptationValidated ? adaptationCode : null, adaptationValidatedAt: adaptationValidated ? adaptationValidatedAt : null, stage: data.stage === "independent" && adaptationValidated ? "independent" : "adaptation", code, hints: Number.isInteger(data.hints) ? Math.max(0, Math.min(3, Number(data.hints))) : 0, attempts: Number.isInteger(data.attempts) ? Math.max(0, Math.min(100000, Number(data.attempts))) : 0, validated, validatedCode: validated ? code : null, validatedAt: validated ? timestamp : null };
  } catch { return empty; }
}
export const hasCompletedBeginnerPractice = (raw: string | null, slug: string) => readBeginnerPractice(raw, slug).validated;

type Token = { text: string; start: number; end: number };
// Only locates simple input declarations. The student's program is always run in
// the existing isolated Worker; this scanner never executes or grades JavaScript.
function tokens(source: string): Token[] {
  const result: Token[] = [];
  let at = 0;
  while (at < source.length) {
    if (/\s/.test(source[at])) { at++; continue; }
    if (source.slice(at, at + 2) === "//") { const end = source.indexOf("\n", at + 2); at = end < 0 ? source.length : end; continue; }
    if (source.slice(at, at + 2) === "/*") { const end = source.indexOf("*/", at + 2); at = end < 0 ? source.length : end + 2; continue; }
    const start = at;
    if ('"\'`'.includes(source[at])) {
      const quote = source[at++];
      while (at < source.length) { if (source[at] === "\\") { at += 2; continue; } if (source[at++] === quote) break; }
    } else {
      const match = source.slice(at).match(/^(?:[A-Za-z_$][\w$]*|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/);
      at += match?.[0].length ?? 1;
    }
    result.push({ text: source.slice(start, at), start, end: at });
  }
  return result;
}

function inputDeclarations(source: string, names: string[]): { name: string; start: number; end: number; text: string }[] | null {
  const list = tokens(source);
  const declarationsFound: { name: string; start: number; end: number; text: string }[] = [];
  for (const name of names) {
    const declarations = list.flatMap((token, index) => /^(let|const|var)$/.test(token.text) && list[index + 1]?.text === name && list[index + 2]?.text === "=" ? [index + 3] : []);
    if (declarations.length !== 1) return null;
    const index = declarations[0];
    const literal = list[index];
    if (!literal) return null;
    const signed = /^[+-]$/.test(literal.text);
    const end = signed ? list[index + 1] : literal;
    const text = signed ? literal.text + (end?.text ?? "") : literal.text;
    if (!end || !(/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|true|false|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)$/.test(text))) return null;
    const following = list[index + (signed ? 2 : 1)];
    if (following && following.text !== ";" && !/[\r\n]/.test(source.slice(end.end, following.start))) return null;
    declarationsFound.push({ name, start: literal.start, end: end.end, text });
  }
  return declarationsFound;
}
function literalValue(text: string): InputValue | null {
  if (text === "true" || text === "false") return text === "true";
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return Number(text);
  if (!['"', "'"].includes(text[0]) || text.at(-1) !== text[0]) return null;
  const escapes: Record<string, string> = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", "0": "\0" };
  let decoded = "";
  for (let index = 1; index < text.length - 1; index++) {
    const char = text[index];
    if (char === "\n" || char === "\r") return null;
    if (char !== "\\") { decoded += char; continue; }
    const escaped = text[++index];
    if (!escaped || /[1-9]/.test(escaped) || escaped === "0" && /\d/.test(text[index + 1] ?? "")) return null;
    if (escaped === "x" || escaped === "u") {
      if (escaped === "u" && text[index + 1] === "{") {
        const end = text.indexOf("}", index + 2), hex = end < 0 ? "" : text.slice(index + 2, end);
        if (!/^[\da-f]{1,6}$/i.test(hex) || parseInt(hex, 16) > 0x10ffff) return null;
        decoded += String.fromCodePoint(parseInt(hex, 16)); index = end;
      } else {
        const length = escaped === "x" ? 2 : 4, hex = text.slice(index + 1, index + 1 + length);
        if (!new RegExp(`^[\\da-f]{${length}}$`, "i").test(hex)) return null;
        decoded += String.fromCharCode(parseInt(hex, 16)); index += length;
      }
    } else decoded += escapes[escaped] ?? escaped;
  }
  return decoded;
}
export function adaptationTarget(slug: string, guidedCode: string): 0 | 1 {
  const inputs = getBeginnerPractice(slug)?.cases[0].inputs;
  if (!inputs) return 0;
  const declared = inputDeclarations(guidedCode, Object.keys(inputs));
  return declared && declared.every(item => literalValue(item.text) === inputs[item.name]) ? 1 : 0;
}
export function replaceBeginnerInputs(source: string, inputs: Record<string, InputValue>): string | null {
  const declared = inputDeclarations(source, Object.keys(inputs));
  if (!declared) return null;
  let output = source;
  for (const edit of declared.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + JSON.stringify(inputs[edit.name]) + output.slice(edit.end);
  return output;
}

export type BeginnerPracticeRun = { code: string; verificationCode: string; expectedOutput: string };
export function prepareBeginnerRun(slug: string, source: string, caseIndex: number, substituteInputs = false): BeginnerPracticeRun | null {
  const spec = getBeginnerPractice(slug), example = spec?.cases[caseIndex];
  if (!spec || !example || !source.trim() || source.length > 12000) return null;
  const alternative = replaceBeginnerInputs(source, example.inputs);
  if (alternative === null) return null;
  const expected = { ...example.inputs, ...example.values };
  const checks = Object.entries(expected).map(([name, value]) => `typeof ${name} === ${JSON.stringify(typeof value)} && ${name} === ${JSON.stringify(value)}`);
  return { code: substituteInputs ? alternative : source, verificationCode: `console.log(JSON.stringify({activity:${JSON.stringify(spec.id)},checks:[${checks.join(",")}]}));`, expectedOutput: example.output.join("\n") };
}
export function verifyBeginnerRun(slug: string, caseIndex: number, result: BrowserCodeResult): boolean {
  const spec = getBeginnerPractice(slug), example = spec?.cases[caseIndex];
  if (!spec || !example || result.error || result.cancelled || result.timedOut || result.truncated || result.output.replace(/\r/g, "").trim() !== example.output.join("\n")) return false;
  try {
    const rows = (result.verificationOutput ?? "").trim().split("\n");
    if (rows.length !== 1) return false;
    const checked = JSON.parse(rows[0]) as { activity?: unknown; checks?: unknown };
    const count = Object.keys({ ...example.inputs, ...example.values }).length;
    return checked.activity === spec.id && Array.isArray(checked.checks) && checked.checks.length === count && checked.checks.every(value => value === true);
  } catch { return false; }
}

export function beginnerPracticeTask(slug: string, caseIndex: number): { context: string; goal: string; requirements: string[] } | null {
  const spec = getBeginnerPractice(slug), example = spec?.cases[caseIndex];
  if (!spec || !example) return null;
  const values = example.inputs;
  if (slug === "variaveis-js") return { context: `A comunidade precisa apresentar ${values.nome}, com outros dados.`, goal: spec.goal, requirements: [`nome deve guardar o texto ${JSON.stringify(values.nome)}.`, `idade deve guardar o número ${values.idade}.`, `ativo deve guardar ${values.ativo}, sem aspas.`, "Use console.log para mostrar as três variáveis, nessa ordem e uma por linha."] };
  if (slug === "contas-servico-js") return { context: `O serviço paga ${values.valorServico} e usa ${values.custoMaterial} de material. Descubra quanto fica disponível.`, goal: spec.goal, requirements: [`Declare valorServico com ${values.valorServico} e custoMaterial com ${values.custoMaterial}.`, "Calcule valorDisponivel subtraindo o custo do valor recebido.", `Mostre valorDisponivel no console. Nesta situação o resultado é ${example.values.valorDisponivel}.`] };
  if (slug === "decisao-servico-js") return { context: `O valor disponível é ${values.valorDisponivel} e a meta é ${values.meta}. Confira qual mensagem corresponde à situação.`, goal: spec.goal, requirements: [`Declare valorDisponivel com ${values.valorDisponivel} e meta com ${values.meta}.`, 'Se valorDisponivel for maior ou igual à meta, mostre "Meta atingida".', 'Caso contrário, mostre "Falta para a meta".', "Mostre apenas a mensagem correspondente à situação."] };
  return { context: `${values.cliente} pediu ${values.quantidade} serviços de ${values.valorPorServico} cada e tem limite de ${values.limite}. Prepare um orçamento.`, goal: spec.goal, requirements: [`Declare cliente com ${JSON.stringify(values.cliente)}, quantidade com ${values.quantidade}, valorPorServico com ${values.valorPorServico} e limite com ${values.limite}.`, "Calcule total multiplicando quantidade por valorPorServico.", "Mostre cliente e total, uma informação por linha.", 'Depois mostre "Dentro do limite" se total for menor ou igual ao limite; caso contrário, "Acima do limite".'] };
}
