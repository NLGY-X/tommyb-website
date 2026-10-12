import type { MetadataRoute } from "next";

/* For anyone who saves the public site to their home screen. /admin has its own. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tommy B",
    short_name: "Tommy B",
    description: "Tommy B, hard trance DJ and producer from Oxford.",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#070708",
    theme_color: "#070708",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
