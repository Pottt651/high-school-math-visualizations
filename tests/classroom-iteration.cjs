const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
(async()=>{
 const browser=await launchBrowser(),page=await browser.newPage(),errors=[],network=[];
 const shots=path.resolve(__dirname,'simple-shots/iteration');fs.mkdirSync(shots,{recursive:true});
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 await page.context().setOffline(true);await page.goto(pathToFileURL(path.resolve(__dirname,'../papers/jiading-2025/index.html')).href);
 const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 const select=async id=>{await page.locator(`[data-question="${id}"]`).click();await settle();};
 const snapshot=async name=>page.screenshot({path:path.join(shots,name+'.png')});
 const number=async value=>{await page.locator('#q18-number').fill(String(value));await page.locator('#q18-number').press('Tab');await settle();};
 await page.locator('#layoutButton').click();
 for(const [width,height] of [[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});await select(18);
  for(const k of [1,2,4,12,100]){
   await number(k);const result=await page.evaluate(()=>{
    const a=document.querySelector('#q18-function').getBoundingClientRect(),b=document.querySelector('.phase-view').getBoundingClientRect();
    const state=Lesson.getState();const inside=[...document.querySelectorAll('[data-phase-extremum][data-inside="true"]')].map(n=>+n.dataset.phaseExtremum);
    return {state,inside,vertical:a.bottom<=b.top+1,functionWidth:a.width,functionHeight:a.height,bodyWidth:document.documentElement.scrollWidth,bodyHeight:document.documentElement.scrollHeight};
   });
   assert.ok(result.vertical&&result.functionWidth>width*.6);
   assert.ok(result.bodyWidth<=width+1&&result.bodyHeight<=height+1);
   const expected=[];for(let n=0;n<200;n++)if(n>result.state.leftPhase+1e-9&&n<result.state.rightPhase-1e-9)expected.push(n);
   assert.deepEqual(result.inside,expected);
   if(k===1){assert.equal(await page.locator('[data-phase-extremum="2"][data-inside="false"]').count(),1);}
   await snapshot(`q18-${width}-k${k}`);
  }
  await page.selectOption('#q18-mode','free');
  for(const omega of [.1,6,6.75,18,80]){await number(omega);await snapshot(`q18-${width}-free${omega}`);if(omega===6.75){assert.match(await page.locator('#q18-phase').textContent(),/端点/);assert.equal(await page.locator('#q18-function [data-excluded-extremum="3"]').getAttribute('fill'),'var(--canvas)');}}
  for(const id of [10,11,12,16,17,20,21]){
   await select(id);if(id===20)await page.locator('#q20-circle').check();
   await page.locator('#keyButton').click();await settle();await snapshot(`q${id}-${width}`);
   const controls=await page.locator('#module > .controls').boundingBox(),figure=await page.locator('.figures').boundingBox();
   assert.ok(figure.y-controls.y-controls.height<=18,`Q${id}: unexplained gap before figure`);
  }
 }
 // Display choices survive a refresh; reading controls survive redraws and subquestions.
 await page.locator('#navigationButton').click();await page.reload();await settle();
 assert.equal(await page.locator('.lesson-text').count(),1);assert.equal(await page.locator('.top').isVisible(),false);
 await page.locator('#navigationButton').click();await select(17);
 await page.locator('#statementButton').click();assert.equal(await page.locator('#statement').isVisible(),false);
 await page.locator('#guideButton').click();assert.equal(await page.locator('#lessonGuide').isVisible(),false);
 await page.locator('#layoutButton').click();await settle();assert.equal(await page.locator('#statement').isVisible(),true);assert.equal(await page.locator('#lessonGuide').isVisible(),true);await page.locator('#layoutButton').click();await settle();
 await page.locator('#answerButton').click();await page.selectOption('#q17-part','2');await settle();assert.equal(await page.locator('.answer').isVisible(),false);
 await page.locator('#answerButton').click();assert.equal(await page.locator('.answer').isVisible(),true);
 await page.locator('#keyButton').click();const proof=page.locator('.proof-toggle').first();assert.equal(await proof.isVisible(),true);await proof.click();assert.equal(await proof.getAttribute('aria-expanded'),'false');
 await select(21);await page.locator('#keyButton').click();await page.locator('.proof-toggle').first().click();
 await page.locator('#q21-opt').click();await settle();assert.equal(await page.locator('.proof-toggle').first().getAttribute('aria-expanded'),'false');
 await page.selectOption('#q21-function','log');await settle();assert.ok(await page.locator('.proof-toggle').count()>0);
 await page.setViewportSize({width:390,height:844});await select(18);await settle();await snapshot('q18-mobile');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=391);
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);await browser.close();console.log('PASS: stacked phase view, exterior/interior extrema, high-frequency and continuous boundaries, display persistence, reading controls and proof redraws.');
})().catch(reportFailure);
