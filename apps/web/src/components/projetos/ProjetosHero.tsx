"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { whatsappProjetosUrl } from "@/lib/social";
import ProjetosHeroParticles from "./ProjetosHeroParticles";
import ScrollReveal from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";

const SpaceCanvas = dynamic(() => import("@/components/three/SpaceCanvas"), { ssr: false });
const ProjetosHeroScene = dynamic(() => import("@/components/three/ProjetosHeroScene"), { ssr: false });

export default function ProjetosHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const getRelative = useCallback((clientX: number, clientY: number) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setMouse({ x, y });
    setActive(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    getRelative(e.clientX, e.clientY);
  }, [getRelative]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const t = e.touches[0];
    if (t) getRelative(t.clientX, t.clientY);
  }, [getRelative]);

  const handleLeave = useCallback(() => {
    setActive(false);
    setMouse({ x: 0, y: 0 });
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
      className="relative overflow-hidden border-b border-white/10 min-h-[200px] md:min-h-[240px] bg-[#03050c]"
    >
      {/* 3D background on desktop */}
      {!isMobile && (
        <div className="absolute inset-0 z-0">
          <SpaceCanvas dpr={1}>
            <ProjetosHeroScene />
          </SpaceCanvas>
        </div>
      )}

      <video
        ref={videoRef}
        src="/hero-projetos.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover [&::-webkit-media-controls]:hidden"
        aria-hidden
        style={{
          opacity: isMobile ? 0.5 : 0.2,
          transform: `scale(1.1) translate(${mouse.x * -4}%, ${mouse.y * -4}%)`,
          transition: active ? "transform 0.1s ease-out" : "transform 0.9s ease-out",
          willChange: "transform",
        }}
      />
      <div className="absolute inset-0 z-[1] bg-black/50" aria-hidden />
      <ProjetosHeroParticles />

      <div className="container relative z-10 mx-auto px-4 py-7 md:py-10 text-center">
        <ScrollReveal from={{ opacity: 0, y: -15 }} to={{ duration: 0.5 }}>
          <p className="mb-3 text-[11px] font-medium tracking-[0.2em] text-orbit-electric/90 uppercase">
            Portfolio comercial
          </p>
        </ScrollReveal>

        <ScrollReveal from={{ opacity: 0, y: 20, scale: 0.97 }} to={{ duration: 0.7, delay: 0.1 }}>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            Projetos reais,{" "}
            <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
              transformados em produto
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal from={{ opacity: 0, y: 15 }} to={{ duration: 0.6, delay: 0.25 }}>
          <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-white/90 rounded-lg px-4 py-2" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 80%, transparent 100%)" }}>
            Em poucos minutos, veja exemplos reais de landing pages, sites, sistemas e automacoes que a Orbitamos ja colocou no ar.
          </p>
        </ScrollReveal>

        <ScrollReveal from={{ opacity: 0, y: 15 }} to={{ duration: 0.5, delay: 0.4 }}>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton strength={0.2}>
              <Button
                asChild
                size="sm"
                className="px-6 bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:from-orbit-purple hover:to-orbit-electric transition-all shadow-[0_0_20px_theme(colors.orbit-electric/.25)]"
              >
                <a href="#projetos-grid">Ver projetos agora</a>
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
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
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
