# Formação Orbitamos: execução e continuidade

## Objetos e primeira lista — 16/11/2026

Continuação sobre `85911d9`, cuja main, CI `43777207630`, Vercel e download
foram confirmados em 15/11. A nova unidade abre em
`/estudante/trilhas/csharp?view=objects`, após métodos ou pela estação Projeto
.NET. O [guia](CSHARP_OBJETOS_ORBISERVICOS.md) registra fontes e sequência.

Quatro tarefas: classe com propriedades/construtor/regras; criação de instâncias
separadas; investigação de uma referência devolvida como cópia; seleção com
`List<Servico>` e `foreach`. A primeira edita `Servico.cs`; as outras editam
`Program.cs` e recebem a classe como base explícita. Diagramas autorais mostram
identidade e efeitos da alteração, sem simular execução do rascunho. Outra
instância e outra lista com as mesmas instâncias são critérios distintos.

A base com retornos por completar conta como ajuda; abrir a referência completa
registra consulta ao modelo. A seleção preserva ordem, repetições, objetos e
lista de entrada. Não há LINQ, encapsulação/validação, herança ou interfaces
escondidos no exercício; essas unidades permanecem no plano.

O editor compartilhado `CSharpProjectUnit` atende métodos e objetos com
adaptadores tipados. Cada unidade mantém seu parser de save, chave e envelope
de rascunho próprios; a refatoração não migra nem reescreve o código anterior.
Importação confirma atividade/arquivo e preserva o texto anterior para recuperar.
Retomada e progresso de objetos não acrescentam módulo concluído ou XP. O mapa
lembra qual unidade .NET estava aberta, mantendo a estação correta ao voltar.

O ZIP em `public/downloads/academy/orbiservicos-objetos-v1.zip` é estático; os
projetos em `examples/academy/orbiservicos-objetos-v1/` executam no SDK .NET 10 do
computador. Não houve novo backend, compilação na Vercel, API paga ou migration.

QA próprio: **951 testes em 78 arquivos**, nove contratos, tipos e lint dos
24 arquivos alterados passaram. Dois componentes tiveram lint repetido após
trocar a função de renderização por um componente React explícito; passaram.
O build de produção também passou. O aviso já conhecido de rastreamento
dinâmico em `api/course-materials/[...path]` permanece; a rota não foi alterada.

No SDK **10.0.404**, a rodada inicial passou **15/15 cenários**. A revisão
encontrou dois falsos positivos possíveis: construtor com parâmetro mais amplo
e filtro que apagava uma entrada sem liberados. Ambos foram corrigidos, e o
suplemento passou **4/4** (positivos T1/T4 e dois contraexemplos específicos).
São 17/23/23/26 casos por tarefa. Os quatro projetos extraídos do ZIP, com
soluções editoriais apenas no arquivo de foco, compilaram e produziram as saídas
esperadas. A distribuição continua com bases incompletas/bugadas, sem soluções.
O [registro editorial](../apps/web/examples/academy/orbiservicos-objetos-v1/tools/EDITORIAL.md)
distingue a rodada inicial, o suplemento e o smoke, sem anunciar repetição
integral do catálogo de 17 cenários. ZIP de 20 arquivos, cerca de 20 KB,
reproduzido também após converter a fonte para CRLF/BOM.

`audit-csharp-objects.mjs`, `audit-csharp-methods.mjs` e
`audit-csharp-career-map.mjs` passaram em desktop Chromium 1366×768 e WebKit
390×664/320×640. Conferidos primeira dobra com foto/ação, aviso de SDK, ponte
entre unidades, arquivo alvo, base/modelo, previsões, importação/recuperação,
autodeclaração invalidada por edição, diagramas, teclado de símbolos, conta e
unidade separadas, retomada e posição correta no mapa. Sem erros de página,
overflow horizontal ou violações Axe nos escopos auditados. Capturas reais foram
inspecionadas. Não houve ensaio de aprendizagem ou teclado físico de iPhone.
Relatórios e capturas em `apps/web/test-results/` são locais e ignorados.
A confirmação remota é separada deste QA.

## Métodos e primeiro projeto real — 15/11/2026

Continuação sobre `0722e75`. A unidade abre em
`/estudante/trilhas/csharp?view=methods`, pela estação **Projeto .NET** ou após
laços. O [guia](CSHARP_METODOS_ORBISERVICOS.md) descreve o ambiente e as decisões.
Os três módulos executáveis no navegador e seus saves continuam separados.

Quatro tarefas: acompanhar chamada/parâmetros/retorno, reutilizar para outros
clientes, investigar retorno fixo e escrever uma decisão nova com `bool`.
Começam vazias no navegador; exemplo, base e pistas são escolhas do aluno.
O apoio diminui até o pedido independente, sem solução pronta. Previsão não é
execução. A segunda resposta do exemplo guiado fica escondida até a previsão.

O pacote está em `apps/web/examples/academy/orbiservicos-metodos-v1/` e seu ZIP
público tem 16 arquivos (~16 KB). Não contém soluções editoriais nem dependências
NuGet externas. README orienta instalação, Program.cs/.csproj, salvar/build/run,
Git num repositório de estudo separado e verificador local. Não executa código
do aluno na Vercel nem introduz serviço pago. O navegador guarda preparação,
rascunho e consulta à ajuda; exportação/importação transporta apenas texto,
com confirmação e recuperação. Editar limpa a declaração anterior de execução.

Métodos tem retomada e registro próprios no progresso, sem somar aprovação,
quarto módulo executável no navegador ou XP. A autodeclaração “executei no PC”
não vira um resultado de compilador ou certificado de competência.

Verificação nativa: SDK oficial privado **10.0.404**, SHA-512 conferido,
sem trocar SDKs/PATH globais. **10/10 cenários editoriais** e suplemento de
assinatura **1/1**: soluções 5/5 ou 9/9, retorno fixo incorreto, erro CS0161,
stdout fixo, saída precoce, Exit(0), timeout e assinatura incompatível CS0123.
Cópia do ZIP extraída fora do repositório compilou e mostrou **5 → 3** ao mudar
só um argumento. São verificações do material autoral; não da conta dos alunos.
Resultado nativo registrado em `tools/EDITORIAL.md`; relatórios locais ignorados.

**Próximo bloco:** observar o Aluno 0 fazer a tarefa independente, depois ensinar
tipos/objetos e coleções no mesmo projeto, sem saltar diretamente para EF/API.
Manter instalador/SDK gratuito, suporte progressivo e critérios observáveis.
QA web concluído: **899 testes em 77 arquivos**, nove contratos, geração de
tipos, TypeScript, lint dos 22 arquivos de código alterados e build de produção
aprovados. Após ajustar os últimos textos e nomes de teste, 17 regressões de
catálogo/retomada/navegação foram repetidas e aprovadas. O aviso já conhecido de
rastreamento dinâmico na rota de materiais permanece; essa rota não foi alterada.

`audit-csharp-methods.mjs` e `audit-csharp-career-map.mjs` passaram em Chromium
desktop 1366×768 e WebKit 390×664/320×640. Conferidos foto/ação na primeira dobra,
aviso de SDK, quatro tarefas, download do ZIP/JSON, copiar negado com alternativa,
previsão sem antecipar a resposta, ajuda persistente, reset/importação com
recuperação do texto mais recente, reload, separação de contas e retomada própria.
Progresso não transforma declaração em aprovação. Sem rolagem horizontal ou
erro de página; Axe não apontou violações nos escopos auditados. Capturas foram
inspecionadas. Esses ensaios não são conformidade integral, teste do teclado
físico do iPhone ou observação de aprendizagem com iniciante.
Relatórios/capturas ficam em `apps/web/test-results/csharp-methods/` e
`csharp-career-map/`, ignorados. A confirmação remota desta rodada é separada.

## Objetivo e régua

Implementação iniciada em **15/11/2026**, sobre `9f77510`. O usuário autorizou
evoluir a Academy até uma formação gratuita com cuidado de produto comparável
ao esperado de plataformas pagas. O [plano de formação](PLANO_FORMACAO_ORBITAMOS.md)
preserva diagnóstico, currículo e lotes; este arquivo registra a execução.

As páginas públicas de [Carreiras Alura](https://www.alura.com.br/carreiras), da
[estrutura das carreiras](https://www.alura.com.br/artigos/conhecendo-as-carreiras-um-novo-nivel-de-profundidade)
e de [um bootcamp DIO](https://www.dio.me/bootcamp/jornada-para-o-futuro)
descrevem percursos, checkpoints e projetos. Foram consultadas páginas públicas,
sem acesso pago nem ensaio de eficácia. Não atribuímos uma nota de equivalência
à Orbitamos a partir dessas descrições.

| Critério observável | Aceite no nosso produto | Situação desta rodada |
| --- | --- | --- |
| Entrada e caminho | Reconhecer ação, tema, posição e mapa | Home/editor refinados; exploração preservada |
| Unidade compreensível | Contexto, entrega e uma orientação junto ao campo | Introdução mais curta; instrução e avanço sem duplicação |
| Formatos ligados ao conceito | Guia/questão/prática por vínculo autorado | Primeiro vínculo `csharp-fundamentos/csharp-a6`; demais exigem curadoria |
| Resultado concreto | Executar regra com entradas diferentes | Condições testa fronteiras e variações; ainda não é projeto .NET em arquivos |
| Feedback confiável | Escrita, execução e aprovação distintas | Subconjunto C# tipado; casos positivos/negativos; ajuda registrada |
| Progresso compreensível | Retomar e distinguir participação de tarefa | Inglês falado/contextual/escrito separados; seis experiências continuam seis |
| Ajuda disponível | Destino válido e retorno à tarefa | Pista/conceito sob demanda; Discord provisório ocultado; ajuda contextual completa segue no plano |
| Recompensas honestas | Tentativas, ajuda, conclusão e XP distinguíveis | Sem novos pontos por abrir ajuda; ensaio com estudantes ainda necessário |

## Recorte implementado

**Confiança.** `vba-a2` e `vba-a3` mantêm IDs, ordem e materiais. Os dois vídeos
de Python confirmados como incorretos foram retirados dessas aulas; o player
mostra “Vídeo em revisão”. A associação errada conhecida também é protegida no
detalhe remoto; nenhum banco remoto foi reescrito. O convite `SEU-GRUPO` deixou
de aparecer: Discord é opcional e validado, fórum/mentorias continuam disponíveis.

**Execução C#.** A reescrita por regex foi substituída por tokenização, análise e
verificação de tipos antes de emitir código para um worker JavaScript isolado.
Declarações, reatribuições, comparações, condições, strings e comentários são
tratados estruturalmente. Limite: `int`, `double` finito, `bool`, `string`, arrays
simples, console, condições e laços iniciais. Não é Roslyn/.NET completo;
recursos sem suporte falham com orientação. Sem execução no servidor, API paga
ou dependência nova.

**Primeira sessão.** Home mobile prioriza missão e ação, mantendo foto útil e
atalhos secundários. A escolha de trilha é opcional. A introdução apresenta
história e início; plano do programa e mapa ficam consultáveis. No editor,
uma referência de linha, explicação sob demanda e uma ação principal de cada
vez. Avanço automático continua após pausa; não executa sozinho. Experimentar
código incompleto, erro, reinício confirmado, recuperação e rascunho permanecem.

**Continuidade.** Jogos respeita a retomada de inglês em `#falar`. Progresso lê
participação oral, escolhas contextualizadas e revisão escrita separadamente,
mesmo após outra atividade. Não amplia o catálogo, não gera XP nem mede fala.

**Condições.** Preservado o arco prever → escrever → limites → combinação →
depuração → entrega nova. `else if` é explicado numa questão anterior à síntese.
O componente comum dos três módulos registra pista/conceito consultados e
resultados por atividade; consulta permanece ao ocultar ajuda, editar e recarregar.
Cancelar não conta verificação nem aprova. A interface distingue “após consulta”
de “sem consulta registrada”, sem afirmar domínio. Saves v1 continuam legíveis,
sem evidência retroativa inventada, sem nova sincronização ou migration.

## Verificação e publicação

QA de 15/11: geração de tipos e TypeScript aprovados. Auditoria da primeira sessão
aprovada nos três perfis (desktop, WebKit/iPhone e 320 px), incluindo fluxo positivo,
erro e recuperação. Axe não encontrou violações nas telas do editor auditadas;
isso não é uma declaração de conformidade do site inteiro. WebKit também emite
evento de erro do Worker no teste de sintaxe deliberadamente inválida: esse evento
esperado é registrado, e a interface apresentou o feedback e preservou o código.

Em Chromium isolado com Workers reais: cinco casos primários, seis regressões,
três guias, 18 soluções, 34 variantes dos módulos e quatro contratos do laboratório
aprovados, incluindo rejeição do contraexemplo, timeout e cancelamento.
A suíte completa passou: **835 testes em 73 arquivos**, em um worker, e **nove
contratos**. Os contratos inspecionam arquivos; não executam RLS no banco remoto.
Lint dos arquivos de código alterados e build de produção também aprovados.
O build avisou sobre rastreamento dinâmico na rota de materiais, não alterada
nesta rodada; reduzir esse escopo entra no aperfeiçoamento da biblioteca.
Os 731 testes da publicação anterior são históricos. A confirmação remota de
SHA, CI e Vercel ocorre após o push e permanece separada deste QA local.

`apps/web/scripts/audit-academy-first-session.mjs` cobre Home → introdução →
escrita, reload, erro, reinício/recuperação e acessibilidade em desktop,
WebKit/iPhone e 320 px. Capturas/JSON em
`apps/web/test-results/academy-first-session/`, ignorados pelo Git. Esse ensaio
não verifica o teclado físico de um iPhone nem substitui observar um iniciante.

## Aluno 0: mapa para backend C# em 2027 — 15/11/2026

A primeira entrega foi publicada em `9e060cf`: `main` remota, CI
`43715931490` e Vercel confirmados. Após isso, o usuário priorizou seu próprio
percurso como Aluno 0, partindo de lógica/vibecoding. O novo recorte está em
[Aluno 0 — C#](ALUNO_ZERO_CSHARP_2027.md).

O mapa mantém os oito IDs e seus saves. Acrescenta pedido da equipe, competência,
estruturas/arquivos, entrega, critérios e ambiente por estação. Um índice leva
direto à estação; a URL `?view=map` permite abrir/retomar o mapa. Somente os três
módulos atuais oferecem ações de prática: as próximas aulas continuam planejadas.
O hábito de IA crítica é separado da especialização opcional em IA/RAG.

Foram analisados anúncios atuais e documentação oficial. Seis páginas com
candidatura visível e sem marcador de encerramento atualizam os exemplos do
produto. A amostra não é representativa nem confirma seleção ativa. A referência
salarial histórica de 2026 já existente não foi reavaliada nesta pesquisa de vagas.

QA deste segundo recorte: **845 testes em 75 arquivos**, tipos Next e TypeScript
aprovados; mapa conferido em desktop, WebKit/iPhone e 320 px. Os ensaios incluem
foto/ação na primeira dobra, oito estações, critérios/referências, três módulos
reais, índice/âncora após reload e botão Voltar sem divergência de conteúdo/URL.
Axe não encontrou violações no mapa nos estados auditados. Não houve teste
físico de teclado nem ensaio com aluno. Lint dos arquivos alterados e build de
produção aprovados. A confirmação remota de publicação deste recorte é separada
da primeira entrega. Métodos/API continuam sendo aulas planejadas.

## Próximo ponto registrado em 15/11/2026

1. Conferir o fechamento desta entrega: QA local, SHA remoto, CI e Vercel são
   registros separados. Se a publicação já estiver confirmada, seguir para 2.
2. Observar iniciante e aplicação nova sem instruções externas sobre onde tocar;
   registrar bloqueios e ajuda, sem inventar taxa de eficácia.
3. Prioridade do Aluno 0: escrever, alterar e explicar os fundamentos disponíveis;
   produzir a unidade de métodos com SDK/arquivos/terminal e primeiro commit,
   antes de classes, coleções, EF e APIs do OrbiServiços.
4. Lote 3 permanece no plano: contrato comum de evidência e transporte de rascunhos
   com prévia de conflitos. Backup não será anunciado como sincronização automática.
5. Curadoria progressiva: conferir fonte canônica remota e materiais por unidade.
   O vídeo geral atual de `csharp-a6` não foi assistido integralmente; o vínculo
   autorado do guia não o certifica como explicação específica de condições.

Cada incremento exige tarefa observável, erro/variação testados, revisão visual
e próximo ponto registrado. Mais jogos ou vídeos não encerram esses requisitos.

## Continuidade e revisão do alvo — 16/11/2026

O ponto de 15/11 acima é histórico. Métodos foi publicado em `85911d9` e a
primeira unidade de objetos/listas em `6613f3f`, com confirmação remota de
`main`, CI e Vercel em ambas as rodadas. Consulte os registros específicos em
[Métodos e projeto .NET](CSHARP_METODOS_ORBISERVICOS.md) e
[Objetos e listas](CSHARP_OBJETOS_ORBISERVICOS.md). Preparação no navegador,
autodeclaração de execução e execução real com SDK continuam separadas.

A revisão atual identifica um desvio de prioridade: duas unidades foram
aprofundadas sem documentar a observação do Aluno 0 solicitada anteriormente.
Isso amplia conteúdo disponível; não comprova aprendizagem nem transforma
as estações futuras do mapa em aulas prontas.

O [controle da formação](CONTROLE_FORMACAO_ORBITAMOS.md) registra o alvo, a
estimativa interna de cobertura de cerca de 30%, seus limites e os critérios
de aceite. O [roteiro do Aluno 0](SESSAO_ALUNO_ZERO.md) está preparado, ainda
não realizado. Não converter testes automatizados em percentual de ensino.

Foi encontrado um erro de integração: com C# escolhido como trilha principal,
a Home podia encerrar a recomendação nos três módulos do navegador, apesar de
métodos e objetos estarem publicados. Depois de visitar inglês, a escolha
principal também perdia a unidade .NET selecionada. A correção distingue
retomada global recente da retomada da trilha escolhida, preservando os saves,
os totais e a ausência de conclusão/XP por autodeclaração. A confirmação desta
rodada precisa ser registrada separadamente do histórico de `6613f3f`.

### Próximo ponto vigente

1. Fechar publicação da correção Home → C# → outra atividade → Home → mesmo
   projeto. **Encerrado:** `a216357`, SHA remoto, CI `43959062550` e Vercel
   confirmados, além do QA local nos três perfis isolados.
2. Executar o roteiro do Aluno 0, identificando a origem da evidência e os
   bloqueios de compreensão, navegação, teclado e ambiente. Não inventar uma
   sessão humana para preencher essa etapa.
3. Corrigir os bloqueios observados. Confirmada a compreensão de métodos e
   objetos, seguir para encapsulamento/validação antes de EF e API.
4. Retomar o trabalho transversal: curadoria aula/prática, transporte seguro
   dos rascunhos e aplicação em código do que foi treinado em jogo/SQL/inglês.

O trabalho técnico autorizado pode continuar enquanto a sessão humana não
ocorre; sua ausência permanece visível e impede alegar eficácia demonstrada
ou equivalência a uma plataforma paga.

QA local desta correção e seus limites estão no
[controle da formação](CONTROLE_FORMACAO_ORBITAMOS.md#qa-desta-rodada--16112026):
tipos, lint, testes, contratos, build e percurso com a trilha escolhida nos três
perfis aprovados. A chamada do próximo projeto foi encurtada após inspeção da
captura de 320 px. Evidência técnica não preenche a sessão do Aluno 0; confirmação
remota continua separada do QA local.

## Fila persistente e curadoria — 16/11/2026

A pedido do usuário, o [mapa de execução](MAPA_EXECUCAO_ACADEMY.md) passa a ser
a fila operacional: IDs, dependências, subtarefas, estados e cursor. O plano e
a régua continuam explicando o alvo e os critérios. A ausência de H/R não
preenche aceites humanos nem interrompe as outras tarefas técnicas prontas.

O primeiro incremento é B02.02: o guia de aula usava sua posição para escolher
exercícios e perguntas por área. Por exemplo, CSS Grid recebia uma prática de
funções JavaScript. A orientação agora distingue o vínculo autorado de apoio
geral, mantém questões fornecidas pelo catálogo e não inventa quiz/prática ou
duração para unidades ainda sem vínculo. O registro de aula/XP permanece.
Não houve comparação ou alteração da fonte canônica remota nesta etapa.

Os componentes de revisão/prática são compartilhados entre a página real e
a prévia isolada. Uma aula sem questões não monta o quiz, não mostra revisão
completa por zero perguntas e não herda placar de outra aula. O histórico
existente continua guardado; marcar uma aula não marca sua prática como feita.

QA local aprovado: tipos, lint, 966 testes/78 arquivos, nove contratos, build e
painéis compartilhados em desktop e dois perfis WebKit. Dois contrastes foram
corrigidos; não houve sessão humana nem leitura autenticada do catálogo remoto.
A confirmação de publicação fica separada no fechamento de B02.02 do mapa.
Próximo item independente: B02.01, manifesto dos materiais e
vínculos usados no percurso. A estimativa de 30% não muda por criar a fila.

## Inventário C# e revisão de variáveis — 16/11/2026

B02.02 foi publicado em `d7d79bc`, CI `43972207849` e Vercel confirmados.
A continuação fecha o inventário B02.01 no
[manifesto](MANIFESTO_FORMACAO_CSHARP.md): 13 aulas locais em cinco módulos,
quatro DOCX íntegros e apoios selecionados de SQL/inglês/Entrega. Texto inicial
e integridade não substituem leitura integral. Vídeos e fonte remota não foram
conferidos; o material de Cinema/Avalonia continua complemento desktop.

O novo vínculo `csharp-a5 → variables` tem questões próprias de previsão,
tipo e atualização de valor, com código legível, pistas após erros e explicação
dos acertos. O destino corresponde ao recorte de string/int/atribuição/+−/console;
não promete ensinar double/var/conversões. `variables-v1` separa essa avaliação
das respostas antigas. Quizzes explícitos válidos mantêm prioridade e chave.
O parser agora descarta entradas nulas/malformadas e questões sem resposta
possível, preservando as válidas e seus IDs/materiais, sem quiz substituto.

A captura estreita revelou revisão longa demais. O componente compartilhado
passou a mostrar uma pergunta por vez, navegação por números e avanço após
feedback. Reload abre a primeira pendente; Refazer limpa somente a versão atual.
O fluxo mantém revisão, prática e execução em código como evidências diferentes.

QA local: 988 testes/78 arquivos, nove contratos estruturais, lint, tipos e build
aprovados; snippets executados no SDK .NET 10.0.404, incluindo erro CS0029 esperado.
Chromium desktop e WebKit 390/320 px conferiram erro, correção, ordem alternativa,
foco, reload, isolamento de saves e abertura das práticas reais. Nove estados axe
sem violações no escopo, sem overflow/erros de página; capturas inspecionadas.
Warnings anteriores de Browserslist/tracing de materiais permanecem. Nenhuma
sessão humana, execução de aluno ou leitura autenticada remota foi presumida.

Este registro fecha I/Q; a confirmação remota desta rodada fica no cursor local
`docs/local/academy-manifest-20261116/continuity.json`. Próxima tarefa pronta:
B02.03.2, vínculo de objetos reais com os requisitos de SDK/PC. A cobertura
estimada continua cerca de 30%; inventário e testes não comprovam aprendizagem.


## Rejeição da entrada C# e reparo — 17/11/2026

O usuário enviou cinco fotos, relatou abandonar a entrada no PC/celular e deu
nota 1/10 à composição. O QA funcional anterior não havia assegurado clareza
visual. Isso prioriza B01.07 e B01.08 no mapa; os vínculos novos de biblioteca
aguardam esse reparo, preservando o trabalho local já aprovado de B02.

A tela de variáveis/condições/laços agora apresenta uma cena própria do Orbi
no balcão do OrbiServiços junto à tarefa e ao editor. Barra compacta e roteiro
nativo substituem masthead, quatro abas e cinco botões de módulos. Foram
retirados o aviso sticky, a lista lateral/mobile inicial, o começo duplicado,
o plano repetido e o console vazio. Atividades e ferramentas são consultáveis;
instrução da linha, significado e erro continuam próximos do trabalho.

O [registro visual](REVISAO_VISUAL_CSHARP_20261117.md) reúne critérios, mídia,
medidas e limites. Browser QA passou em três perfis, com a primeira linha do
editor visível na dobra de 390 e 320 px, saves/recuperação e navegação conferidos.
Quinze estados axe no escopo ficaram sem violações. O foco de fechar Atividades
foi corrigido especificamente no WebKit; isso não substitui teclado de iPhone real.

A publicação deste incremento inclui a curadoria local B02.01/.02.6/.03.1,
ainda não publicada no momento do feedback. Confirmação final de testes/build,
SHA, CI, deploy e smoke fica em `docs/local/academy-visual-reset-20261117/continuity.json`.
Próxima pronta é B01.08: corrigir a pilha interna das unidades .NET antes de
voltar a ampliar seus vínculos. Não há aprovação visual humana da composição
nova, sessão de aprendizagem ou nova estimativa de cobertura por esse reparo.
