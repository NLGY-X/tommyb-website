import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  images: {
    /* Only Tommy's uploads go through the optimiser; the hero is pre-sized. */
    localPatterns: [{ pathname: "/uploads/**", search: "" }],
  },
  experimental: {
    /*
     * Server actions cap request bodies at 1MB by default. Posters are
     * shrunk in the browser before upload, but press photos and a rider PDF
     * can be several MB, and the browser resize is skipped if it fails.
     */
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;
