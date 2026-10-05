"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, HardDrive, Play, Search, X } from "lucide-react";
import { desafios } from "@/lib/desafios";
import { guidedStorageKey, readGuidedDraft } from "@/lib/guidedPractice";
import { practicePath, practicePaths, type PracticePath } from "@/lib/practiceNarrative";
import { readCatalogView } from "@/lib/practiceExperience";
import { warmPythonRuntime } from "@/lib/browserCodeRunner";
import { useAuth } from "@/contexts/AuthContext";

import s from "@/components/estudante/Laboratory.module.css";
import { getLaboratoryCover } from "@/components/estudante/laboratoryCovers";

const languageNames: Record<string, string> = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", csharp: "C#" };
const languageCodes: Record<string, string> = { javascript: "JS", typescript: "TS", python: "Py", csharp: "C#" };
const difficultyNames: Record<string, string> = { iniciante: "Iniciante", basico: "Básico", intermediario: "Intermediário" };

type ChallengeState = "novo" | "andamento" | "concluido";
type Filter = "todos" | ChallengeState;
type LanguageFilter = "todas" | "javascript" | "python" | "csharp";
type DifficultyFilter = "todas" | "iniciante" | "basico" | "intermediario";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function PraticaCatalog({ userId = null }: { userId?: string | number | null }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [language, setLanguage] = useState<LanguageFilter>("todas");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("todas");
  const [purpose, setPurpose] = useState<PracticePath | "all">("all");
  const [states, setStates] = useState<Record<string, ChallengeState>>({});
  const [reflections, setReflections] = useState<Record<string, boolean>>({});
  const viewKey = `orbitamos-lab-view-v1-${userId ?? "guest"}`;
  const [restoredView, setRestoredView] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let raw = null;
      try { raw = sessionStorage.getItem(viewKey); } catch { /* Filters still work without storage. */ }
      const view = readCatalogView(raw, window.location.search);
      setLanguage(view.language); setPurpose(view.purpose); setDifficulty(view.difficulty); setFilter(view.filter); setQuery(view.query);
      setRestoredView(viewKey);
    });
    return () => { active = false; };
  }, [viewKey]);
  useEffect(() => {
    if (restoredView !== viewKey) return;
    try { sessionStorage.setItem(viewKey, JSON.stringify({ language, purpose, difficulty, filter, query })); } catch { /* Optional convenience, never a blocker to practice. */ }
  }, [restoredView, viewKey, language, purpose, difficulty, filter, query]);

  useEffect(() => {
    Promise.resolve().then(() => {
      const next: Record<string, ChallengeState> = {};
      const nextReflections: Record<string, boolean> = {};
      desafios.forEach((challenge) => {
        if (!userId) {
          next[challenge.slug] = "novo";
          nextReflections[challenge.slug] = false;
          return;
        }
        try {
          const raw = localStorage.getItem(`orbitamos-pratica-${userId}-${challenge.slug}`);
          const guided = readGuidedDraft(localStorage.getItem(guidedStorageKey(userId, challenge.slug)), challenge);
          if (guided.started) {
            let freeDraft: { stepStatus?: string[]; reflection?: string } | null = null;
            try { freeDraft = raw ? JSON.parse(raw) : null; } catch { /* A damaged legacy draft must not hide guided progress. */ }
            const freeDone = freeDraft?.stepStatus?.length === challenge.steps.length && freeDraft.stepStatus.every(status => status === "success");
            next[challenge.slug] = guided.passed.length === challenge.steps.length || freeDone ? "concluido" : "andamento";
            nextReflections[challenge.slug] = Boolean(freeDraft?.reflection?.trim());
            return;
          }
          if (!raw) {
            next[challenge.slug] = "novo";
            nextReflections[challenge.slug] = false;
            return;
          }
          const parsed = JSON.parse(raw) as { stepStatus?: string[]; reflection?: string };
          next[challenge.slug] =
            parsed.stepStatus?.length === challenge.steps.length &&
            parsed.stepStatus.every((status) => status === "success")
              ? "concluido"
              : "andamento";
          nextReflections[challenge.slug] = Boolean(parsed.reflection?.trim());
        } catch {
          next[challenge.slug] = "novo";
          nextReflections[challenge.slug] = false;
        }
      });
      setStates(next);
      setReflections(nextReflections);
    });
  }, [userId]);

  const filteredChallenges = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return desafios.filter((challenge) => {
      const state = states[challenge.slug] ?? "novo";
      const matchesFilter = filter === "todos" || state === filter;
      const matchesLanguage = language === "todas" || challenge.linguagem === language;
      const matchesDifficulty = difficulty === "todas" || challenge.dificuldade === difficulty;
      const haystack = normalize(`${challenge.titulo} ${challenge.descricao} ${challenge.linguagem} ${challenge.categoria ?? ""} ${challenge.habilidade ?? ""}`);
      return matchesFilter && matchesLanguage && matchesDifficulty && (purpose === "all" || practicePath(challenge) === purpose) && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [difficulty, filter, language, purpose, query, states]);

  const completed = Object.values(states).filter((state) => state === "concluido").length;
  const inProgress = Object.values(states).filter((state) => state === "andamento").length;
  const scopedChallenges = desafios.filter(challenge => (language === "todas" || challenge.linguagem === language) && (purpose === "all" || practicePath(challenge) === purpose));
  const recommended =
    scopedChallenges.find((challenge) => states[challenge.slug] === "andamento") ??
    scopedChallenges.find((challenge) => states[challenge.slug] !== "concluido");

return (
    <div className={s.catalog} data-lab-catalog>
      <header className={s.catalogHeader}>
        <div><span className={s.eyebrow}>OrbitAcademy / Aprender fazendo</span><h1>Laboratório<br/>de código<span>.</span></h1><p>Programe pelo celular. Leia uma etapa, escreva código real e execute para descobrir o resultado.</p></div>
        <div className={s.catalogStats} aria-label="Resumo dos desafios">
          <div><strong>{String(desafios.length).padStart(2, "0")}</strong><span>Experimentos</span></div>
          <div><strong>{String(inProgress).padStart(2, "0")}</strong><span>Em andamento</span></div>
          <div><strong>{String(completed).padStart(2, "0")}</strong><span>Concluídos aqui</span></div>
        </div>
      </header>

      <section className={s.learningPath} aria-label="Como começar no laboratório"><div><span className={s.eyebrow}>NUNCA PROGRAMOU?</span><h2>Uma linha de cada vez.</h2><p>Comece com orientação, depois experimente sem o guia. Você não precisa instalar nada para treinar.</p><Link href="/estudante/pratica/variaveis-js">Minha primeira linha em JavaScript <ArrowRight size={16}/></Link><Link href="/estudante/pratica/variaveis-python">Prefiro começar por Python <ArrowRight size={16}/></Link></div><ol><li><strong>01 / Entenda</strong><span>O que escrever e por que funciona.</span></li><li><strong>02 / Escreva e teste</strong><span>Editor vazio, etapas curtas e execução real.</span></li><li><strong>03 / Ganhe autonomia</strong><span>Modo livre, funções, coleções e desafios intermediários.</span></li></ol></section>

      {recommended && <Link
        href={`/estudante/pratica/${recommended.slug}`}
        onPointerEnter={() => { if (recommended.linguagem === "python") void warmPythonRuntime(); }}
        onFocus={() => { if (recommended.linguagem === "python") void warmPythonRuntime(); }}
        className={s.resumeExperiment}
      >
        <div className={s.resumeMain}>
          <span className={s.eyebrow}>{states[recommended.slug] === "andamento" ? "Retomar experimento" : "Um bom ponto de partida"}</span>
          <h2>{recommended.titulo}</h2><p>{recommended.descricao}</p>
          <div className={s.resumeFoot}><span>{languageNames[recommended.linguagem]} · {recommended.minutos ? `~${recommended.minutos} min` : "No seu ritmo"}</span><span className={s.resumeAction}>{states[recommended.slug] === "andamento" ? "Continuar" : "Abrir experimento"}<ArrowUpRight size={19}/></span></div>
        </div>
        <div className={s.resumeOutline}><span className={s.outlineLabel}>DENTRO DESTE EXPERIMENTO</span><ol>{recommended.steps.slice(0, 2).map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{step.instrucao}</p></li>)}</ol><span className={s.outlineTotal}>{recommended.steps.length} etapa{recommended.steps.length === 1 ? "" : "s"} com orientação<ArrowRight size={15}/></span></div>
      </Link>}

      <section id="experimentos" className={s.experimentLibrary} aria-label="Biblioteca de experimentos">
        <div className={s.libraryTitle}><div><span className={s.eyebrow}>Sua bancada de prática</span><h2>Encontre um desafio.</h2></div><Link href="/estudante/aulas">Revisar as aulas<ArrowUpRight size={15}/></Link></div>
        <div className={s.searchRow}>
          <label className={s.searchField}><Search size={18}/><input value={query} maxLength={120} onChange={event => setQuery(event.target.value)} placeholder="Tema, habilidade ou linguagem" aria-label="Buscar desafios"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca"><X size={17}/></button>}</label>
          <label className={s.difficultyField}><span>Dificuldade</span><select value={difficulty} onChange={event => setDifficulty(event.target.value as DifficultyFilter)} aria-label="Filtrar por dificuldade"><option value="todas">Todos os níveis</option><option value="iniciante">Iniciante</option><option value="basico">Básico</option><option value="intermediario">Intermediário</option></select></label>
        </div>
        <div className={s.languageTabs} aria-label="Linguagens">{(["todas", "javascript", "python", "csharp"] as const).map(value => <button key={value} type="button" aria-pressed={language === value} onClick={() => setLanguage(value)}>{value === "todas" ? "Todas as linguagens" : languageNames[value]}</button>)}</div>
        <section className={s.practiceRoutes} aria-label="Caminhos de aprendizagem">
          <div><span className={s.eyebrow}>{language === "todas" ? "ESCOLHA UMA LINGUAGEM E UM FOCO" : `SEU CAMINHO EM ${languageNames[language].toUpperCase()}`}</span><h3>O que você quer praticar agora?</h3><p>Uma sequência sugerida, sem bloquear quem já sabe. Estes são exercícios de fundamentos, não projetos completos.</p></div>
          <div className={s.routeButtons} role="group" aria-label="Filtrar por objetivo"><button type="button" aria-pressed={purpose === "all"} onClick={() => setPurpose("all")}><strong>Explorar tudo</strong><span>Todos os fundamentos disponíveis</span></button>{practicePaths.map((path, index) => <button key={path.id} type="button" aria-pressed={purpose === path.id} onClick={() => setPurpose(path.id)}><strong>{index + 1}. {path.label}</strong><span>{path.description}</span><small>{desafios.filter(item => (language === "todas" || item.linguagem === language) && practicePath(item) === path.id).length} desafios</small></button>)}</div>
          {(language === "todas" || language === "csharp") && <Link className={s.trackEntry} href="/estudante/trilhas/csharp"><div><strong>Quer um caminho acompanhado? Trilha C# &amp; .NET</strong><span>Mapa da jornada, práticas de código e perguntas para conferir o entendimento. Comece pelos fundamentos disponíveis.</span></div><ArrowUpRight size={22}/></Link>}
          <details className={s.projectRoadmap}><summary>Depois dos fundamentos: projetos profissionais <span>Em preparação</span></summary><p>O próximo caminho será construir uma aplicação por partes. Ainda não são aulas disponíveis: hoje você pode praticar os fundamentos acima{language === "csharp" ? " e seguir a trilha C# & .NET" : ""}.</p><ol><li><strong>CRUD com contexto</strong><span>Cadastrar, consultar, editar e excluir dados de um projeto.</span></li><li><strong>Persistência em banco SQL</strong><span>{language === "csharp" ? "A trilha C# prevê SQL Server e EF Core. PostgreSQL pode ser uma prática complementar." : "Guardar os dados, modelar tabelas e trabalhar com consultas; PostgreSQL é um exemplo de laboratório futuro."}</span></li><li><strong>API, validação e testes</strong><span>Comunicar as partes da aplicação e conferir seu comportamento.</span></li><li><strong>Entrega com Docker</strong><span>Entender containers quando houver uma aplicação para executar e distribuir.</span></li></ol></details>
        </section>
        <div className={s.statusRow}><div className={s.statusFilters} aria-label="Status do desafio">{([["todos", "Todos"], ["novo", "Novos"], ["andamento", "Em andamento"], ["concluido", "Concluídos"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><p aria-live="polite">{filteredChallenges.length} de {desafios.length} experimentos</p></div>

        {filteredChallenges.length ? <div className={s.experimentGrid}>{filteredChallenges.map(challenge => {
          const state = states[challenge.slug] ?? "novo";
          const cover = getLaboratoryCover(challenge.categoria);
          return <Link key={challenge.slug} className={s.experiment} data-language={challenge.linguagem} href={`/estudante/pratica/${challenge.slug}`}
            onPointerEnter={() => { if (challenge.linguagem === "python") void warmPythonRuntime(); }}
            onFocus={() => { if (challenge.linguagem === "python") void warmPythonRuntime(); }}>
            <div className={s.experimentVisual}>
              <Image
                src={cover.image}
                alt=""
                fill
                placeholder="blur"
                loading="lazy"
                sizes="(max-width: 479px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 48px) / 2), (max-width: 1532px) calc((100vw - 288px) / 2), 622px"
                style={{ objectPosition: cover.position }}
                data-lab-cover={cover.key}
              />
              <span className={s.experimentIndex}>E—{String(desafios.findIndex(item => item.slug === challenge.slug) + 1).padStart(2, "0")}</span>
              <span className={s.languageMark}>{languageCodes[challenge.linguagem]}</span>
            </div>
            <div className={s.experimentBody}>
              <span className={s.experimentCategory}>{practicePaths.find(path => path.id === practicePath(challenge))?.label} · {challenge.categoria || languageNames[challenge.linguagem]}</span>
              <div className={s.experimentHeading}><h3>{challenge.titulo}</h3><ArrowUpRight size={20}/></div>
              <p className={s.experimentDescription}>{challenge.descricao}</p>
              {challenge.habilidade && <p className={s.experimentSkill}>{challenge.habilidade}</p>}
              <div className={s.experimentMeta}><span>{difficultyNames[challenge.dificuldade || "iniciante"]}</span><span>{challenge.steps.length} etapa{challenge.steps.length === 1 ? "" : "s"}</span>{challenge.minutos && <span>~{challenge.minutos} min</span>}</div>
              <div className={s.experimentBottom}><span data-state={state}>{state === "concluido" ? <CheckCircle2 size={14}/> : state === "andamento" ? <Play size={13}/> : <span className={s.statusDot}/>} {state === "concluido" ? "Concluído" : state === "andamento" ? "Continuar rascunho" : "Não iniciado"}</span>{reflections[challenge.slug] && <span>Reflexão salva</span>}</div>
            </div>
          </Link>;
        })}</div> : <div className={s.noResults}><Search size={30}/><h3>Nenhum experimento por aqui.</h3><p>{purpose === "building" && language === "csharp" ? "Os desafios avulsos de funções e dados em C# ainda estão em preparação. Explore os fundamentos disponíveis ou abra o mapa da trilha." : "Tente outro tema ou remova os filtros para explorar a bancada."}</p><button type="button" onClick={() => { setQuery(""); setFilter("todos"); setLanguage("todas"); setDifficulty("todas"); setPurpose("all"); }}>Mostrar todos os experimentos<ArrowRight size={16}/></button></div>}
      </section>

      <Link className={s.blocksAlternative} href="/estudante/jogos"><span className={s.blockMotif} aria-hidden="true"><i/><i/><i/></span><div><span className={s.eyebrow}>Outro jeito de praticar</span><h2>Prefere começar pelos blocos?</h2><p>Monte o Código: organize o programa antes de partir para o teclado.</p></div><ArrowUpRight size={24}/></Link>
      <p className={s.storageNote}><HardDrive size={17}/>Seus rascunhos ficam neste navegador, sem sincronização entre aparelhos. No modo guiado, você pode recuperar o código anterior ao reinício enquanto permanecer na página.</p>
    </div>
  );
}

export default function PraticaIndex() {
  const { user } = useAuth();
  return <PraticaCatalog userId={user?.id}/>;
}
