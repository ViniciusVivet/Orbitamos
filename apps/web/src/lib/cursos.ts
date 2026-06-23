/**
 * Estrutura de cursos da OrbitAcademy (modulos e aulas).
 * Videos sao embeds do YouTube — ponte pelo proprio site.
 */

import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

export interface Aula {
  id: string;
  titulo: string;
  /** ID do video no YouTube (ex.: dQw4w9WgXcQ) para embed */
  youtubeVideoId: string;
  /** Texto opcional ao lado do video */
  conteudo?: string;
  materiais?: MaterialAula[];
}

export interface MaterialAula {
  id: string;
  titulo: string;
  tipo: string;
  url: string;
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

export type CourseTrack = {
  id: string;
  titulo: string;
  descricao: string;
  icon: string;
  slugs: string[];
};

export const courseTracks: CourseTrack[] = [
  {
    id: "logica",
    titulo: "Trilha Logica",
    descricao: "Base de raciocinio, algoritmo e primeiros passos em programacao.",
    icon: "🧠",
    slugs: ["logica-programacao-python"],
  },
  {
    id: "web",
    titulo: "Trilha HTML",
    descricao: "Fundamentos de paginas, interfaces e experiencias web.",
    icon: "🧱",
    slugs: ["html-css-js"],
  },
  {
    id: "csharp",
    titulo: "Trilha C#",
    descricao: "Primeiros passos no ecossistema C# e .NET.",
    icon: "💻",
    slugs: ["csharp-fundamentos"],
  },
  {
    id: "sql",
    titulo: "Trilha SQL",
    descricao: "Banco de dados relacional, consultas e pratica com dados.",
    icon: "📊",
    slugs: ["sql-na-pratica"],
  },
  {
    id: "github",
    titulo: "Trilha GitHub",
    descricao: "Versionamento, fork, pull request e colaboracao.",
    icon: "😼",
    slugs: ["github-colaborativo"],
  },
  {
    id: "office",
    titulo: "Trilha Office e Dados",
    descricao: "Excel, VBA e Power BI para analise e automacao.",
    icon: "📗",
    slugs: ["excel-procv", "vba-excel", "power-bi"],
  },
  {
    id: "hardware",
    titulo: "Trilha Hardware",
    descricao: "Montagem, manutencao e sistema operacional.",
    icon: "🛠️",
    slugs: ["montagem-manutencao"],
  },
];

export function getCourseTrackGroups(cursosList: Curso[]) {
  const usedSlugs = new Set<string>();
  const groups = courseTracks
    .map((track) => {
      const cursos = track.slugs
        .map((slug) => cursosList.find((curso) => curso.slug === slug))
        .filter((curso): curso is Curso => Boolean(curso));
      cursos.forEach((curso) => usedSlugs.add(curso.slug));
      return { ...track, cursos };
    })
    .filter((track) => track.cursos.length > 0);

  const extras = cursosList.filter((curso) => !usedSlugs.has(curso.slug));
  if (extras.length > 0) {
    groups.push({
      id: "outros",
      titulo: "Outras trilhas",
      descricao: "Cursos complementares da OrbitAcademy.",
      icon: "🎓",
      slugs: extras.map((curso) => curso.slug),
      cursos: extras,
    });
  }

  return groups;
}

function material(id: string, titulo: string, tipo: string, url: string): MaterialAula {
  return { id, titulo, tipo, url: normalizeMaterialUrl(url) };
}

function normalizeMaterialUrl(url: string | null | undefined): string {
  if (!url) return "";

  const trimmed = url.trim();
  if (trimmed.startsWith("/api/course-materials/")) {
    return trimmed.split("?")[0];
  }

  const publicPathMatch = trimmed.match(/\/course-materials\/(.+)$/);
  if (publicPathMatch) {
    return `/api/course-materials/${publicPathMatch[1]}`;
  }

  return trimmed;
}

/** Lista de cursos disponiveis (fallback local; em producao vem do Supabase). */
export const cursos: Curso[] = [
  {
    id: "fallback-html-css-js",
    slug: "html-css-js",
    titulo: "HTML, CSS e JavaScript",
    descricao: "Base pratica para criar paginas, dashboards e interfaces web.",
    modulos: [
      {
        id: "html-css-js-m1",
        titulo: "Fundamentos e pratica web",
        aulas: [
          {
            id: "html-css-js-a1",
            titulo: "HTML do zero",
            youtubeVideoId: "",
            conteudo: "Estrutura inicial de uma pagina HTML antes de entrar em CSS e JavaScript.",
            materiais: [material("html-css-js-mat-1", "HTML do zero", "DOCX", "/course-materials/html-css-js/04-html-do-zero-sem-css-e-sem-javascript.docx")],
          },
          {
            id: "html-css-js-a2",
            titulo: "HTML, CSS e JS - atividade pratica",
            youtubeVideoId: "",
            conteudo: "Exercicio guiado para aplicar estrutura, estilo e comportamento em uma pagina simples.",
            materiais: [material("html-css-js-mat-2", "Atividade pratica HTML, CSS e JS", "DOCX", "/course-materials/html-css-js/02-html-js-e-css-atv-pratica-1.docx")],
          },
          {
            id: "html-css-js-a3",
            titulo: "Dashboard futurista com HTML",
            youtubeVideoId: "",
            conteudo: "Material para construir uma interface visual mais elaborada e treinar composicao de tela.",
            materiais: [material("html-css-js-mat-3", "HTML Dashboard Futurista", "DOCX", "/course-materials/html-css-js/01-html-dashboard-futurista.docx")],
          },
          {
            id: "html-css-js-a4",
            titulo: "HTML - aula 1",
            youtubeVideoId: "",
            conteudo: "Reforco de marcacao e organizacao inicial de conteudo web.",
            materiais: [material("html-css-js-mat-4", "HTML - aula 1", "DOCX", "/course-materials/html-css-js/03-html-1.docx")],
          },
        ],
      },
    ],
  },
  {
    id: "fallback-logica-python",
    slug: "logica-programacao-python",
    titulo: "Logica de Programacao com Python",
    descricao: "Primeiros passos de algoritmo, raciocinio logico e pratica com Python.",
    modulos: [
      {
        id: "logica-python-m1",
        titulo: "Fundamentos",
        aulas: [
          { id: "logica-python-a0", titulo: "Aula 0 - introducao a logica", youtubeVideoId: "", materiais: [material("logica-python-mat-0", "Logica de programacao - aula 0", "DOCX", "/course-materials/logica-programacao-python/04-logica-de-programacao-aula-0.docx")] },
          { id: "logica-python-a1", titulo: "Apostila de logica com Python", youtubeVideoId: "", materiais: [material("logica-python-mat-1", "Apostila - logica de programacao com Python", "DOCX", "/course-materials/logica-programacao-python/01-apostila-logica-de-programacao-com-python.docx")] },
          { id: "logica-python-a2", titulo: "Logica de programacao com Python", youtubeVideoId: "", materiais: [material("logica-python-mat-2", "Logica de programacao com Python", "DOCX", "/course-materials/logica-programacao-python/02-logica-de-programacao-com-python.docx")] },
          { id: "logica-python-a3", titulo: "Logica de programacao - parte 2", youtubeVideoId: "", materiais: [material("logica-python-mat-3", "Logica de programacao - parte 2", "DOCX", "/course-materials/logica-programacao-python/03-logica-de-programacao-2.docx")] },
          { id: "logica-python-a4", titulo: "Aula 3 - pratica com Python", youtubeVideoId: "", materiais: [material("logica-python-mat-4", "Logica de programacao - aula 3 com Python", "DOCX", "/course-materials/logica-programacao-python/05-logica-de-programacao-aula-3-com-python.docx")] },
        ],
      },
    ],
  },
  {
    id: "fallback-csharp",
    slug: "csharp-fundamentos",
    titulo: "C# Fundamentos",
    descricao: "Base de C# para quem esta iniciando no ecossistema .NET.",
    modulos: [
      {
        id: "csharp-m1",
        titulo: "Primeiras aulas",
        aulas: [
          { id: "csharp-a1", titulo: "C# - aula 1", youtubeVideoId: "", materiais: [material("csharp-mat-1", "C# - aula 1", "DOCX", "/course-materials/csharp-fundamentos/03-c-aula-1.docx")] },
          { id: "csharp-a2", titulo: "C# - atividade pratica 1", youtubeVideoId: "", materiais: [material("csharp-mat-2", "C# - atividade pratica 1", "DOCX", "/course-materials/csharp-fundamentos/01-c-aula-pratica-atv-1.docx")] },
          { id: "csharp-a3", titulo: "Averiguar C#", youtubeVideoId: "", materiais: [material("csharp-mat-3", "Averiguar C#", "DOCX", "/course-materials/csharp-fundamentos/02-averiguar-c.docx")] },
          { id: "csharp-a4", titulo: "C# nivel medio - Cinema do Bruno", youtubeVideoId: "", materiais: [material("csharp-mat-4", "C# nivel medio - Cinema do Bruno", "DOCX", "/course-materials/csharp-fundamentos/04-c-2-nivel-medio-cinema-do-bruno.docx")] },
        ],
      },
    ],
  },
  {
    id: "fallback-sql",
    slug: "sql-na-pratica",
    titulo: "SQL na Pratica",
    descricao: "Banco de dados relacional, consultas e exercicios com SQL.",
    modulos: [
      { id: "sql-m1", titulo: "Banco de dados", aulas: [
        { id: "sql-a1", titulo: "Introducao ao SQL", youtubeVideoId: "", materiais: [material("sql-mat-1", "Introducao ao SQL - banco de dados na pratica", "DOCX", "/course-materials/sql-na-pratica/02-introducao-ao-sql-banco-de-dados-na-pratica.docx")] },
        { id: "sql-a2", titulo: "SQL na pratica 2 - Oracle Live", youtubeVideoId: "", materiais: [material("sql-mat-2", "SQL na pratica 2 - Oracle Live", "DOCX", "/course-materials/sql-na-pratica/01-sql-na-pratica-2-oracle-live.docx")] },
      ] },
    ],
  },
  {
    id: "fallback-github",
    slug: "github-colaborativo",
    titulo: "GitHub Colaborativo",
    descricao: "Fluxo basico e intermediario com fork, pull request e colaboracao.",
    modulos: [
      { id: "github-m1", titulo: "Fluxo de colaboracao", aulas: [
        { id: "github-a1", titulo: "GitHub basico ao intermediario", youtubeVideoId: "", materiais: [material("github-mat-1", "GitHub basico ao intermediario", "DOCX", "/course-materials/github-colaborativo/03-github-basico-intermediario.docx")] },
        { id: "github-a2", titulo: "Fork e pull request", youtubeVideoId: "", materiais: [material("github-mat-2", "GitHub - fork e pull request", "DOCX", "/course-materials/github-colaborativo/01-github-fork-pull-request.docx")] },
        { id: "github-a3", titulo: "Pull request na pratica", youtubeVideoId: "", materiais: [material("github-mat-3", "GitHub - fork e pull request PR", "DOCX", "/course-materials/github-colaborativo/02-github-fork-pull-request-pr.docx")] },
      ] },
    ],
  },
  {
    id: "fallback-excel",
    slug: "excel-procv",
    titulo: "Excel - PROCV",
    descricao: "Consulta de dados e automacao inicial de planilhas com PROCV.",
    modulos: [
      { id: "excel-m1", titulo: "Funcoes de busca", aulas: [
        { id: "excel-a1", titulo: "Excel PROCV", youtubeVideoId: "", materiais: [material("excel-mat-1", "Excel PROCV", "DOCX", "/course-materials/excel-procv/01-excel-procv.docx")] },
      ] },
    ],
  },
  {
    id: "fallback-vba",
    slug: "vba-excel",
    titulo: "VBA para Excel",
    descricao: "Macros, formularios e gravacao em planilhas como banco de dados.",
    modulos: [
      { id: "vba-m1", titulo: "Automacao no Excel", aulas: [
        { id: "vba-a1", titulo: "VBA para Excel avancado - atividade pratica", youtubeVideoId: "", materiais: [material("vba-mat-1", "VBA para Excel avancado - atividade pratica", "DOCX", "/course-materials/vba-excel/01-vba-para-excel-avancado-atv-pratica-1.docx")] },
        { id: "vba-a2", titulo: "Banco de dados em planilha", youtubeVideoId: "", materiais: [material("vba-mat-2", "Banco de dados XLSM", "XLSM", "/course-materials/vba-excel/02-banco-de-dados-xlsm2005.xlsm")] },
        { id: "vba-a3", titulo: "Formulario que grava no banco de dados", youtubeVideoId: "", materiais: [material("vba-mat-3", "Apostila VBA - formulario com banco de dados", "DOCX", "/course-materials/vba-excel/03-apostila-vba-no-excel-formulario-que-grava-no-banco-de-dados.docx")] },
      ] },
    ],
  },
  {
    id: "fallback-power-bi",
    slug: "power-bi",
    titulo: "Power BI",
    descricao: "Primeiros passos em analise visual de dados com Power BI.",
    modulos: [
      { id: "power-bi-m1", titulo: "Aula inicial", aulas: [
        { id: "power-bi-a1", titulo: "Power BI - aula 1", youtubeVideoId: "", materiais: [material("power-bi-mat-1", "Power BI - aula 1", "DOCX", "/course-materials/power-bi/01-aula-1-power-bi.docx")] },
        { id: "power-bi-a2", titulo: "Gabarito Power BI - aula 1", youtubeVideoId: "", materiais: [material("power-bi-mat-2", "Gabarito Power BI - aula 1", "DOCX", "/course-materials/power-bi/02-gabarito-powerbi-aula-1.docx")] },
      ] },
    ],
  },
  {
    id: "fallback-manutencao",
    slug: "montagem-manutencao",
    titulo: "Montagem e Manutencao",
    descricao: "Hardware, manutencao e sistema operacional Linux.",
    modulos: [
      { id: "manutencao-m1", titulo: "Hardware e sistema operacional", aulas: [
        { id: "manutencao-a1", titulo: "Pecas de hardware do computador", youtubeVideoId: "", materiais: [material("manutencao-mat-1", "Pecas de hardware do computador", "DOCX", "/course-materials/montagem-manutencao/01-pecas-de-hardware-do-computador.docx")] },
        { id: "manutencao-a2", titulo: "Desafio pratico - tecnico de hardware", youtubeVideoId: "", materiais: [material("manutencao-mat-2", "Desafio pratico - tecnico de hardware", "DOCX", "/course-materials/montagem-manutencao/02-desafio-pratico-tecnico-de-hardware.docx")] },
        { id: "manutencao-a3", titulo: "Sistema operacional Linux", youtubeVideoId: "", materiais: [material("manutencao-mat-3", "Montagem e manutencao - Linux", "DOCX", "/course-materials/montagem-manutencao/03-montagem-manutencao-sistema-operacional-linux.docx")] },
      ] },
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

type SupabaseLessonRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  content: string | null;
  position: number | null;
  lesson_materials?: Array<{
    id: string;
    title: string;
    kind: string;
    file_url: string | null;
    external_url: string | null;
    position: number | null;
  }>;
};

type SupabaseModuleRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number | null;
  lessons?: SupabaseLessonRow[];
};

type SupabaseCourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number | null;
  course_modules?: SupabaseModuleRow[];
};

function mapSupabaseCourse(row: SupabaseCourseRow): Curso {
  const modules = [...(row.course_modules ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.title,
    descricao: row.description ?? undefined,
    modulos: modules.map((mod) => ({
      id: mod.id,
      titulo: mod.title,
      aulas: [...(mod.lessons ?? [])]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((lesson) => ({
          id: lesson.id,
          titulo: lesson.title,
          youtubeVideoId: lesson.youtube_video_id ?? "",
          conteudo: lesson.content ?? undefined,
          materiais: [...(lesson.lesson_materials ?? [])]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((material) => ({
              id: material.id,
              titulo: material.title,
              tipo: material.kind,
              url: normalizeMaterialUrl(material.external_url ?? material.file_url),
            }))
            .filter((material) => material.url),
        })),
    })),
  };
}

export async function listarCursosAcademy(): Promise<Curso[]> {
  if (!isSupabaseConfigured) return cursos;

  const { data, error } = await requireSupabase()
    .from("courses")
    .select(`
      id,
      slug,
      title,
      description,
      position,
      course_modules (
        id,
        slug,
        title,
        description,
        position,
        lessons (
          id,
          slug,
          title,
          description,
          youtube_video_id,
          content,
          position,
          lesson_materials (
            id,
            title,
            kind,
            file_url,
            external_url,
            position
          )
        )
      )
    `)
    .eq("is_published", true)
    .order("position", { ascending: true });

  if (error) {
    if (process.env.NODE_ENV !== "production") console.error("[cursos] erro ao carregar cursos:", error);
    return cursos;
  }

  const mapped = ((data ?? []) as unknown as SupabaseCourseRow[]).map(mapSupabaseCourse);
  return mapped.length > 0 ? mapped : cursos;
}

export async function buscarCursoAcademyPorSlug(slug: string): Promise<Curso | undefined> {
  if (!isSupabaseConfigured) return cursoPorSlug(slug);
  const all = await listarCursosAcademy();
  return all.find((curso) => curso.slug === slug);
}

export async function listarAulasConcluidas(lessonIds: string[]): Promise<string[]> {
  if (!isSupabaseConfigured || lessonIds.length === 0) return [];

  const { data: sessionData } = await requireSupabase().auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return [];

  const { data, error } = await requireSupabase()
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .not("completed_at", "is", null);

  if (error) {
    if (process.env.NODE_ENV !== "production") console.error("[cursos] erro ao carregar progresso:", error);
    return [];
  }

  return (data ?? []).map((item: { lesson_id: string }) => item.lesson_id);
}

export async function marcarAulaAcademyConcluida(lessonId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { data: sessionData } = await requireSupabase().auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return;

  const { error } = await requireSupabase()
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

  if (error) throw new Error(error.message);
}

