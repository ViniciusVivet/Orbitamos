"use client";

import { useEffect, useRef } from "react";

export default function SpaceShipsOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const makeShip = (duration: number, size: number, color: string, delay = 0, variant: "triangle" | "ufo" = "triangle") => {
      const ship = document.createElement("div");
      ship.className = "absolute";
      ship.style.left = "-10%";
      ship.style.top = `${Math.random() * 80 + 10}%`;
      ship.style.width = "0";
      ship.style.height = "0";
      if (variant === "triangle") {
        ship.style.borderTop = `${size / 2}px solid transparent`;
        ship.style.borderBottom = `${size / 2}px solid transparent`;
        ship.style.borderLeft = `${size}px solid ${color}`;
      } else {
        // UFO (pílula) com cúpula
        ship.style.width = `${size * 1.8}px`;
        ship.style.height = `${size * 0.6}px`;
        ship.style.background = `radial-gradient(circle at 50% 30%, ${color}, ${color}AA 40%, ${color}55 60%, transparent 70%), linear-gradient(90deg, ${color}AA, ${color})`;
        ship.style.borderRadius = `${size * 0.3}px / ${size * 0.6}px`;
      }
      ship.style.filter = `drop-shadow(0 0 ${Math.max(8, size)}px ${color})`;
      ship.style.animation = `ship-fly ${duration}s linear ${delay}s infinite`;

      const trail = document.createElement("div");
      trail.className = "absolute";
      trail.style.left = `-${size * 3}px`;
      trail.style.top = `${-size / 6}px`;
      trail.style.width = `${size * 3}px`;
      trail.style.height = `${size / 3}px`;
      trail.style.background = `linear-gradient(90deg, ${color}80, transparent)`;
      ship.appendChild(trail);

      el.appendChild(ship);
      return ship;
    };

    // Triplicando o número de naves (3→9) com variações
    const ships = [
      makeShip(18, 14, "#ff6b6b", 0, "triangle"),      // vermelha
      makeShip(26, 18, "#7c3aed", 6, "ufo"),           // roxa
      makeShip(22, 10, "#3b82f6", 3, "triangle"),      // azul
      makeShip(20, 12, "#10b981", 9, "triangle"),      // verde
      makeShip(24, 16, "#f59e0b", 12, "ufo"),          // laranja
      makeShip(16, 8, "#ef4444", 15, "triangle"),      // vermelha pequena
      makeShip(28, 20, "#8b5cf6", 18, "ufo"),          // roxa grande
      makeShip(19, 11, "#06b6d4", 21, "triangle"),     // ciano
      makeShip(25, 15, "#f97316", 24, "ufo"),          // laranja escura
    ];

    return () => {
      ships.forEach((n) => n && n.remove());
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      <style>{`
        @keyframes ship-fly {
          0% { transform: translateX(0) translateY(0) rotate(5deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateX(120vw) translateY(-10vh) rotate(5deg); }
          90% { opacity: 1; }
          100% { transform: translateX(140vw) translateY(-12vh) rotate(5deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}


