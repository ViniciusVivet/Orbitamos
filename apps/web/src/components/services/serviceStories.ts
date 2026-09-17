import type { ServicoSlug } from "@/data/servicos";

export type StoryKind = "presence" | "commerce" | "operations" | "automation" | "special" | "care";
export type ServiceFeature = { label: string; title: string; body: string; nodes: [string, string, string]; takeaway: string };
export type ServiceStory = {
  number: string; kind: StoryKind; title: [string, string]; cta: string; leadProject: string;
  signature: string; shift: [string, string]; exploreTitle: [string, string]; features: [ServiceFeature, ServiceFeature, ServiceFeature];
  boundaries: string[]; priceNote: string; proofIntro: string; closing: string;
  measures: { name: string; meaning: string }[];
};
export const serviceStories: Record<ServicoSlug, ServiceStory> = {
  "presenca-profissional": {
    number: "01", kind: "presence", title: ["Seu negócio merece", "ser levado a sério."],
    cta: "Quero minha presença profissional", leadProject: "sabrina-lashes",
    signature: "Sua marca. Seu endereço. Sua próxima conversa.",
    exploreTitle: ["A primeira impressão.", "O próximo contato."],
    shift: ["Informações espalhadas. Confiança pela metade.", "Um endereço que apresenta, orienta e conecta."],
    features: [
      { label: "Apresentação", title: "Antes do primeiro “oi”, sua marca já falou.", body: "Reunimos quem você é, o que faz e seus diferenciais numa página com a linguagem do seu negócio. O visitante encontra contexto antes de procurar atendimento.", nodes: ["Sua marca", "Seus serviços", "Seus diferenciais"], takeaway: "Uma apresentação que você pode enviar com confiança." },
      { label: "Contato", title: "O interesse encontra um caminho.", body: "WhatsApp com mensagem pronta e formulário dão continuidade à visita. Cada chamada aparece perto da informação que ajuda o cliente a decidir.", nodes: ["Entender", "Escolher", "Conversar"], takeaway: "Menos procura pelo contato. Mais clareza no próximo passo." },
      { label: "Base técnica", title: "Bonito no celular. Preparado para ir ao ar.", body: "A entrega combina layout responsivo, organização técnica básica para buscadores e publicação. Sem prometer posições no Google ou tráfego que ainda não existe.", nodes: ["Responsivo", "SEO básico", "Publicação"], takeaway: "Uma base própria para divulgar e evoluir." },
    ],
    boundaries: ["Domínio, hospedagem e outros serviços recorrentes são apresentados separadamente.", "Novas páginas, funções e integrações são alinhadas antes de ampliar o escopo."],
    priceNote: "Para a estrutura descrita nesta página. Extras são combinados antes do início.",
    proofIntro: "Uma especialista em beleza, uma identidade própria e um caminho claro até o atendimento.",
    closing: "Dê à sua empresa um endereço à altura.",
    measures: [{name:"Visitas → contato",meaning:"Quantas visitas avançam para WhatsApp ou formulário."},{name:"Origem dos contatos",meaning:"Quais indicações, buscas e campanhas trazem oportunidades."},{name:"Qualidade das conversas",meaning:"Se o cliente chega entendendo melhor o seu serviço."}],
  },
  "vender-pela-internet": {
    number: "02", kind: "commerce", title: ["Uma vitrine que desperta.", "Um caminho até o pedido."],
    cta: "Quero estruturar minhas vendas", leadProject: "yume-moda-disruptiva",
    signature: "Da descoberta à escolha. Da escolha à conversa.",
    exploreTitle: ["Uma boa oferta.", "Uma escolha mais fácil."],
    shift: ["Um feed não organiza toda a sua oferta.", "Uma jornada comercial ajuda o cliente a escolher."],
    features: [
      {label:"Vitrine",title:"Seu produto no centro da decisão.",body:"Produtos, serviços e diferenciais ganham uma apresentação organizada. O cliente explora a oferta sem depender de uma sequência de mensagens para entender o básico.",nodes:["Coleção","Detalhes","Escolha"],takeaway:"Uma vitrine própria, pronta para receber suas campanhas."},
      {label:"Argumento",title:"A resposta aparece antes da dúvida virar desistência.",body:"Estruturamos a mensagem, os benefícios e as chamadas para ação. Fotos e informações trabalham juntas para dar contexto à escolha.",nodes:["O que é","Por que escolher","Como pedir"],takeaway:"Uma oferta que faz sentido, não só uma lista de produtos."},
      {label:"Pedido",title:"O próximo passo não pode ser um labirinto.",body:"O caminho até o WhatsApp ou formulário fica claro, especialmente no celular. Checkout, estoque e painel são avaliados conforme a necessidade; não são pressupostos do pacote.",nodes:["Produto","Interesse","WhatsApp"],takeaway:"Contato com contexto para continuar a venda."},
    ],
    boundaries:["Checkout, estoque e painel de gestão dependem do formato e do escopo acordados.","Mídia paga, taxas de ferramentas e operação do atendimento não estão implícitas na entrega."],
    priceNote:"Para a estrutura comercial definida no diagnóstico. Recursos adicionais são alinhados na proposta.",
    proofIntro:"Na YUME, a identidade da marca vira ambiente de compra e as coleções ganham protagonismo.",
    closing:"Sua próxima campanha merece um destino melhor.",
    measures:[{name:"Interesse por oferta",meaning:"Quais produtos ou serviços despertam mais atenção."},{name:"Visitas → pedidos",meaning:"Quantas visitas iniciam uma conversa comercial."},{name:"Pedidos → vendas",meaning:"O que realmente fecha no atendimento, além do clique."}],
  },
  "organizar-a-empresa": {
    number:"03",kind:"operations",title:["A operação inteira.", "No mesmo lugar."],
    cta:"Quero organizar minha operação",leadProject:"orbicore-gestao",
    signature:"Menos informação perdida. Mais clareza para agir.",
    exploreTitle:["O dado no lugar certo.", "A próxima ação também."],
    shift:["Cada resposta está em uma planilha diferente.", "Seu processo principal com dados, etapas e responsáveis."],
    features:[
      {label:"Dados",title:"A informação deixa de depender da memória de alguém.",body:"Estruturamos os cadastros e dados essenciais do processo escolhido. O foco é fazer a equipe encontrar o que precisa para trabalhar.",nodes:["Clientes","Pedidos","Histórico"],takeaway:"Uma fonte organizada para o processo prioritário."},
      {label:"Fluxo",title:"Você sabe o que acontece depois.",body:"Etapas, estados e responsáveis traduzem sua operação para o sistema. A primeira versão resolve um fluxo importante, com espaço para evoluir.",nodes:["Entrada","Em andamento","Concluído"],takeaway:"Menos “com quem está isso?” na rotina."},
      {label:"Visão",title:"O painel mostra onde sua atenção faz diferença.",body:"Um dashboard reúne as informações relevantes do fluxo. Login e permissões são incorporados quando necessários para o uso definido.",nodes:["Pendências","Prioridades","Próxima ação"],takeaway:"Dados apresentados para apoiar decisões reais."},
    ],
    boundaries:["O pacote é uma primeira versão do processo prioritário, não um ERP completo.","Migração de planilhas, múltiplos módulos e regras adicionais passam por avaliação."],
    priceNote:"Primeira versão focada no processo prioritário. Evoluções podem ser planejadas em fases.",
    proofIntro:"O OrbiCore mostra como controles dispersos podem virar uma experiência de gestão unificada.",
    closing:"Vamos tirar seu processo mais importante do improviso.",
    measures:[{name:"Tempo por tarefa",meaning:"Quanto tempo o fluxo exige antes e depois da mudança."},{name:"Pendências por etapa",meaning:"Onde o trabalho se acumula e precisa de atenção."},{name:"Retrabalho",meaning:"Quais erros e tarefas repetidas ainda precisam ser resolvidos."}],
  },
  "automatizar-e-integrar": {
    number:"04",kind:"automation",title:["Pare de copiar.", "Comece a conectar."],
    cta:"Quero avaliar minha automação",leadProject:"orbicore-gestao",
    signature:"Um acontecimento. As ações certas. Menos repetição.",
    exploreTitle:["O trabalho se conecta.", "Sua rotina avança."],
    shift:["O mesmo dado, digitado de novo. Todo dia.", "Ferramentas conectadas em um fluxo definido e testado."],
    features:[
      {label:"Gatilho",title:"Tudo começa com um evento que importa.",body:"Um formulário recebido, uma mudança de status ou uma atualização pode iniciar o processo. Primeiro entendemos o trabalho; depois escolhemos as ferramentas.",nodes:["Formulário","Regra","Entrada validada"],takeaway:"Automação orientada a uma necessidade, não a uma moda."},
      {label:"Conexão",title:"O dado segue. Você não precisa carregar.",body:"Conectamos as ferramentas viáveis para o fluxo prioritário. APIs, permissões, limites de uso e eventuais custos são avaliados antes da implementação.",nodes:["Origem","Integração","Destino"],takeaway:"Menos cópia manual entre ferramentas."},
      {label:"Controle",title:"Automatizar também é saber quando algo falha.",body:"Testamos o fluxo com cenários reais e documentamos como acompanhar a operação. As exceções fazem parte do desenho, não ficam para depois.",nodes:["Execução","Validação","Acompanhamento"],takeaway:"Um processo que você entende e consegue acompanhar."},
    ],
    boundaries:["Integrações dependem das APIs, acessos e limites das ferramentas envolvidas.","Mensalidades de terceiros e uso de IA são avaliados e informados antes da implementação."],
    priceNote:"Para a automação do processo prioritário. Ferramentas, integrações e recorrências são confirmadas na proposta.",
    proofIntro:"No OrbiCore, dados e regras de negócio se encontram em um só painel. Conheça uma referência da nossa execução em sistemas e operação.",
    closing:"Qual tarefa você não deveria repetir amanhã?",
    measures:[{name:"Tempo manual",meaning:"Minutos dedicados à rotina que será automatizada."},{name:"Execuções e exceções",meaning:"O que concluiu e o que ainda exige intervenção."},{name:"Confiabilidade",meaning:"Falhas e retrabalho observados no fluxo real."}],
  },
  "projeto-especial": {
    number:"05",kind:"special",title:["Sua ideia não cabe", "num template."],
    cta:"Quero conversar sobre minha ideia",leadProject:"radar-da-rima",
    signature:"Visão grande. Primeiro passo bem desenhado.",
    exploreTitle:["Da hipótese ao produto.", "Uma etapa de cada vez."],
    shift:["Muitas possibilidades. Nenhuma prioridade clara.", "Um produto possível de construir, testar e evoluir."],
    features:[
      {label:"Descoberta",title:"A melhor primeira versão começa com uma boa pergunta.",body:"Investigamos o problema, quem vai usar, as regras e os riscos. A tecnologia vem depois de entender o que precisa mudar.",nodes:["Problema","Pessoas","Prioridades"],takeaway:"Clareza antes de comprometer a construção."},
      {label:"Produto",title:"Uma ideia ambiciosa. Um recorte executável.",body:"Definimos o primeiro escopo que pode entregar valor. Experiência, arquitetura e desenvolvimento se conectam em marcos visíveis.",nodes:["Experiência","Arquitetura","Primeira versão"],takeaway:"Um caminho que cabe numa execução por etapas."},
      {label:"Evolução",title:"Lançar é abrir o próximo capítulo.",body:"Depois da publicação e validação, o uso real ajuda a ordenar as próximas fases. A solução acompanha o negócio, em vez de nascer com tudo e sem direção.",nodes:["Publicar","Aprender","Evoluir"],takeaway:"Novas decisões apoiadas no produto em uso."},
    ],
    boundaries:["Valor e prazo dependem do escopo, integrações e complexidade.","Infraestrutura, marcos e eventual confidencialidade são definidos na proposta."],
    priceNote:"O orçamento vem depois do diagnóstico, com escopo e etapas definidos.",
    proofIntro:"O Radar da Rima conecta descoberta de eventos, comunidade e operação em uma plataforma mobile-first.",
    closing:"Conte a visão. Vamos desenhar o primeiro passo.",
    measures:[{name:"Adoção",meaning:"Quem começa a usar e consegue concluir a tarefa principal."},{name:"Uso recorrente",meaning:"O que faz as pessoas voltarem ao produto."},{name:"Aprendizado por fase",meaning:"Quais hipóteses foram validadas antes do próximo investimento."}],
  },
  "manutencao-e-evolucao": {
    number:"06",kind:"care",title:["Ir ao ar é o começo.", "Continuar é estratégia."],
    cta:"Quero cuidar do meu projeto",leadProject:"sabrina-lashes",
    signature:"Correções, prioridades e pequenos avanços. Em ciclo.",
    exploreTitle:["Cuidado com o presente.", "Espaço para evoluir."],
    shift:["A demanda aparece. Ninguém sabe quem resolve.", "Uma rotina de cuidado com prioridade e acompanhamento."],
    features:[
      {label:"Priorizar",title:"Uma fila organizada vale mais que pedidos espalhados.",body:"Registramos o estado da solução e organizamos solicitações. O impacto no negócio ajuda a decidir o que vem primeiro.",nodes:["Solicitar","Avaliar","Priorizar"],takeaway:"Expectativas e prioridades visíveis."},
      {label:"Cuidar",title:"O básico bem cuidado sustenta o que já funciona.",body:"Correções e atualizações preventivas acontecem dentro da capacidade mensal combinada. Novas grandes funcionalidades recebem avaliação própria.",nodes:["Correções","Atualizações","Revisão"],takeaway:"Acompanhamento técnico sem prometer suporte ilimitado."},
      {label:"Evoluir",title:"Pequenas melhorias também movem o negócio.",body:"Avançamos nas melhorias priorizadas e relatamos o que foi executado. O próximo ciclo parte do estado real do projeto.",nodes:["Melhorar","Registrar","Próximo ciclo"],takeaway:"Continuidade com um custo mensal conhecido."},
    ],
    boundaries:["A capacidade mensal, canais e condições de atendimento são combinados na proposta; não há promessa de suporte ilimitado ou 24h.","Grandes demandas e infraestrutura são orçadas separadamente. Projetos de terceiros passam por avaliação técnica."],
    priceNote:"Plano mensal dentro da capacidade combinada. Duração e cancelamento são apresentados na proposta.",
    proofIntro:"Do site institucional ao sistema de gestão, construímos produtos que continuam recebendo novas necessidades depois do lançamento. Conheça nossa execução.",
    closing:"Seu projeto já está no ar. Vamos cuidar do próximo passo.",
    measures:[{name:"Prioridades resolvidas",meaning:"O que foi entregue em relação ao ciclo combinado."},{name:"Falhas recorrentes",meaning:"Problemas que precisam de uma solução mais duradoura."},{name:"Evolução entregue",meaning:"Melhorias documentadas, não apenas horas ocupadas."}],
  },
};

export function serviceContactUrl(name: string, price: string) {
  return "https://wa.me/5511949138973?text=" + encodeURIComponent(
    `Olá! Tenho interesse em ${name} da Orbitamos (${price}). Quero entender o escopo e os próximos passos para o meu negócio.`
  );
}
