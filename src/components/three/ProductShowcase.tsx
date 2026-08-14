"use client";

import type { ThreeElements } from "@react-three/fiber";
import { Headphones } from "./Headphones";
import { VinylRecord } from "./VinylRecord";
import { type Finish } from "./finishes";

export interface ProductShowcaseProps {
  theme: "underground" | "bigroom";
  reduced?: boolean;
}

/*
 * Store page hero: a low pedestal with a themed rim glow, a leaning
 * VinylRecord slowly spinning on a small stand, and Headphones resting
 * beside it. Theme switches finish and label color.
 */
export function ProductShowcase({
  theme,
  reduced = false,
  ...props
}: ProductShowcaseProps & ThreeElements["group"]) {
  const finish: Finish = theme === "bigroom" ? "chrome" : "grime";
  const labelColor = theme === "bigroom" ? "#b08d57" : "#c4ff00";
  const pedestal =
    theme === "bigroom"
      ? { color: "#10151d", metalness: 0.7, roughness: 0.3 }
      : { color: "#1d1d1d", metalness: 0.2, roughness: 0.85 };

  return (
    <group {...props}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.02, 0.16, 32]} />
        <meshStandardMaterial
          color={pedestal.color}
          metalness={pedestal.metalness}
          roughness={pedestal.roughness}
        />
      </mesh>
      <mesh position={[0, 0.155, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.022, 8, 48]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={labelColor}
          emissiveIntensity={1.6}
        />
      </mesh>
      {/* small stand the record leans against */}
      <mesh position={[-0.12, 0.34, -0.3]} rotation={[-0.24, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.34, 0.04]} />
        <meshStandardMaterial color="#0f0f0f" metalness={0.3} roughness={0.8} />
      </mesh>
      <VinylRecord
        position={[-0.12, 0.575, -0.14]}
        rotation={[0, 0.12, 0]}
        tilt={0.24}
        labelColor={labelColor}
        spinning={!reduced}
      />
      <Headphones
        position={[0.42, 0.16, 0.26]}
        rotation={[0, -0.6, 0]}
        finish={finish}
      />
    </group>
  );
}
