public class Servico
{
    public string Cliente { get; set; }
    public int Total { get; set; }
    public int Concluidos { get; set; }
    public bool Pago { get; set; }

    public Servico(string cliente, int total, int concluidos, bool pago)
    {
        Cliente = cliente;
        Total = total;
        Concluidos = concluidos;
        Pago = pago;
    }

    public int CalcularPendentes()
    {
        // Complete seguindo o modelo guiado em MISSAO.md.
        return 0;
    }

    public bool PodeIniciar()
    {
        // Complete seguindo o modelo guiado em MISSAO.md.
        return false;
    }
}
