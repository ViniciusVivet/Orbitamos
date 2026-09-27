import { runCSharpInWorker, type BrowserCodeResult } from "./browserCodeRunner";
import { codeStructure, variableCodePassed, type VariableCode } from "./csharpVariables";

export type LearningRun = BrowserCodeResult & { passed: boolean; feedback: string; checks: { label: string; passed: boolean; expected: string; actual: string }[] };
const masked = (code: string) => code.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, token => token.replace(/[^\n]/g, " "));

export function diagnoseCSharp(code: string): string | null {
  const structure = codeStructure(code);
  const textNumber = structure.match(/\b(int|bool)\s+(\w+)\s*=\s*"/);
  if (textNumber) return `Você declarou ${textNumber[2]} como ${textNumber[1]}, mas colocou o valor entre aspas. ${textNumber[1] === "bool" ? "Use true ou false sem aspas." : "Para guardar um número, retire as aspas."}`;
  if (/\bif\s*\([^)]*(?<![=!<>])=(?!=)[^)]*\)/.test(structure)) return "Dentro do if, = está atribuindo um valor. Para comparar igualdade, use == (dois sinais de igual).";
  if (/\bif\s*\([^)]*\)\s*;/.test(structure)) return "Há um ; logo depois do if (...). Retire esse ponto e vírgula para que as chaves pertençam à condição.";
  const lines = structure.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^(?:(?:int|string|bool)\s+\w+\s*=|Console\.WriteLine\s*\()/.test(line) && !/[;{}]/.test(line) && !line.endsWith("=")) return `Na linha ${i + 1}, falta encerrar a instrução com ponto e vírgula (;).`;
  }
  const open = (structure.match(/{/g) ?? []).length;
  const close = (structure.match(/}/g) ?? []).length;
  if (open !== close) return open > close ? "Você abriu mais chaves { do que fechou. Confira qual bloco ainda precisa de }." : "Há uma chave } sem uma abertura correspondente. Confira os blocos do programa.";
  return null;
}

export function explainCSharpFailure(activity: VariableCode, code: string, result: BrowserCodeResult): string {
  if (result.cancelled) return "Execução interrompida. Seu código está preservado.";
  if (result.timedOut) return "O programa levou tempo demais. Verifique se alguma repetição não termina; seu código foi preservado.";
  const diagnostic = diagnoseCSharp(code);
  if (diagnostic) return diagnostic;
  const missing = result.error?.match(/(?:ReferenceError:\s*)?([\p{L}\w]+) is not defined/u)?.[1];
  if (missing) {
    const names = Array.from(codeStructure(code).matchAll(/\b(?:int|string|bool)\s+(\w+)\s*=/g), match => match[1]);
    const similar = names.find(name => name.toLowerCase() === missing.toLowerCase());
    return similar ? `Você escreveu ${missing}, mas declarou ${similar}. Em C#, maiúsculas e minúsculas importam: use ${similar} nos dois lugares.` : `O nome ${missing} não foi encontrado. Confira se ele foi declarado antes do uso e se a escrita é a mesma.`;
  }
  if (result.error) return "O programa não conseguiu executar. Confira a mensagem técnica abaixo e abra a pista para revisar a sintaxe desta atividade.";
  const declared = Array.from(codeStructure(activity.solution).matchAll(/\b(?:int|string|bool)\s+(\w+)\s*=/g), match => match[1]);
  const missingDeclaration = declared.find(name => !new RegExp(`\\b(?:int|string|bool)\\s+${name}\\s*=`).test(codeStructure(code)));
  if (missingDeclaration) return `A atividade pede uma variável chamada ${missingDeclaration}. Declare-a com o tipo solicitado; imprimir apenas a resposta pronta não pratica esse conceito.`;
  if (!/Console\.WriteLine\s*\(/.test(codeStructure(code))) return "Você guardou valores, mas ainda não os mostrou. Use Console.WriteLine para produzir a saída pedida.";
  if (result.output.trim() !== activity.expected) return "O programa executou, mas a saída é diferente da esperada. Compare os valores, a ordem das mensagens e, se houver if, qual caminho foi escolhido.";
  return "A saída coincide, mas ainda falta aplicar a regra pedida. Use as variáveis e operações do enunciado, em vez de imprimir um resultado fixo.";
}

// Substitute only an actual top-level input declaration, never a name in a
// comment or string. Each scenario runs in a new disposable worker.
export function withCSharpInputs(code: string, values: Record<string, string>): string {
  let changed = code;
  for (const [name, value] of Object.entries(values)) {
    if (!/^\w+$/.test(name) || !/^(?:-?\d+|true|false)$/.test(value)) throw new Error("Entrada de teste inválida.");
    const source = masked(changed);
    const match = new RegExp(`\\b(?:int|bool)\\s+${name}\\s*=\\s*([^;]+);`).exec(source);
    if (!match) throw new Error(`Não foi possível variar ${name}. Declare essa entrada conforme o enunciado.`);
    const equals = changed.indexOf("=", match.index);
    const end = match.index + match[0].length - 1;
    changed = changed.slice(0, equals + 1) + " " + value + changed.slice(end);
  }
  return changed;
}

export async function runCSharpActivity(activity: VariableCode, code: string, signal?: AbortSignal): Promise<LearningRun> {
  const diagnostic = diagnoseCSharp(code);
  if (diagnostic) return { output: "", error: null, timedOut: false, passed: false, feedback: diagnostic, checks: [] };
  const result = await runCSharpInWorker(code, 2500, signal, activity.verification);
  const basePassed = !result.error && !result.cancelled && variableCodePassed(activity, code, result.output, result.verificationOutput);
  if (!basePassed) return { ...result, passed: false, feedback: explainCSharpFailure(activity, code, result), checks: [] };
  const checks: LearningRun["checks"] = [];
  for (const scenario of activity.cases ?? []) {
    if (signal?.aborted) return { ...result, cancelled: true, passed: false, feedback: "Execução interrompida. Seu código está preservado.", checks };
    let source: string;
    try { source = withCSharpInputs(code, scenario.values); }
    catch (error) { return { ...result, passed: false, feedback: String(error), checks }; }
    const test = await runCSharpInWorker(source, 2500, signal);
    if (test.cancelled) return { ...test, passed: false, feedback: "Execução interrompida. Seu código está preservado.", checks };
    checks.push({ label: scenario.label, passed: !test.error && !test.timedOut && test.output.trim() === scenario.expected, expected: scenario.expected, actual: test.error || test.output || "Nenhuma saída" });
  }
  const failed = checks.find(check => !check.passed);
  return { ...result, passed: !failed, checks, feedback: failed ? `A entrada inicial funcionou, mas o caso “${failed.label}” ainda falhou. Confira a comparação e os caminhos do if/else.` : "Código validado! Você aplicou o conceito e produziu a saída esperada." };
}
