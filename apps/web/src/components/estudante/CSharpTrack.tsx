"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, Map, Monitor, Smartphone, X } from "lucide-react";
import { csharpJobSources, csharpMarketCheckedAt, csharpProgressKey, newCSharpProgress, readCSharpProgress, type CSharpTrackProgress, type TrackView } from "@/lib/csharpTrack";
import CSharpVariables from "./CSharpVariables";
import CSharpCareerMap from "./CSharpCareerMap";
import CSharpMethods from "./CSharpMethods";
import CSharpObjects from "./CSharpObjects";
import { laboratoryCovers } from "./laboratoryCovers";
import { readModuleKind, type CSharpModuleKind } from "@/lib/csharpModules";
import projetoCSharp from "../../../public/images/academy/projeto-csharp-v1.webp";
import s from "./CSharpTrack.module.css";

const views: { id: TrackView; title: string }[] = [{ id: "welcome", title: "Sua jornada" }, { id: "market", title: "A profissão" }, { id: "map", title: "Seu caminho" }, { id: "pilot", title: "Codar" }];
const availableUnits = [
  { id: "variables", title: "Variáveis", description: "Texto, números e cálculos", image: laboratoryCovers.fundamentos.image },
  { id: "conditions", title: "Condições", description: "Decisões com if e else", image: laboratoryCovers.decisoes.image },
  { id: "loops", title: "Laços", description: "Repetições e filas de serviços", image: laboratoryCovers.repeticao.image },
  { id: "methods", title: "Métodos", description: "Regras reutilizáveis · SDK .NET 10", image: projetoCSharp },
  { id: "objects", title: "Objetos e listas", description: "Fichas e referências · SDK .NET 10", image: projetoCSharp },
] as const;
export default function CSharpTrack({ userId }: { userId: string | number | null }) {
  const [progress, setProgress] = useState<CSharpTrackProgress>(newCSharpProgress);
  const [ready, setReady] = useState(false);
  const [moduleKind, setModuleKind] = useState<CSharpModuleKind>("variables");
  const [storageError, setStorageError] = useState(false);
  const [academyPreview, setAcademyPreview] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const routeDialog = useRef<HTMLDialogElement>(null);
  const routeTrigger = useRef<HTMLButtonElement>(null);
  const focusPage = useRef(false);
  const latest = useRef(progress);
  const key = userId !== null ? csharpProgressKey(userId) : null;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      routeDialog.current?.close(); setRouteOpen(false);
      const params = new URLSearchParams(window.location.search);
      const requestedView = params.get("view");
      const validView = requestedView === "methods" || requestedView === "objects" ? requestedView : views.find(view => view.id === requestedView)?.id;
      setAcademyPreview(params.get("academy") === "1");
      const requested = params.get("module");
      const validModule = requested === "variables" || requested === "conditions" || requested === "loops" ? requested : null;
      let saved = newCSharpProgress();
      let savedModule: CSharpModuleKind = "variables";
      try { saved = readCSharpProgress(key ? localStorage.getItem(key) : null); savedModule = readModuleKind(key ? localStorage.getItem(`${key}-module`) : null); }
      catch { setStorageError(true); }
      const restored = validView === "methods" || validView === "objects" ? { ...saved, view: validView, projectUnit: validView } : validModule || validView === "pilot" ? { ...saved, view: "pilot" as const, projectUnit: undefined } : validView ? { ...saved, view: validView } : saved;
      latest.current = restored; setProgress(restored);
      setModuleKind(validModule ?? savedModule);
      setReady(true);
    });
    return () => { active = false; };
  }, [key]);
  useEffect(() => {
    if (!ready || !key) return;
    function save() { try { localStorage.setItem(key!, JSON.stringify(latest.current)); } catch { setStorageError(true); } }
    const timer = window.setTimeout(save, 200);
    window.addEventListener("pagehide", save);
    return () => { clearTimeout(timer); save(); window.removeEventListener("pagehide", save); };
  }, [key, progress, ready]);
  useLayoutEffect(() => {
    if (!focusPage.current) return;
    focusPage.current = false;
    heading.current?.focus({ preventScroll: true });
  }, [progress.view]);
  function update(change: Partial<CSharpTrackProgress>) { const next = { ...latest.current, ...change }; latest.current = next; setProgress(next); }
  function navigate(view: TrackView) {
    const needsHeading = view === "welcome" || view === "market" || view === "map";
    focusPage.current = needsHeading && latest.current.view !== view;
    if (needsHeading && latest.current.view === view) heading.current?.focus({ preventScroll: true });
    update({ view, ...(view === "methods" || view === "objects" ? { projectUnit: view } : view === "pilot" ? { projectUnit: undefined } : {}) });
    const params = new URLSearchParams(window.location.search);
    params.set("view", view);
    if (view !== "pilot") params.delete("module");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openModule(module: CSharpModuleKind) {
    setModuleKind(module);
    update({ projectUnit: undefined });
    try { if (key) localStorage.setItem(`${key}-module`, module); } catch { setStorageError(true); }
    const params = new URLSearchParams(window.location.search);
    params.set("module", module);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    navigate("pilot");
  }
  function closeRoute() {
    routeDialog.current?.close();
    setRouteOpen(false);
    routeTrigger.current?.focus({ preventScroll: true });
  }
  function openRoute() {
    if (routeDialog.current?.open) return;
    routeDialog.current?.showModal();
    setRouteOpen(true);
  }
  function chooseRoute(view: "welcome" | "market" | "map") {
    closeRoute(); navigate(view);
  }
  if (!ready) return <p role="status">Preparando sua jornada C#…</p>;
  const learning = progress.view === "pilot" || progress.view === "methods" || progress.view === "objects";
  const currentUnit = progress.view === "methods" || progress.view === "objects" ? progress.view : moduleKind;
  const currentLabel = availableUnits.find(unit => unit.id === currentUnit)!.title;

  return <div className={`${s.track}${learning ? ` ${s.learning}` : ""}`} data-csharp-track data-view={progress.view}>
    {learning ? <nav className={s.lessonBar} aria-label="Navegação da prática C#">
      <button type="button" onClick={() => navigate("welcome")}><ArrowLeft size={15}/>Voltar C#</button>
      <span className={s.lessonName} title={currentLabel}>{currentLabel}</span>
      <button ref={routeTrigger} type="button" aria-haspopup="dialog" aria-controls="csharp-route-dialog" aria-expanded={routeOpen} onClick={openRoute}><Map size={16}/>Roteiro da trilha</button>
    </nav> : <>
      <header className={s.masthead}><Link href={academyPreview ? "/dev/academy-preview?view=tracks" : "/estudante/trilhas"}><ArrowLeft size={16}/>Minhas trilhas</Link><span>ORBITAMOS ACADEMY <i>/</i> C# & .NET</span><span className={s.edition}>EDIÇÃO PILOTO</span></header>
      <nav className={s.navigation} aria-label="Etapas da jornada C#">{views.map((view, index) => <button key={view.id} aria-current={progress.view === view.id ? "page" : undefined} onClick={() => navigate(view.id)}><small>0{index + 1}</small>{view.title}</button>)}</nav>
    </>}
    {storageError && <p className={s.notice} role="alert">O navegador não permitiu salvar. Você pode testar, mas copie seu código antes de sair.</p>}

    {progress.view === "welcome" && <>
      <section className={s.hero}>
        <div className={s.heroCopy}><span className={s.kicker}>APRENDA C# PROGRAMANDO</span><h1 ref={heading} tabIndex={-1}>Aprenda <em>C#</em> na prática.</h1><p>Escreva suas primeiras linhas e veja o resultado. A orientação fica com você, no celular ou no computador.</p><div className={s.actions}><button className={s.primary} onClick={() => openModule("variables")}>Começar a codar · variáveis<ArrowRight size={18}/></button><button className={s.textButton} onClick={() => navigate("market")}>Antes, conhecer a profissão<ArrowUpRight size={16}/></button></div><div className={s.heroFacts}><span><Smartphone size={16}/>No seu ritmo</span><span><Code2 size={16}/>Escreva e teste</span></div></div>
        <div className={s.heroVisual}><Image src={projetoCSharp} alt="" fill sizes="(max-width: 767px) calc(100vw - 56px), 45vw" placeholder="blur" loading="eager" className={s.heroPhoto}/><span className={s.photoCaption}><strong>OrbiServiços</strong><small>Seu projeto, uma descoberta por vez.</small></span></div>
      </section>
      <details className={s.welcomeDetails}><summary>O que vamos construir?<ArrowRight size={16}/></summary><div><p>O OrbiServiços é um projeto fictício para organizar clientes e serviços. Você começa com um programa pequeno e aprende a fazer, testar e explicar cada parte.</p><p>Variáveis, condições e laços rodam no navegador. A unidade de métodos começa seu projeto .NET no computador. Objetos e listas começam na unidade seguinte. APIs e persistência ainda estão em preparação. A trilha não promete vaga ou salário.</p></div></details>
      <details className={s.welcomeDetails}><summary>Ajustar para meu jeito de estudar<ArrowRight size={16}/></summary><section className={s.preferences} aria-label="Seu jeito de estudar"><div><span className={s.kicker}>A JORNADA CABE NA SUA ROTINA</span><h2>Como você vai começar?</h2><p>Você pode mudar isso quando quiser.</p></div><div><fieldset><legend>Seu ambiente agora</legend><button aria-pressed={progress.device === "phone"} onClick={() => update({ device: "phone" })}><Smartphone size={18}/>Pelo celular</button><button aria-pressed={progress.device === "computer"} onClick={() => update({ device: "computer" })}><Monitor size={18}/>No computador</button></fieldset><fieldset><legend>Seu ritmo preferido</legend><button aria-pressed={progress.pace === "short"} onClick={() => update({ pace: "short" })}>Uma pausa curta</button><button aria-pressed={progress.pace === "long"} onClick={() => update({ pace: "long" })}>Um bloco de estudo</button></fieldset><p className={s.plan}>{progress.pace === "short" ? "Hoje: leia a missão e escreva as primeiras linhas. Seu rascunho permite continuar depois." : "Hoje: faça a missão guiada, tente a variação e termine corrigindo um erro."} {progress.device === "phone" ? "Use as teclas de símbolos junto do editor." : "Use o editor e teste também a execução com o teclado."}</p></div></section></details>
    </>}

    {progress.view === "market" && <>
      <div className={s.pageHeading}><span className={s.kicker}>ENTENDA O DESTINO</span><h1 ref={heading} tabIndex={-1}>O trabalho é resolver.<br/>{" "}<em>C# é uma das ferramentas.</em></h1><p>Uma API recebe um pedido. O banco guarda os dados. Uma regra evita um erro. O backend conecta essas partes — e alguém precisa construir e cuidar delas.</p></div>
      <section className={s.workday}><span className={s.kicker}>UMA TAREFA DE UM TIME DE SOFTWARE</span><h2>“Não podemos cadastrar<br/>{" "}o mesmo serviço duas vezes.”</h2><ol><li><strong>Entenda</strong><span>Pergunte quando dois serviços são considerados iguais.</span></li><li><strong>Construa</strong><span>Implemente a regra e um teste para o caso repetido.</span></li><li><strong>Entregue</strong><span>Abra um PR, explique a mudança e responda à revisão.</span></li></ol></section>
      <section className={s.market}><div><span className={s.kicker}>MERCADO COM CONTEXTO</span><h2>Oportunidades reais.<br/>{" "}Expectativas honestas.</h2><p>Leitura de anúncios consultados em {csharpMarketCheckedAt}. É uma amostra exploratória, não um retrato estatístico de todas as vagas. Os anúncios podem encerrar.</p></div><div className={s.salary}><span>GUIA ROBERT HALF 2026 / BACKEND JÚNIOR</span><div><strong>R$ 6.050</strong><span>25º percentil</span><strong>R$ 6.850</strong><span>50º percentil</span><strong>R$ 8.750</strong><span>75º percentil</span></div><p>Referência nacional de recrutamento para backend em geral, não apenas C#. Não é piso, média de primeira contratação ou garantia de renda. Ofertas variam por experiência, local e regime, inclusive abaixo desses valores.</p><a href="https://www.roberthalf.com/br/pt/vagas-detalhes/desenvolvedora-back-end-junior" target="_blank" rel="noreferrer">Consultar fonte e metodologia<ArrowUpRight size={15}/></a></div></section>
      <div className={s.jobs}>{csharpJobSources.map(source => <article key={source.url}><span>{source.company} / {source.kind}</span><h3>{source.title}</h3><p>{source.summary}</p><a href={source.url} target="_blank" rel="noreferrer">Ler anúncio original<ArrowUpRight size={15}/></a></article>)}</div>
      <div className={s.boundary}><h2>Você não precisa aprender tudo ao mesmo tempo.</h2><p>Começamos por C#, lógica e depuração. APIs, SQL, Git e testes entram conforme o projeto cresce. Angular é um caminho full stack posterior; Kubernetes e microsserviços não são o ponto de partida.</p><p>Base planejada para os projetos completos: <a href="https://dotnet.microsoft.com/en-us/platform/support/policy" target="_blank" rel="noreferrer">.NET 10 LTS</a>. Formação e disponibilidade também podem ser filtros de vagas; concluir uma trilha não elimina esses critérios.</p><button className={s.primary} onClick={() => navigate("map")}>Ver meu caminho<ArrowRight size={17}/></button></div>
    </>}

    {progress.view === "map" && <CSharpCareerMap currentModule={moduleKind} currentUnit={progress.projectUnit} onOpenModule={openModule} onOpenMethods={() => navigate("methods")} onOpenObjects={() => navigate("objects")} headingRef={heading}/>}

    {progress.view === "pilot" && <CSharpVariables key={`${userId}-${moduleKind}`} userId={userId} moduleKind={moduleKind} onModuleChange={openModule} onMethods={() => navigate("methods")} onFullMap={() => navigate("map")}/>}
    {progress.view === "methods" && <CSharpMethods key={key} userId={userId} onFullMap={() => navigate("map")} onNextUnit={() => navigate("objects")}/>}
    {progress.view === "objects" && <CSharpObjects key={key} userId={userId} onFullMap={() => navigate("map")}/>}
    {!learning && <footer className={s.footer}><span>ORBITAMOS / UMA ETAPA DE CADA VEZ</span><p>{key ? "Preferências, código e progresso deste piloto ficam neste navegador, separados do histórico das aulas. Não sincronizam entre aparelhos." : "Entre na sua conta para guardar seu progresso neste navegador."}</p></footer>}
    <dialog ref={routeDialog} id="csharp-route-dialog" className={s.routeDialog} aria-labelledby="csharp-route-title" aria-describedby="csharp-route-description" onCancel={event => { event.preventDefault(); closeRoute(); }} onClose={() => setRouteOpen(false)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeRoute();
    }}>
      <div className={s.routeHeading}><div><span>C# & .NET</span><h2 id="csharp-route-title">Roteiro da trilha</h2></div><button type="button" aria-label="Fechar roteiro da trilha" onClick={closeRoute}><X size={20}/></button></div>
      <p id="csharp-route-description">Escolha onde continuar. Seus rascunhos e avanços ficam guardados.</p>
      <ol className={s.routeUnits}>{availableUnits.map(unit => <li key={unit.id}><button type="button" aria-current={learning && unit.id === currentUnit ? "page" : undefined} onClick={() => {
        closeRoute();
        if (unit.id === "methods" || unit.id === "objects") navigate(unit.id); else openModule(unit.id);
      }}><span className={s.routeThumb}><Image src={unit.image} alt="" fill sizes="76px"/></span><span className={s.routeCopy}><strong>{unit.title}</strong><small>{unit.description}</small></span><ArrowRight size={17}/></button></li>)}</ol>
      <nav className={s.routeLinks} aria-label="Conhecer a trilha"><button type="button" onClick={() => chooseRoute("map")}>Mapa completo</button><button type="button" onClick={() => chooseRoute("market")}>A profissão</button><button type="button" onClick={() => chooseRoute("welcome")}>Início da trilha</button></nav>
      <p className={s.routeLimit}>As práticas do navegador usam um subconjunto de C#. Métodos, objetos e listas executam no computador com SDK .NET 10. Dados, APIs e as próximas entregas continuam em preparação.</p>
    </dialog>
  </div>;
}
