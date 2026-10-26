"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { editSqlLine, emptySqlDraft, readSqlDraft, sqlLessons, sqlLineMatches, sqlStorageKey, verifySqlLesson, type SqlDraft, type SqlSnapshot, type SqlTable } from "@/lib/sqlJourney";
import { runSql } from "@/lib/sqlRunner";
import s from "./SqlStudio.module.css";
import SqlQuest from "./SqlQuest";

function DataTable({ data, caption }: { data: SqlTable; caption: string }) {
  return <div className={s.tableScroll} tabIndex={0} role="group" aria-label={caption}><table><caption>{caption}</caption><thead><tr>{data.columns.map((column, i) => <th key={i} scope="col">{column}</th>)}</tr></thead><tbody>{data.values.length ? data.values.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell === null ? <i>NULL</i> : String(cell)}</td>)}</tr>) : <tr><td colSpan={Math.max(1, data.columns.length)}>Estrutura pronta. Nenhum registro cadastrado.</td></tr>}</tbody></table></div>;
}
function SqlWorkshop({ userId }: { userId: string }) {
  const [draft, setDraft] = useState<SqlDraft>(emptySqlDraft);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState(0);
  const [reference, setReference] = useState(true);
  const [annotations, setAnnotations] = useState(true);
  const [snapshot, setSnapshot] = useState<SqlSnapshot | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [undo, setUndo] = useState<SqlDraft | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);
  const latest = useRef(draft);
  const stage = draft.stage;
  const lesson = sqlLessons[stage];
  const lines = draft.drafts[stage];
  const matches = lesson.lines.map((line, i) => sqlLineMatches(lines[i], line.code));
  const writingComplete = matches.every(Boolean);
  const passed = draft.passed.includes(stage);
  const current = lesson.lines[Math.min(active, lesson.lines.length - 1)];
  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      let next = emptySqlDraft();
      try { next = readSqlDraft(localStorage.getItem(sqlStorageKey(userId))); } catch { setSaved(false); }
      latest.current = next; setDraft(next); setReady(true);
    });
    return () => { alive = false; controller.current?.abort(); };
  }, [userId]);
  function update(next: SqlDraft) {
    latest.current = next; setDraft(next);
    try { localStorage.setItem(sqlStorageKey(userId), JSON.stringify(next)); setSaved(true); } catch { setSaved(false); }
  }
  function cancel() { controller.current?.abort(); controller.current = null; setRunning(false); }
  async function execute(next = draft, rebuilding = false) {
    cancel();
    const request = new AbortController(); controller.current = request; setRunning(true); setResult(rebuilding ? "Reconstruindo seu banco local…" : null);
    const code = rebuilding && !next.passed.includes(next.stage) ? "" : next.drafts[next.stage].join("\n");
    const response = await runSql(next.drafts.slice(0, next.stage).map(rows => rows.join("\n")), code, request.signal);
    if (controller.current !== request) return;
    controller.current = null; setRunning(false); setSnapshot(response);
    if (response.error) { update({ ...next, passed: next.passed.filter(n => n < next.stage) }); setResult("O banco não executou. Seu código está salvo; veja o detalhe abaixo e compare os sinais da referência."); return; }
    if (rebuilding) {
      if (next.passed.includes(next.stage) && !verifySqlLesson(next.stage, response)) {
        update({ ...next, passed: next.passed.filter(n => n < next.stage) });
        setResult("Vamos validar esta missão novamente: o resultado salvo não corresponde ao objetivo.");
      } else setResult(null);
      return;
    }
    const correct = verifySqlLesson(next.stage, response);
    if (correct) {
      update({ ...next, passed: Array.from(new Set([...next.passed, next.stage])) });
      setResult("Missão validada no banco! Você escreveu, executou e produziu o resultado esperado.");
    } else {
      update({ ...next, passed: next.passed.filter(n => n < next.stage) });
      setResult(response.truncated ? "O resultado ultrapassou o limite desta oficina. Reduza a consulta." : "O SQL executou, mas a missão ainda não foi atendida. Compare as colunas e os valores com o objetivo do Orbi.");
    }
  }
  function enter(index: number) {
    const next = { ...latest.current, stage: index };
    update(next); setStarted(true); setActive(0); setSnapshot(null); setResetting(false); setUndo(null); void execute(next, true);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function change(index: number, value: string) { cancel(); setResult(null); update(editSqlLine(latest.current, index, value)); }
  function insert(symbol: string) {
    const input = inputs.current[active]; if (!input) return;
    const start = input.selectionStart ?? lines[active].length, end = input.selectionEnd ?? start;
    change(active, lines[active].slice(0, start) + symbol + lines[active].slice(end));
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + symbol.length, start + symbol.length); });
  }
  if (!ready) return <p role="status">Orbi está abrindo sua oficina SQL…</p>;
  return <div className={s.studio} data-sql-studio>
    <header className={s.header}><Link href="/estudante/pratica">← Laboratório</Link><span>ORBITAMOS / SQL COM ORBI</span><small>SQLite real · banco local</small></header>
    {!started ? <section className={s.intro}>
      <div><p className={s.eyebrow}>DA PRIMEIRA LINHA À PRIMEIRA TABELA</p><h1>Escreva a ideia.<br/><em>Veja os dados nascerem.</em></h1><p>Vamos construir o banco de uma pequena loja com o Orbi. Você escreve SQL em inglês, entende cada linha em português e acompanha a estrutura ganhando forma.</p><button className={s.primary} onClick={() => enter(stage)}>{draft.drafts.some(rows => rows.some(Boolean)) ? "Retomar minha construção" : "Construir com o Orbi"} →</button><small>Primeiro módulo: 5 missões. Sem instalar banco ou usar dados de clientes.</small></div>
      <div className={s.introArt}><Image src="/orbi-tech.png" alt="Orbi, seu companheiro na oficina de dados" width={260} height={290} priority/><div className={s.sample}><span>produtos / a planta da nossa loja</span><div>id <b>nome</b> estoque</div><p>01 · Criar → 02 · Cadastrar → 03 · Consultar</p></div></div>
    </section> : <>
      <nav className={s.map} aria-label="Mapa do primeiro módulo SQL">{sqlLessons.map((item, i) => <button key={item.id} disabled={i > draft.passed.length} onClick={() => enter(i)} aria-current={i === stage ? "step" : undefined}><span>{draft.passed.includes(i) ? "✓" : `0${i + 1}`}</span>{item.title}</button>)}</nav>
      <section className={s.orbi}><Image src="/orbi-tech.png" alt="Orbi" width={96} height={108}/><div><span className={s.eyebrow}>ORBI / MISSÃO {stage + 1} DE {sqlLessons.length}</span><h1 ref={heading} tabIndex={-1}>{lesson.title}</h1><p>{lesson.speech}</p><strong>Objetivo: {lesson.goal}</strong></div></section>
      <div className={s.tools}><label><input type="checkbox" checked={annotations} onChange={e => setAnnotations(e.target.checked)}/> Explicações acima das linhas</label><label><input type="checkbox" checked={reference} onChange={e => setReference(e.target.checked)}/> Mostrar referência</label><a href="#sql-table">Ver a tabela ↓</a></div>
      <div className={s.canvas}>
        <section className={s.editor} aria-label="Editor SQL guiado">
          <div className={s.file}><strong>Sua construção</strong><span>loja.sql · você escreve aqui</span></div>
          <div className={s.reference}><span>LINHA {active + 1} / {lesson.lines.length} · {reference ? "REFERÊNCIA PARA DIGITAR" : "EXPERIMENTE DE MEMÓRIA"}</span>{reference && <code>{current.code}</code>}<p>{current.why}</p></div>
          <div className={s.lines}>{lesson.lines.map((line, i) => <div className={s.line} key={`${stage}-${i}`} data-active={i === active} data-match={matches[i]}>
            {annotations && <label className={s.annotation} htmlFor={`sql-line-${i}`}>{line.meaning}</label>}
            <div className={s.codeRow}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><input ref={node => { inputs.current[i] = node; }} id={`sql-line-${i}`} aria-label={`SQL linha ${i + 1}`} aria-describedby={`sql-writing-${i}`} value={lines[i]} onFocus={() => setActive(i)} onChange={e => change(i, e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); inputs.current[i + 1]?.focus(); } }} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} maxLength={1000} placeholder={i === 0 ? "Escreva sua primeira linha…" : "Continue sua construção…"}/><span className={s.tick} aria-hidden="true">{matches[i] ? "✓" : "·"}</span></div>
            <span id={`sql-writing-${i}`} className={s.srOnly}>{matches[i] ? "Escrita igual à referência; ainda precisa executar." : "Use a referência para escrever. Enter leva à próxima linha."}</span>
          </div>)}</div>
          <div className={s.symbols} aria-label="Símbolos SQL">{["'", "(", ")", ",", ";", "=", "<", ">"].map(symbol => <button key={symbol} aria-label={`Inserir ${symbol}`} onPointerDown={e => e.preventDefault()} onClick={() => insert(symbol)}>{symbol}</button>)}</div>
          <div className={s.writing} role="status">{writingComplete ? "✓ Escrita conferida. Agora execute para o banco verificar o resultado." : `Escrita: ${matches.filter(Boolean).length}/${lines.length} linhas conferidas. Enter vai à próxima linha; nada é preenchido sozinho.`}</div>
          <div className={s.actions}>{running ? <button className={s.primary} onClick={() => { cancel(); setResult("Execução interrompida. Seu código está preservado."); }}>Parar execução</button> : <button className={s.primary} disabled={!lines.some(line => line.trim())} onClick={() => void execute()}>Executar SQL →</button>}<button onClick={() => setResetting(true)}>Recomeçar missão</button></div>
          {!writingComplete && <p className={s.note}>Pode testar antes de terminar. Um comando incompleto pode dar erro; isso faz parte da construção.</p>}
          {resetting && <div className={s.reset} role="group" aria-label="Confirmar reinício"><p>Limpar esta missão? Ela e as seguintes precisarão ser validadas novamente. Os outros rascunhos ficam guardados.</p><button onClick={() => setResetting(false)}>Continuar escrevendo</button><button onClick={() => { cancel(); setUndo(draft); const next = { ...draft, passed: draft.passed.filter(n => n < stage), drafts: draft.drafts.map((rows, i) => i === stage ? rows.map(() => "") : rows) }; update(next); setSnapshot(null); setResult(null); setResetting(false); }}>Sim, limpar esta missão</button></div>}
          {undo && <button className={s.recover} onClick={() => { update(undo); setUndo(null); setResult(null); void execute(undo, true); }}>Recuperar rascunho anterior ao reinício</button>}
          <p className={s.note} role={saved ? undefined : "alert"}>{saved ? "Rascunho salvo neste navegador, por conta. Não sincroniza entre aparelhos." : "Não foi possível salvar neste navegador. Evite fechar esta página para não perder o rascunho."}</p>
        </section>
        <section className={s.visual} id="sql-table" aria-label="Planta e banco de dados">
          {stage === 0 && <div className={s.blueprint}><span className={s.eyebrow}>PLANTA AO VIVO / AINDA NÃO É O BANCO</span><h2>{matches[0] ? "produtos" : "Uma tabela está por nascer"}</h2><div className={s.columns}>{["id", "nome", "estoque"].map((name, i) => <div key={name} data-built={matches[i + 1]}><strong>{matches[i + 1] ? name : "?"}</strong><small>{matches[i + 1] ? i === 1 ? "TEXT · obrigatório" : i === 0 ? "INTEGER · chave" : "INTEGER · obrigatório" : "aguardando esta linha"}</small><span aria-hidden="true">{matches[i + 1] ? "✓" : "+"}</span></div>)}</div><p>A planta reconhece o exemplo escrito. Só executar cria a tabela real — e o banco também aceita SQL equivalente.</p></div>}
          <div className={s.database}><div className={s.dbTitle}><span className={s.eyebrow}>BANCO REAL / SQLITE</span><h2>O que existe de verdade</h2></div>{snapshot?.table ? <><DataTable caption="Tabela produtos · dados armazenados" data={snapshot.table}/><details><summary>Como o banco descreve as colunas</summary>{snapshot.schema.map(column => <p key={column.name}><code>{column.name}</code> · {column.type}{column.pk ? " · chave primária" : ""}{column.notnull ? " · não aceita NULL" : ""}</p>)}</details></> : <p className={s.empty}>{running ? "Abrindo o banco local…" : "Nenhuma tabela exibida. Complete e execute a fundação para construí-la."}</p>}
          {snapshot?.query && <DataTable caption="Resultado da consulta · não altera a tabela" data={snapshot.query}/>}
          {snapshot && <p className={s.note}>Resultado da última execução. Digitar não modifica este banco exibido.</p>}</div>
          <div className={s.feedback} role="status" data-passed={passed}><strong>{passed ? "✦ Construção validada" : "Orbi acompanha sua construção"}</strong><p>{result ?? (passed ? "Esta missão já foi concluída. Você pode revisá-la ou continuar." : "Escreva, teste e compare. Verde na linha confere a escrita; a missão só passa com resultado real.")}</p>{snapshot?.error && <pre>{snapshot.error}</pre>}</div>
          {passed && (stage < sqlLessons.length - 1 ? <button className={s.primary} onClick={() => enter(stage + 1)}>Próxima missão →</button> : <div className={s.finish}><h2>A loja tem memória!</h2><p>Você criou, cadastrou, consultou, filtrou e atualizou dados. Este é o primeiro módulo; relações, JOIN, agregações e projetos maiores são próximos passos, ainda não aulas disponíveis aqui.</p><button onClick={() => { setReference(false); enter(2); }}>Revisar consulta sem a referência</button></div>)}
          <p className={s.note}>Banco temporário e isolado, reconstruído com suas missões anteriores a cada execução. Nenhum acesso ao banco da Orbitamos. SQLite tem diferenças em relação a PostgreSQL e SQL Server.</p>
          <button className={s.backToCode} onClick={() => inputs.current[active]?.focus()}>Voltar à minha linha de código ↑</button>
        </section>
      </div>
    </>}
  </div>;
}

export default function SqlStudio({ userId }: { userId: string }) {
  const [workshop, setWorkshop] = useState(false);
  useEffect(() => { if (new URLSearchParams(window.location.search).get("mode") === "workshop") queueMicrotask(() => setWorkshop(true)); }, []);
  return workshop ? <><button className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-emerald-100 underline underline-offset-4" onClick={() => setWorkshop(false)}>← Voltar à aventura com o Orbi</button><SqlWorkshop userId={userId}/></> : <SqlQuest key={userId} userId={userId} onWorkshop={() => setWorkshop(true)}/>;
}
