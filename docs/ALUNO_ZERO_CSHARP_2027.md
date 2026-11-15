# Aluno 0: da lógica ao trabalho com backend C#

**Revisão: 15/11/2026.** Objetivo do usuário: aprender de verdade e buscar vaga
em 2027, começando com lógica e experiência de vibecoding. O primeiro alvo é
backend C# júnior em um time que mantém um produto. Esta é uma proposta de
formação; as vagas de hoje não preveem a contratação de 2027.

## 1. O destino que estamos escolhendo

Um desenvolvedor recebe um pedido, lê o sistema existente, esclarece a regra,
reproduz o problema, muda uma parte do código, testa e envia para revisão.
Também investiga consultas, integrações, logs e falhas. Criar o projeto inicial
é uma parte desse trabalho.

Anúncios públicos consultados incluem
[Webmotors júnior](https://br.linkedin.com/jobs/view/desenvolvedor-back-end-jr-net-at-webmotors-4486509551),
[Senff júnior](https://br.linkedin.com/jobs/view/desenvolvedor-junior-at-grupo-senff-4489630231)
e [Stefanini júnior especializado](https://stefanini.gupy.io/jobs/12861027).
A amostra dirigida reuniu 12 anúncios detalhados, incluindo encerrados e casos
incertos; seis páginas com candidatura visível e sem aviso de encerramento
foram selecionadas para o site. Isso não confirma seleção ativa nem representa
estatisticamente o mercado. Formação, matrícula, experiência, localização e
disponibilidade também podem ser filtros de cada processo.

## 2. As peças e os nomes

| Peça | Para que serve | Decisão para o primeiro projeto |
| --- | --- | --- |
| C# | Linguagem em que você escreve as regras | Fundamentos e depois métodos, objetos, coleções e tarefas assíncronas |
| .NET SDK | Cria, compila, executa e testa projetos reais | .NET 10 LTS, com patches atuais e C# padrão do target |
| ASP.NET Core | Recebe requisições e produz respostas web | API na linha 10; compreender uma abordagem antes de comparar alternativas |
| EF Core | Mapeia entidades e consultas para um banco relacional | Linha 10 e provider compatível; estudar SQL junto |
| SQL e banco | Guardam e relacionam os dados | Um banco por vez; SQLite pode simplificar o início, SQL Server/PostgreSQL entram conforme o projeto |
| NuGet | Distribui bibliotecas de .NET | Entender instalação, versão e finalidade de cada dependência |
| Git e GitHub | Histórico, colaboração e revisão | Commit pequeno, branch, diff, PR e resposta a feedback |
| Testes e ferramentas | Conferem e ajudam a investigar o comportamento | Testes unitários e de integração, depurador, cliente HTTP e logs |

Em 15/11/2026, a [política oficial](https://dotnet.microsoft.com/en-us/platform/support/policy)
confirma .NET 10 LTS e .NET 11 STS suportados. O
[lançamento do .NET 11](https://devblogs.microsoft.com/dotnet/announcing-dotnet-11/)
confirma C# 15 e mantém .NET 10 como opção LTS. Escolhemos a linha 10 para a
primeira formação; novidade de versão entra depois, sem exigir aprender duas
stacks ao mesmo tempo. .NET 8/9 encerraram suporte em 10/11/2026: sua leitura
pode aparecer em legado, com migração para uma linha suportada.

**Boilerplate** é uma estrutura inicial reutilizável: arquivos, configuração e
código que ajudam a começar uma tarefa. Não existe um modelo universal para
toda empresa. O aluno precisa entender a entrada, a regra, os erros, as saídas
e os testes para adaptar esse esqueleto ao contexto.

## 3. O mapa: um projeto, oito estações

O projeto fictício é **OrbiServiços**, para uma pequena empresa que atende
clientes e organiza ordens de serviço. Cada unidade aumenta esse mesmo produto.

| Estação | O que aprender | Estruturas para praticar | Entrega observável |
| --- | --- | --- | --- |
| 1. Dados e console | Tipos, variáveis, texto, cálculo, leitura de erro | Declaração tipada, reatribuição, saída usando variável | Resumo de cliente e serviços pendentes que acompanha os dados |
| 2. Regras e repetição | Comparações, bool, if/else, laços, arrays | Classificar estado, contador, acumulador, percorrer fila | Processar fila vazia/parcial/concluída e corrigir um erro de limite |
| 3. Programa que cresce | SDK, arquivos, terminal, métodos, escopo, decimal, nullable, erros, classes, interfaces, List/Dictionary, generics e LINQ | Método com parâmetros/retorno, modelo, consulta de coleção, primeiro commit | Catálogo console com regras separadas e vários serviços |
| 4. Dados persistentes | Tabelas, chaves, relações, SELECT/INSERT/UPDATE/DELETE, JOIN, agregação, transação, índices; depois EF Core | DbContext, configuração do provider, migration, consulta parametrizada/projeção | Reabrir o programa e encontrar dados; relatório por cliente; entender o SQL produzido |
| 5. API e integrações | HTTP/JSON, rotas, verbos, status, DTO, validação, DI, configuração, async/await, cancelamento | Endpoint/controller, serviço injetado, consulta paginada, HttpClient com timeout | API documentada que cadastra/consulta serviços, rejeita entrada inválida e trata falha externa |
| 6. Segurança e qualidade | Autenticação × autorização, validação, segredos, teste unitário/integração, depuração, logs | Verificar dono/permissão, teste de regressão, resposta de erro coerente | Um usuário não altera o serviço de outro; bug reproduzido, corrigido e coberto por teste |
| 7. Entrega e operação | Build, ambiente, logs, pipeline, container e noções de cloud | restore/build/test no CI, configuração externa, health check | Outra pessoa executa e verifica o projeto; aluno identifica por que uma entrega falhou |
| 8. Tarefa autoral e seleção | Ler requisito novo, revisar código alheio, explicar escolhas e comunicar limites | Ticket, PR, README e demonstração | Implementar cancelamento com histórico ou outra regra nova, testar e responder à revisão |

A etapa 3 será dividida em unidades; o aluno aprende métodos antes de classes,
EF ou APIs. Git acompanha o primeiro projeto com SDK. Testar, investigar e ler
mensagens acompanham o percurso inteiro; a etapa 6 aprofunda e integra essas
práticas. Conhecer a estrutura de uma ferramenta não equivale a saber aplicá-la.

## 4. Como cada unidade vai ensinar

1. Um pedido curto da equipe e um exemplo concreto do resultado desejado.
2. Uma previsão: “o que aparece com estes dados?”.
3. Um exemplo pequeno explicado e a escrita do aluno, com ajuda progressiva.
4. Execução e casos de erro/limite, com feedback específico.
5. Uma mudança nos dados ou na regra; o modelo começa a desaparecer.
6. Uma situação nova, com o aluno escrevendo e explicando a solução.
7. Retomada posterior: outra entrada ou bug do mesmo conceito.

As evidências distinguem participação, guia, teste validado e consulta à ajuda.
XP e animação não certificam competência. Usabilidade e transferência serão
conferidas com o Aluno 0 e outros iniciantes; não há eficácia medida ainda.

## 5. IA desde o começo, com verificação

A [documentação do GitHub](https://docs.github.com/en/copilot/get-started/about-github-copilot)
explica revisão humana das sugestões e responsabilidade pelo resultado. Algumas
vagas consultadas também descrevem IA com leitura crítica. Nosso procedimento:

1. Reescrever o pedido e anotar uma entrada comum e uma de limite.
2. Fazer a tentativa que conseguir e executar.
3. Pedir pista, explicação de erro ou revisão de uma mudança pequena.
4. Ler a alteração, verificar dependências/documentação e testar outra entrada.
5. Explicar o que foi mudado, por que funciona e onde houve ajuda.

Usar dados fictícios, sem senhas, tokens, informações de clientes ou código de
terceiros sem autorização. A formação não exige assinatura de IA.

Se “regs de IA” significava **RAG**: recuperar informações de uma base para
apoiar a resposta de um modelo. É uma especialização posterior de produto.
Antes dela: APIs, dados, permissões, testes e avaliação. Integrar um provedor,
validar respostas e medir custo/latência são tarefas diferentes de usar um
assistente para programar. Não presumir inferência gratuita ilimitada.

Frontend, Dynamics/Power Apps, mensageria, DDD, CQRS, MediatR, microsserviços e
Kubernetes entram conforme a vaga e o problema. Não são um pacote de entrada
que todos os alunos precisam dominar antes do primeiro backend.

## 6. O primeiro compromisso do Aluno 0

Escrever o resumo de serviços, executar, trocar os dados e explicar cada linha.
Depois, decisões e laços. A próxima prática é [métodos no
OrbiServiços + SDK/arquivos/terminal/primeiro commit](CSHARP_METODOS_ORBISERVICOS.md),
implementada em 15/11. Ela tem quatro tarefas, do exemplo à aplicação nova.
Rascunhos e conquistas anteriores foram preservados.

**Estado do produto nesta rodada:** variáveis, condições e laços têm práticas
executáveis no navegador. O mapa detalha as oito estações e identifica as aulas
ainda planejadas. Métodos tem preparação no navegador e pacote de projeto
console para executar no computador com SDK .NET 10. Classes, API, EF e o
projeto profissional completo continuam em preparação. O subconjunto didático
do navegador não é .NET completo. O código da Orbitamos continua na stack atual.

## 7. Como avaliar prontidão para começar a concorrer

Repetir uma tarefa inédita num repositório conhecido: esclarecer critérios,
localizar os arquivos, mudar a regra, cobrir o defeito com teste, conferir um
caso inválido e abrir um PR explicável. Demonstrar pelo README como executar.
Reconhecer uma falha, pesquisar documentação e responder à revisão também
fazem parte. Esse conjunto orienta candidaturas compatíveis; nenhum checklist
garante emprego ou substitui os requisitos de cada processo.

Continuidade geral: [Plano de formação](PLANO_FORMACAO_ORBITAMOS.md) e
[execução da Academy](EVOLUCAO_FORMACAO_ACADEMY.md).
