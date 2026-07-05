"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Starfield from "./Starfield";
import MouseReactiveCamera from "./MouseReactiveCamera";

function Asteroids() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 20;

  const asteroids = useRef(
    Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8 - 3,
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: 0.03 + Math.random() * 0.08,
      speed: 0.1 + Math.random() * 0.4,
      axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
    }))
  ).current;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const a = asteroids[i];
      if (!a) return;
      child.rotateOnAxis(a.axis, delta * a.speed);
    });
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((a, i) => (
        <mesh key={i} position={a.position} rotation={a.rotation} scale={a.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#8B9DC3" transparent opacity={0.25} wireframe />
        </mesh>
      ))}
    </group>
  );
}

export default function ProjetosHeroScene() {
  return (
    <>
      <MouseReactiveCamera intensity={0.3} />
      <Starfield count={300} radius={12} speed={0.015} />
      <Asteroids />
    </>
  );
}
