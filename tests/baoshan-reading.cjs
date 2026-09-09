const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
(async()=>{
 const browser=await launchBrowser(),page=await browser.newPage({viewport:{width:1280,height:720}}),issues=[];
 await page.goto(pathToFileURL(path.resolve(__dirname,'../宝山一模_互动讲题.html')).href);
 const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 if(await page.locator('#layoutButton').getAttribute('aria-pressed')!=='true')await page.locator('#layoutButton').click();
 for(const id of [11,12,15,16,17,19,20,21]){
  await page.evaluate(id=>Lesson.select(id),id);await page.locator('#keyButton').click();
  const selector=({16:'#b16-part',17:'#b17-part',20:'#b20-mode',21:'#b21-part'})[id];
  const modes=selector?await page.locator(selector+' option').evaluateAll(es=>es.map(e=>e.value)):['default'];
  for(const mode of modes){
   if(selector)await page.locator(selector).selectOption(mode);await settle();
   const bad=await page.locator('.explain .math-block').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({width:e.clientWidth,content:e.scrollWidth,tex:e.querySelector('annotation')?.textContent})));
   if(bad.length)issues.push({id,mode,bad});
   if(id===20||id===21){
    await page.locator('.explain').evaluate(el=>el.scrollIntoView({block:'start'}));await settle();
    const directory=path.resolve(__dirname,'screenshots/baoshan-reading');fs.mkdirSync(directory,{recursive:true});
    await page.screenshot({path:path.join(directory,`q${id}-${mode}-proof.png`)});
   }
  }
 }
 console.log(JSON.stringify(issues,null,2));await browser.close();
 if(issues.length)process.exitCode=1;else console.log('PASS: all Baoshan derivation display equations fit the 1280px side reading column.');
})().catch(reportFailure);
