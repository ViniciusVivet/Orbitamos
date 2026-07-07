import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-[#03050a] px-4 text-center text-white">
      <img
        src="/orbi-lost.png"
        alt="Orbi perdido no espaco"
        className="mb-8 w-48 drop-shadow-[0_0_40px_rgba(0,212,255,0.3)] sm:w-56"
      />

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orbit-electric/70">
        Erro 404
      </p>

      <h1 className="text-3xl font-black leading-tight sm:text-4xl">
        Orbi se perdeu no{" "}
        <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
          espaco
        </span>
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm text-white/50">
        A pagina que voce procura nao existe ou foi movida para outra orbita.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orbit-electric to-orbit-purple px-6 py-3 text-sm font-bold text-black transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
        >
          Voltar para a home
        </Link>
        <Link
          href="/contato"
          className="inline-flex items-center justify-center rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
        >
          Falar com a gente
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,212,255,0.06),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(139,92,246,0.04),transparent_50%)]" />
    </div>
  );
}
