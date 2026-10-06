"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/** Offline studio lighting rig (no HDR download). */
export function StudioLights({ dim = false, warm = false }: { dim?: boolean; warm?: boolean }) {
  const k = dim ? 0.35 : 1;
  return (
    <>
      <ambientLight intensity={0.6 * k} />
      <spotLight position={[3, 5, 4]} angle={0.4} penumbra={1} intensity={90 * k} castShadow color={warm ? "#ffe3d0" : "#ffffff"} />
      <spotLight position={[-4, 2, -3]} angle={0.5} penumbra={1} intensity={160 * k} color="#aab6ff" />
      <spotLight position={[0, 2, -5]} angle={0.6} penumbra={1} intensity={120 * k} color="#ffffff" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={9 * k} position={[0, 4, 2]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={5 * k} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={5 * k} position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color={warm ? "#ffb9a0" : "#cfd6ff"} />
      </Environment>
      <ContactShadows position={[0, -1.7, 0]} opacity={0.7} scale={9} blur={2.8} far={4} />
    </>
  );
}

/** Floating dust particles for atmosphere. */
export function Particles({ count = 160 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - 0.5) * 9; a[i * 3 + 1] = (Math.random() - 0.5) * 6; a[i * 3 + 2] = (Math.random() - 0.5) * 6; }
    return a;
  }, [count]);
  useFrame((_, d) => { if (ref.current) { ref.current.rotation.y += d * 0.02; } });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial size={0.018} color="#d8d9dd" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}
