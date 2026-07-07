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

      <img
        src="/orbi-favicon.png"
        alt="Orbi"
        width={size}
        height={size}
        className="drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]"
      />

      <span className="text-xl font-bold orbitamos-text">ORBITAMOS</span>
    </div>
  );
}
