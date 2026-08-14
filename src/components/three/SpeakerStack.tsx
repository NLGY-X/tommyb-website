"use client";

import { useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { seededRandom } from "@/components/shared/seededRandom";
import { SpeakerCabinet, SpeakerDriver } from "./SpeakerCabinet";
import { FINISH_PRESETS, TRIM_PRESETS, tintHex, type Finish } from "./finishes";

export interface SpeakerStackProps {
  columns?: number;
  rows?: number;
  finish?: Finish;
  tint?: string;
}

const CAB_SPACING_X = 1.04;
const CAB_SPACING_Y = 1.22;
const SUB_HEIGHT = 0.9;

/* Big bass bin for the base row: 1.2 x 0.9 x 1.1 with one huge driver. */
function ScoopSub({
  finish,
  tint,
  position,
  rotationY,
}: {
  finish: Finish;
  tint?: string;
  position: [number, number, number];
  rotationY: number;
}) {
  const preset = FINISH_PRESETS[finish];
  const trim = TRIM_PRESETS[finish];
  const shellColor =
    finish === "grime" ? tintHex(preset.color, tint, 0.12) : preset.color;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.9, 1.04]} />
        <meshStandardMaterial
          color={shellColor}
          metalness={preset.metalness}
          roughness={preset.roughness}
        />
      </mesh>
      <mesh position={[0, 0.45, 0.535]} castShadow receiveShadow>
        <boxGeometry args={[1.14, 0.84, 0.05]} />
        <meshStandardMaterial
          color={trim.color}
          metalness={trim.metalness}
          roughness={trim.roughness}
        />
      </mesh>
      <SpeakerDriver radius={0.32} position={[0, 0.45, 0.56]} />
    </group>
  );
}

/*
 * A wall of cabinets on top of two sub bins, origin at floor center.
 * Grime finish gets tiny seeded jitter per cabinet so the wall looks
 * hand stacked. Chrome is perfectly aligned.
 */
export function SpeakerStack({
  columns = 2,
  rows = 3,
  finish = "grime",
  tint,
  ...props
}: SpeakerStackProps & ThreeElements["group"]) {
  const layout = useMemo(() => {
    const rand = seededRandom(1201 + columns * 17 + rows * 29);
    const jitter = finish === "grime" ? 1 : 0;
    const cabs: {
      position: [number, number, number];
      rotY: number;
    }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        cabs.push({
          position: [
            (col - (columns - 1) / 2) * CAB_SPACING_X +
              (rand() - 0.5) * 0.05 * jitter,
            SUB_HEIGHT + row * CAB_SPACING_Y,
            (rand() - 0.5) * 0.06 * jitter,
          ],
          rotY: (rand() - 0.5) * 0.09 * jitter,
        });
      }
    }
    const subs = [-0.61, 0.61].map((x) => ({
      position: [
        x + (rand() - 0.5) * 0.03 * jitter,
        0,
        (rand() - 0.5) * 0.04 * jitter,
      ] as [number, number, number],
      rotY: (rand() - 0.5) * 0.06 * jitter,
    }));
    return { cabs, subs };
  }, [columns, rows, finish]);

  return (
    <group {...props}>
      {layout.subs.map((sub, i) => (
        <ScoopSub
          key={`sub-${i}`}
          finish={finish}
          tint={tint}
          position={sub.position}
          rotationY={sub.rotY}
        />
      ))}
      {layout.cabs.map((cab, i) => (
        <SpeakerCabinet
          key={`cab-${i}`}
          finish={finish}
          tint={tint}
          position={cab.position}
          rotation={[0, cab.rotY, 0]}
        />
      ))}
    </group>
  );
}
