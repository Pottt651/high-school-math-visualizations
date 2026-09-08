const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');

(async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await context.setOffline(true);
  const page = await context.newPage(), errors = [], external = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
  await page.goto(pathToFileURL(path.resolve(__dirname, '../papers/jiading-2025/index.html')).href);
  const shots = path.resolve(__dirname, '../.tmp/construction');
  fs.mkdirSync(shots, { recursive: true });
  const settle = () => page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const select = async id => { await page.locator(`[data-question="${id}"]`).click(); await settle(); };
  const state = () => page.evaluate(() => Lesson.getState());
  const progress = () => page.evaluate(() => Lesson.getConstruction());
  const signature = () => page.evaluate(() => [...document.querySelectorAll('.figures svg')]
    .filter(svg => !svg.closest('.katex') && svg.getClientRects().length && getComputedStyle(svg).display !== 'none')
    .map(svg => [...svg.querySelectorAll('line,path,circle,ellipse,polygon,polyline,rect,text,annotation')]
      .filter(node => !node.closest('.katex svg,defs'))
      .map(node => [node.tagName, node.getAttribute('stroke'), node.getAttribute('fill'),
        node.tagName === 'text' || node.tagName === 'annotation' ? node.textContent :
          ['d','points','x1','x2','y1','y2','cx','cy','r','rx','ry'].map(key => node.getAttribute(key))])));
  const snapshot = async name => { await settle(); await page.screenshot({ path: path.join(shots, name + '.png'), fullPage: true }); };
  const go = async index => { while ((await progress()).step < index) await page.locator('#constructionNext').click(); await settle(); };
  const layout = async width => {
    const result = await page.evaluate(() => ({ width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      invalid: [...document.querySelectorAll('.figures > svg, .figure-wrap > svg, .q20-figure > svg')]
        .some(svg => /\bNaN\b|\bInfinity\b/.test(svg.innerHTML)) }));
    assert.ok(result.width <= width + 1, `Construction horizontal overflow: ${JSON.stringify(result)}`);
    if (width >= 1280) assert.ok(result.height <= (width === 1920 ? 1081 : 769), `Construction vertical overflow: ${JSON.stringify(result)}`);
    assert.equal(result.invalid, false);
  };
  let stepsChecked = 0;
  for (const id of [10,11,12,16,17,18,20,21]) {
    await select(id);
    const initial = await state();
    const bold = await page.evaluate(() => ({
      plain: [...document.querySelectorAll('.figures text')].every(node => Number(getComputedStyle(node).fontWeight) >= 700),
      math: document.querySelectorAll('.figures .plot-math .boldsymbol, .figures .plot-math .mathbf').length,
    }));
    assert.ok(bold.plain, `q${id}: plain labels/ticks must be bold`);
    assert.ok(bold.math > 0, `q${id}: math labels must use actual bold mathematical glyphs`);
    await page.locator('#drawButton').click(); await settle();
    assert.equal((await progress()).step, 0);
    assert.equal(await page.locator('#constructionPrev').isDisabled(), true);
    assert.equal(await page.locator('.readout').isVisible(), false, 'Answers must not precede construction');
    const { steps } = await progress(), views = [];
    assert.ok(steps.length >= 3 && steps.length <= 7, `q${id}: condition-driven steps are missing`);
    for (let i = 0; i < steps.length; i++) {
      if (i) { await page.locator('#constructionNext').click(); await settle(); }
      assert.equal((await progress()).step, i);
      assert.ok((await page.locator('#constructionBody').innerText()).length > 15, `q${id}, step ${i}: explain condition and action`);
      assert.deepEqual(await state(), initial, `q${id}, step ${i}: drawing must not change the mathematical state`);
      await layout(1920);
      views.push(JSON.stringify(await signature()));
      await snapshot(`q${id}-step${i + 1}`);
      stepsChecked++;
    }
    assert.ok(new Set(views).size >= 3, `q${id}: steps only changed captions, not the actual diagram`);
    assert.equal(await page.locator('#constructionNext').isDisabled(), true);
    await page.locator('#constructionPrev').click(); await settle();
    assert.ok(JSON.stringify(await signature()) === views.at(-2), `q${id}: stepping back must remove later objects and restore the earlier layout`);
    await page.locator('#constructionFull').click(); await settle();
    assert.equal((await progress()).step, null);
    assert.equal(await page.locator('.readout').isVisible(), true);
    assert.deepEqual(await state(), initial, `q${id}: returning to complete view changed parameters`);
  }

  // Q12: circle -> fixed-angle points -> reference line -> each perpendicular -> sum.
  await select(12); await page.locator('#drawButton').click(); await settle();
  assert.equal(await page.locator('#q12-svg ellipse').count(), 1);
  assert.equal(await page.locator('#q12-svg text').filter({hasText: /^P$/}).count(), 0);
  assert.equal(await page.locator('#q12-svg [stroke="var(--plot-target)"]').count(), 0);
  await go(1);
  assert.equal(await page.locator('#q12-svg text').filter({hasText: /^P$/}).count(), 1);
  assert.equal(await page.locator('#q12-svg text').filter({hasText: /^H₁$/}).count(), 0);
  await go(3);
  assert.equal(await page.locator('#q12-svg text').filter({hasText: /^H₁$/}).count(), 1);
  assert.equal(await page.locator('#q12-svg text').filter({hasText: /^H₂$/}).count(), 0);
  await go(4);
  assert.equal(await page.locator('#q12-svg text').filter({hasText: /^H₂$/}).count(), 1);
  await go(5); assert.equal(await page.locator('[data-q12-ruler]').isVisible(), true);
  await page.locator('#q12-boundary').click(); await settle();
  assert.equal(await page.locator('#q12-svg text').filter({hasText: /^P=H₁$/}).isVisible(), true);
  const beforeTheme = await state(), beforeProgress = await progress();
  await page.locator('#themeButton').click(); await settle();
  assert.deepEqual(await state(), beforeTheme); assert.deepEqual(await progress(), beforeProgress);
  await snapshot('q12-complete-light');
  await page.locator('#resetButton').click(); await settle();
  assert.equal((await progress()).step, 0);
  await page.keyboard.press('ArrowRight'); await settle();
  assert.equal((await progress()).step, 1); assert.equal((await state()).question, 12);
  await page.keyboard.press('ArrowLeft'); assert.equal((await progress()).step, 0);
  await page.locator('#constructionFull').click();
  await page.locator('#keyButton').click(); await page.locator('#drawButton').click();
  assert.equal((await state()).revealed, false);
  await page.locator('#constructionFull').click();
  assert.equal((await state()).revealed, true, 'Return to complete view must restore the teacher’s proof state');

  // A change of subquestion/function must restart with its own conditions.
  for (const [id, selector, values] of [[17,'#q17-part',['2','1']], [21,'#q21-function',['quad','line','log','sin']], [18,'#q18-mode',['free','candidate']]]) {
    await select(id); await page.locator('#drawButton').click(); await go(2);
    for (const value of values) {
      await page.selectOption(selector, value); await settle();
      assert.equal((await progress()).step, 0, `q${id}: changed mode must start from its own first condition`);
      const {steps} = await progress(); await go(steps.length - 1);
      await snapshot(`q${id}-${value}-last`);
    }
  }
  await select(20); await page.locator('#q20-lock').uncheck();
  await page.locator('#q20-angle').evaluate(node => { node.value='90';node.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.locator('#drawButton').click(); await go((await progress()).steps.length - 1);
  assert.equal((await state()).valid, false, 'Drawing must not turn an undefined slope into a legal original configuration');
  await snapshot('q20-undefined-slope');
  await page.locator('#resetButton').click();
  await page.locator('#q20-circle').check(); await settle();
  assert.equal((await progress()).step, 0);
  const withCircle = await state();
  await go(4); assert.equal(await page.locator('#q20-unit').isVisible(), false, 'Circle correspondence must follow the original triangle');
  await go(5); assert.equal(await page.locator('#q20-unit').isVisible(), true);
  assert.deepEqual(await state(), withCircle, 'The correspondence step must not change the ellipse or area');
  await snapshot('q20-circle-last');
  await select(16); await page.locator('#drawButton').click(); await go(2);
  const redSegments = () => page.locator('#q16-web line[stroke="var(--plot-target)"]').evaluateAll(lines => lines.map(line => ({
    dx: +line.getAttribute('x2') - +line.getAttribute('x1'), dy: +line.getAttribute('y2') - +line.getAttribute('y1'),
  })));
  let segments = await redSegments();
  assert.ok(segments.some(line => Math.abs(line.dx) < 1e-6 && Math.abs(line.dy) > 1), 'First recurrence must draw vertically to the parabola');
  assert.equal(segments.some(line => Math.abs(line.dy) < 1e-6 && Math.abs(line.dx) > 1), false, 'Do not copy a2 horizontally before reaching the next step');
  await go(3); segments = await redSegments();
  assert.ok(segments.some(line => Math.abs(line.dy) < 1e-6 && Math.abs(line.dx) > 1), 'Next step must copy a2 to y=x');
  await select(16); await page.selectOption('#q16-r','3'); await page.locator('[data-q16-preset="2/3"]').click();
  const fixed = await state(); await page.locator('#drawButton').click(); await go(4);
  assert.deepEqual(await state(), fixed, 'Fixed-point construction must preserve the exact initial value and iteration count');
  assert.match(await page.locator('#q16-web').textContent(), /重合/);
  await snapshot('q16-fixed');
  await select(21); await page.locator('#q21-number').fill(String(Math.PI / 2 + 1e-10)); await page.locator('#q21-number').press('Tab');
  await page.locator('#drawButton').click(); await go(4);
  assert.equal((await state()).atOpt, false);
  assert.match(await page.locator('#q21-shift').textContent(), /解析条件核对/);
  assert.equal(await page.locator('#q21-shift text').filter({hasText: /^不在 A 中$/}).count(), 0, 'Rounded zero must not be presented as a visible nonzero counterexample');

  for (const [width,height] of [[1366,768],[390,844]]) {
    await page.setViewportSize({width,height});
    for (const id of [10,11,12,16,17,18,20,21]) {
      await select(id); await page.locator('#drawButton').click(); await settle(); await layout(width);
      await go((await progress()).steps.length-1); await layout(width);
    }
    await snapshot(`q21-${width}`);
  }
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  await browser.close();
  console.log(`PASS: ${stepsChecked} actual drawing stages, reverse/complete/reset, source-condition dependencies, mathematical-state preservation, mode changes, bold labels, offline operation and projection/mobile layouts.`);
})().catch(reportFailure);
