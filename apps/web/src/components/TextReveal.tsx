"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  stagger?: number;
  start?: string;
}

export default function TextReveal({
  children,
  className,
  as: Tag = "h2",
  stagger = 0.02,
  start = "top 85%",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref.current || initialized.current) return;
    initialized.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = ref.current;
    const text = el.textContent || "";
    el.innerHTML = "";

    const words = text.split(" ");
    words.forEach((word, wi) => {
      const wordSpan = document.createElement("span");
      wordSpan.style.display = "inline-block";
      wordSpan.style.whiteSpace = "nowrap";

      word.split("").forEach((char) => {
        const charSpan = document.createElement("span");
        charSpan.textContent = char;
        charSpan.style.display = "inline-block";
        charSpan.style.opacity = "0";
        charSpan.style.transform = "translateY(20px)";
        charSpan.style.filter = "blur(4px)";
        wordSpan.appendChild(charSpan);
      });

      el.appendChild(wordSpan);
      if (wi < words.length - 1) {
        const space = document.createElement("span");
        space.innerHTML = "&nbsp;";
        space.style.display = "inline-block";
        el.appendChild(space);
      }
    });

    const chars = el.querySelectorAll("span > span");

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.5,
      stagger,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <Tag ref={ref as React.Ref<never>} className={className}>{children}</Tag>;
}
