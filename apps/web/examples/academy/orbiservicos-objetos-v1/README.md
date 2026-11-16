# OrbiServiços — fichas, objetos e listas

Você já criou regras com parâmetros e retorno. Agora vai guardar os dados de
cada serviço numa ficha, criar fichas independentes e selecionar uma lista
do trabalho que pode começar. São quatro tarefas com menos apoio a cada etapa.

**A execução usa C# real com SDK .NET 10.** O navegador da Orbitamos serve para
preparar e guardar o rascunho; não compila esta unidade. No celular, prepare-se
e retome num computador ou ambiente remoto que realmente tenha o SDK necessário.
Não precisa contratar editor, serviço de IA, nuvem ou pacote para estudar aqui.

## Abra uma pasta sua

Extraia o ZIP e abra `orbiservicos-objetos-v1` num editor, **fora do repositório
do site Orbitamos**. A fonte editorial fica no monorepo; seu estudo terá outro
repositório. No terminal PowerShell aberto nessa pasta:

```powershell
Get-Location
Get-ChildItem
dotnet --list-sdks
dotnet --version
```

Você deve encontrar `README.md`, `tarefas` e `tools`. O SDK inclui o compilador:
só o runtime não basta. A lista deve conter uma versão estável `10.0.xxx`, e
`--version` deve selecionar a linha 10.0. Se só houver 8/9 ou o comando não
existir, peça ajuda para instalar o SDK 10 conforme a
[orientação oficial](https://learn.microsoft.com/en-us/dotnet/core/install/windows).
O pacote não instala nada e não pede mudar configurações globais.

Se recebeu um SDK portátil, o comando curto `dotnet` pode apontar para outra
instalação. Substitua `dotnet` por `& 'caminho-real\dotnet.exe'`, mantendo os
argumentos seguintes, e confira `--version` no mesmo terminal. Use o caminho
real fornecido pelo orientador; o texto entre aspas aqui é uma indicação de formato.

## Saiba qual arquivo altera

Cada tarefa contém quatro arquivos:

| Arquivo | Sua função |
| --- | --- |
| `MISSAO.md` | Objetivo, ajuda e entrega |
| `Program.cs` | Programa, chamadas e funções locais |
| `Servico.cs` | Tipo com dados e métodos das fichas |
| `OrbiServicos.Console.csproj` | Configuração `net10.0`; não precisa editá-la |

Na tarefa 1 você edita **Servico.cs**, seguindo o modelo guiado.
Nas tarefas 2–4 você edita **Program.cs**; a classe correta já está fornecida
no arquivo separado `Servico.cs`. Mantenha os dois arquivos na mesma pasta do
projeto: copiar só o rascunho de um deles pode deixar nomes faltando.

| Ordem | Missão | Prática |
| --- | --- | --- |
| 1 | [A primeira ficha](tarefas/01-primeiro-servico/MISSAO.md) | Classe, construtor, propriedades e métodos |
| 2 | [Duas fichas separadas](tarefas/02-fichas-separadas/MISSAO.md) | Criar uma instância por chamada |
| 3 | [A cópia emprestada](tarefas/03-copia-emprestada/MISSAO.md) | Investigar duas variáveis que apontam para o mesmo objeto |
| 4 | [A lista do dia](tarefas/04-lista-do-dia/MISSAO.md) | Percorrer e selecionar mantendo fichas e ordem |

Assumimos quantidades válidas: `0 <= Concluidos <= Total`, nomes de clientes
fictícios e listas sem itens nulos. As propriedades têm `get; set;` públicos
para observar e mudar dados nesta primeira prática. Validação de entradas,
encapsulamento e proteção das alterações serão estudados depois. Não tratamos
essa classe didática como um modelo de domínio pronto para produção.

## Salve, compile e execute

Da pasta principal do pacote:

```powershell
dotnet run --project tarefas/01-primeiro-servico/OrbiServicos.Console.csproj
```

Troque a pasta pelo nome da tarefa seguinte. `dotnet run` compila e executa
o que foi salvo. A mensagem do compilador indica arquivo e linha; a saída do
programa aparece quando ele consegue compilar. Depois de editar, execute de
novo. Não use um binário anterior como prova de que um código novo funcionou.

A tarefa 2 começa com uma função sem retorno e ainda não compila; a missão
explica o que completar. Nas outras tarefas há regras incompletas ou um bug
proposital. Elas precisam mudar antes da aprovação.

## Confira as fichas reais

```powershell
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 1
```

Troque por `-Tarefa 2`, `3` ou `4`. O verificador copia **Program.cs e Servico.cs
completos** para sua própria pasta temporária e acrescenta chamadas no fim do
`Program.cs`, no mesmo escopo das funções locais. O tipo permanece no arquivo
separado. Não extrai código por regex e não usa o tradutor do navegador.

São **17, 23, 23 e 26 casos** nas tarefas 1 a 4, respectivamente: contrato da
classe, dados, regras e variações de cada missão. A tarefa 2 verifica novas
instâncias e mudanças independentes; a 3, uma cópia independente; a 4, outra
lista com os mesmos objetos, ordem e ocorrências repetidas, sem alterar a entrada.
O formato do painel é conferido por você com a missão; o verificador chama
as implementações, não dá aprovação só porque o console imprime a resposta.
O uso de `foreach`/`Add` da tarefa 4 também deve ser conferido no seu código.

Para usar SDK portátil:

```powershell
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 4 -DotnetPath 'C:\caminho-real-do-sdk\dotnet.exe'
```

Esse caminho é um exemplo de formato: substitua pelo executável que existe
no computador. Para guardar relatório, acrescente
`-ReportPath .\relatorios\tarefa-4.json`. Ele registra versão selecionada,
caminhos e hashes dos dois arquivos, casos observados e códigos de saída.
Confira o conteúdo antes de compartilhar. Nenhum relatório é enviado à plataforma.

O verificador escolhe o SDK na pasta temporária; um `global.json` de outra
pasta pode mudar a seleção de `dotnet run`. Confira `dotnet --version` no
diretório da tarefa se houver diferença e alinhe os executáveis com o orientador.
Se a política do computador bloquear scripts, peça ajuda; não é necessário
desativar a proteção global. Você ainda pode executar o projeto e comparar
casos reais manualmente.

**Limites:** esta é uma checagem local de contrato, com tempo de execução
limitado, para dois arquivos conhecidos e entradas válidas. Não comprova
autoria, aprendizagem, independência de ajuda ou segurança de código. Execute
apenas código seu ou material em que confia. A marcação “executei no computador”
na Orbitamos continua uma declaração sua, não execução validada pela plataforma.

## Salve um histórico seu

Se você já tem um repositório de estudo da unidade anterior, pode guardar este
pacote dentro dele e continuar a branch de estudo que escolheu. Confira a raiz
com `git rev-parse --show-toplevel` e o estado com `git status`.
Nunca inicialize ou comite dentro do repositório real da Orbitamos por engano.

Se esta é uma pasta nova fora de qualquer repositório existente:

```powershell
git init -b main
git status
git add -- .gitignore NuGet.Config README.md tarefas tools
git diff --cached
git commit -m "chore: inicia estudo de objetos"
git switch -c unidade/objetos
```

Se o Git pedir identidade, configure nome/email que você escolher **só neste
repositório**. Não adivinhe dados de outra pessoa nem altere a configuração global.
`bin/`, `obj/` e `relatorios/` são gerados e estão ignorados. Este pacote não
contém `.git`, credenciais, banco ou configuração do site.

Depois da tarefa 4:

```powershell
git diff
git add -- tarefas
git diff --cached
git commit -m "feat: cria fichas e seleciona servicos liberados"
git status
git log --oneline -2
```

O commit é local. Não exige push, PR ou publicação em nuvem. Guarde uma explicação:
“o que é um objeto, quando nasce outro objeto e o que muda ao criar outra lista”.
Registre se consultou pistas ou solução completa; depois tente outros dados sem
o modelo, para distinguir prática com apoio da aplicação independente.

## Quando algo falhar

| Situação | Primeiro passo |
| --- | --- |
| Projeto ou arquivo não encontrado | Confira `Get-Location`, pasta da tarefa e presença dos dois arquivos C# |
| SDK não reconhece net10.0 | Confira SDK e versão selecionada; não esconda a falta trocando para versão antiga |
| Nome Servico não existe | Confira `Servico.cs` no mesmo projeto, nome exato e se salvou o arquivo |
| Nem todos os caminhos retornam valor | Complete o retorno prometido pela função; leia arquivo/linha do compilador |
| Duas fichas mudam juntas | Observe se as variáveis apontam para a mesma instância |
| A lista original mudou | Confira em qual lista chamou `Add`, `Clear` ou outra alteração |
| Verificação terminou por tempo | Investigue laço que não termina; imprimir respostas antes de travar não aprova |

Se usar IA, peça uma pista ou explicação do erro, confira o diff e execute com
dados diferentes. Copiar uma solução inteira não equivale a escrever a regra sem modelo.
