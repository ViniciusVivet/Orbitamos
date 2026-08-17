export type DesafioStep = {
  instrucao: string;
  validacao: (code: string, output: string, verificationOutput?: string) => boolean;
  acerto: string;
  erro: string;
  dica: string;
  /** Código de referência do passo — o aluno pode revelar para copiar ou ocultar para tentar de cabeça */
  codigoExemplo?: string;
};

export type Desafio = {
  slug: string;
  titulo: string;
  descricao: string;
  linguagem: "javascript" | "typescript" | "python" | "csharp";
  dificuldade?: "iniciante" | "basico" | "intermediario";
  categoria?: string;
  habilidade?: string;
  minutos?: number;
  exemplo?: string;
  casosTeste?: string[];
  dicas?: string[];
  solucao?: string;
  codigoInicial: string;
  /** Verificações adicionais executadas fora do console visível do estudante. */
  testCode?: string;
  steps: DesafioStep[];
};

const desafiosBase: Desafio[] = [
  {
    slug: "variaveis-js",
    titulo: "Variáveis e Tipos",
    descricao: "Aprenda a declarar variáveis e entender tipos básicos em JavaScript.",
    linguagem: "javascript",
    codigoInicial: "// Seu código aqui\n",
    steps: [
      {
        instrucao: "Crie uma variável chamada 'nome' com seu nome entre aspas e exiba no console.",
        validacao: (code, output) =>
          /let\s+nome\s*=|const\s+nome\s*=|var\s+nome\s*=/.test(code) &&
          code.includes("console.log") &&
          output.trim().length > 0,
        acerto: "Perfeito! Você criou sua primeira variável e exibiu no console.",
        erro: "Crie a variável 'nome' com let/const e use console.log() para exibir.",
        dica: 'Tente: let nome = "Seu Nome"; console.log(nome);',
        codigoExemplo: 'let nome = "Seu Nome";\nconsole.log(nome);',
      },
      {
        instrucao: "Agora crie uma variável 'idade' com um número e exiba no console.",
        validacao: (code, output) =>
          /let\s+idade\s*=|const\s+idade\s*=|var\s+idade\s*=/.test(code) &&
          /\d+/.test(output),
        acerto: "Ótimo! Números não precisam de aspas, diferente de strings.",
        erro: "Declare a variável 'idade' com um valor numérico e use console.log().",
        dica: "Tente: let idade = 20; console.log(idade);",
        codigoExemplo: "let idade = 20;\nconsole.log(idade);",
      },
      {
        instrucao: "Crie uma variável 'ativo' com valor true ou false e exiba no console.",
        validacao: (code, output) =>
          /let\s+ativo\s*=|const\s+ativo\s*=|var\s+ativo\s*=/.test(code) &&
          (output.includes("true") || output.includes("false")),
        acerto: "Excelente! Booleans são fundamentais para lógica condicional. Desafio completo!",
        erro: "Declare 'ativo' com true ou false e exiba com console.log().",
        dica: "Tente: let ativo = true; console.log(ativo);",
        codigoExemplo: "let ativo = true;\nconsole.log(ativo);",
      },
    ],
  },
  {
    slug: "funcoes-js",
    titulo: "Funções",
    descricao: "Aprenda a criar e invocar funções em JavaScript.",
    linguagem: "javascript",
    codigoInicial: "// Crie suas funções aqui\n",
    steps: [
      {
        instrucao: "Crie uma função chamada 'saudacao' que retorna \"Olá, mundo!\" e exiba o resultado no console.",
        validacao: (code, output) =>
          /function\s+saudacao|const\s+saudacao\s*=/.test(code) &&
          output.includes("Ol") && output.includes("mundo"),
        acerto: "Muito bem! Funções encapsulam lógica reutilizável.",
        erro: "Crie a função 'saudacao' que retorna a string e chame com console.log(saudacao()).",
        dica: 'Tente: function saudacao() { return "Olá, mundo!"; } console.log(saudacao());',
        codigoExemplo: 'function saudacao() {\n  return "Olá, mundo!";\n}\n\nconsole.log(saudacao());',
      },
      {
        instrucao: "Crie uma função 'soma' que recebe dois parâmetros e retorna a soma deles. Teste com soma(3, 5).",
        validacao: (code, output) =>
          /function\s+soma|const\s+soma\s*=/.test(code) &&
          output.includes("8"),
        acerto: "Perfeito! Parâmetros permitem que funções sejam flexíveis.",
        erro: "A função 'soma' deve receber 2 números e retornar a soma. Teste com console.log(soma(3, 5)).",
        dica: "Tente: function soma(a, b) { return a + b; } console.log(soma(3, 5));",
        codigoExemplo: "function soma(a, b) {\n  return a + b;\n}\n\nconsole.log(soma(3, 5));",
      },
      {
        instrucao: "Crie uma arrow function 'dobro' que recebe um número e retorna o dobro. Teste com dobro(7).",
        validacao: (code, output) =>
          /const\s+dobro\s*=\s*/.test(code) && code.includes("=>") &&
          output.includes("14"),
        acerto: "Show! Arrow functions são a sintaxe moderna do JS. Desafio completo!",
        erro: "Use a sintaxe: const dobro = (n) => ... e teste com console.log(dobro(7)).",
        dica: "Tente: const dobro = (n) => n * 2; console.log(dobro(7));",
        codigoExemplo: "const dobro = (n) => n * 2;\n\nconsole.log(dobro(7));",
      },
    ],
  },
  {
    slug: "arrays-js",
    titulo: "Arrays e Loops",
    descricao: "Manipule listas de dados com arrays e percorra com loops.",
    linguagem: "javascript",
    codigoInicial: "// Trabalhe com arrays aqui\n",
    steps: [
      {
        instrucao: "Crie um array 'frutas' com 3 frutas e exiba no console.",
        validacao: (code, output) =>
          /let\s+frutas\s*=\s*\[|const\s+frutas\s*=\s*\[/.test(code) &&
          output.includes(","),
        acerto: "Boa! Arrays armazenam coleções de dados.",
        erro: "Crie o array com colchetes e pelo menos 3 itens.",
        dica: 'Tente: const frutas = ["maçã", "banana", "uva"]; console.log(frutas);',
        codigoExemplo: 'const frutas = ["maçã", "banana", "uva"];\nconsole.log(frutas);',
      },
      {
        instrucao: "Use um for...of para exibir cada fruta em uma linha separada.",
        validacao: (code, output) =>
          code.includes("for") && code.includes("of") &&
          output.split("\n").filter((l: string) => l.trim()).length >= 3,
        acerto: "Perfeito! for...of é a forma moderna de iterar arrays.",
        erro: "Use for (const fruta of frutas) { console.log(fruta); }",
        dica: "Tente: for (const fruta of frutas) { console.log(fruta); }",
        codigoExemplo: "for (const fruta of frutas) {\n  console.log(fruta);\n}",
      },
      {
        instrucao: "Use .map() para criar um novo array com as frutas em MAIÚSCULAS e exiba.",
        validacao: (code, output) =>
          code.includes(".map(") && /[A-Z]{2,}/.test(output),
        acerto: "Excelente! .map() transforma cada item sem alterar o original. Desafio completo!",
        erro: "Use frutas.map(f => f.toUpperCase()) e exiba o resultado.",
        dica: "Tente: const maiusculas = frutas.map(f => f.toUpperCase()); console.log(maiusculas);",
        codigoExemplo: "const maiusculas = frutas.map(f => f.toUpperCase());\nconsole.log(maiusculas);",
      },
    ],
  },
];

type ExerciseSpec = {
  slug: string;
  titulo: string;
  descricao: string;
  linguagem: "javascript" | "python" | "csharp";
  dificuldade: "iniciante" | "basico" | "intermediario";
  categoria: string;
  habilidade: string;
  minutos: number;
  instrucao: string;
  codigoInicial: string;
  exemplo: string;
  casosTeste: string[];
  dicas: string[];
  solucao: string;
  validar: (code: string, output: string) => boolean;
};

const hiddenTestCode: Record<string, string> = {
  "operadores-js": `console.log(JSON.stringify([precoFinal(100, 0) === 100, precoFinal(80, 50) === 40, precoFinal(10, 100) === 0]));`,
  "condicionais-js": `console.log(JSON.stringify([classificar(10) === "Aprovado", classificar(5) === "Recuperação", classificar(0) === "Reprovado"]));`,
  "objetos-js": `console.log(JSON.stringify([resumo({ nome: "Bia", idade: 31 }) === "Bia tem 31 anos"]));`,
  "strings-js": `console.log(JSON.stringify([ehPalindromo("ovo") === true, ehPalindromo("orbitamos") === false]));`,
  "funcoes-python": `print([celsius_para_fahrenheit(0) == 32, celsius_para_fahrenheit(100) == 212])`,
  "strings-python": `print([contar_vogais("AEIOU") == 5, contar_vogais("xyz") == 0])`,
  "erros-python": `print([dividir(9, 3) == 3, isinstance(dividir(1, 0), str)])`,
  "classes-python": `teste = Conta(10)\nteste.depositar(5)\nprint([teste.saldo == 15])`,
};

function hiddenChecksPassed(output?: string): boolean {
  if (!output) return false;
  const normalized = output.toLowerCase();
  return !normalized.includes("false") && /true/.test(normalized);
}

function createExercise(spec: ExerciseSpec): Desafio {
  const testCode = hiddenTestCode[spec.slug];
  return {
    ...spec,
    testCode,
    steps: [
      {
        instrucao: spec.instrucao,
        validacao: (code, output, verificationOutput) =>
          spec.validar(code, output) && (!testCode || hiddenChecksPassed(verificationOutput)),
        acerto: "Todos os casos principais passaram. Excelente trabalho!",
        erro: "A saída ainda não atende aos casos esperados. Compare com os exemplos e tente novamente.",
        dica: spec.dicas[0],
        codigoExemplo: spec.solucao,
      },
    ],
  };
}

const desafiosExtras: Desafio[] = [
  createExercise({
    slug: "operadores-js",
    titulo: "Calculadora de Desconto",
    descricao: "Pratique operadores aritméticos calculando o preço final de uma compra.",
    linguagem: "javascript",
    dificuldade: "iniciante",
    categoria: "Operadores",
    habilidade: "Aritmética e arredondamento",
    minutos: 8,
    instrucao: "Crie precoFinal(preco, desconto) e exiba precoFinal(200, 15). O resultado deve ser 170.",
    codigoInicial: "function precoFinal(preco, desconto) {\n  // retorne o valor com desconto\n}\n\nconsole.log(precoFinal(200, 15));\n",
    exemplo: "Entrada: 200, 15\nSaída: 170",
    casosTeste: ["Aplica porcentagem", "Retorna número", "Funciona sem desconto"],
    dicas: ["Transforme a porcentagem dividindo por 100.", "Subtraia o valor do desconto do preço original."],
    solucao: "function precoFinal(preco, desconto) {\n  return preco - preco * (desconto / 100);\n}\nconsole.log(precoFinal(200, 15));",
    validar: (code, output) => code.includes("function precoFinal") && output.trim().split("\n")[0] === "170",
  }),
  createExercise({
    slug: "condicionais-js",
    titulo: "Classificador de Nota",
    descricao: "Use condicionais para transformar uma nota em situação acadêmica.",
    linguagem: "javascript",
    dificuldade: "iniciante",
    categoria: "Condicionais",
    habilidade: "if, else if e else",
    minutos: 9,
    instrucao: "Crie classificar(nota): >=7 retorna Aprovado, >=5 Recuperação e abaixo disso Reprovado. Exiba os três casos.",
    codigoInicial: "function classificar(nota) {\n  // sua decisão aqui\n}\n\nconsole.log(classificar(8));\nconsole.log(classificar(6));\nconsole.log(classificar(3));\n",
    exemplo: "Entrada: 8, 6, 3\nSaída: Aprovado, Recuperação, Reprovado",
    casosTeste: ["Nota 8 aprova", "Nota 6 recupera", "Nota 3 reprova"],
    dicas: ["Teste primeiro a maior nota.", "Use else if para a faixa intermediária."],
    solucao: 'function classificar(nota) {\n  if (nota >= 7) return "Aprovado";\n  if (nota >= 5) return "Recuperação";\n  return "Reprovado";\n}',
    validar: (_, output) => ["Aprovado", "Recuperação", "Reprovado"].every((value) => output.includes(value)),
  }),
  createExercise({
    slug: "lacos-js",
    titulo: "FizzBuzz Essencial",
    descricao: "Treine laços e múltiplos com um clássico de entrevistas.",
    linguagem: "javascript",
    dificuldade: "basico",
    categoria: "Laços",
    habilidade: "for e operador módulo",
    minutos: 12,
    instrucao: "Percorra de 1 a 15. Múltiplos de 3 viram Fizz, de 5 Buzz e de ambos FizzBuzz.",
    codigoInicial: "for (let numero = 1; numero <= 15; numero++) {\n  // escreva sua lógica\n}\n",
    exemplo: "Saída parcial: 1, 2, Fizz, 4, Buzz ... FizzBuzz",
    casosTeste: ["Produz Fizz", "Produz Buzz", "Produz FizzBuzz", "Mantém números comuns"],
    dicas: ["Teste múltiplos de 15 antes de 3 e 5.", "numero % 3 === 0 identifica múltiplos."],
    solucao: 'for (let n = 1; n <= 15; n++) {\n  console.log(n % 15 === 0 ? "FizzBuzz" : n % 3 === 0 ? "Fizz" : n % 5 === 0 ? "Buzz" : n);\n}',
    validar: (_, output) => output.includes("FizzBuzz") && output.includes("Fizz") && output.includes("Buzz"),
  }),
  createExercise({
    slug: "objetos-js",
    titulo: "Resumo de Perfil",
    descricao: "Leia e combine propriedades de objetos JavaScript.",
    linguagem: "javascript",
    dificuldade: "basico",
    categoria: "Objetos",
    habilidade: "Propriedades e template strings",
    minutos: 8,
    instrucao: "Crie resumo(usuario) que retorne 'Lia tem 22 anos' usando as propriedades do objeto.",
    codigoInicial: 'const usuario = { nome: "Lia", idade: 22 };\n\nfunction resumo(usuario) {\n  // retorne o resumo\n}\n\nconsole.log(resumo(usuario));\n',
    exemplo: "Entrada: { nome: Lia, idade: 22 }\nSaída: Lia tem 22 anos",
    casosTeste: ["Lê nome", "Lê idade", "Retorna frase completa"],
    dicas: ["Acesse com usuario.nome.", "Template strings usam crases e ${valor}."],
    solucao: "function resumo(usuario) {\n  return `${usuario.nome} tem ${usuario.idade} anos`;\n}",
    validar: (code, output) => code.includes("usuario.") && output.includes("Lia tem 22 anos"),
  }),
  createExercise({
    slug: "strings-js",
    titulo: "Palíndromo",
    descricao: "Normalize e compare strings para descobrir palavras espelhadas.",
    linguagem: "javascript",
    dificuldade: "basico",
    categoria: "Strings",
    habilidade: "split, reverse e join",
    minutos: 10,
    instrucao: "Crie ehPalindromo(texto) e exiba o resultado para 'arara' e 'casa'.",
    codigoInicial: "function ehPalindromo(texto) {\n  // compare o texto com seu inverso\n}\n\nconsole.log(ehPalindromo('arara'));\nconsole.log(ehPalindromo('casa'));\n",
    exemplo: "Entrada: arara, casa\nSaída: true, false",
    casosTeste: ["Reconhece palíndromo", "Recusa texto comum"],
    dicas: ["Converta a string em array com split('').", "reverse() inverte o array."],
    solucao: "function ehPalindromo(texto) {\n  return texto === texto.split('').reverse().join('');\n}",
    validar: (_, output) => output.includes("true") && output.includes("false"),
  }),
  createExercise({
    slug: "metodos-array-js",
    titulo: "Total de Pedidos",
    descricao: "Combine filter, map e reduce em dados semelhantes aos de uma aplicação real.",
    linguagem: "javascript",
    dificuldade: "intermediario",
    categoria: "Métodos de array",
    habilidade: "filter e reduce",
    minutos: 14,
    instrucao: "Some apenas os pedidos pagos. Para os dados fornecidos, exiba 150.",
    codigoInicial: "const pedidos = [\n  { valor: 100, pago: true },\n  { valor: 80, pago: false },\n  { valor: 50, pago: true },\n];\n\nconst total = 0; // substitua\nconsole.log(total);\n",
    exemplo: "Entrada: três pedidos\nSaída: 150",
    casosTeste: ["Ignora não pagos", "Soma valores pagos", "Usa método de array"],
    dicas: ["Use filter para selecionar.", "Use reduce para acumular o valor."],
    solucao: "const total = pedidos.filter(p => p.pago).reduce((soma, p) => soma + p.valor, 0);\nconsole.log(total);",
    validar: (code, output) => (code.includes(".reduce(") || code.includes("for")) && output.trim().startsWith("150"),
  }),
  createExercise({
    slug: "assincrono-js",
    titulo: "Promessa de Usuário",
    descricao: "Entenda async/await simulando uma busca assíncrona.",
    linguagem: "javascript",
    dificuldade: "intermediario",
    categoria: "Assíncrono",
    habilidade: "Promise e async/await",
    minutos: 15,
    instrucao: "Crie buscarNome assíncrona que aguarda Promise.resolve('Orbitante') e exiba o resultado.",
    codigoInicial: "async function buscarNome() {\n  // aguarde a promessa\n}\n\nbuscarNome().then(console.log);\n",
    exemplo: "Saída: Orbitante",
    casosTeste: ["Função async", "Usa await", "Resolve o valor"],
    dicas: ["Marque a função com async.", "Use await Promise.resolve(...)."],
    solucao: "async function buscarNome() {\n  return await Promise.resolve('Orbitante');\n}\nbuscarNome().then(console.log);",
    validar: (code, output) => code.includes("async") && code.includes("await") && output.includes("Orbitante"),
  }),
  createExercise({
    slug: "variaveis-python",
    titulo: "Ficha do Aluno",
    descricao: "Comece em Python trabalhando com variáveis e tipos.",
    linguagem: "python",
    dificuldade: "iniciante",
    categoria: "Fundamentos",
    habilidade: "Variáveis e tipos",
    minutos: 8,
    instrucao: "Crie nome, idade e estudando. Exiba os três valores, um por linha.",
    codigoInicial: "# Crie suas variáveis\n",
    exemplo: "Saída: Ana\\n20\\nTrue",
    casosTeste: ["String", "Inteiro", "Booleano"],
    dicas: ["Python não usa let ou const.", "Booleanos são True e False."],
    solucao: "nome = 'Ana'\nidade = 20\nestudando = True\nprint(nome)\nprint(idade)\nprint(estudando)",
    validar: (code, output) => code.includes("=") && code.includes("print") && (output.includes("True") || output.includes("False")),
  }),
  createExercise({
    slug: "condicionais-python",
    titulo: "Pode Dirigir?",
    descricao: "Tome decisões em Python com if e else.",
    linguagem: "python",
    dificuldade: "iniciante",
    categoria: "Condicionais",
    habilidade: "if e else",
    minutos: 8,
    instrucao: "Crie pode_dirigir(idade), retornando 'sim' para 18+ e 'não' nos demais casos. Teste 20 e 16.",
    codigoInicial: "def pode_dirigir(idade):\n    # sua decisão\n    pass\n\nprint(pode_dirigir(20))\nprint(pode_dirigir(16))\n",
    exemplo: "Entrada: 20, 16\nSaída: sim, não",
    casosTeste: ["Adulto pode", "Menor não pode"],
    dicas: ["Use if idade >= 18:.", "A indentação faz parte da sintaxe."],
    solucao: "def pode_dirigir(idade):\n    if idade >= 18:\n        return 'sim'\n    return 'não'",
    validar: (_, output) => output.includes("sim") && output.includes("não"),
  }),
  createExercise({
    slug: "lacos-python",
    titulo: "Soma de 1 a 100",
    descricao: "Use range e for para acumular valores.",
    linguagem: "python",
    dificuldade: "basico",
    categoria: "Laços",
    habilidade: "for, range e acumulador",
    minutos: 10,
    instrucao: "Some os números de 1 a 100 usando um laço e exiba 5050.",
    codigoInicial: "total = 0\n\n# faça o laço\n\nprint(total)\n",
    exemplo: "Saída: 5050",
    casosTeste: ["Inclui 1", "Inclui 100", "Acumula corretamente"],
    dicas: ["range(1, 101) inclui o 100.", "Atualize total dentro do for."],
    solucao: "total = 0\nfor numero in range(1, 101):\n    total += numero\nprint(total)",
    validar: (code, output) => code.includes("for ") && output.trim().startsWith("5050"),
  }),
  createExercise({
    slug: "listas-python",
    titulo: "Notas Acima da Média",
    descricao: "Filtre valores de uma lista usando Python.",
    linguagem: "python",
    dificuldade: "basico",
    categoria: "Listas",
    habilidade: "Listas e filtragem",
    minutos: 10,
    instrucao: "A partir das notas, crie uma lista apenas com valores >= 7 e exiba [8, 9, 7].",
    codigoInicial: "notas = [5, 8, 6, 9, 7]\n\naprovadas = []\nprint(aprovadas)\n",
    exemplo: "Saída: [8, 9, 7]",
    casosTeste: ["Remove notas baixas", "Mantém ordem", "Produz nova lista"],
    dicas: ["Percorra notas com for.", "Use append quando nota >= 7."],
    solucao: "aprovadas = [nota for nota in notas if nota >= 7]\nprint(aprovadas)",
    validar: (_, output) => output.includes("[8, 9, 7]"),
  }),
  createExercise({
    slug: "dicionarios-python",
    titulo: "Estoque da Loja",
    descricao: "Atualize e consulte dados em dicionários.",
    linguagem: "python",
    dificuldade: "basico",
    categoria: "Dicionários",
    habilidade: "Chaves e valores",
    minutos: 9,
    instrucao: "Some 3 ao estoque de 'mouse' e exiba o novo valor 8.",
    codigoInicial: "estoque = {'mouse': 5, 'teclado': 2}\n\n# atualize o mouse\nprint(estoque['mouse'])\n",
    exemplo: "Entrada: mouse=5, chegada=3\nSaída: 8",
    casosTeste: ["Acessa chave", "Atualiza valor", "Preserva dicionário"],
    dicas: ["Use estoque['mouse'] += 3."],
    solucao: "estoque['mouse'] += 3\nprint(estoque['mouse'])",
    validar: (code, output) => code.includes("estoque[") && output.trim().startsWith("8"),
  }),
  createExercise({
    slug: "funcoes-python",
    titulo: "Conversor de Temperatura",
    descricao: "Crie uma função Python com parâmetro e retorno.",
    linguagem: "python",
    dificuldade: "basico",
    categoria: "Funções",
    habilidade: "def, parâmetros e return",
    minutos: 10,
    instrucao: "Crie celsius_para_fahrenheit(celsius). Para 25, exiba 77.0.",
    codigoInicial: "def celsius_para_fahrenheit(celsius):\n    # implemente\n    pass\n\nprint(celsius_para_fahrenheit(25))\n",
    exemplo: "Entrada: 25\nSaída: 77.0",
    casosTeste: ["Recebe parâmetro", "Retorna resultado", "Aplica fórmula"],
    dicas: ["A fórmula é C * 9 / 5 + 32."],
    solucao: "def celsius_para_fahrenheit(celsius):\n    return celsius * 9 / 5 + 32",
    validar: (code, output) => code.includes("return") && output.includes("77"),
  }),
  createExercise({
    slug: "strings-python",
    titulo: "Contador de Vogais",
    descricao: "Percorra uma string e conte caracteres importantes.",
    linguagem: "python",
    dificuldade: "basico",
    categoria: "Strings",
    habilidade: "Iteração e operador in",
    minutos: 11,
    instrucao: "Crie contar_vogais(texto). Para 'Orbitamos', exiba 4.",
    codigoInicial: "def contar_vogais(texto):\n    # conte a, e, i, o, u\n    pass\n\nprint(contar_vogais('Orbitamos'))\n",
    exemplo: "Entrada: Orbitamos\nSaída: 4",
    casosTeste: ["Ignora consoantes", "Aceita maiúsculas", "Retorna inteiro"],
    dicas: ["Converta para minúsculas.", "Teste letra in 'aeiou'."],
    solucao: "def contar_vogais(texto):\n    return sum(1 for letra in texto.lower() if letra in 'aeiou')",
    validar: (code, output) => code.includes("def contar_vogais") && output.trim().startsWith("4"),
  }),
  createExercise({
    slug: "comprehensions-python",
    titulo: "Quadrados Pares",
    descricao: "Use list comprehension para filtrar e transformar.",
    linguagem: "python",
    dificuldade: "intermediario",
    categoria: "Comprehensions",
    habilidade: "Filtragem declarativa",
    minutos: 12,
    instrucao: "Crie uma lista com o quadrado dos pares de 1 a 10. Exiba [4, 16, 36, 64, 100].",
    codigoInicial: "numeros = range(1, 11)\nquadrados = []  # substitua\nprint(quadrados)\n",
    exemplo: "Saída: [4, 16, 36, 64, 100]",
    casosTeste: ["Filtra pares", "Eleva ao quadrado", "Usa comprehension"],
    dicas: ["A forma é [expressão for item in coleção if condição]."],
    solucao: "quadrados = [n ** 2 for n in numeros if n % 2 == 0]\nprint(quadrados)",
    validar: (code, output) => code.includes(" for ") && code.includes(" if ") && output.includes("[4, 16, 36, 64, 100]"),
  }),
  createExercise({
    slug: "erros-python",
    titulo: "Divisão Segura",
    descricao: "Trate entradas problemáticas sem quebrar o programa.",
    linguagem: "python",
    dificuldade: "intermediario",
    categoria: "Erros",
    habilidade: "try e except",
    minutos: 12,
    instrucao: "Crie dividir(a, b). Capture divisão por zero e retorne 'não é possível'. Teste 10/2 e 10/0.",
    codigoInicial: "def dividir(a, b):\n    # proteja a operação\n    pass\n\nprint(dividir(10, 2))\nprint(dividir(10, 0))\n",
    exemplo: "Saída: 5.0, não é possível",
    casosTeste: ["Divisão válida", "Divisão por zero", "Programa continua"],
    dicas: ["Use try para a divisão.", "Capture ZeroDivisionError."],
    solucao: "def dividir(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return 'não é possível'",
    validar: (code, output) => code.includes("try:") && code.includes("except") && output.includes("5") && output.includes("não é possível"),
  }),
  createExercise({
    slug: "classes-python",
    titulo: "Conta Bancária",
    descricao: "Modele estado e comportamento com uma classe simples.",
    linguagem: "python",
    dificuldade: "intermediario",
    categoria: "Classes",
    habilidade: "Classes, atributos e métodos",
    minutos: 15,
    instrucao: "Implemente Conta com saldo inicial e método depositar. Após depositar 50 em saldo 100, exiba 150.",
    codigoInicial: "class Conta:\n    def __init__(self, saldo):\n        pass\n\n    def depositar(self, valor):\n        pass\n\nconta = Conta(100)\nconta.depositar(50)\nprint(conta.saldo)\n",
    exemplo: "Entrada: saldo 100, depósito 50\nSaída: 150",
    casosTeste: ["Inicializa saldo", "Método altera estado", "Instância preserva valor"],
    dicas: ["Salve com self.saldo = saldo.", "Some valor em self.saldo."],
    solucao: "class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo += valor",
    validar: (code, output) => code.includes("class Conta") && code.includes("self.saldo") && output.trim().startsWith("150"),
  }),
  createExercise({
    slug: "desestruturacao-js", titulo: "Desestruturação de Perfil", descricao: "Extraia dados de objetos com a sintaxe moderna do JavaScript.", linguagem: "javascript", dificuldade: "basico", categoria: "Objetos", habilidade: "Desestruturação", minutos: 9,
    instrucao: "Extraia nome e cidade do objeto pessoa usando desestruturação e exiba 'Nina - Recife'.",
    codigoInicial: "const pessoa = { nome: 'Nina', cidade: 'Recife', idade: 24 };\n\n// desestruture aqui\n",
    exemplo: "Saída: Nina - Recife", casosTeste: ["Usa desestruturação", "Exibe nome", "Exibe cidade"], dicas: ["Use const { nome, cidade } = pessoa."],
    solucao: "const { nome, cidade } = pessoa;\nconsole.log(`${nome} - ${cidade}`);",
    validar: (code, output) => /const\s*{[^}]*nome[^}]*cidade[^}]*}/.test(code) && output.includes("Nina - Recife"),
  }),
  createExercise({
    slug: "sets-js", titulo: "Remover Duplicados", descricao: "Use Set para produzir uma coleção com valores únicos.", linguagem: "javascript", dificuldade: "basico", categoria: "Coleções", habilidade: "Set e spread", minutos: 9,
    instrucao: "Remova os valores duplicados e exiba [1,2,3,4].",
    codigoInicial: "const numeros = [1, 2, 2, 3, 3, 4];\nconst unicos = []; // substitua\nconsole.log(unicos);\n",
    exemplo: "Saída: [1,2,3,4]", casosTeste: ["Remove duplicados", "Mantém a ordem", "Usa Set"], dicas: ["Crie um Set e espalhe seus valores em um novo array."],
    solucao: "const unicos = [...new Set(numeros)];\nconsole.log(unicos);",
    validar: (code, output) => code.includes("new Set") && output.replaceAll(" ", "").includes("[1,2,3,4]"),
  }),
  createExercise({
    slug: "validacao-js", titulo: "Validador de E-mail", descricao: "Combine strings e condições em uma validação prática.", linguagem: "javascript", dificuldade: "intermediario", categoria: "Validação", habilidade: "Strings e booleanos", minutos: 12,
    instrucao: "Crie emailValido(email), retornando true quando houver @ e um ponto depois dele. Teste os dois exemplos.",
    codigoInicial: "function emailValido(email) {\n  // valide aqui\n}\n\nconsole.log(emailValido('ana@email.com'));\nconsole.log(emailValido('email-invalido'));\n",
    exemplo: "Saída: true, false", casosTeste: ["Aceita e-mail válido", "Recusa texto inválido"], dicas: ["Encontre as posições de @ e do último ponto."],
    solucao: "function emailValido(email) {\n  const arroba = email.indexOf('@');\n  return arroba > 0 && email.lastIndexOf('.') > arroba + 1;\n}",
    validar: (_, output) => output.includes("true") && output.includes("false"),
  }),
  createExercise({
    slug: "recursao-js", titulo: "Fatorial Recursivo", descricao: "Resolva um problema chamando a própria função.", linguagem: "javascript", dificuldade: "intermediario", categoria: "Algoritmos", habilidade: "Recursão", minutos: 15,
    instrucao: "Crie fatorial(n) de forma recursiva. Exiba fatorial(5), que deve resultar em 120.",
    codigoInicial: "function fatorial(n) {\n  // caso base e chamada recursiva\n}\n\nconsole.log(fatorial(5));\n",
    exemplo: "Entrada: 5\nSaída: 120", casosTeste: ["Possui caso base", "Chama a própria função", "Calcula 5!"], dicas: ["Para n <= 1, retorne 1."],
    solucao: "function fatorial(n) {\n  if (n <= 1) return 1;\n  return n * fatorial(n - 1);\n}",
    validar: (code, output) => /fatorial\s*\(n\s*-\s*1\)/.test(code) && output.trim().startsWith("120"),
  }),
  createExercise({
    slug: "tuplas-python", titulo: "Coordenadas Imutáveis", descricao: "Pratique desempacotamento de tuplas.", linguagem: "python", dificuldade: "basico", categoria: "Tuplas", habilidade: "Tuplas e desempacotamento", minutos: 8,
    instrucao: "Desempacote coordenada em x e y e exiba 'x=10, y=25'.",
    codigoInicial: "coordenada = (10, 25)\n\n# desempacote aqui\n",
    exemplo: "Saída: x=10, y=25", casosTeste: ["Desempacota a tupla", "Exibe os valores"], dicas: ["Use x, y = coordenada."],
    solucao: "x, y = coordenada\nprint(f'x={x}, y={y}')",
    validar: (code, output) => /x\s*,\s*y\s*=/.test(code) && output.includes("x=10, y=25"),
  }),
  createExercise({
    slug: "sets-python", titulo: "Interseção de Turmas", descricao: "Encontre elementos presentes em dois conjuntos.", linguagem: "python", dificuldade: "basico", categoria: "Conjuntos", habilidade: "set e interseção", minutos: 9,
    instrucao: "Encontre os nomes presentes nas duas turmas e exiba {'Bia', 'Caio'}.",
    codigoInicial: "turma_a = {'Ana', 'Bia', 'Caio'}\nturma_b = {'Bia', 'Caio', 'Davi'}\n\ncomuns = set()\nprint(comuns)\n",
    exemplo: "Saída: {'Bia', 'Caio'}", casosTeste: ["Usa conjuntos", "Calcula interseção"], dicas: ["O operador & calcula a interseção."],
    solucao: "comuns = turma_a & turma_b\nprint(comuns)",
    validar: (code, output) => (code.includes(" & ") || code.includes("intersection")) && output.includes("Bia") && output.includes("Caio"),
  }),
  createExercise({
    slug: "ordenacao-python", titulo: "Ranking de Pontuações", descricao: "Ordene dados sem perder a lista original.", linguagem: "python", dificuldade: "basico", categoria: "Listas", habilidade: "sorted e reverse", minutos: 9,
    instrucao: "Ordene as pontuações da maior para a menor e exiba [95, 88, 72, 60].",
    codigoInicial: "pontos = [72, 95, 60, 88]\nranking = []\nprint(ranking)\n",
    exemplo: "Saída: [95, 88, 72, 60]", casosTeste: ["Ordena valores", "Usa ordem decrescente"], dicas: ["Use sorted com reverse=True."],
    solucao: "ranking = sorted(pontos, reverse=True)\nprint(ranking)",
    validar: (code, output) => code.includes("sorted") && code.includes("reverse=True") && output.includes("[95, 88, 72, 60]"),
  }),
  createExercise({
    slug: "recursao-python", titulo: "Fatorial Recursivo", descricao: "Use recursão e um caso base em Python.", linguagem: "python", dificuldade: "intermediario", categoria: "Algoritmos", habilidade: "Recursão", minutos: 15,
    instrucao: "Crie fatorial(n) de forma recursiva e exiba fatorial(6), que deve resultar em 720.",
    codigoInicial: "def fatorial(n):\n    # caso base e recursão\n    pass\n\nprint(fatorial(6))\n",
    exemplo: "Entrada: 6\nSaída: 720", casosTeste: ["Possui caso base", "Faz chamada recursiva", "Calcula 6!"], dicas: ["Para n <= 1, retorne 1."],
    solucao: "def fatorial(n):\n    if n <= 1:\n        return 1\n    return n * fatorial(n - 1)",
    validar: (code, output) => /fatorial\s*\(n\s*-\s*1\)/.test(code) && output.trim().startsWith("720"),
  }),
  createExercise({
    slug: "variaveis-csharp", titulo: "Primeiro Perfil em C#", descricao: "Declare valores tipados e use o console do C#.", linguagem: "csharp", dificuldade: "iniciante", categoria: "Fundamentos", habilidade: "Tipos e Console.WriteLine", minutos: 8,
    instrucao: "Crie nome como string e idade como int. Exiba os dois valores, um por linha.",
    codigoInicial: "// Laboratório C# inicial: fundamentos executados no navegador\nstring nome = \"Ana\";\nint idade = 20;\n\n// exiba os valores\n",
    exemplo: "Saída: Ana\n20", casosTeste: ["Declara string", "Declara int", "Usa Console.WriteLine"], dicas: ["Use Console.WriteLine(nome)."],
    solucao: "Console.WriteLine(nome);\nConsole.WriteLine(idade);",
    validar: (code, output) => code.includes("string nome") && code.includes("int idade") && output.includes("Ana") && output.includes("20"),
  }),
  createExercise({
    slug: "operadores-csharp", titulo: "Conversor de Minutos", descricao: "Pratique operadores e tipos numéricos em C#.", linguagem: "csharp", dificuldade: "iniciante", categoria: "Operadores", habilidade: "Divisão e módulo", minutos: 9,
    instrucao: "Converta 135 minutos em horas e minutos e exiba 2 e 15 em linhas separadas.",
    codigoInicial: "int totalMinutos = 135;\nint horas = 0;\nint minutos = 0;\n\nConsole.WriteLine(horas);\nConsole.WriteLine(minutos);\n",
    exemplo: "Saída: 2\n15", casosTeste: ["Calcula divisão inteira", "Usa módulo"], dicas: ["Use / para horas e % para o restante."],
    solucao: "int horas = totalMinutos / 60;\nint minutos = totalMinutos % 60;",
    validar: (code, output) => code.includes("/ 60") && code.includes("% 60") && output.split("\n").includes("2") && output.split("\n").includes("15"),
  }),
  createExercise({
    slug: "condicionais-csharp", titulo: "Faixa Etária", descricao: "Tome decisões com if e else em C#.", linguagem: "csharp", dificuldade: "basico", categoria: "Condicionais", habilidade: "if e else", minutos: 10,
    instrucao: "Para idade 17, exiba 'menor'. Para 18 ou mais, o código deve exibir 'adulto'.",
    codigoInicial: "int idade = 17;\n\nif (idade >= 18)\n{\n  // adulto\n}\nelse\n{\n  // menor\n}\n",
    exemplo: "Saída: menor", casosTeste: ["Compara idade", "Possui else", "Exibe classificação"], dicas: ["Use Console.WriteLine dentro de cada bloco."],
    solucao: "if (idade >= 18)\n{\n  Console.WriteLine(\"adulto\");\n}\nelse\n{\n  Console.WriteLine(\"menor\");\n}",
    validar: (code, output) => code.includes("if") && code.includes("else") && output.includes("menor"),
  }),
  createExercise({
    slug: "lacos-csharp", titulo: "Somando com For", descricao: "Use um laço C# para acumular números.", linguagem: "csharp", dificuldade: "basico", categoria: "Laços", habilidade: "for e acumulador", minutos: 12,
    instrucao: "Some os números de 1 a 5 com for e exiba 15.",
    codigoInicial: "int total = 0;\n\nfor (int numero = 1; numero <= 5; numero++)\n{\n  // acumule\n}\n\nConsole.WriteLine(total);\n",
    exemplo: "Saída: 15", casosTeste: ["Usa for", "Atualiza acumulador", "Exibe 15"], dicas: ["Dentro do laço, use total += numero."],
    solucao: "for (int numero = 1; numero <= 5; numero++)\n{\n  total += numero;\n}\nConsole.WriteLine(total);",
    validar: (code, output) => code.includes("for (") && code.includes("total +=") && output.trim().startsWith("15"),
  }),
];

const desafiosBaseComMetadata = desafiosBase.map((desafio, index): Desafio => ({
  ...desafio,
  dificuldade: index === 0 ? "iniciante" : "basico",
  categoria: index === 0 ? "Fundamentos" : index === 1 ? "Funções" : "Coleções",
  habilidade: index === 0 ? "Variáveis e tipos" : index === 1 ? "Parâmetros e retorno" : "Arrays, loops e map",
  minutos: index === 0 ? 8 : index === 1 ? 10 : 12,
  exemplo: index === 0 ? "Declare valores e confira a saída no console." : index === 1 ? "Crie funções e valide seus retornos." : "Transforme uma lista sem alterar a original.",
  casosTeste: desafio.steps.map((step) => step.instrucao),
  dicas: desafio.steps.map((step) => step.dica),
  solucao: desafio.steps.at(-1)?.dica.replace(/^Tente:\s*/i, "") ?? "",
}));

const challengeSequence = [
  "variaveis-js",
  "operadores-js",
  "condicionais-js",
  "lacos-js",
  "arrays-js",
  "objetos-js",
  "funcoes-js",
  "strings-js",
  "metodos-array-js",
  "assincrono-js",
  "desestruturacao-js",
  "sets-js",
  "validacao-js",
  "recursao-js",
  "variaveis-python",
  "condicionais-python",
  "lacos-python",
  "listas-python",
  "dicionarios-python",
  "funcoes-python",
  "strings-python",
  "comprehensions-python",
  "erros-python",
  "classes-python",
  "tuplas-python",
  "sets-python",
  "ordenacao-python",
  "recursao-python",
  "variaveis-csharp",
  "operadores-csharp",
  "condicionais-csharp",
  "lacos-csharp",
] as const;

const challengeBySlug = new Map(
  [...desafiosBaseComMetadata, ...desafiosExtras].map((challenge) => [challenge.slug, challenge])
);

export const desafios: Desafio[] = challengeSequence.flatMap((slug) => {
  const challenge = challengeBySlug.get(slug);
  return challenge ? [challenge] : [];
});

export function getDesafio(slug: string): Desafio | undefined {
  return desafios.find((d) => d.slug === slug);
}

export function getNextDesafio(slug: string): Desafio | undefined {
  const currentIndex = desafios.findIndex((challenge) => challenge.slug === slug);
  if (currentIndex < 0) return undefined;
  const current = desafios[currentIndex];
  return desafios.slice(currentIndex + 1).find((challenge) => challenge.linguagem === current.linguagem);
}
