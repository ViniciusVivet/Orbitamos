import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { ProjectEnvironment } from "@/lib/projectEnvironments";
import styles from "./ProjectCategoryLayout.module.css";

interface ProjetosHeroProps {
  environment: ProjectEnvironment;
  projectCount: number;
}

export default function ProjetosHero({ environment, projectCount }: ProjetosHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="project-world-title" data-project-category-hero={environment.id}>
      <div className={styles.heroInner}>
        <div key={environment.id} className={styles.heroCopy}>
          <p className={styles.eyebrow}>Portfólio Orbitamos <span aria-hidden="true">/</span> {environment.label}</p>
          <h1 id="project-world-title" className={styles.heroTitle}>{environment.title}</h1>
          <p className={styles.heroDescription}>{environment.description}</p>
          <div className={styles.heroActions}>
            <Link href={environment.ctaHref} className={styles.primaryAction}>{environment.ctaLabel}<ArrowRight size={17} aria-hidden="true" /></Link>
            {projectCount > 0
              ? <a href="#projetos-grid" className={styles.exploreAction}>{projectCount} {projectCount === 1 ? "projeto para conhecer" : "projetos para conhecer"}<ArrowDown size={15} aria-hidden="true" /></a>
              : <span className={styles.caseNote}>Ainda sem case público nesta categoria.</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
