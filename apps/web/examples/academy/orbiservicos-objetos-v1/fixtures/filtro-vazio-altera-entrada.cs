List<Servico> servicos = new List<Servico>
{
    new Servico("Nina", 12, 4, true),
    new Servico("Leo", 5, 5, true),
    new Servico("Bia", 4, 1, false)
};

List<Servico> liberados = SelecionarLiberados(servicos);
Console.WriteLine(liberados.Count);
foreach (Servico servico in liberados)
{
    Console.WriteLine(servico.Cliente);
}

List<Servico> SelecionarLiberados(List<Servico> servicos)
{
    List<Servico> liberados = new List<Servico>();
    foreach (Servico servico in servicos)
    {
        if (servico.PodeIniciar())
        {
            liberados.Add(servico);
        }
    }
    if (liberados.Count == 0)
    {
        servicos.Clear();
    }
    return liberados;
}
