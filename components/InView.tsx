"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Mounts children only once the wrapper is near the viewport (lazy WebGL). */
export default function InView({ children, className = "", margin = "300px", unmount = false }: { children: ReactNode; className?: string; margin?: string; unmount?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn((v) => (e.isIntersecting ? true : unmount ? false : v)), { rootMargin: margin });
    io.observe(ref.current!); return () => io.disconnect();
  }, [margin, unmount]);
  return <div ref={ref} className={className}>{on ? children : null}</div>;
}
