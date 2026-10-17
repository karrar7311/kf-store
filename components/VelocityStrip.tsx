"use client";
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, motion } from "framer-motion";

const WORDS = ["Form", "Function", "Identity"];

/** One row of giant words. Drifts on its own; scroll speed pushes it faster and leans it. */
function Row({ dir, outline, speed }: { dir: 1 | -1; outline?: boolean; speed: number }) {
  const track = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const v = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const skew = useTransform(v, [-3000, 0, 3000], [-10 * dir, 0, 10 * dir], { clamp: true });
  useAnimationFrame((_, dt) => {
    const t = track.current; if (!t || reduced) return;
    const boost = 1 + Math.min(6, Math.abs(v.get()) / 400);
    const half = t.scrollWidth / 2;
    x.current = (x.current - dir * speed * boost * (dt / 1000)) % half;
    if (x.current > 0) x.current -= half;
    t.style.transform = `translate3d(${x.current}px,0,0)`;
  });
  const line = (
    <span className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className={`display px-[3vw] text-[17vw] leading-[1.05] md:text-[13vw] ${outline ? "kf-outline" : ""}`}>{w}</span>
          <span aria-hidden className="mx-[1vw] inline-block h-[2.2vw] w-[2.2vw] rotate-45 border border-bone/50" />
        </span>
      ))}
    </span>
  );
  return (
    <motion.div style={reduced ? undefined : { skewX: skew }} className="overflow-hidden whitespace-nowrap">
      <div ref={track} className="flex w-max will-change-transform">{line}{line}</div>
    </motion.div>
  );
}

export default function VelocityStrip() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section aria-label="Form, Function, Identity" className="relative overflow-hidden border-y border-white/10 py-10 md:py-16">
      <h2 className="sr-only">Form. Function. Identity.</h2>
      <div aria-hidden className={`transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <Row dir={1} speed={60} />
        <Row dir={-1} speed={45} outline />
      </div>
    </section>
  );
}
