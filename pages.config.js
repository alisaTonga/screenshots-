// List of pages to screenshot for visual regression.
// Add/remove entries here — the test file loops over this list automatically.
//
// name: used as the screenshot filename (keep it short, no spaces)
// path: URL path relative to the shop's base URL
// waitForSelector (optional): a CSS selector to wait for before taking the
//   screenshot, useful for pages that load key content asynchronously

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
];
