// Custom Playwright reporter: whenever a page's screenshot differs from its
// baseline (or the test otherwise fails), it copies that page's comparison
// images into a human-browsable `issues/` folder so you can review the
// differences without digging through Playwright's internal test-results/.
//
// Layout produced:
//
//   issues/
//     2026-07-31/                     <- one folder per calendar day
//       001_homepage-desktop-chrome/  <- one folder per failing page, numbered
//         expected.png                <- the baseline
//         actual.png                  <- what the page looks like now
//         diff.png                    <- the highlighted difference
//         info.txt                    <- page name, URL-ish, error summary
//       002_pdp-standbriefkasten-2er-mobile/
//         ...
//
// Numbering continues across runs on the same day (it never overwrites an
// earlier issue), so the folder is a running log you can skim.

const fs = require('fs');
const path = require('path');

function pad(n, w = 2) {
  return String(n).padStart(w, '0');
}

function todayFolder() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function timeStamp() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Turn a test title path into a filesystem-safe slug, e.g.
// ['', 'desktop-chrome', 'visual.spec.js', 'visual: homepage'] -> 'homepage-desktop-chrome'
function slugFor(test) {
  const titlePath = test.titlePath(); // [ '', project, file, ...titles ]
  const project = titlePath[1] || 'unknown-project';
  const title = titlePath[titlePath.length - 1] || 'test';
  const name = title.replace(/^visual:\s*/, ''); // drop the "visual: " prefix
  return `${name}-${project}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

class IssuesReporter {
  constructor(options = {}) {
    this.rootDir = options.outputDir || 'issues';
    this.failures = [];
  }

  onTestEnd(test, result) {
    if (result.status === 'passed' || result.status === 'skipped') return;

    // Collect the comparison images Playwright attached for this failure.
    const images = {};
    for (const att of result.attachments || []) {
      if (!att.path || att.contentType !== 'image/png') continue;
      if (/-expected\.png$/.test(att.name)) images.expected = att.path;
      else if (/-actual\.png$/.test(att.name)) images.actual = att.path;
      else if (/-diff\.png$/.test(att.name)) images.diff = att.path;
    }

    const rawError = (result.error && (result.error.message || String(result.error))) || 'unknown error';
    const errorSummary = rawError
      .replace(/\x1b\[[0-9;]*m/g, '') // strip ANSI colour codes Playwright adds
      .split('\n')
      .slice(0, 4)
      .join('\n');

    this.failures.push({
      slug: slugFor(test),
      status: result.status,
      images,
      errorSummary,
    });
  }

  onEnd() {
    if (this.failures.length === 0) return;

    const dateDir = path.join(this.rootDir, todayFolder());
    fs.mkdirSync(dateDir, { recursive: true });

    // Continue numbering from any issues already logged today.
    let next =
      fs
        .readdirSync(dateDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && /^\d+_/.test(e.name))
        .map((e) => parseInt(e.name, 10))
        .reduce((max, n) => Math.max(max, n), 0) + 1;

    // Stable, readable ordering.
    this.failures.sort((a, b) => a.slug.localeCompare(b.slug));

    const time = timeStamp();
    for (const f of this.failures) {
      const issueName = `${pad(next, 3)}_${f.slug}`;
      const issueDir = path.join(dateDir, issueName);
      fs.mkdirSync(issueDir, { recursive: true });

      for (const kind of ['expected', 'actual', 'diff']) {
        if (f.images[kind] && fs.existsSync(f.images[kind])) {
          fs.copyFileSync(f.images[kind], path.join(issueDir, `${kind}.png`));
        }
      }

      const info =
        `page:   ${f.slug}\n` +
        `status: ${f.status}\n` +
        `logged: ${todayFolder()} ${time}\n` +
        `\n` +
        `${f.errorSummary}\n`;
      fs.writeFileSync(path.join(issueDir, 'info.txt'), info);

      next += 1;
    }

    // eslint-disable-next-line no-console
    console.log(
      `\n[issues] ${this.failures.length} visual issue(s) saved to ${path.join(this.rootDir, todayFolder())}\\`
    );
  }
}

module.exports = IssuesReporter;
