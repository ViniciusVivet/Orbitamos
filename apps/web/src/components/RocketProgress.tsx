"use client";

import { useEffect, useState } from "react";

interface RocketProgressProps {
  progress: number; // 0 a 100
  message?: string;
  showPlanet?: boolean;
}

export default function RocketProgress({ 
  progress, 
  message = "Carregando...",
  showPlanet = true 
}: RocketProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Anima o progresso suavemente
  useEffect(() => {
    const targetProgress = Math.min(100, Math.max(0, progress));
    const diff = targetProgress - displayProgress;
    
    if (Math.abs(diff) < 0.1) {
      setDisplayProgress(targetProgress);
      return;
    }

    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        const newProgress = prev + diff * 0.1;
        return Math.min(targetProgress, Math.max(0, newProgress));
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [progress, displayProgress]);

  // Mensagens gamificadas baseadas no progresso
  const getGameMessage = () => {
    if (displayProgress < 20) return "Iniciando missão...";
    if (displayProgress < 40) return "Preparando foguete...";
    if (displayProgress < 60) return "Decolando da Terra...";
    if (displayProgress < 80) return "Viajando pelo espaço...";
    if (displayProgress < 95) return "Aproximando de Marte...";
    return "Pouso em Marte! 🚀";
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Container do foguete e planeta */}
      <div className="relative h-24 sm:h-32 w-full overflow-hidden rounded-lg bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        {/* Estrelas de fundo */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 2 + 1}s`,
              }}
            />
          ))}
        </div>

        {/* Planeta Marte (direita) */}
        {showPlanet && (
          <div
            className="absolute bottom-2 sm:bottom-4 right-4 sm:right-8 transition-all duration-500"
            style={{
              transform: `scale(${0.5 + displayProgress / 200})`,
              opacity: displayProgress / 100,
            }}
          >
            <div className="relative">
              {/* Planeta */}
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-600 via-red-600 to-orange-800 shadow-2xl">
                {/* Crateras */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-2 h-2 sm:w-4 sm:h-4 rounded-full bg-orange-800/50" />
                <div className="absolute top-4 right-3 sm:top-8 sm:right-6 w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-orange-800/50" />
                <div className="absolute bottom-3 left-4 sm:bottom-6 sm:left-8 w-2.5 h-2.5 sm:w-5 sm:h-5 rounded-full bg-orange-800/50" />
              </div>
              {/* Brilho do planeta */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Foguete (esquerda, move para direita) */}
        <div
          className="absolute bottom-4 sm:bottom-8 transition-all duration-300 ease-out"
          style={{
            left: `${8 + (displayProgress / 100) * 70}%`,
            transform: `translateY(${Math.sin(displayProgress / 10) * 5}px) rotate(${displayProgress > 80 ? -10 : 0}deg)`,
          }}
        >
          <div className="relative">
            {/* Corpo do foguete */}
            <div className="relative">
              {/* Corpo principal */}
              <div className="w-8 h-10 sm:w-12 sm:h-16 bg-gradient-to-b from-orbit-electric via-blue-500 to-orbit-purple rounded-t-lg shadow-lg">
                {/* Janela */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 sm:top-3 sm:w-6 sm:h-6 rounded-full bg-white/20 border-2 border-white/30" />
                {/* Linhas decorativas */}
                <div className="absolute top-5 left-1 right-1 sm:top-8 sm:left-2 sm:right-2 h-0.5 bg-white/20" />
                <div className="absolute top-6 left-1 right-1 sm:top-10 sm:left-2 sm:right-2 h-0.5 bg-white/20" />
              </div>
              
              {/* Asas */}
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-4 sm:w-4 sm:h-6 bg-gradient-to-br from-orbit-electric to-blue-600 transform -rotate-45 rounded-sm" />
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-3 h-4 sm:w-4 sm:h-6 bg-gradient-to-br from-orbit-purple to-blue-600 transform rotate-45 rounded-sm" />
              
              {/* Chama (animada) */}
              <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2">
                <div className="relative">
                  {/* Chama principal */}
                  <div className="w-4 h-5 sm:w-6 sm:h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full blur-sm animate-pulse" />
                  <div className="absolute inset-0 w-3 h-4 sm:w-4 sm:h-6 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.2s' }} />
                  {/* Partículas */}
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-400 rounded-full animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        bottom: `${Math.random() * 50}%`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rastro do foguete */}
        {displayProgress > 10 && (
          <div
            className="absolute bottom-8 sm:bottom-12 transition-all duration-300"
            style={{
              left: '8%',
              width: `${(displayProgress / 100) * 70}%`,
              height: '1px',
            }}
          >
            <div 
              className="h-full w-full"
              style={{
                background: `linear-gradient(to right, transparent, ${displayProgress > 50 ? '#00D4FF' : '#8B5CF6'}, transparent)`,
                opacity: displayProgress / 100,
              }}
            />
          </div>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-white/80 font-medium">{getGameMessage()}</span>
          <span className="text-orbit-electric font-bold">{Math.round(displayProgress)}%</span>
        </div>
        <div className="relative h-2 sm:h-3 w-full bg-white/10 rounded-full overflow-hidden">
          {/* Fundo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-orbit-electric/20 via-orbit-purple/20 to-orbit-electric/20 animate-pulse" />
          {/* Barra de progresso */}
          <div
            className="relative h-full bg-gradient-to-r from-orbit-electric via-orbit-purple to-orbit-electric transition-all duration-300 ease-out rounded-full shadow-lg"
            style={{ width: `${displayProgress}%` }}
          >
            {/* Brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Mensagem customizada */}
      {message && (
        <p className="text-center text-white/60 text-sm">{message}</p>
      )}
    </div>
  );
}

