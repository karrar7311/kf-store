// Scroll-state verification: node scripts/scrollshots.mjs [baseUrl]
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const BASE = process.argv[2] ?? "http://localhost:3100";
const EDGE = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));
const OUT = process.argv[3] ?? "shots"; fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }]]) {
  const page = await browser.newPage(); await page.setViewport(vp);
  const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 120)));
  await page.goto(BASE + "/", { waitUntil: "networkidle0", timeout: 90000 });
  await sleep(6500); // loader
  const rect = await page.evaluate(() => { const el = document.getElementById("assembly"); const r = el.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight }; });
  const span = rect.h - rect.vh;
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  for (const p of [0.02, 0.2, 0.4, 0.6, 0.8, 0.95]) {
    await page.evaluate((y) => { window.__lenis?.scrollTo(y, { immediate: true }); window.scrollTo(0, y); }, rect.top + span * p);
    await sleep(1800);
    await page.screenshot({ path: `${OUT}/${name}-assembly-${Math.round(p * 100)}.jpg`, type: "jpeg", quality: 80 });
  }
  console.log(name, "sectionHeight", Math.round(rect.h), "overflowX", overflow, "errors", errors.length, errors.slice(0, 3));
  await page.close();
}
await browser.close();
