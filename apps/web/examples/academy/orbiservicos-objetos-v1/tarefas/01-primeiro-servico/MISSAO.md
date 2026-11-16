# 1. A primeira ficha de serviço

Uma classe descreve os dados e as ações de um tipo de ficha. Um objeto é uma
ficha concreta criada com `new`. Abra **Servico.cs**: nesta tarefa é esse arquivo
que você altera. `Program.cs` já cria a ficha de Nina e mostra seus resultados.

O construtor recebe cliente, total, concluídos e pagamento e guarda esses dados
nas propriedades. Complete os dois métodos seguindo o modelo guiado:

```csharp
public int CalcularPendentes()
{
    return Total - Concluidos;
}

public bool PodeIniciar()
{
    return CalcularPendentes() > 0 && Pago;
}
```

Aqui os métodos pertencem ao objeto e usam seus dados: na ficha de Nina,
`Total` vale 12 e `Concluidos` vale 4. `public` permite que o programa consulte
esses membros; o arquivo da classe fica separado das instruções de `Program.cs`.

Salve e execute da pasta principal do pacote:

```powershell
dotnet run --project tarefas/01-primeiro-servico/OrbiServicos.Console.csproj
powershell -NoProfile -File .\tools\verificar.ps1 -Tarefa 1
```

A saída esperada é `Nina`, `8` e `True`, nessa ordem, em linhas separadas.
Antes de mudar um número, preveja o que aconteceria se Nina tivesse concluído
mais serviços. Altere o argumento no `Program.cs`, salve e execute outra vez.

Explique qual é o tipo (`Servico`), qual é a ficha criada e quais dados a regra
consulta. O verificador usa outras fichas; escrever um retorno fixo não basta.
Guarde seu primeiro ponto no histórico conforme o README.
