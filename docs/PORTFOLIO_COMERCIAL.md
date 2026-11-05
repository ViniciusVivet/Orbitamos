# Home e portfólio comercial — 05/11/2026

## Critério de design

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

## Faixa da home

Os quatro diferenciais continuam em uma faixa estreita, com movimento contínuo
à esquerda, em CSS, de 38 segundos por ciclo. Hover e foco na área de leitura
pausam a faixa; um botão permite pausar/retomar. Com `prefers-reduced-motion`,
o conteúdo é uma grade estática. As cópias visuais não se repetem para leitores
de tela. Não há requisição de rede nem atualização por frame em JavaScript.

O objetivo do movimento é criar ritmo secundário entre seções. Cases e chamadas
de contato permanecem disponíveis para leitura e comparação no próprio ritmo.

## Novos cases e capturas reais

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

## Onde atualizar

1. Dados e links: `apps/web/src/data/projetos.ts`.
2. Capa e imagem principal: assets otimizados em `apps/web/public/`.
3. Seleção do catálogo: `apps/web/src/lib/projectCatalog.ts`.
4. Seleção da home: `featuredProjects` em `apps/web/src/app/page.tsx`.
5. Cor e perfil de cena: `CASE_THEMES` em `ImmersiveCaseStudy.tsx`.
6. Conferir a página própria, catálogo, metadados e links; preservar os slugs.

## Referências e verificação

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
