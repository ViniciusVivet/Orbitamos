"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

  useEffect(() => {
    if (!ref.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const targets = selectChildren ? ref.current.children : ref.current;

    const defaults: gsap.TweenVars = {
      opacity: 0,
      y: 40,
      scale: 0.97,
      filter: "blur(6px)",
      ...from,
    };

    const toVars: gsap.TweenVars = {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.9,
      ease: "power3.out",
      stagger: stagger || 0,
      delay,
      ...to,
    };

    gsap.set(targets, defaults);

    const tween = gsap.to(targets, {
      ...toVars,
      scrollTrigger: {
        trigger: ref.current,
        start,
        once: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === ref.current) t.kill();
      });
    };
  }, [from, to, stagger, selectChildren, delay, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
