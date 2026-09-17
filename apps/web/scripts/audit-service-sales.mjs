import {chromium} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import assert from "node:assert/strict";
const base=process.env.SALES_AUDIT_URL||"http://localhost:3015";
const out="test-results/service-sales";
await mkdir(out,{recursive:true});
const source=await readFile("src/data/servicos.ts","utf8");
const services=[...source.matchAll(/slug: "([^"]+)",\s*categoria: "[^"]+",\s*nome: "([^"]+)",\s*preco: "([^"]+)"/g)].map(m=>({slug:m[1],name:m[2],price:m[3]}));
assert.equal(services.length,6);
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const service of services)for(const [width,height] of [[1440,1000],[1280,600],[390,844],[320,740]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:width===1280?"no-preference":"reduce"});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.addInitScript(()=>{window.salesEvents=[];window.addEventListener("orbitamos:service",event=>window.salesEvents.push(event.detail));});
  const response=await page.goto(base+"/servicos/"+service.slug,{waitUntil:"domcontentloaded",timeout:180000});
  assert.equal(response.status(),200);
  const root=page.locator("[data-sales-page]");
  await root.waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>window.salesEvents.some(event=>event.action==="view"),{},{timeout:60000});
  assert.equal(await root.locator("h1").count(),1);
  assert.equal(await root.locator("[data-canonical-price]").count(),2);
  for(const price of await root.locator("[data-canonical-price]").allTextContents())assert.equal(price,service.price);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"),"https://www.orbitamosbr.com/servicos/"+service.slug);
  assert.ok(!(await root.innerText()).match(/(?:cena|imagem) ilustrativa.*IA/i));
  const tabs=root.getByRole("tab");
  assert.equal(await tabs.count(),3);
  for(let index=0;index<3;index++){
    await tabs.nth(index).click();
    assert.equal(await tabs.nth(index).getAttribute("aria-selected"),"true");
    assert.equal(await root.getByRole("tabpanel").count(),1);
    assert.ok((await root.getByRole("tabpanel").innerText()).length>100);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),service.slug+" overflow "+width+" tab "+index);
  }
  await tabs.first().focus();await page.keyboard.press("End");assert.equal(await tabs.nth(2).getAttribute("aria-selected"),"true");
  await page.keyboard.press("ArrowRight");assert.equal(await tabs.first().getAttribute("aria-selected"),"true");
  for(const image of await root.locator("img").all()){
    await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());assert.ok(await image.evaluate(el=>el.naturalWidth>0));
  }
  for(const faq of await root.locator("details").all()){
    await faq.locator("summary").click();assert.ok(await faq.getAttribute("open")!==null);assert.ok((await faq.locator("p").innerText()).length>30);
  }
  for(const link of await root.locator('[data-service-event="contact"]').all()){
    const href=new URL(await link.getAttribute("href"));assert.equal(href.origin+href.pathname,"https://wa.me/5511949138973");assert.ok(href.searchParams.get("text").includes(service.name));assert.ok(href.searchParams.get("text").includes(service.price));
  }
  await page.evaluate(()=>document.addEventListener("click",event=>{if(event.target.closest?.('[data-service-event="contact"]'))event.preventDefault();},true));
  await root.locator('[data-service-detail="investment"]').click();
  assert.ok(await page.evaluate(()=>window.salesEvents.some(event=>event.action==="contact"&&event.detail==="investment")));
  if([1440,390].includes(width)){
    const axe=await new AxeBuilder({page}).include("[data-sales-page]").withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],service.slug+" axe "+width);
    await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
    await page.screenshot({path:out+"/"+service.slug+"-"+width+"-hero.jpg",type:"jpeg",quality:75});
    for(const id of ["solucao","prova","investimento"]){
      await page.locator("#"+id).screenshot({path:out+"/"+service.slug+"-"+width+"-"+id+".jpg",type:"jpeg",quality:75});
    }
  }
  assert.deepEqual(errors,[],service.slug+" browser errors");
  results.push({slug:service.slug,width,height,passed:true});console.log("PASS",service.slug,width,height);
  await context.close();
 }
 const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await page.goto(base+"/servicos/presenca-profissional",{waitUntil:"domcontentloaded",timeout:120000});
 assert.equal(await page.locator("[data-canonical-price]").first().innerText(),"R$ 1.497");
 assert.equal(await page.locator("[data-sales-page] h1").count(),1);
 results.push({noJavaScript:true,passed:true});
 await page.close();
 await writeFile(out+"/results.json",JSON.stringify(results,null,2));
 console.log(JSON.stringify({passed:results.length}));
}finally{await browser.close();}
