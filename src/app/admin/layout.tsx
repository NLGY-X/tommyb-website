import type { Metadata, Viewport } from "next";

/* Never prerender the admin: every page depends on the sign-in cookie. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Tommy B admin" },
  robots: { index: false, follow: false },
  /* Added to the home screen, the admin opens full screen as "TB admin". */
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "TB admin", statusBarStyle: "black-translucent" },
};

/* Lets the dark header run under the status bar; AdminTop pads by the safe-area inset. */
export const viewport: Viewport = {
  themeColor: "#070708",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-br-space pb-[calc(4rem+env(safe-area-inset-bottom))] font-(family-name:--font-inter) text-br-platinum">
      {children}
    </div>
  );
}
