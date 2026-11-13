"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, ClipboardList, Code2, FileCode2, GitCompareArrows, Lightbulb, Monitor, Network, Package, Pause, Play, RotateCcw, Send, Terminal, Volume2, VolumeX, X } from "lucide-react";
import OfficeScene, { type OfficeTarget } from "./work-simulation/OfficeScene";
import { completeWorkCase, emptyWorkSave, getWorkCase, mergeWorkSave, parseWorkConfig, readWorkSave, testWorkCheckout, WORK_CASE_IDS, WORK_CONFIG_LIMIT, workSimulationKey, type WorkCaseId, type WorkConfig, type WorkSave, type WorkTestResult } from "@/lib/workSimulation";
import s from "./WorkSimulation.module.css";

type Props = { userId: string; preview?: boolean; onBackHref?: string };
type Panel = "ticket" | "services" | "logs" | "config" | "test" | "report";
const panels = [
  { id: "ticket", label: "Tarefa", icon: ClipboardList },
  { id: "services", label: "Serviços", icon: Network },
  { id: "logs", label: "Logs", icon: Terminal },
  { id: "config", label: "Arquivo", icon: FileCode2 },
  { id: "test", label: "Teste", icon: Play },
  { id: "report", label: "Entrega", icon: Send },
] as const;

export default function WorkSimulation(props: Props) { return <WorkSession key={props.userId} {...props}/>; }

function WorkSession({ userId, preview = false, onBackHref }: Props) {
  const [save, setSave] = useState<WorkSave>(emptyWorkSave);
  const latest = useRef(save);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [caseId, setCaseId] = useState<WorkCaseId>("checkout-staging");
  const [computer, setComputer] = useState(false);
  const [panel, setPanel] = useState<Panel>("ticket");
  const [chat, setChat] = useState<"lead" | "support" | "review" | null>(null);
  const [briefed, setBriefed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [applied, setApplied] = useState<WorkConfig>(getWorkCase("checkout-staging").initialConfig);
  const [test, setTest] = useState<WorkTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [hint, setHint] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  const terminal = useRef<HTMLDialogElement>(null);
  const conversation = useRef<HTMLDialogElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const testTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticket = getWorkCase(caseId);
  const draft = save.drafts[caseId];
  const parsed = useMemo(() => parseWorkConfig(draft), [draft]);
  const draftChanged = !parsed.ok || parsed.config.ordersBaseUrl !== applied.ordersBaseUrl;
  const done = save.completed.includes(caseId);
  const back = onBackHref ?? (preview ? "/dev/academy-preview" : "/estudante/jogos");
  const lab = preview ? "/dev/ide-preview/variaveis-js?academy=1" : "/estudante/pratica/variaveis-js";

  const cancelTest = useCallback(() => {
    if (testTimer.current) clearTimeout(testTimer.current);
    testTimer.current = null;
    setTesting(false);
  }, []);
  const update = useCallback((next: WorkSave) => {
    let value = next;
    try {
      value = mergeWorkSave(next, readWorkSave(localStorage.getItem(workSimulationKey(userId))));
      localStorage.setItem(workSimulationKey(userId), JSON.stringify(value));
      setStorageError(false);
    } catch { setStorageError(true); }
    latest.current = value;
    setSave(value);
    window.dispatchEvent(new Event("orbitamos-practice-updated"));
    return value;
  }, [userId]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let value = emptyWorkSave();
      try { value = readWorkSave(localStorage.getItem(workSimulationKey(userId))); } catch { setStorageError(true); }
      latest.current = value; setSave(value); setCaseId(value.current);
      setApplied(getWorkCase(value.current).initialConfig); setReady(true);
    });
    const receive = (event: StorageEvent) => {
      if (event.key !== workSimulationKey(userId)) return;
      const merged = mergeWorkSave(latest.current, readWorkSave(event.newValue));
      latest.current = merged; setSave(merged);
    };
    window.addEventListener("storage", receive);
    return () => { active = false; window.removeEventListener("storage", receive); if (testTimer.current) clearTimeout(testTimer.current); };
  }, [userId]);
  useEffect(() => {
    const node = terminal.current;
    const dialogue = conversation.current;
    if (!computer && node?.open) node.close();
    if (!chat && dialogue?.open) dialogue.close();
    if (computer && node && !node.open) node.showModal();
    if (chat && dialogue && !dialogue.open) dialogue.showModal();
  }, [computer, chat]);
  useEffect(() => {
    if (!computer) return;
    const heading = terminal.current?.querySelector<HTMLElement>('[data-work-panel="' + panel + '"] h3');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, [computer, panel]);

  function edit(value: string) {
    setFeedback(null);
    update({ ...latest.current, drafts: { ...latest.current.drafts, [caseId]: value.slice(0, WORK_CONFIG_LIMIT) } });
  }
  function openComputer(nextPanel: Panel = "ticket") {
    setPanel(nextPanel); setComputer(true); setChat(null);
    setBriefed(true); setResetConfirm(false);
  }
  function interact(target: OfficeTarget) {
    if (target === "computer") openComputer();
    else setChat(target === "lead" ? done ? "review" : "lead" : "support");
  }
  function chooseCase(id: WorkCaseId) {
    if (WORK_CASE_IDS.indexOf(id) > save.completed.length) return;
    cancelTest(); setComputer(false); setChat(null); setCaseId(id);
    setApplied(getWorkCase(id).initialConfig); setTest(null); setFeedback(null);
    setHint(0); setUndo(null); setResetConfirm(false); setBriefed(false); setPaused(false);
    update({ ...latest.current, current: id });
  }
  function apply() {
    const result = parseWorkConfig(draft);
    if (!result.ok) { setFeedback(result); return; }
    cancelTest(); setApplied(result.config); setTest(null);
    setFeedback({ ok: true, message: "Configuração aplicada em homologação. Agora confira o pedido de teste." });
    setPanel("test");
  }
  function runTest() {
    if (testing) return;
    setTesting(true); setTest(null); setFeedback(null);
    const config = { ...applied }, currentCase = caseId;
    update({ ...latest.current, attempts: { ...latest.current.attempts, [caseId]: latest.current.attempts[caseId] + 1 } });
    testTimer.current = setTimeout(() => {
      testTimer.current = null; setTest(testWorkCheckout(config, currentCase)); setTesting(false);
    }, 850);
  }
  function submit() {
    const result = completeWorkCase(latest.current, caseId, applied, test);
    setFeedback({ ok: result.ok, message: result.message });
    if (result.ok) { update(result.save); setComputer(false); setChat("review"); }
  }
  function insert(text: string) {
    const field = editor.current;
    const start = field?.selectionStart ?? draft.length, end = field?.selectionEnd ?? start;
    field?.focus({ preventScroll: true }); edit(draft.slice(0, start) + text + draft.slice(end));
    requestAnimationFrame(() => field?.setSelectionRange(start + text.length, start + text.length));
  }
  const practiced = save.attempts[caseId] > 0 || draft !== ticket.starterCode;
  const objective = done ? caseId === "checkout-staging" ? "Ticket entregue. Você pode revisar ou tentar a próxima situação." : "Ticket entregue. Leve a ideia ao laboratório ou revise o turno."
    : test?.ok ? "O pedido passou. Registre o teste na entrega para Nina."
      : briefed || practiced ? "Use o computador para investigar, alterar e testar o pedido."
        : "Converse com Nina para conhecer sua primeira tarefa.";
  const chatName = chat === "support" ? "Jo" : "Nina";

  return <section className={s.experience} data-work-simulation data-case={caseId} data-completed={save.completed.length}>
    <header className={s.header}>
      <div><Link href={back} className={s.back}><ArrowLeft size={15}/> Simulações de trabalho</Link><p className={s.eyebrow}>LOJA DO BAIRRO <span>DEVOPS</span></p><h1>Seu primeiro turno.</h1></div>
      <div className={s.tools}><span className={s.environment}><i/> Homologação</span><button onClick={() => setMuted(value => !value)} aria-label={muted ? "Ativar som do escritório" : "Silenciar escritório"}>{muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button><button onClick={() => setPaused(value => !value)} aria-label={paused ? "Continuar turno" : "Pausar turno"}>{paused ? <Play size={18}/> : <Pause size={18}/>}</button></div>
    </header>
    <div className={s.missionLine}><span className={s.missionNumber}>{caseId === "checkout-staging" ? "01" : "02"}</span><div><strong>{ticket.title}</strong><p>{objective}</p></div>{done && <span className={s.completedBadge}><CheckCheck size={16}/> Entregue</span>}</div>
    <OfficeScene onInteract={interact} activeTarget={computer ? "computer" : chat ? chat === "support" ? "support" : "lead" : null} briefed={briefed || practiced} repaired={!!test?.ok} paused={paused || computer || !!chat || !ready} muted={muted}/>
    {paused && <div className={s.pauseNotice} role="status">Turno pausado. Seu rascunho está guardado.<button onClick={() => setPaused(false)}><Play size={15}/> Continuar turno</button></div>}
    <footer className={s.sceneFooter}><span>Ambiente simulado · produção segue funcionando</span><details><summary>Como jogar</summary><p>Toque no chão para caminhar ou use as setas e W/A/S/D. Converse com a equipe e abra o computador pelos botões do escritório. No computador, edite, aplique e teste: cada ação tem um resultado próprio.</p><p>Rascunhos e conquistas ficam neste navegador, separados por conta. Reabrir o turno recupera o arquivo, mas a configuração precisa ser aplicada e testada novamente.</p></details></footer>
    <nav className={s.caseNav} aria-label="Situações do primeiro turno">{WORK_CASE_IDS.map((id, index) => <button key={id} aria-current={caseId === id ? "step" : undefined} disabled={!ready || index > save.completed.length} onClick={() => chooseCase(id)}><span>{save.completed.includes(id) ? <Check size={16}/> : "0" + (index + 1)}</span><div>{getWorkCase(id).title}<small>{index === 0 ? "Com apoio do Orbi" : "Uma nova situação, menos ajuda"}</small></div><ChevronRight size={16}/></button>)}</nav>
    {save.completed.length === WORK_CASE_IDS.length && <div className={s.transfer}><div><p className={s.eyebrow}>DO CENÁRIO PARA SUAS LINHAS</p><h2>Você investigou e verificou uma mudança.</h2><p>Continue praticando valores e variáveis no laboratório. Seu código salvo continua com você.</p></div><Link href={lab}>Praticar no laboratório <Code2 size={17}/></Link></div>}
    {storageError && <p className={s.storageWarning} role="alert">O navegador não conseguiu salvar. Seu trabalho continua nesta tela; copie o arquivo antes de sair.</p>}

    <dialog ref={terminal} className={s.computer} onCancel={event => { event.preventDefault(); cancelTest(); setComputer(false); }} aria-labelledby="work-computer-title" data-work-computer>
      <div className={s.computerChrome}><div className={s.windowDots} aria-hidden="true"><i/><i/><i/></div><span>LOJA DO BAIRRO / ESTAÇÃO DE TRABALHO</span><button aria-label="Voltar ao escritório" onClick={() => { cancelTest(); setComputer(false); }}><X size={20}/></button></div>
      <div className={s.computerHeading}><div><p>PRIMEIRO TURNO · TICKET {caseId === "checkout-staging" ? "014" : "015"}</p><h2 id="work-computer-title">{ticket.title}</h2></div><span className={s.environment}><i/> Homologação</span></div>
      <div className={s.computerBody}>
        <nav className={s.panelNav} aria-label="Áreas do computador">{panels.map(item => <button key={item.id} aria-pressed={panel === item.id} onClick={() => setPanel(item.id)}><item.icon size={18}/><span>{item.label}</span>{item.id === "report" && done && <Check size={13}/>}</button>)}</nav>
        <div className={s.workspace}>
          <div className={s.workspacePath}><span>{panels.find(item => item.id === panel)?.label}</span><span>checkout / staging</span></div>
          {panel === "ticket" && <article className={s.ticket} data-work-panel="ticket"><div className={s.sender}><span className={s.senderAvatar} data-person="support"/><div><strong>Jo · atendimento</strong><small>Pedido de teste · nova versão</small></div><span className={s.issueStatus}>{done ? "Concluído" : "Em investigação"}</span></div><h3>A loja abre. O pedido não termina.</h3><p>{ticket.brief}</p><div className={s.ticketObservation}><span>ESPERADO</span><p>Um pedido de teste registrado em homologação.</p><span>OBSERVADO</span><p>A página inicial abre, mas o checkout retorna falha de conexão.</p></div><p className={s.subtle}>Nina vai revisar a correção e o teste. A publicação em produção continua fora desta tarefa.</p><button className={s.primary} onClick={() => setPanel("services")}>Ver como os serviços se conectam <ArrowRight size={16}/></button></article>}
          {panel === "services" && <article data-work-panel="services"><p className={s.panelEyebrow}>MAPA DE HOMOLOGAÇÃO</p><h3>O pedido passa por aqui.</h3><p className={s.panelIntro}>A home e o serviço de pedidos têm caminhos diferentes. Confira onde cada um atende.</p><div className={s.serviceMap}><div className={s.serviceNode}><Monitor size={32}/><strong>Loja</strong><code>GET / → 200</code><small>A página inicial abre.</small></div><span className={s.connector}><ArrowRight size={22}/></span><div className={s.serviceNode}><Code2 size={32}/><strong>Checkout</strong><code>{applied.ordersBaseUrl}</code><small>Endereço aplicado no arquivo.</small></div><span className={s.connector}><ArrowRight size={22}/></span><div className={s.serviceNode} data-service="orders"><Package size={32}/><strong>Pedidos</strong><code>orders:{ticket.servicePort}</code><small>Porta desta instalação.</small></div></div><div className={s.observation}><Network size={20}/><p>O checkout precisa procurar o serviço na porta em que ele está atendendo. Uma home funcionando não confirma o fluxo do pedido.</p></div><button className={s.secondary} onClick={() => setPanel("logs")}>Conferir o que o log conta <ArrowRight size={16}/></button></article>}
          {panel === "logs" && <article data-work-panel="logs"><p className={s.panelEyebrow}>SAÍDA DOS SERVIÇOS</p><h3>Uma pista na conexão.</h3><p className={s.panelIntro}>O registro mostra o endereço usado pela configuração aplicada.</p><div className={s.logWindow}><div><Terminal size={15}/> checkout + pedidos <span>homologação</span></div><pre aria-label="Log da conexão">{"[loja] GET / 200\n[checkout] POST /checkout\n[checkout] connect " + applied.ordersBaseUrl + "\n" + (testWorkCheckout(applied, caseId).ok ? "[checkout] conexão disponível\n" : "[checkout] ECONNREFUSED · conexão recusada\n") + "[orders] serviço pronto em orders:" + ticket.servicePort + "\n[produção] sem alterações"}</pre></div><div className={s.observation}><Lightbulb size={20}/><p><strong>ECONNREFUSED</strong> indica que a conexão foi recusada. Compare o endereço procurado pelo checkout com a porta de pedidos.</p></div><button className={s.primary} onClick={() => setPanel("config")}>Abrir checkout.config.json <FileCode2 size={16}/></button></article>}
          {panel === "config" && <article data-work-panel="config"><div className={s.fileTitle}><FileCode2 size={18}/><h3>checkout.config.json</h3><span>JSON</span></div><p className={s.panelIntro}>Altere o endereço que o checkout procura. Preserve o ambiente <code>staging</code>.</p><label className={s.editorLabel} htmlFor="work-config">Seu arquivo <span>{draftChanged ? "Rascunho · ainda não aplicado" : "Igual à configuração aplicada"}</span></label><textarea id="work-config" ref={editor} className={s.editor} value={draft} maxLength={WORK_CONFIG_LIMIT} onChange={event => edit(event.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby="work-draft-status" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); if (!testing) apply(); } }}/><div className={s.symbols} aria-label="Atalhos para escrever JSON">{['"', ':', ',', '{', '}', '\n'].map(token => <button key={token} type="button" onClick={() => insert(token)} aria-label={token === "\n" ? "Inserir nova linha" : "Inserir " + token}>{token === "\n" ? "↵" : token}</button>)}</div><p className={s.draftNote} id="work-draft-status">{storageError ? "Rascunho apenas nesta tela. Copie antes de sair." : "Rascunho salvo neste navegador. Digitar não altera a configuração aplicada."}</p><div className={s.fileActions}><button className={s.primary} onClick={apply} disabled={testing}><Check size={17}/> Aplicar configuração</button><button className={s.secondary} onClick={() => setHint(value => Math.min(value + 1, ticket.hints.length))} disabled={hint >= ticket.hints.length}><Lightbulb size={17}/> Pedir pista</button></div>{hint > 0 && <aside className={s.hints}><strong>Orbi explica</strong>{ticket.hints.slice(0, hint).map(item => <p key={item}>{item}</p>)}</aside>}<div className={s.resetRow}>{!resetConfirm ? <button onClick={() => setResetConfirm(true)}><RotateCcw size={13}/> Recuperar arquivo inicial</button> : <><span>Voltar ao arquivo inicial?</span><button onClick={() => { setUndo(draft); edit(ticket.starterCode); setResetConfirm(false); }}>Sim, recuperar</button><button onClick={() => setResetConfirm(false)}>Cancelar</button></>}{undo !== null && <button onClick={() => { edit(undo); setUndo(null); }}>Desfazer recuperação</button>}</div></article>}
          {panel === "test" && <article data-work-panel="test"><p className={s.panelEyebrow}>VERIFICAÇÃO DO FLUXO</p><h3>Abra a loja. Faça um pedido.</h3><p className={s.panelIntro}>Este teste verifica a configuração aplicada: <code>{applied.ordersBaseUrl}</code>.</p>{draftChanged && <p className={s.draftWarning}>Há um rascunho diferente no arquivo. O teste usa a última configuração aplicada.</p>}<div className={s.testScene} data-passed={test?.ok}><div><Monitor size={27}/><strong>Abrir a loja</strong><span>{testing ? "Verificando…" : test ? "200 · abriu" : "Aguardando teste"}</span></div><ArrowRight size={23}/><div><Package size={27}/><strong>Concluir pedido</strong><span>{testing ? "Conectando…" : test ? test.ok ? "201 · concluído" : "502 · conexão recusada" : "Aguardando teste"}</span></div></div><button className={s.primary} onClick={runTest} disabled={testing} data-work-run-test><Play size={17}/>{testing ? "Verificando pedido…" : "Verificar pedido"}</button>{test && <div className={test.ok ? s.testPass : s.testFail} role="status" data-work-test-result={test.ok ? "passed" : "failed"}><strong>{test.ok ? "O pedido passou pelo fluxo." : "A home abriu. O pedido ainda falhou."}</strong><p>{test.ok ? "Agora você tem um teste para anexar à entrega." : "Volte ao mapa e ao log. O endereço aplicado precisa apontar para o serviço de pedidos desta instalação."}</p><details><summary>Ver resultado do teste</summary><pre>{test.lines.join("\n")}</pre></details></div>}{test && <button className={s.secondary} onClick={() => setPanel(test.ok ? "report" : "services")}>{test.ok ? "Preparar entrega para Nina" : "Voltar à investigação"}<ArrowRight size={16}/></button>}</article>}
          {panel === "report" && <article data-work-panel="report"><p className={s.panelEyebrow}>REVISÃO COM A EQUIPE</p><h3>Uma mudança com evidência.</h3><p className={s.panelIntro}>Entregue o que foi aplicado e verificado em homologação. Nina revisa esse resultado.</p><div className={s.diff}><div><GitCompareArrows size={17}/> Configuração deste ticket</div><code data-diff="removed">− {ticket.initialConfig.ordersBaseUrl}</code><code data-diff="added">+ {applied.ordersBaseUrl}</code></div><div className={s.evidence}><span><Check size={17}/> Ambiente: homologação</span><span data-valid={!!test?.ok}>{test?.ok ? <Check size={17}/> : <Play size={17}/>} Pedido: {test?.ok ? "201 · teste concluído" : "aguardando uma verificação válida"}</span><span>Produção: sem alterações</span></div><button className={s.primary} onClick={submit} disabled={!test?.ok || testing} data-work-submit><Send size={17}/> Anexar teste e enviar para Nina</button>{!test?.ok && <button className={s.secondary} onClick={() => setPanel("test")}>Ir para o teste <ArrowRight size={16}/></button>}</article>}
          {feedback && <p className={feedback.ok ? s.feedbackOk : s.feedbackError} role="status" data-work-feedback>{feedback.message}</p>}
        </div>
      </div>
      <footer className={s.computerFooter}><span><i/> Computador do cenário · simulação local</span><button onClick={() => { cancelTest(); setComputer(false); }}>Voltar ao escritório <ArrowRight size={14}/></button></footer>
    </dialog>

    <dialog ref={conversation} className={s.conversation} onCancel={event => { event.preventDefault(); setChat(null); }} aria-labelledby="work-person-title">
      <button className={s.closeChat} aria-label="Fechar conversa" onClick={() => setChat(null)}><X size={19}/></button><span className={s.portrait} data-person={chat === "support" ? "support" : "lead"} aria-hidden="true"/><div className={s.dialogueBody}><p className={s.eyebrow}>{chat === "support" ? "ATENDIMENTO" : "RESPONSÁVEL PELO TIME"}</p><h2 id="work-person-title">{chatName}</h2>{chat === "review" ? <><p>Revisei sua entrega. O pedido de teste funciona em homologação, e temos a verificação registrada.</p><p className={s.subtle}>{caseId === "checkout-staging" ? "Agora quero ver você investigar outra instalação. A porta pode mudar; confira as novas evidências." : "Você encontrou a relação entre o endereço e o serviço. No próximo turno, vamos cuidar da entrega dessa mudança."}</p><div className={s.chatActions}>{caseId === "checkout-staging" ? <button className={s.primary} onClick={() => chooseCase("checkout-transfer")}>Investigar a nova situação <ArrowRight size={16}/></button> : <Link className={s.primary} href={lab}>Praticar no laboratório <Code2 size={17}/></Link>}<button className={s.secondary} onClick={() => setChat(null)}>Voltar ao escritório</button></div></> : chat === "support" ? <><p>{test?.ok ? "O pedido de teste terminou! Você pode anexar esse resultado ao ticket para a Nina revisar." : "Estou testando a versão em homologação. A loja abre, mas o pedido não termina. Deixei o relato no computador."}</p><button className={s.primary} onClick={() => openComputer(test?.ok ? "report" : "ticket")}>{test?.ok ? "Preparar a entrega" : "Ler o relato"}<ArrowRight size={16}/></button></> : <><p>{caseId === "checkout-staging" ? "Bem-vindo ao time. Temos um pedido de teste parado em homologação. Pode descobrir onde a conexão se perdeu?" : "Nesta outra instalação, a configuração anterior deixou de funcionar. Descubra o endereço certo pelas evidências."}</p><p className={s.subtle}>Você vai trabalhar só em homologação. Produção está funcionando.</p><button className={s.primary} onClick={() => { setBriefed(true); setChat(null); }}>Vou investigar <ArrowRight size={16}/></button></>}</div>
    </dialog>
  </section>;
}
