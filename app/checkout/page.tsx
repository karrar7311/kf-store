"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Shot from "@/components/Shot";
import { subtotalOf } from "@/components/Chrome";
import { DISCOUNTS, useStore } from "@/lib/store";
import { findProduct, money } from "@/lib/products";

const SHIP = { standard: { label: "Standard · 4–7 days", price: 0 }, express: { label: "Express · 2–3 days", price: 15 }, next: { label: "Next day", price: 30 } } as const;

export default function Checkout() {
  const { cart, discount, setDiscount, clear } = useStore();
  const [ready, setReady] = useState(false), [ship, setShip] = useState<keyof typeof SHIP>("standard");
  const [code, setCode] = useState(""), [msg, setMsg] = useState(""), [done, setDone] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => setReady(true), []);
  const sub = subtotalOf(cart), off = discount ? sub * (DISCOUNTS[discount] ?? 0) : 0;
  const shipping = sub - off > 150 && ship === "standard" ? 0 : SHIP[ship].price;
  const tax = (sub - off) * 0.08, total = sub - off + shipping + tax;
  if (!ready) return <div className="h-screen" />;

  const apply = () => { const c = code.trim().toUpperCase(); if (DISCOUNTS[c]) { setDiscount(c); setMsg(`${c} applied — ${DISCOUNTS[c] * 100}% off`); } else setMsg("That code isn't valid."); };
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const er: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email ?? "")) er.email = "Enter a valid email";
    ["first", "last", "address", "city", "zip"].forEach((k) => !f[k]?.trim() && (er[k] = "Required"));
    if ((f.card ?? "").replace(/\s/g, "").length < 13) er.card = "Enter a valid card number";
    if (!/^\d\d\s?\/\s?\d\d$/.test(f.exp ?? "")) er.exp = "MM / YY";
    if ((f.cvc ?? "").length < 3) er.cvc = "CVC";
    setErrors(er);
    if (Object.keys(er).length || !cart.length) return;
    // Demo only: no card data leaves the browser. Swap for Stripe PaymentIntent in /api/checkout.
    const n = "KF-" + Math.floor(100000 + Math.random() * 900000); clear(); setDone(n);
  };
  const F = ({ n, label, ...r }: { n: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block"><span className="sr-only">{label}</span><input name={n} placeholder={label} aria-invalid={!!errors[n]} className={`field ${errors[n] ? "!border-red-400" : ""}`} {...r} />{errors[n] && <span className="mt-1 block text-xs text-red-400">{errors[n]}</span>}</label>
  );

  if (done) return (
    <div className="grid min-h-screen place-items-center px-6 text-center"><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
      <Logo variant="silver" className="text-7xl" /><h1 className="display mt-10 text-5xl md:text-7xl">Thank you.</h1><p className="mt-4 text-fog">Order <span className="text-bone">{done}</span> is confirmed. A receipt is on its way.</p><Link href="/shop" className="btn btn-solid mt-10">Continue shopping</Link></motion.div></div>
  );

  return (
    <div className="min-h-screen">
      <header className="wrap flex items-center justify-between py-6"><Link href="/"><Logo variant="silver" className="text-3xl" /></Link><span className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-fog">🔒 SECURE CHECKOUT</span></header>
      <div className="wrap grid gap-12 pb-24 pt-6 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <form onSubmit={submit} noValidate className="space-y-12">
          <section><h2 className="eyebrow mb-5 !text-bone">01 — Contact</h2><F n="email" label="Email" type="email" autoComplete="email" /></section>
          <section><h2 className="eyebrow mb-5 !text-bone">02 — Shipping address</h2>
            <div className="grid gap-3 sm:grid-cols-2"><F n="first" label="First name" autoComplete="given-name" /><F n="last" label="Last name" autoComplete="family-name" /></div>
            <div className="mt-3 space-y-3"><F n="address" label="Address" autoComplete="street-address" /><div className="grid gap-3 sm:grid-cols-3"><F n="city" label="City" /><F n="zip" label="Postal code" /><F n="country" label="Country" defaultValue="Canada" /></div></div></section>
          <section><h2 className="eyebrow mb-5 !text-bone">03 — Delivery</h2>
            <div className="space-y-2" role="radiogroup">{(Object.keys(SHIP) as (keyof typeof SHIP)[]).map((k) => <label key={k} className={`flex cursor-pointer items-center justify-between border px-4 py-4 text-sm transition ${ship === k ? "border-bone" : "border-white/15"}`}><span className="flex items-center gap-3"><input type="radio" name="ship" checked={ship === k} onChange={() => setShip(k)} className="accent-white" />{SHIP[k].label}</span><span>{SHIP[k].price ? money(SHIP[k].price) : "Free"}</span></label>)}</div></section>
          <section><h2 className="eyebrow mb-5 !text-bone">04 — Payment</h2>
            <div className="space-y-3"><F n="card" label="Card number" inputMode="numeric" autoComplete="cc-number" maxLength={19} /><div className="grid grid-cols-2 gap-3"><F n="exp" label="MM / YY" autoComplete="cc-exp" maxLength={7} /><F n="cvc" label="CVC" inputMode="numeric" maxLength={4} autoComplete="cc-csc" /></div></div>
            <p className="mt-3 text-xs text-fog">Demo checkout — card details are validated locally and never stored or sent.</p></section>
          <button disabled={!cart.length} className="btn btn-solid w-full disabled:opacity-40">Pay {money(total)}</button>
        </form>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="border border-white/10 bg-char p-6 md:p-8">
            <h2 className="eyebrow mb-6 !text-bone">Order summary</h2>
            {!cart.length && <p className="text-sm text-fog">Your bag is empty. <Link className="underline" href="/shop">Shop</Link></p>}
            <ul className="space-y-5">{cart.map((l) => { const p = findProduct(l.slug)!; const c = p.colors.find((x) => x.name === l.color) ?? p.colors[0]; return (
              <li key={l.slug + l.size + l.color} className="flex gap-4"><div className="relative h-20 w-16 shrink-0 overflow-hidden"><Shot garment={p.garment} color={c.hex} /><span className="absolute -right-0 -top-0 bg-bone px-1.5 text-[10px] text-ink">{l.qty}</span></div><div className="flex-1 text-sm"><p>{p.name}</p><p className="text-xs text-fog">{l.color} / {l.size}</p></div><span className="text-sm">{money(p.price * l.qty)}</span></li>); })}</ul>
            <div className="mt-6 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" aria-label="Discount code" className="field !py-3" /><button type="button" onClick={apply} className="btn btn-ghost !px-5 !py-3">Apply</button></div>
            {msg && <p className="mt-2 text-xs text-fog">{msg} {msg.includes("applied") ? "" : "Try KF10."}</p>}
            <dl className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between"><dt className="text-fog">Subtotal</dt><dd>{money(sub)}</dd></div>
              {off > 0 && <div className="flex justify-between"><dt className="text-fog">Discount</dt><dd>−{money(off)}</dd></div>}
              <div className="flex justify-between"><dt className="text-fog">Shipping</dt><dd>{shipping ? money(shipping) : "Free"}</dd></div>
              <div className="flex justify-between"><dt className="text-fog">Estimated tax</dt><dd>{money(Number(tax.toFixed(2)))}</dd></div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-lg"><dt>Total</dt><dd>{money(Number(total.toFixed(2)))}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
