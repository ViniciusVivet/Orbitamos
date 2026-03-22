const STATS = [
  { valor: "4", label: "projetos entregues" },
  { valor: "3", label: "clientes ativos" },
  { valor: "≤1 sem", label: "tempo médio de entrega" },
  { valor: "100%", label: "mobile-first" },
];

export default function ProjetosStats() {
  return (
    <section className="border-b border-white/10 bg-white/[0.02]">
      <div className="container mx-auto px-4 py-6">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(({ valor, label }) => (
            <li key={label} className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent md:text-4xl">
                {valor}
              </p>
              <p className="mt-1 text-xs text-white/60 uppercase tracking-wide">{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
