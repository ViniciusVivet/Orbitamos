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

    const s1 = makeShip(18, 14, "#ff6b6b", 0, "triangle");
    const s2 = makeShip(26, 18, "#7c3aed", 6, "ufo");
    const s3 = makeShip(22, 10, "#3b82f6", 3, "triangle");

    return () => {
      [s1, s2, s3].forEach((n) => n && n.remove());
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
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


