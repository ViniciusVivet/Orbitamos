"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { emptyEnglishSave, englishLessons, englishStorageKey, evaluateEnglish, readEnglishSave, type EnglishSave, type EnglishScene } from "@/lib/codeEnglish";
import styles from "./CodeEnglish.module.css";

type Props = { userId: string; onComplete?: () => void; onBackHref?: string };
type Feedback = { ok: boolean; message: string };

function WorkshopDrawing({ scene, solved, recall = false }: { scene: EnglishScene; solved: boolean; recall?: boolean }) {
  if (scene === "return" || scene === "output") return <div className={styles.codeScene}>
    <div className={styles.codeBar}><span /><span /><span /><small>JavaScript · acompanhe o valor</small></div>
    <pre><code><span className={styles.codeKeyword}>function</span>{" dobro(numero) {\n  "}<span className={styles.codeKeyword}>return</span>{" numero * 2;\n}\n"}{scene === "return" ? "const resultado = dobro(3);" : "console.log(dobro(4));"}</code></pre>
    <div className={styles.valueRoute} aria-label={solved ? scene === "return" ? "Entrada 3. Retorno 6. Sem saída no console." : "Entrada 4. Retorno 8. Saída 8 no console." : "Acompanhe a entrada, o retorno e a saída do exemplo."}>
      <div><small>ENTRADA</small><strong>{scene === "return" ? "3" : "4"}</strong></div><span aria-hidden="true">→</span>
      <div><small>RETORNO</small><strong>{solved ? scene === "return" ? "6" : "8" : "?"}</strong></div><span aria-hidden="true">→</span>
      <div><small>CONSOLE</small><strong>{solved ? scene === "return" ? "—" : "8" : "?"}</strong></div>
    </div>
    <p>{solved ? scene === "return" ? "O valor voltou para o código. Nada foi mostrado no console." : "O valor voltou e console.log mostrou a saída." : "Leia este exemplo. Vamos seguir o caminho do número."}</p>
  </div>;
  if (scene === "error") return <div className={styles.errorScene}>
    <div className={styles.filePath}><span aria-hidden="true">⌕</span> oficina / imagens / orbi.png</div>
    <svg viewBox="0 0 120 114" aria-hidden="true"><path d="M31 9h43l18 20v75H31z" fill="#faf4dd" stroke="#70463b" strokeWidth="3" strokeLinejoin="round"/><path d="M74 9v22h18" fill="#edb992" stroke="#70463b" strokeWidth="3"/><path d="m43 75 12-15 12 9 9-11 9 17" fill="none" stroke="#b98767" strokeWidth="3"/><circle cx="52" cy="43" r="5" fill="#eeb766"/><circle cx="88" cy="84" r="21" fill={solved ? "#cee6d3" : "#fad4c3"} stroke="#70463b" strokeWidth="3"/>{solved ? <path d="m78 85 7 7 13-16" fill="none" stroke="#2a6343" strokeWidth="4" strokeLinecap="round"/> : <path d="m81 77 14 14m0-14L81 91" stroke="#a44c36" strokeWidth="4" strokeLinecap="round"/>}</svg>
    <code>{recall && !solved ? "File not …" : "File not found"}</code><p>{solved ? "Mensagem entendida. Agora você sabe por onde investigar." : "Uma mensagem de erro também contém pistas."}</p>
  </div>;
  return <svg viewBox="0 0 460 275" className={styles.drawing} aria-hidden="true">
    <defs><pattern id={`english-grid-${scene}`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#496586" strokeOpacity=".12"/></pattern></defs>
    <rect width="460" height="275" fill={`url(#english-grid-${scene})`} />
    <ellipse cx="230" cy="245" rx="169" ry="13" fill="#a0b2bf" opacity=".22"/>
    {scene === "folder" && <g stroke="#5d4935" strokeWidth="3" strokeLinejoin="round">
      <path d="M91 86V58h101l22 25h152v148H91z" fill="#e8ad57"/>
      <g transform={solved ? "translate(0 12)" : "translate(0 -9)"}><path d="M125 69h57l17 18v101h-74z" fill="#fcf8e9"/><path d="M182 69v19h17" fill="#dce4e4"/><path d="M215 52h57l17 18v118h-74z" fill="#d4e9ed"/><path d="M272 52v19h17" fill="#a9cbd6"/><path d="M298 75h40l17 18v95h-57z" fill="#e1d8eb"/><path d="M138 111h42m-42 15h31m61-32h42m-42 17h31m83 11h27" stroke="#668394" strokeWidth="3" strokeLinecap="round"/></g>
      <path d="m83 121 12 110h269l15-110z" fill="#f5c776"/><path d="M117 155h47" stroke="#d59d49" strokeWidth="5" strokeLinecap="round"/>
    </g>}
    {scene === "file" && <g stroke="#42556c" strokeWidth="3" strokeLinejoin="round"><path d="M151 33h106l49 48v151H151z" fill="#f9f5e7"/><path d="M257 33v49h49" fill="#bdd8e6"/><path d="m191 114-16 15 16 15m74-30 16 15-16 15m-30-36-15 42" fill="none" stroke="#497390" strokeWidth="5" strokeLinecap="round"/><path d="M177 177h99m-99 18h70" stroke="#b7c7d2" strokeWidth="5" strokeLinecap="round"/><rect x="177" y="211" width="101" height="28" rx="7" fill="#dbe9f1" stroke="none"/><text x="227" y="230" textAnchor="middle" fontSize="17" fill="#24445d" stroke="none" fontFamily="monospace">script.js</text></g>}
    {scene === "button" && <g stroke="#3c566c" strokeWidth="3"><rect x="65" y="43" width="330" height="190" rx="15" fill="#f8faf7"/><path d="M65 78h330" stroke="#c2d2d8"/><circle cx="85" cy="60" r="4" fill="#c5d2d8" stroke="none"/><circle cx="101" cy="60" r="4" fill="#c5d2d8" stroke="none"/><path d="M91 101h128m-128 15h78" stroke="#bdcdd5" strokeLinecap="round"/><rect x="133" y="143" width="192" height="60" rx="12" fill={solved ? "#d2e7d3" : "#b8dbe9"}/><path d="M157 160h22v25h-22zM161 160v9h13v-9m-13 25v-10h14v10" fill="#f5faf6" strokeWidth="2"/><text x="239" y="181" textAnchor="middle" fontSize="23" fill="#25495f" stroke="none" fontWeight="700" fontFamily="system-ui">{solved ? "Saved!" : "Save"}</text><path d="m321 205-20-28-3 35 10-6 6 15 9-4-7-15z" fill="#5a6476" stroke="#f8faf7" strokeWidth="2"/></g>}
    {scene === "server" && <g stroke="#456078" strokeWidth="3" strokeLinejoin="round"><rect x="42" y="104" width="134" height="98" rx="10" fill="#f6f8ee"/><path d="M42 127h134m-67 75v22m-28 0h56"/><path d="M59 143h69m-69 13h91m-91 13h53" stroke="#a9becb"/><rect x="295" y="48" width="113" height="180" rx="12" fill="#cedde5"/>{[67,115,163].map(y=><g key={y}><rect x="309" y={y} width="85" height="36" rx="5" fill="#f3f6ee"/><circle cx="380" cy={y+18} r="5" fill={solved ? "#7cad89" : "#d9b46e"} stroke="none"/><path d={`M320 ${y+14}h37m-37 8h28`} stroke="#9eb3c1" strokeWidth="2"/></g>)}<path d="M186 124h90m-10-8 10 8-10 8" fill="none" stroke="#9a6b3b"/><path d="M276 174h-90m10-8-10 8 10 8" fill="none" stroke="#367456"/><text x="229" y="107" textAnchor="middle" stroke="none" fill="#775534" fontSize="13" fontFamily="system-ui">pedido</text><text x="229" y="198" textAnchor="middle" stroke="none" fill="#306349" fontSize="13" fontFamily="system-ui">resposta</text></g>}
    {solved && <g transform="translate(357 20)"><circle cx="21" cy="21" r="21" fill="#d6e8d3" stroke="#4c795a" strokeWidth="2"/><path d="m11 21 7 7 13-15" fill="none" stroke="#366847" strokeWidth="3" strokeLinecap="round"/></g>}
  </svg>;
}

export default function CodeEnglish({ userId, onComplete, onBackHref = "/estudante/jogos" }: Props) {
  const [save, setSave] = useState<EnglishSave>(emptyEnglishSave);
  const [loadedUser, setLoadedUser] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selected, setSelected] = useState("");
  const [word, setWord] = useState("");
  const [hint, setHint] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const wordInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { const restored = readEnglishSave(localStorage.getItem(englishStorageKey(userId))); setSave(restored); setWord(restored.draft); setStorageUnavailable(false); }
      catch { setSave(emptyEnglishSave()); setWord(""); setStorageUnavailable(true); }
      setStarted(false); setFeedback(null); setSelected(""); setHint(false); setLoadedUser(userId);
    });
    return () => { active = false; };
  }, [userId]);

  function persist(next: EnglishSave) {
    setSave(next);
    try { localStorage.setItem(englishStorageKey(userId), JSON.stringify(next)); setStorageUnavailable(false); }
    catch { setStorageUnavailable(true); }
  }
  function focusHeading() { requestAnimationFrame(() => heading.current?.focus()); }
  const lesson = englishLessons[save.current];
  const solved = save.completed.includes(lesson.id);

  function check(answer: string) {
    const result = evaluateEnglish(lesson, answer);
    setSelected(answer); setFeedback(result);
    if (result.ok && !solved) persist({ ...save, completed: [...save.completed, lesson.id] });
  }
  function advance() {
    if (!solved) return;
    if (save.current === englishLessons.length - 1) {
      persist({ ...save, finished: true }); onComplete?.(); focusHeading(); return;
    }
    persist({ ...save, current: save.current + 1, draft: "" }); setSelected(""); setWord(""); setHint(false); setFeedback(null); focusHeading();
  }
  function restart() { persist(emptyEnglishSave()); setStarted(true); setSelected(""); setWord(""); setHint(false); setFeedback(null); focusHeading(); }

  if (loadedUser !== userId) return <section className={styles.root} aria-label="Inglês em cena"><p role="status">Preparando a oficina do Orbi…</p></section>;

  return <section className={styles.root} data-code-english>
    <div className={styles.topbar}><Link href={onBackHref} className={styles.back}>← Explorar atividades</Link><span className={styles.eyebrow}>ORBITAMOS · INGLÊS EM CENA</span></div>
    {save.finished ? <div className={styles.finish}>
      <div className={styles.finishStamp} aria-hidden="true">✓</div><span className={styles.eyebrow}>PRIMEIRA MISSÃO CONCLUÍDA</span>
      <h1 ref={heading} tabIndex={-1}>Você leu as pistas.<br />E seguiu o código.</h1>
      <p>Você identificou objetos, interpretou uma mensagem de erro e acompanhou um valor até a saída. Esses termos voltam a aparecer no laboratório.</p>
      <div className={styles.glossary}>{["folder → pasta", "file → arquivo", "button → botão", "server → servidor", "return → devolver um valor", "output → saída"].map(term => <span key={term}>{term}</span>)}</div>
      <div className={styles.finishActions}><Link href={onBackHref} className={styles.primary}>Explorar outras práticas →</Link><button onClick={restart} className={styles.secondary}>Praticar de novo</button></div>
    </div> : !started ? <div className={styles.intro}>
      <div className={styles.introArt}><WorkshopDrawing scene="folder" solved={false} /><div className={styles.introOrbi}><Image src="/orbi-tech.png" alt="" width={110} height={130} sizes="110px" /></div></div>
      <div className={styles.introCopy}><span className={styles.eyebrow}>MISSÃO 01 · A OFICINA DO ORBI</span><h1>O inglês que aparece<br />quando você coda.</h1><p>Uma pasta, um botão, uma mensagem de erro. Aprenda a ler as pistas e descobrir o que fazer, junto com o Orbi.</p><div className={styles.introFacts}><span>8 cenas curtas</span><span>Escolher + escrever + prever</span></div><button className={styles.primary} onClick={() => { setStarted(true); focusHeading(); }}>{save.completed.length || save.current ? "Retomar missão" : "Entrar na missão"} <span aria-hidden="true">→</span></button></div>
    </div> : <>
      <div className={styles.progressRow}><span>{lesson.chapter}</span><span>Cena {save.current + 1} de {englishLessons.length}</span></div>
      <div className={styles.progress} role="progressbar" aria-label="Cenas concluídas" aria-valuemin={0} aria-valuemax={englishLessons.length} aria-valuenow={save.completed.length}>{englishLessons.map((step, index) => <span key={step.id} data-done={save.completed.includes(step.id)} data-current={index === save.current} />)}</div>
      <div className={styles.stage}>
        <div className={styles.world}><div className={styles.sceneLabel}><span aria-hidden="true">✦</span> {lesson.scene === "return" || lesson.scene === "output" ? "SIGA O VALOR" : "OBSERVE A CENA"}</div><figure aria-label={lesson.scene === "folder" ? "Uma pasta contendo três arquivos" : lesson.scene === "file" ? "Um arquivo JavaScript chamado script.js" : lesson.scene === "button" ? "Uma interface com um botão Save para salvar" : lesson.scene === "server" ? "Um navegador envia um pedido a um servidor e recebe uma resposta" : lesson.scene === "error" ? "Um arquivo de imagem não foi encontrado" : "Um exemplo de código JavaScript e o caminho do valor"}><WorkshopDrawing scene={lesson.scene} solved={solved} recall={lesson.kind === "write"} /></figure><div className={styles.orbiSpeech}><Image src="/orbi-tech.png" alt="" width={64} height={75} sizes="64px" /><p><strong>Orbi</strong>{lesson.story}</p></div></div>
        <div className={styles.task}><h1 ref={heading} tabIndex={-1}>{lesson.title}</h1><p className={styles.prompt}>{lesson.prompt}</p>
          {lesson.kind === "choice" ? <div className={styles.choices} role="group" aria-label="Escolha uma resposta">
            {lesson.choices.map((choice, index) => <button key={choice.value} className={styles.choice} onClick={() => check(choice.value)} disabled={solved} data-state={solved && choice.value === lesson.answer ? "correct" : selected === choice.value && feedback?.ok === false ? "wrong" : undefined}>
              <span className={styles.choiceNumber} aria-hidden="true">{solved && choice.value === lesson.answer ? "✓" : String.fromCharCode(65 + index)}</span><span>{choice.label}</span>
            </button>)}
          </div> : <form className={styles.wordForm} onSubmit={event => { event.preventDefault(); if (!solved) check(word); }}>
            <label htmlFor="english-missing-word">Palavra que falta</label>
            <div className={styles.sentence}><span>{lesson.before}</span><input ref={wordInput} id="english-missing-word" value={solved ? lesson.answer : word} onChange={event => { const value = event.target.value; setWord(value); persist({ ...save, draft: value }); setFeedback(null); }} autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} disabled={solved} autoComplete="off" enterKeyHint="done" aria-describedby="english-word-note" aria-invalid={feedback?.ok === false || undefined} /></div>
            <small id="english-word-note">Escreva só a palavra que completa a mensagem.</small>
            {!solved && <button className={styles.primary} type="submit">Verificar palavra</button>}
          </form>}
          {!solved && <><button className={styles.hintToggle} aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? "Recolher pista" : "Preciso de uma pista"} <span aria-hidden="true">{hint ? "−" : "+"}</span></button>{hint && <p className={styles.hint}>{lesson.hint}</p>}</>}
          <div className={styles.feedback} role="status" aria-live="polite" data-kind={solved ? "correct" : feedback ? "retry" : "empty"}>{(feedback || solved) && <><strong>{solved ? "Você entendeu a pista!" : "Vamos por outro caminho."}</strong><p>{solved ? lesson.explanation : feedback?.message}</p>{solved && <span className={styles.takeaway}>{lesson.takeaway}</span>}</>}</div>
          {solved && <button className={styles.primary} onClick={advance}>{save.current === englishLessons.length - 1 ? "Concluir missão" : "Continuar"} <span aria-hidden="true">→</span></button>}
        </div>
      </div>
    </>}
    <p className={styles.saveNote} role="status">{storageUnavailable ? "O navegador não permitiu salvar. Você pode continuar nesta tela, mas a retomada pode se perder ao sair." : "Seu progresso fica salvo neste navegador, nesta conta."}</p>
  </section>;
}
