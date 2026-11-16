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
    // Este retorno vazio e apenas o ponto de partida.
    // Escreva sua selecao com foreach e Add, usando a regra de cada ficha.
    return new List<Servico>();
}
