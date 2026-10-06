// Renders K&F product photography from the 3D garments.
//   npm run dev (port 3100)  then  node scripts/render.mjs [garment] [view]
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const VIEWS = ["front", "back", "side", "detail", "model", "fabric", "lifestyle", "wide"];
const FORCE = process.env.FORCE === "1";
const onlyG = process.argv[2] && process.argv[2] !== "all" ? process.argv[2] : null;
const onlyV = process.argv[3] && process.argv[3] !== "all" ? process.argv[3].split(",") : VIEWS;
const onlyC = process.argv[4] ?? null;

const { products } = await (await fetch(`${BASE}/api/products`)).json();
const jobs = new Map();
for (const p of products) for (const c of p.colors) {
  const hex = c.hex.slice(1);
  const k = `${p.garment}-${hex}`;
  if (!jobs.has(k)) jobs.set(k, { garment: p.garment, hex, material: p.material });
}
fs.mkdirSync("public/img", { recursive: true });
const manifestPath = "public/img/manifest.json";
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

const browser = await puppeteer.launch({
  executablePath: EDGE, headless: "new",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 1125, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.log("pageerror", e.message));
let n = 0;
const firstOfGarment = new Set();
for (const j of jobs.values()) {
  if (onlyG && j.garment !== onlyG) continue;
  if (onlyC && j.hex !== onlyC) continue;
  for (const view of onlyV) {
    if (view === "wide") { if (firstOfGarment.has(j.garment)) continue; firstOfGarment.add(j.garment); }
    const file = `${j.garment}-${j.hex}-${view}.jpg`;
    if (!FORCE && fs.existsSync(`public/img/${file}`)) { ((manifest[j.garment] ??= {})[view] ??= {})[j.hex] = file; continue; }
    const url = `${BASE}/studio?garment=${j.garment}&color=${j.hex}&material=${j.material}&view=${view}`;
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        await page.setViewport(view === "wide" ? { width: 1600, height: 900 } : { width: 900, height: 1125 });
        await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });
        await page.waitForFunction("window.__ready === true", { timeout: 60000 });
        await new Promise((r) => setTimeout(r, 400));
        await page.screenshot({ path: `public/img/${file}`, type: "jpeg", quality: 86 });
        ok = true;
      } catch (e) { console.log("retry", file, String(e).slice(0, 80)); }
    }
    if (ok) { ((manifest[j.garment] ??= {})[view] ??= {})[j.hex] = file; n++; console.log("rendered", file); fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1)); }
  }
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
await browser.close();
console.log("done", n);
