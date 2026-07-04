"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, lazy, useEffect, useState } from "react";

const isMobileDevice = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));

interface SpaceCanvasProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dpr?: number;
}

export default function SpaceCanvas({ children, className, style, dpr }: SpaceCanvasProps) {
  const [mobile, setMobile] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMobile(isMobileDevice());
    // Small delay so the rest of the page loads first
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <Canvas
      className={className}
      style={{ position: "absolute", inset: 0, ...style }}
      dpr={Math.min(dpr ?? (mobile ? 1 : 1.5), 2)}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      resize={{ debounce: 200 }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
