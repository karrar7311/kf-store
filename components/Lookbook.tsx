"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Shot from "./Shot";
import { findProduct, lookbook, money } from "@/lib/products";
import { useStore } from "@/lib/store";

/** Interactive lookbook: outfit stage + product hotspots + individual products. */
export function Lookbook() {
  const [look, setLook] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const add = useStore((s) => s.add), open = useStore((s) => s.setCartOpen);
  const L = lookbook[look];
  const pieces = L.items.map((i) => ({ ...i, p: findProduct(i.slug)! }));
  const sel = pieces.find((x) => x.slug === active)?.p;
  return (
    <div className="wrap grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-16">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[640px] overflow-hidden" data-cursor="SHOP">
        <AnimatePresence mode="wait">
          <motion.div key={look} className="absolute inset-0" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <Shot garment={pieces[0].p.garment === "cap" ? "jacket" : pieces[0].p.garment} color={pieces[0].p.colors[0].hex} view="model" tone={L.tone} />
          </motion.div>
        </AnimatePresence>
        {pieces.map((x) => (
          <button key={x.slug + look} aria-label={`View ${x.p.name}`} onClick={() => setActive(x.slug === active ? null : x.slug)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x.x}%`, top: `${x.y}%` }}>
            <span className="absolute inset-0 animate-ping rounded-full bg-bone/40" />
            <span className={`relative block h-5 w-5 rounded-full border-2 border-bone transition ${active === x.slug ? "bg-bone" : "bg-black/40 backdrop-blur"}`} />
          </button>
        ))}
        <AnimatePresence>
          {sel && (
            <motion.div key={sel.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="glass absolute inset-x-3 bottom-3 p-4">
              <div className="flex items-start justify-between"><div><p className="text-sm">{sel.name}</p><p className="mt-1 text-xs text-fog">{money(sel.price)}</p></div><button onClick={() => setActive(null)} aria-label="Close" className="text-fog hover:text-bone">✕</button></div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="btn btn-ghost !px-2 !py-3" onClick={() => { add({ slug: sel.slug, size: sel.sizes[Math.floor(sel.sizes.length / 2)], color: sel.colors[0].name, qty: 1 }); open(true); }}>Quick view / add</button>
                <Link href={`/product/${sel.slug}`} className="btn btn-solid !px-2 !py-3">Shop product</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex gap-6 border-b border-white/10 pb-4">{lookbook.map((l, i) => <button key={l.id} onClick={() => { setLook(i); setActive(null); }} className={`text-[11px] uppercase tracking-[0.24em] transition ${i === look ? "text-bone" : "text-fog hover:text-bone"}`}>0{l.id}</button>)}</div>
          <h3 className="display mt-6 text-4xl md:text-6xl">{L.title}</h3>
          <p className="mt-4 max-w-sm text-sm text-fog">Tap the hotspots on the model to see each piece, or pick from the outfit below.</p>
        </div>
        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {pieces.map((x) => (
            <li key={x.slug}><button onClick={() => setActive(x.slug)} className={`flex w-full items-center gap-4 py-4 text-left transition ${active === x.slug ? "bg-white/5" : "hover:bg-white/5"}`}>
              <div className="h-20 w-16 shrink-0 overflow-hidden"><Shot garment={x.p.garment} color={x.p.colors[0].hex} /></div>
              <div className="flex-1"><p className="text-sm">{x.p.name}</p><p className="text-xs text-fog">{x.p.colors[0].name}</p></div><span className="pr-3 text-sm">{money(x.p.price)}</span>
            </button></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
