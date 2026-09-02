# Direção imersiva Orbitamos

Este documento define o que Douglas quer dizer quando pede uma experiência "imersiva", "estilo Apple" ou guiada por scroll. Ele existe para impedir que esse pedido seja reduzido a parallax, zoom de mockup ou animações de entrada isoladas.

## Definição curta

Imersão é quando **a página deixa de parecer uma sequência de seções e passa a se comportar como uma cena contínua**. O scroll atua como direção e montagem: move a câmera, transforma o ambiente, revela informação e conduz a narrativa sem o usuário perceber blocos independentes sendo empilhados.

O trabalho atual dos cases é uma fundação inicial, mas ainda representa apenas **2/10** desse objetivo. O elemento principal ganha movimento; a tela inteira ainda não participa de modo suficiente da transformação.

## O alvo 10/10

Uma execução de nível 10 deve combinar, quando fizer sentido:

1. **Viewport como palco:** a experiência ocupa e controla a tela inteira por trechos significativos, sem parecer apenas um componente animado dentro de um layout comum.
2. **Continuidade espacial:** os estados nascem uns dos outros. O fim de uma cena já contém a origem da próxima; não há sensação de “acabou uma seção, começou outra”.
3. **Câmera dirigida:** escala, enquadramento, perspectiva, profundidade e foco mudam com intenção narrativa.
4. **Ambiente reativo:** fundo, luz, cor, textura, atmosfera, partículas ou sombras respondem ao mesmo progresso de scroll dos elementos principais.
5. **Tipografia integrada:** títulos e mensagens pertencem à cena — podem ser mascarados, atravessados, revelados em profundidade ou incorporados ao enquadramento — em vez de apenas aparecerem ao lado dela.
6. **Transformação com propósito:** cada movimento explica o projeto, revela uma funcionalidade ou cria progressão emocional. Movimento decorativo sozinho não conta como imersão.
7. **Ritmo cinematográfico:** alternar antecipação, impacto, pausa e resolução. Evitar velocidade linear e transições idênticas.
8. **Material visual forte:** usar vídeos, sequências de frames, recortes, gravações do produto, composições 3D ou WebGL quando eles elevarem a cena. Vídeo gerado por IA pode ser matéria-prima, mas não é requisito e não substitui direção de arte.
9. **Interface invisível durante a cena:** reduzir molduras, cards, bordas repetidas e textos utilitários enquanto a narrativa imersiva acontece. A chrome do site não deve disputar atenção com a cena.
10. **Mobile concebido à parte:** não apenas reduzir o desktop. Reenquadrar a câmera, simplificar camadas, preservar o momento de impacto e manter navegação, legibilidade, bateria e desempenho.

## O que não deve ser chamado de imersão

- Um mockup dando zoom enquanto o restante da página permanece estático.
- Parallax leve aplicado a dois ou três elementos.
- Cards entrando com fade ou slide.
- Uma seção sticky cercada por várias seções convencionais sem transição espacial entre elas.
- Texto trocando ao lado da mesma imagem sem transformação real do ambiente.
- Vídeo de fundo usado como decoração genérica.
- Excesso de glow, blur, gradientes ou partículas para simular sofisticação.
- Uma experiência bonita em desktop que vira lista comum ou quebra no celular.

Esses recursos podem participar da solução, mas isoladamente representam apenas o começo — aproximadamente 2/10, não o resultado final.

## Tecnologias possíveis

A tecnologia deve seguir a cena desejada:

- CSS transforms e GSAP ScrollTrigger para composição 2D, máscaras, pinning e timelines precisas.
- Canvas ou WebGL/Three.js para profundidade real, câmera, partículas e transições espaciais complexas.
- Sequência de imagens ou vídeo controlado por progresso para cenas renderizadas com alto realismo.
- Vídeo comum para atmosfera contínua quando não precisar de controle quadro a quadro.
- SVG e clip-path para transições vetoriais e máscaras leves.

Não escolher tecnologia só por ser moderna. Primeiro desenhar os estados visuais e a continuidade entre eles; depois usar a solução mais simples que preserve o efeito.

## Processo obrigatório

1. Definir de 5 a 8 quadros-chave da narrativa antes de codar.
2. Explicar o que muda na tela inteira entre cada quadro: câmera, fundo, luz, mídia, tipografia e mensagem.
3. Criar um protótipo da cena principal antes de expandir para toda a página.
4. Validar a experiência em pelo menos um desktop alto, um desktop baixo e um celular realista.
5. Verificar pontos intermediários do scroll, não apenas início e fim.
6. Testar sem overflow horizontal, pulos de layout ou conteúdo inacessível.
7. Criar fallback coerente para `prefers-reduced-motion`.
8. Medir carregamento e fluidez; a ambição visual não justifica uma experiência travada.

## Pergunta de aprovação

Antes de considerar a experiência concluída, perguntar:

> Se eu esconder a barra do navegador e o texto, ainda parece que estou atravessando uma cena ou apenas olhando para um site com animações?

Se a resposta for “um site com animações”, o resultado ainda não atingiu a direção imersiva da Orbitamos.
