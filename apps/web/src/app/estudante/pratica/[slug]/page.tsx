"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle, ArrowLeft, Code2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getDesafio } from "@/lib/desafios";
import { runJavaScriptInWorker, runPythonInWorker } from "@/lib/browserCodeRunner";
import { useAuth } from "@/contexts/AuthContext";
import ReliableCodeEditor from "@/components/estudante/ReliableCodeEditor";

type MobileTab = "editor" | "guia";

export default function PraticaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const desafio = getDesafio(slug);
  const { user } = useAuth();

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<("pending" | "success" | "error")[]>([]);
  const [chatMessages, setChatMessages] = useState<{ tipo: "sistema" | "sucesso" | "erro" | "dica"; texto: string }[]>([]);
  const [showDica, setShowDica] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [running, setRunning] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const storageKey = user?.id ? `orbitamos-pratica-${user.id}-${slug}` : null;

  useEffect(() => {
    if (!desafio) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let restoredCode = "";
      let restoredStep = 0;
      let restoredStatus: ("pending" | "success" | "error")[] = desafio.steps.map(() => "pending");
      if (storageKey) {
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored) as {
              code?: string;
              currentStep?: number;
              stepStatus?: ("pending" | "success" | "error")[];
            };
            restoredCode = parsed.code ?? "";
            restoredStep = Math.min(Math.max(parsed.currentStep ?? 0, 0), desafio.steps.length - 1);
            if (parsed.stepStatus?.length === desafio.steps.length) restoredStatus = parsed.stepStatus;
          }
        } catch {
          // ignore
        }
      }
      setCode(restoredCode || desafio.codigoInicial);
      setCurrentStep(restoredStep);
      setStepStatus(restoredStatus);
      setCompleted(restoredStatus.every((status) => status === "success"));
      setDraftRestored(Boolean(restoredCode));
      setChatMessages([
        { tipo: "sistema", texto: `Desafio: ${desafio.titulo}` },
        { tipo: "sistema", texto: desafio.steps[restoredStep].instrucao },
      ]);
    });
    return () => {
      active = false;
    };
  }, [desafio, storageKey]);

  useEffect(() => {
    if (!storageKey || !desafio || !code) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify({ code, currentStep, stepStatus }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [code, currentStep, desafio, stepStatus, storageKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const executeCode = useCallback(async () => {
    if (!desafio || running) return;
    setOutput("");
    setShowDica(false);
    setShowSolution(false);
    setRunning(true);
    const result = desafio.linguagem === "python"
      ? await runPythonInWorker(code)
      : await runJavaScriptInWorker(code);
    const resultOutput = [result.output, result.error ? `Erro: ${result.error}` : ""].filter(Boolean).join("\n");
    setOutput(`${resultOutput || "Execução concluída sem saída."}\n\nTempo: ${result.durationMs ?? 0} ms`);

    const step = desafio.steps[currentStep];
    if (step) {
      const passed = !result.error && step.validacao(code, resultOutput);
      const newStatus = [...stepStatus];
      if (passed) {
        newStatus[currentStep] = "success";
        setStepStatus(newStatus);
        setChatMessages((prev) => [...prev, { tipo: "sucesso", texto: step.acerto }]);
        if (currentStep + 1 < desafio.steps.length) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          setTimeout(() => {
            setChatMessages((prev) => [...prev, { tipo: "sistema", texto: desafio.steps[nextStep].instrucao }]);
            setMobileTab("guia");
          }, 1000);
        } else {
          setCompleted(true);
          setTimeout(() => {
            setChatMessages((prev) => [...prev, { tipo: "sucesso", texto: "Parabéns! Você completou o desafio inteiro!" }]);
            setMobileTab("guia");
          }, 800);
        }
      } else {
        newStatus[currentStep] = "error";
        setStepStatus(newStatus);
        setChatMessages((prev) => [...prev, { tipo: "erro", texto: step.erro }]);
      }
    }
    setRunning(false);
  }, [code, currentStep, desafio, running, stepStatus]);

  const handleReset = () => {
    if (!desafio) return;
    if (!window.confirm("Reiniciar apaga o código e o progresso salvos neste desafio. Deseja continuar?")) return;
    if (storageKey) localStorage.removeItem(storageKey);
    setCode(desafio.codigoInicial);
    setOutput("");
    setCurrentStep(0);
    setStepStatus(desafio.steps.map(() => "pending"));
    setShowDica(false);
    setCompleted(false);
    setDraftRestored(false);
    setChatMessages([
      { tipo: "sistema", texto: `Desafio reiniciado: ${desafio.titulo}` },
      { tipo: "sistema", texto: desafio.steps[0].instrucao },
    ]);
  };

  if (!desafio) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Desafio não encontrado.</p>
          <Link href="/estudante/pratica" className="mt-3 inline-block text-orbit-electric hover:underline">
            Voltar para desafios
          </Link>
        </div>
      </div>
    );
  }

  const guiaContent = (
    <div className="flex flex-col h-full">
      {/* Checklist */}
      <div className="border-b border-white/10 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Progresso</p>
          <span className="text-[10px] text-white/30">{draftRestored ? "Rascunho restaurado" : "Auto-save"}</span>
        </div>
        <div className="space-y-1.5">
          {desafio.steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                i === currentStep && !completed
                  ? "bg-orbit-electric/10 text-orbit-electric"
                  : stepStatus[i] === "success" ? "text-emerald-400" : "text-white/40"
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
              <span className="line-clamp-1 text-[11px]">{step.instrucao}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {desafio.dificuldade && <span className="rounded-full bg-white/[.05] px-2 py-1 text-[9px] font-bold uppercase text-white/40">{desafio.dificuldade}</span>}
          {desafio.categoria && <span className="rounded-full bg-orbit-purple/10 px-2 py-1 text-[9px] font-bold uppercase text-orbit-purple">{desafio.categoria}</span>}
          {desafio.minutos && <span className="rounded-full bg-white/[.05] px-2 py-1 text-[9px] text-white/35">~{desafio.minutos} min</span>}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
              msg.tipo === "sistema" ? "bg-white/5 text-white/80"
                : msg.tipo === "sucesso" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                : msg.tipo === "erro" ? "bg-red-500/10 border border-red-500/20 text-red-300"
                : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
            }`}
          >
            {msg.tipo === "sistema" && <ChevronRight className="inline size-3 mr-1 text-orbit-electric" />}
            {msg.texto}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Dica / Completion */}
      {!completed ? (
        <div className="border-t border-white/10 p-3">
          {showDica ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-300">
                <Lightbulb className="inline size-3 mr-1" />
                {desafio.steps[currentStep]?.dica}
              </div>
              {desafio.solucao && (
                <button type="button" onClick={() => setShowSolution((value) => !value)} className="w-full text-center text-[10px] font-bold text-white/35 hover:text-white/60">
                  {showSolution ? "Ocultar solução de referência" : "Ainda estou travado — ver solução"}
                </button>
              )}
              {showSolution && desafio.solucao && (
                <pre className="max-h-40 overflow-auto rounded-lg bg-black/40 p-3 text-[10px] leading-5 text-white/55 whitespace-pre-wrap">{desafio.solucao}</pre>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowDica(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-400 transition hover:bg-amber-500/10 touch-manipulation min-h-[44px]"
            >
              <Lightbulb className="size-3.5" />
              Preciso de uma dica
            </button>
          )}
        </div>
      ) : (
        <div className="border-t border-white/10 p-3">
          <div className="rounded-lg bg-gradient-to-r from-orbit-electric/20 to-orbit-purple/20 border border-orbit-electric/30 p-3 text-center">
            <p className="text-sm font-bold text-white">Desafio Completo!</p>
            <p className="mt-1 text-[11px] text-white/60">Todos os passos concluídos.</p>
            <Link href="/estudante/pratica" className="mt-2 inline-flex items-center gap-1 text-xs text-orbit-electric hover:underline">
              Ver mais desafios <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
      {/* Top bar — compacto no mobile */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#161b22] px-3 py-2 sm:px-4">
        <button
          onClick={() => router.back()}
          className="flex shrink-0 items-center gap-1 text-xs text-white/50 hover:text-white transition-colors touch-manipulation min-h-[36px] min-w-[36px] justify-center sm:justify-start sm:min-w-0"
        >
          <ArrowLeft className="size-4 sm:size-3.5" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />
        <span className="truncate text-xs sm:text-sm font-semibold text-white">{desafio.titulo}</span>
        <span className="hidden sm:inline rounded-full bg-orbit-electric/15 px-2 py-0.5 text-[10px] font-bold uppercase text-orbit-electric">
          {desafio.linguagem}
        </span>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleReset}
            className="flex shrink-0 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 p-2 sm:px-3 sm:py-1.5 text-xs text-white/70 transition hover:bg-white/10 touch-manipulation min-h-[36px]"
            aria-label="Reiniciar"
          >
            <RotateCcw className="size-3.5 sm:size-3" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
          <button
            onClick={executeCode}
            disabled={running}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 sm:px-4 py-2 sm:py-1.5 text-xs font-bold text-black transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60 touch-manipulation min-h-[36px]"
          >
            <Play className="size-3.5 sm:size-3" />
            <span className="hidden xs:inline">{running ? "Executando..." : "Executar"}</span>
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex border-b border-white/10 md:hidden">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition touch-manipulation ${
            mobileTab === "editor" ? "text-orbit-electric border-b-2 border-orbit-electric bg-orbit-electric/5" : "text-white/40"
          }`}
        >
          <Code2 className="size-3.5" />
          Código
        </button>
        <button
          onClick={() => setMobileTab("guia")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition touch-manipulation relative ${
            mobileTab === "guia" ? "text-orbit-purple border-b-2 border-orbit-purple bg-orbit-purple/5" : "text-white/40"
          }`}
        >
          <MessageSquare className="size-3.5" />
          Guia
          {chatMessages.length > 2 && mobileTab !== "guia" && (
            <span className="absolute right-1/4 top-1 size-2 rounded-full bg-orbit-electric" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor + Console — full width mobile, 80% desktop */}
        <div className={`flex flex-col border-r border-white/10 ${mobileTab === "editor" ? "flex-1" : "hidden md:flex md:flex-1"}`}>
          <div className="flex-1 min-h-0">
            <ReliableCodeEditor
              language={desafio.linguagem}
              value={code}
              onChange={setCode}
            />
          </div>

          {/* Console output */}
          <div className="border-t border-white/10 bg-[#0d1117]">
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Console</span>
              {output && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
            <pre className="h-20 sm:h-28 overflow-auto px-3 py-2 font-mono text-xs text-emerald-300/90 whitespace-pre-wrap">
              {output || <span className="text-white/25">Clique em &quot;Executar&quot; para ver o resultado...</span>}
            </pre>
          </div>
        </div>

        {/* Guide panel — full width mobile, sidebar desktop */}
        <div className={`flex flex-col bg-[#0d1117] ${mobileTab === "guia" ? "flex-1" : "hidden md:flex md:w-72 md:min-w-[260px] md:max-w-[320px]"}`}>
          {guiaContent}
        </div>
      </div>
    </div>
  );
}
