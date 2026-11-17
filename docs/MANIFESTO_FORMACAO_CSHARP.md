# Manifesto de materiais e práticas da primeira formação C#

**Inventário de 16/11/2026**, sobre a base `d7d79bc`. Entrega B02.01 do
[mapa de execução](MAPA_EXECUCAO_ACADEMY.md). O alvo e os critérios continuam
no [controle da formação](CONTROLE_FORMACAO_ORBITAMOS.md).

Este é um inventário editorial do percurso, não um certificado de revisão dos
vídeos, de aprendizagem ou de equivalência com plataformas pagas. As aulas da
biblioteca, as práticas interativas e os apoios são recursos diferentes: seus
IDs e contagens não podem ser somados como se fossem aulas equivalentes.

## Origem e grau de verificação

| Fonte | O que foi conferido nesta rodada | O que continua pendente |
| --- | --- | --- |
| Catálogo local `cursos.ts` | 1 curso C#, 5 módulos, 13 aulas, IDs/títulos/metadados e 4 referências a DOCX, extraídos da árvore sintática sem executar o módulo | Estado do catálogo publicado no Supabase, fonte canônica remota e ordem remota |
| Guias `learningExperience.ts` | Vínculo publicado de `csharp-a6` com condições; nesta rodada, autoria e QA do recorte de variáveis para `csharp-a5` | Novos vínculos precisam de autoria por conceito; título parecido não autoriza associação automática |
| Quatro DOCX locais | Existência, tamanho, integridade ZIP/CRC, XML e texto inicial; originais preservados | Leitura integral, renderização/legibilidade mobile, comandos/versões, exemplos executados e links |
| Práticas C# e pacotes .NET | Identidade, rotas, requisitos e limites declarados no código/guias | Esta rodada não repete os ensaios de execução dos pacotes nem observa um aluno |
| SQL, inglês e Entrega | IDs e rotas existentes, linguagem/ambiente e lacunas de transferência | Selecionar um recurso não cria sua integração curricular com OrbiServiços |
| Vídeos | Somente os IDs declarados no catálogo local | Conteúdo, disponibilidade, recorte e adequação não conferidos nesta rodada |

Os nomes das unidades C00–C23 são planejamento pedagógico. Não alteram IDs de
aulas, progresso, chaves de rascunho, conquistas ou permissões.

## 1. Núcleo interativo que já existe

Celular e computador podem preparar rascunhos. Os três módulos iniciais executam
um subconjunto educacional no navegador; os projetos seguintes exigem .NET no PC.
Não há execução arbitrária de C# no backend da Orbitamos.

| Recurso / identidade | Rota de entrada | Pré-requisito e ambiente | Artefato / verificação / limite |
| --- | --- | --- | --- |
| C01 — `variables`, `csharpModules.variables` | `/estudante/trilhas/csharp?module=variables` | Início guiado; navegador, inclusive celular | Texto e contagens com `string`/`int`, reatribuição, +/− e console; atividades de guia, quiz e código. Não cobre toda a ementa de tipos/conversões do catálogo |
| C02 — `conditions`, `csharpModules.conditions` | `/estudante/trilhas/csharp?module=conditions` | Variáveis; navegador | Decisões, fronteira `>`/`>=`, comparação, `&&`/`||`, depuração e entrega. Casos autorados não são compilador C# completo |
| C03 — `loops`, `csharpModules.loops` | `/estudante/trilhas/csharp?module=loops` | Variáveis e condições; navegador | Contador, acumulador, fila vazia/parcial, condição de parada e limite. Explicar o término continua sendo tarefa do aluno |
| C04 — `orbiservicos-methods-v1` | `/estudante/trilhas/csharp?view=methods` | Variáveis, cálculo, bool; SDK .NET 10 no computador para executar | Quatro tarefas `guided/reuse/debug/independent`, `Program.cs`, parâmetros/retorno/reuso; [guia e pacote](CSHARP_METODOS_ORBISERVICOS.md). Declaração de execução não é resultado conferido pela plataforma |
| C05 — `orbiservicos-objects-v1` | `/estudante/trilhas/csharp?view=objects` | Métodos, `int/string/bool`, condição e repetição; SDK no PC | Classe/instância, construtor, referência/cópia e primeira seleção `List<Servico>`; [guia e pacote](CSHARP_OBJETOS_ORBISERVICOS.md). Setters públicos e entradas válidas: encapsulamento e entradas inválidas continuam futuros |

Fontes: [módulos](../apps/web/src/lib/csharpModules.ts),
[métodos](../apps/web/src/lib/csharpMethods.ts),
[objetos](../apps/web/src/lib/csharpObjects.ts). Há orientação inicial de
ambiente/Git nos pacotes; ainda não há evidência do Aluno 0 abrindo, executando
e registrando sua própria alteração. A estação 3 continua parcial.

## 2. Biblioteca C#: o que cada registro pode apoiar

Fonte: [catálogo local](../apps/web/src/lib/cursos.ts), curso
`fallback-csharp` / slug `csharp-fundamentos`. Um registro remoto pode ter UUID;
o slug estável precisa ser preservado para relacionar guia e histórico.

**Todos os vídeos abaixo permanecem sem revisão integral registrada.** O tema
da tabela é a declaração do catálogo, não uma descrição verificada do vídeo.
Pré-requisitos são a proposta do percurso OrbiServiços, não metadados existentes
na plataforma de vídeo. Um vínculo autorado confere seu próprio recorte de prática.

| Aula estável | Tema declarado / ID de vídeo | Apoio e pré-requisito no percurso | Vínculo e lacuna |
| --- | --- | --- | --- |
| `csharp-a1` | Introdução C#/.NET · `2HkoGbsVY6k` | C00/C01; entrada, arquivo, ambiente e console | `csharp-mat-1`; apoio a revisar. Ambiente do pacote é a orientação executável atual; sem prática específica da biblioteca |
| `csharp-a5` | Variáveis, tipos e operadores · `PKMm-cHe56g` | C01; pode começar no celular | Guia `variables` autorado nesta rodada: somente texto/inteiros, atribuição, +/− e console. `double`, `var` e conversões precisam de outras práticas; bool entra em condições |
| `csharp-a6` | Condições e laços · `r3XA7uSBCfY` | C02/C03, após C01 | Guia autorado existente aponta para `conditions`; ele declara laços como continuação. Não anunciar que um link conclui os dois assuntos |
| `csharp-a2` | Atividade prática inicial · `NGUtWOnz2S8` | Apoio após C00 e fundamentos necessários ao menu | `csharp-mat-2`; revisar pré-requisitos e contexto antes de tornar obrigatório |
| `csharp-a7` | Classes, objetos e construtores · `6CYGsNL7opg` | C05, após métodos C04 | Unidade real `objects` é candidata a vínculo de recorte; guia da biblioteca ainda não autorado |
| `csharp-a8` | Herança, polimorfismo e interfaces · `9Edx_u99ttk` | C10, após objetos e responsabilidades | Não há prática específica. Não associar a cópia de objetos ou lista só porque estão próximos no catálogo |
| `csharp-a3` | Encapsulamento e propriedades · `eNEZQTg7cBs` | C06, após C05 | `csharp-mat-3` começa como material básico geral. Foco de encapsulamento não confirmado; setters públicos da unidade atual não cumprem este objetivo |
| `csharp-a9` | List, Dictionary e arrays · `4Mi4OuSMo4A` | C05/C09 | A primeira seleção de `List<Servico>` é apenas um recorte; não há guia que cubra Dictionary/arrays nem toda a unidade de coleções |
| `csharp-a10` | LINQ e lambdas · `gwD9awr3NNo` | C09, após coleções e métodos | Sem prática específica; filtrar com laço não demonstra aprendizagem de LINQ |
| `csharp-a11` | API ASP.NET Core · `I5ZkkG3yTwM` | C15, após regras, testes e dados | Conteúdo interativo ainda planejado; não vincular ao simulador como se executasse uma API |
| `csharp-a12` | EF Core e banco · `heJY-Q2B6Y0` | C14, após modelo relacional/persistência | Sem unidade integrada disponível; a oficina SQLite não conclui EF/migrations |
| `csharp-a13` | API com EF, autenticação e validação · `YHYcvSHHFkw` | C15–C18 | Sem prática integrada; não considerar projeto profissional pronto por assistir à aula |
| `csharp-a4` | Cinema do Bruno · `TG62LdG6FyE` | Complemento desktop, após fundamentos/OO conforme revisão | `csharp-mat-4` usa Avalonia UI e arquivos. Não é o projeto backend obrigatório OrbiServiços nem evidência de API/autorização |

## 3. Materiais locais: disponibilidade não é curadoria completa

Os caminhos declarados `/course-materials/...` são normalizados pelo catálogo
para `/api/course-materials/...`. A existência no disco não comprova acesso de
uma conta real pela rota autenticada. Não mover nem regravar os originais nesta etapa.

| ID / aula | Arquivo em `apps/web/public/course-materials/csharp-fundamentos/` | Tamanho | Inspeção inicial e decisão editorial |
| --- | --- | ---: | --- |
| `csharp-mat-1` / a1 | `03-c-aula-1.docx` | 1.240.410 B | Título/início compatíveis com primeiros passos, ambiente e console. Candidato a apoio C00/C01; falta conferir comandos, versões e todas as páginas |
| `csharp-mat-2` / a2 | `01-c-aula-pratica-atv-1.docx` | 227.721 B | Propõe menu de console no VS Code e usa a marca antiga ORBITUS. Revisar requisitos, exemplos e marca antes do vínculo obrigatório |
| `csharp-mat-3` / a3 | `02-averiguar-c.docx` | 1.226.898 B | Início “C# Básico (Volume 1)”, desde Hello World. Não contar como apoio específico revisado de encapsulamento; a extração inicial não prova ausência do tema no restante |
| `csharp-mat-4` / a4 | `04-c-2-nivel-medio-cinema-do-bruno.docx` | 1.443.834 B | Título compatível com Cinema; recorte é Avalonia/desktop/arquivos. Tratar como complemento a revisar; também rever afirmações de nível profissional/remuneração antes de recomendá-las |

Os quatro passaram por CRC de todos os membros ZIP e leitura do XML principal;
hashes antes/depois confirmam preservação. **Não** foram renderizados, revisados
integralmente ou compilados. Nenhum deles está certificado para todas as etapas
do percurso. As quatro referências e seus IDs permanecem intactos no catálogo.

## 4. Apoios transversais selecionados

Seleção editorial, ainda sem ponte curricular implementada. As rotas abrem a
experiência; os IDs são cursores internos, não parâmetros que permitem saltar fases.

| Apoio / fonte | Entrada e seleção | Pré-requisito / ambiente | Por que foi selecionado e o que falta |
| --- | --- | --- | --- |
| Oficina SQL — [sqlJourney](../apps/web/src/lib/sqlJourney.ts) | `/estudante/trilhas/sql?mode=workshop`; `consulta`, `filtro`, após `fundacao` e `cadastro` | Navegador; SQLite/sql.js/WASM em Worker; banco temporário reconstruído por histórico | Visualizar tabela/consulta/filtro. Hoje usa produtos/estoque; criar tarefa com clientes/serviços e ponte ao banco do projeto em B06/C11–14 |
| Aventura SQL — [sqlQuest](../apps/web/src/lib/sqlQuest.ts) | `/estudante/trilhas/sql`; percurso sequencial com etapa numérica | Navegador; consulta ao banco local da experiência | Primeiro contato com SELECT/FROM/WHERE. Não comprova modelagem relacional, JOIN, transação ou EF |
| Inglês — [spokenEnglish](../apps/web/src/lib/spokenEnglish.ts) e [englishUse](../apps/web/src/lib/englishUse.ts) | `/estudante/jogos/ingles-em-cena#falar`; `word-file`, `phrase-save-the-file`, `phrase-run-the-code`, `phrase-the-build-failed` | Navegador; TTS do aparelho em inglês e apoio escrito PT-BR; sem microfone/nota de fala | Usar arquivos, salvar, executar e ler falha no ambiente do projeto. Há significado/áudio/pronúncia autorada; falta tarefa aplicada a `Program.cs`/SDK e mensagens de contexto real |
| Entrega — [orbiChapter](../apps/web/src/lib/orbiChapter.ts) | `/estudante/jogos/entregas-do-orbi`; `farol`, após `ponte` e `elevador` | Teclado/toque; cena e gramática JavaScript restrita no cliente | Relacionar regra/estado e consequência visível. Falta pedir outra regra em C# após o jogo; vitória não vira evidência de execução C# |
| Oficina do Pulso — [orbiPulse](../apps/web/src/lib/orbiPulse.ts) | Mesma rota com `#oficina-do-pulso`; `alcance`/`ritmo` | Gramática restrita e gameplay; reforço opcional | Relacionar valores e efeito de uma ação; não é pré-requisito motor obrigatório nem runtime C# |
| Simulador — [workSimulation](../apps/web/src/lib/workSimulation.ts), [delivery](../apps/web/src/lib/workDelivery.ts), [incident](../apps/web/src/lib/workIncident.ts) | `/estudante/jogos/simulador`, `#esteira` e `#incidente` | Configurações/snapshots simulados, não infraestrutura executada | Preparar leitura de configuração e diagnóstico; a ligação com CI/log real do projeto continua em C19–22 |

Esses apoios não serão impostos como um estilo fixo de aprendizagem. A mesma
competência precisa chegar a código, explicação e aplicação nova, com alternativa
quando reflexo motor, áudio ou aparelho impedir o uso do formato.

## 5. Fila de curadoria derivada do inventário

1. B02.03.1: guia de `csharp-a5` autorado para o recorte realmente coberto por
   `variables`, com previsão, erro de tipo e reatribuição. Autoria não certifica o vídeo;
   o fechamento de QA/publicação fica no mapa e no registro de execução.
2. B02.03.2: avaliar vínculo explícito de `csharp-a7` com objetos reais após
   métodos; informar SDK/PC e limites de entradas válidas.
3. B02.03.3: tratar `csharp-a9` como recorte inicial de List, sem prometer arrays,
   Dictionary ou LINQ que ainda não têm prática correspondente.
4. B02.05: revisar os quatro materiais em tarefas separadas. Priorizar mat-1
   para a transição ao ambiente; mat-3 requer decisão de vínculo após leitura;
   mat-4 permanece complemento desktop, sem substituir o backend.
5. B02.06: abrir/conferir vídeos e registrar tema/trechos; metadados ou títulos
   do catálogo não bastam. Conferir fonte canônica real em B02.04 antes de
   alterar conteúdo remoto ou remover a compatibilidade de catálogo.
6. B05–07: construir uma ponte autorada por apoio selecionado, com artefato e
   critério de verificação; a presente tabela não implementa essas pontes.

## Evidências e atualização

Registros locais ignorados: `docs/local/academy-manifest-20261116/` contém
`catalog-inventory.json` (extração sintática e metadados/hash dos arquivos) e
`material-inspection.json` (integridade, texto inicial e limites). Fonte de
autoria das práticas: modelos e guias ligados nas tabelas. Nenhuma conta real,
catálogo remoto ou sessão humana foi inspecionada nesta rodada.

Ao revisar um recurso, atualizar seu estado e evidência, não apenas a data do
manifesto. Não somar recursos inventariados como aulas revisadas, nem transformar
um arquivo íntegro em conteúdo validado ou autonomia demonstrada.

### Autoria do recorte de variáveis — B02.03.1

As questões novas usam exemplos próprios de leitura de variável/literal, tipo
inteiro e atualização de valor. Os conceitos foram conferidos nas referências
oficiais de [texto e variáveis](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/tutorials/hello-world),
[tipos inteiros](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)
e [atribuição](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/assignment-operator),
consultadas em 16/11/2026. A escolha de ambiente da formação continua a já
documentada; não exige o serviço cloud mencionado em um tutorial externo.

Os snippets foram executados no SDK privado .NET 10.0.404: saídas `Bia`,
`cliente`, `7` e `8`; a atribuição de texto a int foi rejeitada com CS0029.
Isso confere estes exemplos da equipe, não o código de um aluno. Registro em
`quiz-proof/report.json`; testes web, UI e publicação permanecem verificações
separadas no fechamento da rodada.

O novo quiz de variáveis usa a versão `variables-v1`, separada das respostas
do antigo quiz genérico da mesma aula. As chaves antigas são preservadas; não
valem como tentativa desta avaliação nova. Condições mantém sua chave publicada,
pois perguntas e respostas não mudaram; os metadados de explicação foram ampliados.
Questões explícitas do catálogo conservam prioridade e chave de compatibilidade.

A revisão mostra uma pergunta por vez, com código quando necessário, pista após
erro e explicação após acerto. O aluno escolhe quando avançar e pode revisitar
questões. Ao recarregar, retoma a primeira pendente; a última aba visitada não é
um novo dado salvo. Refazer limpa somente a avaliação atual. Isso organiza a
revisão, sem tratá-la como demonstração de autonomia em código.
