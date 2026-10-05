// Rasterizes an SVG to a transparent PNG with headless Chromium.
//   node rasterize.mjs in.svg out.png size
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const [, , input, output, size = "1024"] = process.argv;
let pw;
try { pw = createRequire(import.meta.url)("playwright"); } catch { pw = createRequire("/opt/node22/lib/node_modules/")("playwright"); }
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(size), height: Number(size) } });
const svg = readFileSync(input, "utf8").replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
await page.screenshot({ path: output, omitBackground: true, clip: { x: 0, y: 0, width: Number(size), height: Number(size) } });
await browser.close();
console.log("wrote", output);
