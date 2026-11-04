"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock, RefreshCw, Send, XCircle } from "lucide-react";
import type { JobApplication } from "@/lib/api";
import { applicationFilterLabels, filterApplications, type ApplicationFilter } from "@/lib/collaboratorExperience";
import s from "./ApplicationWorkspace.module.css";

type Props = { items: JobApplication[]; loading?: boolean; error?: string; onReload?: () => void; onWithdraw?: (item: JobApplication) => void; withdrawingId?: number | null; preview?: boolean };
const states = {
  pending: { label: "Enviada", icon: Clock, next: "Sua candidatura foi enviada. O retorno da equipe aparecerá aqui." },
  reviewing: { label: "Em análise", icon: Clock, next: "A equipe está avaliando sua candidatura. Acompanhe os retornos por aqui." },
  accepted: { label: "Aceita", icon: CheckCircle2, next: "Confira o retorno da equipe para alinhar os próximos passos." },
  declined: { label: "Processo encerrado", icon: XCircle, next: "Você pode continuar acompanhando outras oportunidades." },
  withdrawn: { label: "Retirada", icon: XCircle, next: "Você retirou esta candidatura. As outras oportunidades continuam disponíveis." },
};
function sentDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Data não informada" : `Enviada em ${date.toLocaleDateString("pt-BR")}`; }

export default function ApplicationWorkspace({ items, loading = false, error = "", onReload, onWithdraw, withdrawingId = null, preview = false }: Props) {
  const [filter, setFilter] = useState<ApplicationFilter>("all");
  const visible = filterApplications(items, filter);
  return <div className={s.workspace} data-application-workspace><header className={s.heading}><div><span>OPORTUNIDADES</span><h1>Minhas candidaturas</h1><p>Veja o andamento e os retornos de cada processo.</p></div>{onReload && <button disabled={loading} onClick={onReload}><RefreshCw size={16}/>Atualizar</button>}</header>
    {error && <p role="alert" className={s.error}>{error}</p>}
    <div className={s.filters} role="group" aria-label="Filtrar candidaturas">{(Object.keys(applicationFilterLabels) as ApplicationFilter[]).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} disabled={loading}><strong>{loading ? "—" : filterApplications(items, value).length}</strong><span>{applicationFilterLabels[value]}</span></button>)}</div>
    {loading ? <p className={s.loading} role="status">Buscando suas candidaturas…</p> : error && !items.length ? <section className={s.empty}><RefreshCw size={32}/><h2>Vamos recuperar seus processos.</h2><p>Atualize para consultar suas candidaturas e os retornos da equipe.</p></section> : !visible.length ? <section className={s.empty}><Send size={32}/><h2>{items.length ? "Nenhuma candidatura neste filtro." : "Sua primeira oportunidade começa aqui."}</h2><p>{items.length ? "Escolha outro status para continuar acompanhando seus processos." : "Quando você se candidatar a uma vaga, o andamento e os retornos ficam reunidos nesta página."}</p>{items.length ? <button onClick={() => setFilter("all")}>Ver todas as candidaturas<ArrowRight size={17}/></button> : <Link href="/colaborador/vagas">Ver oportunidades<ArrowRight size={17}/></Link>}</section> : <div className={s.items} aria-live="polite">{visible.map(item => {
      const state = states[item.status], Icon = state.icon;
      return <article key={item.id} className={s.item} data-application-status={item.status}><div className={s.itemHeading}><div><span className={s.sent}>{sentDate(item.createdAt)}</span><h2>{item.jobTitle}</h2>{item.jobType && <p>{item.jobType}</p>}</div><span className={s.status} data-state={item.status}><Icon size={14}/>{state.label}</span></div>
        {item.coverLetter && <details className={s.letter}><summary>Rever minha apresentação</summary><p>{item.coverLetter}</p></details>}
        {item.feedback ? <div className={s.feedback}><strong>Retorno da equipe</strong><p>{item.feedback}</p></div> : <p className={s.next}>{state.next}</p>}
        <div className={s.itemActions}><Link href={`/colaborador/vagas/${item.jobId}`}>Ver a oportunidade<ArrowRight size={15}/></Link>{onWithdraw && (item.status === "pending" || item.status === "reviewing") && <button disabled={withdrawingId !== null} onClick={() => onWithdraw(item)}>{withdrawingId === item.id ? "Retirando…" : "Retirar candidatura"}</button>}</div>
      </article>;
    })}</div>}
    {preview && <p className={s.preview}>Dados demonstrativos. Esta prévia não envia nem retira candidaturas reais.</p>}
  </div>;
}
