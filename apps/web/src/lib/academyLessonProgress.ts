import type { CursoResumo } from "@/lib/cursos";
import { requireSupabase } from "@/lib/supabase";

export type AcademyLessonProgressRef = {
  id: string;
  slug?: string;
  courseSlug: string;
};

export function academyLessonProgressRefs(courses: CursoResumo[]): AcademyLessonProgressRef[] {
  return courses.flatMap((course) => course.modulos.flatMap((module) => module.aulas.map((lesson) => ({
    id: lesson.id,
    ...(lesson.slug ? { slug: lesson.slug } : {}),
    courseSlug: course.slug,
  }))));
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const READ_BATCH_SIZE = 100;
const sessionChangedMessage = "A sessão mudou. Entre novamente para consultar seu progresso.";
const aliasKey = (courseSlug: string, lessonSlug: string) => JSON.stringify([courseSlug, lessonSlug]);

type AliasProgressRow = {
  lessons: {
    slug: string;
    course_modules: { courses: { slug: string } | null } | null;
  } | null;
};

/** Resolve IDs locais pelo par curso/slug, sem uma consulta por curso. */
export async function readCompletedAcademyLessons(
  lessons: AcademyLessonProgressRef[],
  expectedUserId: string | number | undefined,
): Promise<string[]> {
  // Nenhuma leitura autenticada deve inferir o dono a partir de outra sessão.
  if (!lessons.length || expectedUserId === undefined) return [];
  const client = requireSupabase();
  const assertOwner = async () => {
    const { data, error } = await client.auth.getSession();
    if (error || data.session?.user.id !== expectedUserId) throw new Error(sessionChangedMessage);
  };
  await assertOwner();

  const completed = new Set<string>();
  const uuidIds = [...new Set(lessons.filter((lesson) => UUID_PATTERN.test(lesson.id)).map((lesson) => lesson.id))];
  for (let offset = 0; offset < uuidIds.length; offset += READ_BATCH_SIZE) {
    const batch = uuidIds.slice(offset, offset + READ_BATCH_SIZE);
    const { data, error } = await client.from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", expectedUserId)
      .in("lesson_id", batch)
      .not("completed_at", "is", null);
    if (error) throw new Error("Não foi possível consultar as aulas sincronizadas.");
    const requested = new Set(batch);
    for (const row of data ?? []) if (requested.has(row.lesson_id)) completed.add(row.lesson_id);
  }

  const aliases = lessons.filter((lesson) => !UUID_PATTERN.test(lesson.id) && lesson.courseSlug);
  for (let offset = 0; offset < aliases.length; offset += READ_BATCH_SIZE) {
    const batch = aliases.slice(offset, offset + READ_BATCH_SIZE);
    const requested = new Map<string, string[]>();
    for (const lesson of batch) {
      const key = aliasKey(lesson.courseSlug, lesson.slug ?? lesson.id);
      requested.set(key, [...(requested.get(key) ?? []), lesson.id]);
    }
    const { data, error } = await client.from("lesson_progress")
      .select("lessons!inner(slug,course_modules!inner(courses!inner(slug)))")
      .eq("user_id", expectedUserId)
      .in("lessons.slug", [...new Set(batch.map((lesson) => lesson.slug ?? lesson.id))])
      .in("lessons.course_modules.courses.slug", [...new Set(batch.map((lesson) => lesson.courseSlug))])
      .not("completed_at", "is", null);
    if (error) throw new Error("Não foi possível consultar as aulas sincronizadas.");
    for (const row of (data ?? []) as unknown as AliasProgressRow[]) {
      const lesson = row.lessons;
      const courseSlug = lesson?.course_modules?.courses?.slug;
      if (!lesson || !courseSlug) continue;
      for (const id of requested.get(aliasKey(courseSlug, lesson.slug)) ?? []) completed.add(id);
    }
  }

  // A sessão também pode mudar enquanto uma consulta estiver em voo.
  await assertOwner();
  return [...new Set(lessons.map((lesson) => lesson.id).filter((id) => completed.has(id)))];
}
