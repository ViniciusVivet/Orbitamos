"use client";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { useAcademyActivity } from "./useAcademyActivity";
import type { AcademyActivityItem } from "@/lib/academyActivity";
import { academyPreviewHref } from "@/lib/portalNavigation";
import s from "./AcademyActivityProgress.module.css";

const statusLabels = { new: "Não iniciada", opened: "Você abriu", "in-progress": "Em prática", completed: "Finalizada" };
function ActivityRecord({ item, preview }: { item: AcademyActivityItem; preview: boolean }) {
  const percent = item.totalUnits ? Math.min(100, item.completedUnits / item.totalUnits * 100) : 0;
  return <Link href={preview ? academyPreviewHref(item.href) : item.href} className={s.record}>
    <OrbitPhoto kind={item.group === "sql-workshop" ? "dados" : item.group === "experience" ? "criacao" : "estudo"} className={s.thumbnail} sizes="96px"/>
    <div className={s.recordContent}><span className={s.recordStatus}>{item.status === "completed" && <Check size={12}/>} {statusLabels[item.status]}</span><strong>{item.title}</strong><div className={s.track}><span style={{width:percent+"%"}}/></div><p>{item.completedUnits} de {item.totalUnits} {item.unit}{item.reviewed ? ` · ${item.reviewed} ${item.reviewed === 1 ? "revisão" : "revisões"}` : ""}</p>{item.status === "completed" && item.completedUnits < item.totalUnits && <small>Conquista preservada. Esta contagem é da tentativa atual.</small>}</div><ArrowRight size={17}/>
  </Link>;
}

export default function AcademyActivityProgress({ userId, preview = false }: { userId?: string | number | null; preview?: boolean }) {
  const { data, ready, unavailable } = useAcademyActivity(userId);
  const visible = data?.items.filter(item => item.status !== "new") ?? [];
  return <section className={s.panel} data-academy-evidence aria-label="Código, experiências e trilha C#">
    <header className={s.heading}><div><span>SUAS TENTATIVAS VIRAM CAMINHO</span><h2>Olha o que você<br/>{" "}está construindo.</h2><p>{visible.length ? "Seu código e suas descobertas estão aqui. Escolha uma atividade para continuar." : "Tudo começa com uma tentativa. Seu primeiro programa pode ser hoje."}</p>{!visible.length && <Link href={preview ? academyPreviewHref("/estudante/pratica/variaveis-js") : "/estudante/pratica/variaveis-js"}>Escrever minha primeira linha<ArrowRight size={17}/></Link>}</div><OrbitPhoto kind="estudo" className={s.cover} sizes="(max-width: 650px) 92vw, 42vw"/></header>
    {!ready ? <p role="status">Lendo suas atividades salvas…</p> : <>
      <div className={s.summaryGrid}>
        <div><strong>{data?.summaries.experiences.completed ?? 0}{" "}<small>/ 6</small></strong><span>Experiências finalizadas</span></div>
        <div><strong>{data?.summaries.code.completed ?? 0}{" "}<small>/ {data?.summaries.code.total ?? "—"}</small></strong><span>Desafios de código</span></div>
        <div><strong>{data?.summaries.csharp.completed ?? 0}{" "}<small>/ 3</small></strong><span>Módulos C# finalizados</span></div>
      </div>
      {visible.length ? <><h3 className={s.listHeading}>Continue uma atividade</h3><div className={s.activityList}>{visible.slice(0, 6).map(item => <ActivityRecord key={item.id} item={item} preview={preview}/>)}</div>{visible.length > 6 && <details className={s.details}><summary>Mais {visible.length - 6} atividades salvas</summary><div className={s.activityList}>{visible.slice(6).map(item => <ActivityRecord key={item.id} item={item} preview={preview}/>)}</div></details>}</> : <p className={s.empty}>Quando você começar, suas atividades aparecem aqui para retomar.</p>}
    </>}
    <details className={s.details}><summary>Como esse progresso é contado?</summary><p>Visitar uma atividade não é concluir. Em prática significa que há uma tentativa ou etapa registrada; finalizada significa que as checagens daquela atividade passaram. Nenhum registro sozinho certifica domínio profissional.</p><p>Nos Primeiros passos, a entrega completa inclui o código inicial, uma alteração e uma aplicação independente testadas. Seus rascunhos anteriores continuam guardados.</p><p>{data?.summaries.experiences.reviewed ?? 0} experiências revisitadas na revisão. C# conta os três módulos disponíveis: variáveis, condições e laços; a formação completa ainda tem etapas em preparação.</p><p>Os registros de código e jogos ficam separados por conta neste navegador e não sincronizam entre aparelhos. O histórico das aulas é separado e sincroniza quando o serviço está disponível.</p></details>
    {unavailable && <p role="status">Não foi possível ler parte do armazenamento local. Seus registros não foram alterados.</p>}
  </section>;
}
