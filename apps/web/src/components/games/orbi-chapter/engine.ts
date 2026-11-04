import type PhaserTypes from "phaser";
import { CHAPTER_HEIGHT, CHAPTER_PLAYER_HEIGHT, CHAPTER_PLAYER_WIDTH, CHAPTER_WORLD_WIDTH, chapterGoal, chapterPlatforms, chapterProgramReady, chapterTerminal, initialChapterBody, stepChapterBody, type ChapterBody, type ChapterMissionId, type ChapterProgram } from "@/lib/orbiChapter";
import { ChapterAudio } from "./audio";
import type { ChapterRuntime, ChapterSceneOptions } from "./types";

const ART_ROOT = "/images/games/orbi-chapter";
const night = { ink: 0x0d2433, deep: 0x103345, mint: 0xb6ead2, gold: 0xf4ce86, water: 0x1b5362 };

export async function createChapterGame(parent: HTMLElement, initialOptions: ChapterSceneOptions): Promise<ChapterRuntime> {
  // Phaser is loaded only when this game is mounted in the browser.
  const Phaser = (await import("phaser")).default;
  let options = initialOptions, destroyed = false;
  const audio = new ChapterAudio();
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  const motionPreference = () => { reducedMotion = motionQuery.matches; };
  motionQuery.addEventListener("change", motionPreference);
  const keys = { left: false, right: false, jump: false };
  let requestInteraction = false;
  let visibilityPaused = document.hidden;
  const emit: ChapterSceneOptions["onEvent"] = event => { if (!destroyed) options.onEvent(event); };

  class ChapterScene extends Phaser.Scene {
    private bodyState: ChapterBody = initialChapterBody();
    private mission: ChapterMissionId = options.mission;
    private program: ChapterProgram | null = options.program;
    private elapsed = 0;
    private accumulator = 0;
    private checkpoint = false;
    private won = false;
    private respawning = 0;
    private previousPaused = false;
    private positionAt = 0;
    private particlesAt = 0;
    private lastBlocked = -10;
    private cameraCenter = 480;
    private visibleWidth = 960;
    private actor!: PhaserTypes.GameObjects.Sprite;
    private shadow!: PhaserTypes.GameObjects.Ellipse;
    private structures!: PhaserTypes.GameObjects.Graphics;
    private scenery!: PhaserTypes.GameObjects.Container;
    private terminal!: PhaserTypes.GameObjects.Container;
    private terminalLight!: PhaserTypes.GameObjects.Arc;
    private terminalHalo!: PhaserTypes.GameObjects.Arc;
    private terminalPrompt!: PhaserTypes.GameObjects.Text;
    private goal!: PhaserTypes.GameObjects.Container;
    private goalLight!: PhaserTypes.GameObjects.Arc;
    private sparkles!: PhaserTypes.GameObjects.Graphics;
    private ambientDots: { x: number; y: number; phase: number; radius: number }[] = [];
    private recentProgram = "";
    private atlasAvailable = false;
    private platformArt = new Map<string, PhaserTypes.GameObjects.Image | PhaserTypes.GameObjects.TileSprite>();

    constructor() { super({ key: "orbi-delivery-chapter" }); }
    preload() {
      this.load.image("neighborhood", `${ART_ROOT}/background-v1.webp`);
      this.load.image("orbi", `${ART_ROOT}/orbi-sheet-v1.webp`);
      this.load.image("props", `${ART_ROOT}/props-sheet-v1.webp`);
      this.load.image("orbi-backup", "/orbi-tech.png");
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
      if (this.textures.exists("neighborhood")) this.add.image(-340, -340, "neighborhood").setOrigin(0).setDisplaySize(2000, 1000).setScrollFactor(.17, 0).setDepth(-20);
      // Far-away lights, foreground embers and the physical mechanisms remain independent layers.
      this.add.rectangle(0, 0, CHAPTER_WORLD_WIDTH, 600, 0x071a2b, .1).setOrigin(0).setScrollFactor(.17, 0).setDepth(-19);
      this.add.circle(1900, 90, 35, 0xe7e7b6, .13).setScrollFactor(.3, 0).setDepth(-18);
      this.scenery = this.add.container(0, 0).setDepth(1);
      this.structures = this.add.graphics().setDepth(0);
      this.sparkles = this.add.graphics().setDepth(8);
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
      const zoom = Math.max(.33, height / CHAPTER_HEIGHT * (width < 650 ? 1.18 : 1));
      this.cameras.main.setZoom(zoom).setBounds(0, 0, CHAPTER_WORLD_WIDTH, CHAPTER_HEIGHT);
      this.visibleWidth = width / zoom;
      this.cameraCenter = Math.max(this.visibleWidth / 2, this.bodyState.x + this.visibleWidth * .18);
      this.moveCamera(true);
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
      if (this.atlasAvailable) container.add(this.atlasSprite(this.mission === "farol" ? "lighthouse-art" : "mailbox-art", 0, 3, this.mission === "farol" ? 143 : 120, this.mission === "farol" ? 236 : 112));
      else {
        container.add(this.add.rectangle(0, -53, 62, 100, 0x315b60).setStrokeStyle(3, night.gold));
        container.add(this.add.circle(0, -109, 15, night.gold, .8));
      }
      this.goalLight = this.add.circle(0, -103, 40, night.gold, .1);
      container.addAt(this.goalLight, 0);
      container.add(this.add.text(0, -160, this.mission === "farol" ? "FAROL" : this.mission === "elevador" ? "BIBLIOTECA" : "PONTO DE ENTREGA", { fontFamily: "system-ui, sans-serif", fontSize: `${Math.max(12, 11 / this.cameras.main.zoom)}px`, fontStyle: "700", color: "#f4dca9", backgroundColor: "#183541", padding: { x: 9, y: 6 } }).setOrigin(.5));
      return container;
    }
    private resetWorld(checkpoint: boolean) {
      this.positionAt = -Infinity; this.particlesAt = 0; this.lastBlocked = -10;
      this.bodyState = initialChapterBody(checkpoint); this.elapsed = 0; this.accumulator = 0; this.won = false; this.respawning = 0;
      this.positionAt = this.particlesAt = 0; this.lastBlocked = -10;
      keys.left = keys.right = keys.jump = false;
      this.actor.setAlpha(1).clearTint(); this.actor.setFlipX(false);
      this.scenery.removeAll(true);
      this.platformArt.clear();
      const label = this.mission === "ponte" ? "Canal das Lanternas" : this.mission === "elevador" ? "Biblioteca nas Nuvens" : "O último brilho do bairro";
      this.scenery.add(this.title(label, 270, 300, 14, "#e4e5c1"));
      const direction = this.add.text(130, 367, "→  Sua entrega", { color: "#c6e8d9", fontSize: "14px", fontFamily: "system-ui, sans-serif" }).setAlpha(.9);
      this.scenery.add(direction);
      if (this.mission === "elevador") {
        this.scenery.add(this.title("Embarque quando descer", 785, 160, 14));
        const mast = this.add.rectangle(690, 385, 8, 230, 0x3f6667).setStrokeStyle(1, 0x85b9b0, .7);
        this.scenery.add(mast);
      }
      if (this.mission === "ponte") this.scenery.add(this.title("Uma ponte nasce de um valor", 820, 345, 14));
      if (this.mission === "farol") this.scenery.add(this.title("Consumo: 4  ·  Reserva: 2", 1218, 225, 14, "#f2dba2"));
      if (this.atlasAvailable) {
        for (const platform of chapterPlatforms(this.mission, this.program, 0)) {
          if (platform.id === "gate" || platform.id.includes("crate")) continue;
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
      this.recentProgram = JSON.stringify(this.program);
      this.moveCamera(true); this.renderWorld();
    }
    private moveCamera(immediate = false) {
      const desired = Math.max(this.visibleWidth / 2, Math.min(CHAPTER_WORLD_WIDTH - this.visibleWidth / 2, this.bodyState.x + this.visibleWidth * .2));
      this.cameraCenter = immediate || reducedMotion ? desired : this.cameraCenter + (desired - this.cameraCenter) * .085;
      this.cameras.main.centerOn(this.cameraCenter, 300);
    }
    private renderWorld() {
      const graphics = this.structures; graphics.clear();
      const platforms = chapterPlatforms(this.mission, this.program, this.elapsed);
      // Reflecting water is below the physical walkways, not a second flat background.
      if (this.mission !== "farol") {
        graphics.fillStyle(night.water, .8); graphics.fillRect(550, 527, 650, 90);
        for (let index = 0; index < 14; index++) {
          const x = 568 + index * 43, width = 15 + (index % 3) * 9;
          graphics.lineStyle(1.2, 0x91d3c1, .15 + Math.sin(this.elapsed + index) * .06); graphics.lineBetween(x, 541 + (index % 4) * 11, x + width, 541 + (index % 4) * 11);
        }
      }
      for (const platform of platforms) {
        const art = this.platformArt.get(platform.id);
        if (art && (platform.id === "bridge" || platform.id === "lift")) art.setPosition(platform.x, platform.y - (platform.id === "bridge" ? 2 : 13)).setDisplaySize(platform.width, platform.id === "bridge" ? 48 : 49);
        if (platform.id === "gate") {
          graphics.fillStyle(0x1d4656, .85); graphics.fillRoundedRect(platform.x - 8, platform.y, platform.width + 16, platform.height, 9);
          graphics.lineStyle(3, 0xe5ac77, .85);
          for (let y = platform.y + 13; y < 500; y += 19) graphics.lineBetween(platform.x + 4, y, platform.x + platform.width - 4, y);
          graphics.fillStyle(0xf1c986, .25 + Math.sin(this.elapsed * 2) * .08); graphics.fillCircle(platform.x + 18, 278, 10);
          continue;
        }
        if (platform.id.includes("crate")) {
          graphics.fillStyle(0x9c724d, 1); graphics.fillRoundedRect(platform.x, platform.y, platform.width, platform.height, 6);
          graphics.lineStyle(3, 0xcfa578, .9); graphics.strokeRoundedRect(platform.x + 4, platform.y + 4, platform.width - 8, platform.height - 8, 4);
          graphics.lineBetween(platform.x + 5, platform.y + 5, platform.x + platform.width - 5, platform.y + platform.height - 5);
          graphics.lineBetween(platform.x + platform.width - 5, platform.y + 5, platform.x + 5, platform.y + platform.height - 5);
          continue;
        }
        const mechanism = platform.id === "bridge" || platform.id === "lift";
        graphics.fillStyle(mechanism ? 0x4d776d : 0x254d48, 1);
        graphics.fillRoundedRect(platform.x, platform.y, platform.width, platform.height, mechanism ? 7 : 12);
        if (!art) { graphics.fillStyle(mechanism ? 0xc2cf99 : 0x95b88d, 1); graphics.fillRoundedRect(platform.x, platform.y, platform.width, 9, 4); }
        graphics.lineStyle(1, 0xc2d4ad, .35); graphics.lineBetween(platform.x + 7, platform.y + 14, platform.x + platform.width - 7, platform.y + 14);
        if (mechanism) {
          for (let x = platform.x + 14; x < platform.x + platform.width; x += 24) { graphics.lineStyle(2, 0x1d4853, .65); graphics.lineBetween(x, platform.y + 9, x, platform.y + platform.height - 3); }
          if (platform.id === "lift") { graphics.lineStyle(2, 0x8ba99b, .75); graphics.lineBetween(platform.x + 18, 255, platform.x + 18, platform.y); graphics.lineBetween(platform.x + platform.width - 18, 255, platform.x + platform.width - 18, platform.y); }
        } else if (!art) {
          for (let x = platform.x + 20; x < platform.x + platform.width - 10; x += 34) { graphics.lineStyle(1.4, 0x9dbf8d, .6); const sway = Math.sin(this.elapsed * 1.3 + x) * 2; graphics.lineBetween(x, platform.y + 3, x - 3 + sway, platform.y - 5); graphics.lineBetween(x, platform.y + 4, x + 4 + sway, platform.y - 3); }
        }
      }
      const body = this.bodyState;
      this.actor.setPosition(body.x + CHAPTER_PLAYER_WIDTH / 2, body.y + CHAPTER_PLAYER_HEIGHT + 7).setFlipX(body.facing === -1);
      const animation = this.won ? "orbi-win" : !body.grounded ? body.vy < 0 ? "orbi-jump" : "orbi-fall" : Math.abs(body.vx) > 25 ? "orbi-run" : "orbi-idle";
      if (this.textures.exists("orbi") && this.actor.anims.currentAnim?.key !== animation) this.actor.play(animation);
      if (!reducedMotion && body.grounded && !this.won && Math.abs(body.vx) < 25) this.actor.y += Math.sin(this.elapsed * 3) * 1.7;
      const floor = platforms.filter(platform => body.x + 28 > platform.x && body.x + 2 < platform.x + platform.width && platform.y >= body.y + CHAPTER_PLAYER_HEIGHT - 3).sort((a, b) => a.y - b.y)[0];
      const shadowGap = Math.max(0, (floor?.y ?? 570) - (body.y + CHAPTER_PLAYER_HEIGHT));
      this.shadow.setPosition(body.x + 15, floor?.y ?? 570).setAlpha(floor ? Math.max(.08, .36 - shadowGap / 650) : 0).setScale(Math.max(.45, 1 - shadowGap / 400));
      const near = Math.abs(body.x - chapterTerminal(this.mission).x) < 100;
      this.terminalPrompt.setAlpha(near ? 1 : .62); this.terminalLight.setAlpha(reducedMotion ? .9 : .65 + Math.sin(this.elapsed * 3) * .25);
      if (reducedMotion) { this.tweens.killTweensOf(this.terminalHalo); this.terminalHalo.setAlpha(.1).setScale(1); }
      this.goalLight.setAlpha(this.won ? .45 : chapterProgramReady(this.mission, this.program) ? reducedMotion ? .26 : .22 + Math.sin(this.elapsed * 2) * .08 : .08);
      const sparkles = this.sparkles; sparkles.clear();
      if (reducedMotion) return;
      for (const dot of this.ambientDots) { sparkles.fillStyle(dot.phase % 2 > 1 ? night.gold : night.mint, .2 + Math.sin(this.elapsed * .8 + dot.phase) * .14); sparkles.fillCircle(dot.x + Math.sin(this.elapsed * .4 + dot.phase) * 9, dot.y + Math.sin(this.elapsed * .7 + dot.phase) * 7, dot.radius); }
    }
    update(_now: number, delta: number) {
      if (!this.actor) return;
      parent.dataset.playerX = String(Math.round(this.bodyState.x));
      parent.dataset.playerY = String(Math.round(this.bodyState.y));
      parent.dataset.playerGrounded = String(this.bodyState.grounded);
      parent.dataset.playerSupport = this.bodyState.support ?? "air";
      const paused = options.paused || visibilityPaused;
      if (this.mission !== options.mission) { this.mission = options.mission; this.program = options.program; this.checkpoint = false; this.resetWorld(false); }
      if (options.restartToken !== initialOptions.restartToken) {
        initialOptions = { ...initialOptions, restartToken: options.restartToken };
        this.resetWorld(this.checkpoint);
      }
      this.program = options.program;
      const signature = JSON.stringify(this.program);
      if (signature !== this.recentProgram) { this.recentProgram = signature; audio.play("machine"); this.burst(chapterTerminal(this.mission).x, 424, night.mint, 10); }
      audio.set(options.muted, paused);
      if (paused) { keys.left = keys.right = keys.jump = false; this.previousPaused = true; this.tweens.pauseAll(); this.actor.anims.pause(); this.renderWorld(); return; }
      if (this.previousPaused) { this.tweens.resumeAll(); this.actor.anims.resume(); this.previousPaused = false; }
      if (this.respawning > 0) { this.respawning -= delta; if (this.respawning <= 0) { this.bodyState = initialChapterBody(this.checkpoint); this.actor.setAlpha(1); this.moveCamera(true); } this.renderWorld(); return; }
      this.accumulator += Math.min(delta / 1000, .1);
      let jump = keys.jump; if (this.accumulator >= 1 / 120) keys.jump = false;
      const before = this.bodyState;
      if (!this.won) while (this.accumulator >= 1 / 120) {
        this.elapsed += 1 / 120;
        this.bodyState = stepChapterBody(this.bodyState, { direction: (Number(keys.right) - Number(keys.left)) as -1 | 0 | 1, jump }, this.mission, this.program, this.elapsed, 1 / 120);
        jump = false; this.accumulator -= 1 / 120;
      } else { this.elapsed += Math.min(delta / 1000, .065); this.accumulator = 0; }
      const body = this.bodyState;
      if (before.vy >= 0 && body.vy < -400) { audio.play("jump"); this.burst(body.x + 14, body.y + 52, night.mint, 5); }
      if (!before.grounded && body.grounded) { audio.play("land"); this.burst(body.x + 14, body.y + 52, 0xbbd6af, 5); }
      if (!this.checkpoint && body.x > 405 && body.grounded) { this.checkpoint = true; audio.play("checkpoint"); this.burst(480, 460, night.gold, 9); emit({ type: "checkpoint", mission: this.mission }); }
      if (body.y > 660) {
        this.respawning = 380; this.actor.setAlpha(.25); keys.left = keys.right = false; audio.play("fall"); if (!reducedMotion) this.cameras.main.flash(150, 183, 205, 194, false); emit({ type: "fell", mission: this.mission });
      }
      const goal = chapterGoal(this.mission);
      if (!this.won && body.x > goal.x - 52 && body.grounded && Math.abs(body.y + CHAPTER_PLAYER_HEIGHT - goal.y) < 5) {
        if (chapterProgramReady(this.mission, this.program)) { this.won = true; keys.left = keys.right = false; audio.play("arrive"); this.burst(goal.x, goal.y - 90, night.gold, 28); if (!reducedMotion) this.cameras.main.flash(420, 196, 221, 173, false); emit({ type: "arrived", mission: this.mission }); }
        else if (this.elapsed - this.lastBlocked > 4) { this.lastBlocked = this.elapsed; emit({ type: "blocked", message: "A entrega precisa do comando da missão. Volte ao terminal para conferir a variável." }); }
      }
      if (requestInteraction) {
        requestInteraction = false;
        if (Math.abs(body.x - chapterTerminal(this.mission).x) < 110 && !this.won) { keys.left = keys.right = false; audio.play("terminal"); emit({ type: "terminal", mission: this.mission }); }
        else emit({ type: "blocked", message: "Caminhe até o terminal iluminado. Quando estiver perto, use E ou o botão Terminal." });
      }
      if (this.elapsed - this.positionAt > .15) { this.positionAt = this.elapsed; emit({ type: "position", x: Math.round(body.x), nearTerminal: Math.abs(body.x - chapterTerminal(this.mission).x) < 110, zone: body.x < 600 ? "Pátio do terminal" : body.x < 1250 ? this.mission === "ponte" ? "Canal das Lanternas" : this.mission === "elevador" ? "Elevador da biblioteca" : "Portão do Farol" : "Caminho da entrega" }); }
      if (body.grounded && Math.abs(body.vx) > 100 && this.elapsed - this.particlesAt > .15) { this.particlesAt = this.elapsed; this.burst(body.x + 10, body.y + 54, 0x9cbfb0, 1); }
      this.moveCamera(); this.renderWorld();
    }
    private burst(x: number, y: number, tint: number, amount: number) {
      if (reducedMotion) return;
      for (let index = 0; index < amount; index++) {
        const seed = (index * 2.399) + this.elapsed, radius = amount > 15 ? 2.5 : 1.8;
        const dot = this.add.circle(x, y, radius, tint, .8).setDepth(9);
        this.tweens.add({ targets: dot, x: x + Math.cos(seed) * (20 + index % 5 * 7), y: y - 10 - Math.abs(Math.sin(seed)) * (20 + index % 6 * 7), alpha: 0, duration: 420 + index % 4 * 90, onComplete: () => dot.destroy() });
      }
    }
  }

  // This layered 2D scene needs no shaders. Canvas avoids software-WebGL stalls
  // on modest phones and keeps controls responsive without requiring a GPU.
  const game = new Phaser.Game({ type: Phaser.CANVAS, parent, width: Math.max(320, parent.clientWidth), height: Math.max(230, parent.clientHeight), backgroundColor: "#102737", transparent: false, antialias: true, roundPixels: false, fps: { smoothStep: false }, audio: { noAudio: true }, scene: [ChapterScene], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, banner: false });
  const clear = () => { keys.left = keys.right = keys.jump = false; requestInteraction = false; };
  const keyboard = (event: KeyboardEvent, down: boolean) => {
    if (event.target instanceof HTMLElement && event.target.closest("input,textarea,select,[contenteditable=true]")) return;
    const key = event.key.toLowerCase();
    if (!["arrowleft", "arrowright", "a", "d", "arrowup", "w", " ", "e"].includes(key)) return;
    event.preventDefault(); audio.unlock();
    if (key === "arrowleft" || key === "a") keys.left = down;
    else if (key === "arrowright" || key === "d") keys.right = down;
    else if (down && !event.repeat && key === "e") requestInteraction = true;
    else if (down && !event.repeat) keys.jump = true;
  };
  const down = (event: KeyboardEvent) => keyboard(event, true), up = (event: KeyboardEvent) => keyboard(event, false);
  const visibility = () => { visibilityPaused = document.hidden; clear(); audio.set(options.muted, visibilityPaused || options.paused); };
  const blur = () => clear();
  parent.addEventListener("keydown", down); parent.addEventListener("keyup", up); parent.addEventListener("blur", blur, true);
  document.addEventListener("visibilitychange", visibility); window.addEventListener("blur", blur);
  const observer = new ResizeObserver(entries => { const box = entries[0]?.contentRect; if (box && box.width > 0 && box.height > 0) game.scale.resize(Math.round(box.width), Math.round(box.height)); }); observer.observe(parent);
  game.events.on("ready", () => { game.canvas.setAttribute("aria-hidden", "true"); game.canvas.style.width = "100%"; game.canvas.style.height = "100%"; game.canvas.style.display = "block"; });
  return {
    sync: next => { options = next; audio.set(next.muted, next.paused || visibilityPaused); },
    setControl: (control, pressed) => { audio.unlock(); keys[control] = pressed && !options.paused; },
    jump: () => { audio.unlock(); if (!options.paused) keys.jump = true; },
    interact: () => { audio.unlock(); if (!options.paused) requestInteraction = true; },
    focus: () => parent.focus({ preventScroll: true }), unlockAudio: () => audio.unlock(),
    destroy: () => {
      if (destroyed) return; destroyed = true; clear(); observer.disconnect(); audio.destroy();
      parent.removeEventListener("keydown", down); parent.removeEventListener("keyup", up); parent.removeEventListener("blur", blur, true);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("blur", blur);
      motionQuery.removeEventListener("change", motionPreference);
      game.destroy(true);
    },
  };
}
