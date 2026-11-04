import { describe, expect, it } from "vitest";
import type { JobApplication, Project } from "./api";
import { collaboratorProjectHref, filterApplications, findAuthorizedProject, nextProjectAction, projectDateDay, projectDue, projectStage, projectResourceLinks, safeProjectLink, sortCollaboratorProjects } from "./collaboratorExperience";

const project = (id: number, values: Partial<Project> = {}): Project => ({ id, title: `Projeto ${id}`, description: "", status: "in_progress", createdAt: "2026-01-01", ...values });
const now = new Date(2026, 10, 3, 15);
describe("collaborator operational flow", () => {
  it("classifies canonical and Portuguese statuses consistently, including paused/completed", () => {
    for (const status of ["completed", "Concluído", "finalizada", "encerrado"]) expect(projectStage(status)).toBe("completed");
    for (const status of ["paused", "pausada"]) expect(projectStage(status)).toBe("paused");
    for (const status of ["in_progress", "Em andamento", "ativo"]) expect(projectStage(status)).toBe("in_progress");
    for (const status of ["todo", "", "not_completed", "não concluído"]) expect(projectStage(status)).toBe("todo");
  });
  it("uses the same groups for the application count and visible records", () => {
    const statuses = ["pending", "reviewing", "accepted", "declined", "withdrawn"] as const;
    const items = statuses.map((status, id) => ({ id, jobId: id, jobTitle: "Vaga", jobType: "Projeto", status, createdAt: "2026-11-01" } satisfies JobApplication));
    expect(filterApplications(items, "active").map(item => item.status)).toEqual(["pending", "reviewing"]);
    expect(filterApplications(items, "closed").map(item => item.status)).toEqual(["declined", "withdrawn"]);
    expect(filterApplications(items, "accepted")).toHaveLength(1);
    expect(filterApplications(items, "all")).toHaveLength(5);
  });
  it("rejects invalid calendar dates and treats deadlines as days, not elapsed hours", () => {
    expect(projectDateDay("2026-02-30")).toBeNull(); expect(projectDateDay("invalid")).toBeNull();
    expect(projectDue(project(1, { dueDate: "2026-11-03" }), now).kind).toBe("today");
    expect(projectDue(project(1, { dueDate: "2026-11-02" }), now).kind).toBe("overdue");
    expect(projectDue(project(1, { dueDate: "2026-11-09" }), now).kind).toBe("soon");
    expect(projectDue(project(1, { status: "completed", dueDate: "2026-01-01" }), now).kind).toBe("completed");
    expect(projectDue(project(1, { dueDate: "2026-11-02" }), new Date("2026-11-03T02:00:00Z")).kind).toBe("today");
  });
  it("prioritizes active deadlines then priority, preserves input order data and leaves archived work last", () => {
    const items = [project(1, { status: "completed", priority: "urgent", dueDate: "2026-01-01" }), project(2, { priority: "urgent" }), project(3, { dueDate: "2026-11-03" }), project(4, { dueDate: "2026-11-02" }), project(5, { status: "paused", dueDate: "2026-11-01" }), project(6, { priority: "low" })];
    expect(sortCollaboratorProjects(items, now).map(item => item.id)).toEqual([4, 3, 2, 6, 5, 1]);
    expect(items.map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(nextProjectAction(items[3], now).label).toBe("Alinhar prazo e próxima entrega");
    expect(nextProjectAction(items[1], now).label).toBe("Alinhar o escopo do projeto");
  });
  it("selects exclusively from the authorized list and rejects malformed identifiers", () => {
    const items = [project(2)];
    expect(findAuthorizedProject(items, "2")).toEqual({ kind: "found", project: items[0] });
    expect(findAuthorizedProject(items, null).kind).toBe("none");
    for (const input of ["1", "-2", "2foo", "02", "1e2", "9007199254740992", "", "https://evil.test"]) expect(findAuthorizedProject(items, input).kind).toBe("unavailable");
    expect(collaboratorProjectHref(2)).toBe("/colaborador/projetos?projeto=2");
    expect(collaboratorProjectHref(2, true)).toBe("/dev/workspace-preview?view=projects&projeto=2");
    expect(collaboratorProjectHref(-2)).toBe("/colaborador/projetos");
  });
  it("allows only ordinary web resource links without credentials", () => {
    expect(safeProjectLink("https://example.com/brief?x=1")).toBe("https://example.com/brief?x=1");
    for (const href of ["javascript:alert(1)", "data:text/html,test", "//example.com", "/admin", "https://user:pass@example.com"]) expect(safeProjectLink(href)).toBeNull();
    expect(projectResourceLinks([null, 3, {}, { url: "javascript:alert(1)" }, { url: "https://example.com", label: 1 }])).toEqual([{ label: "example.com", href: "https://example.com/" }]);
  });
});
