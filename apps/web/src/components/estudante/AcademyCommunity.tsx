import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { discordUrl } from "@/lib/social";
import s from "./AcademyCommunity.module.css";

export default function AcademyCommunity({ preview = false }: { preview?: boolean } = {}) {
  return <div className={s.community} data-academy-community>
    <header className={s.heading}>
      <div><span>COMUNIDADE</span><h1>Tem gente<br/>{" "}do seu lado.</h1><p>Uma dúvida, uma descoberta ou aquele código que não funciona. Traga para a conversa.</p><Link href="/forum">Pedir ajuda no fórum<ArrowRight size={18}/></Link></div>
      <OrbitPhoto kind="equipe" className={s.heroPhoto} sizes="(max-width: 767px) 92vw, 48vw"/>
    </header>
    <section className={s.channels} aria-label="Onde pedir ajuda">
      <article><OrbitPhoto kind="equipe" className={s.channelPhoto} sizes="(max-width: 650px) 34vw, 30vw"/><div><span>PERGUNTE E COMPARTILHE</span><h2>Fórum</h2><p>Troque dúvidas e descobertas em uma conversa aberta.</p><Link href="/forum">Abrir fórum público<ArrowRight size={17}/></Link></div></article>
      <article><OrbitPhoto kind="mentoria" className={s.channelPhoto} sizes="(max-width: 650px) 34vw, 30vw"/><div><span>UMA CONVERSA COM DIREÇÃO</span><h2>Mentorias</h2><p>Confira as opções de orientação e a disponibilidade.</p><Link href="/estudante/mentorias">Ver mentorias<ArrowRight size={17}/></Link></div></article>
      <article><OrbitPhoto kind="estudo" className={s.channelPhoto} sizes="(max-width: 650px) 34vw, 30vw"/><div><span>CONTINUE DE ONDE PAROU</span><h2>Mensagens</h2><p>Volte às conversas que você já começou.</p><Link href="/mensagens?area=student">Abrir mensagens<ArrowRight size={17}/></Link></div></article>
    </section>
    <details className={s.context}><summary>Não sei como explicar minha dúvida<ArrowRight size={17}/></summary><p>Não precisa usar termos técnicos. Conte estas três coisas:</p><ol><li><strong>O que você quer fazer</strong><span>“Estou na missão de condições em C#.”</span></li><li><strong>O que já tentou</strong><span>Mostre um trecho do código ou descreva sua tentativa.</span></li><li><strong>O que aconteceu</strong><span>Conte o resultado e o que esperava ver.</span></li></ol><small>Retire senhas, chaves e dados pessoais antes de compartilhar.</small></details>
    <aside className={s.discord}><div><span>ENCONTRE A GALERA</span><h2>Vamos de Discord?</h2><p>A conversa continua por lá, em outra aba.</p></div><Link href={discordUrl} target="_blank" rel="noreferrer">Entrar no Discord<ArrowUpRight size={17}/></Link></aside>
    {preview && <p className={s.previewNote}>Mentorias e mensagens pedem sua conta. O fórum é público; o Discord abre em outro site.</p>}
  </div>;
}
