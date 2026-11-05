import { projetos } from "@/data/projetos";
import s from "./ProjectCatalog.module.css";

export default function ProjetosStats() {
  const categories = new Set(projetos.map((project) => project.categoria)).size;
  return <section className={s.facts} aria-label="O portfólio em números">
    <div className={s.factsInner}>
      <p className={s.factsIntro}>De uma presença digital a uma operação própria. Conheça o que já construímos.</p>
      <ul className={s.factList}>
        <li><strong>{projetos.length}</strong><span>projetos no portfólio</span></li>
        <li><strong>{categories}</strong><span>tipos de entrega</span></li>
      </ul>
    </div>
  </section>;
}
