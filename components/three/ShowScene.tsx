"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Figure, type Outfit, type Piece } from "./Figure";
import { Particles } from "./Studio";
import { LOOKS, type Look } from "@/lib/looks";
import { findProduct } from "@/lib/products";

const FLOOR = -3.97;

const piece = (slug: string, ci = 0): Piece => {
  const p = findProduct(slug);
  if (!p) throw new Error(`unknown product ${slug}`);
  return { garment: p.garment, material: p.material, color: p.colors[Math.min(ci, p.colors.length - 1)].hex };
};
const outfitOf = (l: Look): Outfit => ({
  top: piece(l.top.slug, l.top.ci), bottom: piece(l.bottom.slug, l.bottom.ci), acc: l.acc.map((a) => piece(a.slug, a.ci)),
  skin: l.skin, hair: "#1b1511", width: 1, height: 1,
});

/** z position over a model's 0..1 walk: strides in, holds a pose, then walks out past the camera. */
function walkZ(t: number) {
  if (t < 0.55) return -17 + (t / 0.55) * 15;
  if (t < 0.78) return -2 + ((t - 0.55) / 0.23) * 1.0;
  return -1 + ((t - 0.78) / 0.22) * 4.5;
}

function Model({ look, i, progress }: { look: Look; i: number; progress: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const outfit = useMemo(() => outfitOf(look), [look]);
  useFrame(() => {
    const m = g.current;
    if (!m) return;
    const s = progress.current * (LOOKS.length + 0.6) - i;
    const t = Math.min(1, Math.max(0, s / 1.7));
    m.visible = t > 0 && t < 1;
    if (!m.visible) return;
    const z = walkZ(t);
    const moving = t < 0.55 || t > 0.78;
    const out = Math.max(0, (t - 0.78) / 0.22);
    m.position.set(Math.sin(t * 7 + i) * 0.22 + (i % 2 ? 1 : -1) * out * out * 8, moving ? Math.abs(Math.sin(z * 1.5)) * 0.07 : 0, z);
    m.rotation.set(0, Math.sin(z * 0.75) * 0.1, Math.sin(z * 0.75) * 0.025);
  });
  return <group ref={g} visible={false}><Figure o={outfit} /></group>;
}

function Backdrop() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 1024, 512); gr.addColorStop(0, "#8d9097"); gr.addColorStop(0.45, "#f4f5f7"); gr.addColorStop(1, "#8d9097");
    g.fillStyle = gr; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "400 380px Georgia, 'Times New Roman', serif"; g.fillText("K", 300, 270);
    g.font = "italic 230px Georgia, serif"; g.fillText("&", 520, 300);
    g.font = "400 380px Georgia, serif"; g.fillText("F", 740, 270);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  return (
    <group position={[0, 1.2, -27]}>
      <mesh position={[0, 0, -0.1]}><planeGeometry args={[60, 24]} /><meshStandardMaterial color="#09090b" roughness={1} fog={false} /></mesh>
      <mesh><planeGeometry args={[22, 11]} /><meshBasicMaterial map={tex} transparent toneMapped={false} opacity={0.9} fog={false} /></mesh>
    </group>
  );
}

function Stage({ progress }: { progress: React.MutableRefObject<number> }) {
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    s.camera.position.x = Math.sin(t * 0.25) * 0.6;
    s.camera.position.y = -0.5 + Math.sin(t * 0.4) * 0.08;
    const asp = s.size.width / s.size.height;
    s.camera.position.z = (asp < 0.8 ? 17 : asp < 1.2 ? 14 : 12) - progress.current * 1.5;
    s.camera.lookAt(0, -0.9, -6);
  });
  return (
    <>
      <Backdrop />
      {/* runway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, -8]}><planeGeometry args={[7, 50]} /><meshStandardMaterial color="#1a1a1f" roughness={0.2} metalness={0.9} envMapIntensity={1.6} /></mesh>
      {Array.from({ length: 24 }).map((_, i) => (
        <group key={i}>
          <mesh position={[-3.5, FLOOR + 0.02, 10 - i * 2.2]}><boxGeometry args={[0.06, 0.03, 1.2]} /><meshBasicMaterial color="#d8dae0" /></mesh>
          <mesh position={[3.5, FLOOR + 0.02, 10 - i * 2.2]}><boxGeometry args={[0.06, 0.03, 1.2]} /><meshBasicMaterial color="#d8dae0" /></mesh>
        </group>
      ))}
      {[-18, -11, -4, 3, 9].map((z) => <pointLight key={z} position={[0, 5, z]} intensity={95} distance={18} decay={1.5} color="#ffffff" />)}
      <pointLight position={[-6, 1, -2]} intensity={40} distance={14} color="#aab6ff" />
      <pointLight position={[6, 1, -2]} intensity={30} distance={14} color="#ffc9c0" />
      {LOOKS.map((l, i) => <Model key={l.title} look={l} i={i} progress={progress} />)}
    </>
  );
}

export default function ShowScene({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.4]} camera={{ fov: 38, position: [0, -0.5, 12] }} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}>
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 20, 48]} />
      <ambientLight intensity={0.45} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={4} position={[0, 7, 0]} scale={[12, 6, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[-7, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 5, 1]} color="#cfd6ff" />
      </Environment>
      <Particles count={180} />
      <Suspense fallback={null}><Stage progress={progress} /></Suspense>
    </Canvas>
  );
}
