"use client";

import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { FINISH_PRESETS, TRIM_PRESETS, tintHex, type Finish } from "./finishes";

export interface SpeakerCabinetProps {
  finish?: Finish;
  tint?: string;
}

/*
 * One driver assembly mounted on a front face: chunky rim torus, a cone that
 * dives back toward the mounting plane, and a dust cap near the apex. The
 * group origin sits ON the mounting face, the assembly stands proud of it so
 * the cone interior stays visible and catches light.
 */
export function SpeakerDriver({
  radius,
  position,
}: {
  radius: number;
  position: [number, number, number];
}) {
  const depth = radius * 0.35;
  return (
    <group position={position}>
      <mesh position={[0, 0, depth]}>
        <torusGeometry args={[radius, radius * 0.09, 10, 32]} />
        <meshStandardMaterial color="#232323" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[radius * 0.94, depth, 32, 1, true]} />
        <meshStandardMaterial
          color="#161616"
          metalness={0.1}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, depth * 0.35]}>
        <sphereGeometry args={[radius * 0.2, 16, 12]} />
        <meshStandardMaterial color="#0e0e0e" metalness={0.35} roughness={0.45} />
      </mesh>
    </group>
  );
}

/*
 * One PA cabinet, approx 1.0 wide x 1.2 tall x 0.9 deep, origin at the base.
 * Box shell with a slightly proud front frame for a bevelled look, a large
 * low driver, a smaller top driver and two bass ports.
 */
export function SpeakerCabinet({
  finish = "grime",
  tint,
  ...props
}: SpeakerCabinetProps & ThreeElements["group"]) {
  const preset = FINISH_PRESETS[finish];
  const trim = TRIM_PRESETS[finish];
  const shellColor =
    finish === "grime" ? tintHex(preset.color, tint, 0.12) : preset.color;

  return (
    <group {...props}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.2, 0.86]} />
        <meshStandardMaterial
          color={shellColor}
          metalness={preset.metalness}
          roughness={preset.roughness}
        />
      </mesh>
      <mesh position={[0, 0.6, 0.455]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 1.16, 0.05]} />
        <meshStandardMaterial
          color={trim.color}
          metalness={trim.metalness}
          roughness={trim.roughness}
        />
      </mesh>
      <SpeakerDriver radius={0.27} position={[0, 0.42, 0.48]} />
      <SpeakerDriver radius={0.14} position={[0, 0.92, 0.48]} />
      <mesh position={[-0.3, 0.14, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.06, 24]} />
        <meshStandardMaterial color="#050505" metalness={0} roughness={1} />
      </mesh>
      <mesh position={[0.3, 0.14, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.06, 24]} />
        <meshStandardMaterial color="#050505" metalness={0} roughness={1} />
      </mesh>
    </group>
  );
}
