"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Starfield from "./Starfield";
import Nebula from "./Nebula";
import OrbitRing from "./OrbitRing";
import MouseReactiveCamera from "./MouseReactiveCamera";

function HoloRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <OrbitRing radius={2.2} color="#00D4FF" speed={0.35} opacity={0.2} tilt={[1.2, 0, 0]} />
      <OrbitRing radius={2.6} color="#8B5CF6" speed={-0.25} opacity={0.15} tilt={[0.8, 0.5, 0.3]} />
      <OrbitRing radius={3.0} color="#00D4FF" speed={0.15} opacity={0.1} tilt={[0.4, -0.3, 0.6]} />
      <OrbitRing radius={3.4} color="#8B5CF6" speed={-0.1} opacity={0.08} tilt={[-0.2, 0.8, 0.1]} />
    </group>
  );
}

function EnergyCore() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.06} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
      {/* Light beam going up */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.15, 4, 16, 1, true]} />
        <meshBasicMaterial
          color="#00D4FF"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function ContactScene() {
  return (
    <>
      <MouseReactiveCamera intensity={0.35} />
      <ambientLight intensity={0.05} />
      <Starfield count={400} radius={15} speed={0.01} />
      <Nebula count={10} opacity={0.06} speed={0.1} colors={["#00D4FF", "#8B5CF6"]} />
      <EnergyCore />
      <HoloRings />
    </>
  );
}
