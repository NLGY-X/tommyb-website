"use client";

import { useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { VINYL_PRESET } from "./finishes";

export interface VinylRecordProps {
  labelColor: string;
  spinning?: boolean;
  tilt?: number;
}

const GROOVE_RADII = [0.17, 0.22, 0.27, 0.32, 0.37];

/*
 * A standalone record standing upright facing +z, leaning back by tilt
 * radians, slowly spinning around its own axis. The label cylinder is
 * slightly thicker than the disc so it shows on both faces.
 */
export function VinylRecord({
  labelColor,
  spinning = true,
  tilt = 0,
  ...props
}: VinylRecordProps & ThreeElements["group"]) {
  const spin = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!spinning || !spin.current) return;
    spin.current.rotation.y -= Math.min(delta, 0.05) * 0.55;
  });

  return (
    <group {...props}>
      <group rotation={[Math.PI / 2 - tilt, 0, 0]}>
        <group ref={spin}>
          <mesh castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.01, 32]} />
            <meshStandardMaterial
              color={VINYL_PRESET.color}
              metalness={VINYL_PRESET.metalness}
              roughness={VINYL_PRESET.roughness}
            />
          </mesh>
          {GROOVE_RADII.map((r) => (
            <mesh
              key={`groove-${r}`}
              position={[0, 0.0052, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[r, 0.0018, 6, 48]} />
              <meshStandardMaterial
                color="#000000"
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>
          ))}
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.016, 32]} />
            <meshStandardMaterial
              color={labelColor}
              emissive={labelColor}
              emissiveIntensity={0.35}
              metalness={0}
              roughness={0.6}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.006, 0.006, 0.02, 12]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.1} roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
