"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Line, RoundedBox } from "@react-three/drei";
import { MATERIALS, bumpTexture, logoTexture, loft } from "./Apparel";
import type { Garment, Material } from "@/lib/products";

const V = THREE.Vector3;
const WHITE = new THREE.Color("#ffffff");

function fabricMat(color: string, material: Material, bumpMul = 1, map?: THREE.Texture) {
  const spec = MATERIALS[material];
  const col = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: map ? "#ffffff" : col, map, roughness: spec.rough, metalness: spec.metal, sheen: spec.sheen, sheenRoughness: 0.6, sheenColor: col.clone().lerp(WHITE, 0.25),
    bumpMap: bumpTexture(spec.pattern, spec.scale), bumpScale: spec.bump * bumpMul, clearcoat: spec.clearcoat, clearcoatRoughness: 0.4, side: THREE.DoubleSide,
  });
}
const metalMat = (c = "#cfd2d8") => new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: 0.2 });

function rrect(w: number, h: number, r: number, hole?: [number, number, number]) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  if (hole) { const [hw, hh, hr] = hole; const p = new THREE.Path(); const a = -hw / 2, b = -hh / 2;
    p.moveTo(a + hr, b); p.lineTo(a + hw - hr, b); p.quadraticCurveTo(a + hw, b, a + hw, b + hr); p.lineTo(a + hw, b + hh - hr); p.quadraticCurveTo(a + hw, b + hh, a + hw - hr, b + hh);
    p.lineTo(a + hr, b + hh); p.quadraticCurveTo(a, b + hh, a, b + hh - hr); p.lineTo(a, b + hr); p.quadraticCurveTo(a, b, a + hr, b); s.holes.push(p); }
  return s;
}

function stripeTexture(color: string) {
  const c = document.createElement("canvas"); c.width = 64; c.height = 512; const g = c.getContext("2d")!;
  const base = new THREE.Color(color); g.fillStyle = "#" + base.getHexString(); g.fillRect(0, 0, 64, 512);
  const dark = "#" + base.clone().multiplyScalar(0.6).getHexString(), light = "#" + base.clone().lerp(WHITE, 0.35).getHexString();
  g.fillStyle = light; g.fillRect(0, 24, 64, 6); g.fillRect(0, 482, 64, 6); g.fillStyle = dark; g.fillRect(0, 36, 64, 3); g.fillRect(0, 473, 64, 3);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t;
}

interface P { garment: Garment; color: string; material: Material; stitching?: boolean; worn?: boolean }

export default function Accessory({ garment, color, material, stitching = true, worn = false }: P) {
  const col = useMemo(() => new THREE.Color(color), [color]);
  const dark = useMemo(() => col.clone().multiplyScalar(0.78), [col]);
  const light = col.getHSL({ h: 0, s: 0, l: 0 }).l > 0.6;
  const stitchCol = light ? "#5a574f" : "#d0d1d5";
  const logo = useMemo(() => logoTexture(color), [color]);
  const fabric = useMemo(() => fabricMat(color, material), [color, material]);
  const metal = useMemo(() => metalMat(), []);
  const dl = { lineWidth: 0.9, dashed: true, dashSize: 0.03, gapSize: 0.02, transparent: true, opacity: 0.55 } as const;

  /* ---------------- beanie ---------------- */
  const beanie = useMemo(() => {
    if (garment !== "beanie") return null;
    const dome: THREE.Vector2[] = [];
    for (let i = 0; i <= 36; i++) { const a = (i / 36) * Math.PI / 2; dome.push(new THREE.Vector2(0.84 * Math.cos(a) * (1 - 0.1 * Math.sin(a)) + 0.0005, 0.1 + 0.66 * Math.pow(Math.sin(a), 0.8))); }
    const cuff = [new THREE.Vector2(0.9, -0.5), new THREE.Vector2(0.92, -0.46), new THREE.Vector2(0.93, -0.2), new THREE.Vector2(0.92, 0.1), new THREE.Vector2(0.86, 0.16)];
    return { dome: new THREE.LatheGeometry(dome, 96), cuff: new THREE.LatheGeometry(cuff, 128) };
  }, [garment]);
  const ribMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.95, sheen: 0.9, sheenRoughness: 0.6, sheenColor: col.clone().lerp(WHITE, 0.25), bumpMap: bumpTexture("rib", 200), bumpScale: 3.2, side: THREE.DoubleSide }), [col]);

  /* ---------------- tote ---------------- */
  const handle = useMemo(() => new THREE.TorusGeometry(0.5, 0.05, 10, 48, Math.PI), []);

  /* ---------------- sunglasses ---------------- */
  const glasses = useMemo(() => {
    if (garment !== "sunglasses") return null;
    const frame = new THREE.ExtrudeGeometry(rrect(1.12, 0.78, 0.26, [0.96, 0.62, 0.2]), { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.025, bevelSegments: 5, curveSegments: 14 });
    const lens = new THREE.ExtrudeGeometry(rrect(0.98, 0.64, 0.21), { depth: 0.012, bevelEnabled: false, curveSegments: 14 });
    const bridge = new THREE.TorusGeometry(0.15, 0.03, 10, 24, Math.PI);
    return { frame, lens, bridge };
  }, [garment]);
  const acetate = useMemo(() => new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.55 }), [col]);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#050507", roughness: 0.12, metalness: 0, envMapIntensity: 0.28 }), []);

  /* ---------------- belt ---------------- */
  const belt = useMemo(() => {
    if (garment !== "belt") return null;
    const R = 1.12, gap = 0.3, pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 140; i++) { const th = Math.PI / 2 + gap + (i / 140) * (Math.PI * 2 - gap * 2); pts.push(new V(R * Math.cos(th), R * Math.sin(th), 0)); }
    const strap = loft(pts, pts.map(() => (worn ? 0.028 : 0.15)), pts.map(() => (worn ? 0.15 : 0.028)), { seg: 20, fold: 0.001 });
    const stitch = (r: number) => Array.from({ length: 141 }, (_, i) => { const th = Math.PI / 2 + gap + 0.05 + (i / 140) * (Math.PI * 2 - gap * 2 - 0.1); return new V(r * Math.cos(th), r * Math.sin(th), 0.031); });
    const holes = Array.from({ length: 5 }, (_, i) => { const th = Math.PI / 2 - gap - 0.03 - i * 0.075; return new V(R * Math.cos(th), R * Math.sin(th), 0); });
    const bucklePos: [number, number] = [0, R];
    return { strap, stitchA: stitch(R - 0.1), stitchB: stitch(R + 0.1), holes, bucklePos, buckle: new THREE.ExtrudeGeometry(rrect(0.46, 0.4, 0.07, [0.34, 0.28, 0.04]), { depth: 0.05, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 4 }) };
  }, [garment, worn]);

  /* ---------------- scarf ---------------- */
  const scarf = useMemo(() => {
    if (garment !== "scarf") return null;
    const path = new THREE.CatmullRomCurve3([
      new V(-0.3, -1.25, 0.2), new V(-0.32, -0.4, 0.22), new V(-0.3, 0.35, 0.2), new V(-0.38, 0.85, 0.16), new V(-0.62, 1.05, -0.02), new V(-0.4, 1.22, -0.28),
      new V(0.1, 1.28, -0.34), new V(0.55, 1.15, -0.2), new V(0.62, 0.95, 0.04), new V(0.42, 0.72, 0.22), new V(0.3, 0.1, 0.27), new V(0.32, -0.6, 0.3), new V(0.34, -1.0, 0.33),
    ], false, "catmullrom", 0.5);
    const pts = path.getPoints(150);
    const g = loft(pts, pts.map(() => 0.27), pts.map(() => 0.045), { seg: 28, fold: 0.004, cap: "both" });
    return { g, ends: [pts[0], pts[pts.length - 1]] };
  }, [garment]);

  switch (garment) {
    case "beanie":
      return (
        <group position={[0, -0.25, 0]} rotation={[0.05, 0, 0]} scale={1.2}>
          <mesh geometry={beanie!.dome} material={fabric} castShadow />
          <mesh geometry={beanie!.cuff} material={ribMat} castShadow />
          <mesh position={[0, -0.14, 0.935]}><planeGeometry args={[0.44, 0.22]} /><meshStandardMaterial map={logo} transparent roughness={1} polygonOffset polygonOffsetFactor={-3} /></mesh>
          {stitching && <Line points={Array.from({ length: 65 }, (_, i) => { const th = (i / 64) * Math.PI * 2; return new V(Math.cos(th) * 0.935, 0.14, Math.sin(th) * 0.935); })} color={stitchCol} {...dl} />}
        </group>
      );
    case "tote":
      return (
        <group position={[0, -0.1, 0]}>
          <RoundedBox args={[1.5, 1.35, 0.5]} radius={0.06} smoothness={6} castShadow material={fabric} />
          {[0.17, -0.17].map((z) => <mesh key={z} geometry={handle} material={fabric} position={[0, 0.66, z]} scale={[1, 1.55, 0.4]} castShadow />)}
          <mesh position={[0, -0.04, 0.254]}><planeGeometry args={[0.95, 0.48]} /><meshStandardMaterial map={logo} transparent roughness={1} polygonOffset polygonOffsetFactor={-3} /></mesh>
          {stitching && <Line points={[new V(-0.68, 0.56, 0.256), new V(0.68, 0.56, 0.256), new V(0.68, -0.6, 0.256), new V(-0.68, -0.6, 0.256), new V(-0.68, 0.56, 0.256)]} color={stitchCol} {...dl} />}
          <mesh position={[0, 0.62, 0.26]} material={fabric}><boxGeometry args={[1.5, 0.05, 0.02]} /></mesh>
        </group>
      );
    case "sunglasses":
      return (
        <group scale={1.0}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.62, 0, 0]}>
              <mesh geometry={glasses!.frame} material={acetate} position={[0, 0, -0.04]} castShadow />
              <mesh geometry={glasses!.lens} material={glass} position={[0, 0, 0.005]} />
            </group>
          ))}
          <mesh geometry={glasses!.bridge} material={acetate} position={[0, 0.1, -0.005]} scale={[1, 1, 1.3]} />
          {[-1, 1].map((s) => (
            <group key={`t${s}`}>
              <mesh material={acetate} position={[s * 1.2, 0.08, -0.7]} rotation={[0, s * 0.05, 0]} castShadow><boxGeometry args={[0.07, 0.09, 1.3]} /></mesh>
              <mesh material={metal} position={[s * 1.236, 0.08, -0.35]}><boxGeometry args={[0.012, 0.045, 0.34]} /></mesh>
              <mesh material={metal} position={[s * 1.18, 0.08, -0.04]}><cylinderGeometry args={[0.03, 0.03, 0.12, 12]} /></mesh>
            </group>
          ))}
        </group>
      );
    case "belt":
      return (
        <group>
          <mesh geometry={belt!.strap} material={fabric} castShadow />
          {stitching && [belt!.stitchA, belt!.stitchB].map((l, i) => <Line key={i} points={l} color={stitchCol} {...dl} />)}
          {belt!.holes.map((h, i) => <mesh key={i} position={h} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.022, 0.022, 0.08, 14]} /><meshStandardMaterial color="#050505" roughness={1} /></mesh>)}
          <mesh geometry={belt!.buckle} material={metal} position={[0, belt!.bucklePos[1], -0.025]} castShadow />
          <mesh position={[0, belt!.bucklePos[1] + 0.02, 0.03]} material={metal}><boxGeometry args={[0.03, 0.34, 0.03]} /></mesh>
        </group>
      );
    case "scarf":
      return (
        <group position={[0, 0.05, 0]}>
          <mesh geometry={scarf!.g} material={fabric} castShadow receiveShadow />
          {scarf!.ends.map((e, k) => Array.from({ length: 14 }, (_, i) => <mesh key={`${k}-${i}`} position={[e.x + (i / 13 - 0.5) * 0.5, e.y - 0.09, e.z]} material={fabric}><cylinderGeometry args={[0.011, 0.008, 0.18, 6]} /></mesh>))}
          <mesh position={[-0.3, -0.85, 0.248]}><planeGeometry args={[0.26, 0.13]} /><meshStandardMaterial map={logo} transparent roughness={1} polygonOffset polygonOffsetFactor={-3} /></mesh>
          {void dark}
        </group>
      );
    default:
      return null;
  }
}
