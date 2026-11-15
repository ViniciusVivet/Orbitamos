# 4. Quem pode começar o trabalho?

OrbiServiços precisa de um painel para três clientes. Desta vez não há modelo
de solução. Reutilize o que aprendeu sobre métodos e condições.

Crie duas funções locais no `Program.cs`:

- `int CalcularPendentes(int total, int concluidos)`: devolve quantos serviços faltam.
- `bool PodeIniciar(int pendentes, bool pago)`: devolve verdadeiro quando há
  serviço pendente **e** o pagamento está confirmado. Sem pendência não há
  trabalho novo a iniciar.

| Cliente fictício | Total | Concluídos | Pago |
| --- | --- | --- | --- |
| Nina | 12 | 4 | true |
| Leo | 5 | 5 | true |
| Bia | 4 | 1 | false |

Mostre nome, pendências e decisão para cada cliente, nessa ordem. Use chamadas
às suas funções; não imprima só respostas decoradas. As quantidades são válidas
nesta unidade: `0 <= concluidos <= total`. Tratamento de entrada inválida virá depois.

Resultado do painel:

```text
Nina
8
True
Leo
0
False
Bia
3
False
```

No console C# real, booleanos aparecem como `True` e `False`. A regra continua
usando `true` e `false` no código.

```powershell
dotnet run --project tarefas/04-painel-independente/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 4
```

São nove verificações das funções: cinco cálculos e quatro decisões. Enquanto
as funções não existirem, o compilador informará quais nomes estão faltando.
Ter as funções corretas não substitui montar e explicar o painel pedido acima.

Se precisar, consulte documentação ou peça uma pista. Registre se usou um
modelo completo e depois faça outra entrada sem ele. Para uma checagem posterior,
peça ao orientador dados novos, sem respostas prontas ao lado.

Ao terminar, explique entrada, retorno e chamada; faça uma alteração pequena;
salve um commit local na branch `unidade/metodos`, conforme o README. Não precisa
fazer push ou acessar a main do site da Orbitamos.
