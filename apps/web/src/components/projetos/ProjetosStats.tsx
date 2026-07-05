import ScrollReveal from "@/components/ScrollReveal";
import CountUp from "@/components/CountUp";

const STATS = [
  {
    valor: "7",
    label: "projetos entregues",
    accent: "#00D4FF",
    glow: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.2)",
  },
  {
    valor: "4",
    label: "clientes ativos",
    accent: "#8B5CF6",
    glow: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
  },
  {
    valor: "2 sem",
    label: "tempo medio de entrega",
    accent: "#00D4FF",
    glow: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.2)",
  },
  {
    valor: "100%",
    label: "mobile-first",
    accent: "#8B5CF6",
    glow: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
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
        <ScrollReveal selectChildren stagger={0.1} from={{ opacity: 0, y: 20, scale: 0.9 }}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(({ valor, label, accent, glow, border }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-center transition-all duration-300 hover:scale-105"
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
                  <CountUp value={valor} />
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">{label}</p>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
