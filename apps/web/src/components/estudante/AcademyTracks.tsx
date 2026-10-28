import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Compass, Play } from "lucide-react";
import { academyCatalogDestination, getAcademyCatalog } from "@/lib/academyCatalog";
import type { Curso } from "@/lib/cursos";
import estudo from "../../../public/images/orbitamos/estudo-v1.png";
import criacao from "../../../public/images/orbitamos/criacao-v1.png";
import dados from "../../../public/images/orbitamos/dados-v1.png";
import equipe from "../../../public/images/orbitamos/equipe-v1.png";
import hardware from "../../../public/images/orbitamos/hardware-v1.png";
import fundamentos from "../../../public/images/laboratorio/fundamentos-v1.png";
import projetoCSharp from "../../../public/images/academy/projeto-csharp-v1.webp";
import s from "./AcademyTracks.module.css";
import AcademyStudyPathPicker from "./AcademyStudyPathPicker";

type Props = { courses?: Curso[]; preview?: boolean; children?: ReactNode; loading?: boolean; error?: boolean; userId?: string | number | null };
type TrackVisual = { image: StaticImageData; title: string; description: string; mark: string; steps: string[]; position: string };
const trackVisuals: Record<string, TrackVisual> = {
  fundamentals: { image: estudo, title: "Primeiros passos", description: "Escreva seu primeiro programa, uma etapa por vez.", mark: "JS", steps: ["Dados", "Contas", "Decisões", "Orçamento"], position: "59% 45%" },
  csharp: { image: projetoCSharp, title: "C# & .NET", description: "Dê vida às suas primeiras ideias com código em C#.", mark: "C#", steps: ["Variáveis", "Condições", "Laços"], position: "54% 45%" },
  sql: { image: dados, title: "SQL com Orbi", description: "Ajude uma loja a encontrar as respostas nos dados.", mark: "SQL", steps: ["Tabelas", "Filtros", "Consultas"], position: "42% 45%" },
};
const videoCovers: Record<string, StaticImageData> = { logic: fundamentos, web: criacao, git: equipe, "data-tools": dados, computers: hardware };

export default function AcademyTracks({ courses = [], preview = false, children, loading = false, error = false, userId }: Props) {
  const entries = getAcademyCatalog(courses);
  const practical = entries.filter(entry => entry.format !== "Aulas em vídeo");
  const videos = entries.filter(entry => entry.format === "Aulas em vídeo");
  return <div className={s.catalog} data-academy-tracks>
    <header className={s.heading}><div><p>SUAS TRILHAS</p><h1>O que você quer aprender?</h1><span>Escolha um caminho. A gente começa do começo.</span></div><a href="#video-library" className={s.libraryShortcut}><BookOpen size={17}/> Procurando uma aula?<ArrowRight size={15}/></a></header>
    {children}
    <section aria-labelledby="practical-tracks">
      <h2 id="practical-tracks" className={s.srOnly}>Caminhos com prática guiada</h2>
      <div className={s.practical}>{practical.map((entry, index) => {
        const visual = trackVisuals[entry.id] ?? trackVisuals.fundamentals;
        return <article key={entry.id} className={s.track} data-tone={entry.tone} data-foundations={entry.id === "fundamentals"}>
          <div className={s.cover}><Image src={visual.image} alt="" fill placeholder="blur" loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) 45vw, 360px" style={{ objectPosition: visual.position }}/><span className={s.trackBadge}>{entry.id === "fundamentals" ? "PARA QUEM VAI COMEÇAR" : entry.id === "csharp" ? "APRENDA PROGRAMANDO" : "UMA MISSÃO COM O ORBI"}</span><span className={s.trackMark}>{visual.mark}</span></div>
          <div className={s.trackBody}><h3>{visual.title}</h3><p>{visual.description}</p><ol className={s.milestones} aria-label={`O que você vai praticar em ${visual.title}`}>{visual.steps.map((step, stepIndex) => <li key={step}><b>{String(stepIndex + 1).padStart(2, "0")}</b>{step}</li>)}</ol>
            <Link className={s.primary} href={academyCatalogDestination(entry, preview)}>{entry.id === "fundamentals" ? "Começar meus primeiros passos" : entry.id === "csharp" ? "Abrir trilha C#" : "Abrir aventura SQL"}<ArrowRight size={17}/></Link>
            <details className={s.support}><summary>O que está disponível</summary><div><p>{entry.available}</p>{entry.boundary && <p>{entry.boundary}</p>}{entry.courses.map(course => <Link key={course.slug} href={`/estudante/cursos/${course.slug}`}><BookOpen size={15}/><span>{course.titulo}</span><ArrowRight size={15}/></Link>)}</div></details>
          </div>
        </article>;
      })}</div>
    </section>
    <AcademyStudyPathPicker userId={userId} preview={preview} compact/>
    <section id="video-library" aria-labelledby="video-library-heading" className={s.videoSection}>
      <div className={s.sectionHeading}><div><span>PARA ASSISTIR E CONSULTAR</span><h2 id="video-library-heading">Aprenda também com as aulas.</h2></div><Link href="/estudante/aulas">Ver biblioteca completa<ArrowRight size={15}/></Link></div>
      {loading ? <p className={s.notice} role="status">Atualizando as aulas…</p> : error ? <p className={s.notice} role="status">Não conseguimos atualizar agora. Estas aulas continuam disponíveis.</p> : null}
      {videos.length ? <div className={s.videoGrid}>{videos.map(entry => <article className={s.videoSubject} key={entry.id}><div className={s.videoCover}><Image src={videoCovers[entry.id] ?? estudo} alt="" fill placeholder="blur" sizes="(max-width: 650px) calc(100vw - 40px), (max-width: 1100px) 43vw, 350px"/><span><Play size={15} fill="currentColor"/> AULAS EM VÍDEO</span></div><div className={s.videoBody}><h3>{entry.title}</h3><div>{entry.courses.map(course => <Link key={course.slug} href={`/estudante/cursos/${course.slug}`}><span>{course.titulo}</span><ArrowRight size={15}/></Link>)}</div></div></article>)}</div> : !loading && <p className={s.notice}>Encontre as aulas publicadas na biblioteca da sua conta.</p>}
    </section>
    <section className={s.nextOptions} aria-label="Outros caminhos de estudo"><Link href="/estudante/orbita"><div className={s.optionCover}><Image src={equipe} alt="" fill placeholder="blur" sizes="160px"/></div><div><span>DE OLHO NO FUTURO</span><h2>Conheça as carreiras.</h2><p>Veja o que estudar em cada direção.</p><strong>Explorar mapas<ArrowRight size={16}/></strong></div></Link><Link href={preview ? "/dev/academy-preview?view=practice" : "/estudante/jogos"}><div className={s.optionCover}><Image src={fundamentos} alt="" fill placeholder="blur" sizes="160px"/></div><div><span>QUER EXPERIMENTAR?</span><h2>Aprenda jogando.</h2><p>Uma descoberta de cada vez, com o Orbi.</p><strong>Escolher uma atividade<ArrowRight size={16}/></strong></div></Link></section>
    {preview && <details className={s.previewNote}><summary><Compass size={14}/> Sobre esta prévia</summary><p>As práticas estão disponíveis aqui. Aulas em vídeo e mapas de carreira pedem sua conta para abrir.</p></details>}
  </div>;
}
