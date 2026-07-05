"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SpaceCanvasHandle } from "./SpaceCanvas";
import { createStarfield, createNebula, createOrbitRing, createGlow } from "./scenes";

export default function useHeroScene() {
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
    const stars = createStarfield(scene, 250, 14);
    const nebula = createNebula(scene, 8, [0x00d4ff, 0x8b5cf6], 0.08);
    const ring1 = createOrbitRing(scene, 3.5, 0x00d4ff, 0.15, [0.6, 0.2, 0]);
    const ring2 = createOrbitRing(scene, 2.8, 0x8b5cf6, 0.12, [-0.4, 0.5, 0.3]);
    const ring3 = createOrbitRing(scene, 4.2, 0x00d4ff, 0.08, [0.2, -0.3, 0.1]);
    createGlow(scene, 0.8, 0x00d4ff, 0.04);
    createGlow(scene, 0.3, 0x8b5cf6, 0.06);

    let animId = 0;
    let elapsed = 0;
    let lastFrame = 0;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      if (!isVisible()) return;
      if (now - lastFrame < 32) return; // ~30fps cap
      lastFrame = now;

      const dt = 0.016;
      elapsed += dt;

      stars.rotation.y += dt * 0.015;
      stars.rotation.x += dt * 0.005;
      ring1.rotation.z += dt * 0.2;
      ring2.rotation.z -= dt * 0.15;
      ring3.rotation.z += dt * 0.08;

      nebula.particles.forEach((p) => {
        p.mesh.position.x = p.basePos[0] + Math.sin(elapsed * 0.12 + p.phase) * 0.4;
        p.mesh.position.y = p.basePos[1] + Math.cos(elapsed * 0.084 + p.phase) * 0.3;
      });

      const m = mouseRef.current;
      m.tx += (m.x * 0.4 - m.tx) * dt * 2;
      m.ty += (m.y * 0.4 - m.ty) * dt * 2;
      camera.position.x = m.tx;
      camera.position.y = m.ty;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, []);
}
