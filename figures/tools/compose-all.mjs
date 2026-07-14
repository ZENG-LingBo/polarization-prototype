// Renders BOTH variants of all three figures:
//   -detailed : fuller text annotations (advisor review / appendix)
//   -diagram  : icon-driven, minimal text (paper / slides)
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const DIR='/home/user/polarization-prototype/figures/';
const browser=await chromium.launch({executablePath:EXE, headless:true, args:['--no-sandbox']});
async function renderHTML(file,out,w,h){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
  await page.goto('file://'+DIR+file,{waitUntil:'networkidle'}); await page.waitForTimeout(350);
  await (await page.$('#fig')).screenshot({path:DIR+out+'.png'});
  await page.pdf({path:DIR+out+'.pdf',width:(w/96)+'in',height:(h/96)+'in',printBackground:true,pageRanges:'1'});
  await page.close(); console.log('rendered',out);
}
async function renderSVG(file,out,w,h){
  const svg=readFileSync(DIR+file,'utf8');
  const tmp=DIR+'.tmp-'+out+'.html';
  writeFileSync(tmp,`<!DOCTYPE html><html><head><style>*{margin:0}body{background:#fff}svg{display:block;width:${w}px;height:${h}px}</style></head><body>${svg}</body></html>`);
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
  await page.goto('file://'+tmp,{waitUntil:'load'}); await page.waitForTimeout(300);
  await page.screenshot({path:DIR+out+'.png'});
  await page.pdf({path:DIR+out+'.pdf',width:(w/96)+'in',height:(h/96)+'in',printBackground:true,pageRanges:'1'});
  await page.close(); console.log('rendered',out);
}
await renderHTML('fig1-compose-detailed.html','fig1-interaction-detailed',1560,1150);
await renderHTML('fig1-compose-diagram.html','fig1-interaction-diagram',1560,1150);
await renderSVG('fig2-mechanism-detailed.svg','fig2-mechanism-detailed',1680,1020);
await renderHTML('fig2-compose-diagram.html','fig2-mechanism-diagram',1560,940);
await renderSVG('fig3-protocol-detailed.svg','fig3-protocol-detailed',1400,1120);
await renderSVG('fig3-protocol-diagram.svg','fig3-protocol-diagram',1560,950);
await browser.close();
