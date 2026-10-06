"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import { StudioLights } from "./Studio";
import type { Garment, Material } from "@/lib/products";

export default function ProductScene({ garment, color, material, stitching, lit, autoRotate = true, controlsRef }: {
  garment: Garment; color: string; material: Material; stitching: boolean; lit: boolean; autoRotate?: boolean; controlsRef?: React.Ref<any>;
}) {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 34, position: [0, 0.1, 7] }} gl={{ toneMapping: THREE.ACESFilmicToneMapping }} style={{ touchAction: "none" }}>
      <color attach="background" args={["#0c0c0e"]} />
      <Suspense fallback={<Html center className="text-[10px] tracking-[0.3em] text-fog">LOADING</Html>}>
        <StudioLights dim={!lit} warm={!lit} />
        <group scale={({ cap: 1.5, beanie: 1.3, tote: 1.15, sunglasses: 1.45, belt: 1.0, scarf: 1.0 } as Record<string, number>)[garment] ?? 1.05}><Garment3D garment={garment} color={color} material={material} stitching={stitching} /></group>
      </Suspense>
      <OrbitControls ref={controlsRef} enablePan={false} minDistance={2.5} maxDistance={9} autoRotate={autoRotate} autoRotateSpeed={1.1} enableDamping />
    </Canvas>
  );
}
