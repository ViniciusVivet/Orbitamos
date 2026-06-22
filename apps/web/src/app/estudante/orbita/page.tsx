"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConstellationStepper from "@/components/ConstellationStepper";
import { useAuth } from "@/contexts/AuthContext";
import { defaultProgress, useProgress } from "@/contexts/ProgressContext";
import { ORBITANDO_AGORA } from "@/lib/orbitStats";

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
    <div className="relative min-h-[calc(100vh-7rem)] overflow-x-hidden text-white">
      <div className="pointer-events-none absolute inset-0 bg-black" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(0,212,255,.18),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_54%_70%_at_78%_44%,rgba(139,92,246,.14),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />

      <div className="relative z-10 px-1 py-3 sm:px-4 lg:px-6">
        <header className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-xl">
              <span className="size-2 rounded-full bg-orbit-electric" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
                Jornada em orbita
              </span>
            </div>

            <h1 className="bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-3xl font-extrabold leading-[1.05] text-transparent sm:text-4xl lg:text-5xl">
              {user?.name ? `${user.name.split(" ")[0]}, esta e sua orbita.` : "Sua orbita de aprendizado"}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Seu mapa vivo de nivel, XP, fase atual e proximas missoes da OrbitAcademy.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-xl sm:min-w-[360px]">
            <div className="rounded-xl bg-white/5 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Nivel</div>
              <div className="text-2xl font-black text-white">{current.level}</div>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">XP</div>
              <div className="text-2xl font-black text-orbit-electric">{current.xp}</div>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Total</div>
              <div className="text-2xl font-black text-orbit-purple">{current.percent}%</div>
            </div>
          </div>
        </header>

        <section className="mx-auto mt-5 grid max-w-6xl items-center gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative flex min-h-[430px] items-center justify-center overflow-visible rounded-3xl border border-white/10 bg-black/20 px-2 py-8 backdrop-blur-sm sm:min-h-[520px] lg:min-h-[600px]">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_48%,rgba(0,212,255,.12),transparent_58%)]" />
            <div className="pointer-events-none absolute inset-x-8 bottom-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="relative">
              <GlobeClient level={current.level} xp={current.xp} xpMax={xpMax} variant="hero" showWidgets={false} />
            </div>
          </div>

          <aside className="space-y-3">
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

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Orbitando agora</div>
                  <div className="mt-1 text-3xl font-black text-orbit-electric">{ORBITANDO_AGORA}</div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs text-white/50">
                    <span>Progresso</span>
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
          </aside>
        </section>

        <section className="mx-auto mt-5 max-w-6xl rounded-2xl border border-white/10 bg-black/35 p-1 backdrop-blur-xl sm:p-3">
          <ConstellationStepper current={currentConstellationStep(current.level)} />
        </section>
      </div>
    </div>
  );
}
