import { chromium } from "@playwright/test";
import { readdir, readFile, access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const base=process.env.HOME_AUDIT_URL||"http://localhost:3015";
const output=path.resolve("test-results/site-media");
await mkdir(output,{recursive:true});
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
const sourceFiles=(await walk("src")).filter(file=>/\.(tsx?|css)$/.test(file));
const refs=new Map();
for(const file of sourceFiles){
  const source=await readFile(file,"utf8");
  for(const match of source.matchAll(/["'`](\/[^"'\`\s<>?$]+\.(?:png|jpe?g|webp|svg|mp4))["'`]/g)){
    const url=match[1];
    if(url.startsWith("//"))continue;
    if(!refs.has(url))refs.set(url,[]);
    refs.get(url).push(file);
  }
}
const missing=[];
for(const [url,files]of refs){try{await access(path.join("public",url.slice(1)));}catch{missing.push({url,files});}}
const data=await readFile("src/data/servicos.ts","utf8");
const slugs=[...data.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m=>m[1]);
assert.equal(slugs.length,6);
const browser=await chromium.launch({headless:true});
const services=[];
try{
 for(const slug of slugs)for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  await page.goto(base+"/servicos/"+slug,{waitUntil:"domcontentloaded",timeout:120000});
  const photo=page.locator("[data-service-proof]");
  await photo.waitFor();
  await photo.locator("img").scrollIntoViewIfNeeded();
  await photo.locator("img").evaluate(img=>img.decode());
  assert.ok(await photo.locator("img").evaluate(img=>img.naturalWidth>0));
  assert.ok(await photo.locator("img").getAttribute("alt"));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),slug+" overflow "+width);
  assert.equal(await page.getByRole("heading",{level:1}).count(),1);
  const imageUrl=await photo.locator("img").evaluate(img=>img.currentSrc);
  const response=await page.request.get(imageUrl,{headers:{Accept:"image/webp"}});
  assert.equal(response.status(),200);
  const bytes=(await response.body()).length;
  services.push({slug,width,case:await photo.getAttribute("href"),bytes,format:response.headers()["content-type"]});
  if(slug==="presenca-profissional")await page.locator("[data-sales-page]>section").first().screenshot({path:path.join(output,"service-"+width+".jpg"),type:"jpeg",quality:75});
  console.log("PASS service",slug,width,bytes,"bytes");
  await page.close();
 }
}finally{await browser.close();}
await writeFile(path.join(output,"inventory.json"),JSON.stringify({sourceFiles:sourceFiles.length,localMediaReferences:refs.size,missing,services},null,2));
console.log(JSON.stringify({sourceFiles:sourceFiles.length,localMediaReferences:refs.size,missing,serviceScenarios:services.length},null,2));
