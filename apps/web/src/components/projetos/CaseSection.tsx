interface CaseSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function CaseSection({ title, children }: CaseSectionProps) {
  return (
    <section className="border-b border-white/10 py-10 md:py-14">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-xl font-semibold text-orbit-electric md:text-2xl">
          {title}
        </h2>
        <div className="prose prose-invert max-w-none text-white/85 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2">
          {children}
        </div>
      </div>
    </section>
  );
}
