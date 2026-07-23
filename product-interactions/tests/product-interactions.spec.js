const { test, expect } = require('@playwright/test');
const { SEL, dismissOverlays, shot } = require('./helpers');

// The two product pages you gave. `variantPath` is where the colour click
// should redirect to (the child page for the selected colour).
const PARENT_PRODUCT = '/metzler-briefkasten-aus-hochwertigem-stahl-siebert';
const ANTHRAZIT_CHILD = '/metzler-briefkasten-anthrazit-ral-7016-hochwertiger-stahl-siebert';

// Small guard so a not-yet-filled PLACEHOLDER selector fails with a clear
// message instead of a confusing "waiting for selector PLACEHOLDER..." error.
function assertFilled(selector, label) {
  if (String(selector).startsWith('PLACEHOLDER')) {
    throw new Error(
      `Selector for "${label}" is still a PLACEHOLDER. Open the live page, ` +
      `inspect the element, and set it in tests/helpers.js before running this step.`
    );
  }
}

// ===========================================================================
// FLOW 1 — Colour selection + redirect to the child (colour) page (HAPPY PATH)
// The redirect tends to fail when the colour is clicked before the page has
// fully loaded. This test deliberately waits for full load first, so it checks
// the intended behaviour: "when the page is ready, does selecting a colour
// redirect to the colour child page?" A failure here means the redirect is
// broken even on a fully-loaded page — a genuine bug worth reporting.
// ===========================================================================
<<<<<<< HEAD
test('colour selection redirects to the selected-colour child page', async ({ page }, testInfo) => {
=======
test('colour selection redirects to the selected-colour child page', async ({ page }) => {
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
  assertFilled(SEL.colorSwatch, 'colorSwatch');
  assertFilled(SEL.colorSideMenuOption, 'colorSideMenuOption');

  // Wait for the page to be FULLY loaded before touching anything. You noted
  // the redirect usually fails when the colour is clicked before the page has
  // finished loading (the click handler isn't attached yet). This test targets
  // the happy path, so we wait for network idle + the swatch to be ready before
  // clicking — mirroring "user waited for the page to settle".
  await page.goto(PARENT_PRODUCT, { waitUntil: 'load' });
  await dismissOverlays(page);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  // ensure the colour control is actually present & interactive before we click
  await page.locator(SEL.colorSwatch).first()
    .waitFor({ state: 'visible', timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(800); // small settle for late-attaching JS handlers
<<<<<<< HEAD
  await shot(page, testInfo, '01-parent-before-color');
=======
  await shot(page, '01-parent-before-color');
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87

  // Open the colour chooser — either the "Bitte Farbe wählen" prompt or a swatch
  const prompt = page.getByText(SEL.text.bitteFarbeWaehlen, { exact: false }).first();
  if (await prompt.isVisible({ timeout: 3000 }).catch(() => false)) {
    await prompt.click();
  } else {
    await page.locator(SEL.colorSwatch).first().click();
  }
<<<<<<< HEAD
  await shot(page, testInfo, '02-color-sidemenu-open');
=======
  await shot(page, '02-color-sidemenu-open');
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87

  // Pick a colour in the side menu
  await page.locator(SEL.colorSideMenuOption).first().click();

  // ASSERT: side menu closed AND we were redirected to a colour child page.
  // We wait for a URL change away from the parent path.
  await page.waitForURL((url) => url.pathname !== PARENT_PRODUCT, { timeout: 10000 })
    .catch(() => {
      throw new Error(
        'Colour redirect did not fire: URL stayed on the parent product page ' +
        'after selecting a colour. This reproduces the intermittent bug.'
      );
    });

  await dismissOverlays(page);
<<<<<<< HEAD
  await shot(page, testInfo, '03-color-child-page');
=======
  await shot(page, '03-color-child-page');
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
  expect(page.url()).not.toContain(PARENT_PRODUCT);
});

// ===========================================================================
// FLOW 2 — Product tabs (sticky nav at top of viewport)
// Each tab: click → assert hash + panel visible → screenshot.
// These selectors are RELIABLE (fixed #tab-* anchors), so this flow should
// work out of the box.
// ===========================================================================
<<<<<<< HEAD
test('all product tabs open and show their panel', async ({ page }, testInfo) => {
=======
test('all product tabs open and show their panel', async ({ page }) => {
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
  await page.goto(ANTHRAZIT_CHILD, { waitUntil: 'domcontentloaded' });
  await dismissOverlays(page);

  const tabs = [
    { name: 'beschreibung', hash: '#tab-description' },
    { name: 'bewertungen', hash: '#tab-votes' },
    { name: 'befestigung', hash: '#tab-befestigung' },
    { name: 'downloads', hash: '#tab-downloads-anleitungen' },
    { name: 'frage', hash: '#tab-questionOnItem' },
  ];

  for (const tab of tabs) {
    // Tabs are links to #tab-* anchors; click the one whose href ends with the hash
    const tabLink = page.locator(`a[href$="${tab.hash}"]`).first();
    if (!(await tabLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      // Some tabs may need the page scrolled a bit for the sticky nav to expose them
      await page.mouse.wheel(0, 600);
    }
    await tabLink.click();

    // ASSERT: the target panel exists and is visible
    const panel = page.locator(tab.hash);
    await expect(panel, `panel ${tab.hash} should be visible`).toBeVisible({ timeout: 8000 });

<<<<<<< HEAD
    await shot(page, testInfo, `tab-${tab.name}`);
=======
    await shot(page, `tab-${tab.name}`);
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
  }
});

// ===========================================================================
// FLOW 3 — Configurator ("Jetzt anpassen" → up to ~9 steps)
// "Jetzt anpassen" + the numbered step HEADERS are reliable (by text).
// The FORM FIELDS inside each step (dropdowns, radio options) are PLACEHOLDERs
// because the fetched HTML didn't expose their exact selectors. The test walks
// the steps it can, screenshots each, and clicks "Weiter" to advance. Fill in
// the per-step field selectors to make it actually choose options.
// ===========================================================================
<<<<<<< HEAD
test('configurator opens and steps can be walked', async ({ page }, testInfo) => {

=======
test('configurator opens and steps can be walked', async ({ page }) => {
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
  await page.goto(ANTHRAZIT_CHILD, { waitUntil: 'domcontentloaded' });
  await dismissOverlays(page);

  // Open the configurator
  const anpassen = page.getByText(SEL.text.jetztAnpassen, { exact: false }).first();
  await expect(anpassen, '"Jetzt anpassen" button should exist').toBeVisible({ timeout: 8000 });
  await anpassen.click();
  await page.waitForTimeout(1500);
<<<<<<< HEAD
  await shot(page, testInfo, 'config-01-opened');
=======
  await shot(page, 'config-01-opened');
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87

  // The configurator has these numbered steps (labels seen in the page):
  const stepLabels = [
    'Gravurdaten',
    'Smart-Briefkastenschloss',
    'Funk-Briefkastensensor',
    'Befestigung',
    'Erweiterungen & Zubehör',
    'Dekorieren & Verzieren',
    'Entwurf zur Freigabe',
  ];

  for (let i = 0; i < stepLabels.length; i++) {
    const label = stepLabels[i];

    // Assert the step header is present (confirms we're on/through this step)
    const header = page.getByText(label, { exact: false }).first();
    if (await header.isVisible({ timeout: 4000 }).catch(() => false)) {
<<<<<<< HEAD
      await shot(page, testInfo, `config-step-${String(i + 1).padStart(2, '0')}-${label.replace(/[^a-zA-Z]/g, '').slice(0, 12)}`);
=======
      await shot(page, `config-step-${String(i + 1).padStart(2, '0')}-${label.replace(/[^a-zA-Z]/g, '').slice(0, 12)}`);
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
    } else {
      console.warn(`  ⚠ configurator step "${label}" header not visible — layout may differ`);
    }

    // --- PLACEHOLDER: fill in field selection for this step here ---
    // e.g. for step 1 (Gravurdaten) you might:
    //   await page.locator('#SELECT_schriftart').selectOption('Schriftart 1');
    //   await page.fill('#INPUT_gravurtext', 'Mustermann');
    // Leave blank to just screenshot and advance.

    // Advance to the next step via the step's "Weiter" button, if present
    const weiter = page.getByRole('link', { name: SEL.text.weiter })
      .or(page.getByText(SEL.text.weiter, { exact: true }));
    if (await weiter.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await weiter.first().click().catch(() => {});
      await page.waitForTimeout(1200);
    }
  }

<<<<<<< HEAD
  await shot(page, testInfo, 'config-99-final');
});

// ===========================================================================
// FLOW 5 — 3D model view on the product page
// The product image area has a "3D" toggle (anchor #tab-configurator) next to
// the normal gallery. This test switches to the 3D view and confirms the model
// viewer appears. Runs on both desktop and mobile.
// The 3D canvas selector is a PLACEHOLDER — fill it in from DevTools so the
// test can assert the viewer actually rendered (not just that the tab exists).
// ===========================================================================
test('3D model view opens on the product page', async ({ page }, testInfo) => {
  await page.goto(ANTHRAZIT_CHILD, { waitUntil: 'load' });
  await dismissOverlays(page);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

  // Click the "3D" toggle — try the anchor first, fall back to the visible label
  const threeDByHref = page.locator(`a[href$="${SEL.media.threeD}"]`).first();
  if (await threeDByHref.isVisible({ timeout: 5000 }).catch(() => false)) {
    await threeDByHref.click();
  } else {
    await page.getByText(SEL.media.threeDLabel, { exact: true }).first().click();
  }

  // Give the 3D viewer a moment to initialise (WebGL/model load)
  await page.waitForTimeout(3000);
  await shot(page, testInfo, 'pdp-siebert-3d-view');

  // ASSERT the 3D viewer actually rendered, if the selector is filled in.
  if (!String(SEL.threeDCanvas).startsWith('PLACEHOLDER')) {
    const canvas = page.locator(SEL.threeDCanvas).first();
    await expect(canvas, '3D model canvas should be visible').toBeVisible({ timeout: 10000 });
  } else {
    console.warn(
      '  ⚠ threeDCanvas selector is a PLACEHOLDER — screenshot taken, but the ' +
      '3D viewer presence was NOT asserted. Fill it in tests/helpers.js to make ' +
      'this a real check.'
    );
  }
=======
  await shot(page, 'config-99-final');
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
});

// ===========================================================================
// FLOW 4 — Add to cart → side-cart appears
// "In den Warenkorb" is reliable (by text). The side-cart container is a
// PLACEHOLDER — fill it in to let the test assert the cart actually opened.
// Stops after screenshotting the side-cart (no checkout).
// ===========================================================================
<<<<<<< HEAD
test('add to cart opens the side-cart', async ({ page }, testInfo) => {
=======
test('add to cart opens the side-cart', async ({ page }) => {
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
  await page.goto(ANTHRAZIT_CHILD, { waitUntil: 'domcontentloaded' });
  await dismissOverlays(page);

  const addBtn = page.getByText(SEL.text.inDenWarenkorb, { exact: false }).first();
  await expect(addBtn, '"In den Warenkorb" button should exist').toBeVisible({ timeout: 8000 });
  await addBtn.scrollIntoViewIfNeeded();
  await addBtn.click();
  await page.waitForTimeout(1500);

  assertFilled(SEL.sideCart, 'sideCart');
  const cart = page.locator(SEL.sideCart);
  await expect(cart, 'side-cart should become visible after add-to-cart')
    .toBeVisible({ timeout: 8000 });

<<<<<<< HEAD
  await shot(page, testInfo, 'cart-side-open');
=======
  await shot(page, 'cart-side-open');
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
});
