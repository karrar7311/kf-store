"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/Shop";
import { products } from "@/lib/products";
import { useStore } from "@/lib/store";

const SORTS = [["featured", "Featured"], ["new", "Newest"], ["low", "Price: Low to High"], ["high", "Price: High to Low"]] as const;

function Listing() {
  const sp = useSearchParams(), router = useRouter();
  const wishlist = useStore((s) => s.wishlist);
  const [sort, setSort] = useState<string>("featured");
  const [open, setOpen] = useState(false);
  const gender = sp.get("gender"), category = sp.get("category"), isNew = sp.get("filter") === "new", wish = sp.get("wishlist");
  const color = sp.get("color");
  const set = (k: string, v: string | null) => { const n = new URLSearchParams(sp.toString()); v ? n.set(k, v) : n.delete(k); router.replace(`/shop?${n}`, { scroll: false }); };

  const list = useMemo(() => {
    let l = products.filter((p) => (!gender || p.gender === gender || p.gender === "unisex") && (!category || p.category === category) && (!isNew || p.badge === "NEW" || p.createdAt >= "2027-02-15") && (!wish || wishlist.includes(p.slug)) && (!color || p.colors.some((c) => c.name.toLowerCase() === color.toLowerCase())));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "new") l = [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return l;
  }, [gender, category, isNew, wish, wishlist, sort, color]);

  const chip = (label: string, active: boolean, on: () => void) => <button key={label} onClick={on} aria-pressed={active} className={`border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${active ? "border-bone bg-bone text-ink" : "border-white/15 text-fog hover:border-bone hover:text-bone"}`}>{label}</button>;
  const title = wish ? "Wishlist" : category ? category : gender ? gender : isNew ? "New arrivals" : "All products";
  const allColors = Array.from(new Set(products.flatMap((p) => p.colors.map((c) => c.name))));

  return (
    <div className="wrap pt-32">
      <p className="eyebrow">K&amp;F / SS27</p>
      <h1 className="display mt-3 text-6xl capitalize md:text-9xl">{title}</h1>
      <div className="sticky top-[60px] z-30 -mx-5 mt-10 border-y border-white/10 bg-ink/85 px-5 py-4 backdrop-blur-xl md:-mx-10 md:px-10">
        <div className="flex items-center justify-between">
          <button className="eyebrow !text-bone md:hidden" onClick={() => setOpen(!open)}>Filters {open ? "−" : "+"}</button>
          <div className="hidden flex-wrap gap-2 md:flex">
            {chip("All", !gender && !category && !isNew && !wish, () => router.replace("/shop"))}
            {["men", "women"].map((g) => chip(g, gender === g, () => set("gender", gender === g ? null : g)))}
            {["outerwear", "tops", "bottoms", "essentials", "accessories"].map((c) => chip(c, category === c, () => set("category", category === c ? null : c)))}
            {chip("New", isNew, () => set("filter", isNew ? null : "new"))}
          </div>
          <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-fog">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-bone outline-none">{SORTS.map(([v, l]) => <option key={v} value={v} className="bg-char">{l}</option>)}</select>
          </label>
        </div>
        {open && <div className="mt-4 flex flex-wrap gap-2 md:hidden">{["men", "women"].map((g) => chip(g, gender === g, () => set("gender", gender === g ? null : g)))}{["outerwear", "tops", "bottoms", "essentials", "accessories"].map((c) => chip(c, category === c, () => set("category", category === c ? null : c)))}</div>}
        <div className="mt-3 hidden flex-wrap items-center gap-2 md:flex"><span className="mr-2 text-[10px] uppercase tracking-[0.2em] text-fog">Color</span>{allColors.map((c) => chip(c, color?.toLowerCase() === c.toLowerCase(), () => set("color", color?.toLowerCase() === c.toLowerCase() ? null : c)))}</div>
      </div>
      <p className="mt-6 text-xs text-fog" aria-live="polite">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>
      {list.length === 0 ? <p className="py-32 text-center text-fog">Nothing here yet. Try removing a filter.</p> : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-12 pb-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">{list.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}</div>
      )}
    </div>
  );
}

export default function ShopPage() { return <Suspense fallback={<div className="h-screen" />}><Listing /></Suspense>; }
