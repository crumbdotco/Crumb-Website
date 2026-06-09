// Throwaway screenshot helper for design self-review. Usage: node scripts/shoot.mjs [path]
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const route = process.argv[2] || '/preview';
const base = 'http://localhost:3000';
const outDir = '.shots';
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 2 });
  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500); // let entrance animations settle
  // viewport (above the fold)
  await page.screenshot({ path: `${outDir}/${s.name}-fold.png` });
  // full page
  await page.screenshot({ path: `${outDir}/${s.name}-full.png`, fullPage: true });
  await page.close();
  console.log(`shot ${s.name}`);
}
await browser.close();
console.log('done');
