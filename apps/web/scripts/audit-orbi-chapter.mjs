import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base=process.env.ORBI_TEST_URL || "http://localhost:3015";
const output="test-results/orbi-chapter";
const saveKey="orbitamos-orbi-chapter-v2-academy-preview";
const legacyKey="orbitamos-delivery-v1-academy-preview";
const journalKey="orbitamos-practice-journal-v1-academy-preview";
const reports=[];
await mkdir(output,{recursive:true});
const profiles=[
 {name:"desktop",engine:chromium,options:{viewport:{width:1440,height:1000}}},
 {name:"iphone-safari",engine:webkit,options:devices["iPhone 13"]},
 {name:"small-mobile",engine:chromium,options:{viewport:{width:320,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:1}}
].filter(p=>!process.argv[2] || p.name===process.argv[2]);
for (const profile of profiles) {
 const browser=await profile.engine.launch();
 const context=await browser.newContext({...profile.options,reducedMotion:"reduce"});
 const page=await context.newPage();
 page.setDefaultTimeout(30000);
 const errors=[]; page.on("pageerror",e=>errors.push(e.message));
 const root=page.locator("[data-orbi-delivery]");
 const stage=page.locator("[data-orbi-chapter-canvas]");
 const dialog=page.getByRole("dialog");
 const code=page.getByRole("textbox",{name:"Seu código"});
 const read=()=>stage.evaluate(el=>({x:Number(el.dataset.playerX),y:Number(el.dataset.playerY),grounded:el.dataset.playerGrounded==="true",support:el.dataset.playerSupport}));
 const x=async()=>Number(await stage.getAttribute("data-player-x"));
 const go=async(target)=>{
  await expect(stage).toHaveAttribute("data-player-x",/\d+/);
  await stage.focus();
  await page.keyboard.down("ArrowRight");
  try { await expect.poll(async()=>await x()>=target || await root.getAttribute("data-game-status")==="arrived",{timeout:20000,intervals:[30]}).toBe(true); }
  finally { await page.keyboard.up("ArrowRight"); }
 };
 const jump=async()=>{await stage.focus();await page.keyboard.press("Space");};
 const terminal=async()=>{
   await expect(page.getByRole("button",{name:"Abrir terminal"})).toBeEnabled();
   await page.getByRole("button",{name:"Abrir terminal"}).click();
   await expect(dialog).toBeVisible();await expect(code).toBeFocused();
 };
 const apply=async(source)=>{
   await code.fill(source);
   await dialog.getByRole("button",{name:"Aplicar e ver no cenário"}).click();
   await expect(dialog).not.toBeVisible();
   await expect(stage).toBeFocused();
 };
 const shot=async(name,scope="[data-orbi-delivery]")=>{
   assert((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,profile.name+" overflow "+name);
   const axe=await new AxeBuilder({page}).include(scope).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
   assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],profile.name+" a11y "+name);
   await page.screenshot({path:output+"/"+profile.name+"-"+name+".png",fullPage:true});
 };
 try {
   await context.addInitScript(({legacyKey})=>localStorage.setItem(legacyKey,JSON.stringify({version:1,current:2,completed:["velocidade","impulso","condicao"]})),{legacyKey});
   await page.goto(base+"/dev/academy-preview?activity=delivery",{waitUntil:"domcontentloaded",timeout:180000});
   await expect(page.getByRole("button",{name:"Entrar no bairro"})).toBeEnabled({timeout:120000});
   assert.equal(await page.locator("[data-practice-navigation]").count(),0,"Concentrated game keeps room for controls");
   await expect(page.getByText(/Sua aventura anterior está guardada/)).toBeVisible();
   await shot("intro");
   await page.getByRole("button",{name:"Entrar no bairro"}).click();
   await expect(stage.locator("canvas")).toBeVisible({timeout:120000});
   await expect.poll(x).toBe(100);
   await stage.scrollIntoViewIfNeeded();
   await shot("scene");
   // This cover is a capture of the actual playable scene.
   if(profile.name==="desktop") await stage.screenshot({path:output+"/catalog-scene.png"});
   await go(430);
   await terminal();
   assert.equal(await code.inputValue(),"const alcance = 80;");
   await shot("terminal","dialog");
   await code.fill("window.alert(1);");
   await dialog.getByRole("button",{name:"Aplicar e ver no cenário"}).click();
   await expect(dialog).toBeVisible();await expect(dialog.getByText(/Confira a escrita/)).toBeVisible();
   await apply("const alcance = 80;");
   assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).completed,saveKey),[]);
   await terminal();
   await code.fill("const alcance = 280;");
   await dialog.getByRole("button",{name:"Recomeçar este código",exact:true}).click();
   await dialog.getByRole("button",{name:"Sim, recomeçar",exact:true}).click();
   assert.equal(await code.inputValue(),"const alcance = 80;");
   await dialog.getByRole("button",{name:"Desfazer reinício",exact:true}).click();
   assert.equal(await code.inputValue(),"const alcance = 280;");
   await page.keyboard.press("Escape");await expect(stage).toBeFocused();
   // Draft is restored but not silently executed on reload.
   await page.reload({waitUntil:"domcontentloaded"});
   await page.getByRole("button",{name:"Continuar minha aventura"}).click();
   await expect(stage.locator("canvas")).toBeVisible();
   await go(430);await terminal();
   assert.equal(await code.inputValue(),"const alcance = 280;");
   await apply("const alcance = 280;");
   assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).completed,saveKey),[],"Applying code alone is not completion");
   await page.getByRole("button",{name:"Pausar jogo"}).click();
   await expect(root).toHaveAttribute("data-game-status","paused");
   const before=await x();await page.waitForTimeout(250);assert.equal(await x(),before);
   await page.getByRole("button",{name:"Continuar aventura",exact:true}).click();
   await go(825);await jump();await go(1110);
   await go(1385);await jump();await go(1570);
   await go(1670);await jump();await go(2135);
   await expect(root).toHaveAttribute("data-game-status","arrived",{timeout:20000});
   assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).completed,saveKey),["ponte"]);
   await shot("bridge-complete");
   if(profile.name!=="desktop"){
     await page.reload({waitUntil:"domcontentloaded"});
     await expect(page.getByRole("button",{name:"Continuar minha aventura"})).toBeVisible();
     assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).completed,saveKey),["ponte"]);
     assert.deepEqual(errors,[]);
     reports.push({profile:profile.name,firstMissionCompleted:true,resume:true,overflow:0,a11y:0,errors});continue;
   }
   await page.getByRole("button",{name:"Próxima entrega",exact:true}).click();
   await expect.poll(x).toBe(100);
   await go(430);await terminal();assert.equal(await code.inputValue(),"let altura = 50;");
   await apply("let altura = 180;");
   await go(750);
   await expect.poll(async()=>{const p=await read();return p.support==="lift"&&p.y+54<340;},{timeout:20000,intervals:[30]}).toBe(true);
   await jump();await go(1040);
   await go(1445);await jump();await go(1640);
   await go(2135);await expect(root).toHaveAttribute("data-game-status","arrived");
   await shot("elevator-complete");
   await page.getByRole("button",{name:"Próxima entrega",exact:true}).click();
   await expect.poll(x).toBe(100);
   await go(430);await terminal();assert.equal(await code.inputValue(),"","Final transfer starts without solution");
   await apply("const custo = 4;\nconst energia = 6;");
   await go(1150);
   await page.keyboard.down("ArrowRight");await page.waitForTimeout(600);await page.keyboard.up("ArrowRight");
   assert((await x())<1200,"Hardcoded number cannot open final gate");
   assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).completed,saveKey),["ponte","elevador"]);
   await page.getByRole("button",{name:"Voltar ao ponto de retorno"}).click();
   await expect.poll(x).toBeLessThan(600);await terminal();
   await apply("const custo = 4;\nconst energia = custo + 2;");
   await go(2135);await expect(root).toHaveAttribute("data-game-status","arrived");
   await shot("chapter-complete");
   const saved=await page.evaluate(({saveKey,journalKey,legacyKey})=>({save:JSON.parse(localStorage.getItem(saveKey)),journal:JSON.parse(localStorage.getItem(journalKey)),legacy:JSON.parse(localStorage.getItem(legacyKey))}),{saveKey,journalKey,legacyKey});
   assert.deepEqual(saved.save.completed,["ponte","elevador","farol"]);
   assert.equal(saved.journal.activities.delivery.contentVersion,2);
   assert(saved.journal.activities.delivery.completedAt);
   assert.deepEqual(saved.legacy.completed,["velocidade","impulso","condicao"]);
   assert.equal(await page.getByRole("link",{name:"Levar a ideia ao laboratório"}).getAttribute("href"),"/dev/ide-preview/variaveis-js?from=delivery&academy=1");
   await page.reload({waitUntil:"domcontentloaded"});
   await expect(page.getByText(/Capítulo concluído/)).toBeVisible();
   assert.deepEqual(errors,[]);
   reports.push({profile:profile.name,completed:saved.save.completed,legacyPreserved:true,journalVersion:2,overflow:0,a11y:0,errors});
 } catch(e){await page.screenshot({path:output+"/"+profile.name+"-failure.png",fullPage:true}).catch(()=>{});console.log("STATE",await read().catch(()=>null));throw e;}
 finally {if(reports.length) await writeFile(output+"/results-partial.json",JSON.stringify(reports,null,2));await context.close();await browser.close();}
}
await writeFile(output+"/results"+(process.argv[2]?"-"+process.argv[2]:"")+".json",JSON.stringify(reports,null,2));
console.log(JSON.stringify(reports,null,2));
