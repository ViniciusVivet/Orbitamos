"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

interface ImmersiveSceneCanvasProps {
  image: string;
  accent: string;
  second: string;
  progressRef: MutableRefObject<number>;
  className?: string;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform vec3 uAccent;
  uniform vec3 uSecond;
  uniform float uProgress;
  uniform float uTime;
  uniform float uTextureReady;

  varying vec2 vUv;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  vec2 coverUv(vec2 uv) {
    float screenAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = uImageResolution.x / max(uImageResolution.y, 1.0);
    vec2 scale = vec2(1.0);

    if (screenAspect > imageAspect) {
      scale.y = imageAspect / screenAspect;
    } else {
      scale.x = screenAspect / imageAspect;
    }

    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 baseUv = coverUv(vUv);
    float p = clamp(uProgress, 0.0, 1.0);
    float entry = smoothstep(0.06, 0.24, p);
    float tension = smoothstep(0.37, 0.48, p) * (1.0 - smoothstep(0.57, 0.69, p));
    float resolve = smoothstep(0.60, 0.83, p);
    float landing = smoothstep(0.82, 1.0, p);

    vec2 cameraTarget = vec2(
      0.5 + sin(p * 8.2) * 0.035 + tension * 0.035,
      0.5 + cos(p * 5.7) * 0.022 - resolve * 0.018
    );
    float zoom = 1.0 + entry * 0.16 + tension * 0.12 - landing * 0.08;
    vec2 uv = cameraTarget + (baseUv - cameraTarget) / zoom;

    vec2 centered = vUv - 0.5;
    float distanceToCenter = length(centered);
    vec2 direction = centered / max(distanceToCenter, 0.001);
    float radialWave = sin(distanceToCenter * 38.0 - p * 24.0 + uTime * 0.22);
    uv += direction * radialWave * (0.002 + tension * 0.012);
    uv.x += sin((uv.y + p) * 20.0) * tension * 0.006;

    float split = 0.0012 + tension * 0.009 + landing * 0.0015;
    vec2 chromaDirection = direction * split;
    float red = texture2D(uTexture, uv + chromaDirection).r;
    float green = texture2D(uTexture, uv).g;
    float blue = texture2D(uTexture, uv - chromaDirection).b;
    vec3 color = vec3(red, green, blue);

    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, 0.78 + resolve * 0.32);
    color = mix(color, color * uAccent * 1.65, 0.05 + tension * 0.11);
    color += uSecond * tension * pow(max(0.0, 1.0 - distanceToCenter * 1.7), 3.0) * 0.09;

    vec2 lightPosition = vec2(0.22 + p * 0.58, 0.18 + sin(p * 6.283) * 0.2);
    float movingLight = pow(max(0.0, 1.0 - distance(vUv, lightPosition)), 5.0);
    color += uAccent * movingLight * (0.07 + resolve * 0.09);

    float scan = smoothstep(0.0, 0.035, abs(fract(vUv.y * 120.0 - p * 7.0) - 0.5));
    color *= mix(0.965, 1.0, scan);

    float vignette = 1.0 - smoothstep(0.24, 0.92, distanceToCenter);
    color *= mix(0.42, 1.0, vignette);
    color *= 0.72 + entry * 0.18 + resolve * 0.1;

    float grain = hash21(gl_FragCoord.xy + fract(uTime) * 731.0) - 0.5;
    color += grain * 0.035;

    vec3 fallback = mix(vec3(0.006, 0.009, 0.018), uAccent * 0.16, movingLight);
    color = mix(fallback, color, uTextureReady);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function colorToVector(color: string) {
  const parsed = new THREE.Color(color);
  return new THREE.Vector3(parsed.r, parsed.g, parsed.b);
}

export default function ImmersiveSceneCanvas({
  image,
  accent,
  second,
  progressRef,
  className,
}: ImmersiveSceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let frame = 0;
    let isVisible = true;
    let disposed = false;
    let texture: THREE.Texture | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTexture: { value: new THREE.Texture() },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageResolution: { value: new THREE.Vector2(16, 9) },
      uAccent: { value: colorToVector(accent) },
      uSecond: { value: colorToVector(second) },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uTextureReady: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.15 : 1.5));
    } catch {
      canvas.dataset.unavailable = "true";
      return;
    }

    const resize = () => {
      if (!renderer) return;
      const bounds = parent.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    };

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const source = image.startsWith("http") ? image : new URL(image, window.location.origin).href;
    loader.load(
      source,
      (loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }
        texture = loadedTexture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        uniforms.uTexture.value = texture;
        const textureImage = texture.image as HTMLImageElement;
        uniforms.uImageResolution.value.set(textureImage.naturalWidth || textureImage.width, textureImage.naturalHeight || textureImage.height);
        uniforms.uTextureReady.value = 1;
        canvas.dataset.ready = "true";
      },
      undefined,
      () => {
        canvas.dataset.unavailable = "true";
      },
    );

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    resize();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin: "20% 0px" },
    );
    visibilityObserver.observe(canvas);

    const clock = new THREE.Clock();
    const render = () => {
      if (disposed) return;
      frame = window.requestAnimationFrame(render);
      if (!renderer || !isVisible || document.hidden) return;
      uniforms.uProgress.value += (progressRef.current - uniforms.uProgress.value) * 0.085;
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      texture?.dispose();
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
    };
  }, [accent, image, progressRef, second]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
