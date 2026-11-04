import Link from "next/link";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { ArrowRight, ArrowUpRight, Briefcase, FolderOpen, MessageCircle, RefreshCw } from "lucide-react";
import type { Project, Job, JobApplication } from "@/lib/api";
import { collaboratorProjectHref, nextProjectAction, projectDue, projectStage, projectStageLabels, sortCollaboratorProjects } from "@/lib/collaboratorExperience";
import { displayDate, safeProgress } from "./portalPresentation";
import s from "./CollaboratorHome.module.css";

export type CollaboratorHomeProps = { name: string; projects: Project[]; jobs: Job[]; applications: JobApplication[]; loading: boolean; failed: string[]; retry: () => void; preview?: boolean };
const statusLabels = { pending: "Enviada", reviewing: "Em análise", accepted: "Aceita", declined: "Processo encerrado", withdrawn: "Retirada" };

export default function CollaboratorHome({ name, projects, jobs, applications, loading, failed, retry, preview = false }: CollaboratorHomeProps) {
  const ordered = sortCollaboratorProjects(projects);
  const featured = ordered[0];
  const remaining = ordered.slice(1);
  const active = projects.filter(project => ["todo", "in_progress"].includes(projectStage(project.status)));
  const available = !loading && !failed.includes("projetos");
  const action = featured ? nextProjectAction(featured) : null;
  const projectProgress = safeProgress(featured?.progress);
  const projectLink = (id?: number) => collaboratorProjectHref(id, preview);
  const applicationLink = preview ? "/dev/workspace-preview?view=applications" : "/colaborador/candidaturas";
  return <div className={s.home} data-collaborator-home>
    <header className={s.heading}><div><span>ORBITAMOS STUDIO / {name}</span><h1>Seu trabalho, hoje.</h1></div><Link href={projectLink()}>Todos os projetos<ArrowUpRight size={17}/></Link></header>
    {failed.length > 0 && <div className={s.notice} role="alert"><span>Não foi possível atualizar {failed.join(", ")}.</span><button onClick={retry}><RefreshCw size={15}/>Tentar novamente</button></div>}
    <section className={s.featured} aria-label="Seu próximo passo de trabalho"><div className={s.lead}>
      {loading ? <p role="status" aria-label="Carregando dados">Encontrando seus projetos…</p> : failed.includes("projetos") ? <><span className={s.eyebrow}>PROJETOS INDISPONÍVEIS</span><h2>Vamos recuperar sua bancada.</h2><p>Tente atualizar para consultar o briefing e as entregas.</p><button className={s.primary} onClick={retry}>Atualizar projetos<RefreshCw size={17}/></button></> : featured && action ? <>
        <div className={s.projectMeta}><span>{projectStageLabels[projectStage(featured.status)]}</span><span data-late={projectDue(featured).kind === "overdue"}>{projectDue(featured).kind === "today" ? "Prazo hoje" : displayDate(featured.dueDate) ? `Prazo ${displayDate(featured.dueDate)}` : "Prazo a combinar"}</span></div>
        <h2>{featured.title}</h2><div className={s.action}><strong>{action.label}</strong><p>{action.reason}</p></div>
        <Link href={projectLink(featured.id)} className={s.primary}>Abrir este projeto<ArrowRight size={18}/></Link>
        <div className={s.progress}><span>Andamento informado</span><strong>{projectProgress === null ? "A confirmar" : `${projectProgress}%`}</strong><div role="progressbar" aria-label={`Andamento de ${featured.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={projectProgress ?? undefined}><span style={{ width: `${projectProgress ?? 0}%` }}/></div></div>
      </> : <><span className={s.eyebrow}>SEU PRIMEIRO PROJETO</span><h2>Mostre o que você sabe construir.</h2><p>Prepare seu perfil e seu portfólio para se apresentar às oportunidades.</p><Link href="/colaborador/perfil" className={s.primary}>Preparar meu perfil<ArrowRight size={18}/></Link><Link href="/colaborador/vagas" className={s.secondary}>Ver oportunidades<ArrowRight size={16}/></Link></>}
    </div><div className={s.featuredPhoto}><OrbitPhoto kind="criacao" fill sizes="(max-width:767px) 100vw, 45vw"/><span>DA IDEIA À ENTREGA</span></div></section>
    <nav className={s.summary} aria-label="Resumo da colaboração"><Link href={projectLink()}><strong>{available ? active.length : "—"}</strong><span>Projetos em trabalho<ArrowUpRight size={14}/></span></Link><Link href="/colaborador/vagas"><strong>{loading || failed.includes("vagas") ? "—" : jobs.length}</strong><span>Oportunidades<ArrowUpRight size={14}/></span></Link><Link href={applicationLink}><strong>{loading || failed.includes("candidaturas") ? "—" : applications.length}</strong><span>Candidaturas<ArrowUpRight size={14}/></span></Link></nav>
    {available && remaining.length > 0 && <section className={s.otherProjects}><div className={s.sectionHeading}><h2>Outros projetos</h2><Link href={projectLink()}>Ver todos<ArrowRight size={15}/></Link></div><div>{remaining.slice(0, 3).map(project => <Link key={project.id} href={projectLink(project.id)}><FolderOpen size={20}/><span><strong>{project.title}</strong><small>{projectStageLabels[projectStage(project.status)]}{displayDate(project.dueDate) ? ` · Prazo ${displayDate(project.dueDate)}` : ""}</small></span><ArrowUpRight size={17}/></Link>)}</div></section>}
    <div className={s.bottom}><section><div className={s.sectionHeading}><h2>Oportunidades</h2><Link href="/colaborador/vagas">Ver vagas<ArrowRight size={15}/></Link></div>
      {loading ? <p role="status" className={s.muted}>Buscando vagas…</p> : failed.includes("vagas") ? <p className={s.muted}>As oportunidades voltam quando a atualização terminar.</p> : jobs.length ? <div className={s.jobs}>{jobs.slice(0, 3).map(job => <Link href={`/colaborador/vagas/${job.id}`} key={job.id}><span>{[job.type, job.workModel].filter(Boolean).join(" · ")}</span><h3>{job.title}</h3><p>{job.budgetLabel || "Condições nos detalhes da vaga"}</p><div>{job.skills?.slice(0, 3).map(skill => <small key={skill}>{skill}</small>)}<ArrowUpRight size={18}/></div></Link>)}</div> : <div className={s.empty}><Briefcase size={26}/><p>Nenhuma oportunidade aberta agora. Seu perfil e portfólio continuam disponíveis para preparar a próxima conexão.</p><Link href="/colaborador/portfolio">Organizar meu portfólio<ArrowRight size={16}/></Link></div>}
    </section><section className={s.applications}><div className={s.sectionHeading}><h2>Suas candidaturas</h2></div>{loading ? <p role="status" className={s.muted}>Buscando candidaturas…</p> : failed.includes("candidaturas") ? <p className={s.muted}>Não foi possível atualizar seus processos.</p> : applications.length ? <ul>{applications.slice(0, 4).map(item => <li key={item.id}><span>{statusLabels[item.status]}</span><strong>{item.jobTitle}</strong>{item.feedback && <small>Há um retorno da equipe.</small>}</li>)}</ul> : <p className={s.muted}>Quando você se candidatar, o andamento e os retornos aparecem aqui.</p>}<Link href={applicationLink} className={s.secondary}>Acompanhar candidaturas<ArrowRight size={16}/></Link></section></div>
    <nav className={s.utilities} aria-label="Ferramentas do colaborador"><Link href="/mensagens?area=work"><MessageCircle size={20}/><span>Conversas do trabalho</span><ArrowRight size={17}/></Link><Link href="/colaborador/portfolio"><span>Atualizar meu portfólio</span><ArrowRight size={17}/></Link><Link href="/colaborador/perfil"><span>Perfil e disponibilidade</span><ArrowRight size={17}/></Link></nav>
  </div>;
}
