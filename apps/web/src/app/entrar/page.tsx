"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
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
  PlayCircle,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

const SpaceCanvas = dynamic(() => import("@/components/three/SpaceCanvas"), { ssr: false });

type ShowcaseSlide = {
  kind: "image" | "video";
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  caption: string;
};

const showcaseSlides: ShowcaseSlide[] = [
  {
    kind: "image",
    src: "/card-arquitetura.png",
    alt: "Card visual da fase de arquitetura da Orbitamos",
    eyebrow: "Arquitetura",
    title: "Planejamento da jornada",
    caption: "Foto 1 de 3",
  },
  {
    kind: "image",
    src: "/card-construcao.png",
    alt: "Card visual da fase de construcao da Orbitamos",
    eyebrow: "Construcao",
    title: "Pratica aplicada",
    caption: "Foto 2 de 3",
  },
  {
    kind: "image",
    src: "/card-diagnostico.png",
    alt: "Card visual da fase de diagnostico da Orbitamos",
    eyebrow: "Diagnostico",
    title: "Evolucao visivel",
    caption: "Foto 3 de 3",
  },
];

export default function Entrar() {
  const [isLogin, setIsLogin] = useState(true);
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
  const [activeShowcase, setActiveShowcase] = useState(0);

  const { login, register: registerUser, loading: authLoading } = useAuth();
  const loginSetup = useLoginScene();

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveShowcase((current) => (current + 1) % showcaseSlides.length);
    }, 5200);

    return () => clearInterval(interval);
  }, []);

  const resetFormMode = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setShowProgress(false);
    setFakeProgress(0);
    if (nextIsLogin) setRegisterRole("STUDENT");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setError("Informe seu e-mail para continuar.");
      return;
    }
    if (!cleanPassword) {
      setError("Informe sua senha para continuar.");
      return;
    }
    if (cleanPassword.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (!isLogin && !cleanName) {
      setError("Informe seu nome completo para criar a conta.");
      return;
    }

    setLoading(true);
    setShowProgress(true);
    setFakeProgress(0);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (isLogin) {
        await login(cleanEmail, cleanPassword);
      } else {
        await registerUser(cleanName, cleanEmail, cleanPassword, registerRole);
      }

      setFakeProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));
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

  const isBusy = loading || authLoading;

  const goToPreviousShowcase = () => {
    setActiveShowcase((current) => (current - 1 + showcaseSlides.length) % showcaseSlides.length);
  };

  const goToNextShowcase = () => {
    setActiveShowcase((current) => (current + 1) % showcaseSlides.length);
  };

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

      <div className="relative z-10 mx-auto grid h-full max-h-full w-full max-w-6xl items-center gap-5 overflow-hidden px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <ScrollReveal from={{ opacity: 0, x: -36 }} to={{ duration: 0.8 }} className="hidden lg:block">
          <section className="max-w-xl overflow-hidden">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orbit-electric/25 bg-black/35 px-3 py-1.5 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-orbit-electric shadow-[0_0_18px_rgba(0,212,255,0.8)]" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-orbit-electric">
                Portal Orbitamos
              </span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-orbit-electric/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/45 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                      Previa da area do aluno
                    </p>
                    <h1 className="mt-1 text-2xl font-black leading-tight text-white">
                      Uma vitrine do que o aluno vai encontrar.
                    </h1>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                    <div className="text-sm font-black text-orbit-electric">
                      {String(activeShowcase + 1).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                      de {String(showcaseSlides.length).padStart(2, "0")}
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#05080f]">
                  <div
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${activeShowcase * 100}%)` }}
                  >
                    {showcaseSlides.map((slide) => (
                      <article key={slide.src} className="relative h-[min(405px,calc(100dvh-15rem))] w-full shrink-0 overflow-hidden bg-black">
                        {slide.kind === "image" ? (
                          <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
                        ) : (
                          <video
                            src={slide.src}
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            aria-label={slide.alt}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />
                        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
                          <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-orbit-electric backdrop-blur-md">
                            {slide.eyebrow}
                          </span>
                          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/58 backdrop-blur-md">
                            <PlayCircle className="h-3.5 w-3.5" />
                            midia
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="mb-3 flex items-end justify-between gap-4">
                            <div className="rounded-xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
                              <p className="text-xs font-bold uppercase tracking-widest text-white/40">{slide.caption}</p>
                              <p className="mt-0.5 text-sm font-black text-white">{slide.title}</p>
                            </div>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                            <div
                              key={activeShowcase}
                              className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                              style={{ animation: "showcase-progress 5.2s linear forwards" }}
                            />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {showcaseSlides.map((slide, index) => (
                      <button
                        key={slide.src}
                        type="button"
                        onClick={() => setActiveShowcase(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeShowcase ? "w-8 bg-orbit-electric" : "w-2.5 bg-white/20 hover:bg-white/40"
                        }`}
                        aria-label={`Mostrar midia ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goToPreviousShowcase}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Midia anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextShowcase}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Proxima midia"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal from={{ opacity: 0, y: 28, scale: 0.97 }} to={{ duration: 0.75, delay: 0.1 }}>
          <section className="mx-auto w-full max-w-md overflow-hidden lg:mx-0">
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

            <div className="relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-orbit-electric/45 via-white/10 to-orbit-purple/45" />
              <div className="absolute -inset-5 rounded-[2rem] bg-orbit-electric/10 blur-3xl" />

              <div className="relative max-h-[calc(100dvh-5.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#05080f]/95 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,212,255,0.09),transparent_62%)]" />
                <div className="relative">
                  <div className="mb-3">
                    <div className="mb-2.5 flex rounded-xl border border-white/10 bg-black/35 p-1">
                      <button
                        type="button"
                        onClick={() => resetFormMode(true)}
                        className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                          isLogin ? "bg-white text-black" : "text-white/55 hover:text-white"
                        }`}
                      >
                        Entrar
                      </button>
                      <button
                        type="button"
                        onClick={() => resetFormMode(false)}
                        className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                          !isLogin ? "bg-white text-black" : "text-white/55 hover:text-white"
                        }`}
                      >
                        Criar conta
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orbit-electric to-orbit-purple text-black">
                        {isLogin ? <ShieldCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white">
                          {isLogin ? "Acesse sua conta" : "Crie seu acesso"}
                        </h2>
                        <p className="mt-0.5 text-xs leading-4 text-white/48">
                          {isLogin
                            ? "Volte para suas aulas, progresso e comunidade."
                            : "Comece como aluno ou entre como colaborador da rede."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    {!isLogin && (
                      <div>
                        <label htmlFor="name" className="mb-1 block text-xs font-medium text-white/72">
                          Nome completo
                        </label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="h-10 rounded-xl border-white/10 bg-white/[0.05] pl-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                            required={!isLogin}
                            autoComplete="name"
                            autoCapitalize="words"
                          />
                        </div>
                      </div>
                    )}

                    {!isLogin && (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-white/72">Tipo de conta</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRegisterRole("STUDENT")}
                            className={`rounded-xl border p-2 text-left transition-all ${
                              registerRole === "STUDENT"
                                ? "border-orbit-electric/60 bg-orbit-electric/14 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/58 hover:bg-white/[0.06]"
                            }`}
                          >
                            <GraduationCap className="mb-0.5 h-4 w-4 text-orbit-electric" />
                            <span className="block text-xs font-bold">Aluno</span>
                            <span className="mt-0.5 block text-[11px] leading-3 text-white/42">Aulas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegisterRole("FREELANCER")}
                            className={`rounded-xl border p-2 text-left transition-all ${
                              registerRole === "FREELANCER"
                                ? "border-orbit-purple/60 bg-orbit-purple/14 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/58 hover:bg-white/[0.06]"
                            }`}
                          >
                            <BriefcaseBusiness className="mb-0.5 h-4 w-4 text-orbit-purple" />
                            <span className="block text-xs font-bold">Colaborador</span>
                            <span className="mt-0.5 block text-[11px] leading-3 text-white/42">Squad</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="mb-1 block text-xs font-medium text-white/72">
                        E-mail
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="voce@email.com"
                          className="h-10 rounded-xl border-white/10 bg-white/[0.05] pl-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                          required
                          autoComplete="email"
                          autoCapitalize="none"
                          inputMode="email"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <label htmlFor="password" className="block text-xs font-medium text-white/72">
                          Senha
                        </label>
                        {isLogin && (
                          <Link href="/contato" className="text-xs font-medium text-orbit-electric hover:text-white">
                            Esqueci minha senha
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua senha"
                          className="h-10 rounded-xl border-white/10 bg-white/[0.05] px-10 text-white placeholder:text-white/25 focus-visible:border-orbit-electric/60"
                          required
                          autoComplete={isLogin ? "current-password" : "new-password"}
                          autoCapitalize="none"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/42 transition-colors hover:bg-white/10 hover:text-white"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {!isLogin && <p className="mt-0.5 text-[11px] text-white/42">Use pelo menos 6 caracteres.</p>}
                    </div>

                    {showProgress && (
                      <div className="py-0.5">
                        <RocketProgress
                          progress={fakeProgress}
                          message={isLogin ? "Conectando sua conta..." : "Criando seu acesso..."}
                        />
                      </div>
                    )}

                    {error && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-center text-sm text-red-200">
                        {error}
                        {error.includes("iniciando") && (
                          <p className="mt-2 text-xs text-white/52">
                            Servicos gratuitos podem levar alguns segundos para responder. Aguarde e tente novamente.
                          </p>
                        )}
                      </div>
                    )}

                    <MagneticButton strength={0.12}>
                      <Button
                        type="submit"
                        disabled={isBusy}
                        className="mt-0.5 h-10 w-full rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple text-sm font-black text-black transition-all hover:from-orbit-purple hover:to-orbit-electric hover:shadow-[0_0_25px_rgba(0,212,255,0.25)] disabled:opacity-50"
                      >
                        {isBusy ? "Processando..." : isLogin ? "Entrar no portal" : "Criar acesso"}
                        {!isBusy && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </MagneticButton>
                  </form>

                  <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-4 text-white/46">
                    {isLogin
                      ? "Depois do login, alunos vao direto para a area de estudos. Colaboradores acessam o painel de squad."
                      : "Para estudar na OrbitAcademy, escolha Aluno. A opcao Colaborador e para quem participa da operacao e projetos."}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
