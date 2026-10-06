"use client";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import Mannequin from "./Mannequin";
import type { Garment, Material } from "@/lib/products";

export interface Piece { garment: Garment; color: string; material: Material }
export interface Outfit { top: Piece; bottom: Piece; acc: Piece[]; skin: string; hair: string; width: number; height: number }

/** Where each accessory sits on the figure (figure space, matches Mannequin). */
function Placed({ p }: { p: Piece }) {
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

function Figure({ o }: { o: Outfit }) {
  return (
    <group scale={[o.width * o.height, o.height, o.width * o.height]} position={[0, -(1 - o.height) * 1.0, 0]}>
      <Mannequin skin={o.skin} hair={o.hair} />
      <Garment3D {...o.top} />
      <group position={[0, -2.02, 0]}><Garment3D {...o.bottom} under /></group>
      {o.acc.map((a) => <Placed key={a.garment} p={a} />)}
    </group>
  );
}

export default function TryOnScene({ outfit, spin }: { outfit: Outfit; spin: boolean }) {
  const controls = useRef<any>(null);
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 30, position: [3, -0.2, 12] }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} style={{ touchAction: "none" }}>
      <color attach="background" args={["#0d0d0f"]} />
      <fog attach="fog" args={["#0d0d0f", 18, 34]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 9, 8]} angle={0.5} penumbra={1} intensity={260} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-7, 3, -5]} angle={0.7} penumbra={1} intensity={300} color="#b9c4ff" />
      <spotLight position={[0, 5, -9]} angle={0.8} penumbra={1} intensity={160} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={6} position={[0, 6, 3]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={3} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={3} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} color="#dfe5ff" />
      </Environment>
      <Suspense fallback={<Html center className="text-[10px] tracking-[0.3em] text-fog">DRESSING…</Html>}>
        <Figure o={outfit} />
      </Suspense>
      <mesh position={[0, -3.99, 0]} receiveShadow><cylinderGeometry args={[2.4, 2.5, 0.08, 64]} /><meshStandardMaterial color="#151518" roughness={0.35} metalness={0.7} /></mesh>
      <mesh position={[0, -3.94, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.3, 2.34, 96]} /><meshBasicMaterial color="#c4c7cc" /></mesh>
      <ContactShadows position={[0, -3.94, 0]} opacity={0.7} scale={9} blur={2.4} far={5} />
      <OrbitControls ref={controls} target={[0, -0.9, 0]} enablePan={false} minDistance={5} maxDistance={20} minPolarAngle={0.9} maxPolarAngle={1.75} autoRotate={spin} autoRotateSpeed={0.9} enableDamping />
    </Canvas>
  );
}
