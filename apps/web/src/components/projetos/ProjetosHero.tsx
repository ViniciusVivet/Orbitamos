import { Button } from "@/components/ui/button";
import { whatsappProjetosUrl } from "@/lib/social";
import ProjetosHeroParticles from "./ProjetosHeroParticles";

export default function ProjetosHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 min-h-[200px] md:min-h-[240px] bg-[#03050c]">
      <video
        src="/hero-projetos.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 z-[1] bg-black/60" aria-hidden />
      <ProjetosHeroParticles />

      <div className="container relative z-10 mx-auto px-4 py-7 md:py-10 text-center">
        <p className="mb-3 text-[11px] font-medium tracking-[0.2em] text-orbit-electric/90 uppercase">
          Portfólio comercial
        </p>
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
          Projetos reais,{" "}
          <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
            transformados em produto
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-white/70">
          Em poucos minutos, veja exemplos reais de landing pages, sites, sistemas e automações que a Orbitamos já colocou no ar.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="sm"
            className="px-6 bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:from-orbit-purple hover:to-orbit-electric transition-all shadow-[0_0_20px_theme(colors.orbit-electric/.25)]"
          >
            <a href="#projetos-grid">Ver projetos agora</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="px-6 border-white/25 text-white hover:bg-white/10"
          >
            <a href={whatsappProjetosUrl} target="_blank" rel="noreferrer">
              Pedir um projeto parecido
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
