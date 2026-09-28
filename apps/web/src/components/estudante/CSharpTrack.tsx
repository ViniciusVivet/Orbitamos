"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, GitPullRequest, Monitor, Smartphone, Terminal } from "lucide-react";
import { csharpJobSources, csharpMarketCheckedAt, csharpProgressKey, csharpStages, newCSharpProgress, readCSharpProgress, type CSharpTrackProgress, type TrackView } from "@/lib/csharpTrack";
import CSharpVariables from "./CSharpVariables";
import { csharpModules, readModuleKind, type CSharpModuleKind } from "@/lib/csharpModules";
import { getLaboratoryCover } from "./laboratoryCovers";
import s from "./CSharpTrack.module.css";

const views: { id: TrackView; title: string }[] = [{ id: "welcome", title: "Sua jornada" }, { id: "market", title: "A profissão" }, { id: "map", title: "Seu caminho" }, { id: "pilot", title: "Codar" }];
export default function CSharpTrack({ userId }: { userId: string | number | null }) {
  const [progress, setProgress] = useState<CSharpTrackProgress>(newCSharpProgress);
  const [ready, setReady] = useState(false);
  const [moduleKind, setModuleKind] = useState<CSharpModuleKind>("variables");
  const [storageError, setStorageError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const latest = useRef(progress);
  const key = userId !== null ? csharpProgressKey(userId) : null;
  const cover = getLaboratoryCover("Fundamentos");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { const restored = readCSharpProgress(key ? localStorage.getItem(key) : null); latest.current = restored; setProgress(restored); setModuleKind(readModuleKind(key ? localStorage.getItem(`${key}-module`) : null)); }
      catch { setStorageError(true); }
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
  function update(change: Partial<CSharpTrackProgress>) { const next = { ...latest.current, ...change }; latest.current = next; setProgress(next); }
  function navigate(view: TrackView) {
    update({ view });
    requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); });
  }
  function openModule(module: CSharpModuleKind) {
    setModuleKind(module);
    try { if (key) localStorage.setItem(`${key}-module`, module); } catch { setStorageError(true); }
    navigate("pilot");
  }
  if (!ready) return <p role="status">Preparando sua jornada C#…</p>;

  return <div className={s.track} data-csharp-track>
    <header className={s.masthead}><Link href="/estudante/orbita"><ArrowLeft size={16}/>Minha jornada</Link><span>ORBITAMOS ACADEMY <i>/</i> C# & .NET</span><span className={s.edition}>EDIÇÃO PILOTO</span></header>
    <nav className={s.navigation} aria-label="Etapas da jornada C#">{views.map((view, index) => <button key={view.id} aria-current={progress.view === view.id ? "page" : undefined} onClick={() => navigate(view.id)}><small>0{index + 1}</small>{view.title}</button>)}</nav>
    {storageError && <p className={s.notice} role="alert">O navegador não permitiu salvar. Você pode testar, mas copie seu código antes de sair.</p>}

    {progress.view === "welcome" && <>
      <section className={s.hero}>
        <div className={s.heroCopy}><span className={s.kicker}>UM NOVO CAMINHO. UMA LINHA POR VEZ.</span><h1 ref={heading} tabIndex={-1}>Seu próximo<br/>capítulo pode<br/>ser em <em>C#.</em></h1><p>Aprenda C# escrevendo: comece agora com 7 práticas de código e 3 questões rápidas sobre variáveis. O mapa mostra onde você está e o que vem depois — inclusive pelo celular.</p><div className={s.actions}><button className={s.primary} onClick={() => openModule("variables")}>Começar a codar · variáveis<ArrowRight size={18}/></button><button className={s.textButton} onClick={() => navigate("market")}>Antes, conhecer a profissão<ArrowUpRight size={16}/></button></div><div className={s.heroFacts}><span><Smartphone size={16}/>Comece no celular</span><span><Code2 size={16}/>Código de verdade</span><span><GitPullRequest size={16}/>Aprenda a entregar</span></div></div>
        <div className={s.heroVisual}><Image src={cover.image} alt="" fill sizes="(max-width: 767px) 100vw, 45vw" placeholder="blur" className={s.heroPhoto}/><div className={s.projectSheet}><div className={s.sheetTop}><span>SEU PROJETO DE JORNADA</span><span>01 / 08</span></div><h2>OrbiServiços<span>Do primeiro comando<br/>a um sistema de negócio.</span></h2><div className={s.sheetCode}><span>Program.cs</span><pre><b>int</b> servicosPendentes = <i>3</i>;{"\n"}Console.WriteLine(servicosPendentes);</pre><p><Terminal size={14}/>3</p></div><div className={s.sheetFoot}><span>AGORA<br/><strong>Primeiras linhas</strong></span><ArrowRight size={18}/><span>NO CAMINHO<br/><strong>API, dados e testes</strong></span></div></div><span className={s.photoCaption}>Uma ideia simples. Espaço para crescer.</span></div>
      </section>
      <section className={s.letter}><span className={s.kicker}>ANTES DE COMEÇAR</span><h2>Você não precisa chegar<br/>sabendo todos os nomes.</h2><div><p>Você vai construir o OrbiServiços: um projeto fictício para organizar clientes, serviços e entregas. Primeiro, um programa pequeno. Depois, regras, dados e uma API.</p><p>O objetivo é conseguir fazer, testar e explicar — não decorar uma receita. Não existe promessa de vaga ou salário. Existe um caminho de prática, com o próximo passo bem explicado.</p><p className={s.small}>Nesta edição, a introdução, variáveis, condições e laços estão disponíveis. Métodos e as próximas etapas estão planejados. O conteúdo inicial já pode ser estudado em texto; não depende de um vídeo.</p></div></section>
      <section className={s.preferences} aria-label="Seu jeito de estudar"><div><span className={s.kicker}>A JORNADA CABE NA SUA ROTINA</span><h2>Como você vai começar?</h2><p>Sem cadastro extra. Você pode mudar isso quando quiser.</p></div><div><fieldset><legend>Seu ambiente agora</legend><button aria-pressed={progress.device === "phone"} onClick={() => update({ device: "phone" })}><Smartphone size={18}/>Pelo celular</button><button aria-pressed={progress.device === "computer"} onClick={() => update({ device: "computer" })}><Monitor size={18}/>No computador</button></fieldset><fieldset><legend>Seu ritmo preferido</legend><button aria-pressed={progress.pace === "short"} onClick={() => update({ pace: "short" })}>Uma pausa curta</button><button aria-pressed={progress.pace === "long"} onClick={() => update({ pace: "long" })}>Um bloco de estudo</button></fieldset><p className={s.plan}>{progress.pace === "short" ? "Hoje: leia a missão e escreva as primeiras linhas. Seu rascunho permite continuar depois." : "Hoje: faça a missão guiada, tente a variação e termine corrigindo um erro."} {progress.device === "phone" ? "Use as teclas de símbolos junto do editor." : "Use o editor e teste também a execução com o teclado."}</p></div></section>
    </>}

    {progress.view === "market" && <>
      <div className={s.pageHeading}><span className={s.kicker}>ENTENDA O DESTINO</span><h1 ref={heading} tabIndex={-1}>O trabalho é resolver.<br/><em>C# é uma das ferramentas.</em></h1><p>Uma API recebe um pedido. O banco guarda os dados. Uma regra evita um erro. O backend conecta essas partes — e alguém precisa construir e cuidar delas.</p></div>
      <section className={s.workday}><span className={s.kicker}>UMA TAREFA DE UM TIME DE SOFTWARE</span><h2>“Não podemos cadastrar<br/>o mesmo serviço duas vezes.”</h2><ol><li><strong>Entenda</strong><span>Pergunte quando dois serviços são considerados iguais.</span></li><li><strong>Construa</strong><span>Implemente a regra e um teste para o caso repetido.</span></li><li><strong>Entregue</strong><span>Abra um PR, explique a mudança e responda à revisão.</span></li></ol></section>
      <section className={s.market}><div><span className={s.kicker}>MERCADO COM CONTEXTO</span><h2>Oportunidades reais.<br/>Expectativas honestas.</h2><p>Leitura de anúncios consultados em {csharpMarketCheckedAt}. É uma amostra exploratória, não um retrato estatístico de todas as vagas. Os anúncios podem encerrar.</p></div><div className={s.salary}><span>GUIA ROBERT HALF 2026 / BACKEND JÚNIOR</span><div><strong>R$ 6.050</strong><span>25º percentil</span><strong>R$ 6.850</strong><span>50º percentil</span><strong>R$ 8.750</strong><span>75º percentil</span></div><p>Referência nacional de recrutamento para backend em geral, não apenas C#. Não é piso, média de primeira contratação ou garantia de renda. Ofertas variam por experiência, local e regime, inclusive abaixo desses valores.</p><a href="https://www.roberthalf.com/br/pt/vagas-detalhes/desenvolvedora-back-end-junior" target="_blank" rel="noreferrer">Consultar fonte e metodologia<ArrowUpRight size={15}/></a></div></section>
      <div className={s.jobs}>{csharpJobSources.map(source => <article key={source.company}><span>{source.company} / {source.kind}</span><h3>{source.title}</h3><p>{source.summary}</p><a href={source.url} target="_blank" rel="noreferrer">Ler anúncio original<ArrowUpRight size={15}/></a></article>)}</div>
      <div className={s.boundary}><h2>Você não precisa aprender tudo ao mesmo tempo.</h2><p>Começamos por C#, lógica e depuração. APIs, SQL, Git e testes entram conforme o projeto cresce. Angular é um caminho full stack posterior; Kubernetes e microsserviços não são o ponto de partida.</p><p>Base planejada para os projetos completos: <a href="https://dotnet.microsoft.com/en-us/platform/support/policy" target="_blank" rel="noreferrer">.NET 10 LTS</a>. Formação e disponibilidade também podem ser filtros de vagas; concluir uma trilha não elimina esses critérios.</p><button className={s.primary} onClick={() => navigate("map")}>Ver meu caminho<ArrowRight size={17}/></button></div>
    </>}

    {progress.view === "map" && <>
      <div className={s.pageHeading}><span className={s.kicker}>UM PROJETO. OITO ESTAÇÕES.</span><h1 ref={heading} tabIndex={-1}>Saiba onde está.<br/><em>Enxergue o próximo passo.</em></h1><p>Variáveis, condições e laços estão disponíveis: 21 práticas de código e 9 questões. Condições e laços são duas partes da etapa 02. Métodos e as próximas estações ainda estão em preparação.</p></div>
      <div className={s.roadmap}>{csharpStages.map((stage, index) => <article key={stage.id} data-available={stage.available}><span className={s.stationNumber}>{String(index + 1).padStart(2, "0")}</span><div><div className={s.stageStatus}>{stage.available ? stage.id === "start" ? "VARIÁVEIS DISPONÍVEL" : "CONDIÇÕES E LAÇOS DISPONÍVEIS" : "PLANEJADO"}</div><h2>{stage.title}</h2><p>{stage.skill}</p><details><summary>O que você vai entregar</summary><p>{stage.delivery}</p><small>{stage.tools}</small></details></div>{stage.available ? <div className={s.stageActions}>{(Object.keys(csharpModules) as CSharpModuleKind[]).filter(id => csharpModules[id].stage === index).map(id => <button key={id} className={s.primary} onClick={() => openModule(id)}>Abrir módulo de {csharpModules[id].label.toLowerCase()}<ArrowRight size={16}/></button>)}</div> : <span className={s.planned}>Em preparação</span>}</article>)}</div>
      <section className={s.environment}><Smartphone size={30}/><div><h2>Começar no celular. Evoluir para o .NET real.</h2><p>O piloto roda um subconjunto didático de C# no navegador. Não é o compilador .NET completo. Projetos com APIs, banco e testes precisarão do SDK .NET em um computador ou de um ambiente remoto adequado.</p><p>Vamos orientar essa transição antes dos módulos que precisam dela. Nenhum serviço pago é ativado ao usar este piloto.</p><Link href="/estudante/cursos/csharp-fundamentos">Consultar o curso C# já existente<ArrowUpRight size={16}/></Link></div></section>
    </>}

    {progress.view === "pilot" && <><nav className={s.moduleTabs} aria-label="Módulos disponíveis">{(Object.keys(csharpModules) as CSharpModuleKind[]).map(id => <button key={id} aria-current={moduleKind === id ? "page" : undefined} onClick={() => openModule(id)}>{csharpModules[id].tab}</button>)}</nav><CSharpVariables key={`${userId}-${moduleKind}`} userId={userId} moduleKind={moduleKind} onModuleChange={openModule} onFullMap={() => navigate("map")}/></>}
    <footer className={s.footer}><span>ORBITAMOS / UMA ETAPA DE CADA VEZ</span><p>{key ? "Preferências, código e progresso deste piloto ficam neste navegador, separados do histórico das aulas. Não sincronizam entre aparelhos." : "Entre na sua conta para guardar seu progresso neste navegador."}</p></footer>
  </div>;
}
