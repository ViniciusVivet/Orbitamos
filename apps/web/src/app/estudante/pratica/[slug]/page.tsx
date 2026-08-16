"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Square, RotateCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle, ArrowLeft, Code2, MessageSquare, Eye, EyeOff, Copy, Check, BookOpen, Trash2, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { getDesafio, getNextDesafio, type DesafioStep } from "@/lib/desafios";
import { runJavaScriptInWorker, runPythonInWorker, warmPythonRuntime } from "@/lib/browserCodeRunner";
import { useAuth } from "@/contexts/AuthContext";
import ReliableCodeEditor, { type ReliableCodeEditorHandle } from "@/components/estudante/ReliableCodeEditor";

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
  truncated?: boolean;
  outcome: "success" | "needs-work" | "error" | "cancelled";
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function PraticaWorkspace({ userId = null }: { userId?: string | number | null }) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const desafio = getDesafio(slug);
  const nextChallenge = getNextDesafio(slug);

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [draftRestored, setDraftRestored] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");
  const [consoleExpanded, setConsoleExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ReliableCodeEditorHandle>(null);
  const activeRunRef = useRef<AbortController | null>(null);
  const codeRef = useRef("");
  const storageKey = userId ? `orbitamos-pratica-${userId}-${slug}` : null;

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
      const initialCode = restoredCode || desafio.codigoInicial;
      codeRef.current = initialCode;
      setCode(initialCode);
      setCurrentStep(restoredStep);
      setStepStatus(restoredStatus);
      setCompleted(restoredStatus.every((status) => status === "success"));
      setDraftRestored(Boolean(restoredCode));
      setSaveStatus(restoredCode ? "saved" : "idle");
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
    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ code, currentStep, stepStatus }));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
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
    codeRef.current = nextCode;
    setCode(nextCode);
    setErrorMark(null);
    setSaveStatus("saving");
  }, []);

  const executeCode = useCallback(async () => {
    if (!desafio || running) return;
    const codeToRun = editorRef.current?.getValue() ?? codeRef.current;
    codeRef.current = codeToRun;
    setConsoleRun(null);
    setErrorMark(null);
    setShowDica(false);
    setShowSolution(false);
    setRunning(true);
    const controller = new AbortController();
    activeRunRef.current = controller;
    try {
    const result = desafio.linguagem === "python"
      ? await runPythonInWorker(codeToRun, 20000, controller.signal, desafio.testCode)
      : await runJavaScriptInWorker(codeToRun, 2500, controller.signal, desafio.testCode);
    const friendlyError = result.error
      ? explainRuntimeError(result.error, result.timedOut, desafio.linguagem)
      : "";
    const errorLine = result.errorLine ?? null;
    setConsoleRun({
      lines: result.output ? result.output.split("\n") : [],
      error: result.error && !result.cancelled ? { message: result.error, friendly: friendlyError, line: errorLine } : null,
      durationMs: result.durationMs ?? 0,
      truncated: result.truncated,
      outcome: result.cancelled ? "cancelled" : result.error ? "error" : "needs-work",
    });

    if (result.cancelled) {
      setChatMessages((previous) => [...previous, { tipo: "sistema", texto: "Execução interrompida. Seu código continua salvo para você ajustar e tentar novamente." }]);
      return;
    }

    const step = desafio.steps[currentStep];
    if (result.error && step) {
      setErrorMark({ line: errorLine, message: result.error });
      const newStatus = [...stepStatus];
      newStatus[currentStep] = "error";
      setStepStatus(newStatus);
      const lineNote = errorLine ? ` O editor marcou a linha ${errorLine} em vermelho.` : "";
      setChatMessages((previous) => [...previous, { tipo: "erro", texto: `${friendlyError}${lineNote}` }]);
      return;
    }

    if (step) {
      const passed = !result.error && step.validacao(codeToRun, result.output, result.verificationOutput);
      const newStatus = [...stepStatus];
      if (passed) {
        setConsoleRun((previous) => previous ? { ...previous, outcome: "success" } : previous);
        newStatus[currentStep] = "success";
        setStepStatus(newStatus);
        setChatMessages((prev) => [...prev, { tipo: "sucesso", texto: step.acerto }]);
        if (currentStep + 1 < desafio.steps.length) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          setTimeout(() => {
            setChatMessages((prev) => [...prev, { tipo: "sistema", texto: desafio.steps[nextStep].instrucao }]);
          }, 1000);
        } else {
          setCompleted(true);
          setTimeout(() => {
            setChatMessages((prev) => [...prev, { tipo: "sucesso", texto: "Parabéns! Você completou o desafio inteiro!" }]);
          }, 800);
        }
      } else {
        newStatus[currentStep] = "error";
        setStepStatus(newStatus);
        setChatMessages((prev) => [...prev, { tipo: "erro", texto: step.erro }]);
      }
    }
    } catch {
      setConsoleRun({
        lines: [],
        error: { message: "Falha inesperada no executor.", friendly: "Não foi possível executar agora. Seu código continua salvo; tente novamente.", line: null },
        durationMs: 0,
        outcome: "error",
      });
    } finally {
      if (activeRunRef.current === controller) activeRunRef.current = null;
      setRunning(false);
    }
  }, [currentStep, desafio, running, stepStatus]);

  const stopExecution = useCallback(() => {
    activeRunRef.current?.abort();
  }, []);

  useEffect(() => {
    if (desafio?.linguagem === "python") warmPythonRuntime();
  }, [desafio?.linguagem]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        void executeCode();
      } else if (event.key.toLowerCase() === "l") {
        event.preventDefault();
        setConsoleRun(null);
        setErrorMark(null);
      } else if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!storageKey) return;
        try {
          localStorage.setItem(storageKey, JSON.stringify({ code: codeRef.current, currentStep, stepStatus }));
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [currentStep, executeCode, stepStatus, storageKey]);

  const handleReset = () => {
    if (!desafio) return;
    if (!window.confirm("Reiniciar apaga o código e o progresso salvos neste desafio. Deseja continuar?")) return;
    if (storageKey) localStorage.removeItem(storageKey);
    codeRef.current = desafio.codigoInicial;
    setCode(desafio.codigoInicial);
    setConsoleRun(null);
    setErrorMark(null);
    setCurrentStep(0);
    setStepStatus(desafio.steps.map(() => "pending"));
    setShowDica(false);
    setCompleted(false);
    setDraftRestored(false);
    setSaveStatus("idle");
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
          <span className={`text-[10px] ${saveStatus === "error" ? "text-red-300" : "text-white/30"}`}>
            {saveStatus === "saving" ? "Salvando..." : saveStatus === "saved" ? (draftRestored ? "Rascunho restaurado · salvo" : "Salvo neste dispositivo") : saveStatus === "error" ? "Não foi possível salvar" : "Auto-save"}
          </span>
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
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 text-xs text-white/50 transition-colors hover:text-white touch-manipulation sm:justify-start sm:min-w-0 md:min-h-9"
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
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/70 transition hover:bg-white/10 touch-manipulation sm:px-3 sm:py-1.5"
            aria-label="Reiniciar"
          >
            <RotateCcw className="size-3.5 sm:size-3" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
          {running ? (
            <button type="button" onClick={stopExecution} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-400 touch-manipulation" aria-label="Interromper execução">
              <Square className="size-3.5 fill-current" />
              <span className="hidden xs:inline">Parar</span>
            </button>
          ) : (
            <button type="button" onClick={executeCode} title="Executar (Ctrl/⌘ + Enter)" className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-bold text-black transition hover:bg-emerald-400 touch-manipulation">
              <Play className="size-3.5" />
              <span className="hidden xs:inline">Executar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex border-b border-white/10 md:hidden" role="tablist" aria-label="Painéis do laboratório">
        <button
          id="practice-code-tab"
          type="button"
          onClick={() => setMobileTab("editor")}
          role="tab"
          aria-selected={mobileTab === "editor"}
          aria-controls="practice-editor-panel"
          className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition touch-manipulation ${
            mobileTab === "editor" ? "text-orbit-electric border-b-2 border-orbit-electric bg-orbit-electric/5" : "text-white/40"
          }`}
        >
          <Code2 className="size-3.5" />
          Código
        </button>
        <button
          id="practice-guide-tab"
          type="button"
          onClick={() => setMobileTab("guia")}
          role="tab"
          aria-selected={mobileTab === "guia"}
          aria-controls="practice-guide-panel"
          className={`relative flex min-h-11 flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition touch-manipulation ${
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
        <div id="practice-editor-panel" role="tabpanel" aria-labelledby="practice-code-tab" className={`min-w-0 flex-col overflow-hidden border-r border-white/10 ${mobileTab === "editor" ? "flex flex-1" : "hidden md:flex md:flex-1"}`}>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <ReliableCodeEditor
              ref={editorRef}
              language={desafio.linguagem}
              value={code}
              onChange={handleCodeChange}
              errorLine={errorMark?.line}
              errorMessage={errorMark?.message}
            />
          </div>

          {/* Console output */}
          <div className="relative z-10 border-t border-white/10 bg-[#0d1117]">
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Console</span>
              {running && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orbit-electric" />}
              {consoleRun?.outcome === "success" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              {consoleRun?.outcome === "needs-work" && <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />}
              {consoleRun?.outcome === "error" && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
              {consoleRun?.outcome === "cancelled" && <span className="h-1.5 w-1.5 rounded-full bg-white/35" />}
              {consoleRun && (
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-[9px] text-white/60">{consoleRun.durationMs} ms</span>
                  <button type="button" onClick={() => setConsoleExpanded((value) => !value)} aria-label={consoleExpanded ? "Reduzir console" : "Expandir console"} className="text-white/60 transition hover:text-white/80 md:hidden">
                    {consoleExpanded ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
                  </button>
                  <button type="button" onClick={() => navigator.clipboard.writeText([...consoleRun.lines, consoleRun.error?.message].filter(Boolean).join("\n")).catch(() => {})} aria-label="Copiar saída do console" className="text-white/60 transition hover:text-white/80">
                    <Copy className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConsoleRun(null);
                      setErrorMark(null);
                    }}
                    aria-label="Limpar console"
                    className="flex items-center gap-1 text-[9px] font-bold uppercase text-white/60 transition hover:text-white/80 touch-manipulation"
                  >
                    <Trash2 className="size-3" />
                    Limpar
                  </button>
                </span>
              )}
            </div>
            <div role="status" aria-live="polite" className={`${consoleExpanded ? "h-64" : "h-28"} min-w-0 overflow-y-auto overflow-x-hidden px-3 py-2 font-mono text-xs transition-[height] sm:h-32`}>
              {running && (
                <div className="flex items-center gap-2 font-sans text-orbit-electric/80">
                  <span className="size-3 animate-spin rounded-full border border-orbit-electric/30 border-t-orbit-electric" />
                  {desafio.linguagem === "python" ? "Preparando Python e executando seu código..." : "Executando seu código..."}
                </div>
              )}
              {!running && !consoleRun && (
                <span className="text-white/60">Clique em &quot;Executar&quot; para ver o resultado...</span>
              )}
              {consoleRun?.lines.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap leading-5 text-slate-200">
                  {line}
                </div>
              ))}
              {consoleRun && !consoleRun.error && consoleRun.lines.length === 0 && (
                <div className="leading-5 text-white/60">Execução concluída sem saída no console.</div>
              )}
              {consoleRun?.truncated && (
                <div className="mt-1 text-[10px] text-amber-300">A saída foi limitada para manter o editor rápido.</div>
              )}
              {consoleRun?.outcome === "needs-work" && !consoleRun.error && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border-l-2 border-amber-400 bg-amber-400/[0.08] px-2.5 py-2 font-sans text-[11px] text-amber-100">
                  <span>O código rodou, mas ainda não passou em todos os critérios.</span>
                  <button type="button" onClick={() => setMobileTab("guia")} className="font-bold text-amber-300 underline-offset-2 hover:underline md:hidden">
                    Ver orientação
                  </button>
                </div>
              )}
              {consoleRun?.outcome === "success" && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border-l-2 border-emerald-400 bg-emerald-400/[0.08] px-2.5 py-2 font-sans text-[11px] text-emerald-100">
                  <span>Boa! Esta etapa passou nos critérios do desafio.</span>
                  <button type="button" onClick={() => setMobileTab("guia")} className="font-bold text-emerald-300 underline-offset-2 hover:underline md:hidden">
                    Ver próximo passo
                  </button>
                </div>
              )}
              {consoleRun?.outcome === "cancelled" && (
                <div className="mt-2 rounded-md border-l-2 border-white/30 bg-white/[0.05] px-2.5 py-2 font-sans text-[11px] text-white/60">
                  Execução interrompida. Seu código não foi perdido e você pode continuar de onde parou.
                </div>
              )}
              {consoleRun?.error && (
                <div className="mt-1.5 min-w-0 rounded-md border-l-2 border-red-500 bg-red-500/[0.08] px-2.5 py-2">
                  <p className="break-words leading-5 text-red-300">
                    ✖ {consoleRun.error.line ? `Linha ${consoleRun.error.line}: ` : ""}
                    {consoleRun.error.message}
                  </p>
                  <p className="mt-1 break-words font-sans leading-5 text-amber-200/90">{consoleRun.error.friendly}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guide panel — full width mobile, sidebar desktop */}
        <div id="practice-guide-panel" role="tabpanel" aria-labelledby="practice-guide-tab" className={`flex flex-col bg-[#0d1117] ${mobileTab === "guia" ? "flex-1" : "hidden md:flex md:w-72 md:min-w-[260px] md:max-w-[320px]"}`}>
          {guiaContent}
        </div>
      </div>
    </div>
  );
}

export default function PraticaPage() {
  const { user } = useAuth();
  return <PraticaWorkspace userId={user?.id} />;
}
