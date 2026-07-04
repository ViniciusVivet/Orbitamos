"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface FloatingNodeProps {
  label: string;
  detail: string;
  position: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
  phase: number;
  color?: string;
}

export default function FloatingNode({
  label,
  detail,
  position,
  orbitRadius,
  orbitSpeed,
  phase,
  color = "#00D4FF",
}: FloatingNodeProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * orbitSpeed + phase;
    ref.current.position.x = position[0] + Math.cos(t) * orbitRadius;
    ref.current.position.y = position[1] + Math.sin(t * 0.7) * 0.3;
    ref.current.position.z = position[2] + Math.sin(t) * orbitRadius * 0.4;
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html distanceFactor={8} center style={{ pointerEvents: "none" }}>
        <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-xl whitespace-nowrap">
          <p className="text-xs font-bold text-white">{label}</p>
          <p className="text-[10px] text-white/50">{detail}</p>
        </div>
      </Html>
    </group>
  );
}
