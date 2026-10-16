"use client";
import { useRef, type ReactNode } from "react";

/** Pointer-driven 3D tilt with a moving glare. Children can lift off the card with `[transform:translateZ(..)]`. */
export default function Tilt({ children, className = "", max = 9 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const set = (rx: number, ry: number, gx: number, gy: number, on: number) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = ref.current; if (!el) return;
      el.style.setProperty("--rx", `${rx}deg`); el.style.setProperty("--ry", `${ry}deg`);
      el.style.setProperty("--gx", `${gx}%`); el.style.setProperty("--gy", `${gy}%`); el.style.setProperty("--glare", String(on));
    });
  };
  const move = (e: React.PointerEvent) => {
    if (!fine()) return;
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    set((0.5 - y) * max * 2, (x - 0.5) * max * 2, x * 100, y * 100, 1);
  };
  return (
    <div className={`[perspective:1100px] ${className}`}>
      <div ref={ref} onPointerMove={move} onPointerLeave={() => set(0, 0, 50, 50, 0)}
        className="kf-tilt relative h-full w-full [transform-style:preserve-3d]">
        {children}
        <span aria-hidden className="kf-glare pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}
