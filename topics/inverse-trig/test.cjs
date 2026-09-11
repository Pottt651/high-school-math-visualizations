const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('../../tests/browser-runtime.cjs');
const target = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const content = fs.readFileSync(target, 'utf8');
for (const [, script] of content.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script);
assert.ok(!/<script\b[^>]*src\s*=|<link\b[^>]*rel=["']stylesheet/i.test(content));
const shots = path.resolve(__dirname, '../../.tmp/inverse-trig-shots');
fs.mkdirSync(shots, { recursive: true });
const close = (a,b) => Math.abs(a-b) < 1e-12;
(async () => {
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({ offline: true });
    const page = await context.newPage(), errors = [], external = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    const choose = view => page.locator(`[data-view="${view}"]`).click();
    const read = () => page.evaluate(() => InverseTrigLesson.getState());
    const layoutCheck = async label => {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const report = await page.evaluate(() => {
        const clipped = [];
        for (const svg of document.querySelectorAll('svg.plot')) {
          const area = svg.getBoundingClientRect(); if (!area.width || !area.height) continue;
          for (const text of svg.querySelectorAll('text')) {
            const box = text.getBoundingClientRect();
            if (box.x < area.x - 2 || box.right > area.right + 2 || box.y < area.y - 2 || box.bottom > area.bottom + 2) clipped.push(text.textContent);
          }
        }
        return { overflow: document.documentElement.scrollWidth > innerWidth + 1, clipped };
      });
      assert.equal(report.overflow, false, label+' page width');
      assert.deepEqual(report.clipped, [], label+' clipped SVG labels');
    };
    for (const viewport of [{ width:1280,height:720 }, { width:1920,height:1080 }, { width:390,height:844 }]) {
      await page.setViewportSize(viewport);
      await page.goto(pathToFileURL(target).href);
      assert.equal((await read()).view,'signTable');
      assert.equal(await page.locator('.sign-table tbody tr').count(),3);
      await layoutCheck(`signTable/${viewport.width}`);
      await page.locator('[data-view="reference"]').click();
      assert.equal((await read()).view,'reference');
      assert.equal((await read()).referenceData.answers.length,2);
      await layoutCheck(`reference/${viewport.width}`);
      if(viewport.width===1280)await page.screenshot({path:path.join(shots,'reference-sin-1280.png')});
      await page.locator('#referenceKind').selectOption('obtuse');
      assert.ok(close((await read()).referenceData.answers[0],5*Math.PI/6));
      await page.locator('[data-ref-example="cos"]').click();
      assert.equal((await read()).referenceData.given,-.5);
      assert.ok(close((await read()).referenceData.answers[0],2*Math.PI/3));
      await page.locator('#referenceKind').selectOption('acute');
      assert.equal((await read()).referenceData.answers.length,0);
      assert.equal((await read()).referenceData.given,-.5,'Changing the requested angle must not change the given sign');
      await page.locator('[data-ref-sign="1"]').click();
      assert.ok(close((await read()).referenceData.answers[0],Math.PI/3));
      await page.locator('#referenceKind').selectOption('obtuse');
      assert.equal((await read()).referenceData.answers.length,0);
      await page.locator('[data-ref-sign="-1"]').click();
      if(viewport.width===1280)await page.screenshot({path:path.join(shots,'reference-cos-1280.png')});
      await page.locator('[data-ref-example="tan"]').click();
      assert.equal((await read()).referenceData.given,-1);
      assert.ok(close((await read()).referenceData.answers[0],3*Math.PI/4));
      await page.locator('#referenceKind').selectOption('acute');
      assert.equal((await read()).referenceData.answers.length,0);
      for(const method of ['sin','cos','tan']){
        await page.locator('#referenceMethod').selectOption(method);
        await page.locator('#referenceKind').selectOption('unknown');
        await page.locator('[data-ref-degree="0"]').click();
        assert.equal((await read()).referenceData.answers.length,0);
        await page.locator('[data-ref-degree="90"]').click();
        assert.equal((await read()).referenceData.answers.length,method==='tan'?0:1);
        assert.equal((await read()).referenceData.defined,method!=='tan');
        await layoutCheck(`reference-${method}-90/${viewport.width}`);
        for(const kind of ['acute','obtuse']){await page.locator('#referenceKind').selectOption(kind);assert.equal((await read()).referenceData.answers.length,0);}
      }
      await page.locator('[data-ref-example="sin"]').click();
      await page.locator('#referenceNumber').fill('91');
      assert.equal(await page.locator('#referenceError').isVisible(),true);
      await page.locator('#referenceNumber').fill('30');
      for (const [key, value, expected] of [['asin',-.5,'−π/6'],['acos',-.5,'2π/3'],['atan',-1,'−π/4']]) {
        await choose(key);
        await page.locator('#functionNumber').fill(String(value));
        assert.equal((await read()).values[key], value);
        assert.ok((await page.locator('#functionReadout').innerText()).includes(expected));
        await layoutCheck(`${key}/${viewport.width}`);
        if (viewport.width === 1280) await page.screenshot({ path:path.join(shots, key+'-1280.png') });
      }
      await choose('angles');
      for (const [example,expected] of [['tan',3*Math.PI/4],['sin',5*Math.PI/6],['cos',2*Math.PI/3]]) {
        await page.locator(`[data-example="${example}"]`).click();
        const state = await read();
        assert.equal(state.solutions.length,1);
        assert.ok(close(state.solutions[0],expected));
        assert.ok((await page.locator('#candidateFeedback').innerText()).includes('✓'));
        await layoutCheck(`${example}/${viewport.width}`);
      }
      await page.locator('[data-example="tan"]').click();
      await page.locator('[data-candidate="piMinus"]').click();
      assert.match(await page.locator('#candidateFeedback').innerText(), /三角比不符.*角超出/);
      await page.locator('[data-candidate="principal"]').click();
      assert.match(await page.locator('#candidateFeedback').innerText(), /角超出题目范围/);
      await page.locator('[data-candidate="piPlus"]').click();
      if (viewport.width === 1280) await page.screenshot({ path:path.join(shots, 'angles-1280.png') });
      await page.locator('[data-example="negativeSin"]').click();
      assert.equal((await read()).solutions.length,2);
      for (const u of [-1,0,1]) {
        await page.locator('#angleNumber').fill(String(u));
        assert.equal((await read()).solutions.length,u===0?2:1);
      }
      await page.locator('[data-example="sin"]').click();
      for (const u of [-1,0,1]) { await page.locator('#angleNumber').fill(String(u)); assert.equal((await read()).solutions.length,0); }
      await choose('overview');
      await layoutCheck(`overview/${viewport.width}`);
      if (viewport.width===1280) await page.screenshot({path:path.join(shots,'overview-1280.png')});
      console.log(`PASS ${viewport.width}x${viewport.height}: graphs, domain/range, angle choices and boundary conditions.`);
    }
    await page.setViewportSize({width:1280,height:720});
    await choose('reference');
    const referenceBefore=(await read()).reference.degrees;
    const geometry=await page.locator('#referencePlot').evaluate(svg=>({box:svg.getBoundingClientRect().toJSON(),...svg._referenceGeometry}));
    await page.mouse.move(geometry.box.x+geometry.cx+geometry.r*.9,geometry.box.y+geometry.cy-geometry.r*.1);
    await page.mouse.down();await page.mouse.move(geometry.box.x+geometry.cx+geometry.r*.7,geometry.box.y+geometry.cy-geometry.r*.7,{steps:8});await page.mouse.up();
    assert.notEqual((await read()).reference.degrees,referenceBefore);
    assert.ok(Math.abs((await read()).reference.degrees-45)<.2);
    await page.locator('#referencePlot').focus();await page.keyboard.press('ArrowLeft');
    assert.ok(Math.abs((await read()).reference.degrees-44)<.2);
    await choose('asin');
    await page.locator('#functionNumber').fill('1.2');
    assert.equal(await page.locator('#functionError').isVisible(),true);
    await page.locator('#functionReset').click();
    const plot=await page.locator('#functionPlot').boundingBox();
    const before=(await read()).values.asin;
    await page.mouse.move(plot.x+plot.width*.4,plot.y+plot.height*.5);
    await page.mouse.down(); await page.mouse.move(plot.x+plot.width*.7,plot.y+plot.height*.5,{steps:8}); await page.mouse.up();
    assert.notEqual((await read()).values.asin,before);
    await page.locator('#functionPlot').focus(); await page.keyboard.press('ArrowLeft');
    await choose('angles');
    await page.locator('[data-example="tan"]').click();
    await page.locator('#angleNumber').fill('5e-10');
    assert.equal((await read()).solutions.length,1);
    await page.locator('[data-candidate="piMinus"]').click();
    assert.match(await page.locator('#candidateFeedback').innerText(), /三角比不符/);
    await page.locator('[data-example="sin"]').click();
    await page.locator('#angleNumber').fill('0.9999999995');
    assert.equal((await read()).solutions.length,1);
    await page.locator('[data-example="negativeSin"]').click();
    await page.locator('#angleNumber').fill('-5e-10');
    assert.equal((await read()).solutions.length,2);
    assert.ok((await read()).solutions.every(value=>value>=0&&value<2*Math.PI));
    assert.ok(!(await page.locator('#principalValue').innerText()).includes('arcsin(0)'));
    await page.locator('#angleNumber').fill('3e-9');
    await page.locator('[data-candidate="piPlus"]').click();
    assert.match(await page.locator('#candidateFeedback').innerText(),/三角比不符/);
    await page.locator('#answerButton').click();
    assert.equal(await page.locator('#angleSolution').isVisible(),false);
    await page.locator('#answerButton').click();
    await page.locator('#topButton').click();
    assert.equal(await page.locator('.top').isVisible(),false);
    await page.locator('#restoreTop').click();
    const saved=await read();
    await page.locator('#layoutButton').click(); await page.locator('#layoutButton').click();
    await page.locator('#themeButton').click();
    assert.deepEqual(await read(),saved);
    await page.locator('[data-example="tan"]').click();
    await page.screenshot({path:path.join(shots,'angles-light-1280.png')});
    assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
    await context.close();
    const touch = await browser.newContext({offline:true,hasTouch:true,viewport:{width:390,height:844}});
    const touchPage=await touch.newPage(); await touchPage.goto(pathToFileURL(target).href);
    await touchPage.locator('[data-view="reference"]').click();
    await touchPage.locator('#referenceRange').scrollIntoViewIfNeeded();
    const refSlider=await touchPage.locator('#referenceRange').boundingBox();
    await touchPage.touchscreen.tap(refSlider.x+refSlider.width*.7,refSlider.y+refSlider.height/2);
    assert.notEqual(await touchPage.evaluate(()=>InverseTrigLesson.getState().reference.degrees),30);
    await touchPage.locator('[data-view="asin"]').click();
    await touchPage.locator('#functionRange').scrollIntoViewIfNeeded();
    const slider=await touchPage.locator('#functionRange').boundingBox();
    await touchPage.touchscreen.tap(slider.x+slider.width*.2,slider.y+slider.height/2);
    assert.notEqual(await touchPage.evaluate(()=>InverseTrigLesson.getState().values.asin),.5);
    console.log('PASS: actual mouse drag, keyboard/touch controls, invalid input, tiny nonzero values, layout/theme preservation, zero network requests or console errors.');
  } finally { await browser.close(); }
})().catch(reportFailure);
