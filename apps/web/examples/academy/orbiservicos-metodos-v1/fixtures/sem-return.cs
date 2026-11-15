// Contraexemplo editorial: deve falhar na compilacao real, sem rodar binario velho.
Console.WriteLine(CalcularPendentes(8, 3));

int CalcularPendentes(int total, int concluidos)
{
    int pendentes = total - concluidos;
}

bool PodeIniciar(int pendentes, bool pago)
{
    return pendentes > 0 && pago;
}
