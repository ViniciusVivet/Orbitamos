import { desafios } from "./desafios";
import { guidedStorageKey, readGuidedDraft } from "./guidedPractice";
import { hasCompletedLearningDelivery, hasCompletedPractice } from "./practiceProgress";
import { beginnerPracticeKey, readBeginnerPractice, supportsBeginnerPractice } from "./beginnerPractice";
import { activityCompletion, bridgeTarget, journalKey, practiceActivities, practiceDestination, readJournal, type ActivityId } from "./practiceStation";
import { deliveryMissions, deliveryStorageKey, readDeliverySave } from "./orbiDelivery";
import { chapterMissions, orbiChapterKey, readChapterSave } from "./orbiChapter";
import { englishLessons, englishStorageKey, readEnglishSave } from "./codeEnglish";
import { questKey, questSteps, readQuest } from "./sqlQuest";
import { readSqlDraft, sqlLessons, sqlStorageKey } from "./sqlJourney";
import { readVillageSave, villageLevels, villageStorageKey } from "./vilaDosBlocos";
import { fasesMonteCodigo, JOGO_STORAGE_PREFIX } from "./jogoMonteCodigo";
import { niveisGuiaOrbi } from "./jogoGuiaOrbi";
import { assemblyDraftKey, orbiDraftKey, readAssemblyDraft, readOrbiDraft, readVillageDraft, villageDraftKey } from "./gameDrafts";
import { csharpProgressKey, readCSharpProgress } from "./csharpTrack";
import { csharpModules, readModuleKind, type CSharpModuleKind } from "./csharpModules";
import { getPulseLesson, pulseLessons, pulseSaveKey, readPulseSave } from "./orbiPulse";
import { ENGLISH_SPEAKING_HASH, ENGLISH_SPEAKING_HREF, ORBI_DELIVERY_HREF, ORBI_PULSE_HASH, ORBI_PULSE_HREF, WORK_DELIVERY_HASH, WORK_DELIVERY_HREF, WORK_INCIDENT_HASH, WORK_INCIDENT_HREF, WORK_SIMULATION_HREF } from "./portalNavigation";
import { getWorkCase, readWorkSave, WORK_CASE_IDS, workSimulationKey } from "./workSimulation";
import { readWorkDeliverySave, WORK_DELIVERY_STARTER_CODE, workDeliveryKey } from "./workDelivery";
import { getIncidentCase, INCIDENT_CASE_IDS, incidentSaveKey, readIncidentSave } from "./workIncident";
import { englishSpeakingLessons, getSpeakingLesson, readSpeakingSave, speakingSaveKey } from "./spokenEnglish";

export type AcademyActivityItem = {
  id: string; title: string; group: "experience" | "code" | "csharp" | "sql-workshop";
  href: string; status: "new" | "opened" | "in-progress" | "completed";
  completedUnits: number; totalUnits: number; unit: string; practiced: boolean;
  reviewed: number; lastAt?: number; detail: string; history?: string; nextHref: string; nextLabel: string;
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
    const fragment = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    if (url.pathname === "/estudante/jogos/ingles-em-cena" && fragment && fragment !== ENGLISH_SPEAKING_HASH) return null;
    const pulse = url.pathname === ORBI_DELIVERY_HREF && url.hash === ORBI_PULSE_HASH;
    const workPhaseHash = url.pathname === WORK_SIMULATION_HREF && [WORK_DELIVERY_HASH, WORK_INCIDENT_HASH].includes(url.hash) ? url.hash : "";
    const speaking = url.pathname === "/estudante/jogos/ingles-em-cena" && url.hash === ENGLISH_SPEAKING_HASH && fragment === ENGLISH_SPEAKING_HASH;
    if (url.origin !== "https://academy.invalid" || (url.hash && !pulse && !workPhaseHash && !speaking)) return null;
    const path = url.pathname;
    const code = desafios.some(challenge => path === `/estudante/pratica/${challenge.slug}`);
    const assembly = fasesMonteCodigo.some(phase => path === `/estudante/jogos/${phase.slug}`);
    const orbi = niveisGuiaOrbi.some(level => path === `/estudante/jogos/orbi/${level.slug}`);
    const standalone = ["/estudante/jogos/entregas-do-orbi", "/estudante/jogos/ingles-em-cena", "/estudante/jogos/vila-dos-blocos", WORK_SIMULATION_HREF, "/estudante/trilhas/csharp", "/estudante/trilhas/sql"].includes(path);
    if (!code && !assembly && !orbi && !standalone) return null;
    const moduleId = url.searchParams.get("module");
    const query = path === "/estudante/trilhas/sql" && url.searchParams.get("mode") === "workshop" ? "?mode=workshop" : path === "/estudante/trilhas/csharp" && moduleId && ["variables", "conditions", "loops"].includes(moduleId) ? `?module=${moduleId}` : "";
    return { href: path + query + (pulse ? ORBI_PULSE_HASH : workPhaseHash || (speaking ? ENGLISH_SPEAKING_HASH : "")), updatedAt: now };
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
  const legacyDelivery = readDeliverySave(get(deliveryStorageKey(userId)));
  const delivery = readChapterSave(get(orbiChapterKey(userId)));
  const english = readEnglishSave(get(englishStorageKey(userId)));
  // Final game checks are also evidence if their wrapper journal write was unavailable.
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
    delivery: { count: delivery.completed.length, total: chapterMissions.length, unit: "entregas do capítulo", drafted: chapterMissions.some(mission => delivery.attempts[mission.id] > 0 || delivery.drafts[mission.id] !== mission.starterCode), detail: chapterMissions.find(mission => mission.id === delivery.current)!.title },
    english: { count: english.completed.length, total: englishLessons.length, unit: "cenas", drafted: text(english.draft), detail: englishLessons[english.current].title },
    village: { count: village.completed.length, total: villageLevels.length, unit: "fases", drafted: villageDrafted, detail: villageLevels[village.current].title },
    assembly: { count: assembly.filter(item => item.saved?.concluido === true).length, total: assembly.length, unit: "fases", drafted: assembly.some(item => positive(item.saved?.tentativas) || (!!item.draft && (item.draft.placed.length > 0 || item.draft.attempts > 0))), detail: assembly.find(item => item.saved?.concluido !== true)?.phase.titulo ?? "Todas as fases praticadas" },
    orbi: { count: orbi.filter(item => item.saved?.concluido === true).length, total: orbi.length, unit: "níveis", drafted: orbi.some(item => positive(item.saved?.tentativas) || (!!item.draft && (item.draft.principal.length > 0 || item.draft.funcao.length > 0 || item.draft.tentativas > 0))), detail: orbi.find(item => item.saved?.concluido !== true)?.level.titulo ?? "Todos os níveis praticados" },
  };
  const items: AcademyActivityItem[] = practiceActivities.map(activity => {
    const record = journal.activities[activity.id];
    const versionedRecord = activity.id !== "delivery" || record?.contentVersion === 2 ? record : undefined;
    const deliveryHistory = activity.id === "delivery" ? legacyDelivery.completed.length ? `Jogo anterior: ${legacyDelivery.completed.length} de ${deliveryMissions.length} entregas. Seu histórico continua guardado.` : record?.legacyCompletedAt || (record?.completedAt && record.contentVersion !== 2) ? "Conclusão do jogo anterior preservada. Este capítulo tem três novas entregas." : undefined : undefined;
    const progress = evidence[activity.id];
    const practiced = progress.count > 0 || progress.drafted || complete[activity.id];
    const href = practiceDestination(activity.id, userId, get);
    return { id: activity.id, group: "experience", title: activity.title, href,
      status: complete[activity.id] ? "completed" : practiced ? "in-progress" : record?.openedAt ? "opened" : "new",
      completedUnits: progress.count, totalUnits: progress.total, unit: progress.unit, practiced, reviewed: complete[activity.id] ? versionedRecord?.reviews ?? 0 : 0,
      lastAt: Math.max(versionedRecord?.openedAt ?? 0, versionedRecord?.completedAt ?? 0, versionedRecord?.reviewedAt ?? 0) || undefined,
      detail: complete[activity.id] ? "Experiência finalizada. Agora experimente aplicar a ideia." : progress.detail,
      history: deliveryHistory,
      nextHref: bridgeTarget(activity.id), nextLabel: activity.id === "sql" ? "Construir uma tabela na oficina SQL" : "Aplicar a descoberta no código",
    };
  });

  desafios.forEach((challenge, index) => {
    const freeRaw = get(`orbitamos-pratica-${userId}-${challenge.slug}`);
    const guidedRaw = get(guidedStorageKey(userId, challenge.slug));
    const guided = readGuidedDraft(guidedRaw, challenge);
    const free = object(freeRaw);
    const freeCount = Array.isArray(free?.stepStatus) && free.stepStatus.length === challenge.steps.length ? free.stepStatus.filter(status => status === "success").length : 0;
    const applicationRaw = get(beginnerPracticeKey(userId, challenge.slug));
    const application = readBeginnerPractice(applicationRaw, challenge.slug);
    const needsApplication = supportsBeginnerPractice(challenge.slug);
    const supportedDone = hasCompletedPractice(challenge, freeRaw, guidedRaw);
    const done = hasCompletedLearningDelivery(challenge, freeRaw, guidedRaw, applicationRaw);
    const count = Math.max(guided.started ? guided.passed.length : 0, freeCount) + (needsApplication ? Number(application.adaptationValidated) + Number(application.validated) : 0);
    // Legacy free mode saves its starter on mount: identical boilerplate alone is not activity.
    const changedFreeCode = text(free?.code) && free.code !== challenge.codigoInicial;
    const practiced = count > 0 || (guided.started && text(guided.code)) || changedFreeCode || (needsApplication && (application.attempts > 0 || text(application.code))) || (Array.isArray(free?.stepAttempts) && free.stepAttempts.some(positive));
    const next = desafios.slice(index + 1).find(item => item.linguagem === challenge.linguagem);
    items.push({ id: `code:${challenge.slug}`, title: challenge.titulo, group: "code", href: `/estudante/pratica/${challenge.slug}`,
      status: done ? "completed" : practiced ? "in-progress" : guided.started ? "opened" : "new", completedUnits: count, totalUnits: challenge.steps.length + (needsApplication ? 2 : 0), unit: needsApplication ? "etapas" : "missões", practiced, reviewed: 0,
      lastAt: needsApplication ? application.validatedAt ?? application.adaptationValidatedAt ?? undefined : undefined,
      detail: needsApplication && supportedDone && !application.validated ? application.adaptationValidated ? "Código inicial e alteração validados · falta resolver a aplicação independente." : "Código inicial validado · agora altere os dados e aplique sem a resposta pronta." : `${challenge.linguagem === "csharp" ? "C#" : challenge.linguagem === "python" ? "Python" : "JavaScript"} · ${challenge.habilidade || challenge.categoria || "Fundamentos"}`,
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
  let separateContinuation: AcademyActivityItem | null = null;
  if (resume) {
    if (resume.href === ENGLISH_SPEAKING_HREF) {
      const speaking = readSpeakingSave(get(speakingSaveKey(userId)));
      const current = getSpeakingLesson(speaking.current) ?? englishSpeakingLessons[0];
      const practiced = speaking.completed.length > 0 || englishSpeakingLessons.some(lesson => speaking.attempts[lesson.id] > 0);
      const finished = speaking.completed.length === englishSpeakingLessons.length;
      // Participation in speaking stays separate from the eight-scene quiz,
      // the six catalog activities and their aggregate completion/XP.
      separateContinuation = {
        id: "spoken-english", title: "Fale inglês com o Orbi", group: "experience", href: ENGLISH_SPEAKING_HREF,
        status: finished ? "completed" : practiced ? "in-progress" : "opened",
        completedUnits: speaking.completed.length, totalUnits: englishSpeakingLessons.length, unit: "itens praticados", practiced, reviewed: 0, lastAt: resume.updatedAt,
        detail: `Ler, ouvir e repetir · ${current.pt} / ${current.en}`,
        nextHref: finished ? "/estudante/jogos/ingles-em-cena" : ENGLISH_SPEAKING_HREF,
        nextLabel: finished ? "Praticar nas cenas de inglês" : "Continuar ouvindo e repetindo",
      };
    } else if (resume.href === ORBI_PULSE_HREF) {
      const pulse = readPulseSave(get(pulseSaveKey(userId)));
      const practiced = pulse.completed.length > 0 || pulseLessons.some(lesson => pulse.attempts[lesson.id] > 0 || pulse.drafts[lesson.id] !== lesson.starterCode);
      const finished = pulse.completed.length === pulseLessons.length;
      // A continuation pointer is not another catalog activity or an XP source.
      // Keep the original delivery item and aggregate summaries unchanged.
      separateContinuation = {
        id: "pulse-workshop", title: "Oficina do Pulso", group: "experience", href: ORBI_PULSE_HREF,
        status: finished ? "completed" : practiced ? "in-progress" : "opened",
        completedUnits: pulse.completed.length, totalUnits: pulseLessons.length, unit: "rotas", practiced, reviewed: 0, lastAt: resume.updatedAt,
        detail: finished ? "As duas rotas da Oficina estão concluídas. Leve a ideia para o código." : `${getPulseLesson(pulse.current).title} · ${getPulseLesson(pulse.current).objective}`,
        nextHref: "/estudante/pratica/variaveis-js?from=delivery", nextLabel: "Aplicar a descoberta no código",
      };
    } else if (resume.href === WORK_INCIDENT_HREF) {
      const incident = readIncidentSave(get(incidentSaveKey(userId)));
      const current = getIncidentCase(incident.current);
      const practiced = incident.completed.length > 0 || incident.attempts[incident.current] > 0 || incident.drafts[incident.current] !== current.starterCode;
      const finished = incident.completed.length === INCIDENT_CASE_IDS.length;
      separateContinuation = {
        id: "work-incident", title: "Quando a versão falha", group: "experience", href: WORK_INCIDENT_HREF,
        status: finished ? "completed" : practiced ? "in-progress" : "opened",
        completedUnits: incident.completed.length, totalUnits: INCIDENT_CASE_IDS.length, unit: "casos", practiced, reviewed: 0, lastAt: resume.updatedAt,
        detail: `Loja do Bairro · ${current.title}`,
        nextHref: finished ? "/estudante/pratica" : WORK_INCIDENT_HREF,
        nextLabel: finished ? "Levar a resposta ao laboratório" : "Retomar a ocorrência",
      };
    } else if (resume.href === WORK_DELIVERY_HREF) {
      const delivery = readWorkDeliverySave(get(workDeliveryKey(userId)));
      const practiced = delivery.completed || delivery.attempts > 0 || delivery.draft !== WORK_DELIVERY_STARTER_CODE;
      separateContinuation = {
        id: "work-delivery", title: "A esteira de homologação", group: "experience", href: WORK_DELIVERY_HREF,
        status: delivery.completed ? "completed" : practiced ? "in-progress" : "opened",
        completedUnits: Number(delivery.completed), totalUnits: 1, unit: "tarefa", practiced, reviewed: 0, lastAt: resume.updatedAt,
        detail: "Loja do Bairro · Publicar e verificar o pedido em homologação.",
        nextHref: delivery.completed ? WORK_INCIDENT_HREF : WORK_DELIVERY_HREF,
        nextLabel: delivery.completed ? "Investigar uma nova ocorrência" : "Retomar a esteira",
      };
    } else if (resume.href === WORK_SIMULATION_HREF) {
      // This collection has its own save and appears only when explicitly resumed.
      // It is not a seventh practice activity or an addition to the XP/counts.
      const work = readWorkSave(get(workSimulationKey(userId)));
      const current = getWorkCase(work.current);
      const practiced = work.completed.length > 0 || WORK_CASE_IDS.some(id => work.attempts[id] > 0 || work.drafts[id] !== getWorkCase(id).starterCode);
      const finished = work.completed.length === WORK_CASE_IDS.length;
      separateContinuation = {
        id: "work-simulation", title: "Simulador de trabalho", group: "experience", href: WORK_SIMULATION_HREF,
        status: finished ? "completed" : practiced ? "in-progress" : "opened",
        completedUnits: work.completed.length, totalUnits: WORK_CASE_IDS.length, unit: "casos", practiced, reviewed: 0, lastAt: resume.updatedAt,
        detail: `Loja do Bairro · ${current.title}`,
        nextHref: finished ? WORK_DELIVERY_HREF : WORK_SIMULATION_HREF,
        nextLabel: finished ? "Continuar na esteira" : "Retomar o turno",
      };
    }
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
  return { items, continueItem: chooseAcademyContinuation(separateContinuation ? [...items, separateContinuation] : items), summaries: { experiences: summarize("experience", "experiências"), code: summarize("code", "desafios"), csharp: summarize("csharp", "módulos"), sqlWorkshop: summarize("sql-workshop", "oficinas") } };
}
