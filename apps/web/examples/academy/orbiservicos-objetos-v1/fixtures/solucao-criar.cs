Servico nina = CriarServico("Nina", 12, 4, true);
Servico leo = CriarServico("Leo", 5, 5, true);

Console.WriteLine(nina.Cliente);
Console.WriteLine(nina.CalcularPendentes());
Console.WriteLine(nina.PodeIniciar());
Console.WriteLine(leo.Cliente);
Console.WriteLine(leo.CalcularPendentes());
Console.WriteLine(leo.PodeIniciar());

Servico CriarServico(string cliente, int total, int concluidos, bool pago)
{
    return new Servico(cliente, total, concluidos, pago);
}
