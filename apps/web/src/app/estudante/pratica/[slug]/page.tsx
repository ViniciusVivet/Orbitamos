"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle, ArrowLeft, Code2, MessageSquare, Eye, EyeOff, Copy, Check, BookOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { getDesafio, getNextDesafio, type DesafioStep } from "@/lib/desafios";
import { runJavaScriptInWorker, runPythonInWorker } from "@/lib/browserCodeRunner";
import { useAuth } from "@/contexts/AuthContext";
import ReliableCodeEditor from "@/components/estudante/ReliableCodeEditor";

type MobileTab = "editor" | "guia";

function explainRuntimeError(error: string, timedOut: boolean, language: "javascript" | "typescript" | "python") {
  if (timedOut) return "A execução excedeu o limite de tempo. Procure um laço sem condição de saída ou uma tarefa que nunca termina.";
  if (/is not a function/i.test(error)) {
    return "Você chamou algo que não é uma função. Confira se o nome está certo e se não faltou declarar a função antes de usá-la.";
  }
  if (/cannot read propert(y|ies) of (undefined|null)/i.test(error)) {
    return "O código tentou acessar uma propriedade de um valor que está vazio (undefined ou null). Verifique se a variável foi preenchida antes dessa linha.";
  }
  if (/is not defined|not defined/i.test(error)) {
    return language === "python"
      ? "O código tentou usar um nome que ainda não foi definido. Confira a grafia (maiúsculas contam!) e crie a variável ou função antes de utilizá-la."
      : "O código tentou usar uma variável ou função que ainda não foi declarada. Confira a grafia (maiúsculas contam!) e a ordem das declarações.";
  }
  if (/unexpected end of (input|script)|was never closed|unexpected eof/i.test(error)) {
    return "O código terminou antes da hora: provavelmente faltou fechar uma chave }, um parêntese ) ou aspas.";
  }
  if (/already been declared/i.test(error)) {
    return "Essa variável já foi declarada antes. Com let/const você declara uma única vez; para mudar o valor, use apenas o nome (sem let/const).";
  }
  if (/assignment to constant/i.test(error)) {
    return "Você tentou mudar o valor de uma const. Se o valor precisa mudar, declare a variável com let.";
  }
  if (/indentationerror|unexpected indent|expected an indented block/i.test(error)) {
    return "A indentação do Python está inconsistente. Use quatro espaços dentro de funções, condições e laços.";
  }
  if (/syntaxerror|invalid syntax|unexpected token/i.test(error)) {
    return language === "python"
      ? "Há um erro de sintaxe. Confira os dois-pontos no fim de if/for/def, os parênteses e as aspas na linha indicada."
      : "Há um erro de sintaxe. Confira parênteses, aspas, chaves e ponto e vírgula na linha indicada.";
  }
  if (/zerodivisionerror/i.test(error)) {
    return "Aconteceu uma divisão por zero. Verifique o divisor antes de dividir (ele não pode ser 0).";
  }
  if (/indexerror/i.test(error)) {
    return "Você tentou acessar uma posição que não existe na lista. Lembre que os índices começam em 0 e vão até o tamanho - 1.";
  }
  if (/keyerror/i.test(error)) {
    return "Essa chave não existe no dicionário. Confira a grafia da chave ou use .get() para um acesso seguro.";
  }
  if (/attributeerror/i.test(error)) {
    return "Esse valor não tem o método ou atributo que você chamou. Confira o tipo da variável e o nome do método.";
  }
  if (/valueerror/i.test(error)) {
    return "Uma função recebeu um valor com formato inválido, como converter um texto que não é número com int().";
  }
  if (/typeerror/i.test(error)) {
    return "Uma operação recebeu um tipo de valor incompatível — por exemplo, somar texto com número. Confira os valores usados nessa linha.";
  }
  return `O runtime encontrou um erro: ${error}`;
}

/** Código de referência do passo atual: campo explícito ou extraído da dica ("Tente: ..."). */
function getStepReferenceCode(step: DesafioStep | undefined): string | null {
  if (!step) return null;
  if (step.codigoExemplo) return step.codigoExemplo;
  const match = step.dica.match(/^Tente:\s*(.+)$/i);
  return match ? match[1] : null;
}

const REFERENCE_PREF_KEY = "orbitamos-pratica-mostrar-referencia";

type ConsoleRun = {
  lines: string[];
  error: { message: string; friendly: string; line: number | null } | null;
  durationMs: number;
};

export default function PraticaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const desafio = getDesafio(slug);
  const nextChallenge = getNextDesafio(slug);
  const { user } = useAuth();

  const [code, setCode] = useState("");
  const [consoleRun, setConsoleRun] = useState<ConsoleRun | null>(null);
  const [errorMark, setErrorMark] = useState<{ line: number | null; message: string } | null>(null);
  const [showReference, setShowReference] = useState(true);
  const [referenceCopied, setReferenceCopied] = useState(false);
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

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(REFERENCE_PREF_KEY);
        if (stored === "0") setShowReference(false);
      } catch {
        // ignore
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleReference = useCallback(() => {
    setShowReference((value) => {
      try {
        localStorage.setItem(REFERENCE_PREF_KEY, value ? "0" : "1");
      } catch {
        // ignore
      }
      return !value;
    });
  }, []);

  const handleCodeChange = useCallback((nextCode: string) => {
    setCode(nextCode);
    setErrorMark(null);
  }, []);

  const executeCode = useCallback(async () => {
    if (!desafio || running) return;
    setConsoleRun(null);
    setErrorMark(null);
    setShowDica(false);
    setShowSolution(false);
    setRunning(true);
    const result = desafio.linguagem === "python"
      ? await runPythonInWorker(code)
      : await runJavaScriptInWorker(code);
    const friendlyError = result.error
      ? explainRuntimeError(result.error, result.timedOut, desafio.linguagem)
      : "";
    const errorLine = result.errorLine ?? null;
    setConsoleRun({
      lines: result.output ? result.output.split("\n") : [],
      error: result.error ? { message: result.error, friendly: friendlyError, line: errorLine } : null,
      durationMs: result.durationMs ?? 0,
    });

    const step = desafio.steps[currentStep];
    if (result.error && step) {
      setErrorMark({ line: errorLine, message: result.error });
      const newStatus = [...stepStatus];
      newStatus[currentStep] = "error";
      setStepStatus(newStatus);
      const lineNote = errorLine ? ` O editor marcou a linha ${errorLine} em vermelho.` : "";
      setChatMessages((previous) => [...previous, { tipo: "erro", texto: `${friendlyError}${lineNote}` }]);
      setMobileTab("guia");
      setRunning(false);
      return;
    }

    if (step) {
      const passed = !result.error && step.validacao(code, result.output);
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
    setConsoleRun(null);
    setErrorMark(null);
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

  const referenceCode = getStepReferenceCode(desafio?.steps[currentStep]);
  const handleCopyReference = useCallback(async () => {
    if (!referenceCode) return;
    try {
      await navigator.clipboard.writeText(referenceCode);
      setReferenceCopied(true);
      window.setTimeout(() => setReferenceCopied(false), 1600);
    } catch {
      // ignore
    }
  }, [referenceCode]);

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
        {(desafio.exemplo || desafio.casosTeste?.length) && (
          <details className="mt-3 rounded-xl bg-black/20 px-3 py-2">
            <summary className="cursor-pointer text-[11px] font-semibold text-white/55">
              Exemplo e critérios de validação
            </summary>
            <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
              {desafio.exemplo && (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/30 p-2.5 font-mono text-[10px] leading-5 text-white/55">
                  {desafio.exemplo}
                </pre>
              )}
              {desafio.casosTeste?.length ? (
                <ul className="space-y-1.5">
                  {desafio.casosTeste.map((testCase) => (
                    <li key={testCase} className="flex items-start gap-2 text-[10px] leading-5 text-white/45">
                      <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-orbit-electric" aria-hidden="true" />
                      {testCase}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </details>
        )}
      </div>

      {/* Código de referência do passo atual */}
      {referenceCode && !completed && (
        <div className="border-b border-white/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <BookOpen className="size-3 text-orbit-electric/70" />
              Código de referência
            </p>
            <button
              type="button"
              onClick={toggleReference}
              className="flex items-center gap-1 text-[10px] font-bold text-orbit-electric hover:text-white transition-colors touch-manipulation"
            >
              {showReference ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              {showReference ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {showReference ? (
            <div className="mt-2">
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 pr-9 font-mono text-[11px] leading-5 text-slate-200 whitespace-pre">{referenceCode}</pre>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  aria-label="Copiar código de referência"
                  className="absolute right-1.5 top-1.5 rounded-md border border-white/10 bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white touch-manipulation"
                >
                  {referenceCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-white/30">
                Digite o código observando cada parte. Quando pegar o jeito, oculte e tente de cabeça.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[10px] leading-4 text-white/35">
              Modo desafio: escreva de memória. Se travar, é só mostrar de novo — faz parte do aprendizado.
            </p>
          )}
        </div>
      )}

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
            <Link href={nextChallenge ? `/estudante/pratica/${nextChallenge.slug}` : "/estudante/pratica"} className="mt-2 inline-flex items-center gap-1 text-xs text-orbit-electric hover:underline">
              {nextChallenge ? `Próximo: ${nextChallenge.titulo}` : "Ver mais desafios"} <ChevronRight className="size-3" />
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
            type="button"
            onClick={handleReset}
            className="flex shrink-0 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 p-2 sm:px-3 sm:py-1.5 text-xs text-white/70 transition hover:bg-white/10 touch-manipulation min-h-[36px]"
            aria-label="Reiniciar"
          >
            <RotateCcw className="size-3.5 sm:size-3" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
          <button
            type="button"
            onClick={executeCode}
            disabled={running}
            aria-busy={running}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 sm:px-4 py-2 sm:py-1.5 text-xs font-bold text-black transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60 touch-manipulation min-h-[36px]"
          >
            <Play className="size-3.5 sm:size-3" />
            <span className="hidden xs:inline">{running ? "Executando..." : "Executar"}</span>
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex border-b border-white/10 md:hidden" role="tablist" aria-label="Painéis do laboratório">
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          role="tab"
          aria-selected={mobileTab === "editor"}
          aria-controls="practice-editor-panel"
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition touch-manipulation ${
            mobileTab === "editor" ? "text-orbit-electric border-b-2 border-orbit-electric bg-orbit-electric/5" : "text-white/40"
          }`}
        >
          <Code2 className="size-3.5" />
          Código
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("guia")}
          role="tab"
          aria-selected={mobileTab === "guia"}
          aria-controls="practice-guide-panel"
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
        <div id="practice-editor-panel" role="tabpanel" className={`flex flex-col border-r border-white/10 ${mobileTab === "editor" ? "flex-1" : "hidden md:flex md:flex-1"}`}>
          <div className="flex-1 min-h-0">
            <ReliableCodeEditor
              language={desafio.linguagem}
              value={code}
              onChange={handleCodeChange}
              errorLine={errorMark?.line}
              errorMessage={errorMark?.message}
            />
          </div>

          {/* Console output */}
          <div className="border-t border-white/10 bg-[#0d1117]">
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Console</span>
              {consoleRun && !consoleRun.error && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              {consoleRun?.error && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
              {consoleRun && (
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-[9px] text-white/25">{consoleRun.durationMs} ms</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConsoleRun(null);
                      setErrorMark(null);
                    }}
                    aria-label="Limpar console"
                    className="flex items-center gap-1 text-[9px] font-bold uppercase text-white/30 transition hover:text-white/70 touch-manipulation"
                  >
                    <Trash2 className="size-3" />
                    Limpar
                  </button>
                </span>
              )}
            </div>
            <div role="status" aria-live="polite" className="h-24 sm:h-32 overflow-auto px-3 py-2 font-mono text-xs">
              {!consoleRun && (
                <span className="text-white/25">Clique em &quot;Executar&quot; para ver o resultado...</span>
              )}
              {consoleRun?.lines.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap leading-5 text-slate-200">
                  {line}
                </div>
              ))}
              {consoleRun && !consoleRun.error && consoleRun.lines.length === 0 && (
                <div className="leading-5 text-white/30">Execução concluída sem saída no console.</div>
              )}
              {consoleRun?.error && (
                <div className="mt-1.5 rounded-md border-l-2 border-red-500 bg-red-500/[0.08] px-2.5 py-2">
                  <p className="leading-5 text-red-300">
                    ✖ {consoleRun.error.line ? `Linha ${consoleRun.error.line}: ` : ""}
                    {consoleRun.error.message}
                  </p>
                  <p className="mt-1 font-sans leading-5 text-amber-200/90">{consoleRun.error.friendly}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guide panel — full width mobile, sidebar desktop */}
        <div id="practice-guide-panel" role="tabpanel" className={`flex flex-col bg-[#0d1117] ${mobileTab === "guia" ? "flex-1" : "hidden md:flex md:w-72 md:min-w-[260px] md:max-w-[320px]"}`}>
          {guiaContent}
        </div>
      </div>
    </div>
  );
}
