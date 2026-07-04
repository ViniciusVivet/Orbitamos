"use client";

import Starfield from "./Starfield";
import OrbitRing from "./OrbitRing";
import FloatingNode from "./FloatingNode";
import MouseReactiveCamera from "./MouseReactiveCamera";

const nodes = [
  { label: "Next.js", detail: "Interface rapida", phase: 0, color: "#00D4FF" },
  { label: "TypeScript", detail: "Codigo robusto", phase: 1.05, color: "#3178C6" },
  { label: "APIs", detail: "Integracoes", phase: 2.1, color: "#00D4FF" },
  { label: "Supabase", detail: "Auth e dados", phase: 3.15, color: "#3ECF8E" },
  { label: "IA", detail: "Automacao aplicada", phase: 4.2, color: "#8B5CF6" },
  { label: "PostgreSQL", detail: "Banco solido", phase: 5.25, color: "#336791" },
];

export default function TechOrbitScene() {
  return (
    <>
      <MouseReactiveCamera intensity={0.25} />
      <ambientLight intensity={0.15} />
      <Starfield count={200} radius={10} speed={0.01} sizeRange={[0.3, 1.5]} />

      {/* Core sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.15} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* Orbit rings */}
      <OrbitRing radius={2} color="#00D4FF" speed={0.25} opacity={0.2} tilt={[0.5, 0, 0]} />
      <OrbitRing radius={2.8} color="#8B5CF6" speed={-0.18} opacity={0.15} tilt={[-0.3, 0.4, 0.2]} />
      <OrbitRing radius={3.5} color="#00D4FF" speed={0.1} opacity={0.1} tilt={[0.1, -0.2, 0.5]} />

      {/* Tech nodes orbiting */}
      {nodes.map((node) => (
        <FloatingNode
          key={node.label}
          label={node.label}
          detail={node.detail}
          position={[0, 0, 0]}
          orbitRadius={2.2 + node.phase * 0.15}
          orbitSpeed={0.2}
          phase={node.phase}
          color={node.color}
        />
      ))}
    </>
  );
}
