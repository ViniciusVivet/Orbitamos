"use client";

export default function HoloPlanet() {
  return (
    <div className="relative mx-auto mt-16 h-56 w-56 md:h-72 md:w-72">
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orbit-electric/30 to-orbit-purple/30 blur-2xl" />
      {/* Sphere */}
      <div className="relative grid h-full w-full place-items-center">
        <div className="h-full w-full animate-[spin_18s_linear_infinite] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_40%_70%,rgba(124,58,237,0.3),transparent_50%)] shadow-[inset_0_0_40px_rgba(255,255,255,0.15)]" style={{ maskImage: "radial-gradient(circle at 50% 50%, black 60%, transparent 61%)" }} />
        {/* Hologram scanlines */}
        <div className="pointer-events-none absolute inset-0 rounded-full opacity-30 [background:repeating-linear-gradient(180deg,rgba(255,255,255,0.25)_0_2px,transparent_2px_6px)]" />
        {/* Ring */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 animate-[spin_12s_linear_infinite] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-[calc(40%)] rounded-full bg-orbit-electric shadow-[0_0_20px_theme(colors.orbit-electric)]" />
      </div>
    </div>
  );
}


