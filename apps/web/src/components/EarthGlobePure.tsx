"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function EarthGlobePure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 2.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // Garantir cores corretas (mais vivas/azuladas)
    // @ts-ignore
    renderer.outputColorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    // Earth
    const loader = new THREE.TextureLoader();
    const colorMap = loader.load(
      // Blue Marble (mais azul, sem nuvens)
      "https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg"
    );
    const specMap = loader.load(
      "https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth_specular_map.tif.jpg"
    );
    const normalMap = loader.load(
      "https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth_normal_map.tif.jpg"
    );
    const cloudsMap = loader.load(
      // textura de nuvens semi-transparente
      "https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png"
    );

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: colorMap,
      normalMap,
      specularMap: specMap,
      shininess: 18,
      specular: new THREE.Color("#7fc3ff"),
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Camada de nuvens (levemente maior, transparente)
    const cloudsGeo = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({ map: cloudsMap, transparent: true, opacity: 0.35, depthWrite: false });
    const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
    scene.add(clouds);

    // Atmosfera (glow) — esfera invertida com blending aditivo
    const atmoGeo = new THREE.SphereGeometry(1.06, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#7CC0FF"), transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, side: THREE.BackSide });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);

    // (órbitas removidas — vamos usar naves no espaço via overlay CSS)

    // Util: converter lat/lon (graus) para posição na esfera
    // Conversão lat/lon para posição; ajustamos fase do meridiano para que 0° lon apareça ao centro
    const latLonToVector3 = (latDeg: number, lonDeg: number, radius = 1.06) => {
      const lat = THREE.MathUtils.degToRad(latDeg);
      // Rotacionar  -90° em Y para trazer o meridiano 0° ao centro da câmera
      const lon = THREE.MathUtils.degToRad(lonDeg) - Math.PI / 2;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);
      return new THREE.Vector3(x, y, z).multiplyScalar(radius);
    };

    // Criar marcador (cone + brilho) e anexar na Terra
    let markerGroup: THREE.Group | null = null;
    const addMarker = (lat: number, lon: number) => {
      if (markerGroup) {
        earth.remove(markerGroup);
        markerGroup = null;
      }
      const pos = latLonToVector3(lat, lon, 1.06);
      const group = new THREE.Group();
      const coneGeo = new THREE.ConeGeometry(0.02, 0.1, 16);
      const coneMat = new THREE.MeshBasicMaterial({ color: 0xff5555 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(0, 0.05, 0);
      group.add(cone);
      // orientar o marcador perpendicular à superfície
      group.position.copy(pos);
      const up = new THREE.Vector3(0, 1, 0);
      group.quaternion.setFromUnitVectors(up, pos.clone().normalize());
      earth.add(group);
      markerGroup = group;
      setHasPin(true);
    };

    // Geolocalização (permite negar). Fallback: centro do Brasil
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (geo) => addMarker(geo.coords.latitude, geo.coords.longitude),
        () => addMarker(-23.5505, -46.6333), // fallback: São Paulo
        { enableHighAccuracy: false, timeout: 3000 }
      );
    } else {
      addMarker(-23.5505, -46.6333);
    }

    let raf = 0;
    const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    const rot = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      // controlar rotação manual (lado e cima/baixo)
      rot.y += dx * 0.005; // esquerda/direita
      rot.x += dy * 0.005; // cima/baixo
      rot.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rot.x));
      earth.rotation.set(rot.x, rot.y, 0);
      clouds.rotation.set(rot.x, rot.y * 1.01, 0);
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    const animate = () => {
      if (!reduceMotion && !isDragging) {
        earth.rotation.y += 0.0022;
        clouds.rotation.y += 0.0028;
        rot.y = earth.rotation.y; // manter referência
        rot.x = earth.rotation.x;
      }
      raf = requestAnimationFrame(animate);
      renderer.render(scene, camera);

      // Atualiza label "você está aqui" sobre o ponto
      if (hasPin && markerGroup && container) {
        const projected = markerGroup.getWorldPosition(new THREE.Vector3()).clone();
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-projected.y * 0.5 + 0.5) * container.clientHeight;
        if (labelRef.current) {
          labelRef.current.style.transform = `translate(${x}px, ${y}px)`;
          labelRef.current.style.opacity = projected.z > 1 ? "0" : "1";
        }
      }

      // (animações de satélites removidas)
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      colorMap.dispose();
      specMap.dispose();
      normalMap.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      cloudsMap.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      // (sem órbitas para descartar)
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative mx-auto mt-16 h-72 w-72 md:h-96 md:w-96">
      <div ref={containerRef} className="h-full w-full overflow-hidden rounded-full" />
      {/* Label GPS */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-full rounded-md bg-gradient-to-r from-orbit-electric to-orbit-purple px-2 py-1 text-[10px] font-bold text-black shadow"
        style={{ opacity: 0 }}
      >
        você está aqui
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full border border-white/10 shadow-[0_0_30px_rgba(124,192,255,0.25)]" />
    </div>
  );
}


