const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
const root=path.resolve(__dirname,'..');
const shots=path.join(root,'tests/screenshots/baoshan');
const ids=[11,12,15,16,17,19,20,21];
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,`${msg}: ${a} != ${b}`);
(async()=>{
  fs.mkdirSync(shots,{recursive:true});
  const isolated=path.join(root,'.tmp/baoshan-standalone');fs.mkdirSync(isolated,{recursive:true});
  fs.copyFileSync(path.join(root,'宝山一模_互动讲题.html'),path.join(isolated,'only.html'));
  const browser=await launchBrowser(),context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.setOffline(true);
  const page=await context.newPage(),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
  await page.goto(pathToFileURL(path.join(isolated,'only.html')).href);
  const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  const state=()=>page.evaluate(()=>Lesson.getState());
  const select=async id=>{await page.evaluate(id=>Lesson.select(id),id);await settle();};
  assert.deepEqual(await page.evaluate(()=>Lesson.questions),ids);
  assert.equal(await page.evaluate(()=>PaperMeta.id),'baoshan-2026');
  assert.equal(await page.locator('#layoutButton').getAttribute('aria-pressed'),'true','first-open Baoshan layout should give diagrams the right-hand column');
  const inspect=async label=>{
    await settle();
    assert.equal(await page.locator('.katex-error').count(),0,`${label}: invalid mathematics markup`);
    const size=await page.evaluate(()=>({vw:innerWidth,sw:document.documentElement.scrollWidth}));
    assert.ok(size.sw<=size.vw+2,`${label}: page horizontal overflow ${JSON.stringify(size)}`);
    assert.ok(await page.locator('.figures svg').count()>0,`${label}: missing diagram`);
    assert.ok(await page.locator('.answer').count()>0,`${label}: missing answer`);
    assert.ok(await page.locator('.proof-step').count()>=2,`${label}: missing derivation`);
  };
  for(const width of [1280,1920]){
    await page.setViewportSize({width,height:width===1280?720:1080});
    for(const side of [false,true]){
      if((await page.locator('#layoutButton').getAttribute('aria-pressed')==='true')!==side)await page.locator('#layoutButton').click();
      for(const id of ids){
        await select(id);await inspect(`${width} q${id} ${side?'side':'vertical'}`);
        const initial=await state();
        await page.locator('#themeButton').click();await settle();
        assert.deepEqual(await state(),initial,`q${id}: theme changes math state`);
        await page.locator('#themeButton').click();
        await page.screenshot({path:path.join(shots,`${width}-q${id}-${side?'side':'vertical'}.png`)});
        await page.locator('#keyButton').click();await inspect(`${width} q${id} proof`);
        assert.ok(await page.locator('.proof-toggle').count()>=2);
        // Every mode selector is exercised from the actual visible control.
        for(const selector of await page.locator('.controls select').evaluateAll(es=>es.map(e=>'#'+e.id))){
          if(!await page.locator(selector).isVisible())continue;
          const values=await page.locator(selector).locator('option').evaluateAll(es=>es.map(e=>e.value));
          for(const v of values){await page.locator(selector).selectOption(v);await inspect(`q${id} ${selector}=${v}`);}
        }
        await page.locator('#resetButton').click();
      }
    }
  }
  // Continuous time control: exact endpoints versus the open interval.
  await select(19);
  for(const t of [0,3.999,4,4.001,6,7.999,8,8.001,12]){
    await page.locator('#b19-time').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('input',{bubbles:true}));},t);
    const s=await state(),actual=Number(await page.locator('#b19-time').inputValue());
    near(s.t,actual,'time control');near(s.height,40-30*Math.cos(Math.PI*s.t/6),'height');
    assert.equal(s.above,s.t>4&&s.t<8,'strict height inequality');
  }
  await page.locator('#resetButton').click();await page.locator('#b19-play').click();
  await page.waitForFunction(()=>Lesson.getState().t>.12);await page.locator('#b19-play').click();
  assert.equal((await state()).playing,false,'pause');
  // Each construction really changes the visible drawing and restores parameters.
  for(const id of ids){
    await select(id);const original=await state();
    if(!await page.locator('#drawButton').isVisible())continue;
    await page.locator('#drawButton').click();await settle();
    const first=await page.locator('.figures').innerHTML();
    const count=await page.evaluate(()=>Lesson.getConstruction().steps.length);
    for(let n=1;n<count;n++){await page.locator('#constructionNext').click();await settle();}
    assert.notEqual(await page.locator('.figures').innerHTML(),first,`q${id}: no construction changes`);
    await page.locator('#constructionFull').click();await settle();
    assert.deepEqual(await state(),original,`q${id}: construction changes math state`);
  }
  await page.setViewportSize({width:390,height:844});
  for(const id of ids){await select(id);await inspect(`mobile q${id}`);}
  assert.deepEqual(errors,[],'browser errors');assert.deepEqual(remote,[],'runtime network requests');
  await browser.close();
  console.log('PASS: Baoshan single-file offline, all 8 questions, both projector sizes/layouts, all modes, formulas, answers, proof controls, construction, time playback/endpoints, mobile, no console/network errors.');
})().catch(reportFailure);
