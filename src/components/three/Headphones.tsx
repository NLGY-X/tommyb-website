"use client";

import type { ThreeElements } from "@react-three/fiber";
import { FINISH_PRESETS, TRIM_PRESETS, type Finish } from "./finishes";

export interface HeadphonesProps {
  finish?: Finish;
}

/*
 * DJ headphones approx 0.5 tall, resting upright on the cups, origin at the
 * floor. Half torus headband, two cylinder ear cups with cushion tori, thin
 * yokes joining cups to band.
 */
export function Headphones({
  finish = "grime",
  ...props
}: HeadphonesProps & ThreeElements["group"]) {
  const shell = FINISH_PRESETS[finish];
  const trim = TRIM_PRESETS[finish];

  return (
    <group {...props}>
      {/* headband: upper half torus in the XY plane */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <torusGeometry args={[0.3, 0.026, 12, 32, Math.PI]} />
        <meshStandardMaterial
          color={shell.color}
          metalness={shell.metalness}
          roughness={shell.roughness}
        />
      </mesh>
      {/* headband top pad */}
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[0.18, 0.035, 0.06]} />
        <meshStandardMaterial color="#141414" metalness={0} roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.3, 0.14, 0]}>
          {/* yoke hugging the lower band */}
          <mesh position={[side * 0.012, 0.09, 0]}>
            <boxGeometry args={[0.02, 0.16, 0.04]} />
            <meshStandardMaterial
              color={trim.color}
              metalness={trim.metalness}
              roughness={trim.roughness}
            />
          </mesh>
          {/* ear cup */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.135, 0.135, 0.07, 32]} />
            <meshStandardMaterial
              color={shell.color}
              metalness={shell.metalness}
              roughness={shell.roughness}
            />
          </mesh>
          {/* cushion on the inner face */}
          <mesh position={[side * -0.045, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.1, 0.03, 12, 24]} />
            <meshStandardMaterial color="#101010" metalness={0} roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
