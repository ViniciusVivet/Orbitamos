"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import RocketProgress from "@/components/RocketProgress";
import { getFriendlyApiErrorMessage } from "@/lib/utils";
import ScrollReveal from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";

const SpaceCanvas = dynamic(() => import("@/components/three/SpaceCanvas"), { ssr: false });
const LoginScene = dynamic(() => import("@/components/three/LoginScene"), { ssr: false });

export default function Entrar() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"STUDENT" | "FREELANCER">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  let authContext;
  let login: ((email: string, password: string) => Promise<void>) | undefined;
  let registerUser: ((name: string, email: string, password: string, role?: "STUDENT" | "FREELANCER") => Promise<void>) | undefined;

  try {
    authContext = useAuth();
    login = authContext?.login;
    registerUser = authContext?.register;
  } catch {
    // AuthContext not ready
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!loading || !showProgress) return;

    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 20) {
        progress += 5;
      } else if (progress < 60) {
        progress += 1.5;
      } else if (progress < 90) {
        progress += 0.8;
      } else {
        clearInterval(interval);
        return;
      }
      setFakeProgress(Math.min(90, progress));
    }, 100);

    return () => clearInterval(interval);
  }, [loading, showProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !registerUser) {
      setError("Sistema de autenticacao nao esta pronto. Aguarde alguns segundos e tente novamente.");
      return;
    }

    setError("");
    setLoading(true);
    setShowProgress(true);
    setFakeProgress(0);

    try {
      if (!email.trim()) { setError("E-mail e obrigatorio"); setLoading(false); setShowProgress(false); return; }
      if (!password.trim()) { setError("Senha e obrigatoria"); setLoading(false); setShowProgress(false); return; }
      if (password.length < 6) { setError("A senha deve ter no minimo 6 caracteres"); setLoading(false); setShowProgress(false); return; }

      await new Promise(resolve => setTimeout(resolve, 200));

      if (isLogin) {
        await login(email.trim(), password);
      } else {
        if (!name.trim()) { setError("Nome e obrigatorio"); setLoading(false); setShowProgress(false); return; }
        await registerUser(name.trim(), email.trim(), password, registerRole);
      }

      setFakeProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[Entrar] Erro na autenticacao:", err);
      }
      setError(getFriendlyApiErrorMessage(err));
      setFakeProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowProgress(false);
        setFakeProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#03050a] text-white">
      {/* 3D Background */}
      {!isMobile && (
        <div className="absolute inset-0 z-0">
          <SpaceCanvas>
            <LoginScene />
          </SpaceCanvas>
        </div>
      )}

      {/* Mobile fallback gradients */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(0,212,255,.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,.15),transparent_50%)]" />
      <div className="absolute -top-40 left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-25 bg-[conic-gradient(from_120deg,theme(colors.orbit-electric/.5),theme(colors.orbit-purple/.4),transparent_70%)]" />

      <div className="relative z-10 container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-16">
        <div className="flex w-full max-w-4xl flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">

          {/* Left: OrbitAcademy teaser (desktop only) */}
          <ScrollReveal from={{ opacity: 0, x: -40 }} to={{ duration: 0.8 }} className="hidden lg:flex flex-col gap-6 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-orbit-electric/25 bg-orbit-electric/[0.08] px-3 py-1.5 w-fit backdrop-blur-xl">
              <span className="size-1.5 animate-pulse rounded-full bg-orbit-electric shadow-[0_0_12px_rgba(0,212,255,0.8)]" />
              <span className="text-xs font-bold tracking-widest text-orbit-electric uppercase">OrbitAcademy</span>
            </div>
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              Da quebrada<br />
              <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
                ao primeiro trampo em TI.
              </span>
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-sm">
              Trilha de formacao em tecnologia feita por quem veio da periferia. Cursos, missoes, comunidade e mentoria.
            </p>
            <ul className="space-y-3">
              {[
                { icon: "\u{1F3AF}", text: "Trilha do zero ao primeiro emprego" },
                { icon: "\u26A1", text: "Sistema de XP, niveis e missoes" },
                { icon: "\u{1F91D}", text: "Comunidade e forum exclusivo" },
                { icon: "\u{1F680}", text: "Projetos reais no portfolio" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm text-white/65">
                  <span className="text-base">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Right: Login card */}
          <ScrollReveal from={{ opacity: 0, y: 30, scale: 0.95 }} to={{ duration: 0.8, delay: 0.15 }}>
            <div className="relative w-full max-w-md flex-shrink-0 mx-auto lg:mx-0">
              {/* Gradient border glow */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-orbit-electric/50 via-orbit-purple/40 to-orbit-electric/30 blur-[1px]" />
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-orbit-electric/[0.06] to-orbit-purple/[0.06] blur-2xl" />

              {/* Animated border particles */}
              <div className="pointer-events-none absolute -inset-[1px] overflow-hidden rounded-2xl">
                <div className="absolute h-8 w-8 rounded-full bg-orbit-electric/30 blur-md animate-[spin_6s_linear_infinite]" style={{ top: "10%", left: "-2%" }} />
                <div className="absolute h-6 w-6 rounded-full bg-orbit-purple/30 blur-md animate-[spin_8s_linear_infinite_reverse]" style={{ bottom: "20%", right: "-2%" }} />
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#05080f] p-5 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,212,255,0.06),transparent)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(139,92,246,0.05),transparent)]" />

                {/* Scanlines */}
                <div className="pointer-events-none absolute inset-0 opacity-20" style={{
                  background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.02) 3px, rgba(0,212,255,0.02) 4px)",
                }} />

                <div className="relative">
                  {/* Header */}
                  <div className="mb-6 sm:mb-8 text-center">
                    <div className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 animate-orbit rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple shadow-[0_0_25px_rgba(0,212,255,0.5)]" />
                    <h1 className="bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-2xl sm:text-3xl font-extrabold text-transparent">
                      {isLogin ? "Entrar na Orbita" : "Criar Conta"}
                    </h1>
                    <p className="mt-2 text-white/45 text-sm">
                      {isLogin ? "Acesse sua conta para continuar sua jornada." : "Comece sua transformacao hoje!"}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                      <div>
                        <label htmlFor="name" className="mb-2 block text-sm text-white/70">Nome Completo</label>
                        <Input
                          id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-orbit-electric/60 transition-colors"
                          required={!isLogin} autoComplete="name" autoCapitalize="words"
                        />
                      </div>
                    )}

                    {!isLogin && (
                      <div>
                        <label className="mb-2 block text-sm text-white/70">Tipo de conta</label>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setRegisterRole("STUDENT")}
                            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                              registerRole === "STUDENT"
                                ? "border-orbit-electric/50 bg-orbit-electric/15 text-orbit-electric shadow-[0_0_15px_rgba(0,212,255,0.1)]"
                                : "border-white/15 text-white/60 hover:bg-white/[0.05]"
                            }`}>
                            {"\uD83C\uDF93"} Estudante
                          </button>
                          <button type="button" onClick={() => setRegisterRole("FREELANCER")}
                            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                              registerRole === "FREELANCER"
                                ? "border-orbit-purple/50 bg-orbit-purple/15 text-orbit-purple shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                : "border-white/15 text-white/60 hover:bg-white/[0.05]"
                            }`}>
                            {"\uD83D\uDCBC"} Colaborador
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs text-white/40">
                          {registerRole === "STUDENT" ? "Acesso a video-aulas e mentorias." : "Projetos reais, vagas e contato com o squad."}
                        </p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm text-white/70">E-mail</label>
                      <Input
                        id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@email.com"
                        className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-orbit-electric/60 transition-colors"
                        required autoComplete="email" autoCapitalize="none" inputMode="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-2 block text-sm text-white/70">Senha</label>
                      <Input
                        id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                        className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-orbit-electric/60 transition-colors"
                        required autoComplete={isLogin ? "current-password" : "new-password"} autoCapitalize="none" minLength={6}
                      />
                      {!isLogin && <p className="mt-1.5 text-xs text-white/40">Minimo de 6 caracteres</p>}
                    </div>

                    {showProgress && (
                      <div className="py-2 sm:py-4">
                        <RocketProgress
                          progress={fakeProgress}
                          message={isLogin ? "Conectando a sua conta..." : "Criando sua conta..."}
                        />
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                        {error}
                        {error.includes("iniciando") && (
                          <p className="mt-2 text-xs text-white/50">
                            Dica: Servicos gratuitos podem levar alguns segundos para iniciar. Aguarde e tente novamente.
                          </p>
                        )}
                      </div>
                    )}

                    <MagneticButton strength={0.15}>
                      <Button
                        type="submit" disabled={loading}
                        className="mt-2 w-full h-11 bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:from-orbit-purple hover:to-orbit-electric font-bold disabled:opacity-50 transition-all hover:shadow-[0_0_25px_rgba(0,212,255,0.25)]"
                      >
                        {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
                      </Button>
                    </MagneticButton>
                  </form>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between text-xs sm:text-sm text-white/60">
                    {isLogin ? (
                      <Link href="/contato" className="hover:text-white transition-colors underline">
                        Esqueci minha senha
                      </Link>
                    ) : (
                      <span className="text-white/40">Minimo de 6 caracteres</span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError(""); setName(""); setEmail(""); setPassword("");
                        setShowProgress(false); setFakeProgress(0);
                      }}
                      className="hover:text-white transition-colors underline bg-transparent border-0 cursor-pointer p-0 font-inherit"
                    >
                      {isLogin ? "Criar conta" : "Ja tem conta? Fazer login"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </div>
  );
}
