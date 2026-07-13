"use client";

import { useEffect, useRef } from "react";

interface ScrollFramesProps {
  folder: string;
  totalFrames: number;
  className?: string;
  /** How many viewport-heights the animation spans (default 3) */
  scrollSpan?: number;
}

export default function ScrollFrames({
  folder,
  totalFrames,
  className,
  scrollSpan = 3,
}: ScrollFramesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Preload all frames
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const num = String(i).padStart(3, "0");
      img.src = `${folder}/${num}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          // Set canvas size from first loaded image
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          drawFrame(0);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    function drawFrame(index: number) {
      const img = images[index];
      if (!img || !img.complete || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const scrollTop = window.scrollY;
        const maxScroll = window.innerHeight * scrollSpan;
        const fraction = Math.min(scrollTop / maxScroll, 1);
        const frameIndex = Math.min(
          Math.floor(fraction * (totalFrames - 1)),
          totalFrames - 1
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [folder, totalFrames, scrollSpan]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  );
}
