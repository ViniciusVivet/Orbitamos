# Cenários das categorias de projetos

Direção de produto e arte registrada em **07/11/2026**.

## Objetivo

A escolha de categoria em `/projetos` deve mudar o ambiente da página: matéria,
composição, profundidade, luz e movimento. Cada cenário ajuda a reconhecer o
tipo de solução e a entender um próximo passo comercial. A troca precisa ser
perceptível sem impedir a leitura dos projetos ou criar uma espera artificial.

O cenário é direção de arte. As capturas e narrativas dos 11 projetos continuam
sendo a demonstração do trabalho. Os fundos não devem simular métricas de
clientes, interfaces de produtos existentes ou resultados financeiros.

A curadoria, os slugs e as prioridades permanecem em
[`projectCatalog.ts`](../apps/web/src/lib/projectCatalog.ts). A direção de
curadoria está em [PORTFOLIO_COMERCIAL.md](PORTFOLIO_COMERCIAL.md); os critérios
de experiência estão em [DIRECAO_IMERSIVA.md](DIRECAO_IMERSIVA.md) e no
[METODO_ORBITA_IMERSIVA.md](METODO_ORBITA_IMERSIVA.md).

## Seis ambientes

| Categoria / ID | Matéria e composição | Movimento e luz | Paleta principal / secundária |
| --- | --- | --- | --- |
| Todos — `todos` | Órbita principal: arco incompleto e planos de vidro fumê | Respiração espacial lenta, planos em profundidade | `#54d9eb` / `#9278d8` |
| Landing Pages — `landing-pages` | Foco: lâminas de grafite convergindo para uma abertura | Convergência controlada e abertura de luz ciano | `#8eeefa` / `#b9d7e4` |
| Sites Institucionais — `sites-institucionais` | Identidade: monólito curvo de pedra acetinada e vidro | Revelação de superfície, luz lateral contínua | `#d9c8ee` / `#7eb4d6` |
| Plataformas e sistemas — `sistemas-dashboards` | Arquitetura: módulos e camadas de vidro interligados | Deslocamento entre planos com leitura de conexões | `#7fb9f0` / `#8c78d7` |
| E-commerce — `ecommerce` | Vitrine: pedestais baixos, embalagem translúcida e tecido | Passagem suave de luz sobre materiais e volumes | `#aad6b1` / `#d8bd8e` |
| Automações — `automacoes` | Fluxo: caminhos de fibra, três ramificações e nós de metal | Progressão de energia pelos caminhos e pontos de encontro | `#bca3ed` / `#d7a77c` |

Essas diferenças precisam continuar reconhecíveis sem os títulos. Trocar só a
cor de uma mesma composição não atende à direção. Não inserir texto, UI, logos
de terceiros ou painéis de dados nas mídias de fundo. A marca Orbitamos aparece
na interface existente; a cena acrescenta identidade por forma e movimento.

No desktop, o foco compositivo fica a 60–65% da largura, preservando área de
leitura. A versão mobile deve ter enquadramento próprio, centrado no motivo e
capaz de receber as camadas de contraste sem perder sua forma principal.

## Sete quadros da troca

1. **Estado estável:** categoria, resultado e próximo passo estão legíveis; o
   ambiente estabelece a matéria e a profundidade daquela escolha.
2. **Escolha imediata:** o filtro reconhece a ação sem atraso. O estado ativo
   fica claro, e o conteúdo correspondente continua acessível.
3. **Saída — cerca de 180 ms:** a cena anterior recua. A leitura não desaparece
   atrás de uma tela de carregamento e os controles continuam operáveis.
4. **Passagem — cerca de 350 ms:** câmera, luz e camadas orientam a mudança de
   ambiente, formando uma continuidade visual entre os estados.
5. **Chegada — cerca de 650 ms:** o novo motivo se estabelece; título, contexto
   comercial e ação se relacionam com a categoria escolhida.
6. **Permanência lenta:** o ambiente mantém um movimento contido enquanto o
   visitante compara os projetos. Deve existir controle para interrompê-lo.
7. **Nova escolha:** a última seleção prevalece, inclusive durante uma
   transição. Não enfileirar animações ou manter cenas antigas reproduzindo.

Os tempos são referência de direção, não atraso obrigatório para atualizar os
resultados. Com movimento reduzido, a mudança de categoria continua clara sem
depender de câmera, parallax ou reprodução automática.

## Mensagem e próximo passo

[`projectEnvironments.ts`](../apps/web/src/lib/projectEnvironments.ts) associa
os seis IDs a título, descrição, ação, cor e caminhos de mídia. Cada estado
oferece um objetivo curto e um CTA; não acrescentar outra sequência de cartões,
chips e explicações antes dos cases.

| Categoria | Título | Próximo passo canônico |
| --- | --- | --- |
| Todos | Da presença digital ao produto. | Conversar sobre meu projeto → `/contato` |
| Landing Pages | Uma página. Um próximo passo. | Planejar minha página → `/servicos/vender-pela-internet` |
| Sites Institucionais | Seu negócio, bem apresentado. | Quero um site profissional → `/servicos/presenca-profissional` |
| Plataformas e sistemas | Da operação ao produto digital. | Planejar minha plataforma → `/servicos/projeto-especial` |
| E-commerce | Sua coleção, no seu canal. | Criar minha vitrine → `/servicos/vender-pela-internet` |
| Automações | Conecte o que hoje é manual. | Planejar uma automação → `/servicos/automatizar-e-integrar` |

O escopo, preço e condições ficam na página do serviço, conforme
[`servicos.ts`](../apps/web/src/data/servicos.ts). A categoria ampla de
plataformas inclui produtos com usuários e regras próprias; por isso sua ação
leva ao Projeto Especial, sem pressupor o escopo de um sistema de gestão
interna. E-commerce não promete checkout quando o case demonstra um catálogo.

### Automações sem case público

O catálogo atual tem zero projetos nessa categoria; isso não torna o serviço
indisponível. O estado deve explicar **“Ainda não há um case público de
automação nesta seleção.”** e manter o próximo passo para o serviço. Uma ação
secundária pode restaurar os outros projetos.

Não preencher a categoria com um case fictício, apresentar outro sistema como
automação entregue ou usar um resultado vazio genérico como única saída. Uma
busca sem correspondências também não deve alterar a oferta do serviço.

## Contrato de mídia

Para cada ID da configuração:

- Poster desktop: `/images/project-worlds/{id}-v1.webp`.
- Poster mobile: `/images/project-worlds/{id}-mobile-v1.webp`.
- Loop desktop: `/videos/project-worlds/{id}-v1.mp4`.
- Loop mobile: `/videos/project-worlds/{id}-mobile-v1.mp4`.

Os caminhos públicos correspondem a arquivos em `apps/web/public/`. A presença
do caminho na configuração não comprova que a mídia foi gerada. Após seleção,
registrar procedência, prompt final, duração, dimensões e peso dos arquivos.
Masters e experimentos locais não precisam integrar o bundle publicado.

### Reprodução e fallback

- Manter **um vídeo ativo por vez**. Pausar a cena anterior antes de ativar a
  próxima; o cruzamento visual pode usar posters ou um quadro estático.
- O poster deve orientar a primeira pintura, as falhas de vídeo e os estados
  estáticos. Ausência de autoplay não pode produzir um fundo vazio.
- Um controle de pausa deve continuar funcionando sem reter foco ou hover.
  Trocar de categoria não deve revogar uma pausa escolhida pelo visitante.
- Respeitar `prefers-reduced-motion` com composição estática coerente; as
  instruções e o acesso aos projetos permanecem disponíveis.
- Em economia de dados ou conexão 2G, priorizar poster. Pausar a reprodução quando a
  página estiver oculta ou a área estiver fora de uso.
- Carregar a mídia da categoria e do enquadramento necessários, evitando
  reproduzir seis loops escondidos ou baixar todas as versões simultaneamente.
- Usar camadas de contraste para proteger texto e controles. O fundo não
  recebe foco nem intercepta clique, toque ou rolagem.

Essa estratégia mantém a mídia como arquivo estático no projeto, sem exigir
uma API de geração durante a navegação ou sincronizações no Supabase. Ela não
dispensa medir transferência, carregamento e fluidez em aparelhos modestos.

## Referências e critério comercial

- [NN/G — The Role of Animation and Motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/): movimento pode orientar a mudança de estado e a navegação; excesso de animação disputa atenção com a tarefa.
- [W3C — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): controle de movimento automático e de conteúdo que se atualiza em paralelo à leitura.
- [NN/G — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/): priorizar o essencial e manter detalhes secundários nas páginas correspondentes.

A proposta associa contexto, prova real e próximo passo. Não atribui à PNL uma
eficácia comercial demonstrada, nem afirma que vídeo converte mais que foto.
Ganho de conversão requer observação e medição posteriores; uma cena bonita ou
uma suíte de testes aprovada não fornecem esse resultado.

## Mídia gerada — 07/11/2026

Foram gerados e baixados **seis vídeos originais de 8 segundos, 1280×720,
24 fps**, no Google Flow, com o modelo exibido **Omni 1.2 Flash**, uma saída
por prompt. Não se trata de uma geração com Veo 3. Os arquivos originais,
incluindo as faixas de áudio entregues pelo gerador, são preservados em
`docs/local/project-worlds-20261107/originals/`, fora do Git. Os derivados
publicados removem o áudio e têm compressão e enquadramento próprios.

São cenas de direção de arte para o fundo; não representam trabalhos de
clientes ou screenshots dos produtos. A biblioteca de geração fica neste
[projeto do Flow](https://flow.google.com/project/9d071779-ddcb-4e4f-9d10-f5ae4323e382).

| Categoria | Identificador da geração | Nome do original |
| --- | --- | --- |
| Todos | `b2a875ae-9ec6-4951-a20f-506e1a9a077d` | `Titanium_ring_website_background…_93f53c61.mp4` |
| Landing Pages | `393f5154-324c-4b07-a292-779da7b399c0` | `Graphite_ribbons_converge_toward…_d775e09e.mp4` |
| Institucionais | `88d04b59-1eb6-4b42-a665-a49239787af9` | `CGI_satin_monolith_website_loop_7df0cd0d.mp4` |
| Plataformas | `51759a9a-ee19-4fdc-a757-b6861cd00862` | `Ambient_loop_architectural_model…_ada209b3.mp4` |
| E-commerce | `e009cabd-bd50-4839-ab9f-f1ff5ed5ff83` | `CGI_product_still_life_loop_7dc52423.mp4` |
| Automações | `75d5668e-33b3-43ec-a8f9-b0d5cf4eca7b` | `Glass_fibre_tubes_pulse_light_85ce4c25.mp4` |

### Derivados publicados

Os loops têm **7 segundos / 24 fps**, H.264 Main 3.1, `yuv420p`, sem áudio e
com `faststart`. O último segundo mistura o final da fonte com seu primeiro
segundo; o loop começa no segundo 1 da fonte. Isso aproxima o último quadro
do primeiro, sem inverter o fluxo de luz. Posters WebP usam esse mesmo quadro
inicial. Os originais não foram alterados.

Desktop: vídeo 960×540 e poster 1280×720. Mobile: vídeo 480×960 e poster
540×1080, com recorte focal por composição. A escolha de retrato ocorre até
767 px de viewport; RAM baixa em desktop não escolhe uma mídia com proporção
errada. Os seis temas foram inspecionados no começo, meio e final do loop,
inclusive no recorte efetivo de iPhone. O total dos 24 arquivos é
**2.411.005 bytes (~2,30 MiB)**. Esse total não é baixado a cada visita: a
interface solicita o cenário ativo e o enquadramento necessário.

| Categoria | Loop desktop (KiB) | Loop mobile (KiB) | Poster desktop / mobile (KiB) |
| --- | ---: | ---: | ---: |
| Todos | 120,4 | 151,5 | 12,2 / 10,2 |
| Landing Pages | 218,7 | 205,5 | 19,0 / 18,1 |
| Institucionais | 163,5 | 159,0 | 11,5 / 10,2 |
| Plataformas | 178,2 | 153,1 | 22,7 / 16,9 |
| E-commerce | 139,7 | 138,1 | 14,9 / 13,0 |
| Automações | 251,4 | 288,4 | 19,4 / 18,9 |

Pipeline e metadados completos, com hashes e comandos, ficam em
`docs/local/project-worlds-20261107/optimize-project-worlds.py` e
`optimized-assets.json`. A auditoria pública reproduzível é
`node scripts/audit-project-world-contracts.mjs --require-media`, executada em
`apps/web`: verifica os seis temas, destinos comerciais, curadoria, formatos,
ausência de áudio, `faststart`, arquivos distintos e orçamento de peso.

### Prompts finais

**Todos**, prompt completo:

```text
Create an 8-second silent cinematic background loop for the Orbitamos digital studio website. Category: ALL PROJECTS, an orbital atrium. Premium physically rendered CGI, a monumental incomplete brushed-titanium orbital ring emerging from a dark ink-navy architectural horizon, two restrained smoked-glass planes suspended at different depths, cyan edge light and a small violet reflection. The main recognizable sculpture occupies the RIGHT half of the wide 16:9 frame; keep the LEFT 45 percent calm dark navy negative space for website copy. Tangible satin metal, smoked optical glass, believable soft reflections, refined light falloff, powerful sculptural silhouette, elegant game environment art direction without a spaceship or HUD. Camera makes a very slow smooth lateral drift with a tiny sense of depth, a restrained light travels around the ring. Keep composition and geometry consistent throughout, no jump cuts, no fast movement, suitable for a seamless website ambient loop. No people, no UI, no dashboards, no readable text, no logos, no charts, no particles clutter, no strobing, no narration, no music, no sound.
```

Para as outras cinco gerações, o texto comum abaixo foi concatenado, com um
espaço, ao complemento correspondente. A composição resultante é o prompt
final efetivamente enviado.

```text
Create an 8-second silent seamless ambient loop for the Orbitamos digital studio website. Premium physically rendered CGI with tangible satin materials, ink-navy environment, architectural depth and soft believable reflections. Wide 16:9 composition. Keep LEFT 45 percent calm dark navy negative space for readable website copy, concentrate the recognizable sculpture on the RIGHT half. Very slow smooth camera drift, refined moving light, consistent geometry, no cuts, no fast movements. No people, no text, no logos, no UI, no charts, no holographic dashboards, no particle clutter, no sound.
```

**Landing Pages**:

```text
Category LANDING PAGES, the FOCUS chamber: several large thin graphite ribbons and brushed silver blades converge in perspective toward one precise white-cyan aperture, like a sculptural lens. A clear directional silhouette, controlled cool cyan edge light and icy silver reflections, physical depth rather than a glowing funnel. The aperture stays on the right. Slow graceful light sweeps along the blades toward the aperture. Sophisticated dark architectural game environment, minimalist but dramatic.
```

**Institucionais**:

```text
Category INSTITUTIONAL WEBSITES, the IDENTITY gallery: one monumental curved satin dark-stone monolith with a tall refined smoked-glass fin standing beside it, tactile charcoal stone, finely bevelled glass edges, sculptural confident silhouette. Gentle pearl-white grazing light reveals the curved surface with a hint of lavender and steel blue. A quiet premium brand architecture installation with material credibility, no screens. Slow lateral camera drift and continuous soft reveal of the stone. Sculpture entirely on right half, dark open atmosphere on left.
```

**Plataformas**:

```text
Category PLATFORMS AND SYSTEMS, the ARCHITECTURE chamber: a precise complex of interlocking smoked optical-glass modules and blue-tinted translucent slabs at several heights, separated by clean negative gaps and joined by thin cyan-indigo channels. Strong stepped modular city-like silhouette on the right, premium physical architectural scale model, no labels and no actual buildings. Very slow smooth parallax between layers with a restrained cyan light traversing a few channels. Deep indigo, steel blue and cyan, refined reflections, intelligent engineered order.
```

**E-commerce**:

```text
Category E-COMMERCE, the SHOWCASE gallery: a beautifully art-directed still-life on low matte dark-stone display plinths, one sculptural translucent mineral-green packaging form, a folded deep-green fabric ribbon and a small champagne-metal arc. Not a storefront screenshot, no words on the packaging. Luxurious tactile product photography rendered as CGI, material contrast of textile, glass and stone. Soft mineral green edge light with a subtle warm champagne reflection. Slow camera dolly and soft light gliding across the materials. The grouped still-life occupies right half only.
```

**Automações**:

```text
Category AUTOMATIONS, the FLOW network: three elegant branching paths made of clear optical-glass fibre tubes run across a dark reflective architectural floor and meet at three small satin-metal nodes in the right half. A sculptural physical network, no diagram labels, no interface. Restrained violet light pulses travel sequentially along the fibres and meet with a subtle warm copper glow at a node. Beautiful smooth curves with clear space around them, precise engineered materials, strong recognizable branching silhouette. Very slow drifting camera, subtle continuous light flow, no flashing.
```

## Estado da implementação e validação

**Implementado e verificado localmente em 07/11/2026.** A categoria muda o
topo e o ambiente atrás do catálogo. Há somente uma instância dos filtros,
fixa sob a navegação, e um vídeo por vez. O hero anterior com vídeo genérico e
Three.js foi retirado desta rota. Depoimentos e contato final ficam fora do
escopo de reprodução do cenário.

Verificações efetivamente executadas:

- Trinta estados de categoria em cinco perfis: 1440×1000, 1280×600, WebKit
  com iPhone 13 em 390×844, tablet 820×1180 e 320×740 com movimento reduzido.
  As capturas foram inspecionadas com as animações normais habilitadas;
  fontes, posters e opacidade dos ancestrais foram conferidos.
- Sem overflow horizontal ou exceções de página nesses percursos. Zero
  violações Axe no escopo do novo ambiente, incluindo os controles e cases;
  não representa certificação do site inteiro.
- Busca, recuperação do resultado vazio, categoria de automação sem case,
  última escolha prevalecendo em trocas rápidas, URL e Voltar/Avançar
  aprovados. Os 11 projetos continuam únicos e na ordem comercial.
- Pausa/retomada e preservação da pausa ao trocar categoria aprovadas. O
  navegador real também confirmou a suspensão e remoção do vídeo ao sair do
  escopo de projetos. Vídeos não são solicitados com movimento reduzido ou
  economia de dados; erro de vídeo mantém o poster carregado.
- Link legado `?case=sabrina-lashes`, avanço para Radar e fechamento
  removendo o parâmetro aprovados, sem erro de servidor/hidratação. Esse
  teste encontrou e corrigiu o portal tentando acessar `document.body` no
  servidor: o modal agora é carregado apenas no navegador e sob demanda.
- Auditoria estrita dos 24 arquivos aprovada, assim como 26 testes de
  curadoria/integridade, ESLint focal e TypeScript.
- Build de produção aprovado, com 73 páginas. Emitiu aviso de tracing
  dinâmico na rota de materiais de cursos, inalterada nesta rodada, e aviso
  de dados antigos do Browserslist; ambos não impediram o build.

Auditoria de interface: `node scripts/audit-project-worlds.mjs`, dentro de
`apps/web`, com o servidor 3015 disponível. Use `PROJECT_WORLDS_AUDIT_URL`
para outro ambiente. `PROJECT_WORLDS_PROFILES` permite repetir apenas os
perfis necessários (IDs: `desktop`, `notebook`, `iphone`, `tablet`,
`compact-reduced`); os modos de fallback e o link legado continuam sendo
verificados. Relatório e capturas ficam em
`apps/web/test-results/project-worlds/`, ignorados pelo Git.

O teste WebKit é simulação de iPhone, não uma medição em aparelho físico.
Tamanho dos arquivos e reprodução real foram conferidos; não houve medição
de FPS ou bateria em aparelho modesto. A conferência remota de deploy ocorre
após o push, pelos status do GitHub/Vercel e pela página pública; as evidências
acima descrevem o escopo local.

## Primeira dobra mais curta — 08/11/2026

O usuário aprovou as cenas e o minimalismo, mas pediu acesso mais cedo aos
projetos. A altura de abertura deixava a prova comercial depois do primeiro
scroll, sobretudo em notebooks. O cenário continua ocupando o fundo da área
de exploração; a apresentação deixa de consumir uma tela antes dos cases.

No desktop, título e contexto/CTA dividem uma faixa em duas colunas. No
celular, continuam empilhados, com título de 32 px, descrição legível e ação
de pelo menos 44 px. Categoria, título, descrição e destino comercial são os
mesmos. A contagem foi concentrada junto do catálogo, e a busca ocupa a mesma
faixa no desktop. Os rótulos de busca e do seletor nativo continuam associados
aos campos para leitores de tela; os campos mobile mantêm 16 px.

Automações continua sem case público. Um aviso curto e a recuperação dos
outros projetos aparecem logo após a apresentação; o CTA do serviço permanece
no topo. Não foram inseridos cases fictícios para preencher essa categoria.

A auditoria de interface agora mede a primeira dobra com scroll zero em cada
categoria: título e CTA desobstruídos, primeira imagem carregada com área útil
visível e nome do primeiro case dentro da viewport. Miniaturas compactas
precisam aparecer inteiras; imagens maiores precisam expor pelo menos 100 px
no desktop ou 80 px no celular. Em Automações, a explicação e a ação de
recuperação devem caber na abertura. O perfil 1366×600 reproduz a área útil
aproximada do print enviado pelo usuário.

Verificação de 08/11 concluída:

- 36 estados de categoria em seis tamanhos: 1440×1000, 1280×600, 1366×600,
  820×1180, WebKit/iPhone em 390×844 e 320×740 com movimento reduzido.
  iPhone e 320 px foram repetidos no build de produção local para conferir
  ordenação do CSS e o encaixe com os controles flutuantes reais, sem a
  sobreposição das ferramentas do servidor de desenvolvimento.
- No desktop e nos notebooks, a primeira imagem inicia entre 383 e 411 px;
  no iPhone simulado, entre 481 e 503 px; em 320 px, entre 481 e 528 px.
  As cinco categorias com cases exibem imagem e nome do primeiro projeto sem
  rolar. A faixa de Automações e sua recuperação também cabem na abertura.
- Busca, URL, Voltar/Avançar, pausa entre categorias, posters de fallback e
  os links legados continuam aprovados. Os 11 projetos e a curadoria foram
  preservados. Sem overflow ou erros de página; zero violações Axe no escopo
  auditado. Não é uma certificação de acessibilidade de todo o site.
- ESLint focal, TypeScript e build de 73 páginas aprovados. Os mesmos avisos
  não bloqueantes de Browserslist e tracing dos materiais de curso permanecem
  fora do escopo desta mudança.

O relatório local desta rodada foi preservado em
`docs/local/project-fold-20261108/audit-report.json`. As mídias não foram
regeneradas nem substituídas; esta intervenção altera a composição do topo e
dos controles, sem adicionar serviços ou requisições ao Supabase.
