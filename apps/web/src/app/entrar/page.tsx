"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RocketProgress from "@/components/RocketProgress";
import { getFriendlyApiErrorMessage } from "@/lib/utils";

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const ENTRAR_STARS = (() => {
  const rng = seededRng(13);
  return Array.from({ length: 160 }, () => ({
    cx: (rng() * 800).toFixed(0),
    cy: (rng() * 600).toFixed(0),
    r: rng() * 1.2 + 0.2,
  }));
})();

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
  
  const router = useRouter();

  // Progresso fake inteligente (não depende do backend)
  useEffect(() => {
    if (!loading || !showProgress) return;

    let progress = 0;
    const interval = setInterval(() => {
      // 0-20%: rápido (instantâneo)
      if (progress < 20) {
        progress += 5;
      }
      // 20-60%: lento
      else if (progress < 60) {
        progress += 1.5;
      }
      // 60-90%: bem lento
      else if (progress < 90) {
        progress += 0.8;
      }
      // 90-100%: só quando o backend responder (controlado externamente)
      else {
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
      setError("Sistema de autenticação não está pronto. Aguarde alguns segundos e tente novamente.");
      return;
    }
    
    setError("");
    setLoading(true);
    setShowProgress(true);
    setFakeProgress(0);

    try {
      // Validações básicas
      if (!email.trim()) {
        setError("E-mail é obrigatório");
        setLoading(false);
        setShowProgress(false);
        return;
      }

      if (!password.trim()) {
        setError("Senha é obrigatória");
        setLoading(false);
        setShowProgress(false);
        return;
      }

      if (password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres");
        setLoading(false);
        setShowProgress(false);
        return;
      }

      // Aguarda um pouco para o progresso fake começar
      await new Promise(resolve => setTimeout(resolve, 200));

      if (isLogin) {
        await login(email.trim(), password);
      } else {
        if (!name.trim()) {
          setError("Nome é obrigatório");
          setLoading(false);
          setShowProgress(false);
          return;
        }
        await registerUser(name.trim(), email.trim(), password, registerRole);
      }

      // Quando o backend responde, completa o progresso
      setFakeProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[Entrar] Erro na autenticação:", err);
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
    <div className="relative min-h-[calc(100vh-4rem)] bg-black text-white">
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(59,130,246,.25),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,.25),transparent_50%)]" />
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <svg className="size-full" viewBox="0 0 800 600">
          <defs>
            <radialGradient id="g" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {ENTRAR_STARS.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="url(#g)" />
          ))}
        </svg>
      </div>

      {/* Nebula */}
      <div className="absolute -top-40 left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-[conic-gradient(from_120deg,theme(colors.orbit-electric/.7),theme(colors.orbit-purple/.6),transparent_70%)]" />

      <div className="relative container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-16">
        <div className="flex w-full max-w-4xl flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">

          {/* ── Lado esquerdo: OrbitAcademy teaser ── */}
          <div className="hidden lg:flex flex-col gap-6 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-orbit-electric/30 bg-orbit-electric/10 px-3 py-1.5 w-fit">
              <span className="size-1.5 animate-pulse rounded-full bg-orbit-electric" />
              <span className="text-xs font-bold tracking-widest text-orbit-electric uppercase">OrbitAcademy</span>
            </div>
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              Da quebrada<br />
              <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
                ao primeiro trampo em TI.
              </span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Trilha de formação em tecnologia feita por quem veio da periferia. Cursos, missões, comunidade e mentoria — tudo num lugar só.
            </p>
            <ul className="space-y-3">
              {[
                { icon: "🎯", text: "Trilha do zero ao primeiro emprego" },
                { icon: "⚡", text: "Sistema de XP, níveis e missões" },
                { icon: "🤝", text: "Comunidade e fórum exclusivo" },
                { icon: "🚀", text: "Projetos reais no portfólio" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="text-base">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <a
              href="/orbitacademy"
              className="mt-2 w-fit text-sm font-semibold text-orbit-electric hover:text-white transition-colors underline underline-offset-4"
            >
              Conhecer a OrbitAcademy →
            </a>
          </div>

        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-8 backdrop-blur-2xl flex-shrink-0">
          <div className="mb-6 sm:mb-8 text-center">
            <div className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 animate-orbit rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" />
            <h1 className="bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-2xl sm:text-3xl font-extrabold text-transparent">
              {isLogin ? "Entrar na Órbita" : "Criar Conta"}
            </h1>
            <p className="mt-2 text-white/70">
              {isLogin ? "Acesse sua conta para continuar sua jornada." : "Comece sua transformação hoje!"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-white/80">Nome Completo</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
                required={!isLogin}
                autoComplete="name"
                autoCapitalize="words"
                autoCorrect="on"
              />
            </div>
            )}

            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm text-white/80">Tipo de conta</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterRole("STUDENT")}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      registerRole === "STUDENT"
                        ? "border-orbit-electric bg-orbit-electric/20 text-orbit-electric"
                        : "border-white/20 text-white/70 hover:bg-white/5"
                    }`}
                  >
                    🎓 Estudante
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole("FREELANCER")}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      registerRole === "FREELANCER"
                        ? "border-orbit-purple bg-orbit-purple/20 text-orbit-purple"
                        : "border-white/20 text-white/70 hover:bg-white/5"
                    }`}
                  >
                    💼 Colaborador
                  </button>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  {registerRole === "STUDENT" ? "Acesso a vídeo-aulas e mentorias." : "Projetos reais, vagas e contato com o squad."}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-white/80">E-mail</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-white/80">Senha</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                autoCapitalize="none"
                autoCorrect="off"
                minLength={6}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-white/50">Mínimo de 6 caracteres</p>
              )}
            </div>

            {/* Barra de progresso gamificada */}
            {showProgress && (
              <div className="py-2 sm:py-4">
                <RocketProgress 
                  progress={fakeProgress} 
                  message={isLogin ? "Conectando à sua conta..." : "Criando sua conta..."}
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {error}
                {error.includes('iniciando') && (
                  <p className="mt-2 text-xs text-white/60">
                    💡 Dica: Serviços gratuitos podem levar alguns segundos para iniciar. Aguarde e tente novamente.
                  </p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:from-orbit-purple hover:to-orbit-electric font-bold disabled:opacity-50"
            >
              {loading ? "⏳ Processando..." : isLogin ? "🚀 Entrar" : "✨ Criar Conta"}
            </Button>
          </form>

          {/* Fora do form para não interferir com validação/submit ao clicar */}
          <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-white/70">
            {isLogin ? (
              <Link
                href="/contato"
                className="hover:text-white transition-colors underline"
              >
                Esqueci minha senha
              </Link>
            ) : (
              <span className="text-white/50">Mínimo de 6 caracteres</span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setName("");
                setEmail("");
                setPassword("");
                setShowProgress(false);
                setFakeProgress(0);
              }}
              className="hover:text-white transition-colors underline bg-transparent border-0 cursor-pointer p-0 font-inherit"
            >
              {isLogin ? "Criar conta" : "Já tem conta? Fazer login"}
            </button>
          </div>
        </div>
        </div>{/* fim flex row */}
      </div>
    </div>
  );
}
