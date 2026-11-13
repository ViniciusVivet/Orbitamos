# Método de inglês com o Orbi

Decisão e implementação do piloto em **13/11/2026**. Estado: implementado no
repositório, com fluxo e layout verificados localmente. Este registro não atesta
publicação nem qualidade de áudio em aparelho físico. A pesquisa inicial de
12/11 permanece em [INGLES_FALADO.md](INGLES_FALADO.md).

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

O piloto aproveita a sequência de significado, modelo e repetição. Não usa a
arte nem o áudio do anúncio e não incorpora a aproximação aportuguesada.
O conteúdo e o contexto visual são próprios da implementação da Orbitamos;
a fala usa as vozes disponibilizadas pelo aparelho. O material de análise fica em `docs/local/`, fora do Git e da
mídia distribuída ao aluno.

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
tipo, expressão inglesa, significado português, contexto e cena. Palavras
vêm antes das frases no percurso; a seleção permite revisitar itens.

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
- O save antigo `orbitamos-english-v1-<conta>`, o journal e o XP são preservados.
  A prática oral não completa as oito cenas, não aumenta o catálogo de seis
  experiências e não entra nos agregados como outra atividade concluída.
- A Home projeta uma retomada separada `spoken-english` somente se o índice
  aponta para o endereço exato com `#falar`. O progresso de 0/12 a 12/12 indica
  participação. A Home não lê esse save para outras retomadas.
- Depois de 12 itens, a próxima ação abre a atividade anterior na rota-base.
  Antes disso, a retomada continua em `#falar`.

Os módulos não acessam APIs do navegador ao serem importados. A UI e a voz
são carregadas no cliente; `spokenSpeech.ts` concentra fila, seleção de voz e
cancelamento. O save é local ao navegador e à conta, sem sincronização entre
aparelhos. Falha de armazenamento deve permanecer visível ao aluno.

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

Cada conjunto deve passar de palavra a frase e depois a uso em contexto. Repetir
o som não comprova compreensão: a expansão deve incluir recuperação do significado
e aplicação em situações diferentes, aproveitando o modo de imagens e código.
Antes de ampliar o catálogo, conferir voz e ritmo em aparelhos reais e observar
um iniciante usando os 12 itens. Registrar as dificuldades neste documento para
que a próxima rodada continue do resultado observado.

## QA da rodada — 13/11/2026

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
