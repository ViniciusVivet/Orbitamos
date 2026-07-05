"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SpaceCanvasHandle } from "./SpaceCanvas";
import { createStarfield, createNebula, createGlow, createHoloRings, createLightBeam } from "./scenes";

export default function useContactScene() {
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
    const stars = createStarfield(scene, 200, 15);
    const nebula = createNebula(scene, 6, [0x00d4ff, 0x8b5cf6], 0.06);
    const core = createGlow(scene, 0.5, 0x00d4ff, 0.06);
    createGlow(scene, 0.2, 0xffffff, 0.1);
    const holoGroup = createHoloRings(scene);
    createLightBeam(scene);

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

      stars.rotation.y += dt * 0.01;
      core.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.08);
      holoGroup.rotation.y = elapsed * 0.15;
      holoGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.1;

      nebula.particles.forEach((p) => {
        p.mesh.position.x = p.basePos[0] + Math.sin(elapsed * 0.1 + p.phase) * 0.4;
        p.mesh.position.y = p.basePos[1] + Math.cos(elapsed * 0.07 + p.phase) * 0.3;
      });

      const m = mouseRef.current;
      m.tx += (m.x * 0.35 - m.tx) * dt * 2;
      m.ty += (m.y * 0.35 - m.ty) * dt * 2;
      camera.position.x = m.tx;
      camera.position.y = m.ty;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, []);
}
