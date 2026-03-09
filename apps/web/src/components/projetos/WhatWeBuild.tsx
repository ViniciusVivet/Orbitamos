const ITEMS = [
  { title: "Landing pages", desc: "Conversão e clareza para campanhas e produtos." },
  { title: "Sites institucionais", desc: "Presença digital profissional e confiável." },
  { title: "Dashboards e sistemas", desc: "Dados em tempo real e tomada de decisão." },
  { title: "MVPs", desc: "Validação rápida da sua ideia com produto funcional." },
  { title: "Sistemas com backend", desc: "APIs, autenticação e regras de negócio." },
  { title: "Automações", desc: "Relatórios, integrações e menos trabalho manual." },
];

export default function WhatWeBuild() {
  return (
    <section className="border-b border-white/10 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
          O que a Orbitamos consegue construir
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-white/70">
          Do primeiro site ao sistema completo: entregamos produto digital de ponta a ponta.
        </p>
        <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-orbit-electric/30 hover:bg-white/[0.08]"
            >
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-white/70">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
