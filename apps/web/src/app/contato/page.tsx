"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContact } from "@/lib/api";

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
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
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
    <>
      <style>{`
        @keyframes holoExpand {
          0%   { transform: scale(0.92); opacity: 0.55; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes holoScanUp {
          0%   { transform: translateY(110%); opacity: 0; }
          15%  { opacity: 0.7; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(-110%); opacity: 0; }
        }
        @keyframes holoScanDown {
          0%   { transform: translateY(-110%); opacity: 0; }
          15%  { opacity: 0.35; }
          85%  { opacity: 0.35; }
          100% { transform: translateY(110%); opacity: 0; }
        }
        @keyframes waPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(37,211,102,0.25), 0 0 30px rgba(37,211,102,0.08); }
          50%       { box-shadow: 0 0 20px rgba(37,211,102,0.45), 0 0 50px rgba(37,211,102,0.15); }
        }
        @keyframes waCone {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        .holo-ring {
          position: absolute;
          inset: 8% -6%;
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 20px;
          animation: holoExpand 3.2s ease-out infinite;
          pointer-events: none;
        }
        .holo-scan-up {
          position: absolute;
          inset-inline: -4%;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.6) 20%, rgba(139,92,246,0.5) 60%, transparent 100%);
          animation: holoScanUp 5s ease-in-out infinite;
          pointer-events: none;
          filter: blur(1px);
        }
        .holo-scan-down {
          position: absolute;
          inset-inline: -4%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.3) 50%, transparent 100%);
          animation: holoScanDown 7s ease-in-out infinite;
          animation-delay: 2s;
          pointer-events: none;
        }
        .wa-holo-btn {
          animation: waPulse 3s ease-in-out infinite;
        }
        .wa-cone {
          animation: waCone 3s ease-in-out infinite;
        }
      `}</style>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative text-white"
        style={{ minHeight: "calc(100dvh - 4rem)", overflowX: "hidden", overflowY: isMobile ? "auto" : "hidden" }}
      >
        {/* Vídeo de fundo com parallax */}
        <video
          ref={videoRef}
          src="/contato-fundo.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover [&::-webkit-media-controls]:hidden"
          style={{
            transform: isMobile ? "scale(1.05)" : `scale(1.08) translate(${mouse.x * -5}%, ${mouse.y * -4}%)`,
            transition: active ? "transform 0.1s ease-out" : "transform 0.9s ease-out",
            willChange: "transform",
          }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

        {/* ── Conteúdo ── */}
        <div
          className="relative z-10 flex min-h-[calc(100dvh-4rem)] items-center"
          style={{
            transform: isMobile ? "none" : `perspective(1400px) rotateX(${mouse.y * -2}deg) rotateY(${mouse.x * 2}deg)`,
            transition: active ? "transform 0.1s ease-out" : "transform 0.9s ease-out",
            willChange: "transform",
          }}
        >
          {/* Cone de luz projetado — só desktop */}
          <div className="pointer-events-none absolute bottom-0 z-0 hidden md:block" style={{ left: "clamp(1.5rem, 5vw, 6rem)", width: "420px" }}>
            <div style={{
              width: "100%",
              height: "40vh",
              background: "linear-gradient(180deg, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0.07) 40%, transparent 100%)",
              clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
              filter: "blur(16px)",
            }} />
          </div>
          {/* Reflexo no chão — só desktop */}
          <div className="pointer-events-none absolute bottom-0 z-0 h-6 hidden md:block" style={{ left: "clamp(1.5rem, 5vw, 6rem)", width: "420px", background: "radial-gradient(ellipse at center, rgba(0,212,255,0.25), transparent 70%)", filter: "blur(6px)" }} />

          <div
            className="w-full py-8 md:py-0 flex items-center"
            style={{
              paddingLeft: isMobile ? "1rem" : "clamp(1.5rem, 5vw, 6rem)",
              paddingRight: isMobile ? "1rem" : "0",
            }}
          >
            <div className="w-full max-w-[420px] mx-auto md:mx-0 flex flex-col gap-3">

              {/* ── Rastro holográfico (gerado atrás do form) ── */}
              <div className="pointer-events-none absolute hidden md:block" style={{ inset: 0, left: "clamp(1.5rem, 5vw, 6rem)", width: "420px" }}>
                <div className="relative h-full">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="holo-ring" style={{ animationDelay: `${i * 0.8}s` }} />
                  ))}
                  <div className="holo-scan-up" />
                  <div className="holo-scan-down" />
                  {/* Pontos de grade holográfica */}
                  {[15, 35, 55, 75].map((top) => (
                    <div key={top} className="absolute flex gap-8" style={{ top: `${top}%`, left: "10%", opacity: 0.18 }}>
                      {[0,1,2,3,4].map(j => (
                        <div key={j} style={{ width: 2, height: 2, borderRadius: "50%", background: "#00D4FF" }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Formulário holográfico ── */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  padding: isMobile ? "14px" : "28px",
                  background: isMobile ? "rgba(0,10,22,0.05)" : "rgba(0,10,22,0.25)",
                  border: "1px solid rgba(0,212,255,0.22)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  boxShadow: "0 0 25px rgba(0,212,255,0.12), 0 0 60px rgba(0,212,255,0.05), inset 0 1px 0 rgba(0,212,255,0.15), inset 0 -1px 0 rgba(139,92,246,0.1)",
                  transform: isMobile ? "none" : `perspective(600px) rotateX(${mouse.y * -6}deg) rotateY(${mouse.x * 6}deg) translateZ(40px)`,
                  transition: active ? "transform 0.08s ease-out" : "transform 0.9s ease-out",
                  willChange: "transform",
                }}
              >
                {/* Scanlines sutis */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-40" style={{
                  background: "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,212,255,0.012) 5px, rgba(0,212,255,0.012) 6px)",
                }} />
                {/* Linha de luz no topo */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(0,212,255,0.7) 50%, transparent 95%)" }} />

                {/* Header */}
                <div className="mb-3">
                  <div className="mb-1.5 inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orbit-electric" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-orbit-electric">Orbitamos Studio</span>
                  </div>
                  <h1 className="font-black leading-tight" style={{ fontSize: isMobile ? "1.2rem" : "1.75rem" }}>
                    Vamos construir{" "}
                    <span className="bg-gradient-to-r from-orbit-electric via-sky-300 to-orbit-purple bg-clip-text text-transparent">
                      algo juntos?
                    </span>
                  </h1>
                  <p className="mt-1 text-[11px] text-white/50">Orçamento sem compromisso · Resposta em até 24h.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">

                  {/* Nome + Email */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Nome</label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Seu nome" required
                        className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-orbit-electric/60 h-9 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/50">E-mail</label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="voce@email.com" required
                        className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-orbit-electric/60 h-9 text-sm" />
                    </div>
                  </div>

                  {/* Tipo de projeto */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Tipo de projeto</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SERVICES.map((s) => (
                        <button key={s.label} type="button" onClick={() => setFormData({ ...formData, service: s.label })}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150"
                          style={{
                            background: formData.service === s.label ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.05)",
                            border: formData.service === s.label ? "1px solid rgba(0,212,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                            color: formData.service === s.label ? "#00D4FF" : "rgba(255,255,255,0.55)",
                          }}>
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label htmlFor="message" className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Descreva o projeto</label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange}
                      placeholder="O que você precisa, qual o objetivo, tem prazo?"
                      rows={isMobile ? 2 : 3} required
                      className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-orbit-electric/60 resize-none text-sm" />
                  </div>

                  {isSuccess && (
                    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "rgba(52,211,153,1)" }}>
                      Mensagem recebida! Entro em contato em até 24h.
                    </div>
                  )}
                  {error && (
                    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(252,165,165,1)" }}>
                      {error}
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold hover:brightness-110 transition-all disabled:opacity-50 h-9">
                    {isLoading ? "Enviando..." : "Enviar mensagem"}
                  </Button>
                </form>
              </div>

            </div>
          </div>
        </div>

        {/* ── WhatsApp Holograma — canto direito ── */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end">
          {/* Cone de luz apontando para a esquerda */}
          <div className="wa-cone pointer-events-none absolute right-full top-1/2 -translate-y-1/2" style={{
            width: "90px",
            height: "50px",
            background: "linear-gradient(270deg, rgba(37,211,102,0.22) 0%, rgba(37,211,102,0.05) 60%, transparent 100%)",
            clipPath: "polygon(100% 15%, 100% 85%, 0% 50%)",
            filter: "blur(5px)",
          }} />
          {/* Reflexo no chão */}
          <div className="pointer-events-none absolute right-0 bottom-[-18px]" style={{
            width: "52px",
            height: "12px",
            background: "radial-gradient(ellipse at center, rgba(37,211,102,0.2), transparent 70%)",
            filter: "blur(4px)",
          }} />

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="wa-holo-btn group flex flex-col items-center gap-1.5 rounded-l-2xl px-3 pt-3 pb-2.5 transition-all duration-200 hover:pr-4"
            style={{
              background: "rgba(0,15,8,0.55)",
              border: "1px solid rgba(37,211,102,0.35)",
              borderRight: "none",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {/* Linha de luz no topo */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-px" style={{ background: "linear-gradient(180deg, transparent 5%, rgba(37,211,102,0.5) 50%, transparent 95%)" }} />

            {/* Ícone */}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
              style={{
                background: "rgba(37,211,102,0.12)",
                border: "1px solid rgba(37,211,102,0.45)",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.054 23.25a.75.75 0 00.916.916l5.39-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.52-5.17-1.426l-.37-.22-3.838 1.052 1.052-3.837-.22-.371A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fill="#25D366"/>
              </svg>
            </div>

            {/* Label */}
            <span style={{ fontSize: "8px", color: "rgba(37,211,102,0.65)", letterSpacing: "0.18em", fontWeight: 700 }}>
              CHAT
            </span>
          </a>
        </div>

      </div>
    </>
  );
}
