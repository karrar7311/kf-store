"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products } from "./products";

/** The hero hoodie's real colourways. The visitor's pick carries through the whole homepage. */
export const HOODIE = products.find((p) => p.slug === "essential-heavyweight-hoodie")!;
export const COLORWAYS = HOODIE.colors;
/** Light tint per colourway, used for glows only (never for text). */
export const GLOW: Record<string, string> = { Onyx: "#efece6", Bone: "#f3e6cf", Ash: "#c3cad6", Oxblood: "#c2465a" };

export const useColorway = create<{ ci: number; setCi: (i: number) => void }>()(
  persist((set) => ({ ci: 0, setCi: (ci) => set({ ci }) }), { name: "kf-colorway" }),
);

/** Current colourway index; reports the default until mounted so server and client markup match. */
export function useCi() {
  const ci = useColorway((s) => s.ci);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? Math.min(ci, COLORWAYS.length - 1) : 0;
}
