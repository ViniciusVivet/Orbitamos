# 1. A regra ganhou um nome

OrbiServiços tem oito serviços e concluiu três. Você já sabe fazer essa conta.
Agora vamos dar um nome à regra para usá-la com outros clientes.

1. Abra `Program.cs`. Na chamada `CalcularPendentes(8, 3)`, **8 entra como total**
   e **3 entra como concluidos**. A função devolve o resultado com `return`.
2. Salve e execute, a partir da pasta principal:

```powershell
dotnet run --project tarefas/01-primeira-regra/OrbiServicos.Console.csproj
```

Você deve ver `5`. `Console.WriteLine` mostra o resultado; `return` apenas o
devolve para o lugar da chamada. A definição da função sozinha não a executa.

3. Antes de alterar o arquivo, pense: quanto volta de `CalcularPendentes(8, 5)`?
4. Mude apenas o segundo argumento para `5`, salve e execute outra vez. Deve
   aparecer `3`. A regra continua a mesma; a entrada mudou.

Essas são **funções locais** no programa console. Você não precisa criar uma
classe, escrever `public/static` ou aprender `Main` nesta primeira prática.

Confira também outros valores, sem mudar o corpo da função:

```powershell
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 1
```

Conseguiu apontar entrada, regra e retorno? Volte ao README para criar seu
primeiro checkpoint Git local e depois siga para a tarefa 2.
