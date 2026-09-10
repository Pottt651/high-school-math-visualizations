const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{launchBrowser,reportFailure}=require('./browser-runtime.cjs');
(async()=>{const browser=await launchBrowser(),page=await browser.newPage(),errors=[],network=[],shots=path.join(__dirname,'screenshots/2024-jd');fs.mkdirSync(shots,{recursive:true});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});await page.context().setOffline(true);
await page.goto(pathToFileURL(path.resolve(__dirname,'../papers/jiading-2024/index.html')).href);
const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
for(const [width,height] of [[1280,720],[1920,1080]]){await page.setViewportSize({width,height});for(const id of [9,11,12,16,19,20,21]){
 await page.evaluate(id=>Lesson.select(id),id);await settle();assert.ok(await page.locator('.figures svg').count());assert.equal(await page.locator('.katex-error').count(),0);
 for(const selector of await page.locator('.controls select').evaluateAll(es=>es.map(e=>'#'+e.id))){for(const value of await page.locator(selector+' option').evaluateAll(es=>es.map(e=>e.value))){await page.locator(selector).selectOption(value);await settle();assert.equal(await page.locator('.katex-error').count(),0);await page.screenshot({path:path.join(shots,`${width}-q${id}-${value}.png`)});}}
 for(const button of await page.locator('.controls button').all()){if(await button.isVisible()){await button.click();await settle();}}
 await page.locator('#keyButton').click();await settle();assert.ok(await page.locator('.proof-toggle').count()>=3);
 const overflow=await page.locator('.explain .math-block').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+3).map(e=>e.querySelector('annotation')?.textContent));assert.deepEqual(overflow,[],`q${id}: equation width`);
 await page.screenshot({path:path.join(shots,`${width}-q${id}-proof.png`)});await page.locator('#keyButton').click();await page.screenshot({path:path.join(shots,`${width}-q${id}.png`)});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width+2);
 const previous=await page.evaluate(()=>Lesson.getState());await page.locator('#themeButton').click();await settle();assert.deepEqual(await page.evaluate(()=>Lesson.getState()),previous);await page.locator('#themeButton').click();await page.locator('#resetButton').click();
}}
await page.evaluate(()=>Lesson.select(9));await page.locator('#jd24-9-critical').click();assert.equal((await page.evaluate(()=>Lesson.getState())).roots.length,3);
await page.evaluate(()=>Lesson.select(16));await page.locator('#jd24-16-right').click();assert.ok(Math.abs((await page.evaluate(()=>Lesson.getState())).dot)<1e-10);
await page.evaluate(()=>Lesson.select(21));await page.locator('#jd24-21-special').click();assert.equal((await page.evaluate(()=>Lesson.getState())).roots.length,3);
await page.setViewportSize({width:390,height:844});for(const id of [9,11,12,16,19,20,21]){await page.evaluate(id=>Lesson.select(id),id);await settle();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=392);}
assert.deepEqual(errors,[]);assert.deepEqual(network,[]);await browser.close();console.log('PASS JD2024 all seven modules, modes, preset controls, proof widths, theme state, desktop/mobile offline.');})().catch(reportFailure);
