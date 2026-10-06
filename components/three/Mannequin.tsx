"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { limb, loft, mirror, prof } from "./Apparel";

const V = THREE.Vector3;

/** Stylised human figure sized to the K&F garment space (shoulders y≈1.2, feet y≈-3.8). */
export default function Mannequin({ skin = "#c99a7a", hair = "#1b1511" }: { skin?: string; hair?: string }) {
  const geo = useMemo(() => {
    const t = prof([[1.3, 0.3, 0.2], [1.2, 0.5, 0.25], [0.9, 0.55, 0.28], [0.2, 0.54, 0.27], [-0.4, 0.51, 0.26], [-0.7, 0.5, 0.25]]);
    const torso = loft(t.map((q) => new V(0, q.x, 0)), t.map((q) => q.y), t.map((q) => q.z), { seg: 40, fold: 0, cap: "end" });
    const arm = limb([[0.46, 0.98, 0, 0.15], [0.84, 0.7, 0.02, 0.135], [1.02, 0.12, 0.1, 0.115], [1.07, -0.6, 0.2, 0.095], [1.09, -1.0, 0.24, 0.08]], { fold: 0, cap: "end", seg: 24 });
    const leg = limb([[0.3, -0.5, 0, 0.3, 0.27], [0.31, -1.5, 0, 0.23, 0.21], [0.31, -2.8, 0, 0.16, 0.15], [0.31, -3.68, 0.02, 0.13, 0.13]], { fold: 0, cap: "both", seg: 24 });
    return { torso, arm, armL: mirror(arm), leg, legL: mirror(leg) };
  }, []);
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: skin, roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color(skin).lerp(new THREE.Color("#fff"), 0.3), sheenRoughness: 0.5 }), [skin]);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: hair, roughness: 0.7 }), [hair]);
  const shoe = useMemo(() => new THREE.MeshStandardMaterial({ color: "#efece6", roughness: 0.5 }), []);
  const sole = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a2a2d", roughness: 0.8 }), []);

  return (
    <group>
      <mesh geometry={geo.torso} material={skinMat} castShadow />
      <mesh geometry={geo.arm} material={skinMat} castShadow /><mesh geometry={geo.armL} material={skinMat} castShadow />
      <mesh geometry={geo.leg} material={skinMat} /><mesh geometry={geo.legL} material={skinMat} />
      {/* neck + head */}
      <mesh position={[0, 1.46, 0.0]} material={skinMat}><cylinderGeometry args={[0.105, 0.125, 0.4, 24]} /></mesh>
      <mesh position={[0, 1.86, 0.02]} scale={[0.9, 1.14, 1]} material={skinMat} castShadow><sphereGeometry args={[0.33, 40, 32]} /></mesh>
      <mesh position={[0, 1.82, 0.34]} scale={[1, 1.2, 0.8]} material={skinMat}><sphereGeometry args={[0.04, 16, 12]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.3, 1.84, 0.02]} scale={[0.4, 1, 0.7]} material={skinMat}><sphereGeometry args={[0.07, 16, 12]} /></mesh>)}
      <mesh position={[0, 1.96, -0.02]} rotation={[-0.25, 0, 0]} scale={[0.93, 1.1, 1.04]} material={hairMat}><sphereGeometry args={[0.34, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.5]} /></mesh>
      {/* hands */}
      {[-1, 1].map((s) => <mesh key={s} position={[s * 1.1, -1.2, 0.27]} scale={[0.085, 0.16, 0.055]} material={skinMat} castShadow><sphereGeometry args={[1, 20, 16]} /></mesh>)}
      {/* sneakers */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.31, -3.84, 0.14]}>
          <RoundedBox args={[0.34, 0.2, 0.78]} radius={0.08} smoothness={4} material={shoe} castShadow />
          <RoundedBox args={[0.36, 0.06, 0.8]} radius={0.03} smoothness={3} position={[0, -0.11, 0]} material={sole} />
        </group>
      ))}
    </group>
  );
}
