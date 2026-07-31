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

  // Wait for images to finish loading before screenshotting. Two subtleties that
  // previously made this hang for the full timeout on almost every page:
  //
  //  1. Playwright's signature is waitForFunction(fn, arg, options). The options
  //     object MUST be the THIRD argument — passing it second (as it was) makes
  //     it the page-function ARG and silently falls back to the default 30s
  //     timeout, which on its own blew the old 30s per-test budget.
  //
  //  2. The predicate must not require every image to have loaded *successfully*.
  //     A broken/zero-size image (e.g. the Bing UET tracking pixel this shop
  //     embeds) is `complete === true` but `naturalWidth === 0`, so the old
  //     `complete && naturalWidth > 0` check was permanently false and never
  //     resolved. We now just wait for images to *finish* (complete), and skip
  //     lazy images entirely — the only perpetually-lazy ones here are the
  //     review/rating widget logos, which are masked out of the diff anyway.
  //
  // Non-fatal + bounded: a stray straggler costs at most 10s and we proceed.
  await page
    .waitForFunction(
      () => Array.from(document.images).every((img) => img.complete || img.loading === 'lazy'),
      undefined,
      { timeout: 10000 }
    )
    .catch(() => {});

  // Ensure the load event has fired (cheap + deterministic; goto only waited for
  // domcontentloaded). Best-effort.
  await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});

  // Best-effort "let the network settle" pass. This shop runs analytics, chat and
  // tracking scripts that may keep polling forever, so networkidle can legitimately
  // NEVER be reached. We give it a short budget and swallow the timeout — a page
  // that never idles must not fail the test. The image wait above already
  // guarantees the visible content is loaded.
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  // Small final settle for late fonts/layout shifts.
  await page.waitForTimeout(500);
}

// Scrolls the full page in small steps so lazy-loaded content is triggered,
// then returns to the top so the screenshot starts from the header.
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const start = Date.now();
      const MAX_MS = 15000; // hard cap so an infinite-scroll / very tall page can't hang here
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        // Stop once we've covered the page height OR hit the time cap.
        if (total >= document.body.scrollHeight || Date.now() - start > MAX_MS) {
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
  // A page can declare multiple `shots` (e.g. a configurator, one image per
  // variant). If it doesn't, we fall back to a single implicit shot so the
  // common one-image-per-page case stays unchanged.
  const shots = Array.isArray(p.shots) && p.shots.length ? p.shots : [{ suffix: null }];

  for (const shot of shots) {
    const title = shot.suffix ? `visual: ${p.name} [${shot.suffix}]` : `visual: ${p.name}`;
    const fileName = shot.suffix ? `${p.name}-${shot.suffix}.png` : `${p.name}.png`;

    test(title, async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      await prepPage(page);

      if (p.waitForSelector) {
        await page.waitForSelector(p.waitForSelector, { timeout: 10000 }).catch(() => {});
      }

      // Optional per-shot interaction (e.g. pick a configurator variant), then
      // re-settle so the changed content is fully loaded before we screenshot.
      if (typeof shot.action === 'function') {
        await shot.action(page);
        await prepPage(page);
      }

      const masks = DYNAMIC_SELECTORS.map((sel) => page.locator(sel));

      await expect(page).toHaveScreenshot(fileName, {
        fullPage: true,
        mask: masks,
      });
    });
  }
}
