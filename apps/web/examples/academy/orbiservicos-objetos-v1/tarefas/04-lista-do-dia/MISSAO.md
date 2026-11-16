# 4. A lista do dia

A equipe quer uma lista com os serviços que podem começar. Altere **Program.cs**.
A classe continua fornecida em `Servico.cs`.

Implemente `List<Servico> SelecionarLiberados(List<Servico> servicos)` usando
`foreach` para percorrer a entrada e `Add` para incluir os objetos liberados.
Use `PodeIniciar()` de cada ficha: precisa haver pendências e pagamento.
O retorno vazio inicial é só um ponto de partida, ainda não é a seleção.

O resultado deve ser **outra lista**, mantendo as **mesmas instâncias** que
passaram pela regra, na ordem em que aparecem. Se a mesma ficha ocorrer duas
vezes na entrada e estiver liberada, preserve as duas ocorrências. Não clone
as fichas, não remova itens da entrada, não reordene e não altere seus dados.
Uma entrada vazia deve produzir outra lista vazia.

Para Nina `12,4,true`, Leo `5,5,true` e Bia `4,1,false`, o programa mostra:

```text
1
Nina
```

```powershell
dotnet run --project tarefas/04-lista-do-dia/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 4
```

`List<Servico>` diz que cada item dessa lista é uma ficha `Servico`.
`Count` informa quantos itens há. Você já conhece `foreach`; `Add` acrescenta
um item à lista que o recebe. Nesta prática escreva a seleção com essas
operações, sem LINQ. Não precisa criar outra classe ou instalar pacote.

Explique por que a lista devolvida é nova e as fichas selecionadas continuam
sendo as originais. Depois tente dois liberados, a mesma ficha repetida e
lista vazia, sem respostas prontas ao lado. Salve e execute, leia o diff e
faça seu commit local. Registre separadamente se consultou ajuda ou solução.
