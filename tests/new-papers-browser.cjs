const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
const root=path.resolve(__dirname,'..');
const expected={'huangpu-2025':[10,14,16,17,20,21],'xuhui-2025':[9,11,12,16,18,20,21]};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
(async()=>{
  const browser=await launchBrowser(),context=await browser.newContext({viewport:{width:1366,height:768}});
  await context.setOffline(true);const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  const settle=()=>page.evaluate(async()=>{await document.fonts.ready;for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);});
  const state=()=>page.evaluate(()=>Lesson.getState());
  const choose=async n=>{await page.evaluate(n=>Lesson.select(n),n);await settle();};
  const input=async(id,value)=>{await page.locator(id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':el.type==='range'?'input':'change',{bubbles:true}));},value);await settle();};
  const geo=()=>page.locator('.figures').evaluate(el=>[...el.querySelectorAll('svg[role="img"]')].filter(s=>s.getBoundingClientRect().width>0).map(s=>[...s.querySelectorAll('line,path,polyline,polygon,circle,ellipse')].filter(n=>!n.closest('foreignObject')&&!n.classList.contains('label-leader')).map(n=>[n.tagName,...['x1','y1','x2','y2','d','points','cx','cy','rx','ry','r','stroke','fill'].map(a=>n.getAttribute(a))])));
  const math=s=>Object.fromEntries(Object.entries(s).filter(([k])=>k!=='space'&&k!=='revealed'));
  let count=0;
  for(const [id,ids] of Object.entries(expected)){
    await page.goto(pathToFileURL(path.join(root,'papers',id,'index.html')).href);await settle();
    assert.deepEqual(await page.evaluate(()=>Lesson.questions),ids);
    assert.equal(await page.evaluate(()=>PaperMeta.id),id);
    for(const n of ids){
      await choose(n);const baseline=math(await state());
      assert.ok((await page.locator('.answer').innerText()).length>4,`${id} ${n}: answer missing`);
      assert.ok((await page.locator('#lessonGuide').innerText()).length>25);
      await page.locator('#keyButton').click();await settle();assert.ok(await page.locator('.explain').isVisible());
      const explain=await page.locator('.explain').innerText();assert.ok(explain.length>20,`${id} ${n}: reasoning missing`);
      await page.locator('#drawButton').click();await settle();assert.equal(await page.locator('.answer').isVisible(),false);
      const stages=await page.evaluate(()=>Lesson.getConstruction().steps.length);assert.ok(stages>=3);
      const pictures=new Set();
      for(let i=0;i<stages;i++){
        assert.equal(await page.evaluate(()=>Lesson.getConstruction().step),i);
        assert.deepEqual(math(await state()),baseline,`${id} ${n} construction altered the mathematics`);
        pictures.add(JSON.stringify(await geo()));
        assert.ok((await page.locator('#constructionBody').innerText()).length>15);
        if(i<stages-1){await page.locator('#constructionNext').click();await settle();}
        count++;
      }
      assert.ok(pictures.size>=3,`${id} ${n}: steps must change actual drawing objects`);
      await page.locator('#constructionPrev').click();await settle();assert.equal(await page.evaluate(()=>Lesson.getConstruction().step),stages-2);
      await page.keyboard.press('r');await settle();assert.equal(await page.evaluate(()=>Lesson.getConstruction().step),0);
      await page.locator('#constructionFull').click();await settle();assert.equal(await page.evaluate(()=>Lesson.getConstruction().step),null);
      assert.equal(await page.locator('#keyButton').getAttribute('aria-pressed'),'true');
      const before=math(await state());await page.locator('#themeButton').click();await settle();assert.deepEqual(math(await state()),before);
      const size=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(size.scroll<=size.w+1,`${id} ${n} desktop overflow`);
      await page.locator('#keyButton').click();await page.locator('#resetButton').click();await settle();
    }
    if(id==='huangpu-2025'){
      await choose(10);await page.locator('#q10-minimum').click();await settle();near((await state()).distance??(await state()).model?.distance,Math.SQRT2/2);
      await choose(14);for(const a of ['45','60','90']){await page.locator('#q14-family').selectOption(a);await settle();near((await state()).pair.angle,+a);assert.equal(new Set((await state()).pair.ids).size,4);}
      await choose(16);await page.locator('#q16-kind').selectOption('expand');await page.locator('#q16-next').click();await settle();
      await page.locator('#q16-fixed').click();await settle();assert.match(await page.locator('#q16-readout').innerText(),/不动点|不符合|互异/);
      await choose(17);await page.locator('#drawButton').click();await page.locator('#constructionNext').click();await page.locator('#q17-part').selectOption('2');await settle();assert.equal(await page.evaluate(()=>Lesson.getConstruction().step),0);near((await state()).angle,Math.atan(1/Math.sqrt(5)));
      await choose(20);await page.locator('#q20-target').click();await settle();assert.equal((await state()).possible,true);near((await state()).AB,(await state()).AF2);
      for(const button of ['#q20-left','#q20-right']){await page.locator(button).click();await page.locator('#q20-target').click();await settle();assert.equal((await state()).valid,false);assert.equal(await page.locator('#q20-readout .warning').isVisible(),true);}
      await choose(21);await page.locator('#q21-kind').selectOption('cubic');await input('#q21-m',1.000001);assert.equal((await state()).valid,true);assert.match(await page.locator('#q21-position').textContent(),/δ/);
      await page.locator('#q21-kind').selectOption('log');await input('#q21-a',1/Math.E-1e-14);assert.equal((await state()).valid,true);assert.match(await page.locator('#q21-position').textContent(),/分辨/);
    }else{
      await choose(9);await page.locator('#q9-critical').click();await settle();assert.equal((await state()).extrema,0);assert.equal((await state()).critical,true);
      await choose(11);const initial=await state();const r=await page.locator('#q11-turn').boundingBox();await page.mouse.click(r.x+r.width*.82,r.y+r.height/2);await settle();const changed=await state();assert.notEqual(changed.turn,initial.turn);near(changed.l1+changed.l2,5*Math.sqrt(17));near(changed.l1/changed.l2,2/3);
      await choose(12);assert.equal((await state()).valid,true);assert.equal((await state()).selected.length,2);await page.locator('[data-q12-perm="4"]').uncheck();await settle();assert.equal((await state()).valid,false);assert.ok((await state()).missing.length>0);
      await page.locator('#q12-example').click();await page.locator('#q12-swap').click();await settle();assert.equal((await state()).valid,true);
      const tex=await page.locator('#statement annotation').allTextContents();assert.ok(tex.some(t=>t.includes('\\to')),'The function map arrow must remain valid TeX');
      await choose(16);await page.locator('#q16-kind').selectOption('geometric');await settle();const f=(await state()).F;assert.ok(Math.abs(f)>1e-5);await page.locator('#q16-swap').click();await settle();near((await state()).F,-f);
      await choose(18);await page.locator('#drawButton').click();await page.locator('#constructionNext').click();await page.locator('#q18-part').selectOption('2');await settle();assert.equal(await page.evaluate(()=>Lesson.getConstruction().step),0);near((await state()).sine,1/3);assert.equal(await page.locator('#q18-height-label').isVisible(),false);
      await choose(20);await page.locator('#x20-normal').check();await settle();assert.equal(await page.locator('#x20-unit').isVisible(),true);
      for(const a of [31,60,65,90,120,149]){await input('#x20-angle',a);const s=await state();near(s.theta,Math.PI/3);assert.equal(s.valid,a!==90);}
      await page.locator('#x20-mode').selectOption('angles');await settle();assert.equal(await page.locator('#x20-unit').isVisible(),true);assert.match(await page.locator('#x20-unit').textContent(),/线端不是/);
      await choose(21);await page.locator('#x21-boundary').click();await settle();assert.equal((await state()).product,0);assert.equal((await state()).universal,true);
      for(const [w,phi] of [[1.2,0],[1,.35],[.4,1],[.6,1.9]]){await input('#x21-w',w);await input('#x21-phi',phi);await page.locator('#x21-witness').click();await settle();assert.ok((await state()).product<0);assert.equal((await state()).isT,false);}
      await page.locator('#x21-mode').selectOption('cosine');await page.locator('[data-x="0.5"]').click();await settle();assert.equal((await state()).product,0);await page.locator('[data-x="0.75"]').click();await settle();assert.equal((await state()).isT,false);
    }
    await page.setViewportSize({width:390,height:844});
    for(const n of ids){await choose(n);const width=await page.evaluate(()=>document.documentElement.scrollWidth);assert.ok(width<=391,`${id} ${n} mobile overflow: ${width}`);}
    await page.setViewportSize({width:1366,height:768});
    await page.locator('a.brand').click();await settle();assert.equal(await page.title(),'高中数学题可视化');
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log(`PASS: 13 new lessons, ${count} drawing stages, offline answers/proofs, state restoration, critical parameters, actual range interaction, mobile layouts and return links.`);
  await browser.close();
})().catch(reportFailure);
