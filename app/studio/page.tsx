"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Garment3D from "@/components/three/Garment3D";
import type { Garment, Material } from "@/lib/products";

/**
 * Offline render stage: /studio?garment=hoodie&color=16161a&material=fleece&view=front
 * scripts/render.mjs screenshots this page to produce the site's product photography.
 */
const DIST: Record<Garment, number> = { hoodie: 9.2, tee: 8.2, jacket: 9.8, bomber: 8.6, pants: 10.4, cap: 7.2, beanie: 6.6, tote: 8.6, sunglasses: 8.4, belt: 8.4, scarf: 10 };
const CENTER: Record<Garment, number> = { hoodie: -0.05, tee: 0.1, jacket: 0.05, bomber: 0.15, pants: -0.1, cap: 0.25, beanie: 0.25, tote: 0, sunglasses: 0, belt: 0, scarf: 0 };
const GROUND: Partial<Record<Garment, number>> = { cap: -0.62, pants: -1.75, beanie: -0.62, tote: -0.98, sunglasses: -0.5, belt: -1.3, scarf: -1.5 };
/** close-up target + distance for accessories */
const DET: Partial<Record<Garment, { t: number[]; d: number }>> = { beanie: { t: [0, -0.15, 0.9], d: 2.6 }, tote: { t: [0, 0, 0.3], d: 3.2 }, sunglasses: { t: [0.62, 0, 0.1], d: 2.2 }, belt: { t: [0, 1.1, 0.03], d: 2.2 }, scarf: { t: [0, -1.05, 0.25], d: 2.8 } };

function Rig({ view, garment }: { view: string; garment: Garment }) {
  const { camera } = useThree();
  let frames = 0;
  useFrame(() => {
    const d = DIST[garment], cy = CENTER[garment];
    const dt = DET[garment];
    if (dt && view === "detail") { camera.position.set(dt.t[0] - 0.2, dt.t[1] + 0.25, dt.t[2] + dt.d); camera.lookAt(dt.t[0], dt.t[1], dt.t[2]); }
    else if (dt && view === "fabric") { camera.position.set(dt.t[0], dt.t[1] + 0.05, dt.t[2] + dt.d * 0.4); camera.lookAt(dt.t[0], dt.t[1], dt.t[2]); }
    else if (view === "detail") { camera.position.set(-0.4, cy + 0.7, d * 0.28); camera.lookAt(-0.2, cy + 0.55, 0.3); }
    else if (view === "fabric") { camera.position.set(0.15, cy + 0.2, d * 0.11); camera.lookAt(0.1, cy + 0.15, 0.35); }
    else if (view === "wide") { camera.position.set(0.2, cy + 0.1, d * 0.78); camera.lookAt(0.2, cy, 0); }
    else if (view === "lifestyle") { camera.position.set(-1.2, cy + 0.2, d * 1.15); camera.lookAt(0.9, cy, 0); }
    else if (view === "model") { camera.position.set(0.0, cy - 0.5, d * 0.92); camera.lookAt(0, cy + 0.05, 0); }
    else if (garment === "cap") { camera.position.set(0, cy + 1.7, d); camera.lookAt(0, cy + 0.15, 0); }
    else { camera.position.set(0, cy + 0.15, d); camera.lookAt(0, cy, 0); }
    if (++frames === 6) (window as any).__ready = true;
  });
  return null;
}

function Stage() {
  const q = useSearchParams();
  const garment = (q.get("garment") ?? "hoodie") as Garment;
  const color = "#" + (q.get("color") ?? "16161a");
  const material = (q.get("material") ?? "fleece") as Material;
  const view = q.get("view") ?? "front";
  const lum = new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 }).l;
  const rotY = view === "back" ? Math.PI : view === "side" ? (garment === "belt" ? 0.9 : Math.PI / 2) : view === "model" ? (garment === "sunglasses" ? 0.28 : 0.55) : view === "wide" ? -0.45 : view === "detail" ? 0.12 : view === "lifestyle" ? -0.5 : 0;
  const bg = lum > 0.55 ? "radial-gradient(ellipse at 50% 38%, #4a4a50 0%, #26262a 55%, #101012 100%)"
    : view === "model" || view === "lifestyle" || view === "wide" ? "radial-gradient(ellipse at 60% 30%, #3b3238 0%, #1d1a1d 55%, #0b0a0c 100%)"
      : "radial-gradient(ellipse at 50% 38%, #5a5a62 0%, #34343a 50%, #141416 100%)";
  useEffect(() => { document.body.style.background = "#000"; }, []);
  return (
    <div style={{ width: view === "wide" ? 1600 : 900, height: view === "wide" ? 900 : 1125, position: "relative", background: bg, overflow: "hidden" }}>
      {view === "wide" && <div style={{ position: "absolute", left: 40, top: 120, fontFamily: "Georgia, serif", fontSize: 760, color: "rgba(255,255,255,.05)", letterSpacing: "-0.05em", lineHeight: 1 }}>K&amp;F</div>}
      {view === "wide" && <div style={{ position: "absolute", left: 70, bottom: 60, fontFamily: "Inter, sans-serif", fontSize: 20, letterSpacing: ".4em", color: "rgba(255,255,255,.5)" }}>K&amp;F / THE NEW FORM / 2027</div>}
      {view === "lifestyle" && <div style={{ position: "absolute", left: -40, top: 60, fontFamily: "Georgia, serif", fontSize: 560, color: "rgba(255,255,255,.05)", letterSpacing: "-0.05em", lineHeight: 1 }}>K&amp;F</div>}
      {view === "lifestyle" && <div style={{ position: "absolute", left: 50, bottom: 60, fontFamily: "Inter, sans-serif", fontSize: 18, letterSpacing: ".4em", color: "rgba(255,255,255,.5)" }}>K&amp;F / 2027</div>}
      <Canvas style={{ position: "absolute", inset: 0 }} gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: lum > 0.55 ? 0.62 : 1.15 }} dpr={1} camera={{ fov: view === "detail" || view === "fabric" ? 34 : 28, near: 0.05, far: 60 }} shadows>
        <ambientLight intensity={0.42} />
        <spotLight position={[4, 7, 6]} angle={0.5} penumbra={1} intensity={view === "model" || view === "lifestyle" ? 320 : 220} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
        <spotLight position={[-6, 3, -4]} angle={0.7} penumbra={1} intensity={view === "model" ? 520 : 170} color={view === "model" ? "#ffb8c8" : "#c8d2ff"} />
        <spotLight position={[0, 4, -7]} angle={0.8} penumbra={1} intensity={180} color="#ffffff" />
        <Environment resolution={512}>
          <Lightformer form="rect" intensity={7} position={[0, 5, 3]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={4} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 5, 1]} />
          <Lightformer form="rect" intensity={4} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 5, 1]} color="#dfe5ff" />
          <Lightformer form="ring" intensity={3} position={[0, 2, -6]} scale={6} />
        </Environment>
        <group rotation={[0, rotY, 0]} position={view === "lifestyle" ? [1.2, 0, 0] : view === "wide" ? [1.9, 0, 0] : [0, 0, 0]}>
          <Garment3D garment={garment} color={color} material={material} stitching={view !== "fabric"} />
        </group>
        <ContactShadows position={[0, GROUND[garment] ?? -1.5, 0]} opacity={0.75} scale={12} blur={2.6} far={5} resolution={1024} />
        <Rig view={view} garment={garment} />
      </Canvas>
    </div>
  );
}

export default function Page() { return <Suspense fallback={null}><Stage /></Suspense>; }
