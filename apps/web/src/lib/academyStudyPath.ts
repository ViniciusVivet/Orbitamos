import type { AcademyActivity, AcademyActivityItem } from "./academyActivity";
import { beginnerJavaScriptPath } from "./practiceExperience";

export type AcademyStudyPath = "fundamentals" | "csharp" | "sql";
export const academyStudyPaths = [
  { id: "fundamentals" as const, title: "Primeiros passos", description: "Do primeiro perfil a um orçamento: guia, alteração e aplicação independente.", href: "/estudante/pratica/variaveis-js" },
  { id: "csharp" as const, title: "C# & .NET", description: "Variáveis, condições e laços com prática guiada.", href: "/estudante/trilhas/csharp" },
  { id: "sql" as const, title: "SQL com Orbi", description: "Da primeira consulta à construção de uma tabela.", href: "/estudante/trilhas/sql" },
];
export const studyPathKey = (userId: string | number) => `orbitamos-academy-study-path-v1-${userId}`;
export function readStudyPath(raw: string | null): AcademyStudyPath | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    return record.version === 1 && (record.path === "fundamentals" || record.path === "csharp" || record.path === "sql") ? record.path : null;
  } catch { return null; }
}
export const serializeStudyPath = (path: AcademyStudyPath) => JSON.stringify({ version: 1, path });

export type AcademyStudyStep = { title: string; detail: string; href: string; action: string; pilotComplete: boolean };
const begun = (item: AcademyActivityItem) => item.practiced || item.status === "in-progress" || item.status === "completed";
const stepFor = (item: AcademyActivityItem): AcademyStudyStep => ({ title: item.title, detail: item.detail, href: item.href, action: "Continuar minha trilha", pilotComplete: false });

/** A chosen formation stays primary; an unrelated recent visit never changes it. Reads evidence only. */
export function getStudyPathStep(path: AcademyStudyPath, activity: AcademyActivity | null): AcademyStudyStep {
  if (path === "fundamentals") {
    const next = beginnerJavaScriptPath.find(step => activity?.items.find(item => item.id === `code:${step.slug}`)?.status !== "completed");
    if (next) {
      const item = activity?.items.find(item => item.id === `code:${next.slug}`);
      return { title: next.label, detail: item?.practiced ? item.detail : `${next.concept}. Aprenda com o guia, faça uma mudança e resolva uma nova situação por conta própria.`, href: `/estudante/pratica/${next.slug}`, action: item?.practiced ? "Continuar meus primeiros passos" : "Começar esta entrega", pilotComplete: false };
    }
    return { title: "Seu primeiro percurso está entregue.", detail: "Você praticou dados, contas, decisões e um pequeno orçamento. Seus códigos continuam disponíveis para revisar e experimentar.", href: "/estudante/pratica/primeiro-orcamento-js", action: "Rever meu primeiro orçamento", pilotComplete: true };
  }
  if (path === "csharp") {
    const modules = ["variables", "conditions", "loops"].flatMap(id => activity?.items.find(item => item.id === `csharp:${id}`) ?? []);
    if (!modules.some(begun)) return { title: "Comece sua trilha C# & .NET.", detail: "Conheça o projeto da jornada e comece por variáveis. O piloto também inclui condições e laços.", href: "/estudante/trilhas/csharp", action: "Começar minha trilha", pilotComplete: false };
    const active = modules.filter(item => begun(item) && item.status !== "completed").sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0))[0];
    const next = active ?? modules.find(item => item.status !== "completed");
    if (next) return stepFor(next);
    return { title: "Você percorreu os módulos deste piloto.", detail: "Variáveis, condições e laços foram praticados. Você pode revisitar as atividades; os próximos módulos ainda estão em preparação.", href: "/estudante/trilhas/csharp", action: "Revisitar minha trilha C#", pilotComplete: true };
  }
  const quest = activity?.items.find(item => item.id === "sql");
  const workshop = activity?.items.find(item => item.id === "sql-workshop");
  if (quest?.status === "completed" && workshop?.status === "completed") return { title: "Suas primeiras consultas e tabelas estão de pé.", detail: "Você percorreu a aventura e a oficina SQL disponíveis. Revise as ideias e tente aplicá-las sem consultar o exemplo.", href: "/estudante/jogos/revisao", action: "Revisar minha jornada SQL", pilotComplete: true };
  if (workshop && begun(workshop) && workshop.status !== "completed") return stepFor(workshop);
  if (quest?.status === "completed") return { title: "Agora, construa sua própria tabela.", detail: "A aventura de consultas terminou. A oficina SQL continua o caminho com criação, cadastro e consulta de dados.", href: "/estudante/trilhas/sql?mode=workshop", action: "Continuar na oficina SQL", pilotComplete: false };
  if (quest && begun(quest)) return stepFor(quest);
  return { title: "Comece sua jornada SQL com Orbi.", detail: "Ajude a loja do Orbi a encontrar os produtos que estão acabando. Depois, construa uma tabela sua.", href: "/estudante/trilhas/sql", action: "Começar minha trilha", pilotComplete: false };
}
