export const deliverySteps = [
  { id: "diagnostico", name: "Diagnóstico", headline: "Primeiro, a pergunta certa.", description: "Entendemos seu negócio, quem vai usar a solução e qual problema vale resolver primeiro.", input: "Seu momento, objetivo e referências.", output: "Prioridades claras e um escopo para decidir.", photo: "equipe" },
  { id: "arquitetura", name: "Arquitetura", headline: "Cada caminho tem um porquê.", description: "Organizamos páginas, conteúdo e funcionalidades para a experiência fazer sentido antes de virar código.", input: "O escopo e as necessidades do projeto.", output: "Estrutura, fluxos e direção visual definidos.", photo: "criacao" },
  { id: "construcao", name: "Construção", headline: "A ideia ganha forma. E função.", description: "Design e desenvolvimento se encontram. Você acompanha a evolução enquanto a experiência é construída e revisada.", input: "A estrutura e a direção aprovadas.", output: "Uma solução funcional para testar e refinar.", photo: "estudo" },
  { id: "lancamento", name: "Lançamento", headline: "Pronto para a vida real.", description: "Revisamos navegação, formulários e uso no celular. Depois dos ajustes, colocamos o projeto no ar.", input: "O projeto implementado e o conteúdo final.", output: "Publicação e orientação para o próximo passo.", photo: "lancamento" },
] as const;

export const engineeringLayers = [
  { id: "interface", number: "01", title: "Interface", subtitle: "O que seu cliente vê.", description: "Páginas claras, navegação direta e uma experiência pensada para o celular. A tecnologia aparece no cuidado com o uso.", tags: ["Next.js", "TypeScript", "Mobile-first"] },
  { id: "acesso", number: "02", title: "Acesso", subtitle: "Cada pessoa no seu lugar.", description: "Quando o projeto precisa de áreas privadas, login e permissões organizam quem pode ver e fazer cada coisa.", tags: ["Autenticação", "Permissões", "Supabase"] },
  { id: "dados", number: "03", title: "Dados", subtitle: "Informação que faz sentido.", description: "Clientes, pedidos e processos podem compartilhar uma base organizada, em vez de depender de informações espalhadas.", tags: ["PostgreSQL", "Modelagem", "Gestão"] },
  { id: "conexoes", number: "04", title: "Conexões", subtitle: "Menos trabalho repetido.", description: "APIs e automações conectam as ferramentas da operação. Cada integração é escolhida conforme o que o projeto realmente precisa.", tags: ["APIs", "Automações", "Integrações"] },
] as const;

export function adjacentTab(key: string, index: number, count: number) {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowRight" || key === "ArrowDown") return (index + 1) % count;
  if (key === "ArrowLeft" || key === "ArrowUp") return (index - 1 + count) % count;
  return null;
}
