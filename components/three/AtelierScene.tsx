"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import type { Garment, Material } from "@/lib/products";

const SCALE: Record<string, number> = { coat: 0.62, shorts: 1.2, pants: 0.85, vest: 1.0 };
const GROUND: Record<string, number> = { coat: -2.2, shorts: -0.9, pants: -1.7 };

/** Live 3D studio for the Atelier: any base garment in any fabric, colour and monogram. */
export default function AtelierScene({ garment, color, material, monogram, stitching, spin }: {
  garment: Garment; color: string; material: Material; monogram: string; stitching: boolean; spin: boolean;
}) {
  const s = SCALE[garment] ?? 1.05;
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 34, position: [0, 0.1, 7.2] }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} style={{ touchAction: "none" }}>
      <color attach="background" args={["#0c0c0e"]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[4, 6, 6]} angle={0.5} penumbra={1} intensity={230} castShadow />
      <spotLight position={[-6, 3, -4]} angle={0.7} penumbra={1} intensity={300} color="#b9c4ff" />
      <spotLight position={[0, 4, -7]} angle={0.8} penumbra={1} intensity={170} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={7} position={[0, 5, 3]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={4} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 5, 1]} />
        <Lightformer form="rect" intensity={4} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 5, 1]} color="#dfe5ff" />
      </Environment>
      <Suspense fallback={<Html center className="text-[10px] tracking-[0.3em] text-fog">LOADING</Html>}>
        <group scale={s}><Garment3D garment={garment} color={color} material={material} monogram={monogram || undefined} stitching={stitching} /></group>
      </Suspense>
      <ContactShadows position={[0, GROUND[garment] ?? -1.7, 0]} opacity={0.65} scale={9} blur={2.6} far={5} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={12} autoRotate={spin} autoRotateSpeed={1.1} enableDamping />
    </Canvas>
  );
}
