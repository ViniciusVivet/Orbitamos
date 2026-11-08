import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectEnvironment } from "@/lib/projectEnvironments";
import styles from "./ProjectCategoryLayout.module.css";

interface ProjetosHeroProps {
  environment: ProjectEnvironment;
}

export default function ProjetosHero({ environment }: ProjetosHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="project-world-title" data-project-category-hero={environment.id}>
      <div className={styles.heroInner}>
        <div key={environment.id} className={styles.heroCopy}>
          <div>
            <p className={styles.eyebrow}>Portfólio Orbitamos <span aria-hidden="true">/</span> {environment.label}</p>
            <h1 id="project-world-title" className={styles.heroTitle}>{environment.title}</h1>
          </div>
          <div className={styles.heroDetail}>
            <p className={styles.heroDescription}>{environment.description}</p>
            <div className={styles.heroActions}>
              <Link href={environment.ctaHref} className={styles.primaryAction}>{environment.ctaLabel}<ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
