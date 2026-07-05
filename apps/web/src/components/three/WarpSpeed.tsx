"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WarpSpeedProps {
  active?: boolean;
  count?: number;
}

export default function WarpSpeed({ active = false, count = 300 }: WarpSpeedProps) {
  const ref = useRef<THREE.Points>(null);
  const speedRef = useRef(0);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;

    const target = active ? 1 : 0;
    speedRef.current += (target - speedRef.current) * delta * 2;
    const speed = speedRef.current;

    for (let i = 0; i < count; i++) {
      let z = pos.getZ(i);
      z += delta * (1 + speed * 40);
      if (z > 10) z = -10;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={active ? 2 : 1}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
