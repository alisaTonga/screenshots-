# Metzler Visual Regression Suite

Automated screenshot comparison for edelstahl-tuerklingel.de. Takes full-page
screenshots of key pages on desktop and mobile, and flags anything that
visually changed since the last approved baseline.

Covers: homepage, all 6 top-level category pages, one filtered subcategory
listing, a real product detail page, the empty cart, contact, and FAQ — each
on desktop (1920×1080) and mobile (iPhone 13 viewport). 24 screenshots per run.

---

## ⚠️ Important: baselines are OS-specific

Playwright screenshots render slightly differently on Windows, macOS, and
Linux (font hinting, anti-aliasing). A baseline created on your Windows
machine will **not** cleanly match a comparison run on GitHub's Ubuntu
runners — every run would show false-positive diffs.

**Pick one consistent environment and stick to it:**

- **Recommended: run everything in Docker**, locally and in CI, so your
  machine and GitHub Actions use the identical rendering environment. See
  [Running via Docker](#running-via-docker-recommended) below.
- Alternative: only ever generate/update the baseline via the
  `Update Visual Baseline` GitHub Action (Ubuntu), never locally. Use your
  local run just to eyeball pages, not to produce the committed baseline.

---

## Option A — Run locally (native, no Docker)

Use this for quick manual checks. Don't commit baselines generated this way
if you're also comparing in CI on Ubuntu — see the warning above.

```bash
npm install
npx playwright install chromium

npm run update-baseline   # first time: creates baseline images
npm test                  # every time after: compares against baseline
npm run report            # opens HTML report with side-by-side diffs
```

## Option B — Run via Docker (recommended)

This matches the exact environment GitHub Actions uses, so your local
baseline and CI comparisons agree.

```bash
docker run --rm -it \
  -v "$(pwd):/work" -w /work \
  mcr.microsoft.com/playwright:v1.48.0-jammy \
  bash -c "npm install && npm run update-baseline"
```

Then to compare on a later day:

```bash
docker run --rm -it \
  -v "$(pwd):/work" -w /work \
  mcr.microsoft.com/playwright:v1.48.0-jammy \
  bash -c "npm install && npm test"
```

Open `playwright-report/index.html` in a browser afterward — it's a static
file, no Docker needed to view it.

## Option C — Automated via GitHub Actions (no manual runs at all)

Two workflows are included in `.github/workflows/`:

1. **`visual-regression.yml`** — runs automatically:
   - every day at 05:00 UTC
   - on every push to `main`
   - or manually, via the **Actions** tab → *Visual Regression* → **Run workflow**

   It compares against whatever baseline is committed in
   `tests/__screenshots__/`. On failure, it uploads the HTML report as a
   downloadable artifact (Actions tab → the failed run → *Artifacts* →
   `playwright-report` → download → unzip → open `index.html`).

2. **`update-baseline.yml`** — manual only (Actions tab → *Update Visual
   Baseline* → **Run workflow**). Run this deliberately after you ship an
   intentional design change — it regenerates screenshots on Ubuntu and
   commits them straight to the branch as the new baseline.

**Setup for this option:**
```bash
git init   # if not already a git repo
git add .
git commit -m "Initial visual regression suite"
git remote add origin <your-repo-url>
git push -u origin main
```
Then trigger **Update Visual Baseline** once manually to create the initial
baseline on Ubuntu, before the scheduled comparisons start running.

---

## Day-to-day workflow

| Situation | What to do |
|---|---|
| Checking if a recent deploy broke anything | Just wait for the nightly run, or trigger `visual-regression.yml` manually |
| A test failed | Open the report artifact, look at the diff image — is it a real bug or noise? |
| It's noise (rotating badge, review count, etc.) | Add a CSS selector for it to `DYNAMIC_SELECTORS` in `tests/visual.spec.js` |
| You shipped an intentional design change | Run `update-baseline.yml` manually to approve the new look as baseline |
| Adding a new page to monitor | Add an entry to `pages.config.js`, then run `update-baseline.yml` once |

## Adding or removing pages

Edit `pages.config.js` — each entry is just a name and a URL path:

```js
{ name: 'category-alarmanlagen', path: '/alarmanlagen' },
```

## Reducing false positives

Some elements change every load (review counts, rotating badges) and will
always show as a "diff" even with no real bug. Two levers:

1. **Mask it** — add a CSS selector to `DYNAMIC_SELECTORS` in
   `tests/visual.spec.js`. Masked elements are blacked out before comparison.
2. **Loosen the threshold** — `maxDiffPixelRatio` in `playwright.config.js`
   controls how much pixel difference is tolerated before a test fails.

## Notes

- Cookies are **declined** automatically (privacy-preserving default), which
  also makes screenshots more deterministic since fewer third-party embeds
  (YouTube, ads, etc.) load in.
- Animations/transitions are disabled before each screenshot to avoid
  capturing mid-fade/mid-slide states.
- `retries: 1` in the config absorbs one-off network hiccups without masking
  a real regression (a genuine visual diff still fails on retry).
