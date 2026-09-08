const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');

// Measure rendered text, not the label-placement algorithm's reported boxes.
function inspectLabelAgainstTicks({ selector, tex }) {
  const svg = document.querySelector(selector);
  const label = [...svg.querySelectorAll('foreignObject')].find(element =>
    element.querySelector('annotation[encoding="application/x-tex"]')?.textContent === tex);
  const visual = label?.querySelector('.katex-html');
  if (!visual) return { missing: true };
  const rectangle = element => {
    const box = element.getBoundingClientRect();
    return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
  };
  const actual = rectangle(visual);
  const ticks = [...svg.querySelectorAll('text')]
    .filter(element => /^[−-]?\d+(?:\.\d+)?$/.test(element.textContent.trim()) && element.getClientRects().length > 0)
    .map(element => ({ text: element.textContent.trim(), ...rectangle(element) }));
  const overlaps = ticks.filter(tick => Math.min(actual.right, tick.right) - Math.max(actual.left, tick.left) > .5
    && Math.min(actual.bottom, tick.bottom) - Math.max(actual.top, tick.top) > .5);
  return { actual, tickCount: ticks.length, overlaps };
}

function inspectUnitAreaPosition() {
  const svg = document.querySelector('#q20-unit');
  const label = [...svg.querySelectorAll('foreignObject')].find(element =>
    element.querySelector('annotation[encoding="application/x-tex"]')?.textContent === "S'");
  const visual = label?.querySelector('.katex-html');
  const center = element => { const box = element.getBoundingClientRect(); return [box.x + box.width / 2, box.y + box.height / 2]; };
  const vertices = ['ink', 'blue', 'green'].map(role => center(svg.querySelector(`circle[fill="var(--plot-${role})"]`)));
  if (!visual) return { missing: true, vertices };
  const point = center(visual);
  const signs = vertices.map((a, index) => {
    const b = vertices[(index + 1) % vertices.length];
    return (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0]);
  });
  return { point, vertices, inside: signs.every(value => value >= -1e-6) || signs.every(value => value <= 1e-6) };
}

(async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.setOffline(true);
  const page = await context.newPage(), errors = [], external = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
  await page.goto(pathToFileURL(path.resolve(__dirname, '../嘉定一模_互动讲题.html')).href);
  const settle = () => page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const select = async id => { await page.locator(`[data-question="${id}"]`).click(); await settle(); };
  const state = () => page.evaluate(() => Lesson.getState());
  const enterNumber = async (selector, value) => {
    await page.locator(selector).fill(String(value));
    await page.locator(selector).press('Tab');
    await settle();
  };
  const noTickOverlap = async (selector, tex, label) => {
    await settle();
    const result = await page.evaluate(inspectLabelAgainstTicks, { selector, tex });
    assert.equal(result.missing, undefined, `Missing rendered ${label}`);
    assert.ok(result.actual.width > 0 && result.actual.height > 0, `Empty rendered ${label}`);
    assert.ok(result.tickCount > 0, `No axis ticks inspected for ${label}`);
    assert.deepEqual(result.overlaps, [], `${label} overlaps an axis tick; actual label rectangle ${JSON.stringify(result.actual)}`);
  };

  // Q11: the minimum must be visible in a truthful zoom and survive view changes.
  await select(11);
  assert.equal(await page.locator('#q11-view').inputValue(), 'total');
  assert.match(await page.locator('#q11-cost').textContent(), /局部纵轴.*15\.5.*16\.1.*不从\s*0\s*开始/);
  await page.locator('#keyButton').click();
  await page.locator('#q11-best').click();
  const minimum = await state(), degrees = Number(await page.locator('#q11-degrees').inputValue());
  assert.match(await page.locator('#q11-cost').textContent(), /当前\s*=\s*最低/);
  await enterNumber('#q11-degrees', degrees - .6); const left = await state();
  await enterNumber('#q11-degrees', degrees + .6); const right = await state();
  assert.ok(left.total > minimum.total && right.total > minimum.total, 'Both neighboring slopes should cost more than the minimum');
  assert.ok(left.straight > minimum.straight && minimum.straight > right.straight, 'Straight-segment cost should decrease as the slope grows');
  assert.ok(left.arc < minimum.arc && minimum.arc < right.arc, 'Arc cost should increase as the slope grows');
  const quantities = value => ({ theta: value.theta, straight: value.straight, arc: value.arc, total: value.total });
  for (const view of ['parts', 'total']) {
    const before = quantities(await state());
    await page.selectOption('#q11-view', view);
    assert.deepEqual(quantities(await state()), before, `Q11 ${view} view changed the actual construction/cost`);
  }

  // Q12: short projections remain identifiable; zero is an explicit coincidence.
  await select(12);
  const initial = await state();
  assert.ok(initial.d2 > 0 && initial.d2 < .1, 'The short-distance regression case changed');
  assert.equal(await page.locator('#q12-svg text').filter({ hasText: /^H₂$/ }).count(), 1, 'The short Q projection must still label its foot H₂');
  assert.equal(await page.locator('#q12-svg text').filter({ hasText: /^H₂$/ }).isVisible(), true);
  for (const direction of ['1', '-1']) {
    await page.selectOption('#q12-sign', direction);
    await page.locator('#q12-boundary').click();
    const result = await state();
    assert.ok((result.d1 === 0 && result.d2 > 0) || (result.d2 === 0 && result.d1 > 0), `Q12 direction ${direction}: exactly one distance should vanish`);
    const coincidence = result.d1 === 0 ? /^P=H₁$/ : /^Q=H₂$/;
    assert.equal(await page.locator('#q12-svg text').filter({ hasText: coincidence }).isVisible(), true, 'The zero distance needs a visible coincident-point label');
  }
  await page.setViewportSize({ width: 768, height: 900 });
  await select(12);
  const ruler = page.locator('#q12-svg [data-q12-ruler]');
  assert.equal(await ruler.isVisible(), true, 'The 768px view must retain the distance ruler');
  const rulerAngle = (await state()).angle;
  const heading = await ruler.locator('text').filter({ hasText: '两段距离' }).boundingBox();
  assert.ok(heading);
  await page.mouse.click(heading.x + heading.width / 2, heading.y + heading.height / 2);
  assert.equal((await state()).angle, rulerAngle, 'Clicking the ruler title must not rotate the circle');
  const hitArea = await ruler.locator(':scope > rect').first().boundingBox();
  assert.ok(hitArea && hitArea.width > 100 && hitArea.height > 100);
  await page.mouse.click(hitArea.x + hitArea.width - 6, hitArea.y + hitArea.height - 6);
  assert.equal((await state()).angle, rulerAngle, 'Clicking the ruler background must not rotate the circle');
  const circle = await page.locator('#q12-svg ellipse').boundingBox();
  assert.ok(circle);
  await page.mouse.click(circle.x, circle.y + circle.height / 2);
  assert.notEqual((await state()).angle, rulerAngle, 'The real circle should remain interactive');
  await page.setViewportSize({ width: 1366, height: 768 });

  // Q16: students can read every claim before opening the explanations.
  await select(16);
  const claims = page.locator('.question-claims');
  assert.equal(await claims.isVisible(), true);
  assert.equal(await claims.locator('li').count(), 4);
  const claimsHeight = await claims.evaluate(element => ({ content: element.scrollHeight, viewport: element.clientHeight }));
  assert.ok(claimsHeight.content <= claimsHeight.viewport + 1,
    `At 1366×768, all four claims should fit without scrolling: ${claimsHeight.content}px content in ${claimsHeight.viewport}px`);
  assert.doesNotMatch(await claims.innerText(), /正确|错误|[真假]|不成立/, 'The question list reveals verdicts before exploration');
  assert.equal(await page.locator('#module .explain').isVisible(), false);
  for (let index = 0; index < 4; index++) {
    const item = claims.locator('li').nth(index);
    await item.scrollIntoViewIfNeeded();
    assert.match(await item.innerText(), new RegExp(['①', '②', '③', '④'][index]));
    const readable = await item.evaluate(element => {
      const box = element.getBoundingClientRect(), panel = element.closest('.question-claims').getBoundingClientRect();
      return box.left >= panel.left && box.right <= panel.right + 1 && box.top >= panel.top - 1 && box.bottom <= panel.bottom + 1;
    });
    assert.equal(readable, true, `Claim ${index + 1} cannot be fully read in its panel`);
  }
  for (const revealed of [false, true]) {
    if (revealed) {
      await page.locator('#keyButton').click();
      assert.equal(await page.locator('#module .explain').isVisible(), true);
      const headings = await page.locator('#module .explain h3').allTextContents();
      for (const verdict of ['① 假', '② 真', '③ 真', '④ 假']) assert.ok(headings.some(heading => heading.startsWith(verdict)), `Missing original proof for ${verdict}`);
    }
    for (const preset of ['1/4', '1/2', '2/3']) {
      await page.locator(`[data-q16-preset="${preset}"]`).click();
      await noTickOverlap('#q16-web', 'a_1', `Q16 initial ${preset}, revealed=${revealed}`);
    }
  }

  // Q18: operate the candidate selector as a student would, checking the verdict.
  await select(18);
  for (const [candidate, omega, valid] of [[1, 3, false], [2, 7, true], [3, 11, false], [4, 15, true]]) {
    await enterNumber('#q18-number', candidate);
    assert.equal((await state()).omega, omega);
    const readout = await page.locator('#q18-readout').innerText();
    assert.equal(readout.includes('满足本题条件。'), valid, `Q18 should ${valid ? 'accept' : 'reject'} ω=${omega}`);
    if (!valid) assert.match(readout, /不满足极值要求/);
  }

  // Q20: use the DOM's painted math/tick rectangles, including after a real drag.
  await select(20);
  await page.locator('#q20-circle').check();
  for (const revealed of [false, true]) {
    if (revealed) await page.locator('#keyButton').click();
    await noTickOverlap('#q20-unit', "S'", `Q20 unit-circle area, revealed=${revealed}`);
    await noTickOverlap('#q20-ellipse', 'S', `Q20 ellipse area, revealed=${revealed}`);
  }
  const handle = await page.locator('#q20-ellipse circle[fill="var(--plot-blue)"]').first().boundingBox();
  assert.ok(handle);
  const oldAngle = (await state()).theta;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + 30, handle.y + handle.height / 2 + 40, { steps: 20 });
  await page.mouse.up();
  assert.notEqual((await state()).theta, oldAngle);
  await noTickOverlap('#q20-unit', "S'", 'Q20 unit-circle area after rotating its chord');
  for (const angle of [31, 90, 135]) {
    await page.locator('#q20-angle').evaluate((element, value) => {
      element.value = value; element.dispatchEvent(new Event('input', { bubbles: true }));
    }, angle);
    await settle();
    const position = await page.evaluate(inspectUnitAreaPosition);
    assert.equal(position.missing, undefined, `The locked triangle at ${angle}° should have room for its area label`);
    assert.equal(position.inside, true, `The actual S′ glyph center lies outside its triangle at ${angle}°: ${JSON.stringify(position)}`);
  }
  await page.locator('#q20-lock').uncheck();
  await page.locator('#q20-position').evaluate(element => {
    element.value = '.001'; element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await settle();
  const thin = await page.evaluate(inspectUnitAreaPosition);
  if (!thin.missing) assert.equal(thin.inside, true, 'An area label retained in a thin free triangle must still lie inside');
  assert.equal(await page.locator('#q20-unit foreignObject').evaluateAll(elements => elements.some(element =>
    /^S'\s*\\approx/.test(element.querySelector('annotation')?.textContent || '') && element.getBoundingClientRect().height > 0)), true,
  'The independent unit-circle area readout must remain visible when an interior label cannot fit');
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log('PASS: Q11 minimum/scale views, Q12 short/zero projections and ruler hit areas, Q16 claims/proofs, Q18 legal candidates, Q16/Q20 real text rectangles, Q20 area labels inside their triangles.');
  await browser.close();
})().catch(reportFailure);
