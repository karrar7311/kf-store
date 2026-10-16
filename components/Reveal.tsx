"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className = "", y = 40 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8%" }} transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/**
 * Line-masked headline reveal: pass lines as array.
 * The in-view trigger sits on the mask, not the hidden line: a line pushed fully below its
 * own overflow mask never intersects the viewport, so it would never reveal.
 */
export function Lines({ lines, className = "", delay = 0 }: { lines: string[]; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <motion.span key={i} className="mask-line" initial="hidden" whileInView="shown" viewport={{ once: true, margin: "-10%" }}>
          <motion.span className="block" variants={{ hidden: { y: "105%" }, shown: { y: 0 } }} transition={{ duration: 1.1, delay: delay + i * 0.09, ease: [0.16, 1, 0.3, 1] }}>{l}</motion.span>
        </motion.span>
      ))}
    </span>
  );
}

/** Image wrapper with clip-path reveal + slight scale settle. */
export function ImageReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={`overflow-hidden ${className}`} initial={{ clipPath: "inset(100% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true, margin: "-6%" }} transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}>
      <motion.div className="h-full w-full" initial={{ scale: 1.25 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>
    </motion.div>
  );
}
