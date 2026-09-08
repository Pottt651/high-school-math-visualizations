const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { launchBrowser, reportFailure } = require('./browser-runtime.cjs');

const ids = [10, 11, 12, 16, 17, 18, 20, 21];
const storageKey = 'jiading-lesson-theme';

// Runs in the page so computed colors include custom properties and inheritance.
function inspectPresentation() {
  const visible = element => {
    const style = getComputedStyle(element);
    return element.getClientRects().length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const rgba = value => {
    const parts = value.match(/[\d.]+/g)?.map(Number);
    if (!parts || parts.length < 3) throw new Error(`Unsupported computed color: ${value}`);
    return [...parts.slice(0, 3), parts[3] ?? 1];
  };
  const over = (foreground, background) => {
    const alpha = foreground[3] + background[3] * (1 - foreground[3]);
    return [0, 1, 2].map(i => alpha ? (foreground[i] * foreground[3] + background[i] * background[3] * (1 - foreground[3])) / alpha : 0).concat(alpha);
  };
  const backgroundOf = element => {
    const ancestors = [];
    for (let current = element; current; current = current.parentElement) ancestors.push(current);
    return ancestors.reverse().reduce((background, current) => over(rgba(getComputedStyle(current).backgroundColor), background), [255, 255, 255, 1]);
  };
  const luminance = color => color.slice(0, 3).reduce((sum, value, i) => {
    const channel = value / 255;
    return sum + [0.2126, 0.7152, 0.0722][i] * (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  }, 0);
  const contrast = (foreground, background) => {
    const first = luminance(over(foreground, background)), second = luminance(background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  };
  const probe = document.createElement('span');
  probe.style.color = 'var(--plot-target)';
  document.body.append(probe);
  const targetColor = getComputedStyle(probe).color;
  probe.remove();
  const targets = [...document.querySelectorAll('#module .answer, .lesson .target, .lesson [style*="var(--plot-target)"]')]
    .filter(element => visible(element) && !element.closest('.figures'))
    .map(element => ({ element: element.className || element.tagName, color: getComputedStyle(element).color }));
  const plotTargets = [...document.querySelectorAll('#module .figures [fill="var(--plot-target)"], #module .figures [stroke="var(--plot-target)"], #module .figures [style*="var(--plot-target)"]')]
    .filter(visible).map(element => {
      const style = getComputedStyle(element);
      return element.getAttribute('fill') === 'var(--plot-target)' ? style.fill
        : element.getAttribute('stroke') === 'var(--plot-target)' ? style.stroke : style.color;
    });

  const failures = [], checked = new Set();
  const checkText = (element, text) => {
    const style = getComputedStyle(element), background = backgroundOf(element);
    const ratio = contrast(rgba(style.color), background);
    checked.add(element);
    if (ratio < 4.49) failures.push({ text: text.trim().slice(0, 32), ratio: +ratio.toFixed(2), color: style.color });
  };
  const walker = document.createTreeWalker(document.querySelector('.lesson'), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, element = node.parentElement;
    if (!node.textContent.trim() || !element || checked.has(element) || !visible(element)
      || element.closest('.figures, .katex-mathml, [aria-hidden="true"], :disabled, [aria-disabled="true"], script, style')) continue;
    checkText(element, node.textContent);
  }
  for (const element of document.querySelectorAll('input[type="text"], input[type="number"], select')) {
    if (visible(element) && !element.disabled && !checked.has(element)) checkText(element, element.value);
  }
  return {
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    targetColor, targets, plotTargets, contrastFailures: failures, textCount: checked.size,
    invalidSvg: [...document.querySelectorAll('#module .figures svg')].some(svg => /\bNaN\b|\bInfinity\b/.test(svg.innerHTML))
  };
}

(async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.setOffline(true);
  const page = await context.newPage(), errors = [], external = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('request', request => { if (/^https?:/.test(request.url())) external.push(request.url()); });
  const file = pathToFileURL(path.resolve(__dirname, '../嘉定一模_互动讲题.html')).href;
  const shots = path.join(__dirname, 'simple-shots');
  fs.mkdirSync(shots, { recursive: true });
  await page.goto(file);
  const settle = () => page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    // Contrast concerns the completed button/theme state, not an interpolated
    // foreground/background pair halfway through a short CSS transition.
    await Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect.getComputedTiming().endTime))
      .map(animation => animation.finished.catch(() => {})));
    await new Promise(resolve => requestAnimationFrame(resolve));
  });
  const theme = () => page.locator('html').getAttribute('data-theme');
  const state = () => page.evaluate(() => Lesson.getState());
  const select = async id => { await page.locator(`[data-question="${id}"]`).click(); await settle(); };
  const changeTheme = async expected => {
    const before = await state();
    await page.locator('#themeButton').click();
    await page.waitForFunction(value => document.documentElement.dataset.theme === value, expected);
    await settle();
    assert.deepEqual(await state(), before, `Switching to ${expected} reset the mathematical state`);
    assert.match(await page.locator('#themeButton').innerText(), expected === 'dark' ? /深色/ : /浅色/);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), expected);
  };
  await settle();
  assert.equal(await theme(), 'dark', 'A fresh browser context should start in dark mode');
  assert.match(await page.locator('#themeButton').innerText(), /深色/);

  // Preserve non-default parameters, iteration position, and revealed reasoning.
  await select(16);
  await page.selectOption('#q16-r', '3');
  await page.locator('[data-q16-preset="1/3"]').click();
  await page.locator('#q16-next').click();
  await page.locator('#keyButton').click();
  await changeTheme('light');
  await select(20);
  assert.equal(await theme(), 'light', 'Changing questions must keep the theme');
  await page.reload(); await settle();
  assert.equal(await theme(), 'light', 'A refresh must restore the selected theme');
  await page.locator('#q20-lock').uncheck();
  await page.locator('#q20-position').evaluate(element => {
    element.value = '.3'; element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#q20-circle').check();
  await changeTheme('dark');
  await page.reload(); await settle();
  assert.equal(await theme(), 'dark', 'Dark mode must also survive a refresh');

  let layouts = 0, textChecks = 0;
  for (const mode of ['dark', 'light']) {
    if (await theme() !== mode) await changeTheme(mode);
    for (const id of ids) {
      await select(id);
      if (id === 17) await page.selectOption('#q17-part', '2');
      if (id === 20) await page.locator('#q20-circle').check();
      for (const revealed of [false, true]) {
        if (revealed) await page.locator('#keyButton').click();
        await settle();
        const result = await page.evaluate(inspectPresentation);
        const label = `${mode}, q${id}, revealed=${revealed}`;
        assert.ok(result.width <= 1367, `Horizontal overflow: ${label}, ${result.width}px`);
        assert.ok(result.height <= 769, `Vertical overflow: ${label}, ${result.height}px`);
        assert.equal(result.invalidSvg, false, `Invalid geometry: ${label}`);
        assert.ok(result.targets.length > 0, `Missing answer/target: ${label}`);
        // Q18 seeks a frequency parameter, shown in the controls and answer;
        // its extrema use their own distinct colors rather than target red.
        if (id !== 18) assert.ok(result.plotTargets.length > 0, `Missing target color in figure: ${label}`);
        for (const target of result.targets) assert.equal(target.color, result.targetColor, `Inconsistent ${target.element} color: ${label}`);
        for (const color of result.plotTargets) assert.equal(color, result.targetColor, `Inconsistent plot target color: ${label}`);
        assert.deepEqual(result.contrastFailures, [], `Text contrast below 4.5:1: ${label}`);
        assert.ok(result.textCount > 10, `Too little visible text checked: ${label}`);
        textChecks += result.textCount;
        layouts++;
      }
      if ([10, 16, 20].includes(id)) await page.screenshot({ path: path.join(shots, `theme-${mode}-q${id}.png`), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const mode of ['dark', 'light']) {
    if (await theme() !== mode) await changeTheme(mode);
    for (const id of ids) {
      await select(id);
      if (id === 20) await page.locator('#q20-circle').check();
      for (const revealed of [false, true]) {
        if (revealed) await page.locator('#keyButton').click();
        await settle();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 391), `Mobile horizontal overflow: ${mode}, q${id}, revealed=${revealed}`);
        layouts++;
      }
    }
    await page.screenshot({ path: path.join(shots, `theme-${mode}-mobile.png`), fullPage: true });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(`PASS: offline light/dark modes, refresh persistence, mathematical state preservation, ${layouts} desktop/mobile layouts, consistent target colors, ${textChecks} text contrast checks.`);
  await browser.close();
})().catch(reportFailure);
