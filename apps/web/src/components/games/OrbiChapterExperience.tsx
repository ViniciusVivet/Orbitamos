"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Code2, Flag, Lightbulb, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import OrbiChapterCanvas, { type ChapterEvent, type OrbiChapterHandle } from "./OrbiChapterCanvas";
import { chapterMissionIds, chapterMissions, chapterProgramReady, completeChapterMission, emptyChapterSave, getChapterMission, orbiChapterKey, preserveChapterAchievements, readChapterSave, testChapterProgram, type ChapterMissionId, type ChapterProgram, type ChapterSave } from "@/lib/orbiChapter";
import { deliveryStorageKey, readDeliverySave } from "@/lib/orbiDelivery";
import s from "./OrbiChapter.module.css";

type Props = { userId: string; onComplete?: () => void; onBackHref?: string };
const OrbiPulseExperience = dynamic(() => import("./OrbiPulseExperience"), { ssr: false, loading: () => <p role="status">Preparando a Oficina do Pulso…</p> });
export default function OrbiDelivery(props: Props) { return <OrbiAdventure key={props.userId} {...props} />; }

function OrbiAdventure(props: Props) {
  const [workshop, setWorkshop] = useState(false);
  useEffect(() => {
    let active = true;
    const receive = () => { if (active) setWorkshop(window.location.hash === "#oficina-do-pulso"); };
    queueMicrotask(receive);
    window.addEventListener("hashchange", receive);
    return () => { active = false; window.removeEventListener("hashchange", receive); };
  }, []);
  const choose = (pulse: boolean) => {
    setWorkshop(pulse);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${pulse ? "#oficina-do-pulso" : ""}`);
    window.dispatchEvent(new Event("hashchange"));
  };
  return workshop
    ? <OrbiPulseExperience userId={props.userId} onBackHref={props.onBackHref} onReturn={() => choose(false)} />
    : <ChapterExperience {...props} onWorkshop={() => choose(true)} />;
}

function ChapterExperience({ userId, onComplete, onBackHref = "/estudante/jogos", onWorkshop }: Props & { onWorkshop: () => void }) {
  const [save, setSave] = useState<ChapterSave>(emptyChapterSave);
  const latest = useRef(save);
  const [hydrated, setHydrated] = useState(false);
  const [missionId, setMissionId] = useState<ChapterMissionId>("ponte");
  const [started, setStarted] = useState(false);
  const [legacy, setLegacy] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [nearTerminal, setNearTerminal] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasError, setCanvasError] = useState("");
  const [canvasGeneration, setCanvasGeneration] = useState(0);
  const [restartToken, setRestartToken] = useState(0);
  const [program, setProgram] = useState<ChapterProgram | null>(null);
  const [notice, setNotice] = useState("Caminhe até o terminal iluminado para preparar a ponte.");
  const [feedback, setFeedback] = useState<{ok: boolean; message: string; output?: string} | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const canvas = useRef<OrbiChapterHandle>(null);
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const mission = getChapterMission(missionId);
  const index = chapterMissionIds.indexOf(missionId);
  const finished = save.completed.length === chapterMissions.length;
  const code = save.drafts[missionId];

  useEffect(() => {
    let live = true;
    queueMicrotask(() => {
      if (!live) return;
      let stored = emptyChapterSave();
      try {
        stored = readChapterSave(localStorage.getItem(orbiChapterKey(userId)));
        setLegacy(readDeliverySave(localStorage.getItem(deliveryStorageKey(userId))).completed.length === 3);
      } catch { setStorageError(true); }
      latest.current = stored; setSave(stored); setMissionId(stored.current); setHydrated(true);
    });
    return () => { live = false; };
  }, [userId]);

  const update = useCallback((next: ChapterSave) => {
    let merged = next;
    try {
      merged = preserveChapterAchievements(next, readChapterSave(localStorage.getItem(orbiChapterKey(userId))));
      localStorage.setItem(orbiChapterKey(userId), JSON.stringify(merged)); setStorageError(false);
    }
    catch { setStorageError(true); }
    latest.current = merged; setSave(merged);
    window.dispatchEvent(new Event("orbitamos-practice-updated"));
    return merged;
  }, [userId]);

  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key !== orbiChapterKey(userId)) return;
      const incoming = readChapterSave(event.newValue);
      const merged = preserveChapterAchievements(latest.current, incoming);
      latest.current = merged; setSave(merged);
      if (event.newValue && merged.completed.length > incoming.completed.length) {
        try { localStorage.setItem(orbiChapterKey(userId), JSON.stringify(merged)); }
        catch { setStorageError(true); }
      }
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [userId]);

  useEffect(() => {
    if (terminalOpen && dialog.current && !dialog.current.open) {
      dialog.current.showModal();
      editor.current?.focus({ preventScroll: true });
    } else if (!terminalOpen && dialog.current?.open) dialog.current.close();
  }, [terminalOpen]);
  useEffect(() => {
    if (!terminalOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [terminalOpen]);
  useEffect(() => {
    const pause = () => { if (document.hidden) setPaused(true); };
    const leave = () => setPaused(true);
    document.addEventListener("visibilitychange", pause);
    window.addEventListener("pagehide", leave);
    window.addEventListener("blur", leave);
    return () => { document.removeEventListener("visibilitychange", pause); window.removeEventListener("pagehide", leave); window.removeEventListener("blur", leave); };
  }, []);

  const closeTerminal = () => { dialog.current?.close(); setTerminalOpen(false); setResetConfirm(false); canvas.current?.focus(); };
  const onEvent = useCallback((event: ChapterEvent) => {
    if (event.type === "ready") { setCanvasReady(true); canvas.current?.focus(); }
    if (event.type === "error") { setCanvasReady(true); setCanvasError(event.message); }
    if (event.type === "position") {
      setNearTerminal(event.nearTerminal);
      if (root.current) { root.current.dataset.playerX = String(Math.round(event.x)); root.current.dataset.zone = event.zone; }
    }
    if (event.type === "terminal") { setTerminalOpen(true); setResetConfirm(false); }
    if (event.type === "checkpoint") setNotice("Ponto de retorno ativado nesta tentativa. Se cair, você volta ao terminal com o código aplicado.");
    if (event.type === "fell") setNotice("Tudo bem cair. Você voltou ao terminal; ajuste o código ou tente outro pulo.");
    if (event.type === "blocked") setNotice(event.message);
    if (event.type === "arrived" && event.mission === missionId) {
      const before = latest.current, next = update(completeChapterMission(before, missionId));
      setArrived(true);
      setNotice("Entrega feita. Seu código abriu um caminho de verdade para o Orbi.");
      if (before.completed.length < 3 && next.completed.length === 3) onComplete?.();
    }
  }, [missionId, onComplete, update]);

  const changeMission = (id: ChapterMissionId) => {
    update({ ...latest.current, current: id });
    setMissionId(id); setProgram(null); setArrived(false); setPaused(false); setNearTerminal(false);
    setFeedback(null); setHintCount(0); setUndo(null); setRestartToken(value => value + 1);
    setNotice(id === "ponte" ? "Caminhe até o terminal iluminado para preparar a ponte." : "A próxima entrega começa no terminal. Caminhe para a direita.");
    setStarted(true); canvas.current?.focus();
  };
  const applyCode = () => {
    const result = testChapterProgram(missionId, code);
    update({ ...latest.current, attempts: { ...latest.current.attempts, [missionId]: latest.current.attempts[missionId] + 1 } });
    if (!result.ok) { setFeedback({ ok: false, message: result.message }); return; }
    setProgram(result.program); setNotice(result.message);
    setFeedback({ ok: chapterProgramReady(missionId, result.program), message: result.message, output: result.output });
    closeTerminal();
  };
  const edit = (value: string) => update({ ...latest.current, drafts: { ...latest.current.drafts, [missionId]: value.slice(0, 2400) } });
  const insert = (text: string) => {
    const field = editor.current, from = field?.selectionStart ?? code.length, to = field?.selectionEnd ?? from;
    edit(code.slice(0, from) + text + code.slice(to));
    requestAnimationFrame(() => { field?.focus(); field?.setSelectionRange(from + text.length, from + text.length); });
  };
  const hold = (event: PointerEvent<HTMLButtonElement>, direction: "left" | "right") => {
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    canvas.current?.setControl(direction, true); canvas.current?.unlockAudio();
  };
  const release = (direction: "left" | "right") => canvas.current?.setControl(direction, false);

  return <section ref={root} className={s.chapter} data-orbi-delivery data-chapter-mission={missionId} data-game-status={arrived ? "arrived" : paused ? "paused" : "playing"}>
    <header className={s.header}>
      <Link href={onBackHref} className={s.back}><ArrowLeft size={16} /> Jogos</Link>
      <span className={s.series}>ENTREGA DO ORBI <span>CAPÍTULO 01</span></span>
      <span className={s.progress} aria-label={save.completed.length + " de 3 entregas concluídas"}>{save.completed.length}/3 <Flag size={14} /></span>
    </header>

    {!started ? <div className={s.intro}>
      <div className={s.introArt} role="img" aria-label="Bairro entre montanhas ao anoitecer, com casas iluminadas e o correio do Orbi"><span className={s.introSprite} /></div>
      <div className={s.introCopy}><span className={s.eyebrow}>UMA AVENTURA PARA APRENDER PROGRAMANDO</span>
        <h1>A última luz<br />do bairro.</h1>
        <p>Uma encomenda, três caminhos. Ajude Orbi a abrir pontes, alcançar telhados e acender o Farol usando código.</p>
        <button className={s.primary} disabled={!hydrated} onClick={() => { setStarted(true); setArrived(false); }}><Play size={18} />{!hydrated ? "Preparando aventura…" : save.completed.length || save.attempts[save.current] ? "Continuar minha aventura" : "Entrar no bairro"}<ArrowRight size={18} /></button>
        <button className={s.workshopEntry} disabled={!hydrated} onClick={onWorkshop}><span>NOVA AVENTURA</span>Oficina do Pulso <ArrowRight size={17} /></button>
        <span className={s.introMeta}>JavaScript do zero · caminhar, explorar e experimentar</span>
        {hydrated && save.attempts[save.current] > 0 && <p className={s.history}>Seu código e suas entregas estão guardados. O caminho recomeça ao entrar.</p>}
        {legacy && <p className={s.history}>Sua aventura anterior está guardada. Este capítulo traz três novas entregas.</p>}
        {finished && <p className={s.history}><Check size={16} /> Capítulo concluído. Você pode revisitar as entregas.</p>}
      </div>
    </div> : <>
      <div className={s.missionBar}><div><span className={s.eyebrow}>ENTREGA {index + 1} DE 3</span><h1>{mission.title}</h1><p>{mission.objective}</p></div>
        <div className={s.tools}>
          <button onClick={() => { canvas.current?.unlockAudio(); setMuted(value => !value); }} aria-label={muted ? "Ativar som" : "Silenciar som"} title={muted ? "Ativar som" : "Silenciar som"}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
          <button onClick={() => setPaused(value => !value)} aria-label={paused ? "Continuar jogo" : "Pausar jogo"} title={paused ? "Continuar jogo" : "Pausar jogo"}>{paused ? <Play size={20} /> : <Pause size={20} />}</button>
          <button aria-label="Voltar ao ponto de retorno" title="Voltar ao ponto de retorno" disabled={!canvasReady || arrived} onClick={() => { setRestartToken(value => value + 1); setNotice("De volta ao ponto de retorno. Seu código continua aplicado."); canvas.current?.focus(); }}><RotateCcw size={18} /></button>
        </div>
      </div>
      <div className={s.stage}>
        <OrbiChapterCanvas key={canvasGeneration} ref={canvas} mission={missionId} program={program} paused={paused || terminalOpen || arrived} muted={muted} restartToken={restartToken} onEvent={onEvent} />
        {!canvasReady && <div className={s.loading} role="status">Preparando o bairro…</div>}
        {canvasError && <div className={s.overlay}><h2>Vamos abrir o bairro de novo.</h2><p>{canvasError}</p><button className={s.primary} onClick={() => { setCanvasError(""); setCanvasReady(false); setCanvasGeneration(value => value + 1); }}>Tentar novamente</button></div>}
        {paused && !arrived && <div className={s.overlay}><span className={s.eyebrow}>ENCOMENDA EM SEGURANÇA</span><h2>Uma pausa no caminho.</h2><button className={s.primary} onClick={() => { setPaused(false); canvas.current?.focus(); }}><Play size={18} /> Continuar aventura</button></div>}
        {arrived && <div className={s.overlay} data-chapter-victory>
          <span className={s.successIcon}><Check size={26} /></span><span className={s.eyebrow}>ENTREGA CONCLUÍDA</span>
          <h2>{index === 2 ? "O bairro voltou a brilhar." : index === 0 ? "Uma mudança abriu o caminho." : "Sua ideia chegou mais alto."}</h2>
          <p>{index === 0 ? "Você mudou o valor de alcance, viu a ponte crescer e atravessou com a encomenda." : index === 1 ? "Você ajustou altura e usou o elevador para chegar ao terraço." : "Você calculou energia usando custo. A conta continua fazendo sentido quando o custo muda."}</p>
          {index < 2 ? <button className={s.primary} onClick={() => changeMission(chapterMissionIds[index + 1])}>Próxima entrega <ArrowRight size={18} /></button> :
            <Link className={s.primary} href={onBackHref.startsWith("/dev/") ? "/dev/ide-preview/variaveis-js?from=delivery&academy=1" : "/estudante/pratica/variaveis-js?from=delivery"}><Code2 size={18} /> Levar a ideia ao laboratório</Link>}
          <button className={s.textButton} onClick={() => changeMission(missionId)}>Jogar esta entrega de novo</button>
        </div>}
      </div>
      <div className={s.controls} aria-label="Controles do jogo">
        <div className={s.directions}>
          <button aria-label="Caminhar para a esquerda" onPointerDown={event => hold(event, "left")} onPointerUp={() => release("left")} onPointerCancel={() => release("left")} onLostPointerCapture={() => release("left")} onBlur={() => release("left")} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") canvas.current?.setControl("left", true); }} onKeyUp={() => release("left")}><ArrowLeft size={25} /></button>
          <button aria-label="Caminhar para a direita" onPointerDown={event => hold(event, "right")} onPointerUp={() => release("right")} onPointerCancel={() => release("right")} onLostPointerCapture={() => release("right")} onBlur={() => release("right")} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") canvas.current?.setControl("right", true); }} onKeyUp={() => release("right")}><ArrowRight size={25} /></button>
        </div>
        <button className={s.jump} onPointerDown={event => { event.preventDefault(); canvas.current?.unlockAudio(); canvas.current?.jump(); }} onClick={event => { if (event.detail === 0) { canvas.current?.unlockAudio(); canvas.current?.jump(); } }}>Pular <span>↑</span></button>
        <button className={s.terminalButton} aria-label="Abrir terminal" title="Abrir terminal" disabled={!nearTerminal || paused || arrived} onClick={() => canvas.current?.interact()}><Code2 size={19} /><span>Abrir terminal</span></button>
      </div>
      <p className={s.notice} role="status"><span className={s.orbiDot} />{notice}</p>
      <details className={s.help}><summary>Como jogar e o que estou aprendendo</summary><p>{mission.story}</p><p><strong>{mission.concept}.</strong> No computador: setas ou A/D, espaço para pular e E perto do terminal. No celular: segure as setas e toque em Pular. O código fica guardado neste navegador; você pode voltar ao terminal sem perder seu rascunho.</p></details>
    </>}

    <nav className={s.route} aria-label="Entregas do capítulo">{chapterMissions.map((item, position) => <button key={item.id} disabled={!hydrated || position > save.completed.length} aria-current={missionId === item.id ? "step" : undefined} onClick={() => changeMission(item.id)}><span>{save.completed.includes(item.id) ? <Check size={17} /> : String(position + 1).padStart(2, "0")}</span><span>{item.title}<small>{item.concept}</small></span></button>)}</nav>
    {storageError && <p role="alert" className={s.warning}>O navegador não conseguiu guardar o progresso. Copie seu código antes de sair.</p>}

    <dialog ref={dialog} className={s.dialog} onCancel={event => { event.preventDefault(); closeTerminal(); }} onClose={() => setTerminalOpen(false)} aria-labelledby="orbi-terminal-title">
      <div className={s.dialogHead}><span className={s.eyebrow}>TERMINAL · ENTREGA {index + 1}</span><button aria-label="Fechar terminal" onClick={closeTerminal}><X size={21} /></button></div>
      <h2 id="orbi-terminal-title">{mission.terminalTitle}</h2><p className={s.instruction}>{mission.instruction}</p>
      {index === 0 && <div className={s.example}><span>Uma variável guarda um valor com um nome. Aqui, o nome é alcance.</span><code>{mission.referenceCode}</code><span className={s.codeReading}><code>const</code> declara o nome. <code>=</code> guarda o valor. Troque o número para mudar a ponte.</span></div>}
      <label className={s.editorLabel} htmlFor="orbi-code">Seu código <span>JavaScript</span></label>
      <textarea ref={editor} id="orbi-code" value={code} onChange={event => { edit(event.target.value); setFeedback(null); }} onKeyDown={event => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); applyCode(); } }} spellCheck={false} autoCapitalize="off" autoCorrect="off" inputMode="text" maxLength={2400} aria-describedby="orbi-draft-note" />
      <div className={s.symbols} aria-label="Atalhos de escrita">{["const ", "let ", " = ", ";", " + ", "\n"].map(token => <button key={token} type="button" onClick={() => insert(token)} aria-label={token === "\n" ? "Inserir nova linha" : "Inserir " + token}>{token === "\n" ? "↵" : token.trim()}</button>)}</div>
      <p id="orbi-draft-note" className={storageError ? s.warning : s.draftNote} role={storageError ? "alert" : undefined}>{storageError ? "O navegador não conseguiu guardar seu rascunho. Copie este código antes de sair. Você ainda pode testar nesta tela." : "Rascunho salvo neste navegador. A máquina só muda quando você aplica o código."}</p>
      {feedback && <div className={feedback.ok ? s.feedbackOk : s.feedbackError} role="status">{feedback.message}{feedback.output && <code>{feedback.output}</code>}</div>}
      {hintCount > 0 && <aside className={s.hints}><strong>Uma pista do Orbi</strong>{mission.hints.slice(0, hintCount).map(hint => <p key={hint}>{hint}</p>)}</aside>}
      <div className={s.dialogActions}><button className={s.primary} onClick={applyCode}><Play size={17} />Aplicar e ver no cenário</button><button className={s.secondary} onClick={() => setHintCount(value => Math.min(value + 1, mission.hints.length))} disabled={hintCount >= mission.hints.length}><Lightbulb size={16} />Pedir pista</button></div>
      <div className={s.resetRow}>{!resetConfirm ? <button className={s.textButton} onClick={() => setResetConfirm(true)}>Recomeçar este código</button> : <><span>Voltar ao código inicial desta entrega?</span><button className={s.textButton} onClick={() => { setUndo(code); edit(mission.starterCode); setResetConfirm(false); setFeedback(null); }}>Sim, recomeçar</button><button className={s.textButton} onClick={() => setResetConfirm(false)}>Cancelar</button></>}
      {undo !== null && <button className={s.textButton} onClick={() => { edit(undo); setUndo(null); }}>Desfazer reinício</button>}</div>
    </dialog>
  </section>;
}
