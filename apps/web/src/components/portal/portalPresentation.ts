import type { Curso } from "@/lib/cursos";

export function courseEdition(course: Curso) {
  const text = (course.slug + " " + course.titulo).toLowerCase();
  if (/github|\bgit\b/.test(text)) return { mark: "Git", field: "Versionamento", tone: "clay" };
  if (/html|css|javascript/.test(text)) return { mark: "Web", field: "Desenvolvimento web", tone: "violet" };
  if (/python|lógica|logica/.test(text)) return { mark: "Py", field: "Lógica & programação", tone: "sage" };
  if (/sql|banco/.test(text)) return { mark: "SQL", field: "Banco de dados", tone: "sage" };
  if (/csharp|c#/.test(text)) return { mark: "C#", field: "Desenvolvimento", tone: "violet" };
  if (/excel|vba|power/.test(text)) return { mark: "Dados", field: "Análise & automação", tone: "sage" };
  return { mark: "Orb.", field: "Tecnologia na prática", tone: "clay" };
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function projectIsComplete(status: string) {
  return /completed|conclu|encerrad|finaliz/.test(normalize(status));
}
export function projectStatusLabel(status: string) {
  if (projectIsComplete(status)) return "Concluído";
  if (/paused|pausad/.test(normalize(status))) return "Pausado";
  if (/progress|andamento|ativo/.test(normalize(status))) return "Em andamento";
  if (/todo|a fazer|planejad/.test(normalize(status))) return "A fazer";
  return status.replaceAll("_", " ") || "Sem status";
}
export function displayDate(value?: string | null) {
  if (!value) return null;
  // Date-only deadlines are calendar dates, not UTC timestamps.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
export function safeProgress(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
}
