"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Code2, FileCode2, Folder, Play, RotateCcw, Settings2, Square, Volume2 } from "lucide-react";
import { buildSpokenScript, completeSpeakingPractice, emptySpeakingSave, englishSpeakingLessons, getSpeakingLesson, mergeSpeakingSave, readSpeakingSave, speakingSaveKey, type SpeakingSave, type SpeakingScene } from "@/lib/spokenEnglish";
import { createSpokenSpeech } from "@/lib/spokenSpeech";
import { emptyEnglishUseSave, englishUseKey, englishUseQuestions, evaluateEnglishUse, getEnglishUseQuestion, mergeEnglishUseSave, readEnglishUseSave, recordEnglishUseAttempt, type EnglishUseSave } from "@/lib/englishUse";
import EnglishUseCheck from "./EnglishUseCheck";
import s from "./SpokenEnglish.module.css";

type Props = { userId: string; onBackHref?: string };
type Phase = "idle" | "meaning" | "model" | "together" | "your-turn";
const cues: Record<Phase, string> = { idle: "Vamos ouvir e repetir?", meaning: "Primeiro, o significado.", model: "Ouça o modelo em inglês.", together: "Agora, fale junto com o Orbi.", "your-turn": "Sua vez. Repita sozinho, no seu ritmo." };

function CodeContext({ scene }: { scene: SpeakingScene }) {
  if (scene === "folder") return <div className={s.folderScene} aria-label="Uma pasta de projeto que contém arquivos"><div className={s.folderTab}/><div className={s.folderBody}><Folder size={36}/><span>meu-projeto</span><div><FileCode2 size={20}/><code>script.js</code><FileCode2 size={20}/><code>index.html</code></div></div></div>;
  return <div className={s.editorScene} aria-label="Um exemplo de arquivo e mensagem no contexto de programação"><div className={s.editorTab}><FileCode2 size={15}/><span>script.js</span><i/></div><pre><span>console</span>.log(<b>&quot;Hello, Orbi!&quot;</b>);</pre><div className={s.editorResult} data-error={scene === "error" || scene === "build"}>{scene === "save" ? <><Check size={16}/> Saved · arquivo salvo</> : scene === "run" ? <><Play size={16}/> Hello, Orbi!</> : scene === "error" ? "Error: file not found" : scene === "test" ? <><Check size={16}/> The test passed</> : scene === "build" ? "The build failed" : <><Code2 size={16}/> Código dentro de um arquivo</>}</div></div>;
}

export default function SpokenEnglish({ userId, onBackHref = "/estudante/jogos" }: Props) {
  const [save, setSave] = useState<SpeakingSave>(emptySpeakingSave);
  const latest = useRef(save);
  const [useSave, setUseSave] = useState<EnglishUseSave>(emptyEnglishUseSave);
  const latestUse = useRef(useSave);
  const [useStorageError, setUseStorageError] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [loadedUser, setLoadedUser] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [capable, setCapable] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState<0.75 | 0.9>(0.9);
  const [phase, setPhase] = useState<Phase>("idle");
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [manual, setManual] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [issue, setIssue] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const speech = useRef<ReturnType<typeof createSpokenSpeech> | null>(null);
  const generation = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const lesson = getSpeakingLesson(save.current) ?? englishSpeakingLessons[0];
  const index = englishSpeakingLessons.findIndex(item => item.id === lesson.id);
  const group = englishSpeakingLessons.filter(item => item.kind === lesson.kind);
  const groupIndex = group.findIndex(item => item.id === lesson.id);
  const finished = save.completed.length === englishSpeakingLessons.length;

  const update = useCallback((next: SpeakingSave) => {
    let value = next;
    try { value = mergeSpeakingSave(next, readSpeakingSave(localStorage.getItem(speakingSaveKey(userId)))); localStorage.setItem(speakingSaveKey(userId), JSON.stringify(value)); setStorageError(false); }
    catch { setStorageError(true); }
    latest.current = value; setSave(value); window.dispatchEvent(new Event("orbitamos-practice-updated"));
  }, [userId]);

  const updateUse = useCallback((next: EnglishUseSave) => {
    let value = next;
    try { value = mergeEnglishUseSave(next, readEnglishUseSave(localStorage.getItem(englishUseKey(userId)))); localStorage.setItem(englishUseKey(userId), JSON.stringify(value)); setUseStorageError(false); }
    catch { setUseStorageError(true); }
    latestUse.current = value; setUseSave(value);
  }, [userId]);

  useEffect(() => {
    let active = true;
    const supported = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance === "function";
    const synth = supported ? window.speechSynthesis : null;
    const invalidate = () => { generation.current++; };
    speech.current = createSpokenSpeech({ synth, createUtterance: supported ? text => new SpeechSynthesisUtterance(text) : null });
    const refreshVoices = () => { if (active) setVoices(synth?.getVoices() ?? []); };
    queueMicrotask(() => {
      if (!active) return;
      let value = emptySpeakingSave();
      try { value = readSpeakingSave(localStorage.getItem(speakingSaveKey(userId))); } catch { setStorageError(true); }
      let contextual = emptyEnglishUseSave();
      try { contextual = readEnglishUseSave(localStorage.getItem(englishUseKey(userId))); } catch { setUseStorageError(true); }
      latestUse.current = contextual; setUseSave(contextual); setCheckingId(contextual.active ? contextual.current : null);
      latest.current = value; setSave(value); setLoadedUser(userId); setCapable(supported); refreshVoices();
    });
    const interrupt = () => {
      if (!runningRef.current) return;
      invalidate(); speech.current?.stop(); runningRef.current = false;
      setRunning(false); setCanConfirm(false); setPhase("idle"); setNotice("A aula foi pausada. Toque em Ouvir e repetir para recomeçar este item.");
    };
    const visibility = () => { if (document.hidden) interrupt(); };
    const receive = (event: StorageEvent) => {
      if (event.key === englishUseKey(userId)) {
        const contextual = mergeEnglishUseSave(latestUse.current, readEnglishUseSave(event.newValue));
        latestUse.current = contextual; setUseSave(contextual); return;
      }
      if (event.key !== speakingSaveKey(userId)) return;
      const value = mergeSpeakingSave(latest.current, readSpeakingSave(event.newValue));
      if (value.completed.length === englishSpeakingLessons.length) interrupt();
      latest.current = value; setSave(value);
    };
    synth?.addEventListener("voiceschanged", refreshVoices);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", interrupt);
    window.addEventListener("storage", receive);
    return () => { active = false; invalidate(); runningRef.current = false; speech.current?.dispose(); speech.current = null; synth?.removeEventListener("voiceschanged", refreshVoices); document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", interrupt); window.removeEventListener("storage", receive); };
  }, [userId]);

  function stop(message?: string) {
    generation.current++; speech.current?.stop(); runningRef.current = false;
    setRunning(false); setCanConfirm(false); setPhase("idle"); setIssue(null); setNotice(message ?? null);
  }
  function choose(id: string) {
    if (!getSpeakingLesson(id)) return;
    stop(); if (checkingId) updateUse({ ...latestUse.current, active: false }); setCheckingId(null); setRecorded(false); setRevealed(manual); setCanConfirm(manual); setPhase(manual ? "your-turn" : "idle");
    update({ ...latest.current, current: id }); requestAnimationFrame(() => heading.current?.focus());
  }
  function start() {
    if (!capable || !speech.current) return;
    stop(); setManual(false); setRevealed(false); setRecorded(false); setRunning(true); runningRef.current = true;
    const token = ++generation.current;
    speech.current.start(buildSpokenScript(lesson), {
      rate, preferredEnglishVoiceURI: voiceURI || undefined,
      onStep: part => { if (token !== generation.current) return; setPhase(part.phase); if (part.lang === "en-US") setRevealed(true); },
      onDone: () => { if (token !== generation.current) return; runningRef.current = false; setRunning(false); setPhase("your-turn"); setCanConfirm(true); },
      onError: code => { if (token !== generation.current) return; runningRef.current = false; setRunning(false); setCanConfirm(false); setPhase("idle"); setIssue(code === "language-unavailable" ? "O aparelho não disponibilizou essa voz. Escolha outra voz ou pratique com o texto." : "A voz não respondeu. Tente novamente ou pratique com o texto."); },
    });
  }
  function textMode() { stop(); setManual(true); setRevealed(true); setPhase("your-turn"); setCanConfirm(true); setRecorded(false); }
  function voiceMode() { stop(); setManual(false); setRevealed(false); setRecorded(false); }
  function confirm() {
    if (!canConfirm || running) return;
    update(completeSpeakingPractice(latest.current, lesson.id)); setCanConfirm(false); setRecorded(true);
  }
  function openUse(id = lesson.id) {
    if (!getEnglishUseQuestion(id)) return;
    stop(); setCheckingId(id);
    updateUse({ ...latestUse.current, current: id, active: true });
  }
  function closeUse() {
    setCheckingId(null); updateUse({ ...latestUse.current, active: false });
    requestAnimationFrame(() => heading.current?.focus());
  }
  function answerUse(choiceId: string) {
    const question = checkingId ? getEnglishUseQuestion(checkingId) : undefined;
    if (!question) return { ok: false, message: "Abra uma situação para continuar." };
    const result = evaluateEnglishUse(question, choiceId);
    updateUse(recordEnglishUseAttempt(latestUse.current, question.lessonId, choiceId));
    return result;
  }
  const useQuestion = checkingId ? getEnglishUseQuestion(checkingId) : undefined;
  if (loadedUser !== userId) return <section className={s.root}><p role="status">Preparando sua prática de inglês…</p></section>;

  if (useQuestion) return <section className={s.root} data-spoken-english data-speaking-lesson-id={lesson.id} data-speaking-mode={manual ? "text" : "voice"} data-speaking-phase="idle">
    <EnglishUseCheck key={useQuestion.lessonId} question={useQuestion} completedCount={useSave.completed.length} onAnswer={answerUse} onBack={closeUse} onNext={() => { setReviewing(true); const current = englishSpeakingLessons.findIndex(item => item.id === useQuestion.lessonId); choose(englishSpeakingLessons[(current + 1) % englishSpeakingLessons.length].id); }}/>
    {useStorageError && <p role="alert" className={s.error}>Não foi possível salvar esta situação. O registro está apenas nesta tela.</p>}
  </section>;

  return <section className={s.root} data-spoken-english data-speaking-lesson-id={lesson.id} data-speaking-mode={manual ? "text" : "voice"} data-speaking-phase={phase}>
    <header className={s.header}><Link href={onBackHref}><ArrowLeft size={14}/> Explorar atividades</Link><span>ORBITAMOS · OUVIR, REPETIR E USAR</span></header>
    {finished && !reviewing ? <div className={s.finish}><Image src="/orbi-tech.png" width={150} height={175} alt="Orbi acompanha sua prática"/><p className={s.eyebrow}>12 ITENS PRATICADOS</p><h1 ref={heading} tabIndex={-1}>Você praticou palavras e frases de código.</h1><p>Agora encontre essas palavras em imagens, mensagens e situações de programação.</p><p className={s.small}>Este registro é de prática declarada. Não é uma nota automática de pronúncia.</p><div className={s.finishActions}><button className={s.primary} data-speaking-use-open onClick={() => openUse((englishUseQuestions.find(item => !useSave.completed.includes(item.lessonId)) ?? englishUseQuestions[0]).lessonId)}>{useSave.completed.length === englishUseQuestions.length ? "Revisar situações" : "Usar o inglês em uma situação"}<ArrowRight size={17}/></button><a className={s.secondary} href="#">Praticar com imagens e código <ArrowRight size={17}/></a><button className={s.secondary} onClick={() => { setReviewing(true); choose(englishSpeakingLessons[0].id); }}>Repetir a prática <RotateCcw size={17}/></button></div></div> : <>
      <div className={s.titleRow}><div><p className={s.eyebrow}>{lesson.kind === "word" ? "PRIMEIRO, PALAVRAS" : "AGORA, FRASES"} · {groupIndex + 1} DE {group.length}</p><h1 ref={heading} tabIndex={-1}>Fale inglês com o Orbi.</h1></div><span className={s.count}>{save.completed.length}/{englishSpeakingLessons.length}<small>práticas</small></span></div>
      <progress className={s.progress} max={englishSpeakingLessons.length} value={save.completed.length} aria-label="Práticas registradas"/>

      <div className={s.stage}>
        <div className={s.board}>
          <div className={s.cardCaption}><span>{manual ? "LEIA E REPITA" : phase === "idle" ? "SEU PRÓXIMO INGLÊS" : phase === "meaning" ? "O SIGNIFICADO" : phase === "model" ? "ESCUTE O MODELO" : phase === "together" ? "FALE JUNTO" : "SUA VEZ"}</span>{capable === false && !manual ? <button className={s.secondary} data-speaking-text-mode onClick={textMode}>Praticar sem voz</button> : running ? <button className={s.secondary} data-speaking-stop onClick={() => stop("Áudio interrompido. Você pode recomeçar este item.")}><Square size={17}/> Parar áudio</button> : manual ? <button className={s.secondary} data-speaking-voice-mode disabled={!capable} onClick={voiceMode}><Volume2 size={18}/> Voltar ao áudio</button> : <button className={s.primary} data-speaking-start disabled={!capable} onClick={start}><Play size={18}/>{revealed ? "Ouvir e repetir de novo" : "Ouvir e repetir"}</button>}</div>
          <div className={s.translation}><small>EM PORTUGUÊS</small><span data-highlight={phase === "meaning"}>{lesson.pt}</span></div>
          <div className={s.english}><small>EM INGLÊS</small><strong lang="en-US" data-speaking-english data-revealed={revealed} data-highlight={revealed && running && (phase === "model" || phase === "together")}>{revealed ? lesson.en : "…"}</strong></div>
          <div className={s.coach}><Image src="/orbi-tech.png" alt="" width={100} height={118} sizes="100px"/><p><strong>Orbi</strong>{manual ? "Leia o modelo em inglês e repita sozinho. Você pode voltar ao áudio quando quiser." : cues[phase]}</p>{running && <span className={s.wave} role="img" aria-label="Voz em reprodução"><i/><i/><i/><i/></span>}</div>
        </div>
        <aside className={s.context}><p className={s.eyebrow}>NO DIA A DIA DO CÓDIGO</p><CodeContext scene={lesson.scene}/><p>{lesson.context}</p></aside>
      </div>
      {issue && <p className={s.error} role="alert">{issue}</p>}
      {notice && <p className={s.notice} role="status">{notice}</p>}
      {capable === false && !manual && <p className={s.notice}>Este navegador não oferece a voz desta prática. Você pode continuar com o texto.</p>}
      <div className={s.controls}><button className={s.primary} data-speaking-complete disabled={!canConfirm || running} onClick={confirm}><Check size={18}/>{recorded ? "Prática registrada" : "Já repeti este item"}</button><button className={s.next} onClick={() => choose(englishSpeakingLessons[(index + 1) % englishSpeakingLessons.length].id)}>Próximo <ArrowRight size={18}/></button></div>
      {recorded && <p className={s.notice} role="status">Prática registrada. Você pode ouvir de novo ou seguir para o próximo item.</p>}
      {save.completed.includes(lesson.id) && <div className={s.useInvitation}><div><strong>Você já repetiu. E no código?</strong><span>{useSave.completed.includes(lesson.id) ? "Esta situação já teve uma escolha correta. Você pode tentar de novo." : "Encontre o sentido deste inglês em uma situação de programação."}</span></div><button className={s.secondary} data-speaking-use-open onClick={() => openUse()}>Usar em uma situação <ArrowRight size={17}/></button></div>}
      <p className={s.mobileContext}>{lesson.context}</p>
      <div className={s.lessonPicker}><label htmlFor="speaking-item">Seu percurso</label><select id="speaking-item" value={lesson.id} onChange={event => choose(event.target.value)}><optgroup label="1 · Palavras">{englishSpeakingLessons.filter(item => item.kind === "word").map(item => <option key={item.id} value={item.id}>{save.completed.includes(item.id) ? "✓ " : ""}{item.pt} · {item.en}</option>)}</optgroup><optgroup label="2 · Frases">{englishSpeakingLessons.filter(item => item.kind === "phrase").map(item => <option key={item.id} value={item.id}>{save.completed.includes(item.id) ? "✓ " : ""}{item.en}</option>)}</optgroup></select></div>
      <footer className={s.footer}>{capable !== false && <button data-speaking-text-mode onClick={textMode}>Praticar sem voz</button>}<details className={s.settings}><summary><Settings2 size={15}/> Voz e ritmo</summary><div><label htmlFor="speaking-rate">Velocidade<select id="speaking-rate" value={rate} disabled={running} onChange={event => setRate(event.target.value === "0.75" ? 0.75 : 0.9)}><option value="0.9">Normal</option><option value="0.75">Mais devagar</option></select></label><label htmlFor="speaking-voice">Voz em inglês<select id="speaking-voice" value={voiceURI} disabled={running} onChange={event => setVoiceURI(event.target.value)}><option value="">Automática do aparelho</option>{voices.filter(voice => /^en(?:-|_)/i.test(voice.lang) || voice.lang === "en").map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}</select></label><p>As vozes vêm do navegador ou aparelho e podem precisar de conexão. Se não funcionar, continue com texto. Esta atividade não grava sua voz nem avalia sua pronúncia automaticamente.</p></div></details></footer>
      <p className={s.saveNote}>{storageError ? "O navegador não conseguiu salvar. Seu progresso está apenas nesta tela." : "Prática salva neste navegador, separada por conta. Marcar que repetiu registra participação."}</p>
    </>}
  </section>;
}
