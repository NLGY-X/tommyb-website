"use client";

/* Shared PBR finish presets for the 3D primitives library. */

import * as THREE from "three";

export type Finish = "grime" | "chrome";

export interface FinishPreset {
  color: string;
  metalness: number;
  roughness: number;
}

/* Main shell surfaces. */
export const FINISH_PRESETS: Record<Finish, FinishPreset> = {
  grime: { color: "#111111", metalness: 0.3, roughness: 0.85 },
  chrome: { color: "#aebfd2", metalness: 1, roughness: 0.12 },
};

/* Secondary trim and panel surfaces, slightly darker than the shell. */
export const TRIM_PRESETS: Record<Finish, FinishPreset> = {
  grime: { color: "#0c0c0c", metalness: 0.25, roughness: 0.9 },
  chrome: { color: "#8fa3b8", metalness: 0.9, roughness: 0.22 },
};

/* Near-black glossy vinyl. */
export const VINYL_PRESET: FinishPreset = {
  color: "#0b0b0b",
  metalness: 0.15,
  roughness: 0.32,
};

/* Mix a subtle tint into a base hex color. Deterministic, safe in render. */
export function tintHex(
  base: string,
  tint: string | undefined,
  amount: number,
): string {
  if (!tint) return base;
  const color = new THREE.Color(base).lerp(new THREE.Color(tint), amount);
  return "#" + color.getHexString();
}
