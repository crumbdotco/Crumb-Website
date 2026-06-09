// Capture screenshots centered on section boundaries to inspect transitions.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const base = 'http://localhost:3000/preview';
const outDir = '.shots/seams';
mkdirSync(outDir, { recursive: true });

const width = 1440, height = 900;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1.25 });
await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);

// Find the <section> elements and their boundary Y positions
const tops = await page.evaluate(() => {
  const secs = Array.from(document.querySelectorAll('section'));
  return secs.map((s, i) => {
    const r = s.getBoundingClientRect();
    return { i, top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
  });
});
console.log('sections:', JSON.stringify(tops));

// For each boundary (top of section 1..n), scroll so the boundary sits at viewport middle
let shot = 0;
for (let k = 1; k < tops.length; k++) {
  const boundary = tops[k].top;
  const y = Math.max(0, boundary - height / 2);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${outDir}/seam-${String(shot).padStart(2,'0')}-sec${k}.png` });
  console.log(`seam ${shot} -> boundary of section ${k} at y=${boundary}`);
  shot++;
}
await browser.close();
console.log('done');
