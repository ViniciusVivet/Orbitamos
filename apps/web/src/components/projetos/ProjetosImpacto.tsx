const PILARES = [
  {
    icone: "🎓",
    titulo: "Talento formado aqui dentro",
    desc: "Cada projeto é desenvolvido por jovens da Orbitamos em formação — com acompanhamento técnico e entrega profissional.",
  },
  {
    icone: "🚀",
    titulo: "Experiência real no portfólio",
    desc: "Para o aluno, é o primeiro projeto no portfólio. Para o cliente, é um produto digital de qualidade a preço justo.",
  },
  {
    icone: "🤝",
    titulo: "Modelo que se retroalimenta",
    desc: "A receita dos projetos financia a formação de novos talentos. Mais projetos = mais gente saindo do subemprego.",
  },
];

export default function ProjetosImpacto() {
  return (
    <section className="border-b border-white/10 py-16 md:py-20 bg-gradient-to-b from-transparent to-orbit-purple/5">
      <div className="container mx-auto px-4">
        <p className="text-center text-[11px] font-medium tracking-[0.2em] text-orbit-purple/90 uppercase mb-2">
          O diferencial da Orbitamos
        </p>
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
          Cada projeto entregue transforma uma vida
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-white/60">
          Não somos uma agência comum. Somos um movimento que usa projetos reais para formar
          talentos da periferia — e entregar resultado para quem contrata.
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {PILARES.map((p) => (
            <div
              key={p.titulo}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center hover:border-orbit-purple/30 hover:bg-white/[0.08] transition-colors"
            >
              <span className="text-4xl" aria-hidden>
                {p.icone}
              </span>
              <h3 className="mt-4 font-semibold text-white">{p.titulo}</h3>
              <p className="mt-2 text-sm text-white/60">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-orbit-purple/20 bg-orbit-purple/5 p-6 text-center">
          <p className="text-sm text-white/70 leading-relaxed">
            <span className="text-orbit-purple font-semibold">Para o investidor:</span>{" "}
            a Orbitamos opera um modelo único — tech studio com impacto social mensurável.
            Cada real investido gera receita comercial <em>e</em> mobilidade social.
          </p>
        </div>
      </div>
    </section>
  );
}
