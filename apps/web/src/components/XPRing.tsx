"use client";

type Props = { progress: number; size?: number };

export default function XPRing({ progress, size = 380 }: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <svg width={size} height={size} className="opacity-80">
        <defs>
          <linearGradient id="xpgrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        {/* trilha */}
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={8} fill="none" />
        {/* progresso */}
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke="url(#xpgrad)"
          strokeWidth={8}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xs uppercase tracking-widest text-white/70">Level</div>
        <div className="text-3xl font-extrabold bg-gradient-to-br from-orbit-electric to-orbit-purple text-transparent bg-clip-text">
          {Math.floor(clamped / 12) + 1}
        </div>
        <div className="text-[11px] text-white/70">{clamped}%</div>
      </div>
    </div>
  );
}


