// Capture viewport-height slices down the page for section-level review.
// Usage: node scripts/shoot-scroll.mjs [route] [desktop|mobile]
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const route = process.argv[2] || '/';
const mode = process.argv[3] || 'desktop';
const base = 'http://localhost:3000';
const outDir = '.shots';
mkdirSync(outDir, { recursive: true });

const dims = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const { width, height } = dims;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1.5 });
await page.goto(base + route, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(4000); // preloader + entrance animations

const total = await page.evaluate(() => document.body.scrollHeight);
const steps = Math.ceil(total / height);
console.log(`page height ${total}, ${steps} slices`);
for (let i = 0; i < steps; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * height);
  await page.waitForTimeout(1200); // trigger scroll-reveals
  await page.screenshot({ path: `${outDir}/${mode}-slice-${String(i).padStart(2, '0')}.png` });
  console.log(`slice ${i}`);
}
await browser.close();
console.log('done');
