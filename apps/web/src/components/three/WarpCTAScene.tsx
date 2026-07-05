"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SpaceCanvasHandle } from "./SpaceCanvas";
import { createStarfield, createWarpStars } from "./scenes";

export default function useWarpCTAScene() {
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
    createStarfield(scene, 100, 8);
    const warp = createWarpStars(scene, 150);

    let animId = 0;
    let speed = 0;
    let started = false;
    let lastFrame = 0;
    setTimeout(() => { started = true; }, 800);

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      if (!isVisible()) return;
      if (now - lastFrame < 32) return;
      lastFrame = now;

      const dt = 0.016;
      const target = started ? 1 : 0;
      speed += (target - speed) * dt * 2;

      const pos = warp.points.geometry.attributes.position;
      for (let i = 0; i < warp.count; i++) {
        let z = pos.getZ(i);
        z += dt * (1 + speed * 40);
        if (z > 10) z = -10;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;

      const m = mouseRef.current;
      m.tx += (m.x * 0.15 - m.tx) * dt * 2;
      m.ty += (m.y * 0.15 - m.ty) * dt * 2;
      camera.position.x = m.tx;
      camera.position.y = m.ty;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, []);
}
