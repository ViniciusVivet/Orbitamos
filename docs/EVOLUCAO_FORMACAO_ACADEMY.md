# Formação Orbitamos: execução e continuidade

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

## Próximo ponto de continuidade

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
