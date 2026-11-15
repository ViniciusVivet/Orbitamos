// Contraexemplo editorial: acertar a primeira entrada nao aprova esta funcao.
Console.WriteLine(CalcularPendentes(8, 3));

int CalcularPendentes(int total, int concluidos)
{
    return 5;
}

bool PodeIniciar(int pendentes, bool pago)
{
    return pendentes > 0 && pago;
}
