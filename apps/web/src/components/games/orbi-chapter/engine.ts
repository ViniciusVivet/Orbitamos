import type PhaserTypes from "phaser";
import { CHAPTER_HEIGHT, CHAPTER_PLAYER_HEIGHT, CHAPTER_PLAYER_WIDTH, CHAPTER_WORLD_WIDTH, chapterGoal, chapterPlatforms, chapterProgramReady, chapterTerminal, initialChapterBody, stepChapterBody, type ChapterBody, type ChapterMissionId, type ChapterPlatform, type ChapterProgram } from "@/lib/orbiChapter";
import { ChapterAudio } from "./audio";
import { defaultPulseProgram, type PulseProgram } from "@/lib/orbiPulse";
import { advancePulseCombat, createPulseCombat, firePulseCombat, pulseCombatPlatforms, recoverPulseCombat, type PulseCombatState } from "./pulseCombat";
import type { ChapterRuntime, ChapterSceneOptions, PulseGuideState } from "./types";

const ART_ROOT = "/images/games/orbi-chapter";
const night = { ink: 0x0d2433, deep: 0x103345, mint: 0xb6ead2, gold: 0xf4ce86, water: 0x1b5362 };
const FIXED_STEP = 1 / 120;
const STATIC_TEXTURE = "orbi-chapter-static-geometry";
const BACKDROP_TEXTURE = "orbi-chapter-viewport-backdrop";
type EffectDot = { active: boolean; x: number; y: number; toX: number; toY: number; born: number; duration: number; tint: number; radius: number };

/** Read on the HUD cadence, not on every physics tick; combat remains authoritative. */
export function readPulseGuide(state: Readonly<PulseCombatState>, body: Readonly<ChapterBody>, programApplied: boolean, checkpoint = false): PulseGuideState {
  const playerX = body.x + CHAPTER_PLAYER_WIDTH / 2;
  let target: PulseCombatState["enemies"][number] | undefined;
  for (const enemy of state.enemies) if (enemy.active && (!target || enemy.baseX < target.baseX)) target = enemy;
  const atTerminal = Math.abs(body.x - chapterTerminal("farol").x) < 110;
  const barrier = target ? state.barriers.find(item => item.id === `pulse-barrier-${target.id}`) : undefined;
  const phase: PulseGuideState["phase"] = !target
    ? programApplied ? "workshop" : "terminal"
    : !programApplied && body.x < 600 ? "terminal"
      : (barrier?.x ?? target.baseX) - body.x > 60 ? "approach" : "repair";
  const destination = phase === "terminal" ? chapterTerminal("farol").x : target?.x ?? chapterGoal("farol").x;
  let direction: PulseGuideState["direction"] = phase === "terminal" && atTerminal ? "none" : destination > playerX ? "right" : destination < playerX ? "left" : "none";
  let threat: PulseGuideState["threat"] = "safe";
  let closest = Infinity;
  for (const shot of state.shots) {
    if (!shot.active || !shot.hostile) continue;
    const distance = shot.x - playerX;
    // A shot behind Orbi or passing below his jump is not an imminent hit.
    if (shot.direction * distance >= 0 || Math.abs(distance) > 440 || Math.abs(shot.y - (body.y + CHAPTER_PLAYER_HEIGHT / 2)) > CHAPTER_PLAYER_HEIGHT / 2 + 10) continue;
    if (Math.abs(distance) > closest || Math.abs(distance) === closest && distance < 0) continue;
    closest = Math.abs(distance); threat = "incoming"; direction = distance > 0 ? "right" : "left";
  }
  if (threat === "safe") for (const enemy of state.enemies) {
    if (!enemy.active || enemy.charge <= 0 || enemy.x <= playerX || enemy.x - playerX >= closest) continue;
    closest = enemy.x - playerX; threat = "charging"; direction = "right";
  }
  return { phase, threat, direction, target: target ? target.id + 1 : null, breach: Boolean(target && target.hp < target.maxHp), canReturn: checkpoint && !atTerminal };
}

export async function createChapterGame(parent: HTMLElement, initialOptions: ChapterSceneOptions): Promise<ChapterRuntime> {
  // Phaser is loaded only when this game is mounted in the browser.
  const Phaser = (await import("phaser")).default;
  // Local A/B switches never change the production renderer or image quality.
  const profile = process.env.NODE_ENV === "development" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const useBakedBackdrop = profile.get("orbiBackdrop") === "baked";
  const rendererRequest = profile.get("orbiRenderer");
  const allowSoftwareWebGL = rendererRequest === "webgl-force";
  let renderType = Phaser.CANVAS;
  let rendererFallback = "";
  if (rendererRequest === "auto" || allowSoftwareWebGL) {
    // Phaser.AUTO detects API availability, not a major performance caveat.
    // Probe with the same restriction first so this test can fall back safely.
    const probe = document.createElement("canvas");
    const attributes = { failIfMajorPerformanceCaveat: !allowSoftwareWebGL, antialias: true, alpha: false };
    const context = probe.getContext("webgl2", attributes) ?? probe.getContext("webgl", attributes);
    if (context && "getExtension" in context) { renderType = allowSoftwareWebGL ? Phaser.WEBGL : Phaser.AUTO; context.getExtension("WEBGL_lose_context")?.loseContext(); }
    else rendererFallback = "webgl-unavailable-or-major-performance-caveat";
  }
  let options = initialOptions, destroyed = false;
  const audio = new ChapterAudio();
  let wakeGame = () => {};
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  const motionPreference = () => { reducedMotion = motionQuery.matches; wakeGame(); };
  motionQuery.addEventListener("change", motionPreference);
  const keys = { left: false, right: false, jump: false, fire: false };
  const defaultPulse = { alcance: defaultPulseProgram("alcance"), ritmo: defaultPulseProgram("ritmo") };
  let requestInteraction = false;
  let requestFire = false;
  let visibilityPaused = document.hidden;
  const emit: ChapterSceneOptions["onEvent"] = event => { if (!destroyed) options.onEvent(event); };

  class ChapterScene extends Phaser.Scene {
    private bodyState: ChapterBody = initialChapterBody();
    private previousBody: ChapterBody = this.bodyState;
    private renderX = this.bodyState.x;
    private renderY = this.bodyState.y;
    private mission: ChapterMissionId = options.pulse ? "farol" : options.mission;
    private program: ChapterProgram | null = options.program;
    private pulse: PulseCombatState | null = options.pulse ? createPulseCombat(options.pulse.lesson) : null;
    private pulseProgram: PulseProgram = options.pulse?.program ?? defaultPulse[options.pulse?.lesson ?? "alcance"];
    private pulseHudAt = -Infinity;
    private pulseGuide: PulseGuideState | null = null;
    private pulseCleared = 0;
    private pulseHintAt = -Infinity;
    private pulseGraphics!: PhaserTypes.GameObjects.Graphics;
    private pulseSprites: PhaserTypes.GameObjects.Sprite[] = [];
    private elapsed = 0;
    private accumulator = 0;
    private checkpoint = false;
    private won = false;
    private respawning = 0;
    private previousPaused = false;
    private positionAt = 0;
    private particlesAt = 0;
    private footstepAt = 0;
    private lastBlocked = -10;
    private cameraCenter = 480;
    private visibleWidth = 960;
    private viewportWidth = 0;
    private viewportHeight = 0;
    private backdrop: PhaserTypes.GameObjects.Image | null = null;
    private backdropBakes = 0;
    private actor!: PhaserTypes.GameObjects.Sprite;
    private shadow!: PhaserTypes.GameObjects.Ellipse;
    private structures!: PhaserTypes.GameObjects.Graphics;
    private staticImage: PhaserTypes.GameObjects.Image | null = null;
    private staticCanvas: HTMLCanvasElement | null = null;
    private staticContext: CanvasRenderingContext2D | null = null;
    private movingStructures!: PhaserTypes.GameObjects.Graphics;
    private ripples!: PhaserTypes.GameObjects.Graphics;
    private gateLight!: PhaserTypes.GameObjects.Arc;
    private scenery!: PhaserTypes.GameObjects.Container;
    private terminal!: PhaserTypes.GameObjects.Container;
    private terminalLight!: PhaserTypes.GameObjects.Arc;
    private terminalHalo!: PhaserTypes.GameObjects.Arc;
    private terminalPrompt!: PhaserTypes.GameObjects.Text;
    private goal!: PhaserTypes.GameObjects.Container;
    private goalLight!: PhaserTypes.GameObjects.Arc;
    private sparkles!: PhaserTypes.GameObjects.Graphics;
    private effects!: PhaserTypes.GameObjects.Graphics;
    private effectDots: EffectDot[] = Array.from({ length: 64 }, () => ({ active: false, x: 0, y: 0, toX: 0, toY: 0, born: 0, duration: 1, tint: 0, radius: 1 }));
    private effectCursor = 0;
    private platforms: ChapterPlatform[] = [];
    private liftPlatform: ChapterPlatform | undefined;
    private appliedMotion = reducedMotion;
    private decorationAt = -Infinity;
    private diagnosticAt = 0;
    private frameDeltas = new Float32Array(120);
    private frameCount = 0;
    private frameCursor = 0;
    private metricsAt = 0;
    private longFrames = 0;
    private staticRedraws = 0;
    private ambientDots: { x: number; y: number; phase: number; radius: number }[] = [];
    private recentProgram: ChapterProgram | null = null;
    private atlasAvailable = false;
    private platformArt = new Map<string, PhaserTypes.GameObjects.Image | PhaserTypes.GameObjects.TileSprite>();

    constructor() { super({ key: "orbi-delivery-chapter" }); }
    preload() {
      this.load.image("neighborhood", `${ART_ROOT}/background-v1.webp`);
      this.load.image("orbi", `${ART_ROOT}/orbi-sheet-v1.webp`);
      this.load.image("props", `${ART_ROOT}/props-sheet-v1.webp`);
      this.load.image("orbi-backup", "/orbi-tech.png");
      this.load.image("sentinels", `${ART_ROOT}/sentinel-sheet-v1.webp`);
    }
    create() {
      this.game.canvas.setAttribute("aria-hidden", "true");
      this.game.canvas.style.touchAction = "none";
      this.game.canvas.style.display = "block";
      this.cameras.main.setBackgroundColor(night.ink);
      if (!this.textures.exists("orbi") && !this.textures.exists("orbi-backup")) {
        emit({ type: "error", message: "A imagem do Orbi não carregou. Seu código continua salvo. Atualize a página para tentar novamente." });
        return;
      }
      if (this.textures.exists("neighborhood")) this.backdrop = this.add.image(-340, -340, "neighborhood").setOrigin(0).setDisplaySize(2000, 1000).setScrollFactor(.17, 0).setDepth(-20);
      // Far-away lights, foreground embers and the physical mechanisms remain independent layers.
      this.add.rectangle(0, 0, CHAPTER_WORLD_WIDTH, 600, 0x071a2b, .1).setOrigin(0).setScrollFactor(.17, 0).setDepth(-19);
      this.add.circle(1900, 90, 35, 0xe7e7b6, .13).setScrollFactor(.3, 0).setDepth(-18);
      this.scenery = this.add.container(0, 0).setDepth(1);
      this.structures = this.add.graphics().setDepth(0).setVisible(false);
      this.movingStructures = this.add.graphics().setDepth(.2);
      this.ripples = this.add.graphics().setDepth(.1);
      this.gateLight = this.add.circle(1218, 278, 10, 0xf1c986, .25).setDepth(.3);
      this.sparkles = this.add.graphics().setDepth(8);
      this.effects = this.add.graphics().setDepth(9);
      this.pulseGraphics = this.add.graphics().setDepth(5);
      if (this.textures.exists("sentinels")) {
        this.makeFrames("sentinels", 4, 2);
        for (let index = 0; index < 3; index++) this.pulseSprites.push(this.add.sprite(0, 0, "sentinels", "0").setDisplaySize(96, 96).setDepth(5).setVisible(false));
      }
      parent.dataset.renderer = this.game.renderer.type === Phaser.WEBGL ? "webgl" : "canvas";
      parent.dataset.rendererRequested = rendererRequest === "auto" || allowSoftwareWebGL ? rendererRequest! : "canvas";
      if (rendererFallback) parent.dataset.rendererFallback = rendererFallback;
      if (process.env.NODE_ENV === "development" && this.game.renderer.type === Phaser.WEBGL) {
        const gl = (this.game.renderer as PhaserTypes.Renderer.WebGL.WebGLRenderer).gl;
        try {
          const info = gl.getExtension("WEBGL_debug_renderer_info");
          parent.dataset.rendererBackend = String(gl.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER));
          parent.dataset.rendererVendor = String(gl.getParameter(info?.UNMASKED_VENDOR_WEBGL ?? gl.VENDOR));
          parent.dataset.rendererVersion = String(gl.getParameter(gl.VERSION));
        } catch { /* Privacy-restricted browsers can omit local backend details. */ }
      }
      for (let index = 0; index < 38; index++) this.ambientDots.push({ x: (index * 149 + 43) % CHAPTER_WORLD_WIDTH, y: 160 + (index * 67) % 290, phase: index * .77, radius: index % 3 ? 1.5 : 2.2 });
      this.atlasAvailable = this.textures.exists("props");
      if (this.atlasAvailable) {
        this.makeFrames("props", 3, 2);
        // Generated sheets leave uneven transparent padding and cross cell edges.
        // These art bounds keep feet, machine decks and ground aligned to physics.
        const texture = this.textures.get("props");
        for (const [key, x, y, width, height] of [
          ["ground-art", 16, 173, 496, 230], ["bridge-art", 548, 216, 480, 106],
          ["terminal-art", 1190, 60, 225, 340], ["lift-left", 78, 435, 67, 535],
          ["lift-right", 389, 435, 68, 535], ["lift-deck", 119, 876, 307, 83],
          ["lighthouse-art", 611, 434, 321, 530], ["mailbox-art", 1086, 561, 398, 371],
        ] as const) texture.add(key, 0, x, y, width, height);
      }
      if (this.textures.exists("orbi")) {
        this.makeFrames("orbi", 4, 2);
        this.anims.create({ key: "orbi-idle", frames: [{ key: "orbi", frame: "0" }], frameRate: 3, repeat: -1 });
        this.anims.create({ key: "orbi-run", frames: ["1", "2", "3", "4"].map(frame => ({ key: "orbi", frame })), frameRate: 10, repeat: -1 });
        this.anims.create({ key: "orbi-jump", frames: [{ key: "orbi", frame: "5" }], frameRate: 1 });
        this.anims.create({ key: "orbi-fall", frames: [{ key: "orbi", frame: "6" }], frameRate: 1 });
        this.anims.create({ key: "orbi-win", frames: [{ key: "orbi", frame: "7" }], frameRate: 1 });
      }
      this.shadow = this.add.ellipse(100, 500, 48, 9, 0x05161c, .36).setDepth(2);
      this.actor = this.add.sprite(115, 500, this.textures.exists("orbi") ? "orbi" : "orbi-backup", this.textures.exists("orbi") ? "0" : undefined).setOrigin(.5, 1).setDisplaySize(100, 100).setDepth(6);
      this.terminal = this.buildTerminal();
      this.goal = this.buildGoal();
      this.scale.on("resize", this.resize, this);
      this.resize();
      this.input.on("pointerdown", () => { parent.focus({ preventScroll: true }); audio.unlock(); });
      this.resetWorld(false);
      audio.set(options.muted, options.paused || visibilityPaused);
      parent.focus({ preventScroll: true });
      emit({ type: "ready" });
    }
    private makeFrames(key: string, columns: number, rows: number) {
      const texture = this.textures.get(key);
      const image = texture.getSourceImage() as HTMLImageElement;
      const width = Math.floor(image.width / columns), height = Math.floor(image.height / rows);
      for (let index = 0; index < columns * rows; index++) texture.add(String(index), 0, (index % columns) * width, Math.floor(index / columns) * height, width, height);
    }
    private resize() {
      const width = this.scale.width, height = this.scale.height;
      if (width === this.viewportWidth && height === this.viewportHeight) return;
      this.viewportWidth = width; this.viewportHeight = height;
      const zoom = Math.max(.33, height / CHAPTER_HEIGHT * (width < 650 ? 1.18 : 1));
      this.cameras.main.setZoom(zoom).setBounds(0, 0, CHAPTER_WORLD_WIDTH, CHAPTER_HEIGHT);
      this.visibleWidth = width / zoom;
      this.cameraCenter = Math.max(this.visibleWidth / 2, this.bodyState.x + this.visibleWidth * .18);
      this.terminalPrompt?.setFontSize(Math.max(13, 11 / zoom));
      this.bakeBackdrop(zoom, height);
      this.moveCamera(true);
    }
    private bakeBackdrop(zoom: number, height: number) {
      if (!this.backdrop || !useBakedBackdrop) { parent.dataset.backdropMode = "original"; return; }
      const source = this.textures.get("neighborhood").getSourceImage() as HTMLImageElement;
      // With scrollFactorY=0 and a fixed camera rotation, this vertical window
      // is invariant throughout the level. Keep a two-pixel antialias margin.
      const visibleTop = height * .5 * (1 - 1 / zoom);
      const top = Math.max(-340, visibleTop - 2 / zoom);
      const bottom = Math.min(660, visibleTop + height / zoom + 2 / zoom);
      const worldHeight = bottom - top;
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(2000 * zoom); canvas.height = Math.ceil(worldHeight * zoom);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(source, 0, (top + 340) * source.height / 1000, source.width, worldHeight * source.height / 1000, 0, 0, 2000 * zoom, worldHeight * zoom);
      // A plain, read-only Texture avoids CanvasTexture's getImageData buffer
      // and willReadFrequently CPU backing. No pixel reads are needed here.
      this.backdrop.setTexture("neighborhood");
      if (this.textures.exists(BACKDROP_TEXTURE)) this.textures.remove(BACKDROP_TEXTURE);
      const texture = this.textures.create(BACKDROP_TEXTURE, canvas);
      if (!texture) { this.backdrop.setPosition(-340, -340).setDisplaySize(2000, 1000); return; }
      texture.add("__BASE", 0, 0, 0, canvas.width, canvas.height);
      // Camera zoom × sprite scale = 1: each render copies display pixels
      // instead of resampling the full 1774×887 image, especially on phones.
      this.backdrop.setTexture(BACKDROP_TEXTURE).setPosition(-340, top).setScale(1 / zoom);
      parent.dataset.backdropMode = "viewport-baked";
      parent.dataset.backdropBakes = String(++this.backdropBakes);
      parent.dataset.backdropPixels = `${canvas.width}x${canvas.height}`;
    }
    private title(text: string, x: number, y: number, size = 15, color = "#d6ecdb") {
      return this.add.text(x, y, text, { fontFamily: "system-ui, sans-serif", fontSize: `${Math.max(size, 11 / this.cameras.main.zoom)}px`, color, fontStyle: "600", padding: { x: 9, y: 6 }, backgroundColor: "#102936d9" }).setOrigin(.5).setDepth(5);
    }
    private atlasSprite(frame: number | string, x: number, y: number, width: number, height: number) {
      return this.add.image(x, y, "props", String(frame)).setDisplaySize(width, height).setOrigin(.5, 1);
    }
    private buildTerminal() {
      const at = chapterTerminal(this.mission), container = this.add.container(at.x, at.y).setDepth(3);
      const halo = this.add.circle(0, -57, 50, 0x7ecbbd, .1);
      this.terminalHalo = halo;
      this.terminalLight = this.add.circle(0, -75, 7, night.mint, .95);
      if (this.atlasAvailable) container.add(this.atlasSprite("terminal-art", 0, 2, 76, 115));
      else {
        container.add(this.add.rectangle(0, -42, 60, 82, 0x27515c).setStrokeStyle(3, 0x9cc3b2));
        container.add(this.add.rectangle(0, -52, 42, 32, 0x0c2834).setStrokeStyle(2, night.mint));
        container.add(this.add.text(-15, -62, ">_", { fontSize: "21px", color: "#b6ead2", fontFamily: "monospace" }));
      }
      container.addAt(halo, 0); container.add(this.terminalLight);
      this.terminalPrompt = this.title("Terminal · E / botão", at.x, at.y - 135, 13);
      if (!reducedMotion) this.tweens.add({ targets: halo, alpha: .4, scale: 1.12, yoyo: true, repeat: -1, duration: 1300 });
      return container;
    }
    private buildGoal() {
      const at = chapterGoal(this.mission), container = this.add.container(at.x, at.y).setDepth(3);
      const lighthouse = this.mission === "farol" && !this.pulse;
      if (this.atlasAvailable) container.add(this.atlasSprite(lighthouse ? "lighthouse-art" : "mailbox-art", 0, 3, lighthouse ? 143 : 120, lighthouse ? 236 : 112));
      else {
        container.add(this.add.rectangle(0, -53, 62, 100, 0x315b60).setStrokeStyle(3, night.gold));
        container.add(this.add.circle(0, -109, 15, night.gold, .8));
      }
      this.goalLight = this.add.circle(0, -103, 40, night.gold, .1);
      container.addAt(this.goalLight, 0);
      container.add(this.add.text(0, -160, this.pulse ? "OFICINA RESTAURADA" : this.mission === "farol" ? "FAROL" : this.mission === "elevador" ? "BIBLIOTECA" : "PONTO DE ENTREGA", { fontFamily: "system-ui, sans-serif", fontSize: `${Math.max(12, 11 / this.cameras.main.zoom)}px`, fontStyle: "700", color: "#f4dca9", backgroundColor: "#183541", padding: { x: 9, y: 6 } }).setOrigin(.5));
      return container;
    }
    private resetWorld(checkpoint: boolean) {
      this.positionAt = -Infinity; this.particlesAt = 0; this.footstepAt = 0; this.lastBlocked = -10;
      this.bodyState = initialChapterBody(checkpoint); this.previousBody = this.bodyState; this.renderX = this.bodyState.x; this.renderY = this.bodyState.y; this.elapsed = 0; this.accumulator = 0; this.won = false; this.respawning = 0;
      keys.left = keys.right = keys.jump = keys.fire = false; requestInteraction = requestFire = false;
      if (this.pulse) { recoverPulseCombat(this.pulse); this.pulse.events.length = 0; this.pulse.cooldownTotal = this.pulseProgram.cooldown; }
      else {
        for (const key of ["pulseLesson", "pulseShield", "pulseCleared", "pulseRange", "pulseCooldown", "pulseCooldownRemaining", "pulseShots", "pulsePlayerShots", "pulseHostileShots", "pulseGuidePhase", "pulseThreat", "pulseGuideDirection", "pulseTarget", "pulseBreach", "pulseCanReturn"]) delete parent.dataset[key];
      }
      this.pulseGuide = null;
      this.pulseCleared = this.pulse?.cleared ?? 0; this.pulseHudAt = this.pulseHintAt = -Infinity;
      this.actor.setAlpha(1).clearTint(); this.actor.setFlipX(false);
      this.scenery.removeAll(true);
      this.platformArt.clear();
      const label = this.pulse ? this.pulse.lesson === "alcance" ? "Oficina do Pulso · Alcance" : "Oficina do Pulso · Ritmo" : this.mission === "ponte" ? "Canal das Lanternas" : this.mission === "elevador" ? "Biblioteca nas Nuvens" : "O último brilho do bairro";
      this.scenery.add(this.title(label, 270, 300, 14, "#e4e5c1"));
      const direction = this.add.text(130, 367, this.pulse ? "→  Programe, teste e repare" : "→  Sua entrega", { color: "#c6e8d9", fontSize: "14px", fontFamily: "system-ui, sans-serif" }).setAlpha(.9);
      this.scenery.add(direction);
      if (this.mission === "elevador") {
        this.scenery.add(this.title("Embarque quando descer", 785, 160, 14));
        const mast = this.add.rectangle(690, 385, 8, 230, 0x3f6667).setStrokeStyle(1, 0x85b9b0, .7);
        this.scenery.add(mast);
      }
      if (this.mission === "ponte") this.scenery.add(this.title("Uma ponte nasce de um valor", 820, 345, 14));
      if (this.mission === "farol" && !this.pulse) this.scenery.add(this.title("Consumo: 4  ·  Reserva: 2", 1218, 225, 14, "#f2dba2"));
      if (this.pulse) this.scenery.add(this.title("O pulso atravessa a barreira", 960, 320, 14, "#d5bbea"));
      if (this.atlasAvailable) {
        for (const platform of this.pulse ? pulseCombatPlatforms(this.pulse) : chapterPlatforms(this.mission, this.program, 0)) {
          if (platform.id === "gate" || platform.id.includes("crate") || platform.id.startsWith("pulse-barrier")) continue;
          if (platform.id === "bridge" || platform.id === "lift") {
            const image = this.add.image(platform.x, platform.y, "props", platform.id === "bridge" ? "bridge-art" : "lift-deck").setOrigin(0).setDepth(1);
            this.scenery.add(image); this.platformArt.set(platform.id, image);
          } else {
            const tile = this.add.tileSprite(platform.x, platform.y - 25, platform.width, 115, "props", "ground-art").setOrigin(0).setTileScale(.5).setDepth(1);
            this.scenery.addAt(tile, 0); this.platformArt.set(platform.id, tile);
          }
        }
        if (this.mission === "elevador") {
          this.scenery.add(this.atlasSprite("lift-left", 710, 514, 30, 267).setDepth(1));
          this.scenery.add(this.atlasSprite("lift-right", 869, 514, 30, 267).setDepth(1));
        }
      }
      this.goal.destroy(true); this.goal = this.buildGoal();
      this.terminal.setPosition(chapterTerminal(this.mission).x, 500);
      this.terminalPrompt.setPosition(chapterTerminal(this.mission).x, 365);
      this.recentProgram = this.program;
      this.effectDots.forEach(dot => { dot.active = false; }); this.effects.clear();
      this.refreshPlatforms(); this.moveCamera(true); this.renderWorld();
      this.emitPulseState(true);
    }
    private moveCamera(immediate = false, deltaSeconds = 1 / 60) {
      const desired = Math.max(this.visibleWidth / 2, Math.min(CHAPTER_WORLD_WIDTH - this.visibleWidth / 2, this.renderX + this.visibleWidth * .2));
      // The same camera response at 30, 60 and 120Hz. A fixed .085 lerp made
      // low-frame-rate devices lag behind while high-refresh devices snapped.
      const blend = 1 - Math.exp(-5.33 * Math.max(0, deltaSeconds));
      this.cameraCenter = immediate || reducedMotion ? desired : this.cameraCenter + (desired - this.cameraCenter) * blend;
      this.cameras.main.centerOn(this.cameraCenter, 300);
    }
    private refreshPlatforms() {
      this.platforms = this.pulse ? pulseCombatPlatforms(this.pulse) : chapterPlatforms(this.mission, this.program, this.elapsed);
      this.liftPlatform = this.platforms.find(platform => platform.id === "lift");
      this.rebuildStaticGeometry();
    }
    private moveLift(time: number) {
      if (this.liftPlatform) this.liftPlatform.y = 500 - (this.program?.lift ?? 50) * (1 - Math.cos(time * .92)) / 2;
    }
    private drawPlatform(graphics: PhaserTypes.GameObjects.Graphics, platform: ChapterPlatform, displayY = platform.y) {
      const x = platform.x, y = displayY;
      const art = this.platformArt.get(platform.id);
      if (platform.id.startsWith("pulse-barrier")) {
        graphics.fillStyle(0x6e4e8b, .2); graphics.fillRoundedRect(x - 9, y, platform.width + 18, platform.height, 9);
        graphics.fillStyle(0xb8a3d5, .65); graphics.fillRect(x + 8, y, 6, platform.height);
        graphics.lineStyle(2, 0xd6b3e8, .6); graphics.strokeRoundedRect(x, y, platform.width, platform.height, 8);
        graphics.fillStyle(0x203743, 1); graphics.fillRoundedRect(x - 13, 487, platform.width + 26, 16, 5);
        return;
      }
      if (platform.id === "gate") {
        graphics.fillStyle(0x1d4656, .85); graphics.fillRoundedRect(x - 8, y, platform.width + 16, platform.height, 9);
        graphics.lineStyle(3, 0xe5ac77, .85);
        for (let lineY = y + 13; lineY < 500; lineY += 19) graphics.lineBetween(x + 4, lineY, x + platform.width - 4, lineY);
        return;
      }
      if (platform.id.includes("crate")) {
        graphics.fillStyle(0x9c724d, 1); graphics.fillRoundedRect(x, y, platform.width, platform.height, 6);
        graphics.lineStyle(3, 0xcfa578, .9); graphics.strokeRoundedRect(x + 4, y + 4, platform.width - 8, platform.height - 8, 4);
        graphics.lineBetween(x + 5, y + 5, x + platform.width - 5, y + platform.height - 5);
        graphics.lineBetween(x + platform.width - 5, y + 5, x + 5, y + platform.height - 5);
        return;
      }
      const mechanism = platform.id === "bridge" || platform.id === "lift";
      graphics.fillStyle(mechanism ? 0x4d776d : 0x254d48, 1);
      graphics.fillRoundedRect(x, y, platform.width, platform.height, mechanism ? 7 : 12);
      if (!art) { graphics.fillStyle(mechanism ? 0xc2cf99 : 0x95b88d, 1); graphics.fillRoundedRect(x, y, platform.width, 9, 4); }
      graphics.lineStyle(1, 0xc2d4ad, .35); graphics.lineBetween(x + 7, y + 14, x + platform.width - 7, y + 14);
      if (mechanism) {
        graphics.lineStyle(2, 0x1d4853, .65);
        for (let lineX = x + 14; lineX < x + platform.width; lineX += 24) graphics.lineBetween(lineX, y + 9, lineX, y + platform.height - 3);
        if (platform.id === "lift") { graphics.lineStyle(2, 0x8ba99b, .75); graphics.lineBetween(x + 18, 255, x + 18, y); graphics.lineBetween(x + platform.width - 18, 255, x + platform.width - 18, y); }
      } else if (!art) {
        graphics.lineStyle(1.4, 0x9dbf8d, .6);
        for (let lineX = x + 20; lineX < x + platform.width - 10; lineX += 34) { graphics.lineBetween(lineX, y + 3, lineX - 3, y - 5); graphics.lineBetween(lineX, y + 4, lineX + 4, y - 3); }
      }
    }
    private rebuildStaticGeometry() {
      const graphics = this.structures; graphics.clear();
      if (this.mission !== "farol") { graphics.fillStyle(night.water, .8); graphics.fillRect(550, 527, 650, 90); }
      for (const platform of this.platforms) {
        if (platform.id !== "lift") this.drawPlatform(graphics, platform);
        const art = this.platformArt.get(platform.id);
        if (art && (platform.id === "bridge" || platform.id === "lift")) art.setPosition(platform.x, platform.y - (platform.id === "bridge" ? 2 : 13)).setDisplaySize(platform.width, platform.id === "bridge" ? 48 : 49);
      }
      // A CanvasTexture allocates getImageData and asks for CPU readback backing.
      // This layer is write-on-change/read-only during play, so keep an ordinary
      // canvas and Texture instead. Create its context before generateTexture
      // requests one; subsequent getContext settings cannot change this backing.
      if (!this.staticCanvas) {
        this.staticCanvas = document.createElement("canvas");
        this.staticCanvas.width = CHAPTER_WORLD_WIDTH; this.staticCanvas.height = CHAPTER_HEIGHT;
        this.staticContext = this.staticCanvas.getContext("2d", { willReadFrequently: false });
      }
      if (this.staticContext) {
        this.staticContext.clearRect(0, 0, CHAPTER_WORLD_WIDTH, CHAPTER_HEIGHT);
        graphics.generateTexture(this.staticCanvas!, CHAPTER_WORLD_WIDTH, CHAPTER_HEIGHT);
        if (!this.textures.exists(STATIC_TEXTURE)) {
          const texture = this.textures.create(STATIC_TEXTURE, this.staticCanvas!);
          texture?.add("__BASE", 0, 0, 0, CHAPTER_WORLD_WIDTH, CHAPTER_HEIGHT);
        } else this.textures.get(STATIC_TEXTURE).source[0].update();
        if (!this.staticImage && this.textures.exists(STATIC_TEXTURE)) this.staticImage = this.add.image(0, 0, STATIC_TEXTURE).setOrigin(0).setDepth(0);
        graphics.setVisible(false);
        parent.dataset.staticBacking = "canvas-no-readback";
      } else {
        // Retain the original vectors if allocating a cache surface fails.
        graphics.setVisible(true); this.staticImage?.setVisible(false);
        parent.dataset.staticBacking = "vector-fallback";
      }
      this.gateLight.setVisible(this.platforms.some(platform => platform.id === "gate"));
      parent.dataset.staticRedraws = String(++this.staticRedraws);
      this.decorationAt = -Infinity;
    }
    private renderWorld() {
      const body = this.bodyState;
      const renderTime = Math.max(0, this.elapsed - FIXED_STEP + this.accumulator);
      const graphics = this.movingStructures; graphics.clear();
      if (this.liftPlatform) {
        const y = 500 - (this.program?.lift ?? 50) * (1 - Math.cos(renderTime * .92)) / 2;
        this.drawPlatform(graphics, this.liftPlatform, y);
        this.platformArt.get("lift")?.setY(y - 13);
      }
      this.actor.setPosition(this.renderX + CHAPTER_PLAYER_WIDTH / 2, this.renderY + CHAPTER_PLAYER_HEIGHT + 7).setFlipX(body.facing === -1);
      const animation = this.won ? "orbi-win" : !body.grounded ? body.vy < 0 ? "orbi-jump" : "orbi-fall" : Math.abs(body.vx) > 25 ? "orbi-run" : "orbi-idle";
      if (this.textures.exists("orbi") && this.actor.anims.currentAnim?.key !== animation) this.actor.play(animation);
      if (!reducedMotion && body.grounded && !this.won && Math.abs(body.vx) < 25) this.actor.y += Math.sin(this.elapsed * 3) * 1.7;
      let floor: ChapterPlatform | undefined;
      for (const platform of this.platforms) {
        if (this.renderX + 28 > platform.x && this.renderX + 2 < platform.x + platform.width && platform.y >= this.renderY + CHAPTER_PLAYER_HEIGHT - 3 && (!floor || platform.y < floor.y)) floor = platform;
      }
      const shadowGap = Math.max(0, (floor?.y ?? 570) - (this.renderY + CHAPTER_PLAYER_HEIGHT));
      this.shadow.setPosition(this.renderX + 15, floor?.y ?? 570).setAlpha(floor ? Math.max(.08, .36 - shadowGap / 650) : 0).setScale(Math.max(.45, 1 - shadowGap / 400));
      const near = Math.abs(body.x - chapterTerminal(this.mission).x) < 100;
      this.terminalPrompt.setAlpha(near ? 1 : .62); this.terminalLight.setAlpha(reducedMotion ? .9 : .65 + Math.sin(this.elapsed * 3) * .25);
      this.gateLight.setAlpha(reducedMotion ? .25 : .25 + Math.sin(this.elapsed * 2) * .08);
      const ready = this.pulse ? this.pulse.cleared === this.pulse.total && Boolean(options.pulse?.program) : chapterProgramReady(this.mission, this.program);
      this.goalLight.setAlpha(this.won ? .45 : ready ? reducedMotion ? .26 : .22 + Math.sin(this.elapsed * 2) * .08 : .08);
      if (this.appliedMotion !== reducedMotion) {
        this.appliedMotion = reducedMotion;
        this.tweens.killTweensOf(this.terminalHalo); this.terminalHalo.setAlpha(.1).setScale(1);
        if (!reducedMotion) this.tweens.add({ targets: this.terminalHalo, alpha: .4, scale: 1.12, yoyo: true, repeat: -1, duration: 1300 });
        this.decorationAt = -Infinity;
      }
      // Decorative paths are updated at 30Hz and only near the camera. Physics
      // and the character remain independent at the display's render cadence.
      if (reducedMotion || this.elapsed - this.decorationAt >= 1 / 30) {
        this.decorationAt = this.elapsed;
        this.sparkles.clear(); this.ripples.clear();
        if (!reducedMotion) {
          if (this.mission !== "farol") for (let index = 0; index < 14; index++) {
            const x = 568 + index * 43, width = 15 + (index % 3) * 9;
            this.ripples.lineStyle(1.2, 0x91d3c1, .15 + Math.sin(this.elapsed + index) * .06); this.ripples.lineBetween(x, 541 + (index % 4) * 11, x + width, 541 + (index % 4) * 11);
          }
          const left = this.cameraCenter - this.visibleWidth / 2 - 80, right = this.cameraCenter + this.visibleWidth / 2 + 80;
          for (const dot of this.ambientDots) if (dot.x >= left && dot.x <= right) {
            this.sparkles.fillStyle(dot.phase % 2 > 1 ? night.gold : night.mint, .2 + Math.sin(this.elapsed * .8 + dot.phase) * .14); this.sparkles.fillCircle(dot.x + Math.sin(this.elapsed * .4 + dot.phase) * 9, dot.y + Math.sin(this.elapsed * .7 + dot.phase) * 7, dot.radius);
          }
        }
      }
      this.effects.clear();
      if (!reducedMotion) for (const dot of this.effectDots) {
        if (!dot.active) continue;
        const progress = (this.elapsed - dot.born) / dot.duration;
        if (progress >= 1) { dot.active = false; continue; }
        this.effects.fillStyle(dot.tint, .8 * (1 - progress));
        this.effects.fillCircle(dot.x + (dot.toX - dot.x) * progress, dot.y + (dot.toY - dot.y) * progress, dot.radius);
      }
      this.renderPulse();
    }
    private renderPulse() {
      const graphics = this.pulseGraphics, state = this.pulse; graphics.clear();
      if (!state) { for (const sprite of this.pulseSprites) sprite.setVisible(false); return; }
      const left = this.cameraCenter - this.visibleWidth / 2 - 120, right = this.cameraCenter + this.visibleWidth / 2 + 120;
      if (!this.won) {
        const originX = this.renderX + 15 + this.bodyState.facing * 25, originY = this.renderY + 27;
        const endX = originX + this.bodyState.facing * this.pulseProgram.range;
        // The faint measuring line makes a variable's effect visible before firing.
        graphics.lineStyle(1.5, night.mint, .22); graphics.lineBetween(originX, originY, endX, originY);
        graphics.lineBetween(endX, originY - 7, endX, originY + 7);
        if (state.invulnerable > 0) {
          graphics.lineStyle(2, night.mint, .55); graphics.strokeEllipse(this.renderX + 15, this.renderY + 27, 55, 74);
        }
        this.actor.setAlpha(state.invulnerable > 0 ? .8 : 1);
      }
      for (let index = 0; index < state.enemies.length; index++) {
        const enemy = state.enemies[index], sprite = this.pulseSprites[index];
        const visible = enemy.x >= left && enemy.x <= right;
        sprite?.setVisible(visible);
        if (!visible) continue;
        if (sprite) {
          const frame = !enemy.active ? "7" : enemy.hitFlash > 0 ? "5" : enemy.charge > 0 ? "3" : reducedMotion ? "0" : Math.sin(state.time * 4 + index) > 0 ? "1" : "2";
          if (sprite.frame.name !== frame) sprite.setFrame(frame);
          sprite.setPosition(enemy.x, enemy.y - 8).setAlpha(1);
        } else {
          // A network/image failure must leave the workshop fully playable.
          const tint = enemy.active ? 0xbc8c6b : night.mint;
          graphics.fillStyle(0x122e42, 1); graphics.fillRoundedRect(enemy.x - 25, enemy.y - 28, 50, 50, 13);
          graphics.lineStyle(3, tint, .95); graphics.strokeRoundedRect(enemy.x - 25, enemy.y - 28, 50, 50, 13);
          graphics.fillStyle(enemy.active ? 0xd5a4e3 : night.gold, .95); graphics.fillRoundedRect(enemy.x - 17, enemy.y - 15, 34, 13, 6);
          graphics.lineStyle(2, tint, .7); graphics.lineBetween(enemy.x, enemy.y - 29, enemy.x, enemy.y - 38);
          graphics.fillStyle(tint, .8); graphics.fillCircle(enemy.x, enemy.y - 40, 3);
          graphics.lineStyle(2, tint, .4); graphics.strokeEllipse(enemy.x, enemy.y + 31, 42, 8);
        }
        if (enemy.active) {
          const barX = enemy.x - 24, barY = enemy.y - 55;
          graphics.fillStyle(0x0b1f2d, .9); graphics.fillRoundedRect(barX - 3, barY - 3, 54, 12, 5);
          for (let hp = 0; hp < enemy.maxHp; hp++) {
            graphics.fillStyle(hp < enemy.hp ? 0xd6a7df : 0x405765, .95);
            graphics.fillRoundedRect(barX + hp * 50 / enemy.maxHp, barY, 48 / enemy.maxHp - 2, 6, 2);
          }
          if (enemy.charge > 0) {
            // A warning shape and left-pointing arrow remain readable without
            // distinguishing magenta from cyan or enabling decorative motion.
            const warningX = enemy.x - 43, warningY = enemy.y - 59;
            graphics.fillStyle(night.gold, .98);
            graphics.fillTriangle(warningX, warningY - 12, warningX + 12, warningY + 9, warningX - 12, warningY + 9);
            graphics.lineStyle(2.5, night.ink, 1); graphics.lineBetween(warningX, warningY - 5, warningX, warningY + 1);
            graphics.fillStyle(night.ink, 1); graphics.fillCircle(warningX, warningY + 5, 1.5);
            graphics.lineStyle(3, night.gold, .95);
            graphics.lineBetween(enemy.x - 33, enemy.y, enemy.x - 64, enemy.y);
            graphics.lineBetween(enemy.x - 64, enemy.y, enemy.x - 55, enemy.y - 7);
            graphics.lineBetween(enemy.x - 64, enemy.y, enemy.x - 55, enemy.y + 7);
            graphics.lineStyle(reducedMotion ? 3 : 2 + enemy.charge * 2, 0xefa5d5, .65);
            graphics.strokeCircle(enemy.x - 15, enemy.y - 4, reducedMotion ? 22 : 13 + enemy.charge * 10);
          }
        } else {
          graphics.fillStyle(night.ink, .95); graphics.fillCircle(enemy.x, enemy.y - 51, 15);
          graphics.lineStyle(1.5, night.mint, .7); graphics.strokeCircle(enemy.x, enemy.y - 51, 15);
          graphics.lineStyle(3, night.mint, 1); graphics.lineBetween(enemy.x - 8, enemy.y - 51, enemy.x - 2, enemy.y - 45); graphics.lineBetween(enemy.x - 2, enemy.y - 45, enemy.x + 9, enemy.y - 57);
        }
      }
      for (const shot of state.shots) {
        if (!shot.active || shot.x < left || shot.x > right) continue;
        const tint = shot.hostile ? 0xe8a4d6 : night.mint;
        graphics.lineStyle(shot.hostile ? 4 : 5, tint, .28); graphics.lineBetween(shot.x - shot.direction * 20, shot.y, shot.x, shot.y);
        graphics.fillStyle(tint, .95);
        if (shot.hostile) {
          graphics.fillTriangle(shot.x - 8, shot.y, shot.x, shot.y - 6, shot.x + 8, shot.y);
          graphics.fillTriangle(shot.x - 8, shot.y, shot.x, shot.y + 6, shot.x + 8, shot.y);
        } else graphics.fillCircle(shot.x, shot.y, 4);
        graphics.fillStyle(0xf4f1d5, .95); graphics.fillCircle(shot.x, shot.y, 2);
      }
    }
    private emitPulseState(force = false) {
      const state = this.pulse;
      if (!state || (!force && this.elapsed - this.pulseHudAt < .1)) return;
      this.pulseHudAt = this.elapsed;
      emit({ type: "pulse-state", shield: state.shield, cleared: state.cleared, total: state.total, cooldownRemaining: state.cooldown, cooldownTotal: state.cooldownTotal });
      this.emitPulseGuide();
      parent.dataset.pulseLesson = state.lesson; parent.dataset.pulseShield = String(state.shield); parent.dataset.pulseCleared = String(state.cleared);
      parent.dataset.pulseRange = String(this.pulseProgram.range); parent.dataset.pulseCooldown = String(this.pulseProgram.cooldown);
      parent.dataset.pulseCooldownRemaining = state.cooldown.toFixed(2);
      let playerShots = 0, hostileShots = 0;
      for (const shot of state.shots) if (shot.active) { if (shot.hostile) hostileShots++; else playerShots++; }
      parent.dataset.pulseShots = String(playerShots + hostileShots); parent.dataset.pulsePlayerShots = String(playerShots); parent.dataset.pulseHostileShots = String(hostileShots);
    }
    private emitPulseGuide() {
      if (!this.pulse) return;
      const next = readPulseGuide(this.pulse, this.bodyState, Boolean(options.pulse?.program), this.checkpoint);
      const previous = this.pulseGuide;
      if (previous && previous.phase === next.phase && previous.threat === next.threat && previous.direction === next.direction && previous.target === next.target && previous.breach === next.breach && previous.canReturn === next.canReturn) return;
      if (next.threat === "charging" && previous && (previous.threat !== "charging" || previous.target !== next.target)) audio.play("sentinel-warning");
      this.pulseGuide = next;
      parent.dataset.pulseGuidePhase = next.phase; parent.dataset.pulseThreat = next.threat;
      parent.dataset.pulseGuideDirection = next.direction; parent.dataset.pulseTarget = next.target === null ? "" : String(next.target); parent.dataset.pulseBreach = String(next.breach);
      parent.dataset.pulseCanReturn = String(next.canReturn);
      emit({ type: "pulse-guide", ...next });
    }
    private consumePulseEvents() {
      const state = this.pulse; if (!state || !state.events.length) return;
      let changed = false;
      for (const event of state.events) {
        if (event.type === "fired" && event.enemyId === undefined) {
          audio.play("pulse"); this.burst(event.x, event.y, night.mint, 2); changed = true;
          if (this.pulseProgram.range < 200 && this.bodyState.x > 650 && this.elapsed - this.pulseHintAt > 5) {
            this.pulseHintAt = this.elapsed;
            emit({ type: "pulse-feedback", message: "O pulso termina antes da sentinela. Volte ao terminal e aumente o alcance: a linha clara mostra até onde ele chega." });
          }
        } else if (event.type === "hit") { audio.play("pulse-hit"); this.burst(event.x, event.y, night.mint, 5); changed = true; }
        else if (event.type === "cleared") {
          audio.play("bug-cleared"); this.burst(event.x, event.y, night.gold, 14); changed = true;
          emit({ type: "pulse-feedback", message: state.cleared === state.total ? "As três sentinelas estão reparadas. Caminhe até a oficina iluminada!" : `Sentinela reparada! Passagem livre. ${state.cleared} de ${state.total} prontas.` });
        } else if (event.type === "repaired" && this.elapsed - this.pulseHintAt > 3) {
          this.pulseHintAt = this.elapsed;
          emit({ type: "pulse-feedback", message: "A proteção voltou antes do segundo pulso. Diminua o tempo de recarga no terminal para disparar mais rápido." });
        } else if (event.type === "damaged") {
          audio.play("shield-hit"); this.burst(event.x, event.y, 0xe8a4d6, 8); changed = true;
          emit({ type: "pulse-feedback", message: "O escudo segurou o ruído. O triângulo avisa antes do disparo; pule sobre a próxima onda." });
          if (!reducedMotion) this.cameras.main.flash(100, 119, 74, 115, false);
        } else if (event.type === "respawn") {
          recoverPulseCombat(state); audio.play("shield-ready"); changed = true;
          this.bodyState = initialChapterBody(true); this.previousBody = this.bodyState; this.renderX = this.bodyState.x; this.renderY = this.bodyState.y;
          keys.left = keys.right = keys.jump = keys.fire = false; requestFire = false;
          this.moveCamera(true);
          emit({ type: "pulse-feedback", message: "Escudo recarregado no terminal. Seu código e as sentinelas já reparadas continuam aqui." });
        }
      }
      state.events.length = 0;
      if (this.pulseCleared !== state.cleared) { this.pulseCleared = state.cleared; this.refreshPlatforms(); }
      if (changed) this.emitPulseState(true);
    }
    private diagnostics(now: number, delta: number, paused: boolean) {
      if (!paused && delta > 0 && delta < 1000) {
        this.frameDeltas[this.frameCursor++ % this.frameDeltas.length] = delta;
        this.frameCount = Math.min(this.frameDeltas.length, this.frameCount + 1);
        if (delta > 50) this.longFrames++;
      }
      if (now - this.diagnosticAt >= 100) {
        this.diagnosticAt = now;
        const values = { playerX: String(Math.round(this.bodyState.x)), playerY: String(Math.round(this.bodyState.y)), playerGrounded: String(this.bodyState.grounded), playerSupport: this.bodyState.support ?? "air" };
        for (const [key, value] of Object.entries(values)) if (parent.dataset[key] !== value) parent.dataset[key] = value;
      }
      if (now - this.metricsAt < 1000 || !this.frameCount) return;
      this.metricsAt = now;
      const samples = Array.from(this.frameDeltas.subarray(0, this.frameCount)).sort((a, b) => a - b);
      parent.dataset.frameMeanMs = (samples.reduce((sum, value) => sum + value, 0) / samples.length).toFixed(1);
      parent.dataset.frameP95Ms = samples[Math.floor((samples.length - 1) * .95)].toFixed(1);
      parent.dataset.longFrames = String(this.longFrames);
      parent.dataset.activeEffects = String(this.effectDots.reduce((sum, dot) => sum + Number(dot.active), 0));
    }
    update(_now: number, delta: number) {
      if (!this.actor) return;
      const paused = options.paused || visibilityPaused;
      this.diagnostics(_now, delta, paused || this.previousPaused);
      const desiredMission = options.pulse ? "farol" : options.mission;
      const desiredLesson = options.pulse?.lesson ?? null;
      if (this.mission !== desiredMission || (this.pulse?.lesson ?? null) !== desiredLesson) {
        this.mission = desiredMission; this.program = options.program;
        this.pulse = desiredLesson ? createPulseCombat(desiredLesson) : null;
        this.pulseProgram = options.pulse?.program ?? defaultPulse[desiredLesson ?? "alcance"];
        this.checkpoint = false; this.resetWorld(false);
      }
      if (options.restartToken !== initialOptions.restartToken) {
        initialOptions = { ...initialOptions, restartToken: options.restartToken };
        this.resetWorld(this.checkpoint);
      }
      this.program = options.program;
      const changedProgram = !this.pulse && this.program !== this.recentProgram;
      const nextPulseProgram = options.pulse?.program ?? defaultPulse[desiredLesson ?? "alcance"];
      const changedPulseProgram = Boolean(this.pulse && (this.pulseProgram.range !== nextPulseProgram.range || this.pulseProgram.cooldown !== nextPulseProgram.cooldown));
      this.recentProgram = this.program;
      if (changedProgram) this.refreshPlatforms();
      if (changedPulseProgram) {
        this.pulseProgram = nextPulseProgram;
        if (this.pulse && this.pulse.cooldown === 0) this.pulse.cooldownTotal = nextPulseProgram.cooldown;
        this.emitPulseState(true);
      }
      if (changedProgram || changedPulseProgram) { audio.play("machine"); this.burst(chapterTerminal(this.mission).x, 424, night.mint, 10); }
      if (paused) {
        keys.left = keys.right = keys.jump = keys.fire = false; requestInteraction = requestFire = false;
        if (!this.previousPaused || changedProgram || changedPulseProgram || this.appliedMotion !== reducedMotion) this.renderWorld();
        this.previousPaused = true; this.accumulator = 0;
        this.tweens.pauseAll(); this.actor.anims.pause();
        // Stop RAF while a terminal, pause or completion overlay covers the
        // game. sync/visibility/resize wake one frame when it is needed again.
        this.game.loop.sleep();
        return;
      }
      if (this.previousPaused) { this.tweens.resumeAll(); this.actor.anims.resume(); this.previousPaused = false; this.previousBody = this.bodyState; delta = 0; }
      if (this.respawning > 0) { this.respawning -= delta; if (this.respawning <= 0) { this.bodyState = initialChapterBody(this.checkpoint); this.actor.setAlpha(1); this.previousBody = this.bodyState; this.renderX = this.bodyState.x; this.renderY = this.bodyState.y; this.moveCamera(true); } this.renderWorld(); return; }
      this.accumulator += Math.min(delta / 1000, .1);
      let jump = keys.jump; if (this.accumulator >= FIXED_STEP) keys.jump = false;
      const before = this.bodyState;
      if (!this.won) while (this.accumulator >= FIXED_STEP) {
        this.elapsed += FIXED_STEP; this.moveLift(this.elapsed);
        this.previousBody = this.bodyState;
        this.bodyState = stepChapterBody(this.bodyState, { direction: (Number(keys.right) - Number(keys.left)) as -1 | 0 | 1, jump }, this.mission, this.program, this.elapsed, FIXED_STEP, this.platforms);
        if (this.pulse) {
          if (keys.fire || requestFire) firePulseCombat(this.pulse, this.bodyState, this.pulseProgram);
          requestFire = false;
          advancePulseCombat(this.pulse, this.bodyState, this.pulseProgram, FIXED_STEP);
          this.consumePulseEvents();
        }
        jump = false; this.accumulator -= FIXED_STEP;
      } else { this.elapsed += Math.min(delta / 1000, .065); this.accumulator = 0; }
      const body = this.bodyState;
      const interpolation = this.won ? 1 : Math.min(1, this.accumulator / FIXED_STEP);
      this.renderX = this.previousBody.x + (body.x - this.previousBody.x) * interpolation;
      this.renderY = this.previousBody.y + (body.y - this.previousBody.y) * interpolation;
      if (before.vy >= 0 && body.vy < -400) { audio.play("jump"); this.burst(body.x + 14, body.y + 52, night.mint, 5); }
      if (!before.grounded && body.grounded) { audio.play("land"); this.burst(body.x + 14, body.y + 52, 0xbbd6af, 5); }
      if (!this.checkpoint && body.x > 405 && body.grounded) { this.checkpoint = true; audio.play("checkpoint"); this.burst(480, 460, night.gold, 9); if (!this.pulse) emit({ type: "checkpoint", mission: this.mission }); }
      if (body.y > 660) {
        this.respawning = 380; this.actor.setAlpha(.25); keys.left = keys.right = keys.jump = keys.fire = false; requestFire = false; audio.play("fall"); if (!reducedMotion) this.cameras.main.flash(150, 183, 205, 194, false); if (!this.pulse) emit({ type: "fell", mission: this.mission });
      }
      const goal = chapterGoal(this.mission);
      if (!this.won && body.x > goal.x - 52 && body.grounded && Math.abs(body.y + CHAPTER_PLAYER_HEIGHT - goal.y) < 5) {
        if (this.pulse ? this.pulse.cleared === this.pulse.total && Boolean(options.pulse?.program) : chapterProgramReady(this.mission, this.program)) {
          this.won = true; keys.left = keys.right = keys.jump = keys.fire = false; requestFire = false;
          audio.play("arrive"); this.burst(goal.x, goal.y - 90, night.gold, 28); if (!reducedMotion) this.cameras.main.flash(420, 196, 221, 173, false);
          if (this.pulse) emit({ type: "pulse-arrived", lesson: this.pulse.lesson }); else emit({ type: "arrived", mission: this.mission });
        } else if (this.elapsed - this.lastBlocked > 4) { this.lastBlocked = this.elapsed; emit({ type: "blocked", message: this.pulse ? "Repare as três sentinelas antes de chegar à oficina. O pulso e o terminal ajudam a liberar cada passagem." : "A entrega precisa do comando da missão. Volte ao terminal para conferir a variável." }); }
      }
      if (requestInteraction) {
        requestInteraction = false;
        if (Math.abs(body.x - chapterTerminal(this.mission).x) < 110 && !this.won) { keys.left = keys.right = keys.jump = keys.fire = false; requestFire = false; audio.play("terminal"); emit({ type: "terminal", mission: this.mission }); }
        else emit({ type: "blocked", message: "Caminhe até o terminal iluminado. Quando estiver perto, use E ou o botão Terminal." });
      }
      if (this.elapsed - this.positionAt > .15) { this.positionAt = this.elapsed; emit({ type: "position", x: Math.round(body.x), nearTerminal: Math.abs(body.x - chapterTerminal(this.mission).x) < 110, zone: body.x < 600 ? "Pátio do terminal" : this.pulse ? "Rua das sentinelas" : body.x < 1250 ? this.mission === "ponte" ? "Canal das Lanternas" : this.mission === "elevador" ? "Elevador da biblioteca" : "Portão do Farol" : "Caminho da entrega" }); }
      if (body.grounded && Math.abs(body.vx) > 100 && this.elapsed - this.particlesAt > .15) { this.particlesAt = this.elapsed; this.burst(body.x + 10, body.y + 54, 0x9cbfb0, 1); }
      if (body.grounded && Math.abs(body.vx) > 100 && this.elapsed - this.footstepAt > .32) { this.footstepAt = this.elapsed; audio.play("step"); }
      this.emitPulseState();
      this.moveCamera(false, Math.min(delta / 1000, .1)); this.renderWorld();
    }
    private burst(x: number, y: number, tint: number, amount: number) {
      if (reducedMotion) return;
      for (let index = 0; index < amount; index++) {
        const seed = (index * 2.399) + this.elapsed, radius = amount > 15 ? 2.5 : 1.8;
        const dot = this.effectDots[this.effectCursor++ % this.effectDots.length];
        dot.active = true; dot.x = x; dot.y = y; dot.born = this.elapsed;
        dot.toX = x + Math.cos(seed) * (20 + index % 5 * 7); dot.toY = y - 10 - Math.abs(Math.sin(seed)) * (20 + index % 6 * 7);
        dot.duration = .42 + index % 4 * .09; dot.radius = radius; dot.tint = tint;
      }
    }
  }

  // Canvas is retained after the local SwiftShader A/B. Hardware-specific
  // profiling remains separate; see docs/EVOLUCAO_ENTREGA_ORBI.md.
  const game = new Phaser.Game({ type: renderType, parent, width: Math.max(320, parent.clientWidth), height: Math.max(230, parent.clientHeight), backgroundColor: "#102737", transparent: false, antialias: true, roundPixels: false, render: { failIfMajorPerformanceCaveat: !allowSoftwareWebGL }, fps: { smoothStep: false }, audio: { noAudio: true }, scene: [ChapterScene], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, banner: false });
  wakeGame = () => { if (!destroyed && game.isBooted && !game.loop.running) game.loop.wake(true); };
  const clear = () => { keys.left = keys.right = keys.jump = keys.fire = false; requestInteraction = requestFire = false; };
  const keyboard = (event: KeyboardEvent, down: boolean) => {
    if (event.target instanceof HTMLElement && event.target.closest("input,textarea,select,[contenteditable=true]")) return;
    // Releasing a direction/fire key must work even while a shortcut modifier
    // is held; otherwise Ctrl pressed before keyup can leave the control stuck.
    if (down && (event.ctrlKey || event.metaKey || event.altKey)) return;
    const key = event.key.toLowerCase();
    if (!["arrowleft", "arrowright", "a", "d", "arrowup", "w", " ", "e", "f", "x"].includes(key) || ((key === "f" || key === "x") && !options.pulse)) return;
    event.preventDefault();
    if (options.paused || visibilityPaused) { clear(); return; }
    if (down && !event.repeat) audio.unlock();
    if (key === "arrowleft" || key === "a") keys.left = down;
    else if (key === "arrowright" || key === "d") keys.right = down;
    else if (key === "f" || key === "x") { keys.fire = down; if (down && !event.repeat) requestFire = true; }
    else if (down && !event.repeat && key === "e") requestInteraction = true;
    else if (down && !event.repeat) keys.jump = true;
  };
  const down = (event: KeyboardEvent) => keyboard(event, true), up = (event: KeyboardEvent) => keyboard(event, false);
  const visibility = () => { visibilityPaused = document.hidden; clear(); audio.set(options.muted, visibilityPaused || options.paused); wakeGame(); };
  const blur = () => clear();
  parent.addEventListener("keydown", down); parent.addEventListener("keyup", up); parent.addEventListener("blur", blur, true);
  document.addEventListener("visibilitychange", visibility); window.addEventListener("blur", blur);
  const observer = new ResizeObserver(entries => {
    const box = entries[0]?.contentRect;
    if (!box || box.width <= 0 || box.height <= 0) return;
    const width = Math.round(box.width), height = Math.round(box.height);
    if (game.scale.width === width && game.scale.height === height) return;
    game.scale.resize(width, height); wakeGame();
  }); observer.observe(parent);
  game.events.on("ready", () => { game.canvas.setAttribute("aria-hidden", "true"); game.canvas.style.width = "100%"; game.canvas.style.height = "100%"; game.canvas.style.display = "block"; });
  return {
    sync: next => {
      const changedWorld = options.mission !== next.mission || options.program !== next.program || options.restartToken !== next.restartToken || options.pulse?.lesson !== next.pulse?.lesson || options.pulse?.program?.range !== next.pulse?.program?.range || options.pulse?.program?.cooldown !== next.pulse?.program?.cooldown;
      options = next; audio.set(next.muted, next.paused || visibilityPaused);
      if (next.paused) clear();
      if (!next.paused || changedWorld) wakeGame();
    },
    setControl: (control, pressed) => { if (pressed) audio.unlock(); keys[control] = pressed && !options.paused && !visibilityPaused && (control !== "fire" || Boolean(options.pulse)); if (control === "fire" && keys.fire) requestFire = true; },
    jump: () => { audio.unlock(); if (!options.paused && !visibilityPaused) keys.jump = true; },
    fire: () => { audio.unlock(); if (!options.paused && !visibilityPaused && options.pulse) requestFire = true; },
    interact: () => { audio.unlock(); if (!options.paused && !visibilityPaused) requestInteraction = true; },
    focus: () => parent.focus({ preventScroll: true }), unlockAudio: () => audio.unlock(),
    destroy: () => {
      if (destroyed) return; destroyed = true; clear(); observer.disconnect(); audio.destroy();
      parent.removeEventListener("keydown", down); parent.removeEventListener("keyup", up); parent.removeEventListener("blur", blur, true);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("blur", blur);
      motionQuery.removeEventListener("change", motionPreference);
      game.destroy(true);
      // Phaser defers destroy to its next tick. A sleeping terminal/completion
      // must wake once so all canvases, textures and scene listeners are freed.
      if (game.isBooted && !game.loop.running) game.loop.wake(true);
    },
  };
}
