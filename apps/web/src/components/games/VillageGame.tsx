"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buddies, buddyTerms, evaluateVillage, initialAttempt, readVillageSave, villageCode, villageLevels, villageStorageKey, type Buddy, type VillageAttempt, type VillageSave } from "@/lib/vilaDosBlocos";
import { VillageCharacter, VillageScene } from "./VillageCharacters";
import s from "./VillageGame.module.css";

export default function VillageGame({ userId }: { userId: string }) {
  const [save, setSave] = useState<VillageSave>({ version: 1, completed: [], current: 0 });
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [attempt, setAttempt] = useState<VillageAttempt>(initialAttempt(villageLevels[0]));
  const [selected, setSelected] = useState<Buddy | null>(null);
  const [result, setResult] = useState<ReturnType<typeof evaluateVillage> | null>(null);
  const [hint, setHint] = useState(false);
  const [album, setAlbum] = useState<Buddy | null>(null);
  const [storageError, setStorageError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const albumHeading = useRef<HTMLHeadingElement>(null);
  const albumButton = useRef<HTMLButtonElement>(null);
  const openAlbumFocus = useRef(false);
  const shouldFocus = useRef(false);
  const currentStage = save.current;
  const level = villageLevels[currentStage];
  const finished = save.completed.length === villageLevels.length;
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let stored = readVillageSave(null);
      try { stored = readVillageSave(localStorage.getItem(villageStorageKey(userId))); } catch { setStorageError(true); }
      setSave(stored); setAttempt(initialAttempt(villageLevels[stored.current])); setReady(true);
    });
    return () => { active = false; };
  }, [userId]);
  useEffect(() => { if (shouldFocus.current) { heading.current?.focus(); shouldFocus.current = false; } }, [currentStage, started]);
  useEffect(() => { if (album && openAlbumFocus.current) { albumHeading.current?.focus(); openAlbumFocus.current = false; } }, [album]);
  function persist(next: VillageSave) {
    setSave(next);
    try { localStorage.setItem(villageStorageKey(userId), JSON.stringify(next)); } catch { setStorageError(true); }
  }
  function enter(index: number) {
    shouldFocus.current = true;
    persist({ ...save, current: index }); setAttempt(initialAttempt(villageLevels[index])); setResult(null); setSelected(null); setHint(false); setStarted(true);
  }
  function play() {
    const outcome = evaluateVillage(level, attempt);
    setResult(outcome);
    if (outcome.ok && !save.completed.includes(level.id)) persist({ ...save, completed: [...save.completed, level.id] });
  }
  function move(row: number, delta: number) {
    setResult(null);
    setAttempt(previous => ({ ...previous, indents: previous.indents.map((n, i) => i === row ? Math.max(0, Math.min(2, n + delta)) : n) }));
  }
  if (!ready) return <p role="status">Acordando a Vila dos Blocos…</p>;
  return <div className={s.game} data-village data-level-id={level.id}>
    <header className={s.top}><Link href="/estudante/jogos">← Jogos</Link><span>ORBITAMOS · UMA AVENTURA DE SINTAXE</span><button ref={albumButton} onClick={() => { openAlbumFocus.current = !album; setAlbum(album ? null : level.buddy); }} aria-controls="village-album" aria-expanded={album !== null}>Álbum da turma</button></header>
    <VillageScene lit={save.completed.length} active={level.buddy} happy={result?.ok ?? false}/>
    {!started ? <section className={s.welcome}>
      <span className={s.eyebrow}>SEM PRESSA. SEM VIDAS PERDIDAS. COM HISTÓRIA.</span>
      <h1>Um espacinho.<br/><em>Uma grande aventura.</em></h1>
      <p>A ventania bagunçou a Vila dos Blocos. Pipo, Pop, Lili, Cora e Nino precisam de você para reacender as luzes do festival.</p>
      <p>Encaixe símbolos, mova linhas e descubra por que cada pedacinho de código tem seu lugar. Não precisa saber programar.</p>
      <button className={s.primary} onClick={() => enter(save.current)}>{save.completed.length ? "Voltar à aventura" : "Entrar na vila"} <span aria-hidden="true">→</span></button>
      <small>10 encontros · Python, JavaScript e C# · toque ou teclado</small>
    </section> : <>
      <nav className={s.path} aria-label="Mapa da aventura">{villageLevels.map((item, i) => <button key={item.id} onClick={() => enter(i)} aria-label={`Fase ${i + 1}: ${item.title}${save.completed.includes(item.id) ? ", concluída" : ""}`} aria-current={i === save.current ? "step" : undefined} data-done={save.completed.includes(item.id)}>{save.completed.includes(item.id) ? "✦" : i + 1}</button>)}</nav>
      <div className={s.adventure}>
        <section className={s.story}>
          <span className={s.eyebrow}>{level.chapter} · {level.language}</span>
          <h1 ref={heading} tabIndex={-1}>{level.title}</h1>
          <div className={s.dialogue}><VillageCharacter who={level.buddy} happy={result?.ok ?? false}/><div><strong>{buddies[level.buddy].name} · {buddyTerms[level.buddy]}</strong><p>{level.story}</p></div></div>
          <p className={s.goal}><strong>Sua missão</strong>{level.goal}</p>
          <button className={s.help} onClick={() => setHint(value => !value)} aria-expanded={hint}>{hint ? "Guardar a dica" : "Pedir uma pista ao personagem"}</button>
          {hint && <p className={s.hint}>{level.hint}</p>}
        </section>
        <section className={s.workshop} aria-label="Tabuleiro de código">
          <div className={s.workshopTitle}><strong>{level.kind === "socket" ? "Oficina dos encaixes" : "Trilhos de espaços"}</strong><span>{level.language}</span></div>
          {level.kind === "socket" ? <>
            <p className={s.instructions}>1. Escolha quem vai ajudar. 2. Toque no encaixe.</p>
            <div className={s.roster}>{(["parenteses", "colchetes", "chaves"] as const).map(who => <button key={who} aria-label={`Escolher ${buddies[who].name}: ${buddyTerms[who]}`} aria-pressed={selected === who} onClick={() => setSelected(who)}><VillageCharacter who={who}/><strong>{buddies[who].name}</strong><small>{buddyTerms[who]}</small><span>{buddies[who].symbol}</span></button>)}</div>
            <button className={s.socket} disabled={!selected} onClick={() => { setAttempt({ ...attempt, pair: selected }); setResult(null); }} aria-label="Encaixar personagem no código"><pre>{villageCode(level, attempt)}</pre><span>{attempt.pair ? `${buddies[attempt.pair].name} no encaixe · toque para trocar` : selected ? "Toque aqui para encaixar!" : "Escolha um personagem acima"}</span></button>
          </> : <>
            <p className={s.instructions}>Mova a linha pelos trilhos. Cada passo acrescenta ou retira 4 espaços.</p>
            <div className={s.rails}>{level.lines.map((line, i) => <div key={i} className={s.rail} data-indent={attempt.indents[i]}>
              <div className={s.railCode} tabIndex={0} role="group" aria-label={`Código da linha ${i + 1}`}><span className={s.lineNumber} aria-hidden="true">{i + 1}</span><code><span className={s.srOnly}>{attempt.indents[i] * 4} espaços: </span><span className={s.dots} aria-hidden="true">{"·".repeat(attempt.indents[i] * 4)}</span>{line}</code></div>
              {level.movable.includes(i) && <div className={s.railControls}><button aria-label={`Retirar 4 espaços da linha ${i + 1}`} disabled={attempt.indents[i] === 0} onClick={() => move(i, -1)}>← −4</button><span>{attempt.indents[i] * 4} espaços</span><button aria-label={`Adicionar 4 espaços à linha ${i + 1}`} disabled={attempt.indents[i] === 2} onClick={() => move(i, 1)}>+4 →</button></div>}
            </div>)}</div>
            <p className={s.legend}>· = um espaço visível para aprender. No código real, ele é vazio. Os controles não inserem tabs.</p>
          </>}
          <div className={s.actions}><button className={s.primary} onClick={play}>▶ Testar na vila</button><button className={s.help} onClick={() => { setAttempt(initialAttempt(level)); setSelected(null); setResult(null); }}>Recomeçar esta fase</button></div>
          <small className={s.simulation}>Simulação das regras desta fase — não é um compilador completo.</small>
          <div className={s.feedback} role="status" aria-live="polite" data-ok={result?.ok}>
            {result ? <><strong>{result.ok ? "✦ Mais uma luz na vila!" : "Vamos olhar juntos?"}</strong><p>{result.message}</p><div className={s.theater} data-place={level.place} aria-hidden="true"><VillageCharacter who={level.buddy} happy={result.ok}/><div className={s.props}>{level.place === "festival" ? <>{[0, 1, 2].map(i => <span key={i} data-lit={i < result.output.filter(line => /acesa/.test(line)).length}>✦</span>)}</> : <span data-lit={result.ok}>{level.place === "correio" ? "✉" : level.place === "abrigo" ? "⌂" : "▣"}</span>}</div></div><div className={s.console}><span>O QUE ACONTECEU NA CENA</span>{result.output.length ? result.output.map((line, i) => <div key={i}><span aria-hidden="true">{result.ok ? "✦" : "·"} </span>{line}</div>) : <p>Nenhuma mensagem produzida nesta simulação.</p>}</div></> : <p>Faça sua escolha e teste. Errar não tira nenhuma luz que você já conquistou.</p>}
          </div>
          {result?.ok && <div className={s.next}>{save.current < villageLevels.length - 1 ? <button className={s.primary} onClick={() => enter(save.current + 1)}>Próximo encontro →</button> : <button className={s.primary} onClick={() => enter(Math.max(0, villageLevels.findIndex(item => !save.completed.includes(item.id))))}>{finished ? "Visitar a vila de novo" : "Buscar as luzes que faltam"}</button>}<details><summary>Ver o código com espaços reais</summary><pre>{villageCode(level, attempt)}</pre></details></div>}
        </section>
      </div>
      {finished && <section className={s.celebration}><h2>O festival está aceso. E você fez parte disso.</h2><p>Você praticou chamadas, coleções, blocos e recuos. Agora leve essa descoberta para um programa escrito por você.</p><Link className={s.primary} href="/estudante/pratica/condicionais-python">Escrever no laboratório →</Link><p>Concluir a aventura é um começo, não um certificado de domínio.</p></section>}
    </>}
    {album && <section id="village-album" className={s.album} aria-label="Álbum da turma"><div className={s.albumHeading}><h2 ref={albumHeading} tabIndex={-1}>Passaportes da vila</h2><button onClick={() => { setAlbum(null); albumButton.current?.focus(); }}>Fechar álbum</button></div><p>Os símbolos viajam entre linguagens. Conheça alguns trabalhos de cada um — esta não é uma lista de todos os usos.</p><div className={s.albumTabs}>{(Object.keys(buddies) as Buddy[]).map(who => <button key={who} aria-pressed={album === who} onClick={() => setAlbum(who)}>{buddies[who].name}</button>)}</div><div className={s.passport}><VillageCharacter who={album}/><div><h3>{buddies[album].name} · {buddies[album].role}</h3><p>{buddies[album].speech}</p>{buddies[album].examples.map(example => <pre key={example}>{example}</pre>)}</div></div></section>}
    <footer className={s.footer}>{storageError ? <span role="alert">Não conseguimos salvar neste navegador. Você pode jogar, mas o progresso pode se perder ao sair.</span> : "Luzes e fase atual salvas neste navegador, separadas por conta. Não sincronizam entre aparelhos."}</footer>
  </div>;
}
