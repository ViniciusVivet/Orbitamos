# Método Órbita — Design Imersivo

O Método Órbita transforma páginas em cenas contínuas dirigidas pelo scroll. Ele é o processo reutilizável da Orbitamos para criar experiências que não parecem apenas sites com animações.

Este arquivo é um documento vivo. Cada execução deve registrar o que foi testado, o que funcionou e o que precisa ser evitado nos projetos seguintes.

## Princípio central

O mockup não é o destino; ele é um **portal**. A experiência começa com uma interface reconhecível, atravessa sua moldura e coloca o visitante dentro do universo do produto. Durante a travessia, a tela inteira responde: câmera, mídia, ambiente, luz, cor, profundidade, tipografia e narrativa.

## As sete cenas-base

1. **Apresentação:** nome, contexto mínimo e produto enquadrado. Estado calmo para orientar.
2. **Aproximação:** câmera e ambiente convergem para a interface; o restante perde protagonismo.
3. **Travessia:** moldura e chrome se desfazem; a interface cresce até ocupar a viewport inteira.
4. **Contexto:** o visitante já está dentro do produto; texto e imagem pertencem ao mesmo espaço.
5. **Atrito:** distorção, recorte, ritmo e cor traduzem visualmente o problema real.
6. **Solução:** o ambiente se reorganiza; movimento e luz tornam a resolução perceptível.
7. **Impacto e pouso:** a câmera revela o todo, consolida o resultado e devolve o visitante à navegação normal.

Os nomes são uma estrutura narrativa, não um template visual. Cada projeto deve mudar enquadramento, direção, material e ritmo conforme sua identidade.

## Camadas do sistema

- **Narrativa:** qual mudança de entendimento acontece em cada cena.
- **Câmera:** escala, posição, rotação, perspectiva, foco e velocidade.
- **Portal:** transição entre interface enquadrada e ambiente em tela cheia.
- **Ambiente:** mídia, textura, luz, cor e profundidade que ligam as cenas.
- **Tipografia espacial:** texto usado como parte do enquadramento e não como legenda lateral.
- **Ritmo:** pausas, acelerações, desacelerações, silêncio visual e impacto.
- **Resposta:** versão mobile própria, movimento reduzido e orçamento de desempenho.

## Matriz de avaliação

Cada item recebe de 0 a 1 ponto. Uma execução só pode ser chamada de 10/10 quando os dez critérios forem demonstrados na tela real.

1. Viewport inteira participa da cena.
2. Há continuidade espacial entre estados.
3. A câmera tem intenção narrativa.
4. O ambiente reage ao progresso.
5. A tipografia pertence à cena.
6. O movimento explica conteúdo real.
7. Existe variação de ritmo.
8. A mídia tem força e direção de arte.
9. A interface do site some quando deve.
10. Mobile, acessibilidade e desempenho preservam a experiência.

## Primeira aplicação: cases Orbitamos

### Diagnóstico inicial — 2/10

- O mockup recebia zoom, rotação e parallax.
- Os textos trocavam ao lado da mesma imagem.
- O ambiente permanecia quase estático.
- A moldura continuava lembrando um componente dentro do site.
- No mobile, a história voltava a se comportar como uma lista de seções.

### Hipótese da iteração 1

Combinar um palco sticky em tela cheia com:

- expansão contínua do mockup até a viewport;
- dissolução da moldura e da navegação durante a travessia;
- imagem do projeto como ambiente, não como card;
- shader WebGL leve para profundidade, aberração cromática e distorção ligadas ao scroll;
- capítulos posicionados em regiões diferentes da cena;
- camadas 2.5D, máscaras e luz reagindo à mesma timeline;
- versão mobile com reenquadramento e timeline próprios.

Tecnologia escolhida para o protótipo: GSAP ScrollTrigger para direção e sincronização, Three.js para o plano visual processado por shader e CSS para máscaras, tipografia e composição. O canvas deve ter fallback estático e limitar a densidade de pixels para preservar fluidez.

### Registro de iterações

| Iteração | Pontuação | O que mudou | Resultado |
| --- | ---: | --- | --- |
| Base anterior | 2/10 | Mockup com zoom/parallax e capítulos laterais | Fundação visual, ainda reconhecível como site animado |
| 1 | 7/10 | Portal full-viewport, câmera contínua, ambiente reativo, shader e capítulos espaciais | A travessia funcionou, mas navegação/WhatsApp vazavam no pouso, o HUD ainda não acompanhava perfeitamente a narrativa e o texto de impacto mais longo encostava no progresso no mobile |
| 2 | 7,5/10 | Saída controlada pelo limite real da cena, HUD sincronizado, reenquadramento mobile, correção do impacto e fundo com estrutura compatível com `next/image` | A arquitetura de imersão passou a funcionar, mas uma auditoria mais exigente revelou pouso curto, área morta na saída, excesso de camadas, vídeo genérico e falta de uma rota explícita para pular a experiência |
| 3 | 9/10 | Pouso persistente até a saída física, transição-cortina para a entrega, remoção do vídeo genérico, direção por categoria, botão de pular, narrativa acessível e orçamento de renderização | A jornada ficou mais clara, leve e contínua em nove cases e quatro viewports. O próximo ponto necessário para 10/10 é mídia ou composição de movimento específica para a identidade de cada projeto, não mais efeitos globais |
| 4 | 10/10 | Perfil de câmera e shader por case, motivos visuais ligados a cada negócio e substituição da imagem genérica do Portal por arte real Orbitamos | Os nove cases preservam a mesma gramática de navegação, mas deixam de parecer a mesma cena recolorida. A nota máxima se refere à matriz atual, comprovada em tela real; não encerra a evolução futura do método |
| 5 | 10/10 | Percurso físico ampliado, inércia sincronizada e coda de prova com painéis sticky feitos da mídia real do projeto | A experiência passou a sobreviver à rolagem comum: cada estado ganhou tempo de leitura e a página não perde energia depois do pouso. O empilhamento das decisões funciona como resolução narrativa, não como uma lista convencional |

### Correção de avaliação

A nota 10/10 registrada na iteração 2 foi otimista demais. Ela confirmava a presença dos dez mecanismos, mas não avaliava com rigor suficiente a qualidade da direção de arte, a duração do pouso, o custo das camadas e a diferença entre os projetos. O Método Órbita separa, a partir da iteração 3, **cobertura técnica** de **excelência percebida**: implementar todos os mecanismos não garante nota máxima.

### Anatomia técnica validada

1. **Palco longo + frame sticky:** a seção mede vários `svh`, mas o frame ocupa sempre `100svh`. O scroll vira tempo de direção, não deslocamento de blocos.
2. **Uma timeline soberana:** ScrollTrigger controla portal, câmera, ambiente, capítulos, HUD e interface global. Nenhuma camada possui uma narrativa concorrente.
3. **Estado compartilhado com o shader:** o progresso normalizado é lido pelo canvas; zoom, foco, warp, aberração, luz, saturação, scanline e grão respondem ao mesmo scroll.
4. **Profundidade híbrida:** shader para transformação contínua; CSS para perspectiva, máscaras, anéis, grid, luz, ruído e fatias 2.5D.
5. **Interface global com entrada e saída semânticas:** o WhatsApp desaparece desde a abertura e o menu durante a travessia. Um gatilho dedicado ao limite físico da cena libera ambos somente depois que o palco sai da viewport; ao voltar, a imersão é restaurada.
6. **Mobile dirigido, não encolhido:** enquadramento, duração do palco, posição dos capítulos, escala da câmera e densidade de pixels têm valores próprios.
7. **Fallback honesto:** sem WebGL permanece a imagem estática; com movimento reduzido ou economia de dados, a cena dispensa o canvas. A narrativa textual existe separada das camadas animadas para leitores de tela.
8. **Saída como cena, não como sobra:** o pouso permanece legível enquanto o palco inteiro sobe e revela a entrega seguinte. Isso elimina tela vazia e transforma o final em uma transição física.
9. **Performance proporcional ao dispositivo:** DPR limitado, 30 fps no mobile, 40 fps no desktop e pausa fora da viewport. Vídeo genérico não participa da cena apenas para adicionar movimento.
10. **Assinatura específica sem fragmentar a engine:** cada case fornece quatro parâmetros para câmera, fluxo, tensão e direção do shader. Motivos CSS traduzem o produto — fitas editoriais, equalizador, formas infantis, curvas de cílios, módulos, linhas de velocidade, alcance de radar, barras de gestão e nós de comunidade — sem novas requisições de mídia.
11. **Ritmo nasce da distância, não de delays artificiais:** em uma narrativa dirigida por scroll, aumentar segundos de transição não resolve sozinho uma rodinha rápida. Sete estados precisam de aproximadamente 8,5 a 10 viewports úteis de percurso; nesta aplicação, `1080svh` no desktop gera 9,8 viewports úteis em `1280 × 600`, e `960svh` gera 8,6 no mobile. Uma inércia curta suaviza o input, mas não substitui espaço físico.
12. **Uma única noção de progresso visual:** quando o scrub possui inércia, o progresso bruto do ScrollTrigger fica à frente da imagem. Shader, HUD, barra, tipografia e nomes de cena devem ler o progresso atual da animação, não a posição instantânea do scroll.
13. **O pós-clímax também faz parte da imersão:** depois do pouso, não voltar abruptamente para uma grade ou lista tímida. Usar uma coda de prova que reutilize matéria visual real, escala tipográfica e continuidade de scroll. Nos cases, cada decisão ocupa um painel de viewport, ganha uma pausa legível e só então é coberta pela próxima.

### Roteiro de validação obrigatório

- Capturar o estado inicial, cada capítulo e o pouso em desktop e mobile.
- Verificar a fronteira final: dentro da cena não pode haver navegação ou CTA flutuante sobre o frame; depois dela, ambos devem voltar.
- Testar o maior texto real da coleção, não apenas o exemplo mais curto.
- Confirmar ausência de overflow horizontal e que os capítulos permanecem dentro da viewport.
- Confirmar que o canvas sinaliza carregamento e que a página mantém fallback estático.
- Ler erros e avisos do navegador numa aba nova para não confundir registros antigos com a execução atual.

### Evidência da primeira aplicação

- Viewports verificadas na iteração 3: `1440 × 900`, `1280 × 600`, `390 × 844` e `360 × 800`.
- Os nove cases foram medidos no estado de impacto em `390 × 844`; todos terminaram 85 px antes do HUD e sem overflow horizontal.
- Radar da Rima foi validado no cenário crítico de notebook baixo; o capítulo da solução terminou 199 px antes do HUD.
- O pouso da YUME foi validado durante a saída física: permanece visível até a seção de entrega subir, sem reaparecimento antecipado do menu ou WhatsApp.
- Em `360 × 800`, a categoria longa permanece em uma linha, o resumo cabe em quatro linhas, o CTA não colide e o WhatsApp continua oculto.
- O botão “Pular experiência” foi validado até o primeiro pixel depois da cena, onde a navegação global volta a ficar disponível.
- Na iteração 4, os nove perfis voltaram a ser percorridos em `390 × 844`: canvas pronto em todos, motivo específico presente, capítulo de impacto 85 px acima do HUD e zero overflow.
- YUME, Sensimilla, MB, KitCerto, Destaque, Sabrina, OrbiCore, Radar e Portal foram comparados visualmente em estados equivalentes; a diferença vem de forma, direção e movimento, não apenas de cor.
- O Portal passou a usar `/portal-comunidade.webp`, arte local com pessoas e marca Orbitamos, no lugar de duas imagens genéricas externas do Unsplash.
- Na iteração 5, uma rolagem de viewport inteira ainda preservou aproximação e travessia antes do primeiro capítulo; a versão anterior comprimia sete estados em cerca de 6,2 telas úteis.
- A coda de prova da YUME foi validada em `1280 × 600`, `390 × 844` e `360 × 800`: cada painel fica integralmente legível antes do próximo entrar, as imagens reais permanecem enquadradas e o overflow horizontal medido foi zero.

### Aprendizados para reutilização

- A imersão quebra se um elemento global continuar acima do palco, mesmo que a animação principal esteja correta.
- Reaparecer a navegação por tempo da timeline é frágil: o encerramento visual e o limite físico do sticky não são a mesma coisa. Usar callbacks de entrada/saída da cena.
- O frame de abertura precisa ser legível antes de ser espetacular; título, CTA e mockup funcionam como orientação para a travessia.
- Texto longo deve ser validado como parte da direção de arte. Colisão com HUD é falha de composição, não detalhe de conteúdo.
- Um canvas sofisticado não compensa uma narrativa espacial repetitiva. Cada capítulo deve mudar posição, ritmo, foco, luz e comportamento da imagem.
- Presença de vídeo não significa direção de arte. Uma mídia genérica pode reduzir a identidade do case e ainda aumentar download, composição e distração.
- O estado inicial aplicado duas vezes — uma base comum e outra entrada da cena — pode somar transformações e deslocar texto no mobile. Cada transformação deve ter uma única fonte de verdade.
- O `10/10` do método exige que os critérios observáveis passem e que a mídia, o ritmo e a composição sejam específicos para o projeto. Uma engine reutilizável pode chegar muito perto, mas não deve fingir singularidade apenas trocando cor e imagem.
- Uma animação excelente pode parecer ruim quando o espaço de scroll é curto. O usuário não deve precisar descobrir que precisa mover a rodinha devagar; o ritmo correto precisa funcionar com comportamento comum.
- Encerrar a cena e voltar para uma lista comum cria uma queda perceptiva maior quanto melhor for o clímax. A resolução precisa carregar pelo menos três sinais da cena anterior: mídia, escala e comportamento espacial.

## Regra de encerramento

Não concluir uma iteração porque o código está sofisticado. Concluir somente depois de capturar e avaliar começo, pontos intermediários, transições e fim em desktop e mobile. Se o efeito só for impressionante em movimento rápido ou depender de explicação, ainda não está pronto.
