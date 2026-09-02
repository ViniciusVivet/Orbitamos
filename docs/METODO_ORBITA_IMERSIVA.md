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
| 2 | 10/10 | Saída controlada pelo limite real da cena, HUD sincronizado, reenquadramento mobile, correção do impacto e fundo com estrutura compatível com `next/image` | Os dez critérios da matriz foram demonstrados no navegador real; a experiência ocupa a viewport, preserva a continuidade e devolve a interface global somente depois do pouso |

### Anatomia técnica validada

1. **Palco longo + frame sticky:** a seção mede vários `svh`, mas o frame ocupa sempre `100svh`. O scroll vira tempo de direção, não deslocamento de blocos.
2. **Uma timeline soberana:** ScrollTrigger controla portal, câmera, ambiente, capítulos, HUD e interface global. Nenhuma camada possui uma narrativa concorrente.
3. **Estado compartilhado com o shader:** o progresso normalizado é lido pelo canvas; zoom, foco, warp, aberração, luz, saturação, scanline e grão respondem ao mesmo scroll.
4. **Profundidade híbrida:** shader para transformação contínua; CSS para perspectiva, máscaras, anéis, grid, luz, ruído e fatias 2.5D.
5. **Interface global com entrada e saída semânticas:** menu e CTA desaparecem na travessia. O palco sobe de camada durante toda a experiência e só libera a interface no `onLeave`; ao voltar, `onEnterBack` restaura a imersão.
6. **Mobile dirigido, não encolhido:** enquadramento, duração do palco, posição dos capítulos, escala da câmera e densidade de pixels têm valores próprios.
7. **Fallback honesto:** sem WebGL permanece a imagem estática; com movimento reduzido, a cena vira uma leitura vertical clara e dispensa canvas, cortes e animações.

### Roteiro de validação obrigatório

- Capturar o estado inicial, cada capítulo e o pouso em desktop e mobile.
- Verificar a fronteira final: dentro da cena não pode haver navegação ou CTA flutuante sobre o frame; depois dela, ambos devem voltar.
- Testar o maior texto real da coleção, não apenas o exemplo mais curto.
- Confirmar ausência de overflow horizontal e que os capítulos permanecem dentro da viewport.
- Confirmar que o canvas sinaliza carregamento e que a página mantém fallback estático.
- Ler erros e avisos do navegador numa aba nova para não confundir registros antigos com a execução atual.

### Evidência da primeira aplicação

- Viewports verificadas: desktop `1280 × 720` e mobile `390 × 844`.
- YUME validada no início e nos sete estados; Radar da Rima validado nos quatro capítulos, pouso e fronteira de saída.
- Os nove cases foram percorridos no estado de impacto no mobile; todos ficaram dentro da viewport, sem overflow horizontal e com canvas pronto.
- Radar da Rima, o texto mais longo, terminou acima do HUD após o reenquadramento.
- Uma aba nova do Radar foi carregada sem erros ou avisos do navegador.

### Aprendizados para reutilização

- A imersão quebra se um elemento global continuar acima do palco, mesmo que a animação principal esteja correta.
- Reaparecer a navegação por tempo da timeline é frágil: o encerramento visual e o limite físico do sticky não são a mesma coisa. Usar callbacks de entrada/saída da cena.
- O frame de abertura precisa ser legível antes de ser espetacular; título, CTA e mockup funcionam como orientação para a travessia.
- Texto longo deve ser validado como parte da direção de arte. Colisão com HUD é falha de composição, não detalhe de conteúdo.
- Um canvas sofisticado não compensa uma narrativa espacial repetitiva. Cada capítulo deve mudar posição, ritmo, foco, luz e comportamento da imagem.
- O `10/10` do método significa que todos os critérios observáveis passaram na tela real; não significa que a técnica deixa de evoluir.

## Regra de encerramento

Não concluir uma iteração porque o código está sofisticado. Concluir somente depois de capturar e avaliar começo, pontos intermediários, transições e fim em desktop e mobile. Se o efeito só for impressionante em movimento rápido ou depender de explicação, ainda não está pronto.
