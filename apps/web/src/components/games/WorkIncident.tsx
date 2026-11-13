"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Activity, ArrowLeft, ArrowRight, BellRing, Check, FileCode2, History, Lightbulb, Pause, Play, RotateCcw, Send, ShieldCheck, ShoppingBag, Store, Volume2, VolumeX, X } from "lucide-react";
import OfficeScene, { type OfficeTarget } from "./work-simulation/OfficeScene";
import WorkstationDialog from "./work-simulation/WorkstationDialog";
import { readWorkDeliverySave, workDeliveryKey } from "@/lib/workDelivery";
import { applyIncidentRecovery, completeIncidentCase, emptyIncidentSave, getIncidentArtifact, getIncidentCase, incidentSaveKey, INCIDENT_CASE_IDS, INCIDENT_PLAN_LIMIT, mergeIncidentSave, parseIncidentPlan, readIncidentSave, verifyIncidentRecovery, type IncidentCaseId, type IncidentPlan, type IncidentReason, type IncidentRecovery, type IncidentSave, type IncidentVerification } from "@/lib/workIncident";
import { WORK_DELIVERY_HASH } from "@/lib/portalNavigation";
import s from "./WorkSimulation.module.css";
import d from "./WorkIncident.module.css";

type Props = { userId: string; preview?: boolean; onBackHref?: string };
type Panel = "alert" | "signals" | "plan" | "verify";
const panels = [{ id: "alert", label: "Alerta", icon: BellRing }, { id: "signals", label: "Sinais", icon: Activity }, { id: "plan", label: "Plano", icon: FileCode2 }, { id: "verify", label: "Conferência", icon: ShieldCheck }] as const;
const reasons: { id: IncidentReason; text: string }[] = [
  { id: "home-opened", text: "A página inicial abriu; isso já basta para afirmar que os pedidos voltaram." },
  { id: "highest-version", text: "O número da versão é o que comprova que a recuperação funcionou." },
  { id: "verified-orders", text: "O pedido foi conferido na versão restaurada e os erros zeraram nesta amostra." },
];

export default function WorkIncident({ userId, preview = false, onBackHref }: Props) {
  const [save, setSave] = useState<IncidentSave>(emptyIncidentSave);
  const latest = useRef(save);
  const [caseId, setCaseId] = useState<IncidentCaseId>("release-regression");
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [computer, setComputer] = useState(false);
  const [panel, setPanel] = useState<Panel>("alert");
  const [chat, setChat] = useState<"lead" | "support" | "review" | null>(null);
  const [briefed, setBriefed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [pending, setPending] = useState<"apply" | "verify" | null>(null);
  const [recovery, setRecovery] = useState<IncidentRecovery | null>(null);
  const [verification, setVerification] = useState<IncidentVerification | null>(null);
  const [reason, setReason] = useState<IncidentReason | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [hint, setHint] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const conversation = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scenario = getIncidentCase(caseId);
  const initial = getIncidentArtifact(caseId, scenario.initialArtifact)!;
  const current = recovery?.ok ? recovery.after : initial;
  const draft = save.drafts[caseId];
  const parsed = parseIncidentPlan(draft, caseId);
  const currentId = recovery?.ok ? recovery.artifactId : initial.id;
  const appliedPlan: IncidentPlan = { environment: "staging", targetArtifact: currentId };
  const draftChanged = !parsed.ok || parsed.config.targetArtifact !== appliedPlan.targetArtifact;
  const verified = !!(verification?.ok && recovery?.ok && verification.fingerprint === recovery.fingerprint);
  const done = save.completed.includes(caseId);
  const back = onBackHref ?? (preview ? "/dev/academy-preview" : "/estudante/jogos");
  const lab = preview ? "/dev/ide-preview/condicionais-js?academy=1" : "/estudante/pratica/condicionais-js";
  const cancel = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = null; setPending(null); }, []);
  const update = useCallback((next: IncidentSave) => {
    let value = next;
    try { value = mergeIncidentSave(next, readIncidentSave(localStorage.getItem(incidentSaveKey(userId)))); localStorage.setItem(incidentSaveKey(userId), JSON.stringify(value)); setStorageError(false); }
    catch { setStorageError(true); }
    latest.current = value; setSave(value); window.dispatchEvent(new Event("orbitamos-practice-updated"));
  }, [userId]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setUnlocked(readWorkDeliverySave(localStorage.getItem(workDeliveryKey(userId))).completed);
        const value = readIncidentSave(localStorage.getItem(incidentSaveKey(userId)));
        latest.current = value; setSave(value); setCaseId(value.current);
      } catch { setStorageError(true); }
      setReady(true);
    });
    const receive = (event: StorageEvent) => {
      if (event.key === workDeliveryKey(userId)) {
        const allowed = readWorkDeliverySave(event.newValue).completed; setUnlocked(allowed);
        if (!allowed) { cancel(); setComputer(false); setChat(null); }
      } else if (event.key === incidentSaveKey(userId)) {
        const value = mergeIncidentSave(latest.current, readIncidentSave(event.newValue)); latest.current = value; setSave(value);
      }
    };
    window.addEventListener("storage", receive);
    return () => { active = false; window.removeEventListener("storage", receive); if (timer.current) clearTimeout(timer.current); };
  }, [userId, cancel]);
  useLayoutEffect(() => {
    if (!chat && conversation.current?.open) conversation.current.close();
    if (chat && conversation.current && !conversation.current.open) conversation.current.showModal();
  }, [chat]);
  useEffect(() => { if (ready) title.current?.focus(); }, [ready]);
  function openComputer(next: Panel = panel) { if (!unlocked) return; setChat(null); setComputer(true); setPanel(next); setBriefed(true); }
  function interact(target: OfficeTarget) { if (target === "computer") openComputer(); else setChat(target); }
  function closeComputer() { cancel(); setComputer(false); }
  function chooseCase(id: IncidentCaseId) {
    if (INCIDENT_CASE_IDS.indexOf(id) > save.completed.length) return;
    cancel(); setComputer(false); setChat(null); setCaseId(id); setPanel("alert"); setRecovery(null); setVerification(null); setReason(null);
    setFeedback(null); setHint(0); setUndo(null); setResetConfirm(false); setBriefed(false); setPaused(false); update({ ...latest.current, current: id });
  }
  function edit(value: string) { setFeedback(null); update({ ...latest.current, drafts: { ...latest.current.drafts, [caseId]: value.slice(0, INCIDENT_PLAN_LIMIT) } }); }
  function begin(kind: "apply" | "verify", action: () => void) { cancel(); setPending(kind); setFeedback(null); timer.current = setTimeout(() => { timer.current = null; setPending(null); action(); }, 750); }
  function apply() {
    if (!unlocked || pending) return;
    const result = parseIncidentPlan(draft, caseId); if (!result.ok) { setFeedback(result); return; }
    const next = applyIncidentRecovery(result.config, caseId);
    begin("apply", () => { setRecovery(next); setVerification(null); setReason(null); setFeedback({ ok: next.ok, message: next.message }); setPanel("verify"); });
    update({ ...latest.current, attempts: { ...latest.current.attempts, [caseId]: latest.current.attempts[caseId] + 1 } });
  }
  function verify() { if (!recovery || pending || !unlocked) return; const result = verifyIncidentRecovery(recovery, appliedPlan, caseId); begin("verify", () => setVerification(result)); }
  function submit() {
    if (pending || !unlocked) return;
    const result = completeIncidentCase(latest.current, { caseId, config: appliedPlan, recovery, verification, reason });
    setFeedback({ ok: result.ok, message: result.message });
    if (result.ok) { update(result.save); setComputer(false); setChat("review"); }
  }
  function insert(text: string) { const field = editor.current, start = field?.selectionStart ?? draft.length, end = field?.selectionEnd ?? start; field?.focus({ preventScroll: true }); edit(draft.slice(0, start) + text + draft.slice(end)); requestAnimationFrame(() => field?.setSelectionRange(start + text.length, start + text.length)); }
  const objective = !ready ? "Preparando a ocorrência…" : !unlocked ? "Conclua a entrega da esteira para continuar."
    : verified ? "Pedidos conferidos. Escolha a evidência e envie para Nina." : recovery?.ok ? "A versão foi instalada. Confira o pedido e os erros."
      : briefed ? "Compare o histórico e prepare uma recuperação no computador." : "Jo encontrou uma falha depois de uma nova versão.";

  return <section className={s.experience} data-work-incident data-case={caseId} data-completed={save.completed.length}>
    <header className={s.header}><div><Link className={s.back} href={back}><ArrowLeft size={14}/> Simulações de trabalho</Link><p className={s.eyebrow}>LOJA DO BAIRRO <span>TERCEIRA PARTE</span></p><h1 ref={title} tabIndex={-1}>Quando a versão falha.</h1></div><div className={s.tools}><span className={s.environment}><i/> Homologação</span><button aria-label={muted ? "Ativar som do escritório" : "Silenciar escritório"} aria-pressed={!muted} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={19}/> : <Volume2 size={19}/>}</button><button aria-label={paused ? "Continuar turno" : "Pausar turno"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={19}/> : <Pause size={19}/>}</button></div></header>
    <div className={s.missionLine}><span className={s.missionNumber}>{caseId === "release-regression" ? "04" : "05"}</span><div><strong>{scenario.title}</strong><p>{objective}</p></div>{done && <span className={s.completedBadge}><Check size={15}/> Já entregou</span>}</div>
    <OfficeScene onInteract={interact} activeTarget={computer ? "computer" : chat === "support" ? "support" : chat ? "lead" : null} repaired={verified} briefed={briefed} paused={paused || computer || !!chat || !ready || !unlocked} muted={muted} speech={!unlocked ? "Nina: Vamos concluir a entrega da esteira primeiro." : verified ? "Jo: O pedido voltou na versão que você conferiu!" : briefed ? "Nina: O histórico pode ajudar a escolher a recuperação." : "Jo: A loja abre, mas os pedidos começaram a falhar."}/>
    {!unlocked && ready && <div className={d.locked} data-incident-locked><p>Esta tarefa continua a entrega da mudança.</p><a className={s.primary} href={WORK_DELIVERY_HASH}>Voltar à esteira <ArrowRight size={16}/></a></div>}
    {paused && <div className={s.pauseNotice} role="status">Turno pausado.<button onClick={() => setPaused(false)}><Play size={15}/> Continuar turno</button></div>}
    <footer className={s.sceneFooter}><span>Observar → recuperar → conferir · simulação local</span><details><summary>Sobre este ensaio</summary><p>Os números representam amostras fictícias de dez pedidos. Todos os pacotes usam o mesmo endereço; aqui você investiga a versão. Não há migração de banco neste ensaio. Restaurar uma versão pode ajudar neste caso; outros incidentes pedem outras decisões.</p><p>Rascunhos e conquistas ficam por conta neste navegador. Reabrir o ensaio recupera o arquivo, mas a instalação e o teste começam novamente.</p></details></footer>
    <nav className={s.caseNav} aria-label="Ocorrências para investigar">{INCIDENT_CASE_IDS.map((id, index) => <button key={id} aria-current={caseId === id ? "step" : undefined} disabled={!ready || !unlocked || index > save.completed.length} onClick={() => chooseCase(id)}><span>{save.completed.includes(id) ? <Check size={16}/> : `0${index + 4}`}</span><div>{getIncidentCase(id).title}<small>{index === 0 ? "Histórico com apoio do Orbi" : "Outras versões, menos ajuda"}</small></div><ArrowRight size={16}/></button>)}</nav>
    {save.completed.length === INCIDENT_CASE_IDS.length && <div className={s.transfer}><div><p className={s.eyebrow}>DO CENÁRIO PARA O CÓDIGO</p><h2>Você recuperou e conferiu os pedidos.</h2><p>Agora pratique condições no laboratório. Elas também expressam o que precisa ser verdadeiro para uma ação seguir.</p></div><Link href={lab}>Praticar condições <ArrowRight size={16}/></Link></div>}
    {storageError && <p className={s.storageWarning} role="alert">O navegador não conseguiu salvar. Copie o plano antes de sair.</p>}

    <WorkstationDialog open={computer} onClose={closeComputer} title={scenario.title} ticket={`PRIMEIRO TURNO · OCORRÊNCIA ${caseId === "release-regression" ? "017" : "018"}`} panel={panel} panels={panels} onPanelChange={id => setPanel(id as Panel)} pathLabel={`${currentId} / staging`} testIdPrefix="incident" chromeLabel="LOJA DO BAIRRO / RECUPERAÇÃO DO SERVIÇO">
      {panel === "alert" && <article data-incident-panel="alert"><p className={s.panelEyebrow}>JO · PEDIDOS EM HOMOLOGAÇÃO</p><h3>A página abre. A compra falha.</h3><p className={s.panelIntro}>Jo registrou falhas nos pedidos depois de {initial.id}. Compare as versões no histórico e recupere os pedidos em homologação.</p><div className={d.liveSignals} data-incident-current={currentId}><div><Store size={27}/><span>Página inicial<strong>{current.homeStatus} · abre</strong></span></div><div data-bad={current.checkoutStatus !== 201}><ShoppingBag size={27}/><span>Pedido<strong>{current.checkoutStatus} · {current.checkoutStatus === 201 ? "concluído" : "falhou"}</strong></span></div></div><p className={s.subtle}>Nina autorizou a recuperação apenas neste ambiente simulado. Registre o que voltou a funcionar; a investigação da causa continua depois.</p><button className={s.primary} onClick={() => setPanel("signals")}>Investigar o histórico <History size={16}/></button></article>}
      {panel === "signals" && <article data-incident-panel="signals"><p className={s.panelEyebrow}>ANTES E DEPOIS DA PUBLICAÇÃO</p><h3>Quando os pedidos mudaram?</h3><p className={s.panelIntro}>Os pacotes usam <code>orders:3000</code>. Compare os registros de funcionamento. Ser mais novo ou mais antigo não basta.</p><div className={d.chart} aria-label="Erros no histórico, por amostra de dez pedidos">{scenario.artifacts.map(artifact => <div key={artifact.id} data-healthy={artifact.errorsPer10 === 0}><span>{artifact.errorsPer10}/10 erros</span><div className={d.barTrack}><i style={{ height: `${Math.max(5, artifact.errorsPer10 * 10)}px` }}/></div><strong>{artifact.id}</strong><small>{artifact.releasedAt} · pedido {artifact.checkoutStatus}</small></div>)}</div><ol className={d.timeline}>{scenario.history.map((event, index) => <li key={index}><time>{event.at}</time><div><strong>{event.artifactId}</strong><p>{event.message}</p></div></li>)}</ol><div className={s.observation}><Activity size={22}/><p><strong>Agora está instalada: {currentId}.</strong> Há {current.errorsPer10} erros na amostra de dez pedidos do cenário. O histórico acima permanece registrado depois de uma recuperação.</p></div><button className={s.primary} onClick={() => setPanel("plan")}>Escrever meu plano <FileCode2 size={16}/></button></article>}
      {panel === "plan" && <article data-incident-panel="plan"><div className={s.fileTitle}><FileCode2 size={18}/><h3>recovery.plan.json</h3><span>JSON</span></div><p className={s.panelIntro}><code>targetArtifact</code> é a versão que você quer instalar. Escolha pelo histórico deste caso e preserve <code>staging</code>. Este é o formato educativo do cenário.</p><label className={s.editorLabel} htmlFor="work-incident-plan">Seu plano <span>{draftChanged ? "Rascunho diferente da instalação" : "Aponta para a versão instalada"}</span></label><textarea id="work-incident-plan" ref={editor} className={s.editor} value={draft} maxLength={INCIDENT_PLAN_LIMIT} onChange={event => edit(event.target.value)} disabled={!!pending} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby="incident-draft-note"/><div className={s.symbols} aria-label="Atalhos para escrever JSON">{['"', ':', ',', '{', '}', '\n'].map(token => <button key={token} disabled={!!pending} onClick={() => insert(token)} aria-label={token === '\n' ? "Inserir nova linha" : "Inserir " + token}>{token === '\n' ? '↵' : token}</button>)}</div><p className={s.draftNote} id="incident-draft-note">{storageError ? "Plano apenas nesta tela. Copie antes de sair." : "Rascunho salvo neste navegador. Editar não instala uma versão."}</p><div className={s.fileActions}><button className={s.primary} data-incident-apply disabled={!!pending} onClick={apply}><RotateCcw size={17}/>{pending === "apply" ? "Restaurando versão…" : "Restaurar versão do plano"}</button><button className={s.secondary} disabled={!!pending || hint >= scenario.hints.length} onClick={() => setHint(value => Math.min(value + 1, scenario.hints.length))}><Lightbulb size={17}/> Pedir pista</button></div>{hint > 0 && <aside className={s.hints}><strong>Orbi explica</strong>{scenario.hints.slice(0, hint).map(item => <p key={item}>{item}</p>)}</aside>}<div className={s.resetRow}>{!resetConfirm ? <button disabled={!!pending} onClick={() => setResetConfirm(true)}>Recuperar arquivo inicial</button> : <><span>Voltar ao plano inicial?</span><button onClick={() => { setUndo(draft); edit(scenario.starterCode); setResetConfirm(false); }}>Sim, recuperar</button><button onClick={() => setResetConfirm(false)}>Cancelar</button></>}{undo !== null && <button disabled={!!pending} onClick={() => { edit(undo); setUndo(null); }}>Desfazer recuperação</button>}</div></article>}
      {panel === "verify" && <article data-incident-panel="verify"><p className={s.panelEyebrow}>EVIDÊNCIA DA RECUPERAÇÃO</p><h3>O pedido voltou mesmo?</h3><div className={d.comparison}><div><small>No alerta inicial</small><strong>{initial.id}</strong><span>{initial.errorsPer10}/10 erros · pedido {initial.checkoutStatus}</span></div><ArrowRight size={23}/><div data-healthy={current.checkoutStatus === 201}><small>Instalada agora</small><strong data-incident-installed>{currentId}</strong><span>{current.errorsPer10}/10 erros · pedido {current.checkoutStatus}</span></div></div>{draftChanged && <p className={s.draftWarning}>Há um plano diferente no editor. Esta conferência usa a versão já instalada: {currentId}.</p>}<button className={s.primary} data-incident-verify onClick={verify} disabled={!recovery?.ok || !!pending}><Play size={17}/>{pending === "verify" ? "Conferindo pedidos…" : "Conferir pedidos após a recuperação"}</button>{verification && <div className={verified ? s.testPass : s.testFail} role="status" data-incident-verification={verified ? "passed" : "failed"}><strong>{verified ? "O pedido passou na versão restaurada." : "Essa versão ainda não recuperou os pedidos."}</strong><p>{verified ? "Pedido 201 e nenhum erro nesta amostra. Você tem evidência para relatar a recuperação." : "A home continua abrindo, mas o pedido falha. Volte ao histórico e investigue outra versão."}</p><details><summary>Ver o resultado da conferência</summary><pre>{verification.lines.join('\n')}</pre></details></div>}<fieldset className={d.reasons} disabled={!verified || !!pending}><legend>Qual evidência sustenta sua entrega?</legend>{reasons.map(item => <label key={item.id} data-selected={reason === item.id}><input type="radio" name="incident-reason" value={item.id} checked={reason === item.id} onChange={() => { setReason(item.id); setFeedback(null); }}/><span>{item.text}</span></label>)}</fieldset><div className={d.actions}><button className={s.secondary} onClick={() => setPanel("signals")}>Rever o histórico <History size={16}/></button><button className={s.primary} data-incident-submit disabled={!verified || !reason || !!pending} onClick={submit}><Send size={17}/> Enviar evidência para Nina</button></div></article>}
      {feedback && <p className={feedback.ok ? s.feedbackOk : s.feedbackError} role="status" data-incident-feedback>{feedback.message}</p>}
    </WorkstationDialog>

    <dialog ref={conversation} className={s.conversation} onCancel={event => { event.preventDefault(); setChat(null); }} aria-labelledby="incident-person-title" data-incident-person><button className={s.closeChat} aria-label="Fechar conversa" onClick={() => setChat(null)}><X size={19}/></button><span className={s.portrait} data-person={chat === "support" ? "support" : "lead"} aria-hidden="true"/><div className={s.dialogueBody}><p className={s.eyebrow}>{chat === "support" ? "ATENDIMENTO" : "RESPONSÁVEL PELO TIME"}</p><h2 id="incident-person-title">{chat === "support" ? "Jo" : "Nina"}</h2>{chat === "review" ? <><p>A recuperação e o pedido conferido estão registrados. Você escolheu uma versão pelo histórico e mostrou o que voltou a funcionar.</p><p className={s.subtle}>Isso registra a recuperação deste ensaio; ainda precisamos investigar a causa e prevenir outra ocorrência.</p><div className={s.chatActions}>{caseId === "release-regression" ? <button className={s.primary} onClick={() => chooseCase("independent-recovery")}>Investigar outra instalação <ArrowRight size={16}/></button> : <Link className={s.primary} href={lab}>Praticar condições no código <ArrowRight size={16}/></Link>}<button className={s.secondary} onClick={() => setChat(null)}>Voltar ao escritório</button></div></> : chat === "support" ? <><p>{verified ? "O pedido terminou na versão restaurada. Agora podemos enviar os sinais e a conferência para a Nina." : "A home abre, mas alguns pedidos falham depois da nova versão. Os horários e as amostras estão no computador."}</p><button className={s.primary} onClick={() => openComputer(verified ? "verify" : "signals")}>Ver os pedidos <ArrowRight size={16}/></button></> : <><p>{done ? "Sua recuperação anterior está registrada. Você pode repetir este ensaio: a instalação e a conferência precisam ser feitas novamente." : "Vamos recuperar os pedidos neste ensaio de homologação. Compare as versões, aplique uma escolha e confira o resultado. Uma versão antiga também pode ter defeitos."}</p><p className={s.subtle}>Não houve migração de banco neste cenário. Restaurar não é uma solução universal nem encerra a investigação da causa.</p><button className={s.primary} onClick={() => { setBriefed(true); setChat(null); }}>Vou investigar <ArrowRight size={16}/></button></>}</div></dialog>
  </section>;
}
