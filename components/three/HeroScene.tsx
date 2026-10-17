"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "./Garment3D";
import { Particles, StudioLights } from "./Studio";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Colour switch: the hoodie spins a full turn and lands in the new colour, swapping while side-on. */
function Rig({ scroll, color, instant }: { scroll: React.MutableRefObject<number>; color: string; instant: boolean }) {
  const g = useRef<THREE.Group>(null);
  const [shown, setShown] = useState(color);
  const spin = useRef<{ start: number; to: string; swapped: boolean } | null>(null);
  const clock = useThree((s) => s.clock);
  useEffect(() => {
    if (color === shown && !spin.current) return;
    if (instant) { setShown(color); return; }
    spin.current = { start: clock.elapsedTime, to: color, swapped: false };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);
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
    if (!g.current) return;
    const base = Math.sin(t * 0.35) * 0.45 * (1 - p) + turn;
    if (spin.current) {
      const u = Math.min(1, (t - spin.current.start) / 1.1);
      if (u > 0.42 && !spin.current.swapped) { spin.current.swapped = true; setShown(spin.current.to); }
      // a full turn lands on the same angle, so finishing snaps to base without unwinding
      g.current.rotation.y = u >= 1 ? base : base + ease(u) * Math.PI * 2;
      if (u >= 1) spin.current = null;
    } else {
      g.current.rotation.y += (base - g.current.rotation.y) * k;
    }
  });
  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.5}>
      <group ref={g} scale={sc} position={[0, 0.12, 0]}><Garment3D garment="hoodie" color={shown} material="fleece" /></group>
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

export default function HeroScene({ scroll, color = "#1a1a1f", instant = false }: { scroll: React.MutableRefObject<number>; color?: string; instant?: boolean }) {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 32, position: [0, 0.2, 6.4] }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}>
      <StudioLights />
      <Particles />
      <Rig scroll={scroll} color={color} instant={instant} />
      <NearDust scroll={scroll} />
    </Canvas>
  );
}
