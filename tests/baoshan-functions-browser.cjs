const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{launchBrowser,reportFailure}=require('./browser-runtime.cjs');
(async()=>{
 const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'screenshots/baoshan-functions');fs.mkdirSync(out,{recursive:true});
 const browser=await launchBrowser(),page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));await page.context().setOffline(true);
 await page.goto(pathToFileURL(path.join(root,'papers/baoshan-2026/index.html')).href);
 const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 const select=async id=>{await page.evaluate(id=>Lesson.select(id),id);await settle();};
 const shot=async name=>{await settle();await page.screenshot({path:path.join(out,name+'.png')});assert.equal(await page.locator('.katex-error').count(),0,`${name}: KaTeX error`);};
 if(!(await page.locator('body').getAttribute('class')||'').includes('side-layout'))await page.locator('#layoutButton').click();
 await select(16);await page.selectOption('#b16-part','geometric');await shot('q16-geometric-three');
 await page.selectOption('#b16-family','two');await shot('q16-geometric-two');
 await page.selectOption('#b16-part','arithmetic');await page.locator('#b16-d').fill('1.05');await page.locator('#b16-d').dispatchEvent('input');await page.locator('#b16-failure').click();
 assert.equal((await page.evaluate(()=>Lesson.getState())).count,21);await shot('q16-late-failure');
 await select(21);await shot('q21-part1');await page.selectOption('#b21-part','2');
 for(const t of ['0.01','0.5','0.99']){await page.locator('#b21-t-number').fill(t);await page.locator('#b21-t-number').press('Tab');assert.ok((await page.evaluate(()=>Lesson.getState())).F>0);await shot('q21-part2-'+t);}
 const before=await page.evaluate(()=>Lesson.getState());await page.locator('#b21-t-number').fill('1');await page.locator('#b21-t-number').press('Tab');assert.equal((await page.evaluate(()=>Lesson.getState())).t,before.t);
 await page.selectOption('#b21-part','3');
 for(const kind of ['tangent','upper','lower','tilt']){await page.selectOption('#b21-line',kind);await shot('q21-part3-'+kind);}
 await page.locator('#keyButton').click();await shot('q21-general-proof');
 for(const id of [11,12,17]){
  await select(id);
  if(id===11)await page.locator('#b11-translate').click();
  if(id===12)await page.locator('#b12-nearest').click();
  if(id===17){await page.selectOption('#b17-part','2');await page.locator('#keyButton').click();}
  await shot('cross-q'+id+'-key');
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('Baoshan function interactions, open endpoints, formula rendering and cross-review screenshots passed.');
})().catch(reportFailure);
