"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, Component, type ReactNode } from "react";

const isMobileDevice = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));

/* Error boundary to prevent 3D crashes from breaking the whole page */
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface SpaceCanvasProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dpr?: number;
}

export default function SpaceCanvas({ children, className, style, dpr }: SpaceCanvasProps) {
  const [mobile, setMobile] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMobile(isMobileDevice());
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <CanvasErrorBoundary>
      <Canvas
        className={className}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}
        dpr={Math.min(dpr ?? (mobile ? 1 : 1.5), 2)}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: true }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        resize={{ debounce: 200 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
