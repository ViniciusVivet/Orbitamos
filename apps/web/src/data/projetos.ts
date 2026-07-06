import type { Projeto } from "@/types/projeto";

/** Projetos reais da Orbitamos usados como portfólio comercial. */
export const projetos: Projeto[] = [
  {
    slug: "mb-multimarcas-infantil",
    nome: "MB Multimarcas Infantil",
    categoria: "ecommerce",
    resumo:
      "Catálogo digital de moda infantil com filtros por categoria, vitrine de produtos e atendimento direto pelo WhatsApp.",
    tags: ["Catálogo digital", "Moda infantil", "WhatsApp", "Mobile-first"],
    status: "publicado",
    link: "https://mb-multimarcas-infantil.vercel.app/",
    thumbnail: "/case-mb-multimarcas-infantil.png",
    imagemPrincipal: "/case-mb-multimarcas-infantil.png",
    contexto:
      "A MB Multimarcas Infantil precisava de uma presença digital simples e comercial para apresentar peças infantis e facilitar o atendimento pelo WhatsApp.",
    problema:
      "Os produtos dependiam de atendimento manual e redes sociais, dificultando organizar modelos, tamanhos, cores e caminho rápido para compra.",
    solucao:
      "Criamos uma vitrine responsiva com catálogo filtrável, detalhes de produtos, chamada direta para WhatsApp, informações da loja e acesso ao Instagram.",
    destaques: [
      "Catálogo organizado por categorias como conjuntos, calças e casacos",
      "Fluxo de compra pensado para WhatsApp, sem checkout complexo",
      "Seções de sobre, endereço, contato e redes sociais em uma página leve",
      "Experiência mobile-first para pais e mães comprarem pelo celular",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    resultado:
      "Loja com vitrine digital publicada, produtos mais organizados e caminho direto do interesse ao atendimento.",
  },
  {
    slug: "sabrina-lashes",
    nome: "Sabrina Lashes",
    categoria: "sites-institucionais",
    resumo:
      "Site institucional para especialista em beleza, focado em presença profissional, serviços claros e contato rápido.",
    tags: ["Site institucional", "Beleza", "WhatsApp", "Conversão local"],
    status: "publicado",
    link: "https://salashes-whatsapp-funnel.vercel.app/",
    thumbnail: "/case-sabrina-lashes.png",
    imagemPrincipal: "/case-sabrina-lashes.png",
    contexto:
      "A Sabrina já tinha bom trabalho no boca a boca, mas sua presença digital era fragmentada entre Instagram e indicações.",
    problema:
      "Potenciais clientes não encontravam facilmente informações sobre serviços, valores e formas de agendamento em um único lugar.",
    solucao:
      "Criamos um site institucional responsivo com foco em conversão local, apresentando serviços, provas de confiança e CTA direto para WhatsApp e agendamento.",
    destaques: [
      "Visual alinhado com a identidade da marca pessoal da Sabrina",
      "Sessão clara de serviços e benefícios com foco em confiança",
      "CTA sempre visível para contato rápido por WhatsApp",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    resultado:
      "Presença digital mais profissional e pronta para campanhas pagas e parcerias locais.",
  },
  {
    slug: "yume-moda-disruptiva",
    nome: "YUME – Moda Disruptiva",
    categoria: "ecommerce",
    resumo:
      "Vitrine digital para marca autoral de moda, com foco em experiência visual forte e identidade marcante.",
    tags: ["E-commerce", "Moda autoral", "Branding", "Experiência visual"],
    status: "em-evolucao",
    link: "https://yume-atelier.vercel.app/",
    thumbnail: "/case-yume.png",
    imagemPrincipal: "/case-yume.png",
    contexto:
      "A YUME precisava tirar a marca do papel e ter um lugar próprio para apresentar coleções e narrativa visual.",
    problema:
      "Dependência total de redes sociais dificultava mostrar o catálogo completo e a proposta de valor da marca.",
    solucao:
      "Desenhamos uma loja digital com foco em storytelling de marca, vitrine limpa e espaço para coleções, editoriais e futuras funções de venda.",
    destaques: [
      "Identidade visual aplicada em toda a experiência da loja",
      "Layout pensado para fotos em destaque e banners de campanha",
      "Arquitetura preparada para evoluir para checkout completo",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    resultado:
      "Base digital pronta para crescer com novas coleções, campanhas e integrações de pagamento.",
  },
  {
    slug: "kitcerto",
    nome: "KitCerto",
    categoria: "ecommerce",
    resumo:
      "Estrutura de loja digital para catálogo de kits e produtos, com foco em organização e experiência mobile.",
    tags: ["E-commerce", "Catálogo", "Mobile-first"],
    status: "mvp",
    link: "https://kit-certo.vercel.app/",
    thumbnail: "/case-kitcerto.png",
    imagemPrincipal: "/case-kitcerto.png",
    contexto:
      "A KitCerto precisava de uma estrutura de loja para organizar produtos em kits e apresentar melhor a proposta da marca.",
    problema:
      "A oferta de produtos ficava confusa em canais dispersos, dificultando entender o que estava incluído em cada kit.",
    solucao:
      "Desenvolvemos uma vitrine de produtos organizada por kits, com descrição clara, fotos em destaque e navegação pensada para uso no celular.",
    destaques: [
      "Catálogo organizado por kits e categorias",
      "Experiência otimizada para mobile",
      "Layout preparado para receber funções de carrinho e checkout",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    resultado:
      "Loja em formato MVP, com estrutura pronta para evoluir em funções de venda e integrações logísticas.",
  },
  {
    slug: "destaque-multimarcas",
    nome: "Destaque Multimarcas",
    categoria: "sites-institucionais",
    resumo:
      "Site de vendas para concessionária multimarcas: estoque filtrável, galeria por veículo, simulador de financiamento e CTA direto para WhatsApp do consultor.",
    tags: ["Conversão", "WhatsApp", "Estoque", "Financiamento", "Mobile-first"],
    status: "publicado",
    link: "https://concessionariadestaque.vercel.app/",
    github: "https://github.com/ViniciusVivet/concessionariadestaque",
    thumbnail: "/case-destaque-multimarcas.png",
    imagemPrincipal: "/case-destaque-multimarcas.png",
    contexto:
      "A Destaque Multimarcas precisava de presença digital que transmitisse credibilidade e levasse o visitante do estoque ao contato com o consultor em poucos cliques.",
    problema:
      "Leads se perdiam entre anúncios dispersos; faltava um hub único com busca, ficha do veículo e caminho claro para negociação via WhatsApp.",
    solucao:
      "Entregamos uma página única performática em HTML, CSS e JavaScript vanilla: hero com carrossel, filtros de estoque em tempo real, modal com galeria e simulador de parcelas, e mensagens pré-preenchidas para o WhatsApp.",
    destaques: [
      "Zero dependências de build — carrega rápido e hospeda em qualquer CDN",
      "Filtros por marca, modelo, ano, câmbio e faixa de preço",
      "Modal com galeria auto-avanço e simulador de financiamento",
      "Consultor identificado e botão flutuante de WhatsApp em toda a jornada",
    ],
    stack: ["HTML5", "CSS3", "JavaScript (vanilla)"],
    resultado:
      "Vendedor digital 24/7 com experiência responsiva (incluindo bottom sheet no mobile) pronta para campanhas e tráfego pago.",
  },
  {
    slug: "sensimilla-records",
    nome: "Sensimilla Records",
    categoria: "sites-institucionais",
    resumo:
      "Site da gravadora independente: experiência longa com scroll suave, equipe, tour, lançamentos, merch, YouTube e editorial — identidade forte da ZL.",
    tags: ["Gravadora", "Entretenimento", "Scroll", "Animação", "Branding"],
    status: "publicado",
    link: "https://sensimilla-records-web.vercel.app/",
    github: "https://github.com/ViniciusVivet/Sensimilla-Records",
    thumbnail: "/case-sensimilla-records.png",
    imagemPrincipal: "/case-sensimilla-records.png",
    contexto:
      "A Sensimilla Records precisava de um hub oficial que reunisse selo, artistas, lançamentos e presença em plataformas sem parecer um template genérico.",
    problema:
      "A narrativa da casa estava espalhada em redes; faltava um site que traduzisse a estética do movimento e organizasse links, datas e catálogo.",
    solucao:
      "Construímos um site em Next.js com conteúdo centralizado em dados (site.ts / dossiê), scroll suave com Lenis, animações GSAP + ScrollTrigger e seções dedicadas à equipe, tour, Out Now, merch e visuais.",
    destaques: [
      "Respeito a preferência de movimento reduzido (scroll nativo, animações desligadas)",
      "SEO base: sitemap, robots e Open Graph",
      "Formulário de contato preparado para integração externa",
      "Estrutura pensada para trocar mídia e copy sem reescrever layout",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Lenis"],
    resultado:
      "Presença digital alinhada ao posicionamento do selo, pronta para imprensa, booking e novos lançamentos.",
  },
  {
    slug: "orbitamos-portal-tech",
    nome: "Orbitamos Portal Tech",
    categoria: "sistemas-dashboards",
    resumo:
      "Plataforma proprietária da Orbitamos com autenticação, área do estudante, comunidade, mentorias e produtos digitais.",
    tags: ["Plataforma web", "Auth", "Dashboard", "Comunidade"],
    status: "em-evolucao",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80&auto=format&fit=crop",
    imagemPrincipal:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1400&q=80&auto=format&fit=crop",
    contexto:
      "A Orbitamos precisava transformar o movimento em produto digital próprio, centralizando jornadas de estudo, mentorias e comunidade.",
    problema:
      "Ferramentas separadas dificultavam acompanhar progresso dos estudantes, organizar conteúdo e criar novas experiências digitais.",
    solucao:
      "Construímos uma plataforma web autoral com login, área do estudante, trilhas de conteúdo, comunidade, mensagens e espaço para novos módulos.",
    destaques: [
      "Autenticação e gestão de usuários",
      "Área do estudante com aulas, progresso e missões",
      "Módulos para mentorias, comunidade e área do colaborador",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase/PostgreSQL"],
    resultado:
      "Base sólida de produto para evoluir como plataforma educacional e hub de projetos da Orbitamos.",
  },
];

export function getProjetoBySlug(slug: string): Projeto | undefined {
  return projetos.find((p) => p.slug === slug);
}

export function getProjetosByCategoria(categoria: string): Projeto[] {
  if (!categoria || categoria === "todos") return projetos;
  return projetos.filter((p) => p.categoria === categoria);
}
