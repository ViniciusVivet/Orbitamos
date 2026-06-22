"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConstellationStepper from "@/components/ConstellationStepper";
import { useAuth } from "@/contexts/AuthContext";
import { defaultProgress, useProgress } from "@/contexts/ProgressContext";

const GlobeClient = dynamic(() => import("@/components/GlobeClient"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto mt-8 flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-white/5 md:mt-16 md:h-96 md:w-96">
      <span className="text-sm text-white/40">Carregando orbita...</span>
    </div>
  ),
});

function currentConstellationStep(level: number) {
  if (level >= 8) return 4;
  if (level >= 6) return 3;
  if (level >= 3) return 2;
  if (level >= 2) return 1;
  return 0;
}

export default function EstudanteOrbitaPage() {
  const { user } = useAuth();
  const { progress, loading } = useProgress();
  const current = progress ?? defaultProgress;
  const xpMax = 100;

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-white/10 bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,.20),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(139,92,246,.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <span className="size-2 rounded-full bg-orbit-electric" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
              Jornada em orbita
            </span>
          </div>

          <h1 className="bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-5xl">
            {user?.name ? `${user.name.split(" ")[0]}, esta e sua orbita.` : "Sua orbita de aprendizado"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/65 md:text-base">
            Acompanhe seu nivel, XP, fase atual e proximas missoes da OrbitAcademy.
          </p>
        </div>

        <div className="mt-8 grid items-center gap-6 xl:grid-cols-[1fr_340px]">
          <div className="relative min-h-[440px]">
            <GlobeClient level={current.level} xp={current.xp} xpMax={xpMax} />
          </div>

          <div className="space-y-4">
            <Card className="border-orbit-electric/25 bg-black/55 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-orbit-electric">Status da sessao</CardTitle>
                <CardDescription>{loading ? "Sincronizando progresso..." : current.phase || "Fase inicial"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Nivel</div>
                    <div className="mt-1 text-3xl font-black text-white">{current.level}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">XP</div>
                    <div className="mt-1 text-3xl font-black text-orbit-electric">{current.xp}</div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs text-white/50">
                    <span>Progresso geral</span>
                    <span>{current.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                      style={{ width: `${current.percent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-left text-sm text-white/70">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/35">Proxima meta</div>
                  <p className="mt-1">{current.nextGoal || "Concluir as primeiras aulas da trilha."}</p>
                </div>

                {current.lastLesson && (
                  <div className="rounded-xl border border-orbit-purple/25 bg-orbit-purple/10 p-3 text-left text-sm text-white/75">
                    <div className="text-xs font-bold uppercase tracking-widest text-orbit-purple/70">Ultima aula</div>
                    <p className="mt-1">{current.lastLesson}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Button asChild className="bg-gradient-to-r from-orbit-electric to-orbit-purple font-bold text-black hover:opacity-90">
                <Link href="/estudante/aulas">Continuar aulas</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/estudante/progresso">Ver progresso detalhado</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
          <ConstellationStepper current={currentConstellationStep(current.level)} />
        </div>
      </div>
    </div>
  );
}
