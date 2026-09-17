import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const base = process.env.HOME_AUDIT_URL || "http://localhost:3015";
const output = path.resolve("test-results/home-delivery");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const { width, height, motion } of [
    {width:1440,height:1000,motion:"no-preference"},
    {width:1280,height:600,motion:"no-preference"},
    {width:1024,height:768,motion:"reduce"},
    {width:768,height:900,motion:"reduce"},
    {width:390,height:844,motion:"no-preference"},
    {width:320,height:740,motion:"reduce"},
  ]) {
    const context = await browser.newContext({viewport:{width,height},reducedMotion:motion});
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error=>errors.push(error.message));
    await page.goto(base, {waitUntil:"domcontentloaded",timeout:180000});
    await page.locator("#como-funciona").waitFor({timeout:120000});
    await page.locator('#engenharia[data-scene-ready="true"]').waitFor({timeout:120000});
    await page.evaluate(()=>document.fonts.ready);
    for(const sectionId of ["como-funciona","engenharia"]) {
      const section=page.locator("#"+sectionId);
      await section.scrollIntoViewIfNeeded();
      const tabs=section.getByRole("tab");
      assert.equal(await tabs.count(),4);
      for(let i=0;i<4;i++){
        await tabs.nth(i).click();
        await section.locator('[role="tabpanel"]:not([hidden])').waitFor();
        assert.equal(await tabs.nth(i).getAttribute("aria-selected"),"true");
        assert.equal(await section.getByRole("tabpanel").count(),1);
        const activePanel=section.getByRole("tabpanel");
        assert.ok((await activePanel.innerText()).trim().length>30);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),sectionId+" overflow "+width);
        if(sectionId==="como-funciona"){
          const img=activePanel.locator("img");
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(el=>el.decode());
          assert.ok(await img.evaluate(el=>el.naturalWidth>0 && el.clientHeight>0));
          assert.equal(await img.getAttribute("alt"),"");
          assert.ok(await img.getAttribute("sizes"));
        }else{
          const scene=section.locator('[class*="systemScene"]');
          assert.ok((await scene.boundingBox()).height>=300,"Definite visual height, including compact mobile framing");
          const active=section.locator('[data-engineering-layer="'+i+'"]');
          await active.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
          assert.equal(await active.getAttribute("data-active"),"true");
          assert.equal(await section.locator("canvas").count(),0);
          const visible=await active.evaluate(el=>{
            const a=el.getBoundingClientRect(),b=el.closest('[class*="systemScene"]').getBoundingClientRect();
            return a.left>=b.left-1&&a.right<=b.right+1&&a.top>=b.top-1&&a.bottom<=b.bottom+1;
          });
          assert.ok(visible,"Selected layer clipped: "+width+" layer "+i);
        }
        if([1440,390].includes(width)) await section.screenshot({path:path.join(output,sectionId+"-"+width+"-"+i+".jpg"),type:"jpeg",quality:75});
      }
      await tabs.nth(0).focus();
      await page.keyboard.press("End");
      assert.equal(await tabs.nth(3).getAttribute("aria-selected"),"true");
      await page.keyboard.press("ArrowRight");
      assert.equal(await tabs.nth(0).getAttribute("aria-selected"),"true");
      const axe=await new AxeBuilder({page}).include("#"+sectionId).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
      assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],sectionId+" accessibility");
      results.push({section:sectionId,width,height,motion,passed:true});
      console.log("PASS",sectionId,width,height,motion);
    }
    if(motion==="no-preference"){
      const section=page.locator("#engenharia");
      const values=[];
      for(const point of [.1,.5,.9]){
        await section.evaluate((el,p)=>{const top=el.getBoundingClientRect().top+scrollY;scrollTo({top:top+el.clientHeight*p-innerHeight*.5,behavior:"instant"});},point);
        await page.waitForFunction(()=>{
          const el=document.querySelector("#engenharia");
          const r=el.getBoundingClientRect();
          const expected=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
          return Math.abs(parseFloat(el.style.getPropertyValue("--scene-progress"))-expected)<.015;
        },{},{timeout:10000}).catch(async error=>{
          console.log("SCROLL STATE",await section.evaluate(el=>({value:el.style.getPropertyValue("--scene-progress"),top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height,viewport:innerHeight,y:scrollY,motion:el.dataset.sceneMotion,media:matchMedia("(prefers-reduced-motion: reduce)").matches})));
          throw error;
        });
        values.push(await section.evaluate(el=>getComputedStyle(el).getPropertyValue("--scene-progress").trim()));
      }
      assert.ok(new Set(values).size>1,"Scene camera follows scroll");
      results.push({width,scrollProgress:values});
    }
    assert.deepEqual(errors,[],"Browser runtime errors");
    await context.close();
  }
  await writeFile(path.join(output,"results.json"),JSON.stringify(results,null,2));
  console.log(JSON.stringify({passed:results.length}));
}finally{await browser.close();}
