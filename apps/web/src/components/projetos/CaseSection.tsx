interface CaseSectionProps {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  tone?: "cyan" | "purple" | "neutral";
}

const toneClasses = {
  cyan: "border-orbit-electric/18 bg-orbit-electric/[0.045]",
  purple: "border-orbit-purple/18 bg-orbit-purple/[0.05]",
  neutral: "border-white/10 bg-white/[0.035]",
};

export default function CaseSection({ eyebrow, title, children, tone = "neutral" }: CaseSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
      <div className={`grid gap-6 rounded-2xl border p-5 sm:p-7 lg:grid-cols-[0.42fr_0.58fr] ${toneClasses[tone]}`}>
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orbit-electric/80">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="text-base leading-8 text-white/72 [&>ul]:space-y-3 [&>ul]:pl-0 [&_li]:list-none">
          {children}
        </div>
      </div>
    </section>
  );
}
