const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,               // one retry helps filter out one-off network flakiness

  // GitHub's hosted runners only have 2 vCPUs. Running 3 workers oversubscribed
  // them, so every page load competed for CPU/network and the heavy full-page
  // screenshots blew past the test timeout. Serialize on CI (1 worker); allow a
  // little parallelism locally where the machine is beefier.
  workers: process.env.CI ? 1 : 2,

  // Per-test budget. The default is 30s, but prepPage deliberately waits on lazy
  // images + network settling, which can legitimately take longer than 30s on a
  // cold external site from a CI runner. 90s gives those waits room without
  // masking a genuinely hung page.
  timeout: 90 * 1000,

  // Where baseline/diff/actual images are stored, organized by test file
  // and project (desktop-chrome / mobile) automatically.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',

  use: {
    baseURL: 'https://edelstahl-tuerklingel.de',
    screenshot: 'off',       // we take our own explicit screenshots per page
    trace: 'retain-on-failure',

    // Bound the individual navigation so a single hung goto surfaces as a clear
    // navigation error instead of silently consuming the whole test budget.
    navigationTimeout: 30 * 1000,
  },

  expect: {
    toHaveScreenshot: {
      // Small tolerance for anti-aliasing / font-rendering noise between runs.
      // Tighten this once the suite is stable if you want stricter checks.
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  reporter: [
    ['html', { open: 'never' }],
    // Copies the expected/actual/diff images of every failing page into a
    // browsable issues/<date>/<NN>_<page>/ folder. See issues-reporter.js.
    ['./issues-reporter.js'],
  ],
});
