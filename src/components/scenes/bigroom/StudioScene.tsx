"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { seededRandom } from "@/components/shared/seededRandom";
import { Headphones, Turntable, VinylRecord } from "@/components/three";
import { getParticleSprite } from "@/components/three/particleSprite";

const GOLD = "#b08d57";
const BLUE = "#3d8bff";
const HALO_COUNT = 600;

/*
 * Cinematic product shot stage: a chrome turntable spinning a gold label
 * vinyl on a dark circular plinth, headphones at its side, a leaning record
 * behind, all doubled in a glossy black mirror floor under soft studio light.
 */

function StageSet({ reduced }: { reduced: boolean }) {
  return (
    <group>
      {/* circular stage plinth with a thin gold rim */}
      <mesh position={[0, 0.065, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 0.12, 48]} />
        <meshStandardMaterial color="#0a0e15" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.012, 8, 48]} />
        <meshStandardMaterial
          color="#1a1408"
          emissive={GOLD}
          emissiveIntensity={0.75}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* hero deck, angled 15 degrees toward camera */}
      <Turntable
        position={[0.15, 0.125, 0.05]}
        rotation={[0, -Math.PI / 12, 0]}
        finish="chrome"
        labelColor={GOLD}
        spinning={!reduced}
      />

      {/* headphones resting to the right of the deck */}
      <Headphones
        position={[1.0, 0.125, 0.5]}
        rotation={[0, -0.8, 0]}
        finish="chrome"
      />

      {/* leaning record on a small stand, behind left */}
      <group position={[-1.15, 0.125, -0.75]} rotation={[0, 0.45, 0]}>
        <mesh position={[0, 0.18, -0.16]} rotation={[-0.24, 0, 0]} castShadow>
          <boxGeometry args={[0.18, 0.34, 0.04]} />
          <meshStandardMaterial color="#10151d" metalness={0.7} roughness={0.3} />
        </mesh>
        <VinylRecord
          position={[0, 0.415, 0]}
          tilt={0.24}
          labelColor={GOLD}
          spinning={!reduced}
        />
      </group>
    </group>
  );
}

function StudioLights() {
  const keyTarget = useMemo(() => new THREE.Object3D(), []);
  const rimTarget = useMemo(() => new THREE.Object3D(), []);

  return (
    <group>
      <primitive object={keyTarget} position={[0, 0.3, 0]} />
      <primitive object={rimTarget} position={[0, 0.6, 0]} />
      {/* platinum white key, front left */}
      <spotLight
        position={[-2.6, 3.8, 2.8]}
        color="#f5f7fa"
        intensity={110}
        angle={0.55}
        penumbra={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        target={keyTarget}
      />
      {/* blue rim, back right: no shadow, the key light already casts one */}
      <spotLight
        position={[2.8, 3.2, -2.6]}
        color={BLUE}
        intensity={80}
        angle={0.6}
        penumbra={0.8}
        target={rimTarget}
      />
    </group>
  );
}

function Halo({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rand = seededRandom(4211);
    const arr = new Float32Array(HALO_COUNT * 3);
    for (let i = 0; i < HALO_COUNT; i++) {
      const angle = (i / HALO_COUNT) * Math.PI * 2;
      const radius = 3.1 + rand() * 1.4;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = 0.5 + rand() * 1.4;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (reduced || !points.current) return;
    points.current.rotation.y += Math.min(delta, 0.05) * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={BLUE}
        map={getParticleSprite()}
        size={0.07}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function CameraRig({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    const { camera, clock, pointer } = state;
    if (!reduced) {
      const t = clock.elapsedTime;
      const targetX = Math.sin(t * 0.08) * 0.6 + pointer.x * 0.3;
      const targetY = 1.1 + Math.sin(t * 0.05) * 0.1;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
    }
    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

export default function StudioScene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.1, 4.4], fov: 40 }}
      dpr={[1, 1.75]}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#050810"]} />
      <fog attach="fog" args={["#050810", 10, 26]} />

      {/* glossy black mirror floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[200, 60]}
          resolution={768}
          mixBlur={1}
          mixStrength={60}
          roughness={0.25}
          color="#06090f"
          metalness={0.6}
        />
      </mesh>

      <StageSet reduced={reduced} />
      <StudioLights />
      <Halo reduced={reduced} />
      <CameraRig reduced={reduced} />

      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={2.2}
          position={[0, 4, -4]}
          scale={[10, 2, 1]}
          color="#f5f7fa"
        />
        <Lightformer
          intensity={1.6}
          position={[-5, 0, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 2, 1]}
          color={BLUE}
        />
        <Lightformer
          intensity={1.1}
          position={[5, -1, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[8, 1.4, 1]}
          color={GOLD}
        />
        <Lightformer
          intensity={0.8}
          position={[0, -4, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
          color="#8fa3b8"
        />
      </Environment>

      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.3} mipmapBlur />
        <Vignette darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
