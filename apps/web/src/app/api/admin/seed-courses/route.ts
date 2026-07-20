import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cursos } from "@/lib/cursos";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL não configurada." },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, expectedKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const stats = { courses: 0, modules: 0, lessons: 0, materials: 0 };

  try {
    for (let ci = 0; ci < cursos.length; ci++) {
      const curso = cursos[ci];

      // Check if course exists by slug
      const { data: existing } = await admin
        .from("courses")
        .select("id")
        .eq("slug", curso.slug)
        .maybeSingle();

      let courseId: string;

      if (existing) {
        // Update existing
        await admin
          .from("courses")
          .update({
            title: curso.titulo,
            description: curso.descricao ?? null,
            is_published: true,
            position: ci,
          })
          .eq("id", existing.id);
        courseId = existing.id;
      } else {
        // Insert new
        const { data: inserted, error: insertErr } = await admin
          .from("courses")
          .insert({
            slug: curso.slug,
            title: curso.titulo,
            description: curso.descricao ?? null,
            cover_url: null,
            level: "beginner",
            is_published: true,
            position: ci,
          })
          .select("id")
          .single();

        if (insertErr || !inserted) {
          return NextResponse.json(
            { error: `Erro ao inserir curso ${curso.slug}: ${insertErr?.message}` },
            { status: 500 }
          );
        }
        courseId = inserted.id;
      }

      stats.courses++;

      for (let mi = 0; mi < curso.modulos.length; mi++) {
        const modulo = curso.modulos[mi];
        const moduleSlug = `${curso.slug}-m${mi + 1}`;

        const { data: existingMod } = await admin
          .from("course_modules")
          .select("id")
          .eq("course_id", courseId)
          .eq("slug", moduleSlug)
          .maybeSingle();

        let moduleId: string;

        if (existingMod) {
          await admin
            .from("course_modules")
            .update({ title: modulo.titulo, position: mi })
            .eq("id", existingMod.id);
          moduleId = existingMod.id;
        } else {
          const { data: insertedMod, error: modErr } = await admin
            .from("course_modules")
            .insert({
              course_id: courseId,
              slug: moduleSlug,
              title: modulo.titulo,
              description: null,
              position: mi,
            })
            .select("id")
            .single();

          if (modErr || !insertedMod) {
            return NextResponse.json(
              { error: `Erro ao inserir módulo ${moduleSlug}: ${modErr?.message}` },
              { status: 500 }
            );
          }
          moduleId = insertedMod.id;
        }

        stats.modules++;

        for (let li = 0; li < modulo.aulas.length; li++) {
          const aula = modulo.aulas[li];
          const lessonSlug = `${curso.slug}-l${mi + 1}-${li + 1}`;

          const { data: existingLesson } = await admin
            .from("lessons")
            .select("id")
            .eq("module_id", moduleId)
            .eq("slug", lessonSlug)
            .maybeSingle();

          let lessonId: string;

          if (existingLesson) {
            await admin
              .from("lessons")
              .update({
                title: aula.titulo,
                description: aula.conteudo ?? null,
                youtube_video_id: aula.youtubeVideoId || null,
                content: aula.conteudo ?? null,
                position: li,
              })
              .eq("id", existingLesson.id);
            lessonId = existingLesson.id;
          } else {
            const { data: insertedLesson, error: lessonErr } = await admin
              .from("lessons")
              .insert({
                module_id: moduleId,
                slug: lessonSlug,
                title: aula.titulo,
                description: aula.conteudo ?? null,
                youtube_video_id: aula.youtubeVideoId || null,
                content: aula.conteudo ?? null,
                duration_seconds: null,
                position: li,
              })
              .select("id")
              .single();

            if (lessonErr || !insertedLesson) {
              return NextResponse.json(
                { error: `Erro ao inserir aula ${lessonSlug}: ${lessonErr?.message}` },
                { status: 500 }
              );
            }
            lessonId = insertedLesson.id;
          }

          stats.lessons++;

          if (aula.materiais && aula.materiais.length > 0) {
            // Delete old materials for this lesson, then re-insert
            await admin.from("lesson_materials").delete().eq("lesson_id", lessonId);

            for (let mati = 0; mati < aula.materiais.length; mati++) {
              const mat = aula.materiais[mati];
              const isExternal = mat.url.startsWith("http");

              const { error: matErr } = await admin.from("lesson_materials").insert({
                lesson_id: lessonId,
                title: mat.titulo,
                kind: mat.tipo,
                file_url: isExternal ? null : mat.url,
                external_url: isExternal ? mat.url : null,
                position: mati,
              });

              if (matErr) {
                console.warn(`Aviso: material ${mat.titulo} falhou: ${matErr.message}`);
              } else {
                stats.materials++;
              }
            }
          }
        }
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Erro inesperado: ${message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: `Seed completo! ${stats.courses} cursos, ${stats.modules} módulos, ${stats.lessons} aulas, ${stats.materials} materiais.`,
    stats,
  });
}
