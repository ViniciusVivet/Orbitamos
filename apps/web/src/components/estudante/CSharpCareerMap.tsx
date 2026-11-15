import Image from "next/image";
import Link from "next/link";
import { useEffect, type Ref } from "react";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { csharpStages } from "@/lib/csharpTrack";
import { csharpModules, type CSharpModuleKind } from "@/lib/csharpModules";
import { csharpCareerPath, csharpCareerHabits, csharpAiRoutine, csharpAiSafetyRule, csharpLaterTopics } from "@/lib/csharpCareerPath";
import projetoCSharp from "../../../public/images/academy/projeto-csharp-v1.webp";
import s from "./CSharpCareerMap.module.css";

const stationLabels = { start: "Variáveis", logic: "Regras", objects: "Projeto .NET", data: "Dados", api: "API", quality: "Qualidade", delivery: "Entrega", career: "Portfólio" };

export default function CSharpCareerMap({ currentModule, onOpenModule, headingRef }: {
  currentModule: CSharpModuleKind;
  onOpenModule: (module: CSharpModuleKind) => void;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const currentStage = csharpStages[csharpModules[currentModule].stage].id;
  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (!csharpStages.some(stage => target === `career-stage-${stage.id}`)) return;
    const frame = requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: "start", behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <div className={s.map} data-csharp-career-map>
    <header className={s.hero}>
      <div className={s.lead}>
        <span className={s.kicker}>SEU CAMINHO / BACKEND C#</span>
        <h1 ref={headingRef} tabIndex={-1}>Da lógica ao seu<br/><em>primeiro backend.</em></h1>
        <p>Um sistema de clientes e ordens de serviço cresce com você. Cada estação entrega uma parte do trabalho.</p>
        <button className={s.primary} onClick={() => onOpenModule(currentModule)}>Abrir práticas disponíveis<ArrowRight size={17}/></button>
        <span className={s.current}><MapPin size={14}/> Seu módulo: {csharpModules[currentModule].label}</span>
      </div>
      <div className={s.scene}>
        <Image src={projetoCSharp} alt="" fill placeholder="blur" sizes="(max-width: 700px) 90vw, 42vw"/>
        <div className={s.project}><span>O PROJETO DA TRILHA</span><strong>OrbiServiços</strong><small>Clientes → serviços → API → entrega</small></div>
      </div>
    </header>

    <nav className={s.stationNav} aria-label="Ir para uma estação">{csharpStages.map((stage, index) => <a key={stage.id} href={`#career-stage-${stage.id}`} aria-current={currentStage === stage.id ? "step" : undefined} onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.history.replaceState(null, "", `#career-stage-${stage.id}`);
      document.getElementById(`career-stage-${stage.id}`)?.scrollIntoView({ block: "start", behavior: "instant" });
    }}><b>{String(index + 1).padStart(2, "0")}</b><span>{stationLabels[stage.id]}</span></a>)}</nav>

    <div className={s.legend}><p><strong>Hoje:</strong> variáveis, condições e laços. As próximas aulas serão publicadas por unidade.</p><details><summary>Como vou estudar?</summary><p>Entenda o pedido, escreva com apoio, teste, mude uma regra e tente outra situação por conta própria. As checagens e consultas à ajuda ficam distintas.</p><p>Boilerplate é uma estrutura inicial reutilizável. Você vai entender seus arquivos, adaptar a regra e verificar o resultado.</p></details></div>

    <ol className={s.stations} aria-label="Oito estações da formação">
      {csharpStages.map((stage, index) => {
        const plan = csharpCareerPath[stage.id];
        const here = currentStage === stage.id;
        return <li key={stage.id} id={`career-stage-${stage.id}`} className={s.station} data-current={here} data-status={plan.status}>
          <div className={s.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
          <div className={s.stationBody}>
            <div className={s.status}>{here && <span><MapPin size={12}/> Seu módulo está aqui</span>}<span>{plan.availableModules.length ? "Práticas abertas" : "Aulas em preparação"}</span></div>
            <h2>{stage.title}</h2>
            <p>{plan.competence}</p>
            <div className={s.deliverable}><span>VOCÊ VAI ENTREGAR</span><strong>{plan.delivery.title}</strong></div>
            <div className={s.patterns} aria-label="Estruturas que você vai aprender">{plan.patterns.map(pattern => <span key={pattern.name}>{pattern.name}</span>)}</div>
            {plan.availableModules.length > 0 && <div className={s.moduleActions}>{plan.availableModules.map(id => <button key={id} onClick={() => onOpenModule(id)}>{csharpModules[id].label}<ArrowRight size={15}/></button>)}</div>}
            <details className={s.assignment}>
              <summary>Ver tarefa de trabalho e critérios<ArrowRight size={14}/></summary>
              <div className={s.ticket}><span>PEDIDO DA EQUIPE</span><h3>{plan.ticket.title}</h3><p>{plan.ticket.request}</p><small>{plan.ticket.why}</small></div>
              <p className={s.task}>{plan.delivery.task}</p>
              <h3 className={s.criteriaTitle}>Como conferir o que aprendi</h3>
              <ul className={s.checks}>{plan.acceptance.map(check => <li key={check}><Check size={14}/><span>{check}</span></li>)}</ul>
              <details className={s.reference}><summary>Conhecer os arquivos desta entrega</summary><div className={s.artifact}><span>{plan.artifact.file}</span><pre><code>{plan.artifact.code}</code></pre><p>{plan.artifact.note}</p></div><dl>{plan.patterns.map(pattern => <div key={pattern.name}><dt>{pattern.name}</dt><dd>{pattern.purpose}<code>{pattern.file}</code></dd></div>)}</dl></details>
              <p className={s.environment}>{plan.environment.phone} {plan.environment.computer}</p>
              {plan.prerequisites.length > 0 && <p className={s.prerequisites}>Antes desta entrega: {plan.prerequisites.map(id => csharpStages.find(item => item.id === id)?.title).join(" → ")}.</p>}
            </details>
          </div>
        </li>;
      })}
    </ol>

    <section className={s.habits} aria-labelledby="csharp-work-habits">
      <div><span className={s.kicker}>EM TODA ENTREGA</span><h2 id="csharp-work-habits">Aprender a trabalhar<br/>também faz parte.</h2><p>Git, inglês técnico, depuração e comunicação acompanham o código desde o começo.</p></div>
      <div className={s.habitList}>{csharpCareerHabits.map(habit => <article key={habit.id}><h3>{habit.title}</h3><p>{habit.detail}</p></article>)}</div>
    </section>
    <details className={s.ai}><summary>Como usar IA sem perder o aprendizado<ArrowRight size={17}/></summary><ol>{csharpAiRoutine.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol><p>{csharpAiSafetyRule}</p></details>
    <details className={s.later}><summary>O que fica para uma especialização?</summary><dl>{csharpLaterTopics.map(topic => <div key={topic.title}><dt>{topic.title}</dt><dd>{topic.why}</dd></div>)}</dl></details>
    <section className={s.next}>
      <h2>Seu primeiro passo já está aberto.</h2><p>Comece pelo programa pequeno. Quando ele funcionar, mude os dados e explique por que o resultado mudou.</p><button className={s.primary} onClick={() => onOpenModule("variables")}>Praticar variáveis em C#<ArrowRight size={17}/></button>
      <Link href="/estudante/cursos/csharp-fundamentos">Consultar as aulas de C#<ArrowRight size={15}/></Link>
    </section>
  </div>;
}
