const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{launchBrowser,reportFailure}=require('./browser-runtime.cjs');
(async()=>{
 const browser=await launchBrowser(),page=await browser.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 await page.context().setOffline(true);
 const shots=path.resolve(__dirname,'simple-shots/q11-cost');fs.mkdirSync(shots,{recursive:true});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../papers/jiading-2025/index.html')).href+'#q11');
 const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 for(const [width,height] of [[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});
  for(const side of [false,true]){
   await page.locator('[data-question="11"]').click();await settle();
   if((await page.locator('body').evaluate(e=>e.classList.contains('side-layout')))!==side)await page.locator('#layoutButton').click();
   await settle();assert.equal(await page.locator('.q11-cost-model').isVisible(),true);
   assert.equal(await page.locator('#q11-proof').isVisible(),false);
   assert.match(await page.locator('.q11-cost-model').textContent(),/16.*5.*cot/);
   await page.screenshot({path:path.join(shots,`${width}-${side?'side':'normal'}.png`)});
   await page.locator('[data-q11-explain]').click();await settle();
   assert.equal(await page.locator('#q11-proof').isVisible(),true);
   assert.equal(await page.locator('#q11-proof .proof-step').count(),5);
   const proof=await page.locator('#q11-proof').textContent();
   assert.match(proof,/AD=BE=4/);assert.match(proof,/0\.4/);assert.match(proof,/2\.5/);assert.match(proof,/弧度/);
   for(const deg of [20,25,30]){
    await page.locator('#q11-degrees').fill(String(deg));await page.locator('#q11-degrees').press('Tab');await settle();
    const state=await page.evaluate(()=>Lesson.getState());
    assert.ok(Math.abs(state.theta-deg*Math.PI/180)<1e-12);
    const straightLength=8/Math.tan(state.theta),arcLength=8*state.theta;
    assert.ok(Math.abs(state.total-(.4*straightLength+2.5*arcLength))<1e-12);
    const source=await page.locator('#q11-worked annotation').allTextContents();
    assert.ok(source.some(s=>s.includes(state.total.toFixed(4))));
    assert.match(await page.locator('.q11-current-cost').textContent(),/rad/);
   }
   await page.locator('#q11-best').click();await settle();
   const best=await page.evaluate(()=>Lesson.getState());assert.ok(Math.abs(best.theta-Math.asin(.4))<1e-12);assert.ok(Math.abs(best.total-(8*Math.sqrt(21)/5+20*Math.asin(.4)))<1e-12);
   await page.screenshot({path:path.join(shots,`${width}-${side?'side':'normal'}-proof.png`)});
   const bounds=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}));
   assert.ok(bounds.w<=width+1&&bounds.h<=height+1,JSON.stringify(bounds));
  }
 }
 await page.setViewportSize({width:390,height:844});await settle();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=391);
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);await browser.close();console.log('PASS: visible Q11 model, complete cost derivation, degree conversion, live unrounded calculations, minimum and responsive/offline layouts.');
})().catch(reportFailure);
