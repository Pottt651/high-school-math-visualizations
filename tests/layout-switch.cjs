const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');
const papers = require('../papers/catalog.json').filter(p => ['jiading-2025','huangpu-2025','xuhui-2025'].includes(p.id));
(async () => {
  const browser = await launchBrowser();
  try {
    const viewport = { width: 1366, height: 768 };
    const context = await browser.newContext({ viewport, offline: true });
    const page = await context.newPage(), errors = [], network = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('request', r => { if (/^https?:/.test(r.url())) network.push(r.url()); });
    const settle = () => page.evaluate(async () => {
      await document.fonts.ready;
      for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);
    });
    const state = () => page.evaluate(() => Lesson.getState());
    const bounds = selector => page.locator(selector).boundingBox();
    const near = (a, b, why) => assert.ok(Math.abs(a - b) <= 1, why + ': ' + a + ' != ' + b);
    const side = () => page.locator('#layoutButton').getAttribute('aria-pressed');
    async function ensureSide() {
      if(await side() !== 'true'){await page.locator('#layoutButton').click();await settle();}
    }
    async function checkSideBySide(label) {
      const text = await bounds('.lesson-text'), diagram = await bounds('#module > .figures');
      const controls = await bounds('#module > .controls');
      assert.ok(text.x + text.width < diagram.x, label + ': text must be left of the graph');
      near(text.y, controls ? controls.y : diagram.y, label + ': pane tops');
      assert.equal(await page.locator('.lesson-text').getAttribute('tabindex'), '0', label + ': focusable reading pane');
      const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
      assert.ok(size.w <= viewport.width && size.h <= viewport.height, label + ': page overflow ' + JSON.stringify(size));
    }
    async function switchTwice(label) {
      const before = await state(), steps = await page.evaluate(() => Lesson.getConstruction().step);
      const original = await bounds('.figures');
      await page.locator('#layoutButton').click(); await settle();
      assert.deepEqual(await state(), before, label + ': layout changed mathematics or camera');
      assert.equal(await page.evaluate(() => Lesson.getConstruction().step), steps);
      const question = await bounds('.question-context'), diagram = await bounds('.figures');
      assert.ok(question.y + question.height <= diagram.y + 1, label + ': stacked reading order');
      assert.equal(await page.locator('.reading-scroll-hint').count(), 0, label + ': stacked layout retained a hint');
      await page.locator('#layoutButton').click(); await settle();
      assert.deepEqual(await state(), before, label + ': return changed mathematics or camera');
      assert.equal(await page.evaluate(() => Lesson.getConstruction().step), steps);
      const restored = await bounds('.figures');
      for(const key of ['x','y','width','height'])near(restored[key], original[key], label + ': restored figure ' + key);
      await checkSideBySide(label);
    }
    let count = 0, constructions = 0;
    assert.equal(papers.length, 3, 'The three pre-existing districts must stay covered');
    for(const paper of papers){
      await page.goto(pathToFileURL(path.resolve(__dirname, '..', paper.href)).href);await settle();await ensureSide();
      for(const {id} of paper.questions){
        await page.locator('[data-question="' + id + '"]').click();await settle();
        const label = paper.id + ' q' + id;
        await checkSideBySide(label);await switchTwice(label);
        const figureBefore = await bounds('.figures');
        await page.locator('#keyButton').click();await settle();
        const figureAfter = await bounds('.figures');
        for(const key of ['x','y','width','height'])near(figureAfter[key],figureBefore[key],label + ': revealing proof moves diagram ' + key);
        // A newly revealed readout relationship may add a line before the answer.
        // Its answer must remain in the reading pane, never resize the diagram.
        const answer = await bounds('.lesson-text .answer');
        if(answer)assert.ok(answer.x + answer.width < figureAfter.x, label + ': answer left the reading pane');
        await page.locator('.lesson-text').evaluate(e => {e.scrollTop=e.scrollHeight;});
        near((await bounds('.figures')).y,figureAfter.y,label + ': scrolling text moves the graph');
        await page.locator('.lesson-text').evaluate(e => {e.scrollTop=0;});
        if(await page.locator('#drawButton').isVisible()){
          await page.locator('#drawButton').click();
          if(await page.locator('#constructionNext').isEnabled())await page.locator('#constructionNext').click();
          await settle();await switchTwice(label + ' construction');
          await page.locator('#constructionFull').click();await settle();
          assert.equal((await state()).revealed,true,label + ': lost previous proof state');
          constructions++;
        }
        count++;
      }
    }
    assert.equal(count,21);
    const jiadingURL=pathToFileURL(path.resolve(__dirname,'../papers/jiading-2025/index.html')).href;
    await page.goto(jiadingURL+'#q17');await settle();await ensureSide();
    const scene=await bounds('.figures'),cameraBefore=(await state()).space;
    await page.mouse.move(scene.x+scene.width*.5,scene.y+scene.height*.5);
    await page.mouse.down();await page.mouse.move(scene.x+scene.width*.6,scene.y+scene.height*.6,{steps:8});await page.mouse.up();
    await settle();assert.notDeepEqual((await state()).space,cameraBefore,'Camera was not rotated for preservation check');
    await switchTwice('rotated prism');
    await page.locator('#layoutButton').click();await settle();
    await page.reload();await settle();assert.equal(await side(),'false','Refresh lost layout preference');
    await page.locator('[data-question="16"]').click();await settle();
    assert.equal(await side(),'false','Changing questions lost preference');
    await page.locator('#layoutButton').click();await settle();
    await page.locator('[data-q16-preset="1/3"]').click();await page.locator('#q16-next').click();await settle();
    await switchTwice('non-default exact sequence');
    const beforeTheme=await state();await page.locator('#themeButton').click();await settle();
    assert.deepEqual(await state(),beforeTheme);await checkSideBySide('light theme');
    await page.locator('#keyButton').click();await settle();
    await page.locator('.lesson-text').evaluate(e=>{e.scrollTop=0;});await settle();
    assert.equal(await page.locator('.reading-scroll-hint').isVisible(),true,'Long text needs a continuation hint');
    await page.locator('.lesson-text').focus();await page.keyboard.press('End');await settle();
    await page.locator('.lesson-text').evaluate(e=>{e.scrollTop=e.scrollHeight;});await settle();
    assert.equal(await page.locator('.reading-scroll-hint').isVisible(),false,'Hint must clear at the end');
    await page.locator('#layoutButton').click();await settle();
    assert.equal(await page.locator('.reading-scroll-hint').count(),0,'Stacked layout must not retain hint');
    await page.locator('#layoutButton').click();await settle();
    await page.setViewportSize({width:390,height:844});await settle();
    assert.equal(await page.locator('#layoutButton').isVisible(),false);
    assert.equal(await page.locator('.lesson-text').count(),0);
    const mobile=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert.ok(mobile<=390,'Mobile overflow '+mobile);
    await page.setViewportSize(viewport);await settle();await checkSideBySide('restored wide screen');
    assert.equal(await page.locator('#layoutButton').isVisible(),true);
    assert.equal(await side(),'true','Narrow screen changed saved preference');
    for(const [legacy,modern,expected] of [['stacked',null,false],['side-by-side',null,true],['stacked',true,true],['side-by-side',false,false]]){
      const migration=await browser.newContext({viewport,offline:true});
      await migration.addInitScript(({legacy,modern})=>{
        localStorage.removeItem('math-visualizations-display');localStorage.setItem('math-visualizations-layout',legacy);
        if(modern!==null)localStorage.setItem('math-visualizations-display',JSON.stringify({side:modern}));
      },{legacy,modern});
      const migrated=await migration.newPage();await migrated.goto(jiadingURL);
      assert.equal(await migrated.locator('#layoutButton').getAttribute('aria-pressed'),String(expected),'legacy '+legacy+', modern '+modern);
      await migration.close();
    }
    assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
    console.log('PASS: '+count+' original lessons, '+constructions+' construction flows; stable diagrams, camera, old/new preferences, reading hints, offline and narrow screens.');
  } finally {await browser.close();}
})().catch(reportFailure);
