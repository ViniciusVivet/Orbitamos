"use client";

import Link from "next/link";
import { getImageProps } from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { assistedDeliveryInput, deliveryCode, deliveryMissions, deliveryParameters, deliveryStorageKey, initialDelivery, readDeliverySave, stepDelivery, type DeliveryBody, type DeliverySave } from "@/lib/orbiDelivery";
import s from "./OrbiDelivery.module.css";

type Props = { userId: string; onComplete?: () => void; onBackHref?: string };
const orbiSprite = getImageProps({ src: "/orbi-tech.png", alt: "", width: 96, height: 128 }).props.src;
export default function OrbiDelivery({ userId, onComplete, onBackHref = "/estudante/jogos" }: Props) {
  const [save, setSave] = useState<DeliverySave>({ version: 1, current: 0, completed: [] });
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState(deliveryMissions[0].options[0].value);
  const [body, setBody] = useState<DeliveryBody>(initialDelivery);
  const [automatic, setAutomatic] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const bodyRef = useRef(body);
  const controls = useRef({ left: false, right: false, jump: false });
  const stage = useRef<HTMLDivElement>(null);
  const checkHeading = useRef<HTMLHeadingElement>(null);
  const missionHeading = useRef<HTMLHeadingElement>(null);
  const missionIndex = save.current;
  const mission = deliveryMissions[missionIndex];
  const passed = save.completed.includes(mission.id);
  const understood = answer === mission.correctAnswer;
  const finished = save.completed.length === deliveryMissions.length;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let stored = readDeliverySave(null);
      try { stored = readDeliverySave(localStorage.getItem(deliveryStorageKey(userId))); } catch { setStorageError(true); }
      const initial = initialDelivery(); bodyRef.current = initial; setBody(initial); setPaused(false); setAnswer(null);
      setSave(stored); setValue(deliveryMissions[stored.current].options[0].value); setReady(true);
    });
    const query = matchMedia("(max-width: 650px)");
    const resize = () => setCompact(query.matches);
    resize(); query.addEventListener("change", resize);
    return () => { active = false; query.removeEventListener("change", resize); };
  }, [userId]);

  useEffect(() => {
    if (body.status !== "running" || paused) return;
    let frame = 0; let last = 0; let accumulator = 0; let paint = 0;
    const advance = (now: number) => {
      if (last) accumulator += Math.min((now - last) / 1000, 0.06);
      last = now;
      while (accumulator >= 1 / 120 && bodyRef.current.status === "running") {
        const input = automatic ? assistedDeliveryInput(bodyRef.current, missionIndex) : { direction: (controls.current.right ? 1 : 0) - (controls.current.left ? 1 : 0) as -1 | 0 | 1, jump: controls.current.jump };
        bodyRef.current = stepDelivery(bodyRef.current, input, missionIndex, value, 1 / 120);
        controls.current.jump = false; accumulator -= 1 / 120;
      }
      if (now - paint > 25 || bodyRef.current.status !== "running") { setBody({ ...bodyRef.current }); paint = now; }
      if (bodyRef.current.status === "running") frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [automatic, body.status, paused, missionIndex, value]);

  useEffect(() => {
    const hide = () => { if (document.hidden) { controls.current = { left: false, right: false, jump: false }; setPaused(true); } };
    const blur = () => { controls.current = { left: false, right: false, jump: false }; setPaused(true); };
    document.addEventListener("visibilitychange", hide); window.addEventListener("blur", blur);
    return () => { document.removeEventListener("visibilitychange", hide); window.removeEventListener("blur", blur); };
  }, []);

  useEffect(() => { if (body.status === "arrived") checkHeading.current?.focus(); }, [body.status]);

  function persist(next: DeliverySave) {
    setSave(next);
    try { localStorage.setItem(deliveryStorageKey(userId), JSON.stringify(next)); } catch { setStorageError(true); }
  }
  function reset(nextValue = value) {
    const initial = initialDelivery(); bodyRef.current = initial; setBody(initial); setValue(nextValue); setPaused(false); setAnswer(null); controls.current = { left: false, right: false, jump: false };
  }
  function enter(index: number) {
    persist({ ...save, current: index }); reset(deliveryMissions[index].options[0].value); setHint(false);
    requestAnimationFrame(() => missionHeading.current?.focus());
  }
  function start() {
    const next: DeliveryBody = { ...initialDelivery(), status: "running" };
    bodyRef.current = next; setBody(next); setPaused(false); setAnswer(null); controls.current = { left: false, right: false, jump: false };
    requestAnimationFrame(() => { stage.current?.focus({ preventScroll: true }); stage.current?.scrollIntoView({ block: "center", behavior: "instant" }); });
  }
  function chooseAnswer(index: number) {
    setAnswer(index);
    if (index !== mission.correctAnswer || passed || body.status !== "arrived") return;
    const completed = [...save.completed, mission.id]; persist({ ...save, completed });
    if (completed.length === deliveryMissions.length) onComplete?.();
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>, down: boolean) {
    if (automatic || body.status !== "running" || paused || event.target !== event.currentTarget) return;
    const key = event.key.toLowerCase();
    if (!["arrowleft", "arrowright", "arrowup", "a", "d", "w", " "].includes(key)) return;
    event.preventDefault();
    if (key === "arrowleft" || key === "a") controls.current.left = down;
    else if (key === "arrowright" || key === "d") controls.current.right = down;
    else if (down && !event.repeat) controls.current.jump = true;
  }
  function tapControl(key: "left" | "right", down: boolean) { controls.current[key] = down; }
  const cameraWidth = compact ? 570 : 960;
  const cameraX = Math.max(0, Math.min(960 - cameraWidth, body.x - cameraWidth * 0.3));
  const params = deliveryParameters(save.current, value);
  const blocked = body.status === "blocked";
  const fell = body.status === "fell";
  if (!ready) return <p role="status">Preparando as entregas do Orbi…</p>;

  return <div className={s.game} data-orbi-delivery data-mission={mission.id} data-game-status={body.status}>
    <header className={s.top}><Link href={onBackHref}>← Central de jogos</Link><span>ORBITAMOS · APRENDER EM MOVIMENTO</span><span>{save.completed.length}/3 entregas compreendidas</span></header>
    <div className={s.title}><div><span className={s.eyebrow}>UMA AVENTURA DE CÓDIGO</span><h1>Entrega do <em>Orbi.</em></h1><p>Mude o código. Veja o mundo responder.</p></div><nav aria-label="Missões da entrega" className={s.map}>{deliveryMissions.map((item, index) => <button key={item.id} disabled={index > save.completed.length} onClick={() => enter(index)} aria-label={`Missão ${index + 1}: ${item.title}${save.completed.includes(item.id) ? ", concluída" : ""}`} aria-current={index === save.current ? "step" : undefined}><span>{save.completed.includes(item.id) ? "✓" : `0${index + 1}`}</span>{item.concept.split(" · ")[1]}</button>)}</nav></div>
    <div className={s.layout}>
      <section className={s.play} aria-label="Cenário da entrega">
        <div className={s.sceneTop}><span><i aria-hidden="true"/> {mission.title}</span><span>{save.current === 2 ? `ENERGIA ${body.energy}/2` : "ENCOMENDA A BORDO"}</span></div>
        <div ref={stage} className={s.viewport} tabIndex={0} role="group" aria-label={automatic ? "Cenário com guia automático. Orbi faz os movimentos para você observar o resultado." : "Controles do cenário. Setas para mover; espaço ou seta para cima para pular. Tab sai do cenário."} onKeyDown={event => keyboard(event, true)} onKeyUp={event => keyboard(event, false)} onBlur={event => { if (!(event.relatedTarget instanceof HTMLElement && event.relatedTarget.closest("[data-delivery-controls]"))) controls.current = { left: false, right: false, jump: false }; }}>
          <svg viewBox={`${cameraX} 0 ${cameraWidth} 420`} className={s.scene} role="img" aria-label={`Orbi a ${Math.round(body.x)} pixels do início. ${body.grounded ? "No chão" : "No ar"}. Destino: ${mission.goal.x} pixels.`}>
            <defs><linearGradient id="delivery-sky" x2="0" y2="1"><stop stopColor="#122c3c"/><stop offset="1" stopColor="#071920"/></linearGradient><linearGradient id="delivery-floor" x2="0" y2="1"><stop stopColor="#377c6b"/><stop offset=".08" stopColor="#1f504b"/><stop offset="1" stopColor="#102b30"/></linearGradient><pattern id="delivery-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#d1fbec" strokeOpacity=".025"/></pattern><filter id="delivery-glow"><feGaussianBlur stdDeviation="5"/></filter></defs>
            <rect width="960" height="420" fill="url(#delivery-sky)"/><circle cx="820" cy="62" r="42" fill="#c4f5c4" opacity=".8"/><circle cx="803" cy="49" r="40" fill="#122c3c"/>
            <g fill="#d5fff1" opacity=".55">{[50, 140, 260, 370, 540, 690, 885].map((x, i) => <circle key={x} cx={x} cy={25 + i % 3 * 25} r={i % 2 ? 1 : 2}/>)}</g>
            <path d="M0 260 100 193 200 260 330 150 440 250 560 190 680 263 820 180 960 260V420H0Z" fill="#173a42"/><path d="M0 305 90 250 180 290 300 240 430 315 580 270 750 285 890 225 960 280V420H0Z" fill="#103039"/>
            <g opacity=".85">{[50, 120, 530, 800, 870].map((x, i) => <g key={x} transform={`translate(${x} ${235 - i % 2 * 25})`}><rect width="45" height="110" rx="5" fill="#1b3e46"/><rect x="9" y="12" width="8" height="11" rx="2" fill="#76c5ab" opacity=".5"/><rect x="28" y="32" width="8" height="11" rx="2" fill="#76c5ab" opacity=".4"/></g>)}</g>
            <rect width="960" height="420" fill="url(#delivery-grid)"/>
            <path d="M265 380 Q365 350 470 380 T960 380V420H265Z" fill="#1a5b6b" opacity=".7"/>
            {mission.platforms.map((platform, i) => <g key={i}><rect x={platform.x} y={platform.y} width={platform.width} height={420 - platform.y} rx="7" fill="url(#delivery-floor)"/><path d={`M${platform.x + 6} ${platform.y + 2}H${platform.x + platform.width - 6}`} stroke="#a9eab4" strokeWidth="4"/><path d={`M${platform.x + 12} ${platform.y + 18}H${platform.x + platform.width - 12}`} stroke="#8cceb3" strokeOpacity=".12" strokeDasharray="5 15"/></g>)}
            <g transform={`translate(${mission.goal.x} ${mission.goal.y})`}><ellipse cy="-3" rx="48" ry="8" fill="#85f5c7" opacity=".14"/><rect x="-8" y="-110" width="5" height="110" rx="2" fill="#84c9bd"/><path d="M-3-110H47L34-92 47-76H-3Z" fill={body.status === "arrived" ? "#b7f479" : "#8fe8cc"}/><text x="21" y="-87" textAnchor="middle" fill="#123830" fontSize="17" fontWeight="800">✓</text><rect x="16" y="-42" width="38" height="39" rx="5" fill="#bb8557"/><path d="M35-42V-3M17-26H54" stroke="#f0cda2" strokeWidth="4"/></g>
            {!body.jumped && <g transform={`translate(${mission.launchX} ${342})`} opacity=".7"><path d="M0-3V-42M-10-30 0-42 10-30" fill="none" stroke="#c8eedb" strokeWidth="2" strokeDasharray="4 3"/></g>}
            <g transform={`translate(${body.x} ${body.y})`}><ellipse cx="21" cy="45" rx="19" ry="4" fill="#010e16" opacity=".45"/><svg x="-6" y="-26" width="54" height="68" viewBox="70 160 780 1160" preserveAspectRatio="xMidYMax meet"><image href={orbiSprite} width="1086" height="1448"/></svg><rect x="32" y="23" width="15" height="13" rx="2" fill="#dbb076" stroke="#f8dbab"/><path d="M39 24V35" stroke="#a8764c"/></g>
            {body.status === "arrived" && <g fill="#d7f4a3">{[0, 1, 2, 3, 4].map(i => <path key={i} d="m0-7 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" transform={`translate(${body.x - 25 + i * 24} ${body.y - 15 - i % 2 * 20})`}/>)}</g>}
          </svg>
          {body.status === "ready" && <div className={s.sceneCaption}><span>MISSÃO {save.current + 1} / 3</span><strong>{mission.title}</strong><small>Prepare o código e faça a entrega.</small></div>}
          {paused && body.status === "running" && <div className={s.pauseOverlay}><strong>Uma pausa no caminho.</strong><button className={s.primary} onClick={() => setPaused(false)}>Continuar entrega</button></div>}
        </div>
        <div className={s.playback}><div className={s.liveStatus} role="status">{body.status === "ready" ? "Pronto para experimentar" : body.status === "arrived" ? "Encomenda entregue! Agora explique sua descoberta." : blocked ? "A condição não permitiu o pulo." : fell ? "Essa configuração ainda não chegou. Você pode tentar de novo." : paused ? "Entrega pausada" : body.grounded ? "Orbi está avançando." : "Orbi está no ar."}</div>{body.status === "running" && <button onClick={() => { controls.current = { left: false, right: false, jump: false }; setPaused(!paused); }}>{paused ? "Continuar" : "Pausar"}</button>}{(blocked || fell) && <button onClick={() => missionHeading.current?.focus()}>Ajustar código ↓</button>}</div>
        {!automatic && <div className={s.controls} data-delivery-controls aria-label="Controles de movimento"><button aria-label="Mover Orbi para a esquerda" disabled={body.status !== "running" || paused} onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); tapControl("left", true); }} onPointerUp={() => tapControl("left", false)} onPointerCancel={() => tapControl("left", false)} onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); tapControl("left", true); } }} onKeyUp={() => tapControl("left", false)} onBlur={() => tapControl("left", false)}>←<small>Esquerda</small></button><button aria-label="Mover Orbi para a direita" disabled={body.status !== "running" || paused} onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); tapControl("right", true); }} onPointerUp={() => tapControl("right", false)} onPointerCancel={() => tapControl("right", false)} onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); tapControl("right", true); } }} onKeyUp={() => tapControl("right", false)} onBlur={() => tapControl("right", false)}>→<small>Direita</small></button><button aria-label="Pular com Orbi" disabled={body.status !== "running" || paused} onPointerDown={event => { event.preventDefault(); controls.current.jump = true; }} onClick={event => { if (event.detail === 0) controls.current.jump = true; }}>↑<small>Pular</small></button></div>}
        <p className={s.controlNote}>{automatic ? "Orbi cuida dos movimentos. Você investiga o código. Pode trocar para jogar com os controles." : "Segure ← ou → e toque em Pular perto da seta no chão. No computador: setas ou A/D; espaço para pular. Tab sai do cenário."}</p>
        <details className={s.telemetry}><summary>Ver o que o código está mudando</summary><dl><div><dt>Posição x</dt><dd>{Math.round(body.x)} px</dd></div><div><dt>Velocidade horizontal</dt><dd>{params.speed} px/s</dd></div><div><dt>Impulso do pulo</dt><dd>{params.impulse} px/s</dd></div></dl><p>Física simplificada deste jogo. O código ao lado representa as regras; não é um editor JavaScript completo.</p></details>
      </section>
      <section className={s.workshop} aria-label="Missão de código"><span className={s.eyebrow}>{mission.concept}</span><h2 ref={missionHeading} tabIndex={-1}>{mission.title}</h2><p className={s.story}>{mission.story}</p><div className={s.task}><span>ORBI PEDE UMA AJUDA</span><p>{mission.instruction}</p></div>
        <fieldset className={s.config} disabled={body.status === "running"}><legend>{save.current === 0 ? "1. Escolha a velocidade" : save.current === 1 ? "1. Escolha o impulso" : "1. Escolha a condição"}</legend><div>{mission.options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => reset(option.value)}><code>{option.label}</code><small>{option.description}</small></button>)}</div></fieldset>
        <div className={s.code}><span>O CÓDIGO QUE VOCÊ ESTÁ MUDANDO · JAVASCRIPT</span><pre tabIndex={0} aria-label="Código da configuração">{deliveryCode(save.current, value)}</pre><p>{save.current === 0 ? "A cada instante, somamos um avanço à posição x. Tempo é o intervalo entre os movimentos." : save.current === 1 ? "Na tela, subir significa diminuir y. O sinal − inicia o movimento para cima; a gravidade traz Orbi de volta." : "if significa “se”. O que está entre chaves só acontece quando a comparação é verdadeira."}</p></div>
        <fieldset className={s.mode} disabled={body.status === "running"}><legend>2. Como quer testar?</legend><label><input type="radio" name="delivery-mode" checked={automatic} onChange={() => { reset(); setAutomatic(true); }}/>Orbi joga por mim <small>Observe sem precisar acertar o pulo.</small></label><label><input type="radio" name="delivery-mode" checked={!automatic} onChange={() => { reset(); setAutomatic(false); }}/>Eu controlo o Orbi <small>Setas, espaço ou botões de toque.</small></label></fieldset>
        <div className={s.actions}><button className={s.primary} disabled={body.status === "running"} onClick={start}>{body.status === "ready" ? "▶ Testar entrega" : "↻ Testar novamente"}</button><button className={s.secondary} onClick={() => reset()}>Recomeçar tentativa</button></div>
        <button className={s.help} onClick={() => setHint(!hint)} aria-expanded={hint}> {hint ? "Guardar a pista" : "Orbi, me dá uma pista"}</button>{hint && <p className={s.hint}>{mission.hint}</p>}
        {(blocked || fell) && <div className={s.retry} role="status"><strong>{blocked ? "Vamos ler a comparação juntos." : "O teste já contou uma parte da história."}</strong><p>{blocked ? `Com energia = ${body.energy}, ${mission.options.find(option => option.value === value)?.label} é falsa. Compare o valor exato com a regra escolhida.` : !automatic ? "O momento do pulo também muda o resultado. Teste com “Orbi joga por mim” para comparar os valores usando sempre o mesmo ponto de salto." : save.current === 0 ? "Orbi não alcançou a outra margem. Teste uma velocidade maior e observe se o alcance muda." : save.current === 1 ? "O pulo não alcançou a plataforma. Teste um impulso maior e observe a altura." : "A entrega não chegou. No modo guiado, Orbi faz o pulo no ponto marcado para você observar a condição."}</p></div>}
      </section>
    </div>
    {body.status === "arrived" && <section className={s.checkpoint} aria-label="Conferir entendimento"><div><span className={s.eyebrow}>ENTREGA FEITA · HORA DE EXPLICAR</span><h2 ref={checkHeading} tabIndex={-1}>{mission.question}</h2><p>Chegar ao destino e entender a regra são duas conquistas. Escolha o que você descobriu.</p></div><div className={s.answers}>{mission.answers.map((text, index) => <button key={text} onClick={() => chooseAnswer(index)} aria-pressed={answer === index} data-correct={answer === index && understood ? "true" : undefined}><span>{String.fromCharCode(65 + index)}</span>{text}</button>)}{answer !== null && <div className={s.answerFeedback} role="status" data-ok={understood}><strong>{understood ? "Você conectou o código ao que aconteceu." : "Olhe para o teste mais uma vez."}</strong><p>{understood ? mission.explanation : "A altura, a distância e a condição têm papéis diferentes. Você pode rever o código e escolher outra resposta."}</p></div>}{understood && (save.current < deliveryMissions.length - 1 ? <button className={s.primary} onClick={() => enter(save.current + 1)}>Próxima entrega →</button> : <div className={s.finish}><strong>Três entregas. Três ideias para levar ao código.</strong><p>Você experimentou variáveis, movimento e uma condição com um caso de limite. Agora vale escrever essas regras no laboratório.</p><Link className={s.primary} href={onBackHref}>Escolher próxima atividade →</Link></div>)}</div></section>}
    <footer className={s.footer}><span>{finished ? "✓ Aventura concluída. Você pode revisitar qualquer missão." : "Sem cronômetro de pontuação, vidas ou punição por tentar."}</span><span>{storageError ? "Seu navegador não permitiu salvar. Mantenha esta tela aberta para continuar." : "Progresso salvo neste navegador."}</span></footer>
  </div>;
}
