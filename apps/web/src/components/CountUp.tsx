"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CountUpProps {
  value: string;
  className?: string;
}

export default function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const initialized = useRef(false);
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    if (!ref.current || initialized.current) return;
    initialized.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const match = value.match(/^(\d+)/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = value.slice(match[1].length);
    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayed(Math.round(obj.val) + suffix);
      },
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
        once: true,
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <span ref={ref} className={className}>{displayed}</span>;
}
