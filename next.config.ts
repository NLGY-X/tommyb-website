import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  images: {
    /*
     * Next 16 only optimises qualities on this allowlist (default [75]).
     * 80 is the home hero, a large photographic header that bands lower down.
     */
    qualities: [75, 80],
    /* Site artwork in public/ plus Tommy's uploads, served by app/uploads. */
    localPatterns: [
      { pathname: "/*.png", search: "" },
      { pathname: "/*.jpg", search: "" },
      { pathname: "/uploads/**", search: "" },
    ],
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
