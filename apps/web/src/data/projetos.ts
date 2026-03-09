import type { Projeto } from "@/types/projeto";

/** Dados mockados dos projetos. Fácil trocar por API/CMS depois. */
export const projetos: Projeto[] = [
  {
    slug: "landing-saaS-tech",
    nome: "Landing SaaS Tech",
    categoria: "landing-pages",
    resumo: "Landing de conversão para produto B2B com foco em captação de leads e demonstração de valor.",
    tags: ["Next.js", "Tailwind", "Framer Motion"],
    status: "publicado",
    link: "https://exemplo.com",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    imagemPrincipal: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    contexto: "Startup B2B precisava de uma página de destino única para campanhas de tráfego pago e eventos.",
    problema: "Site institucional genérico não convertia; visitantes não entendiam o produto em poucos segundos.",
    solucao: "Landing com hero claro, prova social, comparação antes/depois e CTA único, otimizada para mobile e performance.",
    destaques: [
      "Taxa de conversão 3x maior que a página anterior",
      "Carregamento under 2s em 3G",
      "A/B test integrado para headlines",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel Analytics"],
    resultado: "Aumento de leads qualificados e redução do CPL nas campanhas.",
  },
  {
    slug: "site-institucional-advocacia",
    nome: "Site Institucional Advocacia",
    categoria: "sites-institucionais",
    resumo: "Presença digital profissional para escritório de advocacia com áreas de atuação e contato.",
    tags: ["React", "Tailwind", "SEO"],
    status: "publicado",
    thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    imagemPrincipal: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
    contexto: "Escritório em expansão precisava de site confiável para captar clientes e passar credibilidade.",
    problema: "Não tinham presença digital; contato era só por indicação e telefone.",
    solucao: "Site institucional com identidade visual sólida, páginas por área de atuação, formulário de contato e blog para SEO.",
    destaques: [
      "Layout responsivo e acessível",
      "SEO local e schema para escritório",
      "Formulário integrado e WhatsApp",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "MDX para blog"],
    resultado: "Primeira página no Google para o nome do escritório e aumento de contatos pelo site.",
  },
  {
    slug: "dashboard-operacoes",
    nome: "Dashboard de Operações",
    categoria: "sistemas-dashboards",
    resumo: "Painel para acompanhamento de métricas operacionais, ordens e indicadores em tempo quase real.",
    tags: ["React", "Charts", "API"],
    status: "mvp",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    imagemPrincipal: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    contexto: "Operação logística precisava visualizar volume de pedidos, atrasos e performance por região.",
    problema: "Dados espalhados em planilhas e e-mails; decisões atrasadas por falta de visão única.",
    solucao: "Dashboard com gráficos, filtros por período e região, e alertas para indicadores fora da meta.",
    destaques: [
      "Atualização automática a cada 5 min",
      "Exportação de relatórios em PDF",
      "Permissões por perfil (admin/operador)",
    ],
    stack: ["Next.js", "Recharts", "Tailwind", "REST API"],
    resultado: "Redução do tempo de análise e reação a problemas operacionais.",
  },
  {
    slug: "loja-dropshipping",
    nome: "Loja Dropshipping",
    categoria: "ecommerce",
    resumo: "E-commerce focado em conversão com catálogo, carrinho e integração com gateways de pagamento.",
    tags: ["Next.js", "Stripe", "E-commerce"],
    status: "em-evolucao",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    imagemPrincipal: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    contexto: "Marca própria queria loja própria em vez de depender só de marketplaces.",
    problema: "Comissões altas e pouco controle da experiência de compra nos marketplaces.",
    solucao: "Loja com catálogo, busca, carrinho, checkout e integração com fornecedor e pagamentos.",
    destaques: [
      "Checkout otimizado e mobile-first",
      "Integração com API do fornecedor",
      "Painel básico de pedidos",
    ],
    stack: ["Next.js", "Stripe", "Tailwind", "PostgreSQL"],
    resultado: "Loja no ar em modo beta; próximos passos: marketing e automação de estoque.",
  },
  {
    slug: "automacao-relatorios",
    nome: "Automação de Relatórios",
    categoria: "automacoes",
    resumo: "Pipeline que consolida dados de várias fontes e gera relatórios em PDF/Excel agendados.",
    tags: ["Node.js", "Sheets", "PDF"],
    status: "publicado",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
    imagemPrincipal: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80",
    contexto: "Equipe comercial precisava de relatórios semanais sem trabalho manual de copiar/colar.",
    problema: "Horas gastas toda semana montando planilhas a partir de CRM, planilhas e e-mails.",
    solucao: "Script agendado que puxa dados das APIs e planilhas, consolida e gera PDF/Excel enviado por e-mail.",
    destaques: [
      "Execução diária/semanal agendada",
      "Múltiplas fontes (API + Google Sheets)",
      "Envio automático por e-mail",
    ],
    stack: ["Node.js", "Google Sheets API", "Puppeteer/PDF", "Cron"],
    resultado: "Economia de ~8h/semana e relatórios sempre no mesmo formato.",
  },
];

export function getProjetoBySlug(slug: string): Projeto | undefined {
  return projetos.find((p) => p.slug === slug);
}

export function getProjetosByCategoria(categoria: string): Projeto[] {
  if (!categoria || categoria === "todos") return projetos;
  return projetos.filter((p) => p.categoria === categoria);
}
