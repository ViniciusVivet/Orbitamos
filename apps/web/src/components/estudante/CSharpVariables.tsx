"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ListChecks, Map, Play, RotateCcw, Square } from "lucide-react";
import { csharpStages } from "@/lib/csharpTrack";
import { csharpPilot, csharpProgressKey, newVariablesProgress, readVariablesProgress, variableActivities, variableCodePassed, variablesKey, type VariableCode, type VariableQuiz, type VariablesProgress } from "@/lib/csharpVariables";
import { runCSharpInWorker, type BrowserCodeResult } from "@/lib/browserCodeRunner";
import GuidedPractice from "./GuidedPractice";
import s from "./CSharpTrack.module.css";
import m from "./CSharpVariables.module.css";

function CodeActivity({ activity, code, onEdit, done, onPass, onNext }: { activity: VariableCode; code: string; onEdit: (value: string) => void; done: boolean; onPass: () => void; onNext: () => void }) {
  const [result, setResult] = useState<BrowserCodeResult | null>(null);
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
      const output = await runCSharpInWorker(code, 2500, controller.signal, activity.verification);
      if (active.current !== controller) return;
      setResult(output);
      if (!output.error && !output.cancelled && variableCodePassed(activity, code, output.output, output.verificationOutput)) onPass();
    } catch {
      if (active.current === controller) setResult({ output: "", error: "Não foi possível executar agora. Seu código continua aqui; tente novamente.", timedOut: false });
    } finally { if (active.current === controller) { active.current = null; setRunning(false); } }
  }
  return <div className={m.codeActivity}>
    <div className={m.instruction}><p>{activity.brief}</p><details><summary>Entenda o conceito antes de escrever</summary><p>{activity.lesson}</p></details><div className={m.expected}><span>SAÍDA ESPERADA</span><pre>{activity.expected}</pre></div><button className={s.textButton} aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? "Ocultar pista" : "Preciso de uma pista"}</button>{hint && <p className={s.notice}>{activity.hint}</p>}</div>
    <div className={s.workpad}><div className={m.editorHead}><label htmlFor="variables-code">Seu código C#</label><span>Program.cs</span></div><p className={s.small}>Escreva aqui, depois execute. Você pode errar e tentar de novo.</p>
      <textarea id="variables-code" ref={editor} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" rows={7} maxLength={100000} value={code} onChange={event => edit(event.target.value)} placeholder="Toque aqui e escreva seu programa…"/>
      <div className={s.symbols} role="group" aria-label="Símbolos de código">{['"', "(", ")", ";", "=", "+", "-", "↵"].map(symbol => <button key={symbol} aria-label={`Inserir ${symbol}`} onPointerDown={event => event.preventDefault()} onClick={() => { const input = editor.current; if (!input) return; const start = input.selectionStart; const value = symbol === "↵" ? "\n" : symbol; edit(code.slice(0, start) + value + code.slice(input.selectionEnd)); requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + value.length, start + value.length); }); }}>{symbol}</button>)}</div>
      <div className={s.actions}>{running ? <button className={s.primary} onClick={() => active.current?.abort()}><Square size={16}/>Parar execução</button> : <button className={s.primary} disabled={!code.trim()} onClick={() => void run()}><Play size={16}/>Executar e verificar</button>}<button className={s.secondary} aria-expanded={resetting} onClick={() => setResetting(!resetting)}><RotateCcw size={15}/>Reiniciar</button></div>
      {resetting && <div className={s.notice}><p>Reiniciar somente esta atividade? Você poderá recuperar o código anterior.</p><div className={s.actions}><button className={s.secondary} onClick={() => { setBackup(code); edit(activity.starter); setResetting(false); editor.current?.focus(); }}>Sim, reiniciar</button><button className={s.textButton} onClick={() => setResetting(false)}>Continuar editando</button></div></div>}
      {backup !== null && <button className={s.textButton} onClick={() => { edit(backup); setBackup(null); editor.current?.focus(); }}>Recuperar código anterior</button>}
      <div className={s.terminal} role="status" aria-live="polite"><span>CONSOLE / RESULTADO</span>{running ? <p>Executando…</p> : result ? <><pre>{result.output || "Nenhuma saída."}</pre>{result.cancelled ? <p>Execução interrompida. Seu código está preservado.</p> : result.error ? <><p className={s.error}>Vamos ajustar. Confira nomes, valores e sinais.</p><pre>{result.error}</pre></> : <p className={done ? s.success : s.error}>{done ? "Código validado! Você aplicou o conceito e produziu a saída esperada." : "Ainda não passou. Confira os nomes, os tipos e as operações pedidos. Não basta imprimir a resposta pronta."}</p>}</> : <p>{done ? "Você já validou esta prática. Pode executar novamente." : "A saída e o feedback aparecem aqui ao executar."}</p>}</div>
      {done && <button className={s.primary} onClick={onNext}>Próxima atividade<ArrowRight size={17}/></button>}
    </div>
  </div>;
}

function QuizActivity({ activity, answer, onAnswer, onNext }: { activity: VariableQuiz; answer: number | undefined; onAnswer: (answer: number) => void; onNext: () => void }) {
  return <section className={m.quiz} aria-label="Questão de múltipla escolha"><p className={s.small}>Pausa curta para pensar. Depois você volta ao código.</p>{activity.code && <pre>{activity.code}</pre>}<fieldset><legend>{activity.prompt}</legend>{activity.options.map((option, i) => <label key={option} data-selected={answer === i}><input type="radio" name={activity.id} checked={answer === i} onChange={() => onAnswer(i)}/><span>{option}</span></label>)}</fieldset><p className={answer === activity.answer ? s.success : s.small} role="status">{answer === undefined ? "Escolha uma alternativa. Você pode tentar de novo e entender cada resposta." : activity.feedback[answer]}</p>{answer === activity.answer && <button className={s.primary} onClick={onNext}>Continuar para a próxima<ArrowRight size={17}/></button>}</section>;
}

export default function CSharpVariables({ userId, onFullMap }: { userId: string | number | null; onFullMap: () => void }) {
  const [progress, setProgress] = useState<VariablesProgress>(newVariablesProgress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const latest = useRef(progress);
  const heading = useRef<HTMLHeadingElement>(null);
  const key = userId === null ? null : variablesKey(userId);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const restored = readVariablesProgress(key ? localStorage.getItem(key) : null, userId !== null ? localStorage.getItem(csharpProgressKey(userId)) : null);
        latest.current = restored; setProgress(restored);
      } catch { setStorageError(true); }
      setReady(true);
    });
    return () => { active = false; };
  }, [key, userId]);
  useEffect(() => {
    if (!ready || !key) return;
    const save = () => { try { localStorage.setItem(key, JSON.stringify(latest.current)); } catch { setStorageError(true); } };
    const timer = window.setTimeout(save, 200);
    window.addEventListener("pagehide", save);
    return () => { clearTimeout(timer); save(); window.removeEventListener("pagehide", save); };
  }, [key, ready, progress]);
  function update(value: Partial<VariablesProgress>) { const next = { ...latest.current, ...value }; latest.current = next; setProgress(next); }
  function select(id: string) {
    update({ active: id });
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "start", behavior: "instant" }); });
  }
  function mark(id: string, done: boolean) { if (latest.current.done.includes(id) === done) return; update({ done: [...latest.current.done.filter(item => item !== id), ...(done ? [id] : [])] }); }
  const index = variableActivities.findIndex(a => a.id === progress.active);
  const activity = variableActivities[index < 0 ? 0 : index];
  const next = variableActivities[index + 1];
  const complete = progress.done.length === variableActivities.length;
  const codeDone = variableActivities.filter(a => a.kind !== "quiz" && progress.done.includes(a.id)).length;
  const quizDone = variableActivities.filter(a => a.kind === "quiz" && progress.done.includes(a.id)).length;
  function advance() { if (next) select(next.id); else document.getElementById("variables-summary")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  const activityList = <ol className={m.activityList}>{variableActivities.map((a, i) => <li key={a.id}><button aria-current={a.id === activity.id ? "step" : undefined} onClick={() => select(a.id)}><span className={m.activityNumber}>{progress.done.includes(a.id) ? <Check size={14} aria-label="Concluída"/> : String(i + 1).padStart(2, "0")}</span><span>{a.title}<small>{a.kind === "quiz" ? "Questão rápida" : a.kind === "guided" ? "Código guiado" : "Escreva código"}</small></span></button></li>)}</ol>;
  if (!ready) return <p role="status">Abrindo suas práticas de variáveis…</p>;
  return <section className={m.module} data-variables-module>
    <div className={m.location}><div><span>C# & .NET / MÓDULO 01 DE 08 / FUNDAMENTOS</span><strong>Você está aprendendo: Variáveis</strong></div><button onClick={onFullMap}><Map size={17}/>Mapa completo</button></div>
    {storageError && <p className={s.notice} role="alert">O navegador não permitiu salvar. Copie seu código antes de sair.</p>}
    <div className={m.workspace}>
      <aside className={m.rail} aria-label="Mapa do módulo de variáveis"><span className={s.kicker}>SEU CAMINHO NESTE MÓDULO</span><h2>Variáveis, na prática.</h2><p>7 práticas de código · 3 questões</p><div className={m.progress}><span style={{ width: `${progress.done.length / variableActivities.length * 100}%` }}/></div><p>{progress.done.length} de {variableActivities.length} atividades concluídas</p>{activityList}<div className={m.courseMap}><span>DEPOIS DE VARIÁVEIS</span><p>Condições → laços → métodos. Depois: objetos, dados, APIs, testes e entrega.</p><button onClick={onFullMap}>Ver as 8 etapas da formação<ArrowRight size={14}/></button></div></aside>
      <div className={m.main}>
        <details className={m.mobileMap}><summary><ListChecks size={17}/>Atividades do módulo · {progress.done.length}/{variableActivities.length}</summary>{activityList}</details>
        <header className={m.activityHeading}><span className={s.kicker}>ATIVIDADE {index + 1} DE {variableActivities.length} / {activity.kind === "quiz" ? "MÚLTIPLA ESCOLHA" : "AGORA É CÓDIGO"}</span><h1 ref={heading} tabIndex={-1}>{activity.title}</h1><p><strong>Assunto: {activity.topic}.</strong> {activity.goal}</p></header>
        {activity.kind === "guided" && <><p className={m.startNote}>Comece agora: leia a linha indicada, digite no campo <strong>Seu código</strong> e avance. Você escreve o programa; nada é preenchido automaticamente.</p><GuidedPractice embedded challenge={csharpPilot} userId={userId} onValidationChange={valid => mark("guided", valid)} onFreeMode={advance}/>{progress.done.includes("guided") && <button className={s.primary} onClick={advance}>Próxima atividade<ArrowRight size={17}/></button>}</>}
        {activity.kind === "code" && <CodeActivity key={activity.id} activity={activity} code={progress.drafts[activity.id] ?? activity.starter} done={progress.done.includes(activity.id)} onEdit={code => update({ drafts: { ...latest.current.drafts, [activity.id]: code }, done: latest.current.done.filter(id => id !== activity.id) })} onPass={() => mark(activity.id, true)} onNext={advance}/>}
        {activity.kind === "quiz" && <QuizActivity key={activity.id} activity={activity} answer={progress.answers[activity.id]} onAnswer={answer => update({ answers: { ...latest.current.answers, [activity.id]: answer }, done: [...latest.current.done.filter(id => id !== activity.id), ...(answer === activity.answer ? [activity.id] : [])] })} onNext={advance}/>}
        <div className={m.next}><button disabled={index === 0} onClick={() => select(variableActivities[index - 1].id)}><ArrowLeft size={15}/>Anterior</button><span>{next ? <>A seguir: <strong>{next.topic}</strong></> : "Última prática do módulo de variáveis"}</span>{next && <button onClick={advance}>Explorar próxima<ArrowRight size={15}/></button>}</div>
        <p className={s.small}>Você pode explorar as atividades, mas só a execução validada ou a resposta correta marca a conclusão.</p>
        <section className={m.summary} id="variables-summary"><span className={s.kicker}>SEU PROGRESSO EM VARIÁVEIS</span><h2>{complete ? "Variáveis: primeiras práticas concluídas." : "Aprender é conseguir fazer."}</h2><p><strong>{codeDone}/7</strong> práticas de código validadas · <strong>{quizDone}/3</strong> questões respondidas corretamente</p><p>{complete ? "Você praticou texto, números, reatribuição, cálculo e leitura de erros. Revisite as atividades e tente resolvê-las sem pistas. O próximo módulo de condições ainda está em preparação." : "Conclua as práticas e as questões no seu ritmo. Isso mostra seu avanço neste módulo — não uma porcentagem de toda a formação."}</p><button className={s.textButton} onClick={onFullMap}>Onde isso entra na formação?<ArrowRight size={16}/></button></section>
        <p className={s.runtimeNote}>C# didático no navegador: este executor não é o compilador .NET completo. O progresso fica neste navegador, sem sincronização entre aparelhos.</p>
      </div>
    </div>
    <details className={m.overview}><summary>Visão geral: do primeiro programa à entrega profissional</summary><ol>{csharpStages.map((stage, i) => <li key={stage.id}><strong>{String(i + 1).padStart(2, "0")} · {stage.title}</strong><span>{i === 0 ? "Você está aqui: variáveis" : "Planejado"}</span><p>{stage.skill}</p></li>)}</ol></details>
  </section>;
}
