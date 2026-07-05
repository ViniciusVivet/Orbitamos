"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SpaceCanvasHandle } from "./SpaceCanvas";
import { createStarfield, createOrbitRing, createGlow, createFloatingNodes } from "./scenes";

const nodes = [
  { phase: 0, color: "#00D4FF" },
  { phase: 1.05, color: "#3178C6" },
  { phase: 2.1, color: "#00D4FF" },
  { phase: 3.15, color: "#3ECF8E" },
  { phase: 4.2, color: "#8B5CF6" },
  { phase: 5.25, color: "#336791" },
];

export default function useTechOrbitScene() {
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return useCallback(({ scene, camera, renderer, isVisible }: SpaceCanvasHandle) => {
    createStarfield(scene, 120, 10);
    createGlow(scene, 0.4, 0x00d4ff, 0.15);
    createGlow(scene, 0.15, 0xffffff, 0.3);
    createOrbitRing(scene, 2, 0x00d4ff, 0.2, [0.5, 0, 0]);
    createOrbitRing(scene, 2.8, 0x8b5cf6, 0.15, [-0.3, 0.4, 0.2]);
    const floatingNodes = createFloatingNodes(scene, nodes);

    let animId = 0;
    let elapsed = 0;
    let lastFrame = 0;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      if (!isVisible()) return;
      if (now - lastFrame < 32) return;
      lastFrame = now;

      const dt = 0.016;
      elapsed += dt;

      floatingNodes.forEach((n) => {
        const t = elapsed * 0.2 + n.phase;
        n.mesh.position.x = Math.cos(t) * n.orbitRadius;
        n.mesh.position.y = Math.sin(t * 0.7) * 0.3;
        n.mesh.position.z = Math.sin(t) * n.orbitRadius * 0.4;
      });

      const m = mouseRef.current;
      m.tx += (m.x * 0.25 - m.tx) * dt * 2;
      m.ty += (m.y * 0.25 - m.ty) * dt * 2;
      camera.position.x = m.tx;
      camera.position.y = m.ty;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, []);
}
