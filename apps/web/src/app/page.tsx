import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Tilt from "@/components/Tilt";
import Parallax from "@/components/Parallax";
import Magnetic from "@/components/Magnetic";
import MissionsTeaser from "@/components/MissionsTeaser";
import ConstellationStepper from "@/components/ConstellationStepper";
import MissionsSidebar from "@/components/MissionsSidebar";
import LiveCounter from "@/components/LiveCounter";
import { ORBITANDO_AGORA } from "@/lib/orbitStats";

// Componentes pesados carregados de forma lazy (three.js ~600kb, animações de canvas)
const GlobeClient = dynamic(() => import("@/components/GlobeClient"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full border border-white/10 bg-white/5">
      <span className="text-white/30 text-sm">🌍</span>
    </div>
  ),
});
const SpaceShipsOverlay = dynamic(() => import("@/components/SpaceShipsOverlay"), { ssr: false, loading: () => null });

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const HERO_STARS = (() => {
  const rng = seededRng(42);
  return Array.from({ length: 140 }, () => ({
    cx: (rng() * 800).toFixed(0),
    cy: (rng() * 600).toFixed(0),
    r: rng() * 1.2 + 0.2,
  }));
})();

export default function Home() {
  const instagramUrl = "https://www.instagram.com/orbitamosbr/";

  return (
    <div className="relative min-h-screen text-white">
      {/* Naves: z-0, abaixo de todo o conteúdo */}
      <SpaceShipsOverlay />

      {/* Fundo cósmico em toda a página — uma camada só, sem blocos pretos */}
      <div
        className="fixed inset-0 -z-10 bg-black"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(139,92,246,.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_20%_80%,rgba(0,212,255,.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
      </div>

      {/* Wrapper de conteúdo: z-[1] cria um stacking context acima das naves (z-0) */}
      <div className="relative z-[1]">

      {/* HERO CÓSMICO */}
      <section className="relative overflow-hidden">
        {/* Starfield */}
        <Parallax speed={0.08} className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(59,130,246,.25),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,.25),transparent_50%)]" />
        <Parallax speed={0.12} className="absolute inset-0 opacity-30" aria-hidden>
          <svg className="size-full" viewBox="0 0 800 600">
            <defs>
              <radialGradient id="g" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            {HERO_STARS.map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="url(#g)" />
            ))}
          </svg>
        </Parallax>

        {/* Aurora / Nebulosa */}
        <Parallax speed={0.18} className="absolute -top-40 left-1/2 h-[400px] w-full max-w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-[conic-gradient(from_120deg,theme(colors.orbit-electric/.7),theme(colors.orbit-purple/.6),transparent_70%)]" />

        <div className="relative container mx-auto px-4 pt-20 pb-16 text-center">
          <MissionsSidebar />
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <span className="size-2 animate-orbit rounded-full bg-orbit-electric" />
            <span className="text-xs tracking-widest text-white/80">PORTAL DA QUEBRADA QUE ORBITA TECNOLOGIA</span>
          </div>

          <h1 className="mx-auto max-w-4xl bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-5xl">
            Da quebrada pra tecnologia. <br className="hidden md:block" /> A gente sobe junto.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-white/80">
            Movimento de educação, comunidade e cultura que leva você do subemprego ao seu primeiro trampo em T.I. em até 9 meses.
          </p>

          {/* Planeta protagonista + órbita ligando à trilha e missões */}
          <div className="mt-10 relative">
            {/* Planeta + HUD */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative mx-auto">
                <GlobeClient level={1} xp={0} xpMax={100} />
              </div>

              {/* Status — visitante deslogado */}
              <div className="mt-3 w-full max-w-sm mx-auto">
                <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] text-white/40 uppercase text-center">
                  Seu status em órbita
                </p>

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 px-5 py-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,212,255,0.07)]">
                  {/* glow sutil */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,212,255,0.07),transparent)]" />

                  <div className="relative">
                    {/* Nível bloqueado */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl">🔒</div>
                        <div className="text-left">
                          <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/30">Nível</div>
                          <div className="text-2xl font-extrabold text-white/20 leading-none">???</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/20 uppercase tracking-wide">XP acumulado</div>
                        <div className="text-sm font-bold text-white/15">— / —</div>
                      </div>
                    </div>

                    {/* Barra de XP "vazia" com shimmer */}
                    <div className="relative mb-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      />
                    </div>

                    {/* Frase de FOMO */}
                    <p className="mb-3 text-center text-xs text-white/50 leading-relaxed">
                      <span className="font-bold text-orbit-electric">{ORBITANDO_AGORA} pessoas</span> já acumulam XP agora.{" "}
                      <span className="text-white/70">Você está perdendo cada ponto.</span>
                    </p>

                    {/* CTA */}
                    <Link
                      href="/entrar"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2.5 text-sm font-extrabold text-black shadow-[0_0_20px_rgba(0,212,255,0.35)] hover:shadow-[0_0_30px_rgba(0,212,255,0.55)] transition-shadow min-h-[44px]"
                    >
                      ⚡ Entrar e liberar meu XP
                    </Link>
                  </div>
                </div>
              </div>
            </div>


            {/* Trilha + missões embaixo do planeta */}
            <div className="mt-10 space-y-6">
              <ConstellationStepper current={2} />
              <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-orbit-electric/40 p-5 shadow-[0_0_40px_rgba(0,212,255,0.15),inset_0_1px_0_rgba(0,212,255,0.1)]">
                {/* Nebulosa CSS */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[#02080f]" />
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(0,212,255,0.13),transparent_70%)]" />
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_70%_at_80%_30%,rgba(139,92,246,0.18),transparent_70%)]" />
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_90%,rgba(0,212,255,0.08),transparent_70%)]" />
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_30%_40%_at_70%_70%,rgba(167,139,250,0.12),transparent_60%)]" />
                <p className="text-sm font-extrabold tracking-[0.2em] uppercase mb-3 text-left bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
                  ⚡ Próximas missões
                </p>
                <MissionsTeaser />
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row w-full px-2">
            <Magnetic>
              <Button
                size="lg"
                className="w-full sm:w-auto px-10 py-4 text-base font-bold bg-gradient-to-r from-orbit-electric via-white to-orbit-purple text-black shadow-[0_18px_40px_rgba(0,212,255,0.40)] hover:shadow-[0_22px_55px_rgba(0,212,255,0.55)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_10px_24px_rgba(0,0,0,0.45)] border border-black/20 transform-gpu transition-all duration-150"
              >
                🚀 Começar minha jornada
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold border-white/20 text-white bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-orbit-electric/40 transition-all duration-150"
              >
                👨‍💻 Ver mentorias
              </Button>
            </Magnetic>
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white/90 hover:bg-white/10 transition-colors duration-150 min-h-[44px]"
            >
              📸 Seguir no Instagram
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section — glass card sobre o universo */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-12">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              Por que a <span className="gradient-text">Orbitamos</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
            <Tilt className="[transform-style:preserve-3d]">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-orbit-electric/40 transition-all duration-300 [transform:translateZ(20px)]">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">🎯 Foco Real</CardTitle>
                <CardDescription className="text-white/80">
                  Criada na quebrada, para a quebrada. Entendemos a realidade da periferia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Nossa metodologia foi desenvolvida por quem viveu a transformação. 
                  Sabemos exatamente o que você precisa para sair do subemprego.
                </p>
              </CardContent>
            </Card>
            </Tilt>

            <Tilt className="[transform-style:preserve-3d]">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-orbit-purple/40 transition-all duration-300 [transform:translateZ(20px)]">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-2xl">👩‍💻 Vai dar certo, mas não vai ser fácil</CardTitle>
                <CardDescription className="text-white/80">
                  Do zero ao primeiro trampo em T.I. em até 9 meses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  1 vida já em órbita — a próxima pode ser a sua. 
                  Foco no que realmente importa para conseguir o primeiro emprego.
                </p>
              </CardContent>
            </Card>
            </Tilt>

            <Tilt className="[transform-style:preserve-3d]">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-orbit-electric/40 transition-all duration-300 [transform:translateZ(20px)]">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">🤝 Comunidade Forte</CardTitle>
                <CardDescription className="text-white/80">
                  A gente sobe junto. Sempre.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Não é só curso, é movimento. Uma comunidade que apoia, 
                  ensina e cresce junto. A força da quebrada unida.
                </p>
              </CardContent>
            </Card>
            </Tilt>
            </div>
          </div>
        </div>
      </section>

      {/* Impacto Real — glass + labels e glow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-12">
            <h2 className="text-4xl font-bold text-center text-white mb-16">
              Impacto <span className="gradient-text">real</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <LiveCounter
                  value={1}
                  colorClass="text-orbit-electric"
                  glowStyle="drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                  live
                />
                <div className="text-sm font-medium uppercase tracking-wider text-white/90">Vida transformada</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-extrabold text-orbit-purple mb-2 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">100%</div>
                <div className="text-sm font-medium uppercase tracking-wider text-white/90">Sucesso (amostra)</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-extrabold text-orbit-electric mb-2 drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]">9</div>
                <div className="text-sm font-medium uppercase tracking-wider text-white/90">Meses (média)</div>
              </div>
              <div>
                <div className="text-4xl md:text-6xl font-extrabold text-orbit-purple mb-2 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">R$ 1,5k+</div>
                <div className="text-sm font-medium uppercase tracking-wider text-white/90">Primeiro salário</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missões Gamificadas */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* seção de missões removida: agora usamos o teaser e o sidebar */}
        </div>
      </section>

      {/* Case real: Fundador — glass sobre universo */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
              <div className="relative h-20 w-20 shrink-0 rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple p-[2px]">
                <div className="h-full w-full rounded-full bg-black/90 grid place-items-center text-2xl">🚀</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Primeira vida salva</h3>
                <p className="text-white/80">
                  &ldquo;Estudando há <strong className="text-white">10 meses</strong>, já está estagiando na <strong className="text-white"> Prepara Cursos </strong>
                  como <strong className="text-white">Instrutor técnico de informática</strong>.&rdquo;
                </p>
                <p className="text-white/70 text-sm">— Nosso ponto de partida. Agora, vamos escalar esse impacto para muita gente.</p>
                <p className="text-white/30 text-xs pt-1">🕐 há 6 meses atrás</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metas de impacto — gamificado */}
      <section className="py-20">
        <div className="container mx-auto px-4">

          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-orbit-electric/70">
              📡 missão em andamento
            </p>
            <h2 className="text-4xl font-bold text-white">
              Metas de <span className="gradient-text">impacto</span>
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/50">
              Cada número representa uma vida saindo da periferia rumo à tecnologia.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">

            {/* 2026 */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-black/50 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.07)] transition-shadow hover:shadow-[0_0_40px_rgba(16,185,129,0.18)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_110%,rgba(16,185,129,0.1),transparent)]" />
              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/60">Meta 2026</span>
                    <h3 className="mt-0.5 text-lg font-bold text-white">Transformar 10 vidas</h3>
                    <p className="mt-0.5 text-xs text-white/40">Primeiro emprego em TI garantido</p>
                  </div>
                  <span className="text-3xl">🎯</span>
                </div>
                <div className="mb-1.5 flex items-end justify-between">
                  <span className="text-4xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">1</span>
                  <span className="mb-1 text-sm text-white/40">/ 10 vidas</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" style={{ width: "10%" }} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">Em progresso</span>
                </div>
              </div>
            </div>

            {/* Projetos comerciais */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-black/50 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.07)] transition-shadow hover:shadow-[0_0_40px_rgba(245,158,11,0.18)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_110%,rgba(245,158,11,0.1),transparent)]" />
              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/60">Receita · Orbitamos</span>
                    <h3 className="mt-0.5 text-lg font-bold text-white">Projetos Comerciais Entregues</h3>
                    <p className="mt-0.5 text-xs text-white/40">Contratos fechados e executados pela Orbitamos</p>
                  </div>
                  <span className="text-3xl">🤝</span>
                </div>
                <div className="mb-1.5 flex items-end justify-between">
                  <span className="text-4xl font-extrabold text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">3</span>
                  <span className="mb-1 text-sm text-white/40">/ 10 projetos</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" style={{ width: "30%" }} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-400">30% da meta</span>
                </div>
              </div>
            </div>

            {/* 2027 */}
            <div className="relative overflow-hidden rounded-2xl border border-orbit-electric/20 bg-black/50 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,212,255,0.06)] transition-shadow hover:shadow-[0_0_40px_rgba(0,212,255,0.14)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_110%,rgba(0,212,255,0.08),transparent)]" />
              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-orbit-electric/60">Meta 2027</span>
                    <h3 className="mt-0.5 text-lg font-bold text-white">Alcançar 500 vidas</h3>
                    <p className="mt-0.5 text-xs text-white/40">Comunidade ativa e crescendo</p>
                  </div>
                  <span className="text-3xl">🚀</span>
                </div>
                <div className="mb-1.5 flex items-end justify-between">
                  <span className="text-4xl font-extrabold text-orbit-electric drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]">{ORBITANDO_AGORA}</span>
                  <span className="mb-1 text-sm text-white/40">/ 500 vidas</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.7)]" style={{ width: `${(ORBITANDO_AGORA / 500) * 100}%` }} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orbit-electric/20 bg-orbit-electric/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orbit-electric/50" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-orbit-electric/70">Decolando</span>
                </div>
              </div>
            </div>

            {/* 2030 */}
            <div className="relative overflow-hidden rounded-2xl border border-orbit-purple/20 bg-black/50 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-shadow hover:shadow-[0_0_40px_rgba(139,92,246,0.14)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_110%,rgba(139,92,246,0.1),transparent)]" />
              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-orbit-purple/60">Meta 2030</span>
                    <h3 className="mt-0.5 text-lg font-bold text-white">10.000 vidas em órbita</h3>
                    <p className="mt-0.5 text-xs text-white/40">O movimento que vai mudar a periferia</p>
                  </div>
                  <span className="text-3xl">🌍</span>
                </div>
                <div className="mb-1.5 flex items-end justify-between">
                  <span className="text-4xl font-extrabold text-orbit-purple drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]">1</span>
                  <span className="mb-1 text-sm text-white/40">/ 10.000 vidas</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-orbit-purple to-pink-500 shadow-[0_0_10px_rgba(139,92,246,0.7)]" style={{ width: "0.01%" }} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orbit-purple/20 bg-orbit-purple/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orbit-purple/50" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-orbit-purple/70">Visão de longo prazo</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA — glass com glow sobre universo */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-black/40 p-10 shadow-[0_0_60px_rgba(0,212,255,0.15)] backdrop-blur-xl md:p-14">
            <h2 className="text-4xl font-bold text-center text-white mb-6">
              Pronto para <span className="gradient-text">orbitar</span>?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto text-center">
              Junte-se ao movimento que está transformando vidas através da tecnologia. 
              Sua jornada começa aqui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mentorias">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:from-orbit-purple hover:to-orbit-electric font-bold px-12 py-6 text-xl shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] transform-gpu transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  🚀 Começar Minha Jornada
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>{/* fim do wrapper z-[1] */}
    </div>
  );
}