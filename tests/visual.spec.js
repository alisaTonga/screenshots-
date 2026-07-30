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

  // Customer review / rating content changes between runs (new reviews, shifting
  // star distributions, rotating "most helpful" card, updating counts). This was
  // the sole cause of the PDP diff. Mask the review widgets so they don't trigger
  // false positives. Selectors are broad on purpose to catch the whole block.
  '#tab-votes',                        // the reviews tab panel/section
  '[id*="votes"]',                     // any votes-related container
  '.product--rating',                  // star-rating summary
  '.rating',                           // generic rating widgets
  '[class*="review"]',                 // review cards / lists
  '[class*="bewertung"]',              // German-named review blocks
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

  // Force lazy-loaded images to load. Many product images only start loading
  // once they scroll into view, so a full-page screenshot taken too early
  // captures blank tiles further down. We scroll the whole page top-to-bottom
  // in steps to trigger every lazy image, then scroll back up.
  await autoScroll(page);

  // Wait for all <img> elements to finish loading (or time out gracefully).
  await page
    .waitForFunction(
      () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
      { timeout: 20000 }
    )
    .catch(() => {});

  // Let network + fonts settle after the scroll-triggered loads
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// Scrolls the full page in small steps so lazy-loaded content is triggered,
// then returns to the top so the screenshot starts from the header.
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  await page.evaluate(() => window.scrollTo(0, 0));
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
