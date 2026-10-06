"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Line, RoundedBox } from "@react-three/drei";
import type { Garment, Material } from "@/lib/products";

const V = THREE.Vector3;

/* ------------------------------------------------------------------ */
/* Fabric specs + procedural bump textures                             */
/* ------------------------------------------------------------------ */
type Pattern = "twill" | "plain" | "grain" | "rib" | "pile" | "knit";
interface MatSpec { rough: number; metal: number; sheen: number; bump: number; clearcoat: number; scale: number; pattern: Pattern; fold: number }
export const MATERIALS: Record<Material, MatSpec> = {
  cotton: { rough: 0.88, metal: 0, sheen: 0.22, bump: 0.7, clearcoat: 0, scale: 18, pattern: "plain", fold: 0.016 },
  denim: { rough: 0.8, metal: 0, sheen: 0.1, bump: 1.4, clearcoat: 0, scale: 20, pattern: "twill", fold: 0.02 },
  leather: { rough: 0.42, metal: 0.05, sheen: 0.1, bump: 0.55, clearcoat: 0.35, scale: 36, pattern: "grain", fold: 0.011 },
  nylon: { rough: 0.5, metal: 0.05, sheen: 0.45, bump: 0.5, clearcoat: 0.1, scale: 26, pattern: "rib", fold: 0.013 },
  fleece: { rough: 1, metal: 0, sheen: 0.5, bump: 1.1, clearcoat: 0, scale: 12, pattern: "pile", fold: 0.02 },
  wool: { rough: 0.95, metal: 0, sheen: 0.35, bump: 1.2, clearcoat: 0, scale: 14, pattern: "knit", fold: 0.022 },
};

const texCache = new Map<string, THREE.CanvasTexture>();
function bumpTexture(p: Pattern, rep: number) {
  const key = p + rep;
  if (texCache.has(key)) return texCache.get(key)!;
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256);
  let seed = 7; const rnd = (n: number) => ((seed = (seed * 16807) % 2147483647) / 2147483647) * n;
  if (p === "twill") { g.lineWidth = 3; for (let i = -256; i < 512; i += 8) { g.strokeStyle = i % 16 ? "#b4b4b4" : "#4c4c4c"; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 256, 256); g.stroke(); } }
  else if (p === "plain") { for (let y = 0; y < 256; y += 4) for (let x = 0; x < 256; x += 4) { g.fillStyle = (x + y) % 8 ? "#9c9c9c" : "#686868"; g.fillRect(x, y, 3, 3); } }
  else if (p === "rib") { for (let x = 0; x < 256; x += 8) { const gr = g.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, "#5a5a5a"); gr.addColorStop(0.5, "#b8b8b8"); gr.addColorStop(1, "#5a5a5a"); g.fillStyle = gr; g.fillRect(x, 0, 8, 256); } }
  else if (p === "grain") { for (let i = 0; i < 2200; i++) { const v = 80 + rnd(100); g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(rnd(256), rnd(256), 2 + rnd(5), 0, 7); g.fill(); } }
  else if (p === "pile") { for (let i = 0; i < 14000; i++) { const v = 80 + rnd(110); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(rnd(256), rnd(256), 1 + rnd(2), 2 + rnd(4)); } }
  else { for (let y = 0; y < 256; y += 10) for (let x = 0; x < 256; x += 10) { g.fillStyle = "#606060"; g.beginPath(); g.moveTo(x, y + 10); g.lineTo(x + 5, y); g.lineTo(x + 10, y + 10); g.fill(); g.fillStyle = "#b0b0b0"; g.fillRect(x + 4, y + 2, 2, 8); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep / 4, rep / 4); t.anisotropy = 8;
  texCache.set(key, t); return t;
}

function logoTexture(color: string) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const g = c.getContext("2d")!;
  const light = new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 }).l > 0.55;
  g.fillStyle = light ? "rgba(20,20,22,.78)" : "rgba(235,232,226,.82)";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "500 150px Georgia, 'Times New Roman', serif"; g.fillText("K", 150, 135);
  g.font = "italic 100px Georgia, serif"; g.fillText("&", 262, 150);
  g.font = "500 150px Georgia, serif"; g.fillText("F", 372, 135);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
}

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */
const prof = (keys: number[][], n = 44) => new THREE.CatmullRomCurve3(keys.map((k) => new V(k[0], k[1], k[2])), false, "catmullrom", 0.5).getPoints(n);

interface LoftOpt { seg?: number; fold?: number; cap?: "end" | "start" | "both" | "none"; phase?: number }
/** Loft an elliptical tube along a path. rx/rz are per-ring radii. */
function loft(centers: THREE.Vector3[], rx: number[], rz: number[], o: LoftOpt = {}) {
  const seg = o.seg ?? 56, n = centers.length, fold = o.fold ?? 0.016, ph = o.phase ?? 0;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let len = 0;
  for (let i = 0; i < n; i++) {
    const t = centers[Math.min(n - 1, i + 1)].clone().sub(centers[Math.max(0, i - 1)]).normalize();
    const ref = Math.abs(t.z) > 0.9 ? new V(1, 0, 0) : new V(0, 0, 1);
    const a = new V().crossVectors(t, ref).normalize(), b = new V().crossVectors(t, a).normalize();
    if (i) len += centers[i].distanceTo(centers[i - 1]);
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * Math.PI * 2;
      const f = 1 + fold * 6 * (Math.sin(3 * th + i * 0.3 + ph) * 0.5 + Math.sin(7 * th - i * 0.55 + ph) * 0.3 + Math.sin(i * 1.1 + th * 2) * 0.2) * (0.4 + 0.6 * Math.abs(Math.sin(th)));
      const p = centers[i].clone().addScaledVector(a, Math.cos(th) * rx[i] * f).addScaledVector(b, Math.sin(th) * rz[i] * f);
      pos.push(p.x, p.y, p.z); uv.push((j / seg) * Math.PI * (rx[i] + rz[i]), len);
    }
  }
  const row = seg + 1;
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) { const a = i * row + j, b = a + 1, c = a + row, d = c + 1; idx.push(a, c, b, b, c, d); }
  const addCap = (ring: number, flip: boolean) => {
    let cx = 0, cy = 0, cz = 0; for (let j = 0; j < seg; j++) { const k = (ring * row + j) * 3; cx += pos[k]; cy += pos[k + 1]; cz += pos[k + 2]; }
    const ci = pos.length / 3; pos.push(cx / seg, cy / seg, cz / seg); uv.push(0, 0);
    for (let j = 0; j < seg; j++) { const a = ring * row + j, b = a + 1; flip ? idx.push(ci, b, a) : idx.push(ci, a, b); }
  };
  if (o.cap === "end" || o.cap === "both") addCap(n - 1, false);
  if (o.cap === "start" || o.cap === "both") addCap(0, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // ensure outward-facing normals (sample one vertex mid-tube)
  const nr = g.attributes.normal, ps = g.attributes.position, mid = centers[Math.floor(n / 2)];
  const k = Math.floor(n / 2) * row + Math.floor(seg / 8);
  const v = new V(ps.getX(k) - mid.x, ps.getY(k) - mid.y, ps.getZ(k) - mid.z);
  if (v.dot(new V(nr.getX(k), nr.getY(k), nr.getZ(k))) < 0) flip(g);
  return g;
}
function flip(g: THREE.BufferGeometry) {
  const ix = g.index!.array as Uint32Array | Uint16Array;
  for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  g.computeVertexNormals();
}

/** Torso loft along Y from a [y, rx, rz] profile. */
function torso(keys: number[][], o: LoftOpt = {}) {
  const p = prof(keys);
  return loft(p.map((q) => new V(0, q.x, 0)), p.map((q) => q.y), p.map((q) => q.z), o);
}
const rzAt = (keys: number[][], y: number) => { const p = prof(keys, 120); let best = p[0]; for (const q of p) if (Math.abs(q.x - y) < Math.abs(best.x - y)) best = q; return best; };

/** Sleeve / leg loft along a path [x,y,z,rx,rz?]. */
function limb(pts: number[][], o: LoftOpt = {}) {
  const c = new THREE.CatmullRomCurve3(pts.map((k) => new V(k[0], k[1], k[2])), false, "catmullrom", 0.5);
  const n = 36, centers = c.getPoints(n);
  const r = new THREE.CatmullRomCurve3(pts.map((k, i) => new V(i / (pts.length - 1), k[3], k[4] ?? k[3] * 0.92)), false, "catmullrom", 0.5).getPoints(n);
  return loft(centers, r.map((q) => q.y), r.map((q) => q.z), { seg: 40, ...o });
}
const mirror = (g: THREE.BufferGeometry) => { const m = g.clone(); m.scale(-1, 1, 1); flip(m); return m; };

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
interface P { garment: Garment; color: string; material: Material; stitching?: boolean }
type Extra = { kind: string; pos?: number[]; size?: number[] };

export default function Garment3D({ garment, color, material, stitching = true }: P) {
  const spec = MATERIALS[material];
  const col = useMemo(() => new THREE.Color(color), [color]);
  const dark = useMemo(() => col.clone().multiplyScalar(0.8), [col]);
  const lightness = col.getHSL({ h: 0, s: 0, l: 0 }).l;
  const stitchCol = lightness > 0.6 ? "#59564f" : "#cfd0d4";
  const fabric = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: col, roughness: spec.rough, metalness: spec.metal, sheen: spec.sheen, sheenRoughness: 0.6, sheenColor: col.clone().lerp(new THREE.Color("#fff"), 0.25),
    bumpMap: bumpTexture(spec.pattern, spec.scale), bumpScale: garment === "cap" ? spec.bump * 0.25 : spec.bump * 0.9, clearcoat: spec.clearcoat, clearcoatRoughness: 0.4, side: THREE.DoubleSide,
  }), [col, spec, garment]);
  const rib = useMemo(() => new THREE.MeshPhysicalMaterial({ color: dark, roughness: 0.95, sheen: 1, sheenRoughness: 0.5, sheenColor: col.clone().lerp(new THREE.Color("#fff"), 0.3), bumpMap: bumpTexture("rib", 60), bumpScale: 2.2, side: THREE.DoubleSide }), [dark, col]);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9ccd2", metalness: 1, roughness: 0.22 }), []);
  const logo = useMemo(() => logoTexture(color), [color]);
  const S = spec.fold;

  const built = useMemo(() => {
    const L: { g: THREE.BufferGeometry; m: "f" | "r" }[] = [];
    const add = (g: THREE.BufferGeometry, m: "f" | "r" = "f") => L.push({ g, m });
    const both = (g: THREE.BufferGeometry, m: "f" | "r" = "f") => { add(g, m); add(mirror(g), m); };
    let T: number[][] = [];
    const extras: Extra[] = [];

    if (garment === "hoodie") {
      T = [[1.34, .19, .15], [1.28, .40, .23], [1.16, .62, .30], [.9, .67, .34], [.3, .70, .36], [-.5, .72, .36], [-1.12, .70, .35]];
      add(torso(T, { fold: S }));
      add(torso([[-1.1, .70, .35], [-1.26, .63, .31], [-1.4, .61, .30]], { fold: 0.004 }), "r");
      both(limb([[.46, .98, 0, .22], [.84, .7, .02, .245], [1.02, .12, .1, .21], [1.07, -.6, .2, .17], [1.09, -1.0, .24, .155]], { fold: S * 1.3, cap: "end" }));
      both(limb([[1.09, -.96, .24, .15], [1.1, -1.12, .26, .145], [1.1, -1.26, .28, .14]], { fold: 0.004, cap: "end" }), "r");
      extras.push({ kind: "hood" }, { kind: "pocket", pos: [0, -.55, rzAt(T, -.55).z + .02], size: [.82, .46, .06] }, { kind: "cords" });
    } else if (garment === "tee") {
      T = [[1.34, .19, .15], [1.29, .41, .22], [1.17, .62, .29], [.9, .67, .33], [.2, .69, .35], [-.5, .70, .35], [-1.0, .71, .35]];
      add(torso(T, { fold: S }));
      both(limb([[.46, .98, 0, .23], [.86, .84, .02, .27], [1.04, .6, .05, .25]], { fold: S, cap: "end" }));
      extras.push({ kind: "neckrib" });
    } else if (garment === "jacket" || garment === "bomber") {
      const bomber = garment === "bomber";
      T = bomber ? [[1.34, .2, .16], [1.27, .42, .24], [1.15, .64, .31], [.8, .70, .36], [0, .74, .38], [-.7, .76, .38], [-1.0, .74, .37]]
        : [[1.5, .25, .21], [1.38, .26, .21], [1.28, .42, .26], [1.16, .64, .31], [.9, .69, .35], [0, .72, .37], [-.9, .72, .36], [-1.32, .70, .35]];
      add(torso(T, { fold: S }));
      if (bomber) {
        add(torso([[-.98, .74, .37], [-1.14, .68, .34], [-1.32, .66, .33]], { fold: 0.004 }), "r");
        add(torso([[1.34, .2, .16], [1.43, .22, .18], [1.55, .23, .19]], { fold: 0.004 }), "r");
        both(limb([[.46, .98, 0, .22], [.86, .72, .04, .26], [1.02, .1, .12, .26], [1.07, -.55, .22, .21], [1.09, -.82, .25, .16]], { fold: S * 1.4, cap: "end" }));
        both(limb([[1.09, -.8, .25, .15], [1.1, -.93, .27, .145], [1.1, -1.07, .29, .14]], { fold: 0.004, cap: "end" }), "r");
      } else {
        both(limb([[.46, .98, 0, .23], [.86, .7, .03, .26], [1.03, .12, .12, .22], [1.08, -.6, .22, .185], [1.1, -1.04, .26, .17]], { fold: S * 1.2, cap: "end" }));
      }
      extras.push({ kind: bomber || material === "nylon" ? "zip" : "buttons" });
      if (!bomber && (material === "denim" || material === "wool")) extras.push({ kind: "wings" });
      if (!bomber) extras.push({ kind: "pockets" });
    } else if (garment === "pants") {
      T = [[1.52, .70, .34], [1.40, .71, .34], [1.27, .70, .34]];
      add(torso(T, { fold: 0.005 }));
      const cargo = material === "cotton";
      const leg = (s: number) => limb(cargo
        ? [[s * .33, 1.32, 0, .42, .37], [s * .38, .5, .01, .38, .34], [s * .36, -.5, .02, .31, .29], [s * .34, -1.3, .02, .26, .25], [s * .33, -1.62, .02, .24, .23]]
        : [[s * .33, 1.32, 0, .42, .37], [s * .37, .5, .01, .37, .33], [s * .34, -.5, .02, .30, .28], [s * .32, -1.3, .02, .24, .23], [s * .31, -1.5, .02, .20, .20]], { fold: S * 1.4, cap: "end" });
      add(leg(1)); add(leg(-1));
      if (!cargo) for (const s of [-1, 1]) add(limb([[s * .31, -1.46, .02, .19, .19], [s * .31, -1.58, .02, .185, .185], [s * .31, -1.72, .02, .18, .18]], { fold: 0.004, cap: "end" }), "r");
      if (cargo) extras.push({ kind: "cargo" });
      extras.push({ kind: "drawcord" });
    }
    return { L, T, extras };
  }, [garment, material, S]);

  const lines = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    if (!stitching) return out;
    const T = built.T;
    if (T.length && garment !== "pants") {
      const p = prof(T, 60);
      out.push(p.map((q) => new V(q.y, q.x, 0)), p.map((q) => new V(-q.y, q.x, 0)));
      const hemY = T[T.length - 1][0] + 0.06, h = rzAt(T, hemY);
      out.push(Array.from({ length: 65 }, (_, i) => { const th = (i / 64) * Math.PI * 2; return new V(Math.cos(th) * (h.y + .004), hemY, Math.sin(th) * (h.z + .004)); }));
    }
    if (garment === "pants") {
      for (const s of [-1, 1]) { out.push([new V(s * .34, .9, .38), new V(s * .37, 0, .35), new V(s * .33, -1.55, .24)]); }
      out.push(Array.from({ length: 65 }, (_, i) => { const th = (i / 64) * Math.PI * 2; return new V(Math.cos(th) * .735, 1.1, Math.sin(th) * .355); }));
    }
    return out;
  }, [built, garment, stitching]);

  const capParts = useMemo(() => {
    if (garment !== "cap") return null;
    const dome = [new THREE.Vector2(0.9, -0.14), ...Array.from({ length: 26 }, (_, i) => { const a = (i / 25) * Math.PI * 0.5; return new THREE.Vector2(Math.cos(a) * 0.9 + 0.001, Math.sin(a) * 0.7); })];
    const pos: number[] = [], idx: number[] = [], uv: number[] = []; const U = 24, W = 8;
    for (let i = 0; i <= U; i++) for (let j = 0; j <= W; j++) {
      const phi = -0.72 + (1.44 * i) / U, r = 0.88 + (j / W) * 0.55 * (1 - 0.35 * phi * phi), droop = -0.03 - 0.16 * Math.pow(j / W, 1.6);
      pos.push(Math.sin(phi) * r, droop - 0.07, Math.cos(phi) * r); uv.push(i * 0.1, j * 0.1);
    }
    for (let i = 0; i < U; i++) for (let j = 0; j < W; j++) { const a = i * (W + 1) + j, b = a + 1, c = a + W + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    const brim = new THREE.BufferGeometry(); brim.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); brim.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); brim.setIndex(idx); brim.computeVertexNormals();
    const seams = Array.from({ length: 6 }, (_, k) => { const ang = (k / 6) * Math.PI * 2 + Math.PI / 6; return Array.from({ length: 24 }, (_, i) => { const a = (i / 23) * Math.PI * 0.5; const r = Math.cos(a) * 0.9 + 0.006; return new V(Math.cos(ang) * r, Math.sin(a) * 0.7 + 0.004, Math.sin(ang) * r); }); });
    return { dome: new THREE.LatheGeometry(dome, 72), brim, seams };
  }, [garment]);

  if (capParts) {
    return (
      <group position={[0, -0.25, 0]} rotation={[0.06, 0, 0]} scale={1.15}>
        <mesh castShadow geometry={capParts.dome} material={fabric} />
        <mesh castShadow geometry={capParts.brim} material={fabric} />
        <mesh position={[0, 0.7, 0]} material={fabric}><sphereGeometry args={[0.06, 20, 20]} /></mesh>
        <mesh position={[0, 0.34, 0.885]} rotation={[-0.18, 0, 0]}><planeGeometry args={[0.52, 0.26]} /><meshStandardMaterial map={logo} transparent roughness={0.9} polygonOffset polygonOffsetFactor={-2} /></mesh>
        <mesh position={[0, 0.25, -0.9]} rotation={[0, Math.PI, 0]} material={metal}><boxGeometry args={[0.5, 0.06, 0.03]} /></mesh>
        {stitching && capParts.seams.map((s, i) => <Line key={i} points={s} color={stitchCol} lineWidth={1} dashed dashSize={0.035} gapSize={0.025} transparent opacity={0.6} />)}
      </group>
    );
  }

  const { L, T, extras } = built;
  const chestZ = T.length ? rzAt(T, 0.75).z : 0.35;
  const dl = { lineWidth: 0.9, dashed: true, dashSize: 0.03, gapSize: 0.02, transparent: true, opacity: 0.5 } as const;
  return (
    <group position={[0, 0.08, 0]}>
      {L.map((p, i) => <mesh key={i} geometry={p.g} castShadow receiveShadow material={p.m === "r" ? rib : fabric} />)}
      {lines.map((l, i) => <Line key={i} points={l} color={stitchCol} {...dl} />)}

      {(garment === "tee" || garment === "hoodie" || garment === "bomber") && (
        <mesh position={[-0.3, 0.68, chestZ + 0.012]} rotation={[-0.06, 0, 0]}><planeGeometry args={[0.34, 0.17]} /><meshStandardMaterial map={logo} transparent roughness={1} polygonOffset polygonOffsetFactor={-3} /></mesh>
      )}

      {extras.map((e, i) => {
        switch (e.kind) {
          case "hood": return (
            <group key={i}>
              <mesh position={[0, 1.22, -0.12]} rotation={[Math.PI / 2 - 0.35, 0, 0]} scale={[1.18, 1, 1]} castShadow material={fabric}><torusGeometry args={[0.27, 0.12, 24, 64]} /></mesh>
              <mesh position={[0, 0.8, -0.37]} rotation={[0.12, 0, 0]} scale={[0.5, 0.62, 0.13]} castShadow material={fabric}><sphereGeometry args={[1, 40, 32]} /></mesh>
            </group>);
          case "pocket": return (
            <group key={i}>
              <RoundedBox args={e.size as [number, number, number]} radius={0.03} smoothness={4} position={e.pos as [number, number, number]} castShadow material={fabric} />
              <Line points={[new V(-.43, -.33, e.pos![2] + .04), new V(-.3, -.77, e.pos![2] + .04)]} color={stitchCol} {...dl} />
            </group>);
          case "cords": return [-1, 1].map((s) => (
            <group key={`c${s}`}><mesh position={[s * 0.1, 0.86, 0.37]}><cylinderGeometry args={[0.014, 0.014, 0.62, 10]} /><meshStandardMaterial color={dark} roughness={0.8} /></mesh>
              <mesh position={[s * 0.1, 0.54, 0.372]} material={metal}><cylinderGeometry args={[0.022, 0.022, 0.07, 12]} /></mesh></group>));
          case "neckrib": return <mesh key={i} position={[0, 1.34, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]} material={rib}><torusGeometry args={[0.2, 0.034, 14, 56]} /></mesh>;
          case "zip": {
            const pts = prof(T, 50).filter((q) => q.x < T[0][0] - 0.02).map((q) => new V(0, q.x, q.z + 0.012));
            return (
              <group key={i}>
                <mesh material={metal}><tubeGeometry args={[new THREE.CatmullRomCurve3(pts), 80, 0.011, 8]} /></mesh>
                <mesh position={[0, pts[0].y - 0.12, pts[0].z + 0.012]} material={metal}><boxGeometry args={[0.035, 0.16, 0.02]} /></mesh>
                <Line points={pts.map((p) => new V(p.x - 0.045, p.y, p.z))} color={stitchCol} {...dl} />
                <Line points={pts.map((p) => new V(p.x + 0.045, p.y, p.z))} color={stitchCol} {...dl} />
              </group>
            );
          }
          case "buttons": return (
            <group key={i}>{Array.from({ length: 7 }, (_, k) => { const y = 1.05 - k * 0.33; return <mesh key={k} position={[0, y, rzAt(T, y).z + 0.014]} rotation={[Math.PI / 2, 0, 0]} material={metal}><cylinderGeometry args={[0.032, 0.032, 0.02, 20]} /></mesh>; })}</group>
          );
          case "wings": return [-1, 1].map((s) => <mesh key={`w${s}`} position={[s * 0.2, 1.26, 0.2]} rotation={[0.55, 0, s * -0.6]} castShadow material={fabric}><boxGeometry args={[0.36, 0.2, 0.035]} /></mesh>);
          case "pockets": return [-1, 1].map((s) => <RoundedBox key={`p${s}`} args={[0.3, 0.035, 0.03]} radius={0.012} smoothness={3} rotation={[0, 0, s * 0.18]} position={[s * 0.33, 0.52, rzAt(T, 0.52).z + 0.008]} material={rib} />);
          case "cargo": return [-1, 1].map((s) => (
            <group key={`g${s}`}>
              <RoundedBox args={[0.3, 0.46, 0.07]} radius={0.025} smoothness={4} position={[s * 0.4, -0.18, 0.36]} castShadow material={fabric} />
              <RoundedBox args={[0.32, 0.14, 0.085]} radius={0.025} smoothness={4} position={[s * 0.4, 0.02, 0.365]} castShadow material={fabric} />
              <mesh position={[s * 0.4, 0.02, 0.41]} material={metal}><cylinderGeometry args={[0.025, 0.025, 0.012, 16]} /></mesh>
            </group>));
          case "drawcord": return [-1, 1].map((s) => (
            <group key={`d${s}`}><mesh position={[s * 0.1, 1.0, 0.36]}><cylinderGeometry args={[0.012, 0.012, 0.5, 8]} /><meshStandardMaterial color={dark} roughness={0.8} /></mesh>
              <mesh position={[s * 0.1, 0.74, 0.362]} material={metal}><cylinderGeometry args={[0.02, 0.02, 0.06, 12]} /></mesh></group>));
          default: return null;
        }
      })}
    </group>
  );
}
