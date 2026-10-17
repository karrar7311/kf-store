"use client";
import { useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ&/+";

/** Text that scrambles through glyphs and settles on hover (nav links). Skips for reduced motion. */
export default function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);
  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearInterval(timer.current);
    let f = 0;
    timer.current = window.setInterval(() => {
      f++;
      const out = text.split("").map((c, i) => (c === " " || i < f / 2 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
      if (ref.current) ref.current.textContent = out;
      if (f / 2 >= text.length) {
        window.clearInterval(timer.current);
        if (ref.current) ref.current.textContent = text;
      }
    }, 28);
  };
  return <span ref={ref} onMouseEnter={run} className={className}>{text}</span>;
}
