const {launchBrowser,reportFailure}=require('./browser-runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} vs ${b}`);
(async()=>{
  fs.mkdirSync(path.join(__dirname,'simple-shots'),{recursive:true});
  const browser=await launchBrowser();
  const context=await browser.newContext({viewport:{width:1366,height:768}});await context.setOffline(true);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../嘉定一模_互动讲题.html')).href);
  const state=()=>page.evaluate(()=>Lesson.getState());
  const select=id=>page.locator(`[data-question="${id}"]`).click();
  const input=async(id,value,event='input')=>page.locator(id).evaluate((el,{value,event})=>{el.value=value;el.dispatchEvent(new Event(event,{bubbles:true}));},{value,event});
  const drag=async(locator,dx,dy)=>{const b=await locator.boundingBox();assert.ok(b);await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+dx,b.y+b.height/2+dy,{steps:24});await page.mouse.up();};
  await select(16);await page.locator('#q16-next').click();near((await state()).values[1],3/8);
  await page.selectOption('#q16-r','3');await page.locator('[data-q16-preset="2/3"]').click();await input('#q16-count',30);
  assert.ok((await state()).values.every(x=>x===2/3));
  await page.locator('[data-q16-preset="1/3"]').click();await page.locator('#q16-next').click();near((await state()).values[1],2/3);
  await page.selectOption('#q16-r','-3');await page.locator('[data-q16-preset="1/2"]').click();await input('#q16-count',3);
  assert.deepEqual((await state()).values,[.5,-.75,63/16]);
  await input('#q16-count',30);assert.equal((await state()).overflow,true);
  assert.match(await page.locator('#q16-readout').innerText(),/超出浮点数范围/);
  await input('#q16-initial','0','change');assert.match(await page.locator('#q16-readout').innerText(),/初值须/);
  await page.locator('#resetButton').click();assert.equal((await state()).n,1);assert.equal((await state()).r,2);
  await drag(page.locator('#q16-web circle[fill="#b42318"]').first(),35,0);assert.notEqual((await state()).initial,.25);
  await select(20);const theta=(await state()).theta;
  await drag(page.locator('#q20-ellipse circle[fill="#2471a3"]').first(),30,45);
  assert.notEqual((await state()).theta,theta);near((await state()).area,Math.sqrt(5));
  await page.locator('#q20-circle').check();assert.equal(await page.locator('#q20-unit').isVisible(),true);
  await page.locator('#keyButton').click();await page.waitForTimeout(50);
  await page.screenshot({path:path.join(__dirname,'simple-shots/q20-circle-proof.png'),fullPage:true});
  await page.locator('#q20-lock').uncheck();const oldArea=(await state()).area;
  await drag(page.locator('#q20-ellipse circle[fill="#a27416"]').first(),32,21);
  assert.ok(Math.abs((await state()).area-oldArea)>1e-4);assert.equal((await state()).locked,false);
  await input('#q20-position',0);assert.equal((await state()).valid,false);near((await state()).area,0);
  await page.locator('#q20-lock').check();
  for(const angle of [0,90,180]){await input('#q20-angle',angle);assert.equal((await state()).valid,false);assert.match(await page.locator('#q20-readout').innerText(),/斜率未定义/);}
  await page.locator('#resetButton').click();near((await state()).area,Math.sqrt(5));assert.equal((await state()).valid,true);assert.equal((await state()).circle,false);
  await select(21);await input('#q21-number',Math.PI/2+2*Math.PI,'change');assert.equal((await state()).sinK,1);assert.equal((await state()).atOpt,true);
  await input('#q21-number',Math.PI/2+1e-10,'change');assert.equal((await state()).atOpt,false);
  await page.selectOption('#q21-function','log');await input('#q21-a','-5e-324','change');assert.equal((await state()).a,-.5);
  for(const a of [-.000001,0,1]){await input('#q21-a',a,'change');assert.equal((await state()).a,a);assert.equal(await page.locator('#q21-opt').isDisabled(),a>=0);}
  await input('#q21-a',-.000001,'change');await page.locator('#q21-opt').click();near((await state()).x0,Math.sqrt(500000));assert.equal((await state()).atOpt,true);
  for(const [width,height] of [[1366,768],[1920,1080]]){
    await page.setViewportSize({width,height});
    for(const id of [10,11,12,16,17,18,20,21]){
      await select(id);if(id===17)await page.selectOption('#q17-part','2');if(id===20)await page.locator('#q20-circle').check();
      for(const key of [false,true]){
        if(key)await page.locator('#keyButton').click();await page.waitForTimeout(45);
        const layout=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,bad:[...document.querySelectorAll('#module svg')].some(s=>/\bNaN\b|\bInfinity\b/.test(s.innerHTML))}));
        assert.ok(layout.w<=width+1,`q${id} horizontal overflow at ${width}, key=${key}`);
        assert.ok(layout.h<=height+1,`q${id} vertical overflow at ${width}, key=${key}: ${layout.h}`);assert.equal(layout.bad,false);
      }
    }
  }
  await page.locator('#fullscreenButton').click();
  await page.waitForFunction(()=>!!document.fullscreenElement&&document.getElementById('fullscreenButton').textContent==='退出全屏');
  await page.locator('#fullscreenButton').click();
  await page.waitForFunction(()=>!document.fullscreenElement&&document.getElementById('fullscreenButton').textContent==='全屏');
  assert.deepEqual(errors,[]);console.log('PASS: exact recurrence presets, overflow handling, real point dragging, q20 invalid slopes/unlock/reset, q21 periodic maxima/limits, all 8 layouts at 1366×768 and 1920×1080, fullscreen.');
  await browser.close();
})().catch(reportFailure);

