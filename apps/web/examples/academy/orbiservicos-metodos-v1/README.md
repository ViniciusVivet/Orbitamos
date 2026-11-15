# OrbiServiços — uma regra que você pode reutilizar

Você já calculou serviços pendentes. Agora vai dar um nome à regra, usá-la para
outros clientes e salvar um projeto seu. São quatro tarefas, com cada vez menos
modelo pronto.

**Este pacote usa C# de verdade no SDK .NET 10.** O editor didático do navegador
da Orbitamos ainda não executa métodos. No celular, você pode ler e preparar um
rascunho; para executar este pacote, precisa de computador com SDK 10 ou de um
ambiente remoto que realmente o tenha. Não é preciso pagar por editor, curso,
serviço de IA ou nuvem para fazer os exercícios locais.

## 1. Prepare uma pasta sua

1. Extraia o ZIP. Abra a pasta `orbiservicos-metodos-v1` no seu editor.
2. Guarde essa pasta em seus documentos, **fora do repositório do site Orbitamos**.
3. No editor, abra um terminal PowerShell nessa pasta. Você deve enxergar
   `README.md`, `tarefas` e `tools` ao executar `Get-ChildItem`.
4. Confira se o SDK 10 está disponível:

```powershell
dotnet --list-sdks
dotnet --version
```

Deve existir uma linha estável `10.0.xxx` na lista, e `--version`, executado na
pasta do pacote, deve selecionar essa linha 10.0. O SDK inclui o compilador e as
ferramentas; ter só o runtime não basta. Se aparecer apenas 8/9 ou “comando não
encontrado”, peça ajuda para preparar o SDK 10. O pacote não instala nada.
Consulte [a instalação oficial](https://learn.microsoft.com/en-us/dotnet/core/install/windows).
O material não depende de administrador global: uma instalação portátil oficial
pode ser preparada pelo orientador. Não cole scripts de instalação desconhecidos.

Com SDK portátil, o comando curto `dotnet` pode continuar apontando para outra
instalação. Nos comandos deste guia, use `& 'caminho-real\dotnet.exe'` no lugar
de `dotnet`, mantendo os argumentos seguintes, ou peça ao orientador um terminal
que selecione esse SDK. Confira `--version` nesse mesmo terminal. No verificador,
informe o mesmo executável em `-DotnetPath`, como explicado adiante.

## 2. Encontre o que vai editar

Cada pasta em `tarefas` tem três arquivos importantes:

- `MISSAO.md`: objetivo, ajuda e resultado esperado.
- `Program.cs`: **é aqui que você escreve C#**. Salve antes de executar.
- `OrbiServicos.Console.csproj`: configura o projeto para `net10.0`; não precisa
  editar esse arquivo nesta unidade.

As pastas `bin` e `obj` serão criadas pelas ferramentas. Elas não são seu código
e não entram no commit. `NuGet.Config` mantém este primeiro exercício sem fontes
externas de pacotes: o SDK e os pacotes de framework corretos ainda precisam
estar instalados. Não é promessa de que qualquer máquina funciona offline.

## 3. Faça uma tarefa por vez

| Ordem | Abra a missão | O que muda |
| --- | --- | --- |
| 1 | [A regra ganhou um nome](tarefas/01-primeira-regra/MISSAO.md) | Modelo completo, primeira execução e outro argumento |
| 2 | [Uma regra, três clientes](tarefas/02-tres-clientes/MISSAO.md) | Assinatura pronta; você escreve a regra |
| 3 | [Passou uma vez, mas está errado](tarefas/03-investigue-o-bug/MISSAO.md) | Um bug proposital; você investiga e corrige |
| 4 | [Quem pode começar o trabalho?](tarefas/04-painel-independente/MISSAO.md) | Briefing novo, sem solução pronta |

Para executar a primeira tarefa, na pasta principal do pacote:

```powershell
dotnet run --project tarefas/01-primeira-regra/OrbiServicos.Console.csproj
```

Troque a pasta para executar as próximas. `dotnet run` compila e executa o que
você salvou. Uma mensagem de compilação indica arquivo e linha; saída do seu
programa é o que aparece depois de ele conseguir compilar. Não tente rodar um
binário antigo depois de um erro para dizer que o código novo funcionou.

## 4. Confira a regra, não apenas a mensagem do console

O verificador usa o compilador .NET e chama as funções que você escreveu com
entradas diferentes. Ele copia seu `Program.cs` completo para uma pasta temporária
e acrescenta chamadas **no mesmo arquivo e escopo**; não extrai função por regex
e não usa o tradutor didático do navegador.

```powershell
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 1
```

Use `-Tarefa 2`, `3` ou `4` conforme o exercício. Nas tarefas 1–3 são cinco
checagens de cálculo. Na tarefa 4 são nove, incluindo a decisão sobre pagamento.
O modelo incompleto e o bug preparados nas tarefas 2/3 **devem falhar antes da
sua correção**. Na tarefa 4, enquanto as funções não existirem, o verificador
informará os nomes que ainda faltam. Isso faz parte da tarefa, não é pacote pronto.

O verificador escolhe o SDK na sua pasta temporária própria; o relatório mostra
qual executável e versão usou. Se um `global.json` de outra pasta mudar a versão
de `dotnet run`, confira `dotnet --version` no diretório da tarefa e peça ajuda
para alinhar os dois. O pacote não altera configurações de outros projetos.

Se o PowerShell bloquear scripts pela política do computador, peça ajuda ao
orientador. Não é necessário alterar a política global nem desativar proteção
do Windows. Você ainda pode usar `dotnet run` e conferir as entradas da missão.

Se o orientador forneceu o executável de um SDK portátil, o caminho é explícito:

```powershell
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 4 -DotnetPath 'C:\caminho-do-seu-sdk\dotnet.exe'
```

O caminho acima é só um exemplo: use o caminho que realmente existe. Para guardar
um relatório local, acrescente `-ReportPath .\relatorios\tarefa-4.json`. Ele contém
resultado, versão selecionada e hash do arquivo verificado; confira seu conteúdo
antes de compartilhar. O verificador não envia dados a nenhuma conta ou servidor.

**Limites:** as checagens cobrem este contrato de funções locais, em um único
`Program.cs`, e entradas válidas. Não são antivírus, proteção contra fraude,
atestado de domínio ou prova de quem escreveu o código. Execute somente seu
próprio programa ou material em que confia. A execução tem limite de tempo.

Na Orbitamos, marcar “executei no meu computador” continua sendo uma declaração
sua. Um relatório local não vira automaticamente avaliação validada pela plataforma.

## 5. Seu primeiro commit é local

Depois de executar a tarefa 1, confira se **esta pasta de estudo está fora de
qualquer repositório existente**. O pacote não contém uma pasta `.git`.

```powershell
git init -b main
git status
git add -- .gitignore NuGet.Config README.md tarefas tools
git diff --cached
git commit -m "chore: inicia estudo de metodos"
git switch -c unidade/metodos
```

Se já houver repositório na pasta ou acima dela, pare e peça ajuda para não
commitar no projeto errado. Se o Git pedir nome/email, configure sua identidade
**neste repositório**, com os dados que você escolher; não use os dados de outra
pessoa. Não precisa publicar nada no GitHub para fazer este primeiro commit.

Depois da tarefa 4:

```powershell
git diff
git add -- tarefas
git diff --cached
git commit -m "feat: calcula pendencias e decide inicio do trabalho"
git status
git log --oneline -2
```

Leia o diff antes de salvar o ponto no histórico. Commit não significa push,
deploy ou publicação do site. Aqui a `main` é a do seu repo de estudo, não a da
Orbitamos. Branch e PR serão aprofundados depois.

## Se travar

| O que apareceu | O que conferir primeiro |
| --- | --- |
| Projeto não encontrado | Execute `Get-Location` e confira se o terminal está na pasta principal do pacote |
| Não conhece `net10.0` | Confira SDKs instalados; não troque o exercício para versão antiga só para esconder a falta do SDK |
| Nome não existe no contexto | Compare maiúsculas/minúsculas e onde a variável ou função foi declarada |
| Nem todos os caminhos retornam um valor | Uma função que declara retorno precisa realmente devolver um valor |
| Compilou, mas o número está errado | Use outras entradas, anote esperado/obtido e veja os argumentos no debugger |
| Verificador terminou por tempo | Procure laço que não termina; nada será aprovado por imprimir a resposta antes de travar |

Quer usar IA? Peça uma pista ou explicação de erro, leia o diff, execute com
novas entradas e explique a regra depois. Consultar ajuda é permitido; não
confunda copiar uma solução inteira com conseguir escrevê-la sem o modelo.

Ao concluir, guarde código, commit e uma explicação curta: “o que entra, o que
sai e por que funciona também para outro cliente”.
