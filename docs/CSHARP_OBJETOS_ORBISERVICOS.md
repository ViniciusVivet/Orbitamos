# Objetos no OrbiServiços — uma ficha para cada serviço

Guia pedagógico de **16/11/2026**. A unidade foi implementada nesta rodada.
Os resultados locais e a confirmação de publicação
devem ser registrados separadamente em [Evolução da formação](EVOLUCAO_FORMACAO_ACADEMY.md).
Este documento não atesta execução no computador de cada aluno.

## A ponte depois de métodos

Na [unidade anterior](CSHARP_METODOS_ORBISERVICOS.md), o aluno deu nome à conta,
passou argumentos e recebeu um retorno. Agora vai reunir os dados e as regras
de um serviço numa ficha própria. A mesma história continua: quantidade total,
quantidade concluída e pagamento determinam o que ainda pode começar.

O objetivo observável é criar duas instâncias de `Servico`, explicar qual
objeto uma variável referencia, perceber quando dois nomes apontam para a mesma
instância e percorrer uma lista sem alterar os dados recebidos. Não é necessário
ensinar herança, interfaces, EF ou API para atingir esse objetivo.

Pré-requisitos: localizar `Program.cs`, salvar e executar um projeto no SDK 10;
usar parâmetros e `return`; ler uma condição com duas exigências; acompanhar
um `foreach`. Se a pessoa ainda não explica a conta de pendências, retomar um
caso da unidade de métodos antes de acrescentar classe e construtor.

O domínio desta prática é explícito: nomes não nulos e quantidades válidas,
com `0 <= Concluidos <= Total`. As propriedades públicas com `get; set;` são
uma escolha didática para observar alterações. **A classe desta unidade não
garante impedir estados inválidos.** Validação, encapsulação e proteção das
alterações serão ensinadas depois; não as cobrar como requisito escondido.

## Explicar uma mudança de cada vez

| Conceito | O que o aluno precisa observar | Apoio necessário |
| --- | --- | --- |
| Classe e instância | `Servico` descreve a ficha; cada `new Servico(...)` cria uma instância. | Uma ficha concreta antes da declaração inteira. |
| Propriedade | `servico.Total` lê um dado dessa instância; atribuir a `Concluidos` muda esse dado. | Destacar objeto, ponto e propriedade na mesma linha. |
| `get; set;` e `public` | O exemplo permite ler e atribuir propriedades pelo programa; os métodos podem ser chamados a partir dele. | Explicar a permissão e a sintaxe quando aparecem, sem uma aula de todos os modificadores. |
| Construtor | Recebe os dados iniciais; tem o nome `Servico` e não declara um tipo de retorno. | Mapear cada argumento ao parâmetro e à propriedade correspondente. |
| Método de instância | `servico.CalcularPendentes()` usa os dados daquela ficha. | Comparar com a chamada anterior que recebia dois números. |
| Referência | Atribuir uma variável a outra pode dar dois nomes à mesma instância. | Setas para a ficha e previsão antes de alterar o estado. |
| Lista | Uma lista reúne referências; um resultado pode ser uma lista nova com as mesmas instâncias. | Separar o recipiente dos elementos, preservando ordem e repetições. |

O construtor não precisa imprimir nada. A expressão com `new` cria a instância;
a função local `CriarServico` pode devolvê-la ao chamador. Não dizer que o
construtor tem um `return Servico`, nem que uma variável contém uma cópia
independente de todos os dados sempre que recebe outra variável.

Uma classe comum é um tipo por referência: a atribuição entre variáveis pode
compartilhar a mesma instância. O construtor inicializa a instância criada.
Referências oficiais: [classes](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes),
[construtores](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/constructors)
e [tipos por referência](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types).
As [propriedades automáticas](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties)
permitem começar sem expor a implementação de armazenamento de cada dado.

## Quatro tarefas, com retirada gradual do modelo

### 1. Guiada — a primeira ficha

O aluno edita somente `Servico.cs`. O `Program.cs` companheiro já usa a classe
e deve ficar consultável, com o nome do arquivo visível. Assim ele vê para que
serve o trecho que escreve, sem precisar construir os dois arquivos de uma vez.

A classe reúne quatro propriedades públicas:

| Propriedade | Tipo | Papel na ficha |
| --- | --- | --- |
| `Cliente` | `string` | Nome fictício usado na ficha do serviço. |
| `Total` | `int` | Quantidade combinada. |
| `Concluidos` | `int` | Quantidade terminada. |
| `Pago` | `bool` | Pagamento confirmado ou ausente. |

O construtor `Servico(string cliente, int total, int concluidos, bool pago)`
atribui cada entrada à propriedade correspondente. Separar parâmetro `total`
de propriedade `Total`: a diferença de maiúscula faz parte dos nomes.
Depois, acrescentar `public int CalcularPendentes()` e
`public bool PodeIniciar()`. Eles usam o estado da instância; a decisão exige
pendência positiva e pagamento confirmado, como na unidade anterior.

Não apresentar todas as linhas novas como um único bloco a decorar. Mostrar
primeiro a chamada do companheiro, depois propriedades, construtor e métodos.
Pedir uma previsão com dados válidos diferentes antes da execução real.
Entrega: a ficha recebe os quatro dados, o cálculo acompanha esses dados e o
aluno aponta onde está o objeto usado em cada chamada.

### 2. Apoio parcial — duas fichas separadas

O aluno edita somente `Program.cs`; `Servico.cs` é fornecido. A assinatura
da função local é `Servico CriarServico(string cliente, int total,
int concluidos, bool pago)`. Ela cria uma instância com os argumentos recebidos
e devolve a referência para essa nova instância.

Deixar dados e objetivo visíveis, retirando o corpo pronto. Duas chamadas
devem produzir instâncias distintas com seus próprios valores. Alterar
`Concluidos` da primeira e conferir que a segunda mantém seu estado. Os dados
escolhidos para essa alteração continuam dentro do domínio válido.

Pistas graduais: o tipo retornado agora é `Servico`; os argumentos precisam
chegar ao construtor na ordem correta; criar uma instância diferente exige
uma nova criação. Não exigir que a pessoa adivinhe uma função-fábrica com
cache ou introduza membros estáticos.

### 3. Investigação — a cópia emprestada

O aluno edita somente `Program.cs`. O bug preparado em
`Servico CriarCopia(Servico original)` devolve `original`. Inicialmente os
valores parecem corretos, porque os dois nomes apontam para a mesma ficha.

Antes de corrigir, prever e observar o que acontece ao alterar `Concluidos`
pelo nome que deveria representar a cópia. Anotar o estado das duas variáveis
antes e depois. A correção deve criar outra instância, inicialmente com os
quatro valores do original. Depois, uma atribuição na cópia não deve mudar o
original; uma atribuição no original também não deve mudar a cópia.

Não entregar a linha corrigida junto da primeira pergunta. A pista pode
apontar as setas do desenho e a criação de outra ficha. Comparar instâncias
somente por seus nomes ou pelos resultados impressos não comprova identidade.
A revisão local pode conferir identidade com `ReferenceEquals`, sem exigir
que o aluno aprenda esse recurso antes da observação.

Essa é uma cópia dos quatro valores desta ficha didática. Não anunciar um
clonador geral ou uma cópia profunda de qualquer objeto futuro. Nesta unidade,
os números e o booleano são valores; o nome é um texto, e o exercício altera
propriedades por atribuição, sem introduzir um objeto mutável aninhado.

### 4. Independente — a lista do dia

O aluno edita somente `Program.cs` e escreve
`List<Servico> SelecionarLiberados(List<Servico> servicos)`. O pedido é devolver
uma lista nova contendo somente as instâncias com pagamento confirmado e
pendência positiva. Usar `foreach` para percorrer e `Add` para acrescentar os
elementos selecionados; LINQ e lambdas ficam para outra unidade.

O briefing, sem solução completa, precisa declarar:

- Entrada vazia devolve uma lista vazia nova, em vez de `null`.
- A ordem relativa e todas as ocorrências elegíveis da entrada são preservadas.
- Os elementos devolvidos são as mesmas instâncias recebidas, sem recriá-las.
- A lista recebida mantém quantidade, ordem e referências; os objetos mantêm
  seus valores. Não remover itens nem mudar pagamento ou quantidade para
  forçar uma aprovação.

Uma ocorrência repetida de uma instância elegível deve aparecer duas vezes
no resultado. Uma instância sem pendências, mesmo paga, fica de fora. Uma
instância com pendências e sem pagamento também fica de fora. Não inverter a
condição para usar “uma exigência ou a outra”.

Aqui está a distinção central em relação à tarefa 3: **a lista é nova, mas
as fichas selecionadas são compartilhadas**. Não alterar a entrada durante
a seleção não significa que esses objetos se tornaram imutáveis. Uma alteração
posterior numa instância compartilhada será observada por suas referências.
As referências técnicas são [`List<T>` no .NET 10](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1?view=net-10.0)
e [`foreach`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements#the-foreach-statement).

Entrega: lista correta para casos mistos, vazios, pagos sem pendências,
pendências sem pagamento e referências repetidas. O aluno explica por que criou
uma lista nova sem criar novos serviços, depois tenta outra entrada sem modelo.

## Um arquivo para escrever, outro para consultar

Cada tarefa possui `OrbiServicos.Console.csproj`, `Program.cs`, `Servico.cs` e
`MISSAO.md`. O foco editável precisa aparecer antes do rascunho e antes de
copiar/importar. O arquivo companheiro fica visível para consulta e é compilado
junto no projeto real. Não ensinar que cada arquivo `.cs` é um programa isolado.
O material-fonte fica em `apps/web/examples/academy/orbiservicos-objetos-v1`;
o pacote do aluno é `orbiservicos-objetos-v1.zip`. Soluções e ferramentas
editoriais não devem entrar no download.

| Tarefa | Pasta sob `tarefas/` | Foco editável | Companheiro fornecido |
| --- | --- | --- | --- |
| 1 | `01-primeiro-servico` | `Servico.cs` | `Program.cs` |
| 2 | `02-fichas-separadas` | `Program.cs` | `Servico.cs` |
| 3 | `03-copia-emprestada` | `Program.cs` | `Servico.cs` |
| 4 | `04-lista-do-dia` | `Program.cs` | `Servico.cs` |

Extraia o pacote numa pasta de estudo separada do site e abra o README. A
instalação oficial do SDK 10, o terminal, a seleção de versão e o Git local
seguem a [orientação de métodos](CSHARP_METODOS_ORBISERVICOS.md). Na raiz extraída,
depois de salvar o arquivo correto, a primeira tarefa usa:

```powershell
dotnet run --project tarefas/01-primeiro-servico/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 1
```

Nas próximas, troque a pasta do projeto e o número da tarefa. A ferramenta usa
`-SourcePath` para um foco alternativo, além de `-DotnetPath` e `-ReportPath`;
o companheiro vem do material da tarefa. Não confundir essa conferência do foco
com uma revisão de qualquer edição feita fora dele. Um SDK privado é chamado
com `&` e seu caminho real no PowerShell; o verificador recebe esse caminho
em `-DotnetPath`. Compilação e execução precisam usar o SDK adequado, sem
trocar versões globais para esconder um problema.

Após executar e explicar uma alteração, ler `git diff`, preparar somente os
arquivos de estudo e fazer um commit local no repositório do aluno. Um commit
não publica o site nem envia nada ao GitHub. `bin/`, `obj/`, relatórios e dados
de contas reais não fazem parte da entrega de estudo.

## Diagrama útil e interface

Usar duas fichas com os dados reais do exemplo e nomes de variáveis fora delas.
Na tarefa 2, cada nome aponta para sua ficha. No bug da tarefa 3, dois nomes
apontam para uma ficha; ao corrigir, passam a apontar para duas. Um controle
de antes/depois pode destacar `Concluidos` e o retorno que depende dele.

Na tarefa 4, desenhar dois recipientes de lista e manter as fichas fora deles,
ligadas por setas. A lista de saída contém referências às fichas elegíveis;
duas ocorrências da mesma ficha recebem duas setas. Isso ajuda a evitar que o
aluno confunda criar uma lista com copiar seus objetos.

O diagrama é um modelo explicado, não a execução do rascunho pelo navegador.
Não usar endereços de memória inventados ou afirmar que a animação observou
o computador do aluno. Oferecer texto equivalente e preservar movimento
reduzido. O editor e o diagrama são mídia funcional; a entrada segue o
[padrão visual aprovado](PADRAO_VISUAL_ACADEMY.md), com uma ação principal e
contexto visual útil, inclusive em 320 px. Explicações necessárias ficam junto
da tarefa, enquanto instalação longa e detalhes administrativos ficam sob demanda.

## Evidência e limites da rodada

O navegador prepara rascunhos, previsões e consulta à ajuda. O SDK no computador
compila e executa o projeto real. Declarar “executei” continua sendo um registro
do aluno, sem resultado confirmado pela Orbitamos. Importação transporta texto
da atividade e seu nome de arquivo, sem executar código nem transferir domínio,
aprovação, XP ou histórico de ajuda de outra conta.

O verificador deve conferir os dois arquivos completos no projeto apropriado,
identidade e estado, além dos valores retornados. Precisa rejeitar referências
reutilizadas nas tarefas 2/3, cópia indevida na tarefa 4, entrada alterada,
resultado fixo, assinatura incompatível, saída precoce e execução sem término.
São critérios a executar e registrar; sua presença neste guia não é aprovação
antecipada do material ou de um aluno.

Referências Microsoft consultadas em **16/11/2026**. Nesta revisão documental
não houve instalação, build, execução .NET, teste de navegador ou commit. A
verificação técnica será registrada com seus resultados reais e não substitui
observar um iniciante escrever, explicar e adaptar a solução.
