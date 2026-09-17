"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import ServiceDiagram from "./ServiceDiagram";
import type { ServiceStory } from "./serviceStories";
import s from "./ServiceSales.module.css";

export default function ServiceExplorer({ story }: { story: ServiceStory }) {
  const [active,setActive]=useState(0);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : ["ArrowRight","ArrowDown"].includes(event.key) ? (index+1)%3 : ["ArrowLeft","ArrowUp"].includes(event.key) ? (index+2)%3 : null;
    if(next === null) return;
    event.preventDefault();setActive(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
  return <div className={s.explorer} data-service-explorer>
    <div className={s.featureTabs} role="tablist" aria-label="Explore a solução">
      {story.features.map((feature,i)=><button key={feature.label} type="button" role="tab" id={`feature-tab-${i}`} aria-controls={`feature-panel-${i}`} aria-selected={active===i} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={event=>navigate(event,i)} data-service-event="feature" data-service-detail={feature.label}><span>0{i+1}</span>{feature.label}<ArrowRight size={17}/></button>)}
    </div>
    {story.features.map((feature,i)=><div role="tabpanel" id={`feature-panel-${i}`} aria-labelledby={`feature-tab-${i}`} hidden={active!==i} tabIndex={0} key={feature.label} className={s.featurePanel}>
      <div className={s.featureWords}><span className={s.eyebrow}>POR DENTRO / 0{i+1}</span><h3>{feature.title}</h3><p>{feature.body}</p><div className={s.takeaway}><ArrowRight size={19}/><strong>{feature.takeaway}</strong></div></div>
      <figure className={s.featureFigure}><ServiceDiagram kind={story.kind} nodes={feature.nodes} active={i}/><figcaption>Esquema da solução. A interface final é criada para o seu negócio.</figcaption></figure>
    </div>)}
  </div>;
}
