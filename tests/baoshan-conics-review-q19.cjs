// Independent classroom review of Q19, implemented by another contributor.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{launchBrowser,reportFailure}=require('./browser-runtime.cjs');
(async()=>{
 const browser=await launchBrowser(),page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.context().setOffline(true);
 const shots=path.resolve(__dirname,'simple-shots/baoshan-conics/q19-independent');fs.mkdirSync(shots,{recursive:true});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../papers/baoshan-2026/index.html')).href+'#q19');
 const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 for(const [width,height] of [[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});
  for(const side of [false,true]){
   if((await page.locator('body').evaluate(e=>e.classList.contains('side-layout')))!==side)await page.locator('#layoutButton').click();
   await settle();
   for(const t of [0,4,6,8,12]){
    await page.locator('#b19-time').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(t));await settle();
    const g=await page.evaluate(()=>Lesson.getState());assert.equal(g.t,t);assert.ok(Math.abs(g.height-(40-30*Math.cos(Math.PI*t/6)))<1e-9);assert.equal(g.above,t>4&&t<8);
    if([4,8].includes(t))assert.match(await page.locator('#b19-readout').textContent(),/恰好 55 米（不计入）/);
    if(t===0||t===4||t===6)await page.screenshot({path:path.join(shots,`${width}-${side?'side':'normal'}-t${t}.png`)});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width+1);
   }
  }
 }
 await page.locator('#b19-play').click();await page.waitForTimeout(700);let g=await page.evaluate(()=>Lesson.getState());assert.ok(g.playing&&g.t>0&&g.t<2);
 await page.locator('#b19-play').click();const paused=await page.evaluate(()=>Lesson.getState());await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>Lesson.getState()),paused);
 await page.locator('[data-b19-time="6"]').click();assert.equal((await page.evaluate(()=>Lesson.getState())).t,6);
 await page.locator('#keyButton').click();await settle();assert.equal(await page.locator('.proof-step').count(),3);assert.equal(await page.locator('.katex-error').count(),0);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS independent Q19: source-matched heights, strict threshold endpoints, one-cycle playback and pause, classroom preset controls, offline responsive views.');
})().catch(reportFailure);
