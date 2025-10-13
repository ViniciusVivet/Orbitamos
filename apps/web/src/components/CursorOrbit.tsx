"use client";

import { useEffect, useRef } from "react";

export default function CursorOrbit() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const loop = () => {
      x += (tx - x) * 0.15;
      y += (ty - y) * 0.15;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    loop();
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple opacity-40 blur-[6px] shadow-[0_0_40px_theme(colors.orbit-electric/.5)]"
      style={{ width: 16, height: 16 }}
    />
  );
}
