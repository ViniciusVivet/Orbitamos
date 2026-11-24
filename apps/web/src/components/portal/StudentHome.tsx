import Link from "next/link";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { coursePhotoKind } from "@/components/brand/orbitamosPhotography";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Circle, GraduationCap } from "lucide-react";
import type { DashboardProgress, DashboardSummary } from "@/lib/api";
import { totalAulas, type CursoResumo } from "@/lib/cursos";
import { type FlatLessonResumo } from "@/lib/learningExperience";
import AcademyContinue from "@/components/estudante/AcademyContinue";
import { academyPreviewHref } from "@/lib/portalNavigation";
import { EmptyState, LoadingRows } from "./PortalPrimitives";
import { courseEdition } from "./portalPresentation";
import s from "./PortalExperience.module.css";
import home from "./StudentHome.module.css";

export type StudentHomeProps = {
  name: string; progress: DashboardProgress; progressLoading: boolean; courses: CursoResumo[];
  nextLesson: FlatLessonResumo | null; completedLessons: number; loading: boolean;
  error: string; summary: DashboardSummary | null; retry: () => void;
  userId?: string | number | null; preview?: boolean;
};

export default function StudentHome({ name, progress, progressLoading, courses, nextLesson, completedLessons, loading, error, summary, retry, userId, preview = false }: StudentHomeProps) {
  const total = courses.reduce((sum, course) => sum + totalAulas(course), 0);
  const remaining = Math.max(0, total - completedLessons);
  const percent = total ? Math.min(100, Math.round(completedLessons / total * 100)) : 0;
  const allDone = !loading && !error && total > 0 && completedLessons >= total;
  const href = nextLesson ? `/estudante/cursos/${nextLesson.curso.slug}` : "/estudante/aulas";
  const recommended = nextLesson ? [nextLesson.curso, ...courses.filter(c => c.id !== nextLesson.curso.id)].slice(0, 3) : courses.slice(0, 3);
  const checklist = summary?.weeklyChecklist ?? [];
  const link = (target: string) => preview ? academyPreviewHref(target) : target;

  return <div className={`${s.home} ${home.home}`} data-student-home>
    <header className={home.heading}><p>Seu espaço de estudo, <strong>{name}.</strong></p></header>
    {error && <div className={s.notice} role="alert"><span>{error}</span><button onClick={retry}>Tentar novamente</button></div>}

    <AcademyContinue userId={userId} preview={preview} loading={loading} nextLessonHref={completedLessons > 0 && nextLesson && !allDone ? href : undefined} nextLessonTitle={completedLessons > 0 && nextLesson && !allDone ? nextLesson.aula.titulo : undefined}
      progressSummary={<dl className={home.summary} aria-label="Seu progresso">
        <div><dt>Aulas restantes</dt><dd>{loading || error ? "—" : remaining}</dd></div>
        <div><dt>XP</dt><dd>{progressLoading || error ? "—" : progress.xp}</dd></div>
        <div><dt>Nível</dt><dd>{progressLoading || error ? "—" : progress.level}</dd></div>
      </dl>}/>

    <section className={s.shelfSection} aria-label="Biblioteca de cursos">
      <header className={home.shelfHeading}><h2>Na sua estante</h2><Link href={link("/estudante/aulas")}>Ver todas<ArrowUpRight size={14}/></Link></header>
      {loading ? <LoadingRows/> : recommended.length ? <div className={s.courseShelf} data-course-shelf>{recommended.map(course => {
        const edition = courseEdition(course);
        return <Link href={link(`/estudante/cursos/${course.slug}`)} className={s.courseBook} key={course.id}>
          <div className={`${s.bookCover} ${s.photographicBook}`}><OrbitPhoto kind={coursePhotoKind(course.slug)} fill sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"/><div className={s.bookImprint}><span>ORBITAMOS<br/>ACADEMY</span><ArrowUpRight size={20}/></div><h3>{course.titulo}</h3><span className={s.bookField}>{edition.field}</span></div>
          <div className={s.bookCaption}><span>{totalAulas(course)} {totalAulas(course) === 1 ? "aula" : "aulas"} · {course.modulos.length} {course.modulos.length === 1 ? "módulo" : "módulos"}</span><span>{allDone ? "Revisitar" : course.id === nextLesson?.curso.id ? "Em estudo" : "Explorar"}<ArrowRight size={14}/></span></div>
        </Link>;
      })}</div> : <EmptyState icon={BookOpen} title={error ? "A biblioteca não carregou." : "A sua estante ainda está aberta."} href={link("/estudante/aulas")} action="Abrir catálogo">{error ? "Tente atualizar a página ou consulte o catálogo de aulas." : "Explore os assuntos disponíveis e encontre uma trilha para começar."}</EmptyState>}
    </section>

    <details className={home.recordDetails}>
      <summary>Detalhes do meu progresso<ArrowUpRight size={15}/></summary>
      <div className={home.record}><div className={s.caption}><span>Aulas concluídas</span><strong>{loading || error ? "—" : `${completedLessons} / ${total}`}</strong></div><div className={s.progress} role="progressbar" aria-label="Aulas concluídas na Academy" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loading || error ? undefined : percent}><span style={{ width: `${loading || error ? 0 : percent}%` }}/></div><p>{progressLoading || error ? "—" : progress.streakDays} dias em sequência</p><Link href={link("/estudante/progresso")}>Ver minha evolução<ArrowRight size={14}/></Link></div>
    </details>
    <details className={home.studyDetails}>
      <summary>Meu caderno de estudo<ArrowUpRight size={15}/></summary>
      <div className={home.note}>
        {checklist.length ? <ul className={s.checklist}>{checklist.map(item => <li key={item.label}>{item.done ? <Check size={16} aria-label="Concluído"/> : <Circle size={16} aria-label="Pendente"/>}<span>{item.label}</span></li>)}</ul> : <ol className={s.studySteps}><li>Teste uma ideia da aula no laboratório.</li><li>Identifique o que ainda não entendeu.</li><li>Leve a dúvida para uma mentoria.</li></ol>}
        <Link href={link("/estudante/mentorias")} className={s.textLink}><GraduationCap size={18}/>Encontrar orientação<ArrowRight size={15}/></Link>
      </div>
    </details>
    <footer className={s.portalFooter}><span>Aprendizado também acontece na conversa.</span><Link href={link("/estudante/comunidade")}>Ir para a comunidade<ArrowUpRight size={16}/></Link></footer>
  </div>;
}
