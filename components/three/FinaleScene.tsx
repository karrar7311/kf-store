"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, Environment, Lightformer, Text3D } from "@react-three/drei";
import * as THREE from "three";

const FONT = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/fonts/kf-mark.typeface.json`;
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** One letter of the mark: flies in from `from` (position + spin) as progress runs, staggered by `delay`. */
function Glyph({ ch, x, size, from, delay, progress }: { ch: string; x: number; size: number; from: [number, number, number, number]; delay: number; progress: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!g.current) return;
    const e = ease((progress.current - delay) / 0.55);
    g.current.position.set(THREE.MathUtils.lerp(from[0], x, e), THREE.MathUtils.lerp(from[1], 0, e), THREE.MathUtils.lerp(from[2], 0, e));
    g.current.rotation.y = (1 - e) * from[3];
    g.current.scale.setScalar(0.4 + 0.6 * e);
  });
  return (
    <group ref={g}>
      <Center>
        <Text3D font={FONT} size={size} height={size * 0.28} curveSegments={10} bevelEnabled bevelThickness={size * 0.03} bevelSize={size * 0.018} bevelSegments={5}>
          {ch}
          <meshPhysicalMaterial color="#f1f2f5" metalness={1} roughness={0.2} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.6} />
        </Text3D>
      </Center>
    </group>
  );
}

function Mark({ progress }: { progress: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s, d) => {
    if (!g.current) return;
    const k = Math.min(1, d * 3), t = s.clock.elapsedTime;
    g.current.rotation.y += (s.pointer.x * 0.35 + Math.sin(t * 0.4) * 0.06 - g.current.rotation.y) * k;
    g.current.rotation.x += (-s.pointer.y * 0.18 - g.current.rotation.x) * k;
    const wide = s.size.width / s.size.height;
    g.current.scale.setScalar(wide < 0.8 ? 0.58 : wide < 1.2 ? 0.85 : 1.15);
  });
  return (
    <group ref={g}>
      <Glyph ch="K" x={-1.32} size={1.5} from={[-6, 0.6, -2, -2.4]} delay={0} progress={progress} />
      <Glyph ch="&" x={0.02} size={1.0} from={[0, -0.4, -9, 3.1]} delay={0.12} progress={progress} />
      <Glyph ch="F" x={1.3} size={1.5} from={[6, -0.6, -2, 2.4]} delay={0.06} progress={progress} />
    </group>
  );
}

export default function FinaleScene({ progress, glow = "#efece6" }: { progress: React.MutableRefObject<number>; glow?: string }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ fov: 30, position: [0, 0.15, 9] }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={6} position={[0, 4, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={3} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={4} position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} color={glow} />
        <Lightformer form="ring" intensity={2} position={[0, 0, -6]} scale={6} color={glow} />
        {/* frontal sources: a polished face mostly reflects what is behind the camera */}
        <Lightformer form="rect" intensity={5} position={[0, 2.5, 9]} rotation-x={Math.PI} scale={[14, 1.6, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, -1.5, 8]} rotation-y={Math.PI} scale={[3, 6, 1]} color={glow} />
        <Lightformer form="rect" intensity={1.2} position={[0, -4, 6]} rotation-x={-Math.PI / 2} scale={[14, 6, 1]} />
      </Environment>
      <Suspense fallback={null}><Mark progress={progress} /></Suspense>
      <ContactShadows position={[0, -1.25, 0]} opacity={0.55} scale={10} blur={2.4} far={3} />
    </Canvas>
  );
}
