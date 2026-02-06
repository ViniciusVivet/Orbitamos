/**
 * Estrutura de cursos da OrbitAcademy (modulos e aulas).
 * Videos sao embeds do YouTube — ponte pelo proprio site.
 */

export interface Aula {
  id: string;
  titulo: string;
  /** ID do video no YouTube (ex.: dQw4w9WgXcQ) para embed */
  youtubeVideoId: string;
  /** Texto opcional ao lado do video */
  conteudo?: string;
}

export interface Modulo {
  id: string;
  titulo: string;
  aulas: Aula[];
}

export interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descricao?: string;
  modulos: Modulo[];
}

/** Lista de cursos disponiveis (mock; depois pode vir da API) */
export const cursos: Curso[] = [
  {
    id: "1",
    slug: "html-css-basico",
    titulo: "HTML/CSS Basico",
    descricao: "Fundamentos de marcação e estilo para a web.",
    modulos: [
      {
        id: "m1",
        titulo: "Introducao",
        aulas: [
          { id: "a1", titulo: "Introducao e Dicas para quem esta comecando", youtubeVideoId: "dQw4w9WgXcQ", conteudo: "• O que e HTML e CSS\n• Ferramentas necessarias" },
          { id: "a2", titulo: "Instalando as ferramentas (Windows)", youtubeVideoId: "dQw4w9WgXcQ" },
          { id: "a3", titulo: "Instalando as ferramentas (Mac)", youtubeVideoId: "dQw4w9WgXcQ" },
        ],
      },
      {
        id: "m2",
        titulo: "Primeiros passos",
        aulas: [
          { id: "a4", titulo: "Estrutura basica de um HTML", youtubeVideoId: "dQw4w9WgXcQ" },
          { id: "a5", titulo: "Seletores CSS", youtubeVideoId: "dQw4w9WgXcQ" },
        ],
      },
    ],
  },
  {
    id: "2",
    slug: "js-essencial",
    titulo: "JS Essencial",
    descricao: "JavaScript do zero ao essencial.",
    modulos: [
      {
        id: "m3",
        titulo: "Comecando com JavaScript",
        aulas: [
          { id: "a6", titulo: "O que e JavaScript", youtubeVideoId: "dQw4w9WgXcQ" },
          { id: "a7", titulo: "Variaveis e tipos", youtubeVideoId: "dQw4w9WgXcQ" },
        ],
      },
    ],
  },
  {
    id: "3",
    slug: "react-iniciantes",
    titulo: "React para Iniciantes",
    descricao: "Construa interfaces com React.",
    modulos: [
      {
        id: "m4",
        titulo: "Fundamentos",
        aulas: [
          { id: "a8", titulo: "O que e React", youtubeVideoId: "dQw4w9WgXcQ" },
          { id: "a9", titulo: "Seu primeiro componente", youtubeVideoId: "dQw4w9WgXcQ" },
        ],
      },
    ],
  },
];

/** Total de aulas de um curso */
export function totalAulas(curso: Curso): number {
  return curso.modulos.reduce((acc, m) => acc + m.aulas.length, 0);
}

/** Encontra curso por slug */
export function cursoPorSlug(slug: string): Curso | undefined {
  return cursos.find((c) => c.slug === slug);
}

/** Encontra aula por id em todo o curso */
export function aulaNoCurso(curso: Curso, aulaId: string): Aula | undefined {
  for (const mod of curso.modulos) {
    const aula = mod.aulas.find((a) => a.id === aulaId);
    if (aula) return aula;
  }
  return undefined;
}

/** Retorna a proxima aula (id) apos a dada, ou null */
export function proximaAulaId(curso: Curso, aulaId: string): string | null {
  let found = false;
  for (const mod of curso.modulos) {
    for (let i = 0; i < mod.aulas.length; i++) {
      if (mod.aulas[i].id === aulaId) {
        if (i + 1 < mod.aulas.length) return mod.aulas[i + 1].id;
        const nextMod = curso.modulos.indexOf(mod) + 1;
        if (nextMod < curso.modulos.length && curso.modulos[nextMod].aulas.length > 0) {
          return curso.modulos[nextMod].aulas[0].id;
        }
        return null;
      }
    }
  }
  return null;
}
