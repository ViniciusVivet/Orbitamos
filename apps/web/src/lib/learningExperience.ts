import type { Aula, AulaResumo, Curso, CursoResumo } from "@/lib/cursos";

export type LessonGuide = {
  kind: LessonKind;
  origin: "authored" | "general";
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
    },
    {
      question: "A promoção vale para pedidos de 100 ou mais. Qual condição inclui exatamente 100?",
      options: ["valorPedido > 100", "valorPedido >= 100", "valorPedido < 100"],
      answer: "valorPedido >= 100",
    },
    {
      question: "Para conferir a regra de 100 ou mais, qual grupo de testes investiga melhor a fronteira?",
      options: ["99, 100 e 101", "100, 100 e 100", "150, 200 e 300"],
      answer: "99, 100 e 101",
    },
  ],
};

export function getLessonGuide(curso: Curso, aula: Aula, lessonIndex = 0): LessonGuide {
  // The stable local ID also appears as a slug when a database UUID is used.
  if (curso.slug === "csharp-fundamentos" && (aula.slug ?? aula.id) === "csharp-a6") {
    return { ...conditionsLessonGuide, kind: getLessonKind(aula) };
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

export type LessonQuizScore = { lessonId: string; correct: number; total: number };

/** A previous lesson or an absent assessment cannot mark this review complete. */
export function isLessonQuizComplete(lessonId: string, questions: LessonGuide["quiz"], score: LessonQuizScore | null): boolean {
  return questions.length > 0 && score?.lessonId === lessonId && score.total === questions.length && score.correct === score.total;
}

export function getNextIncompleteLesson(cursos: Curso[], completedLessonIds: Set<string>): FlatLesson | null;
export function getNextIncompleteLesson(cursos: CursoResumo[], completedLessonIds: Set<string>): FlatLessonResumo | null;
export function getNextIncompleteLesson(cursos: CursoResumo[], completedLessonIds: Set<string>): FlatLessonResumo | null {
  const lessons = flattenAllLessons(cursos);
  return lessons.find((item) => !completedLessonIds.has(item.aula.id)) ?? lessons[0] ?? null;
}
