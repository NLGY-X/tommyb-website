"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/components/shared/seededRandom";
import { getParticleSprite } from "./particleSprite";

export interface HazeParticlesProps {
  count?: number;
  color?: string;
  area?: [number, number, number];
  reduced?: boolean;
}

/*
 * A box shaped field of additive haze points drifting slowly upward and
 * looping. Positions and speeds are seeded so renders are stable.
 */
export function HazeParticles({
  count = 900,
  color = "#ffffff",
  area = [14, 6, 10],
  reduced = false,
  ...props
}: HazeParticlesProps & ThreeElements["group"]) {
  const points = useRef<THREE.Points>(null);
  const [width, height, depth] = area;

  const { positions, speeds } = useMemo(() => {
    const rand = seededRandom(7919 + count * 13);
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * width;
      pos[i * 3 + 1] = rand() * height;
      pos[i * 3 + 2] = (rand() - 0.5) * depth;
      spd[i] = 0.05 + rand() * 0.12;
    }
    return { positions: pos, speeds: spd };
  }, [count, width, height, depth]);

  useFrame((_, delta) => {
    if (reduced || !points.current) return;
    const step = Math.min(delta, 0.05);
    const attr = points.current.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * step;
      if (arr[i * 3 + 1] > height) arr[i * 3 + 1] -= height;
    }
    attr.needsUpdate = true;
    points.current.rotation.y += step * 0.012;
  });

  return (
    <group {...props}>
      <points ref={points}>
        <bufferGeometry key={`${count}-${width}-${height}-${depth}`}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          map={getParticleSprite()}
          size={0.14}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
