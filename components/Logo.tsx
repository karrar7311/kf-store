export default function Logo({ variant = "white", className = "" }: { variant?: "white" | "black" | "silver" | "ghost"; className?: string }) {
  const cls = { white: "text-bone", black: "text-ink", silver: "metal", ghost: "text-bone/30" }[variant];
  return (
    <span aria-label="K&F" className={`inline-flex select-none items-baseline font-serif leading-none tracking-[0.04em] ${cls} ${className}`}>
      <span>K</span><span className="mx-[0.06em] -translate-y-[0.06em] text-[0.62em] italic opacity-90">&amp;</span><span>F</span>
    </span>
  );
}
