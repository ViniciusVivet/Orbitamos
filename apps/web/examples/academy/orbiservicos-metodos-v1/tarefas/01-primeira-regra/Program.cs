// Tarefa 1: modelo guiado. Execute, explique e depois mude o segundo argumento.
int pendentes = CalcularPendentes(8, 3);
Console.WriteLine(pendentes);

int CalcularPendentes(int total, int concluidos)
{
    return total - concluidos;
}
