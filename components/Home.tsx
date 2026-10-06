"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";
import Magnetic from "./Magnetic";
import Shot from "./Shot";
import InView from "./InView";
import { ImageReveal, Lines, Reveal } from "./Reveal";
import { ProductCard, Viewer3D } from "./Shop";
import { Lookbook } from "./Lookbook";
import { collections, findProduct, money, products } from "@/lib/products";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });
const RunwayScene = dynamic(() => import("./three/RunwayScene"), { ssr: false });
const RUNWAY = ["technical-jacket", "essential-heavyweight-hoodie", "studio-bomber", "premium-cargo-pants", "denim-trucker", "signature-oversized-tee"].map((s) => findProduct(s)!);

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const scroll = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  useEffect(() => scrollYProgress.on("change", (v) => (scroll.current = v)), [scrollYProgress]);
  const op = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const wy = useTransform(scrollYProgress, [0, 1], [0, 260]);
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden grain bg-[radial-gradient(ellipse_at_50%_40%,#2a2a30_0%,#121214_55%,#070708_100%)]">
      {/* wordmark behind the garment = depth */}
      <motion.div style={{ y: wy }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.2, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}>
          <Logo variant="silver" className="text-[46vw] leading-none opacity-[0.88] md:text-[30vw]" />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0" data-cursor="ROTATE"><InView margin="0px" className="h-full"><HeroScene scroll={scroll} /></InView></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,.7)_100%)]" />
      <motion.div style={{ opacity: op, y }} className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-14 text-center md:pb-20">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 1 }} className="display text-3xl text-bone md:text-5xl">Define your <em>form.</em></motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.7, duration: 1 }} className="pointer-events-auto mt-7 flex w-full flex-col gap-3 px-8 sm:w-auto sm:flex-row sm:gap-4 sm:px-0">
          <Magnetic><Link href="/shop?gender=men" className="btn btn-solid w-full sm:w-auto">Shop Men</Link></Magnetic>
          <Magnetic><Link href="/shop?gender=women" className="btn btn-ghost w-full backdrop-blur sm:w-auto">Shop Women</Link></Magnetic>
        </motion.div>
      </motion.div>
      <div className="absolute left-5 top-28 hidden text-[10px] tracking-[0.3em] text-fog md:block md:left-10">CAMPAIGN 2027<br /><span className="text-bone/70">THE NEW FORM</span></div>
      <div className="absolute right-5 top-28 hidden text-right text-[10px] tracking-[0.3em] text-fog md:block md:right-10">N° 01 / SS27<br /><span className="text-bone/70">HEAVYWEIGHT FLEECE</span></div>
      <div className="absolute bottom-6 right-5 hidden items-center gap-3 text-[10px] tracking-[0.3em] text-fog md:flex md:right-10">SCROLL<span className="h-px w-10 origin-left animate-pulse bg-bone" /></div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="wrap py-32 md:py-48">
      <p className="eyebrow mb-8">The new standard</p>
      <h2 className="display max-w-6xl text-[11vw] md:text-[7.2vw]"><Lines lines={["Not about following", "the moment.", "About creating your own."]} /></h2>
    </section>
  );
}

function Editorial() {
  const items = products;
  const par = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: par, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 100]);
  return (
    <section ref={par} className="relative">
      {/* full-screen */}
      <div className="relative h-[110vh] overflow-hidden" data-cursor="VIEW">
        <ImageReveal className="h-full"><Shot garment="jacket" color="#1c1d21" view="wide" tone="#2a2a2f" priority sizes="100vw" /></ImageReveal>
        <div className="absolute bottom-10 left-5 md:left-10"><p className="eyebrow">Form 01</p><h3 className="display mt-3 text-5xl md:text-8xl">The Night Shell</h3></div>
      </div>
      {/* overlapping asymmetry */}
      <div className="wrap relative grid gap-6 py-24 md:grid-cols-12 md:py-40">
        <motion.div style={{ y: y1 }} className="md:col-span-5 md:col-start-1"><ImageReveal className="aspect-[3/4]"><Shot garment="hoodie" color="#1a1a1f" view="model" tone="#1c1c20" /></ImageReveal></motion.div>
        <div className="flex flex-col justify-center md:col-span-3 md:px-6"><Reveal><p className="eyebrow">Heavyweight</p><p className="display mt-4 text-3xl md:text-4xl">480 grams of cotton, cut to hold its shape.</p><p className="mt-6 text-sm text-fog">Brushed-back loopback fleece, garment washed. A hoodie made to last past the season it launched in.</p></Reveal></div>
        <motion.div style={{ y: y2 }} className="md:col-span-4 md:mt-40"><ImageReveal className="aspect-[4/5]"><Shot garment="tee" color="#e4dfd5" view="front" tone="#26262a" /></ImageReveal></motion.div>
      </div>
      {/* image + typography, details */}
      <div className="wrap grid items-end gap-6 pb-24 md:grid-cols-12 md:pb-40">
        <div className="md:col-span-7"><ImageReveal className="aspect-[16/10]"><Shot garment="bomber" color="#4a1822" view="wide" tone="#1d1214" sizes="60vw" /></ImageReveal></div>
        <div className="md:col-span-2 md:-ml-24 md:mb-[-4rem] md:self-end"><ImageReveal className="aspect-square"><Shot garment="jacket" color="#a9adb4" view="detail" tone="#202226" /></ImageReveal></div>
        <div className="md:col-span-3"><h3 className="display text-5xl md:text-7xl"><Lines lines={["Form.", "Function.", "Identity."]} /></h3></div>
      </div>
      {/* horizontal drag strip */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-8 md:px-10" data-cursor="DRAG">
        {items.slice(0, 7).map((p, i) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="group relative aspect-[3/4] w-[70vw] shrink-0 overflow-hidden sm:w-[38vw] md:w-[24vw]">
            <div className="h-full transition-transform duration-[1200ms] group-hover:scale-105"><Shot garment={p.garment} color={p.colors[0].hex} view={i % 2 ? "model" : "detail"} tone="#202024" /></div>
            <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.25em]">{String(i + 1).padStart(2, "0")} — {p.name.replace("K&F ", "").toUpperCase()}</span>
          </Link>
        ))}
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
            <Link href={c.href} data-cursor="VIEW" className="group relative block aspect-[4/5] overflow-hidden">
              <div className="h-full w-full transition-transform duration-[1400ms] ease-out group-hover:scale-110"><Shot garment={c.garment} color={i % 2 ? "#2c2d31" : "#15151a"} view={i % 3 === 0 ? "model" : "front"} sizes="(max-width:768px) 50vw, 25vw" tone={c.tone} /></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-colors duration-700 group-hover:from-burgundy/70" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                <span className="display text-2xl transition-transform duration-500 group-hover:-translate-y-1 md:text-4xl">{c.label}</span>
                <span className="-translate-x-3 text-2xl opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">→</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Configurator() {
  const p = products[0];
  const [view3d, setView3d] = useState(false);
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-char py-24 md:py-32">
      <div className="wrap grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="eyebrow">Interactive 3D</p>
          <h2 className="display mt-4 text-5xl md:text-8xl"><Lines lines={["Hold it.", "Turn it.", "Make it yours."]} /></h2>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-fog">Rotate, zoom and re-material every K&amp;F piece — cotton, denim, leather, nylon, fleece, wool. See the stitching before you commit.</p>
          <div className="mt-10"><Magnetic><button onClick={() => setView3d(true)} className="btn btn-solid">Open 3D studio</button></Magnetic></div>
        </div>
        <div className="relative aspect-square w-full overflow-hidden border border-white/10 md:aspect-[4/5]" data-cursor="ROTATE" onClick={() => setView3d(true)}>
          <Shot garment="hoodie" color="#1a1a1f" view="front" tone="#18181b" />
          <div className="absolute inset-x-0 bottom-4 text-center text-[10px] tracking-[0.3em] text-fog">TAP TO ENTER STUDIO</div>
        </div>
      </div>
      <AnimatePresence>{view3d && <Viewer3D p={p} initialColor={0} onClose={() => setView3d(false)} />}</AnimatePresence>
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

function Campaign() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1, 1.1]);
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);
  return (
    <section ref={ref} className="relative h-[130vh] overflow-hidden grain">
      <motion.div style={{ scale }} className="sticky top-0 h-screen" data-cursor="PLAY">
        {/* looping "film": cross-fading campaign frames */}
        <CampaignFilm />
        <div className="absolute inset-0 bg-black/35" />
        <motion.div style={{ x }} className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap"><span className="display text-[34vw] leading-none text-white/[0.06]">2027 2027</span></motion.div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="eyebrow !text-bone">K&amp;F / 2027</p>
          <h2 className="display mt-4 text-[14vw] md:text-[10vw]"><Lines lines={["The New Form"]} /></h2>
          <div className="mt-8"><Magnetic><Link href="/lookbook" className="btn btn-ghost backdrop-blur">Explore campaign</Link></Magnetic></div>
        </div>
        <div className="absolute bottom-6 left-5 text-[10px] tracking-[0.3em] md:left-10">● REC 00:27</div>
      </motion.div>
    </section>
  );
}
function CampaignFilm() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % 4), 3600); return () => clearInterval(t); }, []);
  const frames = [["bomber", "#4a1822", "#1d1214", "wide"], ["jacket", "#1c1d21", "#25262b", "wide"], ["hoodie", "#16161a", "#1b1b1e", "wide"], ["pants", "#3a3c40", "#202226", "wide"]] as const;
  return <div className="absolute inset-0">{frames.map((f, k) => <div key={k} className="absolute inset-0 transition-opacity duration-[1800ms]" style={{ opacity: i === k ? 1 : 0 }}><Shot garment={f[0]} color={f[1]} tone={f[2]} view={f[3]} sizes="100vw" /></div>)}</div>;
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
          <div><p className="text-[10px] tracking-[0.3em] text-fog">LOOK {String(idx + 1).padStart(2, "0")} / {String(RUNWAY.length).padStart(2, "0")}</p>
            <AnimatePresence mode="wait"><motion.div key={look.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><p className="display mt-2 text-3xl md:text-5xl">{look.name.replace("K&F ", "")}</p><Link href={`/product/${look.slug}`} className="pointer-events-auto mt-3 inline-block text-[11px] tracking-[0.25em] underline underline-offset-8 hover:opacity-70">SHOP · {money(look.price)}</Link></motion.div></AnimatePresence></div>
          <p className="hidden text-[10px] tracking-[0.3em] text-fog md:block">SCROLL TO WALK ↓</p>
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
      <Hero />
      <Manifesto />
      <Editorial />
      <Collections />
      <Accessories />
      <Configurator />
      <FittingRoom />
      <Campaign />
      <Runway />
      <section className="py-24 md:py-40"><div className="wrap mb-12"><p className="eyebrow">Lookbook</p><h2 className="display mt-3 text-5xl md:text-8xl"><Lines lines={["Shop the look"]} /></h2></div><Lookbook /></section>
      <Featured />
    </>
  );
}
