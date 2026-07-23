const path = require('path');
<<<<<<< HEAD
const fs = require('fs');

// Root folder for interaction-test screenshots. Mirrors the visual-regression
// layout: __screenshots__/<viewport>/<date>_<name>.png
const SHOTS_ROOT = path.join(__dirname, '..', '__screenshots__');

// Today's date as YYYY-MM-DD for the filename prefix
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
=======

// Folder where step screenshots are saved (one PNG per named step).
const SHOTS_DIR = path.join(__dirname, '..', 'screenshots');
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87

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

<<<<<<< HEAD
  // RELIABLE — the product image area has a gallery view and a "3D" view.
  // Seen in the page HTML as anchors #tab-gallery and #tab-configurator,
  // with the 3D toggle labelled "3D".
  media: {
    gallery: '#tab-gallery',
    threeD: '#tab-configurator',
    threeDLabel: '3D',
  },

  // PLACEHOLDER — the actual 3D canvas/viewer element inside the 3D tab.
  // After clicking "3D", inspect the rendered model container and set this.
  // Common patterns: 'canvas', '.3d-viewer canvas', '[data-3d] canvas'
  threeDCanvas: 'PLACEHOLDER_3d_canvas_selector',

=======
  // RELIABLE — buttons identified by their visible text
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
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

<<<<<<< HEAD
// Full-page screenshot saved as __screenshots__/<viewport>/<date>_<name>.png
// `testInfo` is Playwright's per-test info object — we read the project name
// from it (e.g. 'desktop-chrome' or 'mobile') to pick the subfolder.
async function shot(page, testInfo, name) {
  const viewport = testInfo.project.name;             // 'desktop-chrome' | 'mobile'
  const dir = path.join(SHOTS_ROOT, viewport);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${today()}_${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

module.exports = { SEL, SHOTS_ROOT, dismissOverlays, shot };
=======
// Full-page screenshot into the screenshots/ folder with a tidy name.
async function shot(page, name) {
  await page.screenshot({
    path: path.join(SHOTS_DIR, `${name}.png`),
    fullPage: true,
  });
}

module.exports = { SEL, SHOTS_DIR, dismissOverlays, shot };
>>>>>>> cdca23cb39b29eb9f4e061c4f74fe1114f212a87
