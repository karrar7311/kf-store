"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import Shot from "./Shot";
import Logo from "./Logo";
import { useStore } from "@/lib/store";
import { money, type Product, type Material } from "@/lib/products";

const ProductScene = dynamic(() => import("./three/ProductScene"), { ssr: false, loading: () => <div className="grid h-full place-items-center text-[10px] tracking-[0.3em] text-fog">LOADING 3D</div> });

/** Animate a swatch from the trigger element into the cart icon. */
export function flyToCart(from: HTMLElement | null, color: string) {
  const to = document.querySelector("[data-cart-icon]") as HTMLElement | null;
  if (!from || !to) return;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const el = document.createElement("div");
  el.style.cssText = `position:fixed;z-index:300;left:${a.left + a.width / 2}px;top:${a.top + a.height / 2}px;width:46px;height:58px;margin:-29px 0 0 -23px;background:${color};border:1px solid rgba(255,255,255,.4);pointer-events:none;box-shadow:0 10px 40px rgba(0,0,0,.6)`;
  document.body.appendChild(el);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  gsap.timeline({ onComplete: () => el.remove() })
    .to(el, { y: -60, scale: 1.15, duration: 0.25, ease: "power2.out" })
    .to(el, { x: dx, y: dy, scale: 0.15, opacity: 0.4, rotate: 20, duration: 0.8, ease: "power3.in" });
}

export function WishButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { wishlist, toggleWish } = useStore();
  const on = wishlist.includes(slug);
  return (
    <button aria-label={on ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={on} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(slug); }} className={`grid h-9 w-9 place-items-center rounded-full bg-black/30 backdrop-blur transition hover:bg-black/60 ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={on ? "#efece6" : "none"} stroke="#efece6" strokeWidth="1.4"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" /></svg>
    </button>
  );
}

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const [ci, setCi] = useState(0);
  const [quick, setQuick] = useState(false);
  const add = useStore((s) => s.add);
  const open = useStore((s) => s.setCartOpen);
  const color = p.colors[ci];
  const bg = "#232326";
  const quickAdd = (size: string, el: HTMLElement) => { add({ slug: p.slug, size, color: color.name, qty: 1 }); flyToCart(el, color.hex); setQuick(false); setTimeout(() => open(true), 1000); };
  return (
    <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }} className="group relative" onMouseLeave={() => setQuick(false)}>
      <Link href={`/product/${p.slug}`} data-cursor="SHOP" className="relative block aspect-[4/5] overflow-hidden bg-graphite">
        <div className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0"><Shot garment={p.garment} color={color.hex} view="front" tone={bg} /></div>
        <div className="absolute inset-0 scale-105 opacity-0 transition-all duration-[900ms] group-hover:scale-100 group-hover:opacity-100"><Shot garment={p.garment} color={color.hex} view="model" tone="#1a1a1d" /></div>
        {p.badge && <span className="absolute left-3 top-3 border border-white/30 bg-black/30 px-3 py-1 text-[9px] tracking-[0.24em] backdrop-blur">{p.badge}</span>}
      </Link>
      <WishButton slug={p.slug} className="absolute right-3 top-3" />
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5]">
        <div className="pointer-events-auto absolute inset-x-3 bottom-3">
          <AnimatePresence mode="wait">
            {quick ? (
              <motion.div key="sizes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass flex justify-between p-2">
                {p.sizes.map((s) => <button key={s} disabled={(p.stock[s] ?? 0) === 0} onClick={(e) => quickAdd(s, e.currentTarget)} className="flex-1 py-3 text-[11px] tracking-widest hover:bg-bone hover:text-ink disabled:line-through disabled:opacity-30">{s}</button>)}
              </motion.div>
            ) : (
              <button key="q" onClick={() => setQuick(true)} className="glass w-full translate-y-3 py-3 text-[10px] uppercase tracking-[0.26em] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">Quick add +</button>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div><Link href={`/product/${p.slug}`} className="text-sm">{p.name}</Link><p className="mt-1 text-xs text-fog">{color.name}{p.colors.length > 1 && ` · ${p.colors.length} colors`}</p></div>
        <span className="text-sm">{money(p.price)}</span>
      </div>
      <div className="mt-3 flex gap-2">{p.colors.map((c, i) => <button key={c.name} aria-label={c.name} title={c.name} onClick={() => setCi(i)} className={`h-4 w-4 rounded-full border transition ${i === ci ? "border-bone ring-1 ring-bone ring-offset-2 ring-offset-ink" : "border-white/30"}`} style={{ background: c.hex }} />)}</div>
    </motion.article>
  );
}

/* ---------- Immersive 3D viewer ---------- */
const MATS: Material[] = ["cotton", "denim", "leather", "nylon", "fleece", "wool"];
export function Viewer3D({ p, initialColor, onClose }: { p: Product; initialColor: number; onClose: () => void }) {
  const [ci, setCi] = useState(initialColor);
  const [mat, setMat] = useState<Material>(p.material);
  const [stitch, setStitch] = useState(true);
  const [lit, setLit] = useState(true);
  const [rot, setRot] = useState(true);
  return (
    <motion.div role="dialog" aria-label="3D viewer" className="fixed inset-0 z-[95] bg-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0" data-cursor="ROTATE"><ProductScene garment={p.garment} color={p.colors[ci].hex} material={mat} stitching={stitch} lit={lit} autoRotate={rot} /></div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-8">
        <Logo variant="silver" className="text-3xl" />
        <button onClick={onClose} className="pointer-events-auto eyebrow hover:text-bone">Close ✕</button>
      </div>
      <div className="pointer-events-none absolute left-5 top-24 md:left-8">
        <p className="eyebrow">Interactive 3D</p><h2 className="display mt-2 max-w-xs text-3xl md:text-4xl">{p.name.replace("K&F ", "")}</h2>
        <p className="mt-3 hidden text-xs text-fog md:block">Drag to rotate · Scroll or pinch to zoom</p>
      </div>
      <div className="glass absolute inset-x-3 bottom-3 grid gap-4 p-4 md:inset-x-auto md:bottom-8 md:left-1/2 md:w-[min(900px,92vw)] md:-translate-x-1/2 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-5">
        <div className="flex items-center gap-2">{p.colors.map((c, i) => <button key={c.name} aria-label={c.name} onClick={() => setCi(i)} className={`h-7 w-7 rounded-full border ${i === ci ? "ring-1 ring-bone ring-offset-2 ring-offset-black" : "border-white/30"}`} style={{ background: c.hex }} />)}</div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">{MATS.map((m) => <button key={m} onClick={() => setMat(m)} className={`shrink-0 px-3 py-2 text-[10px] uppercase tracking-[0.2em] ${m === mat ? "bg-bone text-ink" : "text-fog hover:text-bone"}`}>{m}</button>)}</div>
        <div className="flex gap-4 text-[10px] uppercase tracking-[0.2em]">
          <button onClick={() => setStitch(!stitch)} aria-pressed={stitch} className={stitch ? "text-bone" : "text-fog"}>Stitching</button>
          <button onClick={() => setLit(!lit)} aria-pressed={lit} className={lit ? "text-bone" : "text-fog"}>Light</button>
          <button onClick={() => setRot(!rot)} aria-pressed={rot} className={rot ? "text-bone" : "text-fog"}>Spin</button>
        </div>
      </div>
    </motion.div>
  );
}
