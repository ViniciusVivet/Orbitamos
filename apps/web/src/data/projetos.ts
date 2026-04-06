import type { Projeto } from "@/types/projeto";

/** Projetos reais da Orbitamos usados como portfólio comercial. */
export const projetos: Projeto[] = [
  {
    slug: "sabrina-lashes",
    nome: "Sabrina Lashes",
    categoria: "sites-institucionais",
    resumo:
      "Site institucional para especialista em beleza, focado em presença profissional, serviços claros e contato rapido.",
    tags: ["Site institucional", "Beleza", "WhatsApp", "Conversao local"],
    status: "publicado",
    link: "https://salashes-whatsapp-funnel.vercel.app/",
    thumbnail: "/case-sabrina-lashes.png",
    imagemPrincipal: "/case-sabrina-lashes.png",
    contexto:
      "A Sabrina ja tinha bom trabalho no boca a boca, mas sua presenca digital era fragmentada entre Instagram e indicacoes.",
    problema:
      "Potenciais clientes nao encontravam facilmente informacoes sobre servicos, valores e formas de agendamento em um unico lugar.",
    solucao:
      "Criamos um site institucional responsivo com foco em conversao local, apresentando servicos, provas de confianca e CTA direto para WhatsApp e agendamento.",
    destaques: [
      "Visual alinhado com a identidade da marca pessoal da Sabrina",
      "Sessao clara de servicos e beneficios com foco em confianca",
      "CTA sempre visivel para contato rapido por WhatsApp",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    resultado:
      "Presenca digital mais profissional e pronta para campanhas pagas e parcerias locais.",
  },
  {
    slug: "yume-moda-disruptiva",
    nome: "YUME – Moda Disruptiva",
    categoria: "ecommerce",
    resumo:
      "Vitrine digital para marca autoral de moda, com foco em experiencia visual forte e identidade marcante.",
    tags: ["E-commerce", "Moda autoral", "Branding", "Experiencia visual"],
    status: "em-evolucao",
    link: "https://yume-atelier.vercel.app/",
    thumbnail: "/case-yume.png",
    imagemPrincipal: "/case-yume.png",
    contexto:
      "A YUME precisava tirar a marca do papel e ter um lugar proprio para apresentar colecoes e narrativa visual.",
    problema:
      "Dependencia total de redes sociais dificultava mostrar o catalogo completo e a proposta de valor da marca.",
    solucao:
      "Desenhamos uma loja digital com foco em storytelling de marca, vitrine limpa e espaco para colecoes, editoriais e futuras funcoes de venda.",
    destaques: [
      "Identidade visual aplicada em toda a experiencia da loja",
      "Layout pensado para fotos em destaque e banners de campanha",
      "Arquitetura preparada para evoluir para checkout completo",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    resultado:
      "Base digital pronta para crescer com novas colecoes, campanhas e integracoes de pagamento.",
  },
  {
    slug: "kitcerto",
    nome: "KitCerto",
    categoria: "ecommerce",
    resumo:
      "Estrutura de loja digital para catalogo de kits e produtos, com foco em organizacao e experiencia mobile.",
    tags: ["E-commerce", "Catalogo", "Mobile-first"],
    status: "mvp",
    link: "https://kit-certo.vercel.app/",
    thumbnail: "/case-kitcerto.png",
    imagemPrincipal: "/case-kitcerto.png",
    contexto:
      "A KitCerto precisava de uma estrutura de loja para organizar produtos em kits e apresentar melhor a proposta da marca.",
    problema:
      "A oferta de produtos ficava confusa em canais dispersos, dificultando entender o que estava incluido em cada kit.",
    solucao:
      "Desenvolvemos uma vitrine de produtos organizada por kits, com descricao clara, fotos em destaque e navegacao pensada para uso no celular.",
    destaques: [
      "Catalogo organizado por kits e categorias",
      "Experiencia otimizada para mobile",
      "Layout preparado para receber funcoes de carrinho e checkout",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    resultado:
      "Loja em formato MVP, com estrutura pronta para evoluir em funcoes de venda e integracoes logisticas.",
  },
  {
    slug: "destaque-multimarcas",
    nome: "Destaque Multimarcas",
    categoria: "sites-institucionais",
    resumo:
      "Site de vendas para concessionaria multimarcas: estoque filtravel, galeria por veiculo, simulador de financiamento e CTA direto para WhatsApp do consultor.",
    tags: ["Conversao", "WhatsApp", "Estoque", "Financiamento", "Mobile-first"],
    status: "publicado",
    link: "https://concessionariadestaque.vercel.app/",
    github: "https://github.com/ViniciusVivet/concessionariadestaque",
    thumbnail:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80&auto=format&fit=crop",
    imagemPrincipal:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80&auto=format&fit=crop",
    contexto:
      "A Destaque Multimarcas precisava de presenca digital que transmitisse credibilidade e levasse o visitante do estoque ao contato com o consultor em poucos cliques.",
    problema:
      "Leads se perdiam entre anuncios dispersos; faltava um hub unico com busca, ficha do veiculo e caminho claro para negociacao via WhatsApp.",
    solucao:
      "Entregamos uma pagina unica performatica em HTML, CSS e JavaScript vanilla: hero com carrossel, filtros de estoque em tempo real, modal com galeria e simulador de parcelas, e mensagens pre-preenchidas para o WhatsApp.",
    destaques: [
      "Zero dependencias de build — carrega rapido e hospeda em qualquer CDN",
      "Filtros por marca, modelo, ano, cambio e faixa de preco",
      "Modal com galeria auto-avanço e simulador de financiamento",
      "Consultor identificado e botao flutuante de WhatsApp em toda a jornada",
    ],
    stack: ["HTML5", "CSS3", "JavaScript (vanilla)"],
    resultado:
      "Vendedor digital 24/7 com experiencia responsiva (incluindo bottom sheet no mobile) pronta para campanhas e trafego pago.",
  },
  {
    slug: "sensimilla-records",
    nome: "Sensimilla Records",
    categoria: "sites-institucionais",
    resumo:
      "Site da gravadora independente: experiencia longa com scroll suave, equipe, tour, lancamentos, merch, YouTube e editorial — identidade forte da ZL.",
    tags: ["Gravadora", "Entretenimento", "Scroll", "Animacao", "Branding"],
    status: "publicado",
    link: "https://sensimilla-records-web.vercel.app/",
    github: "https://github.com/ViniciusVivet/Sensimilla-Records",
    thumbnail:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80&auto=format&fit=crop",
    imagemPrincipal:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&q=80&auto=format&fit=crop",
    contexto:
      "A Sensimilla Records precisava de um hub oficial que reunisse selo, artistas, lancamentos e presenca em plataformas sem parecer um template generico.",
    problema:
      "A narrativa da casa estava espalhada em redes; faltava um site que traduzisse a estetica do movimento e organizasse links, datas e catalogo.",
    solucao:
      "Construimos um site em Next.js com conteudo centralizado em dados (site.ts / dossie), scroll suave com Lenis, animacoes GSAP + ScrollTrigger e seções dedicadas a equipe, tour, Out Now, merch e visuais.",
    destaques: [
      "Respeito a preferencia de movimento reduzido (scroll nativo, animacoes desligadas)",
      "SEO base: sitemap, robots e Open Graph",
      "Formulario de contato preparado para integracao externa",
      "Estrutura pensada para trocar mídia e copy sem reescrever layout",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Lenis"],
    resultado:
      "Presenca digital alinhada ao posicionamento do selo, pronta para imprensa, booking e novos lançamentos.",
  },
  {
    slug: "orbitamos-portal-tech",
    nome: "Orbitamos Portal Tech",
    categoria: "sistemas-dashboards",
    resumo:
      "Plataforma proprietaria da Orbitamos com autenticacao, area do estudante, comunidade, mentorias e produtos digitais.",
    tags: ["Plataforma web", "Auth", "Dashboard", "Comunidade"],
    status: "em-evolucao",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80&auto=format&fit=crop",
    imagemPrincipal:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1400&q=80&auto=format&fit=crop",
    contexto:
      "A Orbitamos precisava transformar o movimento em produto digital proprio, centralizando jornadas de estudo, mentorias e comunidade.",
    problema:
      "Ferramentas separadas dificultavam acompanhar progresso dos estudantes, organizar conteudo e criar novas experiencias digitais.",
    solucao:
      "Construimos uma plataforma web autoral com login, area do estudante, trilhas de conteudo, comunidade, mensagens e espaco para novos modulos.",
    destaques: [
      "Autenticacao e gestao de usuarios",
      "Area do estudante com aulas, progresso e missoes",
      "Modulos para mentorias, comunidade e area do colaborador",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase/PostgreSQL"],
    resultado:
      "Base solida de produto para evoluir como plataforma educacional e hub de projetos da Orbitamos.",
  },
];

export function getProjetoBySlug(slug: string): Projeto | undefined {
  return projetos.find((p) => p.slug === slug);
}

export function getProjetosByCategoria(categoria: string): Projeto[] {
  if (!categoria || categoria === "todos") return projetos;
  return projetos.filter((p) => p.categoria === categoria);
}
