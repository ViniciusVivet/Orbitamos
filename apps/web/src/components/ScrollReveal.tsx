"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  stagger?: number;
  selectChildren?: boolean;
  delay?: number;
  start?: string;
}

export default function ScrollReveal({
  children,
  className,
  from,
  to,
  stagger = 0,
  selectChildren = false,
  delay = 0,
  start = "top 85%",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref.current || initialized.current) return;
    initialized.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const targets = selectChildren ? ref.current.children : ref.current;

    gsap.set(targets, {
      opacity: 0,
      y: 40,
      scale: 0.97,
      filter: "blur(6px)",
      ...from,
    });

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.9,
      ease: "power3.out",
      stagger: stagger || 0,
      delay,
      ...to,
      scrollTrigger: {
        trigger: ref.current,
        start,
        once: true,
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
