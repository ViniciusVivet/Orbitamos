"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ExternalLink, FolderOpen, LayoutGrid, List, MessageCircle, RefreshCw, Users } from "lucide-react";
import type { Project } from "@/lib/api";
import { listProjectMembers, type WorkspaceMember } from "@/lib/workspace";
import { collaboratorProjectHref, findAuthorizedProject, nextProjectAction, projectDue, projectStage, projectStageLabels, projectResourceLinks, sortCollaboratorProjects, type ProjectStage } from "@/lib/collaboratorExperience";
import { displayDate, safeProgress } from "@/components/portal/portalPresentation";
import s from "./ProjectWorkspace.module.css";

type Props = { projects: Project[]; loading?: boolean; error?: string; onRetry?: () => void; preview?: boolean };
const stages: ProjectStage[] = ["todo", "in_progress", "paused", "completed"];
const priorities = { low: "Baixa", medium: "Normal", high: "Alta", urgent: "Urgente" };
function Progress({ project }: { project: Project }) {
  const value = safeProgress(project.progress);
  return <div className={s.progress}><div><span>Andamento informado</span><strong>{value === null ? "A confirmar" : `${value}%`}</strong></div><div role="progressbar" aria-label={`Andamento de ${project.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value ?? undefined}><span style={{ width: `${value ?? 0}%` }}/></div></div>;
}
function Deadline({ project }: { project: Project }) {
  const due = projectDue(project);
  return <span className={s.deadline} data-late={due.kind === "overdue"}><CalendarDays size={14}/>{due.kind === "today" ? "Prazo hoje" : displayDate(project.dueDate) ? `Prazo ${displayDate(project.dueDate)}` : "Prazo a combinar"}{due.kind === "overdue" && " · revisar"}</span>;
}
function ProjectCard({ project, preview }: { project: Project; preview: boolean }) {
  const stage = projectStage(project.status);
  return <Link className={s.card} href={collaboratorProjectHref(project.id, preview)} data-project-id={project.id}><div className={s.cardTop}><span className={s.status} data-stage={stage}>{projectStageLabels[stage]}</span><span className={s.priority} data-urgent={project.priority === "urgent"}>{priorities[project.priority ?? "medium"]}</span></div><h2>{project.title}</h2><p>{project.description || "Abra o projeto para consultar o briefing e os materiais."}</p><Progress project={project}/><div className={s.cardFoot}><Deadline project={project}/><ArrowRight size={17}/></div></Link>;
}
function ProjectDetail({ project, preview }: { project: Project; preview: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [team, setTeam] = useState<{ projectId: number; items: WorkspaceMember[]; error: boolean } | null>(null);
  const action = nextProjectAction(project);
  const links = projectResourceLinks(project.links);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" });
    if (preview) return;
    let active = true;
    listProjectMembers(project.id).then(items => { if (active) setTeam({ projectId: project.id, items, error: false }); }).catch(() => { if (active) setTeam({ projectId: project.id, items: [], error: true }); });
    return () => { active = false; };
  }, [project.id, preview]);
  const members = team?.projectId === project.id ? team : null;
  return <article className={s.detail} data-project-detail>
    <Link href={collaboratorProjectHref(undefined, preview)} className={s.back}><ArrowLeft size={16}/>Todos os meus projetos</Link>
    <header className={s.detailHeading}><span className={s.status} data-stage={projectStage(project.status)}>{projectStageLabels[projectStage(project.status)]}</span><h1 ref={heading} tabIndex={-1}>{project.title}</h1><p>{project.description}</p><div className={s.facts}><Deadline project={project}/>{project.clientName && <span>Cliente: {project.clientName}</span>}<span>Prioridade {priorities[project.priority ?? "medium"].toLowerCase()}</span></div></header>
    <div className={s.detailGrid}><div><section className={s.next}><span>SEU PRÓXIMO PASSO</span><h2>{action.label}</h2><p>{action.reason}</p><Link href="/mensagens?area=work"><MessageCircle size={17}/>Abrir conversas do trabalho<ArrowRight size={16}/></Link><small>Ao conversar, informe o nome deste projeto para contextualizar a entrega.</small></section>
      <section className={s.section}><h2>O que vamos construir</h2><p className={s.briefing}>{project.briefing?.trim() || "O briefing detalhado ainda não foi registrado. Alinhe escopo, formato e critério de entrega com a equipe."}</p></section>
      <section className={s.section}><h2>Materiais e links</h2>{links.length ? <div className={s.resources}>{links.map((link, index) => <a key={`${link.href}-${index}`} href={link.href} target="_blank" rel="noopener noreferrer"><span><strong>{link.label}</strong><small>{new URL(link.href).hostname}</small></span><ExternalLink size={17}/></a>)}</div> : <p>Ainda não há links registrados neste projeto.</p>}</section>
    </div><aside><section className={s.sidePanel}><h2>Andamento do projeto</h2><Progress project={project}/><p>O status e o percentual são os dados informados pela equipe. Consulte o briefing para combinar a sua parte da entrega.</p></section>
      <section className={s.sidePanel}><h2><Users size={18}/>Equipe do projeto</h2>{preview ? <p>Na sua conta, os integrantes deste projeto aparecem aqui. Esta prévia usa apenas projetos demonstrativos.</p> : !members ? <p role="status">Buscando a equipe…</p> : members.error ? <p role="status">Não foi possível atualizar os integrantes. Você pode continuar pelas conversas do trabalho.</p> : members.items.length ? <ul className={s.team}>{members.items.map(member => <li key={member.id}><div><strong>{member.name}</strong><small>{member.roleLabel || "Colaborador"}</small></div><Link href={`/mensagens?area=work&openUserId=${encodeURIComponent(member.id)}`} aria-label={`Enviar mensagem para ${member.name}`}><MessageCircle size={18}/></Link></li>)}</ul> : <p>A equipe ainda não foi registrada neste projeto.</p>}</section>
    </aside></div>
  </article>;
}
function Workspace({ projects, loading = false, error = "", onRetry, preview = false }: Props) {
  const params = useSearchParams();
  const [view, setView] = useState<"list" | "board">("list");
  const [filter, setFilter] = useState<ProjectStage | "all">("all");
  const selected = findAuthorizedProject(projects, params.get("projeto"));
  const ordered = sortCollaboratorProjects(projects);
  const visible = ordered.filter(project => filter === "all" || projectStage(project.status) === filter);
  return <div className={s.workspace} data-project-workspace>
    {loading ? <p className={s.loading} role="status">Buscando seus projetos…</p> : error ? <section className={s.empty} role="alert"><h1>Os projetos não carregaram.</h1><p>{error}</p>{onRetry && <button onClick={onRetry}><RefreshCw size={16}/>Tentar novamente</button>}</section> : selected.kind === "found" ? <ProjectDetail project={selected.project} preview={preview}/> : selected.kind === "unavailable" ? <section className={s.empty}><FolderOpen size={34}/><h1>Projeto não disponível nesta lista.</h1><p>Volte aos seus projetos para escolher um trabalho ao qual você tem acesso.</p><Link href={collaboratorProjectHref(undefined, preview)}>Ver meus projetos<ArrowRight size={17}/></Link></section> : <>
      <header className={s.heading}><div><span>SEU TRABALHO</span><h1>Meus projetos</h1><p>Abra um projeto para ver o briefing, os materiais e o próximo passo.</p></div><div className={s.viewSwitch} role="group" aria-label="Visualização dos projetos"><button aria-pressed={view === "list"} onClick={() => setView("list")}><List size={16}/>Lista</button><button aria-pressed={view === "board"} onClick={() => setView("board")}><LayoutGrid size={16}/>Quadro</button></div></header>
      {!projects.length ? <section className={s.empty}><FolderOpen size={36}/><h2>Seu primeiro projeto começa por uma conexão.</h2><p>Prepare seu perfil e veja as oportunidades disponíveis.</p><Link href="/colaborador/vagas">Ver oportunidades<ArrowRight size={17}/></Link></section> : <>
        <div className={s.filters} aria-label="Filtrar projetos"><button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Todos <span>{projects.length}</span></button>{stages.map(stage => <button key={stage} aria-pressed={filter === stage} onClick={() => setFilter(stage)}>{stage === "completed" && <Check size={12}/>} {projectStageLabels[stage]} <span>{projects.filter(project => projectStage(project.status) === stage).length}</span></button>)}</div>
        {view === "board" ? <div className={s.board}>{stages.filter(stage => filter === "all" || filter === stage).map(stage => <section key={stage}><h2 className={s.columnHeading}>{projectStageLabels[stage]}</h2>{visible.filter(project => projectStage(project.status) === stage).map(project => <ProjectCard key={project.id} project={project} preview={preview}/>)}{!visible.some(project => projectStage(project.status) === stage) && <p className={s.noColumn}>Nenhum projeto aqui.</p>}</section>)}</div> : <div className={s.projectList}>{visible.map(project => <ProjectCard key={project.id} project={project} preview={preview}/>)}</div>}
        {!visible.length && <p className={s.loading}>Nenhum projeto neste filtro. Escolha outro status.</p>}
      </>}
    </>}
  </div>;
}
export default function ProjectWorkspace(props: Props) { return <Suspense fallback={<p role="status">Abrindo seus projetos…</p>}><Workspace {...props}/></Suspense>; }
