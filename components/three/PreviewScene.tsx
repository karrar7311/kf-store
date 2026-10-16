"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import { StudioLights } from "./Studio";
import type { Garment, Material } from "@/lib/products";

function Turn({ garment, color, material }: { garment: Garment; color: string; material: Material }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s, d) => {
    if (!g.current) return;
    g.current.rotation.y += d * 0.35;
    g.current.rotation.x += (s.pointer.y * 0.18 - g.current.rotation.x) * Math.min(1, d * 3);
  });
  return <Float speed={1.2} floatIntensity={0.4} rotationIntensity={0.05}><group ref={g} scale={0.95}><Garment3D garment={garment} color={color} material={material} stitching /></group></Float>;
}

/** Non-interactive turntable preview, used as a teaser for the full 3D studio. */
export default function PreviewScene({ garment, color, material }: { garment: Garment; color: string; material: Material }) {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 32, position: [0, 0.15, 6.6] }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <StudioLights />
      <Turn garment={garment} color={color} material={material} />
    </Canvas>
  );
}
