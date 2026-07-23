const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,        // interaction flows are heavier; keep it calm
  retries: 1,                  // absorb one-off flakiness; a real bug still fails on retry
  workers: 2,
  timeout: 90000,              // these flows are long (configurator has many steps)

  use: {
    baseURL: 'https://edelstahl-tuerklingel.de',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
  },

  // Screenshots taken by the tests land next to the report so you can browse them.
  outputDir: './test-results',

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

  reporter: [['html', { open: 'never' }], ['list']],
});
