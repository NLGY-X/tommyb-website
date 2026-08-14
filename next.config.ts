import type { NextConfig } from "next";

/*
 * GitHub Pages serves a project repo from a subpath and cannot run the image
 * optimiser, so the static export needs both a basePath and unoptimized
 * images. Both are opt-in via env so local dev and a future Vercel/Node
 * deploy keep the optimiser and serve from root.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  ...(staticExport ? { output: "export" as const, basePath } : {}),
  images: {
    unoptimized: staticExport,
    /*
     * Next 16 only optimises qualities on this allowlist (default [75]), and
     * warns for anything else. 80 is the home hero, 85 the store hero — both
     * are large photographic headers that show banding lower down.
     */
    qualities: [75, 80, 85],
  },
};

export default nextConfig;
