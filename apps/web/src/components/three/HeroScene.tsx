"use client";

import Starfield from "./Starfield";
import Nebula from "./Nebula";
import OrbitRing from "./OrbitRing";
import MouseReactiveCamera from "./MouseReactiveCamera";

export default function HeroScene() {
  return (
    <>
      <MouseReactiveCamera intensity={0.4} />
      <ambientLight intensity={0.1} />
      <Starfield count={500} radius={14} speed={0.015} />
      <Nebula count={14} opacity={0.08} speed={0.12} />
      <OrbitRing radius={3.5} color="#00D4FF" speed={0.2} opacity={0.15} tilt={[0.6, 0.2, 0]} />
      <OrbitRing radius={2.8} color="#8B5CF6" speed={-0.15} opacity={0.12} tilt={[-0.4, 0.5, 0.3]} />
      <OrbitRing radius={4.2} color="#00D4FF" speed={0.08} opacity={0.08} tilt={[0.2, -0.3, 0.1]} />
      {/* Central glow */}
      <mesh position={[0, 0, -2]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.04} />
      </mesh>
      <mesh position={[0, 0, -2]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.06} />
      </mesh>
    </>
  );
}
