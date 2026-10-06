"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";

export default function Magnetic({ children, strength = 0.3, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.5, ease: "power3.out" });
  };
  const leave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,.4)" });
  return <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`inline-block ${className}`}>{children}</div>;
}
