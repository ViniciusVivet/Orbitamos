const SERVICOS = [
  {
    num: "01",
    title: "Landing Page",
    desc: "Página pensada para campanha, captura e conversão.",
    chips: ["Conversão", "Campanha", "WhatsApp"],
    glow: "rgba(0,212,255,0.12)",
    border: "rgba(0,212,255,0.15)",
    shape: (
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        <rect x="20" y="16" width="160" height="88" rx="6" stroke="#00D4FF" strokeWidth="1.5"/>
        <rect x="28" y="26" width="80" height="8" rx="2" fill="#00D4FF"/>
        <rect x="28" y="40" width="144" height="4" rx="2" fill="#00D4FF"/>
        <rect x="28" y="50" width="120" height="4" rx="2" fill="#00D4FF"/>
        <rect x="60" y="66" width="80" height="20" rx="4" fill="#00D4FF"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "Site Institucional",
    desc: "Presença digital profissional que passa confiança e fecha contato.",
    chips: ["Institucional", "SEO", "Credibilidade"],
    glow: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.18)",
    shape: (
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        <rect x="20" y="10" width="160" height="100" rx="6" stroke="#8B5CF6" strokeWidth="1.5"/>
        <rect x="20" y="10" width="160" height="28" rx="6" fill="#8B5CF6"/>
        <rect x="34" y="52" width="60" height="40" rx="4" stroke="#8B5CF6" strokeWidth="1"/>
        <rect x="104" y="52" width="60" height="18" rx="4" stroke="#8B5CF6" strokeWidth="1"/>
        <rect x="104" y="76" width="60" height="16" rx="4" stroke="#8B5CF6" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "E-commerce",
    desc: "Catálogo, jornada de compra e experiência de marca em um só lugar.",
    chips: ["Vitrine", "Checkout", "Mobile-first"],
    glow: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.18)",
    shape: (
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        <rect x="16" y="16" width="50" height="60" rx="4" stroke="#10B981" strokeWidth="1.2"/>
        <rect x="76" y="16" width="50" height="60" rx="4" stroke="#10B981" strokeWidth="1.2"/>
        <rect x="136" y="16" width="50" height="60" rx="4" stroke="#10B981" strokeWidth="1.2"/>
        <rect x="60" y="86" width="80" height="18" rx="4" stroke="#10B981" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    num: "04",
    title: "Sistema Web / MVP",
    desc: "Fluxo funcional para validar ideia ou operação sem enrolação.",
    chips: ["MVP", "Fluxo", "Escalável"],
    glow: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.15)",
    shape: (
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        <circle cx="40" cy="60" r="16" stroke="#FBBF24" strokeWidth="1.2"/>
        <circle cx="100" cy="60" r="16" stroke="#FBBF24" strokeWidth="1.2"/>
        <circle cx="160" cy="60" r="16" stroke="#FBBF24" strokeWidth="1.2"/>
        <line x1="56" y1="60" x2="84" y2="60" stroke="#FBBF24" strokeWidth="1.2"/>
        <line x1="116" y1="60" x2="144" y2="60" stroke="#FBBF24" strokeWidth="1.2"/>
        <path d="M94 54l6 6-6 6" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M154 54l6 6-6 6" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: "05",
    title: "Dashboard & Painel",
    desc: "Visualização clara para acompanhar números e tomar decisão.",
    chips: ["Analytics", "Tempo real", "Gestão"],
    glow: "rgba(0,212,255,0.10)",
    border: "rgba(0,212,255,0.15)",
    shape: (
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        <rect x="16" y="16" width="80" height="40" rx="4" stroke="#00D4FF" strokeWidth="1.2"/>
        <rect x="104" y="16" width="80" height="40" rx="4" stroke="#00D4FF" strokeWidth="1.2"/>
        <rect x="16" y="64" width="168" height="40" rx="4" stroke="#00D4FF" strokeWidth="1.2"/>
        <polyline points="24,96 50,74 76,84 110,68 150,80 176,70" stroke="#00D4FF" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
  {
    num: "06",
    title: "Automação",
    desc: "Menos trabalho manual, mais processo rodando sozinho.",
    chips: ["Integração", "Webhooks", "Eficiência"],
    glow: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.15)",
    shape: (
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        <rect x="16" y="46" width="36" height="28" rx="4" stroke="#8B5CF6" strokeWidth="1.2"/>
        <rect x="82" y="30" width="36" height="28" rx="4" stroke="#8B5CF6" strokeWidth="1.2"/>
        <rect x="82" y="62" width="36" height="28" rx="4" stroke="#8B5CF6" strokeWidth="1.2"/>
        <rect x="148" y="46" width="36" height="28" rx="4" stroke="#8B5CF6" strokeWidth="1.2"/>
        <line x1="52" y1="60" x2="82" y2="44" stroke="#8B5CF6" strokeWidth="1"/>
        <line x1="52" y1="60" x2="82" y2="76" stroke="#8B5CF6" strokeWidth="1"/>
        <line x1="118" y1="44" x2="148" y2="60" stroke="#8B5CF6" strokeWidth="1"/>
        <line x1="118" y1="76" x2="148" y2="60" stroke="#8B5CF6" strokeWidth="1"/>
      </svg>
    ),
  },
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

        <div className="mb-12 text-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orbit-electric">
            Capacidade técnica
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            O que entregamos
          </h2>
          <p className="mt-3 text-sm text-white/50">Do briefing ao ar. Sem enrolação.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((s) => (
            <div
              key={s.num}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: `radial-gradient(ellipse at top left, ${s.glow} 0%, rgba(255,255,255,0.02) 70%)`,
                border: `1px solid ${s.border}`,
              }}
            >
              {/* Mini visual SVG */}
              {s.shape}

              {/* Conteúdo */}
              <div className="relative">
                <span className="text-[10px] font-black tabular-nums" style={{ color: s.border.replace("0.15", "0.6").replace("0.18", "0.6") }}>
                  {s.num}
                </span>
                <h3 className="mt-1 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/60">{s.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: s.glow,
                        border: `1px solid ${s.border}`,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
