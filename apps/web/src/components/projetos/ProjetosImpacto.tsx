export default function ProjetosImpacto() {
  return (
    <section className="py-16 md:py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="container mx-auto max-w-5xl px-6">
        <div
          className="rounded-2xl px-8 py-10 sm:px-12"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.04) 0%, rgba(139,92,246,0.04) 100%)",
            border: "1px solid rgba(139,92,246,0.12)",
          }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <div className="flex-1">
              <p
                className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: "rgba(139,92,246,0.6)" }}
              >
                Propósito
              </p>
              <h2 className="text-xl font-black leading-snug text-white sm:text-2xl">
                Cada projeto entregue financia<br className="hidden sm:block" />
                <span
                  style={{
                    background: "linear-gradient(90deg, #00D4FF, #8B5CF6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {" "}formação em TI para jovens da periferia.
                </span>
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/45 leading-relaxed">
                Não somos uma agência comum. A receita dos projetos financia a trilha
                de formação da OrbitAcademy — mais projetos, mais gente saindo do subemprego.
              </p>
            </div>
            <div className="flex gap-8 shrink-0">
              {[
                { value: "5+", label: "Projetos entregues" },
                { value: "100%", label: "Satisfação" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className="text-3xl font-black"
                    style={{
                      background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
