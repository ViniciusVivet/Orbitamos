"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Starfield from "./Starfield";
import Nebula from "./Nebula";
import OrbitRing from "./OrbitRing";
import MouseReactiveCamera from "./MouseReactiveCamera";

function GlowingSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !glowRef.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.2;
    glowRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.12);
  });

  return (
    <group position={[0, 0, -1]}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.03} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function EnergyParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 60;

  const positions = useRef(
    (() => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = 1.8 + Math.random() * 0.5;
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
        pos[i * 3 + 2] = Math.sin(angle) * r - 1;
      }
      return pos;
    })()
  ).current;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#00D4FF"
        size={1.5}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function LoginScene() {
  return (
    <>
      <MouseReactiveCamera intensity={0.3} />
      <ambientLight intensity={0.05} />
      <Starfield count={350} radius={12} speed={0.012} />
      <Nebula count={8} opacity={0.05} speed={0.08} />
      <GlowingSphere />
      <EnergyParticles />
      <OrbitRing radius={2} color="#00D4FF" speed={0.3} opacity={0.12} tilt={[0.7, 0, 0]} />
      <OrbitRing radius={2.5} color="#8B5CF6" speed={-0.2} opacity={0.08} tilt={[-0.3, 0.5, 0.2]} />
    </>
  );
}
