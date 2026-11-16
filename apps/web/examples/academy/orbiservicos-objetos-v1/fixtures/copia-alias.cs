Servico original = new Servico("Nina", 8, 3, true);
Servico copia = CriarCopia(original);
copia.Concluidos = 5;
Console.WriteLine(original.CalcularPendentes());
Console.WriteLine(copia.CalcularPendentes());

Servico CriarCopia(Servico original)
{
    // BUG PROPOSITAL: outra variavel ainda aponta para a mesma ficha.
    return original;
}
