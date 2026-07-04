"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NebulaProps {
  count?: number;
  colors?: [string, string];
  opacity?: number;
  speed?: number;
}

export default function Nebula({
  count = 18,
  colors = ["#00D4FF", "#8B5CF6"],
  opacity = 0.12,
  speed = 0.15,
}: NebulaProps) {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const color = i % 2 === 0 ? colors[0] : colors[1];
      const scale = 1.5 + Math.random() * 3;
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ];
      const phase = Math.random() * Math.PI * 2;
      return { color, scale, position, phase, speed: 0.1 + Math.random() * 0.2 };
    });
  }, [count, colors]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * speed;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      child.position.x = p.position[0] + Math.sin(t + p.phase) * 0.4;
      child.position.y = p.position[1] + Math.cos(t * 0.7 + p.phase) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <planeGeometry args={[p.scale, p.scale]} />
          <meshBasicMaterial
            color={p.color}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
