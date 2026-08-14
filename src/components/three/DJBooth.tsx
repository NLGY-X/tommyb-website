"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/components/shared/seededRandom";
import { Turntable } from "./Turntable";
import { FINISH_PRESETS, TRIM_PRESETS, type Finish } from "./finishes";

export interface DJBoothProps {
  finish?: Finish;
  labelColor?: string;
  reduced?: boolean;
}

const LED_ROWS = 8;
const LED_GREEN_ROWS = 5;
const BEAT = Math.PI * (140 / 60);

/* Stepped meter level 1..8, driven by elapsed time and seeded phases. */
function meterLevel(t: number, phaseA: number, phaseB: number): number {
  const pulse = Math.abs(Math.sin(t * BEAT + phaseA));
  const wobble = 0.5 + 0.5 * Math.sin(t * 2.3 + phaseB) * Math.sin(t * 5.1 + phaseA);
  const v = 0.25 + 0.55 * pulse + 0.3 * wobble;
  return Math.max(1, Math.min(LED_ROWS, Math.round(v * LED_ROWS)));
}

/*
 * The centrepiece: table on two side panels, two spinning Turntables, a mixer
 * between them with faders, rotary knobs, crossfader and two animated VU LED
 * strips, plus a front panel with a subtly glowing logo area. Origin at the
 * floor under the table center.
 */
export function DJBooth({
  finish = "grime",
  labelColor = "#c4ff00",
  reduced = false,
  ...props
}: DJBoothProps & ThreeElements["group"]) {
  const ledMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  const phases = useMemo(() => {
    const rand = seededRandom(8661);
    return [
      rand() * Math.PI * 2,
      rand() * Math.PI * 2,
      rand() * Math.PI * 2,
      rand() * Math.PI * 2,
    ] as const;
  }, []);

  const faderOffsets = useMemo(() => {
    const rand = seededRandom(4517);
    return [0, 1, 2].map(() => (rand() - 0.5) * 0.14);
  }, []);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    for (let col = 0; col < 2; col++) {
      const level = meterLevel(t, phases[col * 2], phases[col * 2 + 1]);
      for (let row = 0; row < LED_ROWS; row++) {
        const mat = ledMats.current[col * LED_ROWS + row];
        if (mat) mat.emissiveIntensity = row < level ? 2.4 : 0.12;
      }
    }
  });

  const shell = FINISH_PRESETS[finish];
  const trim = TRIM_PRESETS[finish];

  return (
    <group {...props}>
      {/* table top on two side panels */}
      <mesh position={[0, 0.96, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 1.0]} />
        <meshStandardMaterial
          color={shell.color}
          metalness={shell.metalness}
          roughness={shell.roughness}
        />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={`leg-${x}`} position={[x, 0.46, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.92, 0.95]} />
          <meshStandardMaterial
            color={shell.color}
            metalness={shell.metalness}
            roughness={shell.roughness}
          />
        </mesh>
      ))}

      {/* front panel with logo area */}
      <mesh position={[0, 0.62, 0.505]} castShadow>
        <boxGeometry args={[3.0, 0.6, 0.03]} />
        <meshStandardMaterial
          color={trim.color}
          metalness={trim.metalness}
          roughness={trim.roughness}
        />
      </mesh>
      <mesh position={[0, 0.66, 0.525]}>
        <boxGeometry args={[1.0, 0.24, 0.012]} />
        <meshStandardMaterial
          color="#101010"
          emissive={labelColor}
          emissiveIntensity={0.35}
          metalness={0}
          roughness={0.7}
        />
      </mesh>

      {/* decks */}
      <Turntable
        position={[-1.05, 1.0, 0]}
        spinning={!reduced}
        finish={finish}
        labelColor={labelColor}
      />
      <Turntable
        position={[1.05, 1.0, 0]}
        spinning={!reduced}
        finish={finish}
        labelColor={labelColor}
      />

      {/* mixer body */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.1, 0.9]} />
        <meshStandardMaterial
          color={trim.color}
          metalness={trim.metalness}
          roughness={trim.roughness}
        />
      </mesh>

      {/* channel fader slots and knobs */}
      {[-0.18, 0, 0.18].map((x, i) => (
        <group key={`fader-${x}`}>
          <mesh position={[x, 1.101, 0.17]}>
            <boxGeometry args={[0.016, 0.004, 0.24]} />
            <meshStandardMaterial color="#050505" metalness={0} roughness={1} />
          </mesh>
          <mesh position={[x, 1.112, 0.17 + faderOffsets[i]]}>
            <boxGeometry args={[0.055, 0.022, 0.035]} />
            <meshStandardMaterial color="#1c1d20" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* rotary knobs, 2 rows of 3 */}
      {[-0.18, 0, 0.18].map((x) =>
        [-0.06, -0.18].map((z) => (
          <mesh key={`knob-${x}-${z}`} position={[x, 1.117, z]}>
            <cylinderGeometry args={[0.022, 0.022, 0.035, 20]} />
            <meshStandardMaterial color="#1c1d20" metalness={0.6} roughness={0.4} />
          </mesh>
        )),
      )}

      {/* crossfader */}
      <mesh position={[0, 1.101, 0.37]}>
        <boxGeometry args={[0.2, 0.004, 0.016]} />
        <meshStandardMaterial color="#050505" metalness={0} roughness={1} />
      </mesh>
      <mesh position={[0.03, 1.111, 0.37]}>
        <boxGeometry args={[0.035, 0.022, 0.05]} />
        <meshStandardMaterial color="#1c1d20" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* raised back panel carrying the VU strips */}
      <mesh position={[0, 1.2, -0.42]} castShadow>
        <boxGeometry args={[0.68, 0.2, 0.035]} />
        <meshStandardMaterial
          color={trim.color}
          metalness={trim.metalness}
          roughness={trim.roughness}
        />
      </mesh>
      {[0, 1].map((col) =>
        Array.from({ length: LED_ROWS }, (_, row) => (
          <mesh
            key={`led-${col}-${row}`}
            position={[col === 0 ? -0.07 : 0.07, 1.125 + row * 0.021, -0.401]}
          >
            <planeGeometry args={[0.05, 0.014]} />
            <meshStandardMaterial
              ref={(el) => {
                ledMats.current[col * LED_ROWS + row] = el;
              }}
              color={row < LED_GREEN_ROWS ? "#0d2f12" : "#33090c"}
              emissive={row < LED_GREEN_ROWS ? "#2bff5e" : "#ff2d3f"}
              emissiveIntensity={row < 4 ? 2.2 : 0.12}
            />
          </mesh>
        )),
      )}
    </group>
  );
}
