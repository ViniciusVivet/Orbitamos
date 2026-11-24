"use client";

import { useParams } from "next/navigation";
import { Suspense, useState, useRef, useCallback, useEffect, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Play, Square, RotateCcw, ChevronRight, Lightbulb, CheckCircle2, XCircle, ArrowLeft, Code2, MessageSquare, Eye, EyeOff, Copy, Check, BookOpen, Trash2, Maximize2, Minimize2, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { getDesafio, getNextDesafio, type DesafioStep } from "@/lib/desafios";
import { runCSharpInWorker, runJavaScriptInWorker, runPythonInWorker, warmPythonRuntime } from "@/lib/browserCodeRunner";
import { useAuth } from "@/contexts/AuthContext";
import ReliableCodeEditor, { type ReliableCodeEditorHandle } from "@/components/estudante/ReliableCodeEditor";
import lab from "@/components/estudante/Laboratory.module.css";
import free from "./FreePracticeWorkspace.module.css";
import GuidedPractice from "@/components/estudante/GuidedPractice";
import PracticeOrigin from "@/components/estudante/PracticeOrigin";
import { academyPreviewHref } from "@/lib/portalNavigation";
import PracticeHandoffChoice from "@/components/estudante/PracticeHandoffChoice";
import { freePracticeStorageKey, freshFreePracticeDraft, practiceCodeHistoryKey, practiceHandoffDecision, readFreePracticeDraft, readPracticeCodeHistory, storePracticeProgram, type FreePracticeDraft, type PracticeCodeHistory } from "@/lib/practiceHandoff";
import BeginnerPractice from "@/components/estudante/BeginnerPractice";
import { supportsBeginnerPractice } from "@/lib/beginnerPractice";

type ChatMessage = { tipo: "sistema" | "sucesso" | "erro" | "dica"; texto: string };

function appendPedagogicalMessage(previous: ChatMessage[], message: ChatMessage): ChatMessage[] {
  const withoutStaleErrors = message.tipo === "erro" || message.tipo === "sucesso"
    ? previous.filter((item) => item.tipo !== "erro")
    : previous;
  const last = withoutStaleErrors.at(-1);
  if (last?.tipo === message.tipo && last.texto === message.texto) return withoutStaleErrors;
  return [...withoutStaleErrors, message].slice(-8);
}

function explainRuntimeError(error: string, timedOut: boolean, language: "javascript" | "typescript" | "python" | "csharp") {
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

function getConceptualHint(step: DesafioStep | undefined): string {
  if (!step) return "Volte à missão e identifique qual valor precisa existir antes da próxima instrução.";
  if (/^Tente:\s*/i.test(step.dica)) {
    return "Quebre a missão em uma ação por linha: primeiro crie o valor necessário, depois use ou mostre esse valor. Escreva uma versão sua antes de revelar a referência.";
  }
  return step.dica;
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

export function PraticaWorkspace({ userId = null, preview = false }: { userId?: string | number | null; preview?: boolean }) {
  const params = useParams();
  const challenge = getDesafio(params.slug as string);
  const modeKey = `orbitamos-practice-mode-${userId}-${params.slug}`;
  const [mode, setMode] = useState<{ key: string; free: boolean } | null>(null);
  const [pending, setPending] = useState<{ code: string; existingCode: string } | null>(null);
  const [handoffError, setHandoffError] = useState("");
  const [entryDraft, setEntryDraft] = useState<FreePracticeDraft | null>(null);
  const free = mode?.key === modeKey ? mode.free : null;
  useEffect(() => {
    queueMicrotask(() => {
      setPending(null); setEntryDraft(null); setHandoffError("");
      try { setMode({ key: modeKey, free: localStorage.getItem(modeKey) === "free" }); }
      catch { setMode({ key: modeKey, free: false }); }
    });
  }, [modeKey]);
  const chooseMode = (value: boolean) => {
    try { localStorage.setItem(modeKey, value ? "free" : "guided"); } catch { /* Keep the in-memory choice if storage is unavailable. */ }
    setPending(null); setMode({ key: modeKey, free: value });
  };
  const importGuidedCode = (code: string) => {
    if (!challenge) return;
    const next = freshFreePracticeDraft(code, challenge.steps.length);
    try {
      if (userId != null) storePracticeProgram(localStorage, freePracticeStorageKey(userId, challenge.slug), practiceCodeHistoryKey(userId, challenge.slug), next, "guided");
      setEntryDraft(next); setHandoffError(""); chooseMode(true);
    } catch {
      setHandoffError("Não foi possível guardar uma versão segura. Seu rascunho livre anterior continua intacto. Você pode retomá-lo ou voltar à atividade para copiar seu programa.");
    }
  };
  const requestFreeMode = (code?: string) => {
    if (!challenge || typeof code !== "string" || !code.trim()) { setEntryDraft(null); chooseMode(true); return; }
    try {
      const raw = userId != null ? localStorage.getItem(freePracticeStorageKey(userId, challenge.slug)) : null;
      const existing = readFreePracticeDraft(raw, challenge.steps.length);
      const decision = practiceHandoffDecision(code, existing, challenge.codigoInicial);
      if (decision === "same") { setEntryDraft(null); chooseMode(true); }
      else if (decision === "choose" || raw && !existing) { setHandoffError(""); setPending({ code, existingCode: existing?.code ?? raw ?? "" }); }
      else { setPending({ code, existingCode: existing?.code ?? "" }); importGuidedCode(code); }
    } catch {
      setPending({ code, existingCode: "" });
      setHandoffError("Não foi possível ler o rascunho livre com segurança. O código desta atividade permanece guardado; você pode voltar e copiá-lo antes de continuar.");
    }
  };
  if (!challenge) return <p>Desafio não encontrado. <Link href={preview ? academyPreviewHref("/estudante/pratica") : "/estudante/pratica"}>Voltar ao laboratório</Link></p>;
  if (free === null) return <p role="status">Abrindo seu laboratório…</p>;
  if (pending) return <PracticeHandoffChoice guidedCode={pending.code} existingCode={pending.existingCode} error={handoffError} onImport={() => importGuidedCode(pending.code)} onKeep={() => { setEntryDraft(null); chooseMode(true); }} onCancel={() => { setPending(null); setHandoffError(""); }}/ >;
  if (!free) return <><Suspense fallback={null}><PracticeOrigin/></Suspense><GuidedPractice key={`${userId}-${challenge.slug}`} challenge={challenge} userId={userId} preview={preview} onFreeMode={requestFreeMode}/></>;
  return <FreePracticeWorkspace key={`${userId}-${challenge.slug}`} userId={userId} preview={preview} initialDraft={entryDraft} onGuidedMode={() => { setEntryDraft(null); chooseMode(false); }}/ >;
}

function FreePracticeWorkspace({ userId = null, preview = false, initialDraft = null, onGuidedMode }: { userId?: string | number | null; preview?: boolean; initialDraft?: FreePracticeDraft | null; onGuidedMode: () => void }) {
  const link = (href: string) => preview ? academyPreviewHref(href) : href;
  const params = useParams();
  const slug = params.slug as string;
  const desafio = getDesafio(slug);
  const nextChallenge = getNextDesafio(slug);

  const [code, setCode] = useState("");
  const [consoleRun, setConsoleRun] = useState<ConsoleRun | null>(null);
  const [errorMark, setErrorMark] = useState<{ line: number | null; message: string } | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [referenceCopied, setReferenceCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<("pending" | "success" | "error")[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showDica, setShowDica] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [applicationValidated, setApplicationValidated] = useState(false);
  const [running, setRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [draftRestored, setDraftRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [versions, setVersions] = useState<PracticeCodeHistory>({ version: 1, source: null, entries: [] });
  const [versionError, setVersionError] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [consoleExpanded, setConsoleExpanded] = useState(false);
  const [stepAttempts, setStepAttempts] = useState<number[]>([]);
  const [reflection, setReflection] = useState("");
  const [pythonRuntimeStatus, setPythonRuntimeStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [guideWidth, setGuideWidth] = useState(320);
  const [consoleHeight, setConsoleHeight] = useState(156);
  const [workspaceHeight, setWorkspaceHeight] = useState<number | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ReliableCodeEditorHandle>(null);
  const activeRunRef = useRef<AbortController | null>(null);
  const codeRef = useRef("");
  const hydratedRef = useRef(false);
  const preserveUnreadDraft = useRef(false);
  const latestDraft = useRef<FreePracticeDraft>(freshFreePracticeDraft("", 0));
  const storageKey = userId != null ? freePracticeStorageKey(userId, slug) : null;
  const historyKey = userId != null ? practiceCodeHistoryKey(userId, slug) : null;
  const applicationRequired = supportsBeginnerPractice(slug);

  latestDraft.current = { code, currentStep, stepStatus, stepAttempts, reflection };

  const persistFreeState = useCallback((draft: FreePracticeDraft) => {
    if (!storageKey || !historyKey) return;
    try {
      if (preserveUnreadDraft.current) {
        const history = storePracticeProgram(localStorage, storageKey, historyKey, draft, "restored");
        preserveUnreadDraft.current = false; setVersions(history);
      } else localStorage.setItem(storageKey, JSON.stringify(draft));
      setSaveStatus("saved");
    } catch { setSaveStatus("error"); }
  }, [storageKey, historyKey]);

  useEffect(() => {
    if (!desafio) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let restored = initialDraft;
      let readable = true;
      if (storageKey) {
        try {
          const stored = localStorage.getItem(storageKey);
          restored ??= readFreePracticeDraft(stored, desafio.steps.length);
          if (stored && !restored) { readable = false; preserveUnreadDraft.current = true; setVersionError("O rascunho anterior não pôde ser restaurado. Ele será preservado como versão antes de salvar suas novas alterações."); }
          if (historyKey) setVersions(readPracticeCodeHistory(localStorage.getItem(historyKey)));
        } catch {
          readable = false; preserveUnreadDraft.current = true;
          setVersionError("Não foi possível ler o armazenamento. Seu código pode ser editado, mas copie-o antes de sair se o salvamento falhar.");
        }
      }
      const next = restored ?? freshFreePracticeDraft(desafio.codigoInicial, desafio.steps.length);
      codeRef.current = next.code;
      latestDraft.current = next;
      setCode(next.code);
      setCurrentStep(next.currentStep);
      setStepStatus(next.stepStatus);
      setStepAttempts(next.stepAttempts);
      setReflection(next.reflection);
      setCompleted(next.stepStatus.every((status) => status === "success"));
      setDraftRestored(!!restored);
      setSaveStatus(!readable ? "error" : restored ? "saved" : "idle");
      setCanPersist(readable); hydratedRef.current = true; setHydrated(true);
      setChatMessages([
        { tipo: "sistema", texto: `Desafio: ${desafio.titulo}` },
        { tipo: "sistema", texto: desafio.steps[next.currentStep].instrucao },
      ]);
    });
    return () => {
      active = false;
    };
  }, [desafio, storageKey, historyKey, initialDraft]);

  useEffect(() => {
    if (!storageKey || !desafio || !hydrated || !canPersist) return;
    setSaveStatus("saving");
    const timer = window.setTimeout(() => persistFreeState({ code, currentStep, stepStatus, stepAttempts, reflection }), 350);
    return () => window.clearTimeout(timer);
  }, [code, currentStep, desafio, reflection, stepAttempts, stepStatus, storageKey, hydrated, canPersist, persistFreeState]);

  useEffect(() => {
    const saveNow = () => { if (hydratedRef.current && canPersist) persistFreeState({ ...latestDraft.current, code: codeRef.current }); };
    const onHide = () => { if (document.visibilityState === "hidden") saveNow(); };
    window.addEventListener("pagehide", saveNow); document.addEventListener("visibilitychange", onHide);
    return () => { saveNow(); window.removeEventListener("pagehide", saveNow); document.removeEventListener("visibilitychange", onHide); };
  }, [canPersist, persistFreeState]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(REFERENCE_PREF_KEY);
        setShowReference(stored === "1");
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
    if (nextCode === codeRef.current) return;
    activeRunRef.current?.abort(); activeRunRef.current = null; setRunning(false);
    codeRef.current = nextCode;
    setCode(nextCode);
    setErrorMark(null);
    setConsoleRun(null); setCompleted(false); setApplicationValidated(false); setCurrentStep(0);
    if (desafio) setStepStatus(desafio.steps.map(() => "pending"));
    setSaveStatus("saving");
    setCanPersist(true);
  }, [desafio]);

  const executeCode = useCallback(async () => {
    if (!desafio || running) return;
    const codeToRun = editorRef.current?.getValue() ?? codeRef.current;
    codeRef.current = codeToRun;
    setConsoleRun(null);
    setErrorMark(null);
    setShowDica(false);
    setShowSolution(false);
    setRunning(true);
    const attemptNumber = (stepAttempts[currentStep] ?? 0) + 1;
    setStepAttempts((current) => current.map((value, index) => index === currentStep ? value + 1 : value));
    const controller = new AbortController();
    activeRunRef.current = controller;
    try {
    const result = desafio.linguagem === "python"
      ? await runPythonInWorker(codeToRun, 20000, controller.signal, desafio.testCode)
      : desafio.linguagem === "csharp"
        ? await runCSharpInWorker(codeToRun, 2500, controller.signal, desafio.testCode)
        : await runJavaScriptInWorker(codeToRun, 2500, controller.signal, desafio.testCode);
    if (activeRunRef.current !== controller) return;
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
      setChatMessages((previous) => appendPedagogicalMessage(previous, { tipo: "sistema", texto: "Execução interrompida. Seu código continua salvo para você ajustar e tentar novamente." }));
      return;
    }

    const step = desafio.steps[currentStep];
    if (result.error && step) {
      setErrorMark({ line: errorLine, message: result.error });
      const newStatus = [...stepStatus];
      newStatus[currentStep] = "error";
      setStepStatus(newStatus);
      const lineNote = errorLine ? ` O editor marcou a linha ${errorLine} em vermelho.` : "";
      setChatMessages((previous) => appendPedagogicalMessage(previous, { tipo: "erro", texto: `${friendlyError}${lineNote}` }));
      if (attemptNumber >= 2) setShowDica(true);
      return;
    }

    if (step) {
      const passed = !result.error && step.validacao(codeToRun, result.output, result.verificationOutput);
      const newStatus = [...stepStatus];
      if (passed) {
        setConsoleRun((previous) => previous ? { ...previous, outcome: "success" } : previous);
        newStatus[currentStep] = "success";
        setStepStatus(newStatus);
        setChatMessages((prev) => appendPedagogicalMessage(prev, { tipo: "sucesso", texto: step.acerto }));
        setShowReference(false);
        setShowDica(false);
        if (currentStep + 1 < desafio.steps.length) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          setTimeout(() => {
            setChatMessages((prev) => appendPedagogicalMessage(prev, { tipo: "sistema", texto: desafio.steps[nextStep].instrucao }));
          }, 1000);
        } else {
          setCompleted(true);
          setTimeout(() => {
            setChatMessages((prev) => appendPedagogicalMessage(prev, { tipo: "sucesso", texto: "Parabéns! Você completou o desafio inteiro!" }));
          }, 800);
        }
      } else {
        newStatus[currentStep] = "error";
        setStepStatus(newStatus);
        setChatMessages((prev) => appendPedagogicalMessage(prev, { tipo: "erro", texto: step.erro }));
        if (attemptNumber >= 2) setShowDica(true);
      }
    }
    } catch {
      if (activeRunRef.current !== controller) return;
      setConsoleRun({
        lines: [],
        error: { message: "Falha inesperada no executor.", friendly: "Não foi possível executar agora. Seu código continua salvo; tente novamente.", line: null },
        durationMs: 0,
        outcome: "error",
      });
    } finally {
      if (activeRunRef.current === controller) { activeRunRef.current = null; setRunning(false); }
    }
  }, [currentStep, desafio, running, stepAttempts, stepStatus]);

  const stopExecution = useCallback(() => {
    activeRunRef.current?.abort();
  }, []);

  useEffect(() => () => { activeRunRef.current?.abort(); activeRunRef.current = null; }, []);

  useEffect(() => {
    if (!hydrated) return;
    let frame = 0;
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = Math.max(0, workspaceRef.current?.getBoundingClientRect().top ?? 0);
        const viewport = window.visualViewport;
        const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
        setWorkspaceHeight(Math.max(320, Math.floor(bottom - top - 12)));
      });
    };
    resize();
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.visualViewport?.removeEventListener("resize", resize); };
  }, [hydrated]);

  useEffect(() => {
    if (desafio?.linguagem !== "python") {
      setPythonRuntimeStatus("idle");
      return;
    }
    let active = true;
    setPythonRuntimeStatus("loading");
    void warmPythonRuntime().then((ready) => {
      if (active) setPythonRuntimeStatus(ready ? "ready" : "error");
    });
    return () => {
      active = false;
    };
  }, [desafio?.linguagem]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !hydratedRef.current) return;
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
        setCanPersist(true);
        persistFreeState({ code: codeRef.current, currentStep, stepStatus, stepAttempts, reflection });
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [currentStep, executeCode, reflection, stepAttempts, stepStatus, storageKey, persistFreeState]);

  const recoverVersion = (index: number) => {
    if (!desafio || !storageKey || !historyKey || running) return;
    const version = versions.entries[index];
    const next = version ? readFreePracticeDraft(version.raw, desafio.steps.length) : null;
    if (!next) { setVersionError("Esta versão não pôde ser restaurada automaticamente. O texto guardado continua disponível para copiar."); return; }
    try {
      const history = storePracticeProgram(localStorage, storageKey, historyKey, next, "restored", JSON.stringify({ ...latestDraft.current, code: codeRef.current }));
      setVersions(history); setVersionError(""); preserveUnreadDraft.current = false;
      codeRef.current = next.code; latestDraft.current = next;
      setCode(next.code); setCurrentStep(next.currentStep); setStepStatus(next.stepStatus); setStepAttempts(next.stepAttempts); setReflection(next.reflection);
      setCompleted(next.stepStatus.every(status => status === "success")); setDraftRestored(true); setCanPersist(true); setSaveStatus("saved"); setConsoleRun(null); setErrorMark(null);
      setChatMessages([{ tipo: "sistema", texto: "Versão anterior recuperada. O programa que estava aberto também foi guardado nas versões." }, { tipo: "sistema", texto: desafio.steps[next.currentStep].instrucao }]);
      requestAnimationFrame(() => editorRef.current?.focus());
    } catch { setVersionError("Não foi possível recuperar com segurança. O código aberto e as versões anteriores foram mantidos."); }
  };

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
    setStepAttempts(desafio.steps.map(() => 0));
    setReflection("");
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

  const startGuideResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = guideWidth;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const move = (moveEvent: PointerEvent) => {
      setGuideWidth(Math.min(440, Math.max(280, startWidth + startX - moveEvent.clientX)));
    };
    const stop = () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }, [guideWidth]);

  const startConsoleResize = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = consoleHeight;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const move = (moveEvent: PointerEvent) => {
      setConsoleHeight(Math.min(320, Math.max(112, startHeight + startY - moveEvent.clientY)));
    };
    const stop = () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }, [consoleHeight]);

  if (!desafio) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Desafio não encontrado.</p>
          <Link href={link("/estudante/pratica")} className="mt-3 inline-block text-orbit-electric hover:underline">
            Voltar para desafios
          </Link>
        </div>
      </div>
    );
  }
  if (!hydrated) return <p role="status">Restaurando seu código antes de abrir o editor…</p>;

  const guiaContent = (
    <div className="flex min-h-full flex-col">
      {!completed && desafio.steps[currentStep] && (
        <section className={lab.activeInstruction}>
          <div className={lab.instructionMeta}>
            <p>Missão ativa · Passo {currentStep + 1} de {desafio.steps.length}</p>
            <span>
              {stepAttempts[currentStep] ?? 0} tentativa{(stepAttempts[currentStep] ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
          <h2>{desafio.steps[currentStep].instrucao}</h2>
          <div className={lab.instructionMethod}>
            <span>1. Entenda</span>
            <ChevronRight className="size-3" />
            <span>2. Escreva</span>
            <ChevronRight className="size-3" />
            <span>3. Execute</span>
          </div>
        </section>
      )}
      {/* Checklist */}
      <div className="border-b border-white/10 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progresso</p>
          <span className={`text-[10px] ${saveStatus === "error" ? "text-red-300" : "text-slate-400"}`}>
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
                  : stepStatus[i] === "success" ? "text-emerald-400" : "text-slate-400"
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
              <span className="min-w-0 flex-1 line-clamp-1 text-[11px]">{step.instrucao}</span>
              {(stepAttempts[i] ?? 0) > 0 && <span className="shrink-0 text-[9px] text-slate-400">{stepAttempts[i]}x</span>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {desafio.dificuldade && <span className="rounded-full bg-white/[.05] px-2 py-1 text-[9px] font-bold uppercase text-slate-400">{desafio.dificuldade}</span>}
          {desafio.categoria && <span className="rounded-full bg-orbit-purple/10 px-2 py-1 text-[10px] font-bold uppercase text-violet-300">{desafio.categoria}</span>}
          {desafio.minutos && <span className="rounded-full bg-white/[.05] px-2 py-1 text-[9px] text-slate-400">~{desafio.minutos} min</span>}
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
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
              <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                Digite o código observando cada parte. Quando pegar o jeito, oculte e tente de cabeça.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[10px] leading-4 text-slate-400">
              Modo desafio: escreva de memória. Se travar, é só mostrar de novo — faz parte do aprendizado.
            </p>
          )}
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-3">
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
                {getConceptualHint(desafio.steps[currentStep])}
              </div>
              {desafio.solucao && (stepAttempts[currentStep] ?? 0) >= 3 && (
                <button type="button" onClick={() => setShowSolution((value) => !value)} className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-white/60">
                  {showSolution ? "Ocultar solução de referência" : "Ainda estou travado — ver solução"}
                </button>
              )}
              {desafio.solucao && (stepAttempts[currentStep] ?? 0) < 3 && (
                <p className="text-center text-[10px] leading-4 text-slate-400">Faça mais uma tentativa com essa pista; a solução completa será liberada na terceira.</p>
              )}
              {showSolution && desafio.solucao && (stepAttempts[currentStep] ?? 0) >= 3 && (
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
          <div className="rounded-xl bg-gradient-to-br from-orbit-electric/15 to-orbit-purple/15 border border-orbit-electric/30 p-3">
            <p className="text-sm font-bold text-white">{applicationRequired && !applicationValidated ? "Seu programa foi validado." : "Desafio completo!"}</p>
            <p className="mt-1 text-[11px] leading-5 text-white/55">{applicationRequired && !applicationValidated ? "Agora altere os dados e construa uma versão independente para fechar esta entrega." : "Feche o ciclo: explique com suas palavras o que seu código fez. Isso ajuda a memória a durar."}</p>
            <label className="mt-3 block text-[9px] font-black uppercase tracking-wider text-orbit-electric" htmlFor="practice-reflection">Meu aprendizado</label>
            <textarea
              id="practice-reflection"
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              rows={3}
              placeholder="Ex.: uma variável guarda um valor para eu reutilizar depois..."
              className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs leading-5 text-white outline-none placeholder:text-slate-400 focus:border-orbit-electric/50"
            />
            {applicationRequired && !applicationValidated ? <a href="#beginner-free-application" className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs text-emerald-200 underline underline-offset-4">Aplicar com novos dados e escrever sozinho <ChevronRight className="size-3"/></a> : <Link href={link(nextChallenge ? `/estudante/pratica/${nextChallenge.slug}` : "/estudante/pratica")} className="mt-2 inline-flex items-center gap-1 text-xs text-orbit-electric hover:underline">
              {nextChallenge ? `Próximo: ${nextChallenge.titulo}` : "Ver mais desafios"} <ChevronRight className="size-3" />
            </Link>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
    <div ref={workspaceRef} className={lab.workspace + " " + free.workspace} data-lab-workspace data-free-workspace data-guide-open={guideOpen} style={workspaceHeight ? { "--free-space": workspaceHeight + "px" } as CSSProperties : undefined}>
      <Suspense fallback={null}><PracticeOrigin/></Suspense>
      <header className={free.toolbar}>
        <Link aria-label="Voltar ao catálogo de exercícios" href={link(`/estudante/pratica?linguagem=${desafio.linguagem}#experimentos`)} className={free.iconButton}><ArrowLeft size={17}/></Link>
        <div className={free.identity}><span>Modo livre</span><h1>{desafio.titulo}</h1></div>
        <div className={free.toolbarActions}>
          <button type="button" onClick={onGuidedMode} aria-label="Voltar ao passo a passo" className={free.secondaryButton}><BookOpen size={16}/><span className={free.buttonLabel}>Passo a passo</span></button>
          <button type="button" onClick={() => setGuideOpen(value => !value)} aria-expanded={guideOpen} aria-controls={guideOpen ? "practice-guide-panel" : undefined} className={free.secondaryButton}><MessageSquare size={16}/><span>Ajuda</span></button>
          <details className={free.tools}>
            <summary aria-label="Opções do código"><MoreHorizontal size={19}/></summary>
            <div className={free.toolsContent}>
              <strong>Seu código e suas versões</strong>
              <p>O rascunho fica neste navegador. Ctrl/⌘ + Enter executa; Ctrl/⌘ + S salva.</p>
              {desafio.linguagem === "python" && <p role="status">{pythonRuntimeStatus === "ready" ? "Python pronto para executar." : pythonRuntimeStatus === "error" ? "Python não carregou. Tente executar novamente com conexão." : "Preparando Python…"}</p>}
              <button type="button" onClick={handleReset}><RotateCcw size={15}/> Reiniciar</button>
              {versions.entries.length > 0 && <details data-practice-code-versions>
                <summary>Versões guardadas · {versions.entries.length}</summary>
                <p>Recuperar guarda também o código aberto agora. O passo a passo mantém seu próprio rascunho.</p>
                {versions.entries.map((version, index) => {
                  const draft = readFreePracticeDraft(version.raw, desafio.steps.length);
                  return <details key={version.savedAt + "-" + index}><summary>Versão {versions.entries.length - index} · {new Date(version.savedAt).toLocaleString("pt-BR")}</summary><pre>{draft?.code ?? version.raw}</pre>{draft ? <button type="button" disabled={running} onClick={() => recoverVersion(index)}>Recuperar código desta versão</button> : <p>Texto preservado. Esta versão precisa ser copiada manualmente.</p>}</details>;
                })}
              </details>}
            </div>
          </details>
        </div>
      </header>

      {versionError && <p role="alert" className={free.storageError}>{versionError}</p>}
      {saveStatus === "error" && !versionError && <p role="alert" className={free.storageError}>Não foi possível salvar. Copie seu programa antes de sair.</p>}

      <div className={free.workArea}>
        <section id="practice-editor-panel" aria-label="Código e execução" className={free.editorPane}>
          <div className={free.fileBar}>
            <span><Code2 size={13}/>rascunho.{{ javascript: "js", typescript: "ts", python: "py", csharp: "cs" }[desafio.linguagem]}</span>
            <small role="status" data-error={saveStatus === "error"}>{saveStatus === "saving" ? "Salvando…" : saveStatus === "saved" ? "Salvo neste navegador" : saveStatus === "error" ? "Falha ao salvar" : "Rascunho local"}</small>
          </div>
          <div className={free.task} data-free-task>
            <div><span>{completed ? "PROGRAMA VALIDADO" : "SUA EXPERIÊNCIA AGORA · " + (currentStep + 1) + "/" + desafio.steps.length}</span><p>{completed ? "Experimente outro valor, execute e observe o que muda." : desafio.steps[currentStep]?.instrucao}</p></div>
          </div>
          {versions.source === "guided" && <p className={free.origin} data-practice-handoff-origin>Programa trazido da atividade. Altere um valor e execute para experimentar.</p>}
          {versions.source === "restored" && <p className={free.origin}>Versão recuperada; o programa anterior está nas versões.</p>}
          {completed && applicationRequired && !applicationValidated && <a href="#beginner-free-application" className={free.origin}>Seu programa passou. Aplique com novos dados para fechar esta entrega ↓</a>}
          <div className={free.codeArea}>
            <ReliableCodeEditor ref={editorRef} language={desafio.linguagem} value={code} onChange={handleCodeChange} errorLine={errorMark?.line} errorMessage={errorMark?.message}/>
          </div>
          <div className={free.executionBar}>
            {running ? <button type="button" onClick={stopExecution} className={lab.stopButton} aria-label="Interromper execução"><Square size={15} fill="currentColor"/>Parar</button>
              : <button type="button" onClick={executeCode} aria-label="Executar" title="Executar (Ctrl/⌘ + Enter)" className={lab.runButton}><Play size={15}/>Executar</button>}
            <span className={free.shortcut}>Ctrl/⌘ + Enter</span>
          </div>

          <section className={free.console} aria-label="Resultado da execução" data-active={running || !!consoleRun} data-expanded={consoleExpanded} style={{ "--console-height": consoleHeight + "px" } as CSSProperties}>
            {(running || consoleRun) && <button type="button" onPointerDown={startConsoleResize} onDoubleClick={() => setConsoleHeight(156)} aria-label="Redimensionar console" title="Arraste para redimensionar · duplo clique para restaurar" className={free.resizeOutput}/>}
            <div className={free.consoleToolbar}>
              <strong>Resultado</strong>
              {!running && !consoleRun && <span>Aparece ao executar</span>}
              {running && <span role="status">Executando…</span>}
              {consoleRun && <div className={free.consoleActions}>
                <small>{consoleRun.durationMs} ms</small>
                <button type="button" onClick={() => setConsoleExpanded(value => !value)} aria-label={consoleExpanded ? "Reduzir console" : "Expandir console"}>{consoleExpanded ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}</button>
                <button type="button" onClick={() => navigator.clipboard.writeText([...consoleRun.lines, consoleRun.error?.message].filter(Boolean).join("\n")).catch(() => {})} aria-label="Copiar saída do console"><Copy size={14}/></button>
                <button type="button" onClick={() => { setConsoleRun(null); setErrorMark(null); }} aria-label="Limpar console"><Trash2 size={14}/></button>
              </div>}
            </div>
            {(running || consoleRun) && <div role="status" aria-live="polite" className={free.consoleBody}>
              {running && <p className={free.running}>{desafio.linguagem === "python" ? "Preparando Python e executando seu código…" : "Executando seu código…"}</p>}
              {consoleRun?.lines.map((line, index) => <pre key={index}>{line}</pre>)}
              {consoleRun && !consoleRun.error && consoleRun.lines.length === 0 && <p>Execução concluída sem saída no console.</p>}
              {consoleRun?.truncated && <p className={free.warning}>A saída foi limitada para manter o editor rápido.</p>}
              {consoleRun?.outcome === "needs-work" && !consoleRun.error && <div className={free.feedback} data-outcome="needs-work"><p>Seu código rodou. Confira o critério da missão para continuar.</p><button type="button" onClick={() => setGuideOpen(true)}>Ver orientação<ChevronRight size={13}/></button></div>}
              {consoleRun?.outcome === "success" && <div className={free.feedback} data-outcome="success"><p>Esta etapa passou nos critérios do desafio.</p><button type="button" onClick={() => setGuideOpen(true)}>Ver próximo passo<ChevronRight size={13}/></button></div>}
              {consoleRun?.outcome === "cancelled" && <p>Execução interrompida. Seu código foi preservado.</p>}
              {consoleRun?.error && <div className={free.error}><p>{consoleRun.error.line ? "Linha " + consoleRun.error.line + ": " : ""}{consoleRun.error.message}</p><p>{consoleRun.error.friendly}</p></div>}
            </div>}
          </section>
        </section>

        {guideOpen && <button type="button" onPointerDown={startGuideResize} onDoubleClick={() => setGuideWidth(320)} aria-label="Redimensionar painel do guia" title="Arraste para redimensionar · duplo clique para restaurar" className={free.resizeGuide}/>}
        {guideOpen && <aside id="practice-guide-panel" aria-label="Ajuda para experimentar" className={lab.guidePane + " " + free.guidePane} style={{ "--guide-width": guideWidth + "px" } as CSSProperties}>
          <header className={free.guideHeader}><strong>Ajuda para experimentar</strong><button type="button" onClick={() => setGuideOpen(false)} aria-label="Voltar ao código"><X size={17}/></button></header>
          {guiaContent}
        </aside>}
      </div>
    </div>
    {completed && applicationRequired && <div id="beginner-free-application" className="scroll-mt-20 pt-6"><BeginnerPractice challengeSlug={slug} userId={userId} guidedCode={code} origin="free" onValidatedChange={setApplicationValidated}/>{applicationValidated && <Link href={link(nextChallenge ? "/estudante/pratica/" + nextChallenge.slug : "/estudante/pratica")} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg bg-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-950">{nextChallenge ? "Próximo: " + nextChallenge.titulo : "Ver mais desafios"}<ChevronRight size={16}/></Link>}</div>}
    </>
  );
}

export default function PraticaPage() {
  const { user } = useAuth();
  return <PraticaWorkspace userId={user?.id} />;
}
