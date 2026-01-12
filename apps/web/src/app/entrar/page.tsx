"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RocketProgress from "@/components/RocketProgress";

export default function Entrar() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  
  const { login, register: registerUser } = useAuth();
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
        // Para aqui, espera resposta do backend
        clearInterval(interval);
        return;
      }

      setFakeProgress(Math.min(90, progress));
    }, 100);

    return () => clearInterval(interval);
  }, [loading, showProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        await registerUser(name.trim(), email.trim(), password);
      }

      // Quando o backend responde, completa o progresso
      setFakeProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      let errorMessage = "Erro ao fazer login/cadastro";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Melhorar mensagens de erro comuns
      if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
        errorMessage = "Tempo de espera esgotado. Tente novamente.";
      } else if (errorMessage.includes("Email já cadastrado") || errorMessage.includes("already")) {
        errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
      } else if (errorMessage.includes("iniciando")) {
        errorMessage = "Servidor está iniciando. Aguarde alguns segundos e tente novamente.";
      }
      
      setError(errorMessage);
      setFakeProgress(0);
    } finally {
      setLoading(false);
      // Mantém o progresso visível por um pouco antes de esconder
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
          {Array.from({ length: 160 }).map((_, i) => (
            <circle key={i} cx={(Math.random()*800).toFixed(0)} cy={(Math.random()*600).toFixed(0)} r={Math.random()*1.2+0.2} fill="url(#g)" />
          ))}
        </svg>
      </div>

      {/* Nebula */}
      <div className="absolute -top-40 left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-[conic-gradient(from_120deg,theme(colors.orbit-electric/.7),theme(colors.orbit-purple/.6),transparent_70%)]" />

      <div className="relative container mx-auto grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-8 sm:py-16">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-8 backdrop-blur-2xl">
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

            <div className="flex items-center justify-center text-sm text-white/70">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="hover:text-white transition-colors underline"
              >
                {isLogin ? "Não tem conta? Criar conta" : "Já tem conta? Fazer login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
