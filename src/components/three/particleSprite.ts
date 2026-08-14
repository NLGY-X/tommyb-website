"use client";

import * as THREE from "three";

/*
 * Soft round sprite for point particles, generated with pure math so renders
 * are deterministic. Without a map, points draw as hard squares.
 */
let cached: THREE.DataTexture | null = null;

export function getParticleSprite(): THREE.DataTexture {
  if (cached) return cached;
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5;
      const dy = (y + 0.5) / size - 0.5;
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2);
      const falloff = 1 - dist;
      const alpha = Math.round(255 * falloff * falloff);
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = alpha;
    }
  }
  cached = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  cached.magFilter = THREE.LinearFilter;
  cached.minFilter = THREE.LinearFilter;
  cached.needsUpdate = true;
  return cached;
}
