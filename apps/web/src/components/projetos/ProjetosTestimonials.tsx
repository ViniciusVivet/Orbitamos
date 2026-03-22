const DEPOIMENTOS = [
  {
    nome: "Sabrina",
    cargo: "Lash designer · São Paulo/SP",
    initials: "S",
    cor: "from-pink-500 to-rose-400",
    texto:
      "Tava com medo de que fosse ficar aquela coisa genérica, sabe? Mas ficou tudo muito delicado, com a minha cara mesmo. Minhas clientes já viram e estão adorando — várias me mandaram mensagem perguntando quem fez. Agora tenho um lugar pra mandar as pessoas além do Insta.",
    projeto: "Sabrina Lashes",
    tipo: "Site institucional",
  },
  {
    nome: "Matheus Camaleão",
    cargo: "Fundador · YUME Moda Autoral",
    initials: "YM",
    cor: "from-violet-500 to-purple-400",
    texto:
      "A YUME sempre teve uma proposta forte, mas a gente dependia de redes sociais pra mostrar isso. Agora temos um espaço próprio que respira a identidade da marca. O que mais me surpreendeu foi a sensibilidade deles com o conceito — entenderam que moda autoral não é só produto, é narrativa.",
    projeto: "YUME – Moda Disruptiva",
    tipo: "E-commerce",
  },
];

export default function ProjetosTestimonials() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-6">

        {/* Label */}
        <div className="mb-12 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
            O que dizem os clientes
          </span>
          <span className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {DEPOIMENTOS.map((d) => (
            <figure
              key={d.nome}
              className="group relative rounded-2xl p-7 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Aspas decorativas */}
              <span
                className="pointer-events-none absolute top-4 right-6 font-serif text-7xl leading-none select-none"
                style={{ color: "rgba(0,212,255,0.06)" }}
                aria-hidden
              >
                &ldquo;
              </span>

              <blockquote className="relative text-sm leading-[1.75] text-white/65">
                {d.texto}
              </blockquote>

              <figcaption className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${d.cor} text-[11px] font-bold text-white`}
                  >
                    {d.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{d.nome}</p>
                    <p className="text-[11px] text-white/35">{d.cargo}</p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{
                    background: "rgba(0,212,255,0.06)",
                    border: "1px solid rgba(0,212,255,0.12)",
                    color: "rgba(0,212,255,0.6)",
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
