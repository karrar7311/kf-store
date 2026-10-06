"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Shot from "@/components/Shot";
import { money, products as seed, type Product } from "@/lib/products";

type Tab = "overview" | "products" | "inventory" | "orders" | "customers" | "discounts" | "collections" | "campaigns";
const TABS: Tab[] = ["overview", "products", "inventory", "orders", "customers", "discounts", "collections", "campaigns"];
const STATUSES = ["Processing", "Shipped", "Delivered", "Refunded"];

const customers = [["Amara Okafor", "amara@mail.com", "Toronto", 6, 842], ["Liam Chen", "liam.c@mail.com", "Vancouver", 3, 395], ["Sofia Rossi", "sofia@mail.com", "Milan", 9, 1420], ["Noah Walker", "noah@mail.com", "London", 2, 255], ["Yara Haddad", "yara@mail.com", "Dubai", 5, 760]] as const;
const seedOrders = Array.from({ length: 12 }, (_, i) => { const p = seed[i % seed.length]; const q = 1 + (i % 3); return { id: `KF-${104200 + i}`, customer: customers[i % customers.length][0], item: p.name, total: p.price * q, status: STATUSES[i % 3], date: `2027-03-${String(28 - i).padStart(2, "0")}` }; });
const blank = (): Product => ({ slug: "", name: "", price: 0, gender: "unisex", category: "tops", garment: "tee", material: "cotton", collection: "Essentials", colors: [{ name: "Black", hex: "#111114" }], sizes: ["S", "M", "L"], stock: { S: 10, M: 10, L: 10 }, description: "", details: { material: "", fit: "", care: "" }, rating: 0, reviews: 0, createdAt: new Date().toISOString().slice(0, 10) });

export default function Admin() {
  const [tab, setTab] = useState<Tab>("overview");
  const [items, setItems] = useState<Product[]>(seed);
  const [orders, setOrders] = useState(seedOrders);
  const [edit, setEdit] = useState<Product | null>(null), [isNew, setIsNew] = useState(false);
  const [discounts, setDiscounts] = useState([{ code: "KF10", pct: 10, on: true }, { code: "FORM2027", pct: 15, on: true }]);
  const [cols, setCols] = useState(["Essentials", "Signature", "Form 01", "Campaign 2027"]);
  const [camp, setCamp] = useState({ title: "THE NEW FORM", sub: "K&F / 2027", cta: "EXPLORE CAMPAIGN", live: true });
  const [files, setFiles] = useState<{ img: string[]; model: string }>({ img: [], model: "" });
  const [newCode, setNewCode] = useState(""), [newCol, setNewCol] = useState("");

  const revenue = orders.filter((o) => o.status !== "Refunded").reduce((a, o) => a + o.total, 0);
  const bars = useMemo(() => [32, 41, 38, 55, 62, 58, 74, 81, 69, 92, 88, 104], []);
  const lowStock = items.filter((p) => Object.values(p.stock).some((s) => s <= 5));

  const save = () => {
    if (!edit || !edit.name || edit.price <= 0) return alert("Name and a price above 0 are required.");
    const slug = edit.slug || edit.name.toLowerCase().replace(/k&f /, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const next = { ...edit, slug }; setItems((l) => (isNew ? [next, ...l] : l.map((p) => (p.slug === edit.slug ? next : p)))); setEdit(null);
  };
  const stat = (l: string, v: string, s: string) => <div className="border border-white/10 bg-char p-6"><p className="eyebrow">{l}</p><p className="display mt-3 text-4xl">{v}</p><p className="mt-1 text-xs text-fog">{s}</p></div>;
  const th = "pb-3 text-left text-[10px] font-normal uppercase tracking-[0.2em] text-fog";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-white/10 bg-char p-4 md:min-h-screen md:border-b-0 md:border-r md:p-6">
        <Link href="/"><Logo variant="silver" className="text-3xl" /></Link><p className="eyebrow mt-1">Admin</p>
        <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto md:mt-10 md:flex-col">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-3 py-2 text-left text-[11px] uppercase tracking-[0.2em] ${tab === t ? "bg-bone text-ink" : "text-fog hover:text-bone"}`}>{t}</button>)}</nav>
      </aside>
      <section className="overflow-x-auto p-5 md:p-10">
        <h1 className="display mb-8 text-4xl capitalize md:text-6xl">{tab}</h1>

        {tab === "overview" && <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stat("Revenue", money(revenue), "+18.2% vs last month")}{stat("Orders", String(orders.length), `${orders.filter((o) => o.status === "Processing").length} processing`)}{stat("Products", String(items.length), `${lowStock.length} low stock`)}{stat("Customers", String(customers.length * 241), "+34 this week")}</div>
          <div className="mt-6 border border-white/10 bg-char p-6"><p className="eyebrow mb-6">Sales · last 12 weeks</p>
            <svg viewBox="0 0 480 140" className="w-full" role="img" aria-label="Sales chart">{bars.map((b, i) => <g key={i}><rect x={i * 40 + 8} y={130 - b} width="24" height={b} fill={i === 11 ? "#efece6" : "#3a3a3f"} /><text x={i * 40 + 20} y="140" fontSize="7" textAnchor="middle" fill="#9a9a9f">W{i + 1}</text></g>)}</svg></div>
          <div className="mt-6 border border-white/10 bg-char p-6"><p className="eyebrow mb-4">Low stock</p>{lowStock.length ? lowStock.map((p) => <p key={p.slug} className="border-t border-white/10 py-2 text-sm">{p.name} <span className="text-fog">— {Object.entries(p.stock).filter(([, s]) => s <= 5).map(([k, s]) => `${k}: ${s}`).join(", ")}</span></p>) : <p className="text-sm text-fog">All good.</p>}</div></>}

        {tab === "products" && <>
          <button onClick={() => { setEdit(blank()); setIsNew(true); setFiles({ img: [], model: "" }); }} className="btn btn-solid mb-6 !py-3">+ Add product</button>
          <table className="w-full min-w-[640px] text-sm"><thead><tr><th className={th}></th><th className={th}>Product</th><th className={th}>Category</th><th className={th}>Price</th><th className={th}></th></tr></thead>
            <tbody>{items.map((p) => <tr key={p.slug} className="border-t border-white/10"><td className="w-16 py-3"><div className="h-14 w-11 overflow-hidden"><Shot garment={p.garment} color={p.colors[0].hex} /></div></td><td>{p.name}</td><td className="capitalize text-fog">{p.category}</td><td>{money(p.price)}</td><td className="space-x-4 text-right text-[11px] uppercase tracking-[0.15em]"><button onClick={() => { setEdit(structuredClone(p)); setIsNew(false); }} className="hover:text-fog">Edit</button><button onClick={() => confirm(`Delete ${p.name}?`) && setItems((l) => l.filter((x) => x.slug !== p.slug))} className="text-red-400 hover:text-red-300">Delete</button></td></tr>)}</tbody></table></>}

        {tab === "inventory" && <table className="w-full min-w-[640px] text-sm"><thead><tr><th className={th}>Product</th><th className={th}>Stock by size</th></tr></thead><tbody>{items.map((p) => <tr key={p.slug} className="border-t border-white/10"><td className="py-4">{p.name}</td><td><div className="flex flex-wrap gap-3">{p.sizes.map((s) => <label key={s} className="flex items-center gap-2 text-xs text-fog">{s}<input type="number" min={0} value={p.stock[s] ?? 0} onChange={(e) => setItems((l) => l.map((x) => (x.slug === p.slug ? { ...x, stock: { ...x.stock, [s]: Math.max(0, +e.target.value) } } : x)))} className={`field !w-16 !px-2 !py-2 ${(p.stock[s] ?? 0) <= 5 ? "!border-red-400/70" : ""}`} /></label>)}</div></td></tr>)}</tbody></table>}

        {tab === "orders" && <table className="w-full min-w-[680px] text-sm"><thead><tr>{["Order", "Date", "Customer", "Item", "Total", "Status"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>{orders.map((o) => <tr key={o.id} className="border-t border-white/10"><td className="py-3">{o.id}</td><td className="text-fog">{o.date}</td><td>{o.customer}</td><td className="text-fog">{o.item}</td><td>{money(o.total)}</td><td><select value={o.status} onChange={(e) => setOrders((l) => l.map((x) => (x.id === o.id ? { ...x, status: e.target.value } : x)))} className="bg-transparent text-xs outline-none">{STATUSES.map((s) => <option key={s} className="bg-char">{s}</option>)}</select></td></tr>)}</tbody></table>}

        {tab === "customers" && <table className="w-full min-w-[560px] text-sm"><thead><tr>{["Name", "Email", "City", "Orders", "Spent"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>{customers.map((c) => <tr key={c[1]} className="border-t border-white/10"><td className="py-3">{c[0]}</td><td className="text-fog">{c[1]}</td><td>{c[2]}</td><td>{c[3]}</td><td>{money(c[4])}</td></tr>)}</tbody></table>}

        {tab === "discounts" && <div className="max-w-xl"><form onSubmit={(e) => { e.preventDefault(); if (newCode) { setDiscounts((d) => [...d, { code: newCode.toUpperCase(), pct: 10, on: true }]); setNewCode(""); } }} className="mb-6 flex gap-2"><input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="NEW CODE" className="field" /><button className="btn btn-solid !py-3">Add</button></form>{discounts.map((d, i) => <div key={d.code} className="flex items-center justify-between gap-4 border-t border-white/10 py-4 text-sm"><span>{d.code}</span><label className="flex items-center gap-2 text-fog"><input type="number" value={d.pct} min={1} max={90} onChange={(e) => setDiscounts((l) => l.map((x, j) => (j === i ? { ...x, pct: +e.target.value } : x)))} className="field !w-20 !px-2 !py-2" />%</label><button onClick={() => setDiscounts((l) => l.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))} className={d.on ? "text-bone" : "text-fog"}>{d.on ? "Active" : "Paused"}</button></div>)}</div>}

        {tab === "collections" && <div className="max-w-xl"><form onSubmit={(e) => { e.preventDefault(); if (newCol) { setCols((c) => [...c, newCol]); setNewCol(""); } }} className="mb-6 flex gap-2"><input value={newCol} onChange={(e) => setNewCol(e.target.value)} placeholder="New collection" className="field" /><button className="btn btn-solid !py-3">Add</button></form>{cols.map((c) => <div key={c} className="flex justify-between border-t border-white/10 py-4 text-sm"><span>{c} <span className="text-fog">· {items.filter((p) => p.collection === c).length} products</span></span><button onClick={() => setCols((l) => l.filter((x) => x !== c))} className="text-red-400">Remove</button></div>)}</div>}

        {tab === "campaigns" && <div className="max-w-xl space-y-4">{(["sub", "title", "cta"] as const).map((k) => <label key={k} className="block"><span className="eyebrow">{k === "sub" ? "Eyebrow" : k === "cta" ? "Button label" : "Headline"}</span><input value={camp[k]} onChange={(e) => setCamp({ ...camp, [k]: e.target.value })} className="field mt-2" /></label>)}<label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={camp.live} onChange={(e) => setCamp({ ...camp, live: e.target.checked })} className="accent-white" /> Live on homepage</label><div className="relative mt-4 aspect-video overflow-hidden"><Shot garment="bomber" color="#4a1822" view="lifestyle" tone="#1d1214" /><div className="absolute inset-0 grid place-items-center bg-black/40 text-center"><div><p className="eyebrow !text-bone">{camp.sub}</p><p className="display mt-2 text-4xl">{camp.title}</p><p className="mt-3 text-[10px] tracking-[0.25em]">{camp.cta}</p></div></div></div></div>}
      </section>

      {edit && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setEdit(null)}>
          <div className="h-full w-full max-w-lg overflow-y-auto bg-char p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Product editor">
            <div className="mb-6 flex justify-between"><h2 className="eyebrow !text-bone">{isNew ? "New product" : "Edit product"}</h2><button onClick={() => setEdit(null)}>✕</button></div>
            <div className="space-y-4">
              <input className="field" placeholder="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3"><input className="field" type="number" placeholder="Price" value={edit.price || ""} onChange={(e) => setEdit({ ...edit, price: +e.target.value })} />
                <select className="field" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value as Product["category"] })}>{["outerwear", "tops", "bottoms", "essentials", "accessories"].map((c) => <option key={c} className="bg-char">{c}</option>)}</select>
                <select className="field" value={edit.garment} onChange={(e) => setEdit({ ...edit, garment: e.target.value as Product["garment"] })}>{["tee", "hoodie", "jacket", "pants", "cap", "bomber"].map((c) => <option key={c} className="bg-char">{c}</option>)}</select>
                <select className="field" value={edit.material} onChange={(e) => setEdit({ ...edit, material: e.target.value as Product["material"] })}>{["cotton", "denim", "leather", "nylon", "fleece", "wool"].map((c) => <option key={c} className="bg-char">{c}</option>)}</select></div>
              <textarea className="field min-h-24" placeholder="Description" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
              <label className="block text-xs text-fog">Product images<input type="file" accept="image/*" multiple onChange={(e) => setFiles({ ...files, img: Array.from(e.target.files ?? []).map((f) => f.name) })} className="field mt-2" /></label>
              <label className="block text-xs text-fog">3D model (.glb)<input type="file" accept=".glb,.gltf" onChange={(e) => setFiles({ ...files, model: e.target.files?.[0]?.name ?? "" })} className="field mt-2" /></label>
              {(files.img.length > 0 || files.model) && <p className="text-xs text-fog">Queued for upload: {[...files.img, files.model].filter(Boolean).join(", ")}</p>}
              <button onClick={save} className="btn btn-solid w-full">Save product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
