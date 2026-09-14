import Link from "next/link";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { ArrowRight, ArrowUpRight, Briefcase, FolderOpen, Layers, MessageSquare, UserRound, Users } from "lucide-react";
import type { Project, Job, JobApplication } from "@/lib/api";
import { EmptyState, LoadingRows, SectionHead } from "./PortalPrimitives";
import { displayDate, projectIsComplete, projectStatusLabel, safeProgress } from "./portalPresentation";
import s from "./PortalExperience.module.css";

export type CollaboratorHomeProps = { name: string; projects: Project[]; jobs: Job[]; applications: JobApplication[]; loading: boolean; failed: string[]; retry: () => void };
const statusLabels = { pending: "Enviada", reviewing: "Em análise", accepted: "Aceita", declined: "Processo encerrado", withdrawn: "Retirada" };

export default function CollaboratorHome({ name, projects, jobs, applications, loading, failed, retry }: CollaboratorHomeProps) {
  const active = projects.filter(project => !projectIsComplete(project.status));
  const featured = active[0] || projects[0];
  const remaining = projects.filter(project => project.id !== featured?.id);
  const projectProgress = safeProgress(featured?.progress);
  const projectDate = displayDate(featured?.dueDate);
  const projectsAvailable = !loading && !failed.includes("projetos");

  return <div className={`${s.home} ${s.work}`}>
    <header className={s.deskHeader}>
      <div><span className={s.eyebrow}>Orbitamos Studio / {name}</span><h1>Mesa de<br/>trabalho<span>.</span></h1></div>
      <div className={s.deskNumbers} aria-label="Resumo da colaboração">
        <Link href="/colaborador/projetos"><strong>{projectsAvailable ? String(active.length).padStart(2, "0") : "—"}</strong><span>Projetos ativos<ArrowUpRight size={13}/></span></Link>
        <Link href="/colaborador/vagas"><strong>{loading || failed.includes("vagas") ? "—" : String(jobs.length).padStart(2, "0")}</strong><span>Oportunidades<ArrowUpRight size={13}/></span></Link>
        <Link href="/colaborador/candidaturas"><strong>{loading || failed.includes("candidaturas") ? "—" : String(applications.length).padStart(2, "0")}</strong><span>Candidaturas<ArrowUpRight size={13}/></span></Link>
      </div>
    </header>
    {failed.length > 0 && <div className={s.notice} role="alert"><span>Não foi possível atualizar {failed.join(", ")}. Tente carregar novamente.</span><button onClick={retry}>Tentar novamente</button></div>}

    <section className={s.projectWorkbench} aria-label="Bancada de projetos">
      <div className={s.projectSheet}>
        <div className={s.sheetMast}><span>ORBITAMOS / CADERNO DE PROJETO</span><FolderOpen size={20}/></div>
        {loading ? <LoadingRows/> : failed.includes("projetos") ? <div className={s.sheetEmpty}><h2>Seus projetos<br/>não carregaram.</h2><p>Tente atualizar a bancada novamente para consultar o histórico e suas entregas.</p></div> : featured ? <>
          <div className={s.projectIdentity}><span>P—{String(featured.id).padStart(3, "0")}</span><span>{projectStatusLabel(featured.status)}</span></div>
          <h2>{featured.title}</h2>
          <p className={s.projectBrief}>{featured.briefing || featured.description || "Consulte os detalhes do projeto para alinhar sua próxima entrega."}</p>
          <dl className={s.projectFacts}><div><dt>Cliente</dt><dd>{featured.clientName || "Não informado"}</dd></div><div><dt>Prazo de entrega</dt><dd>{projectDate || "A definir"}</dd></div></dl>
          <div className={s.deliveryMeter}>
            <div><span>Progresso da entrega</span><strong>{projectProgress === null ? "—" : `${projectProgress}%`}</strong></div>
            <div className={s.progress} role="progressbar" aria-label={`Progresso de ${featured.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={projectProgress ?? undefined}><span style={{ width: `${projectProgress ?? 0}%` }}/></div>
          </div>
          <Link href="/colaborador/projetos" className={s.sheetAction}>Abrir meus projetos<ArrowUpRight size={21}/></Link>
        </> : <div className={s.sheetEmpty}><span className={s.projectIdentity}>SEU PRIMEIRO BRIEFING</span><h2>Um espaço para<br/>o seu trabalho.</h2><p>Você ainda não participa de um projeto. Prepare seu perfil e portfólio para se apresentar às próximas oportunidades.</p><Link href="/colaborador/perfil" className={s.sheetAction}>Preparar meu perfil<ArrowUpRight size={21}/></Link></div>}
        <span className={s.sheetEdge} aria-hidden="true"/>
      </div>
      <div className={s.projectIndex}>
        <div className={s.indexHeading}><span className={s.eyebrow}>Arquivo de trabalho</span><span>{projectsAvailable ? `${projects.length - active.length} concluídos` : "Sincronizando"}</span></div>
        <h2>Na bancada.</h2>
        {loading ? <LoadingRows/> : failed.includes("projetos") ? <p className={s.muted}>O arquivo volta a aparecer quando a sincronização terminar.</p> : remaining.length ? <div className={s.indexRows}>{remaining.slice(0, 3).map(project => <Link href="/colaborador/projetos" key={project.id}><span className={s.indexId}>P—{String(project.id).padStart(3, "0")}</span><h3>{project.title}</h3><span className={s.indexStatus}>{projectStatusLabel(project.status)}<ArrowUpRight size={16}/></span></Link>)}</div> : <div className={s.indexEmpty}><Layers size={36} strokeWidth={1}/><p>{featured ? "Este é o seu projeto em destaque. Outros trabalhos aparecem neste arquivo." : "Dos exercícios aos trabalhos para clientes: seu portfólio pode mostrar como você resolve problemas."}</p></div>}
        <Link href="/colaborador/portfolio" className={`${s.portfolioLink} ${s.portfolioPhotoLink}`}><OrbitPhoto kind="criacao" className={s.portfolioThumbnail} sizes="120px"/><span><small>SUA APRESENTAÇÃO</small>Organizar portfólio</span><ArrowUpRight size={22}/></Link>
      </div>
    </section>

    <div className={s.studioLower}>
      <section className={s.opportunityBoard}>
        <SectionHead label="Chamadas abertas" title="Próximas conexões." href="/colaborador/vagas" action="Ver vagas"/>
        {loading ? <LoadingRows/> : failed.includes("vagas") ? <p className={s.muted}>Não foi possível atualizar as oportunidades.</p> : jobs.length ? <div className={s.jobList}>{jobs.slice(0, 3).map((job, index) => <Link href={`/colaborador/vagas/${job.id}`} key={job.id}>
          <span className={s.jobNumber}>{String(index + 1).padStart(2, "0")}</span>
          <div><span className={s.jobType}>{[job.type, job.workModel].filter(Boolean).join(" / ")}</span><h3>{job.title}</h3><p>{job.budgetLabel || "Condições nos detalhes da vaga"}</p>{job.skills?.slice(0, 3).map(skill => <span className={s.tag} key={skill}>{skill}</span>)}</div><ArrowUpRight size={20}/>
        </Link>)}</div> : <EmptyState icon={Users} title="Nenhuma chamada aberta agora." href="/colaborador/squad" action="Conhecer o squad">Enquanto novas vagas não chegam, conheça as pessoas com quem você pode colaborar.</EmptyState>}
      </section>
      <section className={s.activityColumn}>
        <span className={s.eyebrow}>Acompanhamento</span><h2>Suas<br/>candidaturas.</h2>
        {loading ? <LoadingRows/> : failed.includes("candidaturas") ? <p className={s.muted}>Não foi possível carregar suas candidaturas.</p> : applications.length ? <ol className={s.applicationList}>{applications.slice(0, 4).map(application => <li key={application.id}><span className={s.applicationDate}>{displayDate(application.createdAt) || "Data não informada"}</span><h3>{application.jobTitle}</h3><span className={s.applicationStatus}>{statusLabels[application.status]}</span></li>)}</ol> : <div className={s.applicationEmpty}><Briefcase size={25}/><p>Suas candidaturas e os retornos de cada processo ficam reunidos aqui.</p></div>}
        <Link href="/colaborador/candidaturas" className={s.textLink}>Acompanhar processos<ArrowRight size={15}/></Link>
      </section>
    </div>
    <nav className={s.studioUtilities} aria-label="Ferramentas do colaborador">
      <Link href="/colaborador/perfil"><UserRound size={20}/><span>Perfil & disponibilidade</span><ArrowUpRight size={17}/></Link>
      <Link href="/mensagens"><MessageSquare size={20}/><span>Conversas do trabalho</span><ArrowUpRight size={17}/></Link>
      <Link href="/colaborador/squad"><Users size={20}/><span>Pessoas do meu squad</span><ArrowUpRight size={17}/></Link>
    </nav>
    <footer className={s.portalFooter}><span>Uma nova habilidade também entra no portfólio.</span><Link href="/estudante">Voltar para a Academy<ArrowUpRight size={16}/></Link></footer>
  </div>;
}
