const DEPOIMENTOS = [
  {
    nome: "Sabrina",
    cargo: "Lash designer · São Paulo/SP",
    avatar: "SL",
    cor: "from-pink-500 to-rose-400",
    texto:
      "Gente, eu AMEI demais o resultado! Tava com medo de que fosse ficar aquela coisa genérica, sabe? Mas ficou tudo muito delicado, com a minha cara mesmo. Minhas clientes já viram e estão adorando, várias me mandaram mensagem perguntando quem fez. Agora tenho um lugar pra mandar as pessoas além do Insta, que já era!",
    projeto: "Sabrina Lashes · Site institucional",
  },
  {
    nome: "Matheus Camaleão",
    cargo: "Fundador · YUME Moda Autoral",
    avatar: "YM",
    cor: "from-violet-500 to-purple-400",
    texto:
      "A YUME sempre teve uma proposta forte, mas a gente dependia de redes sociais pra mostrar isso. Agora temos um espaço próprio que respira a identidade da marca. O que mais me surpreendeu foi a sensibilidade deles com o conceito — entenderam que moda autoral não é só produto, é narrativa. E ainda saber que isso foi feito por jovens em formação? Isso tem um valor que vai além do projeto em si.",
    projeto: "YUME – Moda Disruptiva · E-commerce",
  },
];

export default function ProjetosTestimonials() {
  return (
    <section className="border-b border-white/10 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <p className="text-center text-[11px] font-medium tracking-[0.2em] text-orbit-electric/80 uppercase mb-2">
          O que os clientes dizem
        </p>
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
          Quem confiou na Orbitamos
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {DEPOIMENTOS.map((d) => (
            <figure
              key={d.nome}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <blockquote className="text-sm leading-relaxed text-white/80">
                &ldquo;{d.texto}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${d.cor} text-xs font-bold text-white`}
                >
                  {d.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{d.nome}</p>
                  <p className="text-xs text-white/50">{d.cargo}</p>
                </div>
              </figcaption>
              <p className="mt-3 text-xs text-orbit-electric/60">{d.projeto}</p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
