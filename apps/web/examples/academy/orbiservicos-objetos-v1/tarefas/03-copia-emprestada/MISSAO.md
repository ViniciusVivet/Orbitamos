# 3. A cópia emprestada

Este arquivo tem um bug proposital. Abra **Program.cs**, execute e observe:

```powershell
dotnet run --project tarefas/03-copia-emprestada/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 3
```

O programa cria Nina com 8 serviços, 3 concluídos, pede uma cópia e muda os
concluídos da cópia para 5. O bug imprime `3` e `3`: a ficha original também
mudou. O esperado depois da correção é `5` e `3`, em linhas separadas.

Coloque um breakpoint no retorno de `CriarCopia`. Veja que duas variáveis podem
apontar para a **mesma instância**. A atribuição não cria uma ficha nova.

Corrija a função para devolver outra instância com os quatro dados do original.
Alterar as propriedades da cópia depois não pode alterar a ficha original;
alterar a original também não pode mudar a cópia. Não apague a mutação que
revela o bug nem escreva números fixos no console.

Anote esperado/obtido antes e depois e leia `git diff`. Como estes quatro dados
são texto, números e booleano, copiar os valores é suficiente aqui; cópias de
objetos com outros objetos dentro serão um assunto futuro.
