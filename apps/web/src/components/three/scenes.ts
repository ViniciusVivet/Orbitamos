import * as THREE from "three";

/* ── Starfield ── */
export function createStarfield(scene: THREE.Scene, count = 500, radius = 12) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.4 + Math.random() * 0.6);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}

/* ── Orbit Ring ── */
export function createOrbitRing(
  scene: THREE.Scene,
  radius = 2.5,
  color = 0x00d4ff,
  opacity = 0.2,
  tilt: [number, number, number] = [0, 0, 0]
) {
  const geo = new THREE.TorusGeometry(radius, 0.008, 16, 100);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.set(tilt[0], tilt[1], tilt[2]);
  scene.add(mesh);
  return mesh;
}

/* ── Nebula cloud ── */
export function createNebula(scene: THREE.Scene, count = 14, colors: [number, number] = [0x00d4ff, 0x8b5cf6], opacity = 0.08) {
  const group = new THREE.Group();
  const particles: { mesh: THREE.Mesh; basePos: [number, number, number]; phase: number }[] = [];

  for (let i = 0; i < count; i++) {
    const color = i % 2 === 0 ? colors[0] : colors[1];
    const scale = 1.5 + Math.random() * 3;
    const basePos: [number, number, number] = [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4 - 2,
    ];
    const geo = new THREE.PlaneGeometry(scale, scale);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...basePos);
    group.add(mesh);
    particles.push({ mesh, basePos, phase: Math.random() * Math.PI * 2 });
  }

  scene.add(group);
  return { group, particles };
}

/* ── Glowing sphere ── */
export function createGlow(scene: THREE.Scene, radius: number, color: number, opacity: number) {
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return mesh;
}

/* ── Asteroid field ── */
export function createAsteroids(scene: THREE.Scene, count = 20) {
  const group = new THREE.Group();
  const asteroids: { mesh: THREE.Mesh; axis: THREE.Vector3; speed: number }[] = [];

  for (let i = 0; i < count; i++) {
    const scale = 0.03 + Math.random() * 0.08;
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x8b9dc3,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8 - 3
    );
    mesh.scale.setScalar(scale);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    group.add(mesh);
    asteroids.push({
      mesh,
      axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
      speed: 0.1 + Math.random() * 0.4,
    });
  }

  scene.add(group);
  return asteroids;
}

/* ── Energy particles (ring) ── */
export function createEnergyParticles(scene: THREE.Scene, count = 60) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = 1.8 + Math.random() * 0.5;
    pos[i * 3] = Math.cos(angle) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
    pos[i * 3 + 2] = Math.sin(angle) * r - 1;
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 1.5,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}

/* ── Warp speed stars ── */
export function createWarpStars(scene: THREE.Scene, count = 300) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return { points, count };
}

/* ── Holo ring (contact scene) ── */
export function createHoloRings(scene: THREE.Scene) {
  const group = new THREE.Group();
  const rings = [
    createOrbitRing(group as unknown as THREE.Scene, 2.2, 0x00d4ff, 0.2, [1.2, 0, 0]),
    createOrbitRing(group as unknown as THREE.Scene, 2.6, 0x8b5cf6, 0.15, [0.8, 0.5, 0.3]),
    createOrbitRing(group as unknown as THREE.Scene, 3.0, 0x00d4ff, 0.1, [0.4, -0.3, 0.6]),
    createOrbitRing(group as unknown as THREE.Scene, 3.4, 0x8b5cf6, 0.08, [-0.2, 0.8, 0.1]),
  ];
  scene.add(group);
  return group;
}

/* ── Light beam (contact scene) ── */
export function createLightBeam(scene: THREE.Scene) {
  const geo = new THREE.CylinderGeometry(0.01, 0.15, 4, 16, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 2, 0);
  scene.add(mesh);
  return mesh;
}

/* ── Floating nodes (tech orbit) ── */
export function createFloatingNodes(
  scene: THREE.Scene,
  nodes: { color: string; phase: number }[]
) {
  const group = new THREE.Group();
  const meshes: { mesh: THREE.Mesh; glow: THREE.Mesh; phase: number; orbitRadius: number }[] = [];

  nodes.forEach((node) => {
    const color = new THREE.Color(node.color);
    const geo = new THREE.SphereGeometry(0.06, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);

    const glowGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);

    const subGroup = new THREE.Group();
    subGroup.add(mesh);
    subGroup.add(glow);
    group.add(subGroup);

    meshes.push({
      mesh: subGroup as unknown as THREE.Mesh,
      glow,
      phase: node.phase,
      orbitRadius: 2.2 + node.phase * 0.15,
    });
  });

  scene.add(group);
  return meshes;
}
