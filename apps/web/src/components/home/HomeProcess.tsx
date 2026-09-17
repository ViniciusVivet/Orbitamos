"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { studioPhotos } from "@/components/brand/studioPhotography";
import { adjacentTab, deliverySteps } from "./deliveryContent";
import s from "./StudioDelivery.module.css";


export default function HomeProcess({ contactHref }: { contactHref: string }) {
  const [active, setActive] = useState(0);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = adjacentTab(event.key, index, deliverySteps.length);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
  return <section id="como-funciona" className={s.process} aria-labelledby="process-heading" data-home-process>
    <div className={s.container}>
      <header className={s.processHeader}>
        <div><p className={s.eyebrow}>Orbitamos Studio / Como funciona</p><h2 id="process-heading">Clareza antes<br/>do código<span>.</span></h2></div>
        <p className={s.intro}>Da primeira conversa ao projeto no ar. Você entende cada etapa e participa das decisões que importam.</p>
      </header>
      <div className={s.processTabs} role="tablist" aria-label="Etapas do projeto">
        {deliverySteps.map((step, index) => <button key={step.id} type="button" id={`process-tab-${step.id}`} role="tab" aria-selected={active === index} aria-controls={`process-panel-${step.id}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}><span className={s.stepNumber}>0{index + 1}</span><span>{step.name}</span><ArrowUpRight size={17}/></button>)}
      </div>
      {deliverySteps.map((step, index) => <div key={step.id} role="tabpanel" tabIndex={0} id={`process-panel-${step.id}`} aria-labelledby={`process-tab-${step.id}`} hidden={active !== index} className={s.processPanel}>
        <figure className={s.processFigure}>
          <div className={s.processPhoto}>
            {active === index && <Image src={studioPhotos[step.photo]} alt="" fill placeholder="blur" sizes="(max-width: 800px) 100vw, 60vw" className={s.photo}/>}
            <span className={s.photoEdition} aria-hidden="true">ORBITAMOS / PROCESSO — 0{index + 1}</span>
          </div>
          <figcaption>Cena ilustrativa criada com IA · Universo Orbitamos</figcaption>
        </figure>
        <div className={s.processCopy}>
          <span className={s.eyebrow}>Etapa 0{index + 1} / {step.name}</span>
          <h3>{step.headline}</h3><p>{step.description}</p>
          <dl><div><dt>Ponto de partida</dt><dd>{step.input}</dd></div><div><dt>O que fica nas suas mãos</dt><dd>{step.output}</dd></div></dl>
          <a href={contactHref} target="_blank" rel="noreferrer" className={s.contactLink}>Vamos falar do seu projeto<ArrowRight size={17}/></a>
        </div>
      </div>)}
      <p className={s.processFoot}>Um processo compartilhado. Sem exigir que você entenda de código, hospedagem ou infraestrutura.</p>
    </div>
  </section>;
}
