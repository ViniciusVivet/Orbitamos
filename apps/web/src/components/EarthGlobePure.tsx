"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Props {
  level?: number;
  xp?: number;
  xpMax?: number;
}

function getTier(level: number) {
  if (level >= 9) return { atmoColor: "#FFB347", atmoOpacity: 0.38, rings: 2, ring1Color: "#FBBF24", ring2Color: "#F97316", orbitDuration: 5,  label: "Lendário"      };
  if (level >= 6) return { atmoColor: "#00D4FF", atmoOpacity: 0.32, rings: 2, ring1Color: "#00D4FF", ring2Color: "#8B5CF6", orbitDuration: 7,  label: "Avançado"      };
  if (level >= 3) return { atmoColor: "#7CC0FF", atmoOpacity: 0.28, rings: 1, ring1Color: "#8B5CF6", ring2Color: null,      orbitDuration: 9,  label: "Intermediário" };
  return           { atmoColor: "#7CC0FF", atmoOpacity: 0.22, rings: 1, ring1Color: "#4f8fcf", ring2Color: null,      orbitDuration: 12, label: "Iniciante"     };
}

const LEVEL_PHRASES: Record<number, string> = {
  1: "Você começou. Isso já é mais que a maioria.",
  2: "Cada linha de código é um passo.",
  3: "A lógica está fluindo. Continue.",
  4: "Frontend desbloqueado. 🎉",
  5: "Seus projetos estão tomando forma.",
  6: "Portfólio no ar. Recrutadores vão te achar.",
  7: "Stage Mode: ON. 🚀",
  8: "Dev Jr à vista. Não para agora.",
  9: "Você é a prova que dá pra sair da periferia.",
  10: "Em órbita. Lendário. 🌟",
};

export default function EarthGlobePure({ level = 2, xp = 120, xpMax = 300 }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const rootRef       = useRef<HTMLDivElement>(null);
  const labelRef      = useRef<HTMLDivElement>(null);
  const hasPinRef     = useRef(false);
  const didDragRef    = useRef(false);
  const goToBrazilRef = useRef<(() => void) | null>(null);
  const [showPanel,   setShowPanel]   = useState(false);
  const [counterPos,  setCounterPos]  = useState({ x: -230, y: 80  });
  const [brazilPos,   setBrazilPos]   = useState({ x: 310,  y: 110 });

  const dragWidget = (
    e: React.PointerEvent,
    curPos: { x: number; y: number },
    setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
    draggedRef?: React.MutableRefObject<boolean>
  ) => {
    e.stopPropagation();
    if (draggedRef) draggedRef.current = false;
    const startMx = e.clientX, startMy = e.clientY;
    const startX  = curPos.x,  startY  = curPos.y;
    const onMove  = (ev: PointerEvent) => {
      if (draggedRef && Math.hypot(ev.clientX - startMx, ev.clientY - startMy) > 4)
        draggedRef.current = true;
      setPos({ x: startX + (ev.clientX - startMx), y: startY + (ev.clientY - startMy) });
    };
    const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  };
  const brazilDragged = useRef(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number; dist: number }>>([]);
  const pidRef = useRef(0);

  const tier   = getTier(level);
  const xpPct  = Math.min(100, Math.round((xp / xpMax) * 100));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width  = container.clientWidth  || 320;
    const height = container.clientHeight || 320;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // @ts-expect-error - Three.js version compatibility
    renderer.outputColorSpace = (THREE as { SRGBColorSpace?: string }).SRGBColorSpace || (THREE as { sRGBEncoding?: string }).sRGBEncoding;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    // Previne seleção e outline de foco no canvas
    renderer.domElement.style.outline      = "none";
    renderer.domElement.style.userSelect   = "none";
    renderer.domElement.setAttribute("tabindex", "-1");
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    // Luz do lado noturno — laranja/âmbar, simula cidades iluminadas
    const nightLight = new THREE.DirectionalLight(new THREE.Color("#ff6a1a"), 0.45);
    nightLight.position.set(-5, -2, -4);
    scene.add(nightLight);

    // Campo de estrelas 3D
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 8 + Math.random() * 4;
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, sizeAttenuation: true, transparent: true, opacity: 0.85 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Earth
    const loader    = new THREE.TextureLoader();
    const colorMap  = loader.load("https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg");
    const specMap   = loader.load("https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth_specular_map.tif.jpg");
    const normalMap = loader.load("https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth_normal_map.tif.jpg");
    const cloudsMap = loader.load("https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png");

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ map: colorMap, normalMap, specularMap: specMap, shininess: 18, specular: new THREE.Color("#7fc3ff") })
    );
    scene.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.01, 64, 64),
      new THREE.MeshPhongMaterial({ map: cloudsMap, transparent: true, opacity: 0.35, depthWrite: false })
    );
    scene.add(clouds);

    // Atmosfera
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 64, 64),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tier.atmoColor), transparent: true, opacity: tier.atmoOpacity, blending: THREE.AdditiveBlending, side: THREE.BackSide })
    ));

    // Cidades brasileiras para marcadores no globo
    const CITIES = [
      { lat: -23.5505, lon: -46.6333 }, // São Paulo
      { lat: -22.9068, lon: -43.1729 }, // Rio de Janeiro
      { lat:  -3.7172, lon: -38.5433 }, // Fortaleza
      { lat:  -8.0476, lon: -34.8770 }, // Recife
      { lat: -19.9167, lon: -43.9345 }, // Belo Horizonte
      { lat: -30.0346, lon: -51.2177 }, // Porto Alegre
      { lat: -15.7801, lon: -47.9292 }, // Brasília
    ];

    // Marcador
    const latLonToVec3 = (latDeg: number, lonDeg: number, r = 1.06) => {
      const lat = THREE.MathUtils.degToRad(latDeg);
      const lon = THREE.MathUtils.degToRad(lonDeg);
      return new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).multiplyScalar(r);
    };

    let targetRotY: number | null = null;
    let targetRotX: number | null = null;
    let markerGroup: THREE.Group | null = null;

    // Marcadores de cidades brasileiras
    const cityMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00D4FF"),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const cityMeshes: THREE.Mesh[] = [];
    for (const city of CITIES) {
      const pos  = latLonToVec3(city.lat, city.lon, 1.025);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), cityMat.clone());
      mesh.position.copy(pos);
      earth.add(mesh);
      cityMeshes.push(mesh);
    }

    // Função para voltar ao Brasil (SP)
    const goToBrazil = () => {
      targetRotY = -Math.PI / 2 - THREE.MathUtils.degToRad(-46.6333);
      targetRotX = THREE.MathUtils.degToRad(-23.5505);
    };
    goToBrazilRef.current = goToBrazil;

    const addMarker = (lat: number, lon: number) => {
      if (markerGroup) { earth.remove(markerGroup); markerGroup = null; }
      const pos   = latLonToVec3(lat, lon);
      const group = new THREE.Group();
      const cone  = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.1, 16), new THREE.MeshBasicMaterial({ color: 0xff5555 }));
      cone.position.set(0, 0.05, 0);
      group.add(cone);
      group.position.copy(pos);
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      earth.add(group);
      markerGroup       = group;
      hasPinRef.current = true;
      targetRotY = -Math.PI / 2 - THREE.MathUtils.degToRad(lon);
      targetRotX = THREE.MathUtils.degToRad(lat);
    };

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (g) => addMarker(g.coords.latitude, g.coords.longitude),
        () => addMarker(-23.5505, -46.6333),
        { enableHighAccuracy: false, timeout: 3000 }
      );
    } else {
      addMarker(-23.5505, -46.6333);
    }

    let raf = 0;
    let isDragging = false, lastX = 0, lastY = 0, velX = 0, velY = 0;
    const rot = { x: 0, y: 0 };
    const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true; didDragRef.current = false;
      lastX = e.clientX; lastY = e.clientY; velX = velY = 0;
      container.style.cursor = "grabbing";
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      didDragRef.current = true;
      velY = (e.clientX - lastX) * 0.005;
      velX = (e.clientY - lastY) * 0.005;
      lastX = e.clientX; lastY = e.clientY;
      rot.y += velY; rot.x += velX;
      rot.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rot.x));
      earth.rotation.set(rot.x, rot.y, 0);
      clouds.rotation.set(rot.x, rot.y * 1.01, 0);
      targetRotY = null; targetRotX = null;
    };
    const onPointerUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
      if (!didDragRef.current) {
        setShowPanel(p => !p);
        // Burst de partículas XP no ponto do clique
        const rect = container.getBoundingClientRect();
        const cx = lastX - rect.left;
        const cy = lastY - rect.top;
        const batch = Array.from({ length: 14 }, (_, i) => ({
          id: pidRef.current++,
          x: cx, y: cy,
          angle: (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
          dist: 32 + Math.random() * 52,
        }));
        setParticles(prev => [...prev, ...batch]);
        setTimeout(() => setParticles(prev => prev.filter(p => !batch.some(b => b.id === p.id))), 950);
      }
    };

    // Zoom com scroll
    let targetZ = 2.8;
    const MIN_Z = 1.6, MAX_Z = 4.8;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZ = Math.max(MIN_Z, Math.min(MAX_Z, targetZ + e.deltaY * 0.003));
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    container.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!reduceMotion) {
        if (!isDragging) {
          if (targetRotY !== null || targetRotX !== null) {
            if (targetRotY !== null) {
              const dY = ((targetRotY - earth.rotation.y + Math.PI) % (2 * Math.PI)) - Math.PI;
              if (Math.abs(dY) < 0.005) { earth.rotation.y = targetRotY; targetRotY = null; }
              else earth.rotation.y += dY * 0.04;
            }
            if (targetRotX !== null) {
              const dX = targetRotX - earth.rotation.x;
              if (Math.abs(dX) < 0.005) { earth.rotation.x = targetRotX; targetRotX = null; }
              else earth.rotation.x += dX * 0.04;
            }
            clouds.rotation.y = earth.rotation.y * 1.01;
            clouds.rotation.x = earth.rotation.x;
          } else if (Math.abs(velX) > 0.0003 || Math.abs(velY) > 0.0003) {
            rot.x += velX; rot.y += velY;
            rot.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rot.x));
            velX *= 0.92; velY *= 0.92;
            earth.rotation.set(rot.x, rot.y, 0);
            clouds.rotation.set(rot.x, rot.y * 1.01, 0);
          } else {
            earth.rotation.y += 0.0022;
            clouds.rotation.y += 0.0028;
          }
          rot.y = earth.rotation.y;
          rot.x = earth.rotation.x;
        }
      }

      // Zoom suave
      if (Math.abs(camera.position.z - targetZ) > 0.001)
        camera.position.z += (targetZ - camera.position.z) * 0.1;

      // Pulsa marcadores de cidades
      const t = performance.now() / 1000;
      cityMeshes.forEach((m, i) => {
        const s = 1 + 0.5 * Math.abs(Math.sin(t * 1.8 + i * 0.9));
        m.scale.setScalar(s);
        (m.material as THREE.MeshBasicMaterial).opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 1.8 + i * 0.9));
      });

      renderer.render(scene, camera);

      if (hasPinRef.current && markerGroup && container) {
        const proj = markerGroup.getWorldPosition(new THREE.Vector3());
        proj.project(camera);
        const lx = (proj.x * 0.5 + 0.5) * container.clientWidth;
        const ly = (-proj.y * 0.5 + 0.5) * container.clientHeight;
        if (labelRef.current) {
          labelRef.current.style.transform = `translate(${lx}px, ${ly}px)`;
          labelRef.current.style.opacity   = proj.z > 1 ? "0" : "1";
        }
      }
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("wheel", onWheel);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="relative mx-auto mt-16 h-72 w-72 md:h-96 md:w-96 select-none">

      {/* Anéis de órbita CSS — fora do canvas, não são cortados */}
      {tier.rings >= 1 && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10"
          style={{
            width: "140%", height: "140%",
            transform: "translate(-50%, -50%) perspective(400px) rotateX(65deg)",
          }}
        >
          <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${tier.ring1Color}`, opacity: 0.55 }} />
          {/* Rastro da lua */}
          {([{ s: 14, o: 0.35, d: 0.35 }, { s: 9, o: 0.18, d: 0.7 }, { s: 5, o: 0.08, d: 1.05 }]).map((t, i) => (
            <div key={i} className="absolute inset-0 rounded-full"
              style={{ animation: `orbitSat ${tier.orbitDuration}s linear infinite`, animationDelay: `${t.d}s` }}>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rounded-full"
                style={{ width: t.s, height: t.s, background: "#9ca3af", opacity: t.o }} />
            </div>
          ))}
          {/* Lua principal */}
          <div className="absolute inset-0 rounded-full" style={{ animation: `orbitSat ${tier.orbitDuration}s linear infinite` }}>
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: 20, height: 20,
                background: "radial-gradient(circle at 35% 35%, #e8e8e8, #9ca3af 50%, #4b5563 100%)",
                boxShadow: `0 0 12px 4px ${tier.ring1Color}88, inset -3px -3px 6px rgba(0,0,0,0.6)`,
              }}
            />
          </div>
        </div>
      )}

      {tier.rings >= 2 && tier.ring2Color && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10"
          style={{
            width: "160%", height: "160%",
            transform: `translate(-50%, -50%) perspective(400px) rotateX(65deg) rotateY(40deg)`,
          }}
        >
          <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${tier.ring2Color}`, opacity: 0.4 }} />
          {/* Satélite 2 */}
          <div className="absolute inset-0 rounded-full" style={{ animation: `orbitSat ${tier.orbitDuration * 1.4}s linear infinite reverse` }}>
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: 14, height: 14,
                background: "radial-gradient(circle at 35% 35%, #d1d5db, #6b7280 50%, #374151 100%)",
                boxShadow: `0 0 10px 3px ${tier.ring2Color}88, inset -2px -2px 5px rgba(0,0,0,0.6)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Pulso de radar */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute inset-0 rounded-full border border-orbit-electric/25"
          style={{ animation: `radarPulse 3s ease-out ${i * 1}s infinite` }}
        />
      ))}

      {/* Canvas */}
      <div ref={containerRef} className="h-full w-full overflow-hidden rounded-full" />

      {/* Label "você está aqui" */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-full rounded-md bg-gradient-to-r from-orbit-electric to-orbit-purple px-2 py-1 text-[10px] font-bold text-black shadow transition-opacity duration-300"
        style={{ opacity: 0 }}
      >
        você está aqui
      </div>

      {/* Borda + glow */}
      <div className="pointer-events-none absolute inset-0 rounded-full border border-white/10 shadow-[0_0_40px_rgba(124,192,255,0.2)]" />

      {/* Mini painel ao clicar */}
      {showPanel && (
        <div className="absolute left-1/2 top-1/2 z-30 w-52 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-orbit-electric/40 bg-black/85 p-4 text-center backdrop-blur-xl shadow-[0_0_40px_rgba(0,212,255,0.25)]">
          <div className="text-[10px] font-bold tracking-widest text-orbit-electric/70 uppercase mb-1">{tier.label}</div>
          <div className="text-2xl font-extrabold text-white mb-1">Nível {level}</div>
          <div className="text-xs text-white/60 mb-3">{xp} / {xpMax} XP</div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple shadow-[0_0_8px_rgba(0,212,255,0.6)]"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <p className="text-[11px] text-white/70 leading-snug">
            {LEVEL_PHRASES[Math.min(level, 10)] ?? "Continue em órbita."}
          </p>
          <button onClick={() => setShowPanel(false)} className="mt-3 text-[10px] text-white/30 hover:text-white/60 transition-colors">
            fechar
          </button>
        </div>
      )}

      {/* Contador "orbitando agora" — arrastável */}
      <div
        className="absolute z-20 cursor-grab active:cursor-grabbing whitespace-nowrap rounded-2xl border border-orbit-electric/30 bg-black/60 px-4 py-2 backdrop-blur-md shadow-[0_0_18px_rgba(0,212,255,0.15)] hover:border-orbit-electric/60 transition-colors"
        style={{ left: counterPos.x, top: counterPos.y }}
        onPointerDown={(e) => dragWidget(e, counterPos, setCounterPos)}
      >
        <span className="text-sm font-semibold text-white/60">
          🌐 <span className="text-2xl font-extrabold text-orbit-electric" style={{ textShadow: "0 0 12px rgba(0,212,255,0.7)" }}>12</span>
          <span className="ml-1">orbitando agora</span>
        </span>
      </div>

      {/* Botão Voltar ao Brasil — arrastável */}
      <div
        className="absolute z-20 cursor-grab active:cursor-grabbing rounded-full border border-orbit-electric/40 bg-black/60 px-4 py-2 text-sm font-bold text-orbit-electric/80 backdrop-blur-md shadow-[0_0_10px_rgba(0,212,255,0.1)] transition-all hover:border-orbit-electric hover:text-orbit-electric hover:shadow-[0_0_16px_rgba(0,212,255,0.45)]"
        style={{ left: brazilPos.x, top: brazilPos.y }}
        onPointerDown={(e) => dragWidget(e, brazilPos, setBrazilPos, brazilDragged)}
        onClick={() => { if (!brazilDragged.current) goToBrazilRef.current?.(); }}
      >
        🇧🇷 Voltar ao Brasil
      </div>

      {/* Partículas de XP burst */}
      {particles.map(p => (
        <div
          key={p.id}
          className="pointer-events-none absolute z-40 text-[11px] font-extrabold text-orbit-electric"
          style={{
            left: p.x, top: p.y,
            textShadow: "0 0 8px rgba(0,212,255,0.9)",
            animation: "xpBurst 0.9s ease-out forwards",
            ["--dx" as string]: `${Math.cos(p.angle) * p.dist}px`,
            ["--dy" as string]: `${Math.sin(p.angle) * p.dist}px`,
          }}
        >
          +XP
        </div>
      ))}

      <style>{`
        @keyframes radarPulse {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.9); opacity: 0;   }
        }
        @keyframes orbitSat {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes xpBurst {
          0%   { transform: translate(-50%, -50%) translate(0, 0) scale(1.2); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
