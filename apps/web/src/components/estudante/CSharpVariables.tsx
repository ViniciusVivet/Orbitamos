"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ListChecks, Map, Play, RotateCcw, Square } from "lucide-react";
import { csharpStages } from "@/lib/csharpTrack";
import { newVariablesProgress, type VariableCode, type VariableQuiz, type VariablesProgress } from "@/lib/csharpVariables";
import { runCSharpActivity, type LearningRun } from "@/lib/csharpFeedback";
import { csharpModules, csharpProgressKey, type CSharpModuleKind } from "@/lib/csharpModules";
import GuidedPractice from "./GuidedPractice";
import s from "./CSharpTrack.module.css";
import m from "./CSharpVariables.module.css";

function CodeActivity({ activity, code, onEdit, done, onPass, onNext, finalActivity }: { activity: VariableCode; code: string; onEdit: (value: string) => void; done: boolean; onPass: () => void; onNext: () => void; finalActivity: boolean }) {
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
      setResult(output);
      if (output.passed) onPass();
    } catch {
      if (active.current === controller) setResult({ output: "", error: "Não foi possível executar agora. Seu código continua aqui; tente novamente.", timedOut: false, passed: false, feedback: "A execução não ficou disponível agora. Tente novamente; seu código foi preservado.", checks: [] });
    } finally { if (active.current === controller) { active.current = null; setRunning(false); } }
  }
  return <div className={m.codeActivity}>
    <div className={m.instruction}><p>{activity.brief}</p><details><summary>Entenda o conceito antes de escrever</summary><p>{activity.lesson}</p></details><div className={m.expected}><span>SAÍDA ESPERADA</span><pre>{activity.expected}</pre></div><button className={s.textButton} aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? "Ocultar pista" : "Preciso de uma pista"}</button>{hint && <p className={s.notice}>{activity.hint}</p>}</div>
    <div className={s.workpad}><div className={m.editorHead}><label htmlFor="variables-code">Seu código C#</label><span>Program.cs</span></div><p className={s.small}>Escreva aqui, depois execute. Você pode errar e tentar de novo.</p>
      <textarea id="variables-code" ref={editor} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" rows={7} maxLength={100000} value={code} onChange={event => edit(event.target.value)} placeholder="Toque aqui e escreva seu programa…"/>
      <div className={s.symbols} role="group" aria-label="Símbolos de código">{['"', "(", ")", ";", "=", "+", "-", "{", "}", ">", "<", "&", "|", "!", "↵"].map(symbol => <button key={symbol} aria-label={`Inserir ${symbol}`} onPointerDown={event => event.preventDefault()} onClick={() => { const input = editor.current; if (!input) return; const start = input.selectionStart; const value = symbol === "↵" ? "\n" : symbol; edit(code.slice(0, start) + value + code.slice(input.selectionEnd)); requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + value.length, start + value.length); }); }}>{symbol}</button>)}</div>
      <div className={s.actions}>{running ? <button className={s.primary} onClick={() => active.current?.abort()}><Square size={16}/>Parar execução</button> : <button className={s.primary} disabled={!code.trim()} onClick={() => void run()}><Play size={16}/>Executar e verificar</button>}<button className={s.secondary} aria-expanded={resetting} onClick={() => setResetting(!resetting)}><RotateCcw size={15}/>Reiniciar</button></div>
      {resetting && <div className={s.notice}><p>Reiniciar somente esta atividade? Você poderá recuperar o código anterior.</p><div className={s.actions}><button className={s.secondary} onClick={() => { setBackup(code); edit(activity.starter); setResetting(false); editor.current?.focus(); }}>Sim, reiniciar</button><button className={s.textButton} onClick={() => setResetting(false)}>Continuar editando</button></div></div>}
      {backup !== null && <button className={s.textButton} onClick={() => { edit(backup); setBackup(null); editor.current?.focus(); }}>Recuperar código anterior</button>}
      <div className={s.terminal} role="status" aria-live="polite"><span>CONSOLE / RESULTADO</span>{running ? <p>Executando e verificando os casos…</p> : result ? <><pre>{result.output || "Nenhuma saída."}</pre><p className={result.passed ? s.success : s.error}>{!result.passed && !result.cancelled ? "Ainda não passou. " : ""}{result.feedback}</p>{result.error && <details><summary>Mensagem técnica</summary><pre>{result.error}</pre></details>}{result.checks.length > 0 && <ul className={m.testCases} aria-label="Casos de teste">{result.checks.map(check => <li key={check.label} data-passed={check.passed}><strong>{check.passed ? "✓" : "○"} {check.label}</strong>{!check.passed && <><span>Esperado: {check.expected}</span><span>Recebido: {check.actual}</span></>}</li>)}</ul>}</> : <p>{done ? "Você já validou esta prática. Pode executar novamente." : "A saída e o feedback aparecem aqui ao executar."}</p>}</div>
      {done && <button className={s.primary} onClick={onNext}>{finalActivity ? "Ver minha entrega" : "Próxima atividade"}<ArrowRight size={17}/></button>}
    </div>
  </div>;
}

function QuizActivity({ activity, answer, onAnswer, onNext }: { activity: VariableQuiz; answer: number | undefined; onAnswer: (answer: number) => void; onNext: () => void }) {
  return <section className={m.quiz} aria-label="Questão de múltipla escolha"><p className={s.small}>Pausa curta para pensar. Depois você volta ao código.</p>{activity.code && <pre>{activity.code}</pre>}<fieldset><legend>{activity.prompt}</legend>{activity.options.map((option, i) => <label key={option} data-selected={answer === i}><input type="radio" name={activity.id} checked={answer === i} onChange={() => onAnswer(i)}/><span>{option}</span></label>)}</fieldset><p className={answer === activity.answer ? s.success : s.small} role="status">{answer === undefined ? "Escolha uma alternativa. Você pode tentar de novo e entender cada resposta." : activity.feedback[answer]}</p>{answer === activity.answer && <button className={s.primary} onClick={onNext}>Continuar para a próxima<ArrowRight size={17}/></button>}</section>;
}

export default function CSharpVariables({ userId, onFullMap, moduleKind = "variables", onModuleChange }: { userId: string | number | null; onFullMap: () => void; moduleKind?: CSharpModuleKind; onModuleChange?: (module: CSharpModuleKind) => void }) {
  const config = csharpModules[moduleKind];
  const { label, activities: variableActivities, pilot: guidedChallenge } = config;
  const [progress, setProgress] = useState<VariablesProgress>(newVariablesProgress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const latest = useRef(progress);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusActivity = useRef(false);
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
  function advance() { if (next) select(next.id); else document.getElementById("variables-summary")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  const activityList = <ol className={m.activityList}>{variableActivities.map((a, i) => <li key={a.id}><button aria-current={a.id === activity.id ? "step" : undefined} onClick={() => select(a.id)}><span className={m.activityNumber}>{progress.done.includes(a.id) ? <Check size={14} aria-label="Concluída"/> : String(i + 1).padStart(2, "0")}</span><span>{a.title}<small>{a.kind === "quiz" ? "Questão rápida" : a.kind === "guided" ? "Código guiado" : "Escreva código"}</small></span></button></li>)}</ol>;
  if (!ready) return <p role="status">Abrindo suas práticas de {label.toLowerCase()}…</p>;
  return <section className={m.module} data-variables-module data-module-kind={moduleKind}>
    <div className={m.location}><div><span>C# & .NET / ETAPA {String(config.stage + 1).padStart(2, "0")} DE 08 / {config.section}</span><strong>Você está aprendendo: {label}</strong></div><button onClick={onFullMap}><Map size={17}/>Mapa completo</button></div>
    {storageError && <p className={s.notice} role="alert">O navegador não permitiu salvar. Copie seu código antes de sair.</p>}
    <div className={m.workspace}>
      <aside className={m.rail} aria-label={`Mapa do módulo de ${label.toLowerCase()}`}><span className={s.kicker}>SEU CAMINHO NESTE MÓDULO</span><h2>{label}, na prática.</h2><p>{codeCount} práticas de código · {quizCount} questões</p><div className={m.progress}><span style={{ width: `${progress.done.length / variableActivities.length * 100}%` }}/></div><p>{progress.done.length} de {variableActivities.length} atividades concluídas</p>{activityList}<div className={m.courseMap}><span>DEPOIS DE {label.toUpperCase()}</span><p>{config.upcoming}</p><button onClick={onFullMap}>Ver as 8 etapas da formação<ArrowRight size={14}/></button></div></aside>
      <div className={m.main}>
        <details className={m.mobileMap}><summary><ListChecks size={17}/>Atividades do módulo · {progress.done.length}/{variableActivities.length}</summary>{activityList}</details>
        <header className={m.activityHeading}><span className={s.kicker}>ATIVIDADE {index + 1} DE {variableActivities.length} / {activity.kind === "quiz" ? "MÚLTIPLA ESCOLHA" : "AGORA É CÓDIGO"}</span><h1 ref={heading} tabIndex={-1}>{activity.title}</h1><p><strong>Assunto: {activity.topic}.</strong> {activity.goal}</p></header>
        {activity.kind === "guided" && <><p className={m.startNote}>Comece agora: leia a linha indicada, digite no campo <strong>Seu código</strong> e avance. Você escreve o programa; nada é preenchido automaticamente.</p><GuidedPractice embedded challenge={guidedChallenge} userId={userId} onValidationChange={valid => mark("guided", valid)} onFreeMode={advance}/>{progress.done.includes("guided") && <button className={s.primary} onClick={advance}>Próxima atividade<ArrowRight size={17}/></button>}</>}
        {activity.kind === "code" && <CodeActivity key={activity.id} activity={activity} code={progress.drafts[activity.id] ?? activity.starter} done={progress.done.includes(activity.id)} onEdit={code => update({ drafts: { ...latest.current.drafts, [activity.id]: code }, done: latest.current.done.filter(id => id !== activity.id) })} onPass={() => mark(activity.id, true)} onNext={advance} finalActivity={!next}/>}
        {activity.kind === "quiz" && <QuizActivity key={activity.id} activity={activity} answer={progress.answers[activity.id]} onAnswer={answer => update({ answers: { ...latest.current.answers, [activity.id]: answer }, done: [...latest.current.done.filter(id => id !== activity.id), ...(answer === activity.answer ? [activity.id] : [])] })} onNext={advance}/>}
        <div className={m.next}><button disabled={index === 0} onClick={() => select(variableActivities[index - 1].id)}><ArrowLeft size={15}/>Anterior</button><span>{next ? <>A seguir: <strong>{next.topic}</strong></> : `Última prática do módulo de ${label.toLowerCase()}`}</span>{next && <button onClick={advance}>Explorar próxima<ArrowRight size={15}/></button>}</div>
        <p className={s.small}>Você pode explorar as atividades, mas só a execução validada ou a resposta correta marca a conclusão.</p>
        <section className={m.summary} id="variables-summary"><span className={s.kicker}>SEU PROGRESSO EM {label.toUpperCase()}</span><h2>{complete ? `${label}: primeiras práticas concluídas.` : "Aprender é conseguir fazer."}</h2><p><strong>{codeDone}/{codeCount}</strong> práticas de código validadas · <strong>{quizDone}/{quizCount}</strong> questões respondidas corretamente</p><p>{complete ? config.completion : "Conclua as práticas e as questões no seu ritmo. Isso mostra seu avanço neste módulo — não uma porcentagem de toda a formação."}</p>{complete && config.next && onModuleChange && <button className={s.primary} onClick={() => onModuleChange(config.next!)}>Continuar para {csharpModules[config.next].label.toLowerCase()}<ArrowRight size={17}/></button>}<button className={s.textButton} onClick={onFullMap}>Onde isso entra na formação?<ArrowRight size={16}/></button></section>
        <p className={s.runtimeNote}>C# didático no navegador: este executor não é o compilador .NET completo. O progresso fica neste navegador, sem sincronização entre aparelhos.</p>
      </div>
    </div>
    <details className={m.overview}><summary>Visão geral: do primeiro programa à entrega profissional</summary><ol>{csharpStages.map((stage, i) => <li key={stage.id}><strong>{String(i + 1).padStart(2, "0")} · {stage.title}</strong><span>{i === config.stage ? `Você está aqui: ${label.toLowerCase()}` : stage.available ? "Práticas disponíveis" : "Planejado"}</span><p>{stage.skill}</p></li>)}</ol></details>
  </section>;
}
