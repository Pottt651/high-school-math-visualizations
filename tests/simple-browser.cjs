const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
  const browser=await launchBrowser();
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});await context.setOffline(true);
  const page=await context.newPage(),errors=[],network=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  const out=path.join(__dirname,'simple-shots');fs.mkdirSync(out,{recursive:true});
  await page.goto(pathToFileURL(path.resolve(__dirname,'../嘉定一模_互动讲题.html')).href);
  const results=[];
  for(const id of [10,11,12,16,17,18,20,21]){
    await page.locator(`[data-question="${id}"]`).click();await page.waitForTimeout(100);
    assert.equal((await page.evaluate(()=>Lesson.getState())).question,id);
    await page.screenshot({path:path.join(out,`q${id}-default.png`),fullPage:true});
    const ranges=page.locator('#module input[type=range]');
    for(let i=0;i<await ranges.count();i++){
      const item=ranges.nth(i);if(!await item.isVisible()||await item.isDisabled())continue;
      await item.evaluate(el=>{el.value=(Number(el.min)+Number(el.max))/2;el.dispatchEvent(new Event('input',{bubbles:true}));});
    }
    await page.locator('#keyButton').click();await page.waitForTimeout(60);
    await page.screenshot({path:path.join(out,`q${id}-key.png`),fullPage:true});
    const invalidSvg=await page.locator('#module svg').evaluateAll(els=>els.some(e=>/\bNaN\b|\bInfinity\b/.test(e.innerHTML)));assert.equal(invalidSvg,false,`Invalid SVG for q${id}`);
    results.push({id,state:await page.evaluate(()=>Lesson.getState()),layout:await page.evaluate(()=>({width:innerWidth,height:innerHeight,bodyW:document.documentElement.scrollWidth,bodyH:document.documentElement.scrollHeight,figureHeights:[...document.querySelectorAll('#module svg')].map(s=>s.getBoundingClientRect().height)}))});
    await page.locator('#resetButton').click();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  console.log(JSON.stringify({errors,network,results},null,2));
  await browser.close();
})().catch(reportFailure);
