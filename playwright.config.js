const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,               // one retry helps filter out one-off network flakiness
  workers: 3,

  // Where baseline/diff/actual images are stored, organized by test file
  // and project (desktop-chrome / mobile) automatically.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',

  use: {
    baseURL: 'https://edelstahl-tuerklingel.de',
    screenshot: 'off',       // we take our own explicit screenshots per page
    trace: 'retain-on-failure',
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

  reporter: [['html', { open: 'never' }]],
});
