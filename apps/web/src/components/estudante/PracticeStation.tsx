"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Code2, Folder, Gamepad2, RotateCcw, Sparkles } from "lucide-react";
import { activityCompletion, emptyJournal, journalKey, persistPractice, practiceActivities, practiceDestination, readJournal, recommendActivity, reviewQueue, type ActivityId, type PracticeJournal, type ReviewQuestion } from "@/lib/practiceStation";
import { fasesMonteCodigo } from "@/lib/jogoMonteCodigo";
import LearningBridge from "./LearningBridge";
import s from "./PracticeStation.module.css";
import { useAcademyStudyPath } from "./useAcademyStudyPath";
import { academyStudyPaths } from "@/lib/academyStudyPath";
import { academyPreviewHref } from "@/lib/portalNavigation";

const OrbiDelivery = dynamic(() => import("@/components/games/OrbiDelivery"), { loading: () => <p role="status">Preparando o caminho do Orbi…</p> });
const CodeEnglish = dynamic(() => import("@/components/games/CodeEnglish"), { loading: () => <p role="status">Abrindo a oficina de palavras…</p> });
const VillageGame = dynamic(() => import("@/components/games/VillageGame"), { loading: () => <p role="status">Acordando a vila…</p> });
const SqlStudio = dynamic(() => import("./SqlStudio"), { loading: () => <p role="status">Abrindo a loja do Orbi…</p> });

const emptyCompletion = (): Record<ActivityId, boolean> => ({ sql: false, delivery: false, english: false, village: false, orbi: false, assembly: false });
function useStation(userId: string, preview = false) {
  const [journal, setJournal] = useState<PracticeJournal>(emptyJournal);
  const [completed, setCompleted] = useState(emptyCompletion);
  const [destinations, setDestinations] = useState(() => Object.fromEntries(practiceActivities.map(item => [item.id, practiceDestination(item.id, userId, () => null, preview)])) as Record<ActivityId, string>);
  const [storageError, setStorageError] = useState(false);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(() => {
    try {
      const read = (key: string) => localStorage.getItem(key);
      setJournal(readJournal(read(journalKey(userId))));
      setCompleted(activityCompletion(userId, read));
      setDestinations(Object.fromEntries(practiceActivities.map(item => [item.id, practiceDestination(item.id, userId, read, preview)])) as Record<ActivityId, string>);
      setStorageError(false);
    } catch { setStorageError(true); }
    setReady(true);
  }, [userId, preview]);
  useEffect(() => { let active = true; queueMicrotask(() => { if (active) refresh(); }); window.addEventListener("storage", refresh); window.addEventListener("focus", refresh); window.addEventListener("orbitamos-practice-updated", refresh); return () => { active = false; window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); window.removeEventListener("orbitamos-practice-updated", refresh); }; }, [refresh]);
  return { journal, completed, destinations, storageError, ready };
}
function ActivityArt({ id }: { id: ActivityId }) {
  return <div className={s.art} data-art={id} aria-hidden="true">{id === "delivery" ? <><span className={s.platform}/><span className={s.platform}/><Image src="/orbi-tech.png" width={90} height={106} alt=""/><span className={s.destination}>✦</span></> : id === "english" ? <><Folder size={66}/><span className={s.word}>folder<small>pasta / organize suas ideias</small></span></> : id === "sql" ? <><span className={s.shopRoof}/><div className={s.dataLines}><span>nome <b>estoque</b></span><span>Caneta <b>3</b></span><span>Caderno <b>12</b></span></div></> : id === "village" ? <><span className={s.symbolBuddy}>[ ]</span><span className={s.symbolBuddy}>{"{ }"}</span><small>cada símbolo tem seu lugar</small></> : id === "orbi" ? <><div className={s.routeDots}>● ─ ●<br/>　　│<br/>　　✦</div><Image src="/orbi-tech.png" width={73} height={89} alt=""/></> : <div className={s.codePieces}><span>let ideia = 1;</span><span>ideia = ideia + 1;</span><span>console.log(ideia);</span></div>}</div>;
}
export default function PracticeStation({ userId, preview = false }: { userId: string; preview?: boolean }) {
  const { journal, completed, destinations, storageError, ready } = useStation(userId, preview);
  const study = useAcademyStudyPath(userId);
  const selectedPath = academyStudyPaths.find(path => path.id === study.choice);
  const [goal, setGoal] = useState("todos");
  const csharpActivities: ActivityId[] = ["delivery", "assembly", "village", "orbi", "english"];
  const recommendedId = study.choice === "csharp" ? csharpActivities.find(id => !completed[id]) ?? recommendActivity(journal, completed) : recommendActivity(journal, completed);
  const recommended = practiceActivities.find(item => item.id === recommendedId)!;
  const knownCount = Object.values(completed).filter(Boolean).length;
  const href = (item: typeof recommended) => destinations[item.id];
  return <div className={s.station} data-practice-station>
    <header className={s.masthead}><span>ORBITAMOS / APRENDER FAZENDO</span><Link href={preview ? "/dev/lab-preview?academy=1" : "/estudante/pratica"}>Abrir laboratório <Code2 size={15}/></Link></header>
    {selectedPath && <div className={s.pathNotice}><p>Sua trilha principal é <strong>{selectedPath.title}</strong>. As experiências abaixo são formas de praticar; explorar outra atividade mantém sua escolha.</p><Link href={preview ? academyPreviewHref(selectedPath.href) : selectedPath.href}>Ver minha trilha<ArrowRight size={15}/></Link></div>}
    <section className={s.hero}><div><p className={s.eyebrow}>SEU ESPAÇO DE DESCOBERTAS</p><h1>Tem mais de um jeito<br/>de chegar ao <em>“entendi”.</em></h1><p>Jogue, faça uma previsão, complete uma ideia ou escreva código. Cada experiência ajuda a dar um próximo passo.</p><div className={s.heroActions}><Link className={s.primary} href={href(recommended)} onClick={() => persistPractice(userId, recommended.id, "open")}>{journal.activities[recommended.id]?.openedAt && !completed[recommended.id] ? "Retomar" : "Começar"}: {recommended.title}<ArrowRight size={17}/></Link><Link className={s.secondary} href={preview ? "/dev/ide-preview/variaveis-js?academy=1" : "/estudante/pratica/variaveis-js"}>Quero escrever código direto <ArrowRight size={15}/></Link></div><small>{ready ? `${knownCount} de 6 experiências praticadas neste navegador` : "Preparando seu próximo passo…"}</small></div><aside className={s.orbiNote}><Image src="/orbi-tech.png" width={145} height={170} alt="Orbi, seu companheiro de prática" priority/><p>“Você pode mudar de formato e pedir ajuda. Vamos descobrir uma coisa de cada vez?”</p><span>uma missão → uma descoberta → uma aplicação</span></aside></section>
    <section className={s.learningLoop} aria-label="Como as experiências se conectam">{[["01", "Explore uma ideia", "Um cenário ou exemplo deixa a regra visível."], ["02", "Teste o que entendeu", "Preveja, corrija ou resolva outra situação."], ["03", "Leve para o código", "Escreva e execute num desafio relacionado."]].map(([n, title, text]) => <div key={n}><span>{n}</span><strong>{title}</strong><p>{text}</p></div>)}</section>
    <section aria-label="Escolher uma experiência"><div className={s.sectionHeading}><div><p className={s.eyebrow}>ESCOLHA PELO QUE QUER PRATICAR</p><h2>Qual descoberta combina com agora?</h2></div><span>6 experiências disponíveis</span></div><div className={s.filters} aria-label="Objetivo de prática">{[["todos", "Explorar tudo"], ["logica", "Lógica e jogos"], ["dados", "Entender dados"], ["ingles", "Inglês para código"], ["codigo", "Ler programas"]].map(([value, label]) => <button key={value} aria-pressed={goal === value} onClick={() => setGoal(value)}>{label}</button>)}</div><div className={s.grid}>{practiceActivities.filter(item => goal === "todos" || item.goal === goal).map(item => <Link key={item.id} href={href(item)} onClick={() => persistPractice(userId, item.id, "open")} className={s.activity} data-theme={item.color}><ActivityArt id={item.id}/><div className={s.cardBody}><span className={s.kind}>{item.kind}{completed[item.id] && <span><Check size={13}/> Já praticou</span>}</span><h3>{item.title}</h3><p>{item.description}</p><div className={s.skill}>{item.skill}</div><span className={s.cardAction}>Abrir experiência <ArrowRight size={16}/></span></div></Link>)}</div></section>
    <div className={s.bottomGrid}><section><RotateCcw size={24}/><p className={s.eyebrow}>UM POUCO AGORA, UM POUCO DEPOIS</p><h2>Uma revisão de bolso.</h2><p>{knownCount ? "Você já tem descobertas para revisitar. Teste o que lembra com situações diferentes, sem consultar o exemplo primeiro." : "Depois de concluir uma experiência, suas primeiras perguntas de revisão aparecem aqui."}</p><Link className={knownCount ? s.primary : s.secondary} href={knownCount ? preview ? "/dev/academy-preview?activity=review" : "/estudante/jogos/revisao" : href(recommended)}>{knownCount ? "Revisar minhas descobertas" : "Fazer minha primeira missão"}<ArrowRight size={16}/></Link><small>Sem perder conquistas se errar ou ficar alguns dias fora.</small></section><section><Code2 size={24}/><p className={s.eyebrow}>ESPAÇO PARA GANHAR AUTONOMIA</p><h2>Seu código, suas tentativas.</h2><p>O laboratório tem orientação e modo livre em JavaScript, Python e C#. Para seguir uma sequência acompanhada, explore a trilha C#.</p><Link className={s.primary} href={preview ? "/dev/lab-preview?academy=1" : "/estudante/pratica"}>Ir para o laboratório <ArrowRight size={16}/></Link><Link className={s.secondary} href={preview ? "/dev/csharp-preview?academy=1" : "/estudante/trilhas/csharp"}>Conhecer a trilha C# <ArrowRight size={16}/></Link></section></div>
    <details className={s.phaseLibrary}><summary><Gamepad2 size={17}/> Explorar todas as fases de Monte o Código</summary><div>{fasesMonteCodigo.map(fase => <Link key={fase.slug} href={`${preview ? "/dev/monte-codigo-preview" : "/estudante/jogos"}/${fase.slug}${preview ? "?from=academy" : ""}`}><span>{fase.titulo}</span><small>{fase.linguagem === "python" ? "Python" : "JavaScript"}</small><ArrowRight size={14}/></Link>)}</div></details><footer className={s.stationFooter}><span>{storageError ? "Não foi possível ler o progresso local. Você pode continuar explorando." : "Conquistas e retomadas desta área ficam neste navegador, separadas por conta."}</span><details><summary>O que significa “praticou”?</summary><p>Concluir uma experiência registra participação e suas checagens. Isso não substitui escrever um programa novo ou demonstrar domínio. Use pistas e depois tente aplicar.</p></details></footer>
  </div>;
}
export function PracticeReview({ userId, preview = false }: { userId: string; preview?: boolean }) {
  const { journal, completed, ready } = useStation(userId);
  const [questions, setQuestions] = useState<ReviewQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { if (ready && questions === null) queueMicrotask(() => setQuestions(reviewQueue(completed, journal))); }, [ready, questions, completed, journal]);
  const question = questions?.[index], correct = !!question && answer === question.answer;
  const back = preview ? "/dev/academy-preview" : "/estudante/jogos";
  function next() { if (!correct || !questions) return; if (index === questions.length - 1) { for (const id of new Set(questions.map(q => q.activity))) if (!persistPractice(userId, id, "review")) setStorageError(true); setDone(true); } else { setIndex(index + 1); setAnswer(null); } }
  return <div className={s.reviewPage} data-practice-review><Link className={s.back} href={back}><ArrowLeft size={16}/> Voltar às práticas</Link>{!ready || !questions ? <p role="status">Preparando sua revisão…</p> : !questions.length ? <><h1>Primeiro, uma descoberta.</h1><p>Conclua uma experiência e volte aqui para revisar o que praticou.</p><Link className={s.primary} href={back}>Escolher uma missão <ArrowRight size={16}/></Link></> : done ? <><Sparkles size={35}/><h1>Você voltou à ideia.</h1><p>Você praticou {questions.length} situação{questions.length > 1 ? "s" : ""} diferente{questions.length > 1 ? "s" : ""}. Pode voltar em outro dia para tentar lembrar de novo.</p><Link className={s.primary} href={back}>Escolher o próximo passo <ArrowRight size={16}/></Link></> : question && <><p className={s.eyebrow}>REVISÃO DE BOLSO · {index + 1} DE {questions.length}</p><h1>{question.prompt}</h1>{question.code && <pre>{question.code}</pre>}<div className={s.reviewChoices}>{question.choices.map(choice => <button key={choice} aria-pressed={answer === choice} onClick={() => setAnswer(choice)}>{choice}{answer === choice && correct && <Check size={17}/>}</button>)}</div>{answer && <div className={s.reviewFeedback} role="status"><strong>{correct ? "Você recuperou essa ideia." : "Vamos conferir o raciocínio."}</strong><p>{question.explanation}</p>{!correct && <p>Use essa pista e faça outra escolha.</p>}</div>}{correct && <button className={s.primary} onClick={next}>{index === questions.length - 1 ? "Concluir revisão" : "Próxima pergunta"}<ArrowRight size={16}/></button>}</>}{storageError && <p role="alert">A revisão terminou, mas o navegador não conseguiu guardar o registro.</p>}</div>;
}
export function PracticeActivity({ userId, activity, preview = false }: { userId: string; activity: "delivery" | "english" | "review" | "sql" | "village"; preview?: boolean }) {
  const [done, setDone] = useState(false);
  const { completed } = useStation(userId);
  const [storageError, setStorageError] = useState(false);
  const back = preview ? "/dev/academy-preview" : "/estudante/jogos";
  function finish() { setDone(true); if (activity === "delivery" || activity === "english") if (!persistPractice(userId, activity, "complete")) setStorageError(true); }
  return <div data-practice-activity>{activity === "delivery" ? <OrbiDelivery userId={userId} onComplete={finish} onBackHref={back}/> : activity === "english" ? <CodeEnglish userId={userId} onComplete={finish} onBackHref={back}/> : activity === "review" ? <PracticeReview userId={userId} preview={preview}/> : activity === "sql" ? <SqlStudio userId={userId}/> : <VillageGame userId={userId} preview={preview}/>}{(activity === "delivery" || activity === "english") && (done || completed[activity]) && <LearningBridge activity={activity} userId={userId} preview={preview}/ >}{storageError && <p role="alert">Missão concluída. O navegador não conseguiu guardar este registro; mantenha a página aberta para continuar.</p>}</div>;
}
export function AcademyPreview() {
  const params = useSearchParams();
  const value = params.get("activity");
  const activity = value && ["delivery", "english", "review", "sql", "village"].includes(value) ? value : null;
  return activity ? <PracticeActivity key={activity} userId="academy-preview" activity={activity as "delivery" | "english" | "review" | "sql" | "village"} preview/> : <PracticeStation userId="academy-preview" preview/>;
}
