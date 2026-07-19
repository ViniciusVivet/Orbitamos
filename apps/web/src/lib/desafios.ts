export type DesafioStep = {
  instrucao: string;
  validacao: (code: string, output: string) => boolean;
  acerto: string;
  erro: string;
  dica: string;
};

export type Desafio = {
  slug: string;
  titulo: string;
  descricao: string;
  linguagem: "javascript" | "typescript";
  codigoInicial: string;
  steps: DesafioStep[];
};

export const desafios: Desafio[] = [
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
      },
      {
        instrucao: "Agora crie uma variável 'idade' com um número e exiba no console.",
        validacao: (code, output) =>
          /let\s+idade\s*=|const\s+idade\s*=|var\s+idade\s*=/.test(code) &&
          /\d+/.test(output),
        acerto: "Ótimo! Números não precisam de aspas, diferente de strings.",
        erro: "Declare a variável 'idade' com um valor numérico e use console.log().",
        dica: "Tente: let idade = 20; console.log(idade);",
      },
      {
        instrucao: "Crie uma variável 'ativo' com valor true ou false e exiba no console.",
        validacao: (code, output) =>
          /let\s+ativo\s*=|const\s+ativo\s*=|var\s+ativo\s*=/.test(code) &&
          (output.includes("true") || output.includes("false")),
        acerto: "Excelente! Booleans são fundamentais para lógica condicional. Desafio completo!",
        erro: "Declare 'ativo' com true ou false e exiba com console.log().",
        dica: "Tente: let ativo = true; console.log(ativo);",
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
      },
      {
        instrucao: "Crie uma função 'soma' que recebe dois parâmetros e retorna a soma deles. Teste com soma(3, 5).",
        validacao: (code, output) =>
          /function\s+soma|const\s+soma\s*=/.test(code) &&
          output.includes("8"),
        acerto: "Perfeito! Parâmetros permitem que funções sejam flexíveis.",
        erro: "A função 'soma' deve receber 2 números e retornar a soma. Teste com console.log(soma(3, 5)).",
        dica: "Tente: function soma(a, b) { return a + b; } console.log(soma(3, 5));",
      },
      {
        instrucao: "Crie uma arrow function 'dobro' que recebe um número e retorna o dobro. Teste com dobro(7).",
        validacao: (code, output) =>
          /const\s+dobro\s*=\s*/.test(code) && code.includes("=>") &&
          output.includes("14"),
        acerto: "Show! Arrow functions são a sintaxe moderna do JS. Desafio completo!",
        erro: "Use a sintaxe: const dobro = (n) => ... e teste com console.log(dobro(7)).",
        dica: "Tente: const dobro = (n) => n * 2; console.log(dobro(7));",
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
      },
      {
        instrucao: "Use um for...of para exibir cada fruta em uma linha separada.",
        validacao: (code, output) =>
          code.includes("for") && code.includes("of") &&
          output.split("\n").filter((l: string) => l.trim()).length >= 3,
        acerto: "Perfeito! for...of é a forma moderna de iterar arrays.",
        erro: "Use for (const fruta of frutas) { console.log(fruta); }",
        dica: "Tente: for (const fruta of frutas) { console.log(fruta); }",
      },
      {
        instrucao: "Use .map() para criar um novo array com as frutas em MAIÚSCULAS e exiba.",
        validacao: (code, output) =>
          code.includes(".map(") && /[A-Z]{2,}/.test(output),
        acerto: "Excelente! .map() transforma cada item sem alterar o original. Desafio completo!",
        erro: "Use frutas.map(f => f.toUpperCase()) e exiba o resultado.",
        dica: "Tente: const maiusculas = frutas.map(f => f.toUpperCase()); console.log(maiusculas);",
      },
    ],
  },
];

export function getDesafio(slug: string): Desafio | undefined {
  return desafios.find((d) => d.slug === slug);
}
