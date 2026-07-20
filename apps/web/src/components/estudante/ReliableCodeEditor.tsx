"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AlertTriangle, Code2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => null,
});

export default function ReliableCodeEditor({
  value,
  language,
  onChange,
}: {
  value: string;
  language: "javascript" | "typescript" | "python";
  onChange: (value: string) => void;
}) {
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let active = true;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

    if (mobile) {
      queueMicrotask(() => {
        if (active) setFallback(true);
      });
      return () => {
        active = false;
      };
    }

    const timer = window.setTimeout(() => {
      if (active && !ready) setFallback(true);
    }, 8000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [ready]);

  if (fallback) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#0d1117]">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] text-white/35">
          <AlertTriangle className="size-3 text-amber-300" />
          Editor compatível ativado
        </div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Editor de código"
          className="min-h-0 flex-1 resize-none bg-[#0d1117] p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0">
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#0d1117]">
          <div className="text-center">
            <Code2 className="mx-auto size-6 text-orbit-electric/60" />
            <p className="mt-3 text-xs font-semibold text-white/45">Preparando editor...</p>
            <button type="button" onClick={() => setFallback(true)} className="mt-3 text-[10px] font-bold text-orbit-electric hover:underline">
              Usar editor compatível
            </button>
          </div>
        </div>
      )}
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onMount={() => setReady(true)}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          lineNumbers: "on",
          automaticLayout: true,
          tabSize: language === "python" ? 4 : 2,
          wordWrap: "on",
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          quickSuggestions: true,
        }}
      />
    </div>
  );
}
