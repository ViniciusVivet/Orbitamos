"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Entrar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCyberpunkMessage, setShowCyberpunkMessage] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para mostrar a mensagem com timer
  const showMessage = () => {
    console.log("Mostrando mensagem cyberpunk...");
    
    setShowCyberpunkMessage(true);
    setIsFadingOut(false);
    
    // Timer simples de 3 segundos
    setTimeout(() => {
      console.log("Iniciando fade out...");
      setIsFadingOut(true);
    }, 3000);
    
    // Timer para fechar após 4 segundos total
    setTimeout(() => {
      console.log("Fechando mensagem...");
      setShowCyberpunkMessage(false);
      setIsFadingOut(false);
    }, 4000);
  };

  // Cleanup dos timeouts quando o componente desmonta
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

      <div className="relative container mx-auto grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-16">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-orbit rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" />
            <h1 className="bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-3xl font-extrabold text-transparent">
              Entrar na Órbita
            </h1>
            <p className="mt-2 text-white/70">Acesse sua conta para continuar sua jornada.</p>
          </div>

          <form className="space-y-5">
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
              />
            </div>

            <Button className="mt-2 w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:from-orbit-purple hover:to-orbit-electric font-bold">
              🚀 Entrar
            </Button>

            <div className="flex items-center justify-between text-sm text-white/70">
              <button 
                onClick={showMessage}
                className="hover:text-white transition-colors"
              >
                Esqueci minha senha
              </button>
              <button 
                onClick={showMessage}
                className="hover:text-white transition-colors"
              >
                Criar conta
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cyberpunk Message Modal */}
      {showCyberpunkMessage && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`relative max-w-4xl mx-4 p-8 border-2 border-orbit-electric/50 bg-gradient-to-br from-black/90 to-gray-900/90 rounded-2xl shadow-2xl transition-all duration-1000 ${isFadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orbit-electric via-orbit-purple to-orbit-electric opacity-20 animate-pulse" />
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowCyberpunkMessage(false);
                setIsFadingOut(false);
              }}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl font-bold"
            >
              ✕
            </button>

            {/* Cyberpunk Content */}
            <div className="relative text-center">
              {/* Matrix-style Code Rain Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-10">
                <div className="animate-pulse text-green-400 font-mono text-xs">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} className="absolute" style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}>
                      {Math.random().toString(36).substring(7)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Message */}
              <div className="relative z-10">
                <div className="mb-6 text-6xl font-bold bg-gradient-to-r from-orbit-electric via-white to-orbit-purple bg-clip-text text-transparent animate-pulse">
                  ⚡ CYBERPUNK MODE ⚡
                </div>
                
                <div className="mb-8 text-2xl md:text-3xl font-bold text-white">
                  <span className="text-orbit-electric">[SYSTEM]</span> 
                  <span className="text-white"> Estamos trabalhando nisso...</span>
                </div>

                <div className="mb-6 text-lg text-orbit-electric font-mono">
                  &gt; Programadores estão programando...
                </div>

                <div className="mb-8 text-xl text-white/80">
                  Nossa equipe de <span className="text-orbit-purple font-bold">desenvolvedores</span> está 
                  <span className="text-orbit-electric font-bold"> codificando</span> as melhores funcionalidades para você.
                </div>

                <div className="mb-6 text-sm text-white/60 font-mono">
                  [STATUS] Em desenvolvimento... | [ETA] Em breve | [PRIORITY] HIGH
                </div>

                {/* Animated Loading */}
                <div className="flex justify-center items-center space-x-2 mb-6">
                  <div className="w-3 h-3 bg-orbit-electric rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-orbit-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-3 h-3 bg-orbit-electric rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>

                <div className="text-sm text-white/50 font-mono">
                  Aguarde enquanto preparamos algo incrível para você...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


