"use client";

import { useEffect, useRef } from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & { speed?: number };

export default function Parallax({ speed = 0.2, className = "", children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY * speed;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}


