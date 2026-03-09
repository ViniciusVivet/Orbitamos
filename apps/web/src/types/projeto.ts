/** Categorias de projetos para filtro e exibição */
export type CategoriaSlug =
  | "landing-pages"
  | "sites-institucionais"
  | "sistemas-dashboards"
  | "ecommerce"
  | "automacoes";

export const CATEGORIAS: { slug: CategoriaSlug; label: string }[] = [
  { slug: "landing-pages", label: "Landing Pages" },
  { slug: "sites-institucionais", label: "Sites Institucionais" },
  { slug: "sistemas-dashboards", label: "Sistemas / Dashboards" },
  { slug: "ecommerce", label: "E-commerce" },
  { slug: "automacoes", label: "Automações" },
];

/** Status do projeto para credibilidade */
export type StatusSlug = "publicado" | "mvp" | "em-evolucao";

export const STATUS_LABELS: Record<StatusSlug, string> = {
  publicado: "Publicado",
  mvp: "MVP",
  "em-evolucao": "Em evolução",
};

export interface Projeto {
  slug: string;
  nome: string;
  categoria: CategoriaSlug;
  resumo: string;
  tags: string[];
  status: StatusSlug;
  /** Link para o projeto publicado (opcional) */
  link?: string;
  /** Thumbnail/mockup (URL ou path) */
  thumbnail: string;
  /** Imagem principal para a página do case */
  imagemPrincipal: string;
  /** Contexto do projeto */
  contexto: string;
  /** Problema a ser resolvido */
  problema: string;
  /** Solução construída */
  solucao: string;
  /** Destaques (bullets) */
  destaques: string[];
  /** Stack usada */
  stack: string[];
  /** Resultado/impacto */
  resultado: string;
}
