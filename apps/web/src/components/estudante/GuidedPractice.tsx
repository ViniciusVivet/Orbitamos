"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Play, RotateCcw, Square, Undo2 } from "lucide-react";
import { getNextDesafio, type Desafio } from "@/lib/desafios";
import { emptyGuidedDraft, guidedLines, guidedMissionProgram, guidedProgram, guidedStorageKey, nextGuidedLine, readGuidedDraft, writingMatches, type GuidedDraft } from "@/lib/guidedPractice";
import { runCSharpInWorker, runJavaScriptInWorker, runPythonInWorker, type BrowserCodeResult } from "@/lib/browserCodeRunner";
import { diagnoseCSharp } from "@/lib/csharpFeedback";
import ReliableCodeEditor from "./ReliableCodeEditor";
import PracticeBrief from "./PracticeBrief";
import PracticeJourney from "./PracticeJourney";
import PracticeCheck from "./PracticeCheck";
import { practiceChecks, practiceSymbols } from "@/lib/practiceExperience";
import s from "./GuidedPractice.module.css";

export default function GuidedPractice({ challenge, userId, onFreeMode, onComplete, onValidationChange, embedded = false }: { challenge: Desafio; userId: string | number | null; onFreeMode: () => void; onComplete?: () => void; onValidationChange?: (valid: boolean) => void; embedded?: boolean }) {
  const [draft, setDraft] = useState<GuidedDraft>(emptyGuidedDraft);
  const [ready, setReady] = useState(false);
  const [save, setSave] = useState("Abrindo seu caderno…");
  const [result, setResult] = useState<BrowserCodeResult | null>(null);
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [showBrief, setShowBrief] = useState(!embedded);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [composing, setComposing] = useState(false);
  const [allowPartialRun, setAllowPartialRun] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [undoDraft, setUndoDraft] = useState<GuidedDraft | null>(null);
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
  const matches = writingMatches(draft.code, expected, challenge.linguagem === "python");
  const fullMatches = writingMatches(draft.code, guidedMissionProgram(challenge, draft.mission), challenge.linguagem === "python");
  const canRun = Boolean(draft.code.trim()) && (fullMatches || allowPartialRun);
  const finalLine = draft.line === lines.length - 1;
  const missionPassed = draft.passed.includes(draft.mission);
  const completed = draft.passed.length === challenge.steps.length;
  const next = getNextDesafio(challenge.slug);
  const lang = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", csharp: "C#" }[challenge.linguagem];

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
      setShowBrief(!embedded && !restored.started);
      setReady(true);
      setSave(blocked ? "Armazenamento indisponível: copie seu código antes de sair." : restored.started ? "Retomado neste dispositivo" : "Seu código fica neste dispositivo");
    });
    return () => { active = false; activeRun.current?.abort(); activeRun.current = null; };
  }, [challenge, key, update, embedded]);

  useEffect(() => {
    if (!ready || showBrief || !autoAdvance || composing || running || resetting || !editedForAuto.current) return;
    const nextLine = nextGuidedLine(draft, challenge);
    if (nextLine === null) return;
    const timer = window.setTimeout(() => {
      if (latest.current !== draft || !editedForAuto.current || document.visibilityState === "hidden" || !codeColumn.current?.contains(document.activeElement)) return;
      editedForAuto.current = false;
      update({ ...draft, line: nextLine });
    }, 950);
    return () => clearTimeout(timer);
  }, [draft, challenge, ready, showBrief, autoAdvance, composing, running, resetting, update]);

  useLayoutEffect(() => {
    if (!ready || !focusStep.current) return;
    focusStep.current = false;
    missionHeading.current?.focus({ preventScroll: true });
  }, [ready, showBrief, draft.line, draft.mission]);

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

  return <section className={s.studio} data-guided-lab data-focus={focusMode && !showBrief && !missionPassed} onCompositionStart={() => setComposing(true)} onCompositionEnd={() => setComposing(false)}>
    {!embedded && <header className={s.header}>
      <Link href={`/estudante/pratica?linguagem=${challenge.linguagem}#experimentos`}><ArrowLeft size={16}/> Laboratório</Link>
      <span>{lang} · {challenge.dificuldade}</span>
      <button onClick={onFreeMode}>Modo livre</button>
    </header>}
    {!embedded && <div className={s.title}><div><p className={s.eyebrow}>ORBITAMOS / CÓDIGO NO SEU RITMO</p><h1>{challenge.titulo}</h1></div><span className={s.mode}>Passo a passo</span></div>}
    {!embedded && <PracticeJourney challenge={challenge}/>}
    {showBrief ? <PracticeBrief challenge={challenge} onStart={() => { focusStep.current = true; setShowBrief(false); update({ ...draft, started: true }); }}/> : <>
    {!embedded && <PracticeBrief challenge={challenge} compact onReview={() => { editedForAuto.current = false; setShowBrief(true); }}/>}
    {!missionPassed && <div className={s.focusTools}><button type="button" aria-pressed={focusMode} onPointerDown={event => event.preventDefault()} onClick={() => { editedForAuto.current = false; setFocusMode(value => !value); }}>Foco no código<span aria-hidden="true">{focusMode ? "Ligado" : "Desligado"}</span></button><span>{focusMode ? `Etapa ${draft.line + 1}/${lines.length} · Avanço ${autoAdvance ? "automático" : "manual"}` : "Menos distrações, mesma orientação. Você escolhe quando ativar."}</span></div>}
    <div className={s.guideControls}><label><input type="checkbox" checked={autoAdvance} onChange={event => { editedForAuto.current = false; setAutoAdvance(event.target.checked); }}/>Avanço automático</label><span>{autoAdvance ? "Terminou a linha? O guia muda após uma breve pausa. Não executa sozinho." : "No seu ritmo: use Próxima etapa quando terminar a linha."}</span></div>
    <div className={s.progress} role="group" aria-label={`Missão ${draft.mission + 1} de ${challenge.steps.length}, etapa ${draft.line + 1} de ${lines.length}`}>
      {lines.map((_, i) => <span key={i} data-done={i < draft.line || missionPassed} data-active={i === draft.line}/>)}
    </div>
    <div className={s.bench}>
      <section className={s.lesson} data-passed={missionPassed} aria-label="Orientação da etapa">
        <div className={s.stepMeta}><span>MISSÃO {draft.mission + 1}/{challenge.steps.length}</span><span>ETAPA {draft.line + 1} DE {lines.length}</span></div>
        <h2 ref={missionPassed ? missionHeading : undefined} tabIndex={-1}>{completed ? "Você escreveu. E fez funcionar." : missionPassed ? "Missão executada com sucesso." : "Seu plano nesta missão"}</h2>
        <p>{completed ? "Agora experimente sem a referência. Entender também é conseguir prever o resultado e resolver uma variação." : missionPassed ? challenge.steps[draft.mission].acerto : challenge.steps[draft.mission].instrucao}</p>
        {!missionPassed && <>
          <div className={s.example}><span>{draft.line === 0 && draft.mission === 0 ? "DIGITE NO CAMPO SEU CÓDIGO" : "ACRESCENTE EM UMA NOVA LINHA"}</span><pre>{current.code}</pre></div>
          <p className={s.hint}>{challenge.linguagem === "python" ? "Use Recuo para inserir 4 espaços. Fora de um bloco, volte ao início da linha." : "Mantenha o código anterior. Use a tecla ↵ para começar uma nova linha."}</p>
        </>}
        <div className={s.feedback} role="status" aria-live="polite">
          {missionPassed ? <><Check size={18}/> Os testes desta missão passaram.</> : matches ? <><Check size={18}/> Escrita conferida. {finalLine ? "Agora execute para testar de verdade." : autoAdvance ? "O guia avança após sua pausa no editor; você também pode usar Próxima etapa." : "Pode seguir para a próxima."}</> : <>Escreva a etapa no campo “Seu código”. Conferir a escrita é diferente de executar e testar.</>}
        </div>
        {!missionPassed && !enhanced && !matches && <button className={s.writeHere} onClick={() => textarea.current?.focus()}>Escrever esta etapa<ArrowRight size={16}/></button>}
        {!completed && (!finalLine || missionPassed) && <button className={s.primary} disabled={running || (!matches && !missionPassed)} onClick={advance}>{missionPassed ? "Próxima missão" : "Próxima etapa"}<ArrowRight size={17}/></button>}
        {draft.line > 0 && !missionPassed && <button className={s.backStep} onClick={() => { editedForAuto.current = false; focusStep.current = true; update({ ...draft, line: draft.line - 1 }); }}>Rever etapa anterior</button>}
        {completed && !embedded && <div className={s.nextActions}>{practiceChecks[challenge.slug] && <a href="#practice-check">Aplicar o que aprendi · pergunta extra<ArrowRight size={16}/></a>}<button className={s.primary} onClick={onFreeMode}>Praticar sem o guia<ArrowRight size={17}/></button>{next ? <Link href={`/estudante/pratica/${next.slug}`}>Próximo desafio: {next.titulo}<ArrowRight size={16}/></Link> : challenge.linguagem === "csharp" ? <Link href="/estudante/trilhas/csharp">Continue na trilha C# &amp; .NET<ArrowRight size={16}/></Link> : <Link href={`/estudante/pratica?linguagem=${challenge.linguagem}#experimentos`}>Revisar os fundamentos de {lang}<ArrowRight size={16}/></Link>}</div>}
        <details className={s.details}><summary>Objetivo, exemplos e próximo nível</summary><p>{challenge.steps[draft.mission].instrucao}</p>{challenge.exemplo && <pre>{challenge.exemplo}</pre>}<p>1. Siga o exemplo para conhecer a sintaxe.<br/>2. Preveja a saída antes de executar.<br/>3. No modo livre, resolva sem consultar e teste outros valores.</p><p>Este treino trabalha fundamentos. Projetos maiores exigem também depuração, testes e decisões próprias.</p>{challenge.linguagem === "csharp" && <p>C# usa um executor didático limitado, não o ambiente .NET completo.</p>}</details>
      </section>
      <section ref={codeColumn} className={s.codeColumn} aria-label="Escreva e execute">
        <div className={s.filebar}>{enhanced ? <strong>Seu código</strong> : <label htmlFor="guided-code">Seu código</label>}<span>rascunho.{challenge.linguagem === "python" ? "py" : challenge.linguagem === "csharp" ? "cs" : "js"}</span></div>
        <p className={s.editorHint} id="guided-editor-hint">Toque no campo para digitar. Você escreve o programa; nada é preenchido automaticamente.</p>
        {!missionPassed && <div className={s.writingPrompt}><div role="status" aria-live="polite"><span>AGORA, ESCREVA / {draft.line + 1} DE {lines.length}</span><h2 ref={missionHeading} tabIndex={-1}>{current.title}</h2></div><p className={s.fullExplanation}>{current.why}</p><code>{current.code}</code><details className={s.focusExplanation} key={`${draft.mission}-${draft.line}`}><summary>Entender esta linha</summary><p>{current.why}</p></details><small>{draft.line ? "Mantenha as linhas anteriores e acrescente esta em uma nova linha." : "Comece digitando esta linha. Você pode ir no seu ritmo."}</small></div>}
        {enhanced ? <div className={s.enhanced}><ReliableCodeEditor value={draft.code} language={challenge.linguagem} onChange={changeCode}/></div> : <div className={s.inputWrap}>
          <div ref={gutter} className={s.numbers} aria-hidden="true">{Array.from({ length: Math.max(6, draft.code.split("\n").length) }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
          <textarea ref={textarea} id="guided-code" aria-label="Seu código" aria-describedby="guided-editor-hint" value={draft.code} onChange={event => changeCode(event.target.value)} onScroll={event => { if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop; }} placeholder="Toque aqui e escreva sua primeira linha…" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} maxLength={100000} wrap="off" rows={Math.min(14, Math.max(6, draft.code.split("\n").length + 1))} onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); insert(challenge.linguagem === "python" ? "    " : "  "); } if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void run(); } }}/>
        </div>}
        {!enhanced && <div className={s.keys} role="group" aria-label="Teclas para programar">{practiceSymbols(challenge.linguagem).map(symbol => <button key={symbol} type="button" aria-label={symbol === "Recuo" ? "Inserir recuo" : symbol === "↵" ? "Nova linha" : `Inserir ${symbol}`} onPointerDown={event => event.preventDefault()} onClick={() => insert(symbol === "Recuo" ? (challenge.linguagem === "python" ? "    " : "  ") : symbol === "↵" ? "\n" : symbol)}>{symbol}</button>)}</div>}
        {!missionPassed && <div className={s.mobileSupport}>{matches && <p role="status">Escrita conferida. {finalLine ? "Agora execute para testar." : autoAdvance ? "O guia avança depois de uma pausa na digitação." : "Toque em Continuar para próxima etapa."}</p>}{draft.line > 0 && <button onClick={() => { editedForAuto.current = false; focusStep.current = true; update({ ...draft, line: draft.line - 1 }); }}>Rever etapa anterior</button>}</div>}
        {!fullMatches && !missionPassed && <div className={s.runGuidance} id="guided-run-hint"><p>{allowPartialRun ? "Teste exploratório: um bloco incompleto pode dar erro. Isso não significa que você não consegue aprender." : "Primeiro monte as linhas desta missão. Depois, Executar código mostra o resultado e verifica se a regra funciona."}</p><button aria-pressed={allowPartialRun} onClick={() => { editedForAuto.current = false; setAllowPartialRun(!allowPartialRun); }}>{allowPartialRun ? "Voltar à execução guiada" : "Quero testar meu código mesmo assim"}</button></div>}
        {fullMatches && !missionPassed && <p className={s.readyToRun}>As linhas estão montadas. Preveja a saída e toque em Executar código para conferir.</p>}
        <div className={s.actions}>
          {running ? <button key="stop" className={s.primary} onClick={() => activeRun.current?.abort()}><Square size={17}/>Parar execução</button> : <button key="run" className={s.primary} disabled={!canRun} aria-describedby={!fullMatches && !missionPassed ? "guided-run-hint" : undefined} onClick={() => void run()}><Play size={17}/>Executar código</button>}
          <button aria-label="Desfazer última edição" disabled={running || !history.current.length} onClick={() => { editedForAuto.current = false; const code = history.current.pop(); if (code !== undefined) { update({ ...draft, code, passed: draft.passed.filter(n => n < draft.mission) }); setResult(null); } }}><Undo2 size={16}/>Desfazer</button>
          <button ref={resetButton} onClick={() => setResetting(true)}><RotateCcw size={16}/>Reiniciar</button>
        </div>
        {!completed && (!finalLine || missionPassed) && <button className={s.continueWriting} disabled={running || (!matches && !missionPassed)} onClick={advance}>{matches || missionPassed ? <Check size={16}/> : null}{missionPassed ? "Continuar para próxima missão" : "Continuar para próxima etapa"}<ArrowRight size={16}/></button>}
        {resetting && <div className={s.reset} role="group" aria-label="Confirmar reinício"><strong>Recomeçar este desafio guiado?</strong><p>O código e as etapas deste modo serão reiniciados. Seu rascunho do modo livre não muda.</p><button ref={cancelReset} onClick={() => { setResetting(false); resetButton.current?.focus(); }}>Continuar editando</button><button onClick={reset}>Sim, reiniciar</button></div>}
        {undoDraft && <div className={s.reset}><p>O código anterior está disponível até você sair desta página.</p><button onClick={() => { editedForAuto.current = false; activeRun.current?.abort(); activeRun.current = null; setRunning(false); update(undoDraft); setUndoDraft(null); setResult(null); }}>Recuperar código anterior ao reinício</button></div>}
        <div className={s.save}>{save} · Rascunhos não sincronizam entre aparelhos.</div>
        <section className={s.console} aria-label="Resultado da execução"><div><strong>Console / resultado</strong>{result && <button onClick={() => setResult(null)}>Limpar saída</button>}</div><div role="status" aria-live="polite">{running ? <p>{challenge.linguagem === "python" ? "Preparando Python e executando… A primeira abertura baixa o ambiente e precisa de conexão." : "Executando seu programa…"}</p> : result ? <><pre>{result.output || "Sem saída no console."}</pre>{result.cancelled ? <p>Execução interrompida. Seu código está preservado.</p> : result.error ? <div className={s.error}><strong>Ainda não rodou. Vamos ajustar.</strong><p>{result.errorLine ? `Confira a linha ${result.errorLine}. ` : ""}{/indent|syntax/i.test(result.error) ? "Confira os recuos, as aspas e os sinais da etapa. Um bloco incompleto pode dar erro antes da última linha." : "Confira os nomes e valores. Compare seu código com a etapa antes de tentar de novo."}</p><pre>{result.error}</pre></div> : <p>{missionPassed ? "Resultado validado. Boa!" : "Executou, mas ainda não atende à missão. Termine as etapas e compare a saída com o objetivo."}</p>}</> : <p>A saída aparece aqui ao executar. Enquanto você monta um bloco, ele pode estar incompleto — tudo bem.</p>}</div></section>
        <button className={s.editorToggle} onClick={() => setEnhanced(value => !value)}>{enhanced ? "Usar editor simples (recomendado no celular)" : "Usar editor com realce e sugestões"}</button>
      </section>
    </div>
    {completed && !embedded && practiceChecks[challenge.slug] && <PracticeCheck key={practiceChecks[challenge.slug].id} check={practiceChecks[challenge.slug]} userId={userId} onPractice={onFreeMode}/>}
    </>}
    <footer className={s.footer}>Treine numa pausa, com segurança e no seu tempo. O laboratório não executa sozinho enquanto você digita.</footer>
  </section>;
}
