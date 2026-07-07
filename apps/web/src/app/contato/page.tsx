"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ScrollReveal from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";
import useContactScene from "@/components/three/ContactScene";

const SpaceCanvas = dynamic(() => import("@/components/three/SpaceCanvas"), { ssr: false });

const SERVICES = [
  { icon: "\u{1F4C4}", label: "Landing Page" },
  { icon: "\u{1F3E2}", label: "Site Institucional" },
  { icon: "\u2699\uFE0F", label: "Sistema Web / MVP" },
  { icon: "\u{1F6D2}", label: "E-commerce" },
  { icon: "\u{1F916}", label: "Automação" },
  { icon: "\u2753", label: "Outro" },
];

export default function Contato() {
  const [formData, setFormData] = useState({ name: "", email: "", service: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sendAnimation, setSendAnimation] = useState(false);
  const contactSetup = useContactScene();

  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setActive(true);
    setMouse({ x, y });
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    setActive(false);
    setMouse({ x: 0, y: 0 });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setIsSuccess(false);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao enviar contato.");
      }

      setSendAnimation(true);
      setTimeout(() => {
        setIsSuccess(true);
        setSendAnimation(false);
        setFormData({ name: "", email: "", service: "", message: "" });
        setTimeout(() => setIsSuccess(false), 6000);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente ou fale pelo WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#03050a] text-white"
    >
      {/* 3D Background */}
      {!isMobile && (
        <div className="absolute inset-0 z-0">
          <SpaceCanvas setup={contactSetup} />
        </div>
      )}

      {/* Video fallback */}
      <video
        src="/contato-fundo.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover [&::-webkit-media-controls]:hidden"
        style={{
          opacity: isMobile ? 0.4 : 0.12,
          transform: isMobile ? "scale(1.05)" : `scale(1.08) translate(${mouse.x * -3}%, ${mouse.y * -2}%)`,
          transition: active ? "transform 0.1s ease-out" : "transform 0.9s ease-out",
          willChange: "transform",
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03050a]/60 via-transparent to-[#03050a]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,212,255,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(139,92,246,0.06),transparent_50%)]" />

      {/* Content - centered */}
      <div className="relative z-10 flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">

          {/* Header with Orbi */}
          <ScrollReveal from={{ opacity: 0, y: -20 }} to={{ duration: 0.7 }}>
            <div className="mb-8 text-center">
              <img
                src="/orbi-contact.png"
                alt="Orbi, mascote da Orbitamos"
                className="mx-auto mb-4 w-24 drop-shadow-[0_0_24px_rgba(0,212,255,0.25)] sm:w-28"
              />
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orbit-electric/25 bg-orbit-electric/[0.08] px-4 py-1.5 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orbit-electric shadow-[0_0_12px_rgba(0,212,255,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orbit-electric">Transmissao aberta</span>
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Vamos construir{" "}
                <span className="bg-gradient-to-r from-orbit-electric via-sky-300 to-orbit-purple bg-clip-text text-transparent">
                  algo incrivel?
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm text-white/50">
                Orcamento sem compromisso. Resposta em ate 24h.
              </p>
            </div>
          </ScrollReveal>

          {/* Form card */}
          <ScrollReveal from={{ opacity: 0, y: 40, scale: 0.95 }} to={{ duration: 0.8, delay: 0.2 }}>
            <div
              className={`relative overflow-hidden rounded-2xl transition-all duration-700 ${sendAnimation ? "scale-95 opacity-70" : ""}`}
              style={{
                background: "rgba(5, 8, 18, 0.6)",
                border: "1px solid rgba(0,212,255,0.18)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 0 40px rgba(0,212,255,0.08), 0 0 80px rgba(0,212,255,0.04), 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,212,255,0.12), inset 0 -1px 0 rgba(139,92,246,0.08)",
                transform: isMobile ? "none" : `perspective(800px) rotateX(${mouse.y * -3}deg) rotateY(${mouse.x * 3}deg)`,
                transition: active ? "transform 0.08s ease-out" : "transform 0.9s ease-out",
                willChange: "transform",
              }}
            >
              {/* Top glow line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(0,212,255,0.6) 50%, transparent 90%)" }} />

              {/* Scanlines */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-30" style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,212,255,0.015) 4px, rgba(0,212,255,0.015) 5px)",
              }} />

              {/* Send animation - particle burst */}
              {sendAnimation && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                  <div className="h-3 w-3 animate-ping rounded-full bg-orbit-electric shadow-[0_0_30px_rgba(0,212,255,0.8)]" />
                  <div className="absolute h-16 w-16 animate-ping rounded-full border border-orbit-electric/40 [animation-delay:0.2s]" />
                  <div className="absolute h-32 w-32 animate-ping rounded-full border border-orbit-electric/20 [animation-delay:0.4s]" />
                </div>
              )}

              <div className="relative p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Name + Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Nome</label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Seu nome" required
                        className="h-10 border-white/[0.1] bg-white/[0.06] text-white placeholder:text-white/25 focus:border-orbit-electric/60 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">E-mail</label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="voce@email.com" required
                        className="h-10 border-white/[0.1] bg-white/[0.06] text-white placeholder:text-white/25 focus:border-orbit-electric/60 text-sm" />
                    </div>
                  </div>

                  {/* Service type */}
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Tipo de projeto</label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICES.map((s) => (
                        <button key={s.label} type="button" onClick={() => setFormData({ ...formData, service: s.label })}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                            formData.service === s.label
                              ? "border border-orbit-electric/50 bg-orbit-electric/15 text-orbit-electric shadow-[0_0_12px_rgba(0,212,255,0.15)]"
                              : "border border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:bg-white/[0.08]"
                          }`}>
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Descreva o projeto</label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange}
                      placeholder="O que você precisa, qual o objetivo, tem prazo?"
                      rows={isMobile ? 3 : 4} required
                      className="border-white/[0.1] bg-white/[0.06] text-white placeholder:text-white/25 focus:border-orbit-electric/60 resize-none text-sm" />
                  </div>

                  {/* Success */}
                  {isSuccess && (
                    <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "rgba(52,211,153,1)" }}>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                      Mensagem recebida! Entro em contato em até 24h.
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="rounded-xl px-4 py-3 text-sm"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(252,165,165,1)" }}>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <MagneticButton strength={0.15}>
                    <Button type="submit" disabled={isLoading || sendAnimation}
                      className="h-11 w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-sm font-bold text-black transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] disabled:opacity-50">
                      {isLoading ? "Enviando..." : sendAnimation ? "Transmitindo..." : "Enviar mensagem"}
                    </Button>
                  </MagneticButton>
                </form>

                {/* Bottom detail */}
                <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-white/30">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-orbit-electric/50" />
                    Conexão segura
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-orbit-purple/50" />
                    Sem spam
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-emerald-400/50" />
                    Resposta 24h
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Social link */}
          <ScrollReveal from={{ opacity: 0, y: 15 }} to={{ duration: 0.5, delay: 0.5 }}>
            <div className="mt-6 text-center">
              <p className="text-xs text-white/35">
                Prefere redes sociais?{" "}
                <a href="https://www.instagram.com/orbitamosbr/" target="_blank" rel="noreferrer"
                  className="text-orbit-electric/70 underline transition-colors hover:text-orbit-electric">
                  @orbitamosbr
                </a>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
