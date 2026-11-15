// Contraexemplo editorial: chamadas int aceitariam long por conversao,
// mas o contrato desta unidade pede exatamente int, int -> int.
Console.WriteLine(CalcularPendentes(8, 3));

int CalcularPendentes(long total, long concluidos)
{
    return (int)(total - concluidos);
}

bool PodeIniciar(int pendentes, bool pago)
{
    return pendentes > 0 && pago;
}
