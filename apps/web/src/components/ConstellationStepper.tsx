"use client";

type Milestone = { range: string; label: string };

const MILESTONES: Milestone[] = [
  { range: "1–3", label: "Lógica e Fundamentos" },
  { range: "3–5", label: "HTML • CSS • JS" },
  { range: "6–8", label: "Projetos e Portfólio" },
  { range: "9–12", label: "Primeiro Estágio" },
];

export default function ConstellationStepper({ current = 2 }: { current?: number }) {
  const points = [
    { x: 80, y: 140 },
    { x: 300, y: 60 },
    { x: 500, y: 160 },
    { x: 680, y: 100 },
  ];

  const pathD = `M ${points[0].x} ${points[0].y} C 220 20, 440 200, ${points[3].x} ${points[3].y}`;

  const labelOffset = (idx: number) => {
    // Ajustar offsets dos cards; último (9–12) vai mais para a direita
    const map = [ {dx: 60, dy: -48}, {dx: -36, dy: -64}, {dx: 28, dy: 24}, {dx: 48, dy: 16} ];
    return map[idx] || { dx: 40, dy: -40 };
  };

  return (
    <div className="relative mx-auto mt-6 w-full max-w-5xl px-4">
      <div className="relative mx-auto h-[220px] w-full">
        <svg width="100%" height="220" viewBox="0 0 720 220">
          <defs>
            <linearGradient id="const-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Nebulosas leves */}
          <circle cx="180" cy="100" r="60" fill="url(#starGlow)" opacity="0.18" />
          <circle cx="520" cy="140" r="70" fill="url(#starGlow)" opacity="0.14" />

          {/* Caminho curvo da constelação */}
          <path d={pathD} stroke="url(#const-grad)" strokeWidth="2.2" fill="none" filter="url(#glow)" opacity="0.7" />

          {/* Estrelinhas aleatórias */}
          {Array.from({ length: 26 }).map((_, i) => (
            <circle key={i} cx={Math.random()*720} cy={Math.random()*200} r={Math.random()*2+0.4} fill="#fff" opacity="0.35" />
          ))}

          {/* Estrelas principais */}
          {points.map((p, idx) => {
            const active = idx <= current;
            const { dx, dy } = labelOffset(idx);
            const size = active ? 10 : 7;
            return (
              <g key={idx}>
                {/* Star shape (camadas) */}
                <g transform={`translate(${p.x}, ${p.y})`}>
                  {/* cruz */}
                  <g stroke={active ? "url(#const-grad)" : "rgba(255,255,255,0.4)"} strokeWidth={1.4} opacity={0.9}>
                    <line x1={-size} y1={0} x2={size} y2={0} />
                    <line x1={0} y1={-size} x2={0} y2={size} />
                  </g>
                  {/* diamante */}
                  <polygon points={`0,-${size} ${size},0 0,${size} -${size},0`} fill={active ? "url(#const-grad)" : "#ffffff33"} />
                  {/* brilho */}
                  <circle r={active ? 18 : 14} fill="url(#starGlow)" opacity={0.7} />
                  {idx === current && (
                    <circle r={22} stroke="#8B5CF6" strokeWidth={1.5} fill="none" className="animate-[ping_1.6s_ease-out_infinite]" />
                  )}
                </g>
              </g>
            );
          })}
        </svg>
        {/* HTML callouts (fora do SVG para evitar parsing issues) */}
        {points.map((p, idx) => {
          const active = idx <= current;
          const { dx, dy } = labelOffset(idx);
          const left = p.x + dx;
          const top = p.y + dy;
          const w = idx >= 2 ? 240 : 210;
          return (
            <div
              key={`label-${idx}`}
              className={`absolute rounded-2xl px-5 py-3 text-left ${active ? "bg-gradient-to-r from-orbit-electric to-orbit-purple text-black" : "bg-white/10 text-white"} animate-constPulse`}
              style={{ left, top, width: w, transform: "translate(-4px, -4px)", opacity: active ? 0.95 : 0.75 }}
            >
              <div className="text-[12px] font-extrabold opacity-90">{MILESTONES[idx].range} meses</div>
              <div className="text-[14px] font-semibold leading-tight">{MILESTONES[idx].label}</div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 0.7 } 100% { transform: scale(1.4); opacity: 0 } }
        @keyframes constPulse { 0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, .35) } 70% { box-shadow: 0 0 0 12px rgba(124, 58, 237, 0) } 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0) } }
        .animate-constPulse { animation: constPulse 2.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}


