import type { ProjectFilter } from "@/lib/projectCatalog";
import type { ServicoSlug } from "@/data/servicos";

export type ProjectEnvironment = {
  readonly id: ProjectFilter;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaHref: "/contato" | `/servicos/${ServicoSlug}`;
  readonly accent: string;
  /** Componentes separados por espaços para rgb(var(--environment-accent-rgb) / alpha). */
  readonly accentRgb: string;
  readonly secondary: string;
  readonly objectPosition: string;
  readonly media: {
    readonly poster: string;
    readonly posterMobile: string;
    readonly video: string;
    readonly videoMobile: string;
  };
};

function mediaFor(id: ProjectFilter): ProjectEnvironment["media"] {
  return {
    poster: `/images/project-worlds/${id}-v1.webp`,
    posterMobile: `/images/project-worlds/${id}-mobile-v1.webp`,
    video: `/videos/project-worlds/${id}-v1.mp4`,
    videoMobile: `/videos/project-worlds/${id}-mobile-v1.mp4`,
  };
}

/** Cenário e próximo passo comercial; a ordem dos cases continua em projectCatalog.ts. */
export const PROJECT_ENVIRONMENTS: Record<ProjectFilter, ProjectEnvironment> = {
  todos: {
    id: "todos",
    label: "Todos os projetos",
    title: "Da presença digital ao produto.",
    description: "Compare sites, catálogos e plataformas pelo que cada projeto resolve.",
    ctaLabel: "Conversar sobre meu projeto",
    ctaHref: "/contato",
    accent: "#54d9eb",
    accentRgb: "84 217 235",
    secondary: "#9278d8",
    objectPosition: "65% 50%",
    media: mediaFor("todos"),
  },
  "landing-pages": {
    id: "landing-pages",
    label: "Landing Pages",
    title: "Uma página. Um próximo passo.",
    description: "Apresente sua oferta e conduza o visitante até o contato.",
    ctaLabel: "Planejar minha página",
    ctaHref: "/servicos/vender-pela-internet",
    accent: "#8eeefa",
    accentRgb: "142 238 250",
    secondary: "#b9d7e4",
    objectPosition: "65% 50%",
    media: mediaFor("landing-pages"),
  },
  "sites-institucionais": {
    id: "sites-institucionais",
    label: "Sites Institucionais",
    title: "Seu negócio, bem apresentado.",
    description: "Serviços, identidade e informações claras para quem procura sua empresa.",
    ctaLabel: "Quero um site profissional",
    ctaHref: "/servicos/presenca-profissional",
    accent: "#d9c8ee",
    accentRgb: "217 200 238",
    secondary: "#7eb4d6",
    objectPosition: "60% 50%",
    media: mediaFor("sites-institucionais"),
  },
  "sistemas-dashboards": {
    id: "sistemas-dashboards",
    label: "Plataformas e sistemas",
    title: "Da operação ao produto digital.",
    description: "Pessoas, dados e regras reunidos em uma experiência feita para o seu contexto.",
    ctaLabel: "Planejar minha plataforma",
    ctaHref: "/servicos/projeto-especial",
    accent: "#7fb9f0",
    accentRgb: "127 185 240",
    secondary: "#8c78d7",
    objectPosition: "65% 50%",
    media: mediaFor("sistemas-dashboards"),
  },
  ecommerce: {
    id: "ecommerce",
    label: "E-commerce",
    title: "Sua coleção, no seu canal.",
    description: "Vitrine organizada e um caminho claro para escolher produtos e fazer pedidos.",
    ctaLabel: "Criar minha vitrine",
    ctaHref: "/servicos/vender-pela-internet",
    accent: "#aad6b1",
    accentRgb: "170 214 177",
    secondary: "#d8bd8e",
    objectPosition: "65% 50%",
    media: mediaFor("ecommerce"),
  },
  automacoes: {
    id: "automacoes",
    label: "Automações",
    title: "Conecte o que hoje é manual.",
    description: "Integre ferramentas e organize o caminho dos dados e das tarefas.",
    ctaLabel: "Planejar uma automação",
    ctaHref: "/servicos/automatizar-e-integrar",
    accent: "#bca3ed",
    accentRgb: "188 163 237",
    secondary: "#d7a77c",
    objectPosition: "65% 50%",
    media: mediaFor("automacoes"),
  },
};

export function getProjectEnvironment(category: ProjectFilter): ProjectEnvironment {
  return PROJECT_ENVIRONMENTS[category];
}
