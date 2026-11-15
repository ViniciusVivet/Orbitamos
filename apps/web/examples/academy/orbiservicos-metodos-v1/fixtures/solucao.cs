// Referencia editorial. NAO distribuir esta solucao no ZIP do aluno.
Console.WriteLine("Nina");
Console.WriteLine(CalcularPendentes(12, 4));
Console.WriteLine(PodeIniciar(CalcularPendentes(12, 4), true));
Console.WriteLine("Leo");
Console.WriteLine(CalcularPendentes(5, 5));
Console.WriteLine(PodeIniciar(CalcularPendentes(5, 5), true));
Console.WriteLine("Bia");
Console.WriteLine(CalcularPendentes(4, 1));
Console.WriteLine(PodeIniciar(CalcularPendentes(4, 1), false));

int CalcularPendentes(int total, int concluidos)
{
    return total - concluidos;
}

bool PodeIniciar(int pendentes, bool pago)
{
    return pendentes > 0 && pago;
}
