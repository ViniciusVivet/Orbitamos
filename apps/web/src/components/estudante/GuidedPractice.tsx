"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Nunito } from "next/font/google";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Play, RotateCcw, Square, Undo2 } from "lucide-react";
import { getNextDesafio, type Desafio } from "@/lib/desafios";
import { emptyGuidedDraft, guidedLines, guidedMissionProgram, guidedProgram, guidedStorageKey, nextGuidedLine, readGuidedDraft, guidedWritingMatches, type GuidedDraft } from "@/lib/guidedPractice";
import { runCSharpInWorker, runJavaScriptInWorker, runPythonInWorker, type BrowserCodeResult } from "@/lib/browserCodeRunner";
import { diagnoseCSharp } from "@/lib/csharpFeedback";
import ReliableCodeEditor from "./ReliableCodeEditor";
import PracticeJourney from "./PracticeJourney";
import PracticeCheck from "./PracticeCheck";
import { practiceChecks, practiceSymbols } from "@/lib/practiceExperience";
import s from "./GuidedPractice.module.css";
import { academyPreviewHref } from "@/lib/portalNavigation";
import BeginnerPractice from "./BeginnerPractice";
import { supportsBeginnerPractice } from "@/lib/beginnerPractice";
import { practiceStory } from "@/lib/practiceNarrative";
import { getLaboratoryCover } from "./laboratoryCovers";
import profileArt from "../../../public/images/laboratorio/orbi-ficha-v1.webp";
import gradesArt from "../../../public/images/laboratorio/orbi-notas-v1.webp";

const studyFont = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-guided-practice",
  preload: false,
});

type PracticeArtwork = {
  image: StaticImageData;
  position: string;
  input: string;
  output: string;
  firstLine: string;
};

const practiceArtwork: Partial<Record<string, PracticeArtwork>> = {
  "variaveis-js": {
    image: profileArt,
    position: "69% center",
    input: "Nome: Rafa",
    output: "Ficha preenchida",
    firstLine: "let cria a variável. O sinal = guarda o texto.",
  },
  "condicionais-js": {
    image: gradesArt,
    position: "74% center",
    input: "Nota 8",
    output: "Aprovado",
    firstLine: "nota recebe o valor que você vai classificar.",
  },
};

function GuidedReplay({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return collapsed ? <details className={s.replay}><summary>Rever o guia concluído e meu código</summary>{children}</details> : <>{children}</>;
}

export default function GuidedPractice({ challenge, userId, onFreeMode, onComplete, onValidationChange, embedded = false, preview = false }: { challenge: Desafio; userId: string | number | null; onFreeMode: (code?: string) => void; onComplete?: () => void; onValidationChange?: (valid: boolean) => void; embedded?: boolean; preview?: boolean }) {
  const link = (href: string) => preview ? academyPreviewHref(href) : href;
  const [draft, setDraft] = useState<GuidedDraft>(emptyGuidedDraft);
  const [ready, setReady] = useState(false);
  const [save, setSave] = useState("Abrindo seu caderno…");
  const [result, setResult] = useState<BrowserCodeResult | null>(null);
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [composing, setComposing] = useState(false);
  const [allowPartialRun, setAllowPartialRun] = useState(false);
  const [undoDraft, setUndoDraft] = useState<GuidedDraft | null>(null);
  const [applicationValidated, setApplicationValidated] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const missionHeading = useRef<HTMLHeadingElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const cancelReset = useRef<HTMLButtonElement>(null);
  const activeRun = useRef<AbortController | null>(null);
  const latest = useRef(draft);
  const history = useRef<string[]>([]);
  const editedForAuto = useRef(false);
  const focusStep = useRef(false);
  const codeColumn = useRef<HTMLElement>(null);
  const key = userId ? guidedStorageKey(userId, challenge.slug) : null;
  const lines = guidedLines(challenge, draft.mission);
  const current = lines[draft.line];
  const previous = challenge.steps.slice(0, draft.mission).map((_, i) => guidedProgram(challenge, i)).join("\n");
  const expected = [previous, ...lines.slice(0, draft.line + 1).map(line => line.code)].filter(Boolean).join("\n");
  const matches = guidedWritingMatches(draft.code, expected, challenge);
  const fullMatches = guidedWritingMatches(draft.code, guidedMissionProgram(challenge, draft.mission), challenge);
  const canRun = Boolean(draft.code.trim()) && (fullMatches || allowPartialRun);
  const finalLine = draft.line === lines.length - 1;
  const missionPassed = draft.passed.includes(draft.mission);
  const completed = draft.passed.length === challenge.steps.length;
  const needsAdvance = !completed && (missionPassed || (!finalLine && !fullMatches));
  const applicationRequired = !embedded && supportsBeginnerPractice(challenge.slug);
  const next = getNextDesafio(challenge.slug);
  const lang = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", csharp: "C#" }[challenge.linguagem];
  const file = `rascunho.${{ javascript: "js", typescript: "ts", python: "py", csharp: "cs" }[challenge.linguagem]}`;
  const story = practiceStory(challenge);
  const artwork = practiceArtwork[challenge.slug];
  const cover = artwork ?? getLaboratoryCover(challenge.categoria);
  const firstLineNote = !embedded && draft.mission === 0 && draft.line === 0 ? artwork?.firstLine : undefined;
  const symbols = practiceSymbols(challenge.linguagem);
  const essentialSymbols = challenge.linguagem === "python" ? ["Recuo", "↵", ":", '"', "(", ")"] : challenge.linguagem === "csharp" ? ["↵", '"', ";", "=", "{", "}"] : ["↵", '"', ";", "=", "(", ")"];
  const personalWriting = challenge.steps[draft.mission].escrita;
  const personalTip = personalWriting && current.code.includes(` ${personalWriting.variavel} =`) ? personalWriting.tipo === "texto" ? "Troque o texto do exemplo pelo seu nome. Mantenha as aspas." : personalWriting.tipo === "numero" ? "Escolha sua idade, usando um número sem aspas." : "Escolha true ou false, sem aspas." : null;
  const renderSymbol = (symbol: string) => <button key={symbol} type="button" data-essential={essentialSymbols.includes(symbol)} aria-label={symbol === "Recuo" ? "Inserir recuo" : symbol === "↵" ? "Nova linha" : `Inserir ${symbol}`} onPointerDown={event => event.preventDefault()} onClick={() => insert(symbol === "Recuo" ? (challenge.linguagem === "python" ? "    " : "  ") : symbol === "↵" ? "\n" : symbol)}>{symbol}</button>;

  useEffect(() => { if (ready) onValidationChange?.(completed); }, [ready, completed, onValidationChange]);

  const update = useCallback((value: GuidedDraft) => {
    latest.current = value;
    setDraft(value);
  }, []);

  useEffect(() => {
    let active = true;
    let restored = emptyGuidedDraft();
    let blocked = false;
    try { restored = readGuidedDraft(key ? localStorage.getItem(key) : null, challenge); } catch { blocked = true; }
    queueMicrotask(() => {
      if (!active) return;
      setRunning(false);
      update(restored);
      setReady(true);
      setSave(blocked ? "Armazenamento indisponível: copie seu código antes de sair." : restored.started ? "Retomado neste dispositivo" : "Seu código fica neste dispositivo");
    });
    return () => { active = false; activeRun.current?.abort(); activeRun.current = null; };
  }, [challenge, key, update]);

  useEffect(() => {
    if (!ready || !autoAdvance || composing || running || resetting || !editedForAuto.current) return;
    const nextLine = nextGuidedLine(draft, challenge);
    if (nextLine === null) return;
    const timer = window.setTimeout(() => {
      if (latest.current !== draft || !editedForAuto.current || document.visibilityState === "hidden" || !codeColumn.current?.contains(document.activeElement)) return;
      editedForAuto.current = false;
      update({ ...draft, line: nextLine });
    }, 950);
    return () => clearTimeout(timer);
  }, [draft, challenge, ready, autoAdvance, composing, running, resetting, update]);

  useLayoutEffect(() => {
    if (!ready || !focusStep.current) return;
    focusStep.current = false;
    missionHeading.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 767px)").matches) codeColumn.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [ready, draft.line, draft.mission]);

  useEffect(() => {
    if (!ready) return;
    const persist = () => {
      if (!key) { setSave("Entre na sua conta para guardar o rascunho."); return; }
      try { localStorage.setItem(key, JSON.stringify(latest.current)); setSave("Salvo neste dispositivo"); }
      catch { setSave("Não foi possível salvar. Copie seu código antes de sair."); }
    };
    const timer = window.setTimeout(persist, 250);
    const onHide = () => { if (document.visibilityState === "hidden") persist(); };
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.clearTimeout(timer); persist(); window.removeEventListener("pagehide", persist); document.removeEventListener("visibilitychange", onHide); };
  }, [draft, key, ready]);

  useEffect(() => { if (resetting) cancelReset.current?.focus(); }, [resetting]);

  const changeCode = useCallback((code: string) => {
    if (code === latest.current.code) return;
    activeRun.current?.abort(); activeRun.current = null; setRunning(false);
    history.current = [...history.current.slice(-39), latest.current.code];
    editedForAuto.current = true;
    update({ ...latest.current, code, started: true, passed: latest.current.passed.filter(n => n < latest.current.mission) });
    setResult(null);
    setSave("Salvando…");
  }, [update]);

  const insert = (text: string) => {
    const input = textarea.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    changeCode(input.value.slice(0, start) + text + input.value.slice(end));
    requestAnimationFrame(() => { input.focus({ preventScroll: true }); input.setSelectionRange(start + text.length, start + text.length); });
  };

  const run = async () => {
    if (running || !canRun) return;
    editedForAuto.current = false;
    const controller = new AbortController();
    activeRun.current = controller;
    setRunning(true); setResult(null);
    const source = latest.current.code;
    try {
      const runner = challenge.linguagem === "python" ? runPythonInWorker : challenge.linguagem === "csharp" ? runCSharpInWorker : runJavaScriptInWorker;
      const diagnostic = challenge.linguagem === "csharp" ? diagnoseCSharp(source) : null;
      const output: BrowserCodeResult = diagnostic ? { output: "", error: diagnostic, timedOut: false } : await runner(source, challenge.linguagem === "python" ? 30000 : 2500, controller.signal, challenge.testCode);
      if (activeRun.current !== controller) return;
      setResult(output);
      if (!output.error && !output.cancelled && challenge.steps.slice(0, draft.mission + 1).every(step => step.validacao(source, output.output, output.verificationOutput))) {
        update({ ...latest.current, line: lines.length - 1, passed: Array.from({ length: draft.mission + 1 }, (_, i) => i), started: true });
        if (draft.mission === challenge.steps.length - 1) onComplete?.();
      }
    } catch {
      if (activeRun.current === controller) setResult({ output: "", error: "Não foi possível executar. Confira a conexão e tente novamente; seu código foi preservado.", timedOut: false });
    } finally {
      if (activeRun.current === controller) { activeRun.current = null; setRunning(false); }
    }
  };

  function advance() {
    editedForAuto.current = false;
    focusStep.current = true;
    if (missionPassed && !completed) {
      update({ ...draft, mission: draft.mission + 1, line: 0 });
      setAllowPartialRun(false);
      setResult(null);
    } else if (matches && !finalLine) update({ ...draft, line: draft.line + 1 });
  }

  function reset() {
    editedForAuto.current = false;
    setAllowPartialRun(false);
    activeRun.current?.abort(); activeRun.current = null; setRunning(false);
    setUndoDraft(draft); history.current = []; update(emptyGuidedDraft()); setResult(null); setResetting(false);
    requestAnimationFrame(() => resetButton.current?.focus());
  }

  if (!ready) return <p role="status">Abrindo seu laboratório…</p>;

  const codeLines = draft.code.split("\n").length;
  const keyboard = !enhanced && <div className={s.keys} role="group" aria-label="Símbolos de código">{essentialSymbols.filter(symbol => symbols.includes(symbol)).map(renderSymbol)}</div>;
  const feedback = !missionPassed && (matches || fullMatches) && <><Check size={14} aria-hidden="true"/>{fullMatches ? "Pronto para executar." : "Linha conferida."}</>;

  return <section className={embedded ? s.studio : `${s.studio} ${studyFont.variable}`} data-guided-lab data-embedded={embedded} onCompositionStart={() => setComposing(true)} onCompositionEnd={() => setComposing(false)}>
    {!embedded && <header className={s.header}>
      <Link href={link(`/estudante/pratica?linguagem=${challenge.linguagem}#experimentos`)}><ArrowLeft size={16}/> Exercícios</Link>
      <button onClick={() => onFreeMode(draft.code)}>Modo livre<ArrowRight size={15}/></button>
    </header>}
    <div className={s.bench}>
      {!embedded && <header className={s.scene} data-practice-scene data-artwork={artwork ? "orbi" : "editorial"}>
        <div className={s.sceneImage}>
          <Image src={cover.image} alt="" fill sizes={artwork ? "(max-width: 767px) 70vw, 440px" : "(max-width: 767px) 62vw, 340px"} placeholder="blur" loading="eager" fetchPriority="high" style={{ objectPosition: cover.position }}/>
        </div>
        <div className={s.sceneCopy}>
          <p className={s.sceneLanguage}>{lang} · {challenge.dificuldade}</p>
          <h1>{challenge.titulo}</h1>
          {artwork ? <p className={s.sample}>
            <span>Exemplo</span>
            <span className={s.sampleValues}>{artwork.input}<span className="sr-only"> resulta em </span><ArrowRight size={14} aria-hidden="true"/><strong>{artwork.output}</strong></span>
          </p> : <p className={s.goal}>{story.goal}</p>}
        </div>
        <p className={s.sceneStory}>{story.scene}</p>
      </header>}
      <div className={s.work}>
      <GuidedReplay collapsed={completed && applicationRequired}>
      <section ref={codeColumn} className={s.codeColumn} aria-label="Escreva e execute">
        <div className={s.writingPrompt} aria-live="polite">
          <div className={s.stepHeading}>
            <p className={s.stepMeta}>
              {!embedded && challenge.steps.length > 1 && `Missão ${draft.mission + 1}/${challenge.steps.length} · `}
              {missionPassed ? "Código validado" : `Linha ${draft.line + 1} de ${lines.length}`}
            </p>
            <h2 ref={missionHeading} tabIndex={-1}>{completed ? "Atividade concluída" : missionPassed ? "Missão concluída" : current.title}</h2>
          </div>
          {missionPassed ? <p className={s.lineMeaning}>{challenge.steps[draft.mission].acerto}</p> : <>
            <p className={s.lineMeaning}>{personalTip ?? firstLineNote ?? current.why}</p>
            <code>{current.code}</code>
            {personalTip && <p className={s.personalMeaning}>{firstLineNote ?? current.why}</p>}
            {draft.line > 0 && !matches && <p className={s.lineNote}>Mantenha as linhas anteriores e escreva esta na linha seguinte.</p>}
          </>}
        </div>
        <div className={s.editor}>
        <div className={s.filebar}>
          {enhanced ? <strong>Seu código</strong> : <label htmlFor="guided-code">Seu código</label>}
          {!embedded && <span className={s.editorFeedback} role="status">{feedback}</span>}
          <span className={s.fileName}>{file}</span>
        </div>
        {enhanced ? <div className={s.enhanced}><ReliableCodeEditor value={draft.code} language={challenge.linguagem} onChange={changeCode}/></div> : <div className={s.inputWrap}>
          <div ref={gutter} className={s.numbers} aria-hidden="true">{Array.from({ length: Math.max(embedded ? 3 : 2, codeLines) }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
          <textarea ref={textarea} id="guided-code" value={draft.code} onChange={event => changeCode(event.target.value)} onScroll={event => { if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop; }} placeholder="Escreva aqui…" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} maxLength={100000} wrap="off" rows={Math.min(12, Math.max(embedded ? 3 : 2, codeLines + 1))} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void run(); } }}/>
        </div>}
        </div>
        {embedded && keyboard}
        {embedded && <div className={s.feedback} role="status">{feedback}</div>}
        <div className={s.actions}>
          {needsAdvance && !running && <button className={s.primary} disabled={!matches && !missionPassed} onClick={advance}>{missionPassed ? "Próxima missão" : "Próxima linha"}<ArrowRight size={17}/></button>}
          {running ? <button key="stop" className={s.primary} onClick={() => activeRun.current?.abort()}><Square size={17}/>Parar execução</button> : (!needsAdvance || allowPartialRun) && !missionPassed && <button key="run" className={needsAdvance ? s.secondary : s.primary} disabled={!canRun} onClick={() => void run()}><Play size={17}/>Executar código</button>}
        </div>
        {!embedded && keyboard}

        {completed && !embedded && !applicationRequired && <div className={s.nextActions}>{practiceChecks[challenge.slug] && <a href="#practice-check">Aplicar o que aprendi<ArrowRight size={16}/></a>}<button className={s.secondary} onClick={() => onFreeMode(draft.code)}>Praticar sem o guia<ArrowRight size={17}/></button>{next ? <Link href={link(`/estudante/pratica/${next.slug}`)}>Próximo desafio: {next.titulo}<ArrowRight size={16}/></Link> : challenge.linguagem === "csharp" ? <Link href={link("/estudante/trilhas/csharp")}>Continue na trilha C# &amp; .NET<ArrowRight size={16}/></Link> : <Link href={link(`/estudante/pratica?linguagem=${challenge.linguagem}#experimentos`)}>Revisar os fundamentos de {lang}<ArrowRight size={16}/></Link>}</div>}
        {(running || result) && <section className={s.console} aria-label="Resultado da execução"><div><strong>Resultado</strong>{result && <button onClick={() => setResult(null)}>Limpar saída</button>}</div><div role="status">{running ? <p>{challenge.linguagem === "python" ? "Preparando Python e executando… A primeira execução precisa de conexão." : "Executando seu programa…"}</p> : result && <>{result.output && <pre>{result.output}</pre>}{result.cancelled ? <p>Execução interrompida. Seu código está preservado.</p> : result.error ? <div className={s.error}><strong>Ainda não rodou</strong><p>{result.errorLine ? `Confira a linha ${result.errorLine}. ` : ""}{/indent|syntax/i.test(result.error) ? "Confira os recuos, as aspas e os sinais da etapa." : "Confira os nomes e valores da etapa."}</p><pre>{result.error}</pre></div> : <p>{missionPassed ? "Resultado validado." : "Executou, mas ainda não resolveu a missão. Compare a saída com o objetivo."}</p>}</>}</div></section>}
        <details className={s.lessonTools}>
          <summary>Ajuda e ferramentas<ChevronDown aria-hidden="true" size={16}/></summary>
          <div className={s.toolContent}>
            {!embedded && <div className={s.missionInfo}>
              <strong>O que seu programa precisa fazer</strong>
              <p>{challenge.steps[draft.mission].instrucao}</p>
              <p className={s.mobileStory}>{story.scene}</p>
              {firstLineNote && !missionPassed && <p>{current.why}</p>}
              <dl className={s.programPlan}>
                <div><dt>Recebe</dt><dd>{story.input}</dd></div>
                <div><dt>Faz</dt><dd>{story.action}</dd></div>
                <div><dt>Mostra</dt><dd>{story.outcome}</dd></div>
              </dl>
              <PracticeJourney challenge={challenge} preview={preview}/>
            </div>}
            <div className={s.toolActions}>
              {draft.line > 0 && !missionPassed && <button onClick={() => { editedForAuto.current = false; focusStep.current = true; update({ ...draft, line: draft.line - 1 }); }}>Rever etapa anterior</button>}
              <button aria-label="Desfazer última edição" disabled={running || !history.current.length} onClick={() => { editedForAuto.current = false; const code = history.current.pop(); if (code !== undefined) { update({ ...draft, code, passed: draft.passed.filter(n => n < draft.mission) }); setResult(null); } }}><Undo2 size={16}/>Desfazer</button>
              <button ref={resetButton} onClick={() => setResetting(true)}><RotateCcw size={16}/>Reiniciar</button>
              <button onClick={() => setEnhanced(value => !value)}>{enhanced ? "Editor simples" : "Editor com realce"}</button>
              {!fullMatches && !missionPassed && <button aria-pressed={allowPartialRun} onClick={() => { editedForAuto.current = false; setAllowPartialRun(!allowPartialRun); }}>{allowPartialRun ? "Voltar à execução guiada" : "Testar código incompleto"}</button>}
            </div>
            <label className={s.autoControl}><input type="checkbox" checked={autoAdvance} onChange={event => { editedForAuto.current = false; setAutoAdvance(event.target.checked); }}/>Avanço automático de linha</label>
            {!enhanced && <div className={s.toolKeys} role="group" aria-label="Outros símbolos de código">{symbols.map(renderSymbol)}</div>}
            <p className={s.save}>{save}. O rascunho fica neste navegador.{challenge.linguagem === "csharp" && " O ambiente C# aqui é didático e tem menos recursos que o .NET completo."}</p>
          </div>
        </details>
        {resetting && <div className={s.reset} role="group" aria-label="Confirmar reinício"><strong>Recomeçar este desafio guiado?</strong><p>O código e as etapas deste modo serão reiniciados. Seu rascunho do modo livre não muda.</p><button ref={cancelReset} onClick={() => { setResetting(false); resetButton.current?.focus(); }}>Continuar editando</button><button onClick={reset}>Sim, reiniciar</button></div>}
        {undoDraft && <div className={s.reset}><p>O código anterior está disponível até você sair desta página.</p><button onClick={() => { editedForAuto.current = false; activeRun.current?.abort(); activeRun.current = null; setRunning(false); update(undoDraft); setUndoDraft(null); setResult(null); }}>Recuperar código anterior ao reinício</button></div>}
        {/^(Não foi possível|Armazenamento indisponível)/.test(save) && <p role="alert" className={s.error}>{save}</p>}
      </section>
    </GuidedReplay>
    {completed && applicationRequired && <div className={s.application} data-learning-delivery>
      <BeginnerPractice challengeSlug={challenge.slug} userId={userId} guidedCode={draft.code} onValidatedChange={setApplicationValidated} onFreeMode={code => onFreeMode(code)}/>
      {applicationValidated ? <section className={s.deliveryNext} aria-label="Seu próximo passo"><strong>{challenge.slug === "primeiro-orcamento-js" ? "Você entregou seu primeiro orçamento." : "Você aplicou a ideia em outra situação."}</strong><p>{challenge.slug === "primeiro-orcamento-js" ? "Seu programa reúne dados, cálculo e decisão. Revise sua entrega ou continue aprendendo como reunir instruções em funções." : "O exemplo virou uma regra que funciona com outros dados. Agora siga para a próxima entrega."}</p>{next && <Link className={s.primary} href={link(`/estudante/pratica/${next.slug}`)}>{challenge.slug === "primeiro-orcamento-js" ? "Próximo tema" : "Próxima entrega"}: {next.titulo}<ArrowRight size={17}/></Link>}<Link href={link("/estudante/progresso")}>Ver o que já pratiquei<ArrowRight size={15}/></Link></section> : <p className={s.deliveryPending}>A próxima entrega aparece depois de testar sua aplicação. O mapa continua disponível para consultar e explorar.</p>}
    </div>}
    {completed && !embedded && !applicationRequired && practiceChecks[challenge.slug] && <PracticeCheck key={practiceChecks[challenge.slug].id} check={practiceChecks[challenge.slug]} userId={userId} onPractice={() => onFreeMode(draft.code)}/>}
    </div>
    </div>
  </section>;
}
