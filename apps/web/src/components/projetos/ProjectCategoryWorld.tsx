"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { getProjectEnvironment, type ProjectEnvironment } from "@/lib/projectEnvironments";
import type { ProjectFilter } from "@/lib/projectCatalog";
import styles from "./ProjectCategoryWorld.module.css";

type ConnectionHints = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};
type NavigatorHints = Navigator & { connection?: ConnectionHints };

const REDUCED_MOTION = 1;
const SAVE_DATA = 2;
const SMALL_MEDIA = 4;
const motionQuery = "(prefers-reduced-motion: reduce)";
const smallMediaQuery = "(max-width: 767px)";

function subscribePreferences(notify: () => void) {
  const queries = [window.matchMedia(motionQuery), window.matchMedia(smallMediaQuery)];
  const connection = (navigator as NavigatorHints).connection;
  queries.forEach((query) => query.addEventListener("change", notify));
  connection?.addEventListener?.("change", notify);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", notify));
    connection?.removeEventListener?.("change", notify);
  };
}

function readPreferences() {
  const nav = navigator as NavigatorHints;
  const reduced = window.matchMedia(motionQuery).matches;
  const saving = Boolean(nav.connection?.saveData || ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? ""));
  // Portrait media is selected by composition/viewport, never by desktop RAM.
  const small = window.matchMedia(smallMediaQuery).matches;
  return (reduced ? REDUCED_MOTION : 0) | (saving ? SAVE_DATA : 0) | (small ? SMALL_MEDIA : 0);
}

// The server always paints the poster; media preferences are resolved before a video gets a src.
const serverPreferences = () => REDUCED_MOTION | SMALL_MEDIA;
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const readDocumentVisible = () => document.visibilityState !== "hidden";
const serverDocumentVisible = () => false;

function WorldPoster({ environment, onReady, onError }: { environment: ProjectEnvironment; onReady?: () => void; onError?: () => void }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const notifyReady = useCallback(() => {
    const image = imageRef.current;
    if (!image || image.naturalWidth === 0) { onError?.(); return; }
    image.decode().then(() => onReady?.(), () => onReady?.());
  }, [onReady, onError]);

  useEffect(() => {
    if (!onReady || !imageRef.current?.complete) return;
    // A cached/SSR image may finish before React attaches its load listener.
    const frame = requestAnimationFrame(notifyReady);
    return () => cancelAnimationFrame(frame);
  }, [notifyReady, onReady]);

  return (
    <picture className={styles.poster}>
      <source media="(max-width: 767px)" srcSet={environment.media.posterMobile} />
      {/* These are pre-sized local WebP backplates, shared with the video fallback. */}
      <img ref={imageRef} src={environment.media.poster} alt="" decoding="async" onLoad={notifyReady} onError={onError} />
    </picture>
  );
}

function WorldVideo({ src, running }: { src: string; running: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!running) {
      video.pause();
      return;
    }
    let active = true;
    video.play().catch(() => {
      if (active) setBlocked(true);
    });
    return () => {
      active = false;
      video.pause();
    };
  }, [running]);

  if (failed) return null;

  return (
    <video
      ref={videoRef}
      className={styles.video}
      data-world-video={blocked ? "blocked" : ready ? "ready" : "loading"}
      data-ready={ready && !blocked}
      src={src}
      preload="metadata"
      autoPlay={running}
      loop
      muted
      playsInline
      disablePictureInPicture
      tabIndex={-1}
      onLoadedData={() => setReady(true)}
      onPlaying={() => { setBlocked(false); setReady(true); }}
      onError={() => setFailed(true)}
    />
  );
}

interface ProjectCategoryWorldProps {
  category: ProjectFilter;
  paused: boolean;
  children: ReactNode;
}

export default function ProjectCategoryWorld({ category, paused, children }: ProjectCategoryWorldProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const preferences = useSyncExternalStore(subscribePreferences, readPreferences, serverPreferences);
  const documentVisible = useSyncExternalStore(subscribeVisibility, readDocumentVisible, serverDocumentVisible);
  const [scopeVisible, setScopeVisible] = useState(false);
  const [transition, setTransition] = useState<{ category: ProjectFilter; previous: ProjectFilter | null; revision: number; posterReady: boolean; posterFailed: boolean }>({ category, previous: null, revision: 0, posterReady: false, posterFailed: false });

  // Keep only the previous poster and the latest category. Rapid choices never build a queue.
  if (transition.category !== category) {
    const lastReady = transition.posterReady && !transition.posterFailed ? transition.category : transition.previous;
    const returningToReady = lastReady === category;
    setTransition({ category, previous: returningToReady ? null : lastReady, revision: transition.revision + 1, posterReady: returningToReady, posterFailed: false });
  }

  const environment = getProjectEnvironment(category);
  const previous = transition.previous ? getProjectEnvironment(transition.previous) : null;
  const reduced = Boolean(preferences & REDUCED_MOTION);
  const saving = Boolean(preferences & SAVE_DATA);
  const smallMedia = Boolean(preferences & SMALL_MEDIA);
  const allowVideo = !reduced && !saving;
  const running = allowVideo && !paused && documentVisible && scopeVisible;
  const worldStyle = {
    "--world-accent": environment.accent,
    "--world-accent-rgb": environment.accentRgb,
    "--world-secondary": environment.secondary,
    "--project-accent": environment.accent,
    "--project-accent-rgb": environment.accentRgb,
    "--project-secondary": environment.secondary,
  } as CSSProperties;

  const settlePoster = useCallback((failed: boolean) => {
    const revision = transition.revision;
    setTransition((current) => current.category !== category || current.revision !== revision || (current.posterReady && current.posterFailed === failed)
      ? current
      : { ...current, posterReady: true, posterFailed: failed });
  }, [category, transition.revision]);
  const posterReady = useCallback(() => settlePoster(false), [settlePoster]);
  const posterFailed = useCallback(() => settlePoster(true), [settlePoster]);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setScopeVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => setScopeVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(scope);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!transition.previous || !transition.posterReady) return;
    const revision = transition.revision;
    const timeout = window.setTimeout(() => {
      setTransition((current) => current.revision === revision ? { ...current, previous: null } : current);
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [transition.posterReady, transition.previous, transition.revision]);

  useEffect(() => {
    if (transition.posterReady) return;
    // A failed or stalled image must leave a category-specific CSS fallback,
    // rather than retain the old category indefinitely.
    const timeout = window.setTimeout(posterFailed, 8000);
    return () => window.clearTimeout(timeout);
  }, [transition.posterReady, transition.revision, posterFailed]);

  return (
    <div
      ref={scopeRef}
      className={styles.worldScope}
      style={worldStyle}
      data-project-world="scope"
      data-world-category={environment.id}
      data-world-motion={allowVideo ? running ? "running" : "paused" : "static"}
      data-world-resource={smallMedia ? "mobile" : "desktop"}
    >
      <div className={styles.stage} aria-hidden="true">
        {previous && (
          <div className={`${styles.frame} ${styles.previous}`} style={{ "--world-object-position": previous.objectPosition } as CSSProperties} data-world-frame={previous.id}>
            <WorldPoster environment={previous} />
          </div>
        )}
        <div
          key={environment.id}
          className={styles.frame}
          style={{ "--world-object-position": environment.objectPosition } as CSSProperties}
          data-world-frame={environment.id}
          data-poster-pending={Boolean(previous) && !transition.posterReady}
          data-poster-failed={transition.posterFailed}
          data-entering={Boolean(previous) && transition.posterReady && allowVideo && !paused}
        >
          <WorldPoster environment={environment} onReady={posterReady} onError={posterFailed} />
          {allowVideo && scopeVisible && (
            <WorldVideo key={`${environment.id}-${smallMedia ? "mobile" : "desktop"}`} src={smallMedia ? environment.media.videoMobile : environment.media.video} running={running && transition.posterReady} />
          )}
        </div>
        <div className={styles.colorField} />
        <div className={styles.motifOne} />
        <div className={styles.motifTwo} />
        <div className={styles.veil} />
        <div className={styles.edgeFade} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
