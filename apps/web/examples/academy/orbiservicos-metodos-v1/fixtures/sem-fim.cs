// Contraexemplo editorial: o tempo de execucao precisa ser limitado.
while (true) { }

int CalcularPendentes(int total, int concluidos)
{
    return total - concluidos;
}

bool PodeIniciar(int pendentes, bool pago)
{
    return pendentes > 0 && pago;
}
