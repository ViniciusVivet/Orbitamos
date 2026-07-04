"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbitRingProps {
  radius?: number;
  color?: string;
  speed?: number;
  opacity?: number;
  tilt?: [number, number, number];
}

export default function OrbitRing({
  radius = 2.5,
  color = "#00D4FF",
  speed = 0.3,
  opacity = 0.3,
  tilt = [0.5, 0, 0],
}: OrbitRingProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed;
    }
  });

  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
