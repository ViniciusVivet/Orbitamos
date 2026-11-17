import type { Aula, AulaResumo, Curso, CursoResumo } from "@/lib/cursos";

export type LessonGuide = {
  kind: LessonKind;
  origin: "authored" | "general";
  /** New authored assessments must not consume answers to a legacy area quiz. */
  quizVersion?: string;
  estimatedMinutes: number | null;
  objectives: string[];
  checklist: string[];
  practice: {
    title: string;
    description: string;
    deliverable: string;
    href?: string;
  } | null;
  quiz: Array<{
    question: string;
    code?: string;
    options: string[];
    answer: string;
    explanation?: string;
    hint?: string;
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

export type FlatLessonResumo = {
  curso: CursoResumo;
  moduloTitulo: string;
  aula: AulaResumo;
  index: number;
  total: number;
};

export type FlatLesson = FlatLessonResumo & { curso: Curso; aula: Aula };

export function flattenCourseLessons(curso: Curso): FlatLesson[];
export function flattenCourseLessons(curso: CursoResumo): FlatLessonResumo[];
export function flattenCourseLessons(curso: CursoResumo): FlatLessonResumo[] {
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

export function flattenAllLessons(cursos: Curso[]): FlatLesson[];
export function flattenAllLessons(cursos: CursoResumo[]): FlatLessonResumo[];
export function flattenAllLessons(cursos: CursoResumo[]): FlatLessonResumo[] {
  return cursos.flatMap((curso) => flattenCourseLessons(curso));
}

/** Authored alignment for this stable lesson; it does not certify the linked video. */
const variablesLessonGuide: Omit<LessonGuide, "kind"> = {
  origin: "authored",
  quizVersion: "variables-v1",
  estimatedMinutes: 20,
  objectives: [
    "Distinguir o nome de uma variável do texto escrito entre aspas.",
    "Usar string para um nome e int para uma contagem, respeitando o tipo do valor.",
    "Acompanhar reatribuições e calcular pendências usando as variáveis.",
  ],
  checklist: [
    "Prever a saída de uma variável e de um texto literal antes de executar.",
    "Escrever um nome e uma contagem nas atividades de texto e números.",
    "Alterar um valor, calcular a diferença e explicar o resumo final.",
  ],
  practice: {
    title: "Dê nome aos dados do seu serviço",
    description: "Pratique string, int, atribuição, soma/subtração e saída no console, no navegador. Este recorte ainda não ensina double, var ou conversões; bool entra em condições.",
    deliverable: "Um resumo com nome, contagens e pendências calculadas; explique qual valor mudou e de onde veio a diferença.",
    href: "/estudante/trilhas/csharp?module=variables",
  },
  quiz: [
    {
      question: "O que aparece nas duas linhas da saída?",
      code: 'string cliente = "Bia";\nConsole.WriteLine(cliente);\nConsole.WriteLine("cliente");',
      options: ["cliente, depois cliente", "Bia, depois cliente", "Bia, depois Bia"],
      answer: "Bia, depois cliente",
      explanation: "Sem aspas, cliente lê o valor Bia. Com aspas, a segunda chamada mostra o texto literal cliente.",
      hint: "Compare a primeira chamada, sem aspas, com a segunda. Só uma delas lê o valor guardado na variável.",
    },
    {
      question: "Qual declaração guarda uma contagem numérica pronta para uma soma, sem converter texto?",
      options: ['int quantidade = 7;', 'string quantidade = "7";', 'int quantidade = "7";'],
      answer: "int quantidade = 7;",
      explanation: "int recebe o inteiro 7. string com aspas guarda texto; atribuir esse texto diretamente a int causa erro de tipo.",
      hint: "Observe o tipo declarado e as aspas. O valor precisa ser compatível com int, sem uma conversão adicional.",
    },
    {
      question: "Qual valor a última linha mostra?",
      code: "int pendentes = 7;\npendentes = pendentes + 4;\npendentes = pendentes - 3;\nConsole.WriteLine(pendentes);",
      options: ["7", "11", "8"],
      answer: "8",
      explanation: "O valor vai de 7 para 11 e depois para 8. Cada atribuição substitui o valor guardado, e a próxima linha usa o valor novo.",
      hint: "Anote o valor após cada atribuição. Ainda há uma subtração depois da soma.",
    },
  ],
};

const conditionsLessonGuide: Omit<LessonGuide, "kind"> = {
  origin: "authored",
  estimatedMinutes: 20,
  objectives: [
    "Prever qual bloco de if/else será executado para uma quantidade de serviços.",
    "Distinguir > de >= testando um pedido exatamente no limite da promoção.",
    "Escrever e testar uma decisão com outra entrada, sem depender do exemplo.",
  ],
  checklist: [
    "Prever a saída antes de executar o exemplo de if/else.",
    "Testar o caso sem serviços pendentes e o caso com trabalho.",
    "Conferir valores abaixo, iguais e acima do limite de uma promoção.",
  ],
  practice: {
    title: "Decida o próximo passo do OrbiServiços",
    description: "Pratique if/else, o valor exato de um limite e a correção de uma condição. Comece pelo módulo de condições; os laços são o próximo assunto da trilha.",
    deliverable: "Uma decisão testada com entradas diferentes e a explicação de qual caminho cada caso tomou.",
    href: "/estudante/trilhas/csharp?module=conditions",
  },
  quiz: [
    {
      question: "pendentes vale 0. Em if (pendentes > 0), qual caminho de if/else executa?",
      options: ["O else, porque 0 não é maior que 0", "O if, porque 0 é um número", "Os dois caminhos"],
      answer: "O else, porque 0 não é maior que 0",
      explanation: "A comparação 0 > 0 é falsa. Por isso o programa executa apenas o bloco else.",
      hint: "Compare 0 com 0. Ser um número não torna automaticamente verdadeira a comparação com >.",
    },
    {
      question: "A promoção vale para pedidos de 100 ou mais. Qual condição inclui exatamente 100?",
      options: ["valorPedido > 100", "valorPedido >= 100", "valorPedido < 100"],
      answer: "valorPedido >= 100",
      explanation: ">= inclui o valor exato de 100; > só aceita valores acima dele.",
      hint: "O pedido de exatamente 100 também precisa receber a promoção. Confira o que cada operador faz com a igualdade.",
    },
    {
      question: "Para conferir a regra de 100 ou mais, qual grupo de testes investiga melhor a fronteira?",
      options: ["99, 100 e 101", "100, 100 e 100", "150, 200 e 300"],
      answer: "99, 100 e 101",
      explanation: "Esses valores conferem os dois lados e o próprio limite. Assim é possível revelar uma troca indevida entre > e >=.",
      hint: "Escolha um conjunto que teste abaixo do limite, exatamente nele e logo acima.",
    },
  ],
};

export function getLessonGuide(curso: Curso, aula: Aula, lessonIndex = 0): LessonGuide {
  // The stable local ID also appears as a slug when a database UUID is used.
  if (curso.slug === "csharp-fundamentos") {
    const stableId = aula.slug ?? aula.id;
    const authored = stableId === "csharp-a5" ? variablesLessonGuide : stableId === "csharp-a6" ? conditionsLessonGuide : null;
    if (authored) return { ...authored, kind: getLessonKind(aula) };
  }
  // Kept for callers using the legacy signature. Position cannot choose content.
  void lessonIndex;
  return {
    origin: "general",
    kind: getLessonKind(aula),
    estimatedMinutes: null,
    objectives: ["Acompanhe o conteúdo e anote uma ideia que entendeu e uma dúvida."],
    checklist: [],
    practice: null,
    quiz: [],
  };
}

/** Preserve explicit catalog questions; do not manufacture an assessment by area. */
export function getLessonQuiz(aula: Aula, guide: LessonGuide): LessonGuide["quiz"] {
  return aula.quiz?.length ? aula.quiz : guide.quiz;
}

export function getLessonQuizStorageKey(owner: string | number | null | undefined, aula: Aula, guide: LessonGuide): string | null {
  if (owner === null || owner === undefined) return null;
  const version = !aula.quiz?.length ? guide.quizVersion : undefined;
  return `orbitamos-quiz-v2-${owner}-${aula.id}${version ? `-${version}` : ""}`;
}

export type LessonQuizScore = { lessonId: string; quizKey?: string | null; correct: number; total: number };

/** A previous lesson or an absent assessment cannot mark this review complete. */
export function isLessonQuizComplete(lessonId: string, questions: LessonGuide["quiz"], score: LessonQuizScore | null, quizKey?: string | null): boolean {
  return questions.length > 0 && score?.lessonId === lessonId && (quizKey === undefined || score.quizKey === quizKey) && score.total === questions.length && score.correct === score.total;
}

export function getNextIncompleteLesson(cursos: Curso[], completedLessonIds: Set<string>): FlatLesson | null;
export function getNextIncompleteLesson(cursos: CursoResumo[], completedLessonIds: Set<string>): FlatLessonResumo | null;
export function getNextIncompleteLesson(cursos: CursoResumo[], completedLessonIds: Set<string>): FlatLessonResumo | null {
  const lessons = flattenAllLessons(cursos);
  return lessons.find((item) => !completedLessonIds.has(item.aula.id)) ?? lessons[0] ?? null;
}
