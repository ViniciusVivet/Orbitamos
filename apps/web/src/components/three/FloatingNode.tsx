"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
      {/* Glow around node */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
