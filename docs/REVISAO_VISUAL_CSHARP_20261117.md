# Revisão da entrada visual C# — 17/11/2026

**Estado: B01.07 implementada, QA técnico aprovado; publicação em fechamento.** Este registro documenta o reparo técnico, sem presumir aprovação visual pelo usuário.
A prioridade operacional está no [mapa de execução](MAPA_EXECUCAO_ACADEMY.md).

## Feedback recebido e limite da evidência

Em 17/11/2026, o usuário enviou **cinco fotos** da experiência e deu **nota 1/10**
à tela do piloto C#. Relatou abandonar a entrada tanto no PC quanto no celular:
menus, submenus, caixas e retângulos apareciam antes de uma cena útil e do código.
O problema é de orientação e composição da entrada, não apenas de cor ou borda.
As fotos e o relato foram recebidos no chat; não são capturas novas produzidas
pelo QA desta correção.

Essa é uma avaliação humana real da apresentação. Não é um ensaio acompanhado
de prever, escrever, errar, corrigir e resolver uma variante. Não conclui H01,
H02 ou H03, e não há retorno posterior R01/R02 registrado por esse feedback.
Não inferir aprendizagem, retenção ou autonomia a partir da nota ou das fotos.

Os testes e capturas anteriores conservam o que efetivamente verificaram.
Ausência de overflow, erro de página ou violação automática não demonstrou que
essa composição era clara ou atraente. O novo aceite visual precisa de suas
próprias capturas, sem transformar aprovação técnica em aprovação do usuário.

## Diagnóstico e direção da correção

A entrada do piloto empilha a navegação da trilha, tabs de módulos, localização
sticky, roteiro de atividades, título e orientações antes da prática incorporada.
O resultado faz o estudante atravessar a organização do produto antes de ver
o pedido que vai resolver. Acrescentar uma foto acima das mesmas camadas não
resolve esse problema.

A composição deve apresentar uma missão do OrbiServiços: **uma cena contextual,
um pedido curto, o editor e uma ação principal**. Orbi e uma ficha de serviço
podem mostrar para que o programa existe; o texto do pedido continua no HTML,
legível e acessível. Uma foto editorial pode contextualizar o estudo sem fingir
que mostra o programa do aluno em execução. Não distribuir fotos decorativas
em cada campo ou converter toda a tela em novos cartões.

No desktop, cena/pedido e editor podem ocupar duas colunas. No celular, formar
uma sequência curta: localização → cena/pedido → linha em estudo/editor → ação.
O mapa completo continua acessível; roteiro, troca de atividade, opções e
detalhes administrativos são consultados quando necessários. As instruções
indispensáveis para escrever o programa não podem desaparecer nessa redução.

## Escopo de B01.07

1. **B01.07.1 — Entrada e navegação:** compactar o chrome, remover tabs
   duplicadas e banner contextual sticky do piloto; preservar localização,
   mapa completo, destinos, IDs e saves. Abrir roteiro/opções sob demanda.
2. **B01.07.2 — Missão e prática:** integrar cena útil, uma orientação próxima
   do editor e uma ação principal. Não reservar espaço para console vazio;
   mostrar execução, saída e erro quando houver estado real correspondente.
3. **B01.07.3 — QA e publicação:** conferir os critérios abaixo, incluindo
   recuperação e persistência, e somente depois registrar commit/push, CI,
   deploy e smoke público. Não substituir teste físico de teclado por emulação.

É um único incremento prioritário, executado antes de **B02.03.2**, o novo vínculo
de objetos. B02.01, B02.02.6 e B02.03.1 têm implementação e QA locais prontos,
ainda sem commit/push ou publicação desta rodada. A correção visual preserva
esse trabalho; não exige repeti-lo nem autoriza declará-lo publicado.

## Aceites visuais e funcionais verificáveis

Medir após carregamento estável, zoom de 100%, rolagem inicial em zero e teclado
virtual fechado. Registrar as dimensões do viewport e os limites visíveis nas
capturas. Não usar blur de carregamento como prova final.

| Critério | Aceite da correção |
| --- | --- |
| Primeira dobra de **390×664** | Pedido/título da tarefa e começo do editor aparecem sem rolar nem abrir um menu. A primeira linha editável e pelo menos **44 px** de altura da área de edição estão inteiramente dentro dos 664 px do viewport. |
| Mídia de tamanho útil | A primeira dobra mobile contém foto ou cena contextual com pelo menos **120 px de altura visível**; Orbi não se reduz a um ícone num quadrado. A cena ajuda a entender o pedido e não empurra a primeira linha para fora do aceite de 390×664. |
| Hierarquia de entrada | **Uma ação principal** por estado da tarefa; não coexistem convites concorrentes de começar/continuar/executar. Navegação secundária usa hierarquia visual discreta. |
| Navegação compacta | **Zero fileiras duplicadas de tabs** na entrada do piloto e **zero banner contextual sticky** entre a navegação global e a missão. O mapa completo continua acessível por controle rotulado. |
| Roteiro e opções | Atividades, roteiro e opções podem ser abertos e fechados por teclado/toque sem executar código nem apagar trabalho. O pedido e a instrução necessária à linha atual continuam visíveis junto do editor. |
| Console e honestidade | **Zero console vazio** consumindo a entrada antes da primeira execução. Prévia/ficha de exemplo é identificada como exemplo; saída ou sucesso só surgem pelo estado real do executor. |
| Erro e recuperação | Produzir um erro real, ver mensagem legível e manter o código para corrigir. Abrir roteiro/opções não troca o erro por sucesso nem apaga a tentativa. A correção pode ser executada novamente sem reset obrigatório. |
| **320×640** | Cena útil já na primeira dobra, ação identificável, sem corte do editor, controles ou texto e sem overflow horizontal; roteiro/mapa continuam utilizáveis. Registrar a posição do início do editor mesmo quando o requisito específico de 390×664 não se aplicar. |
| Desktop **1366×768** | Cena/pedido e início da prática são visíveis juntos; navegação não domina a área da missão. Conferir também erro, saída e opções abertas. |
| Teclado e foco | Percorrer por Tab e Shift+Tab, editar, executar e abrir/fechar opções/mapa com foco visível e sem armadilha. Mudança de atividade não envia a digitação para o arquivo anterior. |
| Saves e retomada | Rascunho, atividade atual e ajuda mantêm o contrato existente após trocar atividade, consultar mapa, voltar e recarregar. Conferir isolamento entre contas e preservação dos saves anteriores; não criar XP/conclusão por navegação. |

As medidas definem o aceite desta composição, não uma nota universal de design.
Capturas em 320/390 e desktop, análise de teclado/foco, casos negativos e resultado
dos saves precisam estar identificados no fechamento. WebKit mobile é QA de
navegador; uso em iPhone físico com teclado aberto continua pendente de H01.

## Arquivos e mídia de referência

O trabalho funcional está concentrado em
[CSharpTrack](../apps/web/src/components/estudante/CSharpTrack.tsx),
[CSharpVariables](../apps/web/src/components/estudante/CSharpVariables.tsx) e
[GuidedPractice](../apps/web/src/components/estudante/GuidedPractice.tsx), com
seus respectivos arquivos de estilo. Preservar os contratos do editor,
executor, progresso, rotas e persistência ao alterar a apresentação.

Mídia existente para escolha editorial, sem exigir nova geração:

- [Orbi tech](../apps/web/public/orbi-tech.png): personagem com transparência;
  servir com tamanho responsivo e dimensões reservadas.
- [Estudo pelo celular](../apps/web/public/images/academy/codigo-no-celular-v1.webp)
  e [projeto no computador](../apps/web/public/images/academy/projeto-csharp-v1.webp):
  fotos editoriais, não evidência de estudante nem captura do executor C#.

Uma captura real de jogo pertence ao contexto daquele jogo. Não a apresentar
como se o C# digitado nesta prática controlasse uma cena que não está integrada.
Aplicam-se as regras de [composição visual da Academy](PADRAO_VISUAL_ACADEMY.md).

## Estado e fechamento obrigatório

| Evidência | Situação deste registro |
| --- | --- |
| Feedback humano da entrada | Recebido: cinco fotos, nota 1/10 e relato de abandono no PC/celular |
| I — implementação B01.07 | Feita no recorte: barra/roteiro, cena, tarefa/editor e ferramentas em variáveis/condições/laços |
| Q — QA da composição nova | Aprovado: 988 testes/78 arquivos, nove contratos estruturais, lint, tipos/build e navegador nos três perfis abaixo |
| P — publicação da rodada | Pendente; ainda sem commit/push, SHA remoto, CI, deploy ou smoke público desta rodada |
| H — tentativa de aprendizagem | H01–H03 permanecem pendentes; feedback visual não preenche o roteiro |
| R — retorno posterior | Pendente; nenhuma variante posterior foi observada |

No fechamento, atualizar o cursor do mapa e esta tabela com evidência real.
Registrar a maior limitação restante e o próximo ID pronto. Não declarar nota
10/10, comparação comprovada com Alura/DIO ou eficácia de aprendizagem.
Os **cerca de 30%** continuam uma estimativa interna de cobertura para
planejamento, conforme o [controle da formação](CONTROLE_FORMACAO_ORBITAMOS.md),
e não uma nota de qualidade. Esta correção não cria novo percentual.

## Arte da missão e origem

Nova cena autoral gerada com a ferramenta integrada ImageGen, usando Orbi tech
somente como referência de identidade. A imagem não representa execução do programa
nem uma pessoa real. Original preservado na biblioteca local do Codex; versão
de entrega: [orbiservicos-workshop-v1.webp](../apps/web/public/images/academy/orbiservicos-workshop-v1.webp),
1200×800, 94.134 bytes, WebP qualidade 82. Sem API/CLI paga adicionada ao site.

<details>
<summary>Prompt final da cena</summary>

```text
Use case: stylized-concept.
Asset type: contextual editorial 3D illustration for an OrbiServiços programming mission, a real scene rather than a webpage mockup.
Reference image 1 is CHARACTER IDENTITY ONLY: preserve Orbi's spherical Earth head with blue oceans and green continents, huge glossy friendly dark eyes with cyan rims, small smile, two short helmet antennae, and recognizable navy-blue/teal astronaut suit and gloves. Preserve this mascot, not a generic robot. Discard every hologram and UI element from the reference.
Scene: a small, welcoming modern neighborhood service workshop and customer counter. Orbi is engaged in organizing a physical service order at a warm wooden workbench/counter. One gloved hand holds a plain paper order card, another is naturally near a notebook computer. Several physical paper order slips lie neatly on the counter. A modest practical workshop shelf/tool area softly recedes into the background.
Style: polished stylized 3D editorial storytelling, tactile materials, rounded friendly forms, careful cinematic depth, gentle soft lighting, coherent proportions. The workspace feels useful, calm and cozy.
Palette: deep midnight blue, muted teal, mint details, restrained warm amber light on wood. Cyan only as a small identity accent on Orbi, no neon atmosphere.
Composition: landscape 3:2 composition. Orbi at center-right, about 63 percent across the canvas, with the head and essential paper/workbench action inside the central area so horizontal and portrait crops remain useful. Leave breathing room above the helmet and enough lower counter detail. The left third is a calm low-detail dark environmental area for a short HTML mission title; no text is baked into the image. Keep the subject comfortably visible rather than tiny in a wide room.
Constraints: no letters, words, numbers, logos, watermarks, code drawings, code on screens, charts, floating interface cards, HUDs, neon panels or holograms. The notebook screen is a simple dark unlettered surface. Physical paper cards are plainly paper, without readable marks. No other characters. No checkerboard background. Create one finished opaque scene.
```

</details>

## QA de navegador e continuação

`scripts/audit-csharp-lesson-workspace.mjs` usa os componentes da produção na
prévia isolada, sem conta/dados reais. Passou em Chromium 1366×768 e WebKit
390×664/320×640, com 15 estados axe sem violações no escopo e sem overflow ou
erros de página. Capturas de entrada/roteiro foram inspecionadas. O início do
editor foi medido em y=344 px no desktop, 492 px em 390 e 515 px em 320; a cena
mobile tem 168 px. Medidas com teclado fechado e zoom 100%, sem promessa de
mesma geometria com teclado físico/virtual aberto.

Foram exercitados avanço de linha, erro/acerto do quiz, código independente
negativo/positivo, reload, troca de módulos, mapa e recuperação após reinício.
Uma falha real de retorno de foco no WebKit foi corrigida. Revisão de código
também encontrou o botão da última tarefa sem destino quando havia pendências,
símbolos inoperantes no editor avançado e perda da instrução de manter as linhas
anteriores: os três foram corrigidos. Um ensaio extra desktop conferiu o retorno
à primeira pendente e a ausência de teclas inativas. Saves/IDs foram preservados;
navegação não concede conclusão nem XP.

Evidência local ignorada: `docs/local/academy-visual-reset-20261117/browser/`,
`browser-extra/`, `asset.json` e `continuity.json`. O fechamento remoto precisa
conferir o próprio SHA/CI/Vercel. Ainda não há aprovação do usuário para a nova
composição nem ensaio de aprendizagem em iPhone físico.

**Próxima tarefa: B01.08**, interior de Métodos/Objetos. A barra externa já foi
compactada, mas preparação, título, avisos, roteiro e previsão ainda podem
empurrar seu editor para baixo. Unificar contexto/arquivo/tarefa e promover uma
cena dos dados, sem antecipar as soluções; preserve o SDK, os arquivos, chaves e
a distinção entre execução declarada e conferida. O mapa contém os filhos.

Fechamento técnico: lint dos 14 arquivos JS/TS alterados, 988 testes em 78
arquivos, nove contratos estruturais e build de produção/tipos aprovados.
O primeiro ensaio da nova cópia de for revelou perda da expressão das três
partes; a explicação foi corrigida e a suíte completa passou, sem afrouxar o
teste. Warnings preexistentes de Browserslist e tracing de materiais continuam.
Publicação e smoke remoto devem ser lidos no cursor local do incremento.
