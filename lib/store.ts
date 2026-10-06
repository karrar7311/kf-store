"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine { slug: string; size: string; color: string; qty: number }

interface State {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  discount: string | null;
  bump: number;
  add: (l: CartLine) => void;
  remove: (slug: string, size: string, color: string) => void;
  setQty: (slug: string, size: string, color: string, qty: number) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setDiscount: (c: string | null) => void;
}

const same = (a: CartLine, slug: string, size: string, color: string) => a.slug === slug && a.size === size && a.color === color;

export const useStore = create<State>()(
  persist(
    (set) => ({
      cart: [], wishlist: [], cartOpen: false, searchOpen: false, menuOpen: false, discount: null, bump: 0,
      add: (l) => set((s) => {
        const ex = s.cart.find((c) => same(c, l.slug, l.size, l.color));
        const cart = ex ? s.cart.map((c) => (c === ex ? { ...c, qty: c.qty + l.qty } : c)) : [...s.cart, l];
        return { cart, bump: s.bump + 1 };
      }),
      remove: (slug, size, color) => set((s) => ({ cart: s.cart.filter((c) => !same(c, slug, size, color)) })),
      setQty: (slug, size, color, qty) => set((s) => ({
        cart: qty <= 0 ? s.cart.filter((c) => !same(c, slug, size, color)) : s.cart.map((c) => (same(c, slug, size, color) ? { ...c, qty } : c)),
      })),
      clear: () => set({ cart: [], discount: null }),
      toggleWish: (slug) => set((s) => ({ wishlist: s.wishlist.includes(slug) ? s.wishlist.filter((w) => w !== slug) : [...s.wishlist, slug] })),
      setCartOpen: (v) => set({ cartOpen: v }),
      setSearchOpen: (v) => set({ searchOpen: v }),
      setMenuOpen: (v) => set({ menuOpen: v }),
      setDiscount: (c) => set({ discount: c }),
    }),
    { name: "kf-store", partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist, discount: s.discount }) }
  )
);

export const DISCOUNTS: Record<string, number> = { KF10: 0.1, FORM2027: 0.15 };
