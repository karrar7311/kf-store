"use client";
import Image from "next/image";
import type { Garment } from "@/lib/products";
import SvgShot, { type View } from "./ShotSvg";
import manifest from "@/public/img/manifest.json";

export type { View };
type Man = Record<string, Record<string, Record<string, string>>>;

const rgb = (h: string) => { const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

/** Pick the rendered photograph whose colorway is closest to the requested colour. */
function pick(garment: Garment, view: View, hex: string) {
  const entries = (manifest as Man)[garment]?.[view];
  if (!entries) return null;
  const a = rgb(hex.replace("#", ""));
  let best: string | null = null, bd = Infinity;
  for (const [h, f] of Object.entries(entries)) {
    const b = rgb(h); const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    if (d < bd) { bd = d; best = f; }
  }
  return best;
}

export default function Shot({ garment, color, view = "front", tone, label, className = "", priority = false, sizes = "(max-width: 768px) 50vw, 28vw" }: {
  garment: Garment; color: string; view?: View; tone?: string; label?: string; className?: string; priority?: boolean; sizes?: string;
}) {
  const file = pick(garment, view, color);
  if (!file) return <SvgShot garment={garment} color={color} view={view} tone={tone} label={label} className={className} />;
  return (
    <span className={`relative block h-full w-full ${className}`}>
      <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/img/${file}`} alt={label ?? `K&F ${garment}, ${view} view`} fill sizes={sizes} priority={priority} quality={78} draggable={false} className="select-none object-cover" />
    </span>
  );
}
