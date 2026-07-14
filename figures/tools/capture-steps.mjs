import { chromium } from 'playwright-core';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT='/home/user/polarization-prototype/figures/shots/';
const browser=await chromium.launch({executablePath:EXE, headless:true, args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1500,height:1400},deviceScaleFactor:2});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto('file:///home/user/polarization-prototype/demo.html',{waitUntil:'load'});
// Day 1 plays automatically on load — wait for all comments
await page.waitForTimeout(9000);
// S1: the "vocal debate" thread (second child; posts are prepended)
const feed=await page.$('#feed');
const posts=await page.$$('#feed > .post');
await posts[posts.length-1].screenshot({path:OUT+'s1-day1-thread.png'});
// S2: Day 2 — note appears, slots open
await page.evaluate(async ()=>{ day=2; setDayChip(2); clearFeed(); await addNotePost(); });
await page.waitForTimeout(300);
const note=await page.$('#notepost');
await note.screenshot({path:OUT+'s2-note-appears.png'});
// S3: ARMY contributes + waiting gate
await page.evaluate(()=>{ fillSlot('#slotA', NOTE.a); });
await page.waitForTimeout(300);
await note.screenshot({path:OUT+'s3-contribute-waiting.png'});
// S4: rival completes -> co-published + co-shared
await page.evaluate(async ()=>{ fillSlot('#slotB', NOTE.b); await publishNote(document.querySelector('#notepost')); });
await page.waitForTimeout(400);
await note.screenshot({path:OUT+'s4-copublished.png'});
// S5: warm cross-fandom replies (comments region only)
await page.evaluate(async ()=>{ await addComments(document.querySelector('#notepost'), NOTE.after, {cross:true}); });
await page.waitForTimeout(400);
const cm=await page.$('#notepost .comments');
await cm.screenshot({path:OUT+'s5-warm-replies.png'});
// S6: Day 3 — feature removed, carry-over
await page.evaluate(async ()=>{ await playDay(3); });
await page.waitForTimeout(4500);
const p3=await page.$('#feed > .post');
await p3.screenshot({path:OUT+'s6-day3.png'});
await browser.close();
console.log('captured 6 shots. ERRORS:', errors.length?errors:'none');
