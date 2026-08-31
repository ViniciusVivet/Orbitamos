import type { CategoriaSlug } from "@/types/projeto";

export type ServicoSlug =
  | "presenca-profissional"
  | "vender-pela-internet"
  | "organizar-a-empresa"
  | "automatizar-e-integrar"
  | "projeto-especial"
  | "manutencao-e-evolucao";

export type Servico = {
  slug: ServicoSlug;
  categoria: CategoriaSlug;
  nome: string;
  preco: string;
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
    slug: "presenca-profissional",
    categoria: "sites-institucionais",
    nome: "Presença Profissional",
    preco: "R$ 1.497",
    eyebrow: "Credibilidade para começar certo",
    headline: "Uma presença profissional para sua empresa ser encontrada, entendida e levada a sério.",
    subheadline: "Criamos a estrutura digital essencial para apresentar seu negócio com clareza, confiança e um caminho direto para o contato.",
    metaTitle: "Presença Profissional por R$ 1.497 | Orbitamos",
    metaDescription: "Presença digital profissional para empresas: página responsiva, apresentação clara, WhatsApp, SEO básico e publicação por R$ 1.497.",
    promessa: "A base certa para sair do improviso e apresentar seu negócio com autoridade.",
    dor: "Quando o cliente encontra apenas um perfil incompleto, informações espalhadas ou nenhum endereço digital confiável, a empresa perde credibilidade antes mesmo da conversa começar.",
    idealPara: ["Negócios que ainda não têm site", "Profissionais que dependem de indicação", "Empresas que precisam transmitir confiança", "Marcas que querem organizar sua apresentação"],
    entregaveis: ["Página profissional responsiva", "Apresentação de serviços e diferenciais", "Botões de WhatsApp com mensagem pronta", "Formulário de contato", "SEO técnico básico", "Publicação e configuração inicial"],
    resultados: ["Mais confiança para quem pesquisa sua empresa", "Oferta apresentada com clareza", "Mais contatos qualificados pelo WhatsApp"],
    processo: [
      { titulo: "Diagnóstico", texto: "Entendemos seu negócio, público, serviços e objetivo principal." },
      { titulo: "Estrutura", texto: "Organizamos a mensagem e o caminho que transforma visita em contato." },
      { titulo: "Construção", texto: "Criamos a experiência responsiva com identidade profissional." },
      { titulo: "Publicação", texto: "Revisamos, publicamos e deixamos tudo pronto para divulgação." },
    ],
    faq: [
      { pergunta: "O que está incluído no valor?", resposta: "A estrutura descrita nesta página, desenvolvimento, revisão e publicação. Necessidades extras são alinhadas antes do início." },
      { pergunta: "Preciso ter os textos prontos?", resposta: "Não. Coletamos as informações do negócio e estruturamos uma comunicação clara para sua oferta." },
      { pergunta: "Posso ampliar depois?", resposta: "Sim. A solução é construída para evoluir com novas páginas, integrações e funcionalidades." },
      { pergunta: "Domínio e hospedagem estão incluídos?", resposta: "A configuração inicial está incluída. Custos recorrentes de serviços de terceiros são apresentados separadamente quando necessários." },
    ],
    relatedProjects: ["sabrina-lashes", "sensimilla-records", "destaque-multimarcas"],
    whatsappText: "Olá, quero contratar o Presença Profissional da Orbitamos por R$ 1.497.",
  },
  {
    slug: "vender-pela-internet",
    categoria: "ecommerce",
    nome: "Vender pela Internet",
    preco: "R$ 1.997",
    eyebrow: "Sua oferta pronta para vender",
    headline: "Transforme sua presença digital em um canal organizado de vendas.",
    subheadline: "Apresente produtos ou serviços, conduza o cliente até a decisão e facilite pedidos pelo WhatsApp ou formulário.",
    metaTitle: "Vender pela Internet por R$ 1.997 | Orbitamos",
    metaDescription: "Estrutura digital para apresentar ofertas, captar pedidos e vender pela internet com WhatsApp, catálogo ou landing page por R$ 1.997.",
    promessa: "Uma jornada comercial clara para o cliente entender, desejar e entrar em contato.",
    dor: "Publicar produtos no feed e responder tudo manualmente dificulta a escolha, repete perguntas e faz clientes desistirem antes de pedir.",
    idealPara: ["Lojas e marcas autorais", "Prestadores de serviço", "Negócios que vendem pelo WhatsApp", "Campanhas e lançamentos"],
    entregaveis: ["Estrutura comercial focada em conversão", "Vitrine de produtos ou serviços", "Copy e CTAs estratégicos", "Integração com WhatsApp", "Experiência mobile-first", "SEO e publicação"],
    resultados: ["Oferta mais fácil de entender", "Atendimento com cliente mais decidido", "Um canal próprio para campanhas e indicações"],
    processo: [
      { titulo: "Oferta", texto: "Mapeamos o que você vende, para quem e quais objeções precisam ser resolvidas." },
      { titulo: "Jornada", texto: "Desenhamos a sequência ideal até o pedido ou contato." },
      { titulo: "Construção", texto: "Criamos a vitrine ou página comercial com foco em conversão." },
      { titulo: "Lançamento", texto: "Testamos os caminhos e publicamos a estrutura pronta para vender." },
    ],
    faq: [
      { pergunta: "É uma loja com checkout?", resposta: "O formato é definido no diagnóstico. A versão inicial pode vender pelo WhatsApp; checkout e estoque entram quando fazem sentido." },
      { pergunta: "Consigo cadastrar produtos?", resposta: "Podemos estruturar uma vitrine inicial e, conforme o escopo, incluir painel de gestão." },
      { pergunta: "Serve para serviços?", resposta: "Sim. A jornada também funciona para orçamento, agendamento e contratação de serviços." },
      { pergunta: "Posso anunciar essa página?", resposta: "Sim. Ela é preparada para receber tráfego e conduzir o visitante até uma ação clara." },
    ],
    relatedProjects: ["mb-multimarcas-infantil", "yume-moda-disruptiva", "kitcerto"],
    whatsappText: "Olá, quero contratar o Vender pela Internet da Orbitamos por R$ 1.997.",
  },
  {
    slug: "organizar-a-empresa",
    categoria: "sistemas-dashboards",
    nome: "Organizar a Empresa",
    preco: "R$ 2.497",
    eyebrow: "Processos e dados no lugar certo",
    headline: "Centralize a operação e pare de administrar sua empresa no improviso.",
    subheadline: "Criamos um sistema inicial sob medida para organizar clientes, pedidos, tarefas, dados e etapas importantes do negócio.",
    metaTitle: "Organizar a Empresa por R$ 2.497 | Orbitamos",
    metaDescription: "Sistema inicial sob medida para centralizar clientes, pedidos, tarefas, dados e processos empresariais por R$ 2.497.",
    promessa: "Mais controle da operação, menos planilhas soltas e retrabalho.",
    dor: "Quando cada informação fica em uma conversa, planilha ou caderno diferente, a equipe perde tempo, comete erros e não sabe o que exige ação.",
    idealPara: ["Empresas crescendo sem sistema", "Operações dependentes de planilhas", "Gestão de clientes e pedidos", "Rotinas que precisam de status e responsáveis"],
    entregaveis: ["Mapeamento do processo principal", "Sistema web responsivo", "Cadastros e estados essenciais", "Dashboard operacional", "Banco de dados estruturado", "Login e permissões quando necessários"],
    resultados: ["Informações centralizadas", "Mais visão sobre tarefas e etapas", "Base digital pronta para evoluir"],
    processo: [
      { titulo: "Mapeamento", texto: "Identificamos o processo que mais causa atraso, erro ou retrabalho." },
      { titulo: "Modelo", texto: "Organizamos dados, etapas, regras e responsáveis." },
      { titulo: "Sistema", texto: "Construímos o fluxo essencial para uso real da operação." },
      { titulo: "Adoção", texto: "Testamos com sua rotina e orientamos o uso da primeira versão." },
    ],
    faq: [
      { pergunta: "É um sistema completo?", resposta: "É uma primeira versão focada no processo prioritário. Funcionalidades adicionais podem ser evoluídas em fases." },
      { pergunta: "Pode ter usuários diferentes?", resposta: "Sim. Login e permissões entram quando forem necessários ao fluxo definido." },
      { pergunta: "Importa dados de planilha?", resposta: "A viabilidade depende da qualidade dos dados e é avaliada no diagnóstico." },
      { pergunta: "Funciona no celular?", resposta: "Sim. A interface é responsiva e planejada para a rotina real da empresa." },
    ],
    relatedProjects: ["orbicore-gestao", "orbitamos-portal-tech"],
    whatsappText: "Olá, quero contratar o Organizar a Empresa da Orbitamos por R$ 2.497.",
  },
  {
    slug: "automatizar-e-integrar",
    categoria: "automacoes",
    nome: "Automatizar e Integrar",
    preco: "R$ 2.997",
    eyebrow: "Menos repetição, mais escala",
    headline: "Conecte suas ferramentas e deixe tarefas repetitivas acontecerem sozinhas.",
    subheadline: "Mapeamos o processo, integramos sistemas e automatizamos rotinas para sua empresa responder mais rápido e operar melhor.",
    metaTitle: "Automatizar e Integrar por R$ 2.997 | Orbitamos",
    metaDescription: "Automação de processos e integração entre ferramentas, formulários, planilhas, sistemas e IA por R$ 2.997.",
    promessa: "Uma automação útil, testada e documentada para economizar tempo de verdade.",
    dor: "Copiar dados, enviar avisos, atualizar planilhas e repetir a mesma tarefa todos os dias consome horas e aumenta o risco de erro.",
    idealPara: ["Captação e distribuição de leads", "Integração entre ferramentas", "Notificações e atualizações automáticas", "Rotinas administrativas repetitivas"],
    entregaveis: ["Raio-x do fluxo atual", "Desenho de gatilhos e ações", "Integração entre ferramentas", "Automação do processo prioritário", "Testes com casos reais", "Documentação de operação"],
    resultados: ["Menos tarefas manuais", "Processo mais rápido e previsível", "Dados fluindo entre as ferramentas certas"],
    processo: [
      { titulo: "Raio-x", texto: "Entendemos cada etapa manual, exceção e resultado esperado." },
      { titulo: "Arquitetura", texto: "Definimos ferramentas, gatilhos, dados e regras de segurança." },
      { titulo: "Integração", texto: "Construímos e conectamos o fluxo priorizado." },
      { titulo: "Validação", texto: "Testamos cenários reais e documentamos como acompanhar a automação." },
    ],
    faq: [
      { pergunta: "IA está incluída?", resposta: "Pode estar quando agrega valor ao fluxo. Primeiro resolvemos o processo; depois aplicamos IA onde ela melhora o resultado." },
      { pergunta: "Integra com WhatsApp?", resposta: "Depende das APIs e ferramentas utilizadas. A possibilidade e eventuais custos são avaliados antes da proposta." },
      { pergunta: "Existem mensalidades?", resposta: "Serviços de terceiros podem cobrar mensalidades. Todos os custos recorrentes são informados antes da implementação." },
      { pergunta: "E se o processo mudar?", resposta: "A automação pode evoluir por manutenção ou por uma nova fase de projeto." },
    ],
    relatedProjects: ["orbicore-gestao", "orbitamos-portal-tech"],
    whatsappText: "Olá, quero contratar o Automatizar e Integrar da Orbitamos por R$ 2.997.",
  },
  {
    slug: "projeto-especial",
    categoria: "sistemas-dashboards",
    nome: "Projeto Especial",
    preco: "Sob orçamento",
    eyebrow: "Tecnologia fora da prateleira",
    headline: "Quando a solução não cabe em um pacote, projetamos o caminho certo.",
    subheadline: "Aplicativos, plataformas, portais, MVPs e integrações complexas desenhados sob medida para o desafio do seu negócio.",
    metaTitle: "Projeto Especial de Tecnologia | Orbitamos",
    metaDescription: "Aplicativos, plataformas, portais, MVPs, sistemas e integrações complexas sob medida. Diagnóstico e orçamento personalizado.",
    promessa: "Escopo, arquitetura e execução alinhados à complexidade real do projeto.",
    dor: "Ideias mais ambiciosas fracassam quando começam sem recorte, arquitetura, prioridades e critérios claros de validação.",
    idealPara: ["MVPs e produtos digitais", "Plataformas com múltiplos usuários", "Aplicativos e portais", "Integrações ou regras complexas"],
    entregaveis: ["Diagnóstico aprofundado", "Recorte de escopo e prioridades", "Arquitetura técnica", "Experiência e interface", "Desenvolvimento por etapas", "Deploy, validação e documentação"],
    resultados: ["Ideia transformada em plano executável", "Risco reduzido por entregas incrementais", "Solução alinhada ao negócio"],
    processo: [
      { titulo: "Discovery", texto: "Investigamos problema, usuários, regras, riscos e resultado esperado." },
      { titulo: "Recorte", texto: "Definimos o primeiro escopo que entrega valor e pode ser validado." },
      { titulo: "Construção", texto: "Executamos em marcos visíveis, com revisão e priorização contínuas." },
      { titulo: "Evolução", texto: "Publicamos, medimos o uso e planejamos as próximas fases." },
    ],
    faq: [
      { pergunta: "Quanto custa?", resposta: "O investimento depende de escopo, integrações, prazos e complexidade. O orçamento é apresentado depois do diagnóstico." },
      { pergunta: "Dá para construir em fases?", resposta: "Sim. Essa é a abordagem recomendada para reduzir risco e validar as prioridades." },
      { pergunta: "Vocês assinam confidencialidade?", resposta: "Quando necessário, podemos alinhar um acordo de confidencialidade antes de aprofundar informações sensíveis." },
      { pergunta: "Vocês cuidam da infraestrutura?", resposta: "Podemos configurar deploy, banco, serviços e monitoramento previstos no escopo." },
    ],
    relatedProjects: ["radar-da-rima", "orbicore-gestao", "orbitamos-portal-tech"],
    whatsappText: "Olá, quero conversar sobre um Projeto Especial com a Orbitamos.",
  },
  {
    slug: "manutencao-e-evolucao",
    categoria: "automacoes",
    nome: "Manutenção e Evolução",
    preco: "R$ 497/mês",
    eyebrow: "Seu produto continua funcionando",
    headline: "Manutenção contínua para manter sua solução segura, atualizada e evoluindo.",
    subheadline: "Acompanhamos o que já está no ar, corrigimos problemas e executamos pequenas melhorias com prioridade e previsibilidade.",
    metaTitle: "Manutenção e Evolução por R$ 497/mês | Orbitamos",
    metaDescription: "Plano mensal de manutenção, correções, atualizações e pequenas evoluções para sites e sistemas por R$ 497/mês.",
    promessa: "Continuidade técnica sem depender de chamados improvisados.",
    dor: "Sem acompanhamento, pequenas falhas se acumulam, integrações param, conteúdo envelhece e melhorias importantes nunca entram na agenda.",
    idealPara: ["Clientes com sites ou sistemas publicados", "Negócios que precisam de suporte recorrente", "Projetos que recebem pequenas melhorias", "Operações que valorizam previsibilidade"],
    entregaveis: ["Canal organizado de solicitações", "Correções dentro do escopo mensal", "Atualizações preventivas", "Pequenas melhorias priorizadas", "Acompanhamento técnico", "Relato simples do que foi executado"],
    resultados: ["Menos tempo com problemas técnicos", "Solução atualizada e acompanhada", "Evolução contínua com custo previsível"],
    processo: [
      { titulo: "Entrada", texto: "Avaliamos a solução e registramos o estado atual." },
      { titulo: "Prioridade", texto: "Organizamos correções e melhorias pelo impacto no negócio." },
      { titulo: "Execução", texto: "Atuamos dentro da capacidade mensal combinada." },
      { titulo: "Acompanhamento", texto: "Informamos o que foi realizado e alinhamos o próximo ciclo." },
    ],
    faq: [
      { pergunta: "O plano inclui qualquer alteração?", resposta: "O plano cobre manutenção e pequenas evoluções dentro da capacidade mensal. Demandas maiores recebem orçamento separado." },
      { pergunta: "Atendem projetos feitos por terceiros?", resposta: "Podemos atender após uma avaliação técnica do código, acessos e infraestrutura existentes." },
      { pergunta: "Há fidelidade?", resposta: "As condições de duração e cancelamento são apresentadas de forma clara na proposta comercial." },
      { pergunta: "Hospedagem está incluída?", resposta: "Custos de infraestrutura e ferramentas de terceiros não estão incluídos, salvo quando indicados na proposta." },
    ],
    relatedProjects: ["sabrina-lashes", "mb-multimarcas-infantil", "orbicore-gestao"],
    whatsappText: "Olá, quero contratar o plano Manutenção e Evolução da Orbitamos por R$ 497/mês.",
  },
];

export function getServicoBySlug(slug: string): Servico | undefined {
  return servicos.find((servico) => servico.slug === slug);
}

export function getServicoHref(slug: ServicoSlug): string {
  return `/servicos/${slug}`;
}
