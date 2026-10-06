"use client";
import { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Shot from "@/components/Shot";
import { useStore } from "@/lib/store";
import { money, products, type Product } from "@/lib/products";
import type { Outfit, Piece } from "@/components/three/TryOnScene";

const TryOnScene = dynamic(() => import("@/components/three/TryOnScene"), { ssr: false, loading: () => <div className="grid h-full place-items-center text-[10px] tracking-[0.3em] text-fog">LOADING FITTING ROOM</div> });

const TOPS = products.filter((p) => ["hoodie", "tee", "jacket", "bomber"].includes(p.garment));
const BOTTOMS = products.filter((p) => p.garment === "pants");
const EXTRAS = products.filter((p) => p.category === "accessories");
const SKINS = [["#f0cdb2", "Light"], ["#e0b08c", "Fair"], ["#c99a7a", "Medium"], ["#a9744f", "Tan"], ["#7b4e33", "Deep"], ["#4d2f1f", "Rich"]] as const;
const SIZES = [["XS", 0.92], ["S", 0.96], ["M", 1], ["L", 1.05], ["XL", 1.1]] as const;
const PANT_SIZE: Record<string, string> = { XS: "28", S: "30", M: "32", L: "34", XL: "36" };

type Sel = { slug: string; ci: number };
const piece = (s: Sel): Piece => { const p = products.find((x) => x.slug === s.slug)!; return { garment: p.garment, material: p.material, color: p.colors[s.ci]?.hex ?? p.colors[0].hex }; };

function Room() {
  const q = useSearchParams();
  const pre = q.get("item"), preC = Number(q.get("color") ?? 0) || 0;
  const preP = products.find((p) => p.slug === pre);
  const [top, setTop] = useState<Sel>({ slug: preP && TOPS.includes(preP) ? preP.slug : TOPS[0].slug, ci: preP && TOPS.includes(preP) ? preC : 0 });
  const [bottom, setBottom] = useState<Sel>({ slug: preP && BOTTOMS.includes(preP) ? preP.slug : BOTTOMS[0].slug, ci: preP && BOTTOMS.includes(preP) ? preC : 0 });
  const [acc, setAcc] = useState<Record<string, number>>(preP && EXTRAS.includes(preP) ? { [preP.slug]: preC } : {});
  const [tab, setTab] = useState<"tops" | "bottoms" | "extras" | "body">("tops");
  const [skin, setSkin] = useState<string>(SKINS[2][0]);
  const [size, setSize] = useState<(typeof SIZES)[number][0]>("M");
  const [height, setHeight] = useState(1);
  const [spin, setSpin] = useState(true);
  const [added, setAdded] = useState(false);
  const add = useStore((s) => s.add), setCartOpen = useStore((s) => s.setCartOpen);

  const outfit: Outfit = useMemo(() => ({
    top: piece(top), bottom: piece(bottom), acc: Object.entries(acc).map(([slug, ci]) => piece({ slug, ci })),
    skin, hair: "#1b1511", width: SIZES.find((s) => s[0] === size)![1], height,
  }), [top, bottom, acc, skin, size, height]);

  const worn: { p: Product; ci: number }[] = [
    { p: products.find((x) => x.slug === top.slug)!, ci: top.ci }, { p: products.find((x) => x.slug === bottom.slug)!, ci: bottom.ci },
    ...Object.entries(acc).map(([slug, ci]) => ({ p: products.find((x) => x.slug === slug)!, ci })),
  ];
  const total = worn.reduce((a, w) => a + w.p.price, 0);
  const sizeFor = (p: Product) => (p.sizes.includes(size) ? size : p.garment === "pants" ? PANT_SIZE[size] : p.garment === "belt" ? p.sizes[Math.min(p.sizes.length - 1, Math.max(0, SIZES.findIndex((s) => s[0] === size) - 1))] : p.sizes[0]);
  const addOutfit = () => { worn.forEach(({ p, ci }) => add({ slug: p.slug, size: sizeFor(p), color: p.colors[ci].name, qty: 1 })); setAdded(true); setCartOpen(true); setTimeout(() => setAdded(false), 2500); };

  const Card = ({ p, active, onPick, ci }: { p: Product; active: boolean; onPick: () => void; ci: number }) => (
    <button onClick={onPick} aria-pressed={active} className={`group relative shrink-0 overflow-hidden border text-left transition ${active ? "border-bone" : "border-white/10 hover:border-white/40"}`}>
      <div className="aspect-[4/5] w-24 sm:w-28"><Shot garment={p.garment} color={p.colors[ci]?.hex ?? p.colors[0].hex} sizes="120px" /></div>
      <p className="truncate bg-black/50 px-2 py-1.5 text-[10px] tracking-wide">{p.name.replace("K&F ", "")}</p>
    </button>
  );
  const Swatches = ({ p, ci, onPick }: { p: Product; ci: number; onPick: (i: number) => void }) => (
    <div className="mt-4 flex items-center gap-2"><span className="eyebrow mr-1">{p.colors[ci]?.name}</span>{p.colors.map((c, i) => <button key={c.name} aria-label={c.name} onClick={() => onPick(i)} className={`h-7 w-7 rounded-full border ${i === ci ? "ring-1 ring-bone ring-offset-2 ring-offset-ink" : "border-white/30"}`} style={{ background: c.hex }} />)}</div>
  );
  const topP = products.find((p) => p.slug === top.slug)!, botP = products.find((p) => p.slug === bottom.slug)!;

  return (
    <div className="pt-20 lg:pt-24">
      <div className="grid lg:h-[calc(100svh-6rem)] lg:grid-cols-[1.4fr_1fr]">
        <div className="relative h-[58svh] lg:h-auto" data-cursor="ROTATE">
          <TryOnScene outfit={outfit} spin={spin} />
          <div className="pointer-events-none absolute left-5 top-4 md:left-8"><p className="eyebrow">Fitting room</p><h1 className="display mt-2 text-3xl md:text-5xl">Try it on</h1></div>
          <button onClick={() => setSpin(!spin)} className="glass absolute bottom-4 left-4 px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] md:left-8">{spin ? "Pause" : "Spin"}</button>
          <p className="pointer-events-none absolute bottom-5 right-4 hidden text-[10px] tracking-[0.25em] text-fog md:block md:right-8">DRAG TO ROTATE · SCROLL TO ZOOM</p>
        </div>

        <aside className="flex flex-col border-t border-white/10 bg-char lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="flex border-b border-white/10">
            {(["tops", "bottoms", "extras", "body"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-4 text-[11px] uppercase tracking-[0.22em] transition ${tab === t ? "bg-bone text-ink" : "text-fog hover:text-bone"}`}>{t}</button>)}
          </div>
          <div className="flex-1 p-5">
            {tab === "tops" && <><div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">{TOPS.map((p) => <Card key={p.slug} p={p} ci={top.slug === p.slug ? top.ci : 0} active={top.slug === p.slug} onPick={() => setTop({ slug: p.slug, ci: 0 })} />)}</div><Swatches p={topP} ci={top.ci} onPick={(i) => setTop({ ...top, ci: i })} /></>}
            {tab === "bottoms" && <><div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">{BOTTOMS.map((p) => <Card key={p.slug} p={p} ci={bottom.slug === p.slug ? bottom.ci : 0} active={bottom.slug === p.slug} onPick={() => setBottom({ slug: p.slug, ci: 0 })} />)}</div><Swatches p={botP} ci={bottom.ci} onPick={(i) => setBottom({ ...bottom, ci: i })} /></>}
            {tab === "extras" && (
              <div>
                <p className="mb-4 text-xs text-fog">Tap to add or remove. Each accessory is placed on the figure.</p>
                <div className="grid grid-cols-3 gap-3">{EXTRAS.map((p) => { const on = p.slug in acc; return (
                  <div key={p.slug}>
                    <button onClick={() => setAcc((a) => { const n = { ...a }; if (on) delete n[p.slug]; else n[p.slug] = 0; return n; })} aria-pressed={on} className={`relative block w-full overflow-hidden border transition ${on ? "border-bone" : "border-white/10 hover:border-white/40"}`}>
                      <div className="aspect-square"><Shot garment={p.garment} color={p.colors[acc[p.slug] ?? 0].hex} sizes="140px" /></div>
                      {on && <span className="absolute right-1.5 top-1.5 bg-bone px-1.5 text-[10px] text-ink">✓</span>}
                    </button>
                    <p className="mt-1.5 truncate text-[10px]">{p.name.replace("K&F ", "")}</p>
                    {on && <div className="mt-1 flex gap-1">{p.colors.map((c, i) => <button key={c.name} aria-label={c.name} onClick={() => setAcc((a) => ({ ...a, [p.slug]: i }))} className={`h-4 w-4 rounded-full border ${acc[p.slug] === i ? "ring-1 ring-bone ring-offset-1 ring-offset-char" : "border-white/30"}`} style={{ background: c.hex }} />)}</div>}
                  </div>); })}</div>
              </div>
            )}
            {tab === "body" && (
              <div className="space-y-7">
                <div><p className="eyebrow mb-3">Skin tone</p><div className="flex gap-3">{SKINS.map(([c, n]) => <button key={c} aria-label={n} title={n} onClick={() => setSkin(c)} className={`h-9 w-9 rounded-full border ${skin === c ? "ring-1 ring-bone ring-offset-2 ring-offset-char" : "border-white/20"}`} style={{ background: c }} />)}</div></div>
                <div><p className="eyebrow mb-3">Size — {size}</p><div className="grid grid-cols-5 gap-2">{SIZES.map(([s]) => <button key={s} onClick={() => setSize(s)} className={`border py-3 text-xs tracking-widest ${size === s ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}>{s}</button>)}</div></div>
                <div><p className="eyebrow mb-3">Height — {Math.round(170 * height)} cm</p><input type="range" min={0.92} max={1.1} step={0.01} value={height} onChange={(e) => setHeight(Number(e.target.value))} aria-label="Height" className="w-full accent-white" /></div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <ul className="mb-4 space-y-1.5 text-xs text-fog">{worn.map(({ p, ci }) => <li key={p.slug} className="flex justify-between"><span className="truncate pr-3">{p.name.replace("K&F ", "")} · {p.colors[ci].name} · {sizeFor(p)}</span><span className="text-bone">{money(p.price)}</span></li>)}</ul>
            <div className="mb-4 flex justify-between"><span className="eyebrow !text-bone">Outfit total</span><span>{money(total)}</span></div>
            <button onClick={addOutfit} className="btn btn-solid w-full">{added ? "Added ✓" : `Add outfit to bag (${worn.length})`}</button>
            <Link href={`/product/${topP.slug}`} className="mt-3 block text-center text-[10px] uppercase tracking-[0.22em] text-fog underline underline-offset-4 hover:text-bone">View {topP.name.replace("K&F ", "")}</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function TryOnPage() { return <Suspense fallback={<div className="h-screen" />}><Room /></Suspense>; }

