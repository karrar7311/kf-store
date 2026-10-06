"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import { Particles } from "./Studio";
import { products } from "@/lib/products";

export const LOOKS = [products[2], products[0], products[5], products[3], products[7], products[1]];
const STEP = 4.2;

function Walk({ progress }: { progress: React.MutableRefObject<number> }) {
  useFrame((s) => {
    const z = 6 - progress.current * (LOOKS.length - 1) * STEP + 9.5;
    s.camera.position.z += (z - s.camera.position.z) * 0.06;
    s.camera.position.x = Math.sin(s.clock.elapsedTime * 0.3) * 0.5;
    s.camera.position.y = 0.6;
    s.camera.lookAt(0, 0, s.camera.position.z - 6);
  });
  return (
    <group>
      {LOOKS.map((p, i) => (
        <group key={p.slug} position={[i % 2 ? 1.9 : -1.9, 0, 6 - i * STEP]} rotation={[0, i % 2 ? -0.5 : 0.5, 0]}>
          <Garment3D garment={p.garment} color={p.colors[0].hex} material={p.material} stitching />
          <pointLight position={[0, 2.5, 1.5]} intensity={8} distance={6} color="#ffffff" />
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -8]}><planeGeometry args={[4, 60]} /><meshStandardMaterial color="#0d0d0f" roughness={0.15} metalness={0.8} /></mesh>
      {Array.from({ length: 16 }).map((_, i) => (
        <group key={i}>
          <mesh position={[-2, -1.58, 6 - i * 2.2]}><boxGeometry args={[0.04, 0.02, 0.9]} /><meshBasicMaterial color="#c4c7cc" /></mesh>
          <mesh position={[2, -1.58, 6 - i * 2.2]}><boxGeometry args={[0.04, 0.02, 0.9]} /><meshBasicMaterial color="#c4c7cc" /></mesh>
        </group>
      ))}
    </group>
  );
}

export default function RunwayScene({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ fov: 40, position: [0, 0.4, 15.5] }} gl={{ toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={["#060607"]} />
      <fog attach="fog" args={["#060607", 5, 22]} />
      <ambientLight intensity={0.35} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 0]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#cfd6ff" />
      </Environment>
      <Particles count={220} />
      <Walk progress={progress} />
    </Canvas>
  );
}
