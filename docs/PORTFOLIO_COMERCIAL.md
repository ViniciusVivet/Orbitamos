# Home e portfólio comercial

## Direção atual — 07/11/2026

A prioridade comercial é definida pelo trabalho que o visitante precisa
conhecer primeiro. A data de entrada no catálogo não determina o destaque.
Os 11 projetos continuam acessíveis, com os mesmos slugs e páginas de case.

### Curadoria informada pelo usuário

- **Sabrina Lashes / SA Lashes:** o usuário confirmou que esse era o projeto
  citado como “Celeste” na conversa. Informou uso real no atendimento e relação
  recorrente; por isso ele abre o catálogo. Não foram conferidos faturamento,
  quantidade de clientes, leads ou ROI.
- **Radar da Rima:** prioridade pelo potencial de produto e de escala da
  comunidade, conforme avaliação do usuário. Potencial não é crescimento,
  adoção ou retorno financeiro já comprovado.
- **YUME:** compõe a seleção principal pela apresentação da marca e do produto.
- **MB Multimarcas Infantil:** vem depois da seleção principal como referência
  de catálogo. Segundo o usuário, ainda não está vendendo.
- **Destaque Multimarcas:** fica ao final; o usuário informou que o parceiro
  ainda não usa o site. Publicação de uma página não equivale a uso operacional.

Esses relatos orientam a curadoria e não devem virar estatísticas ou alegações
de desempenho na copy pública. Os demais projetos demonstram entregáveis; sua
posição não implica vendas, tráfego ou adoção verificados.

### Seleção e apresentação

- **Topo da home:** Sabrina Lashes, YUME e Radar da Rima, nessa ordem. O terceiro
  card substitui Destaque Multimarcas; `heroCases` em `page.tsx` alimenta as
  apresentações desktop e mobile. Essa área é distinta da galeria abaixo.
- **Galeria da home:** exatamente YUME, Sabrina Lashes e Radar da Rima. A
  composição tem imagens e texto direto, sem molduras externas ou chips de
  benefícios com bordas.
- **Catálogo:** Sabrina abre como case principal, com imagem e narrativa
  lateral. Radar e YUME aparecem a seguir em apresentações amplas. Os outros
  oito usam linhas com miniatura e resumo: duas colunas no desktop e uma no
  tablet/celular, reduzindo a repetição de grandes cartões.
- **Ordem completa:** Sabrina, Radar, YUME, MB, Sensimilla, Orbitamos Portal
  Tech, OrbiCore, Palladinos, FAST, KitCerto e Destaque Multimarcas.
- **Controles:** filtros em abas sem caixas contornadas, foco de teclado
  visível, busca combinada e seletor nativo no celular. Os controles mobile
  mantêm fonte de 16px. O resultado vazio continua oferecendo recuperação.
- **Ação por case:** um único link abre sua narrativa. O acesso ao site
  publicado continua disponível dentro do case. As imagens ajudam a comparar
  as entregas sem criar uma segunda ação concorrente em cada item da lista.
- **Encerramento:** depois dos cases e depoimentos, a página segue para o
  contato. A grade adicional de serviços foi retirada desse percurso; os
  serviços continuam na home. O convite final trata de escopo, prazo e
  investimento, sem prometer uma semana para qualquer tipo de projeto.

Sabrina demonstra atendimento em uso segundo o responsável; Radar, um produto
de comunidade; YUME, uma marca autoral. Sensimilla acrescenta direção visual e
os produtos próprios mostram amplitude de implementação. A capa de login do
OrbiCore não é uma demonstração suficiente para receber o maior destaque.
Palladinos e FAST seguem como referências secundárias de presença comercial.

### Cenários por categoria — 07/11/2026

A seleção de categoria passa a dirigir o ambiente do topo e do catálogo.
Órbita, foco, identidade, arquitetura, vitrine e fluxo têm materiais e
composições próprios, com vídeos de fundo locais e posters de segurança.
O cenário permanece atrás da lista; a prova comercial continua nas capturas
reais dos projetos. A [direção dos seis cenários](CENARIOS_CATEGORIAS.md)
registra os prompts e a procedência das mídias.

O seletor fica acessível sob a navegação principal; há pausa manual, movimento
reduzido, economia de dados e versões com enquadramento mobile. A escolha
persiste no URL e funciona com Voltar/Avançar. Busca e categoria combinam-se
sem reiniciar o cenário. Não há rolagem presa, modal novo ou WebGL concorrendo
com o vídeo do ambiente.

Cada categoria oferece uma ação ligada ao serviço correspondente. Automações
continua com zero cases públicos e explica essa ausência, com acesso ao
serviço. Não há métricas inventadas, promessa de ROI nem conclusão de que a
animação aumenta conversão. A ordem comercial e os 11 slugs são preservados.

### Uma ordem compartilhada

**Refino de 08/11/2026:** a apresentação das categorias foi compactada para
expor os cases na primeira dobra. Título e contexto/CTA dividem o desktop;
busca e contagem ficam numa única faixa de catálogo. No celular, o topo é
empilhado com menos etapas visuais. Os vídeos, a ordem comercial, as imagens
reais e os destinos dos serviços permanecem. O estado de Automações sem case
público foi condensado numa faixa com acesso aos outros projetos. Metas e
verificação estão em [CENARIOS_CATEGORIAS.md](CENARIOS_CATEGORIAS.md).

[`projectCatalog.ts`](../apps/web/src/lib/projectCatalog.ts) centraliza a
curadoria: `orderProjectsForPortfolio` ordena o catálogo sem modificar os dados
de entrada; projetos novos sem avaliação entram ao final, na ordem recebida.
`getHomeFeaturedProjects` mantém a seleção própria da galeria da home. Busca e filtros
preservam a ordem comercial; o modal legado e o próximo case usam a mesma
sequência. Uma seleção ausente não é substituída automaticamente por outro
projeto.

Os dados e slugs continuam em
[`projetos.ts`](../apps/web/src/data/projetos.ts). A home apresenta a seleção em
[`HomeProjectSelection.tsx`](../apps/web/src/components/home/HomeProjectSelection.tsx).
O layout compartilhado fica em
[`ProjectCard.tsx`](../apps/web/src/components/projetos/ProjectCard.tsx) e
[`ProjectCatalog.module.css`](../apps/web/src/components/projetos/ProjectCatalog.module.css).
Qualquer mudança futura de prioridade deve atualizar essa curadoria e conferir
home, catálogo, busca, filtros, modal e próxima página, preservando os URLs.

### Validação local — 07/11/2026

- Auditoria integrada aprovada em 1440×1000, notebook 1280×600, WebKit com
  perfil de iPhone 13 em 390×844 e 320×740 com movimento reduzido.
- Três cases da home, os 11 projetos na ordem comercial, todas as imagens,
  filtros/busca combinados, recuperação do resultado vazio e as três páginas
  principais com próximo case correto aprovados.
- Sem overflow horizontal ou exceções de página. Zero violações Axe na faixa,
  seleção da home e catálogo auditados; não é certificação do site inteiro.
- Conferência adicional em tablet 820×1180: layout, alinhamento das chamadas
  da home, ausência da grade duplicada de serviços e navegação do modal legado
  de Sabrina para Radar pelo teclado aprovados.
- 26 testes focais em dois arquivos aprovados, incluindo preservação da ordem
  com entrada invertida, busca/filtro, projetos sem curadoria, seleção da home,
  ausência de mutação e integridade dos conteúdos.
- ESLint focal sem erros, com quatro avisos de imagens preexistentes na home.
  `next typegen`, TypeScript e build de produção aprovados; 73 páginas
  geradas, mantendo os 11 slugs dos cases.
- Correção focal após o print do usuário: troca do terceiro card do topo
  confirmada em 1366×768, WebKit/iPhone 390×844 e 320×740. Ambas as versões
  do hero usam imagem e link do Radar, sem card de carros ou overflow. A
  auditoria integrada agora verifica o hero além da galeria.

Capturas e relatório ficam em `apps/web/test-results/commercial-portfolio/`;
logs locais em `docs/local/2026-11-07-portfolio-*.log`. As capturas da composição
anterior ficam em `apps/web/test-results/portfolio-curation-20261107/`.
O WebKit usa um perfil simulado, sem teste nesta rodada em iPhone físico.
Esta direção não promete aumento de conversão ou ROI.

## Histórico — 05/11/2026

Os registros abaixo descrevem a implementação e as verificações daquela data.
A seleção de seis cases e a abertura com FAST/Palladinos foram substituídas
pela direção de 07/11 acima.

### Critério de design

A home funciona como uma seleção do trabalho da Orbitamos. O catálogo completo
permite comparar referências por tipo e objetivo. Aumentar o catálogo não aumenta
automaticamente a quantidade de cases da home.

- Home: seis cases na ordem acordada — YUME, Sensimilla, MB Multimarcas Infantil,
  Sabrina Lashes, KitCerto e Radar da Rima.
- `/projetos`: 11 projetos. FAST e Palladinos abrem a seleção em duas imagens
  maiores; os outros nove aparecem uma vez em uma galeria mais compacta.
- Busca combina nome, resumo, tipo, tags e stack, sem exigir acentos. O filtro
  combina com a busca e suas contagens acompanham o texto pesquisado.
- No celular, o tipo usa seletor nativo. O resultado vazio oferece recuperação
  direta para todos os projetos. Categorias sem cases mostram contagem zero.
- O card prioriza explorar o case e visitar o site. Código público, quando há,
  fica nos detalhes do case. Não há repositório privado exposto na vitrine.

Essa é uma escolha editorial, não uma promessa de aumento de vendas. A hipótese
é facilitar a comparação e manter a decisão principal clara. Novos destaques
devem mostrar o produto ou a identidade de forma útil: uma tela de login isolada
é uma demonstração fraca para ocupar a maior imagem da galeria.

Ao crescer, manter os destaques limitados e atualizar sua seleção conforme os
objetivos comerciais. Busca e categorias continuam funcionando a partir dos
dados. Paginação pode ser acrescentada quando o volume justificar; 11 projetos
não exigem rolagem infinita ou um carrossel obrigatório para acessar todos.

### Faixa da home

Os quatro diferenciais continuam em uma faixa estreita, com movimento contínuo
à esquerda, em CSS, de 38 segundos por ciclo. Hover e foco na área de leitura
pausam a faixa; um botão permite pausar/retomar. Com `prefers-reduced-motion`,
o conteúdo é uma grade estática. As cópias visuais não se repetem para leitores
de tela. Não há requisição de rede nem atualização por frame em JavaScript.

O objetivo do movimento é criar ritmo secundário entre seções. Cases e chamadas
de contato permanecem disponíveis para leitura e comparação no próprio ritmo.

### Novos cases e capturas reais

| Projeto | Publicação conferida | Capa entregue |
| --- | --- | --- |
| FAST Comunicação e Design | [Site publicado](https://fast-site-five.vercel.app/) | `public/case-fast-comunicacao-design.webp`, 1440×900, 45.256 bytes |
| Palladinos Assessoria | [Site publicado](https://palladinosassessoria.vercel.app/) | `public/case-palladinos-assessoria.webp`, 1440×900, 96.634 bytes |

As imagens são screenshots do conteúdo inicial dos sites publicados, com HTTP
200, sem interface do navegador, capturados em Chromium. Não foram geradas por
IA. Originais PNG e registro de origem ficam em `docs/local/`, fora do Git.

O conteúdo dos cases descreve entregáveis conferidos: serviços e briefing em
três etapas na FAST; planos, resultados, blog e contato na Palladinos. Não foram
inventados números de faturamento, leads, satisfação, preço pago ou retorno
comercial. A contagem pública deriva de `projetos.length`, com o rótulo
“projetos no portfólio”; ela não representa onze clientes pagantes.

### Onde atualizar

1. Dados e links: `apps/web/src/data/projetos.ts`.
2. Capa e imagem principal: assets otimizados em `apps/web/public/`.
3. Seleção do catálogo: `apps/web/src/lib/projectCatalog.ts`.
4. Seleção da home: `featuredProjects` em `apps/web/src/app/page.tsx`.
5. Cor e perfil de cena: `CASE_THEMES` em `ImmersiveCaseStudy.tsx`.
6. Conferir a página própria, catálogo, metadados e links; preservar os slugs.

### Referências e verificação

- [W3C — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): controle de movimento automático.
- [NN/G — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/): hierarquia de informação e detalhes secundários sob demanda.
- [NN/G — Auto-Forwarding Carousels](https://www.nngroup.com/articles/auto-forwarding/): dificuldades introduzidas por conteúdo que troca sozinho. A recomendação aplicada aqui é manter os cases estáticos.

Auditoria reproduzível em `apps/web`: `node scripts/audit-commercial-portfolio.mjs`.
Usa o servidor local 3015 por padrão. Capturas e relatório ficam em
`apps/web/test-results/commercial-portfolio/`, ignorados pelo Git. Não envia
mensagens ou formulários aos clientes.

Verificação local em 05/11/2026:

- Quatro perfis aprovados: 1440×1000, 1280×600, WebKit/iPhone 13 em 390×844 e
  320×740 com movimento reduzido. Sem overflow horizontal ou exceções de página;
  zero violações Axe nos dois blocos verificados.
- Faixa em movimento, pausa manual, hover/foco e alternativa estática conferidos.
  Os campos mobile usam 16px para evitar ampliação automática ao receber foco.
- Onze imagens carregadas, projetos únicos, filtros, busca sem acentos,
  recuperação do resultado vazio e links dos novos cases aprovados.
- Conferência adicional da primeira pintura sem JavaScript, troca de case por
  URL no modal legado, navegação de categorias por URL e transição pelo scroll
  no WebKit. A frase de travessia começa oculta e é revelada pela timeline.
- Suíte completa: 57 arquivos e 522 testes aprovados, com um worker.
- ESLint sem erros (31 avisos no ambiente local, incluindo arquivos gerados
  ignorados pelo Git); nove contratos aprovados. `next typegen` e TypeScript
  aprovados. Build de produção aprovado, com 73 páginas geradas e os dois
  novos cases na relação de rotas estáticas.

Capturas incluem os estados reais de abertura com animações habilitadas. A
verificação WebKit simula o iPhone; não foi realizada em aparelho físico.
Testes de interface e acessibilidade dos novos blocos não medem conversão
comercial nem equivalem a uma certificação de acessibilidade do site inteiro.
