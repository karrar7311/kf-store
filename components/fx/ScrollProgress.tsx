"use client";
import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

/** Hairline silver progress bar along the top edge. */
export default function ScrollProgress() {
  const path = usePathname();
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  if (path.startsWith("/studio") || path.startsWith("/admin")) return null;
  return <motion.div aria-hidden style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-silver via-bone to-silver" />;
}
