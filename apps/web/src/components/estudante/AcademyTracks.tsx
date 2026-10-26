import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Code2, Compass, Database, Map } from "lucide-react";
import { academyCatalogDestination, getAcademyCatalog } from "@/lib/academyCatalog";
import type { Curso } from "@/lib/cursos";
import s from "./AcademyTracks.module.css";
import AcademyStudyPathPicker from "./AcademyStudyPathPicker";

type Props = { courses?: Curso[]; preview?: boolean; children?: ReactNode; loading?: boolean; error?: boolean; userId?: string | number | null };

export default function AcademyTracks({ courses = [], preview = false, children, loading = false, error = false, userId }: Props) {
  const entries = getAcademyCatalog(courses);
  const practical = entries.filter(entry => entry.format !== "Aulas em vídeo");
  const videos = entries.filter(entry => entry.format === "Aulas em vídeo");
  return <div className={s.catalog} data-academy-tracks>
    <header className={s.heading}><p>ORBITAMOS ACADEMY / TRILHAS</p><h1>Um caminho claro.<br/><em>Um próximo passo possível.</em></h1><div>Escolha o assunto que quer aprender. Aulas, prática e apoio ficam juntos, com o formato de cada conteúdo explicado.</div></header>
    {children}
    <AcademyStudyPathPicker userId={userId} preview={preview}/>
    {preview && <p className={s.notice}>Prévia de navegação. As aulas em vídeo e os mapas de carreira continuam nas rotas do portal e pedem sua conta para abrir.</p>}
    <section aria-labelledby="practical-tracks"><div className={s.sectionHeading}><div><span>APRENDER FAZENDO</span><h2 id="practical-tracks">Caminhos com prática guiada.</h2></div><p>Você pode começar sem instalar ferramentas.</p></div>
      <div className={s.practical}>{practical.map(entry => <article key={entry.id} className={s.track} data-tone={entry.tone}>
        <div className={s.trackTop}><span>{entry.format}</span>{entry.id === "csharp" ? <Code2 size={25} aria-hidden="true"/> : <Database size={25} aria-hidden="true"/>}</div>
        <h3>{entry.title}</h3><p>{entry.description}</p><div className={s.available}>{entry.available}</div>{entry.boundary && <small>{entry.boundary}</small>}
        <Link className={s.primary} href={academyCatalogDestination(entry, preview)}>Abrir {entry.id === "csharp" ? "trilha C#" : "aventura SQL"}<ArrowRight size={17}/></Link>
        {entry.courses.length > 0 && <details className={s.support}><summary><BookOpen size={15}/> Aulas em vídeo para apoiar este caminho</summary><div>{entry.courses.map(course => <Link key={course.slug} href={`/estudante/cursos/${course.slug}`}><span>{course.titulo}</span><ArrowRight size={15}/></Link>)}</div></details>}
      </article>)}</div>
    </section>
    <section aria-labelledby="video-library"><div className={s.sectionHeading}><div><span>ESTUDE E CONSULTE</span><h2 id="video-library">Aulas em vídeo por assunto.</h2></div><Link href="/estudante/aulas">Ver biblioteca completa<ArrowRight size={15}/></Link></div>
      <p className={s.description}>Os cursos que você já conhecia continuam disponíveis. Os vídeos de C# e SQL ficam como apoio dos caminhos acima.</p>
      {loading ? <p className={s.notice} role="status">Atualizando a biblioteca de aulas…</p> : error ? <p className={s.notice} role="status">Não foi possível atualizar a biblioteca. Mostramos os cursos locais disponíveis; suas aulas continuam acessíveis.</p> : null}
      {videos.length ? <div className={s.videoGrid}>{videos.map(entry => <article className={s.videoSubject} key={entry.id}><BookOpen size={20} aria-hidden="true"/><span>{entry.format}</span><h3>{entry.title}</h3><p>{entry.description}</p><div>{entry.courses.map(course => <Link key={course.slug} href={`/estudante/cursos/${course.slug}`}><span>{course.titulo}</span><ArrowRight size={15}/></Link>)}</div></article>)}</div> : !loading && <p className={s.notice}>Consulte a biblioteca para encontrar as aulas publicadas na sua conta.</p>}
    </section>
    <section className={s.nextOptions} aria-label="Outros caminhos de estudo"><article><Compass size={24} aria-hidden="true"/><h2>Ainda escolhendo sua direção?</h2><p>Consulte os mapas de carreira para entender como habilidades e projetos se conectam. Seus checks anteriores continuam no mesmo lugar.</p><Link href="/estudante/orbita">Explorar mapas de carreira<Map size={16}/></Link></article><article><Code2 size={24} aria-hidden="true"/><h2>Quer experimentar agora?</h2><p>Abra o laboratório para escrever código ou escolha um jogo, uma atividade visual ou uma revisão.</p><Link href={preview ? "/dev/academy-preview?view=practice" : "/estudante/jogos"}>Explorar formas de praticar<ArrowRight size={16}/></Link></article></section>
  </div>;
}
