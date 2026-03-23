export default function LogoOrbitamos({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <style>{`
        @keyframes orbitamos-pulse {
          0%, 72%, 100% {
            filter: brightness(1);
          }
          78% {
            filter: brightness(1.35) drop-shadow(0 0 6px rgba(0,212,255,0.5));
          }
          83% {
            filter: brightness(1.8) drop-shadow(0 0 12px rgba(139,92,246,0.7));
          }
          88% {
            filter: brightness(1.35) drop-shadow(0 0 6px rgba(0,212,255,0.5));
          }
          93% {
            filter: brightness(1);
          }
        }

        .orbitamos-text {
          background: linear-gradient(90deg, #00D4FF, #8B5CF6, #c084fc, #00D4FF);
          background-size: 300% 100%;
          background-position: 0% 50%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transition: background-position 0.7s ease, filter 0.3s ease;
          animation: orbitamos-pulse 9s ease-in-out infinite;
        }

        .orbitamos-text:hover {
          background-position: 60% 50%;
          filter: brightness(1.7) drop-shadow(0 0 10px rgba(0,212,255,0.6));
          animation-play-state: paused;
        }
      `}</style>

      <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00D4FF"/>
            <stop offset="1" stopColor="#8B5CF6"/>
          </linearGradient>
        </defs>
        <circle cx="62" cy="72" r="28" fill="url(#lg)"/>
        <ellipse cx="62" cy="72" rx="42" ry="12" fill="none" stroke="#ffffff40" strokeWidth={2} transform="rotate(-12 62 72)"/>
        <g transform="translate(86 44) rotate(28)">
          <path d="M0 12 L10 -2 L16 4 L7 18 Z" fill="#ffffff"/>
          <path d="M7 18 L16 4 L18 10 Z" fill="#00D4FF"/>
          <path d="M-2 24 L7 18 L2 28 Z" fill="#FF6B6B"/>
        </g>
      </svg>

      <span className="text-xl font-bold orbitamos-text">ORBITAMOS</span>
    </div>
  );
}
