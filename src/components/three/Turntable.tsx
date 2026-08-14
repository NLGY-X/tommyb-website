"use client";

import { useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import {
  FINISH_PRESETS,
  TRIM_PRESETS,
  VINYL_PRESET,
  type Finish,
} from "./finishes";

export interface TurntableProps {
  spinning?: boolean;
  finish?: Finish;
  labelColor?: string;
}

/* Deck footprint approx 1.4 wide x 0.14 tall x 1.1 deep, origin at the base. */
const PLATTER_X = -0.18;
const PLATTER_Z = -0.02;
const GROOVE_RADII = [0.16, 0.21, 0.26, 0.31, 0.36];
const STROBE_DOTS = 16;

/* Tonearm: pivot sits back right, headshell lands over the record surface. */
const PIVOT: [number, number, number] = [0.52, 0.21, -0.33];
const ARM_DX = 0.08 - PIVOT[0];
const ARM_DZ = 0.2 - PIVOT[2];
const ARM_LEN = Math.hypot(ARM_DX, ARM_DZ);
const ARM_YAW = -Math.atan2(ARM_DZ, ARM_DX);

export function Turntable({
  spinning = true,
  finish = "grime",
  labelColor = "#c4ff00",
  ...props
}: TurntableProps & ThreeElements["group"]) {
  const spin = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!spinning || !spin.current) return;
    spin.current.rotation.y -= Math.min(delta, 0.05) * 1.2;
  });

  const shell = FINISH_PRESETS[finish];
  const trim = TRIM_PRESETS[finish];
  const platter =
    finish === "chrome"
      ? { color: "#cfd8e4", metalness: 1, roughness: 0.18 }
      : { color: "#1d1d1f", metalness: 0.7, roughness: 0.42 };

  return (
    <group {...props}>
      {/* plinth with a slightly smaller top plate for a bevelled look */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.12, 1.1]} />
        <meshStandardMaterial
          color={shell.color}
          metalness={shell.metalness}
          roughness={shell.roughness}
        />
      </mesh>
      <mesh position={[0, 0.13, 0]} receiveShadow>
        <boxGeometry args={[1.34, 0.02, 1.04]} />
        <meshStandardMaterial
          color={trim.color}
          metalness={trim.metalness}
          roughness={trim.roughness}
        />
      </mesh>

      {/* platter plus vinyl: the only spinning group */}
      <group ref={spin} position={[PLATTER_X, 0.14, PLATTER_Z]}>
        <mesh position={[0, 0.015, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.03, 32]} />
          <meshStandardMaterial
            color={platter.color}
            metalness={platter.metalness}
            roughness={platter.roughness}
          />
        </mesh>
        {Array.from({ length: STROBE_DOTS }, (_, i) => {
          const angle = (i / STROBE_DOTS) * Math.PI * 2;
          return (
            <mesh
              key={`dot-${i}`}
              position={[
                Math.cos(angle) * 0.425,
                0.015,
                Math.sin(angle) * 0.425,
              ]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.008, 0.014, 0.02]} />
              <meshStandardMaterial
                color="#3a0f0d"
                emissive="#ff4a3d"
                emissiveIntensity={0.7}
              />
            </mesh>
          );
        })}
        <mesh position={[0, 0.034, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.008, 32]} />
          <meshStandardMaterial
            color={VINYL_PRESET.color}
            metalness={VINYL_PRESET.metalness}
            roughness={VINYL_PRESET.roughness}
          />
        </mesh>
        {GROOVE_RADII.map((r) => (
          <mesh
            key={`groove-${r}`}
            position={[0, 0.0385, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[r, 0.0018, 6, 48]} />
            <meshStandardMaterial color="#000000" metalness={0.2} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.0395, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.006, 32]} />
          <meshStandardMaterial
            color={labelColor}
            emissive={labelColor}
            emissiveIntensity={0.35}
            metalness={0}
            roughness={0.6}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.03, 12]} />
          <meshStandardMaterial color="#c8ccd2" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* tonearm assembly */}
      <mesh position={[0.52, 0.16, -0.33]} castShadow>
        <cylinderGeometry args={[0.065, 0.075, 0.04, 24]} />
        <meshStandardMaterial
          color={trim.color}
          metalness={trim.metalness}
          roughness={trim.roughness}
        />
      </mesh>
      <mesh position={[0.52, 0.185, -0.33]}>
        <cylinderGeometry args={[0.02, 0.02, 0.09, 16]} />
        <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.35} />
      </mesh>
      <group position={PIVOT} rotation={[0, ARM_YAW, -0.015]}>
        <mesh position={[ARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, ARM_LEN, 16]} />
          <meshStandardMaterial
            color={finish === "chrome" ? "#dbe3ec" : "#9aa0a8"}
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[ARM_LEN, -0.012, 0]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.07, 0.02, 0.035]} />
          <meshStandardMaterial color="#141414" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[-0.09, 0.004, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 24]} />
          <meshStandardMaterial color="#33363c" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* start/stop button, front left */}
      <mesh position={[-0.58, 0.15, 0.44]}>
        <boxGeometry args={[0.09, 0.02, 0.09]} />
        <meshStandardMaterial
          color="#0c2410"
          emissive="#2bff5e"
          emissiveIntensity={1.6}
          metalness={0}
          roughness={0.4}
        />
      </mesh>

      {/* pitch fader, right side */}
      <mesh position={[0.58, 0.142, -0.02]}>
        <boxGeometry args={[0.035, 0.004, 0.42]} />
        <meshStandardMaterial color="#050505" metalness={0} roughness={1} />
      </mesh>
      <mesh position={[0.58, 0.152, 0.08]}>
        <boxGeometry args={[0.07, 0.02, 0.05]} />
        <meshStandardMaterial color="#191a1c" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}
