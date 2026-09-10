// Independent visual regression for the two changes requested in YP review.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const output = path.join(__dirname, 'screenshots/2025-yp-independent');
  fs.mkdirSync(output, { recursive: true });
  const browser = await launchBrowser();
  const errors = [];
  try {
    for (const width of [1280, 1920]) {
      const context = await browser.newContext({ viewport: { width, height: width === 1280 ? 720 : 1080 } });
      await context.setOffline(true);
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('request', request => { if (/^https?:/.test(request.url())) errors.push(request.url()); });
      const settle = () => page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const screenshot = async name => {
        await settle();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
        assert.equal(await page.locator('.katex-error').count(), 0);
        await page.screenshot({ path: path.join(output, `${width}-delta-${name}.png`) });
      };
      await page.goto(pathToFileURL(path.join(root, 'papers/yangpu-2025/index.html')).href);
      await page.locator('#questionNav [data-question="12"]').click();
      await page.locator('#yp25-12-part').selectOption('circle');
      await screenshot('q12-small');
      const circle = await page.locator('#yp25-12-svg ellipse').evaluateAll(elements =>
        Math.max(...elements.map(element => +element.getAttribute('rx'))));
      assert.ok(circle > (width === 1280 ? 60 : 90), `Small circle remains too small: ${circle}`);
      await page.locator('#yp25-12-far').click();
      await screenshot('q12-far');
      await page.locator('#yp25-12-small').click();
      await page.locator('#drawButton').click();
      const stages = [];
      for (let step = 0; step < 3; step++) {
        if (step) await page.locator('#constructionNext').click();
        await settle();
        stages.push(await page.locator('#yp25-12-svg').innerHTML());
      }
      assert.equal(new Set(stages).size, 3, 'All three construction stages must alter the actual figure');
      await page.locator('#drawButton').click();
      await page.locator('#questionNav [data-question="21"]').click();
      await page.locator('#yp25-21-part').selectOption('3');
      for (const kind of ['square', 'exp']) {
        await page.locator('#yp25-21-kind').selectOption(kind);
        await screenshot(`q21-${kind}`);
        const endpoints = await page.locator('#yp25-21-second circle[fill="var(--canvas)"]').count();
        assert.equal(endpoints, 2, 'Both excluded ratio-domain endpoints must remain open');
        assert.match(await page.locator('#yp25-21-second').textContent(), /0处仅示右极限/);
      }
      await page.locator('#drawButton').click();
      const ratioStages = [];
      for (let step = 0; step < 3; step++) {
        if (step) await page.locator('#constructionNext').click();
        await settle();
        ratioStages.push(await page.locator('.figures').innerHTML());
      }
      assert.equal(new Set(ratioStages).size, 3);
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log('Independent YP delta review passed: larger circle, open ratio endpoints, genuine construction stages, offline 720p/1080p.');
  } finally {
    await browser.close();
  }
})().catch(reportFailure);
