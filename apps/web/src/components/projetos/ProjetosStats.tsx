const STATS = [
  {
    valor: "6",
    label: "projetos entregues",
    accent: "#00D4FF",
    glow: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.2)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1.2" fill="#00D4FF" opacity="0.7"/>
        <rect x="8" y="1" width="5" height="5" rx="1.2" fill="#00D4FF" opacity="0.4"/>
        <rect x="1" y="8" width="5" height="5" rx="1.2" fill="#00D4FF" opacity="0.4"/>
        <rect x="8" y="8" width="5" height="5" rx="1.2" fill="#00D4FF" opacity="0.2"/>
      </svg>
    ),
  },
  {
    valor: "3",
    label: "clientes ativos",
    accent: "#8B5CF6",
    glow: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="5" cy="4.5" r="2.5" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="9.5" cy="4.5" r="2" stroke="#8B5CF6" strokeWidth="1" opacity="0.4"/>
        <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <path d="M9.5 8.5c1.4.3 2.5 1.5 2.5 2.8" stroke="#8B5CF6" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    valor: "≤1 sem",
    label: "tempo médio de entrega",
    accent: "#00D4FF",
    glow: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.2)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="#00D4FF" strokeWidth="1.2" opacity="0.6"/>
        <path d="M7 4v3l2 1.5" stroke="#00D4FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      </svg>
    ),
  },
  {
    valor: "100%",
    label: "mobile-first",
    accent: "#8B5CF6",
    glow: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="4" y="1" width="6" height="12" rx="1.5" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.7"/>
        <rect x="5.5" y="10.5" width="3" height="1" rx="0.5" fill="#8B5CF6" opacity="0.5"/>
      </svg>
    ),
  },
];

export default function ProjetosStats() {
  return (
    <section
      className="border-b border-white/[0.06]"
      style={{
        background: "linear-gradient(180deg, rgba(0,40,60,0.85) 0%, rgba(0,28,45,0.7) 30%, rgba(0,15,25,0.5) 55%, #000 100%)",
        boxShadow: "inset 0 1px 0 rgba(0,200,255,0.08)",
      }}
    >
      <div className="container mx-auto px-4 py-5">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(({ valor, label, accent, glow, border, icon }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-center"
              style={{
                background: `radial-gradient(ellipse at top, ${glow} 0%, transparent 70%)`,
                border: `1px solid ${border}`,
              }}
            >
              <p
                className="text-lg font-black tabular-nums md:text-xl"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #fff 160%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {valor}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
