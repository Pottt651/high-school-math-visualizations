const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.MATH_PLAYWRIGHT_PATH || 'playwright');

// A normal checkout uses `npx playwright install chromium`. Overrides also
// support an existing browser/runtime without depending on one machine's path.
async function launchBrowser() {
  const options = { headless: true };
  if (process.env.MATH_BROWSER_PATH) {
    options.executablePath = process.env.MATH_BROWSER_PATH;
  } else if (!fs.existsSync(chromium.executablePath()) && process.platform === 'win32') {
    const roots = [process.env.ProgramW6432, process.env.ProgramFiles,
      process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA].filter(Boolean);
    const chrome = roots.map(root => path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'))
      .find(candidate => fs.existsSync(candidate));
    if (chrome) options.executablePath = chrome;
  }
  return chromium.launch(options);
}

function reportFailure(error) {
  // Keep useful assertion messages while avoiding machine-specific paths in logs.
  let message = String(error.message || error);
  for (const [location, label] of [[path.resolve(__dirname, '..'), '<project>'], [os.homedir(), '<home>']]) {
    for (const spelling of [location, location.replaceAll('\\', '/')]) {
      message = message.split(spelling).join(label);
    }
  }
  console.error(message);
  process.exit(1);
}

module.exports = { launchBrowser, reportFailure };
