import Link from "next/link";
import { Button } from "@/components/ui/button";
import { whatsappProjetosUrl } from "@/lib/social";

export default function ProjetosHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-black via-gray-900/50 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,255,.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,.12),transparent_50%)]" />
      <div className="container relative mx-auto px-4 py-24 md:py-32 text-center">
        <p className="mb-4 text-sm font-medium tracking-widest text-orbit-electric/90 uppercase">
          Portfólio comercial
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          Projetos reais,{" "}
          <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
            transformados em produto
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
          Vitrine do que a Orbitamos já construiu: landing pages, sites, sistemas e automações que entregam resultado.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:from-orbit-purple hover:to-orbit-electric transition-all shadow-[0_0_20px_theme(colors.orbit-electric/.25)]"
          >
            <a href="#projetos-grid">Ver projetos</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/25 text-white hover:bg-white/10"
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
