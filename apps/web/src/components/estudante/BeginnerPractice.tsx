"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Lightbulb, Play, RotateCcw, Square } from "lucide-react";
import { runJavaScriptInWorker } from "@/lib/browserCodeRunner";
import { beginnerPracticeKey, beginnerPracticeTask, emptyBeginnerPractice, getBeginnerPractice, prepareBeginnerRun, readBeginnerPractice, verifyBeginnerRun, type BeginnerPracticeDraft } from "@/lib/beginnerPractice";
import s from "./BeginnerPractice.module.css";

type Props = { challengeSlug: string; userId: string | number | null; guidedCode?: string; origin?: "guided" | "free"; onValidatedChange?: (validated: boolean) => void; onFreeMode?: (code: string) => void };
type Feedback = { kind: "success" | "work" | "error"; message: string; output?: string };

export default function BeginnerPractice({ challengeSlug, userId, guidedCode = "", origin = "guided", onValidatedChange, onFreeMode }: Props) {
  const spec = getBeginnerPractice(challengeSlug);
  const identity = `${userId ?? "anonymous"}:${challengeSlug}`;
  const key = userId == null ? null : beginnerPracticeKey(userId, challengeSlug);
  const [loadedIdentity, setLoadedIdentity] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => emptyBeginnerPractice(challengeSlug));
  const [storageError, setStorageError] = useState(false);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [recovery, setRecovery] = useState<BeginnerPracticeDraft | null>(null);
  const latest = useRef(draft);
  const controller = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusedIdentity = useRef<string | null>(null);
  const ready = loadedIdentity === identity;
  const independent = draft.stage === "independent";
  const passed = independent ? draft.validated : draft.adaptationValidated;
  const source = independent ? draft.code : draft.adaptationCode;
  const taskIndex = independent ? 2 : draft.adaptationTarget;
  const task = beginnerPracticeTask(challengeSlug, taskIndex);

  const update = useCallback((next: BeginnerPracticeDraft) => {
    latest.current = next; setDraft(next);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(next)); setStorageError(false); window.dispatchEvent(new Event("orbitamos-practice-updated")); }
    catch { setStorageError(true); }
  }, [key]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let restored = emptyBeginnerPractice(challengeSlug, guidedCode);
      try {
        const raw = key ? localStorage.getItem(key) : null;
        if (raw) { const saved = readBeginnerPractice(raw, challengeSlug); if (saved.guidedCode) restored = saved; }
      } catch { setStorageError(true); }
      latest.current = restored; setDraft(restored); setLoadedIdentity(identity); setRunning(false); setFeedback(null);
    });
    return () => { active = false; controller.current?.abort(); controller.current = null; };
  }, [challengeSlug, guidedCode, identity, key]);

  useEffect(() => { if (ready) onValidatedChange?.(draft.validated && !running); }, [draft.validated, onValidatedChange, ready, running]);
  useEffect(() => {
    if (!ready || focusedIdentity.current === identity) return;
    focusedIdentity.current = identity;
    const frame = requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 767px)").matches) heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [identity, ready]);

  function stopExecution() {
    controller.current?.abort(); controller.current = null; setRunning(false);
  }

  function change(value: string) {
    stopExecution(); setFeedback(null); setConfirmReset(false);
    const next = independent ? { ...latest.current, code: value.slice(0, 12000), validated: false, validatedCode: null, validatedAt: null } : { ...latest.current, adaptationCode: value.slice(0, 12000), adaptationValidated: false, adaptationValidatedCode: null, adaptationValidatedAt: null, validated: false, validatedCode: null, validatedAt: null };
    update(next);
  }

  async function execute() {
    if (!spec || running || !source.trim()) return;
    const request = new AbortController(); controller.current = request; setRunning(true); setFeedback(null);
    const submitted = source, stage = draft.stage;
    const next = { ...latest.current, attempts: latest.current.attempts + 1 };
    update(next);
    const reject = (response: Feedback) => {
      const current = latest.current;
      update(stage === "independent" ? { ...current, validated: false, validatedCode: null, validatedAt: null } : { ...current, adaptationValidated: false, adaptationValidatedCode: null, adaptationValidatedAt: null, validated: false, validatedCode: null, validatedAt: null });
      setFeedback(response);
    };
    const order = [taskIndex, ...[0, 1, 2].filter(index => index !== taskIndex)];
    let output = "";
    try {
      for (let position = 0; position < order.length; position++) {
        const index = order[position];
        const run = prepareBeginnerRun(challengeSlug, submitted, index, position > 0);
        if (!run) { reject({ kind: "work", message: "Confira as entradas da missão. Declare cada uma com let, const ou var e o valor pedido, uma declaração por linha. Depois use essas variáveis no cálculo e na saída." }); return; }
        const result = await runJavaScriptInWorker(run.code, 2500, request.signal, run.verificationCode);
        if (controller.current !== request) return;
        if (position === 0) output = result.output;
        if (result.cancelled) { reject({ kind: "work", message: "Execução interrompida. Seu código continua salvo." }); return; }
        if (result.error) { reject({ kind: "error", message: position ? "Sua regra não funcionou quando os dados mudaram. Use as variáveis em vez de fixar a resposta." : `Vamos ajustar o programa: ${result.error}`, output }); return; }
        if (!verifyBeginnerRun(challengeSlug, index, result)) { reject({ kind: "work", message: position ? "O primeiro resultado apareceu, mas a regra precisa acompanhar outros dados. Confira o cálculo, as variáveis mostradas e os limites da condição." : "O programa executou. Agora confira os valores e a ordem das saídas pedidos na missão. Use as variáveis para mostrar e calcular, sem escrever só a resposta pronta.", output }); return; }
      }
      const current = latest.current;
      if (controller.current !== request || current.stage !== stage || (stage === "independent" ? current.code : current.adaptationCode) !== submitted) return;
      if (stage === "independent") update({ ...current, validated: true, validatedCode: submitted, validatedAt: Date.now() });
      else update({ ...current, adaptationValidated: true, adaptationValidatedCode: submitted, adaptationValidatedAt: Date.now() });
      setFeedback({ kind: "success", message: stage === "independent" ? spec.success : "A alteração funcionou, inclusive com outros dados. Agora você pode construir uma versão sem o exemplo pronto.", output });
    } catch { if (controller.current === request) reject({ kind: "error", message: "Não foi possível terminar a execução. Seu código foi preservado; tente novamente." }); }
    finally { if (controller.current === request) { controller.current = null; setRunning(false); } }
  }

  function insert(symbol: string) {
    const editor = input.current;
    if (!editor) return;
    const start = editor.selectionStart, end = editor.selectionEnd;
    change(source.slice(0, start) + symbol + source.slice(end));
    requestAnimationFrame(() => { editor.focus({ preventScroll: true }); editor.setSelectionRange(start + symbol.length, start + symbol.length); });
  }
  function goIndependent() {
    stopExecution();
    update({ ...latest.current, stage: "independent", hints: 0 }); setFeedback(null); setConfirmReset(false);
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "start", behavior: "instant" }); });
  }
  function reset() {
    stopExecution(); setRecovery(latest.current);
    change(""); setConfirmReset(false);
    requestAnimationFrame(() => input.current?.focus());
  }

  if (!spec || !task) return null;
  if (!ready) return <p role="status">Preparando sua aplicação…</p>;
  if (!draft.guidedCode.trim()) return <section className={s.practice} data-beginner-practice><h2 ref={heading} tabIndex={-1}>Primeiro, recupere seu programa anterior.</h2><p>O programa anterior não está disponível nesta cópia. {origin === "free" ? "Abra seu rascunho no modo livre e execute a missão antes de fazer uma alteração nele." : "Abra o passo a passo e execute as missões antes de fazer uma alteração nele."} Seus outros rascunhos continuam guardados.</p></section>;
  return <section className={s.practice} data-beginner-practice data-stage={draft.stage} aria-label="Aplicar sem a resposta pronta">
    <header className={s.heading}><span>{independent ? "03 / ESCREVER SOZINHO" : "02 / FAZER UMA ALTERAÇÃO"}</span><h2 ref={heading} tabIndex={-1}>{independent ? spec.title : "Seu código, com novos dados."}</h2><p>{independent ? "A alteração foi validada. Agora construa uma nova versão sem o exemplo preenchido, usando o que entendeu." : "Esta cópia veio do seu programa anterior. Altere os dados pedidos e mantenha a regra funcionando."}</p>{draft.guidedCode !== guidedCode && <p>Você retomou a aplicação salva, com o programa usado naquela tentativa. Seu código atual continua guardado no {origin === "free" ? "modo livre" : "guia"}.</p>}</header>
    <ol className={s.path} aria-label="Da orientação à autonomia"><li>1 · {origin === "free" ? "Código inicial validado" : "Guia concluído"} <Check size={13}/></li><li aria-current={!independent ? "step" : undefined}>2 · Alterar {draft.adaptationValidated && <Check size={13}/>}</li><li aria-current={independent ? "step" : undefined}>3 · Escrever sozinho {draft.validated && <Check size={13}/>}</li></ol>
    <div className={s.task}><p>{task.context}</p><strong>{task.goal}</strong><ul>{task.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}</ul></div>
    <div className={s.editor}><label htmlFor={`beginner-${challengeSlug}`}>{independent ? "Sua versão independente" : origin === "free" ? "Sua alteração no código anterior" : "Sua alteração no código do guia"}</label><small>{independent ? "Sem código preenchido. Você pode pedir uma pista." : "Mude os dados de entrada; uma mudança só de espaços não entrega a missão."}</small><textarea ref={input} id={`beginner-${challengeSlug}`} aria-label={independent ? "Código da aplicação independente" : "Código da alteração"} value={source} onChange={event => change(event.target.value)} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} maxLength={12000} rows={7} wrap="off" placeholder="Escreva seu programa aqui…" onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); insert("  "); } if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void execute(); } }}/><div className={s.symbols} role="group" aria-label="Símbolos da aplicação">{["\n", '"', "=", ";", "{", "}", "(", ")"].map(symbol => <button key={symbol} type="button" aria-label={symbol === "\n" ? "Nova linha na aplicação" : `Inserir ${symbol} na aplicação`} onPointerDown={event => event.preventDefault()} onClick={() => insert(symbol)}>{symbol === "\n" ? "↵" : symbol}</button>)}</div></div>
    <div className={s.actions}>{running ? <button className={s.primary} onClick={() => controller.current?.abort()}><Square size={16}/>Parar teste</button> : <button className={s.primary} disabled={!source.trim()} onClick={() => void execute()}><Play size={16}/>{independent ? "Testar minha entrega" : "Testar minha alteração"}</button>}<button onClick={() => { update({ ...latest.current, hints: Math.min(spec.hints.length, latest.current.hints + 1) }); }} disabled={draft.hints >= spec.hints.length}><Lightbulb size={16}/>{draft.hints ? "Mais uma pista" : "Preciso de uma pista"}</button><button onClick={() => setConfirmReset(true)}><RotateCcw size={15}/>Recomeçar esta parte</button></div>
    {draft.hints > 0 && <aside className={s.hints} aria-label="Pistas da aplicação"><strong>Uma ajuda por vez</strong>{spec.hints.slice(0, draft.hints).map((hint, index) => <p key={hint}>{index + 1}. {hint}</p>)}</aside>}
    {confirmReset && <div className={s.confirm} role="group" aria-label="Confirmar reinício da aplicação"><p>Limpar só esta parte? O programa inicial e o outro código desta aplicação continuam guardados.</p><button onClick={() => setConfirmReset(false)}>Continuar escrevendo</button><button onClick={reset}>Sim, limpar esta parte</button></div>}
    {recovery && <button className={s.recover} onClick={() => { stopExecution(); update(recovery); setRecovery(null); setFeedback(null); setConfirmReset(false); }}>Recuperar código anterior ao reinício</button>}
    <div className={s.feedback} role="status" aria-live="polite" data-kind={feedback?.kind ?? (passed ? "success" : "work")}><strong>{running ? "Executando seu programa e conferindo outras situações…" : feedback?.message ?? (passed ? independent ? spec.success : "Sua alteração já foi validada. Agora escreva uma versão sem a referência pronta." : "A entrega só é validada depois de executar. Além desta situação, vamos conferir se a regra acompanha outros dados.")}</strong>{feedback?.output !== undefined && <pre aria-label="Saída do seu programa">{feedback.output || "Sem saída no console."}</pre>}</div>
    {!independent && draft.adaptationValidated && <button className={s.primary} onClick={goIndependent}>Agora, escrever sozinho<ArrowRight size={17}/></button>}
    {independent && <button className={s.recover} onClick={() => { stopExecution(); update({ ...latest.current, stage: "adaptation" }); setFeedback(null); setConfirmReset(false); }}>Rever minha alteração anterior</button>}
    {draft.validated && <div className={s.delivery}><Check size={23}/><div><h3>Entrega testada.</h3><p>{spec.success} O próximo passo da sequência está disponível.</p>{onFreeMode && <button onClick={() => onFreeMode(draft.code)}>Continuar com este código no modo livre<ArrowRight size={16}/></button>}</div></div>}
    <footer>{storageError ? <span role="alert">Não foi possível guardar a aplicação neste navegador. Copie o código antes de sair.</span> : key ? "Os dois códigos ficam salvos neste navegador, separados por conta. Não sincronizam entre aparelhos." : "Entre na sua conta para guardar esta aplicação. Copie o código antes de sair."}</footer>
  </section>;
}
