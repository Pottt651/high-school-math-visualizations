const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');

const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'papers/catalog.json'), 'utf8').replace(/^\uFEFF/, ''));
const paper = catalog.find(entry => entry.id === 'jiading-2025');
const expectedQuestions = [10, 11, 12, 16, 17, 18, 20, 21];
const directoryURL = pathToFileURL(path.join(root, 'index.html')).href;
const paperURL = new URL(paper.href, directoryURL).href;
const themeKey = 'math-visualizations-theme', legacyThemeKey = 'jiading-lesson-theme';

(async () => {
  assert.ok(Array.isArray(catalog));
  assert.ok(paper, 'The existing Jiading case must remain in the catalog');
  assert.equal(new Set(catalog.map(entry => entry.id)).size, catalog.length, 'Paper identifiers must be unique');
  assert.equal(paper.href, 'papers/jiading-2025/index.html');
  assert.deepEqual(paper.questions.map(question => question.id), expectedQuestions);
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.setOffline(true);
  const page = await context.newPage(), errors = [], external = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
  const settle = () => page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const theme = () => page.locator('html').getAttribute('data-theme');
  const noHorizontalOverflow = async label => {
    await settle();
    const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    assert.ok(size.content <= size.viewport + 1, `${label} overflows horizontally: ${JSON.stringify(size)}`);
  };
  const assertCatalogMatchesFiles = async () => {
    const displayed = await page.locator('#paperList .paper').evaluateAll(elements => elements.map(element => ({
      id: element.dataset.paperId,
      title: element.querySelector('h3').textContent,
      questions: [...element.querySelectorAll('a.question-link')].map(link => ({ pathname: new URL(link.href).pathname, hash: new URL(link.href).hash }))
    })));
    assert.equal(displayed.length, catalog.length, 'The directory should show exactly the registered papers');
    for (const entry of catalog) {
      const actual = displayed.find(item => item.id === entry.id);
      assert.ok(actual, `Missing registered paper ${entry.id}`);
      assert.equal(actual.title, entry.title);
      const destination = new URL(entry.href, directoryURL).pathname;
      assert.deepEqual(actual.questions, entry.questions.map(question => ({ pathname: destination, hash: `#q${question.id}` })),
        `Question links for ${entry.id} must stay inside that paper's own page`);
    }
  };
  await page.goto(directoryURL);
  await settle();
  assert.equal(await page.title(), '高中数学题可视化');
  assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), '高中数学题可视化');
  await assertCatalogMatchesFiles();
  await noHorizontalOverflow('Desktop directory');

  const search = page.getByRole('searchbox', { name: '查找试卷或题目' });
  await search.fill('三棱柱');
  assert.equal(await page.locator('.question-link').count(), 1);
  assert.equal(await page.locator('.question-link').getAttribute('href'), `${paper.href}#q17`);
  await search.fill('不存在的主题-zzzz');
  assert.equal(await page.locator('.question-link').count(), 0);
  assert.equal(await page.locator('#emptyState').isVisible(), true);
  await page.getByRole('button', { name: '清除搜索', exact: true }).click();
  assert.equal(await search.inputValue(), '');
  assert.equal(await page.locator('#emptyState').isVisible(), false);
  await assertCatalogMatchesFiles();

  // A real directory link, followed by the lesson's visible return link.
  await page.locator(`a.question-link[href="${paper.href}#q17"]`).click();
  await page.waitForURL(`${paperURL}#q17`);
  await settle();
  assert.equal(await page.evaluate(() => Lesson.getState().question), 17);
  assert.deepEqual(await page.locator('#questionNav [data-question]').evaluateAll(elements => elements.map(element => Number(element.dataset.question))), expectedQuestions);
  assert.match(await page.locator('#sourceLine').innerText(), /嘉定/);
  assert.equal(await page.locator('.brand h1').innerText(), '高中数学题可视化');
  await noHorizontalOverflow('Desktop lesson');
  await page.locator('a.brand').click();
  await page.waitForURL(directoryURL);
  await assertCatalogMatchesFiles();

  await page.setViewportSize({ width: 390, height: 844 });
  await noHorizontalOverflow('Mobile directory');
  await page.locator(`a.question-link[href="${paper.href}#q17"]`).click();
  await page.waitForURL(`${paperURL}#q17`);
  await noHorizontalOverflow('Mobile lesson');
  await page.locator('a.brand').click();
  await page.waitForURL(directoryURL);
  await noHorizontalOverflow('Mobile return to directory');

  // Existing local bookmarks retain both their default question and explicit hash.
  await page.setViewportSize({ width: 1366, height: 768 });
  for (const [filename, defaultQuestion] of [['嘉定一模_互动讲题.html', 10], ['嘉定一模_第20题_交互样章.html', 20]]) {
    const legacyURL = pathToFileURL(path.join(root, filename)).href;
    await page.goto(legacyURL);
    assert.equal(await page.evaluate(() => Lesson.getState().question), defaultQuestion, `${filename} changed its default question`);
    await page.goto(`${legacyURL}#q12`);
    assert.equal(await page.evaluate(() => Lesson.getState().question), 12, `${filename} ignored its question hash`);
    await page.locator('a.brand').click();
    await page.waitForURL(directoryURL);
  }

  // Seed each real entry point, then reload: do not inject a preference on every
  // navigation, which could hide a broken migration or a reset of the new key.
  for (const url of [directoryURL, paperURL]) {
    await page.goto(url);
    await page.evaluate(({ current, old }) => {
      localStorage.removeItem(current);
      localStorage.setItem(old, 'light');
    }, { current: themeKey, old: legacyThemeKey });
    await page.reload();
    assert.equal(await theme(), 'light', 'A saved legacy light preference must still be honored');
    await page.locator('#themeButton').click();
    assert.equal(await theme(), 'dark');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), themeKey), 'dark', 'Theme changes must use the project-wide key');
    await page.reload();
    assert.equal(await theme(), 'dark', 'The new preference must take precedence over the old one after reload');
  }
  await page.locator('a.brand').click();
  await page.waitForURL(directoryURL);
  assert.equal(await theme(), 'dark', 'Returning to the directory must retain the project preference');
  await page.locator('#themeButton').click();
  await page.locator(`a.question-link[href="${paper.href}#q17"]`).click();
  await page.waitForURL(`${paperURL}#q17`);
  assert.equal(await theme(), 'light', 'The lesson must honor a theme selected in the directory');
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log('PASS: offline project directory/search/return links, registered-paper question isolation, desktop/mobile layouts, legacy defaults/hashes, shared theme preference and legacy fallback.');
  await browser.close();
})().catch(reportFailure);
