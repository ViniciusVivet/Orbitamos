"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContact } from "@/lib/api";
import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/5511949138973?text=Ol%C3%A1%2C+vim+pelo+site+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento";
const INSTAGRAM_URL = "https://www.instagram.com/orbitamosbr/";

const SERVICES = [
  { icon: "📄", label: "Landing Page" },
  { icon: "🏢", label: "Site Institucional" },
  { icon: "⚙️", label: "Sistema Web / MVP" },
  { icon: "🛒", label: "E-commerce" },
  { icon: "🤖", label: "Automação" },
  { icon: "❓", label: "Outro" },
];

export default function Contato() {
  const [formData, setFormData] = useState({ name: "", email: "", service: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setIsSuccess(false);

    try {
      try {
        await sendContact({ name: formData.name, email: formData.email, message: `[${formData.service}] ${formData.message}` });
      } catch { /* falha silenciosa */ }

      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } catch { /* falha silenciosa */ }

      setIsSuccess(true);
      setFormData({ name: "", email: "", service: "", message: "" });
      setTimeout(() => setIsSuccess(false), 6000);
    } catch {
      setError("Erro ao enviar. Tente novamente ou fale pelo WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Gradiente de fundo */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0,212,255,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl px-6 py-16 sm:py-24">

        {/* ── Header ── */}
        <div className="mb-16">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orbit-electric" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-orbit-electric/60">
              Orbitamos Studio
            </span>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Vamos construir<br />
            <span className="bg-gradient-to-r from-orbit-electric via-sky-300 to-orbit-purple bg-clip-text text-transparent">
              algo juntos?
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/45 leading-relaxed">
            Orçamento sem compromisso. Resposta em até 24h.
            Projetos entregues em até 1 semana.
          </p>
        </div>

        {/* ── Grid principal ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">

          {/* ── Formulário ── */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="mb-6 text-lg font-bold text-white">Conte seu projeto</h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nome + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    Nome
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    required
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-orbit-electric/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="voce@email.com"
                    required
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-orbit-electric/50 transition-colors"
                  />
                </div>
              </div>

              {/* Tipo de projeto */}
              <div>
                <label className="mb-2 block text-xs font-medium text-white/50 uppercase tracking-wider">
                  Tipo de projeto
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, service: s.label })}
                      className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150"
                      style={{
                        background: formData.service === s.label ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
                        border: formData.service === s.label ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.07)",
                        color: formData.service === s.label ? "#00D4FF" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                  Descreva o projeto
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Me conta: o que você precisa, qual o objetivo, tem prazo? Quanto mais detalhe, melhor o orçamento."
                  rows={5}
                  required
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-orbit-electric/50 transition-colors resize-none"
                />
              </div>

              {/* Feedback */}
              {isSuccess && (
                <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "rgba(52,211,153,0.9)" }}>
                  Mensagem recebida! Entro em contato em até 24h. Se preferir resposta imediata, chama no WhatsApp.
                </div>
              )}
              {error && (
                <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(252,165,165,0.9)" }}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isLoading ? "Enviando..." : "Enviar mensagem"}
              </Button>

            </form>
          </div>

          {/* ── Sidebar direita ── */}
          <div className="flex flex-col gap-4">

            {/* CTA WhatsApp — destaque */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-2xl p-6 transition-all duration-150"
              style={{
                background: "rgba(37,211,102,0.06)",
                border: "1px solid rgba(37,211,102,0.2)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.2)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.054 23.25a.75.75 0 00.916.916l5.39-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.52-5.17-1.426l-.37-.22-3.838 1.052 1.052-3.837-.22-.371A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Resposta imediata</p>
                  <p className="text-xs" style={{ color: "rgba(37,211,102,0.7)" }}>WhatsApp · (11) 94913-8973</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                Prefere conversar direto? Chama no WhatsApp e a gente já começa a discutir seu projeto.
              </p>
              <p className="mt-3 text-xs font-semibold transition-colors group-hover:opacity-80" style={{ color: "rgba(37,211,102,0.8)" }}>
                Abrir conversa →
              </p>
            </a>

            {/* Info cards */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Como funciona</p>
              <div className="space-y-4">
                {[
                  { step: "01", title: "Você manda o briefing", desc: "Formulário ou WhatsApp — do jeito que preferir." },
                  { step: "02", title: "A gente manda o orçamento", desc: "Em até 24h, sem enrolação." },
                  { step: "03", title: "Projeto no ar", desc: "Entrega em até 1 semana após aprovação." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <span
                      className="mt-0.5 shrink-0 text-[10px] font-black tabular-nums"
                      style={{ color: "rgba(0,212,255,0.4)" }}
                    >
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{item.title}</p>
                      <p className="text-xs text-white/35">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email + Instagram */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="mailto:aquelequevivencia@gmail.com"
                className="rounded-xl p-4 transition-all duration-150 hover:border-white/10"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">E-mail</p>
                <p className="text-xs text-white/60 break-all">aquelequevivencia<br />@gmail.com</p>
              </a>
              <Link
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl p-4 transition-all duration-150 hover:border-white/10"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">Instagram</p>
                <p className="text-xs text-white/60">@orbitamosbr</p>
                <p className="mt-1 text-[10px]" style={{ color: "rgba(0,212,255,0.5)" }}>Ver perfil →</p>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
