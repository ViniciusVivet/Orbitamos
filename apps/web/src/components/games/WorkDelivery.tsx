"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardList, FileCode2, GitBranch, Lightbulb, Package, Pause, Play, RotateCcw, Send, ShieldCheck, ShoppingBag, Store, Upload, Volume2, VolumeX, X } from "lucide-react";
import OfficeScene, { type OfficeTarget } from "./work-simulation/OfficeScene";
import { readWorkSave, WORK_CASE_IDS, workSimulationKey } from "@/lib/workSimulation";
import {
  completeWorkDelivery, emptyWorkDeliverySave, getWorkArtifact, mergeWorkDeliverySave,
  parseWorkDeliveryConfig, publishWorkDelivery, readWorkDeliverySave, runWorkDelivery,
  verifyWorkDeployment, workArtifacts, workDeliveryKey, WORK_DELIVERY_CONFIG_LIMIT,
  WORK_DELIVERY_STARTER_CODE, type WorkArtifactId, type WorkDeliveryPipeline,
  type WorkDeliverySave, type WorkDeploymentResult, type WorkDeploymentVerification,
} from "@/lib/workDelivery";
import s from "./WorkSimulation.module.css";
import d from "./WorkDelivery.module.css";

type Props = { userId: string; preview?: boolean; onBackHref?: string };
type Panel = "ticket" | "config" | "pipeline" | "publish";
type Pending = "pipeline" | "deploy" | "verify" | null;
const panels = [
  { id: "ticket", label: "Tarefa", icon: ClipboardList },
  { id: "config", label: "Arquivo", icon: FileCode2 },
  { id: "pipeline", label: "Esteira", icon: GitBranch },
  { id: "publish", label: "Publicação", icon: Upload },
] as const;
const hints = [
  "checks é a lista de verificações. home abre a página; checkout tenta concluir um pedido. Uma página aberta não prova que alguém consegue comprar.",
  'Para verificar os dois caminhos, escreva "checks": ["home", "checkout"]. Preserve staging. Depois investigue qual versão passa pelos dois.',
  "Compare ordersBaseUrl nas versões. Rode os dois checks em cada uma. Publique a mesma versão que passou e confira o pedido depois da publicação.",
];

export default function WorkDelivery({ userId, preview = false, onBackHref }: Props) {
  const [save, setSave] = useState<WorkDeliverySave>(emptyWorkDeliverySave);
  const latest = useRef(save);
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [panel, setPanel] = useState<Panel>("ticket");
  const [computer, setComputer] = useState(false);
  const [chat, setChat] = useState<"lead" | "support" | "review" | null>(null);
  const [briefed, setBriefed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [pending, setPending] = useState<Pending>(null);
  const [pipeline, setPipeline] = useState<WorkDeliveryPipeline | null>(null);
  const [deployment, setDeployment] = useState<WorkDeploymentResult | null>(null);
  const [verification, setVerification] = useState<WorkDeploymentVerification | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [hint, setHint] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const terminal = useRef<HTMLDialogElement>(null);
  const conversation = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prior = "#";
  const back = onBackHref ?? (preview ? "/dev/academy-preview" : "/estudante/jogos");
  const lab = preview ? "/dev/ide-preview/variaveis-js?academy=1" : "/estudante/pratica/variaveis-js";
  const parsed = parseWorkDeliveryConfig(save.draft);
  const selected = getWorkArtifact(save.selectedArtifact);
  const eligibility = parsed.ok ? publishWorkDelivery(parsed.config, save.selectedArtifact, pipeline) : null;
  const verified = !!(verification?.ok && deployment?.ok && eligibility?.ok && parsed.ok
    && verification.fingerprint === runWorkDelivery(parsed.config, save.selectedArtifact).fingerprint
    && verification.fingerprint === deployment.fingerprint);
  const activeArtifact = deployment?.ok ? deployment.artifactId : "loja-014";

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null; setPending(null);
  }, []);
  const update = useCallback((next: WorkDeliverySave) => {
    let merged = next;
    try {
      merged = mergeWorkDeliverySave(next, readWorkDeliverySave(localStorage.getItem(workDeliveryKey(userId))));
      localStorage.setItem(workDeliveryKey(userId), JSON.stringify(merged));
      setStorageError(false);
    } catch { setStorageError(true); }
    latest.current = merged; setSave(merged);
    window.dispatchEvent(new Event("orbitamos-practice-updated"));
  }, [userId]);

  useEffect(() => {
    let active = true;
    const load = () => {
      if (!active) return;
      try {
        const previous = readWorkSave(localStorage.getItem(workSimulationKey(userId)));
        setUnlocked(WORK_CASE_IDS.every(id => previous.completed.includes(id)));
        const value = readWorkDeliverySave(localStorage.getItem(workDeliveryKey(userId)));
        latest.current = value; setSave(value);
      } catch { setStorageError(true); }
      setReady(true);
    };
    queueMicrotask(load);
    const receive = (event: StorageEvent) => {
      if (event.key === workSimulationKey(userId)) {
        const previous = readWorkSave(event.newValue);
        const allowed = WORK_CASE_IDS.every(id => previous.completed.includes(id));
        setUnlocked(allowed);
        if (!allowed) { cancel(); setComputer(false); setChat(null); }
      } else if (event.key === workDeliveryKey(userId)) {
        const merged = mergeWorkDeliverySave(latest.current, readWorkDeliverySave(event.newValue));
        latest.current = merged; setSave(merged);
      }
    };
    window.addEventListener("storage", receive);
    return () => { active = false; window.removeEventListener("storage", receive); if (timer.current) clearTimeout(timer.current); };
  }, [userId, cancel]);
  useEffect(() => {
    if (!computer && terminal.current?.open) terminal.current.close();
    if (!chat && conversation.current?.open) conversation.current.close();
    if (computer && terminal.current && !terminal.current.open) terminal.current.showModal();
    if (chat && conversation.current && !conversation.current.open) conversation.current.showModal();
    if (computer) {
      // A new panel starts with its instructions, independent of the previous scroll.
      if (terminal.current) terminal.current.scrollTop = 0;
      const heading = terminal.current?.querySelector<HTMLElement>('[data-delivery-panel="' + panel + '"] h3');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
  }, [computer, chat, panel]);
  useEffect(() => { if (ready) title.current?.focus(); }, [ready]);

  function invalidate() { cancel(); setPipeline(null); setVerification(null); setFeedback(null); }
  function edit(value: string) {
    invalidate();
    update({ ...latest.current, draft: value.slice(0, WORK_DELIVERY_CONFIG_LIMIT) });
  }
  function chooseArtifact(id: WorkArtifactId) {
    if (pending || id === save.selectedArtifact) return;
    invalidate(); update({ ...latest.current, selectedArtifact: id });
    setFeedback({ ok: false, message: "Versão selecionada mudou. Rode as verificações desta versão antes de publicar. A versão instalada não mudou." });
  }
  function interact(target: OfficeTarget) {
    if (!unlocked || !ready) return;
    if (target === "computer") { setComputer(true); setChat(null); setBriefed(true); }
    else setChat(target === "lead" ? "lead" : "support");
  }
  function closeComputer() { cancel(); setComputer(false); }
  function begin(kind: Pending, action: () => void) {
    cancel(); setPending(kind); setFeedback(null);
    timer.current = setTimeout(() => { timer.current = null; setPending(null); action(); }, 750);
  }
  function run() {
    if (!parsed.ok) { setFeedback({ ok: false, message: parsed.message }); return; }
    if (!unlocked || pending) return;
    const config = parsed.config, artifactId = save.selectedArtifact;
    update({ ...latest.current, attempts: latest.current.attempts + 1 });
    setPipeline(null); setVerification(null); setPanel("pipeline");
    begin("pipeline", () => setPipeline(runWorkDelivery(config, artifactId)));
  }
  function publish() {
    if (!parsed.ok || !unlocked || pending) return;
    const result = publishWorkDelivery(parsed.config, save.selectedArtifact, pipeline);
    if (!result.ok) { setFeedback({ ok: false, message: result.message }); return; }
    setVerification(null);
    begin("deploy", () => { setDeployment(result); setFeedback({ ok: true, message: "Versão instalada em homologação. Ainda falta conferir o pedido nesse ambiente." }); });
  }
  function verify() {
    if (!parsed.ok || !unlocked || pending) return;
    const result = verifyWorkDeployment(deployment, parsed.config, save.selectedArtifact);
    begin("verify", () => setVerification(result));
  }
  function submit() {
    if (!parsed.ok || !unlocked || pending) return;
    const result = completeWorkDelivery(latest.current, { artifactId: save.selectedArtifact, config: parsed.config, pipeline, deployment, verification });
    setFeedback({ ok: result.ok, message: result.message });
    if (result.ok) { update(result.save); setComputer(false); setChat("review"); }
  }
  function insert(text: string) {
    const field = editor.current;
    const start = field?.selectionStart ?? save.draft.length, end = field?.selectionEnd ?? start;
    field?.focus({ preventScroll: true }); edit(save.draft.slice(0, start) + text + save.draft.slice(end));
    requestAnimationFrame(() => field?.setSelectionRange(start + text.length, start + text.length));
  }
  const objective = !ready ? "Preparando o turno…" : !unlocked ? "Conclua os dois casos de conexão para continuar."
    : verified ? "O pedido publicado passou. Envie sua evidência para Nina."
      : deployment?.ok ? "Confira o pedido da versão instalada em homologação."
        : pipeline?.canPublish ? "Os dois caminhos passaram. Prepare a publicação desta versão."
          : pipeline?.allChecksPassed && !pipeline.coverageComplete ? "A home passou. A compra ainda não foi testada."
            : briefed ? "No computador, investigue a versão e o que os testes realmente verificam." : "Nina tem uma nova tarefa para você.";

  return <section className={s.experience} data-work-delivery data-delivery-completed={save.completed ? "true" : "false"}>
    <header className={s.header}><div><Link className={s.back} href={back}><ArrowLeft size={14}/> Simulações de trabalho</Link><p className={s.eyebrow}>LOJA DO BAIRRO <span>SEGUNDA PARTE</span></p><h1 ref={title} tabIndex={-1}>Do teste à entrega.</h1></div><div className={s.tools}><span className={s.environment}><i/> Homologação</span><button aria-label={muted ? "Ativar som do escritório" : "Silenciar escritório"} aria-pressed={!muted} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={19}/> : <Volume2 size={19}/>}</button><button aria-label={paused ? "Continuar turno" : "Pausar turno"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={19}/> : <Pause size={19}/>}</button></div></header>
    <div className={s.missionLine}><span className={s.missionNumber}>03</span><div><strong>A esteira de homologação</strong><p>{objective}</p></div>{save.completed && <span className={s.completedBadge}><Check size={15}/> Já entregou</span>}</div>
    <OfficeScene onInteract={interact} activeTarget={computer ? "computer" : chat === "support" ? "support" : chat ? "lead" : null} repaired={verified} briefed={briefed} paused={paused || computer || !!chat || !ready || !unlocked} muted={muted} speech={!unlocked ? "Nina: Vamos terminar os casos de conexão primeiro." : verified ? "Jo: A compra passou na versão que você publicou!" : briefed ? "Nina: Verde nos testes… mas o que foi testado?" : "Nina: Agora vamos cuidar da entrega da mudança."}/>
    {!unlocked && ready && <div className={d.unlock} data-delivery-locked><p>Esta tarefa usa a investigação dos dois primeiros casos.</p><a className={s.primary} href={prior}>Continuar os casos de conexão <ArrowRight size={16}/></a></div>}
    {paused && <div className={s.pauseNotice} role="status">Turno pausado.<button onClick={() => setPaused(false)}><Play size={15}/> Continuar turno</button></div>}
    <footer className={s.sceneFooter}><span>Verificar → publicar → conferir · simulação local</span><details><summary>Como funciona esta tarefa?</summary><p>Escolha uma versão da loja e escreva quais caminhos verificar em smoke.config.json. Uma esteira é uma sequência de verificações e entrega. Neste cenário, a publicação depende de testar a home e o pedido da mesma versão. A simulação não executa GitHub Actions nem acessa servidores reais.</p><p>O arquivo e sua conquista ficam neste navegador, por conta. Ao reabrir, rode os testes novamente: resultados e publicação ativa não são restaurados.</p></details></footer>
    <div className={s.transfer}><div><p className={s.eyebrow}>SEU TURNO</p><h2>Uma mudança precisa chegar inteira.</h2><p>{save.completed ? "Sua entrega anterior está registrada. Você pode repetir a investigação ou continuar no laboratório." : "Você já corrigiu a conexão. Agora vai provar que a compra funciona e levar a versão verificada para homologação."}</p></div><a href={prior}>Rever os casos de conexão <ArrowRight size={16}/></a></div>
    {storageError && <p className={s.storageWarning} role="alert">O navegador não conseguiu salvar. Copie seu arquivo antes de sair.</p>}

    <dialog ref={terminal} className={`${s.computer} ${d.computer}`} onCancel={event => { event.preventDefault(); closeComputer(); }} aria-labelledby="delivery-computer-title" data-delivery-computer>
      <div className={`${s.computerChrome} ${d.chrome}`}><div className={s.windowDots} aria-hidden="true"><i/><i/><i/></div><span>LOJA DO BAIRRO / ENTREGA DA MUDANÇA</span><button aria-label="Voltar ao escritório" onClick={closeComputer}><X size={20}/></button></div>
      <div className={s.computerHeading}><div><p>PRIMEIRO TURNO · TICKET 016</p><h2 id="delivery-computer-title">A esteira de homologação</h2></div><span className={s.environment}><i/> Homologação</span></div>
      <div className={s.computerBody}><nav className={s.panelNav} aria-label="Áreas do computador">{panels.map(item => <button key={item.id} aria-pressed={panel === item.id} onClick={() => setPanel(item.id)}><item.icon size={18}/><span>{item.label}</span></button>)}</nav><div className={s.workspace}>
        <div className={s.workspacePath}><span>{panels.find(item => item.id === panel)?.label}</span><span>{save.selectedArtifact} / staging</span></div>
        {panel === "ticket" && <article data-delivery-panel="ticket"><div className={s.sender}><span className={`${s.senderAvatar} ${d.ninaAvatar}`}/><div><strong>Nina · revisão da entrega</strong><small>Da correção para homologação</small></div><span className={s.issueStatus}>{save.completed ? "Já entregue" : "Em investigação"}</span></div><h3>Está verde. Dá para publicar?</h3><p className={s.panelIntro}>Voltamos à primeira instalação, onde pedidos atende em orders:3000. A equipe empacotou duas versões da loja. A esteira atual só abre a página inicial — ela ainda não tenta comprar. Descubra qual versão conclui o pedido, complete o plano de verificações e publique essa mesma versão em homologação.</p><div className={d.journey} aria-label="Objetivo da verificação"><div><Store size={30}/><strong>Abrir a loja</strong><small>home</small></div><ArrowRight size={22}/><div><ShoppingBag size={30}/><strong>Concluir a compra</strong><small>checkout</small></div></div><div className={s.observation}><Lightbulb size={20}/><p><strong>Uma versão, também chamada de artefato,</strong> é um pacote do código e da configuração. Escolher uma versão aqui não a instala.</p></div><button className={s.primary} onClick={() => setPanel("config")}>Ver o que a esteira testa <ArrowRight size={16}/></button></article>}
        {panel === "config" && <article data-delivery-panel="config"><div className={s.fileTitle}><FileCode2 size={18}/><h3>smoke.config.json</h3><span>JSON</span></div><p className={s.panelIntro}>Seu objetivo: <strong>abrir a loja e concluir um pedido</strong>. Em <code>checks</code>, escreva os caminhos que a esteira deve verificar.</p><div className={d.legend}><span><Store size={17}/><code>home</code> abre a loja</span><span><ShoppingBag size={17}/><code>checkout</code> tenta comprar</span></div><label className={s.editorLabel} htmlFor="work-smoke-config">Seu plano de verificações <span>Ambiente: staging</span></label><textarea ref={editor} id="work-smoke-config" className={s.editor} value={save.draft} maxLength={WORK_DELIVERY_CONFIG_LIMIT} disabled={!!pending} onChange={event => edit(event.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby="delivery-draft-note"/><div className={s.symbols} aria-label="Atalhos para escrever JSON">{['"', ':', ',', '[', ']', '{', '}', '\n'].map(token => <button key={token} disabled={!!pending} onClick={() => insert(token)} aria-label={token === '\n' ? "Inserir nova linha" : "Inserir " + token}>{token === '\n' ? '↵' : token}</button>)}</div><p id="delivery-draft-note" className={s.draftNote}>{storageError ? "Arquivo apenas nesta tela. Copie antes de sair." : "Seu arquivo está salvo neste navegador. Editar o plano não publica uma versão."}</p><div className={s.fileActions}><button className={s.primary} data-delivery-run onClick={run} disabled={!!pending}><Play size={17}/> Rodar verificações</button><button className={s.secondary} disabled={hint >= hints.length || !!pending} onClick={() => setHint(value => Math.min(hints.length, value + 1))}><Lightbulb size={17}/> Pedir pista</button></div>{hint > 0 && <aside className={s.hints}><strong>Orbi explica</strong>{hints.slice(0, hint).map(item => <p key={item}>{item}</p>)}</aside>}<div className={s.resetRow}>{!resetConfirm ? <button disabled={!!pending} onClick={() => setResetConfirm(true)}><RotateCcw size={13}/> Recuperar arquivo inicial</button> : <><span>Voltar ao arquivo inicial?</span><button onClick={() => { setUndo(save.draft); edit(WORK_DELIVERY_STARTER_CODE); setResetConfirm(false); }}>Sim, recuperar</button><button onClick={() => setResetConfirm(false)}>Cancelar</button></>}{undo !== null && <button disabled={!!pending} onClick={() => { edit(undo); setUndo(null); }}>Desfazer recuperação</button>}</div></article>}
        {panel === "pipeline" && <article data-delivery-panel="pipeline"><p className={s.panelEyebrow}>VERSÃO + VERIFICAÇÕES</p><h3>O que passou de verdade?</h3><p className={s.panelIntro}>Escolha uma versão da primeira instalação. Confira seu endereço e rode o plano. Pedidos atende em <code>orders:3000</code> nesta esteira.</p><fieldset className={d.artifacts} disabled={!!pending}><legend>Versão para verificar</legend>{workArtifacts.map(artifact => <label key={artifact.id} data-selected={save.selectedArtifact === artifact.id}><input type="radio" name="work-artifact" value={artifact.id} checked={save.selectedArtifact === artifact.id} onChange={() => chooseArtifact(artifact.id)}/><Package size={21}/><span><strong>{artifact.id}</strong><code>{artifact.ordersBaseUrl}</code></span></label>)}</fieldset><div className={d.pipelineTrack} aria-label="Caminhos verificados" data-delivery-coverage={pipeline?.coverageComplete ? "complete" : "incomplete"}>{(["home", "checkout"] as const).map(id => { const check = pipeline?.checks.find(item => item.id === id); return <div key={id} data-state={pending === "pipeline" ? "running" : check ? check.ok ? "passed" : "failed" : "untested"}>{id === "home" ? <Store size={27}/> : <ShoppingBag size={27}/>}<span><strong>{id === "home" ? "Abrir a loja" : "Concluir pedido"}</strong><small>{pending === "pipeline" ? "Verificando…" : check ? `${check.status} · ${check.ok ? "passou" : "falhou"}` : "Não testado"}</small></span>{check?.ok && pending !== "pipeline" && <Check size={19}/>}</div>; })}</div><button className={s.primary} data-delivery-run onClick={run} disabled={!!pending}><Play size={17}/>{pending === "pipeline" ? "Rodando verificações…" : `Verificar ${selected.id}`}</button>{pipeline && <div className={pipeline.canPublish ? s.testPass : d.investigation} role="status" data-covered={pipeline.coverageComplete} data-passed={pipeline.allChecksPassed} data-delivery-pipeline={pipeline.canPublish ? "ready" : pipeline.allChecksPassed ? "incomplete" : "failed"}><strong>{pipeline.canPublish ? "A loja abriu e o pedido terminou." : !pipeline.allChecksPassed ? "Uma verificação falhou nesta versão." : "Há um caminho sem verificação."}</strong><p>{pipeline.canPublish ? `${pipeline.artifactId} passou pelos dois caminhos. É esta versão que você pode publicar.` : !pipeline.coverageComplete ? "Verde significa que os checks escolhidos passaram. O caminho que ficou de fora continua sem evidência." : "Compare o endereço da versão com a porta do serviço. Experimente outra versão e rode os dois checks novamente."}</p><details><summary>Ver saída da esteira</summary><pre>{pipeline.lines.join('\n')}</pre></details></div>}<div className={d.actions}><button className={s.secondary} onClick={() => setPanel("config")}>Editar verificações <FileCode2 size={16}/></button><button className={s.primary} disabled={!eligibility?.ok || !!pending} onClick={() => setPanel("publish")}>Preparar publicação <ArrowRight size={16}/></button></div></article>}
        {panel === "publish" && <article data-delivery-panel="publish"><p className={s.panelEyebrow}>ENTREGA EM HOMOLOGAÇÃO</p><h3>A mesma versão. No ambiente certo.</h3><p className={s.panelIntro}>Publicar instala a versão verificada no ambiente. Depois, faça um pedido nele. Produção continua fora desta tarefa.</p><div className={d.deployment} data-delivery-deployment={deployment?.ok ? deployment.artifactId : "initial"}><div><Package size={26}/><span>Selecionada<strong>{save.selectedArtifact}</strong><small>{eligibility?.ok ? "home + checkout verificados" : "Faltam verificações atuais"}</small></span></div><ArrowRight size={23}/><div><Store size={26}/><span>Instalada em homologação<strong data-delivery-installed>{activeArtifact}</strong><small>{deployment?.ok ? "Instalada nesta sessão" : "Versão inicial do cenário"}</small></span></div></div><button className={s.primary} data-delivery-publish disabled={!eligibility?.ok || !!pending} onClick={publish}><Upload size={17}/>{pending === "deploy" ? "Publicando em homologação…" : `Publicar ${save.selectedArtifact} em homologação`}</button>{!eligibility?.ok && <p className={s.draftWarning}>Verifique os dois caminhos da versão selecionada antes de publicar.</p>}<div className={d.postCheck}><ShieldCheck size={26}/><div><h4>O pedido funciona depois de publicar?</h4><p>O teste anterior validou o pacote. Agora confira a versão instalada.</p></div><button className={s.secondary} data-delivery-verify disabled={!deployment?.ok || !eligibility?.ok || !!pending} onClick={verify}>{pending === "verify" ? "Conferindo pedido…" : "Conferir pedido publicado"}<Play size={16}/></button></div>{verification && <div className={verified ? s.testPass : s.testFail} role="status" data-delivery-verification={verified ? "passed" : "failed"}><strong>{verified ? "Jo confirmou: a compra terminou em homologação." : "A verificação não confirma a entrega atual."}</strong><details><summary>Ver verificação do ambiente</summary><pre>{verification.lines.join('\n')}</pre></details></div>}<div className={d.actions}><button className={s.secondary} onClick={() => setPanel("pipeline")}>Voltar à esteira <GitBranch size={16}/></button><button className={s.primary} data-delivery-submit disabled={!verified || !!pending} onClick={submit}><Send size={17}/> Enviar evidência para Nina</button></div></article>}
        {feedback && <p className={feedback.ok ? s.feedbackOk : s.feedbackError} role="status" data-delivery-feedback>{feedback.message}</p>}
      </div></div><footer className={s.computerFooter}><span><i/> Simulação local · produção sem mudanças</span><button onClick={closeComputer}>Voltar ao escritório <ArrowRight size={14}/></button></footer>
    </dialog>

    <dialog ref={conversation} className={s.conversation} onCancel={event => { event.preventDefault(); setChat(null); }} aria-labelledby="delivery-person-title" data-delivery-person><button className={s.closeChat} aria-label="Fechar conversa" onClick={() => setChat(null)}><X size={19}/></button><span className={s.portrait} data-person={chat === "support" ? "support" : "lead"} aria-hidden="true"/><div className={s.dialogueBody}><p className={s.eyebrow}>{chat === "support" ? "ATENDIMENTO" : "RESPONSÁVEL PELO TIME"}</p><h2 id="delivery-person-title">{chat === "support" ? "Jo" : "Nina"}</h2>{chat === "review" ? <><p>Você verificou a compra, publicou a mesma versão e conferiu o pedido em homologação. Agora temos uma entrega com evidência.</p><p className={s.subtle}>Teste verde só responde ao que foi testado. Esse cuidado vale no seu próximo projeto.</p><div className={s.chatActions}><Link className={s.primary} href={lab}>Levar a ideia ao laboratório <ArrowRight size={16}/></Link><button className={s.secondary} onClick={() => setChat(null)}>Voltar ao escritório</button></div></> : chat === "support" ? <><p>{verified ? "Fizemos um pedido na versão publicada e ele terminou! Você já pode enviar essa evidência para a Nina." : "A página abrir não me diz se alguém consegue comprar. Preciso que você confira o pedido na versão que foi publicada."}</p><button className={s.primary} onClick={() => { setPanel("publish"); setComputer(true); setChat(null); }}>Conferir a entrega <ArrowRight size={16}/></button></> : <><p>{save.completed ? "Sua entrega anterior está registrada. Se quiser repetir, vamos verificar a versão de novo; os resultados da sessão anterior não ficam ativos." : "A correção está pronta, mas o plano de testes só abre a loja. Será que ele descobriria uma compra com defeito? Quero que você investigue isso antes de publicar."}</p><p className={s.subtle}>Há duas versões no computador. Verifique o que cada uma faz, publique a que passou e confira um pedido no ambiente.</p><button className={s.primary} onClick={() => { setBriefed(true); setChat(null); }}>Vou investigar <ArrowRight size={16}/></button></>}</div></dialog>
  </section>;
}
