const DEPOIMENTOS = [
  {
    nome: "Sabrina",
    cargo: "Lash designer · São Paulo/SP",
    initials: "S",
    cor: "from-pink-500 to-rose-400",
    accentColor: "rgba(244,114,182,0.15)",
    accentBorder: "rgba(244,114,182,0.28)",
    texto:
      "Tava com medo de que fosse ficar aquela coisa genérica, sabe? Mas ficou tudo muito delicado, com a minha cara mesmo. Minhas clientes já viram e estão adorando — várias me mandaram mensagem perguntando quem fez. Agora tenho um lugar pra mandar as pessoas além do Insta.",
    tipo: "Site institucional",
  },
  {
    nome: "Matheus Camaleão",
    cargo: "Fundador · YUME Moda Autoral",
    initials: "YM",
    cor: "from-violet-500 to-purple-400",
    accentColor: "rgba(139,92,246,0.12)",
    accentBorder: "rgba(139,92,246,0.28)",
    texto:
      "A YUME sempre teve uma proposta forte, mas a gente dependia de redes sociais pra mostrar isso. Agora temos um espaço próprio que respira a identidade da marca. O que mais me surpreendeu foi a sensibilidade deles com o conceito — entenderam que moda autoral não é só produto, é narrativa.",
    tipo: "E-commerce",
  },
];

export default function ProjetosTestimonials() {
  return (
    <section
      className="py-20 md:py-28"
      style={{
        background: "linear-gradient(180deg, #000 0%, #06080f 60%, #000 100%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="container mx-auto max-w-5xl px-6">

        <div className="mb-14 text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-orbit-electric">
            O que dizem os clientes
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Resultados que falam por si
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {DEPOIMENTOS.map((d) => (
            <figure
              key={d.nome}
              className="relative overflow-hidden rounded-2xl p-7"
              style={{
                background: `linear-gradient(135deg, ${d.accentColor} 0%, rgba(255,255,255,0.03) 100%)`,
                border: `1px solid ${d.accentBorder}`,
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                className="pointer-events-none absolute -top-2 right-5 font-serif text-[8rem] leading-none select-none"
                style={{ color: d.accentBorder }}
                aria-hidden
              >
                &ldquo;
              </span>

              <blockquote className="relative text-sm leading-[1.8] text-white/80">
                {d.texto}
              </blockquote>

              <figcaption className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${d.cor} text-[11px] font-bold text-white shadow-lg`}>
                    {d.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{d.nome}</p>
                    <p className="text-[11px] text-white/55">{d.cargo}</p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    background: d.accentColor,
                    border: `1px solid ${d.accentBorder}`,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {d.tipo}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}
