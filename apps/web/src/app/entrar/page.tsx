"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import RocketProgress from "@/components/RocketProgress";
import { getFriendlyApiErrorMessage } from "@/lib/utils";
import ScrollReveal from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";
import useLoginScene from "@/components/three/LoginScene";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

const SpaceCanvas = dynamic(() => import("@/components/three/SpaceCanvas"), { ssr: false });

const slides = [
  { kind: "image" as const, src: "/case-destaque-multimarcas.png", alt: "Case Multimarcas" },
  { kind: "video" as const, src: "/hero.mp4", alt: "Orbitamos em acao" },
  { kind: "image" as const, src: "/mockup-yume.png", alt: "Case Yume" },
  { kind: "video" as const, src: "/cosmos.mp4", alt: "Cosmos Orbitamos" },
  { kind: "image" as const, src: "/mockup-sabrina.png", alt: "Case Sabrina Lashes" },
];

const SLIDE_INTERVAL = 5000;

export default function Entrar() {
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1); // 1 = email+senha, 2 = nome+role
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState<"STUDENT" | "FREELANCER">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { login, register: registerUser, loading: authLoading } = useAuth();
  const loginSetup = useLoginScene();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-advance slides
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((c) => (c + 1) % slides.length);
    }, SLIDE_INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goTo = useCallback((index: number) => {
    setActive(index);
    resetTimer();
  }, [resetTimer]);

  const goPrev = useCallback(() => {
    setActive((c) => (c - 1 + slides.length) % slides.length);
    resetTimer();
  }, [resetTimer]);

  const goNext = useCallback(() => {
    setActive((c) => (c + 1) % slides.length);
    resetTimer();
  }, [resetTimer]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Progress bar animation
  useEffect(() => {
    if (!loading || !showProgress) return;
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 20) progress += 5;
      else if (progress < 60) progress += 1.5;
      else if (progress < 90) progress += 0.8;
      else { clearInterval(interval); return; }
      setFakeProgress(Math.min(90, progress));
    }, 100);
    return () => clearInterval(interval);
  }, [loading, showProgress]);

  const resetFormMode = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin);
    setRegisterStep(1);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setShowProgress(false);
    setFakeProgress(0);
    if (nextIsLogin) setRegisterRole("STUDENT");
  };

  const handleNextStep = () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    if (!cleanEmail) { setError("Informe seu e-mail para continuar."); return; }
    if (!cleanPassword) { setError("Informe sua senha para continuar."); return; }
    if (cleanPassword.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    setError("");
    setRegisterStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail) { setError("Informe seu e-mail para continuar."); return; }
    if (!cleanPassword) { setError("Informe sua senha para continuar."); return; }
    if (cleanPassword.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (!isLogin && !cleanName) { setError("Informe seu nome completo para criar a conta."); return; }

    setLoading(true);
    setShowProgress(true);
    setFakeProgress(0);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (isLogin) await login(cleanEmail, cleanPassword);
      else await registerUser(cleanName, cleanEmail, cleanPassword, registerRole);
      setFakeProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[Entrar] Erro na autenticacao:", err);
      setError(getFriendlyApiErrorMessage(err));
      setFakeProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => { setShowProgress(false); setFakeProgress(0); }, 1000);
    }
  };

  const isBusy = loading || authLoading;

  return (
    <div className="relative h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden bg-[#03050a] text-white">
      {!isMobile && (
        <div className="absolute inset-0 z-0 opacity-70">
          <SpaceCanvas setup={loginSetup} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,255,.16),transparent_46%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,.14),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black to-transparent" />

      <div className="relative z-10 grid h-full max-h-full w-full items-stretch gap-0 overflow-hidden lg:grid-cols-[1fr_420px]" style={{ gridTemplateRows: "1fr" }}>

        {/* ══ LEFT — Carousel ══ */}
        <div className="hidden lg:block">
          <div className="relative ml-0 h-full w-full overflow-hidden rounded-r-2xl rounded-tl-2xl">
            {/* Slides */}
            {slides.map((slide, i) => (
              <div
                key={slide.src}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
              >
                {slide.kind === "image" ? (
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <video
                    src={slide.src}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              </div>
            ))}

            {/* Arrow buttons — almost transparent, brighter on hover */}
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-white/30 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-white/30 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
              aria-label="Proximo slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-7 bg-white"
                      : "w-2 bg-white/35 hover:bg-white/60"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Login Form ══ */}
        <ScrollReveal from={{ opacity: 0, y: 28, scale: 0.97 }} to={{ duration: 0.75, delay: 0.1 }}>
          <section className="mx-auto flex h-full w-full max-w-md items-center px-4 py-5 sm:px-6 lg:mx-0 lg:pl-6 lg:pr-6">
            <div className="w-full">
              <div className="mb-3 text-center lg:hidden">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orbit-electric/25 bg-black/35 px-3 py-1.5 backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5 text-orbit-electric" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-orbit-electric">
                    Portal Orbitamos
                  </span>
                </div>
                <h1 className="text-2xl font-black leading-tight text-white">
                  Continue sua jornada de estudos.
                </h1>
              </div>

              {/* Tab toggle */}
              <div className="mb-4">
                <div className="mb-3 flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
                  <button
                    type="button"
                    onClick={() => resetFormMode(true)}
                    className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      isLogin ? "bg-white text-black" : "text-white/55 hover:text-white"
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => resetFormMode(false)}
                    className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      !isLogin ? "bg-white text-black" : "text-white/55 hover:text-white"
                    }`}
                  >
                    Criar conta
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orbit-electric to-orbit-purple text-black">
                    {isLogin ? <ShieldCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {isLogin
                        ? "Acesse sua conta"
                        : registerStep === 1
                          ? "Crie seu acesso"
                          : "Quase la!"}
                    </h2>
                    <p className="text-sm text-white/50">
                      {isLogin
                        ? "Volte para suas aulas, progresso e comunidade."
                        : registerStep === 1
                          ? "Primeiro, defina seu e-mail e senha."
                          : "Agora nos conte sobre voce."}
                    </p>
                  </div>
                </div>

                {/* Step indicator for register */}
                {!isLogin && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${registerStep >= 1 ? "bg-orbit-electric" : "bg-white/10"}`} />
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${registerStep >= 2 ? "bg-orbit-electric" : "bg-white/10"}`} />
                  </div>
                )}
              </div>

              {/* ── LOGIN FORM ── */}
              {isLogin && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/60">E-mail</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@email.com"
                        className="h-11 rounded-xl border-white/10 bg-white/[0.05] pl-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                        required
                        autoComplete="email"
                        autoCapitalize="none"
                        inputMode="email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <label htmlFor="password" className="block text-sm font-medium text-white/60">Senha</label>
                      <Link href="/contato" className="text-xs font-medium text-orbit-electric hover:text-white">
                        Esqueci minha senha
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                        required
                        autoComplete="current-password"
                        autoCapitalize="none"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/42 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {showProgress && (
                    <RocketProgress progress={fakeProgress} message="Conectando sua conta..." />
                  )}

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-center text-sm text-red-200">
                      {error}
                      {error.includes("iniciando") && (
                        <p className="mt-2 text-xs text-white/52">Servicos gratuitos podem levar alguns segundos. Aguarde e tente novamente.</p>
                      )}
                    </div>
                  )}

                  <MagneticButton strength={0.12}>
                    <Button
                      type="submit"
                      disabled={isBusy}
                      className="mt-1 h-12 w-full rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple text-sm font-black text-black transition-all hover:from-orbit-purple hover:to-orbit-electric hover:shadow-[0_0_25px_rgba(0,212,255,0.25)] disabled:opacity-50"
                    >
                      {isBusy ? "Processando..." : "Entrar no portal"}
                      {!isBusy && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </MagneticButton>
                </form>
              )}

              {/* ── REGISTER STEP 1: email + senha ── */}
              {!isLogin && registerStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-white/60">E-mail</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@email.com"
                        className="h-11 rounded-xl border-white/10 bg-white/[0.05] pl-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                        required
                        autoComplete="email"
                        autoCapitalize="none"
                        inputMode="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-white/60">Senha</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crie uma senha"
                        className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                        required
                        autoComplete="new-password"
                        autoCapitalize="none"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/42 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-white/35">Use pelo menos 6 caracteres.</p>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-center text-sm text-red-200">{error}</div>
                  )}

                  <MagneticButton strength={0.12}>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="mt-1 h-12 w-full rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple text-sm font-black text-black transition-all hover:from-orbit-purple hover:to-orbit-electric hover:shadow-[0_0_25px_rgba(0,212,255,0.25)]"
                    >
                      Continuar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </MagneticButton>
                </div>
              )}

              {/* ── REGISTER STEP 2: nome + role ── */}
              {!isLogin && registerStep === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-white/60">Nome completo</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="h-11 rounded-xl border-white/10 bg-white/[0.05] pl-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                        required
                        autoComplete="name"
                        autoCapitalize="words"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/60">Tipo de conta</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRegisterRole("STUDENT")}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          registerRole === "STUDENT"
                            ? "border-orbit-electric/60 bg-orbit-electric/14 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/58 hover:bg-white/[0.06]"
                        }`}
                      >
                        <GraduationCap className="mb-1 h-5 w-5 text-orbit-electric" />
                        <span className="block text-sm font-bold">Aluno</span>
                        <span className="mt-0.5 block text-xs text-white/42">Acesso as aulas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterRole("FREELANCER")}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          registerRole === "FREELANCER"
                            ? "border-orbit-purple/60 bg-orbit-purple/14 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/58 hover:bg-white/[0.06]"
                        }`}
                      >
                        <BriefcaseBusiness className="mb-1 h-5 w-5 text-orbit-purple" />
                        <span className="block text-sm font-bold">Colaborador</span>
                        <span className="mt-0.5 block text-xs text-white/42">Squad de projetos</span>
                      </button>
                    </div>
                  </div>

                  {showProgress && (
                    <RocketProgress progress={fakeProgress} message="Criando seu acesso..." />
                  )}

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-center text-sm text-red-200">
                      {error}
                      {error.includes("iniciando") && (
                        <p className="mt-2 text-xs text-white/52">Servicos gratuitos podem levar alguns segundos. Aguarde e tente novamente.</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => { setRegisterStep(1); setError(""); }}
                      className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                    <MagneticButton strength={0.12} className="flex-1">
                      <Button
                        type="submit"
                        disabled={isBusy}
                        className="h-12 w-full rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple text-sm font-black text-black transition-all hover:from-orbit-purple hover:to-orbit-electric hover:shadow-[0_0_25px_rgba(0,212,255,0.25)] disabled:opacity-50"
                      >
                        {isBusy ? "Processando..." : "Criar acesso"}
                        {!isBusy && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </MagneticButton>
                  </div>
                </form>
              )}

              <p className="mt-4 text-center text-xs text-white/30">
                {isLogin
                  ? "Alunos vao para a area de estudos. Colaboradores acessam o painel de squad."
                  : registerStep === 1
                    ? "Na proxima etapa voce escolhe o tipo de conta."
                    : "Alunos estudam na OrbitAcademy. Colaboradores participam de projetos."}
              </p>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
