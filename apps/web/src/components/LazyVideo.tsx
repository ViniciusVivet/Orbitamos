"use client";

import { forwardRef, useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

type LazyVideoProps = VideoHTMLAttributes<HTMLVideoElement> & { src: string };

/**
 * Vídeo de fundo decorativo que só baixa o arquivo quando chega perto da
 * viewport (IntersectionObserver + rootMargin). Evita puxar dezenas de MB de
 * vídeos abaixo da dobra no carregamento inicial. Mantém os mesmos atributos
 * (autoPlay, loop, muted, className, style) do <video> nativo.
 */
const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(function LazyVideo(
  { src, ...props },
  forwardedRef
) {
  const innerRef = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);

  const setRef = (node: HTMLVideoElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useEffect(() => {
    if (load) return;
    const el = innerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [load]);

  return <video ref={setRef} src={load ? src : undefined} preload="none" {...props} />;
});

export default LazyVideo;
