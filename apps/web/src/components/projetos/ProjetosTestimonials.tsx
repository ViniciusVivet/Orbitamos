/**
 * Depoimentos de clientes reais.
 * TODO: substituir os placeholders pelo texto real de cada cliente.
 */

const DEPOIMENTOS = [
  {
    nome: "Sabrina Lashes",
    cargo: "Especialista em beleza · São Paulo/SP",
    avatar: "SL",
    cor: "from-pink-500 to-rose-400",
    texto:
      "⭐ [PLACEHOLDER — pediu feedback pra Sabrina, substituir aqui quando ela responder] Antes eu dependia só do Instagram. Agora tenho um endereço digital de verdade, bonito e que converte. A Orbitamos entregou tudo rápido e do jeito que eu precisava.",
    projeto: "Sabrina Lashes · Site institucional",
    placeholder: true,
  },
  {
    nome: "Fundador YUME",
    cargo: "Marca autoral de moda · São Paulo/SP",
    avatar: "YM",
    cor: "from-violet-500 to-purple-400",
    texto:
      "⭐ [PLACEHOLDER — pedir depoimento ao cliente da YUME] A vitrine que a Orbitamos criou refletiu exatamente a identidade da marca. Saímos do zero para ter uma loja digital completa em tempo recorde.",
    projeto: "YUME – Moda Disruptiva · E-commerce",
    placeholder: true,
  },
];

export default function ProjetosTestimonials() {
  const visiveis = DEPOIMENTOS.filter((d) => !d.placeholder);

  if (visiveis.length === 0) {
    // Durante desenvolvimento, mostra os placeholders para posicionamento visual.
    // Em produção, remova a linha abaixo e substitua os textos reais.
    return <TestimonialsGrid items={DEPOIMENTOS} dev />;
  }

  return <TestimonialsGrid items={visiveis} />;
}

function TestimonialsGrid({
  items,
  dev,
}: {
  items: typeof DEPOIMENTOS;
  dev?: boolean;
}) {
  return (
    <section className="border-b border-white/10 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <p className="text-center text-[11px] font-medium tracking-[0.2em] text-orbit-electric/80 uppercase mb-2">
          O que os clientes dizem
        </p>
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
          Quem confiou na Orbitamos
        </h2>
        {dev && (
          <p className="mx-auto mt-2 max-w-lg text-center text-xs text-yellow-400/70">
            [DEV] Textos placeholder — substituir pelos depoimentos reais antes de ir ao ar.
          </p>
        )}
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {items.map((d) => (
            <figure
              key={d.nome}
              className={`relative rounded-2xl border border-white/10 bg-white/5 p-6 ${
                d.placeholder ? "opacity-60 ring-1 ring-yellow-400/20" : ""
              }`}
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
