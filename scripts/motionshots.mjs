// Section-by-section scroll verification: node scripts/motionshots.mjs [baseUrl] [outDir]
// Samples every motion section at several positions on desktop, phone and reduced motion,
// and reports console errors, horizontal overflow and empty frames.
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const BASE = process.argv[2] ?? "http://localhost:3200";
const OUT = process.argv[3] ?? "lab/motion"; fs.mkdirSync(OUT, { recursive: true });
const EXE = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({ executablePath: EXE, headless: "new", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// [name, css selector resolving to the section, sample positions as fraction of its scroll travel]
const SECTIONS = [
  ["hero", "main > section:nth-of-type(1)", [0, 0.3, 0.6, 0.95]],
  ["manifesto", "main > section:nth-of-type(2)", [-0.6, -0.3, 0, 0.4]],
  ["assembly", "#assembly", [0.1, 0.5, 0.97]],
  ["plate", "main > section:nth-of-type(4) > div:first-child", [-0.6, -0.25, 0]],
  ["coverflow", "section[aria-label='The line-up']", [0.05, 0.5, 0.95]],
  ["collections", "#collections", [0.1]],
  ["campaign", "section.grain:not(:first-child)", [0.15, 0.4, 0.65]],
];
const MODES = [
  ["desktop", { width: 1440, height: 900 }, false],
  ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }, false],
  ["reduced", { width: 1440, height: 900 }, true],
];
for (const [mode, vp, reduced] of MODES) {
  const page = await browser.newPage(); await page.setViewport(vp);
  if (reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.evaluateOnNewDocument(() => { Element.prototype.requestPointerLock = () => {}; Element.prototype.setPointerCapture = () => {}; sessionStorage.setItem("kf-loaded", "1"); });
  const errors = []; page.on("pageerror", (e) => errors.push(e.message.slice(0, 160))); page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 120000 });
  await sleep(4000);
  for (const [name, sel, ps] of SECTIONS) {
    const r = await page.evaluate((sel) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.offsetHeight > 0); if (!el) return null;
      const b = el.getBoundingClientRect(); return { top: b.top + scrollY, h: b.height, vh: innerHeight };
    }, sel);
    if (!r) { console.log(mode, name, "NOT FOUND"); continue; }
    for (const p of ps) {
      const y = p < 0 ? r.top + p * r.vh : r.top + Math.max(0, r.h - r.vh) * p;
      await page.evaluate((y) => { window.__lenis?.scrollTo(y, { immediate: true }); window.scrollTo(0, y); }, Math.max(0, y));
      await sleep(1500);
      await page.screenshot({ path: `${OUT}/${mode}-${name}-${Math.round(p * 100)}.jpg`, type: "jpeg", quality: 72 });
    }
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(mode, "overflowX", overflow, "errors", errors.length, errors.slice(0, 4));
  await page.close();
}
await browser.close();
