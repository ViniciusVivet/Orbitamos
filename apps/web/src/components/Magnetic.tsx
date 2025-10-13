"use client";

import { useEffect, useRef } from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & { radius?: number };

export default function Magnetic({ radius = 120, className = "", children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        el.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
      } else {
        el.style.transform = "translate(0px, 0px)";
      }
    };

    const onLeave = () => {
      el.style.transform = "translate(0px, 0px)";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [radius]);

  return (
    <div ref={ref} className={`transition-transform duration-150 ${className}`} {...rest}>
      {children}
    </div>
  );
}


