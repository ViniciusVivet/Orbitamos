import type { JobApplication, Project } from "./api";

// Development previews only. Never fetched from or written to a real account.
export const collaboratorDemoProjects: Project[] = [
  { id: 1, title: "Uma nova experiência para a comunidade", description: "Protótipo e interface", status: "in_progress", createdAt: "2026-10-20", dueDate: "2026-11-10", progress: 65, priority: "high", clientName: "Cliente demonstrativo", briefing: "Criar a página inicial, o catálogo e o caminho para contato pelo WhatsApp.\n\nAlinhar com a equipe as seções e o conteúdo antes da publicação. Este é um briefing demonstrativo.", links: [{ label: "Material de referência demonstrativo", url: "https://example.com/briefing" }, { label: "Link inválido que não deve aparecer", url: "javascript:alert(1)" }] },
  { id: 2, title: "Portfólio de uma marca autoral", description: "Um novo projeto para alinhar o escopo.", status: "todo", createdAt: "2026-10-30", priority: "medium", progress: 0 },
  { id: 3, title: "Identidade da Oficina", description: "Aguardando alinhamento para retomar.", status: "paused", createdAt: "2026-10-21", priority: "urgent", progress: 20 },
  { id: 4, title: "Site da Loja Horizonte", description: "Case encerrado para consultar o histórico.", status: "completed", createdAt: "2026-09-15", dueDate: "2026-10-01", progress: 100, priority: "medium", briefing: "Projeto demonstrativo concluído. O briefing e o andamento continuam consultáveis." },
];
const statuses = ["pending", "reviewing", "accepted", "declined", "withdrawn"] as const;
export const collaboratorDemoApplications: JobApplication[] = statuses.map((status, index) => ({ id: index + 1, jobId: index + 1, jobTitle: ["Interface de um catálogo", "Automação de pedidos", "Site de uma oficina", "Apoio em design", "Organização de dados"][index], jobType: "Projeto demonstrativo", status, createdAt: "2026-11-01T15:00:00Z", coverLetter: "Apresentação demonstrativa para consultar e acompanhar o processo.", feedback: status === "accepted" ? "Vamos alinhar o escopo e a disponibilidade nas conversas do trabalho." : null }));
