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
          { id: "a1", titulo: "Introducao e Dicas para quem esta comecando", youtubeVideoId: "b7re8uY8Pf4", conteudo: "• O que e HTML e CSS\n• Ferramentas necessarias" },
          { id: "a2", titulo: "Instalando as ferramentas (Windows)", youtubeVideoId: "b7re8uY8Pf4" },
          { id: "a3", titulo: "Instalando as ferramentas (Mac)", youtubeVideoId: "b7re8uY8Pf4" },
        ],
      },
      {
        id: "m2",
        titulo: "Primeiros passos",
        aulas: [
          { id: "a4", titulo: "Estrutura basica de um HTML", youtubeVideoId: "b7re8uY8Pf4" },
          { id: "a5", titulo: "Seletores CSS", youtubeVideoId: "b7re8uY8Pf4" },
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
          { id: "a6", titulo: "O que e JavaScript", youtubeVideoId: "b7re8uY8Pf4" },
          { id: "a7", titulo: "Variaveis e tipos", youtubeVideoId: "b7re8uY8Pf4" },
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
          { id: "a8", titulo: "O que e React", youtubeVideoId: "b7re8uY8Pf4" },
          { id: "a9", titulo: "Seu primeiro componente", youtubeVideoId: "b7re8uY8Pf4" },
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
              url: material.file_url ?? material.external_url ?? "",
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
