const { test, expect } = require('@playwright/test');
const pages = require('../pages.config');

// Selectors known (or likely) to change between runs regardless of real
// visual regressions — e.g. review counts, star ratings, hero video/carousel.
// These get masked (blacked out) before comparison so they don't cause false
// positives. Extend this list once you see noisy diffs in the HTML report.
const DYNAMIC_SELECTORS = [
  'img[src*="ts-logo"]',        // Trusted Shops rating widget
  'img[src*="trustpilot"]',     // Trustpilot rating widget
  'video',                      // autoplaying hero video
];

async function prepPage(page) {
  // Decline non-essential cookies if the consent banner appears
  const declineBtn = page.getByRole('button', { name: 'Ablehnen' });
  if (await declineBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await declineBtn.click();
  }

  // Dismiss the "visit our French shop" popup if it appears
  const nonBtn = page.getByRole('link', { name: 'Non' }).or(page.getByText('Non', { exact: true }));
  if (await nonBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await nonBtn.first().click().catch(() => {});
  }

  // Disable CSS animations/transitions so carousels/fades don't cause diffs
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }`,
  });

  // Let lazy-loaded images/fonts settle
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
}

for (const p of pages) {
  test(`visual: ${p.name}`, async ({ page }) => {
    await page.goto(p.path, { waitUntil: 'domcontentloaded' });
    await prepPage(page);

    if (p.waitForSelector) {
      await page.waitForSelector(p.waitForSelector, { timeout: 10000 }).catch(() => {});
    }

    const masks = DYNAMIC_SELECTORS.map((sel) => page.locator(sel));

    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      fullPage: true,
      mask: masks,
    });
  });
}
