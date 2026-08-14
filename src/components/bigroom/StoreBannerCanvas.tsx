"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { ProductShowcase } from "@/components/three";
import { useReducedMotion } from "@/components/shared/useReducedMotion";

function TurningShowcase({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    state.camera.lookAt(0, 0.42, 0);
    if (reduced || !group.current) {
      return;
    }
    group.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.22) * 0.35;
  });

  return (
    <group ref={group}>
      <ProductShowcase theme="bigroom" reduced={reduced} />
    </group>
  );
}

export default function StoreBannerCanvas() {
  const reduced = useReducedMotion();

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.2, 3.4], fov: 38 }}
      dpr={[1, 1.75]}
      frameloop={reduced ? "demand" : "always"}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#050810"]} />
      <fog attach="fog" args={["#050810", 6, 16]} />
      <ambientLight intensity={0.35} />
      <spotLight
        position={[2.4, 4, 3]}
        angle={0.5}
        penumbra={0.8}
        intensity={90}
        color="#f5f7fa"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, -2]} intensity={30} color="#3d8bff" />
      <pointLight position={[3, 1.4, -2.4]} intensity={18} color="#b08d57" />
      <TurningShowcase reduced={reduced} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial color="#06090f" metalness={0.6} roughness={0.35} />
      </mesh>
    </Canvas>
  );
}
