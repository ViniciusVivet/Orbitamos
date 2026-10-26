import { desafios } from "./desafios";
import { guidedStorageKey, readGuidedDraft } from "./guidedPractice";
import { hasCompletedPractice } from "./practiceProgress";
import { activityCompletion, bridgeTarget, journalKey, practiceActivities, practiceDestination, readJournal, type ActivityId } from "./practiceStation";
import { deliveryMissions, deliveryStorageKey, readDeliverySave } from "./orbiDelivery";
import { englishLessons, englishStorageKey, readEnglishSave } from "./codeEnglish";
import { questKey, questSteps, readQuest } from "./sqlQuest";
import { readSqlDraft, sqlLessons, sqlStorageKey } from "./sqlJourney";
import { readVillageSave, villageLevels, villageStorageKey } from "./vilaDosBlocos";
import { fasesMonteCodigo, JOGO_STORAGE_PREFIX } from "./jogoMonteCodigo";
import { niveisGuiaOrbi } from "./jogoGuiaOrbi";
import { assemblyDraftKey, orbiDraftKey, readAssemblyDraft, readOrbiDraft, readVillageDraft, villageDraftKey } from "./gameDrafts";
import { csharpProgressKey, readCSharpProgress } from "./csharpTrack";
import { csharpModules, readModuleKind, type CSharpModuleKind } from "./csharpModules";

export type AcademyActivityItem = {
  id: string; title: string; group: "experience" | "code" | "csharp" | "sql-workshop";
  href: string; status: "new" | "opened" | "in-progress" | "completed";
  completedUnits: number; totalUnits: number; unit: string; practiced: boolean;
  reviewed: number; lastAt?: number; detail: string; nextHref: string; nextLabel: string;
};
export type AcademyActivitySummary = { completed: number; total: number; practiced: number; reviewed: number; unit: string };
export type AcademyActivity = {
  items: AcademyActivityItem[]; continueItem: AcademyActivityItem | null;
  summaries: { experiences: AcademyActivitySummary; code: AcademyActivitySummary; csharp: AcademyActivitySummary; sqlWorkshop: AcademyActivitySummary };
};
type ReadSave = (key: string) => string | null;
export type AcademyResumeEntry = { href: string; updatedAt: number };
export const resumeStorageKey = (userId: string | number) => `orbitamos-academy-resume-v1-${userId}`;

/** Only authored learning routes. Discard arbitrary query strings and never store external URLs. */
export function academyResumeEntry(href: string, now = Date.now()): AcademyResumeEntry | null {
  if (!href.startsWith("/") || href.startsWith("//") || !Number.isSafeInteger(now) || now <= 0 || now > Date.now() + 300000) return null;
  try {
    const url = new URL(href, "https://academy.invalid");
    if (url.origin !== "https://academy.invalid" || url.hash) return null;
    const path = url.pathname;
    const code = desafios.some(challenge => path === `/estudante/pratica/${challenge.slug}`);
    const assembly = fasesMonteCodigo.some(phase => path === `/estudante/jogos/${phase.slug}`);
    const orbi = niveisGuiaOrbi.some(level => path === `/estudante/jogos/orbi/${level.slug}`);
    const standalone = ["/estudante/jogos/entregas-do-orbi", "/estudante/jogos/ingles-em-cena", "/estudante/jogos/vila-dos-blocos", "/estudante/trilhas/csharp", "/estudante/trilhas/sql"].includes(path);
    if (!code && !assembly && !orbi && !standalone) return null;
    const moduleId = url.searchParams.get("module");
    const query = path === "/estudante/trilhas/sql" && url.searchParams.get("mode") === "workshop" ? "?mode=workshop" : path === "/estudante/trilhas/csharp" && moduleId && ["variables", "conditions", "loops"].includes(moduleId) ? `?module=${moduleId}` : "";
    return { href: path + query, updatedAt: now };
  } catch { return null; }
}
export function readAcademyResume(raw: string | null): AcademyResumeEntry | null {
  const value = object(raw);
  return typeof value?.href === "string" && typeof value.updatedAt === "number" ? academyResumeEntry(value.href, value.updatedAt) : null;
}

function object(raw: string | null): Record<string, unknown> | null {
  try { const value = JSON.parse(raw ?? "null"); return value && typeof value === "object" && !Array.isArray(value) ? value : null; } catch { return null; }
}
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const positive = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value > 0;

/** Timestamped activities have a known order. Legacy drafts do not: never invent a last-edited date. */
export function chooseAcademyContinuation(items: AcademyActivityItem[]): AcademyActivityItem | null {
  const pending = items.filter(item => item.status === "in-progress" || item.status === "opened");
  const dated = items.filter(item => item.status !== "new" && item.lastAt).sort((a, b) => b.lastAt! - a.lastAt!);
  if (dated.length) return dated[0];
  const written = pending.find(item => item.practiced);
  if (written) return written;
  if (pending.length) return pending[0];
  const finished = items.filter(item => item.status === "completed").sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0));
  return finished[0] ?? null;
}

/** Account-scoped, read-only projection. A visit is never a validated unit or proof of mastery. */
export function getAcademyActivity(userId: string, read: ReadSave): AcademyActivity {
  const cached = new Map<string, string | null>();
  const get: ReadSave = key => { if (!cached.has(key)) cached.set(key, read(key)); return cached.get(key) ?? null; };
  const journal = readJournal(get(journalKey(userId)));
  const complete = activityCompletion(userId, get);
  const quest = readQuest(get(questKey(userId)));
  const delivery = readDeliverySave(get(deliveryStorageKey(userId)));
  const english = readEnglishSave(get(englishStorageKey(userId)));
  // Final game checks are also evidence if their wrapper journal write was unavailable.
  complete.delivery ||= delivery.completed.length === deliveryMissions.length;
  complete.english ||= english.finished;
  const village = readVillageSave(get(villageStorageKey(userId)));
  const assembly = fasesMonteCodigo.map(phase => ({ phase, saved: object(get(`${JOGO_STORAGE_PREFIX}-${userId}-${phase.slug}`)), draft: readAssemblyDraft(get(assemblyDraftKey(userId, phase.slug)), phase) }));
  const orbi = niveisGuiaOrbi.map(level => ({ level, saved: object(get(`orbitamos-jogo-orbi-${userId}-${level.slug}`)), draft: readOrbiDraft(get(orbiDraftKey(userId, level.slug)), level) }));
  const villageDrafted = villageLevels.some(level => {
    const draft = readVillageDraft(get(villageDraftKey(userId, level.id)), level);
    return draft && (draft.attempt.pair !== null || (level.kind === "indent" && draft.attempt.indents.some((value, i) => value !== level.initial[i])));
  });
  const evidence: Record<ActivityId, { count: number; total: number; unit: string; drafted: boolean; detail: string }> = {
    sql: { count: quest.step, total: questSteps.length, unit: "etapas", drafted: quest.drafts.some(text), detail: questSteps[Math.min(quest.step, questSteps.length - 1)].title },
    delivery: { count: delivery.completed.length, total: deliveryMissions.length, unit: "entregas", drafted: false, detail: deliveryMissions[delivery.current].title },
    english: { count: english.completed.length, total: englishLessons.length, unit: "cenas", drafted: text(english.draft), detail: englishLessons[english.current].title },
    village: { count: village.completed.length, total: villageLevels.length, unit: "fases", drafted: villageDrafted, detail: villageLevels[village.current].title },
    assembly: { count: assembly.filter(item => item.saved?.concluido === true).length, total: assembly.length, unit: "fases", drafted: assembly.some(item => positive(item.saved?.tentativas) || (!!item.draft && (item.draft.placed.length > 0 || item.draft.attempts > 0))), detail: assembly.find(item => item.saved?.concluido !== true)?.phase.titulo ?? "Todas as fases praticadas" },
    orbi: { count: orbi.filter(item => item.saved?.concluido === true).length, total: orbi.length, unit: "níveis", drafted: orbi.some(item => positive(item.saved?.tentativas) || (!!item.draft && (item.draft.principal.length > 0 || item.draft.funcao.length > 0 || item.draft.tentativas > 0))), detail: orbi.find(item => item.saved?.concluido !== true)?.level.titulo ?? "Todos os níveis praticados" },
  };
  const items: AcademyActivityItem[] = practiceActivities.map(activity => {
    const record = journal.activities[activity.id];
    const progress = evidence[activity.id];
    const practiced = progress.count > 0 || progress.drafted || complete[activity.id];
    const href = practiceDestination(activity.id, userId, get);
    return { id: activity.id, group: "experience", title: activity.title, href,
      status: complete[activity.id] ? "completed" : practiced ? "in-progress" : record?.openedAt ? "opened" : "new",
      completedUnits: progress.count, totalUnits: progress.total, unit: progress.unit, practiced, reviewed: complete[activity.id] ? record?.reviews ?? 0 : 0,
      lastAt: Math.max(record?.openedAt ?? 0, record?.completedAt ?? 0, record?.reviewedAt ?? 0) || undefined,
      detail: complete[activity.id] ? "Experiência finalizada. Agora experimente aplicar a ideia." : progress.detail,
      nextHref: bridgeTarget(activity.id), nextLabel: activity.id === "sql" ? "Construir uma tabela na oficina SQL" : "Aplicar a descoberta no código",
    };
  });

  desafios.forEach((challenge, index) => {
    const freeRaw = get(`orbitamos-pratica-${userId}-${challenge.slug}`);
    const guidedRaw = get(guidedStorageKey(userId, challenge.slug));
    const guided = readGuidedDraft(guidedRaw, challenge);
    const free = object(freeRaw);
    const freeCount = Array.isArray(free?.stepStatus) && free.stepStatus.length === challenge.steps.length ? free.stepStatus.filter(status => status === "success").length : 0;
    const done = hasCompletedPractice(challenge, freeRaw, guidedRaw);
    const count = Math.max(guided.started ? guided.passed.length : 0, freeCount);
    // Legacy free mode saves its starter on mount: identical boilerplate alone is not activity.
    const changedFreeCode = text(free?.code) && free.code !== challenge.codigoInicial;
    const practiced = count > 0 || (guided.started && text(guided.code)) || changedFreeCode || (Array.isArray(free?.stepAttempts) && free.stepAttempts.some(positive));
    const next = desafios.slice(index + 1).find(item => item.linguagem === challenge.linguagem);
    items.push({ id: `code:${challenge.slug}`, title: challenge.titulo, group: "code", href: `/estudante/pratica/${challenge.slug}`,
      status: done ? "completed" : practiced ? "in-progress" : guided.started ? "opened" : "new", completedUnits: count, totalUnits: challenge.steps.length, unit: "missões", practiced, reviewed: 0,
      detail: `${challenge.linguagem === "csharp" ? "C#" : challenge.linguagem === "python" ? "Python" : "JavaScript"} · ${challenge.habilidade || challenge.categoria || "Fundamentos"}`,
      nextHref: next ? `/estudante/pratica/${next.slug}` : "/estudante/pratica", nextLabel: next ? `Próximo desafio: ${next.titulo}` : "Escolher outro desafio no laboratório",
    });
  });

  const legacyRaw = get(csharpProgressKey(userId));
  const track = readCSharpProgress(legacyRaw);
  const chosenModule = readModuleKind(get(`${csharpProgressKey(userId)}-module`));
  const moduleIds = Object.keys(csharpModules) as CSharpModuleKind[];
  const modules = moduleIds.map(id => {
    const config = csharpModules[id];
    const progress = config.restore(get(config.key(userId)), legacyRaw);
    const drafted = config.activities.some(activity => activity.kind === "code" && text(progress.drafts[activity.id]) && progress.drafts[activity.id] !== activity.starter);
    const guidedPilot = readGuidedDraft(get(guidedStorageKey(userId, config.pilot.slug)), config.pilot);
    const practiced = progress.done.length > 0 || drafted || Object.keys(progress.answers).length > 0 || (guidedPilot.started && text(guidedPilot.code));
    const active = config.activities.find(activity => activity.id === progress.active);
    return { id, config, progress, practiced, active };
  });
  // Put the selected C# module first among undated legacy candidates, not ahead of timestamped activity.
  modules.sort((a, b) => Number(b.id === chosenModule) - Number(a.id === chosenModule));
  modules.forEach(({ id, config, progress, practiced, active }) => {
    const count = progress.done.length;
    const finished = count === config.activities.length;
    items.push({ id: `csharp:${id}`, title: `C# · ${config.label}`, group: "csharp", href: `/estudante/trilhas/csharp?module=${id}`,
      status: finished ? "completed" : practiced ? "in-progress" : track.view === "pilot" && chosenModule === id ? "opened" : "new",
      completedUnits: count, totalUnits: config.activities.length, unit: "atividades", practiced, reviewed: 0,
      detail: active ? `${config.label} · ${active.title}` : config.label,
      nextHref: `/estudante/trilhas/csharp?module=${config.next ?? id}`, nextLabel: config.next ? `Ver o próximo módulo: ${csharpModules[config.next].label}` : "Revisitar os módulos disponíveis de C#",
    });
  });

  const workshop = readSqlDraft(get(sqlStorageKey(userId)));
  const workshopPracticed = workshop.passed.length > 0 || workshop.drafts.some(lines => lines.some(text));
  items.push({ id: "sql-workshop", title: "Oficina SQL", group: "sql-workshop", href: "/estudante/trilhas/sql?mode=workshop",
    status: workshop.passed.length === sqlLessons.length ? "completed" : workshopPracticed ? "in-progress" : "new",
    completedUnits: workshop.passed.length, totalUnits: sqlLessons.length, unit: "missões", practiced: workshopPracticed, reviewed: 0,
    detail: sqlLessons[workshop.stage].title, nextHref: "/estudante/jogos/revisao", nextLabel: "Revisar as descobertas de SQL",
  });
  const resume = readAcademyResume(get(resumeStorageKey(userId)));
  if (resume) {
    const matched = items.find(item => item.href === resume.href) ??
      (resume.href === "/estudante/trilhas/csharp" ? items.find(item => item.id === `csharp:${chosenModule}`) : undefined) ??
      (resume.href.startsWith("/estudante/jogos/orbi/") ? items.find(item => item.id === "orbi") : undefined) ??
      (fasesMonteCodigo.some(phase => resume.href === `/estudante/jogos/${phase.slug}`) ? items.find(item => item.id === "assembly") : undefined);
    if (matched) {
      // Revisiting a finished activity is not a new completion or a new learning event.
      if (matched.status !== "completed") matched.lastAt = Math.max(matched.lastAt ?? 0, resume.updatedAt);
      if (matched.status === "new") matched.status = "opened";
      const assemblyPhase = assembly.find(item => resume.href === `/estudante/jogos/${item.phase.slug}`);
      const orbiLevel = orbi.find(item => resume.href === `/estudante/jogos/orbi/${item.level.slug}`);
      // A known recent unfinished phase takes precedence over the old first-unfinished fallback.
      if (assemblyPhase && assemblyPhase.saved?.concluido !== true) { matched.href = resume.href; matched.detail = assemblyPhase.phase.titulo; }
      if (orbiLevel && orbiLevel.saved?.concluido !== true) { matched.href = resume.href; matched.detail = orbiLevel.level.titulo; }
    }
  }
  const summarize = (group: AcademyActivityItem["group"], unit: string): AcademyActivitySummary => {
    const own = items.filter(item => item.group === group);
    return { completed: own.filter(item => item.status === "completed").length, total: own.length, practiced: own.filter(item => item.practiced).length, reviewed: own.filter(item => item.reviewed > 0).length, unit };
  };
  return { items, continueItem: chooseAcademyContinuation(items), summaries: { experiences: summarize("experience", "experiências"), code: summarize("code", "desafios"), csharp: summarize("csharp", "módulos"), sqlWorkshop: summarize("sql-workshop", "oficinas") } };
}
