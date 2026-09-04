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
  SkipForward,
} from "lucide-react";
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

type MotionProfile = readonly [cameraPhase: number, flow: number, tension: number, angle: number];

const CASE_THEMES: Record<string, { accent: string; accentSoft: string; second: string; motion: MotionProfile }> = {
  "yume-moda-disruptiva": { accent: "#29f5c6", accentSoft: "41 245 198", second: "#8b5cf6", motion: [0.18, 0.84, 0.28, 0.12] },
  "sensimilla-records": { accent: "#d9ff57", accentSoft: "217 255 87", second: "#8b5cf6", motion: [0.76, 0.42, 0.88, 0.34] },
  "mb-multimarcas-infantil": { accent: "#ff79b7", accentSoft: "255 121 183", second: "#70d6ff", motion: [0.42, 0.68, 0.38, 0.74] },
  "sabrina-lashes": { accent: "#ff9ecb", accentSoft: "255 158 203", second: "#c4a1ff", motion: [0.12, 0.36, 0.54, 0.9] },
  kitcerto: { accent: "#ffbd2e", accentSoft: "255 189 46", second: "#fb7185", motion: [0.58, 0.2, 0.7, 0.48] },
  "destaque-multimarcas": { accent: "#ff4d55", accentSoft: "255 77 85", second: "#ffb020", motion: [0.94, 0.16, 0.32, 0.08] },
  "radar-da-rima": { accent: "#ff5a1f", accentSoft: "255 90 31", second: "#ffc42e", motion: [0.82, 0.76, 0.94, 0.62] },
  "orbicore-gestao": { accent: "#51e5ff", accentSoft: "81 229 255", second: "#8b5cf6", motion: [0.34, 0.1, 0.62, 0.8] },
  "orbitamos-portal-tech": { accent: "#00d4ff", accentSoft: "0 212 255", second: "#8b5cf6", motion: [0.52, 0.56, 0.48, 0.54] },
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
  const motifRef = useRef<HTMLDivElement>(null);
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
    const motif = motifRef.current;
    const crossing = crossingRef.current;
    if (!root || !scene || !stage || !portal || !motif || !crossing) return;

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
        const setImmersiveDocumentState = (state: "intro" | "active" | null) => {
          if (state) {
            document.documentElement.dataset.orbitaImmersive = state;
          } else {
            delete document.documentElement.dataset.orbitaImmersive;
          }
        };
        const introDevice = introDeviceRef.current;
        const introCopy = introCopyRef.current;
        const backdrop = backdropRef.current;
        const isMobile = conditions.mobile;

        setImmersiveDocumentState("intro");

        const animation = gsap.context(() => {
          gsap.set(chapterElements, {
            autoAlpha: 0,
            filter: "blur(16px)",
            clipPath: "inset(0 0 100% 0)",
          });
          gsap.set(crossing, { autoAlpha: 0, scale: 0.72, filter: "blur(18px)" });
          gsap.set(motif, { autoAlpha: 0, scale: 0.92, xPercent: 0, yPercent: 0, rotate: 0 });
          gsap.set(sliceElements, { autoAlpha: 0 });
          gsap.set(portal, {
            autoAlpha: 0,
            clipPath: isMobile
              ? "inset(47% 5% 10% 5% round 22px)"
              : "inset(17% 4.5% 16% 47% round 26px)",
          });

          const releaseTrigger = ScrollTrigger.create({
            trigger: scene,
            start: "top top",
            end: "bottom top",
            onLeave: () => setImmersiveDocumentState(null),
            onEnterBack: () => setImmersiveDocumentState("active"),
            onLeaveBack: () => setImmersiveDocumentState("intro"),
          });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: scene,
              start: "top top",
              end: "bottom bottom",
              // A small follow-through keeps normal wheel/touch input cinematic instead of
              // mapping every abrupt input delta directly to the camera.
              scrub: isMobile ? 0.28 : 0.52,
              invalidateOnRefresh: true,
              onEnterBack: () => {
                setImmersiveDocumentState("active");
              },
              onLeaveBack: () => {
                setImmersiveDocumentState("intro");
              },
              onUpdate: (self) => {
                // With scrub smoothing, ScrollTrigger's raw progress leads the camera.
                // Read the animation itself so shader, HUD and typography stay on one frame.
                const visualProgress = self.animation?.progress() ?? self.progress;
                sceneProgressRef.current = visualProgress;
                setImmersiveDocumentState(self.progress > 0.055 ? "active" : "intro");
                stage.style.setProperty("--scene-progress", String(visualProgress));
                if (progressBarRef.current) {
                  progressBarRef.current.style.transform = `scaleX(${visualProgress})`;
                }
                const thresholds = [0, 0.1, 0.2, 0.32, 0.47, 0.62, 0.8];
                const sceneIndex = thresholds.reduce(
                  (activeIndex, threshold, index) => (visualProgress >= threshold ? index : activeIndex),
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
              { autoAlpha: 0, yPercent: isMobile ? 14 : 30, filter: "blur(16px)", clipPath: "inset(0 0 100% 0)" },
              { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 0.44 },
              1.18,
            )
            .to(portal, { scale: isMobile ? 1.12 : 1.08, xPercent: isMobile ? -3 : -2, yPercent: -2, duration: 0.92 }, 1.12)
            .to(stage, { "--scene-veil": 0.35, "--scene-focus-x": "28%", "--scene-focus-y": "72%", duration: 0.9 }, 1.14)
            .to(chapterElements[0], { autoAlpha: 0, yPercent: -24, filter: "blur(14px)", clipPath: "inset(100% 0 0 0)", duration: 0.34 }, 2.0)
            .fromTo(
              chapterElements[1],
              { autoAlpha: 0, xPercent: isMobile ? 0 : 18, yPercent: isMobile ? 10 : 18, filter: "blur(18px)", clipPath: "inset(0 0 100% 0)" },
              { autoAlpha: 1, xPercent: 0, yPercent: 0, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 0.44 },
              2.16,
            )
            .to(portal, {
              scale: isMobile ? 1.28 : 1.2,
              xPercent: (theme.motion[0] - 0.5) * (isMobile ? 10 : 8),
              yPercent: (theme.motion[1] - 0.5) * (isMobile ? 4 : 7),
              rotate: isMobile ? 0 : (theme.motion[3] - 0.5) * 2.2,
              duration: 1.0,
            }, 2.1)
            .to(stage, { "--scene-veil": 0.52, "--grid-opacity": 0.32, "--scene-focus-x": "74%", "--scene-focus-y": "22%", duration: 0.95 }, 2.12)
            .to(motif, {
              autoAlpha: 0.62,
              scale: 1,
              xPercent: (theme.motion[0] - 0.5) * 12,
              yPercent: (theme.motion[1] - 0.5) * 9,
              rotate: (theme.motion[3] - 0.5) * 8,
              duration: 0.72,
            }, 2.14)
            .to(sliceElements, { autoAlpha: 0.24, stagger: 0.04, duration: 0.2 }, 2.32)
            .to(sliceElements[0], { xPercent: -2.2, duration: 0.5 }, 2.36)
            .to(sliceElements[1], { xPercent: 2.8, duration: 0.5 }, 2.36)
            .to(sliceElements[2], { xPercent: -1.4, duration: 0.5 }, 2.36)
            .to(chapterElements[1], { autoAlpha: 0, xPercent: -12, filter: "blur(16px)", clipPath: "inset(100% 0 0 0)", duration: 0.34 }, 3.03)
            .to(sliceElements, { xPercent: 0, autoAlpha: 0, duration: 0.36 }, 3.05)
            .to(motif, { autoAlpha: 0.18, scale: 1.12, rotate: 0, duration: 0.42 }, 3.05)
            .fromTo(
              chapterElements[2],
              { autoAlpha: 0, scale: 0.84, filter: "blur(18px)", clipPath: "inset(0 50% 0 50%)" },
              { autoAlpha: 1, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0%)", duration: 0.48 },
              3.22,
            )
            .to(portal, { scale: isMobile ? 1.08 : 1.04, xPercent: isMobile ? -6 : -3, yPercent: 0, rotate: 0, duration: 1.0 }, 3.16)
            .to(stage, { "--scene-veil": 0.24, "--grid-opacity": 0.16, "--scene-focus-x": "48%", "--scene-focus-y": "48%", "--orbit-opacity": 0.72, duration: 1.0 }, 3.16)
            .to(motif, {
              autoAlpha: 0.5,
              scale: 0.96,
              xPercent: (0.5 - theme.motion[0]) * 8,
              yPercent: (0.5 - theme.motion[1]) * 7,
              rotate: (0.5 - theme.motion[3]) * 6,
              duration: 0.78,
            }, 3.38)
            .to(chapterElements[2], { autoAlpha: 0, scale: 1.13, filter: "blur(14px)", clipPath: "inset(50% 0 50% 0)", duration: 0.34 }, 4.12)
            .fromTo(
              chapterElements[3],
              { autoAlpha: 0, yPercent: isMobile ? 12 : 22, scale: 0.9, filter: "blur(16px)", clipPath: "inset(0 0 100% 0)" },
              { autoAlpha: 1, yPercent: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 0.5 },
              4.32,
            )
            .to(portal, { scale: isMobile ? 0.98 : 0.94, xPercent: 0, yPercent: 0, opacity: 0.72, duration: 1.05 }, 4.26)
            .to(stage, { "--scene-veil": 0.68, "--grid-opacity": 0.08, "--orbit-opacity": 1, duration: 1.05 }, 4.26)
            .to(motif, { autoAlpha: 0.28, scale: 1.18, xPercent: 0, yPercent: 0, rotate: 0, duration: 0.86 }, 4.3)
            .to(chapterElements[3], { autoAlpha: 0, yPercent: -16, scale: 1.06, filter: "blur(12px)", duration: 0.34 }, 5.12)
            .to(portal, { scale: 0.76, opacity: 0.34, filter: "blur(4px)", duration: 0.62 }, 5.14)
            .to(stage, { "--scene-veil": 0.8, "--orbit-opacity": 0.34, duration: 0.62 }, 5.16)
            .to(motif, { autoAlpha: 0.08, scale: 1.3, duration: 0.58 }, 5.14)
            .fromTo(
              "[data-landing]",
              { autoAlpha: 0, yPercent: 22, scale: 0.86, filter: "blur(16px)" },
              { autoAlpha: 1, yPercent: 0, scale: 1, filter: "blur(0px)", duration: 0.46 },
              5.22,
            )
            .to("[data-landing]", { autoAlpha: 1, duration: 1.2 }, 5.68);

          return () => releaseTrigger.kill();
        }, root);

        return () => {
          sceneProgressRef.current = 0;
          setImmersiveDocumentState(null);
          animation.revert();
        };
      },
    );

    return () => media.revert();
  }, [projeto.slug, theme.motion]);

  const skipExperience = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: sceneTop + scene.offsetHeight + 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <div
      ref={rootRef}
      className={styles.experience}
      style={themeStyle}
      data-case-category={projeto.categoria}
      data-case-slug={projeto.slug}
    >
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
              motion={theme.motion}
              progressRef={sceneProgressRef}
              className={styles.sceneCanvas}
            />
            <div className={styles.depthSlices}>
              {["top", "middle", "bottom"].map((slice) => (
                <div key={slice} data-depth-slice className={styles.depthSlice} data-slice={slice}>
                  <Image
                    src={projeto.imagemPrincipal}
                    alt=""
                    fill
                    loading="eager"
                    className={styles.depthImage}
                    sizes="100vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sceneVeil} aria-hidden="true" />
          <div className={styles.sceneGrid} aria-hidden="true" />
          <div className={styles.sceneHalo} aria-hidden="true" />
          <div className={styles.orbitRing} aria-hidden="true"><i /><i /><i /></div>
          <div ref={motifRef} className={styles.caseMotif} aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
          </div>
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

          <div className={styles.srNarrative}>
            <h2>História do projeto {projeto.nome}</h2>
            {chapters.map((chapter) => (
              <section key={"narrative-" + chapter.number}>
                <h3>{chapter.label}: {chapter.title}</h3>
                <p>{chapter.body}</p>
              </section>
            ))}
          </div>

          <div className={styles.chapters} aria-hidden="true">
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

          <div data-landing className={styles.landing} aria-hidden="true">
            <p>Do atrito ao produto</p>
            <strong>{projeto.nome}</strong>
            <span>Uma experiência Orbitamos em operação.</span>
          </div>

          <button type="button" className={styles.skipExperience} onClick={skipExperience}>
            Pular experiência
            <SkipForward size={14} aria-hidden="true" />
          </button>

          <div className={styles.sceneHud} aria-hidden="true">
            <div className={styles.sceneProgress}><span ref={progressBarRef} /></div>
            <span ref={progressNameRef}>{SCENE_NAMES[0]}</span>
            <span>{host}</span>
          </div>
        </div>
      </section>

      <section className={styles.delivery}>
        <div className={styles.deliveryAura} aria-hidden="true" />
        <div className={styles.deliveryInner}>
          <header className={styles.deliveryIntro}>
            <div>
              <p>Decisões que sustentam a experiência</p>
              <h2>O produto<br />ficou de pé.</h2>
            </div>
            <div className={styles.deliverySummary}>
              <span>{projeto.destaques.length} decisões de produto transformadas em experiência real.</span>
              <div className={styles.deliveryCounter} aria-hidden="true">
                <span>01</span>
                <i />
                <span>{String(projeto.destaques.length).padStart(2, "0")}</span>
              </div>
            </div>
          </header>

          <ol className={styles.featureList}>
            {projeto.destaques.map((item, index) => (
              <li
                key={item}
                style={{
                  top: `${6.75 + Math.min(index, 5) * 1.05}rem`,
                  zIndex: index + 1,
                }}
              >
                <div className={styles.featureMedia} aria-hidden="true">
                  <Image
                    src={projeto.imagemPrincipal}
                    alt=""
                    fill
                    className={styles.featureImage}
                    sizes="(max-width: 899px) 100vw, 86rem"
                  />
                  <div className={styles.featureMediaShade} />
                </div>
                <div className={styles.featureTopline}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>Decisão confirmada</p>
                  <Check size={18} aria-hidden="true" />
                </div>
                <div className={styles.featureCopy}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </div>
                <div className={styles.featureMeta} aria-hidden="true">
                  <span><i /> Em operação</span>
                  <span>{host}</span>
                </div>
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
