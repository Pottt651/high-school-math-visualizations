const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{launchBrowser,reportFailure}=require('./browser-runtime.cjs');
(async()=>{
 const browser=await launchBrowser(),page=await browser.newPage(),errors=[],network=[];
 const shots=path.resolve(__dirname,'screenshots/2025-yp-construction');fs.mkdirSync(shots,{recursive:true});
 await page.context().setOffline(true);
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 // Count direct SVG geometry, excluding labels/KaTeX and clip definitions.
 const primitives=()=>page.locator('.figures > svg').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').reduce((n,svg)=>n+[...svg.children].filter(e=>['path','polygon','polyline','line','ellipse','circle'].includes(e.tagName)).length,0));
 for(const width of[1280,1920]){
  await page.setViewportSize({width,height:width===1280?720:1080});
  await page.goto(pathToFileURL(path.resolve(__dirname,'../papers/yangpu-2025/index.html')).href);await settle();
  if(await page.locator('#layoutButton').getAttribute('aria-pressed')!=='true')await page.locator('#layoutButton').click();
  for(const id of[9,10,11,12,20,21]){
   await page.locator(`#questionNav [data-question="${id}"]`).click();await settle();
   const select=page.locator(`#yp25-${id}-part`),modes=await select.count()?await select.locator('option').evaluateAll(es=>es.map(e=>e.value)):['default'];
   for(const mode of modes){
    if(mode!=='default')await select.selectOption(mode);await settle();
    const stable=await page.evaluate(()=>Lesson.getState());await page.locator('#drawButton').click();await settle();
    const count=[];
    for(let step=0;step<3;step++){
     assert.equal((await page.evaluate(()=>Lesson.getConstruction())).step,step);
     count.push(await primitives());
     const layout=await page.evaluate(()=>{const host=document.querySelector('#module'),fig=host.querySelector('.figures').getBoundingClientRect(),text=host.querySelector('.lesson-text').getBoundingClientRect();return{display:getComputedStyle(host).display,height:fig.height,textRight:text.right,figLeft:fig.left,overflow:document.documentElement.scrollWidth>innerWidth+2};});
     assert.equal(layout.display,'grid',`q${id}/${mode}: construction must preserve desktop side layout`);
     assert.ok(layout.height>=350,`q${id}/${mode}: construction figure compressed to ${layout.height}px`);
     assert.ok(layout.figLeft>layout.textRight,`q${id}/${mode}: figure must remain right of lesson text`);
     assert.equal(layout.overflow,false);
     assert.equal(await page.locator('.katex-error').count(),0);
     await page.screenshot({path:path.join(shots,`${width}-q${id}-${mode}-${step}.png`)});
     if(step<2){await page.locator('#constructionNext').click();await settle();}
    }
    assert.ok(count[0]<count[1]&&count[1]<count[2],`q${id}/${mode}: geometry counts ${count}`);
    await page.locator('#constructionFull').click();await settle();
    assert.deepEqual(await page.evaluate(()=>Lesson.getState()),stable,`q${id}/${mode}: display steps changed math`);
   }
  }
 }
 for(const[id,mode]of[[12,'map'],[20,'fixed'],[21,'1']]){
  await page.evaluate(id=>Lesson.select(id),id);await page.locator(`#yp25-${id}-part`).selectOption(mode);
  await page.locator('#drawButton').click();await page.locator('#constructionNext').click();await page.locator('#constructionNext').click();
  if(id===12)await page.locator('#yp25-12-small').click();
  if(id===20)await page.locator('#yp25-20-part').selectOption('free');
  if(id===21)await page.locator('#yp25-21-part').selectOption('3');
  await settle();assert.equal((await page.evaluate(()=>Lesson.getConstruction())).step,0);
  if(id===21){await page.locator('#constructionNext').click();await page.locator('#constructionNext').click();await page.locator('#yp25-21-kind').selectOption('cube');await settle();assert.equal((await page.evaluate(()=>Lesson.getConstruction())).step,0);}
  await page.locator('#constructionFull').click();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);await browser.close();
 console.log('YP25 construction: all 6 shared-mount questions, every submode, real geometry progression, 720p/1080p side layout, mode/action/function resets and math persistence passed.');
})().catch(reportFailure);
