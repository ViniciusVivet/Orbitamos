# 3. Passou uma vez, mas está errado

**O bug deste arquivo é proposital.** Para `(8, 3)`, vemos `5` e parece certo.
Para `(5, 5)`, também vemos `5`, mas não deveria sobrar serviço.

```powershell
dotnet run --project tarefas/03-investigue-o-bug/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 3
```

Primeiro observe a falha. Depois abra `Program.cs`, coloque um breakpoint na
linha do retorno e inicie o debugger do seu editor para este projeto console.
Observe `total` e `concluidos` em cada chamada. Se ainda não sabe configurar o
debugger, peça essa ajuda ao orientador; não mude a regra às cegas.

Anote antes de corrigir:

| Chamada | Esperado | Obtido |
| --- | --- | --- |
| `(8, 3)` | 5 | preencha após executar |
| `(5, 5)` | 0 | preencha após executar |

Por que compilou e mesmo assim está errado? O retorno depende dos valores que
chegam? Corrija a regra, execute e confira outra vez. Trocar apenas o `5` por
`0` desloca o problema e não resolve a função.

Depois, leia seu `git diff` e explique a mudança. Não apague as chamadas nem
as checagens para esconder o bug. Siga quando a mesma regra funcionar para os
cinco casos do verificador.
