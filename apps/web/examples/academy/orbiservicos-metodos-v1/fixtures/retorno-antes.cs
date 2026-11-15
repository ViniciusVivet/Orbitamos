// Contraexemplo editorial: sair antes das chamadas nao e aprovacao.
Console.WriteLine("5\n8\n0\n0\n99\nTrue\nFalse\nFalse\nFalse");
return;

int CalcularPendentes(int total, int concluidos)
{
    return total - concluidos;
}

bool PodeIniciar(int pendentes, bool pago)
{
    return pendentes > 0 && pago;
}
