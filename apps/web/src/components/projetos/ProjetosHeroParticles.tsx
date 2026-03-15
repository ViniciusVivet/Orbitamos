"use client";

/**
 * Particulas leves em CSS puro para o hero de /projetos.
 * Sem lib, sem JS em runtime — so posicoes fixas e animacao via Tailwind.
 * ~28 pontos, opacidade baixa, animacao float suave.
 */
const POSITIONS: { left: number; top: number; delay: number }[] = [
  { left: 5, top: 10, delay: 0 },
  { left: 12, top: 25, delay: 0.8 },
  { left: 22, top: 15, delay: 1.6 },
  { left: 35, top: 8, delay: 0.4 },
  { left: 45, top: 22, delay: 1.2 },
  { left: 55, top: 12, delay: 2 },
  { left: 65, top: 28, delay: 0.2 },
  { left: 78, top: 18, delay: 1 },
  { left: 88, top: 30, delay: 1.4 },
  { left: 95, top: 12, delay: 0.6 },
  { left: 8, top: 45, delay: 1.8 },
  { left: 18, top: 55, delay: 0.3 },
  { left: 28, top: 48, delay: 1.1 },
  { left: 42, top: 52, delay: 0.5 },
  { left: 52, top: 42, delay: 1.7 },
  { left: 62, top: 55, delay: 0.9 },
  { left: 75, top: 45, delay: 0.1 },
  { left: 85, top: 50, delay: 1.3 },
  { left: 15, top: 72, delay: 0.7 },
  { left: 38, top: 68, delay: 1.5 },
  { left: 58, top: 75, delay: 0.4 },
  { left: 82, top: 70, delay: 1.2 },
  { left: 25, top: 85, delay: 0.2 },
  { left: 50, top: 88, delay: 1 },
  { left: 72, top: 82, delay: 0.6 },
  { left: 92, top: 15, delay: 1.4 },
  { left: 3, top: 60, delay: 0.8 },
  { left: 48, top: 35, delay: 1.6 },
];

export default function ProjetosHeroParticles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2]"
      aria-hidden
    >
      {POSITIONS.map(({ left, top, delay }, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-orbit-electric/60 animate-float"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
