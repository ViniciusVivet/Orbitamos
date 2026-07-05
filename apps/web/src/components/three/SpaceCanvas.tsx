"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const isMobileDevice = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));

export interface SpaceCanvasHandle {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

interface SpaceCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  dpr?: number;
  setup: (handle: SpaceCanvasHandle) => (() => void) | void;
}

export default function SpaceCanvas({ className, style, dpr, setup }: SpaceCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible || !containerRef.current) return;
    const container = containerRef.current;
    const mobile = isMobileDevice();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !mobile,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true,
      });
    } catch {
      return; // WebGL not available
    }

    const pixelRatio = Math.min(dpr ?? (mobile ? 1 : 1.5), 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = "none";

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const scene = new THREE.Scene();

    const cleanup = setup({ renderer, scene, camera });

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cleanup?.();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [visible, setup, dpr]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, ...style }}
    />
  );
}
