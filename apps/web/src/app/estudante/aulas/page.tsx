"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cursos, totalAulas, type Curso } from "@/lib/cursos";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "orbitacademy-progress";

function getProgress(cursoSlug: string, userId: number | undefined): { concluidas: number; ultimaAulaId: string | null } {
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

function getPercent(curso: Curso, userId: number | undefined): number {
  const total = totalAulas(curso);
  const { concluidas } = getProgress(curso.slug, userId);
  return total > 0 ? Math.round((concluidas / total) * 100) : 0;
}

export default function EstudanteAulas() {
  const { user } = useAuth();
  const userId = user?.id;

  const sugerido = cursos.find((c) => getPercent(c, userId) < 100) ?? cursos[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Aulas</h1>
        <p className="mt-1 text-white/60">OrbitAcademy — escolha um curso e continue de onde parou</p>
      </div>

      {cursos.length > 0 && (
        <Card className="border-orbit-purple/30 bg-gradient-to-br from-orbit-purple/10 to-orbit-electric/10">
          <CardHeader>
            <CardTitle className="text-orbit-purple">✨ Sugerido para você</CardTitle>
            <CardDescription>Com base no seu progresso</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-white/90">{sugerido.titulo}</p>
              <p className="text-sm text-white/60">{sugerido.descricao ?? `${totalAulas(sugerido)} aulas`}</p>
            </div>
            <Button asChild className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2 text-sm font-bold text-black hover:opacity-90">
              <Link href={`/estudante/cursos/${sugerido.slug}`}>
                {getPercent(sugerido, userId) > 0 ? "Continuar aula" : "Começar"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => {
          const total = totalAulas(curso);
          const { concluidas, ultimaAulaId } = getProgress(curso.slug, userId);
          const percent = total > 0 ? Math.round((concluidas / total) * 100) : 0;
          const concluido = percent === 100;

          return (
            <Link key={curso.id} href={`/estudante/cursos/${curso.slug}`}>
              <Card className="relative h-full border-white/10 bg-white/5 transition-all hover:border-orbit-electric/40 hover:bg-white/10">
                {concluido && (
                  <div className="absolute right-3 top-3 rounded-full bg-orbit-electric/20 px-2 py-0.5 text-xs font-semibold text-orbit-electric">
                    🏅 Concluído
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
                      {concluido ? "Ver certificado" : ultimaAulaId ? "Continuar" : "Iniciar"} curso
                    </span>
                    {concluido && <span className="text-white/50">✓</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-orbit-electric/20 bg-gray-900/50 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-orbit-electric">Mais cursos em breve</CardTitle>
          <CardDescription>
            QA, Bootcamp Portfolio e outros trilhas estao sendo preparados. Continue acompanhando.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
