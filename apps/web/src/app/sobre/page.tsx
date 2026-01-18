import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Parallax from "@/components/Parallax";
import Link from "next/link";

export default function Sobre() {
  const instagramUrl = "https://www.instagram.com/orbitamosbr/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orbit-black via-gray-900 to-orbit-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="gradient-text">Nosso Propósito</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Se a gente vai longe, é porque sobe junto.
          </p>
        </div>
      </section>

      {/* História */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Nossa <span className="gradient-text">História</span>
            </h2>
            
            <div className="space-y-6 text-lg text-gray-300">
              <p>
                A Orbitamos nasceu da necessidade real de transformar vidas através da tecnologia. 
                Criada por pessoas que viveram a transição do subemprego para a área de T.I., 
                entendemos como é difícil essa jornada quando você não tem as ferramentas certas.
              </p>
              
              <p>
                Nossa metodologia foi desenvolvida na prática, testada e refinada com centenas 
                de pessoas da periferia. Sabemos que não é só sobre aprender a programar - 
                é sobre mudança de mindset, quebra de barreiras e construção de uma nova realidade.
              </p>
              
              <p>
                Hoje, somos mais que uma escola de tecnologia. Somos um movimento que acredita 
                no potencial da quebrada e na força da comunidade unida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Nossos <span className="gradient-text">Pilares</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-orbit-electric/20 hover:border-orbit-electric/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">🎯 Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">
                  Transformar vidas através da tecnologia, levando pessoas da classe C e D 
                  do subemprego ao primeiro trampo em T.I. em até 9 meses, com foco na 
                  realidade da periferia.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20 hover:border-orbit-purple/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orbit-purple text-2xl">👁️ Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">
                  Ser o maior movimento de transformação digital da periferia, criando uma 
                  geração de profissionais de tecnologia que representam a diversidade 
                  e a força da quebrada.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20 hover:border-orbit-electric/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orbit-electric text-2xl">💎 Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white space-y-2">
                  <p><strong>Autenticidade:</strong> Ser real, sem máscaras</p>
                  <p><strong>Esperança:</strong> Acreditar no potencial de cada um</p>
                  <p><strong>Comunidade:</strong> A gente sobe junto</p>
                  <p><strong>Impacto:</strong> Transformar vidas reais</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Linha do Futuro */}
      <section className="relative overflow-hidden py-20 bg-black/50">
        <Parallax
          speed={0.06}
          className="pointer-events-none absolute inset-0 [background:radial-gradient(1px_1px_at_15%_20%,rgba(255,255,255,.35),transparent_60%),radial-gradient(1px_1px_at_75%_30%,rgba(147,197,253,.35),transparent_60%),radial-gradient(1.5px_1.5px_at_40%_75%,rgba(167,139,250,.35),transparent_60%),radial-gradient(1px_1px_at_85%_80%,rgba(255,255,255,.25),transparent_60%)] opacity-70"
        />
        <Parallax
          speed={0.12}
          className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_top_right,rgba(59,130,246,.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,.2),transparent_60%)]"
        />

        <div className="relative container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Linha do <span className="gradient-text">Futuro</span>
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-white/70">
            Cada fase é um planeta. Cada órbita é um passo na missão Orbitamos.
          </p>

          {/* Lista mobile */}
          <div className="mx-auto max-w-2xl space-y-6 md:hidden">
            <div className="rounded-2xl border border-orbit-electric/30 bg-white/5 p-5 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
              <div className="mb-2 text-sm uppercase tracking-widest text-orbit-electric">Planeta Terra — Fundação</div>
              <p className="text-white/80">
                Onde tudo começa. Consciência, sobrevivência e o primeiro contato com o código.
              </p>
            </div>
            <div className="rounded-2xl border border-orbit-purple/20 bg-white/5 p-5">
              <div className="mb-2 text-sm uppercase tracking-widest text-orbit-purple">Órbita Baixa — Ativação</div>
              <p className="text-white/80">
                O estudo vira rotina e a comunidade começa a se formar.
              </p>
            </div>
            <div className="rounded-2xl border border-orbit-electric/20 bg-white/5 p-5">
              <div className="mb-2 text-sm uppercase tracking-widest text-orbit-electric">Cinturão — Expansão</div>
              <p className="text-white/80">
                Mais pessoas, mais projetos, mais impacto.
              </p>
            </div>
            <div className="rounded-2xl border border-orbit-purple/20 bg-white/5 p-5">
              <div className="mb-2 text-sm uppercase tracking-widest text-orbit-purple">Lua — Consolidação</div>
              <p className="text-white/80">
                O código vira renda. O sonho vira realidade.
              </p>
            </div>
            <div className="rounded-2xl border border-[#f6c177]/30 bg-white/5 p-5">
              <div className="mb-2 text-sm uppercase tracking-widest text-[#f6c177]">Espaço Profundo — Órbita</div>
              <p className="text-white/80">
                A quebrada no centro da tecnologia.
              </p>
            </div>
          </div>

          {/* Órbita 3D */}
          <div className="relative mx-auto hidden h-[560px] max-w-5xl md:block">
            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

            {/* Planeta Terra — atual */}
            <div className="group absolute left-[12%] top-[44%] w-60">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-orbit-electric/60 animate-pulse" />
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orbit-electric via-blue-300 to-orbit-purple shadow-[0_0_30px_rgba(59,130,246,0.65)] ring-2 ring-orbit-electric/60 transform-gpu transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-orbit-electric">Planeta Terra — Fundação</div>
                  <p className="text-white/80 text-sm">
                    Onde tudo começa. Consciência, sobrevivência e o primeiro contato com o código.
                  </p>
                </div>
              </div>
            </div>

            {/* Órbita Baixa — Ativação */}
            <div className="group absolute right-[6%] top-[18%] w-64">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-orbit-purple/40 opacity-60 transition-all duration-300 group-hover:opacity-100" />
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orbit-purple via-fuchsia-400 to-orbit-electric shadow-[0_0_22px_rgba(124,58,237,0.55)] transform-gpu transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-orbit-purple">Órbita Baixa — Ativação</div>
                  <p className="text-white/75 text-sm">
                    O estudo vira rotina e a comunidade começa a se formar.
                  </p>
                </div>
              </div>
            </div>

            {/* Cinturão — Expansão */}
            <div className="group absolute right-[10%] bottom-[18%] w-64">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-orbit-electric/40 opacity-60 transition-all duration-300 group-hover:opacity-100" />
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orbit-electric via-sky-400 to-orbit-purple shadow-[0_0_22px_rgba(56,189,248,0.6)] transform-gpu transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-orbit-electric">Cinturão — Expansão</div>
                  <p className="text-white/75 text-sm">
                    Mais pessoas, mais projetos, mais impacto.
                  </p>
                </div>
              </div>
            </div>

            {/* Lua — Consolidação */}
            <div className="group absolute left-[18%] bottom-[10%] w-60">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-orbit-purple/40 opacity-60 transition-all duration-300 group-hover:opacity-100" />
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orbit-purple via-indigo-300 to-orbit-electric shadow-[0_0_18px_rgba(167,139,250,0.55)] transform-gpu transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-orbit-purple">Lua — Consolidação</div>
                  <p className="text-white/75 text-sm">
                    O código vira renda. O sonho vira realidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Espaço Profundo — Órbita */}
            <div className="group absolute left-[42%] top-[6%] w-60">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-[#f6c177]/40 opacity-60 transition-all duration-300 group-hover:opacity-100" />
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#f6c177] via-[#f0b35b] to-[#c084fc] shadow-[0_0_18px_rgba(246,193,119,0.6)] transform-gpu transition-all duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-widest text-[#f6c177]">Espaço Profundo — Órbita</div>
                  <p className="text-white/75 text-sm">
                    A quebrada no centro da tecnologia.
                  </p>
                </div>
              </div>
            </div>

            {/* Partículas sutis */}
            <div className="absolute left-[48%] top-[28%] h-2 w-2 rounded-full bg-white/50 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
            <div className="absolute left-[30%] top-[70%] h-1.5 w-1.5 rounded-full bg-[#a78bfa]/60 shadow-[0_0_10px_rgba(167,139,250,0.7)]" />
            <div className="absolute left-[70%] top-[58%] h-1.5 w-1.5 rounded-full bg-[#60a5fa]/60 shadow-[0_0_10px_rgba(96,165,250,0.7)]" />
          </div>
        </div>
      </section>

      {/* Time */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Nosso <span className="gradient-text">Time</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-orbit-electric/20 text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-orbit-electric to-orbit-purple rounded-full mx-auto mb-4"></div>
                <CardTitle className="text-orbit-electric">Fundadores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Pessoas que viveram a transformação e decidiram compartilhar 
                  o conhecimento com a comunidade.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-purple/20 text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-orbit-purple to-orbit-electric rounded-full mx-auto mb-4"></div>
                <CardTitle className="text-orbit-purple">Mentores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Profissionais experientes que dedicam tempo para guiar 
                  a jornada de novos desenvolvedores.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orbit-electric/20 text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-orbit-electric to-orbit-purple rounded-full mx-auto mb-4"></div>
                <CardTitle className="text-orbit-electric">Orbiters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Orbiters que se ajudam mutuamente, criando uma rede 
                  de apoio e crescimento conjunto.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orbit-electric/10 to-orbit-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Faça parte da nossa <span className="gradient-text">história</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Junte-se ao movimento que está transformando vidas e construindo 
            o futuro da tecnologia na periferia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold px-12 py-6 text-xl"
            >
              🚀 Entrar para a Órbita
            </Button>
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-10 py-4 text-lg font-semibold text-white hover:bg-white/10"
            >
              📸 Seguir no Instagram
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
