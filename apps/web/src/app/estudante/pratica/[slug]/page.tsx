"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getDesafio } from "@/lib/desafios";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="size-4 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
        Carregando editor...
      </div>
    </div>
  ),
});

export default function PraticaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const desafio = getDesafio(slug);

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<("pending" | "success" | "error")[]>([]);
  const [chatMessages, setChatMessages] = useState<{ tipo: "sistema" | "sucesso" | "erro" | "dica"; texto: string }[]>([]);
  const [showDica, setShowDica] = useState(false);
  const [completed, setCompleted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!desafio) return;
    setCode(desafio.codigoInicial);
    setStepStatus(desafio.steps.map(() => "pending"));
    setChatMessages([
      { tipo: "sistema", texto: `Desafio: ${desafio.titulo}` },
      { tipo: "sistema", texto: desafio.steps[0].instrucao },
    ]);
  }, [desafio]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const executeCode = useCallback(() => {
    if (!desafio) return;

    setOutput("");
    setShowDica(false);

    // Execute in a sandboxed way using Function constructor
    const logs: string[] = [];
    const fakeConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
      },
      error: (...args: unknown[]) => {
        logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
      },
      warn: (...args: unknown[]) => {
        logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
      },
    };

    try {
      const fn = new Function("console", code);
      fn(fakeConsole);
    } catch (e: unknown) {
      logs.push(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    }

    const resultOutput = logs.join("\n");
    setOutput(resultOutput);

    // Validate current step
    const step = desafio.steps[currentStep];
    if (step) {
      const passed = step.validacao(code, resultOutput);
      const newStatus = [...stepStatus];

      if (passed) {
        newStatus[currentStep] = "success";
        setStepStatus(newStatus);
        setChatMessages((prev) => [...prev, { tipo: "sucesso", texto: step.acerto }]);

        if (currentStep + 1 < desafio.steps.length) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev,
              { tipo: "sistema", texto: desafio.steps[nextStep].instrucao },
            ]);
          }, 1000);
        } else {
          setCompleted(true);
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev,
              { tipo: "sucesso", texto: "Parabens! Voce completou o desafio inteiro!" },
            ]);
          }, 800);
        }
      } else {
        newStatus[currentStep] = "error";
        setStepStatus(newStatus);
        setChatMessages((prev) => [...prev, { tipo: "erro", texto: step.erro }]);
      }
    }
  }, [code, currentStep, desafio, stepStatus]);

  const handleReset = () => {
    if (!desafio) return;
    setCode(desafio.codigoInicial);
    setOutput("");
    setCurrentStep(0);
    setStepStatus(desafio.steps.map(() => "pending"));
    setShowDica(false);
    setCompleted(false);
    setChatMessages([
      { tipo: "sistema", texto: `Desafio reiniciado: ${desafio.titulo}` },
      { tipo: "sistema", texto: desafio.steps[0].instrucao },
    ]);
  };

  if (!desafio) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Desafio nao encontrado.</p>
          <Link href="/estudante/aulas" className="mt-3 inline-block text-orbit-electric hover:underline">
            Voltar para aulas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-semibold text-white">{desafio.titulo}</span>
          <span className="rounded-full bg-orbit-electric/15 px-2 py-0.5 text-[10px] font-bold uppercase text-orbit-electric">
            {desafio.linguagem}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="size-3" />
            Reiniciar
          </button>
          <button
            onClick={executeCode}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/90 px-4 py-1.5 text-xs font-bold text-black transition hover:bg-emerald-400"
          >
            <Play className="size-3" />
            Executar
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor + Console (80%) */}
        <div className="flex flex-1 flex-col border-r border-white/10">
          {/* Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={desafio.linguagem}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Console output */}
          <div className="border-t border-white/10 bg-[#0d1117]">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Console</span>
              {output && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <pre className="h-28 overflow-auto px-4 py-2 font-mono text-xs text-emerald-300/90 whitespace-pre-wrap">
              {output || <span className="text-white/25">Clique em "Executar" para ver o resultado...</span>}
            </pre>
          </div>
        </div>

        {/* Chat/Guide panel (20%) */}
        <div className="flex w-72 min-w-[260px] max-w-[320px] flex-col bg-[#0d1117]">
          {/* Checklist */}
          <div className="border-b border-white/10 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">Progresso</p>
            <div className="space-y-1.5">
              {desafio.steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    i === currentStep && !completed
                      ? "bg-orbit-electric/10 text-orbit-electric"
                      : stepStatus[i] === "success"
                      ? "text-emerald-400"
                      : "text-white/40"
                  }`}
                >
                  {stepStatus[i] === "success" ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : stepStatus[i] === "error" ? (
                    <XCircle className="size-3.5 shrink-0 text-red-400" />
                  ) : (
                    <span className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${
                      i === currentStep ? "border-orbit-electric" : "border-white/20"
                    }`}>
                      <span className="text-[8px]">{i + 1}</span>
                    </span>
                  )}
                  <span className="truncate">{step.instrucao.slice(0, 40)}...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  msg.tipo === "sistema"
                    ? "bg-white/5 text-white/80"
                    : msg.tipo === "sucesso"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                    : msg.tipo === "erro"
                    ? "bg-red-500/10 border border-red-500/20 text-red-300"
                    : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                }`}
              >
                {msg.tipo === "sistema" && <ChevronRight className="inline size-3 mr-1 text-orbit-electric" />}
                {msg.texto}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Dica button */}
          {!completed && (
            <div className="border-t border-white/10 p-3">
              {showDica ? (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-300">
                  <Lightbulb className="inline size-3 mr-1" />
                  {desafio.steps[currentStep]?.dica}
                </div>
              ) : (
                <button
                  onClick={() => setShowDica(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 transition hover:bg-amber-500/10"
                >
                  <Lightbulb className="size-3" />
                  Preciso de uma dica
                </button>
              )}
            </div>
          )}

          {/* Completion */}
          {completed && (
            <div className="border-t border-white/10 p-3">
              <div className="rounded-lg bg-gradient-to-r from-orbit-electric/20 to-orbit-purple/20 border border-orbit-electric/30 p-3 text-center">
                <p className="text-sm font-bold text-white">Desafio Completo!</p>
                <p className="mt-1 text-[11px] text-white/60">Todos os passos concluidos.</p>
                <Link
                  href="/estudante/aulas"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-orbit-electric hover:underline"
                >
                  Voltar para aulas <ChevronRight className="size-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
