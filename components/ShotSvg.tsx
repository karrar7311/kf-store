"use client";
import { useId } from "react";
import type { Garment } from "@/lib/products";

export type View = "front" | "back" | "side" | "detail" | "model" | "fabric" | "lifestyle" | "wide";

/** Garment silhouettes in a 200x260 box. Procedural studio "photography" stand-ins. */
export const BODY: Record<Garment, string> = {
  tee: "M72 34 Q100 50 128 34 L180 58 L164 100 L144 90 L144 226 L56 226 L56 90 L36 100 L20 58 Z",
  hoodie: "M72 40 Q100 54 128 40 L184 74 L172 200 L148 198 L144 116 L144 230 L56 230 L56 116 L52 198 L28 200 L16 74 Z",
  jacket: "M70 36 Q100 52 130 36 L186 70 L176 214 L150 212 L146 116 L146 236 L54 236 L54 116 L50 212 L24 214 L14 70 Z",
  bomber: "M70 40 Q100 54 130 40 L186 72 L176 190 L150 190 L146 120 L146 208 L54 208 L54 120 L50 190 L24 190 L14 72 Z",
  pants: "M60 22 L140 22 L150 244 L108 244 L100 96 L92 244 L50 244 Z",
  cap: "M44 150 Q44 70 100 66 Q156 70 156 150 L156 160 Q100 150 44 160 Z M40 160 Q100 150 190 178 Q180 196 100 184 Q60 178 40 160 Z",
};
export const EXTRA: Partial<Record<Garment, string[]>> = {
  hoodie: ["M70 40 Q100 -4 130 40 Q100 64 70 40Z", "M72 170 L128 170 L134 206 L66 206 Z"],
  jacket: ["M74 38 L100 70 L126 38 L128 52 L100 84 L72 52Z", "M100 70 L100 236"],
  bomber: ["M54 190 L146 190 L146 208 L54 208Z", "M74 40 Q100 66 126 40 L126 52 Q100 76 74 52Z", "M100 66 L100 206"],
  tee: ["M72 34 Q100 52 128 34 L126 42 Q100 62 74 42Z"],
  pants: ["M100 22 L100 96", "M62 70 L82 70 L82 110 L62 110Z", "M118 70 L138 70 L138 110 L118 110Z"],
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

export default function ShotSvg({ garment, color, view: viewIn = "front", tone = "#232326", label, className = "" }: {
  garment: Garment; color: string; view?: View; tone?: string; label?: string; className?: string;
}) {
  const view = viewIn === "wide" ? "lifestyle" : viewIn;
  const id = useId().replace(/:/g, "");
  const light = parseInt(color.slice(1), 16) > 0xa0a0a0;
  const stitch = light ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.22)";
  const isCap = garment === "cap";
  const hang = view === "back" ? 0.94 : 1;

  // viewBox per view -> cinematic crops
  const vb: Record<View, string> = {
    wide: "-120 -40 440 330",
    front: "-20 -10 240 290", back: "-20 -10 240 290", side: "-20 -10 240 290",
    model: "-30 -20 260 310", lifestyle: "-120 -40 440 330", fabric: "40 90 60 78", detail: isCap ? "60 90 70 80" : "56 28 90 78",
  };

  const garmentSvg = (
    <g transform={view === "side" ? "translate(100 0) scale(.56 1) translate(-100 0)" : view === "model" ? "translate(0 6)" : undefined}>
      <path d={BODY[garment]} fill={`url(#g${id})`} stroke="rgba(0,0,0,.45)" strokeWidth=".8" />
      {(EXTRA[garment] ?? []).map((d, i) => (
        <path key={i} d={d} fill={i === 0 && garment !== "pants" ? shade(color, -0.05) : "none"} stroke={stitch} strokeWidth=".9" strokeDasharray={i > 0 ? "2.2 1.6" : undefined} />
      ))}
      {!isCap && <path d={BODY[garment]} fill={`url(#f${id})`} opacity=".55" />}
      {!isCap && garment !== "pants" && <path d="M56 226 L144 226 M20 58 L36 100" stroke={stitch} strokeWidth=".7" strokeDasharray="2 1.5" fill="none" />}
      {view === "back" ? null : garment !== "cap" && <text x="100" y={garment === "pants" ? 58 : 82} textAnchor="middle" fontSize="7" letterSpacing="2" fill={light ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.55)"} fontFamily="Georgia, serif">K&amp;F</text>}
      {isCap && <text x="100" y="124" textAnchor="middle" fontSize="12" letterSpacing="2" fill={light ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.6)"} fontFamily="Georgia, serif">K&amp;F</text>}
    </g>
  );

  return (
    <svg viewBox={vb[view]} preserveAspectRatio="xMidYMid slice" className={`block h-full w-full ${className}`} role="img" aria-label={label ?? `${garment} ${view}`}>
      <defs>
        <radialGradient id={`bg${id}`} cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor={shade(tone, 0.16)} /><stop offset=".55" stopColor={tone} /><stop offset="1" stopColor={shade(tone, -0.16)} />
        </radialGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(color, 0.1)} /><stop offset=".5" stopColor={color} /><stop offset="1" stopColor={shade(color, -0.12)} />
        </linearGradient>
        <linearGradient id={`f${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset=".3" stopColor="#000" stopOpacity="0" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".05" /><stop offset="1" stopColor="#000" stopOpacity=".5" />
        </linearGradient>
        <radialGradient id={`s${id}`}><stop offset="0" stopColor="#000" stopOpacity=".6" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d8d9dd" stopOpacity=".25" /><stop offset="1" stopColor="#d8d9dd" stopOpacity="0" /></linearGradient>
        <filter id={`n${id}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 0" /></filter>
        <pattern id={`w${id}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <rect width="3" height="3" fill={color} /><rect width="1.5" height="3" fill={shade(color, light ? -0.1 : 0.07)} />
        </pattern>
        <clipPath id={`c${id}`}><path d={BODY[garment]} /></clipPath>
      </defs>
      <rect x="-400" y="-400" width="1200" height="1200" fill={`url(#bg${id})`} />

      {view === "fabric" ? (
        <g><rect x="0" y="0" width="300" height="300" fill={`url(#w${id})`} />
          <path d="M40 120 Q70 110 100 122" stroke={stitch} strokeWidth=".5" strokeDasharray="2 1.4" fill="none" />
          <rect x="0" y="0" width="300" height="300" fill={`url(#f${id})`} opacity=".5" /></g>
      ) : (
        <>
          {view === "lifestyle" && (
            <g>
              <rect x="-120" y="190" width="440" height="100" fill={`url(#b${id})`} />
              <text x="-100" y="140" fontFamily="Georgia, serif" fontSize="120" fill="rgba(255,255,255,.05)" letterSpacing="-6">K&amp;F</text>
              <path d="M-120 200 L320 200" stroke="rgba(255,255,255,.08)" />
              <g transform="translate(150 20) scale(.8)">
                <ellipse cx="100" cy="250" rx="80" ry="8" fill={`url(#s${id})`} />{garmentSvg}
              </g>
            </g>
          )}
          {view === "model" && (
            <g opacity=".92">
              <ellipse cx="100" cy="266" rx="80" ry="8" fill={`url(#s${id})`} />
              <circle cx="100" cy="2" r="19" fill="#3b3a3c" /><path d="M90 18 L90 34 L110 34 L110 18Z" fill="#33322f" />
              {garment !== "pants" && <path d="M56 100 L48 214 L58 216 L70 120Z M144 100 L152 214 L142 216 L130 120Z" fill="#37363a" />}
              {garment !== "pants" && <rect x="62" y="226" width="34" height="42" fill="#232225" />}
              {garment !== "pants" && <rect x="104" y="226" width="34" height="42" fill="#232225" />}
              {garment === "pants" && <path d="M56 -4 L144 -4 L150 24 L50 24Z" fill="#37363a" />}
            </g>
          )}
          {(view === "front" || view === "back" || view === "side" || view === "detail") && (
            <g transform={hang === 1 ? undefined : "translate(6 4)"}>
              <ellipse cx="100" cy={isCap ? 196 : 250} rx={view === "side" ? 36 : 82} ry="8" fill={`url(#s${id})`} />
              {garmentSvg}
              {view === "detail" && <g clipPath={`url(#c${id})`}><rect x="0" y="0" width="300" height="300" fill={`url(#w${id})`} opacity=".35" /></g>}
            </g>
          )}
          {view === "model" && <g transform="translate(0 0)">{garmentSvg}</g>}
        </>
      )}
      <rect x="-400" y="-400" width="1200" height="1200" filter={`url(#n${id})`} opacity=".16" />
    </svg>
  );
}
