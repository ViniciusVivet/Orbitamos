import Link from "next/link";
import { ArrowRight, Check, UserRound } from "lucide-react";
import type { CollaboratorProfile } from "@/lib/api";
import s from "./PortfolioWorkspace.module.css";

export default function CollaboratorProfileGuide({ profile, portfolioCount, loading = false, preview = false, compact = false }: { profile?: CollaboratorProfile | null; portfolioCount?: number; loading?: boolean; preview?: boolean; compact?: boolean }) {
  const introduced = !!profile?.headline.trim() && !!profile?.bio.trim() && !!profile.skills.length;
  const hasWork = portfolioCount !== undefined ? portfolioCount > 0 : !!profile?.portfolioUrls.length;
  const availability = profile ? { available: "Disponível", partial: "Disponibilidade parcial", unavailable: "Indisponível" }[profile.availability] : null;
  return <section className={s.guide} aria-label="Sua apresentação profissional">
    <div className={s.guideTitle}><UserRound size={17}/><h2>Pronto para se apresentar?</h2></div>
    {loading ? <p role="status">Conferindo sua apresentação…</p> : <div className={`${s.guideSteps} ${compact ? s.compactGuide : ""}`}>
      <Link href="/colaborador/perfil"><span>{introduced ? <Check size={15}/> : "1"}</span><div><strong>Conte o que você faz</strong><small>{profile ? introduced ? "Título, apresentação e habilidades preenchidos." : "Revise seu título, apresentação e habilidades." : "Abra seu perfil para revisar sua apresentação."}</small></div><ArrowRight size={15}/></Link>
      <Link href={preview ? "/dev/workspace-preview?view=portfolio" : "/colaborador/portfolio"}><span>{hasWork ? <Check size={15}/> : "2"}</span><div><strong>Mostre um trabalho</strong><small>{hasWork ? "Você já tem um trabalho ou link para apresentar." : "Um projeto de estudo também pode ser seu primeiro case."}</small></div><ArrowRight size={15}/></Link>
      <Link href="/colaborador/perfil#profile-availability"><span>3</span><div><strong>Revise sua disponibilidade</strong><small>{availability ? `Hoje: ${availability.toLowerCase()}.` : "Confira quando e como você pode colaborar."}</small></div><ArrowRight size={15}/></Link>
    </div>}
  </section>;
}
