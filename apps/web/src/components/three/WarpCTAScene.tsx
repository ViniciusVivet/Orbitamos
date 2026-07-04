"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import WarpSpeed from "./WarpSpeed";
import Starfield from "./Starfield";
import MouseReactiveCamera from "./MouseReactiveCamera";

export default function WarpCTAScene() {
  const [warping, setWarping] = useState(false);

  useEffect(() => {
    // Activate warp after a short delay for effect
    const t = setTimeout(() => setWarping(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <MouseReactiveCamera intensity={0.15} />
      <Starfield count={150} radius={8} speed={0.03} />
      <WarpSpeed active={warping} count={250} />
    </>
  );
}
