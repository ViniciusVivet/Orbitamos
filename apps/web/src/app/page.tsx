import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Tilt from "@/components/Tilt";
import Parallax from "@/components/Parallax";
import Magnetic from "@/components/Magnetic";
import GlobeClient from "@/components/GlobeClient";
import SpaceShipsOverlay from "@/components/SpaceShipsOverlay";
import XPRing from "@/components/XPRing";
import MissionsTeaser from "@/components/MissionsTeaser";
import ConstellationStepper from "@/components/ConstellationStepper";
import MissionsSidebar from "@/components/MissionsSidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
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
            {Array.from({ length: 140 }).map((_, i) => (
              <circle key={i} cx={(Math.random()*800).toFixed(0)} cy={(Math.random()*600).toFixed(0)} r={Math.random()*1.2+0.2} fill="url(#g)" />
            ))}
          </svg>
        </Parallax>

        {/* Aurora / Nebulosa */}
        <Parallax speed={0.18} className="absolute -top-40 left-1/2 h-[600px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-[conic-gradient(from_120deg,theme(colors.orbit-electric/.7),theme(colors.orbit-purple/.6),transparent_70%)]" />

        <div className="relative container mx-auto px-4 pt-36 pb-24 text-center">
          <MissionsSidebar />
          <div className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <span className="size-2 animate-orbit rounded-full bg-orbit-electric" />
            <span className="text-xs tracking-widest text-white/80">PORTAL DA QUEBRADA QUE ORBITA TECNOLOGIA</span>
          </div>

          <h1 className="mx-auto max-w-5xl bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-5xl font-extrabold leading-tight text-transparent md:text-7xl">
            Da quebrada pra tecnologia. <br className="hidden md:block"/> A gente sobe junto.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80">
            Movimento de educação, comunidade e cultura que leva você do subemprego ao seu primeiro trampo em T.I. em até 9 meses.
          </p>
          <ConstellationStepper current={2} />

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Magnetic>
              <Button
                size="lg"
                className="px-8 py-6 text-base font-bold bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:from-orbit-purple hover:to-orbit-electric transform-gpu transition-all duration-200 shadow-[0_10px_0_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_4px_0_0_rgba(0,0,0,0.35)]"
              >
                🚀 Começar minha jornada
              </Button>
            </Magnetic>
            <Magnetic>
              <Button variant="outline" size="lg" className="px-8 py-6 text-base font-bold border-white/20 text-white hover:bg-white/10">
                👨‍💻 Ver mentorias
              </Button>
            </Magnetic>
          </div>

          <div className="relative">
            <GlobeClient />
            <XPRing progress={100} />
            <SpaceShipsOverlay />
          </div>

          {/* Teaser de Missões */}
          <MissionsTeaser />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/40">
        <div className="container mx-auto px-4">
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
      </section>

      {/* Impacto Real (números atuais) */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Impacto <span className="gradient-text">real</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-orbit-electric mb-2">1</div>
              <div className="text-white/80">Vidas Transformadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-orbit-purple mb-2">100%</div>
              <div className="text-white/80">Taxa de Sucesso (amostra atual)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-orbit-electric mb-2">9</div>
              <div className="text-white/80">Meses (trajetória típica)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-extrabold text-orbit-purple mb-2">R$ 1.5k+</div>
              <div className="text-white/80">Salário de estágiario</div>
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

      {/* Case real: Fundador */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metas de impacto (progresso) */}
      <section className="py-20 bg-black/40">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-14">
            Metas de <span className="gradient-text">impacto</span>
          </h2>

        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-white/80">
              <span>2026 • Transformar 10 vidas</span>
              <span>1/10</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${(1/120)*100}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-white/80">
              <span>2027 • Alcançar 500 vidas</span>
              <span>1/500</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${(1/500)*100}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-white/80">
              <span>2030 • 10.000 vidas em órbita</span>
              <span>1/10.000</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${(1/10000)*100}%` }} />
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-orbit-electric/10 to-orbit-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Pronto para <span className="gradient-text">orbitar</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Junte-se ao movimento que está transformando vidas através da tecnologia. 
            Sua jornada começa aqui.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mentorias">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:from-orbit-purple hover:to-orbit-electric font-bold px-12 py-6 text-xl transform-gpu transition-all duration-200 shadow-[0_10px_0_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_4px_0_0_rgba(0,0,0,0.35)]"
              >
                🚀 Começar Minha Jornada
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}