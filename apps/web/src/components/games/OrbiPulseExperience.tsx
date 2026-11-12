"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Code2, Lightbulb, Pause, Play, RotateCcw, Shield, Sparkles, Volume2, VolumeX, X, Zap } from "lucide-react";
import OrbiChapterCanvas, { type ChapterEvent, type OrbiChapterHandle } from "./OrbiChapterCanvas";
import PulseCoach from "./orbi-chapter/PulseCoach";
import { PulsePredictionPrompt, PulsePredictionResult, type PredictionReview } from "./orbi-chapter/PulsePrediction";
import type { PulseGuideState } from "./orbi-chapter/types";
import { buildPulsePrediction, type PulsePredictionChoice } from "@/lib/orbiPulsePrediction";
import { completePulseLesson, defaultPulseProgram, emptyPulseSave, getPulseLesson, PULSE_CODE_LIMIT, preservePulseAchievements, pulseLessonIds, pulseLessons, pulseSaveKey, readPulseSave, testPulseProgram, type PulseLessonId, type PulseProgram, type PulseSave } from "@/lib/orbiPulse";
import s from "./OrbiChapter.module.css";
import p from "./OrbiPulse.module.css";

type Props = { userId: string; onReturn: () => void; onBackHref?: string };
type Hud = { shield: number; cleared: number; total: number; cooldownRemaining: number; cooldownTotal: number };
const freshHud = (): Hud => ({ shield: 3, cleared: 0, total: 3, cooldownRemaining: 0, cooldownTotal: 1.4 });
const freshGuide = (): PulseGuideState => ({ phase: "terminal", threat: "safe", direction: "right", target: 1, breach: false, canReturn: false });

/** An optional adventure with its own save. It never completes or awards XP for delivery v2. */
export default function OrbiPulseExperience({ userId, onReturn, onBackHref = "/estudante/jogos" }: Props) {
  const [save, setSave] = useState<PulseSave>(emptyPulseSave);
  const latest = useRef(save);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [lessonId, setLessonId] = useState<PulseLessonId>("alcance");
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [nearTerminal, setNearTerminal] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasError, setCanvasError] = useState("");
  const [generation, setGeneration] = useState(0);
  const [restartToken, setRestartToken] = useState(0);
  const [program, setProgram] = useState<PulseProgram | null>(null);
  const [hud, setHud] = useState<Hud>(freshHud);
  const [guide, setGuide] = useState<PulseGuideState>(freshGuide);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [predictionChoice, setPredictionChoice] = useState<{ id: string; answer: PulsePredictionChoice } | null>(null);
  const [predictionReview, setPredictionReview] = useState<PredictionReview | null>(null);
  const [notice, setNotice] = useState("Leve Orbi ao terminal. O primeiro pulso termina antes de alcançar a sentinela.");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string; output?: string } | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const canvas = useRef<OrbiChapterHandle>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const openAfterReturn = useRef(false);
  const assistiveSteps = useRef<Partial<Record<"left" | "right", ReturnType<typeof setTimeout>>>>({});
  const lesson = getPulseLesson(lessonId);
  const index = pulseLessonIds.indexOf(lessonId);
  const code = save.drafts[lessonId];
  const applied = useMemo(() => program ?? defaultPulseProgram(lessonId), [program, lessonId]);
  const pulse = useMemo(() => ({ lesson: lessonId, program }), [lessonId, program]);
  const prediction = useMemo(() => {
    if (!terminalOpen) return null;
    const candidate = testPulseProgram(code);
    return candidate.ok ? buildPulsePrediction(lessonId, applied, candidate.program) : null;
  }, [terminalOpen, code, lessonId, applied]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let stored = emptyPulseSave();
      try { stored = readPulseSave(localStorage.getItem(pulseSaveKey(userId))); }
      catch { setStorageError(true); }
      latest.current = stored; setSave(stored); setLessonId(stored.current); setHydrated(true);
      if (stored.current === "ritmo") setNotice("O alcance já chega à sentinela. Observe o escudo se refazer entre os pulsos e ajuste a recarga no terminal.");
    });
    return () => { active = false; };
  }, [userId]);

  const update = useCallback((next: PulseSave) => {
    let merged = next;
    try {
      merged = preservePulseAchievements(next, readPulseSave(localStorage.getItem(pulseSaveKey(userId))));
      localStorage.setItem(pulseSaveKey(userId), JSON.stringify(merged)); setStorageError(false);
    } catch { setStorageError(true); }
    latest.current = merged; setSave(merged);
    return merged;
  }, [userId]);

  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key !== pulseSaveKey(userId)) return;
      const incoming = readPulseSave(event.newValue);
      const merged = preservePulseAchievements(latest.current, incoming);
      latest.current = merged; setSave(merged);
      if (event.newValue && merged.completed.length > incoming.completed.length) {
        try { localStorage.setItem(pulseSaveKey(userId), JSON.stringify(merged)); }
        catch { setStorageError(true); }
      }
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [userId]);

  useEffect(() => {
    if (terminalOpen && dialog.current && !dialog.current.open) { dialog.current.showModal(); editor.current?.focus({ preventScroll: true }); }
    else if (!terminalOpen && dialog.current?.open) dialog.current.close();
    if (!terminalOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [terminalOpen]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) setPaused(true); };
    const leave = () => setPaused(true);
    document.addEventListener("visibilitychange", hidden); window.addEventListener("pagehide", leave); window.addEventListener("blur", leave);
    return () => { document.removeEventListener("visibilitychange", hidden); window.removeEventListener("pagehide", leave); window.removeEventListener("blur", leave); };
  }, []);
  useEffect(() => {
    const steps = assistiveSteps.current;
    return () => { Object.values(steps).forEach(clearTimeout); };
  }, []);

  const closeTerminal = () => { dialog.current?.close(); setTerminalOpen(false); setResetConfirm(false); canvas.current?.focus(); };
  const onEvent = useCallback((event: ChapterEvent) => {
    if (event.type === "ready") { setCanvasReady(true); canvas.current?.focus(); }
    if (event.type === "error") { setCanvasReady(true); setCanvasError(event.message); }
    if (event.type === "position") {
      setNearTerminal(event.nearTerminal);
      if (openAfterReturn.current && event.nearTerminal) { openAfterReturn.current = false; setTerminalOpen(true); setResetConfirm(false); setNoticeVisible(false); }
    }
    if (event.type === "terminal") { setTerminalOpen(true); setResetConfirm(false); setNoticeVisible(false); }
    if (event.type === "pulse-guide") setGuide(event);
    if (event.type === "checkpoint") setNotice("Terminal encontrado. Seu código e os reparos desta tentativa continuam com você.");
    if (event.type === "fell") { setNotice("Orbi voltou em segurança. Seu código continua aplicado; tente outro caminho."); setNoticeVisible(true); }
    if (event.type === "blocked" || event.type === "pulse-feedback") { setNotice(event.message); setNoticeVisible(true); }
    if (event.type === "pulse-state") {
      const remaining = Math.round(event.cooldownRemaining * 10) / 10;
      setHud(previous => previous.shield === event.shield && previous.cleared === event.cleared && previous.total === event.total && previous.cooldownRemaining === remaining && previous.cooldownTotal === event.cooldownTotal
        ? previous : { shield: event.shield, cleared: event.cleared, total: event.total, cooldownRemaining: remaining, cooldownTotal: event.cooldownTotal });
    }
    if (event.type === "pulse-arrived" && event.lesson === lessonId && program) {
      update(completePulseLesson(latest.current, lessonId));
      setArrived(true); setNotice("O código mudou seu equipamento. As três sentinelas voltaram a ajudar o bairro."); setNoticeVisible(true);
    }
  }, [lessonId, program, update]);

  const chooseLesson = (id: PulseLessonId) => {
    update({ ...latest.current, current: id });
    setLessonId(id); setProgram(null); setHud(freshHud()); setArrived(false); setPaused(false);
    setNearTerminal(false); setHintCount(0); setFeedback(null); setUndo(null); setStarted(true);
    setGuide(freshGuide()); setNoticeVisible(false); setPredictionChoice(null); setPredictionReview(null); openAfterReturn.current = false;
    setRestartToken(value => value + 1);
    setNotice(id === "alcance" ? "O pulso ainda é curto. Encontre o terminal e programe até onde ele vai." : "O escudo volta em 1.1 segundo. Programe o intervalo entre dois pulsos.");
    canvas.current?.focus();
  };
  const edit = (value: string) => {
    setPredictionChoice(null); setFeedback(null);
    update({ ...latest.current, drafts: { ...latest.current.drafts, [lessonId]: value.slice(0, PULSE_CODE_LIMIT) } });
  };
  const returnToTerminal = () => {
    openAfterReturn.current = true;
    setNoticeVisible(false); setRestartToken(value => value + 1); canvas.current?.focus();
  };
  const apply = () => {
    const result = testPulseProgram(code);
    update({ ...latest.current, attempts: { ...latest.current.attempts, [lessonId]: latest.current.attempts[lessonId] + 1 } });
    if (!result.ok) { setFeedback({ ok: false, message: result.message }); return; }
    setPredictionReview(prediction ? { question: prediction, answer: predictionChoice?.id === prediction.id ? predictionChoice.answer : null } : null);
    setPredictionChoice(null); setNoticeVisible(false);
    setProgram(result.program); setFeedback({ ok: true, message: result.message, output: result.output });
    setNotice(result.message); closeTerminal();
  };
  const insert = (text: string) => {
    const field = editor.current, from = field?.selectionStart ?? code.length, to = field?.selectionEnd ?? from;
    field?.focus({ preventScroll: true });
    edit(code.slice(0, from) + text + code.slice(to));
    requestAnimationFrame(() => field?.setSelectionRange(from + text.length, from + text.length));
  };
  const hold = (event: PointerEvent<HTMLButtonElement>, control: "left" | "right" | "fire") => {
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    canvas.current?.setControl(control, true); canvas.current?.unlockAudio();
  };
  const release = (control: "left" | "right" | "fire") => canvas.current?.setControl(control, false);
  const holdingProps = (control: "left" | "right" | "fire") => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => hold(event, control),
    onPointerUp: () => release(control), onPointerCancel: () => release(control),
    onLostPointerCapture: () => release(control), onBlur: () => release(control),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); canvas.current?.unlockAudio(); canvas.current?.setControl(control, true); } },
    onKeyUp: () => release(control),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.detail !== 0) return;
      canvas.current?.unlockAudio();
      if (control === "fire") { canvas.current?.fire(); return; }
      clearTimeout(assistiveSteps.current[control]);
      canvas.current?.setControl(control, true);
      assistiveSteps.current[control] = setTimeout(() => release(control), 220);
    },
  });
  const disabled = !canvasReady || paused || arrived || terminalOpen;
  const cooldownPercent = hud.cooldownTotal > 0 ? Math.min(100, Math.max(0, (1 - hud.cooldownRemaining / hud.cooldownTotal) * 100)) : 100;
  const labHref = onBackHref.startsWith("/dev/") ? "/dev/ide-preview/variaveis-js?from=delivery&academy=1" : "/estudante/pratica/variaveis-js?from=delivery";

  return <section className={`${s.chapter} ${p.workshop}`} data-orbi-pulse data-pulse-lesson={lessonId} data-game-status={arrived ? "arrived" : paused ? "paused" : "playing"}>
    <header className={s.header}>
      <button type="button" className={s.back} onClick={onReturn}><ArrowLeft size={16} /> Entregas do Orbi</button>
      <span className={s.series}>OFICINA DO PULSO <span>AVENTURA EXTRA</span></span>
      <span className={s.progress} aria-label={`${save.completed.length} de 2 rotas concluídas`}>{save.completed.length}/2 <Sparkles size={14} /></span>
    </header>
    {!started ? <div className={`${s.intro} ${p.intro}`}>
      <div className={s.introArt} role="img" aria-label="O bairro do Orbi ao anoitecer, agora com sentinelas de manutenção"><span className={p.introSentinel} /><span className={p.introOrbi} /></div>
      <div className={s.introCopy}>
        <span className={s.eyebrow}>SEU CÓDIGO AGORA VIRA UMA AÇÃO</span><h1>Programe<br />seu pulso.</h1>
        <p>Uma tempestade desregulou as sentinelas. Ajuste seu equipamento, desvie dos ruídos e devolva a luz ao bairro.</p>
        <button className={s.primary} disabled={!hydrated} onClick={() => setStarted(true)}><Zap size={18} />{!hydrated ? "Preparando oficina…" : save.attempts[save.current] || save.completed.length ? "Continuar na oficina" : "Entrar na Oficina do Pulso"}<ArrowRight size={17} /></button>
        <span className={s.introMeta}>Duas rotas · alcance, decimais e tempo entre ações</span>
        <p className={s.history}>Suas três entregas e conquistas anteriores continuam guardadas.</p>
      </div>
    </div> : <>
      <div className={s.missionBar}>
        <div><span className={s.eyebrow}>ROTA {index + 1} DE 2 · {lesson.concept}</span><h1>{lesson.title}</h1><p>{lesson.objective}</p></div>
        <div className={s.tools}>
          <button onClick={() => { canvas.current?.unlockAudio(); setMuted(value => !value); }} aria-label={muted ? "Ativar som" : "Silenciar som"}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
          <button onClick={() => setPaused(value => !value)} aria-label={paused ? "Continuar jogo" : "Pausar jogo"}>{paused ? <Play size={20} /> : <Pause size={20} />}</button>
          <button aria-label="Voltar ao ponto de retorno" disabled={!canvasReady || arrived} onClick={() => { setRestartToken(value => value + 1); canvas.current?.focus(); }}><RotateCcw size={18} /></button>
        </div>
      </div>
      <div className={p.hud} aria-label="Estado do equipamento">
        <span><Shield size={16} /> Escudo <span className={p.shieldPips} aria-hidden="true">{[0, 1, 2].map(index => <i key={index} data-filled={index < hud.shield} />)}</span><strong aria-label={`${hud.shield} de 3`}>{hud.shield}/3</strong></span>
        <span>Sentinelas reparadas <strong>{hud.cleared}/{hud.total}</strong></span>
        <span className={p.equipment}>Alcance <strong>{applied.range}</strong> · recarga <strong>{applied.cooldown} s</strong></span>
        <span className={p.recharge} role="meter" aria-label="Recarga do pulso" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(cooldownPercent)}><i style={{ width: `${cooldownPercent}%` }} /></span>
      </div>
      <div className={s.stage}>
        <OrbiChapterCanvas key={generation} ref={canvas} mission="farol" program={null} pulse={pulse} paused={paused || terminalOpen || arrived} muted={muted} restartToken={restartToken} onEvent={onEvent} />
        {!canvasReady && <div className={s.loading} role="status">Acordando as sentinelas…</div>}
        {canvasError && <div className={s.overlay}><h2>Vamos abrir a oficina de novo.</h2><p>{canvasError}</p><button className={s.primary} onClick={() => { setCanvasError(""); setCanvasReady(false); setGeneration(value => value + 1); }}>Tentar novamente</button></div>}
        {paused && !arrived && <div className={s.overlay}><span className={s.eyebrow}>SEU EQUIPAMENTO ESTÁ EM SEGURANÇA</span><h2>Uma pausa para respirar.</h2><button className={s.primary} onClick={() => { setPaused(false); canvas.current?.focus(); }}><Play size={18} />Continuar aventura</button></div>}
        {arrived && <div className={s.overlay} data-chapter-victory data-pulse-victory>
          <span className={s.successIcon}><Check size={26} /></span><span className={s.eyebrow}>ROTA CONCLUÍDA</span>
          <h2>{lesson.victoryTitle}</h2><p>{lesson.victoryMessage}</p>
          {index === 0 ? <button className={s.primary} onClick={() => chooseLesson("ritmo")}>Próxima rota: o ritmo <ArrowRight size={17} /></button> : <Link className={s.primary} href={labHref}><Code2 size={18} />Continuar com código no laboratório</Link>}
          <button className={s.textButton} onClick={() => chooseLesson(lessonId)}>Jogar esta rota de novo</button>
        </div>}
      </div>
      <div className={`${s.controls} ${p.controls}`} aria-label="Controles da Oficina do Pulso">
        <div className={s.directions}>
          <button aria-label="Caminhar para a esquerda" disabled={disabled} {...holdingProps("left")}><ArrowLeft size={24} /></button>
          <button aria-label="Caminhar para a direita" disabled={disabled} {...holdingProps("right")}><ArrowRight size={24} /></button>
        </div>
        <button className={s.jump} disabled={disabled} onPointerDown={event => { event.preventDefault(); canvas.current?.unlockAudio(); canvas.current?.jump(); }} onClick={event => { if (event.detail === 0) canvas.current?.jump(); }}>Pular <span>↑</span></button>
        <button className={p.fire} aria-label="Disparar pulso" disabled={disabled} {...holdingProps("fire")}><Zap size={20} /><span>Pulso</span></button>
        <button className={s.terminalButton} aria-label="Abrir terminal" disabled={!nearTerminal || paused || arrived} onClick={() => canvas.current?.interact()}><Code2 size={19} /><span>Terminal</span></button>
      </div>
      {!arrived && !canvasError && <PulseCoach guide={guide} nearTerminal={nearTerminal} disabled={disabled} onReturnToTerminal={returnToTerminal} />}
      {noticeVisible && <p className={s.notice} role="status"><span className={s.orbiDot} />{notice}</p>}
      {predictionReview && !arrived && <PulsePredictionResult key={predictionReview.question.id} review={predictionReview} />}
      <details className={s.help}><summary>Controles e história desta rota</summary><p>{lesson.story}</p><p>No computador: A/D ou setas para andar, espaço para pular, F ou X para o pulso, E no terminal. No celular: segure as setas e o botão Pulso; combine com Pular para desviar. A luz na sentinela avisa antes do ataque.</p><p>As barreiras desaparecem quando o reparo termina. Se o escudo do Orbi acabar, ele volta ao ponto seguro com o código aplicado. Os reparos desta tentativa continuam; ao reabrir a página, o percurso começa de novo.</p></details>
    </>}
    <nav className={`${s.route} ${p.route}`} aria-label="Rotas da Oficina do Pulso">{pulseLessons.map((item, position) => <button key={item.id} disabled={!hydrated || position > save.completed.length} aria-current={lessonId === item.id ? "step" : undefined} onClick={() => chooseLesson(item.id)}><span>{save.completed.includes(item.id) ? <Check size={17} /> : position + 1}</span><span>{item.title}<small>{item.concept}</small></span></button>)}</nav>
    {storageError && <p role="alert" className={s.warning}>Não foi possível guardar o progresso neste navegador. Copie seu código antes de sair.</p>}
    <dialog ref={dialog} className={s.dialog} onCancel={event => { event.preventDefault(); closeTerminal(); }} onClose={() => setTerminalOpen(false)} aria-labelledby="pulse-terminal-title">
      <div className={s.dialogHead}><span className={s.eyebrow}>OFICINA · ROTA {index + 1}</span><button aria-label="Fechar terminal" onClick={closeTerminal}><X size={21} /></button></div>
      <h2 id="pulse-terminal-title">{lesson.terminalTitle}</h2><p className={s.instruction}>{lesson.instruction}</p>
      <div className={p.codeMap}><span><strong>alcancePulso</strong>Distância que a onda percorre.</span><span><strong>recarga</strong>Segundos até o próximo pulso.</span></div>
      <label className={s.editorLabel} htmlFor="pulse-code">Seu código <span>JavaScript</span></label>
      <textarea ref={editor} id="pulse-code" className={p.editor} value={code} onChange={event => edit(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); apply(); } }} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={PULSE_CODE_LIMIT} aria-describedby="pulse-draft-note" />
      <div className={s.symbols} aria-label="Atalhos de escrita">{["const ", " = ", ";", ".", "\n"].map(token => <button key={token} type="button" onClick={() => insert(token)} aria-label={token === "\n" ? "Inserir nova linha" : "Inserir " + token}>{token === "\n" ? "↵" : token.trim()}</button>)}</div>
      {prediction && <PulsePredictionPrompt question={prediction} selected={predictionChoice?.id === prediction.id ? predictionChoice.answer : null} onSelect={answer => setPredictionChoice({ id: prediction.id, answer })} />}
      <p id="pulse-draft-note" className={storageError ? s.warning : s.draftNote} role={storageError ? "alert" : undefined}>{storageError ? "O rascunho continua nesta tela, mas não foi salvo. Copie antes de sair." : "Rascunho salvo neste navegador. Aplicar muda o equipamento; reparar as sentinelas e chegar à oficina conclui a rota."}</p>
      {feedback && <div className={feedback.ok ? s.feedbackOk : s.feedbackError} role="status">{feedback.message}{feedback.output && <code>{feedback.output}</code>}</div>}
      {hintCount > 0 && <aside className={s.hints}><strong>Uma pista do Orbi</strong>{lesson.hints.slice(0, hintCount).map(hint => <p key={hint}>{hint}</p>)}</aside>}
      <div className={`${s.dialogActions} ${p.stickyActions}`}><button className={s.primary} onClick={apply}><Play size={17} />Aplicar e testar o pulso</button><button className={`${s.secondary} ${p.hintButton}`} aria-label="Pedir pista" onClick={() => setHintCount(value => Math.min(value + 1, lesson.hints.length))} disabled={hintCount >= lesson.hints.length}><Lightbulb size={16} /><span>Pedir pista</span></button></div>
      <div className={s.resetRow}>{!resetConfirm ? <button className={s.textButton} onClick={() => setResetConfirm(true)}>Recomeçar este código</button> : <><span>Voltar às duas linhas iniciais?</span><button className={s.textButton} onClick={() => { setUndo(code); edit(lesson.starterCode); setResetConfirm(false); setFeedback(null); }}>Sim, recomeçar</button><button className={s.textButton} onClick={() => setResetConfirm(false)}>Cancelar</button></>}{undo !== null && <button className={s.textButton} onClick={() => { edit(undo); setUndo(null); }}>Desfazer reinício</button>}</div>
    </dialog>
    <Link className={p.catalogLink} href={onBackHref}>Ver todos os jogos <ArrowRight size={14} /></Link>
  </section>;
}
