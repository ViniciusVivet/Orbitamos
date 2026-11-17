"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, ListChecks, Map, Play, RotateCcw, Square, X } from "lucide-react";
import { newVariablesProgress, recordCSharpHelp, recordCSharpRun, type CSharpCodeEvidence, type VariableCode, type VariableQuiz, type VariablesProgress } from "@/lib/csharpVariables";
import { runCSharpActivity, type LearningRun } from "@/lib/csharpFeedback";
import { csharpModules, csharpProgressKey, type CSharpModuleKind } from "@/lib/csharpModules";
import GuidedPractice from "./GuidedPractice";
import s from "./CSharpTrack.module.css";
import m from "./CSharpVariables.module.css";

function CodeActivity({ activity, code, onEdit, done, onPass, onNext, finalActivity, evidence, onHelp, onRunEvidence }: { activity: VariableCode; code: string; onEdit: (value: string) => void; done: boolean; onPass: () => void; onNext: () => void; finalActivity: boolean; evidence?: CSharpCodeEvidence; onHelp: (kind: "hint" | "concept") => void; onRunEvidence: (result: LearningRun) => void }) {
  const [result, setResult] = useState<LearningRun | null>(null);
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [backup, setBackup] = useState<string | null>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => { active.current?.abort(); active.current = null; }, []);
  function edit(value: string) {
    active.current?.abort(); active.current = null; setRunning(false); setResult(null); onEdit(value);
  }
  async function run() {
    if (running || !code.trim()) return;
    const controller = new AbortController(); active.current = controller;
    setRunning(true); setResult(null);
    try {
      const output = await runCSharpActivity(activity, code, controller.signal);
      if (active.current !== controller) return;
      if (controller.signal.aborted) { setResult({ ...output, cancelled: true, passed: false, feedback: "Execução interrompida. Seu código está preservado." }); return; }
      setResult(output);
      if (!output.cancelled) onRunEvidence(output);
      if (output.passed && !output.cancelled) onPass();
    } catch {
      if (active.current === controller) setResult({ output: "", error: "Não foi possível executar agora. Seu código continua aqui; tente novamente.", timedOut: false, passed: false, feedback: "A execução não ficou disponível agora. Tente novamente; seu código foi preservado.", checks: [] });
    } finally { if (active.current === controller) { active.current = null; setRunning(false); } }
  }
  return <div className={m.codeActivity}>
    <div className={m.instruction}><p>{activity.brief}</p><details onToggle={event => { if (event.currentTarget.open) onHelp("concept"); }}><summary>Entenda o conceito antes de escrever</summary><p>{activity.lesson}</p></details><div className={m.expected}><span>SAÍDA ESPERADA</span><pre>{activity.expected}</pre></div><button className={s.textButton} aria-expanded={hint} onClick={() => { if (!hint) onHelp("hint"); setHint(!hint); }}>{hint ? "Ocultar pista" : evidence?.hintConsulted ? "Rever pista" : "Preciso de uma pista"}</button>{hint && <p className={s.notice}>{activity.hint}</p>}</div>
    <div className={s.workpad}><div className={m.editorHead}><label htmlFor="variables-code">Seu código C#</label><span>Program.cs</span></div><p className={s.small}>Escreva aqui, depois execute. Você pode errar e tentar de novo.</p>
      <textarea id="variables-code" ref={editor} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" rows={7} maxLength={100000} value={code} onChange={event => edit(event.target.value)} placeholder="Toque aqui e escreva seu programa…"/>
      <div className={s.symbols} role="group" aria-label="Símbolos de código">{['"', "(", ")", ";", "=", "+", "-", "{", "}", ">", "<", "&", "|", "!", "↵"].map(symbol => <button key={symbol} aria-label={`Inserir ${symbol}`} onPointerDown={event => event.preventDefault()} onClick={() => { const input = editor.current; if (!input) return; const start = input.selectionStart; const value = symbol === "↵" ? "\n" : symbol; edit(code.slice(0, start) + value + code.slice(input.selectionEnd)); requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + value.length, start + value.length); }); }}>{symbol}</button>)}</div>
      <div className={s.actions}>{running ? <button className={s.primary} onClick={() => active.current?.abort()}><Square size={16}/>Parar execução</button> : <button className={done ? s.secondary : s.primary} disabled={!code.trim()} onClick={() => void run()}><Play size={16}/>Executar e verificar</button>}<button className={s.secondary} aria-expanded={resetting} onClick={() => setResetting(!resetting)}><RotateCcw size={15}/>Reiniciar</button></div>
      {resetting && <div className={s.notice}><p>Reiniciar somente esta atividade? Você poderá recuperar o código anterior.</p><div className={s.actions}><button className={s.secondary} onClick={() => { setBackup(code); edit(activity.starter); setResetting(false); editor.current?.focus(); }}>Sim, reiniciar</button><button className={s.textButton} onClick={() => setResetting(false)}>Continuar editando</button></div></div>}
      {backup !== null && <button className={s.textButton} onClick={() => { edit(backup); setBackup(null); editor.current?.focus(); }}>Recuperar código anterior</button>}
      {(running || result) && <div className={s.terminal} role="status" aria-live="polite"><span>CONSOLE / RESULTADO</span>{running ? <p>Executando e verificando os casos…</p> : result ? <><pre>{result.output || "Nenhuma saída."}</pre><p className={result.passed ? s.success : s.error}>{!result.passed && !result.cancelled ? "Ainda não passou. " : ""}{result.feedback}</p>{result.error && <details><summary>Mensagem técnica</summary><pre>{result.error}</pre></details>}{result.checks.length > 0 && <ul className={m.testCases} aria-label="Casos de teste">{result.checks.map(check => <li key={check.label} data-passed={check.passed}><strong>{check.passed ? "✓" : "○"} {check.label}</strong>{!check.passed && <><span>Esperado: {check.expected}</span><span>Recebido: {check.actual}</span></>}</li>)}</ul>}</> : <p>{done ? "Você já validou esta prática. Pode executar novamente." : "A saída e o feedback aparecem aqui ao executar."}</p>}</div>}
      {evidence?.lastRun && <p className={s.small} data-csharp-run-evidence>Última verificação registrada: {evidence.lastRun.passed ? "aprovada" : "a revisar"} · {evidence.lastRun.helped ? "após consulta à ajuda" : "sem consulta à ajuda registrada até então"}. {evidence.attempts} {evidence.attempts === 1 ? "verificação" : "verificações"} nesta atividade. Isso não é uma nota de domínio.</p>}
      {done && <button className={s.primary} onClick={onNext}>{finalActivity ? "Ver minha entrega" : "Próxima atividade"}<ArrowRight size={17}/></button>}
    </div>
  </div>;
}

function QuizActivity({ activity, answer, onAnswer, onNext }: { activity: VariableQuiz; answer: number | undefined; onAnswer: (answer: number) => void; onNext: () => void }) {
  return <section className={m.quiz} aria-label="Questão de múltipla escolha"><p className={s.small}>{activity.lesson ?? "Pausa curta para pensar. Depois você volta ao código."}</p>{activity.code && <pre>{activity.code}</pre>}<fieldset><legend>{activity.prompt}</legend>{activity.options.map((option, i) => <label key={option} data-selected={answer === i}><input type="radio" name={activity.id} checked={answer === i} onChange={() => onAnswer(i)}/><span>{option}</span></label>)}</fieldset><p className={answer === activity.answer ? s.success : s.small} role="status">{answer === undefined ? "Escolha uma alternativa. Você pode tentar de novo e entender cada resposta." : activity.feedback[answer]}</p>{answer === activity.answer && <button className={s.primary} onClick={onNext}>Continuar para a próxima<ArrowRight size={17}/></button>}</section>;
}

export default function CSharpVariables({ userId, onFullMap, onMethods, moduleKind = "variables", onModuleChange }: { userId: string | number | null; onFullMap: () => void; onMethods?: () => void; moduleKind?: CSharpModuleKind; onModuleChange?: (module: CSharpModuleKind) => void }) {
  const config = csharpModules[moduleKind];
  const { label, activities: variableActivities, pilot: guidedChallenge } = config;
  const [progress, setProgress] = useState<VariablesProgress>(newVariablesProgress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const latest = useRef(progress);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusActivity = useRef(false);
  const activityDialog = useRef<HTMLDialogElement>(null);
  const activityTrigger = useRef<HTMLButtonElement>(null);
  function closeActivities() {
    activityDialog.current?.close();
    activityTrigger.current?.focus({ preventScroll: true });
  }
  const key = userId === null ? null : config.key(userId);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const restored = config.restore(key ? localStorage.getItem(key) : null, userId !== null ? localStorage.getItem(csharpProgressKey(userId)) : null);
        latest.current = restored; setProgress(restored);
      } catch { setStorageError(true); }
      setReady(true);
    });
    return () => { active = false; };
  }, [key, userId, config]);
  useEffect(() => {
    if (!ready || !key) return;
    const save = () => { try { localStorage.setItem(key, JSON.stringify(latest.current)); } catch { setStorageError(true); } };
    const timer = window.setTimeout(save, 200);
    window.addEventListener("pagehide", save);
    return () => { clearTimeout(timer); save(); window.removeEventListener("pagehide", save); };
  }, [key, ready, progress]);
  useLayoutEffect(() => {
    if (!ready || !focusActivity.current) return;
    focusActivity.current = false;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [ready, progress.active]);
  function update(value: Partial<VariablesProgress>) { const next = { ...latest.current, ...value }; latest.current = next; setProgress(next); }
  function select(id: string) {
    if (id === latest.current.active) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
      return;
    }
    focusActivity.current = true;
    update({ active: id });
  }
  function mark(id: string, done: boolean) { if (latest.current.done.includes(id) === done) return; update({ done: [...latest.current.done.filter(item => item !== id), ...(done ? [id] : [])] }); }
  const index = variableActivities.findIndex(a => a.id === progress.active);
  const activity = variableActivities[index < 0 ? 0 : index];
  const next = variableActivities[index + 1];
  const complete = progress.done.length === variableActivities.length;
  const codeDone = variableActivities.filter(a => a.kind !== "quiz" && progress.done.includes(a.id)).length;
  const quizDone = variableActivities.filter(a => a.kind === "quiz" && progress.done.includes(a.id)).length;
  const quizCount = variableActivities.filter(a => a.kind === "quiz").length;
  const codeCount = variableActivities.length - quizCount;
  function advance() {
    if (next) { select(next.id); return; }
    const pending = variableActivities.find(item => !latest.current.done.includes(item.id));
    if (pending) select(pending.id);
    else document.getElementById("variables-summary")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  const activityList = <ol className={m.activityList}>{variableActivities.map((a, i) => <li key={a.id}><button aria-current={a.id === activity.id ? "step" : undefined} onClick={() => { activityDialog.current?.close(); select(a.id); }}><span className={m.activityNumber}>{progress.done.includes(a.id) ? <Check size={14} aria-label="Concluída"/> : String(i + 1).padStart(2, "0")}</span><span>{a.title}<small>{a.kind === "quiz" ? "Questão rápida" : a.kind === "guided" ? "Código guiado" : "Escreva código"}</small></span></button></li>)}</ol>;
  if (!ready) return <p role="status">Abrindo suas práticas de {label.toLowerCase()}…</p>;
  return <section className={m.module} data-variables-module data-module-kind={moduleKind}>
    {storageError && <p className={s.notice} role="alert">O navegador não permitiu salvar. Copie seu código antes de sair.</p>}
    <div className={m.workspace}>
      <header className={m.scene} data-mission-scene>
        <Image src="/images/academy/orbiservicos-workshop-v1.webp" alt="Orbi no balcão da oficina, organizando fichas de serviços junto a um notebook." fill sizes="(max-width: 767px) 100vw, 35vw" priority className={m.sceneImage}/>
        <div className={m.sceneCopy}>
          <button ref={activityTrigger} className={m.activityPicker} onClick={() => { activityTrigger.current?.focus({ preventScroll: true }); activityDialog.current?.showModal(); }} aria-haspopup="dialog"><ListChecks size={16}/>Prática {index + 1} de {variableActivities.length}<span>Atividades</span></button>
          <h1 ref={heading} tabIndex={-1}>{activity.title}</h1>
          <p>{activity.kind === "guided" ? moduleKind === "variables" ? "Um nome e uma contagem para o OrbiServiços." : moduleKind === "conditions" ? "Ajude o Orbi a decidir o próximo passo." : "Organize a fila de serviços com o Orbi." : activity.goal}</p>
        </div>
      </header>
      <div className={m.main}>
        {activity.kind === "guided" && <><GuidedPractice embedded challenge={guidedChallenge} userId={userId} onValidationChange={valid => mark("guided", valid)} onFreeMode={advance}/>{progress.done.includes("guided") && <button className={s.primary} onClick={advance}>Próxima atividade<ArrowRight size={17}/></button>}</>}
        {activity.kind === "code" && <CodeActivity key={activity.id} activity={activity} code={progress.drafts[activity.id] ?? activity.starter} done={progress.done.includes(activity.id)} evidence={progress.evidence[activity.id]} onHelp={kind => update({ evidence: { ...latest.current.evidence, [activity.id]: recordCSharpHelp(latest.current.evidence[activity.id], kind) } })} onRunEvidence={result => update({ evidence: { ...latest.current.evidence, [activity.id]: recordCSharpRun(latest.current.evidence[activity.id], result) } })} onEdit={code => update({ drafts: { ...latest.current.drafts, [activity.id]: code }, done: latest.current.done.filter(id => id !== activity.id) })} onPass={() => mark(activity.id, true)} onNext={advance} finalActivity={!next && complete}/>}
        {activity.kind === "quiz" && <QuizActivity key={activity.id} activity={activity} answer={progress.answers[activity.id]} onAnswer={answer => update({ answers: { ...latest.current.answers, [activity.id]: answer }, done: [...latest.current.done.filter(id => id !== activity.id), ...(answer === activity.answer ? [activity.id] : [])] })} onNext={advance}/>}
        {index > 0 && <button className={m.previous} onClick={() => select(variableActivities[index - 1].id)}><ArrowLeft size={15}/>Atividade anterior</button>}
        {complete && <section className={m.summary} id="variables-summary"><span className={s.kicker}>SEU PROGRESSO EM {label.toUpperCase()}</span><h2>{`${label}: primeiras práticas concluídas.`}</h2><p><strong>{codeDone}/{codeCount}</strong> práticas de código validadas · <strong>{quizDone}/{quizCount}</strong> questões respondidas corretamente</p><p>{config.completion}</p>{complete && config.next && onModuleChange && <button className={s.primary} onClick={() => onModuleChange(config.next!)}>Continuar para {csharpModules[config.next].label.toLowerCase()}<ArrowRight size={17}/></button>}{complete && moduleKind === "loops" && onMethods && <button className={s.primary} onClick={onMethods}>Continuar para métodos · projeto .NET<ArrowRight size={17}/></button>}<button className={s.textButton} onClick={onFullMap}>Onde isso entra na formação?<ArrowRight size={16}/></button></section>}
      </div>
    </div>
    <dialog ref={activityDialog} className={m.activityDialog} aria-labelledby="csharp-activities-title" onCancel={event => { event.preventDefault(); closeActivities(); }} onClick={event => { if (event.target === event.currentTarget) closeActivities(); }}>
      <div className={m.dialogContent}><header><div><p>{label} · {progress.done.length}/{variableActivities.length} concluídas</p><h2 id="csharp-activities-title">Suas atividades</h2></div><button aria-label="Fechar atividades" onClick={closeActivities}><X size={20}/></button></header>
        {activityList}
        <p className={m.dialogNote}>Pode explorar. Somente código validado ou resposta correta conclui uma atividade.</p>
        <button className={m.mapLink} onClick={() => { activityDialog.current?.close(); onFullMap(); }}><Map size={17}/>Ver o mapa da formação<ArrowRight size={15}/></button>
      </div>
    </dialog>
  </section>;
}
