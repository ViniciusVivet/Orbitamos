"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

interface MouseReactiveCameraProps {
  intensity?: number;
}

export default function MouseReactiveCamera({ intensity = 0.3 }: MouseReactiveCameraProps) {
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(({ camera }, delta) => {
    target.current.x += (mouse.current.x * intensity - target.current.x) * delta * 2;
    target.current.y += (mouse.current.y * intensity - target.current.y) * delta * 2;
    camera.position.x = target.current.x;
    camera.position.y = target.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
