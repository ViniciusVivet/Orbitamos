# 2. Duas fichas, dados separados

A classe `Servico` está pronta em `Servico.cs`. Agora altere **Program.cs**.
Complete a função local com esta assinatura:

```csharp
Servico CriarServico(string cliente, int total, int concluidos, bool pago)
```

Cada chamada deve devolver **uma nova instância**, com os quatro dados recebidos.
A assinatura promete devolver uma ficha; enquanto o corpo estiver vazio, o
programa não compila. Use o que viu sobre `new`, construtor e `return`.

As chamadas prontas recebem Nina `12, 4, true` e Leo `5, 5, true`.
O resultado é:

```text
Nina
8
True
Leo
0
False
```

```powershell
dotnet run --project tarefas/02-fichas-separadas/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 2
```

Depois de criar as duas fichas, mude os concluídos de Nina. Antes de executar,
preveja se os dados de Leo deveriam mudar. A regra é: duas chamadas criam
duas fichas independentes, mesmo quando recebem os mesmos valores.

<details><summary>Pista opcional</summary>

A chamada ao construtor recebe os argumentos desta execução; uma variável
reutilizada que devolve sempre o mesmo objeto não cria uma ficha nova.

</details>

Explique a diferença entre escrever outro nome de variável e criar outro
objeto. Se consultou um modelo completo, tente novos dados sem ele.
