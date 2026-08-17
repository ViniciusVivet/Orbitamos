"use client";

import { forwardRef, useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import usePerformanceProfile from "@/hooks/usePerformanceProfile";

type LazyVideoProps = VideoHTMLAttributes<HTMLVideoElement> & { src: string; mobileSrc?: string };

/**
 * Vídeo de fundo decorativo que só baixa o arquivo quando chega perto da
 * viewport (IntersectionObserver + rootMargin). Evita puxar dezenas de MB de
 * vídeos abaixo da dobra no carregamento inicial. Mantém os mesmos atributos
 * (autoPlay, loop, muted, className, style) do <video> nativo.
 */
const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(function LazyVideo(
  { src, mobileSrc, autoPlay = false, ...props },
  forwardedRef
) {
  const innerRef = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedSrc, setSelectedSrc] = useState(src);
  const { constrained } = usePerformanceProfile();

  const setRef = (node: HTMLVideoElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useEffect(() => {
    if (!mobileSrc) return;
    const query = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const selectSource = () => setSelectedSrc(query.matches || constrained ? mobileSrc : src);
    selectSource();
    query.addEventListener("change", selectSource);
    return () => query.removeEventListener("change", selectSource);
  }, [constrained, mobileSrc, src]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoad(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.02),
      { threshold: [0, 0.02] }
    );
    if (!load) loadObserver.observe(el);
    visibilityObserver.observe(el);
    return () => {
      loadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [load]);

  useEffect(() => {
    const video = innerRef.current;
    if (!video || !autoPlay || !load) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (visible && !document.hidden && !motionQuery.matches) video.play().catch(() => {});
      else video.pause();
    };
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    motionQuery.addEventListener("change", syncPlayback);
    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
      motionQuery.removeEventListener("change", syncPlayback);
    };
  }, [autoPlay, load, selectedSrc, visible]);

  return <video ref={setRef} src={load ? selectedSrc : undefined} preload={load ? "metadata" : "none"} {...props} />;
});

export default LazyVideo;
