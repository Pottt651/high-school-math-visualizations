const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'papers/baoshan-2026/index.html');
const screenshotDir = process.env.BAOSHAN_SPACE_SCREENSHOTS;
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-8, `${message}: ${a} != ${b}`);
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const sub = (a, b) => a.map((x, i) => x - b[i]);
const norm = a => Math.hypot(...a);
async function main() {
  const browser = await launchBrowser();
  const errors = [], requests = [];
  try {
    for (const size of [{ width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
      const page = await browser.newPage({ viewport: size });
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
      await page.goto(pathToFileURL(destination).href + '#q11');
      await page.waitForFunction(() => window.Lesson?.getState().question === 11);
      await page.evaluate(() => document.fonts.ready);
      if (!(await page.locator('body').evaluate(el => el.classList.contains('side-layout')))) await page.locator('#layoutButton').click();
      const state = () => page.evaluate(() => Lesson.getState());
      const select = async id => { await page.evaluate(id => Lesson.select(id), id); await page.waitForTimeout(120); };
      const input = async (id, value) => { await page.locator(id).evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(value)); };
      const capture = async name => { if (screenshotDir) { fs.mkdirSync(screenshotDir, { recursive: true }); await page.screenshot({ path: path.join(screenshotDir, `${size.width}-${name}.png`) }); } };
      let s = await state();
      near(dot(sub(s.A1, s.B), sub(s.Q, s.B)) / norm(sub(s.A1, s.B)) / norm(sub(s.Q, s.B)), .75, 'q11 cosine');
      near(norm(s.P), 3, 'q11 P on circle');
      near(dot(s.A, s.P) / 9, -.5, 'q11 central angle');
      near(s.height / norm(sub(s.A, s.B)), 1 / Math.sqrt(3), 'q11 slope');
      await page.locator('#b11-translate').click();
      await page.waitForTimeout(120);
      assert.equal((await state()).translated, true);
      await capture('q11');
      await select(12);
      for (const [lat, lon, offset] of [[-90, 0, 0], [-45, -180, 1.5], [0, 90, -2], [33, 77, .8], [90, 180, 0]]) {
        await input('#b12-latitude', lat); await input('#b12-longitude', lon); await input('#b12-offset', offset);
        s = await state();
        near(norm(sub(s.E2, s.K)), s.r, 'q12 sphere radius');
        near(dot(sub(s.E2, s.A), sub(s.E2, s.B)), 0, 'q12 orthogonal condition');
        near(s.E1[2] * 2, 12, 'q12 plane condition');
        assert.ok(s.distance + 1e-8 >= s.minimum, 'q12 universal lower bound');
      }
      await page.locator('#b12-nearest').click(); s = await state();
      near(s.distance, 15 / 4 - 3 * Math.sqrt(3) / 2, 'q12 reached minimum');
      await page.waitForTimeout(120); await capture('q12-minimum');
      await input('#b12-latitude', 25); await input('#b12-offset', 1.5);
      await page.waitForTimeout(120); await capture('q12-offset');
      await select(17);
      await page.locator('#keyButton').click();
      for (const height of [.6, 1.2, 2.5, 4]) {
        await input('#b17-height', height); s = await state();
        near(dot(sub(s.E, s.P), s.normal), 0, 'q17 line parallel to plane');
        near(norm(sub(s.G, s.F)), height / 2, 'q17 midsegment');
        near(norm(sub(s.H, s.E)), 2 / Math.sqrt(5), 'q17 distance invariant');
        near(dot(sub(s.H, s.E), sub(s.B, s.F)), 0, 'q17 perpendicular foot');
        near(s.H[0] + 2 * s.H[1], 2, 'q17 H in target plane');
        assert.ok(norm(sub(sub(s.E, s.P), sub(s.B, s.T))) < 1e-8, 'q17 parallelogram PE = TB');
      }
      await input('#b17-height', 2.5); await page.waitForTimeout(120); await capture('q17-parallel');
      await page.locator('#b17-part').selectOption('2');
      await page.waitForTimeout(120); await capture('q17-distance');
      for (const id of [11, 12, 17]) {
        await select(id);
        assert.equal(await page.locator('.katex-error').count(), 0, `q${id} no TeX errors`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, `q${id} no horizontal overflow`);
        const data = await page.locator(`#b${id}-svg`).evaluate(svg => ({ renderer: svg.dataset.renderer, bad: [...svg.querySelectorAll('*')].some(el => [...el.attributes].some(a => /NaN|Infinity/.test(a.value))) }));
        assert.equal(data.renderer, 'three-svg-depth'); assert.equal(data.bad, false, `q${id} finite SVG`);
      }
      // Independent visual review targets: these were authored by another agent.
      for (const id of [16, 21]) { await select(id); await capture(`independent-q${id}`); }
      await page.locator('#b21-part').selectOption('2'); await page.waitForTimeout(120); await capture('independent-q21-part2');
      await page.locator('#b21-part').selectOption('3'); await page.waitForTimeout(120); await capture('independent-q21-part3');
      await page.locator('#b21-line').selectOption('tilt'); await page.waitForTimeout(120); await capture('independent-q21-tilted');
      await select(16); await page.locator('#b16-part').selectOption('geometric'); await page.waitForTimeout(120); await capture('independent-q16-geometric');
      await page.close();
    }
    assert.deepEqual(errors, [], 'No browser exceptions');
    assert.deepEqual(requests, [], 'No runtime network requests');
    console.log('Baoshan spatial models: q11, q12, q17 math, controls and offline browser checks passed at 1280x720 / 1920x1080.');
  } finally { await browser.close(); }
}
main().catch(reportFailure);
