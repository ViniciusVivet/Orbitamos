"use client";

import { useEffect, useRef } from "react";

interface ScrollFramesProps {
  folder: string;
  totalFrames: number;
  className?: string;
  scrollSpan?: number;
}

export default function ScrollFrames({
  folder,
  totalFrames,
  className,
  scrollSpan = 3,
}: ScrollFramesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas to its CSS size (retina-aware)
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(currentFrameRef.current);
    }

    // Draw image as "object-cover"
    function drawFrame(index: number) {
      const img = imagesRef.current[index];
      if (!img?.complete || !ctx || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      // object-cover math
      const scale = Math.max(cw / iw, ch / ih);
      const sw = cw / scale;
      const sh = ch / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }

    // Preload all frames
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `${folder}/${String(i).padStart(3, "0")}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          resize();
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const fraction = Math.min(window.scrollY / (window.innerHeight * scrollSpan), 1);
        const frameIndex = Math.min(Math.floor(fraction * (totalFrames - 1)), totalFrames - 1);

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    resize();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [folder, totalFrames, scrollSpan]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
