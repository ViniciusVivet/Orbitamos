"use client";

import React, { useRef } from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & { strength?: number };

export default function Tilt({ strength = 10, className = "", children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    el.style.transform = `rotateX(${(-dy * strength).toFixed(2)}deg) rotateY(${(dx * strength).toFixed(2)}deg)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={ref}
      className={`transition-transform duration-200 will-change-transform ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </div>
  );
}


