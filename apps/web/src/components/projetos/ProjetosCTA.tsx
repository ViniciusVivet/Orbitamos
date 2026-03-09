import Link from "next/link";
import { Button } from "@/components/ui/button";
import { whatsappProjetosUrl } from "@/lib/social";

interface ProjetosCTAProps {
  variant?: "inline" | "section";
}

export default function ProjetosCTA({ variant = "section" }: ProjetosCTAProps) {
  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button
          asChild
          className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:from-orbit-purple hover:to-orbit-electric"
        >
          <a href={whatsappProjetosUrl} target="_blank" rel="noreferrer">
            Quer um projeto assim? Falar no WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="border-white/25 text-white hover:bg-white/10">
          <Link href="/contato">Pedir orçamento</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="border-t border-white/10 bg-gradient-to-b from-transparent to-orbit-electric/5 py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Pronto para o seu próximo projeto?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Orçamento sem compromisso. Conte sua ideia e nós mostramos como podemos entregar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold hover:from-orbit-purple hover:to-orbit-electric shadow-[0_0_20px_theme(colors.orbit-electric/.3)]"
          >
            <a href={whatsappProjetosUrl} target="_blank" rel="noreferrer">
              WhatsApp — Orçamento
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10">
            <Link href="/contato">Página de contato</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
