# Inglês falado na Orbitamos

Pesquisa inicial em **12/11/2026**, preservada abaixo. O piloto de ouvir e
repetir, de **13/11/2026**, teve fluxo e layout verificados localmente e foi
publicado no commit `d798868`. A etapa seguinte, **Usar o inglês no código**,
está implementada no repositório, com QA local e verificação de publicação
registrados separadamente. Microfone, gravação, transcrição e avaliação de pronúncia
continuam fora desta implementação. Este documento complementa o
[Simulador de profissões](SIMULADOR_PROFISSOES.md).
Em **14/11/2026**, a **Revisão curta por escrita** acrescenta sessões de uma a
três expressões já praticadas na fala. Está implementada e verificada
localmente, com QA próprio; os resultados de 13/11 permanecem históricos.

## Decisão implementada em 13/11

**Fale inglês com o Orbi** tem 12 itens: seis palavras, depois seis frases de
programação. Usa síntese de fala do navegador, sem API de voz contratada pela
Orbitamos, microfone ou nota automática. O aluno ouve e repete uma sequência
de cinco partes: pergunta em português, modelo em inglês, convite em português,
modelo para repetir junto e convite para tentar sozinho. A confirmação do
aluno registra participação; não comprova pronúncia ou proficiência.

A análise da referência de 7,546 s identificou **duas** falas inglesas, com
pergunta e convite em português entre elas. O piloto usa essa organização,
com conteúdo próprio e turno independente ao final; não usa arte, áudio nem
aproximação aportuguesada do anúncio. Transcrição, intervalos, conteúdo dos
12 itens e pausas estão em [METODO_INGLES_ORBI.md](METODO_INGLES_ORBI.md).

A entrada é `/estudante/jogos/ingles-em-cena#falar`; a prévia é
`/dev/academy-preview?activity=english#falar`. O modo anterior de oito cenas
continua na rota-base, com seu save preservado. A prática falada tem save
próprio por conta e retomada separada na Home, sem aumentar as seis atividades
ou gerar conclusão/XP da atividade antiga.

Vozes podem ser locais ou remotas, conforme o navegador/aparelho; não há
garantia de áudio offline, qualidade uniforme ou correção automática. A rota
de texto mantém a prática utilizável sem voz. O custo de síntese no cliente
também não altera as condições da hospedagem: Vercel Hobby tem restrição de uso
pessoal ou não comercial. As fontes atuais e os limites constam no
[método](METODO_INGLES_ORBI.md#voz-custo-e-limites-do-aparelho).

## Continuidade de 13/11 — Usar o inglês no código

A nova etapa acrescenta uma verificação opcional depois da repetição de cada
item, com acesso também pela tela final das 12 práticas. Reutiliza as mesmas
seis palavras e seis frases, sem ampliar o vocabulário. O aluno vê a expressão
inglesa numa cena própria de editor, arquivos ou terminal e escolhe entre
três alternativas em português sobre significado ou ação. O cartão de estudo
com tradução e seu contexto ficam fora da tela durante a verificação.

Cada escolha recebe feedback específico. O erro permite tentar outra opção
e preserva os acertos já registrados. O contador registra situações em que
houve uma escolha correta, inclusive após uma pista: é reconhecimento guiado
de sentido, sem nota de fala, comprovação de retenção ou certificação de domínio.

O save `orbitamos-english-use-v1-<tipo>-<conta codificada>` é separado da
participação na fala e da atividade antiga de leitura/imagens. Guarda versão,
item atual, estado `active`, IDs com escolha correta e contagem de tentativas;
não altera journal ou XP. `active` permite reabrir a situação depois de
recarregar e pela retomada exata em `ingles-em-cena#falar`. Voltar à fala ou
seguir para o próximo item encerra esse estado. Não há sincronização entre
aparelhos, nova API, microfone ou serviço pago nesta etapa.

A decisão acrescenta uma tentativa de reconhecer o significado e receber
feedback, orientada por estudos de
[recuperação de vocabulário](https://doi.org/10.1126/science.1152408),
[aplicação em perguntas novas](https://pubmed.ncbi.nlm.nih.gov/20804289/) e
[feedback em múltipla escolha](https://pubmed.ncbi.nlm.nih.gov/18491500/),
conferidos em 13/11. Aplicar esses princípios ao Orbi é uma inferência de
desenho: os estudos não validam o anúncio nem este piloto e não demonstram
que a etapa supera a repetição oral. O método detalha essas diferenças, o
contrato dos saves e o [QA separado do incremento](METODO_INGLES_ORBI.md).

## Continuidade de 14/11 — Revisão curta por escrita

**Revisão curta** aparece no cabeçalho depois da primeira participação falada.
O aluno recebe a pista em português e tenta escrever uma das expressões da
aula, podendo consultar o modelo. Não há novo vocabulário: cada fila reúne
de um a três itens somente de `spoken.completed`, priorizando os ainda sem
revisão e depois o registro `history.lastAt` mais antigo, com desempate pela
ordem fixa do conteúdo. Não há cálculo de intervalos, vencimentos ou agenda
de repetição espaçada.

A comparação normaliza NFKC, caixa, espaços e pontuação final `.`, `!` e `?`;
aceita a expressão praticada, sem avaliar todas as traduções possíveis. O erro
permite tentar novamente. O acerto registra o item uma vez e se houve consulta
ao modelo, mantém o feedback e aguarda avanço manual. O resumo distingue os
itens escritos com e sem abrir o modelo nesta revisão; não mede pronúncia,
fluência ou retenção posterior.

O save separado `orbitamos-english-review-v1-<tipo>-<conta codificada>` guarda
estado ativo, fila, cursor, rascunho, consulta, resultados e histórico por item.
A recarga retoma uma sessão ativa válida, inclusive o resumo final. Na Home,
essa retomada tem prioridade sobre uso em contexto e fala no endereço exato
`#falar`, mostra o progresso de uma a três expressões e somente a pista em
português. Fechar deixa a revisão inativa e preserva o histórico. Não modifica
o catálogo de seis experiências, os saves anteriores, journal ou XP.

`EnglishWorkshop.tsx` é carregado apenas em `#falar` e alterna fala/contexto e
revisão. A saída da prática de fala cancela a síntese e seus callbacks atrasados.
O componente conserva em memória os estados de participação e escolhas
contextuais durante essa troca se o armazenamento bloquear a escrita. A falha
continua visível; não há garantia de recuperação depois de recarregar ou fechar
nessa condição. Não há nova API paga, microfone ou sincronização entre aparelhos.

O [método](METODO_INGLES_ORBI.md#revisao-curta-por-escrita)
detalha o contrato. As três fontes pedagógicas conferidas em 13/11 continuam
com sua data original; elas orientam o desenho e não comprovam eficácia desta
revisão. O [QA de 14/11](METODO_INGLES_ORBI.md#qa-revisao-curta-20261114)
tem registro próprio, separado do incremento contextual `d3d9eda` e de seus 697 testes.

## Leitura da pesquisa histórica

As propostas e fontes a seguir pertencem à consulta de **12/11/2026**. Naquela
rodada não houve implementação, captura de microfone, modelo instalado ou
serviço de voz ativado. As opções de gravação e reconhecimento foram
pesquisadas, mas não integram o piloto de 13/11. Suas datas e limites não foram
renovados pela implementação de síntese.

## O que queremos ensinar

O aluno ouve uma frase curta, repete, compara sua tentativa e pode tentar
novamente com apoio do Orbi. As frases podem aparecer no contexto de trabalho:
um teste falhou, uma alteração precisa de revisão ou um serviço voltou a funcionar.

Existem três capacidades diferentes:

1. **Síntese/reprodução:** falar a frase de referência.
2. **Reconhecimento:** transformar a tentativa do aluno em texto.
3. **Avaliação de pronúncia:** analisar características acústicas e oferecer
   retorno específico sobre a fala.

Uma transcrição coincidir com a frase não prova boa pronúncia. Uma transcrição
errada pode refletir ruído, microfone ou o reconhecedor. A Microsoft documenta
que sua avaliação de pronúncia utiliza um modelo específico, diferente do STT
comum [V07]. Whisper, sozinho, também é transcrição.

**Recomendação registrada em 12/11:** iniciar por ouvir, gravar/reproduzir e, onde funcionar, mostrar
o que o navegador entendeu. Adiar a promessa de correção fonética ou nota de
pronúncia até existir uma solução validada e compatível com a decisão de custo.

## Opções técnicas e custo

Complexidade relativa ao público mobile da Orbitamos, não orçamento fechado.

| Caminho | Capacidade | Complexidade | Custo e limite |
| --- | --- | --- | --- |
| `speechSynthesis` | Ler a referência, repetir e reduzir velocidade | Baixa a média | Sem API de voz contratada pela Orbitamos; vozes dependem do aparelho/navegador |
| Gravação e reprodução com `MediaRecorder` | Ouvir a própria tentativa e comparar | Baixa a média | Processamento local desenhado sem upload; depende de permissão e formato suportado |
| `SpeechRecognition`/prefixo do navegador | Mostrar transcrição e diferenças nas palavras | Média | Sem chave de API da Orbitamos; pode usar serviço remoto do navegador e não oferece disponibilidade ilimitada garantida |
| Whisper/ONNX no navegador | Transcrever localmente após download | Alta para mobile confiável | Modelo, runtime, memória, bateria e latência; ainda não avalia fonemas |
| Avaliação fonética dedicada em nuvem | Retorno acústico mais específico | Alta | Conta, integração, cota/custo, revisão pedagógica e tratamento de áudio |

### Síntese e gravação

`getVoices()` lista as vozes disponíveis. O produto deve verificar idioma e
disponibilidade e lidar com carregamento assíncrono [V04]. `localService`
indica se a voz é fornecida por serviço local ou remoto [V05]; portanto,
"voz do navegador" não significa automaticamente funcionamento offline.
Se necessário, planejar áudio de referência autorizado e revisado.

Gravação local é uma funcionalidade de comparação pelo aluno, sem análise
automática. Verificar suporte e MIME type em execução; não assumir um formato
de áudio idêntico no Safari e Chromium [V06].

### iPhone/Safari

A WebKit documentou reconhecimento de fala com o motor da Siri em 2021, com
dependência de Siri habilitada [V02]. Essa fonte histórica não substitui teste
na versão atual do aparelho. Considerar a interface prefixada quando existir
e verificar recursos em execução.

Os dados de compatibilidade da MDN consultados em 12/11 não indicam suporte
a `processLocally`, `available()` e `install()` no Safari/iOS [V03]. Não
prometer reconhecimento offline nem áudio restrito ao aparelho nesse caminho.
O guia MDN descreve o reconhecimento padrão baseado em serviço e o modo local
dependente de suporte/pacotes [V01].

WebKit no Windows é útil para layout e fluxo. Não comprova Siri, permissão,
microfone, teclado ou comportamento de áudio num iPhone físico.

### Modelos locais e avaliação dedicada

Transformers.js executa modelos no navegador por ONNX, com opções de CPU/WASM,
WebGPU e quantização [V08]. Isso permite estudar transcrição local, mas não
elimina o custo de download e processamento no aparelho. Como ilustração, dois
arquivos quantizados do `whisper-tiny.en` consultados somam aproximadamente
40,8 MB de pesos; runtime e outros arquivos são adicionais [V09]. Isso não é
medição de RAM, latência nem download total de uma implementação nossa.

Não carregar um modelo na entrada das aulas. Um futuro experimento deve ser
opcional, informar o download, ter cancelamento e medir o conjunto realmente
carregado e seu comportamento após descarte de cache.

A Azure é uma referência de avaliação específica, mas não resolve a premissa
de serviço ilimitado gratuito: a tabela F0 consultada apresenta cinco horas
mensais de transcrição em tempo real, compartilhadas entre Standard e Custom
[V10]; a avaliação segue a cobrança de STT e pode ter recursos adicionais [V07].
O F0 também tem limite de uma requisição concorrente ao endpoint base [V11].
Elegibilidade, região, recurso e cota precisam ser conferidos antes de um
eventual piloto. Não houve criação de conta/recurso nem adesão a plano pago.

## Primeiro protótipo proposto em 12/11 — histórico

Uma expansão de **Inglês em cena**, no fluxo atual. Cena, frase, objetivo e
ação devem estar claros sem criar uma nova página inicial cheia de instruções.

Frases autorais candidatas:

- The build failed.
- The tests passed.
- I fixed the bug.
- Please review this change.
- The service is running.

Fluxo:

1. Mostrar a situação ilustrada e a frase, com tradução de apoio opcional.
2. **Ouvir** e **Ouvir devagar**, iniciados por toque, sem reprodução automática.
3. **Falar** inicia uma tentativa curta após a informação de uso do microfone.
4. Exibir claramente quando está ouvindo; oferecer **Parar** e **Cancelar**.
5. Se houver reconhecimento, mostrar **O navegador entendeu: ...** e diferenças
   de palavras. Permitir ouvir a referência de novo e repetir a tentativa.
6. Se não houver reconhecimento, manter comparação por gravação/reprodução
   local, quando suportada, e um caminho de atividade sem microfone.

Normalizar pontuação e caixa para a comparação textual. Diferença de palavras
não recebe rótulo de erro de fonema. Uma mensagem possível é: "Ouvi outra
palavra aqui. Vamos ouvir a referência e tentar novamente". Não usar porcentagem
de pronúncia calculada por semelhança entre strings ou confiança de transcrição.

Falha de permissão ou reconhecimento não bloqueia a trilha nem significa que
o aluno falou mal. Registrar prática realizada não equivale a certificar
pronúncia, fluência ou proficiência em inglês.

## Microfone, áudio e dados

- Pedir acesso apenas quando a pessoa iniciar a ação correspondente.
- Explicar a distinção entre gravação local e reconhecimento que pode utilizar
  o serviço do navegador. Não prometer confidencialidade local sem verificá-la.
- Não enviar nem guardar áudio bruto no Supabase por padrão.
- Na gravação local, manter o áudio temporariamente em memória, permitir
  descartá-lo e liberar referências/URLs ao terminar. Não gravar blobs em
  `localStorage` a cada tentativa.
- Parar captura e reprodução ao cancelar, sair da atividade ou ocorrer uma
  interrupção que encerre a tentativa. Liberar tracks do microfone e cancelar
  síntese/reconhecimento; conferir isso no aparelho, não só por estado do React.
- Não deixar o próprio TTS entrar como resposta durante a captura. Tocar a
  referência e ouvir a tentativa são estados separados.
- Não adicionar envio de áudio ou fornecedor pago como fallback silencioso.

## Integração com o projeto existente

Base conferida em 12/11:

- `apps/web/src/components/games/CodeEnglish.tsx`: atividade atual.
- `apps/web/src/lib/codeEnglish.ts`: oito cenas de vocabulário e compreensão,
  com escolhas/escrita; save `orbitamos-english-v1-<userId>`.
- O áudio atual dos jogos usa `AudioContext` para efeitos. Não foi encontrada
  uma implementação de síntese, reconhecimento ou gravação de fala.

Implementar um adaptador de voz com estados explícitos e detecção de recursos,
sem espalhar APIs do navegador por todas as cenas. Preservar o save atual.
Uma futura prática oral pode ter registro próprio, pequeno e versionado, com
conta, frase, tentativas e apoio utilizado; não armazenar áudio ou conceder XP
de aulas automaticamente. Não criar novo item da sidebar apenas para isso.

## Critérios da proposta de 12/11

| Verificação | Resultado necessário |
| --- | --- |
| Voz inglesa ausente ou atrasada | Alternativa clara; interface continua utilizável |
| Silêncio, ruído e frase parcialmente reconhecida | Feedback honesto, nova tentativa e cancelamento |
| Microfone negado ou API indisponível | Caminho de estudo sem microfone |
| Offline | O produto informa a capacidade disponível; não promete ASR local sem suporte |
| Chamada, segundo plano e mudança de página | Tentativa encerrada e captura liberada conforme o fluxo |
| Repetição e toque rápido | Sem filas sobrepostas de voz/captura ou microfone preso |
| iPhone físico e Android modesto | Permissão, áudio, interrupção, foco e latência conferidos |
| Compreensão do aluno | Distingue o texto reconhecido de uma avaliação de pronúncia |

Esses critérios da proposta com captura/reconhecimento não foram executados
na rodada de pesquisa. O QA do piloto sem microfone é tratado separadamente
em [METODO_INGLES_ORBI.md](METODO_INGLES_ORBI.md), com os resultados históricos
do piloto separados dos registros próprios da etapa contextual e da revisão
escrita de 14/11.

## Ordem proposta em 12/11 e continuidade

1. **V0:** cinco frases, referência falada e comparação por gravação/reprodução
   local, com fallback e teste em aparelho. Sem corretor fonético.
2. **V1:** reconhecimento opcional nos navegadores aprovados pelo teste;
   diferenças textuais e repetição contextual. Sem nota fonética.
3. **V2, adiada:** experimento de transcrição local ou avaliação acústica
   dedicada, após decisão de custo, validação e compatibilidade.

A próxima ação registrada em 12/11 era um protótipo isolado com uma frase e
lifecycle completo. A decisão de 13/11 implementou outro recorte: 12 itens com
síntese e participação declarada, sem captura ou correção. Gravação,
reconhecimento e avaliação dedicada permanecem possibilidades futuras, sem
data de entrega. A etapa seguinte de 13/11 acrescenta escolhas de sentido em
contexto para o mesmo conteúdo, e a de 14/11 acrescenta revisão escrita sem
reabrir o escopo de captura ou correção de pronúncia.
Reabrir esta pesquisa quando mudarem navegador, APIs, modelo, fornecedor ou
proposta de feedback.

## Fontes primárias consultadas em 12/11/2026

| ID | Fonte | Aplicação |
| --- | --- | --- |
| V01 | [MDN — Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API) | Síntese, reconhecimento e processamento local/remoto |
| V02 | [WebKit — Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/) | Registro histórico da integração com Siri |
| V03 | [MDN — compatibilidade SpeechRecognition](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/SpeechRecognition.json) | Suporte por recurso; dados consultados, não garantia em aparelho |
| V04 | [MDN — getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices) | Seleção e disponibilidade de vozes |
| V05 | [MDN — localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService) | Origem local/remota da voz de síntese |
| V06 | [MDN — MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) | Gravação e suporte a formatos |
| V07 | [Microsoft — avaliação de pronúncia](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment) | Modelo específico e condições do recurso |
| V08 | [Hugging Face — Transformers.js](https://huggingface.co/docs/transformers.js/en/index) | Inferência no navegador e opções de execução |
| V09 | [Whisper tiny.en — arquivos ONNX](https://huggingface.co/onnx-community/whisper-tiny.en/tree/main/onnx) | Exemplo de tamanho de pesos, sujeito à versão do modelo |
| V10 | [Azure — preços de Speech](https://azure.microsoft.com/en-us/pricing/details/speech/) | Cota gratuita e recursos cobrados |
| V11 | [Microsoft — quotas de Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits) | Limites de concorrência e diferenças entre tiers |
