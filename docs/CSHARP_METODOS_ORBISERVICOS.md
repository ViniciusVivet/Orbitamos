# Métodos no OrbiServiços — do guia ao projeto .NET

Documento de operação e contrato pedagógico, iniciado em **15/11/2026**. A unidade está sendo integrada nesta rodada. O registro final de testes, publicação e limites fica em [Evolução da formação](EVOLUCAO_FORMACAO_ACADEMY.md); este guia não atesta deploy nem execução feita no computador de cada aluno.

## O que esta unidade ensina

O aluno já praticou variáveis, condições e laços. Agora deve dar nome a uma regra, receber dados por parâmetros, devolver um resultado e reutilizar a mesma regra com outros dados. A história continua no OrbiServiços: calcular serviços pendentes e decidir se o trabalho pode começar.

As primeiras funções são locais dentro de `Program.cs`, com instruções de nível superior. O aluno começa pela chamada e pela regra, sem precisar escrever uma classe, `Main`, `public` ou `static`. Mais adiante, a mesma regra poderá ser um método de um tipo. Esta unidade exige usar os parâmetros recebidos; a regra não deve depender de variáveis externas à função para responder aos casos. Referências: [funções locais](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/building-software/local-functions) e [instruções de nível superior](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements).

O exemplo precisa separar três ações: **declarar** a função, **chamá-la** com argumentos e **usar** o valor retornado. `return` devolve um valor; `Console.WriteLine` mostra um valor. Imprimir o resultado esperado sem implementar a regra não demonstra que a função funciona.

O percurso previsto tem quatro tarefas, nessa ordem:

1. **Primeira regra:** acompanhar parâmetros, chamada e retorno de `CalcularPendentes`.
2. **Três clientes:** reutilizar a mesma função e explicar por que cada chamada pode produzir um resultado diferente.
3. **Investigue o bug:** reproduzir uma regra incorreta, prever o resultado e corrigir a causa.
4. **Painel independente:** combinar cálculo e decisão sem receber o programa inteiro pronto.

Exemplos de conferência do cálculo incluem `(8, 3) → 5`, `(5, 5) → 0` e `(0, 0) → 0`. Na decisão, há trabalho liberado em `(8, true)` e não há em `(0, true)` ou `(3, false)`. Nesta unidade, as quantidades são válidas: `0 <= concluidos <= total`. Quantidade negativa ou conclusão maior que o total ficam para outra prática, sem virar requisito escondido.

As pistas devem ser abertas por escolha do aluno, uma de cada vez. Consultar ajuda é permitido e fica separado de conseguir escrever sem modelo. Após ver uma solução completa, oferecer uma entrada nova para tentar a aplicação independente. Explicar palavras da linguagem, como `return` e `bool`, pelo efeito que têm no programa; não acrescentar uma aula de vocabulário inglês/português sem o apoio escrito e sonoro exigido pelo [método de inglês](METODO_INGLES_ORBI.md).

## Celular, computador e evidência são coisas diferentes

| Situação | O que o aluno pode fazer | O que ela comprova |
| --- | --- | --- |
| Celular ou navegador | Ler o pedido, prever a saída, escrever/revisar e guardar um rascunho. | Preparação e tentativa. O laboratório limitado não executa os métodos desta unidade. |
| Botão de confirmação do aluno | Registrar que afirma ter executado uma tarefa no PC. | **Autodeclaração**, com data. Não comprova instalação, compilação ou aprovação. |
| `dotnet build` no PC | Compilar o projeto real com SDK e ler os erros. | Que aquele projeto compila naquele ambiente; não que a regra está correta. |
| `dotnet run` no PC | Executar o programa e conferir a saída. | O comportamento daquela execução. Saída isolada não comprova retorno reutilizável. |
| Verificador local do pacote | Compilar o arquivo inteiro e chamar as funções reais com outros argumentos. | Resultado dos casos conferidos no código local. Não é uma nota autenticada enviada ao servidor. |
| QA do material pela Orbitamos | Executar soluções e contraexemplos autorais no SDK real. | Qualidade do material testado naquela rodada; não execução de cada aluno. |

O modelo da unidade usa registros `self-report` separados de rascunhos, previsões e consulta a pistas. Não concede domínio, XP ou aprovação pelo parser limitado do navegador. Esses programas não devem ser enviados a `runCSharpInWorker` como se o Worker compilasse métodos. Importar um rascunho traz texto; não o executa automaticamente. A passagem ao PC precisa ser explícita, preservando o que foi escrito no celular.

O save de preparação pertence à conta no navegador e não equivale a sincronização entre aparelhos. O formato de transferência da unidade é um arquivo JSON de rascunho com o texto e a atividade; ele não é o próprio projeto C#. No computador, o aluno retoma o rascunho e leva somente o código C# ao `Program.cs` correspondente. Não deve renomear o JSON para `.cs` nem substituir o arquivo de projeto por ele.

## Preparar o Windows para estudar

Use uma pasta de estudos própria, separada do repositório do site da Orbitamos. Não inicialize o Git nem rode comandos de criação de projeto na pasta do site por engano. O pacote da unidade tem seus próprios projetos console.

### Opção usual: SDK oficial instalado no Windows

1. Abra [Downloads do .NET 10](https://dotnet.microsoft.com/en-us/download/dotnet/10.0).
2. Escolha **SDK**, Windows e a arquitetura do computador. O Runtime sozinho não permite desenvolver/compilar. O SDK inclui o runtime correspondente.
3. Use o instalador oficial; confira o fornecedor Microsoft antes de executar. Instalação para todo o sistema pode pedir administrador. A alternativa oficial no WinGet é `winget install Microsoft.DotNet.SDK.10`.
4. Feche e reabra o terminal depois da instalação. Confira:

```powershell
dotnet --list-sdks
dotnet --info
```

Deve existir um SDK `10.0.x` compatível com os projetos `net10.0`. O número exibido por `dotnet --version` depende também da seleção de SDK na pasta atual; não confunda a versão do runtime com a do SDK. Não instalar um preview para resolver uma tarefa introdutória. Fontes: [instalação no Windows](https://learn.microsoft.com/en-us/dotnet/core/install/windows) e [CLI .NET](https://learn.microsoft.com/en-us/dotnet/core/tools/).

### Sem administrador: instalação privada, com orientação

Um SDK pode ficar numa pasta gravável do usuário e ser chamado por caminho completo, sem modificar o PATH global. A Microsoft documenta instalação manual por arquivo compactado e o script `dotnet-install` para cenários sem administrador. Isso é uma alternativa à instalação usual, não uma tentativa de contornar políticas do computador de uma escola ou empresa.

- Para o ZIP, selecione o binário oficial de Windows/arquitetura correta na página de downloads. Confira o SHA-512 publicado para aquele arquivo antes de extrair. Guarde em uma pasta própria, como `%LocalAppData%\Orbitamos\dotnet10`.
- Para o script, a referência oficial é [dotnet-install](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-install-script) e o endereço oficial é [dot.net/v1/dotnet-install.ps1](https://dot.net/v1/dotnet-install.ps1). A documentação aceita `-Channel 10.0 -Quality GA -InstallDir <pasta-do-usuario>`; omitir `-Runtime` instala o SDK. Não há neste guia comando que execute código remoto automaticamente. Não substituir por script de terceiros nem recomendar desativar validações de segurança.
- A instalação privada não promete manutenção automática nem PATH persistente. Use o `dotnet.exe` da pasta escolhida. Um exemplo de consulta, **depois** de instalar/extrair o SDK, é:

```powershell
$orbiDotnet = Join-Path $env:LOCALAPPDATA 'Orbitamos\dotnet10\dotnet.exe'
& $orbiDotnet --list-sdks
& $orbiDotnet --info
```

Este exemplo não baixa nem instala o SDK. Se o arquivo não existe, ainda é preciso preparar o ambiente. Configurar `DOTNET_ROOT` ou o PATH pode ser útil em outros cenários, mas não é necessário alterar variáveis permanentes para invocar esse executável diretamente. Consulte os requisitos do sistema na [documentação Windows](https://learn.microsoft.com/en-us/dotnet/core/install/windows); nem todo equipamento antigo aceita a versão atual.

Nos comandos de projeto deste guia, quem usa a instalação privada troca o início `dotnet` por `& $orbiDotnet`, no mesmo terminal em que definiu esse caminho. Por exemplo, `& $orbiDotnet --version` confere o SDK privado; `dotnet --version` ainda pode chamar outra instalação do computador. Para o verificador do pacote, a opção correspondente é `-DotnetPath $orbiDotnet`.

### Criar, compilar e executar têm papéis diferentes

O pacote já contém os projetos desta unidade. O caminho principal é **extrair e abrir o pacote**, sem criar outro projeto por cima dele. Em uma pasta própria fora do site da Orbitamos:

1. Extraia o ZIP e abra a pasta `orbiservicos-metodos-v1` no editor.
2. Abra `tarefas/01-primeira-regra/MISSAO.md` e depois `Program.cs` nessa mesma pasta.
3. Localize `OrbiServicos.Console.csproj`: ele descreve o projeto e usa `net10.0`. Não precisa editá-lo nesta unidade.
4. Abra um terminal PowerShell na raiz extraída. `Get-Location` mostra onde ele está; `Get-ChildItem` deve mostrar `README.md`, `tarefas` e `tools`.
5. Confira o SDK **nessa pasta**, usando `dotnet --version`. Ele deve selecionar um SDK 10 suportado. Se a seleção divergir de `--list-sdks`, peça ajuda para conferir a seleção e eventual `global.json`; não apague arquivos nem troque o projeto para SDK antigo para esconder o problema.
6. Edite `Program.cs` e salve (`Ctrl+S`) antes de executar.

Da raiz do pacote, estes são os caminhos das quatro práticas:

| Tarefa | Arquivo a editar | Caminho passado a `--project` |
| --- | --- | --- |
| 1 | `tarefas/01-primeira-regra/Program.cs` | `tarefas/01-primeira-regra/OrbiServicos.Console.csproj` |
| 2 | `tarefas/02-tres-clientes/Program.cs` | `tarefas/02-tres-clientes/OrbiServicos.Console.csproj` |
| 3 | `tarefas/03-investigue-o-bug/Program.cs` | `tarefas/03-investigue-o-bug/OrbiServicos.Console.csproj` |
| 4 | `tarefas/04-painel-independente/Program.cs` | `tarefas/04-painel-independente/OrbiServicos.Console.csproj` |

Para a primeira execução, depois de salvar:

```powershell
dotnet build tarefas/01-primeira-regra/OrbiServicos.Console.csproj --nologo
```

**Somente se o build terminar sem erro**, execute a versão compilada, sem editar entre os dois comandos:

```powershell
dotnet run --project tarefas/01-primeira-regra/OrbiServicos.Console.csproj --no-build
```

No ciclo normal de editar e experimentar, um comando faz as duas etapas:

```powershell
dotnet run --project tarefas/01-primeira-regra/OrbiServicos.Console.csproj
```

Depois de editar, salve e execute novamente. Se compilar falhar, leia o arquivo, a linha e a mensagem antes de continuar. Uma saída de binário antigo não confere a tentativa atual. Os comandos oficiais são [`dotnet build`](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-build) e [`dotnet run`](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-run).

Não confunda restauração de dependências com execução: build/run podem fazer restore implicitamente. Um projeto sem pacotes externos pode ser conferido com o SDK correto e seu material de referência local; a preparação inicial ainda exige o SDK completo. O pacote não deve prometer funcionar sem rede se o equipamento estiver sem os componentes necessários.

### Quando o objetivo for criar seu primeiro projeto vazio

Este é um caminho opcional, separado do pacote. Crie uma **nova pasta vazia de estudos**, abra o terminal nela e confira `Get-Location`. Então:

```powershell
dotnet --version
dotnet new console --name OrbiServicos.Console --framework net10.0
dotnet new gitignore
dotnet run --project OrbiServicos.Console/OrbiServicos.Console.csproj
```

O primeiro comando confere a seleção; `new console` cria `Program.cs` e o `.csproj`; `new gitignore` cria as regras para arquivos gerados. Abra o `Program.cs` criado na subpasta, substitua o exemplo inicial pelo código guiado, salve e rode novamente. Não execute `new console` sobre uma tarefa já extraída e não use `--force` para vencer um conflito. A [referência de `dotnet new`](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-new) explica a criação por template. A conferência `tools/verificar.ps1` pertence ao pacote; um projeto vazio não ganha esse arquivo automaticamente.

### Acompanhar o retorno e investigar o bug

No modelo guiado, o percurso é `8 → total`, `3 → concluidos`, `5 → retorno`. A chamada entrega os valores; a função calcula; quem chama pode guardar o retorno numa variável e então mostrá-lo com `Console.WriteLine`. Antes de trocar o segundo argumento para `5`, o aluno prevê o novo retorno; só depois salva e executa para comparar.

Na terceira tarefa, o retorno fixo `5` é um bug proposital: `(8, 3)` parece correto e `(5, 5)` revela a falha. Registre esperado/obtido antes de corrigir. Não resolva alterando o número fixo para `0`, nem removendo as chamadas que revelam o erro.

Em um editor com depurador C# preparado, marque um ponto de parada na linha do retorno, inicie a depuração do projeto console e observe `total` e `concluidos` em chamadas diferentes. Avance até o retorno e compare com a previsão. Sem depurador configurado, acompanhe a mesma tabela manualmente e peça ajuda para prepará-lo; acompanhar no papel não deve ser registrado como sessão de depuração executada.

Uma função que promete `int` precisa devolver um valor nos caminhos que terminam normalmente. Um corpo ainda vazio pode falhar no build; leia a mensagem real com arquivo/linha. Uma função com `return 5` pode compilar e ainda estar errada. Esses dois problemas pedem verificações diferentes.

### Conferir as funções com o pacote

Na raiz extraída, depois de salvar o arquivo da tarefa:

```powershell
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 1
```

Use `-Tarefa 2`, `3` ou `4` para a prática correspondente. São cinco chamadas de cálculo nas tarefas 1–3 e nove na tarefa 4, incluindo a decisão. O verificador chama as funções reais no mesmo escopo do arquivo inteiro, em uma cópia temporária. O modelo incompleto da tarefa 2 e o bug da tarefa 3 devem falhar antes da correção. Ter as funções corretas não substitui montar e explicar o painel pedido na tarefa 4.

O verificador escolhe o SDK 10 para seu projeto temporário. Isso não prova a seleção de SDK no diretório original do aluno; confira também `dotnet --version` e `dotnet run` nessa pasta. Se o orientador preparou um SDK privado, informe o caminho real ao executável com `-DotnetPath`. Para guardar a evidência em um relatório local, por exemplo:

```powershell
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 1 -ReportPath .\relatorios\tarefa-1.json
```

O relatório contém caminho, versão e hash do código conferido; leia antes de compartilhar. Não envia resultados à conta ou ao servidor. A execução tem limite de tempo e não é um ambiente de isolamento para programas de terceiros: confira seu próprio código ou material em que confia. Se a política do computador impedir scripts, peça ajuda para usar o procedimento permitido; os comandos de `dotnet run` e a comparação manual dos casos continuam separados dessa ferramenta.

## Primeiro registro com Git

Git guarda versões locais; GitHub é um serviço remoto opcional para uma etapa posterior. Não é necessário cadastrar cartão ou publicar o projeto para fazer o primeiro commit.

Instale a partir de [Git para Windows](https://git-scm.com/install/windows). A página oficial também oferece a edição portátil, útil quando não há permissão para instalação convencional. Não baixe executáveis de sites que se apresentam como “aceleradores” ou empacotadores alternativos.

Na **raiz da sua cópia do pacote de estudos**, depois de conferir a tarefa 1, veja onde está antes de iniciar:

```powershell
Get-Location
git --version
git rev-parse --show-toplevel
```

Se o último comando mostrar uma raiz existente, confira a quem pertence: não reinicialize e não faça commit no repositório do site ou em outro projeto. Use uma pasta de estudo separada. Se disser que a pasta não pertence a repositório Git, isso é esperado antes da primeira inicialização. O pacote não inclui uma pasta `.git`. Consulte [`git rev-parse`](https://git-scm.com/docs/git-rev-parse).

Já na pasta de estudo correta, fora de outro repositório:

```powershell
git init -b main
git status
```

Se o Git pedir identidade para o commit, escolha seu nome/email e configure **somente este repositório**. Substitua os exemplos antes de executar; eles serão gravados no histórico:

```powershell
git config --local user.name 'Seu nome escolhido'
git config --local user.email 'seu-email-escolhido@example.com'
```

A opção `--local` evita mudar a identidade usada em outros trabalhos. Não copiar dados de outra pessoa. Consulte [`git config`](https://git-scm.com/docs/git-config).

Confirme que `.gitignore` ignora `bin/` e `obj/` e que o status não inclui instaladores, senhas, tokens ou dados de clientes. Prepare os arquivos do pacote e leia o que será registrado:

```powershell
git add -- .gitignore NuGet.Config README.md tarefas tools
git diff --cached --stat
git diff --cached
git commit -m 'Adiciona minha primeira regra de servicos'
git switch -c unidade/metodos
git status --short
```

`main` pertence a este repositório novo de estudo. A branch `unidade/metodos` guarda a continuação. Na tarefa 4, depois de executar e conferir novas entradas:

```powershell
git diff
git add -- tarefas
git diff --cached
git commit -m 'Calcula pendencias e decide inicio do trabalho'
git status
git log --oneline -2
```

O commit registra o que foi adicionado ao índice. Uma edição posterior exige novo `git add`; `git diff` mostra alterações ainda não preparadas e `git diff --cached` mostra as preparadas. Resultado sem alterações em `git status` significa que não há mudanças pendentes; não atesta qualidade do programa. Fontes oficiais: [registrar alterações](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository) e [`git init`](https://git-scm.com/docs/git-init). Push, PR e publicação podem vir em outra unidade, no repositório do próprio aluno.

## Contrato para revisão do material

- O pacote-fonte fica em `apps/web/examples/academy/orbiservicos-metodos-v1`; o ZIP servido ao aluno deve ser gerado a partir do material destinado a ele, sem soluções de referência reservadas ao QA.
- A conferência deve compilar `Program.cs` inteiro e chamar as funções no mesmo escopo. Extrair somente um corpo por regex ou aceitar saída textual pronta pode aprovar um programa que não corresponde à tarefa.
- O harness deve falhar em retorno fixo, assinatura errada, compilação com erro e ausência de retorno; também deve ter limite de tempo para código que não termina. Nenhuma falha pode resultar em mensagem de aprovação.
- O material inicial precisa dizer claramente o que editar e qual tarefa verificar. Pistas podem explicar o conceito sem entregar automaticamente o programa independente.
- A tarefa 2 retira o corpo e as chamadas prontas: o aluno reutiliza uma única função em três chamadas. A tarefa 3 conserva casos capazes de revelar o retorno fixo. A tarefa 4 entrega o briefing e as entradas, sem o programa completo.
- Casos e resultados devem ser legíveis para iniciantes. `True`/`False` na saída do C# representam valores booleanos formatados pelo console; não transformar a atividade numa cobrança de copiar texto de aprovação.
- A declaração do aluno e os resultados locais não são proteção contra fraude nem avaliação remota autenticada. Não usar esses registros como certificado de domínio.

## Preparação isolada do PC de autoria e QA

O responsável pela rodada preparou o SDK com **ZIP oficial Windows x64 em cache isolado**, comparando SHA-512 com os metadados oficiais do canal 10. O executável desta preparação fica em `C:/Users/dougl/.cache/orbitamos-dotnet/10.0.404/dotnet.exe`. Esse é um caminho do PC de autoria, não um comando para o aluno copiar. As instalações anteriores 8/9 em `C:/Program Files/dotnet` foram preservadas e o PATH global não foi alterado.

Em 15/11/2026, a [página oficial do .NET 10](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) informava SDK `10.0.404`, runtime `10.0.15` e atualização de 10/11/2026. Isso é um retrato da consulta, não uma versão fixa para todos os alunos. A seleção deve usar o item SDK/Windows x64 e comparar o hash do arquivo exato; não usar hash de runtime ou de outra arquitetura.

O registro de QA deve guardar versão/caminho do SDK, sistema/arquitetura, resultado dos builds e verificadores, casos positivos e contraexemplos. Preparar um SDK com sucesso não equivale a conferir os exemplos. Validar uma solução de referência não equivale a corrigir o código de cada aluno. Esta revisão documental conferiu referências oficiais e coerência dos caminhos/conceitos; não executou os comandos de instalação, criação, build, run, verificação ou commit apresentados ao aluno. O resultado da execução feita pela equipe deve constar separadamente no [registro da formação](EVOLUCAO_FORMACAO_ACADEMY.md).
