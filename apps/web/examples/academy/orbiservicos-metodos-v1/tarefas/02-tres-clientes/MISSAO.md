# 2. Uma regra, três clientes

Agora você escreve as chamadas e a regra. Só a assinatura da função está pronta.
O corpo vazio **ainda não compila**: uma função que promete devolver `int` precisa
realmente devolver um valor. O compilador aponta o arquivo e a linha.

| total | concluidos | Deve voltar |
| --- | --- | --- |
| 8 | 3 | 5 |
| 5 | 5 | 0 |
| 0 | 0 | 0 |

Abra `Program.cs`. Sem consultar o modelo anterior, escreva três chamadas usando
a tabela e complete a regra usando os parâmetros. Não crie três funções e não
imprima as respostas fixas dentro da função.

```powershell
dotnet run --project tarefas/02-tres-clientes/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 2
```

O programa deve mostrar `5`, `0` e `0`, em linhas diferentes. O verificador
também faz chamadas com valores diferentes para não aprovar uma resposta fixa.

Precisa de uma pista? Veja uma por vez:

<details><summary>1. O que a função recebe?</summary>

`total` é a quantidade combinada. `concluidos` é a quantidade que já acabou.

</details>
<details><summary>2. O que falta devolver?</summary>

Falta a diferença entre essas duas quantidades, não um número que você decorou.

</details>

Antes de seguir, explique: quando o cliente muda, você troca os argumentos da
chamada ou reescreve a regra? Se consultou o modelo, faça mais uma chamada com
dados seus e explique o retorno sem olhar a solução.
