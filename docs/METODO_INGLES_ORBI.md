# Método de inglês com o Orbi

Decisão inicial e implementação em **13/11/2026**. O piloto de ouvir e repetir foi
publicado no commit `d798868`; o QA dessa entrega permanece registrado como
histórico abaixo. A etapa seguinte, **Usar o inglês no código**, acrescenta
escolhas de significado em contexto às mesmas 12 expressões. Está implementada
no repositório, com fluxo e layout verificados localmente. A verificação remota
de publicação é registrada separadamente no fechamento.
Em **14/11/2026**, a **Revisão curta por escrita** acrescenta tentativas de
lembrar de uma a três dessas expressões a partir da pista em português. Está
implementada e verificada localmente, com registro próprio de QA. A publicação
remota é conferida separadamente; os resultados de 13/11 permanecem históricos.
A correção de **14/11/2026**, solicitada pelo usuário após testar a revisão,
torna obrigatório o apoio escrito de pronúncia em português e acrescenta
presença animada do Orbi e cenário por capítulo. Essa rodada está em
implementação/validação; seu QA e sua publicação ainda não foram fechados.
Nenhuma das verificações anteriores atesta o layout novo, qualidade de áudio
em aparelho físico ou aprendizagem. A pesquisa inicial de 12/11 permanece em
[INGLES_FALADO.md](INGLES_FALADO.md).

## O que o aluno pratica

O piloto **Fale inglês com o Orbi** começa com seis palavras e passa a seis
frases curtas de programação. Cada item apresenta significado em português,
modelo em inglês, repetição acompanhada e uma vez sem a voz do Orbi. Uma cena
de arquivo, pasta, editor ou resultado ajuda a ligar a expressão ao uso.

O botão **Já repeti este item** registra participação declarada pelo aluno.
O navegador não escuta a tentativa, não a grava e não calcula nota de
pronúncia. Completar 12 itens significa ter registrado essa prática, sem
certificação de domínio, fluência ou proficiência.

## O que a referência realmente mostra

O vídeo enviado pelo usuário tem aproximadamente **7,546 segundos**. A
transcrição ASR local em
`docs/local/english-reference-20261113/transcript.json` registra:

| Intervalo aproximado | Idioma | Fala |
| --- | --- | --- |
| 0–2,6 s | Português | Como se fala estou bem em inglês? |
| 2,6–3,8 s | Inglês | I'm good. |
| 3,8–5,4 s | Português | Repita comigo. |
| 5,4–7,4 s | Inglês | I'm good. |

Há **duas falas em inglês**, intercaladas por pergunta e convite em português.
Os quadros mostram
“Estou bem”, depois “I'm good” e uma aproximação escrita como “Áime Gúd”.
O ASR é uma transcrição de apoio, não uma avaliação fonética nem comprovação
de eficácia pedagógica do anúncio.

Na entrega de **13/11**, o piloto aproveitou a sequência de significado, modelo
e repetição, mas não incorporou a aproximação escrita em português. Essa foi
uma omissão em relação ao que o usuário esperava da referência. Em **14/11**,
o usuário reafirmou que esse apoio é imprescindível em todo o ensino de inglês;
a decisão anterior de deixá-lo de fora foi superada.

A Orbitamos usa conteúdo, contexto visual e aproximações escritas próprios,
sem copiar a arte nem o áudio do anúncio. A fala continua usando a expressão
inglesa correta nas vozes disponibilizadas pelo aparelho; a aproximação em
português é um apoio visual, não texto enviado à síntese. O material de análise fica em `docs/local/`, fora do Git e da
mídia distribuída ao aluno.

<a id="apoio-pronuncia-20261114"></a>

## Apoio de pronúncia e presença do Orbi — correção de 14/11

**Estado desta rodada: implementada, com fluxos e conteúdo verificados localmente.**
A seção de QA própria registra os checks desta entrega; os resultados anteriores
não cobrem estas mudanças. A publicação é conferida separadamente após o push.

Todo **modelo de ensino** deve ligar quatro coisas: grafia inglesa correta,
significado em português, apoio aproximado de como falar e modelo sonoro em
inglês. Exemplos: **save → salvar → sêiv** e **file → arquivo → fáil**. O apoio
não substitui o inglês: o aluno continua escrevendo `save`, nunca `sêiv`,
quando a tarefa pede a expressão inglesa.

O catálogo autoral `apps/web/src/lib/englishPronunciation.ts` cobre as 12
expressões faladas e os alvos das oito cenas ilustradas, em 31 entradas de apoio
escrito. A síntese interativa permanece nos 12 itens do piloto em `#falar`;
as cenas e a revisão recebem apoio escrito nesta rodada, sem 31 novos controles
de áudio. Cada
entrada possui `text`, `guide`, segmentos alinhados `chunks` e uma dica `tip`.
`getEnglishPronunciation(text)` normaliza caixa, espaços e pontuação final;
expressões desconhecidas não recebem uma pronúncia inventada. Novas palavras
ou frases de ensino exigem conteúdo revisado nesse catálogo, além de cobertura
no teste de conteúdo.

`EnglishPronunciationGuide.tsx` é o componente compartilhado: a forma compacta
fica junto de alternativas, feedbacks e modelos já revelados. A forma completa
mostra o apoio e mantém segmentos/dicas sob demanda. A aproximação deve ter
texto real no HTML, com `lang="pt-BR"`, ao lado do modelo com `lang="en-US"`.

A regra respeita a tarefa. Na verificação de significado, a grafia inglesa e o
apoio de som podem aparecer sem a tradução que entrega a resposta. Na revisão
por escrita, **nenhum inglês ou apoio de pronúncia deve aparecer antes de
consultar o modelo ou acertar**. A cena `File not …` segue a mesma proteção até
abrir a pista ou completar a palavra. A retomada da Home conserva somente a
pista em português. Consultar continua sendo ajuda registrada, não um acerto
independente.

### Dez melhorias concretas desta rodada

1. **Apoio legível em português:** `save` vem acompanhado de `sêiv`; `file`, de
   `fáil`, mantendo a grafia correta como modelo de escrita.
2. **Um catálogo e um componente:** fala, situações, oito cenas e revisão usam
   a mesma fonte; novas expressões não dependem de transliteração automática.
3. **Frases por partes:** inglês e apoio têm segmentos correspondentes para
   ajudar a ensaiar uma frase sem perder a relação entre as palavras.
4. **Dicas específicas sob demanda:** sons como `th`, consoantes finais e
   sílabas mais fortes recebem uma orientação curta, sem empilhar explicações.
5. **Orbi com presença de fala:** boca e movimento acompanham eventos reais de
   início/fim da síntese; não ficam falando durante uma pausa ou após parar.
6. **Turno do aluno visível:** a fala do Orbi e a vez de repetir têm estados
   próprios. O personagem não finge escutar nem aprovar a voz do aluno.
7. **Cenário por capítulo:** palavras e frases têm ambientes/composição
   distintos; a troca de etapa muda a cena, sem acrescentar vídeo pesado.
8. **Conteúdo central no celular:** além do contexto de arquivo/editor, a vista
   se ajusta ao estágio de estudo quando o primeiro modelo inglês é apresentado,
   ao entrar no modo texto, reouvir só o inglês ou trocar de item no modo texto.
   Em até 760 px, o enquadramento usa `scrollIntoView`, margem superior de 76 px
   e `behavior: "instant"`; não acrescenta autoplay nem movimenta o foco por si.
   O objetivo é manter inglês e apoio de pronúncia juntos na área útil.
9. **Reouvir só o inglês:** um toque pode repetir a expressão correta sem
   reiniciar toda a pergunta e o convite em português. No celular, a mesma ação
   enquadra o estágio para o apoio não ficar perdido abaixo da dobra.
10. **Percurso consultável e compacto:** mapa, capítulo atual e progresso ajudam
    a localizar o aluno, mantendo a ação principal antes dos detalhes.

Essas mudanças são critérios de produto da rodada, não uma nota de qualidade,
uma comprovação de aprendizagem ou uma aprovação do usuário. A inspeção em
desktop e mobile pode exigir refinamentos antes do fechamento.

A primeira inspeção de capturas mostrou que o ambiente e os controles podiam
ocupar a vista enquanto o modelo/apoio ficava mais abaixo no celular. O
ajuste de enquadramento corrige esse fluxo, sem tentar resolver a posição
reduzindo a pronúncia a texto pequeno ou removendo o cenário. As novas
execuções verificaram os limites visíveis do inglês e do guia; os resultados
estão no fechamento de QA desta rodada.

Nas **oito cenas ilustradas**, esta rodada acrescenta cobertura de pronúncia,
preserva a tarefa e verifica o percurso; **não redesenha integralmente a
composição anterior**. Um próximo candidato é reduzir a altura de cena/história
antes das alternativas no mobile, preservando a ilustração útil e o contexto.
Não tratar a cobertura do apoio como aprovação estética completa dessas telas.

### Limites linguísticos e técnicos

As grafias de apoio são aproximações autorais para um brasileiro iniciante,
com referência americana. Não são IPA nem representam perfeitamente sons que
não existem iguais em português. Em `the`, por exemplo, `dâ`/`di` é uma pista;
a dica ensina a posição da língua, e o áudio continua sendo a referência.
Vozes de outras variedades podem soar diferentes. O catálogo também não
corrige uma tentativa de fala e não participa da validação da resposta escrita.

`OrbiSpeechCoach.tsx` usa a arte existente com uma boca animada sobreposta. É
uma indicação visual do turno de fala, **não sincronização fonema a fonema**,
um personagem 3D ou captura da voz do aluno. `spokenSpeech.ts` comunica a fala
real a partir dos eventos da síntese; parar, terminar, falhar ou trocar de tela
deve retirar esse estado. Movimento reduzido deve ser respeitado.

A rodada usa HTML/CSS, arte existente e síntese do aparelho. Não acrescenta
API paga, dependência de serviço de animação, endpoint de TTS, gravação,
microfone, migration ou nova regra de XP. Isso não promete voz offline nem
remove as condições existentes dos provedores de hospedagem.

## Roteiro autoral de cinco partes

`buildSpokenScript` produz cinco segmentos: **PT → EN → PT → EN → PT**.
As duas falas inglesas têm a expressão original completa; a última parte
convida o aluno a dizê-la sozinho, sem uma terceira reprodução inglesa.

| Parte | Exemplo com `file` | Pausa após a fala |
| --- | --- | --- |
| Pergunta em português | Como se diz arquivo em inglês? | 600 ms |
| Modelo em inglês | file | 1.000 ms |
| Convite em português | Agora repita comigo. | 300 ms |
| Modelo para repetir junto | file | 1.200 ms em palavras; 2.000 ms em frases |
| Convite para tentar sozinho | Agora tente sozinho. | Livre, até a ação do aluno |

As pausas começam depois do término da fala, pelo evento `onend`. O aluno
inicia a sequência por toque ou clique, pode interromper e pode ouvir de novo.
O inglês principal aparece quando chega o primeiro modelo; o significado em
português vem antes. Em **Praticar sem voz**, o modelo escrito permite ler e
repetir, mantendo a confirmação manual da participação.

O piloto oferece velocidade normal `0.9`, mais devagar `0.75` e escolha entre
as vozes inglesas que o navegador disponibilizar. Esses controles ajustam a
síntese; não analisam a voz do aluno. O roteiro e os valores são decisões do
piloto, sujeitos a revisão com alunos e áudio real.

## Conteúdo inicial

| Etapa | Inglês | Apoio em português |
| --- | --- | --- |
| Palavra 1 | file | arquivo |
| Palavra 2 | folder | pasta |
| Palavra 3 | code | código |
| Palavra 4 | save | salvar |
| Palavra 5 | run | executar |
| Palavra 6 | error | erro |
| Frase 1 | Open the file | Abra o arquivo |
| Frase 2 | Save the file | Salve o arquivo |
| Frase 3 | Run the code | Execute o código |
| Frase 4 | Fix the error | Corrija o erro |
| Frase 5 | The test passed | O teste passou |
| Frase 6 | The build failed | A geração do projeto falhou |

O conteúdo está em `apps/web/src/lib/spokenEnglish.ts`. Cada item tem ID,
tipo, expressão inglesa, significado português, contexto, cena e referência ao
apoio de pronúncia central. Palavras
vêm antes das frases no percurso; a seleção permite revisitar itens.

## Usar o inglês no código — etapa de 13/11

Depois de registrar que repetiu um item, o aluno pode escolher **Usar em uma
situação**. A tela final das 12 práticas também oferece a etapa contextual.
São 12 verificações opcionais, uma para cada palavra ou frase já apresentada;
esta rodada não amplia o vocabulário do piloto.

Cada verificação apresenta a expressão em inglês, uma situação curta de
programação e três alternativas em português sobre seu significado ou a ação
adequada. Há uma resposta correta para aquela situação. Por exemplo, diante
de **The test passed**, o aluno distingue o sucesso daquela verificação da
afirmação de que todo o projeto está sem erros.

`EnglishUseCheck.tsx` monta uma cena própria, `WorkScene`, com HTML e ícones de
editor, árvore de arquivos ou terminal, conforme os dados do item. O arquivo,
o resultado e a situação devem contar a mesma história. Essa cena não é uma
captura de execução real. O cartão anterior com a tradução em português, seu
contexto e o seletor de estudo ficam fora da tela enquanto a verificação está
aberta: o significado só é explicado depois da escolha.

O feedback é específico para cada alternativa. Uma escolha incorreta oferece
uma explicação e permite tentar outra opção; não retira um acerto já
registrado. Uma escolha correta registra aquela situação, mantém o feedback
visível e libera **Próximo item**, que retorna à prática de fala do item
seguinte. **Voltar à fala** encerra a verificação sem exigir acerto. O aluno
pode revisitar as situações.

O contador significa **situações em que houve uma escolha correta**, inclusive
depois de uma pista ou nova tentativa. É reconhecimento guiado de sentido:
não mede fala, produção espontânea, retenção depois de um intervalo,
pronúncia, fluência ou domínio. O registro permanece separado das 12
participações declaradas no modo de ouvir e repetir.

O conteúdo e a correção estão em `apps/web/src/lib/englishUse.ts`; a interface,
em `apps/web/src/components/games/EnglishUseCheck.tsx`. Não foi acrescentada API
de voz, microfone, gravação ou serviço pago para esta etapa.

<a id="revisao-curta-por-escrita"></a>

## Revisão curta por escrita — etapa de 14/11

Depois de registrar participação em pelo menos um item falado, o aluno encontra
**Revisão curta** no cabeçalho da prática. A revisão usa de uma a três expressões
do mesmo conjunto de 12, escolhidas somente entre os IDs de `spoken.completed`.
Uma escolha contextual correta, sozinha, não torna um item elegível. A fila
prioriza os itens ainda sem histórico de revisão; depois, os de `history.lastAt`
mais antigo. Empates seguem a ordem fixa do conteúdo. Essa seleção é
determinística; não calcula intervalo, vencimento ou agenda e não implementa
um algoritmo de repetição espaçada.

Cada item começa com a pista em português e um campo vazio para escrever a
palavra ou frase praticada. A expressão inglesa não aparece antes da tentativa,
a menos que o aluno abra **Ver modelo**. Nesse caso, o apoio aparece acima do
campo e a consulta fica registrada para este item. O corretor compara apenas
com a expressão da aula: normaliza Unicode NFKC, maiúsculas/minúsculas, espaços
nas extremidades e entre palavras e os sinais finais `.`, `!` e `?`. Não avalia
todas as traduções possíveis nem corrige inglês geral.

Uma resposta diferente permite tentar de novo ou consultar o modelo e não
registra acerto. A resposta correspondente registra uma única conclusão para
o item na sessão, com `helped` indicando se o modelo foi consultado. O feedback
fica visível, o campo deixa de receber edição e o foco sai dele; o aluno avança
manualmente em **Próxima expressão** ou **Ver como foi**. Conferir novamente,
recarregar ou avançar não deve contar a mesma resposta outra vez.

O resumo final distingue os itens feitos **sem abrir o modelo** e **com apoio
do modelo nesta revisão**. Esses números descrevem o uso do apoio dentro da
sessão, inclusive após novas tentativas; não são medida de pronúncia, fluência,
retenção posterior ou domínio. **Outra revisão curta** escolhe uma nova fila
com os mesmos critérios. Não há vocabulário novo, microfone, gravação, serviço
pago ou XP nesta etapa. O domínio está em `englishReview.ts`; a tela, em
`EnglishReview.tsx`, sob coordenação de `EnglishWorkshop.tsx`.

## Princípios pedagógicos e limites da evidência

Fontes primárias conferidas em **13/11/2026** orientam a decisão de acrescentar
uma tentativa de reconhecer o sentido e feedback depois da repetição:

- [Karpicke e Roediger, 2008 — The Critical Importance of Retrieval for Learning](https://doi.org/10.1126/science.1152408):
  em um experimento com pares de vocabulário de língua estrangeira, recuperar
  repetidamente a resposta favoreceu a lembrança posterior em comparação às
  condições sem essa recuperação repetida. O estudo usou produção de resposta,
  que exige mais que escolher entre três alternativas.
- [Butler, 2010 — Repeated testing produces superior transfer of learning relative to repeated studying](https://pubmed.ncbi.nlm.nih.gov/20804289/):
  quatro experimentos com textos encontraram vantagens de testes repetidos
  sobre reestudo para retenção e respostas a perguntas novas uma semana depois.
  Isso fundamenta experimentar o conteúdo em outra pergunta ou situação, sem
  presumir transferência geral para tarefas profissionais.
- [Butler e Roediger, 2008 — Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing](https://pubmed.ncbi.nlm.nih.gov/18491500/):
  feedback com a resposta correta melhorou a lembrança e reduziu a reprodução
  posterior de alternativas incorretas, em comparação à condição sem feedback.
  Por isso, o erro recebe uma explicação útil e oportunidade de nova tentativa.

A aplicação desses resultados ao Orbi é uma **inferência de desenho**, não
validação do anúncio, deste roteiro de áudio ou da eficácia do aplicativo.
Os experimentos não compararam este piloto com repetição oral. Uma resposta
imediata entre três opções pode ocorrer por reconhecimento ou acaso, e uma
nova tentativa depois da pista também contém apoio. A revisão escrita de 14/11
acrescenta produção da expressão e separa a consulta ao modelo nesta sessão;
isso não transforma esses registros em evidência de retenção. Para investigá-la,
seria necessário observar uma tentativa posterior sem o modelo e definir um
procedimento próprio. Essa medição ainda não foi implementada nem executada.

## Voz, custo e limites do aparelho

A síntese usa `window.speechSynthesis` e `SpeechSynthesisUtterance` no cliente.
Não foi contratada API de voz, criado endpoint TTS ou acrescentado custo de
API de voz à Orbitamos. O piloto não usa microfone, `MediaRecorder`,
`SpeechRecognition`, modelo ASR ou avaliação de pronúncia.

As vozes são fornecidas pelo navegador/sistema. A lista vem de
[`getVoices()`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
e pode mudar via `voiceschanged`. O campo
[`localService`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)
identifica serviço local ou remoto; uma voz remota pode depender de rede.
Por isso, a ausência de uma API contratada pela Orbitamos não garante áudio
offline, ausência de tráfego do serviço do aparelho, disponibilidade contínua
ou qualidade uniforme.

O controlador mantém uma fala por vez, aguarda `onend` e cancela a reprodução
ao parar, trocar de item, sair ou interromper a tela. Há proteção contra
callbacks atrasados e fala sem resposta. Falta de suporte, erro ou ausência
de voz não registra prática automaticamente: a interface oferece o texto e
o aluno confirma a participação separadamente.

O custo de voz deve ser separado do custo e da elegibilidade da hospedagem.
O [Vercel Hobby](https://vercel.com/docs/plans/hobby) tem condições próprias;
os [Termos da Vercel, seção Hobby Plan](https://vercel.com/legal/terms#hobby-plan)
limitam o uso do plano a finalidade pessoal ou não comercial. Essa restrição
não é resolvida pela síntese no cliente. Este documento não verifica o plano
ativo nem a elegibilidade da Orbitamos e não autoriza alteração de plano.

## Entrada, save e retomada

- Rota real: `/estudante/jogos/ingles-em-cena#falar`.
- Prévia: `/dev/academy-preview?activity=english#falar`.
- A rota sem `#falar` mantém as oito cenas anteriores de imagens, vocabulário
  e código. A navegação permite alternar os dois modos sem novo item na sidebar.
- `speakingSaveKey(conta)` gera uma chave v1 própria, com tipo e identificador
  da conta codificados. O save guarda apenas `current`, IDs de `completed` e
  `attempts`, além da versão. Não contém áudio, transcrição ou nota.
- `englishUseKey(conta)` gera `orbitamos-english-use-v1-<tipo>-<conta codificada>`.
  Seu save guarda `{ version: 1, current, active, completed, attempts }`.
  `completed` contém os IDs de situações com alguma escolha correta e
  `attempts` conta escolhas válidas, certas ou erradas. `active: true` mantém
  a verificação atual aberta ao recarregar; a seleção e o feedback temporários
  não são salvos. **Voltar à fala** e **Próximo item** deixam `active: false`.
  A normalização aceita apenas itens conhecidos; a mesclagem preserva os
  acertos anteriores. Falha de armazenamento é informada separadamente.
- `englishReviewKey(conta)` gera
  `orbitamos-english-review-v1-<tipo>-<conta codificada>`, distinguindo, por exemplo,
  uma conta numérica de outra textual com os mesmos caracteres. O save guarda
  `{ version: 1, active, session?, history }`. A sessão contém a fila fixa `ids`,
  `cursor`, `draft`, `consulted` e os `results` sequenciais `{ lessonId, helped }`.
  O histórico por item contém `reviews`, `helped` e `lastAt`; ele não aumenta a
  elegibilidade além da participação falada. O leitor limita o tamanho e aceita
  apenas uma sessão coerente com um a três IDs conhecidos. Uma sessão inválida
  deixa de estar ativa, preservando as entradas válidas do histórico.
- A revisão ativa com sessão válida retoma a mesma fila, campo e consulta ao
  modelo depois de recarregar, inclusive o acerto aguardando avanço ou o resumo
  final. **Voltar à fala** deixa `active: false` e conserva a sessão; reabrir
  uma fila inacabada mantém seu estado se todos os itens continuarem elegíveis.
  Uma sessão concluída só muda de fila ao começar outra revisão.
- O save antigo `orbitamos-english-v1-<conta>`, o journal e o XP são preservados.
  A prática oral não completa as oito cenas, não aumenta o catálogo de seis
  experiências e não entra nos agregados como outra atividade concluída.
  As escolhas contextuais e a revisão escrita também não concedem XP nem mudam
  esses registros.
- A Home projeta uma retomada separada somente se o índice aponta para o
  endereço exato com `#falar`. Uma revisão ativa com sessão válida tem prioridade:
  `english-review` mostra `results.length` de `ids.length` **expressões nesta
  revisão**, com pista somente em português, sem revelar o modelo inglês. O
  status só fica concluído após o avanço final (`cursor === ids.length`), mesmo
  que a última resposta já tenha sido registrada. Na ausência dessa revisão,
  `english-use` ativo mostra os acertos contextuais; caso contrário,
  `spoken-english` mostra de 0/12 a 12/12 participações na fala. A Home não lê
  essas chaves para outras retomadas ou rotas sem o hash exato.
- Depois de 12 itens, a tela final oferece usar o inglês em uma situação,
  repetir a prática ou abrir a atividade anterior de imagens e código na
  rota-base. A etapa contextual continua no modo `#falar`.

Os módulos não acessam APIs do navegador ao serem importados. `CodeEnglish.tsx`
carrega `EnglishWorkshop.tsx` sob demanda apenas em `#falar`; esse componente
alterna a prática de fala/contexto e a revisão, sem novo item na sidebar.
Ao desmontar a prática de fala para abrir a revisão, o controlador cancela TTS
e invalida callbacks atrasados. `spokenSpeech.ts` concentra fila, seleção de
voz e cancelamento.

O wrapper mantém em memória o `EnglishStudySnapshot`, com os estados `speaking`
e `contextual`, para preservar os dois ao abrir e fechar a revisão mesmo quando
o navegador bloqueia a escrita no armazenamento. A revisão também continua em
memória e mostra a falha de persistência. Essa proteção vale durante a tela
aberta: recarregar ou fechar com gravação bloqueada pode perder o estado que
não foi salvo. Os saves são locais ao navegador e à conta, sem sincronização
entre aparelhos.

## Continuidade do dicionário de programação

O piloto de 12 itens é o primeiro conjunto. As expansões abaixo são planejamento,
não conteúdo já disponível:

1. **Editor e terminal:** abrir, salvar, executar, instalar, arquivo, pasta,
   comando e caminho, sempre ligados a uma cena concreta.
2. **Erros e verificações:** entender mensagens curtas de teste, build, conexão
   e arquivo ausente; escolher o significado antes de revelar a resposta.
3. **Trabalho em equipe:** pedir ajuda, explicar um bug, solicitar revisão e
   dizer o que foi testado, em diálogos curtos de ida e volta.
4. **Situações do simulador:** ler um chamado, explicar uma mudança e comunicar
   recuperação, usando o contexto das missões de trabalho da Academy.

Cada conjunto deve passar de palavra a frase e depois a uso em contexto. A
etapa opcional de 13/11 inicia essa passagem e a revisão escrita de 14/11
acrescenta uma tentativa de lembrar das mesmas 12 expressões, sem entregar os
conjuntos futuros acima. Repetir o som, escolher um significado e escrever a
expressão são registros diferentes; nenhum deles comprova compreensão geral
ou uso independente. Antes de ampliar o catálogo, conferir voz e ritmo em aparelhos
reais e observar um iniciante usando os 12 itens e as situações. Registrar as
dificuldades neste documento para que a próxima rodada continue do resultado
observado.

<a id="qa-da-rodada--13112026"></a>

## QA do piloto de ouvir e repetir — 13/11/2026, histórico

Os resultados abaixo pertencem ao piloto publicado em `d798868`. Eles não
cobrem o incremento posterior **Usar o inglês no código**.

Verificações executadas em série com Node 24, preservando a memória do PC:

| Verificação | Resultado |
| --- | --- |
| Suíte Vitest completa, um worker | 682 testes aprovados em 68 arquivos |
| Contratos de segurança e operação | 9 aprovados |
| Chromium desktop 1440 × 1000 | 12 verificações; 7 estados capturados |
| WebKit com perfil iPhone 13 | 11 verificações; 7 estados capturados |
| Chromium com toque, 320 × 740 | 11 verificações; 7 estados capturados |
| Lint completo | Zero erros; 29 avisos preexistentes |
| Build de produção, incluindo TypeScript | Aprovado |
| Áudio audível, ritmo e vozes em iPhone/Android físicos | Pendente |
| Compreensão e ritmo com aluno iniciante | Pendente |

As capturas de desktop e mobile foram inspecionadas. O botão de início foi
trazido para o topo do quadro após a primeira captura mostrar que ficava fora
da primeira dobra do celular. A auditoria passou a conferir sua posição na
viewport inicial. Contraste e semântica da indicação de áudio foram corrigidos.

Nos três perfis, os sete estados passaram sem violações Axe no escopo novo,
sem overflow, sem erros de página e sem pedidos RPC/API de voz da aplicação.
O roteiro verifica as cinco falas, confirmação manual, erro, fallback sem API,
interrupção, callbacks atrasados, recarga e retomada exata. Os 12 registros foram
obtidos pela interface, sem preencher um save de conclusão na fixture. O caso
entre abas no desktop confirma cancelamento quando outra aba registra prática
com os 12 itens já obtidos pela interface. A escolha de voz inglesa de outra
variante, como EN-GB na presença de EN-US, também tem teste unitário.

A atividade antiga de imagens/código voltou a abrir pela ação final, com save,
journal e XP preservados. As chaves por conta têm testes unitários; a prévia
usa conta fixa e não comprova troca de conta autenticada em produção.

O roteiro `apps/web/scripts/audit-spoken-english.mjs` usa síntese simulada.
Esses resultados não demonstram que uma voz real soou bem, que funciona offline
ou que o aluno aprendeu. Evidências locais ficam em
`apps/web/test-results/spoken-english/` e
`docs/local/spoken-english-20261113/`, fora do Git. Commit, CI e deploy devem ser
conferidos pelo SHA após o push; o relatório remoto da rodada fica em
`docs/local/spoken-english-20261113/production-verification.json`.
Comandos e escopo em [TESTES_AUTOMATIZADOS.md](TESTES_AUTOMATIZADOS.md).

## QA do incremento de uso em contexto — 13/11/2026

Registro histórico do incremento publicado em `d3d9eda`. Os resultados abaixo
não cobrem a revisão escrita de 14/11 nem as mudanças de coordenação da tela.

| Verificação | Resultado local |
| --- | --- |
| Suíte Vitest completa, um worker | 697 testes em 69 arquivos aprovados |
| Contratos de segurança/operação | 9 aprovados |
| Lint dos sete arquivos TS/TSX/MJS alterados | Zero erros e avisos |
| Regeneração de tipos Next e TypeScript | Aprovados com servidor local parado |
| Chromium desktop 1440 × 1000 | 11 verificações; 5 estados capturados |
| WebKit/iPhone 13 | 11 verificações; 5 estados capturados |
| Chromium com toque, 320 × 740 | 11 verificações; 5 estados capturados |
| Regressão da prática de voz no desktop | 12 verificações; 7 estados capturados |
| Build de produção, incluindo TypeScript | Aprovado |

Os três perfis passaram sem violações Axe no escopo novo, overflow, erros de
página ou chamadas proibidas de RPC/voz. As capturas reais foram inspecionadas.
O primeiro teste de iPhone mostrou a primeira alternativa parcialmente fora da
dobra; os espaços do layout mobile foram reduzidos, preservando a cena, a fonte
e as áreas de toque. O perfil repetido passou com a alternativa inteira visível.

As 12 participações e escolhas foram obtidas pela interface. O roteiro inclui
alternativa errada seguida de explicação e acerto, retorno à fala, cancelamento
com callbacks atrasados, ausência de síntese e microfone, recarga ativa, retomada
pela Home com zero acertos e preservação dos saves anteriores/journal/XP. A
recarga pede nova escolha na pergunta retomada, sem preselecionar uma resposta
ou reproduzir áudio. A conta fixa da prévia não exercita troca de usuário
real autenticado; isolamento por chave também está coberto nos testes unitários.

Uma checagem inicial encontrou caudas duplicadas em dois arquivos gerados de
`.next/dev/types/`. O servidor foi parado; somente esses artefatos foram
removidos e os tipos regenerados. `next typegen` e `tsc --noEmit` passaram.
Os logs da falha e da checagem limpa foram mantidos para auditoria.

Evidências ficam em `apps/web/test-results/english-use/` e
`docs/local/english-use-20261113/`, fora do Git. Commit, CI e deploy são conferidos
pelo SHA após o push; o relatório remoto fica em
`docs/local/english-use-20261113/production-verification.json`. A qualidade da
voz em aparelhos físicos e a observação de aprendizagem com iniciantes continuam
pendentes. Síntese simulada, múltipla escolha e testes técnicos não demonstram
pronúncia correta, retenção ou eficácia pedagógica do produto.


<a id="qa-revisao-curta-20261114"></a>

## QA da revisão curta por escrita — 14/11/2026

| Verificação | Resultado local |
| --- | --- |
| Core e retomada da Home | 58 testes focais aprovados |
| Chromium desktop 1440 × 1000 | 13 verificações; 6 estados capturados |
| WebKit/iPhone 13 | 12 verificações; 6 estados capturados |
| Chromium com toque, 320 × 740 | 12 verificações; 6 estados capturados |
| Regressão da fala no desktop | 12 verificações; 7 estados capturados |
| Regressão das situações no desktop | 11 verificações; 5 estados capturados |
| Suíte Vitest completa, um worker | 718 testes em 70 arquivos aprovados |
| Contratos de segurança/operação | 9 aprovados |
| Tipos Next e TypeScript | Aprovados com servidor local parado |
| Lint dos arquivos alterados (rodadas focais) | Sem erros ou avisos após os ajustes |
| Build de produção, incluindo TypeScript | Aprovado |

As capturas reais foram inspecionadas. Campo e botão de conferência couberam
na primeira dobra dos três perfis; o modelo consultado ficou antes do campo.
Os 18 estados da revisão passaram sem violações Axe no escopo novo, overflow,
erros de página ou chamadas proibidas. A remoção de foco após acerto foi
verificada no DOM; o teclado físico de um iPhone não foi simulado.

As participações que dão elegibilidade e as respostas foram obtidas pela
interface. O roteiro inclui erro sem revelar o modelo, Enter, caixa/pontuação,
rascunho e modelo após recarga/Home, fila e rotação, resumo com/sem consulta,
encerramento/reabertura, ausência de síntese, cancelamento de fala e callbacks
atrasados. Os saves anteriores, contexto, journal e XP foram preservados.

Na falha simulada de gravações, a fala e um acerto contextual permaneceram em
memória ao entrar e sair da revisão. O aviso de que o salvamento falhou também
permaneceu visível no retorno: não se promete persistência após recarga. O
snapshot usa estado React e inclui os dois registros e seus avisos; o lint
inicial identificou uma leitura de ref no render, corrigida antes dos testes.

A conta fixa da prévia não exercita troca real de usuário autenticado. Chaves,
normalização, sessão e história são cobertas por testes unitários. Os resultados
não demonstram fluência, retenção após intervalo ou eficácia do produto.

Evidências ficam em `apps/web/test-results/english-review/` e
`docs/local/english-review-20261114/`, fora do Git. CI, commit e deploy são
conferidos após o push no relatório local
`docs/local/english-review-20261114/production-verification.json`. Os 697 testes
e `d3d9eda` na seção anterior continuam como histórico do incremento de 13/11.


<a id="qa-pronuncia-20261114"></a>

## QA da correção de pronúncia e presença — 14/11/2026

Não reutilizar os 718 testes, as capturas ou o deploy `19454cd` da revisão
escrita como comprovação desta interface. As verificações próprias desta rodada
foram executadas em série, com o Next parado antes de tipos e build:

| Escopo | Resultado local |
| --- | --- |
| Catálogo de pronúncia e conteúdo falado | 13 testes focais aprovados |
| Runtime de síntese e eventos de fala | 37 testes focais aprovados |
| Oficina falada, Chromium desktop 1440 × 1000 | 8 verificações e 9 estados capturados; aprovado |
| Oficina falada, WebKit/iPhone 13 | 8 verificações e 9 estados capturados; aprovado |
| Oficina falada, Chromium 320 × 740 com toque | 8 verificações e 9 estados capturados; aprovado |
| Oito cenas, Chromium desktop | 9 verificações e 6 estados capturados; aprovado |
| Oito cenas, Chromium 320 px | 9 verificações e 6 estados capturados; aprovado |
| Regressão da fala no desktop | 12 verificações e 7 estados; aprovado |
| Regressão do uso contextual no desktop | 11 verificações e 5 estados; aprovado |
| Regressão da revisão escrita no desktop | 13 verificações e 6 estados; aprovado |
| Suíte Vitest completa, um worker | 731 testes em 71 arquivos aprovados |
| Contratos de segurança/operação | 9 aprovados |
| Tipos Next e TypeScript | Aprovados |
| Lint dos arquivos alterados, rodadas focais | Sem erros ou avisos |
| Build de produção, incluindo TypeScript | Aprovado |

Os 39 estados dos dois roteiros novos passaram sem violações Axe no escopo,
overflow, erros de página ou chamadas proibidas. As capturas principais de
desktop, iPhone emulado e 320 px foram inspecionadas. As oito cenas foram
concluídas pela interface; o resumo conferiu seis termos com apoio e a consulta
na palavra ausente não preencheu o campo. As regressões preservaram progresso,
retomada, cancelamento e o caso de falha de storage.

A primeira execução encontrou rótulos ARIA em elementos genéricos do mapa,
corrigidos com papéis e item atual explícitos. O teste de iPhone revelou duas
questões de fluxo: a ação inicial estava baixa e, depois de iniciar, o modelo
ficava fora da área visível. A reprodução foi trazida para o topo do quadro e
o enquadramento mobile passou a apresentar inglês e apoio juntos. As novas
execuções conferiram os limites desses dois elementos, mantendo a cena e sem
focar o campo ou abrir teclado. Movimento reduzido, ausência de síntese e
callbacks antigos também foram exercitados; a animação usa eventos simulados
da API de voz, não uma gravação validada em aparelho físico.

Roteiros e resultados locais ignorados:

- `apps/web/scripts/audit-pronunciation-english.mjs`: oficina de fala, guia,
  personagem, contexto, revisão e fallback; resultados em
  `apps/web/test-results/english-pronunciation/`.
- `apps/web/scripts/audit-english-scenes-pronunciation.mjs`: oito cenas,
  recuperação e glossário; resultados em
  `apps/web/test-results/english-scenes-pronunciation/`.

Os dois aceitam `desktop`, `iphone` e `small` e devem rodar em série. Comandos
estão em [TESTES_AUTOMATIZADOS.md](TESTES_AUTOMATIZADOS.md).

Critérios de conferência: apoio para as 12 expressões e os alvos das oito cenas;
EN real nos segmentos de áudio; modelo/apoio ausente antes de consulta ou acerto
na escrita; boca ativa somente durante a fala real; pausa, cancelamento, falha
e callbacks atrasados; botão de reouvir; troca de capítulo/mapa; movimento
reduzido; primeira dobra, overflow, toque e contraste em desktop, WebKit/iPhone
e 320 px; preservação de saves, elegibilidade, rascunho, journal e XP.

Áudio audível, teclado e desempenho em iPhone físico continuam pendentes até
uma verificação real. Emulação, dublê de síntese e testes de conteúdo não
comprovam pronúncia, retenção, eficácia pedagógica ou sincronização fonética.

## Fontes conferidas nesta decisão

Consulta de **13/11/2026**, separada das fontes históricas de 12/11:

- [MDN — SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis):
  interface de controle da síntese de fala.
- [MDN — getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices):
  vozes disponíveis e atualização da lista.
- [MDN — localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService):
  distinção entre serviço local e remoto.
- [Vercel — Hobby](https://vercel.com/docs/plans/hobby) e
  [Termos — Hobby Plan](https://vercel.com/legal/terms#hobby-plan): condições
  do plano, separadas da decisão de síntese de voz no cliente.

### Referências de pronúncia — consulta de 14/11/2026

A edição das aproximações foi informada por pronúncias americanas do
[Cambridge: file](https://dictionary.cambridge.org/us/dictionary/english/file),
[save](https://dictionary.cambridge.org/pronunciation/english/save),
[the](https://dictionary.cambridge.org/pronunciation/english/the),
[return](https://dictionary.cambridge.org/pronunciation/english/return) e pelos
outros verbetes listados no registro local de fontes. As frases e os apoios
em português são redação autoral; não se copiou áudio de dicionário.

As terminações regulares foram conferidas no
[British Council](https://learnenglishteens.britishcouncil.org/sites/teens/files/gs_past_simple_-_regular_verbs.pdf),
e o gesto articulatório de `th` na
[BBC Learning English](https://downloads.bbc.co.uk/learningenglish/eiam/unit-2/210220_pronunciation_of_th.pdf).
Essas fontes orientam o conteúdo sonoro; não validam a eficácia das grafias de
apoio. Fontes, limitações de acesso e convenções ficam em
`docs/local/english-pronunciation-20261114/content-sources.md`, fora do Git.
