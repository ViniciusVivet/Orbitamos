"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAcademyActivity } from "./useAcademyActivity";
import type { AcademyActivityItem } from "@/lib/academyActivity";
import { academyPreviewHref } from "@/lib/portalNavigation";
import s from "./AcademyContinue.module.css";

const statusLabels = { new: "Não iniciada", opened: "Visitada · sem etapa validada", "in-progress": "Em prática", completed: "Atividade finalizada" };
function ActivityRecord({ item, preview }: { item: AcademyActivityItem; preview: boolean }) {
  return <Link href={preview ? academyPreviewHref(item.href) : item.href}><div><strong>{item.title}</strong><p>{statusLabels[item.status]} · {item.completedUnits} de {item.totalUnits} {item.unit}{item.reviewed ? ` · ${item.reviewed} ${item.reviewed === 1 ? "revisão" : "revisões"}` : ""}</p><small>{item.detail}</small>{item.status === "completed" && item.completedUnits < item.totalUnits && <small>Conquista anterior preservada; a contagem acima é do rascunho atual.</small>}</div><ArrowRight size={17}/></Link>;
}

export default function AcademyActivityProgress({ userId, preview = false }: { userId?: string | number | null; preview?: boolean }) {
  const { data, ready, unavailable } = useAcademyActivity(userId);
  const visible = data?.items.filter(item => item.status !== "new") ?? [];
  return <section className={s.progressPanel} data-academy-evidence aria-label="Código, experiências e trilha C#">
    <h2>O que você está construindo.</h2><p>Aulas, desafios e jogos medem coisas diferentes. Aqui você acompanha cada formato sem misturar tudo em uma porcentagem de domínio.</p>
    {!ready ? <p role="status">Lendo suas atividades salvas…</p> : <>
      <div className={s.summaryGrid}>
        <div><strong>{data?.summaries.experiences.completed ?? 0} / 6</strong><span>Experiências finalizadas</span><small>{data?.summaries.experiences.reviewed ?? 0} experiências revisitadas na revisão. Uma visita sozinha não conta como prática.</small></div>
        <div><strong>{data?.summaries.code.completed ?? 0} / {data?.summaries.code.total ?? "—"}</strong><span>Desafios de código concluídos</span><small>{data?.items.filter(item => item.group === "code" && item.status === "in-progress").length ?? 0} em andamento. Etapas validadas no modo guiado ou livre.</small></div>
        <div><strong>{data?.summaries.csharp.completed ?? 0} / 3</strong><span>Módulos do piloto C# finalizados</span><small>Variáveis, condições e laços. A formação completa tem outras etapas planejadas.</small></div>
      </div>
      {visible.length ? <><div className={s.activityList}>{visible.slice(0, 6).map(item => <ActivityRecord key={item.id} item={item} preview={preview}/>)}</div>{visible.length > 6 && <details><summary>Ver as outras {visible.length - 6} atividades salvas</summary><div className={s.activityList}>{visible.slice(6).map(item => <ActivityRecord key={item.id} item={item} preview={preview}/>)}</div></details>}</> : <div className={s.empty}>Sua primeira atividade começa com uma pequena tentativa. As etapas validadas e os rascunhos aparecem aqui.<br/><Link href={preview ? academyPreviewHref("/estudante/pratica/variaveis-js") : "/estudante/pratica/variaveis-js"}>Escrever minha primeira linha <ArrowRight size={15}/></Link></div>}
    </>}
    <details><summary>O que significa cada registro?</summary><p>Visitada: a atividade foi aberta. Em prática: há uma tentativa, resposta ou etapa registrada. Finalizada: as checagens daquela atividade foram concluídas. Revisada: você voltou a perguntas sobre uma experiência. Nenhum desses registros, sozinho, certifica domínio profissional.</p><p>Esta visão lê os registros existentes neste navegador e nesta conta, sem apagar ou migrar seus códigos. O histórico das aulas continua separado, sincronizado quando o serviço estiver disponível. Rascunhos e atividades locais ainda não sincronizam entre aparelhos.</p></details>
    {unavailable && <p role="status">Não foi possível ler parte do armazenamento local. Seus registros não foram alterados.</p>}
  </section>;
}
