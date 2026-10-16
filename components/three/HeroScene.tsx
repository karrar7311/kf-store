"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import { Particles, StudioLights } from "./Studio";

function Rig({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const { size } = useThree();
  const aspect = size.width / size.height;
  const sc = aspect < 0.8 ? 0.5 : aspect < 1.2 ? 0.62 : 0.72;
  useFrame((s, d) => {
    const t = s.clock.elapsedTime;
    const px = s.pointer.x, py = s.pointer.y, p = scroll.current;
    const k = Math.min(1, d * 1.5);
    s.camera.position.x += (px * 0.5 + Math.sin(t * 0.15) * 0.4 - s.camera.position.x) * k;
    s.camera.position.y += (py * 0.3 + 0.2 - p * 0.9 - s.camera.position.y) * k;
    s.camera.position.z += (6.4 - p * 2.1 - s.camera.position.z) * k;
    s.camera.lookAt(0, -p * 0.25, 0);
    // second beat: the hoodie turns to show its back as the stage holds
    const turn = THREE.MathUtils.smoothstep(p, 0.25, 0.75) * Math.PI;
    if (g.current) g.current.rotation.y += (Math.sin(t * 0.35) * 0.45 * (1 - p) + turn - g.current.rotation.y) * k;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.5}>
      <group ref={g} scale={sc} position={[0, 0.12, 0]}><Garment3D garment="hoodie" color="#1a1a1f" material="fleece" /></group>
    </Float>
  );
}

let soft: THREE.CanvasTexture | null = null;
function softDot() {
  if (soft) return soft;
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,.45)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return (soft = new THREE.CanvasTexture(c));
}

/** Near plane: large out-of-focus dust between the camera and the garment. Moves the most. */
function NearDust({ scroll, count = 26 }: { scroll: React.MutableRefObject<number>; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - 0.5) * 5; a[i * 3 + 1] = (Math.random() - 0.5) * 3.2; a[i * 3 + 2] = 1.6 + Math.random() * 2.2; }
    return a;
  }, [count]);
  useFrame((s, d) => {
    if (!ref.current) return;
    const k = Math.min(1, d * 2);
    ref.current.position.x += (-s.pointer.x * 0.45 - ref.current.position.x) * k;
    ref.current.position.y += (-s.pointer.y * 0.25 + scroll.current * 2.2 - ref.current.position.y) * k;
    ref.current.rotation.z += d * 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial map={softDot()} size={0.16} color="#e9e6df" transparent opacity={0.32} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function HeroScene({ scroll }: { scroll: React.MutableRefObject<number> }) {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 32, position: [0, 0.2, 6.4] }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}>
      <StudioLights />
      <Particles />
      <Rig scroll={scroll} />
      <NearDust scroll={scroll} />
    </Canvas>
  );
}
