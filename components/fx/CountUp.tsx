"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Counts from 0 to `to` once, when scrolled into view (GSAP + ScrollTrigger). */
export default function CountUp({ to, duration = 1.8, className = "" }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(to);
      return;
    }
    const o = { v: 0 };
    el.textContent = "0";
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => {
        gsap.to(o, { v: to, duration, ease: "power2.out", onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
      },
    });
    return () => st.kill();
  }, [to, duration]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{to}</span>;
}
