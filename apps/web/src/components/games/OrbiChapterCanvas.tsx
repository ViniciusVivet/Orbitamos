"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ChapterEvent, ChapterRuntime, ChapterSceneOptions, OrbiChapterHandle } from "./orbi-chapter/types";
export type { ChapterEvent, OrbiChapterHandle } from "./orbi-chapter/types";
export type { ChapterMissionId, ChapterProgram } from "@/lib/orbiChapter";

const OrbiChapterCanvas = forwardRef<OrbiChapterHandle, ChapterSceneOptions>(function OrbiChapterCanvas(options, ref) {
  const parent = useRef<HTMLDivElement>(null);
  const runtime = useRef<ChapterRuntime | null>(null);
  const latest = useRef(options); latest.current = options;
  const ready = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useCallback((event: ChapterEvent) => {
    if (event.type === "ready" || event.type === "error") ready.current = true;
    if (event.type === "error") setError(event.message);
    latest.current.onEvent(event);
  }, []);
  useImperativeHandle(ref, () => ({
    setControl: (control, pressed) => runtime.current?.setControl(control, pressed),
    jump: () => runtime.current?.jump(), fire: () => runtime.current?.fire(), interact: () => runtime.current?.interact(),
    focus: () => runtime.current?.focus(), unlockAudio: () => runtime.current?.unlockAudio(),
  }), []);
  useEffect(() => {
    let active = true;
    const fail = () => {
      if (!active || ready.current) return;
      active = false; runtime.current?.destroy(); runtime.current = null;
      notify({ type: "error", message: "O cenário não conseguiu abrir. Seu código continua guardado. Atualize a página para tentar novamente." });
    };
    const timeout = window.setTimeout(fail, 25000);
    void import("./orbi-chapter/engine").then(async ({ createChapterGame }) => {
      if (!active || !parent.current) return;
      const created = await createChapterGame(parent.current, { ...latest.current, onEvent: notify });
      if (!active) { created.destroy(); return; }
      runtime.current = created; created.sync({ ...latest.current, onEvent: notify });
    }).catch(fail);
    return () => { active = false; window.clearTimeout(timeout); runtime.current?.destroy(); runtime.current = null; };
  }, [notify]);
  useEffect(() => { runtime.current?.sync({ ...options, onEvent: notify }); }, [options, notify]);
  return <div ref={parent} tabIndex={0} data-orbi-chapter-canvas role="group" aria-label={options.pulse ? "Cenário da Oficina do Pulso. Setas ou A e D para caminhar, espaço para pular, F ou X para disparar e E para usar o terminal." : "Cenário da Entrega do Orbi. Setas ou A e D para caminhar, espaço para pular e E para usar o terminal."} style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", minHeight: 230, maxHeight: 620, overflow: "hidden", borderRadius: 18, background: "#102737", outlineOffset: 4, touchAction: "none", userSelect: "none" }}>
    {error && <p role="alert" style={{ position: "absolute", inset: 0, zIndex: 1, margin: 0, padding: 24, color: "#f3e7cf", background: "#102737", fontSize: 14, lineHeight: 1.8 }}>{error}</p>}
  </div>;
});
export default OrbiChapterCanvas;
