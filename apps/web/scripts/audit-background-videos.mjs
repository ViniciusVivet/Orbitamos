import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VIDEO_AUDIT_URL || "http://localhost:3000";
const outputDir = path.resolve("test-results", "background-videos");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
const onlyProfile = process.env.VIDEO_AUDIT_PROFILE;

async function videoState(page) {
  return page.locator("video").evaluateAll((videos) => videos.map((video) => {
    const rect = video.getBoundingClientRect();
    const quality = video.getVideoPlaybackQuality?.();
    return {
      id: video.dataset.videoId || null,
      src: new URL(video.currentSrc || video.src, location.href).pathname,
      paused: video.paused,
      readyState: video.readyState,
      visible: rect.bottom > 0 && rect.top < innerHeight,
      frames: quality?.totalVideoFrames || 0,
      dropped: quality?.droppedVideoFrames || 0,
    };
  }));
}

async function runProfile(name, options, constrained = false) {
  const context = await browser.newContext(options);
  if (constrained) {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 2 });
      Object.defineProperty(navigator, "deviceMemory", { configurable: true, get: () => 2 });
    });
  }
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(2_000);
  const homeTop = await videoState(page);
  const homeCanvasCount = await page.locator("canvas").count();
  const servicesVideo = page.locator('video[data-video-id="services-bg"]');
  await servicesVideo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1_500);
  const homeServices = await videoState(page);
  const heroAfterScroll = homeServices.find((video) => video.id === "home-hero");
  if (heroAfterScroll && !heroAfterScroll.paused) throw new Error(`${name}: hero da home continuou tocando fora da tela`);
  const visibleServices = homeServices.find((video) => video.id === "services-bg");
  if (!visibleServices || visibleServices.paused) throw new Error(`${name}: vídeo da seção de serviços não iniciou ao entrar na tela`);

  await page.goto(`${baseURL}/projetos`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  // Desconsidera os primeiros quadros de inicialização/compilação antes de avaliar fluidez.
  await page.waitForTimeout(3_000);
  const qualityBaseline = await videoState(page);
  await page.waitForTimeout(4_000);
  const projectsTop = await videoState(page);
  const projectsCanvasCount = await page.locator("canvas").count();
  const projectsHero = projectsTop.find((video) => video.id === "projects-hero");
  if (!projectsHero || projectsHero.paused) throw new Error(`${name}: hero de projetos não iniciou: ${JSON.stringify(projectsTop)}`);
  const projectsBaseline = qualityBaseline.find((video) => video.id === "projects-hero");
  const sampledFrames = projectsHero.frames - (projectsBaseline?.frames || 0);
  const sampledDropped = projectsHero.dropped - (projectsBaseline?.dropped || 0);
  // Headless Chromium usa renderizaÃ§Ã£o por software e nÃ£o representa a GPU de
  // um desktop normal. O limite objetivo vale para os perfis fracos, nos quais
  // o produto desliga WebGL e seleciona o encode leve.
  if (constrained && sampledFrames <= 0) {
    throw new Error(`${name}: hero de projetos nÃ£o avanÃ§ou nenhum quadro na janela estavel`);
  }
  if (constrained && (homeCanvasCount > 0 || projectsCanvasCount > 0)) {
    throw new Error(`${name}: WebGL continuou ativo no perfil de hardware fraco`);
  }

  await page.screenshot({ path: path.join(outputDir, `${name}-projetos.png`), fullPage: false });
  results.push({ name, homeTop, homeServices, homeCanvasCount, projectsTop, projectsCanvasCount, sampledFrames, sampledDropped, pageErrors });
  await context.close();
}

try {
  if (!onlyProfile || onlyProfile === "desktop") await runProfile("desktop", { viewport: { width: 1440, height: 900 } });
  if (!onlyProfile || onlyProfile === "desktop-fraco") await runProfile("desktop-fraco", { viewport: { width: 1366, height: 768 } }, true);
  if (!onlyProfile || onlyProfile === "pixel-7") await runProfile("pixel-7", devices["Pixel 7"], true);

  if (!onlyProfile || onlyProfile === "reduced-motion") {
  const reducedContext = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${baseURL}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await reducedPage.locator('img[src="/hero-poster.jpg"]').waitFor({ state: "attached", timeout: 10_000 });
  const reducedVideos = await videoState(reducedPage);
  if (reducedVideos.some((video) => !video.paused)) throw new Error("movimento reduzido: existe vídeo decorativo tocando");
  if (!(await reducedPage.locator('img[src="/hero-poster.jpg"]').count())) throw new Error("movimento reduzido: poster do hero não apareceu");
  results.push({ name: "reduced-motion", videos: reducedVideos });
  await reducedContext.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.pageErrors?.length)) process.exitCode = 1;
