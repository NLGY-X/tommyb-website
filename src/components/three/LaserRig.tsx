"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

export interface LaserRigProps {
  color: string;
  count?: number;
  speed?: number;
  reduced?: boolean;
}

/*
 * A small housing from which a fan of thin additive beams points downward.
 * The whole fan sweeps on z and the spread breathes. Rotate the group to aim.
 * When reduced, the fan holds its initial static pose.
 */
export function LaserRig({
  color,
  count = 5,
  speed = 1,
  reduced = false,
  ...props
}: LaserRigProps & ThreeElements["group"]) {
  const fan = useRef<THREE.Group>(null);
  const beams = useRef<(THREE.Group | null)[]>([]);

  const baseAngles = useMemo(
    () => Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * 0.16),
    [count],
  );

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    if (fan.current) fan.current.rotation.z = Math.sin(t * speed) * 0.5;
    const breathe = 1 + 0.3 * Math.sin(t * speed * 0.63 + 1.7);
    for (let i = 0; i < baseAngles.length; i++) {
      const beam = beams.current[i];
      if (beam) beam.rotation.z = baseAngles[i] * breathe;
    }
  });

  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[0.34, 0.16, 0.22]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.06, 0.09]}>
        <boxGeometry args={[0.26, 0.03, 0.05]} />
        <meshStandardMaterial
          color="#050505"
          emissive={color}
          emissiveIntensity={1.8}
        />
      </mesh>
      <group ref={fan} position={[0, -0.08, 0]}>
        {baseAngles.map((angle, i) => (
          <group
            key={`beam-${i}`}
            rotation={[0, 0, angle]}
            ref={(el) => {
              beams.current[i] = el;
            }}
          >
            <mesh position={[0, -10, 0]}>
              <cylinderGeometry args={[0.015, 0.12, 20, 12, 1, true]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
