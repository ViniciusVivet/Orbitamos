"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

function Earth() {
  const [colorMap, normalMap, specMap] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return [
      loader.load("https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth_daymap.jpg"),
      loader.load("https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth_normal_map.tif.jpg"),
      loader.load("https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth_specular_map.tif.jpg"),
    ];
  }, []);

  return (
    <mesh rotation={[0, 0, 0]}> 
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial map={colorMap} normalMap={normalMap} specularMap={specMap} shininess={12} />
    </mesh>
  );
}

export default function EarthGlobe() {
  return (
    <div className="relative mx-auto mt-16 h-72 w-72 md:h-96 md:w-96">
      <Canvas camera={{ position: [0, 0, 2.2], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={1} />
        <Suspense fallback={null}>
          <group rotation={[0.2, 0.6, 0]}>
            <Earth />
          </group>
        </Suspense>
        <Stars radius={30} depth={50} count={1000} factor={2} saturation={0} fade speed={0.5} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.6} enablePan={false} />
      </Canvas>
    </div>
  );
}


