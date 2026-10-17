"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Loopback terry: rows of small loops over a fine pile. Returns [bump, albedo] canvases' textures. */
function loopTextures() {
  const S = 1024, N = 28, cell = S / N;
  const mk = () => { const c = document.createElement("canvas"); c.width = c.height = S; return c; };
  const bump = mk(), alb = mk();
  const b = bump.getContext("2d")!, a = alb.getContext("2d")!;
  b.fillStyle = "#3a3a3a"; b.fillRect(0, 0, S, S);
  a.fillStyle = "#c4c4c4"; a.fillRect(0, 0, S, S);
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let row = 0; row < N; row++) for (let col = 0; col < N + 1; col++) {
    const x = col * cell + (row % 2 ? cell / 2 : 0) + (rnd() - 0.5) * 4, y = row * cell + cell / 2 + (rnd() - 0.5) * 4;
    for (const [g, light, dark] of [[b, "#f2f2f2", "#5a5a5a"], [a, "#ffffff", "#9a9a9a"]] as const) {
      const gr = g.createRadialGradient(x, y - cell * 0.1, 2, x, y, cell * 0.48);
      gr.addColorStop(0, light); gr.addColorStop(0.7, dark); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, cell * 0.42, cell * 0.5, (rnd() - 0.5) * 0.6, 0, Math.PI * 2); g.fill();
    }
  }
  // fine fibres on top
  for (let i = 0; i < 60000; i++) { const v = 70 + rnd() * 160; b.fillStyle = `rgba(${v},${v},${v},.4)`; b.save(); b.translate(rnd() * S, rnd() * S); b.rotate(rnd() * Math.PI); b.fillRect(0, 0, 1, 3 + rnd() * 5); b.restore(); }
  for (let i = 0; i < 30000; i++) { const v = 120 + rnd() * 110; a.fillStyle = `rgba(${v},${v},${v},.25)`; a.fillRect(rnd() * S, rnd() * S, 1, 2 + rnd() * 3); }
  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 6); t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  return [tex(bump, false), tex(alb, true)] as const;
}

const TILT = -0.35;
const surf = (x: number, y: number) => 0.22 * Math.sin(x * 1.25 + y * 0.35) + 0.07 * Math.sin(y * 2.6 - x * 0.7) - 0.01 * x * x;
const ROT = new THREE.Euler(TILT, 0, 0);
const OBLIQUE = new THREE.Vector3(0, -0.55, 0.84).normalize();
const FACE = new THREE.Vector3(0, 0, 1).applyEuler(ROT);

function Cloth({ progress, color, sheen }: { progress: React.MutableRefObject<number>; color: string; sheen: string }) {
  const [bump, alb] = useMemo(loopTextures, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(6, 4, 220, 150);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, surf(x, y));
    }
    g.computeVertexNormals(); return g;
  }, []);
  const light = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const want = useMemo(() => new THREE.Vector3(), []);
  const fine = useMemo(() => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches, []);
  useFrame((s, d) => {
    const p = progress.current, t = s.clock.elapsedTime, k = Math.min(1, d * 2.4);
    const e = p * p * (3 - 2 * p);
    // dolly from the whole draped swatch down to the loops
    const dist = THREE.MathUtils.lerp(5.4, 0.62, e);
    const lx0 = THREE.MathUtils.lerp(0, 0.4, e), ly0 = THREE.MathUtils.lerp(-0.1, 0.2, e);
    target.set(lx0, ly0, surf(lx0, ly0)).applyEuler(ROT);
    dir.copy(OBLIQUE).lerp(FACE, e * 0.85).normalize();
    want.copy(target).addScaledVector(dir, dist);
    want.x += s.pointer.x * 0.05 * dist;
    s.camera.position.lerp(want, k);
    s.camera.lookAt(target);
    if (light.current) {
      const lx = fine ? s.pointer.x : Math.sin(t * 0.6), ly = fine ? s.pointer.y : Math.cos(t * 0.45) * 0.6;
      light.current.position.copy(target).addScaledVector(FACE, dist * 0.45 + 0.06);
      light.current.position.x += lx * dist * 0.9; light.current.position.y += ly * dist * 0.7;
      light.current.distance = dist * 4;
      // keep the light's effect on the cloth constant as the camera (and light) close in
      light.current.intensity = 1.25 * Math.pow(dist, 1.2);
    }
  });
  return (
    <>
      <pointLight ref={light} intensity={6} decay={1.2} color="#fff6ea" />
      <mesh geometry={geo} rotation-x={TILT}>
        <meshPhysicalMaterial color={color} map={alb} bumpMap={bump} bumpScale={1.6} roughness={1} sheen={0.6} sheenRoughness={0.7} sheenColor={sheen} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

export default function FabricScene({ progress, color, sheen }: { progress: React.MutableRefObject<number>; color: string; sheen: string }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ fov: 34, position: [0, -2.8, 4.2], near: 0.01 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
      <color attach="background" args={["#0a0a0b"]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[-3, 2, 3]} intensity={0.7} />
      <Cloth progress={progress} color={color} sheen={sheen} />
    </Canvas>
  );
}
