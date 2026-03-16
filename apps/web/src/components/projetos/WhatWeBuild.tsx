const ITEMS = [
  { icone: "📣", title: "Landing pages", desc: "Conversão e clareza para campanhas e produtos." },
  { icone: "🏢", title: "Sites institucionais", desc: "Presença digital profissional e confiável." },
  { icone: "📊", title: "Dashboards e sistemas", desc: "Dados em tempo real e tomada de decisão." },
  { icone: "⚡", title: "MVPs", desc: "Validação rápida da sua ideia com produto funcional." },
  { icone: "🔧", title: "Sistemas com backend", desc: "APIs, autenticação e regras de negócio." },
  { icone: "🤖", title: "Automações", desc: "Relatórios, integrações e menos trabalho manual." },
];

export default function WhatWeBuild() {
  return (
    <section className="border-b border-white/10 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <p className="text-center text-[11px] font-medium tracking-[0.2em] text-orbit-electric/80 uppercase mb-2">
          Capacidade técnica
        </p>
        <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
          O que a Orbitamos consegue construir
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-white/60">
          Do primeiro site ao sistema completo: entregamos produto digital de ponta a ponta.
        </p>
        <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-orbit-electric/30 hover:bg-white/[0.08]"
            >
              <span className="text-2xl mt-0.5 shrink-0" aria-hidden>{item.icone}</span>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-white/60">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
