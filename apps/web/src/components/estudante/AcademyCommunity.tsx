import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, MessageCircle, MessagesSquare } from "lucide-react";
import { OrbitScene } from "@/components/brand/OrbitPhoto";
import { discordUrl } from "@/lib/social";
import s from "./AcademyCommunity.module.css";

export default function AcademyCommunity({ preview = false }: { preview?: boolean } = {}) {
  return <div className={s.community} data-academy-community>
    <header className={s.heading}><p>ORBITAMOS ACADEMY / COMUNIDADE</p><h1>Você não precisa<br/><em>descobrir tudo sozinho.</em></h1><div>Escolha o lugar certo para sua dúvida: uma conversa aberta, orientação ou uma mensagem. Traga o que tentou e o que esperava que acontecesse.</div></header>
    {preview && <p className={s.previewNote}>Nesta prévia, mentorias e mensagens abrem o portal e pedem sua conta. O fórum é público e o Discord é um espaço externo.</p>}
    <section className={s.channels} aria-label="Onde pedir ajuda">
      <article><MessageCircle size={26} aria-hidden="true"/><span>CONVERSA ABERTA</span><h2>Troque no fórum.</h2><p>Compartilhe uma dúvida ou descoberta e acompanhe as respostas. Outras pessoas também podem aprender com sua pergunta.</p><Link href="/forum">Abrir fórum público<ArrowRight size={17}/></Link></article>
      <article><GraduationCap size={26} aria-hidden="true"/><span>ORIENTAÇÃO PARA SEGUIR</span><h2>Explore as mentorias.</h2><p>Veja como pedir orientação para uma dificuldade ou para seu caminho de estudo. Consulte as condições e a disponibilidade na página.</p><Link href="/estudante/mentorias">Ver mentorias<ArrowRight size={17}/></Link></article>
      <article><MessagesSquare size={26} aria-hidden="true"/><span>SUAS CONVERSAS</span><h2>Continue por mensagem.</h2><p>Abra suas conversas para acompanhar o que já estava discutindo. O retorno mantém você na área de estudos.</p><Link href="/mensagens?area=student">Abrir mensagens<ArrowRight size={17}/></Link></article>
    </section>
    <section className={s.context} aria-label="Como compartilhar uma dúvida"><div><span>UMA BOA PERGUNTA ABRE CAMINHO</span><h2>Mostre o que aconteceu.</h2><p>Você não precisa saber os termos técnicos para pedir ajuda. Um contexto pequeno já faz diferença.</p><ol><li><strong>O objetivo</strong><span>“Estou fazendo a missão de condições em C#.”</span></li><li><strong>A tentativa</strong><span>Mostre o trecho de código ou descreva o que testou.</span></li><li><strong>O resultado</strong><span>Conte o que apareceu e o que você esperava ver.</span></li></ol><small>Retire senhas, chaves e dados pessoais antes de compartilhar código ou prints.</small></div><OrbitScene kind="equipe" className={s.photo} sizes="(max-width: 767px) 100vw, 42vw"/></section>
    <aside className={s.discord}><div><span>MAIS PERTO DA GALERA</span><h2>A comunidade também está no Discord.</h2><p>Um espaço externo para trocar ideias e manter contato. Abre em outra aba; seu estudo fica aqui.</p></div><Link href={discordUrl} target="_blank" rel="noreferrer">Entrar no Discord<ArrowUpRight size={17}/></Link></aside>
  </div>;
}
