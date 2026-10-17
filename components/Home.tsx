"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";
import Magnetic from "./Magnetic";
import Shot from "./Shot";
import Tilt from "./Tilt";
import CountUp from "./fx/CountUp";
import InView from "./InView";
import { ImageReveal, Lines, Reveal } from "./Reveal";
import { ProductCard, Viewer3D } from "./Shop";
import { Lookbook } from "./Lookbook";
import { collections, findProduct, money, products } from "@/lib/products";
import { COLORWAYS, GLOW, HOODIE, useCi, useColorway } from "@/lib/colorway";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });
const AnatomyScene = dynamic(() => import("./three/AnatomyScene"), { ssr: false });
const RunwayScene = dynamic(() => import("./three/RunwayScene"), { ssr: false });
const PreviewScene = dynamic(() => import("./three/PreviewScene"), { ssr: false });
const FabricScene = dynamic(() => import("./three/FabricScene"), { ssr: false });
const FinaleScene = dynamic(() => import("./three/FinaleScene"), { ssr: false });
const VelocityStrip = dynamic(() => import("./VelocityStrip"), { ssr: false });
const RUNWAY = ["technical-jacket", "essential-heavyweight-hoodie", "studio-bomber", "premium-cargo-pants", "denim-trucker", "signature-oversized-tee"].map((s) => findProduct(s)!);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Reduced-motion flag that matches the server render until mounted (avoids a hydration mismatch). */
function useReduced() {
  const r = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!r;
}

/** Colourway picker. The choice is stored and carries through the page and into the product page. */
function Swatches({ className = "" }: { className?: string }) {
  const ci = useCi();
  const setCi = useColorway((s) => s.setCi);
  const c = COLORWAYS[ci];
  return (
    <div className={`pointer-events-auto flex-col gap-3 ${className}`}>
      <div role="radiogroup" aria-label="Hoodie colour" className="flex gap-3">
        {COLORWAYS.map((w, i) => (
          <button key={w.name} role="radio" aria-checked={i === ci} aria-label={w.name} onClick={() => setCi(i)}
            className={`h-8 w-8 rounded-full border transition-[transform,box-shadow] duration-300 hover:scale-110 md:h-7 md:w-7 ${i === ci ? "scale-110 border-bone shadow-[0_0_0_3px_#070708,0_0_0_4px_rgba(239,236,230,.8)]" : "border-white/30"}`}
            style={{ background: w.hex }} />
        ))}
      </div>
      <Link href={`/product/${HOODIE.slug}?color=${ci}`} className="text-[10px] uppercase tracking-[0.28em] text-fog underline-offset-8 hover:text-bone hover:underline">
        {c.name} · Shop this colour {money(HOODIE.price)}
      </Link>
    </div>
  );
}

/** Mirrors the chosen colourway into a page-wide glow tint (CSS custom property, animated via @property). */
function GlowSync() {
  const ci = useCi();
  useEffect(() => { document.documentElement.style.setProperty("--kf-glow", GLOW[COLORWAYS[ci].name] ?? "#efece6"); }, [ci]);
  return null;
}

/**
 * Layered hero. Four planes move at different rates while the stage holds:
 * far light cone (slowest), wordmark (counter-parallax), 3D hoodie (turns to its back),
 * near dust inside the canvas (fastest). Second beat, then the stage shrinks into a frame.
 */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const reduced = useReduced();
  const ci = useCi();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // unpinned under reduced motion, so progress would jump straight to 1: hold the opening pose instead
  useEffect(() => {
    if (reduced) scroll.current = 0;
    return scrollYProgress.on("change", (v) => (scroll.current = reduced ? 0 : v));
  }, [scrollYProgress, reduced]);
  const op1 = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.28], [0, -50]);
  const s1 = useTransform(scrollYProgress, [0, 0.28], [1, 0.94]);
  const op2 = useTransform(scrollYProgress, [0.36, 0.56], [0, 1]);
  const y2 = useTransform(scrollYProgress, [0.36, 0.56], [40, 0]);
  const farY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const farS = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const wy = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const ws = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const exit = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const clip = useTransform(exit, (e) => `inset(${e * 7}% ${e * 5}% ${e * 7}% ${e * 5}% round ${e * 18}px)`);

  // pointer counter-parallax on the wordmark plane (fine pointers only, rAF-batched)
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        stage.current?.style.setProperty("--mx", String(e.clientX / innerWidth - 0.5));
        stage.current?.style.setProperty("--my", String(e.clientY / innerHeight - 0.5));
      });
    };
    window.addEventListener("pointermove", move);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [reduced]);

  const m = (v: object) => (reduced ? undefined : v);
  return (
    <section ref={ref} className={`relative ${reduced ? "h-[100svh] min-h-[640px]" : "h-[170vh]"}`}>
      <motion.div ref={stage} style={m({ clipPath: clip })} className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden grain bg-[#070708]">
        {/* far plane: light cone */}
        <motion.div style={m({ y: farY, scale: farS })} className="pointer-events-none absolute inset-[-10%] bg-[radial-gradient(ellipse_at_50%_38%,#2e2e35_0%,#141417_45%,#070708_75%)]" />
        <div className="kf-cone pointer-events-none absolute left-1/2 top-[-20%] h-[90%] w-[60vw] -translate-x-1/2 blur-2xl" />
        {/* mid plane: wordmark, behind the garment, counter-parallax to the pointer */}
        <motion.div style={m({ y: wy, scale: ws })} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="transition-transform duration-700 ease-out [transform:translate3d(calc(var(--mx,0)*-26px),calc(var(--my,0)*-16px),0)]">
            <motion.div initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.2, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}>
              <Logo variant="silver" className="text-[46vw] leading-none opacity-[0.88] md:text-[30vw]" />
            </motion.div>
          </div>
        </motion.div>
        {/* subject + near dust (WebGL) */}
        <div className="absolute inset-0" data-cursor="ROTATE"><InView margin="0px" className="h-full"><HeroScene scroll={scroll} color={COLORWAYS[ci].hex} instant={reduced} /></InView></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,.7)_100%)]" />

        {/* beat 1 */}
        <motion.div style={m({ opacity: op1, y: y1, scale: s1 })} className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-14 text-center md:pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 1 }} className="md:hidden"><Swatches className="mb-6 flex items-center" /></motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 1 }} className="display text-3xl text-bone md:text-5xl">Define your <em>form.</em></motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.7, duration: 1 }} className="pointer-events-auto mt-7 flex w-full flex-col gap-3 px-8 sm:w-auto sm:flex-row sm:gap-4 sm:px-0">
            <Magnetic><Link href="/shop?gender=men" className="btn btn-solid w-full sm:w-auto">Shop Men</Link></Magnetic>
            <Magnetic><Link href="/shop?gender=women" className="btn btn-ghost w-full backdrop-blur sm:w-auto">Shop Women</Link></Magnetic>
          </motion.div>
        </motion.div>
        {/* beat 2: the back of the garment */}
        {!reduced && (
          <motion.div style={{ opacity: op2, y: y2 }} className="pointer-events-none absolute bottom-24 left-5 right-5 md:bottom-auto md:left-auto md:right-10 md:top-1/2 md:w-[min(26rem,32vw)] md:-translate-y-1/2">
            <div className="bg-[radial-gradient(ellipse_at_center,rgba(7,7,8,.75)_0%,transparent_70%)] p-2 md:p-6">
              <p className="display text-4xl md:text-6xl">Cut to hold<br /><em>its shape.</em></p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-fog">480gsm loopback fleece, double-lined hood, a back that drapes as clean as the front.</p>
            </div>
          </motion.div>
        )}
        {/* desktop colourway picker, clear of the garment */}
        <motion.div style={m({ opacity: op1 })} className="absolute bottom-20 right-10 hidden md:block">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.6, duration: 1 }}>
            <p className="mb-3 text-right text-[10px] tracking-[0.3em] text-fog">COLOURWAY</p>
            <Swatches className="flex items-end" />
          </motion.div>
        </motion.div>
        <div className="absolute left-5 top-28 hidden text-[10px] tracking-[0.3em] text-fog md:block md:left-10">CAMPAIGN 2027<br /><span className="text-bone/70">THE NEW FORM</span></div>
        <div className="absolute right-5 top-28 hidden text-right text-[10px] tracking-[0.3em] text-fog md:block md:right-10">N° 01 / SS27<br /><span className="text-bone/70">HEAVYWEIGHT FLEECE</span></div>
      </motion.div>
    </section>
  );
}

const MANIFESTO = ["Not about following", "the moment.", "About creating your own."];

/** Each word hinges up out of the page in 3D and brightens, scrubbed by scroll. */
function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const words = useRef<HTMLSpanElement[]>([]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  useEffect(() => {
    const n = words.current.length;
    const paint = (p: number) => words.current.forEach((w, i) => w?.style.setProperty("--w", clamp01((p * 1.4 - (i / n) * 0.95) / 0.28).toFixed(3)));
    paint(scrollYProgress.get());
    return scrollYProgress.on("change", paint);
  }, [scrollYProgress]);
  let k = 0;
  return (
    <section ref={ref} className="wrap py-32 md:py-48">
      <h2 className="display max-w-6xl text-[11vw] md:text-[7.2vw]" aria-label={MANIFESTO.join(" ")}>
        {MANIFESTO.map((line, li) => (
          <span key={li} className="block" aria-hidden>
            {line.split(" ").map((w) => { const i = k++; return <span key={i}><span ref={(el) => { if (el) words.current[i] = el; }} className="kf-word">{w}</span>{" "}</span>; })}
          </span>
        ))}
      </h2>
    </section>
  );
}

const STAGES = [
  ["01", "The cloth", "480gsm loopback fleece", "Organic cotton, brushed back and garment-washed until it hangs like it has been yours for years."],
  ["02", "The sleeves", "Raglan set, ribbed cuffs", "Cut with room at the shoulder. Cuffs hold their shape with 2% elastane."],
  ["03", "The hood", "Double-lined, holds its form", "Two layers of the same fleece, so it stands up on its own and never collapses."],
  ["04", "The pocket", "Bar-tacked kangaroo pouch", "Reinforced at every stress point. Built for hands, phones and bad weather."],
  ["05", "The hardware", "Brushed silver aglets", "Flat drawcord, solid metal tips, tonal threads throughout."],
  ["06", "The mark", "Tonal K&F embroidery", "One quiet signature at the chest. The whole point is that you don't need more."],
] as const;

/** Signature move: scroll builds the garment. Pinned; 3D parts fly in and join. */
function Assembly() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const ci = useCi();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { progress.current = 1; setReduced(true); setStage(STAGES.length - 1); setDone(true); return; }
    const st = ScrollTrigger.create({
      trigger: ref.current, start: "top top", end: "bottom bottom",
      onUpdate: (s) => {
        progress.current = Math.min(1, s.progress / 0.88);
        setStage(Math.min(STAGES.length - 1, Math.floor(progress.current * STAGES.length * 0.999)));
        setDone(progress.current >= 0.97);
        if (bar.current) bar.current.style.transform = `scaleY(${progress.current})`;
      },
    });
    return () => st.kill();
  }, []);
  const cur = STAGES[stage];
  return (
    <section ref={ref} className={`relative ${reduced ? "" : "h-[520vh]"}`} id="assembly" aria-label="The anatomy of a K&F hoodie">
      <div className={`${reduced ? "relative min-h-screen" : "sticky top-0 h-[100svh]"} overflow-hidden bg-[radial-gradient(ellipse_at_60%_45%,#26262c_0%,#121214_60%,#070708_100%)]`}>
        <div className="absolute inset-x-0 top-12 bottom-[38%] md:inset-0 md:left-[18%] md:top-0" data-cursor="WATCH"><InView margin="500px" className="h-full"><AnatomyScene progress={progress} color={COLORWAYS[ci].hex} /></InView></div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.7)_0%,transparent_45%)] max-md:bg-[linear-gradient(0deg,rgba(0,0,0,.85)_0%,transparent_55%)]" />

        <div className="absolute left-5 top-24 md:left-10"><p className="eyebrow">The anatomy of a hoodie</p></div>
        <div className="absolute bottom-24 left-5 right-5 md:bottom-auto md:left-10 md:right-auto md:top-1/2 md:w-[min(30rem,38vw)] md:-translate-y-1/2">
          <AnimatePresence mode="wait">
            <motion.div key={stage} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <p className="text-[11px] uppercase tracking-[0.3em] text-fog">{cur[1]}</p>
              <h2 className="display mt-3 text-4xl md:text-6xl">{cur[2]}</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog">{cur[3]}</p>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4">
                <Magnetic><Link href={`/product/${HOODIE.slug}?color=${ci}`} className="btn btn-solid">Shop the hoodie · {COLORWAYS[ci].name} · {money(HOODIE.price)}</Link></Magnetic>
                <Link href="/try-on?item=essential-heavyweight-hoodie" className="text-[11px] uppercase tracking-[0.24em] text-fog underline underline-offset-8 hover:text-bone">Try it on</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-8 right-5 top-24 hidden w-px bg-white/10 md:block md:right-10"><span ref={bar} className="absolute inset-0 origin-top bg-bone" style={{ transform: "scaleY(0)" }} /></div>
      </div>
    </section>
  );
}

function Editorial() {
  const par = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const { scrollYProgress } = useScroll({ target: par, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 100]);
  // the Night Shell plate lifts off the table: tilted away, then flat and full-bleed
  const { scrollYProgress: pp } = useScroll({ target: plate, offset: ["start end", "start start"] });
  const rx = useTransform(pp, [0, 1], [16, 0]);
  const ps = useTransform(pp, [0, 1], [0.86, 1]);
  return (
    <section ref={par} className="relative">
      <div ref={plate} className="relative h-[110vh] [perspective:1400px]" data-cursor="VIEW">
        <motion.div style={reduced ? undefined : { rotateX: rx, scale: ps, transformOrigin: "50% 100%" }} className="relative h-full overflow-hidden">
          <ImageReveal className="h-full"><Shot garment="jacket" color="#1c1d21" view="wide" tone="#2a2a2f" priority sizes="100vw" /></ImageReveal>
          <div className="absolute bottom-10 left-5 md:left-10"><p className="eyebrow">Form 01</p><h3 className="display mt-3 text-5xl md:text-8xl">The Night Shell</h3></div>
        </motion.div>
      </div>
      {/* overlapping asymmetry */}
      <div className="wrap relative grid gap-6 py-24 md:grid-cols-12 md:py-40">
        <motion.div style={{ y: y1 }} className="md:col-span-5 md:col-start-1"><ImageReveal className="aspect-[3/4]"><Shot garment="hoodie" color="#1a1a1f" view="model" tone="#1c1c20" /></ImageReveal></motion.div>
        <div className="flex flex-col justify-center md:col-span-3 md:px-6"><Reveal><p className="display text-3xl md:text-4xl">480 grams of cotton, cut to hold its shape.</p><p className="mt-6 text-sm text-fog">Brushed-back loopback fleece, garment washed. A hoodie made to last past the season it launched in.</p></Reveal></div>
        <motion.div style={{ y: y2 }} className="md:col-span-4 md:mt-40"><ImageReveal className="aspect-[4/5]"><Shot garment="tee" color="#e4dfd5" view="front" tone="#26262a" /></ImageReveal></motion.div>
      </div>
      {/* image + typography, details */}
      <div className="wrap grid items-end gap-6 pb-24 md:grid-cols-12 md:pb-40">
        <div className="md:col-span-7"><ImageReveal className="aspect-[16/10]"><Shot garment="bomber" color="#4a1822" view="wide" tone="#1d1214" sizes="60vw" /></ImageReveal></div>
        <div className="md:col-span-2 md:-ml-24 md:mb-[-4rem] md:self-end"><ImageReveal className="aspect-square"><Shot garment="jacket" color="#a9adb4" view="detail" tone="#202226" /></ImageReveal></div>
        <div className="md:col-span-3"><h3 className="display text-5xl md:text-7xl"><Lines lines={["Form.", "Function.", "Identity."]} /></h3></div>
      </div>
      <Coverflow />
    </section>
  );
}

/** Pinned 3D coverflow: vertical scroll drives the line-up sideways; each card turns toward the centre. */
function Coverflow() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLAnchorElement[]>([]);
  const reduced = useReduced();
  const items = products.slice(0, 7);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const paint = () => {
      const t = track.current; if (!t) return;
      const vw = innerWidth, max = Math.max(0, t.scrollWidth - vw);
      const x = -scrollYProgress.get() * max;
      t.style.transform = `translate3d(${x}px,0,0)`;
      for (const c of cards.current) {
        if (!c) continue;
        const d = Math.max(-1.6, Math.min(1.6, (c.offsetLeft + c.offsetWidth / 2 + x - vw / 2) / (vw / 2)));
        c.style.transform = `perspective(1200px) rotateY(${-d * 30}deg) translateZ(${-Math.abs(d) * 160}px) scale(${1 - Math.min(1, Math.abs(d)) * 0.06})`;
        c.style.opacity = String(1 - Math.min(1, Math.max(0, Math.abs(d) - 0.9)) * 0.6);
      }
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    paint();
    const off = scrollYProgress.on("change", on);
    window.addEventListener("resize", on);
    return () => { off(); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [reduced, scrollYProgress]);
  // keyboard: bring a focused card to the centre by scrolling the page to its position
  const focus = (i: number) => {
    const sec = ref.current, t = track.current, c = cards.current[i];
    if (reduced || !sec || !t || !c) return;
    const max = Math.max(1, t.scrollWidth - innerWidth);
    const p = clamp01((c.offsetLeft + c.offsetWidth / 2 - innerWidth / 2) / max);
    const y = sec.getBoundingClientRect().top + scrollY + p * (sec.offsetHeight - innerHeight);
    (window as any).__lenis ? (window as any).__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
  };
  return (
    <section ref={ref} className={reduced ? "pb-16" : "relative h-[320vh]"} aria-label="The line-up">
      <div className={reduced ? "" : "sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden"}>
        <h3 className="display wrap mb-8 text-4xl md:mb-12 md:text-6xl">The line-up</h3>
        <div ref={track} className={`flex gap-5 px-[15vw] will-change-transform md:gap-8 md:px-[34vw] ${reduced ? "no-scrollbar overflow-x-auto !px-5" : ""}`} data-cursor="VIEW">
          {items.map((p, i) => (
            <Link key={p.slug} ref={(el) => { if (el) cards.current[i] = el; }} onFocus={() => focus(i)} href={`/product/${p.slug}`}
              className="group relative aspect-[3/4] w-[70vw] shrink-0 overflow-hidden bg-char shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] sm:w-[40vw] md:w-[26vw] lg:w-[22vw]">
              <div className="h-full transition-transform duration-[1200ms] group-hover:scale-105"><Shot garment={p.garment} color={p.colors[0].hex} view={i % 2 ? "model" : "lifestyle"} tone="#202024" sizes="(max-width:768px) 70vw, 26vw" /></div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                <span className="text-[10px] uppercase tracking-[0.25em]">{p.name.replace("K&F ", "")}</span>
                <span className="text-[11px] tabular-nums text-fog">{money(p.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Facts from the hoodie's own spec only. */
const FABRIC = [
  ["480 grams per square metre.", "Heavy enough to hold its shape on its own."],
  ["Brushed back. Garment-washed.", "A lived-in hand from the first wear."],
  ["100% organic cotton.", "Ribbed cuffs and hem with 2% elastane, so they spring back."],
] as const;

/** Pinned macro: the camera dollies from a draped swatch (in the chosen colourway) down into the loops. */
function Fabric() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduced = useReduced();
  const ci = useCi();
  const [stage, setStage] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useEffect(() => {
    const on = (v: number) => { progress.current = reduced ? 0.8 : v; setStage(Math.min(FABRIC.length - 1, Math.floor(v * FABRIC.length * 0.999))); };
    on(scrollYProgress.get());
    return scrollYProgress.on("change", on);
  }, [scrollYProgress, reduced]);
  const c = COLORWAYS[ci];
  return (
    <section ref={ref} className={`relative ${reduced ? "" : "h-[240vh]"}`} aria-label="The cloth">
      <div className={`${reduced ? "relative h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden bg-ink`}>
        <div className="absolute inset-0" data-cursor="LIGHT"><InView margin="900px" unmount className="h-full"><FabricScene progress={progress} color={c.hex} sheen={GLOW[c.name] ?? "#efece6"} /></InView></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,.65)_100%)]" />
        <div className="absolute left-5 top-24 md:left-10"><p className="eyebrow">The cloth · shown in {c.name}</p></div>
        <div className="pointer-events-none absolute bottom-20 left-0 right-0 bg-[linear-gradient(0deg,rgba(10,10,11,.85)_0%,transparent_100%)] px-5 pb-4 pt-24 md:bottom-0 md:right-auto md:w-[min(40rem,60vw)] md:bg-[radial-gradient(ellipse_at_0%_100%,rgba(10,10,11,.85)_0%,transparent_70%)] md:px-10 md:pb-16">
          {reduced ? (
            <ul className="space-y-6">{FABRIC.map(([h, t]) => <li key={h}><h3 className="display text-3xl md:text-5xl">{h}</h3><p className="mt-2 text-sm text-fog">{t}</p></li>)}</ul>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={stage} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <h3 className="display text-4xl md:text-7xl">{FABRIC[stage][0]}</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog">{FABRIC[stage][1]}</p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

function Collections() {
  return (
    <section id="collections" className="wrap py-24 md:py-40">
      <div className="mb-12 flex items-end justify-between"><h2 className="display text-6xl md:text-9xl"><Lines lines={["Collections"]} /></h2><Link href="/shop" className="eyebrow hidden hover:text-bone md:block">View all →</Link></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {collections.map((c, i) => (
          <Reveal key={c.key} delay={(i % 4) * 0.07} >
            <Tilt className="aspect-[4/5]">
              <Link href={c.href} data-cursor="VIEW" className="group relative block h-full [transform-style:preserve-3d]">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="h-full w-full transition-transform duration-[1400ms] ease-out group-hover:scale-110"><Shot garment={c.garment} color={i % 2 ? "#2c2d31" : "#15151a"} view={i % 3 === 0 ? "model" : "front"} sizes="(max-width:768px) 50vw, 25vw" tone={c.tone} /></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-colors duration-700 group-hover:from-burgundy/70" />
                </div>
                <div className="kf-lift absolute inset-x-4 bottom-4 flex items-end justify-between">
                  <span className="display text-2xl md:text-4xl">{c.label}</span>
                  <span className="-translate-x-3 text-2xl opacity-0 transition-[transform,opacity] duration-500 group-hover:translate-x-0 group-hover:opacity-100">→</span>
                </div>
              </Link>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** The line-up in numbers, counted from the real catalogue. */
function Stats() {
  const colourways = products.reduce((a, p) => a + p.colors.length, 0);
  const fabrics = new Set(products.map((p) => p.material)).size;
  const accessories = products.filter((p) => p.category === "accessories").length;
  const items: [number, string][] = [[products.length, "Pieces in the line-up"], [colourways, "Colourways"], [fabrics, "Fabrics"], [accessories, "Accessories"]];
  return (
    <section aria-label="The line-up in numbers" className="border-y border-white/10">
      <div className="wrap grid grid-cols-2 md:grid-cols-4">
        {items.map(([n, label], i) => (
          <Reveal key={label} delay={i * 0.08} className={`py-14 md:border-l md:border-white/10 md:py-20 md:pl-10 ${i % 2 ? "border-l border-white/10 pl-5" : ""} ${i === 0 ? "md:!border-l-0 md:!pl-0" : ""}`}>
            <p className="display text-6xl md:text-8xl"><CountUp to={n} /></p>
            <p className="eyebrow mt-3">{label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Configurator() {
  const p = products[0];
  const ci = useCi();
  const [view3d, setView3d] = useState(false);
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-char py-24 md:py-32">
      <div className="wrap grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="eyebrow">Interactive 3D</p>
          <h2 className="display mt-4 text-5xl md:text-8xl"><Lines lines={["Hold it.", "Turn it.", "Make it yours."]} /></h2>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-fog">Rotate, zoom and re-material every K&amp;F piece: cotton, denim, leather, nylon, fleece, wool. See the stitching before you commit.</p>
          <div className="mt-10"><Magnetic><button onClick={() => setView3d(true)} className="btn btn-solid">Open 3D studio</button></Magnetic></div>
        </div>
        <button type="button" aria-label="Open the 3D studio" className="relative aspect-square w-full overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_50%_40%,#26262c_0%,#121214_70%)] md:aspect-[4/5]" data-cursor="ROTATE" onClick={() => setView3d(true)}>
          <InView margin="200px" unmount className="absolute inset-0"><PreviewScene garment={p.garment} color={COLORWAYS[ci].hex} material="fleece" /></InView>
          <span className="absolute inset-x-0 bottom-4 text-center text-[10px] tracking-[0.3em] text-fog">TAP TO ENTER STUDIO</span>
        </button>
      </div>
      <AnimatePresence>{view3d && <Viewer3D p={p} initialColor={ci} onClose={() => setView3d(false)} />}</AnimatePresence>
    </section>
  );
}

function FittingRoom() {
  return (
    <section className="wrap py-24 md:py-36">
      <div className="grid items-center gap-10 border border-white/10 bg-char p-8 md:grid-cols-2 md:p-16">
        <div><p className="eyebrow">Fitting room</p><h2 className="display mt-4 text-5xl md:text-7xl"><Lines lines={["See it on.", "Before it ships."]} /></h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-fog">Dress a model in any K&amp;F outfit. Mix tops, bottoms and accessories, change colour, size, height and skin tone, then add the whole look to your bag.</p>
          <div className="mt-8"><Magnetic><Link href="/try-on" className="btn btn-solid">Enter the fitting room</Link></Magnetic></div></div>
        <Link href="/try-on" data-cursor="TRY ON" className="relative block aspect-[4/5] overflow-hidden bg-graphite"><Shot garment="hoodie" color="#16161a" view="model" sizes="(max-width:768px) 90vw, 40vw" /><span className="glass absolute bottom-4 left-4 px-4 py-2 text-[10px] tracking-[0.25em]">TRY ON →</span></Link>
      </div>
    </section>
  );
}

const RING = [
  ["hoodie", "#4b1620"], ["jacket", "#a38d6d"], ["bomber", "#0e0e10"], ["pants", "#b3a791"], ["hoodie", "#e4dfd5"],
  ["jacket", "#1f2a44"], ["cap", "#e2ddd2"], ["bomber", "#4a1822"], ["pants", "#17171a"], ["hoodie", "#6f7076"],
] as const;

/** The campaign stands on a 3D ring that turns with scroll; the title holds in front of it. */
function Campaign() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const turn = useTransform(scrollYProgress, [0, 1], [24, -132]);
  const tilt = useTransform(scrollYProgress, [0, 0.5, 1], [10, 2, -6]);
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);
  const n = RING.length, step = 360 / n;
  // radius as a multiple of panel width (--ring-w), so neighbouring panels just touch at any breakpoint
  const r = 1 / 2 / Math.tan(Math.PI / n);
  return (
    <section ref={ref} className={`relative grain bg-[radial-gradient(ellipse_at_50%_55%,#1d1d22_0%,#0a0a0b_70%)] ${reduced ? "h-screen" : "h-[220vh]"}`}>
      <div className="sticky top-0 h-screen overflow-hidden" data-cursor="PLAY">
        <motion.div style={reduced ? undefined : { x }} className="pointer-events-none absolute top-[12%] whitespace-nowrap"><span className="display text-[34vw] leading-none text-white/[0.05]">2027 2027</span></motion.div>
        <div className="absolute inset-0 flex items-center justify-center [--ring-w:74vw] [perspective:1600px] md:[--ring-w:30vw]">
          {/* pivot sits at the ring's centre, pushed back by its radius, so the front panel lands at z = 0 */}
          <div className="relative h-[calc(var(--ring-w)*4/3)] w-[var(--ring-w)] [transform-style:preserve-3d]" style={{ transform: `translateZ(calc(var(--ring-w) * -${r}))` }}>
            <motion.div style={reduced ? undefined : { rotateY: turn, rotateX: tilt }} className="absolute inset-0 [transform-style:preserve-3d]">
              {RING.map(([g, c], i) => (
                <div key={i} className="absolute inset-0 overflow-hidden border border-white/10 [backface-visibility:hidden]" style={{ transform: `rotateY(${i * step}deg) translateZ(calc(var(--ring-w) * ${r}))` }}>
                  <Shot garment={g} color={c} view="model" eager sizes="(max-width:768px) 74vw, 30vw" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,7,8,.72)_0%,rgba(7,7,8,.35)_32%,transparent_60%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="eyebrow !text-bone">K&amp;F / 2027</p>
          <h2 className="display mt-4 text-[14vw] md:text-[10vw]"><Lines lines={["The New Form"]} /></h2>
          <div className="mt-8"><Magnetic><Link href="/lookbook" className="btn btn-ghost backdrop-blur">Explore campaign</Link></Magnetic></div>
        </div>
      </div>
    </section>
  );
}

function Runway() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: ref.current, start: "top top", end: "bottom bottom", onUpdate: (s) => { progress.current = s.progress; setIdx(Math.min(RUNWAY.length - 1, Math.round(s.progress * (RUNWAY.length - 1)))); } });
    return () => st.kill();
  }, []);
  const look = RUNWAY[idx];
  return (
    <section ref={ref} className="relative h-[400vh]" id="runway">
      <div className="sticky top-0 h-screen overflow-hidden">
        <InView margin="400px" className="absolute inset-0"><RunwayScene progress={progress} /></InView>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.7)_100%)]" />
        <div className="absolute left-5 top-24 md:left-10"><p className="eyebrow">Digital show</p><h2 className="display mt-3 text-5xl md:text-8xl">K&amp;F Runway</h2></div>
        <div className="absolute bottom-10 left-5 right-5 flex items-end justify-between md:left-10 md:right-10">
          <div><p className="text-[10px] tracking-[0.3em] text-fog">ON THE RUNWAY</p>
            <AnimatePresence mode="wait"><motion.div key={look.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><p className="display mt-2 text-3xl md:text-5xl">{look.name.replace("K&F ", "")}</p><Link href={`/product/${look.slug}`} className="pointer-events-auto mt-3 inline-block text-[11px] tracking-[0.25em] underline underline-offset-8 hover:opacity-70">SHOP · {money(look.price)}</Link></motion.div></AnimatePresence></div>
          
        </div>
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">{RUNWAY.map((_, i) => <span key={i} className={`h-6 w-px ${i === idx ? "bg-bone" : "bg-white/20"}`} />)}</div>
      </div>
    </section>
  );
}

function Rail({ items }: { items: typeof products }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-12 md:overflow-visible md:px-0 lg:grid-cols-6">
      {items.map((p, i) => <div key={p.slug} className="w-[62vw] shrink-0 snap-start sm:w-[40vw] md:w-auto"><ProductCard p={p} index={i} /></div>)}
    </div>
  );
}

function Accessories() {
  const list = products.filter((p) => p.category === "accessories");
  return (
    <section className="wrap py-24 md:py-36">
      <div className="mb-10 flex items-end justify-between"><div><p className="eyebrow">Finish the form</p><h2 className="display mt-3 text-5xl md:text-8xl"><Lines lines={["Accessories"]} /></h2></div><Link href="/shop?category=accessories" className="eyebrow hover:text-bone">Shop all →</Link></div>
      <Rail items={list} />
    </section>
  );
}

/** The close: the chrome mark assembles as it arrives, then holds above the final action. */
function Finale() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduced = useReduced();
  const ci = useCi();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  useEffect(() => {
    const on = (v: number) => (progress.current = reduced ? 1 : v);
    on(scrollYProgress.get());
    return scrollYProgress.on("change", on);
  }, [scrollYProgress, reduced]);
  const c = COLORWAYS[ci];
  return (
    <section ref={ref} className="kf-finale relative h-[100svh] min-h-[640px] overflow-hidden" aria-label="Define your form">
      <div className="absolute inset-x-0 bottom-[34%] top-0 md:bottom-[30%]" data-cursor="K&F"><InView margin="400px" unmount className="h-full"><FinaleScene progress={progress} glow={GLOW[c.name]} /></InView></div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-5 pb-24 text-center md:pb-20">
        <h2 className="display text-5xl md:text-8xl"><Lines lines={["Define your form."]} /></h2>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Magnetic><Link href="/shop" className="btn btn-solid w-full sm:w-auto">Shop the collection</Link></Magnetic>
          <Magnetic><Link href={`/product/${HOODIE.slug}?color=${ci}`} className="btn btn-ghost w-full sm:w-auto">The hoodie in {c.name}</Link></Magnetic>
        </div>
      </div>
    </section>
  );
}

function Featured() {
  return (
    <section className="wrap py-24 md:py-40">
      <div className="mb-12 flex items-end justify-between"><h2 className="display text-5xl md:text-8xl"><Lines lines={["The essentials"]} /></h2><Link href="/shop" className="eyebrow hover:text-bone">Shop all →</Link></div>
      <Rail items={products.filter((p) => p.category !== "accessories" && (p.badge || p.category === "essentials")).slice(0, 4)} />
    </section>
  );
}

export default function Home() {
  return (
    <>
      <GlowSync />
      <Hero />
      <Manifesto />
      <Assembly />
      <Editorial />
      <VelocityStrip />
      <Fabric />
      <Collections />
      <Stats />
      <Accessories />
      <Configurator />
      <FittingRoom />
      <Campaign />
      <Runway />
      <section className="py-24 md:py-40"><div className="wrap mb-12"><p className="eyebrow">Lookbook</p><h2 className="display mt-3 text-5xl md:text-8xl"><Lines lines={["Shop the look"]} /></h2></div><Lookbook /></section>
      <Featured />
      <Finale />
    </>
  );
}
