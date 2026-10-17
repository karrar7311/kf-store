"use client";
import Garment3D from "./Garment3D";
import Mannequin from "./Mannequin";
import type { Garment, Material } from "@/lib/products";

export interface Piece { garment: Garment; color: string; material: Material }
export interface Outfit { top: Piece; bottom: Piece; acc: Piece[]; skin: string; hair: string; width: number; height: number }

/** Where each accessory sits on the figure (figure space, matches Mannequin). */
export function Placed({ p }: { p: Piece }) {
  switch (p.garment) {
    case "cap": return <group position={[0, 2.02, 0.0]} scale={0.36} rotation={[0.08, 0, 0]}><Garment3D {...p} /></group>;
    case "beanie": return <group position={[0, 2.0, 0.0]} scale={0.3}><Garment3D {...p} /></group>;
    case "sunglasses": return <group position={[0, 1.86, 0.3]} scale={0.23} rotation={[0.04, 0, 0]}><Garment3D {...p} /></group>;
    case "scarf": return <group position={[0, 0.58, 0.04]} scale={0.6}><Garment3D {...p} /></group>;
    case "belt": return <group position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.66, 0.5, 0.66]}><Garment3D {...p} worn /></group>;
    case "tote": return <group position={[1.18, -1.52, 0.18]} scale={0.38} rotation={[0, -0.3, 0]}><Garment3D {...p} /></group>;
    default: return null;
  }
}

/** A dressed mannequin: body, top, bottom and accessories. */
export function Figure({ o }: { o: Outfit }) {
  return (
    <group scale={[o.width * o.height, o.height, o.width * o.height]} position={[0, -(1 - o.height) * 1.0, 0]}>
      <Mannequin skin={o.skin} hair={o.hair} />
      <Garment3D {...o.top} />
      <group position={[0, -2.02, 0]}><Garment3D {...o.bottom} under /></group>
      {o.acc.map((a) => <Placed key={a.garment} p={a} />)}
    </group>
  );
}
