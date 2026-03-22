const SERVICOS = [
  { num: "01", title: "Landing Page", desc: "Focada em conversão. Um objetivo, uma ação, resultado mensurável." },
  { num: "02", title: "Site Institucional", desc: "Presença digital que transmite credibilidade e gera contato." },
  { num: "03", title: "E-commerce", desc: "Vitrine ou loja completa — do catálogo ao checkout." },
  { num: "04", title: "Sistema Web / MVP", desc: "Produto funcional para validar sua ideia no mercado." },
  { num: "05", title: "Dashboard & Painel", desc: "Dados em tempo real, gestão e tomada de decisão." },
  { num: "06", title: "Automação", desc: "Integrações, relatórios automáticos e menos trabalho manual." },
];

export default function WhatWeBuild() {
  return (
    <section
      className="py-20 md:py-28"
      style={{
        background: "linear-gradient(180deg, #000 0%, #08060f 50%, #000 100%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="container mx-auto max-w-5xl px-6">

        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orbit-electric">
              Capacidade técnica
            </p>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              O que entregamos
            </h2>
          </div>
          <p className="text-sm text-white/50 sm:text-right">
            Do briefing ao ar.<br />Sem enrolação.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {SERVICOS.map((s, i) => (
            <div
              key={s.num}
              className="group flex cursor-default items-center gap-5 px-6 py-5 transition-all duration-150 hover:bg-white/[0.04]"
              style={{
                borderBottom: i < SERVICOS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <span
                className="w-8 shrink-0 text-sm font-black tabular-nums transition-colors duration-150 group-hover:text-orbit-electric"
                style={{ color: "rgba(0,212,255,0.45)" }}
              >
                {s.num}
              </span>
              <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-8">
                <p className="w-52 shrink-0 text-sm font-bold text-white/90 group-hover:text-white transition-colors duration-150">
                  {s.title}
                </p>
                <p className="text-sm text-white/55 group-hover:text-white/70 transition-colors duration-150">
                  {s.desc}
                </p>
              </div>
              <svg
                className="shrink-0 opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0.5"
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ color: "rgba(0,212,255,0.7)" }}
              >
                <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
