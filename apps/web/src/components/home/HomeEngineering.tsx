"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowUpRight, Check, Database, Fingerprint, Layers3, LockKeyhole, MousePointer2, PlugZap, ShieldCheck, Smartphone, Workflow } from "lucide-react";
import Link from "next/link";
import { adjacentTab, engineeringLayers } from "./deliveryContent";
import s from "./StudioDelivery.module.css";

function LayerDrawing({ index }: { index: number }) {
  if (index === 0) return <div className={s.interfaceDrawing}>
    <div className={s.miniSidebar}><span/><span/><span/><span/></div>
    <div className={s.miniContent}><span className={s.miniEyebrow}>SEU NEGÓCIO / DIGITAL</span><strong>Feito para<br/>funcionar.</strong><div className={s.miniTiles}><span/><span/><span/></div><div className={s.miniButton}>Explorar<ArrowUpRight size={13}/></div></div>
    <MousePointer2 className={s.miniCursor} size={28} fill="currentColor"/>
  </div>;
  if (index === 1) return <div className={s.accessDrawing}><Fingerprint size={65} strokeWidth={1}/><div><span>ACESSO ORGANIZADO</span><strong>Cliente. Equipe.<br/>Cada um no seu espaço.</strong><div className={s.permissionLine}><LockKeyhole size={13}/><i/><Check size={15}/></div></div></div>;
  if (index === 2) return <div className={s.dataDrawing}><Database size={39} strokeWidth={1}/><div className={s.dataColumns}>{["CLIENTES", "PEDIDOS", "PROCESSOS"].map(label=><div key={label}><span>{label}</span><i/><i/><i/><i/></div>)}</div></div>;
  return <div className={s.connectionsDrawing}><div className={s.connectionNode}><Workflow size={25}/><span>OPERAÇÃO</span></div><div className={s.connectionBridge}/><div className={s.connectionNode}><PlugZap size={27}/><span>INTEGRAÇÕES</span></div></div>;
}

export default function HomeEngineering({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    section.dataset.sceneReady = "true";
    section.dataset.sceneMotion = reducedMotion ? "reduced" : "scroll";
    if (reducedMotion) return;
    const update = () => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const value = progress.toFixed(3);
      if (section.style.getPropertyValue("--scene-progress") !== value) section.style.setProperty("--scene-progress", value);
    };
    // One geometry read per native event; no continuous render loop or stale visibility flag.
    const observer = new ResizeObserver(update);
    observer.observe(section);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); section.style.removeProperty("--scene-progress"); };
  }, [reducedMotion]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = adjacentTab(event.key, index, engineeringLayers.length);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
  const icons = [Smartphone, ShieldCheck, Database, PlugZap];
  return <section ref={root} id="engenharia" className={s.engineering} aria-labelledby="engineering-heading" data-home-engineering>
    <div className={s.technicalGrid} aria-hidden="true"/>
    <div className={s.container}>
      <header className={s.engineeringHeader}><p className={s.eyebrow}>Engenharia por trás / Orbitamos Studio</p><h2 id="engineering-heading">Por fora, simples.<br/><span>Por dentro, conectado.</span></h2><p>Você vê uma experiência fácil de usar. Por trás, cada camada tem um trabalho a fazer.</p></header>
      <div className={s.engineeringBody}>
        <div className={s.layerControls}>
          <div className={s.layerTabs} role="tablist" aria-label="Camadas da solução">
            {engineeringLayers.map((layer,index)=><button type="button" key={layer.id} role="tab" id={`engineering-tab-${layer.id}`} aria-selected={active===index} aria-controls={`engineering-panel-${layer.id}`} tabIndex={active===index ? 0 : -1} onClick={()=>setActive(index)} onKeyDown={event=>navigate(event,index)}><span>{layer.number}</span>{layer.title}<ArrowUpRight size={16}/></button>)}
          </div>
          {engineeringLayers.map((layer,index)=>{const Icon=icons[index];return <div key={layer.id} role="tabpanel" id={`engineering-panel-${layer.id}`} aria-labelledby={`engineering-tab-${layer.id}`} tabIndex={0} hidden={active!==index} className={s.layerCopy}><Icon size={24} strokeWidth={1.5}/><h3>{layer.subtitle}</h3><p>{layer.description}</p><ul aria-label="Tecnologias e recursos">{layer.tags.map(tag=><li key={tag}>{tag}</li>)}</ul></div>;})}
        </div>
        <div className={s.systemFigure}>
          <div className={s.systemScene} aria-hidden="true">
            <span className={s.axisLabel}>ORBITAMOS — SYSTEM DESIGN</span>
            <div className={s.assembly}>
              {engineeringLayers.map((layer,index)=><div key={layer.id} data-engineering-layer={index} data-active={active===index} className={s.systemLayer} style={{"--layer": 3-index} as CSSProperties}><div className={s.layerEdge}><span>{layer.number} / {layer.title}</span><Layers3 size={15}/></div><LayerDrawing index={index}/></div>)}
            </div>
            <span className={s.sceneCoordinate}>DESIGN + CÓDIGO + OPERAÇÃO</span>
          </div>
          <p className={s.systemCaption}>Arquitetura ilustrativa. As camadas e integrações são definidas conforme o escopo de cada projeto.</p>
        </div>
      </div>
      <footer className={s.engineeringFoot}><span>Complexidade bem resolvida vira simplicidade no uso.</span><Link href="/projetos">Veja isso em projetos reais<ArrowUpRight size={17}/></Link></footer>
    </div>
  </section>;
}
