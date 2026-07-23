const path = require('path');

// Folder where step screenshots are saved (one PNG per named step).
const SHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// ---------------------------------------------------------------------------
// SELECTORS
//
// Two tiers:
//   RELIABLE  — read directly off the live page HTML; safe to use as-is.
//   PLACEHOLDER — I could NOT see the exact element in the fetched HTML.
//                 Fill these in from DevTools (right-click element → Inspect →
//                 copy a stable id/class/data-attribute). Until you do, the
//                 steps using them will fail with a clear "PLACEHOLDER" message
//                 rather than silently passing.
// ---------------------------------------------------------------------------
const SEL = {
  // RELIABLE — tab navigation uses fixed hash anchors on this shop
  tabs: {
    beschreibung: '#tab-description',
    bewertungen: '#tab-votes',
    befestigung: '#tab-befestigung',
    downloads: '#tab-downloads-anleitungen',
    frage: '#tab-questionOnItem',
  },

  // RELIABLE — buttons identified by their visible text
  text: {
    jetztAnpassen: 'Jetzt anpassen',
    inDenWarenkorb: 'In den Warenkorb',
    bitteFarbeWaehlen: 'Bitte Farbe wählen',
    weiter: 'Weiter',
  },

  // PLACEHOLDER — the colour swatches. The HTML shows colour NAMES but not the
  // clickable element. Inspect a swatch on the live page and set this to match.
  // Example guesses (verify!): '.product--variations img', '[data-variation] a'
  colorSwatch: 'PLACEHOLDER_color_swatch_selector',

  // PLACEHOLDER — inside the colour side-menu, the option to actually pick.
  colorSideMenuOption: 'PLACEHOLDER_color_sidemenu_option_selector',

  // PLACEHOLDER — the side-cart / offcanvas that appears after add-to-cart.
  // Inspect it after clicking "In den Warenkorb". Common patterns for this
  // shop family: '.offcanvas--cart', '#cart-offcanvas', '.basket--offcanvas'
  sideCart: 'PLACEHOLDER_side_cart_selector',
};

async function dismissOverlays(page) {
  // Cookie banner → decline non-essential (privacy-preserving + deterministic)
  const decline = page.getByRole('button', { name: 'Ablehnen' });
  if (await decline.isVisible({ timeout: 6000 }).catch(() => false)) {
    await decline.click().catch(() => {});
  }
  // "Visit our French shop" popup → dismiss
  const non = page.getByText('Non', { exact: true });
  if (await non.first().isVisible({ timeout: 2500 }).catch(() => false)) {
    await non.first().click().catch(() => {});
  }
  // Kill animations for stable screenshots
  await page
    .addStyleTag({
      content: `*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;}`,
    })
    .catch(() => {});
}

// Full-page screenshot into the screenshots/ folder with a tidy name.
async function shot(page, name) {
  await page.screenshot({
    path: path.join(SHOTS_DIR, `${name}.png`),
    fullPage: true,
  });
}

module.exports = { SEL, SHOTS_DIR, dismissOverlays, shot };
