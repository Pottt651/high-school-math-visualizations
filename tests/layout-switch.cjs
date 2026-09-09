const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');
const papers = require('../papers/catalog.json');

(async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, offline: true });
  const page = await context.newPage(), errors = [], network = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => { if (/^https?:/.test(r.url())) network.push(r.url()); });
  const settle = () => page.evaluate(async () => {
    await document.fonts.ready;
    for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);
  });
  const state = () => page.evaluate(() => Lesson.getState());
  const bounds = selector => page.locator(selector).boundingBox();
  const near = (a, b, why) => assert.ok(Math.abs(a - b) <= 1, `${why}: ${a} != ${b}`);
  async function checkSideBySide(label) {
    const text = await bounds('.reading-pane'), diagram = await bounds('.diagram-pane');
    assert.ok(text.x + text.width < diagram.x, `${label}: text must be left of the graph`);
    near(text.y, diagram.y, `${label}: pane tops`);
    const pageSize = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    assert.ok(pageSize.w <= 1366 && pageSize.h <= 768, `${label}: page overflow ${JSON.stringify(pageSize)}`);
  }
  async function switchTwice(label) {
    const before = await state(), steps = await page.evaluate(() => Lesson.getConstruction().step);
    const original = await bounds('.figures');
    await page.locator('#layoutButton').click(); await settle();
    assert.deepEqual(await state(), before, `${label}: layout changed mathematics or camera`);
    assert.equal(await page.evaluate(() => Lesson.getConstruction().step), steps);
    const question = await bounds('.question-context'), diagram = await bounds('.diagram-pane');
    assert.ok(question.y + question.height <= diagram.y + 1, `${label}: stacked reading order`);
    await page.locator('#layoutButton').click(); await settle();
    assert.deepEqual(await state(), before, `${label}: return changed mathematics or camera`);
    assert.equal(await page.evaluate(() => Lesson.getConstruction().step), steps);
    const restored = await bounds('.figures');
    for (const key of ['x','y','width','height']) near(restored[key], original[key], `${label}: restored figure ${key}`);
    await checkSideBySide(label);
  }
  let count = 0;
  for (const paper of papers) {
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', paper.href)).href); await settle();
    for (const { id } of paper.questions) {
      await page.locator(`[data-question="${id}"]`).click(); await settle();
      const label = `${paper.id} q${id}`;
      await checkSideBySide(label);
      await switchTwice(label);
      const figureBefore = await bounds('.figures'), answerBefore = await bounds('.answer');
      await page.locator('#keyButton').click(); await settle();
      const figureAfter = await bounds('.figures'), answerAfter = await bounds('.answer');
      for (const key of ['x','y','width','height']) near(figureAfter[key], figureBefore[key], `${label}: revealing proof moves diagram ${key}`);
      near(answerAfter.y, answerBefore.y, `${label}: revealing proof moves answer`);
      await page.locator('.reading-pane').evaluate(element => { element.scrollTop = element.scrollHeight; });
      near((await bounds('.figures')).y, figureAfter.y, `${label}: text scrolling moves the graph`);
      await page.locator('.reading-pane').evaluate(element => { element.scrollTop = 0; });
      await page.locator('#drawButton').click();
      await page.locator('#constructionNext').click(); await settle();
      await switchTwice(`${label} construction`);
      await page.locator('#constructionFull').click(); await settle();
      assert.equal((await state()).revealed, true, `${label}: lost previous proof state`);
      count++;
    }
  }
  // A real rotated three-dimensional view must survive the layout operation.
  await page.goto(pathToFileURL(path.resolve(__dirname, '../papers/jiading-2025/index.html')).href + '#q17');
  await settle();
  const scene = await bounds('.figures'), cameraBefore = (await state()).space;
  await page.mouse.move(scene.x + scene.width * .5, scene.y + scene.height * .5);
  await page.mouse.down(); await page.mouse.move(scene.x + scene.width * .6, scene.y + scene.height * .6, { steps: 8 }); await page.mouse.up();
  await settle();
  assert.notDeepEqual((await state()).space, cameraBefore, 'Camera was not rotated for the preservation check');
  await switchTwice('rotated prism');
  await page.locator('#layoutButton').click(); await settle();
  await page.reload(); await settle();
  assert.equal(await page.locator('html').getAttribute('data-layout'), 'stacked', 'Refresh lost the layout preference');
  await page.locator('[data-question="16"]').click(); await settle();
  assert.equal(await page.locator('html').getAttribute('data-layout'), 'stacked', 'Changing questions lost the preference');
  await page.locator('#layoutButton').click(); await settle();
  await page.locator('[data-q16-preset="1/3"]').click();
  await page.locator('#q16-next').click(); await settle();
  await switchTwice('non-default exact sequence');
  const beforeTheme = await state();
  await page.locator('#themeButton').click(); await settle();
  assert.deepEqual(await state(), beforeTheme);
  await checkSideBySide('light theme');
  await page.locator('#keyButton').click(); await settle();
  await page.locator('.reading-pane').evaluate(element => { element.scrollTop = 0; }); await settle();
  assert.equal(await page.locator('.reading-scroll-hint').isVisible(), true, 'Long text needs a discoverable continuation');
  await page.locator('.reading-pane').evaluate(element => { element.scrollTop = element.scrollHeight; }); await settle();
  assert.equal(await page.locator('.reading-scroll-hint').isVisible(), false, 'Continuation hint must clear at the end');
  await page.locator('#layoutButton').click(); await settle();
  assert.equal(await page.locator('.reading-scroll-hint').isVisible(), false, 'Stacked layout must not retain the side-panel hint');
  await page.locator('#layoutButton').click(); await settle();
  await page.setViewportSize({ width: 390, height: 844 }); await settle();
  assert.equal(await page.locator('#layoutButton').isDisabled(), true);
  const mobile = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(mobile <= 390, `Mobile overflow ${mobile}`);
  await page.setViewportSize({ width: 1366, height: 768 }); await settle();
  await checkSideBySide('restored wide screen');
  assert.equal(await page.locator('#layoutButton').isEnabled(), true);
  assert.deepEqual(errors, []); assert.deepEqual(network, []);
  console.log(`PASS: ${count} lessons, left-text/right-graph and stacked layouts, stable geometry/answers, construction, camera, preference, offline and narrow screens.`);
  await browser.close();
})().catch(reportFailure);
