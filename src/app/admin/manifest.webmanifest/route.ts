/*
 * Saving /admin to the home screen opens it as its own app, full screen with
 * no browser bars, straight into the admin. The public site has its own
 * manifest (src/app/manifest.ts) that opens the home page.
 */
export function GET() {
  const manifest = {
    id: "/admin",
    name: "Tommy B admin",
    short_name: "TB admin",
    description: "Add gigs and update the Tommy B site.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070708",
    theme_color: "#070708",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
