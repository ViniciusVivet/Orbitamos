"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  cursos as cursosFallback,
  getCourseTrackGroups,
  listarAulasConcluidas,
  listarCursosAcademy,
  totalAulas,
  type Curso,
} from "@/lib/cursos";
import { useAuth } from "@/contexts/AuthContext";
import type { UserId } from "@/lib/api";

const STORAGE_KEY = "orbitacademy-progress";

function getProgress(cursoSlug: string, userId: UserId | undefined): { concluidas: number; ultimaAulaId: string | null } {
  if (typeof window === "undefined" || !userId) return { concluidas: 0, ultimaAulaId: null };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${userId}-${cursoSlug}`);
    if (!raw) return { concluidas: 0, ultimaAulaId: null };
    const data = JSON.parse(raw);
    const concluidas = Array.isArray(data.concluidas) ? data.concluidas.length : 0;
    return { concluidas, ultimaAulaId: data.ultimaAulaId ?? null };
  } catch {
    return { concluidas: 0, ultimaAulaId: null };
  }
}

export default function EstudanteAulas() {
  const { user } = useAuth();
  const userId = user?.id;
  const [cursos, setCursos] = useState<Curso[]>(cursosFallback);
  const [supabaseConcluidas, setSupabaseConcluidas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listarCursosAcademy()
      .then(async (items) => {
        if (!active) return;
        setCursos(items);
        const lessonIds = items.flatMap((curso) => curso.modulos.flatMap((mod) => mod.aulas.map((aula) => aula.id)));
        const completed = await listarAulasConcluidas(lessonIds);
        if (active) setSupabaseConcluidas(new Set(completed));
      })
      .catch(() => {
        if (active) setCursos(cursosFallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const progressByCourse = useMemo(() => {
    const map = new Map<string, { concluidas: number; ultimaAulaId: string | null }>();
    cursos.forEach((curso) => {
      const lessonIds = curso.modulos.flatMap((mod) => mod.aulas.map((aula) => aula.id));
      const completedFromSupabase = lessonIds.filter((id) => supabaseConcluidas.has(id));
      if (completedFromSupabase.length > 0) {
        map.set(curso.slug, {
          concluidas: completedFromSupabase.length,
          ultimaAulaId: completedFromSupabase[completedFromSupabase.length - 1] ?? null,
        });
        return;
      }
      map.set(curso.slug, getProgress(curso.slug, userId));
    });
    return map;
  }, [cursos, supabaseConcluidas, userId]);

  const getCoursePercent = (curso: Curso) => {
    const total = totalAulas(curso);
    const progress = progressByCourse.get(curso.slug);
    return total > 0 ? Math.round(((progress?.concluidas ?? 0) / total) * 100) : 0;
  };

  const sugerido = cursos.find((c) => getCoursePercent(c) < 100) ?? cursos[0];
  const trilhas = useMemo(() => getCourseTrackGroups(cursos), [cursos]);

  const renderCursoCard = (curso: Curso) => {
    const total = totalAulas(curso);
    const { concluidas } = progressByCourse.get(curso.slug) ?? { concluidas: 0, ultimaAulaId: null };
    const percent = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    const concluido = percent === 100;

    return (
      <Link key={curso.id} href={`/estudante/cursos/${curso.slug}`}>
        <Card className="relative h-full border-white/10 bg-white/5 transition-all hover:border-orbit-electric/40 hover:bg-white/10">
          {concluido && (
            <div className="absolute right-3 top-3 rounded-full bg-orbit-electric/20 px-2 py-0.5 text-xs font-semibold text-orbit-electric">
              Concluido
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-orbit-electric">{curso.titulo}</CardTitle>
            <CardDescription>{curso.descricao ?? `${total} aulas`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-white/70">
              {concluidas} de {total} aulas
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orbit-electric">
                {concluido ? "Ver certificado" : "Ir para sala de aula"}
              </span>
              {concluido && <span className="text-white/50">OK</span>}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Aulas</h1>
        <p className="mt-1 text-white/60">OrbitAcademy - escolha uma trilha e continue de onde parou</p>
      </div>

      {loading && <p className="text-sm text-white/50">Carregando cursos...</p>}

      {cursos.length > 0 && sugerido && (
        <Card className="border-orbit-purple/30 bg-gradient-to-br from-orbit-purple/10 to-orbit-electric/10">
          <CardHeader>
            <CardTitle className="text-orbit-purple">Sugerido para voce</CardTitle>
            <CardDescription>Com base no seu progresso</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-white/90">{sugerido.titulo}</p>
              <p className="text-sm text-white/60">{sugerido.descricao ?? `${totalAulas(sugerido)} aulas`}</p>
            </div>
            <Button asChild className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2 text-sm font-bold text-black hover:opacity-90">
              <Link href={`/estudante/cursos/${sugerido.slug}`}>Ir para sala de aula</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-7">
        {trilhas.map((trilha) => {
          const totalTrilhaAulas = trilha.cursos.reduce((acc, curso) => acc + totalAulas(curso), 0);
          const concluidasTrilha = trilha.cursos.reduce(
            (acc, curso) => acc + (progressByCourse.get(curso.slug)?.concluidas ?? 0),
            0
          );
          const percentTrilha = totalTrilhaAulas > 0 ? Math.round((concluidasTrilha / totalTrilhaAulas) * 100) : 0;

          return (
            <section key={trilha.id} className="space-y-3">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <span>{trilha.icon}</span>
                    {trilha.titulo}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-white/55">{trilha.descricao}</p>
                </div>
                <div className="min-w-[150px]">
                  <div className="mb-1 flex items-center justify-between text-xs text-white/45">
                    <span>{concluidasTrilha}/{totalTrilhaAulas} aulas</span>
                    <span>{percentTrilha}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                      style={{ width: `${percentTrilha}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {trilha.cursos.map(renderCursoCard)}
              </div>
            </section>
          );
        })}
      </div>

      <Card className="border-orbit-electric/20 bg-gray-900/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-orbit-electric">Mais cursos em breve</CardTitle>
          <CardDescription>
            QA, Bootcamp Portfolio e outras trilhas estao sendo preparadas. Continue acompanhando.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
