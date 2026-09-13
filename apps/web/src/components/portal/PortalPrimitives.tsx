import Link from "next/link";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import s from "./PortalExperience.module.css";

export function SectionHead({ label, title, href, action = "Ver tudo" }: { label?: string; title: string; href?: string; action?: string }) {
  return <div className={s.sectionHead}><div>{label && <span className={s.eyebrow}>{label}</span>}<h2>{title}</h2></div>{href && <Link className={s.textLink} href={href}>{action}<ArrowUpRight size={15}/></Link>}</div>;
}
export function EmptyState({ icon: Icon, title, children, href, action }: { icon: LucideIcon; title: string; children: ReactNode; href: string; action: string }) {
  return <div className={s.empty}><Icon size={26}/><h3>{title}</h3><p>{children}</p><Link className={s.secondary} href={href}>{action}<ArrowRight size={15}/></Link></div>;
}
export function LoadingRows() {
  return <div role="status" aria-label="Carregando dados"><div className={s.skeleton}/><div className={s.skeleton}/><div className={s.skeleton}/></div>;
}
