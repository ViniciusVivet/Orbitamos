import type { Desafio } from "./desafios";

// These checks supplement execution. Source matching alone must never award a
// completion, and words inside a comment or a string are not executable code.
function instructionText(code: string): string {
  return code.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, " ");
}

function blockAt(code: string, start: number): { body: string; end: number } | null {
  if (code[start] !== "{") return null;
  let depth = 0;
  for (let index = start; index < code.length; index++) {
    if (code[index] === "{") depth++;
    if (code[index] === "}" && --depth === 0) return { body: code.slice(start + 1, index), end: index + 1 };
  }
  return null;
}

function branchesHaveOutput(code: string, decision: RegExp): boolean {
  const match = decision.exec(code);
  if (!match) return false;
  const afterCondition = match.index + match[0].length;
  const firstStart = afterCondition + (code.slice(afterCondition).match(/^\s*/)?.[0].length ?? 0);
  const first = blockAt(code, firstStart);
  if (!first) return false;
  const alternative = code.slice(first.end).match(/^\s*else\s*/);
  const second = alternative ? blockAt(code, first.end + alternative[0].length) : null;
  return !!second && [first.body, second.body].every(body => /\bconsole\s*\.\s*log\s*\(/.test(body));
}

function verifiedProgram(code: string, output: string, verification: string | undefined, rules: RegExp[], decision?: RegExp): boolean {
  const source = instructionText(code);
  if (!verification || !rules.every(rule => rule.test(source)) || decision && !branchesHaveOutput(source, decision)) return false;
  try {
    const result: unknown = JSON.parse(verification);
    if (!result || typeof result !== "object" || Array.isArray(result)) return false;
    const data = result as { checks?: unknown; expectedOutput?: unknown };
    return Array.isArray(data.checks) && data.checks.length > 0 && data.checks.every(check => check === true)
      && typeof data.expectedOutput === "string" && output.replace(/\r/g, "").trim() === data.expectedOutput.trim();
  } catch { return false; }
}

const subtraction = /\b(?:let|const|var)\s+valorDisponivel\s*=\s*valorServico\s*-\s*custoMaterial\s*;?/;
const goalDecision = /\bif\s*\(\s*valorDisponivel\s*>=\s*meta\s*\)/;
const multiplication = /\b(?:let|const|var)\s+total\s*=\s*quantidade\s*\*\s*valorPorServico\s*;?/;
const budgetDecision = /\bif\s*\(\s*total\s*<=\s*limite\s*\)/;

export const beginnerJavaScriptChallenges: Desafio[] = [
  {
    slug: "contas-servico-js",
    titulo: "A conta de um serviço",
    descricao: "Use os valores de um serviço para calcular quanto sobra depois do material.",
    linguagem: "javascript", dificuldade: "iniciante", categoria: "Operadores",
    habilidade: "Subtração com variáveis", minutos: 7,
    codigoInicial: "// Guarde os valores e escreva a conta do serviço.\n",
    exemplo: "Serviço: 80 · material: 25\nValor disponível: 55",
    casosTeste: ["Guarda os valores como números", "Subtrai o custo do serviço", "Mostra o valor calculado"],
    dicas: ["Dê um nome ao valor do serviço e outro ao custo do material.", "Para encontrar o que sobra, use valorServico - custoMaterial.", "Mostre a variável calculada com console.log, em vez de escrever 55 na saída."],
    solucao: "const valorServico = 80;\nconst custoMaterial = 25;\nconst valorDisponivel = valorServico - custoMaterial;\nconsole.log(valorDisponivel);",
    testCode: `console.log(JSON.stringify({ checks: [Number.isFinite(valorServico) && valorServico >= 0, Number.isFinite(custoMaterial) && custoMaterial >= 0, Number.isFinite(valorDisponivel), valorDisponivel === valorServico - custoMaterial], expectedOutput: String(valorDisponivel) }));`,
    steps: [{
      instrucao: "Um serviço recebeu 80 e usou 25 de material. Guarde os dois números, calcule valorDisponivel subtraindo o custo e mostre a variável no console. Primeiro preveja quanto vai sobrar.",
      codigoExemplo: "const valorServico = 80;\nconst custoMaterial = 25;\nconst valorDisponivel = valorServico - custoMaterial;\nconsole.log(valorDisponivel);",
      validacao: (code, output, verification) => verifiedProgram(code, output, verification, [subtraction, /\bconsole\s*\.\s*log\s*\(\s*valorDisponivel\s*\)/]),
      acerto: "Você usou os dados para fazer uma conta. Agora o programa pode recalcular o resultado quando os valores mudarem.",
      erro: "Confira se valorDisponivel usa valorServico - custoMaterial e se o console mostra essa variável. Os valores devem ser números, sem aspas.",
      dica: "Guarde os dois valores. Depois subtraia o custo do valor recebido e mostre o resultado guardado, não o número 55 digitado direto.",
    }],
  },
  {
    slug: "decisao-servico-js",
    titulo: "O serviço atingiu a meta?",
    descricao: "Compare o valor disponível com uma meta e escolha uma mensagem usando if e else.",
    linguagem: "javascript", dificuldade: "iniciante", categoria: "Condicionais",
    habilidade: "Comparação e dois caminhos", minutos: 9,
    codigoInicial: "// Guarde o valor disponível e a meta. Depois compare.\n",
    exemplo: "Disponível: 55 · meta: 50\nSaída: Meta atingida",
    casosTeste: ["Compara o valor com a meta", "Inclui o valor igual à meta", "Tem um caminho para cada resultado"],
    dicas: ["Crie valorDisponivel e meta como números.", "Use valorDisponivel >= meta: o sinal inclui exatamente a meta.", "Mostre Meta atingida dentro do if e Falta para a meta dentro do else."],
    solucao: 'const valorDisponivel = 55;\nconst meta = 50;\nif (valorDisponivel >= meta) {\n  console.log("Meta atingida");\n} else {\n  console.log("Falta para a meta");\n}',
    testCode: `console.log(JSON.stringify({ checks: [Number.isFinite(valorDisponivel), Number.isFinite(meta) && meta >= 0], expectedOutput: valorDisponivel >= meta ? "Meta atingida" : "Falta para a meta" }));`,
    steps: [{
      instrucao: "O serviço deixou 55 disponíveis e a meta era 50. Compare valorDisponivel >= meta. No caminho verdadeiro, mostre Meta atingida; no outro, Falta para a meta. O que você espera ver?",
      codigoExemplo: 'const valorDisponivel = 55;\nconst meta = 50;\nif (valorDisponivel >= meta) {\n  console.log("Meta atingida");\n} else {\n  console.log("Falta para a meta");\n}',
      validacao: (code, output, verification) => verifiedProgram(code, output, verification, [goalDecision, /\belse\s*\{/], goalDecision),
      acerto: "Seu programa escolheu um caminho usando os dados. >= também inclui o caso em que o valor é exatamente igual à meta.",
      erro: "Compare valorDisponivel >= meta dentro do if e mantenha o else para o outro caso. Confira a mensagem produzida pelo caminho escolhido.",
      dica: "Leia a condição como uma pergunta: o valor disponível é maior ou igual à meta? Cada resposta tem seu próprio bloco entre chaves.",
    }],
  },
  {
    slug: "primeiro-orcamento-js",
    titulo: "Seu primeiro orçamento",
    descricao: "Junte dados, conta e decisão num pequeno orçamento de serviços no console.",
    linguagem: "javascript", dificuldade: "iniciante", categoria: "Primeiro projeto",
    habilidade: "Dados, cálculo e decisão juntos", minutos: 12,
    codigoInicial: "// OrbiServiços: seu primeiro orçamento no console.\n",
    exemplo: "Cliente: Lia · 3 serviços de 40 · limite: 150\nSaída:\nLia\n120\nDentro do limite",
    casosTeste: ["Guarda cliente e valores", "Calcula quantidade × valor por serviço", "Compara o total com o limite", "Exibe um resumo do orçamento"],
    dicas: ["Reúna cliente, quantidade, valorPorServico e limite em variáveis.", "Guarde quantidade * valorPorServico na variável total.", "Mostre cliente e total. Depois use if (total <= limite) para escolher a situação."],
    solucao: 'const cliente = "Lia";\nconst quantidade = 3;\nconst valorPorServico = 40;\nconst limite = 150;\nconst total = quantidade * valorPorServico;\nconsole.log(cliente);\nconsole.log(total);\nif (total <= limite) {\n  console.log("Dentro do limite");\n} else {\n  console.log("Acima do limite");\n}',
    testCode: `console.log(JSON.stringify({ checks: [typeof cliente === "string" && cliente.trim().length > 0, Number.isInteger(quantidade) && quantidade > 0, Number.isFinite(valorPorServico) && valorPorServico >= 0, Number.isFinite(limite) && limite >= 0, Number.isFinite(total), total === quantidade * valorPorServico], expectedOutput: [cliente, String(total), total <= limite ? "Dentro do limite" : "Acima do limite"].join("\\n") }));`,
    steps: [{
      instrucao: "Monte um orçamento para Lia: 3 serviços de 40, com limite de 150. Guarde os dados, calcule total = quantidade * valorPorServico e mostre cliente e total. Se total <= limite, mostre Dentro do limite; caso contrário, Acima do limite. Preveja os três resultados antes de executar.",
      codigoExemplo: 'const cliente = "Lia";\nconst quantidade = 3;\nconst valorPorServico = 40;\nconst limite = 150;\nconst total = quantidade * valorPorServico;\nconsole.log(cliente);\nconsole.log(total);\nif (total <= limite) {\n  console.log("Dentro do limite");\n} else {\n  console.log("Acima do limite");\n}',
      validacao: (code, output, verification) => verifiedProgram(code, output, verification, [multiplication, budgetDecision, /\belse\s*\{/, /\bconsole\s*\.\s*log\s*\(\s*cliente\s*\)/, /\bconsole\s*\.\s*log\s*\(\s*total\s*\)/], budgetDecision),
      acerto: "Seu primeiro orçamento está funcionando: dados entraram, o programa calculou o total e escolheu a situação. É um programa de console; uma tela e um banco são etapas futuras.",
      erro: "Confira os quatro dados, a multiplicação que forma total e o if que compara total <= limite. A saída precisa mostrar cliente, total e a situação calculada.",
      dica: "Construa por partes: guarde os dados, faça a multiplicação, mostre o resumo e só então escolha a situação. Você já praticou cada uma dessas ações.",
    }],
  },
];
