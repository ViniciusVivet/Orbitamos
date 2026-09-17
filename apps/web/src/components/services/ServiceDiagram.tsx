import { ArrowDown, ArrowRight, Check, Code2, GitBranch, Layers3, MousePointer2, Send, ShieldCheck, Workflow } from "lucide-react";
import type { StoryKind } from "./serviceStories";
import s from "./ServiceSales.module.css";

export default function ServiceDiagram({ kind, nodes, active = 0 }: { kind: StoryKind; nodes: readonly string[]; active?: number }) {
  return <div className={s.diagram} data-diagram={kind} aria-hidden="true">
    <div className={s.diagramTop}><span>ORBITAMOS / {kind === "care" ? "EVOLUÇÃO" : "EXPERIÊNCIA"}</span><span>0{active + 1}</span></div>
    {kind === "presence" && <div className={s.brandComposition}>
      <div className={s.brandLetter}>Aa<span>Identidade<br/>com intenção.</span></div>
      <div className={s.brandLines}>{nodes.map((node,i)=><div key={node}><span>0{i+1}</span><strong>{node}</strong><ArrowRight size={16}/></div>)}</div>
      <MousePointer2 className={s.diagramCursor} size={38}/>
    </div>}
    {kind === "commerce" && <div className={s.commerceComposition}>
      <div className={s.catalogPoster}><span>CURADORIA DIGITAL</span><strong>Desejo.<br/>Escolha.<br/><em>Ação.</em></strong><ArrowRight size={34}/></div>
      <div className={s.commerceSteps}>{nodes.map((node,i)=><div key={node}><span>0{i+1}</span><strong>{node}</strong></div>)}</div>
    </div>}
    {kind === "operations" && <div className={s.boardComposition}>
      <div className={s.boardTitle}><Layers3 size={22}/><strong>Sua operação, visível.</strong></div>
      <div className={s.boardColumns}>{nodes.map((node,i)=><div key={node}><span>{node}</span><div><i/><i/><b>0{i+1}</b></div><div><i/><i/></div></div>)}</div>
    </div>}
    {kind === "automation" && <div className={s.flowComposition}>
      <div className={s.flowIntro}><GitBranch size={24}/><span>UM FLUXO. CADA ETAPA CONECTADA.</span></div>
      <div className={s.flowNodes}>{nodes.map((node,i)=><div className={s.flowItem} key={node}><div><span>0{i+1}</span>{i===0?<Send/>:i===1?<Workflow/>:<ShieldCheck/>}<strong>{node}</strong></div>{i<2&&<ArrowRight className={s.flowArrow} size={20}/>}</div>)}</div>
      <div className={s.flowReturn}><span/><p>Exceções também fazem parte do desenho.</p><ArrowDown size={15}/></div>
    </div>}
    {kind === "special" && <div className={s.specialComposition}>
      <div className={s.productCore}><Code2 size={40}/><strong>Seu produto.</strong><span>CONSTRUÍDO EM CAMADAS</span></div>
      <div className={s.productModules}>{nodes.map((node,i)=><div key={node}><span>0{i+1}</span><strong>{node}</strong><Layers3 size={17}/></div>)}</div>
    </div>}
    {kind === "care" && <div className={s.careComposition}>
      <div className={s.cycle}><div><ShieldCheck size={36}/><strong>O próximo<br/>passo conta.</strong></div><span className={s.cycleDot}/></div>
      <div className={s.careSteps}>{nodes.map((node,i)=><div key={node}><Check size={16}/><strong>{node}</strong><span>0{i+1}</span></div>)}</div>
    </div>}
    <div className={s.diagramBottom}><span>DESIGN + TECNOLOGIA</span><span>FEITO PARA SEU CONTEXTO</span></div>
  </div>;
}
