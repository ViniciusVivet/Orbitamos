import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, MessageCircle, Plus } from "lucide-react";
import type { Servico } from "@/data/servicos";
import { servicos } from "@/data/servicos";
import { getProjetoBySlug } from "@/data/projetos";
import { STATUS_LABELS } from "@/types/projeto";
import { serviceContactUrl, serviceStories } from "./serviceStories";
import ServiceDiagram from "./ServiceDiagram";
import ServiceExplorer from "./ServiceExplorer";
import ServiceSignals from "./ServiceSignals";
import s from "./ServiceSales.module.css";

export default function ServiceSalesPage({ service }: { service: Servico }) {
  const story=serviceStories[service.slug];
  const project=getProjetoBySlug(story.leadProject)!;
  const related=service.relatedProjects.filter(slug=>slug!==project.slug).map(getProjetoBySlug).filter(p=>p!==undefined);
  const wa=serviceContactUrl(service.nome,service.preco);
  const drawnHero=story.kind==="automation"||story.kind==="care";
  return <article className={s.page} data-sales-page={service.slug} data-theme={story.kind}>
    <ServiceSignals slug={service.slug}/>
    <section className={s.hero} aria-labelledby="sales-title">
      <div className={s.heroGlow} aria-hidden="true"/>
      <div className={s.container}>
        <div className={s.breadcrumb}><Link href="/">Orbitamos Studio</Link><span>/</span><span>Soluções para negócios</span><span className={s.edition}>0{Number(story.number)} — 06</span></div>
        <div className={s.heroGrid}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}><span className={s.liveMark}/>{service.nome}</p>
            <h1 id="sales-title">{story.title[0]}<br/><em>{story.title[1]}</em></h1>
            <p className={s.heroDescription}>{service.subheadline}</p>
            <div className={s.heroPrice}><span>{story.kind==="care"?"Investimento mensal":story.kind==="special"?"Projeto sob medida":"Investimento"}</span><strong data-canonical-price>{service.preco}</strong></div>
            <div className={s.heroActions}><a href={wa} target="_blank" rel="noopener noreferrer" className={s.primary} data-service-event="contact" data-service-detail="hero">{story.cta}<ArrowUpRight size={19}/></a><a href="#solucao" className={s.textLink}>Explorar a solução<ArrowDown size={17}/></a></div>
            <p className={s.heroNote}>Escopo e prazo alinhados antes de começar.</p>
          </div>
          <div className={s.heroArt} data-hero-art>
            <div className={s.orbitWord} aria-hidden="true">{story.kind==="automation"?"CONNECT":story.kind==="care"?"EVOLVE":"ORBITAMOS"}</div>
            {drawnHero ? <div className={s.heroDiagram}><ServiceDiagram kind={story.kind} nodes={story.features[0].nodes}/><p className={s.visualCaption}>Visão do processo · definido para sua operação</p></div> : <figure className={s.heroProduct}>
              <div className={s.browserBar}><span><i/><i/><i/></span><span>{project.nome}</span><ArrowUpRight size={13}/></div>
              <div className={s.heroCapture}><Image src={project.imagemPrincipal} alt={`Captura do projeto ${project.nome}`} fill sizes="(max-width: 900px) 94vw, 54vw" preload className={s.capture}/></div>
              <figcaption><span>PROJETO ORBITAMOS</span><Link href={`/projetos/${project.slug}`} data-service-event="case" data-service-detail={project.slug}>{project.nome}<ArrowUpRight size={15}/></Link></figcaption>
            </figure>}
            <div className={s.artAnnotation}><span>DESIGN QUE FAZ SENTIDO.</span><p>{story.signature}</p><span className={s.annotationLine}/></div>
          </div>
        </div>
        <div className={s.heroFoot}><span>ESTRATÉGIA / DESIGN / DESENVOLVIMENTO</span><a href="#prova">Conheça um projeto real<ArrowDown size={15}/></a></div>
      </div>
    </section>

    <nav className={s.decisionNav} aria-label="Navegação da solução">
      <div className={s.container}><div className={s.sectionLinks}><a href="#solucao">A solução</a><a href="#prova">Projeto real</a><a href="#investimento">O que inclui</a><a href="#perguntas">Dúvidas</a></div><div className={s.navOffer}><span>{service.preco}</span><a href={wa} target="_blank" rel="noopener noreferrer" data-service-event="contact" data-service-detail="navigation">Conversar sobre o projeto<ArrowUpRight size={15}/></a></div></div>
    </nav>

    <section className={s.fitSection} aria-labelledby="fit-title">
      <div className={s.container}>
        <div className={s.sectionHeading}><p className={s.eyebrow}>01 / O PONTO DE VIRADA</p><h2 id="fit-title">{story.shift[0]}<br/><span>{story.shift[1]}</span></h2></div>
        <div className={s.fitBody}><p>{service.dor}</p><div><span className={s.smallLabel}>FAZ SENTIDO PARA</span><ul>{service.idealPara.map(item=><li key={item}><Check size={16}/>{item}</li>)}</ul></div></div>
      </div>
    </section>

    <section id="solucao" className={s.solution} aria-labelledby="solution-title">
      <div className={s.container}>
        <div className={s.splitHeading}><div><p className={s.eyebrow}>02 / EXPLORE A SOLUÇÃO</p><h2 id="solution-title">{story.exploreTitle[0]}<br/><em>{story.exploreTitle[1]}</em></h2></div><p>Conheça o que muda na experiência.<br/>Escolha um capítulo para explorar.</p></div>
        <ServiceExplorer story={story}/>
      </div>
    </section>

    <section id="prova" className={s.proof} aria-labelledby="proof-title">
      <div className={s.container}>
        <div className={s.proofHeading}><div><p className={s.eyebrow}>03 / TRABALHO QUE VOCÊ PODE VER</p><h2 id="proof-title">Menos promessa.<br/><em>Mais projeto real.</em></h2></div><span className={s.proofStamp}>ORBITAMOS<br/>SELECTED WORK<br/><b>↗</b></span></div>
        <div className={s.proofLayout}>
          <Link href={`/projetos/${project.slug}`} className={s.proofVisual} data-service-proof data-service-event="case" data-service-detail={project.slug}><Image src={project.imagemPrincipal} alt={`Conheça o case ${project.nome}`} fill sizes="(max-width: 900px) 94vw, 65vw" className={s.capture}/><span>Explorar case<ArrowUpRight size={19}/></span></Link>
          <div className={s.proofCopy}><span className={s.projectStatus}>{STATUS_LABELS[project.status]}</span><h3>{project.nome}</h3><p>{story.proofIntro}</p><ul>{project.destaques.slice(0,2).map(item=><li key={item}><ArrowRight size={15}/>{item}</li>)}</ul><Link href={`/projetos/${project.slug}`} className={s.proofLink} data-service-event="case" data-service-detail={project.slug}>Ver história e entrega<ArrowUpRight size={18}/></Link></div>
        </div>
        <p className={s.proofCaveat}>Cada case tem escopo próprio. Conheça nossa execução e confira abaixo as entregas deste pacote.{story.kind==="care" ? " Os exemplos não indicam um contrato de manutenção ativo." : story.kind==="automation" ? " As integrações para sua operação são avaliadas no diagnóstico." : ""}</p>
        <div className={s.relatedWork}><span>OUTROS PROJETOS</span>{related.slice(0,2).map(p=><Link href={`/projetos/${p.slug}`} key={p.slug} data-service-event="case" data-service-detail={p.slug}>{p.nome}<ArrowUpRight size={17}/></Link>)}</div>
      </div>
    </section>

    <section id="investimento" className={s.investment} aria-labelledby="investment-title">
      <div className={s.container}>
        <div className={s.offerLayout}>
          <aside className={s.offer}>
            <p className={s.eyebrow}>04 / ESCOPO E INVESTIMENTO</p>
            <h2 id="investment-title">{service.nome}</h2><strong className={s.offerPrice} data-canonical-price>{service.preco}</strong><p>{story.priceNote}</p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className={s.primary} data-service-event="contact" data-service-detail="investment">Conversar sobre esta solução<ArrowUpRight size={19}/></a>
            <span className={s.offerNote}><MessageCircle size={15}/> Você conversa sobre o projeto antes de contratar.</span>
          </aside>
          <div className={s.scope}><h3>Você sabe o que está levando.</h3><ol>{service.entregaveis.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,"0")}</span><strong>{item}</strong><Check size={17}/></li>)}</ol><div className={s.boundaries}><span className={s.smallLabel}>IMPORTANTE PARA DECIDIR</span>{story.boundaries.map(text=><p key={text}>{text}</p>)}<p>Prazo, forma de pagamento e detalhes finais são definidos na proposta.</p></div></div>
        </div>
      </div>
    </section>

    <section className={s.process} aria-labelledby="process-title"><div className={s.container}>
      <div className={s.splitHeading}><div><p className={s.eyebrow}>05 / DO PRIMEIRO CONTATO À ENTREGA</p><h2 id="process-title">Um caminho claro.<br/><em>Sem caixa-preta.</em></h2></div><p>Você acompanha as decisões.<br/>A execução segue o escopo combinado.</p></div>
      <ol className={s.processSteps}>{service.processo.map((step,i)=><li key={step.titulo}><span>0{i+1}</span><h3>{step.titulo}</h3><p>{step.texto}</p></li>)}</ol>
      <div className={s.measurement}><div><p className={s.eyebrow}>RESULTADO TEM CONTEXTO</p><h3>O que vale<br/>acompanhar.</h3><p>Os indicadores são escolhidos conforme o objetivo e os dados disponíveis.</p></div><dl>{story.measures.map(item=><div key={item.name}><dt>{item.name}<ArrowUpRight size={16}/></dt><dd>{item.meaning}</dd></div>)}</dl></div>
    </div></section>

    <section id="perguntas" className={s.faq} aria-labelledby="faq-title"><div className={s.container}><div className={s.faqLayout}><div><p className={s.eyebrow}>06 / ANTES DE DECIDIR</p><h2 id="faq-title">Boa escolha<br/>começa sem<br/><em>dúvida.</em></h2><p>Se o seu cenário não está aqui, vamos conversar sobre ele.</p></div><div className={s.questions}>{service.faq.map(item=><details key={item.pergunta}><summary data-service-event="faq" data-service-detail={item.pergunta}>{item.pergunta}<Plus size={20}/></summary><p>{item.resposta}</p></details>)}<details><summary data-service-event="faq" data-service-detail="prazo">Qual é o prazo e como começa?<Plus size={20}/></summary><p>O prazo é definido após entendermos o escopo, os materiais e as dependências. Na primeira conversa, você apresenta o negócio e o objetivo; os próximos passos são alinhados na proposta.</p></details></div></div></div></section>

    <section className={s.closing} aria-labelledby="closing-title"><div className={s.container}><span className={s.eyebrow}>SEU PRÓXIMO MOVIMENTO</span><h2 id="closing-title">{story.closing}</h2><p>Conte o que você faz e o que precisa resolver.<br/>Vamos entender se esta é a solução certa.</p><a href={wa} target="_blank" rel="noopener noreferrer" className={s.primary} data-service-event="contact" data-service-detail="closing">{story.cta}<ArrowUpRight size={21}/></a><Link href="/contato" className={s.formLink} data-service-event="form">Prefiro enviar pelo formulário<ArrowRight size={16}/></Link><div className={s.closingMark} aria-hidden="true">ORBITAMOS</div></div></section>
    <footer className={s.otherServices}><div className={s.container}><span>OUTRAS FORMAS DE AVANÇAR</span><div>{servicos.filter(item=>item.slug!==service.slug).map(item=><Link href={`/servicos/${item.slug}`} key={item.slug}>{item.nome}<ArrowUpRight size={14}/></Link>)}</div><Link href="/" className={s.backHome}><ChevronDown size={14}/> Voltar ao início</Link></div></footer>
  </article>;
}
