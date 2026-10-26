"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import { emptyQuest, matchesQuestWriting, questCode, questError, questKey, questSteps, readQuest, shopProducts, shopSeed, verifyQuestResult, type QuestProgress } from "@/lib/sqlQuest";
import { runSql } from "@/lib/sqlRunner";
import type { SqlSnapshot } from "@/lib/sqlJourney";
import { persistPractice } from "@/lib/practiceStation";
import s from "./SqlQuest.module.css";

function ProductDrawing({ id }: { id: number }) {
  return <svg viewBox="0 0 80 90" fill="none" aria-hidden="true" className={s.productDrawing}>
    <ellipse cx="40" cy="80" rx="27" ry="5" fill="#132b3322"/>
    {id === 1 ? <><path d="M19 13h39l5 8v51H19z" fill="#e9ab71" stroke="#173e46" strokeWidth="3"/><path d="M25 13h36v55H25z" fill="#f7d9a5" stroke="#173e46" strokeWidth="3"/><path d="M29 19h26v43H29z" fill="#f0b574"/><path d="M38 31h10m-10 7h10" stroke="#173e46" strokeWidth="3" strokeLinecap="round"/><path d="M17 23h10m-10 12h10m-10 12h10m-10 12h10" stroke="#173e46" strokeWidth="3" strokeLinecap="round"/></> : id === 2 ? <g transform="rotate(20 40 45)"><path d="M34 20h13v47l-6.5 11L34 67z" fill="#718ee0" stroke="#173e46" strokeWidth="3"/><path d="M34 25h13v9H34z" fill="#b7c6f6"/><path d="M34 64h13l-6.5 14z" fill="#f7d9a5" stroke="#173e46" strokeWidth="3"/><path d="M37 18v-6h7v6M49 20h5v24" stroke="#173e46" strokeWidth="3" strokeLinecap="round"/></g> : <><path d="M31 22v-6c0-10 18-10 18 0v6M22 36C9 42 12 64 21 69m37-33c13 6 10 28 1 33" stroke="#173e46" strokeWidth="4"/><rect x="20" y="22" width="40" height="53" rx="14" fill="#9bbd9c" stroke="#173e46" strokeWidth="3"/><path d="M22 39h36" stroke="#173e46" strokeWidth="3"/><rect x="28" y="49" width="24" height="18" rx="4" fill="#d2dfad" stroke="#173e46" strokeWidth="3"/><path d="M40 26v10" stroke="#f4f0de" strokeWidth="4" strokeLinecap="round"/></>}
  </svg>;
}

function Shop({ step, snapshot, passed, intro = false }: { step: number; snapshot: SqlSnapshot | null; passed: boolean; intro?: boolean }) {
  const query = snapshot?.query;
  const highlighted = query?.values.map(row => String(row[0])) ?? [];
  return <section className={s.scene} aria-label="Loja do Orbi">
    <div className={s.sceneSky}><span>BAIRRO ORBITAMOS</span><span className={s.cloud}/><span className={s.cloud}/></div>
    <div className={s.store}>
      <div className={s.sign}><span aria-hidden="true">✳</span> O armazém do Orbi <span aria-hidden="true">✳</span></div>
      <div className={s.awning}/>
      <div className={s.shopWindow}><span className={s.windowNote}>{intro ? "uma pequena loja, grandes descobertas" : query ? "a loja continua com seus produtos" : "cada produto tem uma história"}</span><div className={s.shelf}>{shopProducts.map(product => <div key={product.id} className={s.product} data-selected={highlighted.includes(product.name)} data-dimmed={!!query && !highlighted.includes(product.name)}><ProductDrawing id={product.id}/><span>{product.name}</span><strong>{product.stock}<small> un.</small></strong>{highlighted.includes(product.name) && <span className={s.picked}><Check size={12}/> Na lista</span>}</div>)}</div><div className={s.shelfEdge}/></div>
      <div className={s.shopBase}><span className={s.openSign}>ABERTO A DESCOBERTAS</span><span className={s.storeStars} aria-hidden="true">✦ · ✦</span></div>
    </div>
    {!intro && <div className={s.ledger}>
      <div className={s.ledgerTitle}><span>{query ? "RESPOSTA DA CONSULTA" : "ESTOQUE DA LOJA"}</span><small>{query ? `${query.values.length} ${query.values.length === 1 ? "produto encontrado" : "produtos encontrados"}` : "tabela produtos"}</small></div>
      <table aria-label={query ? "Resultado da sua consulta" : "Estoque da loja"}><thead><tr>{(query?.columns ?? ["nome", "estoque"]).map((column, index) => <th key={index} scope="col" data-highlight={!query && step === 1 && column === "estoque"}>{column}</th>)}</tr></thead><tbody>{(query?.values ?? shopProducts.map(p => [p.name, p.stock])).slice(0, 6).map((row, i) => <tr key={i} data-highlight={!query && step === 0 && i === 1}>{row.map((value, j) => <td key={j} data-highlight={!query && step === 1 && j === 1}>{String(value ?? "NULL")}</td>)}</tr>)}{query && !query.values.length && <tr><td colSpan={Math.max(1, query.columns.length)}>Nenhum produto passou pelo filtro.</td></tr>}</tbody></table>
      {query && <p>A consulta é uma lista do que foi encontrado. A tabela de origem é conferida a cada teste.</p>}
    </div>}
    {!intro && passed && <div className={s.sceneReward} aria-hidden="true"><Sparkles size={16}/> Mais uma descoberta!</div>}
  </section>;
}

export default function SqlQuest({ userId, onWorkshop }: { userId: string; onWorkshop: () => void }) {
  const [progress, setProgress] = useState<QuestProgress>(emptyQuest);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [snapshot, setSnapshot] = useState<SqlSnapshot | null>(null);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [undo, setUndo] = useState<QuestProgress | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);
  const latest = useRef(progress);
  const step = progress.step;
  const lesson = questSteps[step];
  const draft = progress.drafts[step] ?? "";
  const finished = step === questSteps.length;
  const writingPassed = step === 3 && matchesQuestWriting(draft);
  const success = passed || writingPassed;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { const value = readQuest(localStorage.getItem(questKey(userId))); latest.current = value; setProgress(value); } catch { setSaved(false); }
      setReady(true);
    });
    return () => { active = false; controller.current?.abort(); };
  }, [userId]);

  function save(next: QuestProgress) {
    latest.current = next; setProgress(next);
    try { localStorage.setItem(questKey(userId), JSON.stringify(next)); setSaved(true); } catch { setSaved(false); }
  }
  function stop() { controller.current?.abort(); controller.current = null; setRunning(false); }
  function clearTurn(keepSnapshot = false) { stop(); setPassed(false); setSelected(null); setFeedback(null); setHint(false); if (!keepSnapshot) setSnapshot(null); }
  function focusTitle() { requestAnimationFrame(() => { title.current?.focus({ preventScroll: true }); title.current?.scrollIntoView({ block: "nearest" }); }); }
  function start() { setStarted(true); focusTitle(); if (step === 7) void restoreLastQuery(); }
  async function restoreLastQuery() {
    stop(); const request = new AbortController(); controller.current = request; setRunning(true);
    const result = await runSql([shopSeed], latest.current.drafts[6], request.signal);
    if (controller.current !== request) return;
    controller.current = null; setRunning(false);
    if (verifyQuestResult(6, result)) setSnapshot(result);
  }
  function change(value: string) {
    stop(); setPassed(false); setFeedback(null); setSnapshot(null);
    const next = latest.current;
    save({ ...next, drafts: next.drafts.map((text, i) => i === step ? value.slice(0, 1000) : text) });
  }
  function next() {
    if (!success) return;
    if (step === questSteps.length - 1) persistPractice(userId, "sql", "complete");
    save({ ...latest.current, step: Math.min(step + 1, questSteps.length) }); clearTurn(step === 6); focusTitle();
  }
  function showHint() {
    setHint(true);
    save({ ...latest.current, hints: latest.current.hints.map((used, i) => used || i === step) });
  }
  function insert(symbol: string) {
    const element = input.current; if (!element) return;
    const start = element.selectionStart, end = element.selectionEnd;
    change(draft.slice(0, start) + symbol + draft.slice(end));
    requestAnimationFrame(() => { element.focus(); element.setSelectionRange(start + symbol.length, start + symbol.length); });
  }
  async function run() {
    stop(); const request = new AbortController(); controller.current = request; setRunning(true); setFeedback(null); setPassed(false);
    const result = await runSql([shopSeed], questCode(step, draft), request.signal);
    if (controller.current !== request) return;
    controller.current = null; setRunning(false); setSnapshot(result);
    const correct = verifyQuestResult(step, result);
    setPassed(correct);
    setFeedback(result.error ? questError(result.error) : correct ? lesson.success : "A consulta rodou, mas a lista ainda não atende ao pedido. Confira a condição e as colunas nome e estoque. Você pode pedir uma pista.");
  }
  if (!ready) return <p role="status">Orbi está abrindo a loja…</p>;
  return <div className={s.quest} data-sql-quest data-sql-studio>
    <header className={s.topbar}><Link href="/estudante/pratica" aria-label="Voltar ao laboratório"><ArrowLeft size={17}/><span>Laboratório</span></Link><span className={s.brand}>ORBI <b>/</b> MISSÃO DADOS</span><details className={s.options}><summary aria-label="Opções da aventura"><ChevronDown size={16}/><span>Opções</span></summary><div><button onClick={onWorkshop}>Abrir oficina de criação</button><button onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); setResetting(true); }}><RotateCcw size={14}/> Recomeçar aventura</button><small>Progresso salvo neste navegador. Não sincroniza entre aparelhos.</small></div></details></header>
    {resetting && <div className={s.reset} role="group" aria-label="Confirmar reinício"><p>Recomeçar esta aventura? Seu progresso atual pode ser recuperado até você sair da página.</p><button onClick={() => setResetting(false)}>Continuar minha missão</button><button onClick={() => { setUndo(progress); save(emptyQuest()); clearTurn(); setStarted(false); setResetting(false); }}>Sim, recomeçar</button></div>}
    {undo && <button className={s.undo} onClick={() => { save(undo); clearTurn(); setUndo(null); setStarted(true); focusTitle(); }}>Desfazer reinício</button>}
    {!started ? <div className={s.welcome}>
      <Shop step={0} snapshot={null} passed={false} intro/>
      <section className={s.welcomeCopy}><span className={s.eyebrow}>SUA PRIMEIRA AVENTURA SQL</span><h1>Uma loja.<br/>Três produtos.<br/><em>Uma missão sua.</em></h1><div className={s.welcomeOrbi}><Image src="/orbi-tech.png" width={88} height={100} alt="Orbi, seu companheiro de missão" priority/><p>“Preciso descobrir o que está acabando. Me ajuda a conversar com os dados?”</p></div><button className={s.primary} onClick={start}>{step > 0 || progress.drafts.some(Boolean) ? "Retomar missão" : "Ajudar o Orbi"}<ArrowRight size={18}/></button><p className={s.welcomeNote}>Comece por uma escolha. Você vai escrever sua primeira consulta, um passo de cada vez.</p><details className={s.path}><summary>Ver o caminho desta aventura</summary><ol><li>Entender linhas e colunas</li><li>Escolher o que consultar</li><li>Encontrar produtos com um filtro</li><li>Resolver uma nova pergunta</li></ol></details></section>
    </div> : finished ? <section className={s.finish}>
      <div className={s.medal} aria-hidden="true"><Sparkles size={30}/></div><span className={s.eyebrow}>PRIMEIRA AVENTURA CONCLUÍDA</span><h1 ref={title} tabIndex={-1}>Você já conversa com os dados.</h1><p>Você encontrou produtos, mudou a condição e descobriu por que uma consulta não apaga a loja.</p><div className={s.badges}><span>SELECT <small>o que mostrar</small></span><span>FROM <small>onde procurar</small></span><span>WHERE <small>qual condição</small></span></div><div className={s.finishOrbi}><Image src="/orbi-tech.png" width={110} height={130} alt="Orbi comemorando"/><p>“Sua lista está pronta! Agora podemos construir uma tabela nossa.”</p></div><button className={s.primary} onClick={onWorkshop}>Abrir oficina de criação <ArrowRight size={18}/></button><button className={s.secondary} onClick={() => { save({ ...progress, step: 8 }); clearTurn(); focusTitle(); }}>Praticar de novo a consulta final</button><small>{progress.hints.some(Boolean) ? "Você usou pistas nesta aventura. Experimente a consulta final sem abrir a dica." : "Agora vale repetir em outro dia para descobrir o que você lembra."} Este é o primeiro passo da jornada SQL.</small>
    </section> : <>
      <div className={s.progress}><div><span>{lesson.chapter}</span><small>{step + 1} / {questSteps.length} descobertas</small></div><div className={s.progressTrack} role="progressbar" aria-label="Progresso da aventura" aria-valuemin={0} aria-valuemax={questSteps.length} aria-valuenow={step}><span style={{ width: `${step / questSteps.length * 100}%` }}/></div></div>
      <div className={s.playfield}>
        <Shop step={step} snapshot={snapshot} passed={success}/>
        <section className={s.mission} aria-label="Sua missão atual">
          <div className={s.orbiLine}><Image src="/orbi-tech.png" width={64} height={76} alt="Orbi"/><p>{lesson.speech}</p></div>
          <h1 ref={title} tabIndex={-1}>{lesson.title}</h1>
          <p className={s.prompt}>{lesson.prompt}</p>
          {lesson.reference && <div className={s.example}><span>{lesson.kind === "write" ? "EXEMPLO PARA ESCREVER" : "O PEDIDO EM SQL"}</span><pre>{step === 2 && success ? "SELECT nome, estoque" : step === 5 ? lesson.reference.replace("___", draft || "___") : lesson.reference}</pre></div>}
          {lesson.kind === "choice" ? <div className={s.choices}>{lesson.choices?.map(choice => <button key={choice.label} onClick={() => { if (passed) return; setSelected(choice.label); setPassed(!!choice.correct); setFeedback(choice.feedback); }} disabled={passed && selected !== choice.label} data-result={selected === choice.label ? choice.correct ? "correct" : "retry" : undefined}>{choice.label}{selected === choice.label && choice.correct && <Check size={18}/>}</button>)}</div> : <div className={s.inputArea}>
            <label htmlFor="quest-sql">{lesson.label}</label><textarea ref={input} id="quest-sql" aria-label="Seu código SQL" aria-describedby="quest-input-note" rows={lesson.rows} maxLength={1000} autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off" value={draft} onChange={e => change(e.target.value)} placeholder={step === 5 ? "Seu sinal aqui" : step === 3 ? "Escreva aqui…" : "Escreva sua consulta aqui…"}/>
            <p id="quest-input-note" className={s.inputNote}>{step === 3 ? "FROM = de / origem. Seu texto é conferido enquanto você escreve." : step === 5 ? "Seu sinal completa a condição na consulta acima." : "Espaços e letras maiúsculas não precisam ser iguais a um modelo."}</p>
            <div className={s.symbols} aria-label="Símbolos para digitar">{(step === 3 ? [";", " "] : ["<", ">", "=", ",", ";"]).map(symbol => <button key={symbol} aria-label={symbol === " " ? "Inserir espaço" : `Inserir ${symbol}`} onPointerDown={e => e.preventDefault()} onClick={() => insert(symbol)}>{symbol === " " ? "espaço" : symbol}</button>)}</div>
            {lesson.kind === "run" && !success && <button className={s.primary} disabled={!draft.trim() || running} onClick={() => void run()}>{running ? "Orbi está consultando…" : "Testar na loja"}<ArrowRight size={17}/></button>}
            {running && <button className={s.secondary} onClick={() => { stop(); setFeedback("Consulta interrompida. Seu texto continua aqui para tentar novamente."); }}>Parar consulta</button>}
          </div>}
          {(feedback || success) && <div className={s.feedback} role="status" data-success={success}><strong>{success ? "Boa! Mais uma descoberta." : "Vamos ajustar juntos."}</strong><p>{writingPassed ? lesson.success : feedback ?? lesson.success}</p>{snapshot?.error && <details><summary>Ver mensagem do banco</summary><code>{snapshot.error}</code></details>}</div>}
          {success ? <button className={s.primary + " " + s.continue} onClick={next}>Continuar <ArrowRight size={18}/></button> : <div className={s.help}>{hint ? <p><Lightbulb size={16}/>{lesson.hint}</p> : <button onClick={showHint}><Lightbulb size={16}/> Preciso de uma pista</button>}</div>}
        </section>
      </div>
    </>}
    {!saved && <p className={s.saveError} role="alert">O navegador não conseguiu salvar seu progresso. Mantenha esta página aberta para continuar.</p>}
  </div>;
}
