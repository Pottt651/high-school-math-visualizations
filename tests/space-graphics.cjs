const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');

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
  const state = () => page.evaluate(() => Lesson.getState());
  const geometry = value => { const { space, yaw, pitch, zoom, ...mathematicalState } = value; return mathematicalState; };
  const pointSpan = svg => svg.evaluate(element => {
    const points = [...element.querySelectorAll('circle[data-space-point]')].map(point => {
      const box = point.getBoundingClientRect(); return [box.x + box.width / 2, box.y + box.height / 2];
    });
    return Math.max(...points.map(point => point[0])) - Math.min(...points.map(point => point[0]))
      + Math.max(...points.map(point => point[1])) - Math.min(...points.map(point => point[1]));
  });
  const edgeVisibility = svg => svg.evaluate(element => {
    const result = {};
    for (const node of element.querySelectorAll('path[data-space-edge]')) {
      const layer = node.closest('[data-space-layer]').getAttribute('data-space-layer');
      if (!['visible', 'hidden'].includes(layer)) continue;
      const edge = result[node.dataset.spaceEdge] ||= { visible: 0, hidden: 0 };
      edge[layer] = (node.getAttribute('d')?.match(/M/g) || []).length;
    }
    return result;
  });
  for (const id of [10, 17]) {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator(`[data-question="${id}"]`).click();
    await settle();
    const svg = page.locator(`#q${id}-svg`), initial = await state(), before = await edgeVisibility(svg);
    const initialSpan = await pointSpan(svg);
    assert.equal(await svg.getAttribute('data-renderer'), 'three-svg-depth');
    assert.ok(Object.values(before).some(edge => edge.hidden > 0), `Q${id} should expose hidden edge segments`);
    const box = await svg.boundingBox();
    assert.ok(box);
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x + 400, center.y + 35, { steps: 24 });
    await page.mouse.up();
    await settle();
    const rotated = await state(), after = await edgeVisibility(svg);
    const rotatedSpan = await pointSpan(svg);
    assert.notEqual(rotated.space.yaw, initial.space.yaw);
    assert.deepEqual(geometry(rotated), geometry(initial), `Rotating Q${id} changed its mathematical construction`);
    assert.ok(Object.keys(before).some(edge => before[edge].visible !== after[edge]?.visible || before[edge].hidden !== after[edge]?.hidden),
      `Q${id}: rotating should change actual visible/hidden path segments, not only projected coordinates`);

    await page.mouse.move(center.x, center.y);
    await page.mouse.wheel(0, -180);
    await page.waitForFunction(oldZoom => Lesson.getState().space.zoom !== oldZoom, rotated.space.zoom);
    await settle();
    assert.ok(await pointSpan(svg) > rotatedSpan * 1.05, `Q${id} zoom changed state without visibly enlarging its projected points`);
    assert.deepEqual(geometry(await state()), geometry(initial), `Zooming Q${id} changed its mathematical construction`);
    await page.locator(`#q${id}-view`).click();
    await settle();
    assert.deepEqual((await state()).space, initial.space, `Q${id} restore view did not reset rotation and zoom`);
    assert.ok(Math.abs(await pointSpan(svg) - initialSpan) < .1, `Q${id} restore view did not restore the actual projected points`);

    const beforeTheme = await state();
    await page.locator('#themeButton').click();
    await settle();
    assert.deepEqual(await state(), beforeTheme, `Changing theme modified Q${id} geometry or camera`);

    // Retain the real old node across navigation, watching DOM mutations rather
    // than trusting renderer diagnostics or its own lifecycle flags.
    const old = await svg.elementHandle();
    await old.evaluate(element => {
      element.__spaceAuditCount = 0;
      element.__spaceAuditObserver = new MutationObserver(records => { element.__spaceAuditCount += records.length; });
      element.__spaceAuditObserver.observe(element, { attributes: true, childList: true, subtree: true });
    });
    await page.locator('[data-question="12"]').click();
    await page.setViewportSize({ width: 1280, height: 800 });
    await old.evaluate(element => element.dispatchEvent(new WheelEvent('wheel', { deltaY: -200, bubbles: true, cancelable: true })));
    await settle();
    const lifecycle = await old.evaluate(element => {
      const result = { connected: element.isConnected, mutations: element.__spaceAuditCount };
      element.__spaceAuditObserver.disconnect();
      return result;
    });
    assert.equal(lifecycle.connected, false);
    assert.equal(lifecycle.mutations, 0, `Q${id} continued to mutate its old SVG after navigation`);
    await old.dispose();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log('PASS: Q10/Q17 real rotation changes edge visibility, wheel zoom, view reset, geometry/theme invariance, detached renderer disposal, offline operation.');
  await browser.close();
})().catch(reportFailure);
