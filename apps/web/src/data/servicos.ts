import type { CategoriaSlug } from "@/types/projeto";

export type ServicoSlug =
  | "landing-page"
  | "site-institucional"
  | "catalogo-digital"
  | "sistema-web"
  | "automacoes"
  | "dashboard";

export type Servico = {
  slug: ServicoSlug;
  categoria: CategoriaSlug;
  nome: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  metaTitle: string;
  metaDescription: string;
  promessa: string;
  dor: string;
  idealPara: string[];
  entregaveis: string[];
  resultados: string[];
  processo: { titulo: string; texto: string }[];
  faq: { pergunta: string; resposta: string }[];
  relatedProjects: string[];
  whatsappText: string;
};

export const servicos: Servico[] = [
  {
    slug: "landing-page",
    categoria: "landing-pages",
    nome: "Landing Page",
    eyebrow: "Campanhas, leads e WhatsApp",
    headline: "Landing page para transformar visita em orçamento no WhatsApp.",
    subheadline:
      "Uma página direta, rápida e focada em conversão para apresentar sua oferta, quebrar objeções e levar o cliente para o próximo passo.",
    metaTitle: "Landing Page para Vender pelo WhatsApp | Orbitamos",
    metaDescription:
      "Criamos landing pages para campanhas, captação de leads e vendas pelo WhatsApp com copy, design, CTA, formulário e publicação rápida.",
    promessa: "Ideal para quem precisa colocar uma oferta no ar rápido e medir interesse real.",
    dor: "Você posta, impulsiona ou indica seu serviço, mas perde gente porque não tem uma página clara explicando o que vende, para quem é e como comprar.",
    idealPara: [
      "Prestadores de serviço local",
      "Campanhas de tráfego pago",
      "Lançamento de produto, agenda ou evento",
      "Profissionais que vendem pelo Instagram e WhatsApp",
    ],
    entregaveis: [
      "Copy comercial com foco em ação",
      "Hero forte com proposta clara",
      "Seções de benefício, prova e objeções",
      "Botões de WhatsApp com mensagem pronta",
      "Formulário de contato e SEO básico",
      "Publicação em domínio próprio ou Vercel",
    ],
    resultados: [
      "Mais clareza para explicar sua oferta",
      "Menos conversa perdida no direct",
      "Página pronta para campanha e indicação",
    ],
    processo: [
      { titulo: "Diagnóstico", texto: "Entendo oferta, público, prazo e o que precisa acontecer para virar lead." },
      { titulo: "Estrutura", texto: "Monto a sequência de seções: promessa, prova, benefícios, objeções e CTA." },
      { titulo: "Construção", texto: "Desenvolvo a página responsiva, rápida e pronta para WhatsApp." },
      { titulo: "Lançamento", texto: "Público, reviso detalhes e deixo pronta para receber tráfego." },
    ],
    faq: [
      { pergunta: "Quanto tempo leva?", resposta: "Uma landing page objetiva pode ir ao ar em até 7 dias quando conteúdo e direção estão claros." },
      { pergunta: "Preciso ter textos prontos?", resposta: "Não. Você me passa o serviço, público, diferenciais e referências; eu estruturo a copy comercial." },
      { pergunta: "Serve para tráfego pago?", resposta: "Sim. A página já nasce com CTA, clareza de oferta e caminho direto para WhatsApp ou formulário." },
      { pergunta: "Tem SEO?", resposta: "Tem SEO técnico básico, título, descrição, estrutura semântica e conteúdo alinhado à busca da oferta." },
    ],
    relatedProjects: ["sabrina-lashes", "destaque-multimarcas", "mb-multimarcas-infantil"],
    whatsappText: "Olá, quero uma landing page para vender pelo WhatsApp.",
  },
  {
    slug: "site-institucional",
    categoria: "sites-institucionais",
    nome: "Site Institucional",
    eyebrow: "Confiança, presença e autoridade",
    headline: "Site profissional para sua empresa parecer tão séria quanto ela é.",
    subheadline:
      "Um site completo para apresentar serviços, história, diferenciais, prova social e canais de contato em uma experiência sólida.",
    metaTitle: "Site Institucional Profissional | Orbitamos",
    metaDescription:
      "Criamos sites institucionais profissionais para empresas e prestadores de serviço com design, SEO básico, páginas de serviço e contato.",
    promessa: "Ideal para negócios que dependem de confiança antes do cliente chamar.",
    dor: "Quando o cliente só encontra Instagram, link quebrado ou informação espalhada, ele hesita. Um site bem construído reduz essa dúvida.",
    idealPara: [
      "Empresas locais e prestadores de serviço",
      "Marcas que querem passar mais confiança",
      "Negócios que recebem indicação e precisam validar autoridade",
      "Profissionais que querem sair do improviso digital",
    ],
    entregaveis: [
      "Home institucional com proposta clara",
      "Seções de serviços e diferenciais",
      "Página de contato com WhatsApp",
      "SEO básico por página",
      "Layout responsivo e rápido",
      "Estrutura pronta para crescer",
    ],
    resultados: [
      "Marca com presença mais profissional",
      "Mais confiança para clientes indicados",
      "Base pronta para campanhas e conteúdo",
    ],
    processo: [
      { titulo: "Mapeamento", texto: "Organizo serviços, público, diferenciais e tom da marca." },
      { titulo: "Arquitetura", texto: "Defino a estrutura do site para facilitar entendimento e contato." },
      { titulo: "Design e código", texto: "Construo uma experiência responsiva, bonita e objetiva." },
      { titulo: "Publicação", texto: "Coloco no ar e deixo o projeto preparado para manutenção." },
    ],
    faq: [
      { pergunta: "É melhor que só Instagram?", resposta: "Sim. Instagram ajuda na atenção; site ajuda na confiança, organização e busca no Google." },
      { pergunta: "Vocês fazem domínio?", resposta: "Posso orientar compra/configuração de domínio e publicação, mantendo tudo simples para você." },
      { pergunta: "Posso adicionar mais páginas depois?", resposta: "Sim. A estrutura é feita para crescer com novas páginas, serviços e cases." },
      { pergunta: "Tem formulário e WhatsApp?", resposta: "Sim. O caminho de contato fica claro em desktop e mobile." },
    ],
    relatedProjects: ["sabrina-lashes", "sensimilla-records", "destaque-multimarcas"],
    whatsappText: "Olá, quero um site institucional profissional para meu negócio.",
  },
  {
    slug: "catalogo-digital",
    categoria: "ecommerce",
    nome: "Catálogo Digital",
    eyebrow: "Produtos organizados sem checkout complexo",
    headline: "Catálogo digital para vender melhor sem depender só do Instagram.",
    subheadline:
      "Uma vitrine online com produtos, categorias, filtros e chamada direta para WhatsApp, ideal para lojas que ainda vendem no atendimento.",
    metaTitle: "Catálogo Digital com WhatsApp | Orbitamos",
    metaDescription:
      "Criamos catálogos digitais e vitrines de produtos com filtros, detalhes, categorias e atendimento direto pelo WhatsApp.",
    promessa: "Ideal para loja que quer organizar produtos e gerar pedidos pelo atendimento.",
    dor: "Quando produto fica perdido em feed, story ou mensagem, o cliente cansa antes de perguntar preço, tamanho ou disponibilidade.",
    idealPara: [
      "Lojas de roupa, moda infantil e acessórios",
      "Marcas autorais e coleções pequenas",
      "Negócios que vendem por WhatsApp",
      "Empresas que querem vitrine antes de checkout",
    ],
    entregaveis: [
      "Vitrine com produtos e categorias",
      "Filtros por tipo, coleção ou faixa",
      "Página ou modal de detalhe",
      "Botão de WhatsApp com produto preenchido",
      "Layout mobile-first",
      "Estrutura preparada para evoluir para loja",
    ],
    resultados: [
      "Produtos mais fáceis de encontrar",
      "Atendimento com cliente mais decidido",
      "Base para tráfego, campanhas e estoque digital",
    ],
    processo: [
      { titulo: "Organização", texto: "Classifico produtos, categorias, fotos e informações essenciais." },
      { titulo: "Vitrine", texto: "Crio uma navegação simples para o cliente encontrar o que quer." },
      { titulo: "Conversão", texto: "Conecto cada item ao WhatsApp com mensagem pronta." },
      { titulo: "Evolução", texto: "Deixo a base pronta para carrinho, checkout ou painel no futuro." },
    ],
    faq: [
      { pergunta: "Preciso ter muitos produtos?", resposta: "Não. Catálogo funciona bem para poucos produtos se a apresentação for clara e comercial." },
      { pergunta: "Tem checkout?", resposta: "Pode ter no futuro, mas a versão mais rápida usa WhatsApp para vender sem complexidade." },
      { pergunta: "Consigo atualizar produtos?", resposta: "Depende do escopo. Pode ser por manutenção simples ou com painel sob medida." },
      { pergunta: "Serve para loja pequena?", resposta: "Sim. É uma das melhores entradas para loja pequena parecer mais organizada." },
    ],
    relatedProjects: ["mb-multimarcas-infantil", "yume-moda-disruptiva", "kitcerto"],
    whatsappText: "Olá, quero um catálogo digital para vender pelo WhatsApp.",
  },
  {
    slug: "sistema-web",
    categoria: "sistemas-dashboards",
    nome: "Sistema Web / MVP",
    eyebrow: "Login, dados e operação",
    headline: "Sistema web para tirar processo da planilha e colocar para funcionar.",
    subheadline:
      "MVPs, portais e sistemas sob medida para organizar usuários, cadastros, dados, fluxos e painéis internos.",
    metaTitle: "Sistema Web e MVP Sob Medida | Orbitamos",
    metaDescription:
      "Desenvolvemos sistemas web, MVPs, portais com login, dashboards, banco de dados e fluxos sob medida para negócios digitais.",
    promessa: "Ideal quando site não basta e você precisa de operação, dados e acesso restrito.",
    dor: "Planilhas, WhatsApp e anotações resolvem no começo, mas viram gargalo quando a operação cresce ou depende de controle.",
    idealPara: [
      "MVPs para validar produto",
      "Portais com login e áreas restritas",
      "Gestão de clientes, alunos, pedidos ou projetos",
      "Negócios que precisam centralizar dados",
    ],
    entregaveis: [
      "Arquitetura do fluxo principal",
      "Login e perfis de usuário",
      "Banco de dados estruturado",
      "Dashboards e telas de gestão",
      "APIs e integrações quando necessário",
      "Deploy e documentação de uso",
    ],
    resultados: [
      "Menos operação manual",
      "Mais controle sobre dados e etapas",
      "Produto validável sem excesso de escopo",
    ],
    processo: [
      { titulo: "Recorte do MVP", texto: "Defino o mínimo que precisa existir para gerar valor real." },
      { titulo: "Modelo de dados", texto: "Organizo entidades, permissões e fluxos principais." },
      { titulo: "Construção", texto: "Desenvolvo telas, regras, banco e integrações prioritárias." },
      { titulo: "Validação", texto: "Entrego uma versão usável para testar com gente real." },
    ],
    faq: [
      { pergunta: "Dá para começar pequeno?", resposta: "Sim. O melhor MVP começa com um fluxo essencial e evolui por prioridade." },
      { pergunta: "Inclui banco de dados?", resposta: "Sim. Normalmente uso PostgreSQL/Supabase ou outra solução adequada ao projeto." },
      { pergunta: "É mais caro que site?", resposta: "Sim, porque envolve regra, dados e manutenção. Mas dá para fatiar por fases." },
      { pergunta: "Vocês fazem painel admin?", resposta: "Sim. Painéis internos entram no escopo quando ajudam a operar melhor." },
    ],
    relatedProjects: ["orbitamos-portal-tech"],
    whatsappText: "Olá, quero tirar uma ideia do papel com um sistema web ou MVP.",
  },
  {
    slug: "automacoes",
    categoria: "automacoes",
    nome: "Automações e IA",
    eyebrow: "Menos tarefa repetida",
    headline: "Automações para reduzir trabalho manual e acelerar atendimento.",
    subheadline:
      "Fluxos com IA, formulários, integrações e rotinas para conectar ferramentas e ganhar tempo no dia a dia.",
    metaTitle: "Automações com IA para Negócios | Orbitamos",
    metaDescription:
      "Criamos automações, integrações e fluxos com IA para reduzir tarefas manuais, organizar dados e acelerar atendimento.",
    promessa: "Ideal quando sua equipe repete tarefas que poderiam rodar sozinhas.",
    dor: "Responder, copiar dados, preencher planilha, avisar cliente e organizar lead manualmente consome tempo e gera erro.",
    idealPara: [
      "Captação e organização de leads",
      "Atendimento inicial com mensagens prontas",
      "Integração entre formulário, planilha e CRM",
      "Rotinas internas repetitivas",
    ],
    entregaveis: [
      "Mapeamento do fluxo manual",
      "Automação entre ferramentas",
      "Uso de IA quando fizer sentido",
      "Registro de dados e notificações",
      "Testes com casos reais",
      "Documentação simples do fluxo",
    ],
    resultados: [
      "Menos retrabalho",
      "Resposta mais rápida para leads",
      "Processo mais previsível e rastreável",
    ],
    processo: [
      { titulo: "Raio-x", texto: "Entendo a rotina repetida e onde ela quebra." },
      { titulo: "Desenho", texto: "Defino gatilhos, dados, ferramentas e resultado esperado." },
      { titulo: "Implementação", texto: "Crio o fluxo e conecto as etapas necessárias." },
      { titulo: "Teste", texto: "Valido com situações reais antes de considerar pronto." },
    ],
    faq: [
      { pergunta: "IA sempre é necessária?", resposta: "Não. Primeiro resolvemos o processo; IA entra quando melhora velocidade, texto ou decisão." },
      { pergunta: "Dá para integrar com WhatsApp?", resposta: "Depende da ferramenta e do nível de automação. Para muitos casos, mensagens prontas já resolvem bem." },
      { pergunta: "Funciona para negócio pequeno?", resposta: "Sim, desde que a automação economize tempo real ou ajude a vender mais." },
      { pergunta: "Vocês conectam planilhas?", resposta: "Sim. Planilhas, formulários e bancos simples podem entrar como parte do fluxo." },
    ],
    relatedProjects: ["orbitamos-portal-tech"],
    whatsappText: "Olá, quero automatizar um processo do meu negócio.",
  },
  {
    slug: "dashboard",
    categoria: "sistemas-dashboards",
    nome: "Dashboard e Painel",
    eyebrow: "Dados claros para decidir",
    headline: "Dashboard para enxergar operação, vendas e indicadores sem bagunça.",
    subheadline:
      "Painéis internos para acompanhar clientes, contatos, produtos, projetos, métricas e rotinas em uma tela organizada.",
    metaTitle: "Dashboard e Painel Administrativo | Orbitamos",
    metaDescription:
      "Criamos dashboards e painéis administrativos para organizar dados, acompanhar indicadores e melhorar decisões do negócio.",
    promessa: "Ideal para quem precisa parar de decidir no escuro.",
    dor: "Quando cada informação está em um lugar, fica difícil entender o que está atrasado, vendendo, parado ou precisando de ação.",
    idealPara: [
      "Controle de contatos e leads",
      "Painéis de vendas e operação",
      "Gestão de produtos ou projetos",
      "Áreas administrativas simples",
    ],
    entregaveis: [
      "Levantamento de indicadores",
      "Telas de listagem e detalhe",
      "Filtros e estados importantes",
      "Banco de dados ou integração",
      "Login quando necessário",
      "Interface responsiva para uso real",
    ],
    resultados: [
      "Mais clareza sobre a operação",
      "Menos dependência de planilhas soltas",
      "Decisões com dados visíveis",
    ],
    processo: [
      { titulo: "Indicadores", texto: "Defino quais números e listas realmente importam." },
      { titulo: "Fluxo", texto: "Organizo como os dados entram, mudam de status e são consultados." },
      { titulo: "Interface", texto: "Crio uma tela objetiva para uso repetido, não só para apresentação." },
      { titulo: "Entrega", texto: "Público, testo e ajusto com base na rotina real." },
    ],
    faq: [
      { pergunta: "Dashboard precisa ser complexo?", resposta: "Não. O melhor painel começa com poucos indicadores que mudam decisões." },
      { pergunta: "Pode ter login?", resposta: "Sim. Se os dados forem internos, o painel pode ter autenticação e permissões." },
      { pergunta: "Dá para puxar dados de formulário?", resposta: "Sim. Formulários, banco de dados e integrações podem alimentar o painel." },
      { pergunta: "Serve para pequeno negócio?", resposta: "Serve quando já existe volume suficiente para acompanhar e organizar." },
    ],
    relatedProjects: ["orbitamos-portal-tech"],
    whatsappText: "Olá, quero criar um dashboard ou painel para meu negócio.",
  },
];

export function getServicoBySlug(slug: string): Servico | undefined {
  return servicos.find((servico) => servico.slug === slug);
}

export function getServicoHref(slug: ServicoSlug): string {
  return `/servicos/${slug}`;
}
