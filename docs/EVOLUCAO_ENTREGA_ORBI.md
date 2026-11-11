# Evolução da Entrega do Orbi

Plano e decisões registrados em **10/11/2026**. Esta é a memória de continuidade
do jogo: descreve a fatia em construção, os critérios de qualidade e a ordem
das próximas entregas. Os blocos de trabalho abaixo não são uma promessa de
datas nem uma declaração de funcionalidades já publicadas.

## Alvo do produto

Construir uma aventura que a pessoa queira jogar e na qual precise entender
o que seu código muda. Enredo, movimento, som, risco, descoberta e programação
devem formar o mesmo percurso. Um terminal com uma pergunta seguido de uma
caminhada vazia não é o objetivo final.

A referência mínima aprovada continua sendo **A última luz do bairro**, da
rodada de 04/11, descrita em [STUDIO_E_ORBI_CAPITULO_01.md](STUDIO_E_ORBI_CAPITULO_01.md).
Ela tem três entregas: ponte, elevador e farol. Os problemas de fluidez ao andar
relatados pelo usuário têm prioridade sobre acrescentar efeitos ou inimigos.

O projeto continua usando a infraestrutura existente. Física, renderização,
controles, áudio e execução da gramática educativa ficam no navegador. Não
adicionar requisições ao Supabase por quadro, disparo, tecla ou contato com um
inimigo. Qualquer sincronização futura deve gravar marcos úteis e ter custo e
políticas de acesso discutidos antes de integrar o fluxo publicado.

## Decisão da rodada: Oficina do Pulso

A nova aventura é uma **Oficina opcional, com duas lições próprias**, acessível
pela experiência da Entrega. Ela não substitui nem aumenta silenciosamente o
capítulo de três entregas.

Uma tempestade deixou as sentinelas do bairro presas num ciclo de ruído. Orbi
usa um emissor de reparo para restaurá-las e liberar as passagens. Os bugs são
robôs do cenário, com estado e comportamento reconhecíveis. O reparo deve ter
consequência visível: luz, pose, som e abertura da passagem.

### Lição 1 — O pulso que alcança

- Ideia: uma variável controla uma ação.
- O equipamento começa com alcance 90 e recarga de 1.4 segundo. A onda curta
  termina antes do bug do outro lado da barreira.
- O estudante altera `alcancePulso`, aplica e observa o comprimento do pulso.
- Três bugs com um acerto de reparo liberam três passagens sucessivas.
- Completar requer programa aplicado, três reparos e chegada física à oficina.

### Lição 2 — Dois pulsos, um reparo

- Ideia: um decimal representa um intervalo menor entre ações.
- O alcance começa em 280. Os bugs precisam de dois acertos; após o primeiro,
  o escudo volta em 1.1 segundo se o reparo não terminar.
- Com recarga 1.4, o segundo pulso chega tarde. Com 0.6, cabe na brecha.
- O estudante escreve o decimal com ponto, como exige o JavaScript.
- A conclusão também exige os três reparos e a chegada física. Apenas abrir
  o terminal, copiar o exemplo ou disparar não conclui a lição.

O ciclo é **ver o problema → prever → escrever → aplicar → jogar → observar →
ajustar**. As pistas aparecem progressivamente. Um valor válido mas insuficiente
deve ser aplicado para que o aluno enxergue sua consequência. Código inválido
não deve apagar a última configuração válida nem o rascunho.

### Gramática do equipamento

Referência final:

```js
const alcancePulso = 280;
const recarga = 0.6;
```

O terminal interpreta duas declarações numéricas, nessa ordem, com os nomes
`alcancePulso` e `recarga`. Aceita contas simples e valores previamente
declarados. Alcance fica entre 40 e 400; recarga, entre 0.25 e 2.5 segundos.
O padrão da primeira rota é alcance 90/recarga 1.4; o da segunda é 280/1.4,
para isolar a recarga como o problema a resolver.

Isso é um subconjunto educativo de declarações e expressões do JavaScript.
O texto do aluno **não é executado com `eval`**. Funções, condicionais, laços,
acesso à rede, DOM e arquivos não fazem parte desse terminal. Não ensinar uma
sintaxe nova na interface antes de o runtime realmente suportar sua execução
e suas consequências.

## Progresso e compatibilidade

| Conteúdo | Chave / contrato | Regra |
| --- | --- | --- |
| Jogo anterior | Save legado existente | Permanece intacto e identificado como histórico |
| Três entregas aprovadas | `orbitamos-orbi-chapter-v2-<conta>` | Ponte, elevador e farol; conclusão e journal `contentVersion=2` preservados |
| Oficina do Pulso | `orbitamos-orbi-pulse-v1-<conta>` | Alcance e ritmo, com rascunhos, tentativas e conquistas próprios |

O novo save mantém `version`, `current`, `completed`, `drafts` e `attempts`.
A leitura limita os dados e só aceita o prefixo de conquistas: ritmo não pode
aparecer concluído sem alcance. Entre abas da mesma conta, conquistas e
tentativas são monotônicas; o rascunho e a navegação da aba que está editando
continuam sendo seus próprios valores.

Não importar o save das três entregas como conclusão da Oficina. Não chamar o
`onComplete` da Entrega nem gerar XP da atividade antiga ao terminar um bônus.
Se futuramente houver XP próprio, ele precisa de identidade de conteúdo,
fonte de conclusão e proteção contra repetição claramente definidas. Essa
decisão não é necessária para que a oficina seja jogável agora.

O progresso permanece local ao navegador e à conta. Isso não equivale a
sincronização entre aparelhos. Recarregar deve recuperar rascunhos e conquistas;
o programa só altera o cenário depois de uma aplicação válida.

## Estado da rodada de 10–11/11

**Implementado e validado localmente em 11/11.** As duas rotas foram concluídas
com entradas reais nos três perfis descritos abaixo; tipos e build de produção
foram aprovados. A conferência de envio, CI e Vercel fica no registro local
`docs/local/orbi-evolution-20261110/production-verification.json`, preenchido
no encerramento após o push. Num clone sem esse arquivo, confira o SHA atual
da main no GitHub e o deploy correspondente; build local não comprova deploy.

| Parte | Estado registrado |
| --- | --- |
| Conteúdo e parser do Pulso | Implementados em `apps/web/src/lib/orbiPulse.ts` |
| Save independente e merge entre abas | Implementados no mesmo módulo, sem alterar o save v2 |
| Testes focais | 37 testes aprovados em 11/11, com um worker, nos cinco módulos indicados no guia de testes |
| Otimização do motor e integração do combate | Implementadas: física fixa com desenho interpolado, câmera dependente do tempo, geometria em cache, pools de efeitos/disparos, pausa do loop e menos trabalho repetido |
| Interface da Oficina e controles | Percurso aprovado no roteiro desktop, WebKit/iPhone 13 e Chromium 320px; três toques reais simultâneos via CDP no perfil estreito |
| Novos sinais sonoros | Pulso, acerto, reparo, dano, recarga do escudo e passos; limites de vozes, mute, pausa e limpeza cobertos por testes unitários |
| QA desktop/mobile e medidas de fluidez | Percurso, Axe/overflow, pistas de erro, reset/undo, aplicação, chegada, saves antigos e isolamento aprovados; medir fluidez separadamente |
| Build, CI e publicação desta rodada | Build e tipos aprovados em 11/11; envio e checks remotos têm registro separado, indicado acima |

Arquivos principais para continuar:

- `apps/web/src/lib/orbiPulse.ts`: lições, programa seguro e progresso novo.
- `apps/web/src/lib/orbiPulse.test.ts`: limites, sintaxe, compatibilidade e merge.
- `apps/web/src/lib/orbiChapter.ts`: três entregas e física compartilhada.
- `apps/web/src/components/games/OrbiChapterExperience.tsx`: fluxo, terminal,
  persistência e mensagens da experiência.
- `apps/web/src/components/games/orbi-chapter/engine.ts`: cena, controles,
  animação, câmera e consequências físicas.
- `apps/web/src/components/games/orbi-chapter/audio.ts`: sons originais.
- `apps/web/src/components/games/orbi-chapter/types.ts`: contrato UI/motor.
- `apps/web/src/components/games/OrbiPulseExperience.tsx`: fluxo independente,
  terminal, controles e HUD da Oficina.
- `apps/web/src/components/games/orbi-chapter/pulseCombat.ts`: combate puro,
  disparos, escudo, telegráficos e barreiras.
- `apps/web/scripts/audit-orbi-pulse.mjs`: percurso real das duas rotas.

## Arte e origem dos arquivos

Atlas novo: `apps/web/public/images/games/orbi-chapter/sentinel-sheet-v1.webp`,
1024 × 512, quatro colunas e duas linhas, transparência preservada, 266.026
bytes. Gerado em 10/11 com ImageGen integrado, modo geração, e convertido com
Sharp para WebP. Nenhum serviço ou dependência paga foi adicionado ao jogo.
O original fica fora do Git em
`docs/local/orbi-evolution-20261110/sentinel-source.png`; o arquivo original
do gerador também permanece na pasta local de imagens geradas do Codex.

Estados: corrompido parado, patrulha inclinada em duas poses, carregando,
disparando, recebendo pulso, escudo instável e reparado. A capa do catálogo
continua sendo uma captura do jogo real, e não esse atlas.

Prompt final enviado, sem mudanças semânticas posteriores:

```text
Production-ready 2D game sprite atlas on a truly TRANSPARENT background, landscape 2:1 canvas, exactly FOUR equal columns and TWO equal rows, eight equal cells, one SAME hovering maintenance sentinel robot per cell. This is an original enemy-to-friend character for the Orbitamos Orbi programming adventure. Polished hand-painted 2.5D cartoon game art, tactile brushed copper and midnight-teal metal, rounded toy-like engineering, subtle navy shadows, cyan reflections, warm Brazilian cozy adventure aesthetic, clean strong silhouette readable when scaled to 70 pixels. Character: squat hovering maintenance drone, rounded copper armor shell around a dark oval single-eye visor, two small side thrusters, one short bent antenna, little mechanical arms, a small battery/lantern core visible in chest. The corrupted version has a glowing magenta single eye and small contained purple interference accents. Consistent left-facing three-quarter side view in EVERY cell, identical camera, identical size and baseline, no dramatic perspective changes, no words, no numbers, no typography, no borders, no grid lines. Robot fully inside each cell with generous uniform TRANSPARENT margins (at least 15 percent padding), no overlapping cells, no background, no ground shadows, no scenery. Top row cells left to right: 1 idle corrupted hovering robot, 2 same robot slightly tilted forward patrolling, 3 same robot slightly tilted back hovering, 4 same robot charging a shot with visor/core lit amber-magenta. Bottom row left to right: 5 same robot firing toward LEFT, only tiny contained muzzle glow with no long projectile; 6 same robot recoiling from a cyan repair-pulse hit, a few contained sparks; 7 same robot with damaged purple interference shield, still mechanically intact; 8 SAME robot fully repaired, friendly mint-cyan visor eye and warm GOLD lantern core, calm hover pose. Match premium illustrated mascot art with a friendly globe-headed astronaut Orbi in a dark teal suit, but do NOT include Orbi or a globe-headed character in this atlas. All eight cells are functional animation frames of one consistent robot, not different designs.
```

## Plano de evolução por blocos de trabalho

Cada bloco pode levar mais de uma sessão. O próximo só deve ampliar a aventura
quando o percurso anterior estiver jogável, legível e recuperável.

### Bloco A — Fundação e primeira ação, sessões 1–3

- Corrigir os engasgos ao caminhar, medir tempo de quadro e localizar trabalho
  repetido, alocações e reconstruções de desenho no loop.
- Preservar a física, transporte no elevador, tolerância de borda e buffer de
  pulo. Conferir que câmera e desenho não saltam entre posições físicas.
- Integrar Pulso, três sentinelas, barreiras e as duas lições da Oficina.
- Acrescentar feedback de disparo, alcance curto, acerto, reparo e passagem.

**Passa quando:** é possível concluir as três entregas antigas e as duas novas
lições por controles reais, errar sem perder rascunhos, recarregar e retomar.
O áudio respeita mute e pausa. A medição precisa registrar hardware/perfil e
condições; uma média alta de FPS não substitui investigar travadas longas.

### Bloco B — História e leitura do mundo, sessões 4–5

- Dar às sentinelas uma apresentação curta e um estado reparado reconhecível.
- Fazer moradores e equipamentos reagirem às entregas, sem interromper o jogo
  com sucessivos textos longos.
- Acrescentar sinais de proximidade, direção e perigo por forma, movimento e
  som, preservando uma alternativa visual para cada informação sonora.
- Revisar a primeira experiência: o estudante deve reconhecer objetivo,
  controles, terminal e consequência sem depender de explicação externa.

**Passa quando:** uma pessoa nova entende o primeiro objetivo e consegue
explicar o que sua primeira alteração de código fez no cenário.

### Bloco C — Condições e booleanos, sessões 6–8

- Projetar um capítulo/atividade novo, com identidade e conclusão próprias.
- Ensinar estado ligado/desligado e `if` através de um escudo, sensor ou porta.
- Mostrar por que a ação ocorreu ou não ocorreu, com valores observáveis.
- Implementar e testar a gramática restrita antes de publicar os desafios.

**Passa quando:** a mesma condição é testada em dois estados diferentes e o
aluno consegue prever o comportamento. Nenhum progresso v2 é promovido por
abrir o novo capítulo.

### Bloco D — Funções e reutilização, sessões 9–11

- Transformar uma sequência conhecida numa ação com nome e parâmetros.
- Reutilizar a mesma função em situações diferentes, para que a função não
  vire apenas mais texto obrigatório a copiar.
- Fazer o estudante mudar um argumento, testar e comparar resultados.

**Passa quando:** uma função real do subconjunto suportado resolve duas
situações e o runtime apresenta erro claro para chamada ou argumento inválido.

### Bloco E — Laços, sequências e depuração, sessões 12–15

- Introduzir repetição em uma sequência visível de dispositivos ou alvos.
- Acrescentar ordem e contagem antes de coleções maiores.
- Criar situações de código quase correto: nome trocado, condição invertida,
  repetição a mais. O jogador observa, explica a hipótese e corrige.
- Associar palavras como `if`, `return` e `for` à ação que representam, sem
  tornar inglês um pré-requisito para entrar na aventura.

**Passa quando:** há ao menos uma transferência para um contexto diferente e
uma correção de erro que não se resolve só reescrevendo a resposta mostrada.

### Bloco F — Desafio de capítulo e ferramenta de conteúdo, sessões 16+

- Criar um confronto final com fases que combinam conceitos anteriores. O
  obstáculo deve exigir raciocínio, e não uma quantidade excessiva de tiros.
- Separar a definição das missões do desenho/física, com validação dos dados
  de níveis e contratos de save explícitos.
- Produzir poses, objetos e inimigos coerentes com a arte aprovada. Efeitos
  simples podem apoiar uma cena; não substituem o cuidado com personagens.
- Acrescentar revisão posterior e passagem para prática de código, usando
  evidência de conclusão real. Medir antes de ampliar sincronização ou custos.

**Passa quando:** um capítulo pode ser revisado por conteúdo e testado sem
alterar manualmente a física para cada missão; a arte, o som e os controles
continuam coesos no desktop e no celular.

## Critérios permanentes de jogo e aprendizagem

- Uma mudança de código produz uma consequência visível e explicável.
- Pistas ajudam sem substituir toda a tentativa. Copiar não é a única forma
  de demonstrar entendimento.
- Patrulhas e brechas são previsíveis antes de exigir precisão. A pessoa deve
  conseguir compreender o problema enquanto aprende os controles.
- Contato, queda, pausa e retorno não apagam código ou conquistas.
- Movimento reduzido conserva o objetivo e o feedback; evitar flashes e
  tremores obrigatórios para entender uma ação.
- Testar direção+pulo+ação no toque, captura de ponteiro, foco do terminal,
  teclado móvel e retorno do segundo plano. Não disparar ao digitar no editor.
- Gravar apenas marcos e rascunhos úteis. Não atualizar React, storage ou rede
  por quadro de física só para manter um indicador visual.
- Capas do catálogo continuam sendo screenshots reais do jogo entregue.

## CONTINUIDADE: retomar sem perder o caminho

1. Ler `AGENTS.md`, `apps/web/AGENTS.md`, este documento e o registro do capítulo
   aprovado. Conferir `git status` antes de tocar em arquivos compartilhados.
2. Não ler nem incluir o arquivo pessoal local `apps/web/CLAUDE.md`. Referências
   sincronizadas em `sources/` continuam somente leitura.
3. Atualizar a tabela de estado acima apenas com trabalho comprovado. Registrar
   pendência, bug observado, causa, correção e teste que faltou, sem marcar o
   bloco inteiro concluído por ter código compilando.
4. Conferir o caminho de desenvolvimento
   `/dev/academy-preview?activity=delivery`; ele é isolado e não substitui o
   fluxo publicado `/estudante/jogos/entregas-do-orbi`.
5. Em `apps/web`, executar o conjunto focal adequado com um worker:
   `node node_modules/vitest/vitest.mjs run src/lib/orbiPulse.test.ts src/lib/orbiChapter.test.ts --maxWorkers 1`.
6. Conferir as três entregas pelo roteiro existente
   `node scripts/audit-orbi-chapter.mjs` e a resiliência com
   `node scripts/audit-orbi-chapter-resilience.mjs`. A Oficina precisa de seu
   próprio percurso de QA, incluindo alcance insuficiente, escudo regenerando,
   três reparos, chegada, toque simultâneo e save entre abas.
7. Registrar screenshots e medidas locais em `test-results/` ou `docs/local/`,
   fora do Git. Distinguir desenvolvimento, build local e produção real.
8. Antes de publicar, concluir os checks exigidos, preservar saves, revisar o
   diff e excluir arquivos pessoais. Depois, conferir SHA, CI, deploy e o
   percurso público. Atualizar o ponto de continuação para o próximo bloco.

### Ponto de retomada — fechamento em 11/11/2026

- Oficina implementada e duas rotas jogadas nos três perfis com movimento
  normal. Três entregas antigas jogadas no desktop; ponte e retomada também
  no WebKit/iPhone e 320px. Resiliência antiga: quota, abas e dois toques passou.
- Suíte geral: **555 testes em 61 arquivos**, mais **9 contratos**, aprovados
  nesta rodada. Tipos e build local de produção também aprovados. Status do
  envio e dos checks remotos no registro separado de publicação.
- A entrada da segunda rota mantém alcance 280; só a recarga começa errada.
  A retomada não executa o rascunho silenciosamente. Soltura com modificador e
  pausa por `window.blur` foram verificadas no profiler isolado.
- O roteiro antigo foi adaptado para aceitar o evento de chegada durante
  `go`: diagnósticos de posição são amostrados, e o jogo para o loop ao vencer.
  No celular estreito o último X publicado podia anteceder a chegada real.
- **Desempenho permanece em investigação.** A amostragem sem Axe/capturas
  durante o intervalo confirmou gargalo de desenho no Canvas: desktop
  51–52 ms de média e WebKit Windows com perfil iPhone 269–275 ms, contra
  cerca de 16 ms na página vazia. Não tratar isso como desempenho de iPhone
  físico nem declarar que os engasgos acabaram.
- Baseline isolada preservada em
  `apps/web/test-results/orbi-pulse/frames-canvas-before.json`. O agente do
  motor prepara uma variante de imagens pré-rasterizadas para a escala da
  câmera, sem mudar a arte. Comparar usando `profile-orbi-frames.mjs`, um
  navegador por vez, antes de promover a variante. Não trocar renderer com
  base apenas em suposição.
- O Next local 3015 foi encerrado durante a suíte geral para liberar memória
  e reiniciado para as comparações e o percurso final. Não rodar navegador
  pesado e build juntos. Atualizar este ponto ao concluir a publicação.
- As duas rotas foram jogadas novamente nos três perfis após a troca da
  superfície estática, com os mesmos critérios funcionais aprovados. Nenhuma
  exceção JavaScript, violação Axe no escopo testado ou overflow horizontal.
- Ponte, elevador e farol também foram concluídos novamente no desktop com
  essa superfície final; save legado e journal de versão 2 preservados.
- O lint geral terminou sem erros e com 29 avisos em arquivos preexistentes
  e artefatos locais ignorados. O build manteve um aviso preexistente de tracing
  no endpoint de materiais de curso; os dois ajustes de tipos das variantes
  gráficas foram corrigidos antes do build aprovado.
- Próxima etapa de produto após a publicação: Bloco B, com leitura dos ataques,
  previsão antes de aplicar código e retomada que identifique a Oficina.
  Validar a fluidez no iPhone físico antes de ampliar a carga visual da aventura.

### Comparação de renderização — 11/11

O quadro abaixo registra amostras locais do mesmo trecho, com som, pulso e
pulos. Não há Axe nem captura durante a amostragem. São quatro janelas móveis
de 120 quadros por perfil, não o percentil da partida inteira.

| Variante | Chromium desktop, média por quadro | WebKit/Windows com perfil iPhone, média por quadro | Decisão |
| --- | --- | --- | --- |
| Canvas, antes das variantes de textura | 51–52 ms | 269–275 ms | Baseline local preservada |
| Fundo pré-rasterizado no viewport | 53–59 ms | 259–273 ms | Sem ganho consistente; não ativado em produção |
| Camada estática em canvas comum, sem readback | 53–56 ms | 267–274 ms | Mantida para evitar leitura/alocação desnecessária; sem alegar ganho no headless |
| WebGL forçado | 198–203 ms, backend informado SwiftShader | 274–292 ms | Não adotado como padrão |
| Header sem backdrop blur | Não medido | 274–281 ms | Não adotado; não resolveu o gargalo |

No navegador real do app, separado desses roteiros, a camada estática comum
foi observada em Canvas em cerca de **17–18 ms por quadro**, parado e caminhando;
WebGL ficou em torno de 25–26 ms. São observações de diagnóstico desse viewport
e computador, sem uma comparação controlada com o motor histórico. Elas não
provam 60 fps em todo aparelho nem desempenho de Safari/iPhone físico.

Produção continua em Canvas, com a arte original. A camada estática é pintada
só quando a geometria muda; física e desenho são interpolados separadamente.
As variantes de fundo e GPU ficam restritas ao desenvolvimento para reproduzir
os experimentos. Exemplo:

```powershell
$env:ORBI_PROFILE_QUERY='orbiRenderer=webgl-force'
$env:ORBI_PROFILE_LABEL='webgl-force'
node scripts/profile-orbi-frames.mjs
```

`orbiBackdrop=baked` testa o fundo; `orbiRenderer=auto` exige que o probe não
aponte uma ressalva importante de desempenho; `webgl-force` ignora essa
ressalva só no experimento. O backend informado pelo WebKit não identifica o
hardware de um iPhone físico. Remova as variáveis para voltar ao padrão.

**Próximo diagnóstico de desempenho:** testar a versão publicada no iPhone do
usuário e em um Android modesto; depois capturar perfil de update, desenho e
composição no trecho em que houver engasgo. Não acrescentar mais inimigos,
shaders ou downloads pesados para mascarar esse ponto. O resultado funcional
do jogo e o desempenho gráfico precisam continuar sendo avaliados separadamente.
