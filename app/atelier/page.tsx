"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Shot from "@/components/Shot";
import { useStore } from "@/lib/store";
import { money, products, type Material } from "@/lib/products";

const AtelierScene = dynamic(() => import("@/components/three/AtelierScene"), { ssr: false, loading: () => <div className="grid h-full place-items-center text-[10px] tracking-[0.3em] text-fog">LOADING ATELIER</div> });

const BASES = products.filter((p) => ["hoodie", "tee", "sweater", "jacket", "bomber", "vest", "coat", "pants", "shorts"].includes(p.garment) && p.slug !== "denim-trucker" && p.slug !== "wool-overshirt");
const FABRICS: [Material, string, number][] = [["cotton", "Cotton", 0], ["fleece", "Fleece", 10], ["nylon", "Nylon", 15], ["denim", "Denim", 20], ["wool", "Wool", 30], ["leather", "Leather", 80]];
const PALETTE: [string, string][] = [["#16161a", "Onyx"], ["#0e0e10", "Black"], ["#e4dfd5", "Bone"], ["#6f7076", "Ash"], ["#a9adb4", "Silver"], ["#3a3c40", "Slate"], ["#4b1620", "Oxblood"], ["#8a2b2b", "Rust"], ["#1f2a44", "Indigo"], ["#2f4a3a", "Forest"], ["#a38d6d", "Camel"], ["#cfc6b4", "Oatmeal"]];
const MADE_TO_ORDER = 10;

export default function Atelier() {
  const [baseSlug, setBase] = useState(BASES[0].slug);
  const base = BASES.find((b) => b.slug === baseSlug) ?? BASES[0];
  const [material, setMaterial] = useState<Material>(base.material);
  const [color, setColor] = useState(base.colors[0].hex);
  const [mono, setMono] = useState("");
  const [stitch, setStitch] = useState(true);
  const [spin, setSpin] = useState(true);
  const [size, setSize] = useState(base.sizes[Math.floor(base.sizes.length / 2)]);
  const [added, setAdded] = useState(false);
  const add = useStore((s) => s.add), setCartOpen = useStore((s) => s.setCartOpen);

  const pick = (slug: string) => {
    const b = BASES.find((x) => x.slug === slug)!;
    setBase(slug); setMaterial(b.material); setColor(b.colors[0].hex); setSize(b.sizes[Math.floor(b.sizes.length / 2)]);
  };

  const fp = (m: Material) => FABRICS.find((f) => f[0] === m)![2];
  const customColour = !PALETTE.some(([h]) => h.toLowerCase() === color.toLowerCase()) && !base.colors.some((c) => c.hex.toLowerCase() === color.toLowerCase());
  const price = useMemo(() => base.price + (fp(material) - fp(base.material)) + (mono ? 12 : 0) + (customColour ? 10 : 0), [base, material, mono, customColour]);
  const fabricName = FABRICS.find((f) => f[0] === material)![1];
  const colourName = PALETTE.find(([h]) => h.toLowerCase() === color.toLowerCase())?.[1] ?? base.colors.find((c) => c.hex.toLowerCase() === color.toLowerCase())?.name ?? color.toUpperCase();

  const addToBag = () => {
    add({ slug: base.slug, size, color: `Custom ${color.toLowerCase()}`, qty: 1, unit: price, note: `${fabricName} · ${colourName}${mono ? ` · monogram “${mono}”` : ""} · made to order` });
    setAdded(true); setCartOpen(true); setTimeout(() => setAdded(false), 2500);
  };
  const eyebrow = "eyebrow mb-3";

  return (
    <div className="pt-20 lg:pt-24">
      <div className="grid lg:h-[calc(100svh-6rem)] lg:grid-cols-[1.4fr_1fr]">
        <div className="relative h-[58svh] lg:h-auto" data-cursor="ROTATE">
          <AtelierScene garment={base.garment} color={color} material={material} monogram={mono} stitching={stitch} spin={spin} />
          <div className="pointer-events-none absolute left-5 top-4 md:left-8"><p className="eyebrow">K&amp;F Atelier</p><h1 className="display mt-2 text-3xl md:text-5xl">Make it yours</h1></div>
          <div className="absolute bottom-4 left-4 flex gap-2 md:left-8">
            <button onClick={() => setSpin(!spin)} className="glass px-4 py-2.5 text-[10px] uppercase tracking-[0.22em]">{spin ? "Pause" : "Spin"}</button>
            <button onClick={() => setStitch(!stitch)} aria-pressed={stitch} className="glass px-4 py-2.5 text-[10px] uppercase tracking-[0.22em]">Stitching {stitch ? "on" : "off"}</button>
          </div>
          <p className="pointer-events-none absolute bottom-5 right-4 hidden text-[10px] tracking-[0.25em] text-fog md:block md:right-8">DRAG TO ROTATE · SCROLL TO ZOOM</p>
        </div>

        <aside className="flex flex-col border-t border-white/10 bg-char lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="flex-1 space-y-8 p-5">
            <section>
              <p className={eyebrow}>1 — Base</p>
              <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                {BASES.map((b) => (
                  <button key={b.slug} onClick={() => pick(b.slug)} aria-pressed={b.slug === baseSlug} className={`shrink-0 overflow-hidden border text-left transition ${b.slug === baseSlug ? "border-bone" : "border-white/10 hover:border-white/40"}`}>
                    <div className="aspect-[4/5] w-24"><Shot garment={b.garment} color={b.colors[0].hex} sizes="100px" /></div>
                    <p className="truncate bg-black/50 px-2 py-1.5 text-[10px]">{b.name.replace("K&F ", "")}</p>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className={eyebrow}>2 — Fabric · {fabricName}</p>
              <div className="flex flex-wrap gap-2">
                {FABRICS.map(([m, n, p]) => (
                  <button key={m} onClick={() => setMaterial(m)} aria-pressed={m === material} className={`border px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition ${m === material ? "border-bone bg-bone text-ink" : "border-white/15 text-fog hover:border-bone hover:text-bone"}`}>
                    {n}{p - fp(base.material) !== 0 && <span className="ml-1.5 opacity-60">{p - fp(base.material) > 0 ? "+" : "−"}${Math.abs(p - fp(base.material))}</span>}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className={eyebrow}>3 — Colour · {colourName}</p>
              <div className="flex flex-wrap items-center gap-2.5">
                {PALETTE.map(([h, n]) => <button key={h} aria-label={n} title={n} onClick={() => setColor(h)} className={`h-8 w-8 rounded-full border ${color.toLowerCase() === h ? "ring-1 ring-bone ring-offset-2 ring-offset-char" : "border-white/25"}`} style={{ background: h }} />)}
                <label className="ml-1 flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fog hover:text-bone">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Pick any colour" className="h-8 w-8 cursor-pointer appearance-none overflow-hidden rounded-full border border-white/25 bg-transparent p-0" />
                  Any colour {customColour && "+$10"}
                </label>
              </div>
            </section>

            <section>
              <p className={eyebrow}>4 — Monogram {mono && "+$12"}</p>
              <input value={mono} maxLength={8} onChange={(e) => setMono(e.target.value.replace(/[^\p{L}\p{N}&. -]/gu, ""))} placeholder="Up to 8 characters (optional)" aria-label="Monogram" className="field" />
              <p className="mt-2 text-xs text-fog">Embroidered tonally at the chest, in place of the K&amp;F mark.</p>
            </section>

            <section>
              <p className={eyebrow}>5 — Size · {size}</p>
              <div className="flex flex-wrap gap-2">{base.sizes.map((s) => <button key={s} onClick={() => setSize(s)} aria-pressed={s === size} className={`min-w-14 border py-3 text-xs tracking-widest transition ${s === size ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}>{s}</button>)}</div>
            </section>
          </div>

          <div className="border-t border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="mb-1 flex justify-between"><span className="eyebrow !text-bone">{base.name.replace("K&F ", "Custom ")}</span><span className="text-lg">{money(price)}</span></div>
            <p className="mb-4 text-xs text-fog">Made to order. Ships in about {MADE_TO_ORDER}–14 days. Final sale.</p>
            <button onClick={addToBag} className="btn btn-solid w-full">{added ? "Added ✓" : "Add to bag"}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
