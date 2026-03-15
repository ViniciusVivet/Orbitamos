"use client";

import { useEffect, useRef } from "react";

// ---------- SVGs das naves ----------
// Cada função recebe a cor principal e devolve uma string SVG.
// Glow fica no CSS `filter: drop-shadow(...)` do container — assim
// não precisamos de <filter> interno no SVG, o que evitaria conflito
// de IDs quando várias naves do mesmo tipo estão na tela ao mesmo tempo.

const FIGHTER_SVG = (color: string) => `
<svg width="44" height="22" viewBox="0 0 44 22" xmlns="http://www.w3.org/2000/svg">
  <!-- Estabilizadores traseiros -->
  <polygon points="6,11 0,3  12,11" fill="${color}" opacity="0.7"/>
  <polygon points="6,11 0,19 12,11" fill="${color}" opacity="0.7"/>
  <!-- Corpo principal: losango alongado -->
  <polygon points="2,11 26,4 44,11 26,18" fill="${color}"/>
  <!-- Asas centrais -->
  <polygon points="14,11 22,5 26,11 22,17" fill="${color}" opacity="0.8"/>
  <!-- Cockpit translúcido -->
  <ellipse cx="34" cy="11" rx="5"   ry="3.2" fill="white" opacity="0.45"/>
  <ellipse cx="35" cy="10.5" rx="2.5" ry="1.8" fill="white" opacity="0.22"/>
  <!-- Brilho do motor traseiro -->
  <circle cx="3" cy="11" r="2.5" fill="white" opacity="0.9"/>
  <circle cx="3" cy="11" r="1.1" fill="${color}" opacity="0.5"/>
</svg>`;

const SAUCER_SVG = (color: string) => `
<svg width="48" height="30" viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg">
  <!-- Disco / pança principal -->
  <ellipse cx="24" cy="21" rx="21" ry="7" fill="${color}"/>
  <!-- Cúpula superior -->
  <path d="M12,21 Q12,8 24,8 Q36,8 36,21" fill="${color}" opacity="0.8"/>
  <!-- Vidro da cúpula -->
  <path d="M17,20 Q17,13 24,13 Q31,13 31,20" fill="white" opacity="0.28"/>
  <!-- Anel metálico decorativo -->
  <ellipse cx="24" cy="21" rx="21" ry="7" fill="none" stroke="white" stroke-width="0.6" opacity="0.25"/>
  <!-- Luzes da barriga -->
  <circle cx="12" cy="23" r="2"   fill="white" opacity="0.85"/>
  <circle cx="24" cy="26" r="2.2" fill="white" opacity="0.85"/>
  <circle cx="36" cy="23" r="2"   fill="white" opacity="0.85"/>
</svg>`;

const CRUISER_SVG = (color: string) => `
<svg width="60" height="20" viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
  <!-- Naceles dos motores -->
  <rect x="4" y="3"  width="22" height="5" rx="2.5" fill="${color}" opacity="0.65"/>
  <rect x="4" y="12" width="22" height="5" rx="2.5" fill="${color}" opacity="0.65"/>
  <!-- Fuselagem central -->
  <polygon points="2,10 18,5 54,7 60,10 54,13 18,15" fill="${color}"/>
  <!-- Estabilizadores da popa -->
  <polygon points="7,10 0,4  7,8"  fill="${color}" opacity="0.75"/>
  <polygon points="7,10 0,16 7,12" fill="${color}" opacity="0.75"/>
  <!-- Janelas da ponte -->
  <rect x="42" y="8" width="9" height="4" rx="2" fill="white" opacity="0.45"/>
  <!-- Brilho dos motores traseiros -->
  <circle cx="4" cy="5.5"  r="2.8" fill="white" opacity="0.9"/>
  <circle cx="4" cy="14.5" r="2.8" fill="white" opacity="0.9"/>
  <circle cx="4" cy="5.5"  r="1.2" fill="${color}" opacity="0.55"/>
  <circle cx="4" cy="14.5" r="1.2" fill="${color}" opacity="0.55"/>
</svg>`;

// ---------- Componente ----------

type Variant = "fighter" | "saucer" | "cruiser";

export default function SpaceShipsOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const makeShip = (
      duration: number,
      size: number,
      color: string,
      delay = 0,
      variant: Variant = "fighter"
    ) => {
      // Wrapper: só cuida da animação de voo (translate + opacity)
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `
        position: absolute;
        left: -12%;
        top: ${Math.random() * 78 + 11}%;
        animation: ship-fly ${duration}s linear ${delay}s infinite;
      `;

      // Inner: cuida do tamanho (scale) e do glow (drop-shadow)
      // Separar scale da animação evita que o @keyframes sobrescreva o scale
      const inner = document.createElement("div");
      const scale = size / 13;
      inner.style.cssText = `
        transform-origin: left center;
        transform: scale(${scale});
        filter: drop-shadow(0 0 ${Math.max(6, size)}px ${color});
        position: relative;
      `;

      if (variant === "fighter") inner.innerHTML = FIGHTER_SVG(color);
      else if (variant === "saucer") inner.innerHTML = SAUCER_SVG(color);
      else inner.innerHTML = CRUISER_SVG(color);

      // Rastro de propulsão
      const trail = document.createElement("div");
      trail.style.cssText = `
        position: absolute;
        left: ${-(size * 3.5)}px;
        top: 50%;
        transform: translateY(-50%);
        width: ${size * 3.5}px;
        height: ${Math.max(2, Math.round(size / 3.5))}px;
        background: linear-gradient(90deg, transparent, ${color}65);
        border-radius: 2px;
        pointer-events: none;
      `;
      inner.appendChild(trail);
      wrapper.appendChild(inner);
      el.appendChild(wrapper);
      return wrapper;
    };

    // Velocidade reduzida mais 25% → durações aumentadas ~33% novamente
    // Quantidade reduzida mais 25%: de 8 para 6 naves
    const ships = [
      makeShip(32, 11, "#ff6b6b",  0,  "fighter"),  // caça vermelho
      makeShip(47, 13, "#7c3aed",  8,  "saucer"),   // disco roxo
      makeShip(39,  8, "#3b82f6",  4,  "fighter"),  // caça azul
      makeShip(36,  9, "#10b981", 12,  "fighter"),  // caça verde
      makeShip(43, 12, "#f59e0b", 16,  "saucer"),   // disco âmbar
      makeShip(49, 14, "#8b5cf6", 24,  "cruiser"),  // cruzador roxo
    ];

    return () => { ships.forEach(s => s?.remove()); };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <style>{`
        @keyframes ship-fly {
          0%   { transform: translateX(0)     translateY(0);     opacity: 0; }
          8%   { opacity: 1; }
          50%  { transform: translateX(60vw)  translateY(-5vh); }
          92%  { opacity: 1; }
          100% { transform: translateX(130vw) translateY(-9vh);  opacity: 0; }
        }
      `}</style>
    </div>
  );
}
