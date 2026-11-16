Servico cache = new Servico("", 0, 0, false);
Console.WriteLine(CriarServico("Nina", 12, 4, true).Cliente);

Servico CriarServico(string cliente, int total, int concluidos, bool pago)
{
    cache.Cliente = cliente;
    cache.Total = total;
    cache.Concluidos = concluidos;
    cache.Pago = pago;
    return cache;
}
