"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SpaceCanvasHandle } from "./SpaceCanvas";
import { createStarfield, createAsteroids } from "./scenes";

export default function useProjetosHeroScene() {
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
    createStarfield(scene, 180, 12);
    const asteroids = createAsteroids(scene, 12);

    let animId = 0;
    let lastFrame = 0;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      if (!isVisible()) return;
      if (now - lastFrame < 32) return;
      lastFrame = now;

      const dt = 0.016;

      asteroids.forEach((a) => {
        a.mesh.rotateOnAxis(a.axis, dt * a.speed);
      });

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
