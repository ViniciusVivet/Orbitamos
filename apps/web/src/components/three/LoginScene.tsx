"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SpaceCanvasHandle } from "./SpaceCanvas";
import { createStarfield, createNebula, createOrbitRing, createGlow, createEnergyParticles } from "./scenes";

export default function useLoginScene() {
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
    const stars = createStarfield(scene, 200, 12);
    createNebula(scene, 6, [0x00d4ff, 0x8b5cf6], 0.05);
    const outerGlow = createGlow(scene, 1.2, 0x00d4ff, 0.03);
    const innerGlow = createGlow(scene, 0.6, 0x8b5cf6, 0.06);
    createGlow(scene, 0.15, 0xffffff, 0.15);
    const particles = createEnergyParticles(scene, 30);
    createOrbitRing(scene, 2, 0x00d4ff, 0.12, [0.7, 0, 0]);
    createOrbitRing(scene, 2.5, 0x8b5cf6, 0.08, [-0.3, 0.5, 0.2]);

    outerGlow.position.z = -1;
    innerGlow.position.z = -1;

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

      stars.rotation.y += dt * 0.012;
      innerGlow.rotation.y = elapsed * 0.2;
      outerGlow.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.12);
      particles.rotation.y = elapsed * 0.15;

      const m = mouseRef.current;
      m.tx += (m.x * 0.3 - m.tx) * dt * 2;
      m.ty += (m.y * 0.3 - m.ty) * dt * 2;
      camera.position.x = m.tx;
      camera.position.y = m.ty;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, []);
}
