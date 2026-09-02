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
import ImmersiveSceneCanvas from "./ImmersiveSceneCanvas";
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

const SCENE_NAMES = ["Aproximação", "Travessia", "Contexto", "Atrito", "Solução", "Impacto", "Pouso"];

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
}: {
  projeto: Projeto;
  priority?: boolean;
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
      <div className={styles.viewportScreen}>
        <Image
          src={projeto.imagemPrincipal}
          alt={"Interface real do projeto " + projeto.nome}
          fill
          priority={priority}
          className={styles.projectImage}
          sizes="(max-width: 899px) 92vw, 54vw"
        />
        <div className={styles.screenReflection} aria-hidden="true" />
      </div>
    </div>
  );
}

export default function ImmersiveCaseStudy({ projeto, nextProjeto }: ImmersiveCaseStudyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introCopyRef = useRef<HTMLDivElement>(null);
  const introDeviceRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLImageElement>(null);
  const crossingRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const progressNameRef = useRef<HTMLSpanElement>(null);
  const sceneProgressRef = useRef(0);

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
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const portal = portalRef.current;
    const crossing = crossingRef.current;
    if (!root || !scene || !stage || !portal || !crossing) return;

    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 900px)",
        mobile: "(max-width: 899px)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const conditions = context.conditions as { desktop: boolean; mobile: boolean; motion: boolean };
        if (!conditions.motion) return;

        const chapterElements = Array.from(root.querySelectorAll<HTMLElement>("[data-scene-chapter]"));
        const sliceElements = Array.from(root.querySelectorAll<HTMLElement>("[data-depth-slice]"));
        const setImmersiveDocumentState = (active: boolean) => {
          if (active) {
            document.documentElement.dataset.orbitaImmersive = "active";
          } else {
            delete document.documentElement.dataset.orbitaImmersive;
          }
        };
        const introDevice = introDeviceRef.current;
        const introCopy = introCopyRef.current;
        const backdrop = backdropRef.current;
        const isMobile = conditions.mobile;

        const animation = gsap.context(() => {
          gsap.set(chapterElements, {
            autoAlpha: 0,
            yPercent: isMobile ? 24 : 30,
            filter: "blur(16px)",
            clipPath: "inset(0 0 100% 0)",
          });
          gsap.set(crossing, { autoAlpha: 0, scale: 0.72, filter: "blur(18px)" });
          gsap.set(sliceElements, { autoAlpha: 0 });
          gsap.set(portal, {
            autoAlpha: 0,
            clipPath: isMobile
              ? "inset(47% 5% 10% 5% round 22px)"
              : "inset(17% 4.5% 16% 47% round 26px)",
          });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: scene,
              start: "top top",
              end: "bottom bottom",
              scrub: isMobile ? 0.62 : 0.82,
              invalidateOnRefresh: true,
              onLeave: () => {
                setImmersiveDocumentState(false);
              },
              onEnterBack: () => {
                setImmersiveDocumentState(true);
              },
              onLeaveBack: () => {
                setImmersiveDocumentState(false);
              },
              onUpdate: (self) => {
                sceneProgressRef.current = self.progress;
                setImmersiveDocumentState(self.isActive && self.progress > 0.055);
                stage.style.setProperty("--scene-progress", String(self.progress));
                if (progressBarRef.current) {
                  progressBarRef.current.style.transform = `scaleX(${self.progress})`;
                }
                const thresholds = [0, 0.1, 0.2, 0.32, 0.47, 0.62, 0.8];
                const sceneIndex = thresholds.reduce(
                  (activeIndex, threshold, index) => (self.progress >= threshold ? index : activeIndex),
                  0,
                );
                if (progressNameRef.current) progressNameRef.current.textContent = SCENE_NAMES[sceneIndex];
              },
            },
          });

          timeline
            .to(introCopy, { autoAlpha: 0, yPercent: -22, scale: 0.94, filter: "blur(10px)", duration: 0.72 }, 0.18)
            .to(introDevice, { autoAlpha: 0, scale: isMobile ? 1.18 : 1.35, yPercent: isMobile ? -12 : 2, duration: 0.88 }, 0.2)
            .to(backdrop, { opacity: 0, scale: 1.38, filter: "blur(62px) saturate(1.65)", duration: 0.95 }, 0.12)
            .to("[data-intro-ui]", { autoAlpha: 0, y: -12, duration: 0.32 }, 0.18)
            .to(portal, { autoAlpha: 1, duration: 0.18 }, 0.22)
            .to(portal, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.95, ease: "power3.inOut" }, 0.24)
            .to(stage, { "--scene-veil": 0.18, "--grid-opacity": 0.26, duration: 0.8 }, 0.35)
            .to(crossing, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.34 }, 0.68)
            .to(crossing, { autoAlpha: 0, scale: 1.32, filter: "blur(12px)", duration: 0.36 }, 1.05)
            .fromTo(
              chapterElements[0],
              { autoAlpha: 0, yPercent: 30, filter: "blur(16px)", clipPath: "inset(0 0 100% 0)" },
              { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 0.44 },
              1.18,
            )
            .to(portal, { scale: isMobile ? 1.12 : 1.08, xPercent: isMobile ? -3 : -2, yPercent: -2, duration: 0.92 }, 1.12)
            .to(stage, { "--scene-veil": 0.35, "--scene-focus-x": "28%", "--scene-focus-y": "72%", duration: 0.9 }, 1.14)
            .to(chapterElements[0], { autoAlpha: 0, yPercent: -24, filter: "blur(14px)", clipPath: "inset(100% 0 0 0)", duration: 0.34 }, 2.0)
            .fromTo(
              chapterElements[1],
              { autoAlpha: 0, xPercent: isMobile ? 0 : 18, yPercent: 18, filter: "blur(18px)", clipPath: "inset(0 0 100% 0)" },
              { autoAlpha: 1, xPercent: 0, yPercent: 0, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 0.44 },
              2.16,
            )
            .to(portal, { scale: isMobile ? 1.28 : 1.2, xPercent: isMobile ? 7 : 4, yPercent: isMobile ? 1 : 4, rotate: isMobile ? 0 : -0.8, duration: 1.0 }, 2.1)
            .to(stage, { "--scene-veil": 0.55, "--grid-opacity": 0.5, "--scene-focus-x": "74%", "--scene-focus-y": "22%", duration: 0.95 }, 2.12)
            .to(sliceElements, { autoAlpha: 0.42, stagger: 0.04, duration: 0.2 }, 2.32)
            .to(sliceElements[0], { xPercent: -3.5, duration: 0.5 }, 2.36)
            .to(sliceElements[1], { xPercent: 4.5, duration: 0.5 }, 2.36)
            .to(sliceElements[2], { xPercent: -2, duration: 0.5 }, 2.36)
            .to(chapterElements[1], { autoAlpha: 0, xPercent: -12, filter: "blur(16px)", clipPath: "inset(100% 0 0 0)", duration: 0.34 }, 3.03)
            .to(sliceElements, { xPercent: 0, autoAlpha: 0, duration: 0.36 }, 3.05)
            .fromTo(
              chapterElements[2],
              { autoAlpha: 0, scale: 0.84, filter: "blur(18px)", clipPath: "inset(0 50% 0 50%)" },
              { autoAlpha: 1, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0%)", duration: 0.48 },
              3.22,
            )
            .to(portal, { scale: isMobile ? 1.08 : 1.04, xPercent: isMobile ? -6 : -3, yPercent: 0, rotate: 0, duration: 1.0 }, 3.16)
            .to(stage, { "--scene-veil": 0.24, "--grid-opacity": 0.16, "--scene-focus-x": "48%", "--scene-focus-y": "48%", "--orbit-opacity": 0.72, duration: 1.0 }, 3.16)
            .to(chapterElements[2], { autoAlpha: 0, scale: 1.13, filter: "blur(14px)", clipPath: "inset(50% 0 50% 0)", duration: 0.34 }, 4.12)
            .fromTo(
              chapterElements[3],
              { autoAlpha: 0, yPercent: 22, scale: 0.9, filter: "blur(16px)", clipPath: "inset(0 0 100% 0)" },
              { autoAlpha: 1, yPercent: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 0.5 },
              4.32,
            )
            .to(portal, { scale: isMobile ? 0.98 : 0.94, xPercent: 0, yPercent: 0, opacity: 0.72, duration: 1.05 }, 4.26)
            .to(stage, { "--scene-veil": 0.68, "--grid-opacity": 0.08, "--orbit-opacity": 1, duration: 1.05 }, 4.26)
            .to(chapterElements[3], { autoAlpha: 0, yPercent: -18, scale: 1.08, filter: "blur(14px)", duration: 0.36 }, 5.28)
            .to(portal, { scale: 0.72, opacity: 0.28, filter: "blur(7px)", duration: 0.86 }, 5.3)
            .to(stage, { "--scene-veil": 0.82, "--orbit-opacity": 0.26, duration: 0.8 }, 5.32)
            .fromTo(
              "[data-landing]",
              { autoAlpha: 0, yPercent: 30, scale: 0.82, filter: "blur(20px)" },
              { autoAlpha: 1, yPercent: 0, scale: 1, filter: "blur(0px)", duration: 0.54 },
              5.54,
            )
            .to("[data-landing]", { autoAlpha: 0, yPercent: -16, scale: 1.1, filter: "blur(12px)", duration: 0.38 }, 6.38)
            .to(portal, { scale: 1.03, opacity: 0, filter: "blur(18px)", duration: 0.52 }, 6.42);
        }, root);

        return () => {
          sceneProgressRef.current = 0;
          setImmersiveDocumentState(false);
          animation.revert();
        };
      },
    );

    return () => media.revert();
  }, [projeto.slug]);

  return (
    <div ref={rootRef} className={styles.experience} style={themeStyle}>
      <section ref={sceneRef} className={styles.scene} aria-label={"Experiência do projeto " + projeto.nome}>
        <div ref={stageRef} className={styles.sceneStage}>
          <div className={styles.introBackdropWrap} aria-hidden="true">
            <Image
              ref={backdropRef}
              src={projeto.imagemPrincipal}
              alt=""
              fill
              priority
              className={styles.introBackdrop}
              sizes="100vw"
            />
          </div>
          <div className={styles.introShade} aria-hidden="true" />

          <div ref={portalRef} className={styles.portal} aria-hidden="true">
            <Image src={projeto.imagemPrincipal} alt="" fill priority className={styles.portalFallback} sizes="100vw" />
            <ImmersiveSceneCanvas
              image={projeto.imagemPrincipal}
              accent={theme.accent}
              second={theme.second}
              progressRef={sceneProgressRef}
              className={styles.sceneCanvas}
            />
            <div className={styles.depthSlices}>
              {["top", "middle", "bottom"].map((slice) => (
                <div key={slice} data-depth-slice className={styles.depthSlice} data-slice={slice}>
                  <Image src={projeto.imagemPrincipal} alt="" fill className={styles.depthImage} sizes="100vw" />
                </div>
              ))}
            </div>
            <LazyVideo
              src="/hero-projetos.mp4"
              mobileSrc="/hero-projetos-mobile.mp4"
              autoPlay
              loop
              muted
              playsInline
              className={styles.portalVideo}
            />
          </div>

          <div className={styles.sceneVeil} aria-hidden="true" />
          <div className={styles.sceneGrid} aria-hidden="true" />
          <div className={styles.sceneHalo} aria-hidden="true" />
          <div className={styles.orbitRing} aria-hidden="true"><i /><i /><i /></div>
          <div className={styles.noise} aria-hidden="true" />

          <div className={styles.introLayer}>
            <Link href="/projetos" className={styles.backLink} data-intro-ui>
              <ArrowLeft size={15} />
              Todos os projetos
            </Link>

            <div ref={introCopyRef} className={styles.introCopy}>
              <div className={styles.eyebrow}>
                <span>Case real</span>
                <i />
                <span>{category}</span>
              </div>
              <h1>{projeto.nome}</h1>
              <p className={styles.introSummary}>{projeto.resumo}</p>

              <div className={styles.introActions}>
                {projeto.link && (
                  <a className={styles.primaryAction} href={projeto.link} target="_blank" rel="noreferrer">
                    Explorar projeto <ExternalLink size={16} />
                  </a>
                )}
                <a
                  className={styles.secondaryAction}
                  href="https://wa.me/5511949138973?text=Ol%C3%A1%2C+vi+um+case+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento"
                  target="_blank"
                  rel="noreferrer"
                >
                  Quero algo assim <ArrowRight size={16} />
                </a>
              </div>

              <div className={styles.introProof}>
                <span><i />{STATUS_LABELS[projeto.status]}</span>
                <span>{projeto.tags[0] ?? "Produto digital"}</span>
                <span>Experiência mobile-first</span>
              </div>
            </div>

            <div ref={introDeviceRef} className={styles.introDevice}>
              <div className={styles.deviceGlow} aria-hidden="true" />
              <ProjectViewport projeto={projeto} priority />
              <div className={styles.deviceNote}>
                <span>Interface real</span>
                <span>{host}</span>
              </div>
            </div>

            <div className={styles.scrollCue} data-intro-ui aria-hidden="true">
              <span>Use o scroll para atravessar</span>
              <ArrowDown size={16} />
            </div>
          </div>

          <div ref={crossingRef} className={styles.crossing} aria-hidden="true">
            <span>Não observe.</span>
            <strong>Entre.</strong>
          </div>

          <div className={styles.chapters}>
            {chapters.map((chapter, index) => (
              <article
                key={chapter.number}
                data-scene-chapter
                data-chapter={index + 1}
                className={styles.chapter}
              >
                <span className={styles.chapterNumber} aria-hidden="true">{chapter.number}</span>
                <p className={styles.chapterLabel}>{chapter.number} / {chapter.label}</p>
                <h2>{chapter.title}</h2>
                <p className={styles.chapterBody}>{chapter.body}</p>
              </article>
            ))}
          </div>

          <div data-landing className={styles.landing}>
            <p>Do atrito ao produto</p>
            <strong>{projeto.nome}</strong>
            <span>Uma experiência Orbitamos em operação.</span>
          </div>

          <div className={styles.sceneHud} aria-hidden="true">
            <div className={styles.sceneProgress}><span ref={progressBarRef} /></div>
            <span ref={progressNameRef}>{SCENE_NAMES[0]}</span>
            <span>{host}</span>
          </div>
        </div>
      </section>

      <section className={styles.delivery}>
        <div className={styles.deliveryInner}>
          <div className={styles.deliveryIntro}>
            <p>Decisões que sustentam a experiência</p>
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
