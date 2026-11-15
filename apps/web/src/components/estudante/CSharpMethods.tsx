"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Map, Monitor } from "lucide-react";
import { answerCSharpMethodsPrediction, clearCSharpMethodsRun, csharpMethodsActivities, csharpMethodsFlow, csharpMethodsKey, csharpMethodsUnit, declareCSharpMethodsRun, exportCSharpMethodsDraft, importCSharpMethodsDraft, markCSharpMethodsModel, newCSharpMethodsProgress, readCSharpMethodsProgress, resetCSharpMethodsDraft, revealCSharpMethodsHint, setCSharpMethodsDraft, setCSharpMethodsPreparation, CSHARP_METHODS_MAX_FILE_BYTES, type CSharpMethodsActivityId, type CSharpMethodsProgress } from "@/lib/csharpMethods";
import scene from "../../../public/images/academy/projeto-csharp-v1.webp";
import s from "./CSharpMethods.module.css";

type Change = (state: CSharpMethodsProgress) => CSharpMethodsProgress;
export default function CSharpMethods({ userId, onFullMap }: { userId: string | number | null; onFullMap: () => void }) {
  const owner = userId === null ? null : csharpMethodsKey(userId);
  const [loaded, setLoaded] = useState<{ owner: string | null; state: CSharpMethodsProgress } | null>(null);
  const latest = useRef(loaded);
  const currentOwner = useRef(owner);
  useLayoutEffect(() => { currentOwner.current = owner; }, [owner]);
  const [storageError, setStorageError] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<{ owner: string | null; raw: string; id: CSharpMethodsActivityId } | null>(null);
  const [replace, setReplace] = useState<"reset" | "starter" | null>(null);
  const [backup, setBackup] = useState<{ id: CSharpMethodsActivityId; code: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const persist = useCallback((capturedOwner: string | null) => {
    const value = latest.current;
    if (!capturedOwner || !value || value.owner !== capturedOwner) return;
    try { localStorage.setItem(capturedOwner, JSON.stringify(value.state)); window.dispatchEvent(new Event("orbitamos-practice-updated")); }
    catch { if (currentOwner.current === capturedOwner) setStorageError(true); }
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let state = newCSharpMethodsProgress();
      setStorageError(false);
      try { if (owner) state = readCSharpMethodsProgress(localStorage.getItem(owner)); } catch { setStorageError(true); }
      const next = { owner, state }; latest.current = next; setLoaded(next);
      setPending(null); setReplace(null); setBackup(null); setMessage("");
    });
    return () => { active = false; };
  }, [owner]);
  useEffect(() => {
    if (!loaded || loaded.owner !== owner || !owner) return;
    const timer = window.setTimeout(() => persist(owner), 200);
    return () => clearTimeout(timer);
  }, [loaded, owner, persist]);
  useEffect(() => {
    const save = () => persist(owner);
    window.addEventListener("pagehide", save);
    const visibility = () => { if (document.visibilityState === "hidden") save(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { save(); window.removeEventListener("pagehide", save); document.removeEventListener("visibilitychange", visibility); };
  }, [owner, persist]);
  function change(update: Change) {
    const value = latest.current;
    if (!value || value.owner !== currentOwner.current) return;
    const next = { owner: value.owner, state: update(value.state) }; latest.current = next; setLoaded(next);
  }
  function go(id: CSharpMethodsActivityId) {
    change(state => ({ ...state, active: id, view: "activity" })); setReplace(null); setPending(null); setMessage("");
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "start", behavior: "instant" }); });
  }
  if (!loaded || loaded.owner !== owner) return <p role="status">Abrindo seu projeto de métodos…</p>;
  const progress = loaded.state;
  const activity = csharpMethodsActivities.find(item => item.id === progress.active)!;
  const index = csharpMethodsActivities.indexOf(activity);
  const code = progress.drafts[activity.id] ?? "";
  const prediction = activity.prediction;
  const answer = prediction ? progress.predictions[prediction.id] : undefined;
  const hintCount = progress.hintsShown[activity.id] ?? 0;
  function applyStarter() {
    setBackup({ id: activity.id, code: latest.current?.state.drafts[activity.id] ?? "" });
    change(state => setCSharpMethodsDraft(activity.reference ? markCSharpMethodsModel(state, activity.id) : state, activity.id, activity.starter));
    setReplace(null); editor.current?.focus();
  }
  async function copy() {
    const capturedOwner = owner;
    try { await navigator.clipboard.writeText(code); if (currentOwner.current === capturedOwner) setMessage("Código copiado. Cole no Program.cs desta tarefa, salve e execute no computador."); }
    catch { if (currentOwner.current === capturedOwner) { setMessage("Não foi possível copiar automaticamente. Selecione o texto no rascunho e use Copiar."); editor.current?.focus(); editor.current?.select(); } }
  }
  function downloadDraft() {
    const result = exportCSharpMethodsDraft(latest.current!.state, activity.id);
    if (!result.ok) { setMessage(result.error); return; }
    const url = URL.createObjectURL(new Blob([result.content], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = result.filename; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Rascunho preparado para download. O JSON transporta o texto; no PC, importe aqui e copie o código para Program.cs.");
  }
  async function selectFile(file: File | undefined) {
    if (!file) return;
    const capturedOwner = owner;
    if (file.size > CSHARP_METHODS_MAX_FILE_BYTES) { setMessage("Escolha um arquivo de rascunho de até 100 KB."); return; }
    try {
      const raw = await file.text();
      if (currentOwner.current !== capturedOwner || latest.current?.owner !== capturedOwner) return;
      const result = importCSharpMethodsDraft(latest.current.state, raw);
      if (!result.ok) { setMessage(result.error); return; }
      setPending({ owner: capturedOwner, raw, id: result.activityId }); setMessage("");
    } catch { if (currentOwner.current === capturedOwner) setMessage("Não foi possível ler o arquivo. Seu código está preservado."); }
  }
  function confirmImport() {
    if (!pending || pending.owner !== currentOwner.current || !latest.current) return;
    const result = importCSharpMethodsDraft(latest.current.state, pending.raw);
    if (!result.ok) { setMessage(result.error); setPending(null); return; }
    setBackup({ id: result.activityId, code: latest.current.state.drafts[result.activityId] ?? "" });
    change(() => result.progress); setPending(null); setReplace(null); setMessage("Texto importado. Isso não importa execução, aprovação ou progresso de outra conta.");
  }
  const taskList = <ol className={s.tasks}>{csharpMethodsActivities.map((item, i) => <li key={item.id}><button aria-current={progress.view === "activity" && item.id === activity.id ? "step" : undefined} onClick={() => go(item.id)}><b>{String(i + 1).padStart(2, "0")}</b><span>{item.title}<small>{progress.drafts[item.id]?.trim() ? "Rascunho guardado" : "Ainda sem rascunho"}</small></span></button></li>)}</ol>;
  return <div className={s.unit} data-csharp-methods data-methods-view={progress.view}>
    <div className={s.location}><span>C# / MÉTODOS / .NET 10</span><button onClick={onFullMap}><Map size={16}/>Mapa completo</button></div>
    {storageError && <p className={s.warning} role="alert">O navegador não permitiu salvar. Copie ou exporte seu rascunho antes de sair.</p>}
    {progress.view === "bridge" ? <>
      <section className={s.hero}><div><span className={s.kicker}>ORBI SERVIÇOS / DO CÁLCULO À REGRA</span><h1 ref={heading} tabIndex={-1}>Uma regra.<br/><em>Vários clientes.</em></h1><p className={s.device}><Monitor size={18}/><span>Prepare no celular. Execute no computador com SDK .NET 10.</span></p><button className={s.primary} onClick={() => go(progress.active)}>Começar a tarefa<ArrowRight size={17}/></button><a className={s.link} href={csharpMethodsUnit.downloadHref} download><Download size={16}/>Baixar projeto .NET</a><p>Calcule o que falta entregar. Depois reutilize sua regra, encontre um bug e resolva um pedido novo.</p></div><div className={s.scene}><Image src={scene} alt="" fill loading="eager" placeholder="blur" sizes="(max-width: 700px) 90vw, 40vw"/><span>ORBI SERVIÇOS<strong>Um pedido real.<br/>Uma regra sua.</strong></span></div></section>
      <details className={s.details}><summary>Preparar meu computador e os arquivos</summary><p>Extraia o ZIP numa pasta de estudo separada do site. Abra o README do pacote: ele orienta instalação, arquivos, terminal e Git, sem exigir conta paga.</p><ol className={s.bridge}>{csharpMethodsUnit.bridge.map(step => <li key={step.id}><label><input type="checkbox" checked={progress.preparation.includes(step.id)} onChange={event => change(state => setCSharpMethodsPreparation(state, step.id, event.target.checked))}/><strong>{step.title}</strong></label><p>{step.detail}</p>{step.command && <pre><code>{step.command}</code></pre>}</li>)}</ol><p>Essas marcações são suas anotações. Elas não inspecionam seu computador.</p><a href="https://learn.microsoft.com/pt-br/dotnet/core/install/windows" target="_blank" rel="noreferrer">Instalação oficial do SDK no Windows ↗</a></details>
      <details className={s.details}><summary>Antes de começar: o que já preciso saber?</summary><ul>{csharpMethodsUnit.prerequisites.map(item => <li key={item}>{item}</li>)}</ul></details>
      <h2 className={s.sectionTitle}>Seu pedido em quatro tarefas</h2>{taskList}
    </> : <>
      <header className={s.taskHeading}><button className={s.link} onClick={() => change(state => ({ ...state, view: "bridge" }))}><ArrowLeft size={15}/>Projeto e preparação</button><span className={s.kicker}>TAREFA {index + 1} DE 4 / {activity.support === "guided" ? "COM EXEMPLO" : activity.support === "independent" ? "SUA TENTATIVA" : activity.support === "debug" ? "INVESTIGAR" : "MENOS APOIO"}</span><h1 ref={heading} tabIndex={-1}>{activity.title}</h1><p>{activity.context}</p><details className={s.taskMap}><summary>Ver as quatro tarefas</summary>{taskList}</details></header>
      <p className={s.runtime}><Monitor size={17}/><span>Rascunho no navegador · execução no .NET 10 do computador.</span><button className={s.link} onClick={() => { editor.current?.scrollIntoView({ block: "center", behavior: "instant" }); editor.current?.focus({ preventScroll: true }); }}>Escrever código ↓</button></p>
      <div className={s.work}>
        <section className={s.instruction} aria-label="Pedido e orientação"><h2>O que fazer agora</h2><ol>{activity.instructions.map(item => <li key={item}>{item}</li>)}</ol>
          {prediction && <fieldset className={s.prediction}><legend>{prediction.prompt}</legend>{prediction.options.map((option, i) => <label key={option}><input type="radio" name={prediction.id} checked={answer === i} onChange={() => change(state => answerCSharpMethodsPrediction(state, prediction.id, i))}/><span>{option}</span></label>)}<p role="status">{answer !== undefined ? prediction.feedback[answer] : "Faça sua previsão. Ela não executa o programa."}</p></fieldset>}
          {activity.reference && <details className={s.details} onToggle={event => { if (event.currentTarget.open) change(state => markCSharpMethodsModel(state, activity.id)); }}><summary>Ver exemplo e caminho do valor</summary><pre><code>{activity.reference}</code></pre><div className={s.flow} aria-label="Caminho dos valores no exemplo"><span>{csharpMethodsFlow.call}</span><span>8 → total · 3 → concluidos</span><span>return total - concluidos → 5</span><span>pendentes → Console.WriteLine</span></div><p>{csharpMethodsFlow.note}</p><p>Este é o exemplo explicado; não é uma execução do seu rascunho.</p></details>}
          <details className={s.details}><summary>Casos para comparar no computador</summary><p>{csharpMethodsUnit.validInputs}</p><table><thead><tr><th>Entrada</th><th>Esperado</th></tr></thead><tbody>{activity.cases.filter((_, i) => activity.id !== "guided" || i === 0 || answer !== undefined).map(test => <tr key={test.label}><td><strong>{test.label}</strong><code>{test.inputs}</code></td><td><pre>{test.expected}</pre></td></tr>)}</tbody></table>{activity.id === "guided" && answer === undefined && <p>O caso com outro valor aparece depois da sua previsão.</p>}</details>
          <div className={s.hints}>{activity.hints.slice(0, hintCount).map((hint, i) => <p key={hint}><strong>Pista {i + 1}.</strong> {hint}</p>)}{hintCount < activity.hints.length && <button className={s.link} onClick={() => change(state => revealCSharpMethodsHint(state, activity.id))}>Preciso de uma pista</button>}</div>
        </section>
        <section className={s.pad} aria-label="Rascunho C#"><div className={s.editorHead}><label htmlFor="methods-code">Seu rascunho C#</label><span>Program.cs</span></div><textarea ref={editor} id="methods-code" rows={10} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" maxLength={100000} value={code} placeholder="Escreva sua primeira linha aqui…" onChange={event => change(state => setCSharpMethodsDraft(state, activity.id, event.target.value))}/><div className={s.symbols} role="group" aria-label="Símbolos de código">{["(", ")", "{", "}", ";", "=", "&", "↵"].map(symbol => <button key={symbol} aria-label={`Inserir ${symbol}`} onPointerDown={event => event.preventDefault()} onClick={() => { const input = editor.current; if (!input) return; const start = input.selectionStart; const value = symbol === "↵" ? "\n" : symbol; change(state => setCSharpMethodsDraft(state, activity.id, code.slice(0, start) + value + code.slice(input.selectionEnd))); requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + value.length, start + value.length); }); }}>{symbol}</button>)}</div>
          <div className={s.actions}><button className={s.primary} disabled={!code.trim()} onClick={() => void copy()}>Copiar para Program.cs</button><button className={s.link} onClick={() => setReplace("reset")}>Limpar rascunho</button></div>
          {activity.starter && <button className={s.link} onClick={() => code.trim() ? setReplace("starter") : applyStarter()}>{activity.reference ? "Usar exemplo no rascunho" : activity.id === "debug" ? "Usar bug preparado" : "Usar assinatura inicial"}</button>}
          {replace && <div className={s.confirm}><p>{replace === "reset" ? "Limpar somente o texto desta tarefa?" : "Substituir o texto atual pela base desta tarefa?"} A consulta à ajuda continua registrada.</p><button onClick={() => { if (replace === "starter") applyStarter(); else { setBackup({ id: activity.id, code }); change(state => resetCSharpMethodsDraft(state, activity.id)); setReplace(null); } }}>Confirmar substituição</button><button onClick={() => setReplace(null)}>Continuar editando</button></div>}
          {backup && <button className={s.link} onClick={() => { change(state => ({ ...setCSharpMethodsDraft(state, backup.id, backup.code), active: backup.id, view: "activity" })); setBackup(null); setMessage("Texto anterior recuperado. A ajuda consultada foi preservada."); }}>Recuperar texto anterior</button>}
          <details className={s.details}><summary>Levar o rascunho para outro aparelho</summary><p>Exporte o JSON, leve o arquivo ao computador e importe nesta unidade. Depois copie o código para Program.cs. O texto não sincroniza automaticamente.</p><div className={s.actions}><button onClick={downloadDraft} disabled={!code.trim()}>Exportar rascunho</button><label className={s.file}>Importar rascunho<input type="file" accept=".json,application/json" onChange={event => { void selectFile(event.target.files?.[0]); event.target.value = ""; }}/></label></div></details>
          {pending && <div className={s.confirm} role="region" aria-label="Confirmar importação"><p>Importar o texto para “{csharpMethodsActivities.find(item => item.id === pending.id)?.title}”? O rascunho atual dessa tarefa será substituído e poderá ser recuperado.</p><button onClick={confirmImport}>Confirmar importação</button><button onClick={() => setPending(null)}>Cancelar importação</button></div>}
          <p className={s.local}>{owner ? "Rascunho guardado neste navegador para sua conta." : "Sem conta: copie ou exporte o rascunho antes de sair."} {hintCount > 0 || progress.modelViewed[activity.id] ? "Você consultou ajuda nesta tarefa." : "Nenhuma consulta à ajuda registrada nesta tarefa."}</p>
          <details className={s.details}><summary>Executar e conferir no computador</summary><p>Abra o Program.cs da tarefa, cole seu código e salve. Na raiz do pacote extraído:</p><pre><code>{`dotnet run --project ${activity.projectPath}`}</code></pre><p>Compare a saída com os casos. O README também ensina a usar o verificador local e a guardar o diff no Git.</p><pre><code>{`powershell -NoProfile -File .\\tools\\verificar.ps1 -Tarefa ${index + 1}`}</code></pre><a href={csharpMethodsUnit.downloadHref} download>Baixar pacote com instruções</a></details>
          <div className={s.declaration}><p>{csharpMethodsUnit.executionNotice}</p>{progress.selfReportedRuns[activity.id] ? <><strong>Execução informada por você · resultado não conferido pela plataforma.</strong><button className={s.link} onClick={() => change(state => clearCSharpMethodsRun(state, activity.id))}>Remover minha declaração</button></> : <button disabled={!code.trim()} onClick={() => change(state => declareCSharpMethodsRun(state, activity.id))}>Registrar que executei no PC</button>}</div>
        </section>
      </div>
      <section className={s.reflection}><span className={s.kicker}>EXPLIQUE COM SUAS PALAVRAS</span><h2>{activity.reflection}</h2><p>Explique em voz alta ou anote no README do seu projeto. Mudar os dados e justificar a resposta faz parte da prática.</p>{index < 3 ? <button className={s.primary} onClick={() => go(csharpMethodsActivities[index + 1].id)}>Explorar próxima tarefa<ArrowRight size={16}/></button> : <><p>Seu próximo assunto será representar um serviço com tipos e objetos. Essa próxima unidade ainda está em preparação.</p><button className={s.primary} onClick={onFullMap}>Voltar ao mapa completo<ArrowRight size={16}/></button></>}</section>
    </>}
    <p className={s.message} role="status" aria-live="polite">{message}</p>
  </div>;
}
