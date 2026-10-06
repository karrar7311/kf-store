"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";
import Magnetic from "./Magnetic";
import Shot from "./Shot";
import { DISCOUNTS, useStore } from "@/lib/store";
import { findProduct, money, products } from "@/lib/products";

/* ---------- Loader ---------- */
export function Loader() {
  const path = usePathname();
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("kf-loaded")) { setDone(true); return; }
    const o = { v: 0 };
    const fallback = setTimeout(() => { sessionStorage.setItem("kf-loaded", "1"); setDone(true); }, 4000);
    gsap.to(o, { v: 100, duration: 1.7, ease: "power2.inOut", onUpdate: () => setPct(Math.round(o.v)), onComplete: () => { clearTimeout(fallback); sessionStorage.setItem("kf-loaded", "1"); setTimeout(() => setDone(true), 250); } });
  }, []);
  if (path.startsWith("/studio")) return null;
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="kf-loader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink" exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }} initial={{ clipPath: "inset(0 0 0% 0)" }}>
          <Logo variant="silver" className="text-7xl md:text-8xl" />
          <div className="mt-10 h-px w-40 overflow-hidden bg-white/10"><div className="h-full bg-bone" style={{ width: `${pct}%` }} /></div>
          <p className="mt-4 text-[11px] tracking-[0.3em] text-fog tabular-nums">01 — {String(pct).padStart(3, "0")}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Smooth scroll ---------- */
export function SmoothScroll() {
  const path = usePathname();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    (window as any).__lenis = lenis;
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  useEffect(() => { (window as any).__lenis?.scrollTo(0, { immediate: true }); window.scrollTo(0, 0); }, [path]);
  return null;
}

/* ---------- Custom cursor ---------- */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    const x = gsap.quickTo(dot.current, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(dot.current, "y", { duration: 0.35, ease: "power3" });
    const move = (e: MouseEvent) => {
      x(e.clientX); y(e.clientY);
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(t?.dataset.cursor ?? (( e.target as HTMLElement)?.closest?.("a,button") ? "·" : ""));
    };
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mousemove", move); document.body.classList.remove("has-cursor"); };
  }, []);
  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[200] hidden [@media(hover:hover)_and_(pointer:fine)]:block" aria-hidden>
      <div className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-bone/80 text-[9px] uppercase tracking-[0.2em] text-ink mix-blend-difference transition-all duration-300 ${label && label !== "·" ? "h-20 w-20 bg-bone" : label === "·" ? "h-9 w-9" : "h-3 w-3 bg-bone"}`}>
        {label && label !== "·" ? label : ""}
      </div>
    </div>
  );
}

/* ---------- Nav ---------- */
const LINKS = [["SHOP", "/shop"], ["MEN", "/shop?gender=men"], ["WOMEN", "/shop?gender=women"], ["COLLECTIONS", "/#collections"], ["TRY ON", "/try-on"], ["ABOUT", "/about"]] as const;

export function Nav() {
  const path = usePathname();
  const [solid, setSolid] = useState(false);
  const { cart, wishlist, bump, setCartOpen, setSearchOpen, menuOpen, setMenuOpen } = useStore();
  const [hydrated, setHydrated] = useState(false);
  const cartRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setHydrated(true), []);
  useEffect(() => { const f = () => setSolid(window.scrollY > 60 || path !== "/"); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, [path]);
  useEffect(() => { setMenuOpen(false); }, [path, setMenuOpen]);
  useEffect(() => { if (bump) gsap.fromTo(cartRef.current, { scale: 1.35 }, { scale: 1, duration: 0.7, ease: "elastic.out(1,.4)" }); }, [bump]);
  const count = hydrated ? cart.reduce((a, c) => a + c.qty, 0) : 0;
  if (path.startsWith("/admin") || path.startsWith("/studio")) return null;
  const Icon = ({ d }: { d: string }) => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d={d} /></svg>;
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${solid ? "border-b border-white/10 bg-ink/80 py-3 backdrop-blur-xl" : "bg-gradient-to-b from-black/50 to-transparent py-6"}`}>
        <div className="wrap grid grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/" aria-label="K&F home" className="justify-self-start"><Logo variant="silver" className="text-[30px]" /></Link>
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {LINKS.map(([l, h]) => (
              <Link key={l} href={h} className="group relative text-[11px] tracking-[0.26em]">{l}<span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-bone transition-transform duration-500 group-hover:scale-x-100" /></Link>
            ))}
          </nav>
          <div className="col-start-3 flex items-center justify-self-end gap-5">
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className="hidden hover:opacity-70 sm:block"><Icon d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-5-5" /></button>
            <Link href="/admin" aria-label="Account" className="hidden hover:opacity-70 md:block"><Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 4-6 8-6s8 2 8 6" /></Link>
            <Link href="/shop?wishlist=1" aria-label="Wishlist" className="relative hidden hover:opacity-70 sm:block"><Icon d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.700-8 11-8 11Z" />{hydrated && wishlist.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[9px]">{wishlist.length}</span>}</Link>
            <button ref={cartRef} data-cart-icon aria-label={`Cart, ${count} items`} onClick={() => setCartOpen(true)} className="relative hover:opacity-70"><Icon d="M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2" />{count > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-bone text-[9px] text-ink">{count}</span>}</button>
            <button aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)} className="relative z-[60] flex h-8 w-8 flex-col items-end justify-center gap-[6px] lg:hidden">
              <span className={`h-px bg-bone transition-all ${menuOpen ? "w-6 translate-y-[3.5px] rotate-45" : "w-6"}`} /><span className={`h-px bg-bone transition-all ${menuOpen ? "w-6 -translate-y-[3.5px] -rotate-45" : "w-4"}`} />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[45] flex flex-col justify-between bg-ink px-6 pb-10 pt-28 lg:hidden" initial={{ clipPath: "circle(0% at 90% 5%)" }} animate={{ clipPath: "circle(150% at 90% 5%)" }} exit={{ clipPath: "circle(0% at 90% 5%)" }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}>
            <nav className="flex flex-col gap-2">
              {[...LINKS, ["WISHLIST", "/shop?wishlist=1"] as const].map(([l, h], i) => (
                <motion.div key={l} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.7 }}>
                  <Link href={h} onClick={() => setMenuOpen(false)} className="display block text-5xl">{l.charAt(0) + l.slice(1).toLowerCase()}</Link>
                </motion.div>
              ))}
            </nav>
            <div className="flex items-center justify-between">
              <button className="eyebrow" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}>Search</button>
              <Logo variant="ghost" className="text-4xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Cart drawer ---------- */
export function subtotalOf(cart: { slug: string; qty: number }[]) {
  return cart.reduce((a, c) => a + (findProduct(c.slug)?.price ?? 0) * c.qty, 0);
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, remove, setQty, discount } = useStore();
  const sub = subtotalOf(cart);
  const off = discount ? sub * (DISCOUNTS[discount] ?? 0) : 0;
  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button aria-label="Close cart" className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} />
          <motion.aside role="dialog" aria-label="Shopping cart" className="fixed right-0 top-0 z-[71] flex h-dvh w-full max-w-[460px] flex-col border-l border-white/10 bg-char" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}>
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-6"><h2 className="eyebrow !text-bone">Your bag ({cart.reduce((a, c) => a + c.qty, 0)})</h2><button onClick={() => setCartOpen(false)} className="eyebrow hover:text-bone">Close</button></div>
            <div className="flex-1 overflow-y-auto px-6">
              {cart.length === 0 && <div className="flex h-full flex-col items-center justify-center gap-6 text-center"><Logo variant="ghost" className="text-6xl" /><p className="text-sm text-fog">Your bag is empty.</p><Link href="/shop" onClick={() => setCartOpen(false)} className="btn btn-ghost">Explore the collection</Link></div>}
              {cart.map((l) => {
                const p = findProduct(l.slug)!; const c = p.colors.find((x) => x.name === l.color) ?? p.colors[0];
                return (
                  <motion.div layout key={l.slug + l.size + l.color} className="flex gap-4 border-b border-white/10 py-6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <div className="h-32 w-24 shrink-0 overflow-hidden"><Shot garment={p.garment} color={c.hex} /></div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div><Link href={`/product/${p.slug}`} onClick={() => setCartOpen(false)} className="text-sm">{p.name}</Link><p className="mt-1 text-xs text-fog">{l.color} / {l.size}</p></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-white/15 text-sm"><button aria-label="Decrease" className="h-8 w-8" onClick={() => setQty(l.slug, l.size, l.color, l.qty - 1)}>−</button><span className="w-6 text-center text-xs">{l.qty}</span><button aria-label="Increase" className="h-8 w-8" onClick={() => setQty(l.slug, l.size, l.color, l.qty + 1)}>+</button></div>
                        <span className="text-sm">{money(p.price * l.qty)}</span>
                      </div>
                      <button onClick={() => remove(l.slug, l.size, l.color)} className="self-start text-[10px] uppercase tracking-[0.2em] text-fog underline underline-offset-4 hover:text-bone">Remove</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-white/10 p-6">
                {off > 0 && <div className="mb-2 flex justify-between text-sm text-fog"><span>Discount ({discount})</span><span>−{money(off)}</span></div>}
                <div className="mb-1 flex justify-between"><span className="eyebrow !text-bone">Subtotal</span><span>{money(sub - off)}</span></div>
                <p className="mb-5 text-xs text-fog">Shipping and taxes calculated at checkout.</p>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn btn-solid w-full">Checkout</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Search ---------- */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) setTimeout(() => input.current?.focus(), 300); else setQ(""); }, [searchOpen]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [setSearchOpen]);
  const term = q.trim().toLowerCase();
  const results = term ? products.filter((p) => [p.name, p.category, p.collection, p.gender, p.garment, p.material, ...p.colors.map((c) => c.name)].join(" ").toLowerCase().includes(term)) : [];
  const suggestions = ["Hoodie", "Accessories", "Sunglasses", "Beanie", "Scarf", "Leather", "Black", "Campaign 2027"];
  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div role="dialog" aria-label="Search" className="fixed inset-0 z-[90] overflow-y-auto bg-ink/95 backdrop-blur-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="wrap pt-8">
            <div className="flex items-center justify-between"><Logo variant="silver" className="text-3xl" /><button onClick={() => setSearchOpen(false)} className="eyebrow hover:text-bone">Close ✕</button></div>
            <motion.input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, colors, collections" aria-label="Search" className="display mt-16 w-full border-b border-white/20 bg-transparent pb-6 text-4xl outline-none placeholder:text-white/20 md:text-7xl" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} />
            {!term && <div className="mt-8 flex flex-wrap gap-3">{suggestions.map((s) => <button key={s} onClick={() => setQ(s)} className="border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-fog hover:border-bone hover:text-bone">{s}</button>)}</div>}
            {term && results.length === 0 && <p className="mt-10 text-fog">Nothing matches “{q}”.</p>}
            <div className="mt-10 grid grid-cols-2 gap-4 pb-20 md:grid-cols-4">
              {results.map((p, i) => (
                <motion.div key={p.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/product/${p.slug}`} onClick={() => setSearchOpen(false)} className="group block">
                    <div className="aspect-[4/5] overflow-hidden"><div className="h-full transition-transform duration-700 group-hover:scale-105"><Shot garment={p.garment} color={p.colors[0].hex} /></div></div>
                    <p className="mt-3 text-sm">{p.name}</p><p className="text-xs text-fog">{money(p.price)} · {p.colors.length} colors</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  const path = usePathname();
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  if (path.startsWith("/admin") || path.startsWith("/checkout") || path.startsWith("/studio") || path.startsWith("/try-on")) return null;
  const col = (t: string, items: [string, string][]) => (
    <div><h3 className="eyebrow mb-5 !text-bone">{t}</h3><ul className="space-y-3 text-sm text-fog">{items.map(([l, h]) => <li key={l}><Link href={h} className="transition-colors hover:text-bone">{l}</Link></li>)}</ul></div>
  );
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/10 bg-char">
      <div className="overflow-hidden border-b border-white/10 py-6"><div className="marquee flex w-max gap-16 whitespace-nowrap">{Array.from({ length: 12 }).map((_, i) => <span key={i} className="display text-4xl text-white/20">FORM / FUNCTION / IDENTITY <em className="px-6 not-italic">·</em></span>)}</div></div>
      <div className="wrap grid gap-16 py-20 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <h2 className="eyebrow !text-bone">Join the K&amp;F world</h2>
          <p className="mt-4 max-w-sm text-sm text-fog">First access to drops, campaign films and private sales.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSent(true); }} className="mt-8 flex border-b border-white/30">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER YOUR EMAIL" aria-label="Email" className="flex-1 bg-transparent py-4 text-[11px] tracking-[0.24em] outline-none placeholder:text-fog/70" />
            <button className="text-[11px] tracking-[0.24em] hover:opacity-60">{sent ? "WELCOME ✓" : "SUBSCRIBE"}</button>
          </form>
          <Logo variant="silver" className="mt-16 text-6xl" />
        </div>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {col("Shop", [["New Arrivals", "/shop?filter=new"], ["Men", "/shop?gender=men"], ["Women", "/shop?gender=women"], ["Collections", "/#collections"], ["Accessories", "/shop?category=accessories"]])}
          {col("Help", [["Contact", "/about"], ["Shipping", "/about"], ["Returns", "/about"], ["Size Guide", "/about"], ["FAQ", "/about"]])}
          {col("Company", [["About K&F", "/about"], ["Careers", "/about"], ["Journal", "/lookbook"]])}
          {col("Social", [["Instagram", "#"], ["TikTok", "#"], ["YouTube", "#"], ["Pinterest", "#"]])}
        </div>
      </div>
      <div className="wrap flex flex-col justify-between gap-3 border-t border-white/10 py-6 text-[11px] tracking-[0.18em] text-fog md:flex-row"><span>© 2027 K&amp;F. ALL RIGHTS RESERVED.</span><span>PRIVACY · TERMS · COOKIES</span></div>
    </footer>
  );
}


/* ---------- Mobile tab bar (app-style navigation) ---------- */
export function MobileTabBar() {
  const path = usePathname();
  const { cart, wishlist, setCartOpen, setSearchOpen } = useStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (["/admin", "/studio", "/checkout", "/product", "/try-on"].some((p) => path.startsWith(p))) return null;
  const count = hydrated ? cart.reduce((a, c) => a + c.qty, 0) : 0;
  const wish = hydrated ? wishlist.length : 0;
  const Item = ({ label, d, active, badge, ...rest }: { label: string; d: string; active?: boolean; badge?: number } & ({ href: string } | { onClick: () => void })) => {
    const inner = (
      <span className={`relative flex flex-col items-center gap-1 py-2 text-[9px] uppercase tracking-[0.18em] transition-colors ${active ? "text-bone" : "text-fog"}`}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d={d} /></svg>{label}
        {!!badge && <span className="absolute right-[22%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bone px-1 text-[9px] text-ink">{badge}</span>}
      </span>
    );
    return "href" in rest ? <Link href={rest.href} className="flex-1">{inner}</Link> : <button onClick={rest.onClick} className="flex-1">{inner}</button>;
  };
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-ink/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <Item label="Home" href="/" active={path === "/"} d="M4 11l8-7 8 7v9H4v-9Z" />
      <Item label="Shop" href="/shop" active={path.startsWith("/shop") && !path.includes("wishlist")} d="M4 6h16M4 12h16M4 18h10" />
      <Item label="Search" onClick={() => setSearchOpen(true)} d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-5-5" />
      <Item label="Saved" href="/shop?wishlist=1" badge={wish} d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" />
      <Item label="Bag" onClick={() => setCartOpen(true)} badge={count} d="M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2" />
    </nav>
  );
}
