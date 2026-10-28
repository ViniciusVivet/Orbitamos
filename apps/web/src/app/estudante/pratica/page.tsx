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
import { hasCompletedLearningDelivery } from "@/lib/practiceProgress";
import { beginnerPracticeKey } from "@/lib/beginnerPractice";
import { academyPreviewHref } from "@/lib/portalNavigation";
import studyCover from "../../../../public/images/academy/codigo-no-celular-v1.webp";
import dataCover from "../../../../public/images/laboratorio/dados-v1.png";

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

export function PraticaCatalog({ userId = null, preview = false }: { userId?: string | number | null; preview?: boolean }) {
  const link = (href: string) => preview ? academyPreviewHref(href) : href;
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
            next[challenge.slug] = hasCompletedLearningDelivery(challenge, raw, localStorage.getItem(guidedStorageKey(userId, challenge.slug)), localStorage.getItem(beginnerPracticeKey(userId, challenge.slug))) ? "concluido" : "andamento";
            nextReflections[challenge.slug] = Boolean(freeDraft?.reflection?.trim());
            return;
          }
          if (!raw) {
            next[challenge.slug] = "novo";
            nextReflections[challenge.slug] = false;
            return;
          }
          const parsed = JSON.parse(raw) as { stepStatus?: string[]; reflection?: string };
          next[challenge.slug] = hasCompletedLearningDelivery(challenge, raw, localStorage.getItem(guidedStorageKey(userId, challenge.slug)), localStorage.getItem(beginnerPracticeKey(userId, challenge.slug))) ? "concluido" : "andamento";
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
      <header className={s.visualHeading}><div><span className={s.eyebrow}>LABORATÓRIO DE CÓDIGO</span><h1>Vamos praticar?</h1><p>No celular ou no computador. Uma missão de cada vez.</p></div><a href="#experimentos">Ver desafios<ArrowRight size={16}/></a></header>
      {recommended && <Link href={link(`/estudante/pratica/${recommended.slug}`)} className={s.featuredLesson} data-lab-start
        onPointerEnter={() => { if (recommended.linguagem === "python") void warmPythonRuntime(); }}
        onFocus={() => { if (recommended.linguagem === "python") void warmPythonRuntime(); }}>
        <div className={s.featuredPhoto}><Image src={studyCover} alt="" fill priority placeholder="blur" sizes="(max-width:767px) 100vw, 60vw"/><span>SEU CÓDIGO CABE NO SEU DIA</span></div>
        <div className={s.featuredCopy}><span className={s.eyebrow}>{states[recommended.slug] === "andamento" ? "SEU RASCUNHO ESTÁ AQUI" : "COMECE POR AQUI"}</span><h2>{recommended.titulo}</h2><p>{recommended.descricao}</p><small>{languageNames[recommended.linguagem]} · {recommended.minutos ? `${recommended.minutos} min` : "No seu ritmo"} · Com passo a passo</small><span className={s.featuredAction}>{states[recommended.slug] === "andamento" ? "Continuar meu código" : "Vamos começar"}<ArrowRight size={18}/></span></div>
      </Link>}
      <div className={s.visualShortcuts}><Link href={link("/estudante/trilhas/sql")}><div><Image src={dataCover} alt="" fill placeholder="blur" sizes="112px"/></div><span><small>APRENDA COM UMA HISTÓRIA</small><strong>Uma loja. Seus primeiros dados.</strong></span><ArrowUpRight size={19}/></Link><Link href={link("/estudante/jogos")}><div className={s.orbiShortcut}><Image src="/orbi-tech.png" alt="" fill sizes="100px"/></div><span><small>PREFERE JOGAR?</small><strong>Descubra com o Orbi.</strong></span><ArrowUpRight size={19}/></Link></div>
      <section id="experimentos" className={s.experimentLibrary} aria-label="Biblioteca de experimentos">
        <div className={s.libraryTitle}><div><span className={s.eyebrow}>Sua bancada de prática</span><h2>Encontre um desafio.</h2></div><Link href={link("/estudante/aulas")}>Revisar as aulas<ArrowUpRight size={15}/></Link></div>
        <div className={s.searchRow}>
          <label className={s.searchField}><Search size={18}/><input value={query} maxLength={120} onChange={event => setQuery(event.target.value)} placeholder="Tema, habilidade ou linguagem" aria-label="Buscar desafios"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca"><X size={17}/></button>}</label>
        </div>
        <div className={s.languageTabs} aria-label="Linguagens">{(["todas", "javascript", "python", "csharp"] as const).map(value => <button key={value} type="button" aria-pressed={language === value} onClick={() => setLanguage(value)}>{value === "todas" ? "Todas" : languageNames[value]}</button>)}</div>
        <details className={s.moreFilters} data-lab-filters><summary>Filtrar por tema, nível ou progresso <span>{[purpose !== "all", difficulty !== "todas", filter !== "todos"].filter(Boolean).length || ""}</span></summary>
          <div className={s.filterBody}><label className={s.difficultyField}><span>Nível</span><select value={difficulty} onChange={event => setDifficulty(event.target.value as DifficultyFilter)} aria-label="Filtrar por dificuldade"><option value="todas">Todos os níveis</option><option value="iniciante">Iniciante</option><option value="basico">Básico</option><option value="intermediario">Intermediário</option></select></label>
          <div className={s.filterThemes} role="group" aria-label="Filtrar por objetivo"><button type="button" aria-pressed={purpose === "all"} onClick={() => setPurpose("all")}>Todos os temas</button>{practicePaths.map(path => <button type="button" key={path.id} aria-pressed={purpose === path.id} onClick={() => setPurpose(path.id)}>{path.label}</button>)}</div>
          <div className={s.statusFilters} aria-label="Status do desafio">{([["todos", "Todos"], ["novo", "Novos"], ["andamento", "Em andamento"], ["concluido", "Concluídos"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
        </details>
        <p className={s.libraryCount} aria-live="polite">{filteredChallenges.length} desafios{inProgress > 0 ? ` · ${inProgress} em andamento` : ""}{completed > 0 ? ` · ${completed} concluídos` : ""}</p>

        {filteredChallenges.length ? <div className={s.experimentGrid}>{filteredChallenges.map(challenge => {
          const state = states[challenge.slug] ?? "novo";
          const cover = getLaboratoryCover(challenge.categoria);
          return <Link key={challenge.slug} className={s.experiment} data-language={challenge.linguagem} href={link(`/estudante/pratica/${challenge.slug}`)}
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
              <span className={s.languageMark}>{languageCodes[challenge.linguagem]}</span>
            </div>
            <div className={s.experimentBody}>
              <span className={s.experimentCategory}>{challenge.categoria || languageNames[challenge.linguagem]}</span>
              <div className={s.experimentHeading}><h3>{challenge.titulo}</h3><ArrowUpRight size={20}/></div>
              <p className={s.experimentDescription}>{challenge.descricao}</p>
              <div className={s.experimentMeta}><span>{difficultyNames[challenge.dificuldade || "iniciante"]}</span>{challenge.minutos && <span>~{challenge.minutos} min</span>}</div>
              <div className={s.experimentBottom}><span data-state={state}>{state === "concluido" ? <CheckCircle2 size={14}/> : state === "andamento" ? <Play size={13}/> : <ArrowRight size={14}/>} {state === "concluido" ? "Concluído · revisitar" : state === "andamento" ? "Continuar meu código" : "Começar desafio"}</span>{reflections[challenge.slug] && <span>Reflexão salva</span>}</div>
            </div>
          </Link>;
        })}</div> : <div className={s.noResults}><Search size={30}/><h3>Nenhum experimento por aqui.</h3><p>{purpose === "building" && language === "csharp" ? "Os desafios avulsos de funções e dados em C# ainda estão em preparação. Explore os fundamentos disponíveis ou abra o mapa da trilha." : "Tente outro tema ou remova os filtros para explorar a bancada."}</p><button type="button" onClick={() => { setQuery(""); setFilter("todos"); setLanguage("todas"); setDifficulty("todas"); setPurpose("all"); }}>Mostrar todos os experimentos<ArrowRight size={16}/></button></div>}
      </section>

      <details className={s.guideHelp}><summary>Como funciona o passo a passo?</summary><ol><li>Construa um programa com ajuda.</li><li>Altere os dados e teste o resultado.</li><li>Nos Primeiros passos de JavaScript, resolva outra situação por conta própria.</li></ol><Link href={link("/estudante/trilhas")}>Ver todos os caminhos de estudo<ArrowRight size={16}/></Link><p><HardDrive size={14}/>Seus rascunhos ficam neste navegador, separados por conta.</p></details>
    </div>
  );
}

export default function PraticaIndex() {
  const { user } = useAuth();
  return <PraticaCatalog userId={user?.id}/>;
}
