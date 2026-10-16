"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import { Particles } from "./Studio";

/** The Assembly: the hoodie builds itself as `progress` runs 0 -> 1. */
function Rig({ progress, color }: { progress: React.MutableRefObject<number>; color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s, d) => {
    const p = progress.current, t = s.clock.elapsedTime;
    const wide = s.size.width / s.size.height;
    const k = Math.min(1, d * 2.2);
    // camera pulls back while parts are apart, then settles close once assembled
    const targetZ = (wide < 0.8 ? 15.5 : 11.5) - Math.min(1, p / 0.7) * (wide < 0.8 ? 2.5 : 3.2) + (1 - Math.min(1, p / 0.5)) * 3;
    s.camera.position.z += (targetZ - s.camera.position.z) * k;
    s.camera.position.x += (Math.sin(t * 0.2) * 0.5 + s.pointer.x * 0.6 - s.camera.position.x) * k;
    s.camera.position.y += (0.3 + s.pointer.y * 0.3 - s.camera.position.y) * k;
    s.camera.lookAt(0, -0.05, 0);
    if (g.current) {
      const settle = Math.max(0, (p - 0.7) / 0.3);
      g.current.rotation.y += (Math.sin(p * 5.2) * 0.35 * (1 - settle) + settle * (Math.sin(t * 0.5) * 0.5) - g.current.rotation.y) * k;
    }
  });
  return <group ref={g}><Garment3D garment="hoodie" color={color} material="fleece" assemble={progress} /></group>;
}

export default function AnatomyScene({ progress, color = "#1b1b20" }: { progress: React.MutableRefObject<number>; color?: string }) {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 30, position: [0, 0.3, 14] }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[4, 7, 6]} angle={0.5} penumbra={1} intensity={240} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-6, 3, -4]} angle={0.7} penumbra={1} intensity={300} color="#b9c4ff" />
      <spotLight position={[0, 4, -7]} angle={0.8} penumbra={1} intensity={180} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={7} position={[0, 5, 3]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={4} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 5, 1]} />
        <Lightformer form="rect" intensity={4} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 5, 1]} color="#dfe5ff" />
      </Environment>
      <Particles count={140} />
      <Suspense fallback={null}><Rig progress={progress} color={color} /></Suspense>
      <ContactShadows position={[0, -1.75, 0]} opacity={0.6} scale={10} blur={2.6} far={5} />
    </Canvas>
  );
}
