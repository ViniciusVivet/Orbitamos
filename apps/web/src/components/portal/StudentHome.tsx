import Link from "next/link";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { coursePhotoKind } from "@/components/brand/orbitamosPhotography";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Circle, Code2, Gamepad2, GraduationCap, Play } from "lucide-react";
import type { DashboardProgress, DashboardSummary } from "@/lib/api";
import { totalAulas, type Curso } from "@/lib/cursos";
import { flattenCourseLessons, type FlatLesson } from "@/lib/learningExperience";
import { EmptyState, LoadingRows, SectionHead } from "./PortalPrimitives";
import { courseEdition } from "./portalPresentation";
import s from "./PortalExperience.module.css";

export type StudentHomeProps = {
  name: string; progress: DashboardProgress; progressLoading: boolean; courses: Curso[];
  nextLesson: FlatLesson | null; completedLessons: number; loading: boolean;
  error: string; summary: DashboardSummary | null; retry: () => void;
};

export default function StudentHome({ name, progress, progressLoading, courses, nextLesson, completedLessons, loading, error, summary, retry }: StudentHomeProps) {
  const total = courses.reduce((sum, course) => sum + totalAulas(course), 0);
  const percent = total ? Math.min(100, Math.round(completedLessons / total * 100)) : 0;
  const allDone = !loading && !error && total > 0 && completedLessons >= total;
  const href = nextLesson ? `/estudante/cursos/${nextLesson.curso.slug}` : "/estudante/aulas";
  const recommended = nextLesson ? [nextLesson.curso, ...courses.filter(c => c.id !== nextLesson.curso.id)].slice(0, 3) : courses.slice(0, 3);
  const sequence = nextLesson && !allDone ? flattenCourseLessons(nextLesson.curso).slice(nextLesson.index, nextLesson.index + 3) : [];
  const checklist = summary?.weeklyChecklist ?? [];

  return <div className={s.home}>
    <header className={s.journalHeader}>
      <div><span className={s.eyebrow}>OrbitAcademy / Caderno de bordo</span><p>Seu espaço de estudo, <strong>{name}.</strong></p></div>
      <Link href="/estudante/orbita" className={s.textLink}>Minha jornada<ArrowUpRight size={16}/></Link>
    </header>
    {error && <div className={s.notice} role="alert"><span>{error}</span><button onClick={retry}>Tentar novamente</button></div>}

    <section className={s.academyStage} aria-label="Seu próximo estudo">
      <div className={s.lessonLead}>
        <div className={s.lessonLabel}><span className={s.liveDot}/>{loading ? "Preparando seu caderno" : allDone ? "Ciclo de aulas concluído" : nextLesson ? "Sua próxima aula" : "Primeira página"}</div>
        <p className={s.courseContext}>{allDone ? "Seu ciclo de estudo" : nextLesson?.curso.titulo || "Aulas, exercícios e projetos autorais"}</p>
        <h1>{loading ? "Abrindo seu espaço de estudo…" : allDone ? "A teoria está em dia. Hora de experimentar." : nextLesson?.aula.titulo || "O que você quer aprender hoje?"}</h1>
        <div className={s.lessonFoot}>
          <p>{allDone ? "Todas as aulas disponíveis foram concluídas." : nextLesson ? <><span>Módulo</span>{nextLesson.moduloTitulo}</> : "Escolha uma trilha. A sua sequência de aulas aparece aqui."}</p>
          <Link href={allDone ? "/estudante/pratica" : href} className={s.primary}>{allDone ? "Ir para a prática" : nextLesson ? "Continuar minha aula" : "Explorar aulas"}<Play size={15} fill="currentColor"/></Link>
        </div>
      </div>
      <div className={s.syllabus}>
        <div className={s.syllabusHead}><span>SEQUÊNCIA DE ESTUDO</span><BookOpen size={18}/></div>
        {loading ? <LoadingRows/> : sequence.length ? <>
          <div className={s.chapterNumber}><strong>{String(nextLesson!.index + 1).padStart(2, "0")}</strong><span>de {nextLesson!.total}<br/>aulas no curso</span></div>
          <ol className={s.chapterList}>{sequence.map((lesson, index) => <li key={lesson.aula.id} className={index === 0 ? s.currentChapter : ""}><span className={s.chapterDot}/><div><small>{index === 0 ? "COMECE POR AQUI" : `AULA ${String(lesson.index + 1).padStart(2, "0")}`}</small><p>{lesson.aula.titulo}</p></div>{index === 0 && <ArrowRight size={18}/>}</li>)}</ol>
          <Link href={href} className={s.textLink}>Ver programa completo<ArrowRight size={15}/></Link>
        </> : <div className={s.syllabusEmpty}><span className={s.notebookLines} aria-hidden="true"/><h2>{allDone ? "Próxima página: prática." : "Seu caminho começa por uma escolha."}</h2><p>{allDone ? "Use o laboratório para testar o que aprendeu. As aulas continuam disponíveis para consulta." : "Lógica, desenvolvimento web, dados e colaboração. Explore o catálogo no seu ritmo."}</p><Link href="/estudante/aulas" className={s.textLink}>{allDone ? "Revisitar aulas" : "Conhecer as trilhas"}<ArrowRight size={15}/></Link></div>}
      </div>
    </section>

    <div className={s.learningRecord} aria-label="Seu progresso">
      <div className={s.recordProgress}><div className={s.caption}><span>Aulas concluídas</span><strong>{loading || error ? "—" : `${completedLessons} / ${total}`}</strong></div><div className={s.progress} role="progressbar" aria-label="Aulas concluídas na Academy" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loading || error ? undefined : percent}><span style={{ width: `${loading || error ? 0 : percent}%` }}/></div></div>
      <div><strong>{progressLoading || error ? "—" : progress.xp}</strong><span>XP conquistados</span></div>
      <div><strong>{progressLoading || error ? "—" : progress.streakDays}</strong><span>Dias em sequência</span></div>
      <Link href="/estudante/progresso"><strong>{progressLoading || error ? "—" : `Nível ${progress.level}`}</strong><span>Ver minha evolução <ArrowUpRight size={12}/></span></Link>
    </div>

    <section className={s.shelfSection} aria-label="Biblioteca de cursos">
      <SectionHead label="Sua biblioteca" title="Na sua estante." href="/estudante/aulas" action="Todas as trilhas"/><p className={s.shelfHint}>Deslize para explorar a estante <ArrowRight size={13}/></p>
      {loading ? <LoadingRows/> : recommended.length ? <div className={s.courseShelf} data-course-shelf>{recommended.map(course => {
        const edition = courseEdition(course);
        return <Link href={`/estudante/cursos/${course.slug}`} className={s.courseBook} key={course.id}>
          <div className={`${s.bookCover} ${s.photographicBook}`}><OrbitPhoto kind={coursePhotoKind(course.slug)} fill sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"/><div className={s.bookImprint}><span>ORBITAMOS<br/>ACADEMY</span><ArrowUpRight size={20}/></div><h3>{course.titulo}</h3><span className={s.bookField}>{edition.field}</span></div>
          <div className={s.bookCaption}><span>{totalAulas(course)} {totalAulas(course) === 1 ? "aula" : "aulas"} · {course.modulos.length} {course.modulos.length === 1 ? "módulo" : "módulos"}</span><span>{allDone ? "Revisitar" : course.id === nextLesson?.curso.id ? "Em estudo" : "Explorar"}<ArrowRight size={14}/></span></div>
        </Link>;
      })}</div> : <EmptyState icon={BookOpen} title={error ? "A biblioteca não carregou." : "A sua estante ainda está aberta."} href="/estudante/aulas" action="Abrir catálogo">{error ? "Tente atualizar a página ou consulte o catálogo de aulas." : "Explore os assuntos disponíveis e encontre uma trilha para começar."}</EmptyState>}
    </section>

    <div className={s.learningBottom}>
      <section className={s.practiceBench}>
        <div className={s.benchHeading}><span className={s.eyebrow}>Da aula para a prática</span><h2>Bancada de<br/>experimentos<span>.</span></h2><p>Um lugar para testar, errar e entender por quê.</p></div>
        <Link href="/estudante/pratica" className={s.benchAction}><Code2 size={22}/><div><h3>Laboratório de código</h3><p>Escreva e execute no navegador.</p></div><ArrowUpRight/></Link>
        <Link href="/estudante/jogos" className={s.benchAction}><Gamepad2 size={22}/><div><h3>Jogos de lógica</h3><p>Treine o raciocínio em uma partida.</p></div><ArrowUpRight/></Link>
      </section>
      <section className={s.studyNote}>
        <span className={s.noteTab}>ANOTAÇÃO DE ESTUDO</span><h2>Antes de fechar<br/>o caderno.</h2>
        {checklist.length ? <ul className={s.checklist}>{checklist.map(item => <li key={item.label}>{item.done ? <Check size={16} aria-label="Concluído"/> : <Circle size={16} aria-label="Pendente"/>}<span>{item.label}</span></li>)}</ul> : <ol className={s.studySteps}><li>Teste uma ideia da aula no laboratório.</li><li>Identifique o que ainda não entendeu.</li><li>Leve a dúvida para uma mentoria.</li></ol>}
        <Link href="/estudante/mentorias" className={s.textLink}><GraduationCap size={18}/>Encontrar orientação<ArrowRight size={15}/></Link>
      </section>
    </div>
    <footer className={s.portalFooter}><span>Aprendizado também acontece na conversa.</span><Link href="/estudante/comunidade">Ir para a comunidade<ArrowUpRight size={16}/></Link></footer>
  </div>;
}
