import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <section className="relative overflow-hidden py-24 md:py-32">

      {/* Fundo com gradiente próprio */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, #050d1a 0%, #0a0520 50%, #050d1a 100%)",
        }}
      />

      {/* Blobs de luz */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute right-1/4 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-6 text-center">

        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-orbit-electric">
          Próximo passo
        </p>

        <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
          Seu projeto começa{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #00D4FF, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            com uma conversa.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-md text-sm text-white/60">
          Orçamento sem compromisso · Resposta em 24h · Entrega em até 1 semana
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-sm font-bold transition-all duration-150 hover:brightness-110 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
              color: "#000",
              boxShadow: "0 0 40px rgba(0,212,255,0.25), 0 0 80px rgba(139,92,246,0.15)",
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
            className="rounded-xl border px-8 py-4 text-sm font-semibold text-white/75 transition-all duration-150 hover:border-white/30 hover:text-white"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            Preencher formulário
          </Link>
        </div>

      </div>
    </section>
  );
}
