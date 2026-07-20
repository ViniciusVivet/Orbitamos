/**
 * Fases do jogo "Monte o Código": o aluno recebe as linhas embaralhadas
 * e monta o programa na ordem correta, tocando nos blocos (mobile-first).
 *
 * Regra de design das fases: cada linha depende da anterior (variável usada
 * só depois de criada, chave fechada depois de aberta), para que exista UMA
 * ordem correta — sem ambiguidade na validação.
 */

export type FaseMonteCodigo = {
  slug: string;
  titulo: string;
  /** O que o programa deve fazer, em linguagem de iniciante */
  descricao: string;
  linguagem: "javascript" | "python";
  dificuldade: "iniciante" | "basico" | "intermediario";
  /** Saída exibida como objetivo, em estilo terminal */
  saidaEsperada: string;
  /** Linhas na ordem correta, com indentação preservada */
  linhas: string[];
  dica: string;
  /** Mostrada na tela de vitória — o "porquê" da ordem */
  explicacao: string;
};

export const fasesMonteCodigo: FaseMonteCodigo[] = [
  {
    slug: "ola-orbi-js",
    titulo: "Olá, Orbi!",
    descricao: "Monte um programa que guarda um nome, monta uma saudação e exibe no console.",
    linguagem: "javascript",
    dificuldade: "iniciante",
    saidaEsperada: "Olá, Orbi!",
    linhas: [
      'let nome = "Orbi";',
      'let mensagem = "Olá, " + nome + "!";',
      "console.log(mensagem);",
    ],
    dica: "Uma variável precisa existir antes de ser usada. Quem usa 'nome'? Quem usa 'mensagem'?",
    explicacao: "O programa roda de cima para baixo: primeiro criamos 'nome', depois usamos ele para montar 'mensagem', e só então exibimos. Se invertermos, o JavaScript não encontra a variável e dá erro.",
  },
  {
    slug: "par-ou-impar-js",
    titulo: "Par ou Ímpar?",
    descricao: "Monte um programa que verifica se o número 7 é par ou ímpar.",
    linguagem: "javascript",
    dificuldade: "iniciante",
    saidaEsperada: "É ímpar",
    linhas: [
      "let numero = 7;",
      "if (numero % 2 === 0) {",
      '  console.log("É par");',
      "} else {",
      '  console.log("É ímpar");',
      "}",
    ],
    dica: "O if testa a condição de PAR primeiro (resto da divisão por 2 igual a 0). O else fica com o caso contrário.",
    explicacao: "O if abre um bloco: se a condição for verdadeira, roda o primeiro console.log; senão, o else roda o segundo. As chaves { } delimitam cada bloco — por isso o '}' final fecha tudo.",
  },
  {
    slug: "contagem-js",
    titulo: "Contagem Regressiva do Foguete",
    descricao: "Monte um laço que conta de 1 a 3 e anuncia o fim.",
    linguagem: "javascript",
    dificuldade: "iniciante",
    saidaEsperada: "1\n2\n3\nFim!",
    linhas: [
      "for (let i = 1; i <= 3; i++) {",
      "  console.log(i);",
      "}",
      'console.log("Fim!");',
    ],
    dica: "O que está DENTRO das chaves repete. O que vem depois do '}' roda uma vez só, no final.",
    explicacao: "O for repete o que está entre as chaves 3 vezes (i = 1, 2, 3). O console.log('Fim!') está fora do laço, então roda uma única vez, depois que a repetição termina.",
  },
  {
    slug: "funcao-dobro-js",
    titulo: "A Máquina de Dobrar",
    descricao: "Monte uma função que dobra um número e use ela com o valor 5.",
    linguagem: "javascript",
    dificuldade: "basico",
    saidaEsperada: "10",
    linhas: [
      "function dobro(n) {",
      "  return n * 2;",
      "}",
      "let resultado = dobro(5);",
      "console.log(resultado);",
    ],
    dica: "Primeiro a função é criada (function ... até }), depois ela é chamada, e por último o resultado é exibido.",
    explicacao: "Uma função é uma receita: primeiro escrevemos a receita (function dobro), depois pedimos o prato (dobro(5)) e guardamos em 'resultado', e no final mostramos. O return devolve o valor para quem chamou.",
  },
  {
    slug: "lista-compras-js",
    titulo: "Lista de Compras",
    descricao: "Monte um programa que cria uma lista com 2 itens, adiciona 'café' e mostra o total de itens.",
    linguagem: "javascript",
    dificuldade: "basico",
    saidaEsperada: "3",
    linhas: [
      'let compras = ["pão", "leite"];',
      'compras.push("café");',
      "console.log(compras.length);",
    ],
    dica: "Não dá para adicionar item numa lista que ainda não existe.",
    explicacao: "O array nasce com 2 itens, o .push() adiciona o terceiro no final, e o .length conta quantos existem naquele momento — por isso o resultado é 3, não 2.",
  },
  {
    slug: "media-notas-js",
    titulo: "Média do Boletim",
    descricao: "Monte um programa que calcula a média de três notas, passo a passo.",
    linguagem: "javascript",
    dificuldade: "intermediario",
    saidaEsperada: "Média: 8",
    linhas: [
      "let notas = [8, 6, 10];",
      "let soma = notas[0] + notas[1] + notas[2];",
      "let media = soma / notas.length;",
      'console.log("Média: " + media);',
    ],
    dica: "Siga a corrente: 'soma' precisa de 'notas', 'media' precisa de 'soma', e o console mostra 'media'.",
    explicacao: "Cada linha depende da anterior, formando uma corrente: notas → soma → media → exibição. Essa é a essência de um algoritmo: transformar dados em etapas encadeadas.",
  },
  {
    slug: "ola-python",
    titulo: "Olá, Python!",
    descricao: "Monte um programa Python que guarda um nome, monta uma saudação e exibe.",
    linguagem: "python",
    dificuldade: "iniciante",
    saidaEsperada: "Olá, Orbi!",
    linhas: [
      'nome = "Orbi"',
      'mensagem = "Olá, " + nome + "!"',
      "print(mensagem)",
    ],
    dica: "Igual ao JavaScript: variável primeiro, uso depois. Em Python não precisa de let nem de ponto e vírgula.",
    explicacao: "Python também executa de cima para baixo: criamos 'nome', montamos 'mensagem' com ele, e exibimos com print(). Repare que Python dispensa o let e o ponto e vírgula.",
  },
  {
    slug: "maior-idade-python",
    titulo: "Pode Entrar?",
    descricao: "Monte um programa que verifica se uma pessoa de 20 anos é maior de idade.",
    linguagem: "python",
    dificuldade: "iniciante",
    saidaEsperada: "Maior de idade",
    linhas: [
      "idade = 20",
      "if idade >= 18:",
      '    print("Maior de idade")',
      "else:",
      '    print("Menor de idade")',
    ],
    dica: "Em Python, o que pertence ao if fica INDENTADO (deslocado para a direita) logo abaixo dele. O else vem depois, alinhado com o if.",
    explicacao: "Python usa indentação no lugar das chaves: o print deslocado logo abaixo do if pertence a ele, e o mesmo vale para o else. A indentação não é estética — ela É a estrutura do código.",
  },
  {
    slug: "contagem-python",
    titulo: "Contagem com range()",
    descricao: "Monte um laço que imprime 1, 2 e 3, e depois anuncia o fim.",
    linguagem: "python",
    dificuldade: "iniciante",
    saidaEsperada: "1\n2\n3\nFim!",
    linhas: [
      "for numero in range(1, 4):",
      "    print(numero)",
      'print("Fim!")',
    ],
    dica: "A linha indentada repete dentro do laço. A linha sem indentação roda depois que o laço acaba.",
    explicacao: "range(1, 4) gera 1, 2 e 3 (o 4 fica de fora). O print indentado repete a cada volta; o print('Fim!') sem indentação está fora do laço e roda uma vez só.",
  },
  {
    slug: "funcao-python",
    titulo: "Fábrica de Dobros",
    descricao: "Monte uma função Python que dobra um número e use ela com o valor 5.",
    linguagem: "python",
    dificuldade: "basico",
    saidaEsperada: "10",
    linhas: [
      "def dobro(n):",
      "    return n * 2",
      "resultado = dobro(5)",
      "print(resultado)",
    ],
    dica: "def cria a função (com o corpo indentado). Só depois dela existir é que dá para chamar dobro(5).",
    explicacao: "def define a receita e o corpo indentado pertence a ela. Quando chamamos dobro(5), o return devolve 10, que guardamos em 'resultado' e exibimos. Definir → chamar → mostrar.",
  },
  {
    slug: "lista-python",
    titulo: "Cesta de Frutas",
    descricao: "Monte um programa que cria uma lista com 2 frutas, adiciona 'kiwi' e mostra o total.",
    linguagem: "python",
    dificuldade: "basico",
    saidaEsperada: "3",
    linhas: [
      'frutas = ["maçã", "uva"]',
      'frutas.append("kiwi")',
      "print(len(frutas))",
    ],
    dica: "Em Python, adicionar na lista é .append() e contar é len().",
    explicacao: "A lista nasce com 2 frutas, o .append() coloca o kiwi no final, e len() conta os itens naquele momento. É o equivalente Python do push/length do JavaScript.",
  },
  {
    slug: "media-python",
    titulo: "Média com sum()",
    descricao: "Monte um programa que calcula a média de três números usando funções prontas do Python.",
    linguagem: "python",
    dificuldade: "intermediario",
    saidaEsperada: "Média: 7.0",
    linhas: [
      "numeros = [4, 7, 10]",
      "total = sum(numeros)",
      "media = total / len(numeros)",
      'print("Média: " + str(media))',
    ],
    dica: "Corrente de dependências: numeros → total → media → print. O str() converte o número em texto para juntar com a frase.",
    explicacao: "sum() soma a lista inteira e len() conta os itens — Python já traz essas ferramentas prontas. No final, str(media) converte 7.0 em texto para poder juntar com 'Média: '.",
  },
];

export function getFaseMonteCodigo(slug: string): FaseMonteCodigo | undefined {
  return fasesMonteCodigo.find((fase) => fase.slug === slug);
}

export function getProximaFase(slug: string): FaseMonteCodigo | undefined {
  const index = fasesMonteCodigo.findIndex((fase) => fase.slug === slug);
  if (index < 0) return undefined;
  return fasesMonteCodigo[index + 1];
}

export const JOGO_STORAGE_PREFIX = "orbitamos-jogo-monte";

export type FaseProgresso = {
  concluido: boolean;
  tentativas: number;
};

export function lerProgressoFase(userId: string | undefined, slug: string): FaseProgresso {
  if (typeof window === "undefined") return { concluido: false, tentativas: 0 };
  try {
    const raw = localStorage.getItem(`${JOGO_STORAGE_PREFIX}-${userId ?? "anon"}-${slug}`);
    if (!raw) return { concluido: false, tentativas: 0 };
    const parsed = JSON.parse(raw) as Partial<FaseProgresso>;
    return {
      concluido: Boolean(parsed.concluido),
      tentativas: typeof parsed.tentativas === "number" ? parsed.tentativas : 0,
    };
  } catch {
    return { concluido: false, tentativas: 0 };
  }
}

export function salvarProgressoFase(userId: string | undefined, slug: string, progresso: FaseProgresso) {
  try {
    localStorage.setItem(`${JOGO_STORAGE_PREFIX}-${userId ?? "anon"}-${slug}`, JSON.stringify(progresso));
  } catch {
    // storage indisponível — o jogo continua funcionando sem persistir
  }
}
