"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import { Particles, StudioLights } from "./Studio";

function Rig({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s, d) => {
    const t = s.clock.elapsedTime;
    const px = s.pointer.x, py = s.pointer.y, sc = scroll.current;
    const k = Math.min(1, d * 1.5);
    s.camera.position.x += (px * 0.5 + Math.sin(t * 0.15) * 0.4 - s.camera.position.x) * k;
    s.camera.position.y += (py * 0.3 + 0.2 - sc * 1.2 - s.camera.position.y) * k;
    s.camera.position.z = 6.4 - sc * 2.4;
    s.camera.lookAt(0, 0, 0);
    if (g.current) g.current.rotation.y = Math.sin(t * 0.35) * 0.55 + sc * 1.4;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.5}>
      <group ref={g} scale={0.72} position={[0, 0.12, 0]}><Garment3D garment="hoodie" color="#1a1a1f" material="fleece" /></group>
    </Float>
  );
}

export default function HeroScene({ scroll }: { scroll: React.MutableRefObject<number> }) {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 32, position: [0, 0.2, 6.4] }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}>
      <StudioLights />
      <Particles />
      <Rig scroll={scroll} />
    </Canvas>
  );
}
