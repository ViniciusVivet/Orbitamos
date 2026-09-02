"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Github,
} from "lucide-react";
import LazyVideo from "@/components/LazyVideo";
import type { Projeto } from "@/types/projeto";
import { CATEGORIAS, STATUS_LABELS } from "@/types/projeto";
import styles from "./ImmersiveCaseStudy.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ImmersiveCaseStudyProps {
  projeto: Projeto;
  nextProjeto: Projeto;
}

const CASE_THEMES: Record<string, { accent: string; accentSoft: string; second: string }> = {
  "yume-moda-disruptiva": { accent: "#29f5c6", accentSoft: "41 245 198", second: "#8b5cf6" },
  "sensimilla-records": { accent: "#d9ff57", accentSoft: "217 255 87", second: "#8b5cf6" },
  "mb-multimarcas-infantil": { accent: "#ff79b7", accentSoft: "255 121 183", second: "#70d6ff" },
  "sabrina-lashes": { accent: "#ff9ecb", accentSoft: "255 158 203", second: "#c4a1ff" },
  kitcerto: { accent: "#ffbd2e", accentSoft: "255 189 46", second: "#fb7185" },
  "destaque-multimarcas": { accent: "#ff4d55", accentSoft: "255 77 85", second: "#ffb020" },
  "radar-da-rima": { accent: "#ff5a1f", accentSoft: "255 90 31", second: "#ffc42e" },
  "orbicore-gestao": { accent: "#51e5ff", accentSoft: "81 229 255", second: "#8b5cf6" },
  "orbitamos-portal-tech": { accent: "#00d4ff", accentSoft: "0 212 255", second: "#8b5cf6" },
};

function getCategoryLabel(category: string) {
  return CATEGORIAS.find((item) => item.slug === category)?.label ?? category;
}

function getProjectHost(link?: string) {
  if (!link) return "orbitamosbr.com";
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "projeto publicado";
  }
}

function ProjectViewport({
  projeto,
  priority = false,
  compact = false,
}: {
  projeto: Projeto;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={styles.viewport}>
      <div className={styles.viewportBar}>
        <div className={styles.viewportDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.viewportAddress}>
          <span className={styles.secureDot} />
          {getProjectHost(projeto.link)}
        </div>
        <span className={styles.viewportLive}>LIVE</span>
      </div>
      <div className={styles.viewportScreen + (compact ? " " + styles.viewportScreenCompact : "")}>
        <Image
          src={projeto.imagemPrincipal}
          alt={"Interface real do projeto " + projeto.nome}
          fill
          priority={priority}
          className={styles.projectImage}
          sizes={compact ? "(max-width: 899px) 92vw, 58vw" : "(max-width: 899px) 94vw, 52vw"}
        />
        <div className={styles.screenReflection} aria-hidden="true" />
      </div>
    </div>
  );
}

export default function ImmersiveCaseStudy({ projeto, nextProjeto }: ImmersiveCaseStudyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const storyVisualRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const theme = CASE_THEMES[projeto.slug] ?? CASE_THEMES["orbitamos-portal-tech"];
  const category = getCategoryLabel(projeto.categoria);
  const host = getProjectHost(projeto.link);
  const themeStyle = {
    "--case-accent": theme.accent,
    "--case-accent-rgb": theme.accentSoft,
    "--case-second": theme.second,
  } as CSSProperties;

  const chapters = [
    { number: "01", label: "Contexto", title: "O ponto de partida", body: projeto.contexto },
    { number: "02", label: "Problema", title: "O atrito real", body: projeto.problema },
    { number: "03", label: "Solução", title: "A virada", body: projeto.solucao },
    { number: "04", label: "Impacto", title: "O que mudou", body: projeto.resultado },
  ];

  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const story = storyRef.current;
    const stage = stageRef.current;
    const visual = storyVisualRef.current;
    if (!root || !hero || !story || !stage || !visual) return;

    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const chapterElements = Array.from(root.querySelectorAll<HTMLElement>("[data-story-chapter]"));
        const progressNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-progress-node]"));

        gsap.set(chapterElements, { autoAlpha: 0, y: 54, filter: "blur(12px)" });
        gsap.set(chapterElements[0], { autoAlpha: 1, y: 0, filter: "blur(0px)" });
        gsap.set(visual, { scale: 0.86, xPercent: 6, rotateY: -5, transformPerspective: 1400 });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: hero,
              start: "top top+=64",
              end: "bottom top+=64",
              scrub: 0.9,
            },
          })
          .to(heroCopyRef.current, { yPercent: -14, autoAlpha: 0.18, ease: "none" }, 0)
          .to(heroVisualRef.current, { yPercent: 15, scale: 1.08, rotateX: 2, ease: "none" }, 0);

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: story,
            start: "top top+=64",
            end: "bottom bottom",
            scrub: 0.75,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressRef.current?.style.setProperty("--story-progress", String(self.progress));
              const active = Math.min(chapterElements.length - 1, Math.floor(self.progress * chapterElements.length));
              progressNodes.forEach((node, index) => node.toggleAttribute("data-active", index <= active));
            },
          },
        });

        timeline
          .to(visual, { scale: 1, xPercent: 0, rotateY: 0, duration: 0.8 }, 0)
          .to(chapterElements[0], { autoAlpha: 0, y: -48, filter: "blur(10px)", duration: 0.28 }, 0.82)
          .fromTo(
            chapterElements[1],
            { autoAlpha: 0, y: 56, filter: "blur(12px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.34 },
            1.02,
          )
          .to(visual, { scale: 1.1, xPercent: -3, yPercent: -2, rotateY: 2.5, duration: 0.95 }, 0.96)
          .to(chapterElements[1], { autoAlpha: 0, y: -48, filter: "blur(10px)", duration: 0.28 }, 1.82)
          .fromTo(
            chapterElements[2],
            { autoAlpha: 0, y: 56, filter: "blur(12px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.34 },
            2.02,
          )
          .to(visual, { scale: 1.2, xPercent: 2, yPercent: 3, rotateY: -2, duration: 0.95 }, 1.96)
          .to(chapterElements[2], { autoAlpha: 0, y: -48, filter: "blur(10px)", duration: 0.28 }, 2.82)
          .fromTo(
            chapterElements[3],
            { autoAlpha: 0, y: 56, filter: "blur(12px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.34 },
            3.02,
          )
          .to(visual, { scale: 1.06, xPercent: 0, yPercent: 1, rotateY: 0, opacity: 0.5, duration: 0.95 }, 2.96)
          .to(stage, { "--stage-glow": 1, duration: 0.95 }, 2.96);
      }, root);

      return () => context.revert();
    });

    return () => media.revert();
  }, [projeto.slug]);

  return (
    <div ref={rootRef} className={styles.experience} style={themeStyle}>
      <section ref={heroRef} className={styles.hero}>
        <Image src={projeto.imagemPrincipal} alt="" fill priority aria-hidden="true" className={styles.heroBackdrop} sizes="100vw" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.noise} aria-hidden="true" />

        <div className={styles.heroInner}>
          <Link href="/projetos" className={styles.backLink}>
            <ArrowLeft size={15} />
            Todos os projetos
          </Link>

          <div className={styles.heroGrid}>
            <div ref={heroCopyRef} className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                <span>Case real</span>
                <i />
                <span>{category}</span>
              </div>
              <h1>{projeto.nome}</h1>
              <p className={styles.heroSummary}>{projeto.resumo}</p>

              <div className={styles.heroActions}>
                {projeto.link && (
                  <a className={styles.primaryAction} href={projeto.link} target="_blank" rel="noreferrer">
                    Explorar projeto
                    <ExternalLink size={16} />
                  </a>
                )}
                <a
                  className={styles.secondaryAction}
                  href="https://wa.me/5511949138973?text=Ol%C3%A1%2C+vi+um+case+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento"
                  target="_blank"
                  rel="noreferrer"
                >
                  Quero algo assim
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className={styles.heroProof}>
                <span><i />{STATUS_LABELS[projeto.status]}</span>
                <span>{projeto.tags[0] ?? "Produto digital"}</span>
                <span>Experiência mobile-first</span>
              </div>
            </div>

            <div ref={heroVisualRef} className={styles.heroVisual}>
              <div className={styles.heroVisualGlow} aria-hidden="true" />
              <ProjectViewport projeto={projeto} priority />
              <div className={styles.visualNote}>
                <span>Interface real</span>
                <span>{host}</span>
              </div>
            </div>
          </div>

          <div className={styles.scrollCue} aria-hidden="true">
            <span>Entre no projeto</span>
            <ArrowDown size={16} />
          </div>
        </div>
      </section>

      <section ref={storyRef} className={styles.story} aria-label={"História do projeto " + projeto.nome}>
        <div ref={stageRef} className={styles.storyStage}>
          <LazyVideo
            src="/hero-projetos.mp4"
            mobileSrc="/hero-projetos-mobile.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className={styles.storyVideo}
          />
          <div className={styles.storyShade} aria-hidden="true" />
          <div className={styles.storyGrid} aria-hidden="true" />

          <div className={styles.storyTopline}>
            <span>Projeto por dentro</span>
            <span>Role para avançar</span>
          </div>

          <div className={styles.storyLayout}>
            <div className={styles.storyVisualColumn}>
              <div ref={storyVisualRef} className={styles.storyVisual}>
                <ProjectViewport projeto={projeto} compact />
              </div>
              <div className={styles.storyCaption}>
                <span className={styles.captionPulse} />
                Produto em operação
                <span>{host}</span>
              </div>
            </div>

            <div className={styles.chapters}>
              {chapters.map((chapter, index) => (
                <article
                  key={chapter.number}
                  data-story-chapter
                  className={styles.chapter + (index === chapters.length - 1 ? " " + styles.chapterOutcome : "")}
                >
                  <span className={styles.chapterGhost} aria-hidden="true">{chapter.number}</span>
                  <p className={styles.chapterLabel}>{chapter.number} / {chapter.label}</p>
                  <h2>{chapter.title}</h2>
                  <p className={styles.chapterBody}>{chapter.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div ref={progressRef} className={styles.progress} aria-hidden="true">
            <div className={styles.progressTrack}><span className={styles.progressFill} /></div>
            {chapters.map((chapter, index) => (
              <span
                key={chapter.number}
                data-progress-node={chapter.number}
                data-active={index === 0 ? "true" : undefined}
                className={styles.progressNode}
              >
                {chapter.number}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.delivery}>
        <div className={styles.deliveryInner}>
          <div className={styles.deliveryIntro}>
            <p>Detalhes que sustentam a experiência</p>
            <h2>O que ficou<br />de pé.</h2>
            <span>{projeto.destaques.length} decisões de produto transformadas em experiência real.</span>
          </div>

          <ol className={styles.featureList}>
            {projeto.destaques.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
                <Check size={18} aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.stackRail}>
          <span>Construído com</span>
          <div>{projeto.stack.map((tech) => <strong key={tech}>{tech}</strong>)}</div>
          {projeto.github && (
            <a href={projeto.github} target="_blank" rel="noreferrer">
              <Github size={16} />
              Ver código
            </a>
          )}
        </div>
      </section>

      <section className={styles.nextSection}>
        <Link href={"/projetos/" + nextProjeto.slug} className={styles.nextCase}>
          <Image src={nextProjeto.imagemPrincipal} alt="" fill className={styles.nextImage} sizes="100vw" />
          <div className={styles.nextShade} />
          <div className={styles.nextContent}>
            <p>Próximo case</p>
            <h2>{nextProjeto.nome}</h2>
            <span>Continuar explorando <ArrowRight size={18} /></span>
          </div>
        </Link>
      </section>
    </div>
  );
}
