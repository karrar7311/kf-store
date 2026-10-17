"use client";
import { motion } from "framer-motion";

/** Route transition: each page fades in. Opacity only, so sticky/pinned sections keep working. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
