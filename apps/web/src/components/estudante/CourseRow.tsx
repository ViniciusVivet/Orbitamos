"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Carrossel horizontal estilo streaming: setas grandes, discretas e translucidas
 * que aparecem no hover (desktop) e somem nas pontas. No mobile, navega por swipe.
 */
export default function CourseRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 320), behavior: "smooth" });
  };

  return (
    <div className="group relative">
      {canLeft && (
        <button
          type="button"
          aria-label="Voltar"
          onClick={() => scroll(-1)}
          className="absolute inset-y-0 left-0 z-20 hidden w-16 items-center justify-start bg-gradient-to-r from-black/85 via-black/40 to-transparent pl-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex"
        >
          <span className="grid size-10 place-items-center rounded-full bg-black/45 text-white/90 ring-1 ring-white/15 backdrop-blur-sm transition hover:scale-105 hover:bg-black/70">
            <ChevronLeft className="size-6" />
          </span>
        </button>
      )}

      <div ref={ref} className={`${className} [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
        {children}
      </div>

      {canRight && (
        <button
          type="button"
          aria-label="Avançar"
          onClick={() => scroll(1)}
          className="absolute inset-y-0 right-0 z-20 hidden w-16 items-center justify-end bg-gradient-to-l from-black/85 via-black/40 to-transparent pr-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex"
        >
          <span className="grid size-10 place-items-center rounded-full bg-black/45 text-white/90 ring-1 ring-white/15 backdrop-blur-sm transition hover:scale-105 hover:bg-black/70">
            <ChevronRight className="size-6" />
          </span>
        </button>
      )}
    </div>
  );
}
