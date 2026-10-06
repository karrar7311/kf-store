"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Shot, { type View } from "./Shot";
import Logo from "./Logo";
import { ProductCard, Viewer3D, WishButton, flyToCart } from "./Shop";
import { Lines } from "./Reveal";
import { useStore } from "@/lib/store";
import { money, products, type Product } from "@/lib/products";

const VIEWS: [View, string][] = [["front", "Front"], ["back", "Back"], ["side", "Side profile"], ["detail", "Close-up"], ["model", "Editorial"], ["fabric", "Fabric"], ["lifestyle", "Lifestyle"]];

export default function ProductView({ p }: { p: Product }) {
  const router = useRouter();
  const [ci, setCi] = useState(0), [size, setSize] = useState<string | null>(null), [qty, setQty] = useState(1);
  const [vi, setVi] = useState(0), [full, setFull] = useState(false), [v3, setV3] = useState(false), [guide, setGuide] = useState(false);
  const [err, setErr] = useState(false), [tab, setTab] = useState<string | null>("material");
  const addBtn = useRef<HTMLButtonElement>(null);
  const add = useStore((s) => s.add), setCartOpen = useStore((s) => s.setCartOpen);
  const color = p.colors[ci];
  const touch = useRef(0);

  const go = (d: number) => setVi((v) => (v + d + VIEWS.length) % VIEWS.length);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setFull(false); setGuide(false); } if (full && e.key === "ArrowRight") go(1); if (full && e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [full]);

  const addToCart = (): boolean => {
    if (!size) { setErr(true); return false; }
    add({ slug: p.slug, size, color: color.name, qty }); flyToCart(addBtn.current, color.hex); return true;
  };
  const low = size && (p.stock[size] ?? 0) <= 5 && (p.stock[size] ?? 0) > 0;

  const details: [string, string][] = [["material", p.details.material], ["fit", p.details.fit], ["care", p.details.care],
    ["shipping", "Complimentary express shipping on orders over $150. Orders dispatch within 24 hours; delivery in 2–4 business days in North America, 4–7 internationally."],
    ["returns", "Free returns within 30 days of delivery. Items must be unworn with tags attached."]];

  return (
    <div className="pt-24 md:pt-28">
      <div className="wrap grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        {/* gallery */}
        <div className="min-w-0">
          <div className="relative aspect-[4/5] overflow-hidden bg-graphite" data-cursor="VIEW" onClick={() => setFull(true)}
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)} onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); }}>
            <AnimatePresence mode="wait"><motion.div key={VIEWS[vi][0] + ci} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}><Shot garment={p.garment} color={color.hex} view={VIEWS[vi][0]} tone="#232326" /></motion.div></AnimatePresence>
            {p.badge && <span className="absolute left-4 top-4 border border-white/30 bg-black/30 px-3 py-1 text-[9px] tracking-[0.24em] backdrop-blur">{p.badge}</span>}
            <span className="absolute bottom-4 left-4 text-[10px] tracking-[0.25em] text-fog">{String(vi + 1).padStart(2, "0")} / {String(VIEWS.length).padStart(2, "0")} — {VIEWS[vi][1].toUpperCase()}</span>
            <button onClick={(e) => { e.stopPropagation(); setV3(true); }} data-cursor="3D" className="glass absolute bottom-4 right-4 px-5 py-3 text-[10px] uppercase tracking-[0.26em] hover:bg-bone hover:text-ink">View in 3D</button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {VIEWS.map(([v, l], i) => <button key={v} aria-label={l} onClick={() => setVi(i)} className={`aspect-[4/5] w-20 shrink-0 overflow-hidden border transition md:w-24 ${i === vi ? "border-bone" : "border-transparent opacity-60 hover:opacity-100"}`}><Shot garment={p.garment} color={color.hex} view={v} /></button>)}
          </div>
        </div>

        {/* purchase */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <Logo variant="silver" className="text-3xl" />
          <div className="mt-6 flex items-start justify-between gap-6"><h1 className="display text-4xl md:text-5xl">{p.name.replace("K&F ", "")}</h1><span className="pt-2 text-xl">{money(p.price)}</span></div>
          <p className="mt-2 text-xs text-fog">★ {p.rating} · {p.reviews} reviews</p>
          <p className="mt-6 text-sm leading-relaxed text-fog">{p.description}</p>

          <p className="eyebrow mb-3 mt-8">Color — <span className="text-bone">{color.name}</span></p>
          <div className="flex gap-3">{p.colors.map((c, i) => <button key={c.name} aria-label={c.name} aria-pressed={i === ci} onClick={() => setCi(i)} className={`h-9 w-9 rounded-full border transition ${i === ci ? "ring-1 ring-bone ring-offset-2 ring-offset-ink" : "border-white/30"}`} style={{ background: c.hex }} />)}</div>

          <div className="mb-3 mt-8 flex justify-between"><p className={`eyebrow ${err ? "!text-red-400" : ""}`}>{err ? "Please select a size" : "Size"}</p><button onClick={() => setGuide(true)} className="text-[10px] uppercase tracking-[0.2em] text-fog underline underline-offset-4 hover:text-bone">Size guide</button></div>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Size">{p.sizes.map((s) => { const out = (p.stock[s] ?? 0) === 0; return <button key={s} role="radio" aria-checked={size === s} disabled={out} onClick={() => { setSize(s); setErr(false); }} className={`border py-3 text-xs tracking-widest transition ${size === s ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"} ${out ? "line-through opacity-30" : ""}`}>{s}</button>; })}</div>
          {low && <p className="mt-3 text-xs text-burgundy brightness-200">Only {p.stock[size!]} left in {size}</p>}

          <div className="mt-8 flex gap-3">
            <div className="flex items-center border border-white/20"><button aria-label="Decrease quantity" className="h-14 w-12" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="w-8 text-center text-sm">{qty}</span><button aria-label="Increase quantity" className="h-14 w-12" onClick={() => setQty(qty + 1)}>+</button></div>
            <button ref={addBtn} onClick={() => { if (addToCart()) setTimeout(() => setCartOpen(true), 1000); }} className="btn btn-solid flex-1">Add to cart</button>
            <WishButton slug={p.slug} className="!h-14 !w-14 !rounded-none border border-white/20" />
          </div>
          <button onClick={() => { if (addToCart()) router.push("/checkout"); }} className="btn btn-ghost mt-3 w-full">Buy now</button>

          <div className="mt-10 border-t border-white/10">
            {details.map(([k, v]) => (
              <div key={k} className="border-b border-white/10">
                <button onClick={() => setTab(tab === k ? null : k)} aria-expanded={tab === k} className="flex w-full items-center justify-between py-5 text-[11px] uppercase tracking-[0.26em]">{k}<span className="text-lg">{tab === k ? "−" : "+"}</span></button>
                <AnimatePresence initial={false}>{tab === k && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-5 text-sm leading-relaxed text-fog">{v}</motion.p>}</AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="wrap py-28"><h2 className="display mb-10 text-4xl md:text-6xl"><Lines lines={["Complete the look"]} /></h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{products.filter((x) => x.slug !== p.slug).slice(0, 4).map((x, i) => <ProductCard key={x.slug} p={x} index={i} />)}</div></section>

      {/* fullscreen gallery */}
      <AnimatePresence>
        {full && (
          <motion.div className="fixed inset-0 z-[90] bg-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="Gallery"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)} onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); }}>
            <div className="absolute inset-0 mx-auto max-w-[1100px]"><Shot garment={p.garment} color={color.hex} view={VIEWS[vi][0]} tone="#232326" /></div>
            <button onClick={() => setFull(false)} className="eyebrow absolute right-6 top-6 hover:text-bone">Close ✕</button>
            <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-4 top-1/2 text-4xl text-fog hover:text-bone">‹</button>
            <button aria-label="Next" onClick={() => go(1)} className="absolute right-4 top-1/2 text-4xl text-fog hover:text-bone">›</button>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-fog">{VIEWS[vi][1].toUpperCase()} · {vi + 1}/{VIEWS.length}</p>
          </motion.div>
        )}
        {v3 && <Viewer3D p={p} initialColor={ci} onClose={() => setV3(false)} />}
        {guide && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGuide(false)} role="dialog" aria-label="Size guide">
            <div className="w-full max-w-lg bg-char p-8" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex justify-between"><h3 className="eyebrow !text-bone">Size guide (cm)</h3><button onClick={() => setGuide(false)}>✕</button></div>
              <table className="w-full text-left text-sm"><thead className="text-fog"><tr><th className="pb-3 font-normal">Size</th><th className="font-normal">Chest</th><th className="font-normal">Length</th><th className="font-normal">Height</th></tr></thead>
                <tbody>{[["XS", 92, 66, "165–170"], ["S", 98, 68, "170–176"], ["M", 104, 70, "176–182"], ["L", 110, 72, "182–188"], ["XL", 116, 74, "188–194"]].map((r) => <tr key={r[0]} className="border-t border-white/10">{r.map((c, i) => <td key={i} className="py-3">{c}</td>)}</tr>)}</tbody></table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
