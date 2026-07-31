// List of pages to screenshot for visual regression — the single place where
// all screenshot URLs live. Add/remove entries here; the test file loops over
// this list automatically.
//
// Fields per entry:
//   name            used as the screenshot filename (keep it short, no spaces)
//   path            URL path relative to the shop's base URL
//   waitForSelector (optional) a CSS selector to wait for before screenshotting,
//                   useful for pages that load key content asynchronously
//   shots           (optional) declares that this page needs MULTIPLE images.
//                   Provide an array of shots; the tool captures + compares one
//                   screenshot per shot. Omit it for the normal single-image
//                   case. Each shot is:
//                     { suffix: 'variant-name',        // appended to the filename
//                       action: async (page) => {...}  // optional: interact
//                     }                                //   before this shot
//                   With shots, files are saved as  <name>-<suffix>.png
//                   (e.g. configurator-default.png, configurator-anthrazit.png).
//                   The optional `action` lets a page like the configurator
//                   select a variant before each shot — leave it out to just
//                   capture the page as-is.

module.exports = [
  { name: 'homepage', path: '/' },

  // Top-level category pages (one per main nav section)
  { name: 'category-briefkaesten', path: '/briefkasten' },
  { name: 'category-paketboxen', path: '/paketboxen' },
  { name: 'category-sprechanlagen', path: '/tuersprechanlagen' },
  { name: 'category-tuerklingeln', path: '/tuerklingel' },
  { name: 'category-hausnummern', path: '/hausnummern-schilder-schriftzuege' },
  { name: 'category-muelltonnenboxen', path: '/muelltonnenbox' },

  // A representative subcategory / listing page (filters, product grid)
  { name: 'subcategory-mehrfamilien-briefkaesten', path: '/briefkasten-zweifamilienhaus' },

  // A real product detail page (price, gallery, variant picker, etc.)
  {
    name: 'pdp-standbriefkasten-2er',
    path: '/metzler-standbriefkasten-2er-vertikal-mit-austauschbarem-namensschild',
  },

  // Cart (empty state) — catches layout breaks in the checkout entry point
  { name: 'cart-empty', path: '/Warenkorb' },

  // Static / informational pages
  { name: 'contact', path: '/Kontakt' },
  { name: 'faq', path: '/faq' },

  // ---------------------------------------------------------------------------
  // Example of a page that needs MULTIPLE images (e.g. a product configurator,
  // where each option/variant should be captured). Uncomment and fill in the
  // real `path` and the `action` steps (the selectors to click) when ready.
  // Each shot produces its own baseline: configurator-default.png,
  // configurator-anthrazit.png, configurator-with-nameplate.png, ...
  //
  // {
  //   name: 'configurator',
  //   path: '/your-configurator-url',
  //   shots: [
  //     { suffix: 'default' }, // no action = capture the initial state
  //     {
  //       suffix: 'anthrazit',
  //       action: async (page) => {
  //         await page.getByRole('button', { name: 'Anthrazit' }).click();
  //       },
  //     },
  //     {
  //       suffix: 'with-nameplate',
  //       action: async (page) => {
  //         await page.getByLabel('Namensschild').check();
  //       },
  //     },
  //   ],
  // },
];
