# Metzler Product Interaction Tests

> **Where this lives:** this whole `product-interactions/` folder is
> self-contained (its own `package.json`, its own `playwright.config.js`) and
> is meant to sit **inside your existing `screenshots-` repo**, e.g. at
> `screenshots/product-interactions/`. It is completely separate from the
> visual-regression suite: it has its own dependencies and its own config, does
> **not** run as part of the nightly visual-regression workflow, and is meant to
> be **triggered manually**. You cd into this folder to run it.

End-to-end interaction tests for product pages on edelstahl-tuerklingel.de.
Each step both **asserts** (fails if broken — a real test) and **screenshots**
(visual record, saved to `screenshots/`).

Four flows:

1. **Colour selection → redirect** — picks a colour and asserts the redirect to
   the colour child page actually fired. (This is the flow you said sometimes
   doesn't trigger — see note below.)
2. **Product tabs** — clicks each tab (Beschreibung, Bewertungen, Befestigung,
   Downloads, Frage zum Artikel) and asserts its panel becomes visible.
3. **Configurator** — opens "Jetzt anpassen" and walks the ~7 numbered steps,
   screenshotting each.
4. **Add to cart** — clicks "In den Warenkorb" and asserts the side-cart opens.
   Stops there (no checkout).

## Setup

From inside this folder (e.g. `screenshots/product-interactions/`):

```bash
cd screenshots/product-interactions   # wherever you placed it in the repo
npm install
npx playwright install chromium
```

## Run

```bash
npm test              # headless
npm run test:headed   # watch it click through in a real browser (great for debugging)
npm run report        # open the HTML report (screenshots, traces, videos on failure)
```

Because this folder has its own `package.json` and config, it runs independently
of the visual-regression suite in the repo root. Nothing here runs on a
schedule — you trigger it yourself.

Step screenshots land in `screenshots/`. On failure you also get a trace and a
video under `test-results/`.

## ⚠️ Before your first run: fill in 3 selectors

I built every step, but 3 elements weren't visible in the page HTML I could
read, so they're **placeholders** you must fill from DevTools. Until you do,
the steps that use them fail with a clear "PLACEHOLDER" message (they won't
silently pass). They're all in `tests/helpers.js`:

| Placeholder | What it is | How to find it |
|---|---|---|
| `colorSwatch` | a colour swatch on the product page | Right-click a colour icon → Inspect → copy a stable `class`/`id`/`data-*` |
| `colorSideMenuOption` | the colour option inside the side menu | Open the colour menu, inspect an option |
| `sideCart` | the side-cart panel after add-to-cart | Click "In den Warenkorb", inspect the panel that slides in |

Tip: run `npm run test:headed` so you can watch exactly where it gets stuck,
then inspect that element.

The **tabs flow works out of the box** — those use fixed `#tab-*` anchors that
were visible in the HTML.

## About the colour-redirect test (the intermittent one)

You mentioned the colour selection sometimes doesn't redirect to the child
page. This test **asserts** the redirect happened. So:

- **Green** = redirect fired correctly this run.
- **Red with "Colour redirect did not fire"** = the bug reproduced. That's a
  *real finding*, not a broken test. Because it's intermittent, `retries: 1`
  will re-attempt once; if it fails both times, it's reliably broken right now.

If you want to actively hunt the intermittent failure, temporarily raise
`retries` to 0 and run the single test in a loop:

```bash
npx playwright test -g "colour selection" --repeat-each=20
```

That runs it 20 times; the pass/fail count tells you how often the bug hits.

## Configurator: making it choose options (optional)

Right now the configurator flow opens, screenshots each step, and clicks
"Weiter" to advance — it doesn't *fill in* choices, because the per-field
selectors (font dropdown, radio options, etc.) weren't in the fetched HTML.
To make it actually configure, add field interactions where marked
`--- PLACEHOLDER: fill in field selection ---` in the spec. Build one step at a
time and run headed so you can see each choice take effect.

## Note on scope & etiquette

- These tests only *add to cart* — they never place an order.
- Run against the live site sparingly (each run adds to cart, opens the
  configurator, etc.). If you have the Docker staging environment running, point
  `baseURL` in `playwright.config.js` at it instead to avoid hitting production.
