const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const {launchBrowser,reportFailure} = require('./browser-runtime.cjs');
(async()=>{
  fs.mkdirSync(path.resolve(__dirname,'simple-shots'),{recursive:true});
  const browser=await launchBrowser(),page=await browser.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.context().setOffline(true);
  await page.goto(pathToFileURL(path.resolve(__dirname,'../papers/jiading-2025/index.html')).href);
  const settle=()=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  // The merged default is side-by-side; this first section specifically tests
  // how focus frees vertical room from the explicitly selected stacked layout.
  await settle();if(await page.locator('#layoutButton').getAttribute('aria-pressed')==='true'){await page.locator('#layoutButton').click();await settle();}
  const results=[];
  for(const viewport of [{width:1280,height:720},{width:1920,height:1080}]){
    await page.setViewportSize(viewport);
    for(const id of [10,11,12,16,17,18,20,21]){
      await page.locator(`[data-question="${id}"]`).click();await settle();
      const before=await page.locator('.figures').boundingBox();
      const state=await page.evaluate(()=>Lesson.getState());
      await page.locator('#focusButton').click();await settle();
      const after=await page.locator('.figures').boundingBox();
      assert.ok(after.height>before.height+50,`Q${id}: focus should free vertical space`);
      assert.deepEqual(await page.evaluate(()=>Lesson.getState()),state);
      assert.equal(await page.locator('.controls').isVisible(),true);
      const bounds=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}));
      assert.ok(bounds.w<=viewport.width+1 && bounds.h<=viewport.height+1,`Q${id}: ${JSON.stringify(bounds)}`);
      if(id===17)await page.screenshot({path:path.resolve(__dirname,`simple-shots/enlarged-${viewport.width}.png`)});
      await page.locator('#focusButton').click();await settle();
      assert.deepEqual(await page.evaluate(()=>Lesson.getState()),state);
      assert.ok(Math.abs((await page.locator('.figures').boundingBox()).height-before.height)<1);
      results.push({width:viewport.width,id,before:Math.round(before.height),focused:Math.round(after.height)});
    }
  }
  for(const viewport of [{width:1280,height:720},{width:1920,height:1080}]){
    await page.setViewportSize(viewport);
    await page.locator('#layoutButton').click();await settle();
    for(const id of [10,11,12,16,17,18,20,21]){
      await page.locator(`[data-question="${id}"]`).click();await settle();
      const state=await page.evaluate(()=>Lesson.getState());
      const text=await page.locator('.lesson-text').boundingBox(),figure=await page.locator('.figures').boundingBox();
      assert.ok(text.x+text.width<figure.x && figure.height>400,`Q${id}: left text / right figure`);
      assert.equal(await page.locator('.lesson-text #statement').count(),1);
      assert.equal(await page.locator('.lesson-text .readout').count(),1);
      await page.locator('#navigationButton').click();await settle();
      assert.equal(await page.locator('.top').isVisible(),false);
      assert.ok((await page.locator('.figures').boundingBox()).height>figure.height+30);
      await page.locator('#keyButton').click();await settle();
      assert.equal(await page.locator('.lesson-text .explain').isVisible(),true);
      if(id===17)await page.screenshot({path:path.resolve(__dirname,`simple-shots/side-layout-${viewport.width}.png`)});
      await page.locator('#keyButton').click();
      await page.locator('#drawButton').click();await settle();
      assert.equal(await page.locator('.lesson-text #constructionBar').isVisible(),true);
      await page.locator('#constructionNext').click();
      const step=await page.evaluate(()=>Lesson.getConstruction().step);
      await page.locator('#focusButton').click();await settle();
      assert.equal(await page.locator('#constructionBar').isVisible(),true);
      assert.equal(await page.evaluate(()=>Lesson.getConstruction().step),step);
      await page.locator('#focusButton').click();await settle();
      await page.locator('#constructionFull').click();await settle();
      await page.locator('#layoutButton').click();await settle();
      assert.deepEqual(await page.evaluate(()=>Lesson.getState()),state);
      await page.locator('#layoutButton').click();await settle();
      const bounds=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}));
      assert.ok(bounds.w<=viewport.width+1 && bounds.h<=viewport.height+1,`Q${id}: side overflow ${JSON.stringify(bounds)}`);
      await page.locator('#navigationButton').click();
    }
    await page.setViewportSize({width:390,height:844});await settle();
    assert.equal(await page.locator('.lesson-text').count(),0);
    assert.equal(await page.locator('#statement').isVisible(),true);
    await page.setViewportSize(viewport);await settle();
    assert.equal(await page.locator('.lesson-text #statement').count(),1);
    await page.locator('#layoutButton').click();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify(results));console.log('PASS: side layout, navigation toggle, construction, focus, state preservation and responsive restoration.');await browser.close();
})().catch(reportFailure);
