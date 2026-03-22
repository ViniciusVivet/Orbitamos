import Link from "next/link";
import { Button } from "@/components/ui/button";
import { whatsappProjetosUrl } from "@/lib/social";

const WHATSAPP_URL = "https://wa.me/5511949138973?text=Ol%C3%A1%2C+vim+pelo+portf%C3%B3lio+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento";

interface ProjetosCTAProps {
  variant?: "inline" | "section";
}

export default function ProjetosCTA({ variant = "section" }: ProjetosCTAProps) {
  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button
          asChild
          className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:brightness-110"
        >
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Quero um projeto assim
          </a>
        </Button>
        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <Link href="/contato">Pedir orçamento</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="py-24 md:py-32" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="container mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-orbit-electric/50">
              Próximo passo
            </p>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Seu projeto<br />
              <span
                style={{
                  background: "linear-gradient(90deg, #00D4FF, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                começa aqui.
              </span>
            </h2>
            <p className="mt-4 text-sm text-white/35">
              Orçamento sem compromisso · Resposta em 24h · Entrega em até 1 semana
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-150 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
                color: "#000",
                boxShadow: "0 0 30px rgba(0,212,255,0.2)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.054 23.25a.75.75 0 00.916.916l5.39-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.52-5.17-1.426l-.37-.22-3.838 1.052 1.052-3.837-.22-.371A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Pedir orçamento no WhatsApp
            </a>
            <Link
              href="/contato"
              className="text-xs text-white/25 underline underline-offset-4 transition-colors hover:text-white/50"
            >
              Ou preencher o formulário →
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
