# Início — processo e engenharia (14/09/2026)

## Estado de partida

Rodada anterior enviada à main em 0c35886. Esta é uma iteração separada. Preservar CLAUDE.md local.

Bug identificado no fallback do radar: o pai tem min-height, mas o filho relative usa h-full sem altura definida. Os descendentes absolute top-1/2 ficam ancorados perto do topo e são recortados pelo overflow-hidden. A alternativa WebGL também depende da capacidade do dispositivo; não deve existir uma versão visualmente quebrada para hardware modesto.

As quatro imagens antigas de processo contêm títulos, descrições e iconografia dentro do bitmap. Reduzidas a miniaturas, perdem legibilidade e repetem a linguagem de holograma. Substituir a apresentação, preservando arquivos antigos sem apagar materiais do usuário.

## Plano de ação

1. Revisar inventário de mídias por área; preservar produtos e pessoas reais.
2. Criar sequência editorial navegável para diagnóstico, arquitetura, construção e lançamento.
3. Usar três fotografias do acervo e uma nova cena ilustrativa de revisão mobile.
4. Substituir o radar por arquitetura em camadas feita em HTML/CSS, com controles por teclado e descrições acessíveis.
5. Inspecionar desktop alto, notebook baixo e mobile; testar movimento reduzido e pontos intermediários.
6. Validar lint, testes, build e documentar evidências. Não declarar 10/10 por presença de animações.

## Quadros-chave antes da implementação

| Quadro | Composição / mensagem | Comportamento |
| --- | --- | --- |
| 1 — Chegada | Título amplo, texto de orientação e navegação em quatro etapas | Leitura imediata, sem conteúdo escondido à espera de animação |
| 2 — Diagnóstico | Equipe em conversa ocupa a maior parte do palco; problema e entrega em HTML | Luz quente estabelece processo humano |
| 3 — Arquitetura | Plano mais fechado de papel e wireframes; hierarquia e fluxo | Foto e texto mudam juntos por escolha explícita, sem autoplay |
| 4 — Construção | Trabalho no computador, revisão e implementação | Mantém dimensões do palco, evitando salto vertical |
| 5 — Lançamento | Revisão no celular com notebook ORBITAMOS | Resolução visual tangível; CTA para discutir um projeto |
| 6 — Por dentro | Ambiente azul-petróleo, grade técnica e produto em camadas com profundidade | Câmera e fundo respondem suavemente à entrada da seção; controles explicam cada camada |
| 7 — Exploração e saída | Interface, acesso, dados e conexões podem receber foco; retorno ao CTA existente | Sem prender rolagem; cena mantém leitura estática com reduced-motion |

Esta intervenção é uma composição editorial interativa com profundidade, não uma nova travessia cinematográfica de dez viewports. O Método Órbita informa continuidade, mídia, legibilidade e fallback; não rotular a seção como equivalente aos cases imersivos sem evidência.

## Auditoria de imagens por área

- Início: preservar vídeo principal, cases reais, imagens de projetos e CTA; substituir processo e radar.
- Serviços: a inspeção do código revelou que o painel comercial era predominantemente textual, não uma visualização nativa do produto. Adicionadas capas editoriais aos seis serviços com o acervo compartilhado, sem substituir demonstrações ou provas reais e sem alterar preços ou condições.
- Projetos e cases: capturas reais são a prova; não gerar versões fictícias dos sites.
- Sobre, mentoria, comunidade, Academy e biblioteca: acervo recém-integrado adequado, sem empilhar outra imagem só para preencher.
- Laboratório: capas temáticas recém-integradas; IDE e jogos devem continuar priorizando interação/arte própria.
- Colaborador: fotos apenas editoriais e estados iniciais; nunca inventar cliente, squad, avatar ou case.
- Conta, perfil, privacidade, mensagens, candidaturas e administração: não acrescentar decoração que reduza área útil ou confunda dados.
- Login e contato: mídias próprias existentes preservadas.
- Limite: revisão de composição, arquivos e rotas; não é auditoria de todos os registros privados nem de todas as contas.

## Implementação e fechamento — 15/09/2026

- HomeProcess substitui as quatro miniaturas com texto gravado por quatro etapas selecionáveis: fotografia, conteúdo HTML, entrada, entrega e CTA. Sem autoplay; navegação por teclado e painéis semânticos.
- HomeEngineering substitui o radar por quatro planos em perspectiva CSS. Controles explicam interface, acesso, dados e conexões. Altura explícita evita o recorte do componente anterior; não exige WebGL nem biblioteca nova.
- A câmera acompanha a rolagem com eventos passivos, sem loop contínuo e sem atualizar estado React a cada movimento. O agendamento inicial por visibilidade apresentou progresso estagnado em sequências reais de navegação; foi substituído e retestado em três posições de scroll.
- Enquadramento próprio para notebook baixo e celulares: a auditoria detectou recorte inferior em 1280 x 600 e lateral em 320 px. Posição e escala foram corrigidas; movimento reduzido conserva a composição estática.
- ServicePhoto e studioPhotography compartilham o acervo nos seis serviços; next/image com sizes, blur e espaço reservado. Legendas identificam cenas ilustrativas geradas com IA. Cases, avatares e registros reais permanecem intactos.

### Evidências

- 165 testes unitários passaram, em 19 arquivos.
- scripts/audit-home-delivery.mjs: 15 resultados aprovados; seis viewports (1440 x 1000, 1280 x 600, 1024 x 768, 768 x 900, 390 x 844, 320 x 740), quatro etapas e quatro camadas, teclado, Axe nos dois blocos, carregamento de imagens, movimento reduzido e sincronização de scroll. Nenhum overflow horizontal ou erro de runtime nesses cenários.
- scripts/audit-site-media.mjs: 202 arquivos de código inventariados; 32 referências literais de mídia local, nenhuma ausente. Doze cenários dos seis serviços em 390 e 1440 px passaram. As imagens otimizadas observadas receberam WebP de aproximadamente 16–33 KB, nas larguras/DPR testados. O inventário não comprova todo URL dinâmico ou remoto.
- Build de produção concluído. Permanecem avisos preexistentes de Browserslist e tracing dinâmico no endpoint de materiais do curso, fora desta alteração.
- ESLint sem erros; seis avisos de img em elementos preexistentes da home e de cases nos serviços.
- Capturas e resultados locais: apps/web/test-results/home-delivery e apps/web/test-results/site-media. Inspeção visual de processo e engenharia no desktop/celular e capa de serviço no celular.
- Rodada anterior publicada em 0c35886. Esta rodada de home/serviços permanece local, sem commit/push. CLAUDE.md do usuário preservado.

## Imagem nova

Ferramenta integrada image_gen__imagegen, conforme skill imagegen; sem CLI.
Origem: C:/Users/dougl/.codex/generated_images/01a0539a-008f-7bb2-abe3-5b2780b6c7a0/exec-194038f7-800c-4230-a43f-b8dd557ae262.png
Destino: apps/web/public/images/orbitamos/lancamento-v1.png
Imagem ilustrativa, não prova documental de equipe/cliente.

Prompt final:

Use case: photorealistic-natural.
Asset type: 3:2 landscape editorial photograph for the LAUNCH AND REVIEW chapter on the Orbitamos digital studio website.
Primary request: a believable close documentary photograph of an adult Brazilian web professional reviewing a website on a smartphone at a compact working desk. One hand naturally holds a portrait smartphone and the other rests beside the laptop trackpad. Face partially visible in side profile, candid concentration, no pose toward camera. Smartphone screen has a simple abstract website layout, no readable software UI, no text or brand claims.
Scene/backdrop: lived-in dark creative workspace, warm wood desk edge, one charcoal notebook with the exact small cyan printed wordmark "ORBITAMOS" (O R B I T A M O S). Laptop blurred in background, understated ink-blue practical light. No other textual signs.
Style/medium: premium photorealistic editorial photography, natural adult skin, believable fingers, tangible fabric and paper, controlled depth of field. Warm daylight and restrained cool shadows, not neon cyberpunk.
Composition/framing: close three-quarter view from shoulder height; smartphone and hands prominent and centrally composed, action inside the central horizontal band so it survives responsive 16:10 crops. Calm organized composition, rich dark tones with luminous warm skin.
Constraints: one photograph, not a collage or graphic; no floating UI, no slogans, no headlines, no watermark, no stock smile, no launch rocket or hologram. This is an illustrative fictional scene, not documentation of real staff or clients.
