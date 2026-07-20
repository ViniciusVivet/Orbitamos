import type { Aula, Curso } from "@/lib/cursos";

export type LessonGuide = {
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

  const byArea: Record<ReturnType<typeof inferArea>, Omit<LessonGuide, "estimatedMinutes" | "objectives">> = {
    web: {
      checklist: ["Criar ou editar um arquivo HTML", "Testar no navegador", "Ajustar pelo menos um detalhe visual"],
      practice: {
        href: "/estudante/pratica/variaveis-js",
        title: "Construa uma pequena tela",
        description: "Monte uma seção simples com título, texto, botão e pelo menos uma organização visual.",
        deliverable: "Print da tela ou link do arquivo/projeto.",
      },
      quiz: [
        {
          question: "Qual é o primeiro sinal de que uma página web está bem estruturada?",
          options: ["Ela tem seções claras", "Ela tem muitas cores", "Ela tem o maior número possível de animações"],
          answer: "Ela tem seções claras",
        },
      ],
    },
    csharp: {
      checklist: ["Criar um exemplo pequeno", "Rodar o código", "Alterar uma regra e testar de novo"],
      practice: {
        title: "Transforme conceito em console",
        description: "Crie um programa pequeno usando o conceito da aula e imprima o resultado na tela.",
        deliverable: "Código funcionando ou print do terminal.",
      },
      quiz: [
        {
          question: "O que mais importa ao estudar uma linguagem nova?",
          options: ["Rodar exemplos pequenos", "Memorizar tudo antes de testar", "Pular erros de compilação"],
          answer: "Rodar exemplos pequenos",
        },
      ],
    },
    sql: {
      checklist: ["Identificar tabelas/campos", "Escrever uma consulta simples", "Explicar o resultado em voz alta"],
      practice: {
        title: "Escreva consultas de verdade",
        description: "Crie 3 consultas: uma listagem, um filtro e uma ordenação.",
        deliverable: "As queries SQL e o resultado esperado.",
      },
      quiz: [
        {
          question: "Para que serve uma cláusula WHERE?",
          options: ["Filtrar registros", "Criar uma tabela", "Trocar o nome do banco"],
          answer: "Filtrar registros",
        },
      ],
    },
    github: {
      checklist: ["Criar branch ou fork", "Fazer uma alteração pequena", "Registrar o que mudou no commit"],
      practice: {
        title: "Simule colaboração",
        description: "Faça uma alteração pequena em um repositório de treino e descreva o motivo no commit.",
        deliverable: "Link do commit, branch ou pull request.",
      },
      quiz: [
        {
          question: "Qual é a função principal de um pull request?",
          options: ["Propor e revisar mudanças", "Apagar o histórico", "Substituir o editor de código"],
          answer: "Propor e revisar mudanças",
        },
      ],
    },
    dados: {
      checklist: ["Abrir a planilha ou relatório", "Identificar a fonte dos dados", "Criar uma análise pequena"],
      practice: {
        title: "Transforme dados em resposta",
        description: "Escolha uma pergunta simples e use a ferramenta da aula para chegar em uma resposta.",
        deliverable: "Print da planilha/dashboard ou descrição do resultado.",
      },
      quiz: [
        {
          question: "Uma boa análise começa por quê?",
          options: ["Uma pergunta clara", "Muitas cores", "Uma planilha gigante sem objetivo"],
          answer: "Uma pergunta clara",
        },
      ],
    },
    hardware: {
      checklist: ["Identificar a peça/conceito", "Descrever a função", "Listar um cuidado prático"],
      practice: {
        title: "Monte um diagnóstico",
        description: "Escolha um problema comum de computador e liste causa provável, teste e solução.",
        deliverable: "Checklist de diagnóstico em 3 passos.",
      },
      quiz: [
        {
          question: "Antes de trocar uma peça, o que um técnico deve fazer?",
          options: ["Diagnosticar o problema", "Comprar qualquer peça", "Formatar sem backup"],
          answer: "Diagnosticar o problema",
        },
      ],
    },
    logica: {
      checklist: ["Entender entrada", "Pensar no processamento", "Definir a saída esperada"],
      practice: {
        href: "/estudante/pratica/variaveis-python",
        title: "Resolva no papel antes do código",
        description: "Escreva o passo a passo de um problema simples e depois transforme em código.",
        deliverable: "Algoritmo em texto ou código testado.",
      },
      quiz: [
        {
          question: "Em lógica, por que pensar na saída ajuda?",
          options: ["Porque mostra onde o algoritmo precisa chegar", "Porque evita escrever qualquer código", "Porque substitui testes"],
          answer: "Porque mostra onde o algoritmo precisa chegar",
        },
      ],
    },
    geral: {
      checklist: ["Ler/ver o conteúdo", "Anotar dúvidas", "Aplicar em um exemplo pequeno"],
      practice: {
        title: "Faça uma prática mínima",
        description: "Crie um exemplo simples usando o tema da aula e registre onde travou.",
        deliverable: "Anotação, print ou arquivo da prática.",
      },
      quiz: [
        {
          question: "Qual atitude ajuda mais no aprendizado técnico?",
          options: ["Praticar e registrar dúvidas", "Só assistir conteúdo", "Esperar entender tudo antes de tentar"],
          answer: "Praticar e registrar dúvidas",
        },
      ],
    },
  };

  return {
    estimatedMinutes: materialCount > 0 ? 35 : 25,
    objectives: [
      `Concluir a etapa ${lessonIndex + 1} da trilha ${curso.titulo}.`,
      ...baseObjectives,
    ],
    ...byArea[area],
  };
}

export function getNextIncompleteLesson(cursos: Curso[], completedLessonIds: Set<string>): FlatLesson | null {
  const lessons = flattenAllLessons(cursos);
  return lessons.find((item) => !completedLessonIds.has(item.aula.id)) ?? lessons[0] ?? null;
}
