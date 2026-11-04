import type { ApplicationStatus, JobApplication, Project } from "./api";

export type ProjectStage = "todo" | "in_progress" | "paused" | "completed";
export type ApplicationFilter = "all" | "active" | "accepted" | "closed";
const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

export function projectStage(status: string): ProjectStage {
  const text = normalized(status);
  if (["completed", "complete", "concluido", "concluida", "encerrado", "encerrada", "finalizado", "finalizada"].includes(text)) return "completed";
  if (["paused", "pausado", "pausada", "suspenso", "suspensa"].includes(text)) return "paused";
  if (["in progress", "em andamento", "andamento", "ativo", "ativa", "active"].includes(text)) return "in_progress";
  return "todo";
}

export const projectStageLabels: Record<ProjectStage, string> = { todo: "A fazer", in_progress: "Em andamento", paused: "Pausado", completed: "Concluído" };
export const applicationFilterLabels: Record<ApplicationFilter, string> = { all: "Todas", active: "Em andamento", accepted: "Aceitas", closed: "Encerradas" };
const applicationGroups: Record<ApplicationFilter, readonly ApplicationStatus[]> = { all: ["pending", "reviewing", "accepted", "declined", "withdrawn"], active: ["pending", "reviewing"], accepted: ["accepted"], closed: ["declined", "withdrawn"] };

export function filterApplications(items: JobApplication[], filter: ApplicationFilter) {
  return items.filter(item => applicationGroups[filter].includes(item.status));
}

/** Calendar dates keep their day in every time zone. Invalid dates are never deadlines. */
export function projectDateDay(value?: string | null): number | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day), date = new Date(stamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? stamp : null;
}

export function projectDue(project: Project, now = new Date()) {
  const deadline = projectDateDay(project.dueDate);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? "0";
  const today = Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day")));
  const days = deadline === null ? null : Math.round((deadline - today) / 86400000);
  if (projectStage(project.status) === "completed") return { kind: "completed" as const, days };
  if (projectStage(project.status) === "paused") return { kind: "paused" as const, days };
  if (days === null) return { kind: "unknown" as const, days };
  return { kind: days < 0 ? "overdue" as const : days === 0 ? "today" as const : days <= 7 ? "soon" as const : "upcoming" as const, days };
}

export function sortCollaboratorProjects(projects: Project[], now = new Date()): Project[] {
  const stages: Record<ProjectStage, number> = { todo: 0, in_progress: 0, paused: 1, completed: 2 };
  const deadlineRank = { overdue: 0, today: 1, soon: 2, upcoming: 3, unknown: 3, paused: 5, completed: 6 };
  const priorities = { urgent: 0, high: 1, medium: 2, low: 3 };
  return [...projects].sort((a, b) => stages[projectStage(a.status)] - stages[projectStage(b.status)] || deadlineRank[projectDue(a, now).kind] - deadlineRank[projectDue(b, now).kind] || priorities[a.priority ?? "medium"] - priorities[b.priority ?? "medium"] || (projectDateDay(a.dueDate) ?? Infinity) - (projectDateDay(b.dueDate) ?? Infinity) || a.id - b.id);
}

export function nextProjectAction(project: Project, now = new Date()) {
  const due = projectDue(project, now);
  if (due.kind === "completed") return { label: "Revisitar a entrega", reason: "Consulte o briefing e os links que ficaram registrados neste projeto." };
  if (due.kind === "paused") return { label: "Conferir a retomada", reason: "Este projeto está pausado. Alinhe com a equipe antes de retomar o trabalho." };
  if (due.kind === "overdue") return { label: "Alinhar prazo e próxima entrega", reason: "O prazo informado já passou. Confira o andamento e combine o próximo passo com a equipe." };
  if (due.kind === "today") return { label: "Conferir a entrega de hoje", reason: "O prazo informado é hoje. Consulte o escopo e os links antes de alinhar a entrega." };
  if (due.kind === "soon") return { label: "Preparar a próxima entrega", reason: "O prazo informado está nos próximos sete dias. Revise o briefing e o que precisa ser alinhado." };
  if (!project.briefing?.trim()) return { label: "Alinhar o escopo do projeto", reason: "Ainda não há briefing detalhado. Combine a próxima entrega antes de começar." };
  return { label: "Retomar o projeto", reason: "Consulte o briefing e os materiais para alinhar sua próxima entrega." };
}

export function collaboratorProjectHref(id?: number, preview = false) {
  const base = preview ? "/dev/workspace-preview?view=projects" : "/colaborador/projetos";
  return Number.isSafeInteger(id) && (id ?? 0) > 0 ? `${base}${preview ? "&" : "?"}projeto=${id}` : base;
}

/** Query strings select only a project from the list already authorized by getMyProjects. */
export function findAuthorizedProject(projects: Project[], requested: string | null): { kind: "none" | "unavailable"; project?: never } | { kind: "found"; project: Project } {
  if (requested === null) return { kind: "none" };
  if (!/^[1-9]\d*$/.test(requested) || !Number.isSafeInteger(Number(requested))) return { kind: "unavailable" };
  const project = projects.find(item => item.id === Number(requested));
  return project ? { kind: "found", project } : { kind: "unavailable" };
}

export function safeProjectLink(value: string): string | null {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function projectResourceLinks(value: unknown): { label: string; href: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (!item || typeof item !== "object" || typeof item.url !== "string") return [];
    const href = safeProjectLink(item.url);
    if (!href) return [];
    return [{ href, label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : new URL(href).hostname }];
  });
}
