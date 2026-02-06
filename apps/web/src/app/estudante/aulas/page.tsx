"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cursos, totalAulas } from "@/lib/cursos";
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

export default function EstudanteAulas() {
  const { user } = useAuth();
  const userId = user?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Aulas</h1>
        <p className="mt-1 text-white/60">OrbitAcademy — escolha um curso e continue de onde parou</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => {
          const total = totalAulas(curso);
          const { concluidas, ultimaAulaId } = getProgress(curso.slug, userId);
          const percent = total > 0 ? Math.round((concluidas / total) * 100) : 0;

          return (
            <Link key={curso.id} href={`/estudante/cursos/${curso.slug}`}>
              <Card className="h-full border-white/10 bg-white/5 transition-all hover:border-orbit-electric/40 hover:bg-white/10">
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
                  <div className="text-xs text-orbit-electric">
                    {ultimaAulaId ? "Continuar" : "Iniciar"} curso
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
