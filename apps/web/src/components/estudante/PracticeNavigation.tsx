"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Gamepad2, Languages, RotateCcw } from "lucide-react";
import { academyPreviewHref, practiceMode } from "@/lib/portalNavigation";
import s from "@/components/portal/PortalNavigation.module.css";

export default function PracticeNavigation({ preview = false, mode }: { preview?: boolean; mode?: "code" | "games" | "english" | "review" }) {
  const path = usePathname();
  const active = mode ?? practiceMode(path);
  const entries = [{ id: "code", title: "Código", href: "/estudante/pratica", icon: Code2 }, { id: "games", title: "Jogos", href: "/estudante/jogos", icon: Gamepad2 }, { id: "english", title: "Inglês", href: "/estudante/jogos/ingles-em-cena", icon: Languages }, { id: "review", title: "Revisão", href: "/estudante/jogos/revisao", icon: RotateCcw }];
  return <nav className={s.tabs} aria-label="Formatos de prática" data-practice-navigation>{entries.map(({ id, title, href, icon: Icon }) => <Link key={id} href={preview ? academyPreviewHref(href) : href} aria-current={active === id ? "page" : undefined}><Icon aria-hidden="true"/>{title}</Link>)}</nav>;
}
