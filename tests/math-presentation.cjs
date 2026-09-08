const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
(async()=>{
  const dir=path.join(__dirname,'simple-shots');fs.mkdirSync(dir,{recursive:true});
  const standalone=path.join(dir,'standalone.html');fs.copyFileSync(path.resolve(__dirname,'../嘉定一模_互动讲题.html'),standalone);
  const browser=await launchBrowser();
  const context=await browser.newContext({viewport:{width:1366,height:768}});await context.setOffline(true);
  const page=await context.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith('data:')&&r.url().split('#')[0]!==pathToFileURL(standalone).href)external.push(r.url());});
  await page.goto(pathToFileURL(standalone).href);await page.evaluate(()=>document.fonts.ready);
  const cases=[[10],[11],[12],[16],[17],[17,'#q17-part','2'],[18],[20],[21],[21,'#q21-function','line'],[21,'#q21-function','quad'],[21,'#q21-function','log']];
  const results=[];
  for(let i=0;i<cases.length;i++){
    const [id,selector,value]=cases[i];await page.locator(`[data-question="${id}"]`).click();if(selector)await page.selectOption(selector,value);
    if(id===20)await page.locator('#q20-circle').check();
    if(id===16){await page.locator('[data-q16-preset="2/3"]').click();await page.selectOption('#q16-r','3');await page.locator('#q16-next').click();}
    await page.locator('#keyButton').click();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100);
    assert.equal(await page.locator('#module .answer').count(),1);assert.ok(await page.locator('#module .answer').isVisible());
    assert.ok((await page.locator('#lessonGuide').innerText()).length>35);assert.equal(await page.locator('.katex-error').count(),0);
    const info=await page.evaluate(()=>({answer:document.querySelector('#module .answer').innerText,formulaCount:document.querySelectorAll('#module .katex').length,width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,fonts:document.fonts.check('18px KaTeX_Main'),fractionCount:document.querySelectorAll('#module .mfrac').length,wideFormulas:[...document.querySelectorAll('.explain .math-block')].filter(e=>e.scrollWidth>e.clientWidth+2).length,figureHeight:document.querySelector('#module .figures').clientHeight}));
    assert.ok(info.formulaCount>2);assert.equal(info.fonts,true);assert.ok(info.width<=1366);assert.ok(info.height<=768,`overflow q${id}: ${info.height}`);
    await page.screenshot({path:path.join(dir,`math-q${id}${value?'-'+value:''}.png`),fullPage:true});results.push({id,value,...info});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log(JSON.stringify({errors,external,results},null,2));await browser.close();
})().catch(reportFailure);
