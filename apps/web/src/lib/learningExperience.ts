import type { Aula, Curso } from "@/lib/cursos";

export type LessonGuide = {
  kind: LessonKind;
  estimatedMinutes: number;
  objectives: string[];
  checklist: string[];
  practice: {
    title: string;
    description: string;
    deliverable: string;
    href?: string;
  };
  quiz: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
};

export type LessonKind = NonNullable<Aula["tipo"]>;

export const lessonKindLabels: Record<LessonKind, string> = {
  video: "Videoaula",
  leitura: "Leitura",
  exercicio_guiado: "Exercício guiado",
  desafio: "Desafio prático",
  projeto: "Projeto de módulo",
  quiz_revisao: "Quiz de revisão",
};

export function getLessonKind(aula: Aula): LessonKind {
  if (aula.tipo) return aula.tipo;
  const text = `${aula.titulo} ${aula.conteudo ?? ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/\bprojeto\b/.test(text)) return "projeto";
  if (/\bquiz\b|\brevisao\b/.test(text)) return "quiz_revisao";
  if (/\bdesafio\b/.test(text)) return "desafio";
  if (/\bexercicio|\batividade pratica|\bpratica guiada/.test(text)) return "exercicio_guiado";
  if (!aula.youtubeVideoId && (aula.materiais?.length ?? 0) > 0) return "leitura";
  return "video";
}

export type FlatLesson = {
  curso: Curso;
  moduloTitulo: string;
  aula: Aula;
  index: number;
  total: number;
};

export function flattenCourseLessons(curso: Curso): FlatLesson[] {
  const aulas = curso.modulos.flatMap((modulo) =>
    modulo.aulas.map((aula) => ({ moduloTitulo: modulo.titulo, aula }))
  );

  return aulas.map((item, index) => ({
    curso,
    moduloTitulo: item.moduloTitulo,
    aula: item.aula,
    index,
    total: aulas.length,
  }));
}

export function flattenAllLessons(cursos: Curso[]): FlatLesson[] {
  return cursos.flatMap(flattenCourseLessons);
}

function inferArea(curso: Curso, aula: Aula): "web" | "csharp" | "sql" | "github" | "dados" | "hardware" | "logica" | "geral" {
  const text = `${curso.slug} ${curso.titulo} ${aula.titulo}`.toLowerCase();
  if (text.includes("html") || text.includes("css") || text.includes("javascript")) return "web";
  if (text.includes("c#") || text.includes("csharp") || text.includes(".net")) return "csharp";
  if (text.includes("sql") || text.includes("banco")) return "sql";
  if (text.includes("github") || text.includes("git")) return "github";
  if (text.includes("excel") || text.includes("vba") || text.includes("power bi")) return "dados";
  if (text.includes("hardware") || text.includes("manutenção") || text.includes("manutenção")) return "hardware";
  if (text.includes("logica") || text.includes("lógica") || text.includes("python")) return "logica";
  return "geral";
}

type QuizQuestion = LessonGuide["quiz"][number];

/**
 * Bancos de perguntas por área. A seleção rotaciona por aula para que
 * aulas vizinhas do mesmo curso não repitam o mesmo quiz.
 */
const quizBanks: Record<ReturnType<typeof inferArea>, QuizQuestion[]> = {
  web: [
    {
      question: "Qual é o primeiro sinal de que uma página web está bem estruturada?",
      options: ["Ela tem seções claras", "Ela tem muitas cores", "Ela tem o maior número possível de animações"],
      answer: "Ela tem seções claras",
    },
    {
      question: "Qual tag cria o título principal de uma página HTML?",
      options: ["<h1>", "<p>", "<div>"],
      answer: "<h1>",
    },
    {
      question: "Qual é o papel do CSS em uma página?",
      options: ["Definir a aparência e o estilo", "Guardar dados no banco", "Executar a lógica do servidor"],
      answer: "Definir a aparência e o estilo",
    },
    {
      question: "O que o JavaScript adiciona a uma página web?",
      options: ["Interatividade e comportamento", "Apenas as cores", "A estrutura do texto"],
      answer: "Interatividade e comportamento",
    },
    {
      question: "Onde fica o conteúdo visível de uma página HTML?",
      options: ["Dentro do <body>", "Dentro do <head>", "No arquivo .css"],
      answer: "Dentro do <body>",
    },
    {
      question: "O que significa um site ser responsivo?",
      options: ["O layout se adapta a telas diferentes", "O site carrega sem internet", "O site traduz o conteúdo sozinho"],
      answer: "O layout se adapta a telas diferentes",
    },
  ],
  csharp: [
    {
      question: "O que mais importa ao estudar uma linguagem nova?",
      options: ["Rodar exemplos pequenos", "Memorizar tudo antes de testar", "Pular erros de compilação"],
      answer: "Rodar exemplos pequenos",
    },
    {
      question: "O que o compilador faz com o seu código C#?",
      options: ["Transforma em um programa executável", "Desenha a interface do sistema", "Substitui os testes"],
      answer: "Transforma em um programa executável",
    },
    {
      question: "Para que serve uma variável?",
      options: ["Guardar um valor na memória", "Imprimir texto na tela", "Conectar o programa à internet"],
      answer: "Guardar um valor na memória",
    },
    {
      question: "O que é o .NET?",
      options: ["A plataforma que executa o C#", "Um banco de dados", "Um editor de texto"],
      answer: "A plataforma que executa o C#",
    },
    {
      question: "Para que serve o Console.WriteLine?",
      options: ["Exibir texto no terminal", "Ler arquivos do disco", "Criar novas classes"],
      answer: "Exibir texto no terminal",
    },
  ],
  sql: [
    {
      question: "Para que serve uma cláusula WHERE?",
      options: ["Filtrar registros", "Criar uma tabela", "Trocar o nome do banco"],
      answer: "Filtrar registros",
    },
    {
      question: "Qual comando consulta dados de uma tabela?",
      options: ["SELECT", "DELETE", "DROP"],
      answer: "SELECT",
    },
    {
      question: "O que o ORDER BY faz em uma consulta?",
      options: ["Ordena o resultado", "Apaga registros", "Cria um índice novo"],
      answer: "Ordena o resultado",
    },
    {
      question: "Para que serve uma chave primária?",
      options: ["Identificar cada registro de forma única", "Deixar a consulta mais bonita", "Duplicar os dados com segurança"],
      answer: "Identificar cada registro de forma única",
    },
    {
      question: "O que o comando INSERT faz?",
      options: ["Adiciona um novo registro", "Remove a tabela inteira", "Renomeia o banco de dados"],
      answer: "Adiciona um novo registro",
    },
  ],
  github: [
    {
      question: "Qual é a função principal de um pull request?",
      options: ["Propor e revisar mudanças", "Apagar o histórico", "Substituir o editor de código"],
      answer: "Propor e revisar mudanças",
    },
    {
      question: "O que é um commit?",
      options: ["Um registro de mudanças com descrição", "Uma cópia do computador inteiro", "Um erro no código"],
      answer: "Um registro de mudanças com descrição",
    },
    {
      question: "Para que serve criar uma branch?",
      options: ["Trabalhar em mudanças sem afetar a principal", "Deletar o repositório com segurança", "Acelerar o carregamento do site"],
      answer: "Trabalhar em mudanças sem afetar a principal",
    },
    {
      question: "O que o git clone faz?",
      options: ["Baixa uma cópia do repositório", "Envia o código para produção", "Cria um novo usuário no GitHub"],
      answer: "Baixa uma cópia do repositório",
    },
    {
      question: "Qual é a boa prática ao escrever a mensagem de um commit?",
      options: ["Descrever claramente o que mudou", "Deixar em branco para ganhar tempo", "Escrever sempre a mesma palavra"],
      answer: "Descrever claramente o que mudou",
    },
  ],
  dados: [
    {
      question: "Uma boa análise começa por quê?",
      options: ["Uma pergunta clara", "Muitas cores", "Uma planilha gigante sem objetivo"],
      answer: "Uma pergunta clara",
    },
    {
      question: "Para que serve o PROCV (VLOOKUP)?",
      options: ["Buscar um valor em outra tabela", "Pintar células automaticamente", "Criar gráficos 3D"],
      answer: "Buscar um valor em outra tabela",
    },
    {
      question: "O que é um dashboard?",
      options: ["Um painel visual com indicadores", "Um tipo de impressora", "Uma fórmula de soma"],
      answer: "Um painel visual com indicadores",
    },
    {
      question: "Antes de criar um gráfico, o que verificar primeiro?",
      options: ["Se os dados estão corretos e organizados", "A cor de fundo da planilha", "O número de abas do arquivo"],
      answer: "Se os dados estão corretos e organizados",
    },
    {
      question: "O que uma tabela dinâmica faz?",
      options: ["Resume e agrupa dados rapidamente", "Corrige erros de digitação", "Envia relatórios por e-mail"],
      answer: "Resume e agrupa dados rapidamente",
    },
  ],
  hardware: [
    {
      question: "Antes de trocar uma peça, o que um técnico deve fazer?",
      options: ["Diagnosticar o problema", "Comprar qualquer peça", "Formatar sem backup"],
      answer: "Diagnosticar o problema",
    },
    {
      question: "Qual componente é considerado o cérebro do computador?",
      options: ["Processador (CPU)", "Fonte de alimentação", "Gabinete"],
      answer: "Processador (CPU)",
    },
    {
      question: "Para que serve a memória RAM?",
      options: ["Guardar os dados em uso enquanto o PC está ligado", "Armazenar arquivos para sempre", "Resfriar o sistema"],
      answer: "Guardar os dados em uso enquanto o PC está ligado",
    },
    {
      question: "O que fazer antes de abrir um gabinete?",
      options: ["Desligar da tomada e descarregar a estática", "Ligar todos os programas", "Remover o HD primeiro"],
      answer: "Desligar da tomada e descarregar a estática",
    },
    {
      question: "Qual é a principal vantagem de um SSD sobre um HD?",
      options: ["Velocidade de leitura e escrita", "Preço sempre menor", "Nunca apresenta falhas"],
      answer: "Velocidade de leitura e escrita",
    },
  ],
  logica: [
    {
      question: "Em lógica, por que pensar na saída ajuda?",
      options: ["Porque mostra onde o algoritmo precisa chegar", "Porque evita escrever qualquer código", "Porque substitui testes"],
      answer: "Porque mostra onde o algoritmo precisa chegar",
    },
    {
      question: "O que é um algoritmo?",
      options: ["Uma sequência de passos para resolver um problema", "Um tipo de computador", "Um erro de programa"],
      answer: "Uma sequência de passos para resolver um problema",
    },
    {
      question: "O que um laço (loop) faz?",
      options: ["Repete instruções", "Encerra o programa", "Apaga variáveis"],
      answer: "Repete instruções",
    },
    {
      question: "Para que serve uma condição (if)?",
      options: ["Decidir entre caminhos diferentes", "Repetir o código para sempre", "Guardar arquivos no disco"],
      answer: "Decidir entre caminhos diferentes",
    },
    {
      question: "O que é uma variável?",
      options: ["Um espaço com nome para guardar um valor", "Um defeito do programa", "Um botão da tela"],
      answer: "Um espaço com nome para guardar um valor",
    },
  ],
  geral: [
    {
      question: "Qual atitude ajuda mais no aprendizado técnico?",
      options: ["Praticar e registrar dúvidas", "Só assistir conteúdo", "Esperar entender tudo antes de tentar"],
      answer: "Praticar e registrar dúvidas",
    },
    {
      question: "Qual é a melhor forma de fixar um conteúdo novo?",
      options: ["Aplicar em um exemplo próprio", "Só reler várias vezes", "Decorar sem entender"],
      answer: "Aplicar em um exemplo próprio",
    },
    {
      question: "Quando aparecer um erro, o que fazer primeiro?",
      options: ["Ler a mensagem com calma", "Apagar tudo e recomeçar", "Trocar de exercício"],
      answer: "Ler a mensagem com calma",
    },
    {
      question: "Por que anotar dúvidas durante a aula?",
      options: ["Para buscar as respostas depois e revisar", "Para nunca mais ler", "Para preencher o caderno"],
      answer: "Para buscar as respostas depois e revisar",
    },
  ],
};

function pickQuizQuestions(area: ReturnType<typeof inferArea>, lessonIndex: number, count = 3): QuizQuestion[] {
  const bank = quizBanks[area];
  const size = Math.min(count, bank.length);
  const start = (lessonIndex * size) % bank.length;
  return Array.from({ length: size }, (_, offset) => bank[(start + offset) % bank.length]);
}

/** Sequências de desafios do laboratório para vincular uma prática diferente a cada aula. */
const jsPracticeSlugs = [
  "variaveis-js", "operadores-js", "condicionais-js", "lacos-js", "arrays-js",
  "objetos-js", "funcoes-js", "strings-js", "metodos-array-js", "assincrono-js",
];
const pythonPracticeSlugs = [
  "variaveis-python", "condicionais-python", "lacos-python", "listas-python", "dicionarios-python",
  "funcoes-python", "strings-python", "comprehensions-python", "erros-python", "classes-python",
];

export function getLessonGuide(curso: Curso, aula: Aula, lessonIndex = 0): LessonGuide {
  const area = inferArea(curso, aula);
  const materialCount = aula.materiais?.length ?? 0;
  const baseObjectives = [
    "Entender a ideia central da aula antes de copiar qualquer código.",
    "Registrar no caderno ou bloco de notas os termos que você ainda não domina.",
    materialCount > 0
      ? "Abrir o material principal e transformar a leitura em prática."
      : "Acompanhar o conteúdo principal e anotar os pontos de dúvida.",
  ];

  const jsPractice = `/estudante/pratica/${jsPracticeSlugs[lessonIndex % jsPracticeSlugs.length]}`;
  const pythonPractice = `/estudante/pratica/${pythonPracticeSlugs[lessonIndex % pythonPracticeSlugs.length]}`;

  const byArea: Record<ReturnType<typeof inferArea>, Omit<LessonGuide, "kind" | "estimatedMinutes" | "objectives" | "quiz">> = {
    web: {
      checklist: ["Criar ou editar um arquivo HTML", "Testar no navegador", "Ajustar pelo menos um detalhe visual"],
      practice: {
        href: jsPractice,
        title: "Construa uma pequena tela",
        description: "Monte uma seção simples com título, texto, botão e pelo menos uma organização visual.",
        deliverable: "Print da tela ou link do arquivo/projeto.",
      },
    },
    csharp: {
      checklist: ["Criar um exemplo pequeno", "Rodar o código", "Alterar uma regra e testar de novo"],
      practice: {
        title: "Transforme conceito em console",
        description: "Crie um programa pequeno usando o conceito da aula e imprima o resultado na tela.",
        deliverable: "Código funcionando ou print do terminal.",
      },
    },
    sql: {
      checklist: ["Identificar tabelas/campos", "Escrever uma consulta simples", "Explicar o resultado em voz alta"],
      practice: {
        title: "Escreva consultas de verdade",
        description: "Crie 3 consultas: uma listagem, um filtro e uma ordenação.",
        deliverable: "As queries SQL e o resultado esperado.",
      },
    },
    github: {
      checklist: ["Criar branch ou fork", "Fazer uma alteração pequena", "Registrar o que mudou no commit"],
      practice: {
        title: "Simule colaboração",
        description: "Faça uma alteração pequena em um repositório de treino e descreva o motivo no commit.",
        deliverable: "Link do commit, branch ou pull request.",
      },
    },
    dados: {
      checklist: ["Abrir a planilha ou relatório", "Identificar a fonte dos dados", "Criar uma análise pequena"],
      practice: {
        title: "Transforme dados em resposta",
        description: "Escolha uma pergunta simples e use a ferramenta da aula para chegar em uma resposta.",
        deliverable: "Print da planilha/dashboard ou descrição do resultado.",
      },
    },
    hardware: {
      checklist: ["Identificar a peça/conceito", "Descrever a função", "Listar um cuidado prático"],
      practice: {
        title: "Monte um diagnóstico",
        description: "Escolha um problema comum de computador e liste causa provável, teste e solução.",
        deliverable: "Checklist de diagnóstico em 3 passos.",
      },
    },
    logica: {
      checklist: ["Entender entrada", "Pensar no processamento", "Definir a saída esperada"],
      practice: {
        href: pythonPractice,
        title: "Resolva no papel antes do código",
        description: "Escreva o passo a passo de um problema simples e depois transforme em código.",
        deliverable: "Algoritmo em texto ou código testado.",
      },
    },
    geral: {
      checklist: ["Ler/ver o conteúdo", "Anotar dúvidas", "Aplicar em um exemplo pequeno"],
      practice: {
        title: "Faça uma prática mínima",
        description: "Crie um exemplo simples usando o tema da aula e registre onde travou.",
        deliverable: "Anotação, print ou arquivo da prática.",
      },
    },
  };

  return {
    estimatedMinutes: materialCount > 0 ? 35 : 25,
    objectives: [
      `Concluir a etapa ${lessonIndex + 1} da trilha ${curso.titulo}.`,
      ...baseObjectives,
    ],
    ...byArea[area],
    quiz: pickQuizQuestions(area, lessonIndex),
    kind: getLessonKind(aula),
  };
}

export function getNextIncompleteLesson(cursos: Curso[], completedLessonIds: Set<string>): FlatLesson | null {
  const lessons = flattenAllLessons(cursos);
  return lessons.find((item) => !completedLessonIds.has(item.aula.id)) ?? lessons[0] ?? null;
}
