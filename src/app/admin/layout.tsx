import type { Metadata } from "next";

/* Never prerender the admin: every page depends on the sign-in cookie. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Tommy B admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-br-space pb-[calc(4rem+env(safe-area-inset-bottom))] font-(family-name:--font-inter) text-br-platinum">
      {children}
    </div>
  );
}
