"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { MessageCircle, Monitor, Move } from "lucide-react";
import { ChapterAudio } from "../orbi-chapter/audio";
import styles from "./OfficeScene.module.css";

export type OfficeTarget = "lead" | "computer" | "support";

export interface OfficeSceneProps {
  onInteract: (target: OfficeTarget) => void;
  activeTarget?: OfficeTarget | null;
  repaired: boolean;
  briefed?: boolean;
  paused: boolean;
  muted: boolean;
  onReady?: () => void;
}

type Point = { x: number; y: number };
type Station = { id: OfficeTarget; name: string; label: string; position: Point; approach: Point };
type SceneOptions = { muted: boolean; paused: boolean; repaired: boolean };
type SceneRuntime = { walkTo: (point: Point, target?: OfficeTarget) => void; setOptions: (options: SceneOptions) => void };

const WORLD = { width: 1200, height: 800 };
const FLOOR = { left: 105, right: 1095, top: 455, bottom: 650 };
const ART_ROOT = "/images/games/work-simulation";
const ORBI_ART = "/images/games/orbi-chapter/orbi-sheet-v1.webp";
const stations: Station[] = [
  { id: "lead", name: "Nina", label: "Conversar com Nina", position: { x: 300, y: 444 }, approach: { x: 300, y: 520 } },
  { id: "computer", name: "Computador", label: "Abrir computador", position: { x: 600, y: 335 }, approach: { x: 600, y: 505 } },
  { id: "support", name: "Jo", label: "Conversar com Jo", position: { x: 970, y: 450 }, approach: { x: 970, y: 530 } },
];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const floorPoint = (point: Point): Point => ({ x: clamp(point.x, FLOOR.left, FLOOR.right), y: clamp(point.y, FLOOR.top, FLOOR.bottom) });
const movementKeys = new Set(["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"]);

/** A small office runtime. Positions and camera never enter React's render cycle. */
export default function OfficeScene({ onInteract, activeTarget = null, repaired, briefed = false, paused, muted, onReady }: OfficeSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const callbacksRef = useRef({ onInteract, onReady });
  const optionsRef = useRef<SceneOptions>({ muted, paused: paused || activeTarget !== null, repaired });
  const [assetsReady, setAssetsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { callbacksRef.current = { onInteract, onReady }; }, [onInteract, onReady]);

  useEffect(() => {
    const scene = sceneRef.current;
    const world = worldRef.current;
    const player = playerRef.current;
    const sprite = spriteRef.current;
    const destination = destinationRef.current;
    if (!scene || !world || !player || !sprite || !destination) return;

    const position: Point = { x: 535, y: 565 };
    const keys = new Set<string>();
    const audio = new ChapterAudio();
    let options = optionsRef.current;
    let previousRepaired = options.repaired;
    let pendingSuccess = false;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let goal: (Point & { target?: OfficeTarget }) | null = null;
    let frame: number | null = null;
    let previousTime = 0;
    let walkingTime = 0;
    let facing = 1;
    let scenePaused = options.paused;
    let loaded = false;
    let disposed = false;
    let viewWidth = 0;
    let viewHeight = 0;
    let scale = 1;
    let cameraX = 0;
    let cameraY = 0;
    let floorBottom = FLOOR.bottom;

    const updateAudio = () => {
      audio.set(options.muted, options.paused || document.hidden);
      if (pendingSuccess && !options.muted && !options.paused && !document.hidden) {
        pendingSuccess = false;
        audio.play("checkpoint");
      }
    };
    updateAudio();

    const safePoint = (point: Point): Point => {
      const bounded = floorPoint(point);
      return { x: bounded.x, y: Math.min(bounded.y, floorBottom) };
    };

    const announce = (message: string) => { if (liveRef.current) liveRef.current.textContent = message; };

    const paint = (moving: boolean) => {
      cameraX = clamp(position.x * scale - viewWidth / 2, 0, Math.max(0, WORLD.width * scale - viewWidth));
      world.style.transform = `translate3d(${-cameraX}px, ${-cameraY}px, 0) scale(${scale})`;
      player.style.transform = `translate3d(${position.x - 77}px, ${position.y - 154}px, 0)`;
      player.style.zIndex = String(Math.round(position.y));
      const atlasFrame = moving && !reducedMotion ? 1 + Math.floor(walkingTime / 0.12) % 3 : 0;
      sprite.style.backgroundPosition = `${atlasFrame * 100 / 3}% 0%`;
      sprite.style.transform = `scaleX(${facing})`;
      if (goal) {
        destination.hidden = false;
        destination.style.transform = `translate3d(${goal.x - 22}px, ${goal.y - 9}px, 0)`;
      } else destination.hidden = true;
    };

    const stop = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      previousTime = 0;
    };

    const release = (cancelGoal = true) => {
      keys.clear();
      if (cancelGoal) goal = null;
      walkingTime = 0;
      delete scene.dataset.walkingTo;
      stop();
      paint(false);
    };

    const tick = (time: number) => {
      frame = null;
      if (disposed || scenePaused || document.hidden || !loaded) { previousTime = 0; return; }
      const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
      previousTime = time;
      let dx = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
      let dy = Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup"));
      let arrived: OfficeTarget | undefined;
      if (dx || dy) {
        goal = null;
        delete scene.dataset.walkingTo;
      } else if (goal) {
        dx = goal.x - position.x;
        dy = goal.y - position.y;
        if (Math.hypot(dx, dy) <= 255 * dt) {
          position.x = goal.x;
          position.y = goal.y;
          arrived = goal.target;
          goal = null;
          dx = 0;
          dy = 0;
          delete scene.dataset.walkingTo;
        }
      }
      const magnitude = Math.hypot(dx, dy);
      let moving = false;
      if (magnitude > 0) {
        const next = safePoint({ x: position.x + dx / magnitude * 255 * dt, y: position.y + dy / magnitude * 255 * dt });
        moving = Math.hypot(next.x - position.x, next.y - position.y) > 0.01;
        position.x = next.x;
        position.y = next.y;
        const previousStep = Math.floor(walkingTime / 0.32);
        walkingTime = moving ? walkingTime + dt : 0;
        if (moving && Math.floor(walkingTime / 0.32) !== previousStep) audio.play("step");
        if (dx) facing = dx < 0 ? -1 : 1;
      } else walkingTime = 0;
      paint(moving);
      if (arrived) {
        const station = stations.find(item => item.id === arrived)!;
        announce(station.label);
        audio.play("terminal");
        callbacksRef.current.onInteract(arrived);
      }
      if (!disposed && !scenePaused && !document.hidden && (keys.size > 0 || goal)) frame = window.requestAnimationFrame(tick);
      else previousTime = 0;
    };

    const wake = () => {
      if (!disposed && !scenePaused && loaded && !document.hidden && frame === null) frame = window.requestAnimationFrame(tick);
    };

    const walkTo = (point: Point, target?: OfficeTarget) => {
      if (scenePaused || !loaded || document.hidden) return;
      keys.clear();
      goal = { ...safePoint(point), target };
      if (target) {
        scene.dataset.walkingTo = target;
        announce(`Orbi está indo até ${stations.find(item => item.id === target)!.name}.`);
      } else {
        delete scene.dataset.walkingTo;
        announce("Orbi está caminhando pelo escritório.");
      }
      paint(false);
      wake();
    };

    runtimeRef.current = {
      walkTo,
      setOptions: value => {
        options = value;
        scenePaused = value.paused;
        if (value.repaired && !previousRepaired && !value.muted) pendingSuccess = true;
        previousRepaired = value.repaired;
        if (value.muted || !value.repaired) pendingSuccess = false;
        updateAudio();
        if (value.paused) release(); else paint(false);
      },
    };

    const resize = () => {
      viewWidth = scene.clientWidth;
      viewHeight = scene.clientHeight;
      scale = Math.max(viewWidth / WORLD.width, viewHeight / WORLD.height);
      const maximumCameraY = Math.max(0, WORLD.height * scale - viewHeight);
      cameraY = clamp(Math.max(maximumCameraY * 0.2, FLOOR.top * scale - (viewHeight - 90)), 0, maximumCameraY);
      floorBottom = Math.max(FLOOR.top, Math.min(FLOOR.bottom, (viewHeight - 70 + cameraY) / scale - 5));
      position.y = safePoint(position).y;
      if (goal) goal = { ...safePoint(goal), target: goal.target };
      paint(keys.size > 0 || goal !== null);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    resize();

    const onKeyDown = (event: KeyboardEvent) => {
      const focused = document.activeElement;
      const sceneHasFocus = scene.contains(focused) || focused === document.body;
      if (scenePaused || !loaded || event.ctrlKey || event.metaKey || event.altKey || !sceneHasFocus) return;
      const key = event.key.toLowerCase();
      if (movementKeys.has(key)) {
        event.preventDefault();
        keys.add(key);
        wake();
      } else if ((key === "e" || key === "enter") && !event.repeat && !(document.activeElement instanceof HTMLButtonElement)) {
        event.preventDefault();
        const closest = [...stations].sort((a, b) => Math.hypot(a.approach.x - position.x, a.approach.y - position.y) - Math.hypot(b.approach.x - position.x, b.approach.y - position.y))[0];
        walkTo(closest.approach, closest.id);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => { keys.delete(event.key.toLowerCase()); };
    const onBlur = () => release();
    const onFocusOut = (event: FocusEvent) => { if (!(event.relatedTarget instanceof Node) || !scene.contains(event.relatedTarget)) release(); };
    const onVisibility = () => { updateAudio(); if (document.hidden) release(); };
    const onAudioGesture = (event: Event) => { if (event.isTrusted) audio.unlock(); };
    const onMotionChange = () => { reducedMotion = motionQuery.matches; paint(keys.size > 0 || goal !== null); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pointerdown", onAudioGesture, true);
    window.addEventListener("keydown", onAudioGesture, true);
    scene.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    const images = [new Image(), new Image(), new Image()];
    const assets = [`${ART_ROOT}/office-v1.webp`, ORBI_ART, `${ART_ROOT}/team-v1.webp`];
    let remaining = images.length;
    images.forEach((image, index) => {
      image.onload = () => {
        remaining -= 1;
        if (!disposed && remaining === 0) {
          loaded = true;
          setAssetsReady(true);
          paint(false);
          callbacksRef.current.onReady?.();
        }
      };
      image.onerror = () => { if (!disposed) setLoadError(true); };
      image.src = assets[index];
    });

    return () => {
      disposed = true;
      release();
      observer.disconnect();
      audio.destroy();
      runtimeRef.current = null;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pointerdown", onAudioGesture, true);
      window.removeEventListener("keydown", onAudioGesture, true);
      scene.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      images.forEach(image => { image.onload = null; image.onerror = null; });
    };
  }, []);

  useEffect(() => {
    const options = { muted, paused: paused || activeTarget !== null, repaired };
    optionsRef.current = options;
    runtimeRef.current?.setOptions(options);
  }, [paused, activeTarget, muted, repaired]);

  const goToStation = (station: Station) => { runtimeRef.current?.walkTo(station.approach, station.id); };
  const onFloorTap = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button") || !event.isPrimary || event.button !== 0) return;
    const scene = sceneRef.current;
    const world = worldRef.current;
    if (!scene || !world) return;
    scene.focus({ preventScroll: true });
    const rect = world.getBoundingClientRect();
    const point = { x: (event.clientX - rect.left) / (rect.width / WORLD.width), y: (event.clientY - rect.top) / (rect.height / WORLD.height) };
    const station = stations.find(item => Math.hypot(point.x - item.position.x, point.y - item.position.y) < 95);
    if (station) goToStation(station);
    else runtimeRef.current?.walkTo(point);
  };
  const unavailable = paused || activeTarget !== null || !assetsReady;

  return (
    <div className={styles.office} data-repaired={repaired} data-muted={muted}>
      <div
        ref={sceneRef}
        className={styles.scene}
        tabIndex={0}
        role="group"
        aria-label="Escritório da equipe. Caminhe com WASD, setas ou toque no chão. Escolha uma pessoa ou o computador para interagir."
        aria-busy={!assetsReady}
        onPointerUp={onFloorTap}
      >
        <div ref={worldRef} className={styles.world}>
          <div className={styles.background} aria-hidden="true" />
          <div className={styles.monitorFeedback} aria-hidden="true" />
          {stations.map(station => (
            <button
              key={station.id}
              type="button"
              className={`${styles.hotspot} ${station.id === "computer" ? styles.computerHotspot : styles.personHotspot}`}
              style={{ "--station-x": `${station.position.x}px`, "--station-y": `${station.position.y}px`, zIndex: Math.round(station.position.y) } as CSSProperties}
              aria-label={station.label}
              disabled={unavailable}
              onClick={() => goToStation(station)}
            >
              {station.id !== "computer" && <span className={`${styles.personSprite} ${station.id === "support" ? styles.supportSprite : ""}`} aria-hidden="true" />}
              <span className={styles.stationLabel}>{station.id === "computer" ? <Monitor size={16} aria-hidden="true" /> : <MessageCircle size={16} aria-hidden="true" />}{station.name}</span>
            </button>
          ))}
          <div ref={destinationRef} className={styles.destination} hidden aria-hidden="true" />
          <div ref={playerRef} className={styles.player} aria-hidden="true">
            <span className={styles.playerShadow} />
            <span ref={spriteRef} className={styles.playerSprite} />
            <span className={styles.playerName}>Você · Orbi</span>
          </div>
        </div>
        <div className={styles.sceneTop}>
          <span className={styles.location}><span />Escritório · homologação</span>
          {assetsReady && <p className={styles.speech}>{repaired ? "Jo: O pedido de teste passou!" : briefed ? "Nina: As pistas estão no computador. Pode contar com a gente." : "Nina: Oi, Orbi! Vem conversar."}</p>}
        </div>
        {!assetsReady && <div className={styles.loading} role="status">{loadError ? "A cena não carregou. Atualize a página para tentar de novo." : "Abrindo o escritório…"}</div>}
        <div className={styles.controls} role="group" aria-label="Destinos no escritório">
          {stations.map(station => (
            <button key={station.id} type="button" className={styles.destinationButton} data-station={station.id} aria-label={station.label} disabled={unavailable} onClick={() => goToStation(station)}>
              {station.id === "computer" ? <Monitor size={18} aria-hidden="true" /> : <MessageCircle size={18} aria-hidden="true" />}
              <span>{station.name}</span>
            </button>
          ))}
        </div>
      </div>
      <p className={styles.hint}><Move size={14} aria-hidden="true" /><span>Toque no chão para caminhar. Pessoas e computador abrem com um toque.<span className={styles.keyboardHint}> Teclado: WASD ou setas · E para interagir.</span></span></p>
      <p ref={liveRef} className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true" />
    </div>
  );
}
