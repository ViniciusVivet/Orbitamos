import { projetos } from "@/data/projetos";
import { getHomeFeaturedProjects } from "@/lib/projectCatalog";
import ProjectCard from "@/components/projetos/ProjectCard";
import styles from "@/components/projetos/ProjectCatalog.module.css";

export default function HomeProjectSelection() {
  return (
    <div className={styles.homeGrid} data-home-projects>
      {getHomeFeaturedProjects(projetos).map((projeto) => (
        <ProjectCard key={projeto.slug} projeto={projeto} variant="home" />
      ))}
    </div>
  );
}
